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