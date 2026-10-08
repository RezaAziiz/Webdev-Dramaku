const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Config imports
const pool = require('./config/db');
const cloudinary = require('./config/cloudinary');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// Middleware imports
const errorMiddleware = require('./middlewares/errorMiddleware');
const { authenticateToken } = require('./middlewares/authMiddleware');

const app = express();
const port = 3005;

// Setup CORS to allow frontend access
app.use(cors());
app.use(express.json());


const upload = multer({ storage: multer.memoryStorage() }); // Using memory storage for direct upload to Cloudinary

// Auth Routes
app.use('/', authRoutes);

app.get('/movies', async (req, res) => {
  try {
    const query = `
      SELECT m.id, m.title, m.year, m.images, m.synopsis, m.availability, m.country_id,
            (SELECT string_agg(g.name, ', ') FROM movie_genre mg 
              JOIN genres g ON g.id = mg.genre_id WHERE mg.movie_id = m.id) as genre,
            (SELECT avg(c.rate) FROM comments c WHERE c.movie_id = m.id AND c.status = '1') as rating,
            0 as views,
            (SELECT string_agg(w.name || ' (' || w.year || ')', ', ') 
            FROM movie_award md 
            JOIN awards w ON w.id = md.award_id 
            WHERE md.movie_id = m.id AND w.year IS NOT NULL) as award
      FROM movies m
      ORDER BY m.id ASC;
    `;
    const movies = await pool.query(query);

    // Log data to check for duplicates
    console.log(movies.rows);

    res.json(movies.rows); // Send all movies at once
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching movies' });
  }
});


app.get('/movies/:id', async (req, res) => {
  const movieId = parseInt(req.params.id);

  try {
    const query = `
      SELECT m.id, m.title, m.year, m.images, m.synopsis, m.trailer, m.alt_title, m.availability, m.country_id,
             countries.name AS country_name, -- Added country name from countries table
          (SELECT string_agg(g.name, ', ') 
            FROM movie_genre mg 
            JOIN genres g ON g.id = mg.genre_id 
            WHERE mg.movie_id = m.id) as genres,
          (SELECT avg(c.rate) 
            FROM comments c 
            WHERE c.movie_id = m.id AND c.status = '1') as rating,
          (SELECT json_agg(json_build_object('user', c.username, 'text', c.comment, 'rating', c.rate, 'date', c.created_at)) 
            FROM comments c 
            WHERE c.movie_id = m.id AND c.status = 'true') as comments,
            (SELECT json_agg(json_build_object('name', a.name, 'url_photos', a.url_photos)) 
             FROM movie_actor ma
             JOIN actors a ON a.id = ma.actor_id 
             WHERE ma.movie_id = m.id) AS actors,
          (SELECT string_agg(w.name || ' (' || w.year || ')', ', ') 
            FROM movie_award md 
            JOIN awards w ON w.id = md.award_id 
            WHERE md.movie_id = m.id AND w.year IS NOT NULL) as awards
      FROM movies m
      LEFT JOIN countries ON m.country_id = countries.id -- Join with countries table
      WHERE m.id = $1;
    `;

    const result = await pool.query(query, [movieId]);

    console.log('Result:', result.rows); // Debugging output

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.json(result.rows[0]); // Return the movie details as a JSON response
  } catch (error) {
    console.error('Error fetching movie details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



app.get('/api/search', async (req, res) => {
  const searchTerm = req.query.term || ''; // Get the 'term' parameter from the query
  // Define a list of stop words to ignore in the search
  const stopWords = [
    'the', 'of', 'a', 'an', 'in', 'and', 'to', 'for', 'is',
    'at', 'by', 'on', 'with', 'b', 'c', 'd', 'e', 'f', 'g',
    'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
    's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'th', 'wi'
  ];
  // Filter out stop words from the search term
  const filteredTerm = searchTerm
    .toLowerCase()
    .split(' ')
    .filter(word => !stopWords.includes(word) && word.trim() !== '')
    .join(' ');
  // Check if the filtered term is empty
  if (!filteredTerm) {
    return res.json([]); // Return an empty array if no valid search term remains
  }
  const formattedSearchTermWithWordBoundary = `\\m${filteredTerm}`; // Match the beginning of a word
  const formattedSearchTermWithoutLeadingWildcard = `${filteredTerm}%`; // Format for SQL LIKE with trailing wildcard only

  try {
    // Query untuk mencari berdasarkan judul dan aktor
    // SQL query to search based on title and actor's name using regex for precise title matching
    const query = `
      SELECT DISTINCT m.id, m.title, m.year, m.images, m.synopsis, m.country_id,
        (SELECT string_agg(g.name, ', ') 
         FROM movie_genre mg
         JOIN genres g ON g.id = mg.genre_id
        //  WHERE mg.movie_id = m.id) AS genre,
        (SELECT AVG(c.rate)
         FROM comments c 
         WHERE c.movie_id = m.id AND c.status = '1') AS rating,
        (SELECT string_agg(a.name, ', ')
         FROM movie_actor ma
         JOIN actors a ON a.id = ma.actor_id 
         WHERE ma.movie_id = m.id) AS actors
         FROM movies m
      LEFT JOIN movie_actor ma ON ma.movie_id = m.id
      LEFT JOIN actors a ON a.id = ma.actor_id WHERE LOWER(m.title) ~* $1  -- Using PostgreSQL regex matching for precise title search
        OR LOWER(REGEXP_REPLACE(a.name, '[ -]', '', 'g')) LIKE $2
      GROUP BY m.id
      ORDER BY m.id ASC;
    `;

    const movies = await pool.query(query, [formattedSearchTermWithWordBoundary, formattedSearchTermWithoutLeadingWildcard]);

    res.json(movies.rows);
  } catch (error) {
    console.error('Error fetching search results:', error);
    res.status(500).json({ message: 'Error fetching search results' });
  }
});

app.get('/suggestions', async (req, res) => {
  const searchTerm = req.query.term || '';
  const formattedSearchTerm = `${searchTerm.toLowerCase()}%`; // For SQL LIKE

  console.log('Formatted Search Term:', formattedSearchTerm); // Log the search term

  try {
    const query = `
      SELECT title FROM movies
      WHERE LOWER(title) LIKE $1
      ORDER BY title ASC
      LIMIT 10; 
    `;

    const result = await pool.query(query, [formattedSearchTerm]);
    const titles = result.rows.map(row => row.title);
    res.json(titles); // Return the array of titles
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ message: 'Error fetching suggestions', error: error.message }); // Include error details
  }
});


app.get('/api/genres', async (req, res) => {
  try {
    const query = 'SELECT id, name FROM genres ORDER BY name ASC;';
    const result = await pool.query(query);
    const genres = result.rows; // Ambil semua genre dari query

    res.json(genres); // Mengembalikan array genre
  } catch (error) {
    console.error('Error fetching genres:', error);
    res.status(500).json({ message: 'Error fetching genres', error: error.message }); // Detail error
  }
});


// app.get('/api/awards', async (req, res) => {
//   try {
//     const query = 'SELECT id, name, year FROM awards WHERE year IS NOT NULL ORDER BY name ASC;';
//     const result = await pool.query(query);
//     const awards = result.rows;

//     res.json(awards);
//   } catch (error) {
//     console.error('Error fetching awards:', error);
//     res.status(500).json({ message: 'Error fetching awards', error: error.message });
//   }
// });

app.post('/movies/:id/comments', authenticateToken, async (req, res) => {
  const movieId = parseInt(req.params.id);
  const { commentText, rating, status } = req.body; // Ambil status dari request body
  const userName = req.user.username; // Ambil username dari token yang terautentikasi

  if (!commentText || !rating) {
    return res.status(400).json({ message: "Comment text and rating are required." });
  }

  try {
    // Insert komentar ke database
    await pool.query(
      "INSERT INTO comments (movie_id, username, comment, rate, status) VALUES ($1, $2, $3, $4, $5)", // Ubah query untuk menggunakan $5 untuk status
      [movieId, userName, commentText, rating, status] // Tambahkan status di akhir array
    );

    res.status(201).json({ message: "Comment added successfully." });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Server error while adding comment." });
  }
});



// Route to get all countries in descending order by id
app.get('/api/countries', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM countries ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
});

// Route to add a new country
app.post('/api/countries', async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query('INSERT INTO countries (name) VALUES ($1) RETURNING *', [name]);
    res.status(201).json(result.rows[0]); // Return the newly created country
  } catch (error) {
    console.error('Error adding country:', error);
    res.status(500).json({ error: 'Failed to add country' });
  }
});

app.delete('/api/countries/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('UPDATE actors SET country_id = NULL WHERE country_id = $1', [id]);
    await pool.query('UPDATE movies SET country_id = NULL WHERE country_id = $1', [id]);
    await pool.query('UPDATE awards SET country_id = NULL WHERE country_id = $1', [id]);

    const result = await pool.query('DELETE FROM countries WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount > 0) {
      res.status(200).json({ message: 'Country deleted successfully' });
    } else {
      res.status(404).json({ message: 'Country not found' });
    }
  } catch (error) {
    console.error('Error deleting country:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Assuming you have already set up express and the PostgreSQL pool
app.put('/api/countries/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body; // New country name

  try {
    const result = await pool.query('UPDATE countries SET name = $1 WHERE id = $2 RETURNING *', [name, id]);

    if (result.rowCount > 0) {
      res.status(200).json(result.rows[0]); // Return the updated country
    } else {
      res.status(404).json({ message: 'Country not found' });
    }
  } catch (error) {
    console.error('Error updating country:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST new genre
app.post('/api/genres', async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query('INSERT INTO genres (name) VALUES ($1) RETURNING *', [name]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding genre:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT to update genre
app.put('/api/genres/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const result = await pool.query('UPDATE genres SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
    if (result.rowCount > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Genre not found' });
    }
  } catch (error) {
    console.error('Error updating genre:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.delete('/api/genres/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM movie_genre WHERE genre_id = $1', [id]);

    const result = await pool.query('DELETE FROM genres WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount > 0) {
      res.status(200).json({ message: 'Genre and related movie associations deleted successfully' });
    } else {
      res.status(404).json({ message: 'Genre not found' });
    }
  } catch (error) {
    console.error('Error deleting Genre:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// User Routes
app.use('/api/users', userRoutes);


// Endpoint untuk mendapatkan semua awards
app.get('/api/awards', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        awards.id, 
        awards.name, 
        awards.year, 
        countries.name AS country_name
      FROM 
        awards
      LEFT JOIN 
        countries ON awards.country_id = countries.id
        ORDER BY id DESC
    `);
    // Send the response with the awards data
    res.json(result.rows);
  } catch (error) {
    console.error("Error retrieving awards:", error); // Log the error for debugging
    res.status(500).json({ message: "Server error", error: error.message }); // Send a more informative error response
  }
});


app.post('/awards', async (req, res) => {
  const { name, year, country_id } = req.body;

  try {
    // Validate `country_id`
    console.log("Received data:", req.body);
    const countryExists = await pool.query("SELECT 1 FROM countries WHERE id = $1", [country_id]);

    if (countryExists.rowCount === 0) {
      return res.status(400).send("Invalid country_id. Please select a valid country.");
    }

    // Check if awards value is present
    if (!name) {
      return res.status(400).send("Award name cannot be null or empty.");
    }

    // Insert the award and log result
    const result = await pool.query(
      "INSERT INTO awards (name, year, country_id) VALUES ($1, $2, $3) RETURNING *",
      [name, year, country_id] // Ensure "awards" is correctly passed
    );

    console.log("Insert result:", result.rows[0]); // Log the inserted row
    res.send("Award created successfully");
  } catch (error) {
    if (error.code === '23503') {
      res.status(400).send("Foreign key constraint error: Invalid country_id.");
    } else {
      console.error("Error creating award:", error);
      res.status(500).send("Server error");
    }
  }
});



app.put('/awards/:id', async (req, res) => {
  const { id } = req.params;
  const { country_id, name, year } = req.body;

  try {
    await pool.query(
      "UPDATE awards SET country_id = $1, name = $2, year = $3 WHERE id = $4",
      [country_id, name, year, id]
    );
    res.send("Award updated successfully");
  } catch (error) {
    console.error("Error updating award:", error);
    res.status(500).send("Server error");
  }
});


app.delete('/awards/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Hapus data terkait dari tabel movie_award terlebih dahulu
    await pool.query("DELETE FROM movie_award WHERE award_id = $1", [id]);
    // Lalu hapus dari tabel awards
    await pool.query("DELETE FROM awards WHERE id = $1", [id]);
    res.send("Award deleted successfully");
  } catch (error) {
    console.error("Error deleting award:", error);
    res.status(500).send("Server error");
  }
});

// Endpoint to get all actors with country names
app.get('/actors', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.id, a.name, a.birthdate, a.url_photos, c.name AS country_name
      FROM actors a
      JOIN countries c ON a.country_id = c.id
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching actors:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});


// Endpoint to add a new actor
app.post('/actors', upload.single('photo'), async (req, res) => {
  const { country_id, name, birth_date } = req.body;

  try {
    // Check if file is provided
    if (!req.file) {
      return res.status(400).json({ error: 'Photo is required' });
    }

    // Upload the image to Cloudinary and get the URL
    const url_photos = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result.secure_url); // Capture the secure URL from the result
      });
      uploadStream.end(req.file.buffer); // Pass the file buffer to Cloudinary
    });

    // Insert the actor into the database
    const result = await pool.query(
      'INSERT INTO actors (country_id, name, birthdate, url_photos) VALUES ($1, $2, $3, $4) RETURNING *',
      [country_id, name, birth_date, url_photos]
    );

    return res.status(201).json({ success: true, actor: result.rows[0] });
  } catch (error) {
    console.error('Error inserting actor:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});


// Endpoint untuk update actor dengan dukungan foto
app.put('/actors/:id', upload.single('photo'), async (req, res) => {
  const { id } = req.params;
  const { country_id, name, birth_date } = req.body;
  let url_photos = null;

  console.log('Updating actor with ID:', id);
  console.log('Updated actor data:', { country_id, name, birth_date, url_photos });

  try {
    // Jika ada file foto baru, upload ke Cloudinary
    if (req.file) {
      const cloudinaryResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream((error, result) => {
          if (error) {
            return reject(new Error('Cloudinary upload error'));
          }
          resolve(result.secure_url); // Mendapatkan URL foto yang diunggah
        }).end(req.file.buffer); // Menggunakan buffer file dari multer
      });
      url_photos = cloudinaryResult; // Menyimpan URL foto
    }

    // Update actor di database
    const result = await pool.query(
      'UPDATE actors SET country_id = $1, name = $2, birthdate = $3, url_photos = COALESCE($4, url_photos) WHERE id = $5 RETURNING *',
      [country_id, name, birth_date, url_photos, id]
    );

    // Jika actor tidak ditemukan
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Actor not found' });
    }

    // Mengembalikan data actor yang telah diperbarui
    res.json({ success: true, message: 'Actor updated', actor: result.rows[0] });
  } catch (error) {
    console.error('Error updating actor:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// / Endpoint to delete an actor
app.delete('/actors/:id', async (req, res) => {
  const { id } = req.params;

  try {

    await pool.query("DELETE FROM movie_actor WHERE actor_id = $1", [id]);
    await pool.query('DELETE FROM actors WHERE id = $1', [id]);
    res.json({ success: true, message: 'Actor deleted' });
  } catch (error) {
    console.error('Error deleting actor:', error);
  }
});

// Updated GET endpoint to fetch comments with movie titles
app.get("/comments", async (req, res) => {
  try {
    const { searchTerm = "", shows = 10 } = req.query;
    const result = await pool.query(
      `SELECT comments.id, comments.comment, comments.status, comments.rate, 
              comments.username, comments.created_at, movies.title AS drama 
       FROM comments 
       JOIN movies ON comments.movie_id = movies.id 
       WHERE comments.username ILIKE $1 
       LIMIT $2`,
      [`%${searchTerm}%`, shows]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).send("Server error");
  }
});


// Add a new comment
app.post("/comments", async (req, res) => {
  const { username, rate, drama, comments, status } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO comments (username, rate, drama, comments, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [username, rate, drama, comments, status]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).send("Server error");
  }
});

app.put("/comments/:id", async (req, res) => {
  const { id } = req.params; // This should be a string
  const { status } = req.body; // Make sure to only take status
  try {
    const result = await pool.query(
      "UPDATE comments SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating comment:", error.message); // Log detailed error
    res.status(500).send("Server error");
  }
});


// Delete comments
app.delete("/comments", async (req, res) => {
  const { ids } = req.body; // Expecting an array of IDs
  try {
    await pool.query("DELETE FROM comments WHERE id = ANY($1)", [ids]);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error deleting comments:", error);
    res.status(500).send("Server error");
  }
});

// Add a new movie
app.post('/api/movies', upload.single('photo'), async (req, res) => {
  const { title, alt_title, year, availability, synopsis, trailer, country_id, genres, awards, actors } = req.body;

  try {
    let images = null;

    if (req.file) {
      images = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result.secure_url);
        });
        uploadStream.end(req.file.buffer);
      });
    } else {
      console.log("No file uploaded");
    }

    // Print movie data
    console.log("Received data:", req.body);

    const query = `
    INSERT INTO movies (title, alt_title, availability, synopsis, trailer, year, images, status, country_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
  `;
    const values = [title, alt_title, availability, synopsis, trailer, year, images, 'Unapproved', country_id];

    // Execute the query
    const result = await pool.query(query, values);

    const movieId = result.rows[0].id;

    if (genres && genres.length > 0) {
      const genreQueries = genres.map((genreId) => {
        return pool.query(
          'INSERT INTO movie_genre (movie_id, genre_id) VALUES ($1, $2)',
          [movieId, genreId]
        );
      });
      await Promise.all(genreQueries);
    }

    if (awards && awards.length > 0) {
      const awardQueries = awards.map((awardId) => {
        return pool.query(
          'INSERT INTO movie_award (movie_id, award_id) VALUES ($1, $2)',
          [movieId, awardId]
        );
      });
      await Promise.all(awardQueries);
    }

    if (actors && actors.length > 0) {
      const actorQueries = actors.map((actorId) => {
        return pool.query(
          'INSERT INTO movie_actor (movie_id, actor_id) VALUES ($1, $2)',
          [movieId, actorId]
        );
      });
      await Promise.all(actorQueries);
    }

    // Return the inserted movie
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error adding movie:", error);
    res.status(500).send("Server error");
  }
});

app.post('/api/watchlist', async (req, res) => {
  const { username, movieId } = req.body;  // Ambil `username` sesuai data yang dikirimkan dari frontend

  try {
    // Cek apakah movie sudah ada di watchlist user berdasarkan `username`
    const existingEntry = await pool.query(
      'SELECT * FROM user_watchlist WHERE username = $1 AND movie_id = $2',
      [username, movieId]
    );

    if (existingEntry.rows.length > 0) {
      return res.status(400).json({ message: 'Movie already in watchlist' });
    }

    // Insert movie ke watchlist user
    await pool.query(
      'INSERT INTO user_watchlist (username, movie_id) VALUES ($1, $2)',
      [username, movieId]
    );

    res.status(201).json({ message: 'Movie added to watchlist' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/watchlist/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const result = await pool.query(
      `SELECT m.id, m.title, m.year, m.images, 
              COALESCE(AVG(c.rate), 0) AS rating,
              MAX(uw.added_at) AS added_at 
       FROM movies m
       JOIN user_watchlist uw ON m.id = uw.movie_id
       LEFT JOIN comments c ON m.id = c.movie_id
       WHERE uw.username = $1
       GROUP BY m.id
       ORDER BY added_at DESC`, // Ensure ordering by the watchlist added_at column
      [username]
    );

    if (result.rows.length > 0) {
      res.status(200).json(result.rows);
    } else {
      res.status(404).json({ message: 'No movies in watchlist' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.delete('/api/watchlist/:username/:movieId', async (req, res) => {
  const { username, movieId } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM user_watchlist WHERE username = $1 AND movie_id = $2',
      [username, movieId]
    );

    if (result.rowCount > 0) {
      res.status(200).json({ message: 'Movie removed from watchlist' });
    } else {
      res.status(404).json({ message: 'Movie not found in watchlist' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

module.exports = {app};
