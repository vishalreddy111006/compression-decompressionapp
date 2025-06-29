const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const Content = require('../models/Content');
const User = require('../models/User');

const router = express.Router();

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
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

// AI Summarization Functions
class SummaryService {
  
  // OpenAI GPT-3.5/4 Summarization
  static async summarizeWithOpenAI(text, options = {}) {
    const { length = 'medium', model = 'gpt-3.5-turbo' } = options;
    
    const lengthInstructions = {
      short: 'in 2-3 sentences',
      medium: 'in 1-2 paragraphs',
      long: 'in 3-4 detailed paragraphs'
    };

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: model,
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that creates concise, accurate summaries. Summarize the given content ${lengthInstructions[length]} while preserving the key information and main ideas.`
          },
          {
            role: 'user',
            content: `Please summarize this content:\n\n${text}`
          }
        ],
        max_tokens: length === 'short' ? 150 : length === 'medium' ? 300 : 500,
        temperature: 0.3
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        text: response.data.choices[0].message.content.trim(),
        model: model,
        status: 'completed'
      };

    } catch (error) {
      console.error('OpenAI summarization error:', error.response?.data || error.message);
      throw new Error('OpenAI summarization failed');
    }
  }

  // Hugging Face Summarization (Free alternative)
  static async summarizeWithHuggingFace(text, options = {}) {
    const { length = 'medium' } = options;
    
    const maxLengthMap = {
      short: 100,
      medium: 200,
      long: 300
    };

    try {
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
        {
          inputs: text.substring(0, 1000), // Limit input length for free tier
          parameters: {
            max_length: maxLengthMap[length],
            min_length: 30,
            do_sample: false
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        text: response.data[0].summary_text,
        model: 'facebook/bart-large-cnn',
        status: 'completed'
      };

    } catch (error) {
      console.error('Hugging Face summarization error:', error.response?.data || error.message);
      throw new Error('Hugging Face summarization failed');
    }
  }

  // Simple extractive summary (fallback)
  static async createExtractiveSummary(text, options = {}) {
    const { length = 'medium' } = options;
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    if (sentences.length === 0) {
      throw new Error('No sentences found for summarization');
    }

    const targetSentences = {
      short: Math.min(3, sentences.length),
      medium: Math.min(5, sentences.length),
      long: Math.min(8, sentences.length)
    };

    // Simple heuristic: take first, middle, and last sentences
    const selectedSentences = [];
    const count = targetSentences[length];
    
    if (count >= 1) selectedSentences.push(sentences[0]);
    if (count >= 2) selectedSentences.push(sentences[Math.floor(sentences.length / 2)]);
    if (count >= 3) selectedSentences.push(sentences[sentences.length - 1]);
    
    // Add additional sentences if needed
    for (let i = 4; i <= count && i < sentences.length; i++) {
      const index = Math.floor((i - 1) * sentences.length / count);
      if (!selectedSentences.includes(sentences[index])) {
        selectedSentences.push(sentences[index]);
      }
    }

    return {
      text: selectedSentences.join('. ').trim() + '.',
      model: 'extractive-fallback',
      status: 'completed'
    };
  }

  // Main summarization method with fallbacks
  static async summarize(text, options = {}) {
    if (!text || text.length < 100) {
      throw new Error('Text too short for summarization');
    }

    // Try OpenAI first if API key is available
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
      try {
        return await this.summarizeWithOpenAI(text, options);
      } catch (error) {
        console.log('OpenAI failed, trying Hugging Face...');
      }
    }

    // Try Hugging Face if available
    if (process.env.HUGGINGFACE_API_KEY && process.env.HUGGINGFACE_API_KEY !== 'your-huggingface-api-key-here') {
      try {
        return await this.summarizeWithHuggingFace(text, options);
      } catch (error) {
        console.log('Hugging Face failed, using extractive summary...');
      }
    }

    // Fallback to extractive summary
    return await this.createExtractiveSummary(text, options);
  }
}

// @route   POST /api/summary/:contentId
// @desc    Generate summary for specific content
// @access  Private
router.post('/:contentId', auth, async (req, res) => {
  try {
    const { length = 'medium' } = req.body;

    // Find content
    const content = await Content.findOne({
      _id: req.params.contentId,
      user: req.user._id
    });

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Check if summary already exists and is recent
    if (content.summary && content.summary.status === 'completed' && content.summary.text) {
      return res.json({
        message: 'Summary already exists',
        summary: content.summary
      });
    }

    // Set status to pending
    content.summary = {
      status: 'pending',
      generatedAt: new Date()
    };
    await content.save();

    try {
      // Generate summary
      const summaryResult = await SummaryService.summarize(content.content, { length });

      // Update content with summary
      content.summary = {
        ...summaryResult,
        generatedAt: new Date()
      };

      await content.save();

      // Update user stats
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'stats.totalSummaries': 1 }
      });

      res.json({
        message: 'Summary generated successfully',
        summary: content.summary
      });

    } catch (summaryError) {
      // Update status to failed
      content.summary = {
        status: 'failed',
        generatedAt: new Date()
      };
      await content.save();

      throw summaryError;
    }

  } catch (error) {
    console.error('Summary generation error:', error);
    res.status(500).json({ 
      message: 'Failed to generate summary',
      error: error.message 
    });
  }
});

// @route   GET /api/summary/:contentId
// @desc    Get summary for specific content
// @access  Private
router.get('/:contentId', auth, async (req, res) => {
  try {
    const content = await Content.findOne({
      _id: req.params.contentId,
      $or: [
        { user: req.user._id },
        { isPublic: true }
      ]
    }).select('summary title');

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    if (!content.summary || content.summary.status === 'not_requested') {
      return res.status(404).json({ message: 'No summary available' });
    }

    res.json({
      summary: content.summary,
      title: content.title
    });

  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Server error while fetching summary' });
  }
});

// @route   POST /api/summary/batch
// @desc    Generate summaries for multiple content items
// @access  Private
router.post('/batch', auth, async (req, res) => {
  try {
    const { contentIds, length = 'medium' } = req.body;

    if (!Array.isArray(contentIds) || contentIds.length === 0) {
      return res.status(400).json({ message: 'Content IDs array is required' });
    }

    if (contentIds.length > 10) {
      return res.status(400).json({ message: 'Maximum 10 content items allowed per batch' });
    }

    const results = [];

    for (const contentId of contentIds) {
      try {
        const content = await Content.findOne({
          _id: contentId,
          user: req.user._id
        });

        if (!content) {
          results.push({
            contentId,
            status: 'error',
            message: 'Content not found'
          });
          continue;
        }

        // Skip if already has summary
        if (content.summary && content.summary.status === 'completed') {
          results.push({
            contentId,
            status: 'exists',
            summary: content.summary
          });
          continue;
        }

        // Generate summary
        const summaryResult = await SummaryService.summarize(content.content, { length });

        content.summary = {
          ...summaryResult,
          generatedAt: new Date()
        };

        await content.save();

        results.push({
          contentId,
          status: 'completed',
          summary: content.summary
        });

      } catch (error) {
        results.push({
          contentId,
          status: 'error',
          message: error.message
        });
      }
    }

    res.json({
      message: 'Batch summary generation completed',
      results
    });

  } catch (error) {
    console.error('Batch summary error:', error);
    res.status(500).json({ message: 'Server error during batch processing' });
  }
});

module.exports = router;
