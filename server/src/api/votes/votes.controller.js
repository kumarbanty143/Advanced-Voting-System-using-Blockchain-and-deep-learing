// server/src/api/voters/voters.controller.js
const pool = require('../../config/database');
const faceRecognitionService = require('../../services/faceRecognition.service');

// Register face
exports.registerFace = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const faceImage = req.file; // Assuming you use multer for file uploads
    
    if (!faceImage) {
      return res.status(400).json({ message: 'No face image provided' });
    }
    
    // Extract face descriptor
    const descriptor = await faceRecognitionService.getFaceDescriptor(faceImage.buffer);
    
    // Save descriptor to database
    await pool.query(
      'UPDATE users SET face_data = $1 WHERE id = $2',
      [JSON.stringify(Array.from(descriptor)), userId]
    );
    
    res.status(200).json({
      success: true,
      message: 'Face registered successfully'
    });
    
  } catch (error) {
    next(error);
  }
};

// Verify voter face
exports.verifyFace = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const faceImage = req.file; // Assuming you use multer for file uploads
    
    if (!faceImage) {
      return res.status(400).json({ message: 'No face image provided' });
    }
    
    // Get stored face descriptor
    const result = await pool.query(
      'SELECT face_data FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0 || !result.rows[0].face_data) {
      return res.status(400).json({ message: 'No face data registered for this user' });
    }
    
    const storedDescriptor = result.rows[0].face_data;
    
    // Extract face descriptor from provided image
    const currentDescriptor = await faceRecognitionService.getFaceDescriptor(faceImage.buffer);
    
    // Compare faces
    const comparison = faceRecognitionService.compareFaces(storedDescriptor, currentDescriptor);
    
    if (!comparison.match) {
      return res.status(401).json({ 
        message: 'Face verification failed', 
        match: false,
        similarity: comparison.similarity
      });
    }
    
    // Update user verification status
    await pool.query(
      'UPDATE users SET is_verified = TRUE WHERE id = $1',
      [userId]
    );
    
    res.status(200).json({
      success: true,
      message: 'Face verification successful',
      match: true,
      similarity: comparison.similarity
    });
    
  } catch (error) {
    next(error);
  }
};