const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Pin = require('../models/Pin');
const BabyItem = require('../models/BabyItem');
const Transaction = require('../models/Transaction');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @route   GET /api/users
// @desc    Get all users with search, pagination, and additional stats
// @access  Private/Admin
router.get('/', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  // Set up pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;
  
  // Build query
  let query = {};
  
  // Search functionality
  if (req.query.search) {
    query.$or = [
      { username: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
      { firstName: { $regex: req.query.search, $options: 'i' } },
      { lastName: { $regex: req.query.search, $options: 'i' } }
    ];
  }
  
  // Build sort
  let sortBy = '-createdAt'; // Default sort
  if (req.query.sort) {
    sortBy = req.query.sort;
  }
  
  // Execute query
  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password -resetPasswordToken -resetPasswordExpire')
    .sort(sortBy)
    .skip(startIndex)
    .limit(limit);
  
  // Get additional stats for each user
  const usersWithStats = await Promise.all(users.map(async (user) => {
    // Get item count
    const itemCount = await BabyItem.countDocuments({ user: user._id });
    
    // Get transaction stats
    const transactionStats = await Transaction.aggregate([
      {
        $match: {
          seller: user._id,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      }
    ]);
    
    const stats = transactionStats[0] || { count: 0, revenue: 0 };
    
    return {
      _id: user._id,
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage,
      location: user.location,
      isActive: user.isActive !== false, // Ensure boolean
      isAdmin: user.isAdmin || false,
      isEmailVerified: user.isEmailVerified || false,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
      itemCount,
      transactionCount: stats.count,
      revenue: stats.revenue
    };
  }));
    
  res.status(200).json({
    success: true,
    count: usersWithStats.length,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit
    },
    data: usersWithStats
  });
}));

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select('-password -resetPasswordToken -resetPasswordExpire');
  
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }
  
  // Get user's items (pins/baby items)
  const items = await BabyItem.find({ user: req.params.id })
    .select('title thumbnail price condition status')
    .sort({ createdAt: -1 })
    .limit(20);
  
  res.status(200).json({
    success: true,
    data: {
      user,
      items
    }
  });
}));

// @route   GET /api/users/username/:username
// @desc    Get user by username
// @access  Public
router.get('/username/:username', asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username })
    .select('-password -resetPasswordToken -resetPasswordExpire');
  
  if (!user) {
    return next(new ErrorResponse(`User not found with username of ${req.params.username}`, 404));
  }
  
  // Get user's items
  const items = await BabyItem.find({ user: user._id })
    .select('title thumbnail price condition status')
    .sort({ createdAt: -1 })
    .limit(20);
  
  res.status(200).json({
    success: true,
    data: {
      user,
      items
    }
  });
}));

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private
router.put('/:id', protect, asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }
  
  // Make sure user is updating their own profile or is admin
  if (user._id.toString() !== req.user.id && !req.user.isAdmin) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this profile`, 401));
  }
  
  // Fields that can be updated
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    username: req.body.username,
    email: req.body.email,
    bio: req.body.bio,
    location: req.body.location,
    profileImage: req.body.profileImage,
    website: req.body.website,
    socialMedia: req.body.socialMedia
  };
  
  // Admin-only fields
  if (req.user.isAdmin) {
    if (typeof req.body.isActive !== 'undefined') {
      fieldsToUpdate.isActive = req.body.isActive;
    }
    if (typeof req.body.isAdmin !== 'undefined') {
      fieldsToUpdate.isAdmin = req.body.isAdmin;
    }
    if (typeof req.body.isEmailVerified !== 'undefined') {
      fieldsToUpdate.isEmailVerified = req.body.isEmailVerified;
    }
  }
  
  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => 
    fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );
  
  // Update user
  user = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  }).select('-password');
  
  res.status(200).json({
    success: true,
    data: user
  });
}));

// @route   DELETE /api/users/:id
// @desc    Delete user and all their content
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }
  
  // Don't allow deleting the last admin
  if (user.isAdmin) {
    const adminCount = await User.countDocuments({ isAdmin: true });
    if (adminCount <= 1) {
      return next(new ErrorResponse('Cannot delete the last admin user', 400));
    }
  }
  
  // Delete user's items (both pins and baby items)
  await Pin.deleteMany({ user: req.params.id });
  await BabyItem.deleteMany({ user: req.params.id });
  
  // Update transactions where user is buyer or seller
  await Transaction.updateMany(
    { buyer: req.params.id },
    { $set: { buyerDeleted: true } }
  );
  
  await Transaction.updateMany(
    { seller: req.params.id },
    { $set: { sellerDeleted: true } }
  );
  
  // Delete user
  await user.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
}));

// @route   POST /api/users/:id/follow
// @desc    Follow a user
// @access  Private
router.post('/:id/follow', protect, asyncHandler(async (req, res, next) => {
  // Check if trying to follow yourself
  if (req.params.id === req.user.id) {
    return next(new ErrorResponse('You cannot follow yourself', 400));
  }
  
  const userToFollow = await User.findById(req.params.id);
  
  if (!userToFollow) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }
  
  const currentUser = await User.findById(req.user.id);
  
  // Check if already following
  if (currentUser.following.includes(req.params.id)) {
    return next(new ErrorResponse('You are already following this user', 400));
  }
  
  // Add to current user's following
  currentUser.following.push(req.params.id);
  await currentUser.save();
  
  // Add to target user's followers
  userToFollow.followers.push(req.user.id);
  await userToFollow.save();
  
  res.status(200).json({
    success: true,
    message: `You are now following ${userToFollow.username}`
  });
}));

// @route   POST /api/users/:id/unfollow
// @desc    Unfollow a user
// @access  Private
router.post('/:id/unfollow', protect, asyncHandler(async (req, res, next) => {
  const userToUnfollow = await User.findById(req.params.id);
  
  if (!userToUnfollow) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }
  
  const currentUser = await User.findById(req.user.id);
  
  // Check if not following
  if (!currentUser.following.includes(req.params.id)) {
    return next(new ErrorResponse('You are not following this user', 400));
  }
  
  // Remove from current user's following
  currentUser.following = currentUser.following.filter(
    id => id.toString() !== req.params.id
  );
  await currentUser.save();
  
  // Remove from target user's followers
  userToUnfollow.followers = userToUnfollow.followers.filter(
    id => id.toString() !== req.user.id
  );
  await userToUnfollow.save();
  
  res.status(200).json({
    success: true,
    message: `You have unfollowed ${userToUnfollow.username}`
  });
}));

// @route   GET /api/users/:id/followers
// @desc    Get user's followers
// @access  Public
router.get('/:id/followers', asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }
  
  const followers = await User.find({ _id: { $in: user.followers } })
    .select('username profileImage bio');
  
  res.status(200).json({
    success: true,
    count: followers.length,
    data: followers
  });
}));

// @route   GET /api/users/:id/following
// @desc    Get users that a user is following
// @access  Public
router.get('/:id/following', asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }
  
  const following = await User.find({ _id: { $in: user.following } })
    .select('username profileImage bio');
  
  res.status(200).json({
    success: true,
    count: following.length,
    data: following
  });
}));

// Admin-specific routes

// @route   PUT /api/users/:id/suspend
// @desc    Suspend a user account
// @access  Private/Admin
router.put('/:id/suspend', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true, runValidators: true }
  ).select('-password');
  
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }
  
  // Also deactivate all their items
  await BabyItem.updateMany(
    { user: req.params.id },
    { status: 'inactive' }
  );
  
  res.status(200).json({
    success: true,
    data: user
  });
}));

// @route   PUT /api/users/:id/unsuspend
// @desc    Unsuspend a user account
// @access  Private/Admin
router.put('/:id/unsuspend', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: true },
    { new: true, runValidators: true }
  ).select('-password');
  
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: user
  });
}));

module.exports = router;