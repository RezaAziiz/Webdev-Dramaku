const express = require('express');
const tmdbController = require('../controllers/tmdbController');

const router = express.Router();

// HTTP Cache-Control middleware for browser and AWS CloudFront edge caching
const cacheControl = (seconds = 300) => (req, res, next) => {
  res.set('Cache-Control', `public, max-age=${seconds}, stale-while-revalidate=${Math.floor(seconds / 2)}`);
  next();
};

// Curated endpoints matching docs/BACKEND_TODO.md's contract shape
router.get('/api/trending', cacheControl(1800), tmdbController.getTrendingContract);
router.get('/api/just-added', cacheControl(1800), tmdbController.getJustAddedContract);
router.get('/api/search', cacheControl(300), tmdbController.searchContract);
router.get('/api/discover/:mediaType', cacheControl(600), tmdbController.discoverContract);
router.get('/api/genres', cacheControl(86400), tmdbController.getMergedGenres);

// Order matters: specific literal paths before the generic :mediaType/:id.
router.get('/api/tmdb/trending', cacheControl(1800), tmdbController.getTrending);
router.get('/api/tmdb/search', cacheControl(300), tmdbController.search);
router.get('/api/tmdb/genres/:mediaType', cacheControl(86400), tmdbController.getGenres);
router.get('/api/tmdb/just-added/:mediaType', cacheControl(1800), tmdbController.getJustAdded);
router.get('/api/tmdb/popular/:mediaType', cacheControl(1800), tmdbController.getPopular);
router.get('/api/tmdb/discover/:mediaType', cacheControl(600), tmdbController.discover);
router.get('/api/tmdb/tv/:id/season/:seasonNumber', cacheControl(21600), tmdbController.getSeasonDetails);
router.get('/api/tmdb/:mediaType/:id', cacheControl(21600), tmdbController.getDetails);

module.exports = router;
