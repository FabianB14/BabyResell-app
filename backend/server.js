const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const path = require('path');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

// Initialize app - MOVED UP
const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'https://babyresell-62jr6.ondigitalocean.app',
    'http://localhost:3000',
    'http://localhost:8080'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS - NOW app EXISTS
app.use(cors(corsOptions));

// Add CORS debugging middleware
app.use((req, res, next) => {
  console.log(`[CORS] Request from: ${req.headers.origin} to ${req.method} ${req.originalUrl}`);
  next();
});

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Configure Helmet for security but with looser restrictions
app.use(
  helmet({
    contentSecurityPolicy: false, // This can sometimes cause issues with frontend
    crossOriginEmbedderPolicy: false,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Prevent NoSQL Injection & XSS attacks
app.use(mongoSanitize());
app.use(xss());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.originalUrl}`);
  next();
});

// Adding a simple route for the root path
app.get('/', (req, res) => {
  res.json({ message: 'BabyResell API is running' });
});

// Add a test endpoint at /api
app.get('/api', (req, res) => {
  res.json({ message: 'API endpoint is working' });
});

// Health check endpoint for DigitalOcean
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Define API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/pins', require('./routes/pins'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/baby-items', require('./routes/babyItems'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/themes', require('./routes/themes'));
app.use('/api/messages', require('./routes/messages'));

// Error handler middleware
app.use(errorHandler);

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('frontend/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});