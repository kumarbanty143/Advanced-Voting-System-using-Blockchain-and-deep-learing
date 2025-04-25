// server/src/api/voters/voters.routes.js
const express = require('express');
const passport = require('passport');
const multer = require('multer');
const votersController = require('./voters.controller');

const router = express.Router();

// File upload configuration
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Apply JWT authentication middleware
const auth = passport.authenticate('jwt', { session: false });

// Register face
router.post('/register-face', auth, upload.single('face'), votersController.registerFace);

// Verify face
router.post('/verify-face', auth, upload.single('face'), votersController.verifyFace);

// Get voter profile
router.get('/profile', auth, votersController.getProfile);

module.exports = router;