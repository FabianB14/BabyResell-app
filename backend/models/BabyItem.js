const mongoose = require('mongoose');

const BabyItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price must be positive']
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
    default: 'USD'
  },
  images: [
    {
      fullSize: {
        type: String,
        required: true
      },
      thumbnail: {
        type: String,
        required: true
      },
      isPrimary: {
        type: Boolean,
        default: false
      }
    }
  ],
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Clothes & Shoes',
      'Toys & Games',
      'Feeding',
      'Diapering',
      'Bathing & Skincare',
      'Health & Safety',
      'Nursery',
      'Strollers & Car Seats',
      'Carriers & Wraps',
      'Activity & Entertainment',
      'Books',
      'Other'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  ageGroup: {
    type: String,
    required: [true, 'Please select an age group'],
    enum: [
      'Newborn (0-3 months)',
      'Infant (3-12 months)',
      'Toddler (1-3 years)',
      'Preschool (3-5 years)',
      'All Ages'
    ]
  },
  condition: {
    type: String,
    required: [true, 'Please select a condition'],
    enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
    default: 'Good'
  },
  brand: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  size: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    enum: ['Boy', 'Girl', 'Unisex'],
    default: 'Unisex'
  },
  safetyNotes: {
    type: String,
    maxlength: [500, 'Safety notes cannot be more than 500 characters']
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['active', 'pending', 'sold', 'inactive'],
    default: 'active'
  },
  location: {
    type: String,
    trim: true
  },
  zipCode: {
    type: String,
    trim: true
  },
  shippingOptions: {
    localPickup: {
      type: Boolean,
      default: true
    },
    shipping: {
      type: Boolean,
      default: false
    },
    shippingCost: {
      type: Number,
      default: 0
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  saves: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create index for search
BabyItemSchema.index({ 
  title: 'text', 
  description: 'text', 
  brand: 'text',
  tags: 'text'
});

// Get thumbnail image virtual
BabyItemSchema.virtual('thumbnail').get(function() {
  const primaryImage = this.images.find(img => img.isPrimary);
  if (primaryImage) {
    return primaryImage.thumbnail;
  } else if (this.images.length > 0) {
    return this.images[0].thumbnail;
  }
  return null;
});

// Get main image virtual
BabyItemSchema.virtual('image').get(function() {
  const primaryImage = this.images.find(img => img.isPrimary);
  if (primaryImage) {
    return primaryImage.fullSize;
  } else if (this.images.length > 0) {
    return this.images[0].fullSize;
  }
  return null;
});

module.exports = mongoose.model('BabyItem', BabyItemSchema);