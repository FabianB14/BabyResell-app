const { sendTestEmail } = require('../services/emailService');

// Update the test-email endpoint
router.post('/test-email', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  
  if (!email) {
    return next(new ErrorResponse('Please provide an email address', 400));
  }
  
  try {
    await sendTestEmail(email);
    
    res.status(200).json({
      success: true,
      message: `Test email sent to ${email}`
    });
  } catch (error) {
    console.error('Email test error:', error);
    return next(new ErrorResponse(`Failed to send test email: ${error.message}`, 500));
  }
}));