// server/src/api/elections/elections.routes.js
const express = require('express');
const passport = require('passport');
const electionsController = require('./elections.controller');
const { isAdmin, isVerifiedVoter } = require('../../middleware/auth.middleware');

const router = express.Router();

// Apply JWT authentication middleware
const auth = passport.authenticate('jwt', { session: false });

// Public routes
router.get('/active', electionsController.getActiveElections);
router.get('/:electionId/results', electionsController.getElectionResults);

// Authenticated voter routes
router.get('/:electionId', auth, electionsController.getElectionById);

// Admin routes
router.post('/', auth, isAdmin, electionsController.createElection);
router.get('/', auth, isAdmin, electionsController.getAllElections);
router.patch('/:electionId/start', auth, isAdmin, electionsController.startElection);
router.patch('/:electionId/end', auth, isAdmin, electionsController.endElection);

module.exports = router;