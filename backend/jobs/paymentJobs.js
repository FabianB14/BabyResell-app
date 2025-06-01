const cron = require('node-cron');
const { autoReleasePayments } = require('../controllers/payment');

// Run every hour to check for payments to auto-release
cron.schedule('0 * * * *', async () => {
  console.log('Running auto-release payment check...');
  await autoReleasePayments();
});