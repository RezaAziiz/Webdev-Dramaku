const pool = require('../config/db');

exports.checkWatchlist = async (username, movieId) => {
  const result = await pool.query(
    'SELECT * FROM user_watchlist WHERE username = $1 AND movie_id = $2',
    [username, movieId]
  );
  return result.rows.length > 0;
};

exports.addWatchlist = async (username, movieId) => {
  await pool.query(
    'INSERT INTO user_watchlist (username, movie_id) VALUES ($1, $2)',
    [username, movieId]
  );
  return true;
};

exports.getWatchlist = async (username) => {
  const result = await pool.query(
    `SELECT m.id, m.title, m.year, m.images, 
            COALESCE(AVG(c.rate), 0) AS rating,
            MAX(uw.added_at) AS added_at 
     FROM movies m
     JOIN user_watchlist uw ON m.id = uw.movie_id
     LEFT JOIN comments c ON m.id = c.movie_id
     WHERE uw.username = $1
     GROUP BY m.id
     ORDER BY added_at DESC`,
    [username]
  );
  return result.rows;
};

exports.removeWatchlist = async (username, movieId) => {
  const result = await pool.query(
    'DELETE FROM user_watchlist WHERE username = $1 AND movie_id = $2',
    [username, movieId]
  );
  return result.rowCount > 0;
};
