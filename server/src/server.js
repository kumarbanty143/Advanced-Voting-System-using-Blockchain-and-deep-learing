// server/src/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const passport = require('passport');
const db = require('./config/database');

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
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;