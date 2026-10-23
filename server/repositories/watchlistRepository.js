const pool = require('../config/db');

exports.checkWatchlist = async (userId, tmdbId, mediaType) => {
  const result = await pool.query(
    'SELECT 1 FROM user_watchlist WHERE user_id = $1 AND tmdb_id = $2 AND media_type = $3',
    [userId, tmdbId, mediaType]
  );
  return result.rows.length > 0;
};

exports.addWatchlist = async (userId, tmdbId, mediaType) => {
  const result = await pool.query(
    `INSERT INTO user_watchlist (user_id, tmdb_id, media_type)
     VALUES ($1, $2, $3) RETURNING *`,
    [userId, tmdbId, mediaType]
  );
  return result.rows[0];
};

// Note: titles/posters/ratings are no longer stored locally. This only
// returns the identifiers; the caller is expected to hydrate them via the
// TMDB proxy endpoints using tmdb_id + media_type.
exports.getWatchlist = async (userId) => {
  const result = await pool.query(
    `SELECT tmdb_id, media_type, added_at
     FROM user_watchlist
     WHERE user_id = $1
     ORDER BY added_at DESC`,
    [userId]
  );
  return result.rows;
};

exports.removeWatchlist = async (userId, tmdbId, mediaType) => {
  const result = await pool.query(
    'DELETE FROM user_watchlist WHERE user_id = $1 AND tmdb_id = $2 AND media_type = $3',
    [userId, tmdbId, mediaType]
  );
  return result.rowCount > 0;
};
