const express = require('express');
const watchlistController = require('../controllers/watchlistController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/api/watchlist', authenticateToken, watchlistController.addWatchlist);
router.get('/api/watchlist', authenticateToken, watchlistController.getWatchlist);
router.delete('/api/watchlist/:mediaType/:tmdbId', authenticateToken, watchlistController.removeWatchlist);

module.exports = router;
