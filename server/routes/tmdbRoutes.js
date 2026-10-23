const express = require('express');
const tmdbController = require('../controllers/tmdbController');

const router = express.Router();

// Curated endpoints matching docs/BACKEND_TODO.md's contract shape
// (id, title, images, description, year, rating, type, genre).
router.get('/api/trending', tmdbController.getTrendingContract);
router.get('/api/just-added', tmdbController.getJustAddedContract);
router.get('/api/search', tmdbController.searchContract);
router.get('/api/discover/:mediaType', tmdbController.discoverContract);
router.get('/api/genres', tmdbController.getMergedGenres);

// Order matters: specific literal paths before the generic :mediaType/:id.
router.get('/api/tmdb/trending', tmdbController.getTrending);
router.get('/api/tmdb/search', tmdbController.search);
router.get('/api/tmdb/genres/:mediaType', tmdbController.getGenres);
router.get('/api/tmdb/just-added/:mediaType', tmdbController.getJustAdded);
router.get('/api/tmdb/popular/:mediaType', tmdbController.getPopular);
router.get('/api/tmdb/discover/:mediaType', tmdbController.discover);
router.get('/api/tmdb/tv/:id/season/:seasonNumber', tmdbController.getSeasonDetails);
router.get('/api/tmdb/:mediaType/:id', tmdbController.getDetails);

module.exports = router;
