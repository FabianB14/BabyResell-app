
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Transaction = require('../models/Transaction');
const asyncHandler = require('../middleware/async');

// @desc    Handle Stripe webhooks
// @route   POST /api/webhooks/stripe
// @access  Public (Stripe will call this)
exports.handleStripeWebhook = asyncHandler(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(
      req.body, // This should be the raw body
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      // Update your database
      await handlePaymentSuccess(paymentIntent);
      break;
      
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      await handlePaymentFailure(failedPayment);
      break;
      
    case 'charge.dispute.created':
      const dispute = event.data.object;
      console.log('Dispute created:', dispute.id);
      await handleDispute(dispute);
      break;
      
    case 'account.updated':
      // Stripe Connect account was updated
      const account = event.data.object;
      console.log('Connect account updated:', account.id);
      await handleAccountUpdate(account);
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
});

// Helper functions
async function handlePaymentSuccess(paymentIntent) {
  try {
    // Find the transaction by payment intent ID
    const transaction = await Transaction.findOne({ 
      paymentId: paymentIntent.id 
    });
    
    if (transaction) {
      // Log the successful payment
      console.log(`Payment confirmed for transaction ${transaction._id}`);
      
      // You could send a confirmation email here
      // await emailService.sendPaymentConfirmation(transaction);
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailure(paymentIntent) {
  try {
    const transaction = await Transaction.findOne({ 
      paymentId: paymentIntent.id 
    });
    
    if (transaction) {
      transaction.status = 'failed';
      await transaction.save();
      
      // Notify the buyer about the failed payment
      console.log(`Payment failed for transaction ${transaction._id}`);
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handleDispute(dispute) {
  try {
    // Find transaction by charge ID
    const chargeId = dispute.charge;
    const paymentIntent = await stripe.paymentIntents.list({
      limit: 1,
      charges: { data: [{ id: chargeId }] }
    });
    
    if (paymentIntent.data.length > 0) {
      const transaction = await Transaction.findOne({ 
        paymentId: paymentIntent.data[0].id 
      });
      
      if (transaction) {
        transaction.status = 'disputed';
        transaction.dispute = {
          active: true,
          reason: dispute.reason,
          stripeDisputeId: dispute.id,
          createdAt: new Date()
        };
        await transaction.save();
        
        console.log(`Dispute created for transaction ${transaction._id}`);
        // Notify admin about the dispute
      }
    }
  } catch (error) {
    console.error('Error handling dispute:', error);
  }
}

async function handleAccountUpdate(account) {
  try {
    const User = require('../models/User');
    const user = await User.findOne({ stripeAccountId: account.id });
    
    if (user) {
      user.stripeAccountStatus = {
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted
      };
      await user.save();
      
      console.log(`Stripe account updated for user ${user._id}`);
    }
  } catch (error) {
    console.error('Error handling account update:', error);
  }
}

module.exports = exports;