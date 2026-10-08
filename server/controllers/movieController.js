const catchAsync = require('../utils/catchAsync');
const movieService = require('../services/movieService');

exports.getAllMovies = catchAsync(async (req, res, next) => {
  const movies = await movieService.getAllMovies();
  res.json(movies);
});

exports.getMovieById = catchAsync(async (req, res, next) => {
  const movieId = parseInt(req.params.id);
  const movie = await movieService.getMovieById(movieId);
  res.json(movie);
});

exports.searchMovies = catchAsync(async (req, res, next) => {
  const searchTerm = req.query.term;
  const movies = await movieService.searchMovies(searchTerm);
  res.json(movies);
});

exports.getSuggestions = catchAsync(async (req, res, next) => {
  const searchTerm = req.query.term;
  const titles = await movieService.getSuggestions(searchTerm);
  res.json(titles);
});
