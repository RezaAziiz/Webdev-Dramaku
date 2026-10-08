const movieRepository = require('../repositories/movieRepository');
const AppError = require('../utils/AppError');

exports.getAllMovies = async () => {
  return await movieRepository.getAllMovies();
};

exports.getMovieById = async (id) => {
  const movie = await movieRepository.getMovieById(id);
  if (!movie) {
    throw new AppError('Movie not found', 404);
  }
  return movie;
};

exports.searchMovies = async (searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return [];
  }
  
  return await movieRepository.searchMovies(searchTerm.trim());
};

exports.getSuggestions = async (searchTerm) => {
  const term = searchTerm || '';
  const formattedSearchTerm = `${term.toLowerCase()}%`;
  return await movieRepository.getSuggestions(formattedSearchTerm);
};
