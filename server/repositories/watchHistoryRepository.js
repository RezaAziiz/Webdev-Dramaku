const pool = require('../config/db');

exports.upsertProgress = async ({ userId, tmdbId, mediaType, season, episode, watchedSeconds, durationSeconds }) => {
  const result = await pool.query(
    `INSERT INTO watch_history (user_id, tmdb_id, media_type, season, episode, watched_seconds, duration_seconds, watched_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, now())
     ON CONFLICT (user_id, tmdb_id, media_type, season, episode)
     DO UPDATE SET watched_seconds = EXCLUDED.watched_seconds,
                   duration_seconds = EXCLUDED.duration_seconds,
                   watched_at = now()
     RETURNING *`,
    [userId, tmdbId, mediaType, season, episode, watchedSeconds, durationSeconds]
  );
  return result.rows[0];
};

// One row per title: whichever (tmdb_id, media_type) the user watched most
// recently, using that title's latest season/episode for TV shows.
exports.getContinueWatching = async (userId) => {
  const result = await pool.query(
    `SELECT DISTINCT ON (tmdb_id, media_type)
            tmdb_id, media_type, season, episode, watched_seconds, duration_seconds, watched_at
     FROM watch_history
     WHERE user_id = $1
     ORDER BY tmdb_id, media_type, watched_at DESC`,
    [userId]
  );
  return result.rows;
};

exports.removeEntry = async (userId, tmdbId, mediaType, season, episode) => {
  const result = await pool.query(
    `DELETE FROM watch_history
     WHERE user_id = $1 AND tmdb_id = $2 AND media_type = $3 AND season = $4 AND episode = $5`,
    [userId, tmdbId, mediaType, season, episode]
  );
  return result.rowCount > 0;
};
