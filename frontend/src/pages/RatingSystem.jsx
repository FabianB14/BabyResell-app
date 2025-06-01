// routes/payments.js
const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  createTransaction,
  confirmDelivery,
  markAsShipped,
  createDispute,
  getPaymentMethods
} = require('../controllers/payment');
const { protect } = require('../middleware/auth');

// Payment routes
router.post('/create-intent', protect, createPaymentIntent);
router.post('/create-transaction', protect, createTransaction);
router.post('/confirm-delivery/:transactionId', protect, confirmDelivery);
router.post('/mark-shipped/:transactionId', protect, markAsShipped);
router.post('/dispute/:transactionId', protect, createDispute);
router.get('/methods', protect, getPaymentMethods);

module.exports = router;