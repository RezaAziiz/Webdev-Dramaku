const pool = require('../config/db');

exports.addComment = async (userId, tmdbId, mediaType, commentText, rate) => {
  const result = await pool.query(
    `INSERT INTO comments (user_id, tmdb_id, media_type, comment, rate)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [userId, tmdbId, mediaType, commentText, rate]
  );
  return result.rows[0];
};

exports.getCommentsForTitle = async (tmdbId, mediaType) => {
  const result = await pool.query(
    `SELECT c.id, c.comment, c.rate, c.created_at, u.username, u.avatar_url
     FROM comments c
     JOIN users u ON u.id = c.user_id
     WHERE c.tmdb_id = $1 AND c.media_type = $2
     ORDER BY c.created_at DESC`,
    [tmdbId, mediaType]
  );
  return result.rows;
};

exports.deleteComments = async (ids) => {
  const result = await pool.query("DELETE FROM comments WHERE id = ANY($1)", [ids]);
  return result;
};
