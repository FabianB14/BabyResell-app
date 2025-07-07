const mongoose = require('mongoose');

const BabyItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'Strollers',
      'Car Seats',
      'Furniture',
      'Clothing',
      'Feeding',
      'Carriers',
      'Toys',
      'Safety',
      'Bath & Care',
      'Nursery',
      'Diapering',
      'Other'
    ]
  },
  condition: {
    type: String,
    required: [true, 'Please specify condition'],
    enum: ['New', 'Like New', 'Excellent', 'Good', 'Fair', 'Poor'],
    default: 'Good'
  },
  ageGroup: {
    type: String,
    required: true,
    enum: [
      '0-3 months',
      '3-6 months',
      '6-12 months',
      '1-2 years',
      '2-3 years',
      '3-5 years',
      '5+ years',
      'All Ages'
    ],
    default: 'All Ages'
  },
  brand: {
    type: String,
    trim: true
  },
  // FIXED: Images schema to match your actual data structure
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
  thumbnail: {
    type: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    formattedAddress: String,
    city: String,
    state: String,
    zipcode: String,
    country: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'sold', 'pending', 'draft', 'rejected'],
    default: 'active'
  },
  active: {
    type: Boolean,
    default: true
  },
  approved: {
    type: Boolean,
    default: true
  },
  sold: {
    type: Boolean,
    default: false
  },
  soldDate: {
    type: Date
  },
  featured: {
    type: Boolean,
    default: false
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
  tags: [{
    type: String,
    trim: true
  }],
  size: {
    type: String
  },
  color: {
    type: String
  },
  material: {
    type: String
  },
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['lbs', 'kg', 'oz', 'g']
    }
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['in', 'cm', 'ft', 'm']
    }
  },
  quantity: {
    type: Number,
    default: 1,
    min: [1, 'Quantity must be at least 1']
  },
  shipping: {
    available: {
      type: Boolean,
      default: true
    },
    price: {
      type: Number,
      default: 0
    },
    estimatedDays: {
      type: Number,
      default: 5
    }
  },
  pickup: {
    available: {
      type: Boolean,
      default: true
    },
    preferredDays: [String],
    preferredTimes: [String]
  },
  negotiable: {
    type: Boolean,
    default: true
  },
  reported: {
    type: Boolean,
    default: false
  },
  reportCount: {
    type: Number,
    default: 0
  },
  reports: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    description: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
BabyItemSchema.index({ title: 'text', description: 'text', brand: 'text' });
BabyItemSchema.index({ category: 1, status: 1 });
BabyItemSchema.index({ user: 1, status: 1 });
BabyItemSchema.index({ price: 1 });
BabyItemSchema.index({ createdAt: -1 });
BabyItemSchema.index({ featured: 1, status: 1 });
BabyItemSchema.index({ 'location.coordinates': '2dsphere' });

// Virtual for like count
BabyItemSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for save count
BabyItemSchema.virtual('saveCount').get(function() {
  return this.saves ? this.saves.length : 0;
});

// Pre-save middleware to update status based on other fields
BabyItemSchema.pre('save', function(next) {
  // Auto-update status based on other fields
  if (this.sold && this.status !== 'sold') {
    this.status = 'sold';
    this.soldDate = new Date();
  } else if (!this.approved && this.status === 'active') {
    this.status = 'pending';
  } else if (!this.active && this.status === 'active') {
    this.status = 'inactive';
  }
  
  // Set thumbnail as first image thumbnail if not set
  if (!this.thumbnail && this.images && this.images.length > 0) {
    // Use the thumbnail URL from the first image object
    this.thumbnail = this.images[0].thumbnail || this.images[0].fullSize;
  }
  
  next();
});

// Method to mark item as sold
BabyItemSchema.methods.markAsSold = async function() {
  this.sold = true;
  this.status = 'sold';
  this.soldDate = new Date();
  this.active = false;
  return await this.save();
};

// Method to approve item
BabyItemSchema.methods.approve = async function() {
  this.approved = true;
  this.status = 'active';
  this.active = true;
  return await this.save();
};

// Method to reject item
BabyItemSchema.methods.reject = async function() {
  this.approved = false;
  this.status = 'rejected';
  this.active = false;
  return await this.save();
};

// Static method to get items by status
BabyItemSchema.statics.getByStatus = function(status, options = {}) {
  const query = this.find({ status });
  
  if (options.populate) {
    query.populate(options.populate);
  }
  
  if (options.sort) {
    query.sort(options.sort);
  }
  
  if (options.limit) {
    query.limit(options.limit);
  }
  
  return query;
};

// Static method to get featured items
BabyItemSchema.statics.getFeatured = function(limit = 10) {
  return this.find({ 
    featured: true, 
    status: 'active' 
  })
  .populate('user', 'username profileImage')
  .sort('-createdAt')
  .limit(limit);
};

module.exports = mongoose.model('BabyItem', BabyItemSchema);