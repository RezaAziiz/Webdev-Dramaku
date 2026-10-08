const express = require('express');
const watchlistController = require('../controllers/watchlistController');

const router = express.Router();

router.post('/api/watchlist', watchlistController.addWatchlist);
router.get('/api/watchlist/:username', watchlistController.getWatchlist);
router.delete('/api/watchlist/:username/:movieId', watchlistController.removeWatchlist);

module.exports = router;
