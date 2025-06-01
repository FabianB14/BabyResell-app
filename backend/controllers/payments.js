
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Transaction = require('../models/Transaction');
const BabyItem = require('../models/BabyItem');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// Fee calculation function - CRITICAL FOR YOUR REVENUE!
const calculateFees = (itemPrice, isPremiumSeller = false) => {
  // Stripe charges 2.9% + $0.30 per transaction
  const stripeFee = (itemPrice * 0.029) + 0.30;
  
  // Your platform fee: 8% for regular sellers, 5% for premium sellers
  const platformFeePercentage = isPremiumSeller ? 0.05 : 0.08;
  const totalPlatformFee = itemPrice * platformFeePercentage;
  
  // Your net revenue after Stripe fees
  const yourNetRevenue = totalPlatformFee - stripeFee;
  
  // What the seller receives
  const sellerPayout = itemPrice - totalPlatformFee;
  
  return {
    itemPrice: Math.round(itemPrice * 100) / 100,
    stripeFee: Math.round(stripeFee * 100) / 100,
    platformFee: Math.round(totalPlatformFee * 100) / 100,
    platformFeePercentage: platformFeePercentage * 100,
    yourNetRevenue: Math.round(yourNetRevenue * 100) / 100,
    sellerPayout: Math.round(sellerPayout * 100) / 100
  };
};

// @desc    Create payment intent (holds funds)
// @route   POST /api/payments/create-intent
// @access  Private
exports.createPaymentIntent = asyncHandler(async (req, res, next) => {
  const { itemId, shippingAddress } = req.body;
  
  // Get item details
  const item = await BabyItem.findById(itemId).populate('user');
  
  if (!item) {
    return next(new ErrorResponse('Item not found', 404));
  }
  
  if (item.status !== 'active') {
    return next(new ErrorResponse('Item is no longer available', 400));
  }
  
  // Check if seller is premium member
  const seller = await User.findById(item.user._id);
  const isPremiumSeller = seller.subscriptionStatus === 'active';
  
  // Calculate all fees
  const fees = calculateFees(item.price, isPremiumSeller);
  
  // Add shipping cost if applicable
  const shippingCost = item.shippingOptions?.shipping ? 
    (item.shippingOptions.shippingCost || 0) : 0;
  
  // Total amount to charge buyer (in cents for Stripe)
  const totalAmount = Math.round((item.price + shippingCost) * 100);
  
  try {
    // Create payment intent with manual capture
    // This authorizes the payment but doesn't charge the card yet
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      payment_method_types: ['card'],
      capture_method: 'manual', // Important: This holds funds without charging
      metadata: {
        itemId: item._id.toString(),
        buyerId: req.user.id,
        sellerId: item.user._id.toString(),
        platformFee: Math.round(fees.platformFee * 100).toString(),
        yourNetRevenue: Math.round(fees.yourNetRevenue * 100).toString(),
        isPremiumSeller: isPremiumSeller.toString()
      },
      description: `Purchase of ${item.title}`,
      receipt_email: req.user.email,
      // Set up for later transfer to seller (requires Stripe Connect)
      // transfer_data: {
      //   amount: Math.round(fees.sellerPayout * 100),
      //   destination: seller.stripeAccountId,
      // },
    });
    
    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: totalAmount,
      breakdown: {
        itemPrice: item.price,
        platformFee: fees.platformFee,
        platformFeePercentage: fees.platformFeePercentage,
        shipping: shippingCost,
        total: (item.price + shippingCost),
        sellerWillReceive: fees.sellerPayout,
        yourRevenue: fees.yourNetRevenue,
        stripeFee: fees.stripeFee
      }
    });
  } catch (error) {
    console.error('Stripe error:', error);
    return next(new ErrorResponse('Payment processing failed', 500));
  }
});

// @desc    Create transaction after successful payment
// @route   POST /api/payments/create-transaction
// @access  Private
exports.createTransaction = asyncHandler(async (req, res, next) => {
  const { 
    pinId, 
    paymentIntentId, 
    paymentMethod, 
    shippingAddress 
  } = req.body;
  
  // Verify the payment intent
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  
  if (paymentIntent.status !== 'requires_capture') {
    return next(new ErrorResponse('Invalid payment status', 400));
  }
  
  // Get item and verify it's still available
  const item = await BabyItem.findById(pinId).populate('user');
  
  if (!item || item.status !== 'active') {
    // Cancel the payment intent if item is no longer available
    await stripe.paymentIntents.cancel(paymentIntentId);
    return next(new ErrorResponse('Item is no longer available', 400));
  }
  
  // Check if seller is premium
  const seller = await User.findById(item.user._id);
  const fees = calculateFees(item.price, seller.subscriptionStatus === 'active');
  
  // Create transaction record
  const transaction = await Transaction.create({
    buyer: req.user.id,
    seller: item.user._id,
    pin: pinId,
    amount: item.price,
    currency: 'USD',
    platformFee: fees.platformFee,
    platformFeePercentage: fees.platformFeePercentage,
    sellerPayout: fees.sellerPayout,
    yourNetRevenue: fees.yourNetRevenue,
    stripeFee: fees.stripeFee,
    status: 'payment_held', // New status for held payments
    paymentMethod: paymentMethod,
    paymentId: paymentIntentId,
    shippingAddress: shippingAddress,
    escrowStatus: 'held', // Track escrow status
    escrowReleaseDate: null, // Will be set when item is delivered
  });
  
  // Update item status
  item.status = 'pending';
  await item.save();
  
  // TODO: Send email notifications to buyer and seller
  // emailService.sendPurchaseConfirmation(buyer.email, item);
  // emailService.sendSaleNotification(seller.email, item);
  
  res.status(201).json({
    success: true,
    data: transaction
  });
});

// @desc    Confirm item delivery and release payment
// @route   POST /api/payments/confirm-delivery/:transactionId
// @access  Private (Buyer only)
exports.confirmDelivery = asyncHandler(async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.transactionId)
    .populate('seller');
  
  if (!transaction) {
    return next(new ErrorResponse('Transaction not found', 404));
  }
  
  // Verify the requester is the buyer
  if (transaction.buyer.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to confirm this delivery', 401));
  }
  
  if (transaction.status !== 'shipped') {
    return next(new ErrorResponse('Item has not been marked as shipped yet', 400));
  }
  
  try {
    // Capture the payment (charge the card)
    const paymentIntent = await stripe.paymentIntents.capture(transaction.paymentId);
    
    if (paymentIntent.status === 'succeeded') {
      // Update transaction
      transaction.status = 'completed';
      transaction.escrowStatus = 'released';
      transaction.escrowReleaseDate = Date.now();
      transaction.deliveryConfirmedAt = Date.now();
      await transaction.save();
      
      // Update item status
      await BabyItem.findByIdAndUpdate(transaction.pin, { status: 'sold' });
      
      // Enable rating for this transaction
      transaction.ratingEnabled = true;
      await transaction.save();
      
      // Create payout to seller if they have Stripe Connect
      if (transaction.seller.stripeAccountId) {
        await this.createSellerPayout(transaction);
      }
      
      // TODO: Send confirmation emails
      
      res.status(200).json({
        success: true,
        message: 'Delivery confirmed and payment released',
        data: transaction
      });
    } else {
      throw new Error('Payment capture failed');
    }
  } catch (error) {
    console.error('Payment capture error:', error);
    return next(new ErrorResponse('Failed to release payment', 500));
  }
});

// @desc    Create payout to seller
// @access  Private (Internal use)
exports.createSellerPayout = async (transaction) => {
  try {
    const transfer = await stripe.transfers.create({
      amount: Math.round(transaction.sellerPayout * 100), // Amount in cents
      currency: 'usd',
      destination: transaction.seller.stripeAccountId,
      transfer_group: `ORDER_${transaction._id}`,
      metadata: {
        transactionId: transaction._id.toString(),
        orderId: transaction._id.toString(),
        platformFee: transaction.platformFee.toString(),
        netRevenue: transaction.yourNetRevenue.toString()
      }
    });
    
    transaction.stripeTransferId = transfer.id;
    transaction.payoutStatus = 'completed';
    await transaction.save();
    
    return transfer;
  } catch (error) {
    console.error('Seller payout error:', error);
    transaction.payoutStatus = 'failed';
    transaction.payoutError = error.message;
    await transaction.save();
    throw error;
  }
};

// @desc    Mark item as shipped (Seller)
// @route   POST /api/payments/mark-shipped/:transactionId
// @access  Private (Seller only)
exports.markAsShipped = asyncHandler(async (req, res, next) => {
  const { trackingNumber, carrier } = req.body;
  const transaction = await Transaction.findById(req.params.transactionId);
  
  if (!transaction) {
    return next(new ErrorResponse('Transaction not found', 404));
  }
  
  // Verify the requester is the seller
  if (transaction.seller.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this transaction', 401));
  }
  
  if (transaction.status !== 'payment_held') {
    return next(new ErrorResponse('Invalid transaction status', 400));
  }
  
  // Update transaction
  transaction.status = 'shipped';
  transaction.trackingNumber = trackingNumber;
  transaction.carrier = carrier;
  transaction.shippedAt = Date.now();
  
  // Set auto-release date (3 days after shipping)
  transaction.autoReleaseDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  
  await transaction.save();
  
  // TODO: Send notification to buyer
  
  res.status(200).json({
    success: true,
    message: 'Item marked as shipped',
    data: transaction
  });
});

// @desc    Handle disputes
// @route   POST /api/payments/dispute/:transactionId
// @access  Private
exports.createDispute = asyncHandler(async (req, res, next) => {
  const { reason, description } = req.body;
  const transaction = await Transaction.findById(req.params.transactionId);
  
  if (!transaction) {
    return next(new ErrorResponse('Transaction not found', 404));
  }
  
  // Verify the requester is buyer or seller
  const isBuyer = transaction.buyer.toString() === req.user.id;
  const isSeller = transaction.seller.toString() === req.user.id;
  
  if (!isBuyer && !isSeller) {
    return next(new ErrorResponse('Not authorized to dispute this transaction', 401));
  }
  
  if (transaction.status !== 'shipped' && transaction.status !== 'payment_held') {
    return next(new ErrorResponse('Cannot dispute this transaction', 400));
  }
  
  // Create dispute
  transaction.dispute = {
    active: true,
    reason,
    description,
    createdBy: req.user.id,
    createdAt: Date.now()
  };
  transaction.status = 'disputed';
  
  await transaction.save();
  
  // TODO: Notify admin and other party
  
  res.status(200).json({
    success: true,
    message: 'Dispute created successfully',
    data: transaction
  });
});

// @desc    Auto-release payments after delivery timeout
// @route   This would be a scheduled job (cron)
exports.autoReleasePayments = asyncHandler(async () => {
  const overdueTransactions = await Transaction.find({
    status: 'shipped',
    autoReleaseDate: { $lte: new Date() },
    escrowStatus: 'held'
  }).populate('seller');
  
  for (const transaction of overdueTransactions) {
    try {
      // Capture the payment
      const paymentIntent = await stripe.paymentIntents.capture(transaction.paymentId);
      
      if (paymentIntent.status === 'succeeded') {
        transaction.status = 'completed';
        transaction.escrowStatus = 'auto_released';
        transaction.escrowReleaseDate = Date.now();
        transaction.ratingEnabled = true;
        await transaction.save();
        
        // Update item status
        await BabyItem.findByIdAndUpdate(transaction.pin, { status: 'sold' });
        
        // Create payout if seller has Stripe Connect
        if (transaction.seller.stripeAccountId) {
          await this.createSellerPayout(transaction);
        }
        
        console.log(`Auto-released payment for transaction ${transaction._id}`);
      }
    } catch (error) {
      console.error(`Failed to auto-release payment for transaction ${transaction._id}:`, error);
    }
  }
});

// @desc    Calculate and display fees before checkout
// @route   GET /api/payments/calculate-fees/:itemId
// @access  Public
exports.calculateFeesPreview = asyncHandler(async (req, res, next) => {
  const item = await BabyItem.findById(req.params.itemId).populate('user');
  
  if (!item) {
    return next(new ErrorResponse('Item not found', 404));
  }
  
  const seller = await User.findById(item.user._id);
  const isPremium = seller.subscriptionStatus === 'active';
  const fees = calculateFees(item.price, isPremium);
  
  res.status(200).json({
    success: true,
    fees: {
      itemPrice: item.price,
      platformFee: fees.platformFee,
      platformFeePercentage: fees.platformFeePercentage + '%',
      sellerReceives: fees.sellerPayout,
      buyerPays: item.price,
      platformRevenue: fees.yourNetRevenue,
      isPremiumSeller: isPremium,
      breakdown: {
        stripeFee: fees.stripeFee,
        yourProfit: fees.yourNetRevenue
      }
    }
  });
});

// @desc    Get platform revenue summary (Admin)
// @route   GET /api/payments/revenue-summary
// @access  Private/Admin
exports.getRevenueSummary = asyncHandler(async (req, res, next) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  
  // Today's revenue
  const todayRevenue = await Transaction.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: { $gte: today }
      }
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$yourNetRevenue' },
        grossRevenue: { $sum: '$platformFee' },
        stripeFees: { $sum: '$stripeFee' },
        transactions: { $sum: 1 }
      }
    }
  ]);
  
  // This month's revenue
  const monthRevenue = await Transaction.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: { $gte: thisMonth }
      }
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$yourNetRevenue' },
        grossRevenue: { $sum: '$platformFee' },
        stripeFees: { $sum: '$stripeFee' },
        transactions: { $sum: 1 }
      }
    }
  ]);
  
  res.status(200).json({
    success: true,
    revenue: {
      today: {
        net: todayRevenue[0]?.revenue || 0,
        gross: todayRevenue[0]?.grossRevenue || 0,
        stripeFees: todayRevenue[0]?.stripeFees || 0,
        transactions: todayRevenue[0]?.transactions || 0
      },
      thisMonth: {
        net: monthRevenue[0]?.revenue || 0,
        gross: monthRevenue[0]?.grossRevenue || 0,
        stripeFees: monthRevenue[0]?.stripeFees || 0,
        transactions: monthRevenue[0]?.transactions || 0
      }
    }
  });
});

module.exports = exports;