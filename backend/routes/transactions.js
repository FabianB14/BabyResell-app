const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Pin = require('../models/Pin');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @route   POST /api/transactions
// @desc    Create a new transaction
// @access  Private
router.post('/', protect, asyncHandler(async (req, res, next) => {
  const { pinId, paymentMethod, shippingAddress } = req.body;
  
  // Get the pin
  const pin = await Pin.findById(pinId);
  
  if (!pin) {
    return next(new ErrorResponse(`Pin not found with id of ${pinId}`, 404));
  }
  
  // Check if pin is for sale
  if (!pin.isForSale) {
    return next(new ErrorResponse('This item is not for sale', 400));
  }
  
  // Check if buyer is not the seller
  if (pin.user.toString() === req.user.id) {
    return next(new ErrorResponse('You cannot buy your own item', 400));
  }
  
  // Calculate platform fee (5% of item price)
  const platformFee = Math.round(pin.price * 0.05 * 100) / 100;
  
  // Create transaction
  const transaction = await Transaction.create({
    buyer: req.user.id,
    seller: pin.user,
    pin: pin._id,
    amount: pin.price,
    platformFee,
    paymentMethod,
    shippingAddress,
    status: 'pending'
  });
  
  // Update pin status to 'pending'
  pin.status = 'pending';
  await pin.save();
  
  res.status(201).json({
    success: true,
    data: transaction
  });
}));

// @route   GET /api/transactions
// @desc    Get user's transactions (as buyer and seller)
// @access  Private
router.get('/', protect, asyncHandler(async (req, res, next) => {
  // Set up pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;
  
  // Build query - find transactions where user is buyer or seller
  const query = {
    $or: [
      { buyer: req.user.id },
      { seller: req.user.id }
    ]
  };
  
  // Filter by status if provided
  if (req.query.status) {
    query.status = req.query.status;
  }
  
  // Filter by role (buyer or seller)
  if (req.query.role === 'buyer') {
    query.$or = [{ buyer: req.user.id }];
  } else if (req.query.role === 'seller') {
    query.$or = [{ seller: req.user.id }];
  }
  
  // Execute query
  const total = await Transaction.countDocuments(query);
  const transactions = await Transaction.find(query)
    .populate('buyer', 'username profileImage')
    .populate('seller', 'username profileImage')
    .populate('pin', 'title thumbnail price')
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);
    
  res.status(200).json({
    success: true,
    count: transactions.length,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit)
    },
    data: transactions
  });
}));

// @route   GET /api/transactions/:id
// @desc    Get transaction by ID
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('buyer', 'username profileImage email')
    .populate('seller', 'username profileImage email')
    .populate('pin');
  
  if (!transaction) {
    return next(new ErrorResponse(`Transaction not found with id of ${req.params.id}`, 404));
  }
  
  // Check if user is buyer, seller, or admin
  if (
    transaction.buyer._id.toString() !== req.user.id &&
    transaction.seller._id.toString() !== req.user.id &&
    !req.user.isAdmin
  ) {
    return next(new ErrorResponse('Not authorized to access this transaction', 401));
  }
  
  res.status(200).json({
    success: true,
    data: transaction
  });
}));

// @route   PUT /api/transactions/:id
// @desc    Update transaction status
// @access  Private
router.put('/:id', protect, asyncHandler(async (req, res, next) => {
  const { status, trackingNumber, notes } = req.body;
  
  let transaction = await Transaction.findById(req.params.id);
  
  if (!transaction) {
    return next(new ErrorResponse(`Transaction not found with id of ${req.params.id}`, 404));
  }
  
  // Check if user is buyer, seller, or admin
  const isBuyer = transaction.buyer.toString() === req.user.id;
  const isSeller = transaction.seller.toString() === req.user.id;
  const isAdmin = req.user.isAdmin;
  
  if (!isBuyer && !isSeller && !isAdmin) {
    return next(new ErrorResponse('Not authorized to update this transaction', 401));
  }
  
  // Status change validations
  if (status) {
    // Seller can mark as 'shipped'
    if (status === 'shipped' && !isSeller && !isAdmin) {
      return next(new ErrorResponse('Only the seller can mark as shipped', 401));
    }
    
    // Buyer can mark as 'completed' or 'refunded'
    if ((status === 'completed' || status === 'refunded') && !isBuyer && !isAdmin) {
      return next(new ErrorResponse('Only the buyer can complete or request refund', 401));
    }
    
    // Only admin can mark as 'cancelled'
    if (status === 'cancelled' && !isAdmin) {
      return next(new ErrorResponse('Only an admin can cancel a transaction', 401));
    }
    
    // Update the pin status based on transaction status
    const pin = await Pin.findById(transaction.pin);
    
    if (status === 'completed') {
      pin.status = 'sold';
    } else if (status === 'cancelled' || status === 'refunded') {
      pin.status = 'active';
    }
    
    await pin.save();
  }
  
  // Update transaction
  transaction = await Transaction.findByIdAndUpdate(
    req.params.id,
    { 
      status: status || transaction.status,
      trackingNumber: trackingNumber || transaction.trackingNumber,
      notes: notes || transaction.notes
    },
    {
      new: true,
      runValidators: true
    }
  );
  
  // Populate the updated transaction
  await transaction.populate('buyer', 'username profileImage');
  await transaction.populate('seller', 'username profileImage');
  await transaction.populate('pin', 'title thumbnail price');
  
  res.status(200).json({
    success: true,
    data: transaction
  });
}));

// @route   GET /api/transactions/stats
// @desc    Get transaction statistics
// @access  Private/Admin
router.get('/stats/summary', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  // Get total sales
  const salesStats = await Transaction.aggregate([
    {
      $match: { status: 'completed' }
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$amount' },
        totalFees: { $sum: '$platformFee' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Get sales by month for the current year
  const currentYear = new Date().getFullYear();
  const monthlyStats = await Transaction.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: {
          $gte: new Date(`${currentYear}-01-01`),
          $lt: new Date(`${currentYear + 1}-01-01`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        totalSales: { $sum: '$amount' },
        totalFees: { $sum: '$platformFee' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
  
  // Get stats by status
  const statusStats = await Transaction.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      sales: salesStats.length > 0 ? salesStats[0] : { totalSales: 0, totalFees: 0, count: 0 },
      monthly: monthlyStats,
      status: statusStats
    }
  });
}));

module.exports = router;