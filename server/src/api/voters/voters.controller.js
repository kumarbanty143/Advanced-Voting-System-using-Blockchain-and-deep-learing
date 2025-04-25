// server/src/api/voters/voters.controller.js
const pool = require('../../config/database');
const { createCanvas, loadImage } = require('canvas');
const faceapi = require('face-api.js');
const fs = require('fs');
const path = require('path');

// Initialize face-api.js
const initFaceApi = async () => {
  // Example paths - adjust these to your actual model locations
  const MODEL_PATH = path.join(__dirname, '../../../models');
  
  // Load the models
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_PATH);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH);
};

// Call initialization (consider moving this to server startup)
let faceApiInitialized = false;
const ensureFaceApiInitialized = async () => {
  if (!faceApiInitialized) {
    try {
      await initFaceApi();
      faceApiInitialized = true;
    } catch (error) {
      console.error('Failed to initialize face-api:', error);
      throw new Error('Face recognition system initialization failed');
    }
  }
};

// Register user's face
exports.registerFace = async (req, res, next) => {
  try {
    await ensureFaceApiInitialized();
    
    if (!req.file) {
      return res.status(400).json({ message: 'No face image provided' });
    }
    
    // Process image with face-api.js
    const img = await loadImage(req.file.buffer);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    // Detect face
    const detections = await faceapi.detectSingleFace(canvas)
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    if (!detections) {
      return res.status(400).json({ message: 'No face detected in the image' });
    }
    
    // Save face descriptor
    const faceDescriptor = JSON.stringify(Array.from(detections.descriptor));
    
    // Update user record with face data
    await pool.query(
      'UPDATE users SET face_descriptor = $1, is_face_registered = true WHERE id = $2',
      [faceDescriptor, req.user.id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Face registered successfully'
    });
    
  } catch (error) {
    next(error);
  }
};

// Verify user's face
exports.verifyFace = async (req, res, next) => {
  try {
    await ensureFaceApiInitialized();
    
    if (!req.file) {
      return res.status(400).json({ message: 'No face image provided' });
    }
    
    // Get user's stored face descriptor
    const userResult = await pool.query(
      'SELECT face_descriptor FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (userResult.rows.length === 0 || !userResult.rows[0].face_descriptor) {
      return res.status(400).json({ message: 'User has no registered face' });
    }
    
    // Process uploaded image
    const img = await loadImage(req.file.buffer);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    // Detect face in uploaded image
    const detections = await faceapi.detectSingleFace(canvas)
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    if (!detections) {
      return res.status(400).json({ message: 'No face detected in the image' });
    }
    
    // Compare with stored descriptor
    const storedDescriptor = new Float32Array(JSON.parse(userResult.rows[0].face_descriptor));
    const distance = faceapi.euclideanDistance(detections.descriptor, storedDescriptor);
    
    // Check if faces match (typical threshold is 0.6)
    const isMatch = distance < 0.6;
    
    if (isMatch) {
      // If face matches, update user verification status
      await pool.query(
        'UPDATE users SET is_verified = true WHERE id = $1',
        [req.user.id]
      );
      
      return res.status(200).json({
        success: true,
        message: 'Face verification successful',
        verified: true
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Face verification failed',
      verified: false
    });
    
  } catch (error) {
    next(error);
  }
};

// Get voter profile
exports.getProfile = async (req, res, next) => {
  try {
    // Get user profile data
    const result = await pool.query(
      'SELECT id, name, email, voter_id, constituency, is_verified, has_voted, is_face_registered FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      success: true,
      user: result.rows[0]
    });
    
  } catch (error) {
    next(error);
  }
};

module.exports = exports;