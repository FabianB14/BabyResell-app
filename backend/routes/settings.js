const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/async');

// @route   GET /api/admin/settings
// @desc    Get all settings
// @access  Private/Admin
router.get('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const settings = await Settings.getSettings();
  
  res.status(200).json({
    success: true,
    data: settings
  });
}));

// @route   PUT /api/admin/settings
// @desc    Update settings
// @access  Private/Admin
router.put('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  let settings = await Settings.getSettings();
  
  // Update each section if provided
  Object.keys(req.body).forEach(section => {
    if (settings[section]) {
      Object.assign(settings[section], req.body[section]);
    }
  });
  
  await settings.save();
  
  res.status(200).json({
    success: true,
    data: settings
  });
}));

// @route   POST /api/admin/settings/test-email
// @desc    Test email configuration
// @access  Private/Admin
router.post('/test-email', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  // Import your email service
  // const { sendTestEmail } = require('../services/emailService');
  
  try {
    // await sendTestEmail(email);
    
    // For now, just return success
    res.status(200).json({
      success: true,
      message: `Test email would be sent to ${email} (email service not implemented yet)`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to send test email'
    });
  }
}));

module.exports = router;