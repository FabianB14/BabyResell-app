const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Pin = require('../models/Pin');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  // Set up pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;
  
  // Execute query
  const total = await User.countDocuments();
  const users = await User.find()
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);
    
  res.status(200).json({
    success: true,
    count: users.length,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit)
    },
    data: users
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
  
  // Get user's pins
  const pins = await Pin.find({ user: req.params.id })
    .select('title thumbnail price condition')
    .sort({ createdAt: -1 })
    .limit(20);
  
  res.status(200).json({
    success: true,
    data: {
      user,
      pins
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
  
  // Get user's pins
  const pins = await Pin.find({ user: user._id })
    .select('title thumbnail price condition')
    .sort({ createdAt: -1 })
    .limit(20);
  
  res.status(200).json({
    success: true,
    data: {
      user,
      pins
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
  
  // Remove fields that shouldn't be updated
  const { password, isAdmin, ...updateData } = req.body;
  
  // Update user
  user = await User.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  }).select('-password');
  
  res.status(200).json({
    success: true,
    data: user
  });
}));

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }
  
  // Delete user's pins
  await Pin.deleteMany({ user: req.params.id });
  
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

module.exports = router;