// server/src/api/candidates/candidates.controller.js
// Add near the top:
const blockchainService = require('../../services/blockchain.service');

// Then update the createCandidate function:
exports.createCandidate = async (req, res, next) => {
  try {
    const { name, party, partySymbol, bio, imageUrl, constituencyId, electionId } = req.body;
    
    // Check if constituency exists and belongs to the specified election
    const constituencyCheck = await pool.query(
      'SELECT * FROM constituencies WHERE id = $1 AND election_id = $2',
      [constituencyId, electionId]
    );
    
    if (constituencyCheck.rows.length === 0) {
      return res.status(400).json({ 
        message: 'Invalid constituency for this election' 
      });
    }
    
    // Create candidate in database
    const result = await pool.query(
      'INSERT INTO candidates (name, party, party_symbol, bio, image_url, constituency_id, election_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, party, partySymbol, bio, imageUrl, constituencyId, electionId]
    );
    
    const candidateId = result.rows[0].id;
    
    // Add candidate to blockchain
    const blockchainResult = await blockchainService.addCandidate(
      candidateId,
      name,
      party
    );
    
    res.status(201).json({
      success: true,
      message: 'Candidate created successfully',
      candidate: result.rows[0],
      transactionHash: blockchainResult.transactionHash
    });
    
  } catch (error) {
    next(error);
  }
};

// Add this function to candidates.controller.js

// Get candidates for a specific election and constituency
exports.getCandidates = async (req, res, next) => {
  try {
    const { electionId, constituencyId } = req.params;
    
    // Check if election is active
    const [elections] = await pool.query(
      'SELECT * FROM elections WHERE id = ? AND status = "active"',
      [electionId]
    );
    
    if (elections.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Active election not found' 
      });
    }
    
    // Check if constituency exists for this election
    const [constituencies] = await pool.query(
      'SELECT * FROM constituencies WHERE id = ? AND election_id = ?',
      [constituencyId, electionId]
    );
    
    if (constituencies.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Constituency not found for this election' 
      });
    }
    
    // Get candidates
    const [candidates] = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.party,
        c.party_symbol,
        c.bio,
        c.image_url,
        c.constituency_id,
        c.election_id,
        cons.name as constituency_name
      FROM 
        candidates c
      JOIN 
        constituencies cons ON c.constituency_id = cons.id
      WHERE 
        c.election_id = ? AND c.constituency_id = ?
    `, [electionId, constituencyId]);
    
    res.status(200).json({
      success: true,
      candidates
    });
    
  } catch (error) {
    next(error);
  }
};

// Add these additional functions to candidates.controller.js

// Get all candidates for an election (admin function)
exports.getAllCandidatesByElection = async (req, res, next) => {
  try {
    const { electionId } = req.params;
    
    // Check if election exists
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
    
    // Get all candidates for this election with constituency info
    const [candidates] = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.party,
        c.party_symbol,
        c.bio,
        c.image_url,
        c.constituency_id,
        c.election_id,
        cons.name as constituency_name
      FROM 
        candidates c
      JOIN 
        constituencies cons ON c.constituency_id = cons.id
      WHERE 
        c.election_id = ?
      ORDER BY
        cons.name, c.name
    `, [electionId]);
    
    res.status(200).json({
      success: true,
      candidates
    });
    
  } catch (error) {
    next(error);
  }
};

// Update candidate
exports.updateCandidate = async (req, res, next) => {
  try {
    const { candidateId } = req.params;
    const { name, party, partySymbol, bio, imageUrl, constituencyId } = req.body;
    
    // Check if candidate exists
    const [candidates] = await pool.query(
      'SELECT * FROM candidates WHERE id = ?',
      [candidateId]
    );
    
    if (candidates.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Candidate not found' 
      });
    }
    
    const candidate = candidates[0];
    
    // If constituency is changing, verify it belongs to the same election
    if (constituencyId && constituencyId !== candidate.constituency_id) {
      const [constituencies] = await pool.query(
        'SELECT * FROM constituencies WHERE id = ? AND election_id = ?',
        [constituencyId, candidate.election_id]
      );
      
      if (constituencies.length === 0) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid constituency for this election' 
        });
      }
    }
    
    // Update candidate in database
    await pool.query(`
      UPDATE candidates
      SET 
        name = ?,
        party = ?,
        party_symbol = ?,
        bio = ?,
        image_url = ?,
        constituency_id = ?
      WHERE id = ?
    `, [
      name || candidate.name,
      party || candidate.party,
      partySymbol || candidate.party_symbol,
      bio || candidate.bio,
      imageUrl || candidate.image_url,
      constituencyId || candidate.constituency_id,
      candidateId
    ]);
    
    // Get updated candidate
    const [updatedCandidates] = await pool.query(`
      SELECT 
        c.*,
        cons.name as constituency_name
      FROM 
        candidates c
      JOIN 
        constituencies cons ON c.constituency_id = cons.id
      WHERE 
        c.id = ?
    `, [candidateId]);
    
    // Update candidate on blockchain
    const blockchainResult = await blockchainService.updateCandidate(
      candidateId,
      name || candidate.name,
      party || candidate.party
    );
    
    res.status(200).json({
      success: true,
      message: 'Candidate updated successfully',
      candidate: updatedCandidates[0],
      transactionHash: blockchainResult.transactionHash
    });
    
  } catch (error) {
    next(error);
  }
};

// Delete candidate
exports.deleteCandidate = async (req, res, next) => {
  try {
    const { candidateId } = req.params;
    
    // Check if candidate exists
    const [candidates] = await pool.query(
      'SELECT * FROM candidates WHERE id = ?',
      [candidateId]
    );
    
    if (candidates.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Candidate not found' 
      });
    }
    
    // Check if election is in progress or completed
    const [elections] = await pool.query(`
      SELECT * FROM elections 
      WHERE id = ? AND status IN ('active', 'completed')
    `, [candidates[0].election_id]);
    
    if (elections.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete candidate from an active or completed election'
      });
    }
    
    // Delete candidate from database
    await pool.query('DELETE FROM candidates WHERE id = ?', [candidateId]);
    
    // Remove candidate from blockchain if applicable
    try {
      await blockchainService.removeCandidate(candidateId);
    } catch (blockchainError) {
      console.error('Blockchain removal failed, but database deletion succeeded:', blockchainError);
      // We can continue even if blockchain removal fails since the DB is the source of truth
    }
    
    res.status(200).json({
      success: true,
      message: 'Candidate deleted successfully'
    });
    
  } catch (error) {
    next(error);
  }
};