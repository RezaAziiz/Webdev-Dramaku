const watchlistRepository = require('../repositories/watchlistRepository');
const AppError = require('../utils/AppError');

const VALID_MEDIA_TYPES = ['movie', 'tv'];

const assertValidMediaType = (mediaType) => {
  if (!VALID_MEDIA_TYPES.includes(mediaType)) {
    throw new AppError("media_type must be 'movie' or 'tv'", 400);
  }
};

exports.addWatchlist = async (userId, tmdbId, mediaType) => {
  assertValidMediaType(mediaType);
  const existing = await watchlistRepository.checkWatchlist(userId, tmdbId, mediaType);
  if (existing) {
    throw new AppError('Title already in watchlist', 400);
  }
  return await watchlistRepository.addWatchlist(userId, tmdbId, mediaType);
};

exports.getWatchlist = async (userId) => {
  return await watchlistRepository.getWatchlist(userId);
};

exports.removeWatchlist = async (userId, tmdbId, mediaType) => {
  assertValidMediaType(mediaType);
  const removed = await watchlistRepository.removeWatchlist(userId, tmdbId, mediaType);
  if (!removed) {
    throw new AppError('Title not found in watchlist', 404);
  }
  return true;
};
