const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/', userController.getAllUsers);
router.put('/:username/ban', userController.banUser);
router.put('/:username/role', userController.updateRole);

module.exports = router;
