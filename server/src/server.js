// server/src/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const passport = require('passport');
const path = require('path');
const http = require('http');
const net = require('net');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./api/auth/auth.routes');
const voterRoutes = require('./api/voters/voters.routes');
const electionRoutes = require('./api/elections/elections.routes');
const candidateRoutes = require('./api/candidates/candidates.routes');
const voteRoutes = require('./api/votes/votes.routes');
const adminRoutes = require('./api/admin/admin.routes');

// Import middleware
const errorHandler = require('./middleware/error.middleware');

// Initialize Express app
const app = express();

// Function to find an available port
const findAvailablePort = (startPort, callback) => {
  const server = net.createServer();
  
  // Try to bind to the port
  server.listen(startPort, () => {
    // Port is available, close server and return the port
    server.close(() => {
      callback(null, startPort);
    });
  });
  
  // Handle error - port is in use
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      // Try the next port
      findAvailablePort(startPort + 1, callback);
    } else {
      // Other error
      callback(err);
    }
  });
};

// CORS Configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin'],
  exposedHeaders: ['Access-Control-Allow-Origin'],
  credentials: true,
  optionsSuccessStatus: 204
}));

// Pre-flight requests handler
app.options('*', cors());

// Security middleware with adjusted settings for development
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'unsafe-none' },
  contentSecurityPolicy: false
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the models directory
app.use('/models', express.static(path.join(__dirname, '../models')));

// Initialize Passport
app.use(passport.initialize());
require('./config/passport')(passport);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/voters', voterRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/admin', adminRoutes);

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server with dynamic port finding
const PORT = process.env.PORT || 5001; // Changed from 5000 to 5001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;