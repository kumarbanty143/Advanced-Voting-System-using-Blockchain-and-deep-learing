// server/src/api/candidates/candidates.routes.js
const express = require('express');
const passport = require('passport');
const candidatesController = require('./candidates.controller');
const { isAdmin, isVerifiedVoter } = require('../../middleware/auth.middleware');

const router = express.Router();

// Apply JWT authentication middleware
const auth = passport.authenticate('jwt', { session: false });

// Get candidates for election and constituency (for voters)
router.get('/election/:electionId/constituency/:constituencyId', auth, isVerifiedVoter, candidatesController.getCandidates);

// Admin routes
router.post('/', auth, isAdmin, candidatesController.createCandidate);
router.get('/election/:electionId', auth, isAdmin, candidatesController.getAllCandidatesByElection);
router.put('/:candidateId', auth, isAdmin, candidatesController.updateCandidate);
router.delete('/:candidateId', auth, isAdmin, candidatesController.deleteCandidate);

module.exports = router;