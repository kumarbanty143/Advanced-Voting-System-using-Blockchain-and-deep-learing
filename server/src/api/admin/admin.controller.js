// server/src/api/admin/admin.controller.js
const pool = require('../../config/database');

// Get all voters (for admin)
exports.getAllVoters = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, voter_id, aadhaar_id, constituency, is_verified, has_voted, created_at FROM users WHERE role = $1 ORDER BY created_at DESC',
      ['voter']
    );
    
    res.status(200).json({
      success: true,
      voters: result.rows
    });
    
  } catch (error) {
    next(error);
  }
};

// Verify a voter (admin only)
exports.verifyVoter = async (req, res, next) => {
  try {
    const { voterId } = req.params;
    
    const result = await pool.query(
      'UPDATE users SET is_verified = TRUE WHERE id = $1 AND role = $2 RETURNING id, name, email',
      [voterId, 'voter']
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Voter not found' });
    }
    
    res.status(200).json({
      success: true,
      message: `Voter ${result.rows[0].name} has been verified`,
      voter: result.rows[0]
    });
    
  } catch (error) {
    next(error);
  }
};

// Delete a voter (admin only)
exports.deleteVoter = async (req, res, next) => {
  try {
    const { voterId } = req.params;
    
    // First check if the voter exists
    const checkResult = await pool.query(
      'SELECT name FROM users WHERE id = $1 AND role = $2',
      [voterId, 'voter']
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Voter not found' });
    }
    
    const voterName = checkResult.rows[0].name;
    
    // Delete the voter
    await pool.query(
      'DELETE FROM users WHERE id = $1 AND role = $2',
      [voterId, 'voter']
    );
    
    res.status(200).json({
      success: true,
      message: `Voter ${voterName} has been deleted`
    });
    
  } catch (error) {
    next(error);
  }
};

// Get election statistics (admin dashboard)
exports.getElectionStats = async (req, res, next) => {
  try {
    // Get total voters count
    const votersResult = await pool.query(
      'SELECT COUNT(*) as total_voters FROM users WHERE role = $1',
      ['voter']
    );
    
    // Get verified voters count
    const verifiedResult = await pool.query(
      'SELECT COUNT(*) as verified_voters FROM users WHERE role = $1 AND is_verified = TRUE',
      ['voter']
    );
    
    // Get votes cast count
    const votesResult = await pool.query(
      'SELECT COUNT(*) as total_votes FROM votes'
    );
    
    // Get active elections count
    const activeResult = await pool.query(
      'SELECT COUNT(*) as active_elections FROM elections WHERE status = $1',
      ['active']
    );
    
    // Get upcoming elections count
    const upcomingResult = await pool.query(
      'SELECT COUNT(*) as upcoming_elections FROM elections WHERE status = $1',
      ['upcoming']
    );
    
    // Get completed elections count
    const completedResult = await pool.query(
      'SELECT COUNT(*) as completed_elections FROM elections WHERE status = $1',
      ['completed']
    );
    
    const stats = {
      totalVoters: parseInt(votersResult.rows[0].total_voters),
      verifiedVoters: parseInt(verifiedResult.rows[0].verified_voters),
      totalVotes: parseInt(votesResult.rows[0].total_votes),
      activeElections: parseInt(activeResult.rows[0].active_elections),
      upcomingElections: parseInt(upcomingResult.rows[0].upcoming_elections),
      completedElections: parseInt(completedResult.rows[0].completed_elections)
    };
    
    res.status(200).json({
      success: true,
      stats
    });
    
  } catch (error) {
    next(error);
  }
};