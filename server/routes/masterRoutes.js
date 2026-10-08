const express = require('express');
const masterController = require('../controllers/masterController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Genres
router.get('/api/genres', masterController.getGenres);
router.post('/api/genres', masterController.addGenre);
router.put('/api/genres/:id', masterController.updateGenre);
router.delete('/api/genres/:id', masterController.deleteGenre);

// Countries
router.get('/api/countries', masterController.getCountries);
router.post('/api/countries', masterController.addCountry);
router.put('/api/countries/:id', masterController.updateCountry);
router.delete('/api/countries/:id', masterController.deleteCountry);

// Awards
router.get('/api/awards', masterController.getAwards);
router.post('/awards', masterController.addAward);
router.put('/awards/:id', masterController.updateAward);
router.delete('/awards/:id', masterController.deleteAward);

// Actors
router.get('/actors', masterController.getActors);
router.post('/actors', upload.single('photo'), masterController.addActor);
router.put('/actors/:id', upload.single('photo'), masterController.updateActor);
router.delete('/actors/:id', masterController.deleteActor);

module.exports = router;
