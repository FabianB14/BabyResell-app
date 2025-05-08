const express = require('express');
const router = express.Router();
const Pin = require('../models/Pin');
const User = require('../models/User');
const Comment = require('../models/Comment');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @route   POST /api/pins
// @desc    Create a new pin
// @access  Private
router.post('/', protect, asyncHandler(async (req, res, next) => {
  const { title, description, image, thumbnail, category, tags, price, isForSale, condition, link, dimensions } = req.body;
  
  // Create pin
  const pin = await Pin.create({
    title,
    description,
    image,
    thumbnail,
    category,
    tags: tags || [],
    user: req.user.id,
    price: price || 0,
    isForSale: isForSale || false,
    condition: condition || 'New',
    link,
    dimensions: dimensions || { width: 0, height: 0 }
  });
  
  res.status(201).json({
    success: true,
    data: pin
  });
}));

// @route   GET /api/pins
// @desc    Get all pins (with pagination, filtering, sorting)
// @access  Public
router.get('/', asyncHandler(async (req, res, next) => {
  // Set up pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;
  
  // Build query
  let query = {};
  
  // Filter by category
  if (req.query.category) {
    query.category = req.query.category;
  }
  
  // Filter by tags
  if (req.query.tag) {
    query.tags = req.query.tag;
  }
  
  // Filter by user
  if (req.query.user) {
    query.user = req.query.user;
  }
  
  // Filter by price range
  if (req.query.minPrice && req.query.maxPrice) {
    query.price = { $gte: parseInt(req.query.minPrice), $lte: parseInt(req.query.maxPrice) };
  } else if (req.query.minPrice) {
    query.price = { $gte: parseInt(req.query.minPrice) };
  } else if (req.query.maxPrice) {
    query.price = { $lte: parseInt(req.query.maxPrice) };
  }
  
  // Filter by condition
  if (req.query.condition) {
    query.condition = req.query.condition;
  }
  
  // Filter by for sale only
  if (req.query.forSale === 'true') {
    query.isForSale = true;
  }
  
  // Search by text
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }
  
  // Build sort object
  let sort = {};
  if (req.query.sort) {
    const sortField = req.query.sort.startsWith('-') 
      ? req.query.sort.substring(1) 
      : req.query.sort;
    
    const sortOrder = req.query.sort.startsWith('-') ? -1 : 1;
    sort[sortField] = sortOrder;
  } else {
    // Default sort by newest
    sort = { createdAt: -1 };
  }
  
  // Execute query
  const total = await Pin.countDocuments(query);
  const pins = await Pin.find(query)
    .populate('user', 'username profileImage')
    .sort(sort)
    .skip(startIndex)
    .limit(limit);
    
  res.status(200).json({
    success: true,
    count: pins.length,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit)
    },
    data: pins
  });
}));

// @route   GET /api/pins/:id
// @desc    Get pin by ID
// @access  Public
router.get('/:id', asyncHandler(async (req, res, next) => {
  const pin = await Pin.findById(req.params.id)
    .populate('user', 'username profileImage')
    .populate('likes', 'username profileImage')
    .populate('saves', 'username profileImage')
    .populate({
      path: 'comments',
      populate: {
        path: 'user',
        select: 'username profileImage'
      }
    });
  
  if (!pin) {
    return next(new ErrorResponse(`Pin not found with id of ${req.params.id}`, 404));
  }
  
  // Increment view count
  pin.views += 1;
  await pin.save();
  
  // Get similar pins based on tags or category
  const similarPins = await Pin.find({
    _id: { $ne: pin._id },
    $or: [
      { tags: { $in: pin.tags } },
      { category: pin.category }
    ]
  })
  .select('title thumbnail price condition')
  .limit(6);
  
  res.status(200).json({
    success: true,
    data: pin,
    similarPins
  });
}));

// @route   PUT /api/pins/:id
// @desc    Update pin
// @access  Private
router.put('/:id', protect, asyncHandler(async (req, res, next) => {
  let pin = await Pin.findById(req.params.id);
  
  if (!pin) {
    return next(new ErrorResponse(`Pin not found with id of ${req.params.id}`, 404));
  }
  
  // Make sure user is pin owner or admin
  if (pin.user.toString() !== req.user.id && req.user.isAdmin !== true) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this pin`, 401));
  }
  
  pin = await Pin.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: pin
  });
}));

// @route   DELETE /api/pins/:id
// @desc    Delete pin
// @access  Private
router.delete('/:id', protect, asyncHandler(async (req, res, next) => {
  const pin = await Pin.findById(req.params.id);
  
  if (!pin) {
    return next(new ErrorResponse(`Pin not found with id of ${req.params.id}`, 404));
  }
  
  // Make sure user is pin owner or admin
  if (pin.user.toString() !== req.user.id && req.user.isAdmin !== true) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this pin`, 401));
  }
  
  await pin.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
}));

// @route   POST /api/pins/:id/like
// @desc    Like a pin
// @access  Private
router.post('/:id/like', protect, asyncHandler(async (req, res, next) => {
  const pin = await Pin.findById(req.params.id);
  
  if (!pin) {
    return next(new ErrorResponse(`Pin not found with id of ${req.params.id}`, 404));
  }
  
  // Check if pin already liked
  if (pin.likes.includes(req.user.id)) {
    return next(new ErrorResponse('Pin already liked', 400));
  }
  
  pin.likes.push(req.user.id);
  await pin.save();
  
  res.status(200).json({
    success: true,
    data: pin.likes
  });
}));

// @route   POST /api/pins/:id/unlike
// @desc    Unlike a pin
// @access  Private
router.post('/:id/unlike', protect, asyncHandler(async (req, res, next) => {
  const pin = await Pin.findById(req.params.id);
  
  if (!pin) {
    return next(new ErrorResponse(`Pin not found with id of ${req.params.id}`, 404));
  }
  
  // Check if pin is not yet liked
  if (!pin.likes.includes(req.user.id)) {
    return next(new ErrorResponse('Pin not yet liked', 400));
  }
  
  // Remove like
  pin.likes = pin.likes.filter(
    like => like.toString() !== req.user.id
  );
  
  await pin.save();
  
  res.status(200).json({
    success: true,
    data: pin.likes
  });
}));

// @route   POST /api/pins/:id/save
// @desc    Save a pin to user's collection
// @access  Private
router.post('/:id/save', protect, asyncHandler(async (req, res, next) => {
  const pin = await Pin.findById(req.params.id);
  
  if (!pin) {
    return next(new ErrorResponse(`Pin not found with id of ${req.params.id}`, 404));
  }
  
  // Check if already saved
  if (pin.saves.includes(req.user.id)) {
    return next(new ErrorResponse('Pin already saved', 400));
  }
  
  // Add user ID to pin's saves array
  pin.saves.push(req.user.id);
  await pin.save();
  
  // Add pin to user's savedPins array
  const user = await User.findById(req.user.id);
  user.savedPins.push(pin._id);
  await user.save();
  
  res.status(200).json({
    success: true,
    data: pin.saves
  });
}));

// @route   POST /api/pins/:id/unsave
// @desc    Remove a pin from user's collection
// @access  Private
router.post('/:id/unsave', protect, asyncHandler(async (req, res, next) => {
  const pin = await Pin.findById(req.params.id);
  
  if (!pin) {
    return next(new ErrorResponse(`Pin not found with id of ${req.params.id}`, 404));
  }
  
  // Check if already saved
  if (!pin.saves.includes(req.user.id)) {
    return next(new ErrorResponse('Pin not saved', 400));
  }
  
  // Remove user ID from pin's saves array
  pin.saves = pin.saves.filter(
    save => save.toString() !== req.user.id
  );
  await pin.save();
  
  // Remove pin from user's savedPins array
  const user = await User.findById(req.user.id);
  user.savedPins = user.savedPins.filter(
    savedPin => savedPin.toString() !== pin._id.toString()
  );
  await user.save();
  
  res.status(200).json({
    success: true,
    data: pin.saves
  });
}));

// @route   POST /api/pins/:id/comment
// @desc    Add comment to a pin
// @access  Private
router.post('/:id/comment', protect, asyncHandler(async (req, res, next) => {
  const pin = await Pin.findById(req.params.id);
  
  if (!pin) {
    return next(new ErrorResponse(`Pin not found with id of ${req.params.id}`, 404));
  }
  
  const { text } = req.body;
  
  if (!text) {
    return next(new ErrorResponse('Comment text is required', 400));
  }
  
  // Create comment
  const comment = await Comment.create({
    text,
    user: req.user.id,
    pin: pin._id
  });
  
  // Add comment to pin's comments array
  pin.comments.push(comment._id);
  await pin.save();
  
  // Populate comment with user data
  await comment.populate('user', 'username profileImage');
  
  res.status(201).json({
    success: true,
    data: comment
  });
}));

// @route   DELETE /api/pins/:pinId/comments/:commentId
// @desc    Delete comment
// @access  Private
router.delete('/:pinId/comments/:commentId', protect, asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.commentId);
  
  if (!comment) {
    return next(new ErrorResponse(`Comment not found with id of ${req.params.commentId}`, 404));
  }
  
  // Make sure comment belongs to pin
  if (comment.pin.toString() !== req.params.pinId) {
    return next(new ErrorResponse('Comment does not belong to this pin', 400));
  }
  
  // Make sure user is comment owner or admin
  if (comment.user.toString() !== req.user.id && req.user.isAdmin !== true) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this comment`, 401));
  }
  
  // Remove comment from pin's comments array
  const pin = await Pin.findById(req.params.pinId);
  pin.comments = pin.comments.filter(
    commentId => commentId.toString() !== req.params.commentId
  );
  await pin.save();
  
  // Delete comment
  await comment.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
}));

// @route   GET /api/pins/categories
// @desc    Get all unique categories
// @access  Public
router.get('/categories/all', asyncHandler(async (req, res, next) => {
  const categories = await Pin.distinct('category');
  
  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
}));

// @route   GET /api/pins/tags
// @desc    Get all unique tags
// @access  Public
router.get('/tags/all', asyncHandler(async (req, res, next) => {
  const tags = await Pin.distinct('tags');
  
  res.status(200).json({
    success: true,
    count: tags.length,
    data: tags
  });
}));

module.exports = router;