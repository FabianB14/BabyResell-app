// models/Theme.js
const mongoose = require('mongoose');

const ThemeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Theme name is required'],
    unique: true,
    trim: true
  },
  displayName: {
    type: String,
    required: [true, 'Display name is required']
  },
  description: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  colors: {
    primary: {
      type: String,
      required: true
    },
    secondary: {
      type: String,
      required: true
    },
    accent: {
      type: String,
      required: true
    },
    background: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    }
  },
  backgroundImage: {
    type: String
  },
  isHoliday: {
    type: Boolean,
    default: false
  },
  isSeasonal: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Theme', ThemeSchema);