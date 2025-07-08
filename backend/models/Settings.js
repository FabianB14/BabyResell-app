const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  general: {
    siteName: { type: String, default: 'BabyResell' },
    siteDescription: { type: String, default: 'A marketplace for parents to buy and sell pre-loved baby items' },
    supportEmail: { type: String, default: 'support@babyresell.com' },
    contactPhone: { type: String, default: '' },
    address: { type: String, default: '' },
    timezone: { type: String, default: 'America/Los_Angeles' },
    language: { type: String, default: 'en' },
    maintenanceMode: { type: Boolean, default: false },
    socialMedia: {
      facebook: { type: String, default: '' },
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' }
    }
  },
  notifications: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    transactionAlerts: { type: Boolean, default: true },
    securityAlerts: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: false },
    newUserNotifications: { type: Boolean, default: true },
    lowStockAlerts: { type: Boolean, default: false },
    dailyReports: { type: Boolean, default: false },
    weeklyReports: { type: Boolean, default: true }
  },
  payments: {
    stripePublicKey: { type: String, default: '' },
    stripeSecretKey: { type: String, default: '' },
    paypalClientId: { type: String, default: '' },
    paypalSecretKey: { type: String, default: '' },
    transactionFeePercent: { type: Number, default: 8.0 },
    minimumPayout: { type: Number, default: 25.00 },
    payoutSchedule: { type: String, default: 'weekly' },
    currency: { type: String, default: 'USD' },
    taxEnabled: { type: Boolean, default: false },
    taxRate: { type: Number, default: 0 }
  },
  security: {
    twoFactorRequired: { type: Boolean, default: false },
    sessionTimeout: { type: Number, default: 30 },
    passwordMinLength: { type: Number, default: 8 },
    maxLoginAttempts: { type: Number, default: 5 },
    accountLockoutDuration: { type: Number, default: 15 },
    requireStrongPassword: { type: Boolean, default: true },
    requireEmailVerification: { type: Boolean, default: true },
    ipWhitelisting: { type: Boolean, default: false },
    allowedIPs: [{ type: String }],
    enableCaptcha: { type: Boolean, default: false }
  },
  content: {
    autoModeratePosts: { type: Boolean, default: true },
    requirePostApproval: { type: Boolean, default: false },
    maxImagesPerListing: { type: Number, default: 8 },
    maxDescriptionLength: { type: Number, default: 1000 },
    allowGuestBrowsing: { type: Boolean, default: true },
    minListingPrice: { type: Number, default: 1.00 },
    maxListingPrice: { type: Number, default: 9999.99 },
    enableCategories: { type: Boolean, default: true },
    enableTags: { type: Boolean, default: true },
    enableReviews: { type: Boolean, default: true },
    moderationKeywords: [{ type: String }]
  }
}, { timestamps: true });

// Ensure only one settings document exists
SettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', SettingsSchema);