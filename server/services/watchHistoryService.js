const watchHistoryRepository = require('../repositories/watchHistoryRepository');
const tmdbService = require('./tmdbService');
const AppError = require('../utils/AppError');

const VALID_MEDIA_TYPES = ['movie', 'tv'];

const assertValidMediaType = (mediaType) => {
  if (!VALID_MEDIA_TYPES.includes(mediaType)) {
    throw new AppError("media_type must be 'movie' or 'tv'", 400);
  }
};

exports.saveProgress = async (userId, { tmdbId, mediaType, season, episode, watchedSeconds, durationSeconds }) => {
  assertValidMediaType(mediaType);
  if (mediaType === 'tv' && (!season || !episode)) {
    throw new AppError('season and episode are required for TV shows', 400);
  }

  return await watchHistoryRepository.upsertProgress({
    userId,
    tmdbId,
    mediaType,
    // Movies always use 0/0 so the UNIQUE constraint can de-duplicate them.
    season: mediaType === 'tv' ? season : 0,
    episode: mediaType === 'tv' ? episode : 0,
    watchedSeconds: watchedSeconds || 0,
    durationSeconds: durationSeconds || 0,
  });
};

// Hydrates each row with live TMDB title/poster/year/rating so the
// frontend's "Continue Watching" row doesn't need a second round-trip per
// title, matching the docs/BACKEND_TODO.md GET /api/watch-history contract
// (id, title, images, episode, progress, duration, year, rating).
exports.getContinueWatching = async (userId) => {
  const rows = await watchHistoryRepository.getContinueWatching(userId);

  return await Promise.all(
    rows.map(async (row) => {
      const base = {
        id: row.tmdb_id,
        type: row.media_type,
        season: row.media_type === 'tv' ? row.season : null,
        episode: row.media_type === 'tv' ? row.episode : null,
        progress: Number(row.watched_seconds),
        duration: Number(row.duration_seconds),
        watched_at: row.watched_at,
      };

      try {
        const details = await tmdbService.getDetails(row.media_type, row.tmdb_id);
        const releaseDate = details.release_date || details.first_air_date || '';
        return {
          ...base,
          title: details.title || details.name || '',
          images: tmdbService.toImageUrl(details.poster_path),
          year: releaseDate ? releaseDate.slice(0, 4) : null,
          rating: details.vote_average ?? null,
        };
      } catch (err) {
        // Title might have been removed from TMDB; keep the row instead of
        // dropping the whole continue-watching list over one bad title.
        return { ...base, title: null, images: null, year: null, rating: null };
      }
    })
  );
};

exports.removeEntry = async (userId, tmdbId, mediaType, season, episode) => {
  assertValidMediaType(mediaType);
  const removed = await watchHistoryRepository.removeEntry(userId, tmdbId, mediaType, season || 0, episode || 0);
  if (!removed) {
    throw new AppError('Watch history entry not found', 404);
  }
  return true;
};
