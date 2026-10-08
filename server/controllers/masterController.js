const catchAsync = require('../utils/catchAsync');
const masterService = require('../services/masterService');
const cloudinary = require('../config/cloudinary');

// Genres
exports.getGenres = catchAsync(async (req, res, next) => {
  const genres = await masterService.getGenres();
  res.json(genres);
});

exports.addGenre = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  const genre = await masterService.addGenre(name);
  res.status(201).json(genre);
});

exports.updateGenre = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  const genre = await masterService.updateGenre(id, name);
  res.status(200).json(genre);
});

exports.deleteGenre = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await masterService.deleteGenre(id);
  res.status(200).json({ message: 'Genre and related movie associations deleted successfully' });
});

// Countries
exports.getCountries = catchAsync(async (req, res, next) => {
  const countries = await masterService.getCountries();
  res.json(countries);
});

exports.addCountry = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  const country = await masterService.addCountry(name);
  res.status(201).json(country);
});

exports.updateCountry = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  const country = await masterService.updateCountry(id, name);
  res.status(200).json(country);
});

exports.deleteCountry = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await masterService.deleteCountry(id);
  res.status(200).json({ message: 'Country deleted successfully' });
});

// Awards
exports.getAwards = catchAsync(async (req, res, next) => {
  const awards = await masterService.getAwards();
  res.json(awards);
});

exports.addAward = catchAsync(async (req, res, next) => {
  const { name, year, country_id } = req.body;
  await masterService.addAward(name, year, country_id);
  res.send('Award created successfully');
});

exports.updateAward = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { country_id, name, year } = req.body;
  await masterService.updateAward(id, country_id, name, year);
  res.send('Award updated successfully');
});

exports.deleteAward = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await masterService.deleteAward(id);
  res.send('Award deleted successfully');
});

// Actors
exports.getActors = catchAsync(async (req, res, next) => {
  const actors = await masterService.getActors();
  res.json(actors);
});

exports.addActor = catchAsync(async (req, res, next) => {
  const { country_id, name, birth_date } = req.body;
  if (!req.file) {
    return res.status(400).json({ error: 'Photo is required' });
  }

  const url_photos = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
      if (error) return reject(error);
      resolve(result.secure_url);
    });
    uploadStream.end(req.file.buffer);
  });

  const actor = await masterService.addActor(country_id, name, birth_date, url_photos);
  res.status(201).json({ success: true, actor });
});

exports.updateActor = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { country_id, name, birth_date } = req.body;
  let url_photos = null;

  if (req.file) {
    url_photos = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream((error, result) => {
        if (error) return reject(new Error('Cloudinary upload error'));
        resolve(result.secure_url);
      }).end(req.file.buffer);
    });
  }

  const actor = await masterService.updateActor(id, country_id, name, birth_date, url_photos);
  res.json({ success: true, message: 'Actor updated', actor });
});

exports.deleteActor = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await masterService.deleteActor(id);
  res.json({ success: true, message: 'Actor deleted' });
});
