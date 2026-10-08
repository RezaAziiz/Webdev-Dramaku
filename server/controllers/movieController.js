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

exports.createMovie = catchAsync(async (req, res, next) => {
  const { title, alt_title, year, availability, synopsis, trailer, country_id, genres, awards, actors } = req.body;
  
  let images = null;
  if (req.file) {
    images = await new Promise((resolve, reject) => {
      const cloudinary = require('../config/cloudinary');
      const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      });
      uploadStream.end(req.file.buffer);
    });
  }

  const newMovie = await movieService.createMovie(title, alt_title, availability, synopsis, trailer, year, images, country_id, genres, awards, actors);
  res.status(201).json(newMovie);
});
