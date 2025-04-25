// client/src/components/voting/FaceVerification.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, Camera, CheckCircle2, X } from 'lucide-react';
import * as faceapi from 'face-api.js';
import axios from '@/lib/api';

const FaceVerification = ({ onVerificationComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [progress, setProgress] = useState(0);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { toast } = useToast();
  
  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        
        setModelsLoaded(true);
        setIsLoading(false);
        toast({
          title: "Face detection models loaded",
          description: "Camera is ready to use"
        });
      } catch (error) {
        console.error('Error loading models:', error);
        toast({
          variant: "destructive",
          title: "Failed to load face detection models",
          description: "Please refresh and try again"
        });
        setIsLoading(false);
      }
    };
    
    loadModels();
    
    // Clean up camera on unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);
  
  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        detectFaces();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        variant: "destructive",
        title: "Camera access denied",
        description: "Please allow camera access and try again"
      });
    }
  };
  
  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };
  
  // Detect faces in video stream
  const detectFaces = async () => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) return;
    
    try {
      const detections = await faceapi.detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks();
      
      if (detections) {
        setFaceDetected(true);
        
        // Draw detection results on canvas
        const displaySize = { width: videoRef.current.width, height: videoRef.current.height };
        faceapi.matchDimensions(canvasRef.current, displaySize);
        
        const resizedDetection = faceapi.resizeResults(detections, displaySize);
        
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.beginPath();
        ctx.lineWidth = "3";
        ctx.strokeStyle = "green";
        ctx.rect(
          resizedDetection.detection.box.x,
          resizedDetection.detection.box.y,
          resizedDetection.detection.box.width,
          resizedDetection.detection.box.height
        );
        ctx.stroke();
      } else {
        setFaceDetected(false);
      }
    } catch (error) {
      console.error('Face detection error:', error);
    }
    
    if (isCameraActive) {
      requestAnimationFrame(detectFaces);
    }
  };
  
  // Capture image for verification
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current || !faceDetected) return;
    
    try {
      setIsProcessing(true);
      setProgress(25);
      
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob for API upload
      canvas.toBlob(async (blob) => {
        setCapturedImage(URL.createObjectURL(blob));
        setProgress(50);
        
        // Create form data for upload
        const formData = new FormData();
        formData.append('face', blob, 'face.jpg');
        
        try {
          // Upload to server for verification
          setProgress(75);
          const response = await axios.post('/api/voters/verify-face', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          
          setProgress(100);
          setVerificationResult({
            success: true,
            similarity: response.data.similarity
          });
          
          toast({
            title: "Verification successful",
            description: "Your identity has been verified"
          });
          
          // Notify parent component of successful verification
          if (onVerificationComplete) {
            onVerificationComplete(true);
          }
        } catch (error) {
          console.error('Verification error:', error);
          setVerificationResult({
            success: false,
            message: error.response?.data?.message || "Verification failed"
          });
          
          toast({
            variant: "destructive",
            title: "Verification failed",
            description: error.response?.data?.message || "Please try again"
          });
        } finally {
          setIsProcessing(false);
          stopCamera();
        }
      }, 'image/jpeg', 0.9);
    } catch (error) {
      console.error('Image capture error:', error);
      setIsProcessing(false);
      toast({
        variant: "destructive",
        title: "Image capture failed",
        description: "Please try again"
      });
    }
  };
  
  // Try again after failed verification
  const tryAgain = () => {
    setVerificationResult(null);
    setCapturedImage(null);
    setProgress(0);
    startCamera();
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Face Verification</CardTitle>
        <CardDescription>
          Verify your identity using facial recognition
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {!verificationResult ? (
              <>
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  {!isCameraActive ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                      <Camera className="h-12 w-12 mb-4 opacity-70" />
                      <p className="text-center mb-4">Camera access is required for verification</p>
                      <Button 
                        onClick={startCamera} 
                        disabled={!modelsLoaded}
                      >
                        Start Camera
                      </Button>
                    </div>
                  ) : (
                    <>
                      <video 
                        ref={videoRef} 
                        width="640" 
                        height="480" 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover"
                      />
                      <canvas 
                        ref={canvasRef} 
                        width="640" 
                        height="480" 
                        className="absolute top-0 left-0 w-full h-full"
                      />
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <div className={`px-3 py-1 text-sm rounded-full flex items-center gap-1.5 ${
                          faceDetected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {faceDetected ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Face Detected</span>
                            </>
                          ) : (
                            <>
                              <X className="h-3.5 w-3.5" />
                              <span>No Face Detected</span>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                {isCameraActive && (
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={stopCamera}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={captureImage}
                      disabled={!faceDetected || isProcessing}
                    >
                      {isProcessing ? "Processing..." : "Verify Identity"}
                    </Button>
                  </div>
                )}
                
                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Verifying identity...</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                {capturedImage && (
                  <div className="rounded-lg overflow-hidden border">
                    <img 
                      src={capturedImage} 
                      alt="Captured face" 
                      className="w-full h-auto"
                    />
                  </div>
                )}
                
                {verificationResult.success ? (
                  <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-800">Verification Successful</p>
                      <p className="text-sm text-green-600 mt-1">
                        Your identity has been verified with {Math.round(verificationResult.similarity * 100)}% confidence.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-800">Verification Failed</p>
                      <p className="text-sm text-red-600 mt-1">
                        {verificationResult.message || "Unable to verify your identity. Please try again."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {verificationResult && !verificationResult.success && (
          <Button onClick={tryAgain}>Try Again</Button>
        )}
        {verificationResult && verificationResult.success && (
          <Button 
            onClick={() => onVerificationComplete && onVerificationComplete(true)}
            className="w-full"
          >
            Continue
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default FaceVerification;