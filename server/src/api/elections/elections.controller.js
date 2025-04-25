// server/src/api/elections/elections.controller.js
// Add this near the top of the file:
const blockchainService = require('../../services/blockchain.service');

// Then update the createElection function:
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

// Update the publishing results function:
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