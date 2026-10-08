const express = require('express');
const movieController = require('../controllers/movieController');

const router = express.Router();

router.get('/movies', movieController.getAllMovies);
router.get('/movies/:id', movieController.getMovieById);
router.get('/api/search', movieController.searchMovies);
router.get('/suggestions', movieController.getSuggestions);

module.exports = router;
