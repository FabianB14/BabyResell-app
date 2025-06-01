// Save this as backend/scripts/fixImageUrls.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars - fix the path
dotenv.config({ path: path.join(__dirname, '../config/config.env') });

const BabyItem = require('../models/BabyItem');
const Pin = require('../models/Pin');

// Connect to database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const fixImageUrls = async () => {
  try {
    console.log('Starting image URL migration...');
    
    // Get the correct base URL for your DigitalOcean Spaces
    const DO_SPACES_BASE_URL = process.env.DO_SPACES_CDN_URL || 
      `https://${process.env.DO_SPACES_BUCKET}.${process.env.DO_SPACES_REGION}.digitaloceanspaces.com`;
    
    // Fix BabyItem model
    const babyItems = await BabyItem.find({
      $or: [
        { 'images.fullSize': /^http:\/\/localhost/ },
        { 'images.thumbnail': /^http:\/\/localhost/ },
        { thumbnail: /^http:\/\/localhost/ },
        { image: /^http:\/\/localhost/ }
      ]
    });
    
    console.log(`Found ${babyItems.length} BabyItems with localhost URLs`);
    
    for (const item of babyItems) {
      let updated = false;
      
      // Fix images array
      if (item.images && item.images.length > 0) {
        item.images = item.images.map(img => {
          if (img.fullSize && img.fullSize.includes('localhost')) {
            const filename = img.fullSize.split('/').pop();
            img.fullSize = `${DO_SPACES_BASE_URL}/baby-items/full/${filename}`;
            updated = true;
          }
          if (img.thumbnail && img.thumbnail.includes('localhost')) {
            const filename = img.thumbnail.split('/').pop();
            img.thumbnail = `${DO_SPACES_BASE_URL}/baby-items/thumbnails/${filename}`;
            updated = true;
          }
          return img;
        });
      }
      
      // Fix direct thumbnail/image properties
      if (item.thumbnail && item.thumbnail.includes('localhost')) {
        const filename = item.thumbnail.split('/').pop();
        item.thumbnail = `${DO_SPACES_BASE_URL}/baby-items/thumbnails/${filename}`;
        updated = true;
      }
      
      if (item.image && item.image.includes('localhost')) {
        const filename = item.image.split('/').pop();
        item.image = `${DO_SPACES_BASE_URL}/baby-items/full/${filename}`;
        updated = true;
      }
      
      if (updated) {
        await item.save();
        console.log(`Updated BabyItem: ${item.title}`);
      }
    }
    
    // Fix Pin model (if you're using it)
    const pins = await Pin.find({
      $or: [
        { image: /^http:\/\/localhost/ },
        { thumbnail: /^http:\/\/localhost/ }
      ]
    });
    
    console.log(`Found ${pins.length} Pins with localhost URLs`);
    
    for (const pin of pins) {
      let updated = false;
      
      if (pin.image && pin.image.includes('localhost')) {
        const filename = pin.image.split('/').pop();
        pin.image = `${DO_SPACES_BASE_URL}/baby-items/full/${filename}`;
        updated = true;
      }
      
      if (pin.thumbnail && pin.thumbnail.includes('localhost')) {
        const filename = pin.thumbnail.split('/').pop();
        pin.thumbnail = `${DO_SPACES_BASE_URL}/baby-items/thumbnails/${filename}`;
        updated = true;
      }
      
      if (updated) {
        await pin.save();
        console.log(`Updated Pin: ${pin.title}`);
      }
    }
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// Run the migration
fixImageUrls();