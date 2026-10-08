const pool = require('../config/db');

exports.addCommentToMovie = async (movieId, username, commentText, rating, status) => {
  const result = await pool.query(
    "INSERT INTO comments (movie_id, username, comment, rate, status) VALUES ($1, $2, $3, $4, $5)",
    [movieId, username, commentText, rating, status]
  );
  return result;
};

exports.getComments = async (searchTerm, shows) => {
  const result = await pool.query(
    `SELECT comments.id, comments.comment, comments.status, comments.rate, 
            comments.username, comments.created_at, movies.title AS drama 
     FROM comments 
     JOIN movies ON comments.movie_id = movies.id 
     WHERE comments.username ILIKE $1 
     LIMIT $2`,
    [`%${searchTerm}%`, shows]
  );
  return result.rows;
};

exports.addGeneralComment = async (username, rate, drama, comments, status) => {
  const result = await pool.query(
    "INSERT INTO comments (username, rate, drama, comments, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [username, rate, drama, comments, status]
  );
  return result.rows[0];
};

exports.updateCommentStatus = async (id, status) => {
  const result = await pool.query(
    "UPDATE comments SET status = $1 WHERE id = $2 RETURNING *",
    [status, id]
  );
  return result.rows[0];
};

exports.deleteComments = async (ids) => {
  const result = await pool.query("DELETE FROM comments WHERE id = ANY($1)", [ids]);
  return result;
};