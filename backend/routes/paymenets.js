
const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  createTransaction,
  confirmDelivery,
  markAsShipped,
  createDispute,
  getPaymentMethods,
  calculateFeesPreview,
  getRevenueSummary
} = require('../controllers/payment');
const { protect, authorize } = require('../middleware/auth');

// Payment routes
router.post('/create-intent', protect, createPaymentIntent);
router.post('/create-transaction', protect, createTransaction);
router.post('/confirm-delivery/:transactionId', protect, confirmDelivery);
router.post('/mark-shipped/:transactionId', protect, markAsShipped);
router.post('/dispute/:transactionId', protect, createDispute);
router.get('/methods', protect, getPaymentMethods);

// NEW ROUTES FOR REVENUE TRACKING
router.get('/calculate-fees/:itemId', calculateFeesPreview);
router.get('/revenue-summary', protect, authorize('admin'), getRevenueSummary);

module.exports = router;