// server/src/services/faceRecognition.service.js
const tf = require('@tensorflow/tfjs-node');
const faceapi = require('face-api.js');
const canvas = require('canvas');
const { Canvas, Image, ImageData } = canvas;
const path = require('path');
const fs = require('fs');

// Patch the faceapi canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Path to face recognition models
const MODELS_PATH = path.join(__dirname, '../../models');

// Initialize models
let modelsLoaded = false;

// Load models
const loadModels = async () => {
  if (modelsLoaded) return;
  
  try {
    // Check if models directory exists
    if (!fs.existsSync(MODELS_PATH)) {
      console.warn(`Models directory not found at ${MODELS_PATH}. Creating directory...`);
      fs.mkdirSync(MODELS_PATH, { recursive: true });
    }
    
    // Check if model files exist before loading
    const requiredFiles = [
      'ssd_mobilenetv1_model-weights_manifest.json',
      'face_landmark_68_model-weights_manifest.json',
      'face_recognition_model-weights_manifest.json'
    ];
    
    const missingFiles = requiredFiles.filter(file => 
      !fs.existsSync(path.join(MODELS_PATH, file))
    );
    
    if (missingFiles.length > 0) {
      console.warn(`Missing model files: ${missingFiles.join(', ')}`);
      console.warn('Using alternative loading method...');
      
      // Try loading from CDN as fallback
      await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    } else {
      // Load from disk if files exist
      await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_PATH);
      await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_PATH);
      await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_PATH);
    }
    
    modelsLoaded = true;
    console.log('Face recognition models loaded successfully');
  } catch (error) {
    console.error('Error loading face recognition models:', error);
    throw new Error(`Failed to load face recognition models: ${error.message}`);
  }
};

// Extract face descriptor from image buffer
const getFaceDescriptor = async (imageBuffer) => {
  await loadModels();
  
  try {
    // Create canvas from image buffer
    const img = await canvas.loadImage(imageBuffer);
    const cvs = canvas.createCanvas(img.width, img.height);
    const ctx = cvs.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    // Detect face and get descriptor
    const detections = await faceapi.detectSingleFace(cvs)
      .withFaceLandmarks()
      .withFaceDescriptor();
      
    if (!detections) {
      throw new Error('No face detected in the image');
    }
    
    // Return the face descriptor
    return Array.from(detections.descriptor);
  } catch (error) {
    console.error('Error extracting face descriptor:', error);
    throw new Error(`Face detection failed: ${error.message}`);
  }
};

// Compare face descriptors
const compareFaces = (descriptor1, descriptor2) => {
  try {
    // Convert string descriptor back to Float32Array if needed
    let desc1 = descriptor1;
    let desc2 = descriptor2;
    
    if (typeof descriptor1 === 'string') {
      desc1 = new Float32Array(JSON.parse(descriptor1));
    } else if (Array.isArray(descriptor1)) {
      desc1 = new Float32Array(descriptor1);
    }
    
    if (typeof descriptor2 === 'string') {
      desc2 = new Float32Array(JSON.parse(descriptor2));
    } else if (Array.isArray(descriptor2)) {
      desc2 = new Float32Array(descriptor2);
    }
    
    // Calculate Euclidean distance between descriptors
    const distance = faceapi.euclideanDistance(desc1, desc2);
    
    // Threshold for matching (lower is more strict)
    // You can adjust this threshold based on your security requirements
    const threshold = 0.5; // More strict threshold than before (was 0.6)
    
    return {
      match: distance < threshold,
      distance,
      confidence: ((1 - distance) * 100).toFixed(2) + '%', // Convert to percentage
      threshold
    };
  } catch (error) {
    console.error('Error comparing faces:', error);
    throw new Error(`Face comparison failed: ${error.message}`);
  }
};

// Detect faces in an image with additional information
const detectFaces = async (imageBuffer) => {
  await loadModels();
  
  try {
    const img = await canvas.loadImage(imageBuffer);
    const cvs = canvas.createCanvas(img.width, img.height);
    const ctx = cvs.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    // Run full face detection with landmarks, expressions, and age/gender
    const detections = await faceapi.detectAllFaces(cvs)
      .withFaceLandmarks()
      .withFaceDescriptors();
    
    return {
      count: detections.length,
      detections: detections.map(detection => ({
        faceRectangle: {
          x: detection.detection.box.x,
          y: detection.detection.box.y,
          width: detection.detection.box.width,
          height: detection.detection.box.height
        },
        score: detection.detection.score
      }))
    };
  } catch (error) {
    console.error('Error detecting faces:', error);
    throw new Error(`Face detection failed: ${error.message}`);
  }
};

// Enhanced face verification with anti-spoofing check
const verifyFaceWithAntiSpoofing = async (imageBuffer, storedDescriptor) => {
  await loadModels();
  
  try {
    const img = await canvas.loadImage(imageBuffer);
    const cvs = canvas.createCanvas(img.width, img.height);
    const ctx = cvs.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    // Detect face
    const detection = await faceapi.detectSingleFace(cvs)
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    if (!detection) {
      return {
        verified: false,
        message: 'No face detected in the image'
      };
    }
    
    // Basic anti-spoofing check (this is a simplified version)
    // A real implementation would use more sophisticated methods
    const landmarks = detection.landmarks;
    const eyeDistance = landmarks.getLeftEye()[0].x - landmarks.getRightEye()[0].x;
    const faceWidth = detection.detection.box.width;
    const eyeToFaceRatio = Math.abs(eyeDistance / faceWidth);
    
    // Check if the eye distance makes sense for a real face
    if (eyeToFaceRatio < 0.2 || eyeToFaceRatio > 0.7) {
      return {
        verified: false,
        message: 'Potential spoofing detected'
      };
    }
    
    // Compare with stored descriptor
    const comparison = compareFaces(detection.descriptor, storedDescriptor);
    
    return {
      verified: comparison.match,
      confidence: comparison.confidence,
      distance: comparison.distance,
      message: comparison.match ? 'Face verified successfully' : 'Face verification failed'
    };
  } catch (error) {
    console.error('Error verifying face:', error);
    throw new Error(`Face verification failed: ${error.message}`);
  }
};

module.exports = {
  loadModels,
  getFaceDescriptor,
  compareFaces,
  detectFaces,
  verifyFaceWithAntiSpoofing
};