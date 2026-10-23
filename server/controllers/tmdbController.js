const catchAsync = require('../utils/catchAsync');
const tmdbService = require('../services/tmdbService');

exports.getTrending = catchAsync(async (req, res) => {
  const { mediaType = 'all', window = 'day', page = 1 } = req.query;
  const data = await tmdbService.getTrending(mediaType, window, page);
  res.json(data);
});

// Curated/normalized shape for docs/BACKEND_TODO.md's GET /api/trending
// contract: { id, title, images, description, year, rating, type, genre }.
exports.getTrendingContract = catchAsync(async (req, res) => {
  const { mediaType = 'all', window = 'day', page = 1 } = req.query;
  const data = await tmdbService.getTrendingNormalized(mediaType, window, page);
  res.json(data);
});

// Curated/normalized shape for docs/BACKEND_TODO.md's GET /api/just-added.
exports.getJustAddedContract = catchAsync(async (req, res) => {
  const { mediaType = 'movie', page = 1 } = req.query;
  const data = await tmdbService.getJustAddedNormalized(mediaType, page);
  res.json(data);
});

exports.getPopular = catchAsync(async (req, res) => {
  const { mediaType } = req.params;
  const { page = 1 } = req.query;
  const data = await tmdbService.getPopular(mediaType, page);
  res.json(data);
});

exports.getJustAdded = catchAsync(async (req, res) => {
  const { mediaType } = req.params;
  const { page = 1 } = req.query;
  const data = await tmdbService.getJustAdded(mediaType, page);
  res.json(data);
});

exports.getGenres = catchAsync(async (req, res) => {
  const { mediaType } = req.params;
  const data = await tmdbService.getGenres(mediaType);
  res.json(data);
});

// Alias for docs/BACKEND_TODO.md's GET /api/genres: movie + tv genres merged
// into one deduped list, since the product filters by genre regardless of
// media type.
exports.getMergedGenres = catchAsync(async (req, res) => {
  const data = await tmdbService.getMergedGenres();
  res.json(data);
});

exports.discover = catchAsync(async (req, res) => {
  const { mediaType } = req.params;
  const { genre, year, sortBy, page, language, minRating } = req.query;
  const data = await tmdbService.discover(mediaType, { genre, year, sortBy, page, language, minRating });
  res.json(data);
});

// Normalized shape, consistent with /api/trending and /api/just-added:
// { id, title, images, description, year, rating, type, genre }.
exports.discoverContract = catchAsync(async (req, res) => {
  const { mediaType } = req.params;
  const { genre, year, sortBy, page, language, minRating } = req.query;
  const data = await tmdbService.discoverNormalized(mediaType, { genre, year, sortBy, page, language, minRating });
  res.json(data);
});

exports.search = catchAsync(async (req, res) => {
  const { term, page = 1 } = req.query;
  const data = await tmdbService.search(term, page);
  res.json(data);
});

// Normalized shape, same contract as above. search/multi's person results
// are filtered out since they don't fit the title shape.
exports.searchContract = catchAsync(async (req, res) => {
  const { term, page = 1 } = req.query;
  const data = await tmdbService.searchNormalized(term, page);
  res.json(data);
});

exports.getDetails = catchAsync(async (req, res) => {
  const { mediaType, id } = req.params;
  const data = await tmdbService.getDetails(mediaType, id);
  res.json(data);
});

exports.getSeasonDetails = catchAsync(async (req, res) => {
  const { id, seasonNumber } = req.params;
  const data = await tmdbService.getSeasonDetails(id, seasonNumber);
  res.json(data);
});
