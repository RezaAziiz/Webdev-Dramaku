const express = require('express');
const movieController = require('../controllers/movieController');

const router = express.Router();

router.get('/movies', movieController.getAllMovies);
router.get('/movies/:id', movieController.getMovieById);
router.get('/api/search', movieController.searchMovies);
router.get('/suggestions', movieController.getSuggestions);

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
router.post('/api/movies', upload.single('photo'), movieController.createMovie);

module.exports = router;
