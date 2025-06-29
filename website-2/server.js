const express = require('express');     // Web framework for Node.js
const mongoose = require('mongoose');   // MongoDB object modeling for Node.js
const cors = require('cors');          // Cross-Origin Resource Sharing middleware
const helmet = require('helmet');      // Security middleware for HTTP headers
const rateLimit = require('express-rate-limit');  // Rate limiting middleware
require('dotenv').config();            // Load environment variables from .env file

// Create Express application instance
const app = express();

// ============================================
// ROUTE IMPORTS - API ENDPOINT HANDLERS
// ============================================
// Import all route handlers for different API endpoints
const authRoutes = require('./routes/auth');         // User authentication (login/register)
const contentRoutes = require('./routes/content');   // Content management (CRUD operations)
const userRoutes = require('./routes/users');       // User management and social features
const summaryRoutes = require('./routes/summary');   // AI summarization coordination

// ============================================
// SECURITY MIDDLEWARE CONFIGURATION
// ============================================

// Helmet: Sets various HTTP headers to secure the app
// Protects against common vulnerabilities like XSS, clickjacking, etc.
app.use(helmet());

// Rate Limiting: Prevents abuse by limiting requests per IP
// This protects our API from denial-of-service attacks and spam
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // Time window: 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 500, // Max requests per window (generous for development)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,    // Include rate limit info in response headers
  legacyHeaders: false,     // Disable legacy X-RateLimit headers
  skip: (req) => {
    // Skip rate limiting for health checks and during development
    return req.path === '/health' || process.env.NODE_ENV === 'development';
  }
});
app.use('/api/', limiter);  // Apply rate limiting only to API routes

// ============================================
// CORS CONFIGURATION - CROSS-ORIGIN SECURITY
// ============================================
// CORS (Cross-Origin Resource Sharing) controls which domains can access our API
// This is crucial for security - we only allow our frontend and Chrome extension

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Define allowed origins for security
    const allowedOrigins = [
      'http://localhost:3000',        // Original React frontend
      'http://localhost:5002',        // Backend self-requests  
      'http://localhost:3002',        // Website-2 React frontend
      'chrome-extension://*',         // Any Chrome extension ID (for our extension)
      ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
    ];
    
    // Check if the requesting origin is in our allowed list
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        // Handle wildcard patterns (like chrome-extension://*)
        const pattern = allowedOrigin.replace('*', '.*');
        return new RegExp(pattern).test(origin);
      }
      return allowedOrigin === origin;
    });
    
    if (isAllowed) {
      callback(null, true);     // Origin is allowed
    } else {
      console.log('🚫 CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,    // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization']       // Allowed request headers
};

app.use(cors(corsOptions));  // Apply CORS configuration

// ============================================
// REQUEST PARSING MIDDLEWARE
// ============================================
// Configure Express to parse incoming request bodies
app.use(express.json({ limit: '10mb' }));                    // Parse JSON payloads up to 10MB
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded forms

// ============================================
// REQUEST LOGGING MIDDLEWARE
// ============================================
// Log all API requests for debugging and monitoring
app.use((req, res, next) => {
  const start = Date.now();
  
  // Log response time when request completes
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log(`📡 ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    }
  });
  
  next();  // Continue to next middleware
});

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================
// Simple endpoint to verify server is running and healthy
// Used by monitoring tools and for debugging connectivity
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
    message: 'Privacy-first content summarizer is running'
  });
});

// ============================================
// API ROUTE MOUNTING
// ============================================
// Mount all API routes with their respective prefixes
app.use('/api/auth', authRoutes);       // Authentication endpoints (/api/auth/login, /api/auth/register)
app.use('/api/content', contentRoutes); // Content management (/api/content, /api/content/:id)
app.use('/api/users', userRoutes);     // User management (/api/users/me, /api/users/search)
app.use('/api/summary', summaryRoutes); // AI summarization (/api/summary/generate)

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================
// Central error handling for all API routes
// Provides consistent error responses and security
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  
  // Handle specific error types with appropriate responses
  if (err.name === 'ValidationError') {
    // MongoDB validation errors (e.g., invalid email format)
    return res.status(400).json({ 
      message: 'Validation Error', 
      errors: Object.values(err.errors).map(e => e.message) 
    });
  }
  
  if (err.name === 'JsonWebTokenError') {
    // Invalid JWT token
    return res.status(401).json({ message: 'Invalid authentication token' });
  }
  
  if (err.name === 'TokenExpiredError') {
    // Expired JWT token
    return res.status(401).json({ message: 'Authentication token expired' });
  }
  
  // Generic error response
  res.status(err.status || 500).json({ 
    message: err.message || 'Internal Server Error',
    // Only show stack trace in development for security
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// 404 HANDLER - CATCH ALL UNDEFINED ROUTES
// ============================================
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    availableEndpoints: ['/health', '/api/auth', '/api/content', '/api/users', '/api/summary']
  });
});

// ============================================
// DATABASE CONNECTION
// ============================================
// Connect to MongoDB database where we store user data and summaries
// Note: We only store AI-generated summaries, never original content (privacy-first!)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/content-summarizer')
.then(() => {
  console.log('✅ Connected to MongoDB database');
  console.log('🔒 Privacy Note: Only summaries stored, never original content');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);  // Exit if database connection fails
});

// ============================================
// SERVER STARTUP
// ============================================
// Start the Express server and display helpful information
const PORT = 5002;
const server = app.listen(PORT, () => {
  console.log('🚀 Privacy-First Content Summarizer Server Started');
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API base URL: http://localhost:${PORT}/api`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('🔒 Privacy-first architecture: Raw content never transmitted!');
});

// ============================================
// GRACEFUL SHUTDOWN HANDLING
// ============================================
// Handle server shutdown gracefully to prevent data corruption

// Handle SIGTERM (termination signal)
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  server.close(async () => {
    console.log('✅ HTTP server closed');
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  });
});

// Handle SIGINT (interrupt signal - Ctrl+C)
process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  server.close(async () => {
    console.log('✅ HTTP server closed');
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  });
});

// ============================================
// EXCEPTION HANDLING
// ============================================
// Handle uncaught exceptions and promise rejections

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  // Don't exit in development to prevent constant restarts during debugging
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in development to prevent constant restarts during debugging
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Export the app for testing purposes
module.exports = app;
