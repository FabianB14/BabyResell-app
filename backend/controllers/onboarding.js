
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create Stripe Connect account for seller
// @route   POST /api/onboarding/create-account
// @access  Private
exports.createStripeAccount = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  // Check if user already has a Stripe account
  if (user.stripeAccountId) {
    return next(new ErrorResponse('Stripe account already exists', 400));
  }
  
  try {
    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express', // Express accounts are easiest to implement
      country: 'US',
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        userId: user._id.toString()
      }
    });
    
    // Save Stripe account ID to user
    user.stripeAccountId = account.id;
    await user.save();
    
    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONTEND_URL}/seller/onboarding/refresh`,
      return_url: `${process.env.FRONTEND_URL}/seller/onboarding/complete`,
      type: 'account_onboarding',
    });
    
    res.status(200).json({
      success: true,
      url: accountLink.url
    });
  } catch (error) {
    console.error('Stripe account creation error:', error);
    return next(new ErrorResponse('Failed to create seller account', 500));
  }
});

// @desc    Check Stripe account status
// @route   GET /api/onboarding/account-status
// @access  Private
exports.getAccountStatus = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user.stripeAccountId) {
    return res.status(200).json({
      success: true,
      hasAccount: false,
      isComplete: false
    });
  }
  
  try {
    const account = await stripe.accounts.retrieve(user.stripeAccountId);
    
    res.status(200).json({
      success: true,
      hasAccount: true,
      isComplete: account.details_submitted,
      payoutsEnabled: account.payouts_enabled,
      chargesEnabled: account.charges_enabled,
      requirements: account.requirements
    });
  } catch (error) {
    console.error('Stripe account status error:', error);
    return next(new ErrorResponse('Failed to get account status', 500));
  }
});

// @desc    Create payout to seller
// @route   POST /api/onboarding/payout
// @access  Private (system only)
exports.createPayout = asyncHandler(async (transaction) => {
  const seller = await User.findById(transaction.seller);
  
  if (!seller.stripeAccountId) {
    throw new Error('Seller does not have a Stripe account');
  }
  
  try {
    // Calculate amounts
    const totalAmount = transaction.amount * 100; // Convert to cents
    const platformFee = Math.round(totalAmount * 0.08); // 8% platform fee
    const sellerAmount = totalAmount - platformFee;
    
    // Create transfer to seller's Stripe account
    const transfer = await stripe.transfers.create({
      amount: sellerAmount,
      currency: 'usd',
      destination: seller.stripeAccountId,
      transfer_group: `ORDER_${transaction._id}`,
      metadata: {
        transactionId: transaction._id.toString(),
        orderId: transaction._id.toString()
      }
    });
    
    // Update transaction with transfer ID
    transaction.stripeTransferId = transfer.id;
    transaction.sellerPayoutAmount = sellerAmount / 100;
    transaction.platformFeeAmount = platformFee / 100;
    await transaction.save();
    
    return transfer;
  } catch (error) {
    console.error('Payout creation error:', error);
    throw error;
  }
});

// @desc    Get seller earnings dashboard
// @route   GET /api/onboarding/earnings
// @access  Private
exports.getEarnings = asyncHandler(async (req, res, next) => {
  const Transaction = require('../models/Transaction');
  
  // Get all completed transactions for this seller
  const transactions = await Transaction.find({
    seller: req.user.id,
    status: 'completed'
  }).sort('-createdAt');
  
  // Calculate totals
  const totals = transactions.reduce((acc, trans) => {
    acc.totalSales += trans.amount;
    acc.totalFees += trans.platformFee || (trans.amount * 0.08);
    acc.netEarnings += trans.amount - (trans.platformFee || (trans.amount * 0.08));
    return acc;
  }, { totalSales: 0, totalFees: 0, netEarnings: 0 });
  
  // Get pending payouts
  const pendingTransactions = await Transaction.find({
    seller: req.user.id,
    status: { $in: ['payment_held', 'shipped'] }
  });
  
  const pendingAmount = pendingTransactions.reduce((sum, trans) => {
    return sum + (trans.amount - (trans.platformFee || (trans.amount * 0.08)));
  }, 0);
  
  res.status(200).json({
    success: true,
    earnings: {
      lifetime: {
        sales: totals.totalSales.toFixed(2),
        fees: totals.totalFees.toFixed(2),
        net: totals.netEarnings.toFixed(2),
        transactionCount: transactions.length
      },
      pending: {
        amount: pendingAmount.toFixed(2),
        count: pendingTransactions.length
      },
      recent: transactions.slice(0, 10).map(t => ({
        id: t._id,
        date: t.createdAt,
        itemTitle: t.pin.title,
        amount: t.amount,
        fee: t.platformFee || (t.amount * 0.08),
        net: t.amount - (t.platformFee || (t.amount * 0.08)),
        status: t.status
      }))
    }
  });
});

module.exports = exports;