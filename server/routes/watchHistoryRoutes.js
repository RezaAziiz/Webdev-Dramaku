const express = require('express');
const watchHistoryController = require('../controllers/watchHistoryController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.put('/api/watch-history', authenticateToken, watchHistoryController.saveProgress);
router.get('/api/watch-history', authenticateToken, watchHistoryController.getContinueWatching);
router.delete('/api/watch-history/:mediaType/:tmdbId', authenticateToken, watchHistoryController.removeEntry);

module.exports = router;
