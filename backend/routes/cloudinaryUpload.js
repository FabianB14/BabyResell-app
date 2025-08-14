const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { protect } = require('../middleware/auth');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'babyresell', // Folder in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' }, // Max size
      { quality: 'auto' }, // Auto quality
      { fetch_format: 'auto' } // Auto format (WebP for Chrome, etc.)
    ]
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Upload single image
router.post('/image', protect, upload.single('image'), async (req, res) => {
  try {
    // Generate thumbnail URL using Cloudinary transformations
    const thumbnailUrl = req.file.path.replace(
      '/upload/',
      '/upload/w_300,h_300,c_fill,q_auto,f_auto/'
    );

    res.json({
      success: true,
      data: {
        fullSize: req.file.path,
        thumbnail: thumbnailUrl,
        publicId: req.file.filename // For deletion
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Upload multiple images
router.post('/images', protect, upload.array('images', 10), async (req, res) => {
  try {
    const images = req.files.map(file => ({
      fullSize: file.path,
      thumbnail: file.path.replace(
        '/upload/',
        '/upload/w_300,h_300,c_fill,q_auto,f_auto/'
      ),
      publicId: file.filename
    }));

    res.json({
      success: true,
      count: images.length,
      data: images
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Delete image
router.delete('/image/:publicId', protect, async (req, res) => {
  try {
    await cloudinary.uploader.destroy(req.params.publicId);
    res.json({
      success: true,
      message: 'Image deleted'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;