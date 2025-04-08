const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { generateKeyPair } = require('../utils/encryption');
const { Op } = require('sequelize');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, email, password, publicKey, adminCode } = req.body;

    // Check if user exists
    const userExists = await User.findOne({
      where: {
        [Op.or]: [
          { email: email },
          { username: username }
        ]
      }
    });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Verify admin code if provided
    let role = 'voter';
    if (adminCode) {
      // In a real application, this should be stored securely and compared properly
      if (adminCode === process.env.ADMIN_CODE) {
        role = 'admin';
      } else {
        return res.status(400).json({ message: 'Invalid admin code' });
      }
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      publicKey,
      role
    });

    if (user) {
      res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user.id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (user && (await user.matchPassword(password))) {
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user.id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser
}; 