const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// Admin routes
router.get('/', protect, admin, getUsers);

module.exports = router; 