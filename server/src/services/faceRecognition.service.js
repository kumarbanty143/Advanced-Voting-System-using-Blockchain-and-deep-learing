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
const MODELS_PATH = path.join(__dirname, '../models');

// Initialize models
let modelsLoaded = false;

// Load models
const loadModels = async () => {
  if (modelsLoaded) return;
  
  try {
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_PATH);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_PATH);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_PATH);
    
    modelsLoaded = true;
    console.log('Face recognition models loaded');
  } catch (error) {
    console.error('Error loading face recognition models:', error);
    throw error;
  }
};

// Extract face descriptor from image buffer
const getFaceDescriptor = async (imageBuffer) => {
  await loadModels();
  
  try {
    const img = await canvas.loadImage(imageBuffer);
    const detections = await faceapi.detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();
      
    if (!detections) {
      throw new Error('No face detected in the image');
    }
    
    return detections.descriptor;
  } catch (error) {
    console.error('Error extracting face descriptor:', error);
    throw error;
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
    }
    
    if (typeof descriptor2 === 'string') {
      desc2 = new Float32Array(JSON.parse(descriptor2));
    }
    
    // Calculate Euclidean distance between descriptors
    const distance = faceapi.euclideanDistance(desc1, desc2);
    
    // Threshold for matching (lower is more strict)
    const threshold = 0.6;
    
    return {
      match: distance < threshold,
      distance,
      similarity: 1 - distance
    };
  } catch (error) {
    console.error('Error comparing faces:', error);
    throw error;
  }
};

module.exports = {
  loadModels,
  getFaceDescriptor,
  compareFaces
};