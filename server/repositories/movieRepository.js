const pool = require('../config/db');

exports.getAllMovies = async () => {
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
  const result = await pool.query(query);
  return result.rows;
};

exports.getMovieById = async (movieId) => {
  const query = `
    SELECT m.id, m.title, m.year, m.images, m.synopsis, m.trailer, m.alt_title, m.availability, m.country_id,
           countries.name AS country_name,
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
    LEFT JOIN countries ON m.country_id = countries.id
    WHERE m.id = $1;
  `;
  const result = await pool.query(query, [movieId]);
  return result.rows[0];
};

exports.searchMovies = async (searchTerm) => {
  const query = `
    SELECT DISTINCT m.id, m.title, m.year, m.images, m.synopsis, m.country_id,
      (SELECT string_agg(g.name, ', ') 
       FROM movie_genre mg
       JOIN genres g ON g.id = mg.genre_id
       WHERE mg.movie_id = m.id) AS genre,
      (SELECT AVG(c.rate)
       FROM comments c 
       WHERE c.movie_id = m.id AND c.status = '1') AS rating,
      (SELECT string_agg(a.name, ', ')
       FROM movie_actor ma
       JOIN actors a ON a.id = ma.actor_id 
       WHERE ma.movie_id = m.id) AS actors
    FROM movies m
    LEFT JOIN movie_actor ma ON ma.movie_id = m.id
    LEFT JOIN actors a ON a.id = ma.actor_id 
    WHERE m.title ILIKE $1 OR a.name ILIKE $1
    GROUP BY m.id
    ORDER BY m.id ASC;
  `;
  const searchPattern = `%${searchTerm}%`;
  const result = await pool.query(query, [searchPattern]);
  return result.rows;
};

exports.getSuggestions = async (formattedSearchTerm) => {
  const query = `
    SELECT title FROM movies
    WHERE LOWER(title) LIKE $1
    ORDER BY title ASC
    LIMIT 10; 
  `;
  const result = await pool.query(query, [formattedSearchTerm]);
  return result.rows.map(row => row.title);
};

exports.createMovie = async (title, alt_title, availability, synopsis, trailer, year, images, country_id, genres, awards, actors) => {
  const query = `INSERT INTO movies (title, alt_title, availability, synopsis, trailer, year, images, status, country_id) VALUES ($1, $2, $3, $4, $5, $6, $7, 'Unapproved', $8) RETURNING *`;
  const values = [title, alt_title, availability, synopsis, trailer, year, images, country_id];
  const result = await pool.query(query, values);
  const movieId = result.rows[0].id;
  if (genres && genres.length > 0) {
    await Promise.all(genres.map(genreId => pool.query('INSERT INTO movie_genre (movie_id, genre_id) VALUES ($1, $2)', [movieId, genreId])));
  }
  if (awards && awards.length > 0) {
    await Promise.all(awards.map(awardId => pool.query('INSERT INTO movie_award (movie_id, award_id) VALUES ($1, $2)', [movieId, awardId])));
  }
  if (actors && actors.length > 0) {
    await Promise.all(actors.map(actorId => pool.query('INSERT INTO movie_actor (movie_id, actor_id) VALUES ($1, $2)', [movieId, actorId])));
  }
  return result.rows[0];
};