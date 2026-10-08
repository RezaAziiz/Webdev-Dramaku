const watchlistRepository = require('../repositories/watchlistRepository');
const AppError = require('../utils/AppError');

exports.addWatchlist = async (username, movieId) => {
  const existing = await watchlistRepository.checkWatchlist(username, movieId);
  if (existing) {
    throw new AppError('Movie already in watchlist', 400);
  }
  return await watchlistRepository.addWatchlist(username, movieId);
};

exports.getWatchlist = async (username) => {
  const watchlist = await watchlistRepository.getWatchlist(username);
  if (!watchlist || watchlist.length === 0) {
    throw new AppError('No movies in watchlist', 404);
  }
  return watchlist;
};

exports.removeWatchlist = async (username, movieId) => {
  const removed = await watchlistRepository.removeWatchlist(username, movieId);
  if (!removed) {
    throw new AppError('Movie not found in watchlist', 404);
  }
  return true;
};
