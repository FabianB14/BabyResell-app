const express = require('express');
const router = express.Router();
const BabyItem = require('../models/BabyItem');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @route   GET /api/baby-items/categories/all
// @desc    Get all unique categories
// @access  Public
router.get('/categories/all', asyncHandler(async (req, res, next) => {
  try {
    // Predefined categories
    const predefinedCategories = [
      'All Categories',
      'Strollers',
      'Car Seats',
      'Furniture',
      'Clothing',
      'Feeding',
      'Carriers',
      'Toys',
      'Safety',
      'Bath & Care',
      'Nursery',
      'Diapering'
    ];
    
    // Get unique categories from database
    const dbCategories = await BabyItem.distinct('category');
    
    // Combine and deduplicate
    const allCategories = [...new Set([...predefinedCategories, ...dbCategories])];
    
    res.status(200).json({
      success: true,
      count: allCategories.length,
      data: allCategories
    });
  } catch (error) {
    next(error);
  }
}));

// @route   GET /api/baby-items/age-groups/all
// @desc    Get all unique age groups
// @access  Public
router.get('/age-groups/all', asyncHandler(async (req, res, next) => {
  try {
    const predefinedAgeGroups = [
      'All Ages',
      '0-3 months',
      '3-6 months',
      '6-12 months',
      '1-2 years',
      '2-3 years',
      '3-5 years',
      '5+ years'
    ];
    
    const dbAgeGroups = await BabyItem.distinct('ageGroup');
    const allAgeGroups = [...new Set([...predefinedAgeGroups, ...dbAgeGroups])];
    
    res.status(200).json({
      success: true,
      count: allAgeGroups.length,
      data: allAgeGroups
    });
  } catch (error) {
    next(error);
  }
}));

// @route   POST /api/baby-items
// @desc    Create a new baby item listing
// @access  Private
router.post('/', protect, asyncHandler(async (req, res, next) => {
  try {
    // Add user to request body
    req.body.user = req.user.id;
    
    // Ensure proper structure for images
    if (req.body.images && typeof req.body.images === 'string') {
      req.body.images = [req.body.images];
    }
    
    // Create baby item
    const babyItem = await BabyItem.create(req.body);
    
    res.status(201).json({
      success: true,
      data: babyItem
    });
  } catch (error) {
    next(error);
  }
}));

// @route   GET /api/baby-items
// @desc    Get all baby items with filtering, sorting, pagination
// @access  Public
router.get('/', asyncHandler(async (req, res, next) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };
    
    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
    
    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
    
    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    
    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Parse the query string
    let query = JSON.parse(queryStr);
    
    // Add text search if search parameter exists
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { brand: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Handle category filter
    if (query.category && query.category === 'all') {
      delete query.category;
    }
    
    // Handle status filter for admin
    if (!query.status || query.status === 'all') {
      // For admin, show all items regardless of status
      delete query.status;
    }
    
    // Finding resource
    let babyItemQuery = BabyItem.find(query).populate({
      path: 'user',
      select: 'username profileImage location firstName lastName'
    });
    
    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      babyItemQuery = babyItemQuery.select(fields);
    }
    
    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      babyItemQuery = babyItemQuery.sort(sortBy);
    } else {
      babyItemQuery = babyItemQuery.sort('-createdAt');
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const total = await BabyItem.countDocuments(query);
    
    babyItemQuery = babyItemQuery.skip(startIndex).limit(limit);
    
    // Execute query
    const babyItems = await babyItemQuery;
    
    // Transform data for admin dashboard
    const transformedItems = babyItems.map(item => ({
      id: item._id,
      title: item.title,
      description: item.description,
      price: item.price,
      category: item.category,
      condition: item.condition,
      status: item.status || 'active',
      listedDate: item.createdAt,
      images: item.images || [],
      ageGroup: item.ageGroup,
      brand: item.brand,
      seller: item.user?.username || item.user?.firstName || 'Unknown',
      sellerId: item.user?._id,
      views: item.views || 0,
      saves: item.saves?.length || 0,
      featured: item.featured || false,
      thumbnail: item.images?.[0] || item.thumbnail || null
    }));
    
    res.status(200).json({
      success: true,
      count: transformedItems.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: transformedItems
    });
  } catch (error) {
    next(error);
  }
}));

// @route   GET /api/baby-items/:id
// @desc    Get single baby item
// @access  Public
router.get('/:id', asyncHandler(async (req, res, next) => {
  try {
    const babyItem = await BabyItem.findById(req.params.id)
      .populate('user', 'username profileImage location')
      .populate('likes', 'username profileImage')
      .populate('saves', 'username profileImage');
    
    if (!babyItem) {
      return res.status(404).json({
        success: false,
        message: 'Baby item not found'
      });
    }
    
    // Increment view count
    babyItem.views += 1;
    await babyItem.save();
    
    // Get similar items based on category and age group
    const similarItems = await BabyItem.find({
      _id: { $ne: babyItem._id },
      $or: [
        { category: babyItem.category },
        { ageGroup: babyItem.ageGroup }
      ],
      status: 'active'
    })
    .limit(6)
    .select('title thumbnail price condition');
    
    res.status(200).json({
      success: true,
      data: babyItem,
      similarItems
    });
  } catch (error) {
    next(error);
  }
}));

// @route   PUT /api/baby-items/:id
// @desc    Update baby item
// @access  Private
router.put('/:id', protect, asyncHandler(async (req, res, next) => {
  try {
    let babyItem = await BabyItem.findById(req.params.id);
    
    if (!babyItem) {
      return res.status(404).json({
        success: false,
        message: 'Baby item not found'
      });
    }
    
    // Make sure user is item owner or admin
    if (babyItem.user.toString() !== req.user.id && req.user.role !== 'admin' && !req.user.isAdmin) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this item'
      });
    }
    
    // Handle status updates for admin
    if (req.body.status && req.user.isAdmin) {
      babyItem.status = req.body.status;
    }
    
    // Handle featured updates for admin
    if (typeof req.body.featured !== 'undefined' && req.user.isAdmin) {
      babyItem.featured = req.body.featured;
    }
    
    // Handle approved updates for admin
    if (typeof req.body.approved !== 'undefined' && req.user.isAdmin) {
      babyItem.approved = req.body.approved;
      if (req.body.approved && !req.body.status) {
        babyItem.status = 'active';
      }
    }
    
    babyItem = await BabyItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: babyItem
    });
  } catch (error) {
    next(error);
  }
}));

// @route   DELETE /api/baby-items/:id
// @desc    Delete baby item
// @access  Private
router.delete('/:id', protect, asyncHandler(async (req, res, next) => {
  try {
    const babyItem = await BabyItem.findById(req.params.id);
    
    if (!babyItem) {
      return res.status(404).json({
        success: false,
        message: 'Baby item not found'
      });
    }
    
    // Make sure user is item owner or admin
    if (babyItem.user.toString() !== req.user.id && req.user.role !== 'admin' && !req.user.isAdmin) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this item'
      });
    }
    
    await babyItem.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
}));

// @route   POST /api/baby-items/:id/like
// @desc    Like a baby item
// @access  Private
router.post('/:id/like', protect, asyncHandler(async (req, res, next) => {
  try {
    const babyItem = await BabyItem.findById(req.params.id);
    
    if (!babyItem) {
      return res.status(404).json({
        success: false,
        message: 'Baby item not found'
      });
    }
    
    // Check if the item has already been liked
    if (babyItem.likes.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Baby item already liked'
      });
    }
    
    // Add user ID to likes array
    babyItem.likes.push(req.user.id);
    await babyItem.save();
    
    res.status(200).json({
      success: true,
      data: babyItem.likes
    });
  } catch (error) {
    next(error);
  }
}));

// @route   POST /api/baby-items/:id/unlike
// @desc    Unlike a baby item
// @access  Private
router.post('/:id/unlike', protect, asyncHandler(async (req, res, next) => {
  try {
    const babyItem = await BabyItem.findById(req.params.id);
    
    if (!babyItem) {
      return res.status(404).json({
        success: false,
        message: 'Baby item not found'
      });
    }
    
    // Check if the item has been liked
    if (!babyItem.likes.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Baby item has not yet been liked'
      });
    }
    
    // Remove the like
    babyItem.likes = babyItem.likes.filter(
      like => like.toString() !== req.user.id
    );
    
    await babyItem.save();
    
    res.status(200).json({
      success: true,
      data: babyItem.likes
    });
  } catch (error) {
    next(error);
  }
}));

// @route   POST /api/baby-items/:id/save
// @desc    Save a baby item to user's collection
// @access  Private
router.post('/:id/save', protect, asyncHandler(async (req, res, next) => {
  try {
    const babyItem = await BabyItem.findById(req.params.id);
    
    if (!babyItem) {
      return res.status(404).json({
        success: false,
        message: 'Baby item not found'
      });
    }
    
    // Check if already saved
    if (babyItem.saves.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Baby item already saved'
      });
    }
    
    // Add user ID to saves array
    babyItem.saves.push(req.user.id);
    await babyItem.save();
    
    // Also add to user's saved items
    const user = await User.findById(req.user.id);
    if (user.savedItems) {
      user.savedItems.push(babyItem._id);
      await user.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Baby item saved to collection'
    });
  } catch (error) {
    next(error);
  }
}));

// @route   POST /api/baby-items/:id/unsave
// @desc    Remove a baby item from user's collection
// @access  Private
router.post('/:id/unsave', protect, asyncHandler(async (req, res, next) => {
  try {
    const babyItem = await BabyItem.findById(req.params.id);
    
    if (!babyItem) {
      return res.status(404).json({
        success: false,
        message: 'Baby item not found'
      });
    }
    
    // Check if it was saved
    if (!babyItem.saves.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Baby item not saved'
      });
    }
    
    // Remove from baby item saves
    babyItem.saves = babyItem.saves.filter(
      save => save.toString() !== req.user.id
    );
    await babyItem.save();
    
    // Remove from user's saved items
    const user = await User.findById(req.user.id);
    if (user.savedItems) {
      user.savedItems = user.savedItems.filter(
        item => item.toString() !== babyItem._id.toString()
      );
      await user.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Baby item removed from collection'
    });
  } catch (error) {
    next(error);
  }
}));

module.exports = router;