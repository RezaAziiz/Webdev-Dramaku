const masterRepository = require('../repositories/masterRepository');
const AppError = require('../utils/AppError');

// Genres
exports.getGenres = async () => {
  return await masterRepository.getGenres();
};

exports.addGenre = async (name) => {
  return await masterRepository.addGenre(name);
};

exports.updateGenre = async (id, name) => {
  const genre = await masterRepository.updateGenre(id, name);
  if (!genre) throw new AppError('Genre not found', 404);
  return genre;
};

exports.deleteGenre = async (id) => {
  const deleted = await masterRepository.deleteGenre(id);
  if (!deleted) throw new AppError('Genre not found', 404);
  return true;
};

// Countries
exports.getCountries = async () => {
  return await masterRepository.getCountries();
};

exports.addCountry = async (name) => {
  return await masterRepository.addCountry(name);
};

exports.updateCountry = async (id, name) => {
  const country = await masterRepository.updateCountry(id, name);
  if (!country) throw new AppError('Country not found', 404);
  return country;
};

exports.deleteCountry = async (id) => {
  const deleted = await masterRepository.deleteCountry(id);
  if (!deleted) throw new AppError('Country not found', 404);
  return true;
};

// Awards
exports.getAwards = async () => {
  return await masterRepository.getAwards();
};

exports.addAward = async (name, year, country_id) => {
  if (!name) throw new AppError('Award name cannot be null or empty.', 400);
  const isValidCountry = await masterRepository.checkCountryExists(country_id);
  if (!isValidCountry) throw new AppError('Invalid country_id. Please select a valid country.', 400);
  
  return await masterRepository.addAward(name, year, country_id);
};

exports.updateAward = async (id, country_id, name, year) => {
  return await masterRepository.updateAward(id, country_id, name, year);
};

exports.deleteAward = async (id) => {
  return await masterRepository.deleteAward(id);
};

// Actors
exports.getActors = async () => {
  return await masterRepository.getActors();
};

exports.addActor = async (country_id, name, birth_date, url_photos) => {
  return await masterRepository.addActor(country_id, name, birth_date, url_photos);
};

exports.updateActor = async (id, country_id, name, birth_date, url_photos) => {
  const actor = await masterRepository.updateActor(id, country_id, name, birth_date, url_photos);
  if (!actor) throw new AppError('Actor not found', 404);
  return actor;
};

exports.deleteActor = async (id) => {
  return await masterRepository.deleteActor(id);
};
