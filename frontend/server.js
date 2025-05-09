const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Check if build directory exists
const buildPath = path.join(__dirname, 'build');
if (fs.existsSync(buildPath)) {
  console.log('Build directory exists at:', buildPath);
  
  // Serve static files from React build
  app.use(express.static(buildPath));
  
  // List files in build directory for debugging
  fs.readdir(buildPath, (err, files) => {
    if (err) {
      console.error('Error reading build directory:', err);
    } else {
      console.log('Files in build directory:', files);
    }
  });
  
  // Serve index.html for all routes (SPA)
  app.get('*', (req, res) => {
    console.log('Serving index.html for path:', req.path);
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  console.error('Build directory does not exist! Expected at:', buildPath);
  
  // Fallback route
  app.get('*', (req, res) => {
    res.send('Build directory not found. Please check server logs.');
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Current directory:', __dirname);
});