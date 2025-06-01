// Save as backend/checkDependencies.js
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'config/config.env') });

console.log('Checking dependencies...\n');

// Check Sharp
try {
  const sharp = require('sharp');
  console.log('✓ Sharp is installed');
  // Check Sharp info (different method for different versions)
  sharp({
    create: {
      width: 48,
      height: 48,
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 0.5 }
    }
  })
  .png()
  .toBuffer()
  .then(() => {
    console.log('  Sharp is working correctly');
  })
  .catch(err => {
    console.log('  Sharp error:', err.message);
  });
} catch (err) {
  console.log('✗ Sharp is NOT installed or has issues');
  console.log('  Error:', err.message);
  console.log('\n  To fix: npm install sharp');
}

// Check AWS SDK
try {
  const { S3Client } = require('@aws-sdk/client-s3');
  console.log('✓ AWS SDK v3 is installed');
} catch (err) {
  console.log('✗ AWS SDK v3 is NOT installed');
  console.log('\n  To fix: npm install @aws-sdk/client-s3');
}

// Check Multer
try {
  const multer = require('multer');
  console.log('✓ Multer is installed');
} catch (err) {
  console.log('✗ Multer is NOT installed');
  console.log('\n  To fix: npm install multer');
}

// Check environment variables
console.log('\nEnvironment Variables:');
console.log('DO_SPACES_KEY:', process.env.DO_SPACES_KEY ? '✓ Set' : '✗ Not set');
console.log('DO_SPACES_SECRET:', process.env.DO_SPACES_SECRET ? '✓ Set (hidden)' : '✗ Not set');
console.log('DO_SPACES_BUCKET:', process.env.DO_SPACES_BUCKET || '✗ Not set');
console.log('DO_SPACES_REGION:', process.env.DO_SPACES_REGION || '✗ Not set');
console.log('DO_SPACES_ENDPOINT:', process.env.DO_SPACES_ENDPOINT || '✗ Not set');
console.log('MONGO_URI:', process.env.MONGO_URI ? '✓ Set (hidden)' : '✗ Not set');

console.log('\nConfig file location:', path.join(__dirname, 'config/config.env'));
const fs = require('fs');
if (fs.existsSync(path.join(__dirname, 'config/config.env'))) {
  console.log('✓ Config file exists');
} else {
  console.log('✗ Config file NOT FOUND');
  console.log('  Make sure config/config.env exists in your backend folder');
}