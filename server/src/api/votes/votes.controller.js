// server/src/api/votes/votes.controller.js
const pool = require('../../config/database');
const blockchainService = require('../../services/blockchain.service');

// Get vote by ID
exports.getVoteById = async (req, res, next) => {
  try {
    const voteId = req.params.voteId;
    
    if (!voteId) {
      return res.status(400).json({
        success: false,
        message: 'Vote ID is required'
      });
    }
    
    // Check if user is admin or the vote owner
    const [votes] = await pool.query(
      'SELECT * FROM votes WHERE id = ?',
      [voteId]
    );
    
    if (votes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vote not found'
      });
    }
    
    const vote = votes[0];
    
    // Only admin or the vote owner can access vote details
    if (req.user.role !== 'admin' && vote.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to access this vote'
      });
    }
    
    // Get election and candidate details
    const [elections] = await pool.query(
      'SELECT name, type FROM elections WHERE id = ?',
      [vote.election_id]
    );
    
    const [candidates] = await pool.query(
      'SELECT name, party FROM candidates WHERE id = ?',
      [vote.candidate_id]
    );
    
    // Verify vote on blockchain
    const blockchainVerification = await blockchainService.verifyVote(vote.vote_hash);
    
    res.status(200).json({
      success: true,
      vote: {
        id: vote.id,
        electionId: vote.election_id,
        electionName: elections[0]?.name || 'Unknown',
        electionType: elections[0]?.type || 'Unknown',
        candidateId: vote.candidate_id,
        candidateName: candidates[0]?.name || 'Unknown',
        candidateParty: candidates[0]?.party || 'Unknown',
        timestamp: vote.timestamp,
        voteHash: vote.vote_hash,
        verified: blockchainVerification.verified
      }
    });
    
  } catch (error) {
    console.error('Get vote error:', error);
    next(error);
  }
};

// Get votes by election ID
exports.getVotesByElection = async (req, res, next) => {
  try {
    const electionId = req.params.electionId;
    
    if (!electionId) {
      return res.status(400).json({
        success: false,
        message: 'Election ID is required'
      });
    }
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only administrators can access all votes'
      });
    }
    
    // Get election details
    const [elections] = await pool.query(
      'SELECT * FROM elections WHERE id = ?',
      [electionId]
    );
    
    if (elections.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }
    
    // Get votes for this election
    const [votes] = await pool.query(
      `SELECT v.id, v.user_id, v.candidate_id, v.constituency_id, v.vote_hash, v.timestamp,
      c.name as candidate_name, c.party as candidate_party,
      u.name as voter_name, con.name as constituency_name
      FROM votes v
      JOIN candidates c ON v.candidate_id = c.id
      JOIN users u ON v.user_id = u.id
      JOIN constituencies con ON v.constituency_id = con.id
      WHERE v.election_id = ?
      ORDER BY v.timestamp DESC`,
      [electionId]
    );
    
    res.status(200).json({
      success: true,
      election: {
        id: elections[0].id,
        name: elections[0].name,
        type: elections[0].type,
        startDate: elections[0].start_date,
        endDate: elections[0].end_date,
        status: elections[0].status
      },
      votes: votes
    });
    
  } catch (error) {
    console.error('Get votes by election error:', error);
    next(error);
  }
};

// Verify vote on blockchain
exports.verifyVote = async (req, res, next) => {
  try {
    const { voteHash } = req.body;
    
    if (!voteHash) {
      return res.status(400).json({
        success: false,
        message: 'Vote hash is required'
      });
    }
    
    // Check if vote exists in database
    const [votes] = await pool.query(
      'SELECT * FROM votes WHERE vote_hash = ?',
      [voteHash]
    );
    
    // Verify on blockchain
    const blockchainVerification = await blockchainService.verifyVote(voteHash);
    
    if (votes.length === 0) {
      return res.status(200).json({
        success: true,
        verified: blockchainVerification.verified,
        message: blockchainVerification.verified ? 
          'Vote verified on blockchain but not found in database' : 
          'Vote not found in system'
      });
    }
    
    const vote = votes[0];
    
    // Get election details
    const [elections] = await pool.query(
      'SELECT name, type FROM elections WHERE id = ?',
      [vote.election_id]
    );
    
    res.status(200).json({
      success: true,
      verified: blockchainVerification.verified,
      vote: {
        electionId: vote.election_id,
        electionName: elections[0]?.name || 'Unknown',
        timestamp: vote.timestamp,
        voteHash: vote.vote_hash
      },
      message: blockchainVerification.verified ? 
        'Vote successfully verified on blockchain' : 
        'Vote verification failed'
    });
    
  } catch (error) {
    console.error('Verify vote error:', error);
    next(error);
  }
};

// Get vote statistics for an election
exports.getVoteStatistics = async (req, res, next) => {
  try {
    const electionId = req.params.electionId;
    
    if (!electionId) {
      return res.status(400).json({
        success: false,
        message: 'Election ID is required'
      });
    }
    
    // Get election details
    const [elections] = await pool.query(
      'SELECT * FROM elections WHERE id = ?',
      [electionId]
    );
    
    if (elections.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }
    
    const election = elections[0];
    
    // Check if election has ended or user is admin
    const currentTime = new Date();
    const electionEnded = new Date(election.end_date) < currentTime;
    
    if (!electionEnded && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Results cannot be viewed until the election has ended'
      });
    }
    
    // Get vote counts by candidate
    const [candidateStats] = await pool.query(
      `SELECT c.id, c.name, c.party, c.party_symbol, COUNT(v.id) as vote_count
      FROM candidates c
      LEFT JOIN votes v ON c.id = v.candidate_id AND v.election_id = ?
      WHERE c.election_id = ?
      GROUP BY c.id
      ORDER BY vote_count DESC`,
      [electionId, electionId]
    );
    
    // Get vote counts by constituency
    const [constituencyStats] = await pool.query(
      `SELECT con.id, con.name, con.state, COUNT(v.id) as vote_count
      FROM constituencies con
      LEFT JOIN votes v ON con.id = v.constituency_id AND v.election_id = ?
      WHERE con.election_id = ?
      GROUP BY con.id
      ORDER BY vote_count DESC`,
      [electionId, electionId]
    );
    
    // Get total votes
    const [totalVotesResult] = await pool.query(
      'SELECT COUNT(*) as total FROM votes WHERE election_id = ?',
      [electionId]
    );
    
    const totalVotes = totalVotesResult[0].total;
    
    // Get total eligible voters (registered users in relevant constituencies)
    const [totalEligibleResult] = await pool.query(
      `SELECT COUNT(*) as total FROM users u
      JOIN constituencies c ON u.constituency = c.name
      WHERE c.election_id = ? AND u.role = 'voter'`,
      [electionId]
    );
    
    const totalEligible = totalEligibleResult[0].total;
    
    // Calculate turnout percentage
    const turnoutPercentage = totalEligible > 0 ? 
      ((totalVotes / totalEligible) * 100).toFixed(2) : 0;
    
    res.status(200).json({
      success: true,
      election: {
        id: election.id,
        name: election.name,
        type: election.type,
        startDate: election.start_date,
        endDate: election.end_date,
        status: election.status
      },
      statistics: {
        totalVotes,
        totalEligible,
        turnoutPercentage,
        candidateStats: candidateStats.map(candidate => ({
          ...candidate,
          percentage: totalVotes > 0 ? 
            ((candidate.vote_count / totalVotes) * 100).toFixed(2) : 0
        })),
        constituencyStats: constituencyStats.map(constituency => ({
          ...constituency,
          percentage: totalVotes > 0 ? 
            ((constituency.vote_count / totalVotes) * 100).toFixed(2) : 0
        }))
      }
    });
    
  } catch (error) {
    console.error('Get vote statistics error:', error);
    next(error);
  }
};

module.exports = exports;