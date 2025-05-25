const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// Configure S3 client for DigitalOcean Spaces
const s3Client = new S3Client({
  region: process.env.DO_SPACES_REGION || 'sfo2',
  endpoint: process.env.DO_SPACES_ENDPOINT || 'https://sfo2.digitaloceanspaces.com',
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET
  }
});

// Configure multer for memory storage instead of disk
const storage = multer.memoryStorage();

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ErrorResponse('Only image files are allowed!', 400), false);
  }
};

// Configure multer upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  }
});

// Helper function to upload to S3
const uploadToS3 = async (buffer, fileName, mimetype) => {
  const params = {
    Bucket: process.env.DO_SPACES_BUCKET,
    Key: fileName,
    Body: buffer,
    ContentType: mimetype,
    ACL: 'public-read'
  };
  
  await s3Client.send(new PutObjectCommand(params));
  
  // Return the correct CDN URL
  const baseUrl = process.env.DO_SPACES_CDN_URL || 
    `https://${process.env.DO_SPACES_BUCKET}.${process.env.DO_SPACES_REGION}.digitaloceanspaces.com`;
  
  return `${baseUrl}/${fileName}`;
};

// @route   POST /api/upload/image
// @desc    Upload and process image files
// @access  Private
router.post('/image', protect, upload.single('image'), asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }

  const isPrimary = req.body.isPrimary === 'true';
  
  try {
    // Process image with sharp
    // 1. Create full-size version (max width 1200px)
    const fullSizeBuffer = await sharp(req.file.buffer)
      .resize({
        width: 1200,
        height: 1200,
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toBuffer();
      
    // 2. Create thumbnail (300px width)
    const thumbnailBuffer = await sharp(req.file.buffer)
      .resize({
        width: 300,
        height: 300,
        fit: 'cover'
      })
      .jpeg({ quality: 80 })
      .toBuffer();
    
    // Generate unique filenames
    const fileNameBase = uuidv4();
    const ext = '.jpg'; // Always save as JPEG for consistency
    const fullSizeFileName = `baby-items/full/${fileNameBase}${ext}`;
    const thumbnailFileName = `baby-items/thumbnails/${fileNameBase}${ext}`;
    
    // Upload processed images to S3
    const fullSizeUrl = await uploadToS3(
      fullSizeBuffer,
      fullSizeFileName,
      'image/jpeg'
    );
    
    const thumbnailUrl = await uploadToS3(
      thumbnailBuffer,
      thumbnailFileName,
      'image/jpeg'
    );
    
    console.log('Image uploaded successfully:', {
      fullSize: fullSizeUrl,
      thumbnail: thumbnailUrl
    });
    
    res.status(200).json({
      success: true,
      data: {
        fullSize: fullSizeUrl,
        thumbnail: thumbnailUrl,
        isPrimary
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return next(new ErrorResponse('Failed to upload image', 500));
  }
}));

// @route   POST /api/upload/multiple
// @desc    Upload multiple images
// @access  Private
router.post('/multiple', protect, upload.array('images', 5), asyncHandler(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new ErrorResponse('Please upload at least one image file', 400));
  }
  
  const uploadedImages = [];
  
  try {
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      
      // Process image with sharp
      // 1. Create full size version (max width 1200px)
      const fullSizeBuffer = await sharp(file.buffer)
        .resize({
          width: 1200,
          height: 1200,
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toBuffer();
        
      // 2. Create thumbnail (300px)
      const thumbnailBuffer = await sharp(file.buffer)
        .resize({
          width: 300,
          height: 300,
          fit: 'cover'
        })
        .jpeg({ quality: 80 })
        .toBuffer();
        
      // Generate unique filenames
      const fileNameBase = uuidv4();
      const ext = '.jpg';
      const fullSizeFileName = `baby-items/full/${fileNameBase}${ext}`;
      const thumbnailFileName = `baby-items/thumbnails/${fileNameBase}${ext}`;
      
      // Upload processed images to S3
      const fullSizeUrl = await uploadToS3(
        fullSizeBuffer,
        fullSizeFileName,
        'image/jpeg'
      );
      
      const thumbnailUrl = await uploadToS3(
        thumbnailBuffer,
        thumbnailFileName,
        'image/jpeg'
      );
      
      uploadedImages.push({
        fullSize: fullSizeUrl,
        thumbnail: thumbnailUrl,
        isPrimary: i === 0 // First image is primary
      });
    }
    
    console.log('Multiple images uploaded:', uploadedImages);
    
    res.status(200).json({
      success: true,
      count: uploadedImages.length,
      data: uploadedImages
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    return next(new ErrorResponse('Failed to upload images', 500));
  }
}));

// @route   DELETE /api/upload/image
// @desc    Delete an image from storage
// @access  Private
router.delete('/image', protect, asyncHandler(async (req, res, next) => {
  const { imageUrl } = req.body;
  
  if (!imageUrl) {
    return next(new ErrorResponse('Please provide an image URL', 400));
  }
  
  try {
    // Extract the key from the URL
    const urlParts = new URL(imageUrl);
    const key = urlParts.pathname.substring(1); // Remove leading slash
    
    // Delete from S3
    const params = {
      Bucket: process.env.DO_SPACES_BUCKET,
      Key: key
    };
    
    await s3Client.send(new DeleteObjectCommand(params));
    
    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    return next(new ErrorResponse('Failed to delete image', 500));
  }
}));

module.exports = router;