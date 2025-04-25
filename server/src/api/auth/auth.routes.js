// src/api/auth/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const passport = require('passport');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected route
router.get(
  '/verify', 
  passport.authenticate('jwt', { session: false }), 
  authController.verify
);

module.exports = router;