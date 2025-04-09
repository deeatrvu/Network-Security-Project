const Vote = require('../models/Vote');
const User = require('../models/User');
const { decryptVote } = require('../utils/encryption');
const { broadcast } = require('../server');

// @desc    Submit a vote
// @route   POST /api/votes
// @access  Private
const submitVote = async (req, res) => {
  try {
    const { encryptedVote, electionId } = req.body;
    const userId = req.user.id;

    // Check if user has already voted
    const user = await User.findByPk(userId);
    if (user.hasVoted) {
      return res.status(400).json({ message: 'You have already voted' });
    }

    // Create new vote
    const vote = await Vote.create({
      voterId: userId,
      encryptedVote,
      electionId
    });

    // Update user's voting status
    user.hasVoted = true;
    await user.save();

    // Broadcast new vote to all connected clients
    const votes = await Vote.findAll({
      include: [{
        model: User,
        attributes: ['username', 'email', 'publicKey']
      }]
    });

    const decryptedVotes = votes.map(vote => {
      let decryptedVote;
      try {
        decryptedVote = decryptVote(vote.encryptedVote, vote.User.publicKey);
      } catch (error) {
        console.error('Error decrypting vote:', error);
        decryptedVote = 'unknown';
      }
      return {
        ...vote.toJSON(),
        decryptedVote
      };
    });

    broadcast(decryptedVotes);

    res.status(201).json(vote);
  } catch (error) {
    console.error('Vote submission error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all votes (admin only)
// @route   GET /api/votes
// @access  Private/Admin
const getVotes = async (req, res) => {
  try {
    const votes = await Vote.findAll({
      include: [{
        model: User,
        attributes: ['username', 'email', 'publicKey']
      }]
    });

    // Decrypt votes
    const decryptedVotes = votes.map(vote => {
      let decryptedVote;
      try {
        decryptedVote = decryptVote(vote.encryptedVote, vote.User.publicKey);
      } catch (error) {
        console.error('Error decrypting vote:', error);
        decryptedVote = 'unknown';
      }
      return {
        ...vote.toJSON(),
        decryptedVote
      };
    });

    res.json(decryptedVotes);
  } catch (error) {
    console.error('Get votes error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify vote integrity
// @route   POST /api/votes/verify
// @access  Private/Admin
const verifyVote = async (req, res) => {
  try {
    const { voteId, privateKey } = req.body;
    const vote = await Vote.findByPk(voteId, {
      include: [{
        model: User,
        attributes: ['publicKey']
      }]
    });
    
    if (!vote) {
      return res.status(404).json({ message: 'Vote not found' });
    }

    // In a real implementation, this would use proper asymmetric encryption
    // This is a simplified version for demonstration
    const decryptedVote = decryptVote(vote.encryptedVote, privateKey);
    
    res.json({
      voteId: vote.id,
      voterId: vote.voterId,
      decryptedVote,
      timestamp: vote.createdAt
    });
  } catch (error) {
    console.error('Verify vote error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitVote,
  getVotes,
  verifyVote
}; 