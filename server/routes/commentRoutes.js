const express = require('express');
const commentController = require('../controllers/commentController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/movies/:id/comments', authenticateToken, commentController.addCommentToMovie);
router.get('/comments', commentController.getComments);
router.post('/comments', commentController.addGeneralComment);
router.put('/comments/:id', commentController.updateCommentStatus);
router.delete('/comments', commentController.deleteComments);

module.exports = router;