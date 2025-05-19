const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/async');

// Configure multer for basic file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../temp');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Simple upload route for testing
router.post('/image', protect, upload.single('image'), asyncHandler(async (req, res, next) => {
  console.log('=== Upload Route Hit ===');
  console.log('User:', req.user?.username);
  console.log('File:', req.file);
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }
    
    // For now, just return the local file path (we'll add cloud upload later)
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.com' 
      : `http://localhost:${process.env.PORT || 5000}`;
    
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
    
    console.log('File uploaded successfully:', fileUrl);
    
    res.status(200).json({
      success: true,
      data: {
        fullSize: fileUrl,
        thumbnail: fileUrl, // Same for now
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
    
  } catch (error) {
    console.error('Upload error details:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Upload failed'
    });
  }
}));

// Serve uploaded files statically (for testing)
router.use('/files', express.static(path.join(__dirname, '../temp')));

module.exports = router;