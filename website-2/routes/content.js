const express = require('express');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const Content = require('../models/Content');
const User = require('../models/User');
const axios = require('axios');

const router = express.Router();

// AI Summarization Service
class SummaryService {
  static async summarizeWithOpenAI(text, options = {}) {
    const { length = 'medium', model = 'gpt-3.5-turbo' } = options;
    
    const lengthInstructions = {
      short: 'in 2-3 concise sentences',
      medium: 'in 1-2 well-structured paragraphs',
      long: 'in 3-4 detailed paragraphs with key insights'
    };

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: model,
        messages: [
          {
            role: 'system',
            content: `You are an expert content summarizer. Create intelligent, engaging summaries that capture the essence and key insights of the content. Focus on the most important information, main arguments, and actionable insights. Make the summary ${lengthInstructions[length]} while maintaining clarity and value for the reader.`
          },
          {
            role: 'user',
            content: `Please create a comprehensive summary of this content, highlighting the key points, main arguments, and important insights:\n\n${text.substring(0, 4000)}` // Limit input to avoid token limits
          }
        ],
        max_tokens: length === 'short' ? 200 : length === 'medium' ? 400 : 600,
        temperature: 0.4,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        text: response.data.choices[0].message.content.trim(),
        model: model,
        status: 'completed',
        generatedAt: new Date()
      };

    } catch (error) {
      console.error('OpenAI summarization error:');
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      console.error('Message:', error.message);
      
      // Better error handling based on error type
      let errorMessage = 'AI summarization failed';
      if (error.response?.status === 401) {
        errorMessage = 'Invalid OpenAI API key';
      } else if (error.response?.status === 429) {
        errorMessage = 'OpenAI rate limit exceeded';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid request to OpenAI';
      }
      
      throw new Error(errorMessage);
    }
  }

  static async generateSummary(text, options = {}) {
    if (!text || text.length < 100) {
      return {
        text: text || 'No content available',
        status: 'too_short',
        generatedAt: new Date()
      };
    }

    // Try OpenAI if API key is available
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here' && process.env.OPENAI_API_KEY !== 'your-actual-openai-api-key-here') {
      try {
        console.log('Attempting OpenAI summarization...');
        return await this.summarizeWithOpenAI(text, options);
      } catch (error) {
        console.log('OpenAI failed:', error.message, '- Trying Cohere fallback...');
        // Don't return here - continue to fallback options
      }
    } else {
      console.log('OpenAI API key not configured properly');
    }

    // Try Cohere API as primary fallback (5M tokens/month free)
    if (process.env.COHERE_API_KEY && process.env.COHERE_API_KEY !== 'your-cohere-api-key-here') {
      try {
        console.log('Attempting Cohere summarization...');
        return await this.summarizeWithCohere(text, options);
      } catch (error) {
        console.log('Cohere failed:', error.message, '- Using smart extraction fallback...');
        // Continue to smart extraction fallback
      }
    } else {
      console.log('Cohere API key not configured - using smart extraction fallback');
    }

    // Enhanced smart fallback summary - extract key sentences and important points
    console.log('Using smart text extraction fallback');
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Look for important indicators (common in article content)
    const importantSentences = sentences.filter(sentence => {
      const lower = sentence.toLowerCase();
      return lower.includes('key') || 
             lower.includes('important') || 
             lower.includes('main') || 
             lower.includes('significant') ||
             lower.includes('conclusion') ||
             lower.includes('result') ||
             lower.includes('find') ||
             lower.includes('show') ||
             lower.includes('study') ||
             lower.includes('research');
    });
    
    // Use important sentences if found, otherwise first few sentences
    const summarySource = importantSentences.length > 0 
      ? importantSentences.slice(0, 2).concat(sentences.slice(0, 1))
      : sentences.slice(0, 3);
    
    const summary = summarySource.join('. ').trim() + (summarySource.length > 0 ? '.' : '');
    
    return {
      text: summary.length > 500 ? summary.substring(0, 497) + '...' : summary,
      status: 'completed',
      generatedAt: new Date(),
      model: 'smart_extraction',
      note: 'Generated using enhanced text extraction. Configure Cohere API for AI summaries.'
    };
  }

  // Cohere API Summarization (Best Free Alternative - 5M tokens/month)
  static async summarizeWithCohere(text, options = {}) {
    const { length = 'medium' } = options;
    
    const lengthMap = {
      short: 'short',      // ~50-100 words
      medium: 'medium',    // ~150-250 words  
      long: 'long'        // ~300-500 words
    };

    try {
      const response = await axios.post('https://api.cohere.ai/v1/summarize', {
        text: text.substring(0, 100000), // Cohere supports up to 100K characters
        length: lengthMap[length],
        format: 'paragraph',
        model: 'summarize-xlarge',
        extractiveness: 'medium',        // Balance between extractive and abstractive
        temperature: 0.3,               // Lower = more focused, higher = more creative
        additional_command: 'Focus on the key insights, main arguments, and actionable takeaways.'
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
          'Content-Type': 'application/json',
          'Cohere-Version': '2022-12-06'
        }
      });

      return {
        text: response.data.summary.trim(),
        model: 'cohere-summarize-xlarge',
        status: 'completed',
        generatedAt: new Date()
      };

    } catch (error) {
      console.error('Cohere summarization error:', error.response?.data || error.message);
      throw new Error('Cohere summarization failed');
    }
  }
}

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // Allow anonymous content saving for extension testing
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    next(error);
  }
};

// Validation schema for privacy-first content
const contentSchema = Joi.object({
  title: Joi.string().max(500).required(),
  // Summary is now required (privacy-first approach - no raw content stored)
  summary: Joi.object({
    text: Joi.string().max(5000).required(),
    wordCount: Joi.number().optional(),
    originalLength: Joi.number().optional(),
    model: Joi.string().required(),
    timestamp: Joi.string().optional(),
    note: Joi.string().optional()
  }).required(),
  url: Joi.string().uri().required(),
  siteName: Joi.string().required(),
  source: Joi.string().valid('youtube', 'article', 'basic', 'unknown').optional(),
  videoId: Joi.string().optional(),
  channel: Joi.string().optional(),
  userId: Joi.string().optional(), // For anonymous users
  timestamp: Joi.string().optional(), // From extension
  tags: Joi.array().items(Joi.string()).optional(),
  category: Joi.string().valid('technology', 'science', 'business', 'entertainment', 'education', 'news', 'other').optional(),
  isPrivacyMode: Joi.boolean().optional(),
  isWatchlist: Joi.boolean().optional()
});

// @route   POST /api/content
// @desc    Save extracted content
// @access  Public (for extension)
// Test: Auto-restart functionality
router.post('/', auth, async (req, res) => {
  try {
    // Auto-truncate content if it's too long
    if (req.body.content && req.body.content.length > 200000) {
      req.body.content = req.body.content.substring(0, 200000) + "\n\n... [Content truncated due to length]";
    }
    
    // Validate input
    const { error, value } = contentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.details.map(detail => detail.message) 
      });
    }

    const {
      title,
      content, // Optional in privacy mode
      summary, // Required - generated locally by extension
      url,
      siteName,
      source = 'unknown',
      videoId,
      channel,
      userId,
      tags = [],
      category = 'other',
      isPrivacyMode = true,
      isWatchlist = false
    } = value;

    // Handle user identification
    let user = req.user;
    if (!user && userId && userId !== 'anonymous') {
      user = await User.findById(userId);
    }

    // Create temporary user for anonymous content
    if (!user) {
      // For now, we'll create content without a user
      // In production, you might want to handle this differently
      return res.status(401).json({ 
        message: 'Authentication required to save content. Please login first.' 
      });
    }

    // Check for duplicate content
    const existingContent = await Content.findOne({
      user: user._id,
      url: url
    });

    if (existingContent) {
      return res.status(409).json({ 
        message: 'Content from this URL already saved',
        contentId: existingContent._id
      });
    }

    console.log(`🔒 Saving ${isPrivacyMode ? 'privacy-first' : 'full'} content from ${source}...`);

    // Create new content (privacy-first approach - no raw content stored)
    const newContent = new Content({
      title,
      url,
      siteName,
      source,
      user: user._id,
      videoId,
      channel,
      tags,
      category,
      isPrivacyMode,
      isWatchlist,
      // Summary is the primary content in privacy-first mode
      summary: {
        text: summary.text,
        generatedAt: summary.timestamp ? new Date(summary.timestamp) : new Date(),
        model: summary.model || 'local-llama',
        status: 'local_generated',
        wordCount: summary.wordCount || summary.text.split(' ').length,
        originalLength: summary.originalLength || 0,
        processingNote: summary.note
      }
    });

    // Calculate metadata from summary
    if (summary.text) {
      newContent.wordCount = summary.wordCount || summary.text.split(' ').length;
      newContent.readingTime = Math.ceil(newContent.wordCount / 200); // Assuming 200 WPM reading speed
    }

    await newContent.save();

    // Update user stats
    await User.findByIdAndUpdate(user._id, {
      $inc: { 'stats.totalContent': 1 }
    });

    // Populate user info for response
    await newContent.populate('user', 'username fullName');

    res.status(201).json({
      message: 'Privacy-first content saved successfully',
      content: {
        id: newContent._id,
        title: newContent.title,
        url: newContent.url,
        siteName: newContent.siteName,
        source: newContent.source,
        wordCount: newContent.wordCount,
        readingTime: newContent.readingTime,
        summary: newContent.summary,
        isPrivacyMode: newContent.isPrivacyMode,
        isWatchlist: newContent.isWatchlist,
        createdAt: newContent.createdAt
      }
    });

  } catch (error) {
    console.error('Content save error:', error);
    
    // Handle Mongoose validation errors specifically
    if (error.name === 'ValidationError') {
      const mongooseErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: mongooseErrors 
      });
    }
    
    res.status(500).json({ message: 'Server error while saving content' });
  }
});

// @route   GET /api/content
// @desc    Get user's saved content
// @access  Private
router.get('/', auth, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { source, category, search } = req.query;

    // Build query
    let query = { user: req.user._id };

    if (source) {
      query.source = source;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Get content with pagination
    const content = await Content.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username fullName')
      .select('-content'); // Don't return full content in list view, but keep summary

    const total = await Content.countDocuments(query);

    res.json({
      content,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });

  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ message: 'Server error while fetching content' });
  }
});

// @route   GET /api/content/:id
// @desc    Get specific content by ID
// @access  Private
// Fix: Prevent /:id route from matching reserved words like 'public'
router.get('/:id', auth, async (req, res, next) => {
  const reserved = ['public', 'feed', 'search', 'user'];
  // Only allow valid ObjectId for :id param
  if (reserved.includes(req.params.id) || !/^[a-fA-F0-9]{24}$/.test(req.params.id)) {
    return next(); // Pass to next route
  }
  try {
    const content = await Content.findOne({ _id: req.params.id, user: req.user._id });
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    res.json({ content });
  } catch (error) {
    console.error('Get content by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/content/:id
// @desc    Update content
// @access  Private
router.put('/:id', auth, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const content = await Content.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Update allowed fields
    const updateFields = ['tags', 'category', 'isPublic', 'isWatchlist'];
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        content[field] = req.body[field];
      }
    });

    await content.save();

    res.json({
      message: 'Content updated successfully',
      content: {
        id: content._id,
        tags: content.tags,
        category: content.category,
        isPublic: content.isPublic,
        isWatchlist: content.isWatchlist
      }
    });

  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ message: 'Server error while updating content' });
  }
});

// @route   DELETE /api/content/:id
// @desc    Delete content
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const content = await Content.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.totalContent': -1 }
    });

    res.json({ message: 'Content deleted successfully' });

  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ message: 'Server error while deleting content' });
  }
});

// @route   GET /api/content/public/feed
// @desc    Get public content feed
// @access  Public
router.get('/public/feed', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const content = await Content.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username fullName avatar')
      .select('-content'); // Don't return full content in feed

    const total = await Content.countDocuments({ isPublic: true });

    res.json({
      content,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });

  } catch (error) {
    console.error('Get public feed error:', error);
    res.status(500).json({ message: 'Server error while fetching public feed' });
  }
});

// @route   POST /api/content/:id/summarize
// @desc    Generate or regenerate summary for specific content
// @access  Private
router.post('/:id/summarize', auth, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const content = await Content.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Generate new summary
    const summaryResult = await SummaryService.generateSummary(content.content, { 
      length: req.body.length || 'medium' 
    });

    // Update content with new summary
    content.summary = summaryResult;
    await content.save();

    res.json({
      message: 'Summary generated successfully',
      summary: summaryResult
    });

  } catch (error) {
    console.error('Summary generation error:', error);
    res.status(500).json({ message: 'Server error while generating summary' });
  }
});

// @route   GET /api/content/search
// @desc    Search content by title, summary, or site name
// @access  Private
router.get('/search', auth, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const searchQuery = q.trim();
    
    // Create search query with multiple fields
    const query = {
      $and: [
        { userId: req.user._id }, // Only search user's own content
        {
          $or: [
            { title: { $regex: searchQuery, $options: 'i' } },
            { siteName: { $regex: searchQuery, $options: 'i' } },
            { url: { $regex: searchQuery, $options: 'i' } },
            { 'summary.text': { $regex: searchQuery, $options: 'i' } }
          ]
        }
      ]
    };

    const content = await Content.find(query)
      .populate('userId', '_id username fullName')
      .sort({ createdAt: -1 })
      .limit(50); // Limit results to 50 items

    res.json({
      success: true,
      count: content.length,
      content: content
    });

  } catch (error) {
    console.error('Content search error:', error);
    res.status(500).json({ message: 'Server error while searching content' });
  }
});

// @route   GET /api/content/public
// @desc    Get public content for explore page
// @access  Public (with optional auth)
router.get('/public', async (req, res) => {
  try {
    const { filter = 'recent', timeFilter = 'all', limit = 50 } = req.query;
    
    let query = {};
    let sort = {};
    
    // Apply time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (timeFilter) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
      }
      
      if (startDate) {
        query.createdAt = { $gte: startDate };
      }
    }
    
    // Apply sorting based on filter
    switch (filter) {
      case 'popular':
        // Sort by some popularity metric (you can customize this)
        sort = { createdAt: -1 }; // For now, just recent
        break;
      case 'trending':
        // Sort by trending (you can implement view counts, etc.)
        sort = { createdAt: -1 }; // For now, just recent
        break;
      case 'recent':
      default:
        sort = { createdAt: -1 };
        break;
    }

    const content = await Content.find(query)
      .populate('userId', '_id username fullName avatar')
      .sort(sort)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: content.length,
      content: content
    });

  } catch (error) {
    console.error('Public content fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching public content' });
  }
});

// @route   GET /api/content/user/:userId
// @desc    Get content by user ID (for profile pages)
// @access  Public (with privacy controls)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get the target user
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if profile is private and if current user has access
    let hasAccess = !targetUser.preferences?.publicProfile === false;
    
    // If authenticated user is requesting
    if (req.user) {
      // User can always see their own content
      if (req.user._id.toString() === userId) {
        hasAccess = true;
      }
      // Check if current user is following the target user
      else if (targetUser.isFollowing && targetUser.isFollowing(req.user._id)) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      return res.status(403).json({ message: 'This profile is private' });
    }

    const content = await Content.find({ userId: userId })
      .populate('userId', '_id username fullName avatar')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      count: content.length,
      content: content
    });

  } catch (error) {
    console.error('User content fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching user content' });
  }
});

// @route   POST /api/content/bulk-upload
// @desc    Bulk upload content from extension/LLM server
// @access  Private (requires valid JWT)
router.post('content/bulk-upload', auth, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  const contentItems = req.body.contentItems || [];
  if (!Array.isArray(contentItems) || contentItems.length === 0) {
    return res.status(400).json({ message: 'No content items provided' });
  }
  let successCount = 0;
  let errors = [];
  for (const item of contentItems) {
    try {
      // Validate and save each item using the same logic as single POST /api/content
      const { error, value } = contentSchema.validate(item);
      if (error) {
        errors.push({ url: item.url, error: error.details.map(e => e.message) });
        continue;
      }
      // Check for duplicate
      const existingContent = await Content.findOne({ user: req.user._id, url: value.url });
      if (existingContent) {
        errors.push({ url: value.url, error: 'Content already exists' });
        continue;
      }
      const newContent = new Content({ ...value, user: req.user._id });
      await newContent.save();
      successCount++;
    } catch (err) {
      errors.push({ url: item.url, error: err.message });
    }
  }
  res.json({
    message: `Bulk upload complete: ${successCount} succeeded, ${errors.length} failed`,
    successCount,
    errorCount: errors.length,
    errors
  });
});

module.exports = router;
