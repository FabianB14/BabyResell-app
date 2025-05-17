const express = require('express');
const router = express.Router();

// @route   GET /api/test
// @desc    Test API endpoint
// @access  Public
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is working correctly',
  });
});

// @route   POST /api/test/echo
// @desc    Echo back what is sent
// @access  Public
router.post('/echo', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Echo endpoint working',
    data: req.body
  });
});

module.exports = router;