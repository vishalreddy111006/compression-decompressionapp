const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Content = require('../models/Content');
const Notification = require('../models/Notification');

const router = express.Router();

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    const user = await User.findById(decoded.userId)
      .populate('following.user', '_id username')
      .populate('followers.user', '_id username')
      .populate('followRequests.from', '_id username');

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

// Optional authentication middleware - doesn't require auth but adds user if token present
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
      const user = await User.findById(decoded.userId)
        .populate('following.user', '_id username')
        .populate('followers.user', '_id username')
        .populate('followRequests.from', '_id username');

      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};
// @route   GET /api/users/search
// @desc    Search users by username, fullName, or email
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const skip = (page - 1) * limit;

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { fullName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ],
      _id: { $ne: req.user._id } // Exclude current user
    })
    .select('username fullName email avatar followerCount followingCount stats followRequests')
    .skip(skip)
    .limit(parseInt(limit));

    // Add follow status for each user
    const usersWithStatus = users.map(user => {
      const userObj = user.toObject();
      userObj.isFollowing = req.user.isFollowing(user._id);
      userObj.hasPendingRequest = user.hasPendingRequest(req.user._id);
      return userObj;
    });

    const total = await User.countDocuments({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { fullName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ],
      _id: { $ne: req.user._id }
    });

    res.json({
      users: usersWithStatus,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ message: 'Server error while searching users' });
  }
});

// @route   GET /api/users/:username
// @desc    Get user profile by username
// @access  Public
router.get('/:username', optionalAuth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('username fullName avatar followers following stats preferences createdAt followRequests');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if profile is public or if user is authenticated and following
    let canViewContent = user.preferences.publicProfile;
    
    if (!canViewContent && req.user) {
      canViewContent = req.user._id.toString() === user._id.toString() || 
                       req.user.isFollowing(user._id);
    }

    const profileData = {
      username: user.username,
      fullName: user.fullName,
      avatar: user.avatar,
      followerCount: user.followers ? user.followers.length : 0,
      followingCount: user.following ? user.following.length : 0,
      stats: user.stats,
      joinedAt: user.createdAt,
      canViewContent
    };

    // Add relationship status if authenticated
    if (req.user && req.user._id.toString() !== user._id.toString()) {
      profileData.isFollowing = req.user.isFollowing(user._id);
      profileData.hasPendingRequest = user.hasPendingRequest(req.user._id);
    }

    res.json({ user: profileData });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error while fetching user profile' });
  }
});

// @route   GET /api/users/:username/content
// @desc    Get user's public content
// @access  Public/Private
router.get('/:username/content', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Determine what content the requester can see
    let contentQuery = { user: user._id };

    console.log(`Content access check for ${req.params.username}:`);
    console.log(`- Requesting user: ${req.user ? req.user.username : 'anonymous'}`);
    console.log(`- Target user: ${user.username}`);
    console.log(`- Is own profile: ${req.user && req.user._id.toString() === user._id.toString()}`);
    console.log(`- Target user public: ${user.preferences.publicProfile}`);
    
    if (req.user) {
      console.log(`- Current user following: ${req.user.following ? req.user.following.map(f => f.user.toString()) : []}`);
      console.log(`- Is following target: ${req.user.isFollowing(user._id)}`);
    }

    if (!req.user || req.user._id.toString() !== user._id.toString()) {
      // Not the user themselves
      if (user.preferences.publicProfile) {
        contentQuery.isPublic = true;
        console.log('- Access granted: Public profile');
      } else if (req.user && req.user.isFollowing(user._id)) {
        // Following user, can see all content
        console.log('- Access granted: Following user');
      } else {
        console.log('- Access denied: Private profile and not following');
        return res.status(403).json({ message: 'Cannot view this user\'s content' });
      }
    } else {
      console.log('- Access granted: Own profile');
    }

    const content = await Content.find(contentQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-content') // Don't return full content in list
      .populate('user', 'username fullName avatar');

    const total = await Content.countDocuments(contentQuery);

    res.json({
      content,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get user content error:', error);
    res.status(500).json({ message: 'Server error while fetching user content' });
  }
});

// @route   POST /api/users/:username/follow
// @desc    Send follow request or follow user
// @access  Private
router.post('/:username/follow', auth, async (req, res) => {
  try {
    const targetUser = await User.findOne({ username: req.params.username });

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    // Check if already following
    if (req.user.isFollowing(targetUser._id)) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Check if already has pending request
    if (targetUser.hasPendingRequest(req.user._id)) {
      return res.status(400).json({ message: 'Follow request already sent' });
    }

    if (targetUser.preferences.publicProfile) {
      // Public profile - follow immediately
      req.user.following.push({
        user: targetUser._id,
        followedAt: new Date()
      });

      targetUser.followers.push({
        user: req.user._id,
        followedAt: new Date()
      });

      await req.user.save();
      await targetUser.save();

      res.json({ 
        message: 'Successfully followed user',
        status: 'following'
      });

    } else {
      // Private profile - send follow request
      targetUser.followRequests.push({
        from: req.user._id,
        requestedAt: new Date()
      });

      await targetUser.save();

      res.json({ 
        message: 'Follow request sent',
        status: 'pending'
      });
    }

  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Server error while following user' });
  }
});

// @route   POST /api/users/:username/unfollow
// @desc    Unfollow user
// @access  Private
router.post('/:username/unfollow', auth, async (req, res) => {
  try {
    const targetUser = await User.findOne({ username: req.params.username });

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove from current user's following list
    req.user.following = req.user.following.filter(
      follow => follow.user.toString() !== targetUser._id.toString()
    );

    // Remove from target user's followers list
    targetUser.followers = targetUser.followers.filter(
      follower => follower.user.toString() !== req.user._id.toString()
    );

    // Also remove any pending follow requests (in case user unfollows before request is accepted)
    targetUser.followRequests = targetUser.followRequests.filter(
      request => {
        const requestFromId = request.from._id || request.from;
        return requestFromId.toString() !== req.user._id.toString();
      }
    );

    await req.user.save();
    await targetUser.save();

    res.json({ message: 'Successfully unfollowed user' });

  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ message: 'Server error while unfollowing user' });
  }
});

// @route   GET /api/users/me/requests
// @desc    Get pending follow requests
// @access  Private
router.get('/me/requests', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('followRequests.from', 'username fullName avatar');

    res.json({
      requests: user.followRequests.map(request => ({
        id: request._id,
        user: request.from,
        requestedAt: request.requestedAt
      }))
    });

  } catch (error) {
    console.error('Get follow requests error:', error);
    res.status(500).json({ message: 'Server error while fetching follow requests' });
  }
});

// @route   POST /api/users/me/requests/:requestId/accept
// @desc    Accept follow request
// @access  Private
router.post('/me/requests/:requestId/accept', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const request = user.followRequests.id(req.params.requestId);

    if (!request) {
      return res.status(404).json({ message: 'Follow request not found' });
    }

    const followerUser = await User.findById(request.from);

    if (!followerUser) {
      return res.status(404).json({ message: 'Requesting user not found' });
    }

    // Add to followers and following lists
    user.followers.push({
      user: followerUser._id,
      followedAt: new Date()
    });

    followerUser.following.push({
      user: user._id,
      followedAt: new Date()
    });

    // Remove the request
    user.followRequests.pull(request._id);

    await user.save();
    await followerUser.save();

    // Create notification for the person who sent the follow request
    const notification = new Notification({
      recipient: followerUser._id,
      sender: user._id,
      type: 'follow_accepted',
      message: `${user.username} accepted your follow request`
    });

    await notification.save();

    res.json({ message: 'Follow request accepted' });

  } catch (error) {
    console.error('Accept follow request error:', error);
    res.status(500).json({ message: 'Server error while accepting follow request' });
  }
});

// @route   POST /api/users/me/requests/:requestId/reject
// @desc    Reject follow request
// @access  Private
router.post('/me/requests/:requestId/reject', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const request = user.followRequests.id(req.params.requestId);

    if (!request) {
      return res.status(404).json({ message: 'Follow request not found' });
    }

    // Remove the request
    user.followRequests.pull(request._id);
    await user.save();

    res.json({ message: 'Follow request rejected' });

  } catch (error) {
    console.error('Reject follow request error:', error);
    res.status(500).json({ message: 'Server error while rejecting follow request' });
  }
});

// @route   GET /api/users/me/notifications
// @desc    Get user's notifications
// @access  Private
router.get('/me/notifications', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCount = await Notification.countDocuments({ recipient: req.user._id });
    const unreadCount = await Notification.countDocuments({ 
      recipient: req.user._id, 
      isRead: false 
    });

    res.json({
      notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasMore: page < Math.ceil(totalCount / limit)
      },
      unreadCount
    });

  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ message: 'Server error while fetching notifications' });
  }
});

// @route   POST /api/users/me/notifications/:notificationId/read
// @desc    Mark notification as read
// @access  Private
router.post('/me/notifications/:notificationId/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.notificationId,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
    }

    res.json({ message: 'Notification marked as read' });

  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Server error while marking notification as read' });
  }
});

// @route   POST /api/users/me/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.post('/me/notifications/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    res.json({ message: 'All notifications marked as read' });

  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ message: 'Server error while marking all notifications as read' });
  }
});

module.exports = router;
