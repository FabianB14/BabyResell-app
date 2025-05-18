const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files
app.use(express.static(path.join(__dirname, 'build')));

// Add body parsing middleware
app.use(express.json());

// Proxy API requests to the backend
app.use('/api', async (req, res) => {
  try {
    const backendUrl = 'https://babyresell-app-backend-etytsdqqyq-sfo.a.run.app';
    const response = await axios({
      method: req.method,
      url: `${backendUrl}/api${req.url}`,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        // Forward auth header if present
        ...(req.headers.authorization && { 'Authorization': req.headers.authorization })
      }
    });
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('API proxy error:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { message: 'Internal Server Error' });
  }
});

// Serve the React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Serving static files from:', path.join(__dirname, 'build'));
});