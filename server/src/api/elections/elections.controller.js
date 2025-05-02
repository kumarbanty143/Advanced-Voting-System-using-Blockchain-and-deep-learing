// Import required modules
const pool = require('../../config/database');
const blockchainService = require('../../services/blockchain.service');

// Controller methods for elections
exports.getActiveElections = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM elections WHERE status = $1 AND start_date <= NOW() AND end_date >= NOW()',
      ['active']
    );
    
    res.status(200).json({
      success: true,
      elections: result.rows
    });
  } catch (error) {
    next(error);
  }
};

exports.getElectionResults = async (req, res, next) => {
  try {
    const { electionId } = req.params;
    
    // Get election details
    const electionResult = await pool.query(
      'SELECT * FROM elections WHERE id = $1',
      [electionId]
    );
    
    if (electionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Election not found' });
    }
    
    // Get candidates and vote counts
    const resultsQuery = await pool.query(`
      SELECT 
        c.id, 
        c.name, 
        c.party, 
        c.constituency_id,
        cons.name as constituency_name,
        COUNT(v.id) as vote_count
      FROM 
        candidates c
      JOIN 
        constituencies cons ON c.constituency_id = cons.id
      LEFT JOIN 
        votes v ON c.id = v.candidate_id
      WHERE 
        c.election_id = $1
      GROUP BY 
        c.id, cons.name
      ORDER BY 
        cons.name, vote_count DESC
    `, [electionId]);
    
    // Get blockchain verification data if election is completed
    let blockchainData = null;
    if (electionResult.rows[0].status === 'completed') {
      blockchainData = await blockchainService.getElectionResults(electionId);
    }
    
    res.status(200).json({
      success: true,
      election: electionResult.rows[0],
      results: resultsQuery.rows,
      blockchainVerification: blockchainData
    });
    
  } catch (error) {
    next(error);
  }
};

exports.getElectionById = async (req, res, next) => {
  try {
    const { electionId } = req.params;
    
    // Get election details
    const electionResult = await pool.query(
      'SELECT * FROM elections WHERE id = $1',
      [electionId]
    );
    
    if (electionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Election not found' });
    }
    
    // Get constituencies
    const constituenciesResult = await pool.query(
      'SELECT * FROM constituencies WHERE election_id = $1',
      [electionId]
    );
    
    // Get candidates
    const candidatesResult = await pool.query(
      `SELECT 
        c.*, 
        cons.name as constituency_name 
      FROM 
        candidates c
      JOIN 
        constituencies cons ON c.constituency_id = cons.id
      WHERE 
        c.election_id = $1`,
      [electionId]
    );
    
    // Check if user has voted in this election
    let hasVoted = false;
    if (req.user) {
      const voteResult = await pool.query(
        'SELECT * FROM votes WHERE voter_id = $1 AND election_id = $2',
        [req.user.id, electionId]
      );
      hasVoted = voteResult.rows.length > 0;
    }
    
    res.status(200).json({
      success: true,
      election: electionResult.rows[0],
      constituencies: constituenciesResult.rows,
      candidates: candidatesResult.rows,
      hasVoted
    });
    
  } catch (error) {
    next(error);
  }
};

exports.createElection = async (req, res, next) => {
  try {
    const { name, type, description, startDate, endDate, constituencies } = req.body;
    
    // Start a transaction
    await pool.query('BEGIN');
    
    // Create the election in the database
    const electionResult = await pool.query(
      'INSERT INTO elections (name, type, description, start_date, end_date) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [name, type, description, startDate, endDate]
    );
    
    const electionId = electionResult.rows[0].id;
    
    // Add constituencies
    for (const constituency of constituencies) {
      await pool.query(
        'INSERT INTO constituencies (name, state, election_id) VALUES ($1, $2, $3)',
        [constituency.name, constituency.state, electionId]
      );
    }
    
    // Create election on blockchain
    const blockchainResult = await blockchainService.createElection(
      electionId,
      name, 
      startDate,
      endDate
    );
    
    // Commit the transaction
    await pool.query('COMMIT');
    
    res.status(201).json({
      success: true,
      message: 'Election created successfully',
      electionId,
      transactionHash: blockchainResult.transactionHash
    });
    
  } catch (error) {
    // Rollback in case of error
    await pool.query('ROLLBACK');
    next(error);
  }
};

exports.getAllElections = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM elections ORDER BY created_at DESC');
    
    res.status(200).json({
      success: true,
      elections: result.rows
    });
  } catch (error) {
    next(error);
  }
};

exports.startElection = async (req, res, next) => {
  try {
    const { electionId } = req.params;
    
    // Update election status in database
    const result = await pool.query(
      'UPDATE elections SET status = $1 WHERE id = $2 RETURNING *',
      ['active', electionId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Election not found' });
    }
    
    // Update blockchain
    const blockchainResult = await blockchainService.activateElection(electionId);
    
    res.status(200).json({
      success: true,
      message: `Election ${result.rows[0].name} started successfully`,
      election: result.rows[0],
      transactionHash: blockchainResult.transactionHash
    });
    
  } catch (error) {
    next(error);
  }
};

exports.endElection = async (req, res, next) => {
  try {
    const { electionId } = req.params;
    
    // Update election status in database
    const result = await pool.query(
      'UPDATE elections SET status = $1 WHERE id = $2 RETURNING *',
      ['ended', electionId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Election not found' });
    }
    
    // Update blockchain
    const blockchainResult = await blockchainService.endElection(electionId);
    
    res.status(200).json({
      success: true,
      message: `Election ${result.rows[0].name} ended successfully`,
      election: result.rows[0],
      transactionHash: blockchainResult.transactionHash
    });
    
  } catch (error) {
    next(error);
  }
};

exports.publishResults = async (req, res, next) => {
  try {
    const { electionId } = req.params;
    
    // Update election status in database
    const result = await pool.query(
      'UPDATE elections SET status = $1 WHERE id = $2 RETURNING *',
      ['completed', electionId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Election not found' });
    }
    
    // Publish results on blockchain
    const blockchainResult = await blockchainService.publishResults(electionId);
    
    res.status(200).json({
      success: true,
      message: `Election ${result.rows[0].name} results published successfully`,
      election: result.rows[0],
      transactionHash: blockchainResult.transactionHash
    });
    
  } catch (error) {
    next(error);
  }
};