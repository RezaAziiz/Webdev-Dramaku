const express = require('express');
const commentController = require('../controllers/commentController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/api/comments', authenticateToken, commentController.addComment);
router.get('/api/comments/:mediaType/:tmdbId', commentController.getCommentsForTitle);
router.delete('/api/comments', authenticateToken, commentController.deleteComments);

module.exports = router;
