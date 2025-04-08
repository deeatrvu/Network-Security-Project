const express = require('express');
const router = express.Router();
const { submitVote, getVotes, verifyVote } = require('../controllers/voteController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, submitVote);
router.get('/', protect, admin, getVotes);
router.post('/verify', protect, admin, verifyVote);

module.exports = router; 