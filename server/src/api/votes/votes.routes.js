// server/src/api/votes/votes.routes.js
const express = require('express');
const passport = require('passport');
const router = express.Router();

// Import the controller
// Make sure this file exists and exports the functions correctly
const votesController = require('./votes.controller');

// Apply JWT authentication middleware
const auth = passport.authenticate('jwt', { session: false });

// Define routes with proper parameter names and handlers
router.get('/election/:electionId', auth, votesController.getVotesByElection);
router.get('/statistics/:electionId', auth, votesController.getVoteStatistics);
router.get('/:voteId', auth, votesController.getVoteById);
router.post('/verify', auth, votesController.verifyVote);

module.exports = router;