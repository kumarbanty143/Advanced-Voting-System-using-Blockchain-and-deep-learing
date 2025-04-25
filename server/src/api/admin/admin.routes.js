// server/src/api/admin/admin.routes.js
const express = require('express');
const passport = require('passport');
const adminController = require('./admin.controller');
const { isAdmin } = require('../../middleware/auth.middleware');

const router = express.Router();

// Apply JWT authentication and admin role middleware
const auth = passport.authenticate('jwt', { session: false });

// Get all voters
router.get('/voters', auth, isAdmin, adminController.getAllVoters);

// Verify a voter
router.patch('/voters/:voterId/verify', auth, isAdmin, adminController.verifyVoter);

// Delete a voter
router.delete('/voters/:voterId', auth, isAdmin, adminController.deleteVoter);

// Get election statistics
router.get('/stats', auth, isAdmin, adminController.getElectionStats);

module.exports = router;