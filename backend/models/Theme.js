const mongoose = require('mongoose');

const ThemeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a theme name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  displayName: {
    type: String,
    required: [true, 'Please add a display name'],
    trim: true,
    maxlength: [100, 'Display name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  colors: {
    primary: {
      type: String,
      required: [true, 'Primary color is required'],
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please add a valid hex color']
    },
    secondary: {
      type: String,
      required: [true, 'Secondary color is required'],
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please add a valid hex color']
    },
    accent: {
      type: String,
      required: [true, 'Accent color is required'],
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please add a valid hex color']
    },
    background: {
      type: String,
      required: [true, 'Background color is required'],
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please add a valid hex color']
    },
    cardBackground: {
      type: String,
      required: [true, 'Card background color is required'],
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please add a valid hex color']
    },
    text: {
      type: String,
      required: [true, 'Text color is required'],
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please add a valid hex color']
    },
    textSecondary: {
      type: String,
      required: [true, 'Secondary text color is required'],
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please add a valid hex color']
    }
  },
  
  // **GLOBAL ACTIVATION FIELDS**
  isActive: {
    type: Boolean,
    default: false,
    index: true  // Index for faster queries
  },
  
  // Track when and by whom the theme was activated
  activatedAt: {
    type: Date
  },
  activatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  
  // Theme type classification
  isSeasonal: {
    type: Boolean,
    default: false
  },
  isHoliday: {
    type: Boolean,
    default: false
  },
  isCustom: {
    type: Boolean,
    default: true
  },
  
  // Schedule for automatic activation (optional)
  scheduleStart: {
    type: Date
  },
  scheduleEnd: {
    type: Date
  },
  
  // Usage tracking
  timesActivated: {
    type: Number,
    default: 0
  },
  totalActiveTime: {
    type: Number, // in milliseconds
    default: 0
  },
  
  // Creator tracking
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Preview image (optional)
  previewImage: {
    type: String
  },
  
  // Tags for categorization
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// **IMPORTANT: Ensure only ONE theme is active at a time**
ThemeSchema.pre('save', async function(next) {
  // If this theme is being set as active
  if (this.isActive && this.isModified('isActive')) {
    // Deactivate all other themes
    await this.constructor.updateMany(
      { _id: { $ne: this._id } }, 
      { 
        isActive: false,
        $inc: { totalActiveTime: Date.now() - (this.activatedAt || Date.now()) }
      }
    );
    
    // Set activation timestamp
    this.activatedAt = new Date();
    this.timesActivated += 1;
  }
  
  next();
});

// Virtual for how long the theme has been active
ThemeSchema.virtual('activeTimeFormatted').get(function() {
  if (!this.isActive || !this.activatedAt) return null;
  
  const activeTime = Date.now() - this.activatedAt.getTime();
  const hours = Math.floor(activeTime / (1000 * 60 * 60));
  const minutes = Math.floor((activeTime % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

// Static method to get the current active theme
ThemeSchema.statics.getActiveTheme = function() {
  return this.findOne({ isActive: true }).populate('createdBy', 'username email');
};

// Static method to activate a theme globally
ThemeSchema.statics.activateTheme = async function(themeId, userId = null) {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      // Deactivate all themes
      await this.updateMany(
        {}, 
        { 
          isActive: false,
          $inc: { totalActiveTime: Date.now() - (Date.now()) }
        },
        { session }
      );
      
      // Activate the selected theme
      const result = await this.findByIdAndUpdate(
        themeId,
        {
          isActive: true,
          activatedAt: new Date(),
          activatedBy: userId,
          $inc: { timesActivated: 1 }
        },
        { new: true, session }
      );
      
      return result;
    });
  } finally {
    await session.endSession();
  }
};

// Index for faster active theme queries
ThemeSchema.index({ isActive: 1, activatedAt: -1 });
ThemeSchema.index({ isSeasonal: 1, isHoliday: 1 });
ThemeSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model('Theme', ThemeSchema);