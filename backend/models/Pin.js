// models/Pin.js
const mongoose = require('mongoose');

const PinSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Pin title is required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 1000
  },
  image: {
    type: String,
    required: [true, 'Pin image is required']
  },
  thumbnail: {
    type: String, // Optimized smaller version for grid view
    required: [true, 'Pin thumbnail is required']
  },
  price: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'JPY'],
    default: 'USD'
  },
  category: {
    type: String,
    required: [true, 'Category is required']
  },
  tags: [{
    type: String,
    trim: true
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  saves: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  link: {
    type: String,
    trim: true
  },
  views: {
    type: Number,
    default: 0
  },
  isForSale: {
    type: Boolean,
    default: false
  },
  condition: {
    type: String,
    enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
    default: 'New'
  },
  location: {
    type: String
  },
  dimensions: {
    width: Number,
    height: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create indexes for search
PinSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Pin', PinSchema);