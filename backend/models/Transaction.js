
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BabyItem',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'JPY'],
    default: 'USD'
  },
  platformFee: {
    type: Number,
    required: true
  },
  // NEW FIELDS FOR REVENUE TRACKING
  platformFeePercentage: {
    type: Number,
    required: true,
    default: 8 // 8% default fee
  },
  sellerPayout: {
    type: Number,
    required: true
  },
  yourNetRevenue: {
    type: Number,
    required: true
  },
  stripeFee: {
    type: Number,
    required: true
  },
  payoutStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  stripeTransferId: {
    type: String // Stripe transfer ID for tracking payouts
  },
  // END NEW FIELDS
  status: {
    type: String,
    enum: ['pending', 'payment_held', 'shipped', 'completed', 'cancelled', 'refunded', 'disputed'],
    default: 'pending'
  },
  escrowStatus: {
    type: String,
    enum: ['held', 'released', 'auto_released', 'refunded'],
    default: 'held'
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paymentId: {
    type: String, // Stripe payment intent ID
    required: true
  },
  shippingAddress: {
    name: { type: String, required: true },
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'US' },
    postalCode: { type: String, required: true }
  },
  trackingNumber: {
    type: String
  },
  carrier: {
    type: String,
    enum: ['usps', 'ups', 'fedex', 'dhl', 'other']
  },
  shippedAt: {
    type: Date
  },
  deliveryConfirmedAt: {
    type: Date
  },
  escrowReleaseDate: {
    type: Date
  },
  autoReleaseDate: {
    type: Date
  },
  notes: {
    type: String
  },
  dispute: {
    active: { type: Boolean, default: false },
    reason: {
      type: String,
      enum: ['not_as_described', 'not_received', 'damaged', 'other']
    },
    description: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: Date,
    resolvedAt: Date,
    resolution: String
  },
  // Rating system
  ratingEnabled: {
    type: Boolean,
    default: false
  },
  buyerRating: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: Date
  },
  sellerRating: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Indexes for better query performance
TransactionSchema.index({ buyer: 1, status: 1 });
TransactionSchema.index({ seller: 1, status: 1 });
TransactionSchema.index({ status: 1, autoReleaseDate: 1 });
TransactionSchema.index({ escrowStatus: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);