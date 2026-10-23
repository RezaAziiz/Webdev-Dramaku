const catchAsync = require('../utils/catchAsync');
const watchlistService = require('../services/watchlistService');

exports.addWatchlist = catchAsync(async (req, res, next) => {
  const { tmdbId, mediaType } = req.body;
  const entry = await watchlistService.addWatchlist(req.user.id, tmdbId, mediaType);
  res.status(201).json(entry);
});

exports.getWatchlist = catchAsync(async (req, res, next) => {
  const watchlist = await watchlistService.getWatchlist(req.user.id);
  res.status(200).json(watchlist);
});

exports.removeWatchlist = catchAsync(async (req, res, next) => {
  const { mediaType, tmdbId } = req.params;
  await watchlistService.removeWatchlist(req.user.id, parseInt(tmdbId), mediaType);
  res.status(200).json({ message: 'Removed from watchlist' });
});
