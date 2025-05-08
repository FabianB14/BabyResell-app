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
  region: process.env.DO_SPACES_REGION || 'nyc3',
  endpoint: process.env.DO_SPACES_ENDPOINT,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET
  }
});

// Configure multer for temporary file storage
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
    const uniqueSuffix = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

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
const uploadToS3 = async (filePath, fileName, mimetype) => {
  const fileContent = fs.readFileSync(filePath);
  
  const params = {
    Bucket: process.env.DO_SPACES_BUCKET,
    Key: fileName,
    Body: fileContent,
    ContentType: mimetype,
    ACL: 'public-read'
  };
  
  await s3Client.send(new PutObjectCommand(params));
  
  // Return the URL of the uploaded file
  return `https://${process.env.DO_SPACES_BUCKET}.${process.env.DO_SPACES_REGION}.digitaloceanspaces.com/${fileName}`;
};

// @route   POST /api/upload/image
// @desc    Upload and process image files
// @access  Private
router.post('/image', protect, upload.single('image'), asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }

  const { width, height } = req.body;
  const isPrimary = req.body.isPrimary === 'true';
  
  // Process image with sharp
  // 1. Create full-size version (max width 1200px)
  const fullSizeBuffer = await sharp(req.file.path)
    .resize({
      width: 1200,
      height: 1200,
      fit: 'inside',
      withoutEnlargement: true
    })
    .toBuffer();
    
  // 2. Create thumbnail (300px width)
  const thumbnailBuffer = await sharp(req.file.path)
    .resize({
      width: 300,
      height: 300,
      fit: 'cover'
    })
    .toBuffer();
  
  // Generate unique filenames
  const fileNameBase = uuidv4();
  const ext = path.extname(req.file.originalname);
  const fullSizeFileName = `baby-items/full/${fileNameBase}${ext}`;
  const thumbnailFileName = `baby-items/thumbnails/${fileNameBase}${ext}`;
  
  // Create temporary files for the processed images
  const fullSizeTempPath = path.join(__dirname, `../temp/full-${fileNameBase}${ext}`);
  const thumbnailTempPath = path.join(__dirname, `../temp/thumb-${fileNameBase}${ext}`);
  
  fs.writeFileSync(fullSizeTempPath, fullSizeBuffer);
  fs.writeFileSync(thumbnailTempPath, thumbnailBuffer);
  
  // Upload processed images to S3
  const fullSizeUrl = await uploadToS3(
    fullSizeTempPath,
    fullSizeFileName,
    req.file.mimetype
  );
  
  const thumbnailUrl = await uploadToS3(
    thumbnailTempPath,
    thumbnailFileName,
    req.file.mimetype
  );
  
  // Clean up temporary files
  fs.unlinkSync(req.file.path);
  fs.unlinkSync(fullSizeTempPath);
  fs.unlinkSync(thumbnailTempPath);
  
  res.status(200).json({
    success: true,
    data: {
      fullSize: fullSizeUrl,
      thumbnail: thumbnailUrl,
      width: width || null,
      height: height || null,
      isPrimary
    }
  });
}));

// @route   POST /api/upload/multiple
// @desc    Upload multiple images
// @access  Private
router.post('/multiple', protect, upload.array('images', 5), asyncHandler(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new ErrorResponse('Please upload at least one image file', 400));
  }
  
  const uploadedImages = [];
  
  for (const file of req.files) {
    // Process image with sharp
    // 1. Create full size version (max width 1200px)
    const fullSizeBuffer = await sharp(file.path)
      .resize({
        width: 1200,
        height: 1200,
        fit: 'inside',
        withoutEnlargement: true
      })
      .toBuffer();
      
    // 2. Create thumbnail (300px)
    const thumbnailBuffer = await sharp(file.path)
      .resize({
        width: 300,
        height: 300,
        fit: 'cover'
      })
      .toBuffer();
      
    // Generate unique filenames
    const fileNameBase = uuidv4();
    const ext = path.extname(file.originalname);
    const fullSizeFileName = `baby-items/full/${fileNameBase}${ext}`;
    const thumbnailFileName = `baby-items/thumbnails/${fileNameBase}${ext}`;
    
    // Create temporary files for the processed images
    const fullSizeTempPath = path.join(__dirname, `../temp/full-${fileNameBase}${ext}`);
    const thumbnailTempPath = path.join(__dirname, `../temp/thumb-${fileNameBase}${ext}`);
    
    fs.writeFileSync(fullSizeTempPath, fullSizeBuffer);
    fs.writeFileSync(thumbnailTempPath, thumbnailBuffer);
    
    // Upload processed images to S3
    const fullSizeUrl = await uploadToS3(
      fullSizeTempPath,
      fullSizeFileName,
      file.mimetype
    );
    
    const thumbnailUrl = await uploadToS3(
      thumbnailTempPath,
      thumbnailFileName,
      file.mimetype
    );
    
    // Clean up temporary files
    fs.unlinkSync(file.path);
    fs.unlinkSync(fullSizeTempPath);
    fs.unlinkSync(thumbnailTempPath);
    
    uploadedImages.push({
      fullSize: fullSizeUrl,
      thumbnail: thumbnailUrl,
      isPrimary: uploadedImages.length === 0 // First image is primary
    });
  }
  
  res.status(200).json({
    success: true,
    count: uploadedImages.length,
    data: uploadedImages
  });
}));

// @route   DELETE /api/upload/image
// @desc    Delete an image from storage
// @access  Private
router.delete('/image', protect, asyncHandler(async (req, res, next) => {
  const { imageUrl } = req.body;
  
  if (!imageUrl) {
    return next(new ErrorResponse('Please provide an image URL', 400));
  }
  
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
}));

module.exports = router;