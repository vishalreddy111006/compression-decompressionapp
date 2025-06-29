// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================
// JWT token verification middleware for protecting routes

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware - verifies JWT token
const authenticate = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.header('Authorization');

        if (!authHeader) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        // Check if header starts with 'Bearer '
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Access denied. Invalid token format.' });
        }

        // Extract the actual token
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');

        // Find the user and attach to request
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'Access denied. User not found.' });
        }

        // Attach user to request object
        req.user = user;
        req.userId = user._id;

        next();
    } catch (error) {
        console.error('Authentication error:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Access denied. Invalid token.' });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Access denied. Token expired.' });
        }

        res.status(500).json({ message: 'Server error during authentication.' });
    }
};

// Optional authentication - continues even if no token (for public/private content)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
                const user = await User.findById(decoded.userId).select('-password');
                if (user) {
                    req.user = user;
                    req.userId = user._id;
                }
            }
        }
    } catch (error) {
        // Ignore errors and continue without authentication
    }
    next();
};

module.exports = {
    authenticate,
    optionalAuth
};
