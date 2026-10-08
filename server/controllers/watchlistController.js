const catchAsync = require('../utils/catchAsync');
const watchlistService = require('../services/watchlistService');

exports.addWatchlist = catchAsync(async (req, res, next) => {
  const { username, movieId } = req.body;
  await watchlistService.addWatchlist(username, movieId);
  res.status(201).json({ message: 'Movie added to watchlist' });
});

exports.getWatchlist = catchAsync(async (req, res, next) => {
  const { username } = req.params;
  const watchlist = await watchlistService.getWatchlist(username);
  res.status(200).json(watchlist);
});

exports.removeWatchlist = catchAsync(async (req, res, next) => {
  const { username, movieId } = req.params;
  await watchlistService.removeWatchlist(username, movieId);
  res.status(200).json({ message: 'Movie removed from watchlist' });
});
