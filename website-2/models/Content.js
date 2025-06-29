// ============================================
// CONTENT MODEL - PRIVACY-FIRST CONTENT STORAGE
// ============================================
// This model stores ONLY summaries and metadata, never original content!
// Key Privacy Feature: Raw content is processed locally and never transmitted

const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  // ============================================
  // BASIC CONTENT METADATA
  // ============================================
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [500, 'Title cannot exceed 500 characters']
  },
  url: {
    type: String,
    required: [true, 'URL is required'],
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  siteName: {
    type: String,
    required: true,
    trim: true    // Website name (e.g., "Medium", "YouTube")
  },
  source: {
    type: String,
    enum: ['youtube', 'article', 'basic', 'unknown'],  // Content type classification
    default: 'unknown'
  },
  
  // ============================================
  // USER ASSOCIATION
  // ============================================
  // Reference to the user who saved this content
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // ============================================
  // PLATFORM-SPECIFIC FIELDS
  // ============================================
  // YouTube-specific fields (only populated for YouTube content)
  videoId: {
    type: String,
    sparse: true    // Only for YouTube content, allows null values
  },
  channel: {
    type: String,
    trim: true      // YouTube channel name
  },
  
  // ============================================
  // CONTENT ANALYTICS (PRIVACY-SAFE)
  // ============================================
  // Metadata about content without storing actual content
  wordCount: {
    type: Number,
    default: 0      // Estimated word count of original content
  },
  readingTime: {
    type: Number,   // Estimated reading time in minutes
    default: 0
  },
  
  // ============================================
  // AI SUMMARY - THE CORE PRIVACY FEATURE
  // ============================================
  // This is what we store instead of original content
  summary: {
    text: {
      type: String,
      required: [true, 'Summary is required for privacy-first mode'],
      minlength: [10, 'Summary must be at least 10 characters'],
      maxlength: [5000, 'Summary cannot exceed 5,000 characters']
    },
    generatedAt: {
      type: Date,
      default: Date.now  // When the summary was created
    },
    model: {
      type: String,      // AI model used (e.g., 'TinyLLaMA-1.1B', 'fallback')
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'not_requested', 'ai_failed', 'too_short', 'fallback_smart', 'generation_failed', 'local_generated'],
      default: 'local_generated'  // Most summaries are generated locally
    },
    wordCount: {
      type: Number,
      default: 0         // Word count of the summary itself
    },
    originalLength: {
      type: Number,      // Word count of original content (for reference only)
      default: 0         // Note: We never store the actual original content!
    },
    processingNote: {
      type: String       // Any additional processing information
    }
  },
  
  // ============================================
  // PRIVACY SETTINGS
  // ============================================
  isPrivacyMode: {
    type: Boolean,
    default: true       // Default to privacy mode (always true for this app)
  },
  
  // ============================================
  // CONTENT ORGANIZATION
  // ============================================
  // Tags for content categorization
  tags: [{
    type: String,
    trim: true,
    lowercase: true     // Normalize tags to lowercase
  }],
  category: {
    type: String,
    enum: ['technology', 'science', 'business', 'entertainment', 'education', 'news', 'other'],
    default: 'other'
  },
  
  // Privacy settings
  isPublic: {
    type: Boolean,
    default: false
  },
  
  // Engagement
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Additional metadata
  extractedAt: {
    type: Date,
    default: Date.now
  },
  language: {
    type: String,
    default: 'en'
  },
  
  // Watchlist/Reading list support
  isWatchlist: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for like count
contentSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Calculate word count and reading time before saving
contentSchema.pre('save', function(next) {
  if (this.content) {
    // Calculate word count
    this.wordCount = this.content.split(/\s+/).filter(word => word.length > 0).length;
    
    // Calculate reading time (average 200 words per minute)
    this.readingTime = Math.ceil(this.wordCount / 200);
  }
  
  next();
});

// Index for efficient queries
contentSchema.index({ user: 1, createdAt: -1 });
contentSchema.index({ siteName: 1 });
contentSchema.index({ source: 1 });
contentSchema.index({ isPublic: 1, createdAt: -1 });
contentSchema.index({ tags: 1 });
contentSchema.index({ category: 1 });

// Text search index
contentSchema.index({ 
  title: 'text', 
  content: 'text', 
  'summary.text': 'text' 
});

// Method to check if user has liked this content
contentSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
};

// Method to auto-categorize content based on siteName
contentSchema.methods.autoCategorizeBySite = function() {
  const siteName = this.siteName.toLowerCase();
  
  if (siteName.includes('youtube') || siteName.includes('vimeo')) {
    return 'entertainment';
  } else if (siteName.includes('github') || siteName.includes('stackoverflow')) {
    return 'technology';
  } else if (siteName.includes('medium') || siteName.includes('blog')) {
    return 'education';
  } else if (siteName.includes('news') || siteName.includes('cnn') || siteName.includes('bbc')) {
    return 'news';
  }
  
  return 'other';
};

// Pre-save middleware to auto-categorize if not set
contentSchema.pre('save', function(next) {
  if (this.category === 'other' && this.siteName) {
    this.category = this.autoCategorizeBySite();
  }
  next();
});

module.exports = mongoose.model('Content', contentSchema);
