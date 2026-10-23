const express = require('express');
const multer = require('multer');
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', userController.getAllUsers);
router.put('/:username/ban', userController.banUser);
router.put('/:username/role', userController.updateRole);
router.put('/me/avatar', authenticateToken, upload.single('photo'), userController.updateAvatar);

module.exports = router;
