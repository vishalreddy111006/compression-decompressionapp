// ============================================
// AUTHENTICATION ROUTES - USER LOGIN & REGISTRATION
// ============================================
// This file handles all user authentication including registration and login
// Key Features: JWT token generation, password validation, secure user creation

const express = require('express');      // Web framework for route handling
const jwt = require('jsonwebtoken');     // JSON Web Token for secure authentication
const Joi = require('joi');             // Data validation library
const User = require('../models/User'); // Our User database model

const router = express.Router();

// ============================================
// INPUT VALIDATION SCHEMAS
// ============================================
// These schemas ensure users provide valid data when registering or logging in

// Registration validation - ensures all required fields are properly formatted
const registerSchema = Joi.object({
  email: Joi.string().email().required(),                    // Must be valid email format
  password: Joi.string().min(6).required(),                  // Minimum 6 characters for security
  username: Joi.string().alphanum().min(3).max(30).required(), // Alphanumeric, 3-30 chars
  fullName: Joi.string().max(100).optional()                 // Optional display name
});

// Login validation - simpler since we just need email and password
const loginSchema = Joi.object({
  email: Joi.string().email().required(),    // Valid email required
  password: Joi.string().required()          // Password required (no min length check here)
});

// ============================================
// JWT TOKEN GENERATION
// ============================================
// Generate a secure JWT token that expires in 7 days
const generateToken = (userId) => {
  return jwt.sign(
    { userId },                                           // Payload contains user ID
    process.env.JWT_SECRET || 'fallback-secret-key',     // Secret key from environment
    { expiresIn: '7d' }                                   // Token expires in 7 days
  );
};

// ============================================
// USER REGISTRATION ENDPOINT
// ============================================
// POST /api/auth/register - Create a new user account
// This is a public endpoint that anyone can access
router.post('/register', async (req, res) => {
  try {
    // First, validate that the user provided all required data in correct format
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: 'Registration validation failed', 
        errors: error.details.map(detail => detail.message) 
      });
    }

    const { email, password, username, fullName } = value;

    // Check if a user with this email or username already exists
    // We check both because both must be unique in our system
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    // Create new user
    const user = new User({
      email,
      password,
      username,
      fullName: fullName || ''
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.details.map(detail => detail.message) 
      });
    }

    const { email, password } = value;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        followerCount: user.followerCount,
        followingCount: user.followingCount,
        stats: user.stats
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user info
// @access  Private
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    const user = await User.findById(decoded.userId)
      .populate('followers.user', 'username fullName')
      .populate('following.user', 'username fullName');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar,
        preferences: user.preferences,
        followerCount: user.followerCount,
        followingCount: user.followingCount,
        stats: user.stats,
        followers: user.followers,
        following: user.following
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate new token
    const newToken = generateToken(user._id);

    res.json({
      message: 'Token refreshed successfully',
      token: newToken
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
