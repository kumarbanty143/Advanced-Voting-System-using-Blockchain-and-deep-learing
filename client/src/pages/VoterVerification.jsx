// src/pages/VoterVerification.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Shield, Camera, AlertCircle, CheckCircle2, User, Fingerprint } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import * as faceapi from 'face-api.js';

export default function VoterVerification() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoading(true);
        const MODEL_URL = '/models';
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        
        setModelsLoaded(true);
        toast({
          title: "Face recognition ready",
          description: "Face detection models loaded successfully",
        });
      } catch (error) {
        console.error('Error loading face models:', error);
        toast({
          variant: "destructive",
          title: "Model loading failed",
          description: "Could not load face recognition models",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadModels();
    
    // Cleanup
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);
  
  // Update progress when step changes
  useEffect(() => {
    setProgress(step * 33.33);
  }, [step]);
  
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        
        // Start face detection once video is playing
        videoRef.current.onloadedmetadata = () => {
          detectFace();
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        variant: "destructive",
        title: "Camera access denied",
        description: "Please allow camera access to verify your identity",
      });
    }
  };
  
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      setCameraActive(false);
    }
  };
  
  const detectFace = async () => {
    if (!videoRef.current || !modelsLoaded) return;
    
    const detection = await faceapi.detectSingleFace(
      videoRef.current, 
      new faceapi.TinyFaceDetectorOptions()
    ).withFaceLandmarks();
    
    if (detection) {
      setFaceDetected(true);
      
      // Draw face detection results on canvas
      if (canvasRef.current) {
        const displaySize = { 
          width: videoRef.current.videoWidth, 
          height: videoRef.current.videoHeight 
        };
        faceapi.matchDimensions(canvasRef.current, displaySize);
        
        const resizedDetection = faceapi.resizeResults(detection, displaySize);
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        faceapi.draw.drawDetections(canvasRef.current, [resizedDetection]);
        faceapi.draw.drawFaceLandmarks(canvasRef.current, [resizedDetection]);
      }
    } else {
      setFaceDetected(false);
    }
    
    // Continue detecting
    if (cameraActive) {
      requestAnimationFrame(detectFace);
    }
  };
  
  const verifyFace = async () => {
    if (!faceDetected) {
      toast({
        variant: "destructive",
        title: "No face detected",
        description: "Please position your face clearly in the frame",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // In a real app, you would:
      // 1. Capture the current face data
      // 2. Send it to your backend
      // 3. Compare with stored reference image
      
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful verification
      setFaceVerified(true);
      toast({
        title: "Verification successful",
        description: "Your identity has been verified",
      });
      
      // Move to next step after a brief delay
      setTimeout(() => {
        setStep(3);
        stopCamera();
      }, 1000);
      
    } catch (error) {
      console.error('Face verification failed:', error);
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: "Please try again or contact support",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleInitialCheck = () => {
    // In a real app, you would validate voter ID and Aadhaar here
    setStep(2);
  };
  
  const completeVerification = () => {
    // In a real app, you would update the user's verification status in the database
    toast({
      title: "Verification complete",
      description: "You are now ready to vote",
    });
    navigate('/voting');
  };
  
  return (
    <div className="container max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader className="bg-blue-50 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-blue-800">Voter Verification</CardTitle>
              <CardDescription>Complete verification to access voting</CardDescription>
            </div>
            <Shield className="h-10 w-10 text-blue-600" />
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Progress indicator */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Step {step} of 3</span>
                <span>
                  {step === 1 ? 'Identity Confirmation' : 
                   step === 2 ? 'Biometric Verification' : 
                   'Verification Complete'}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            {/* Step 1: Initial verification */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium">Verification Required</p>
                    <p className="mt-1">To ensure electoral integrity, we need to verify your identity before you can vote.</p>
                  </div>
                </div>
                
                <div className="bg-white border rounded-lg p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Voter Information</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        We'll verify your details against the electoral database.
                      </p>
                      
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-500">Full Name</Label>
                          <p className="font-medium">{currentUser?.name}</p>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-gray-500">Voter ID</Label>
                          <p className="font-medium">{currentUser?.voterId || "ABC1234567"}</p>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-gray-500">Email</Label>
                          <p className="font-medium">{currentUser?.email}</p>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-gray-500">Aadhaar Number</Label>
                          <p className="font-medium">XXXX-XXXX-{currentUser?.aadhaarId?.slice(-4) || "1234"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleInitialCheck} 
                  className="w-full"
                  disabled={loading}
                >
                  Continue to Verification
                </Button>
              </div>
            )}
            
            {/* Step 2: Face verification */}
            {step === 2 && (
              <div className="space-y-6">
                <Tabs defaultValue="camera" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="camera">Camera</TabsTrigger>
                    <TabsTrigger value="instructions">Instructions</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="camera" className="space-y-4 pt-2">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                      <p className="font-medium">Face Recognition Verification</p>
                      <p className="mt-1">Look directly at the camera and ensure your face is clearly visible.</p>
                    </div>
                    
                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                      {!cameraActive ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                          <Camera className="h-12 w-12 mb-4 opacity-70" />
                          <p className="text-center mb-4">Camera access is required for face verification</p>
                          <Button
                            onClick={startCamera}
                            disabled={loading || !modelsLoaded}
                          >
                            {!modelsLoaded ? "Loading models..." : "Start Camera"}
                          </Button>
                        </div>
                      ) : (
                        <>
                          <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            muted 
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <canvas 
                            ref={canvasRef} 
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                            <Button 
                              variant="outline" 
                              onClick={stopCamera}
                              className="bg-white/80 backdrop-blur-sm"
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={verifyFace} 
                              disabled={loading || !faceDetected}
                              className="bg-blue-600/90 backdrop-blur-sm"
                            >
                              {loading ? "Verifying..." : "Verify Identity"}
                            </Button>
                          </div>
                          <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                            <div className={`px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 ${faceDetected ? 'bg-green-500/80' : 'bg-amber-500/80'} text-white backdrop-blur-sm`}>
                              {faceDetected ? (
                                <>
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Face Detected
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="h-3.5 w-3.5" />
                                  No Face Detected
                                </>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {faceVerified && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-green-800">
                          <p className="font-medium">Verification Successful</p>
                          <p className="mt-1">Your identity has been verified successfully.</p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="instructions" className="space-y-4 pt-2">
                    <div className="bg-white border rounded-lg p-5">
                      <h3 className="font-medium text-lg mb-4">Face Verification Instructions</h3>
                      <ul className="space-y-3">
                        <li className="flex gap-3">
                          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                            1
                          </div>
                          <p className="text-gray-700">Ensure you are in a well-lit area with your face clearly visible</p>
                        </li>
                        <li className="flex gap-3">
                          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                            2
                          </div>
                          <p className="text-gray-700">Remove glasses, masks or anything covering your face</p>
                        </li>
                        <li className="flex gap-3">
                          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                            3
                          </div>
                          <p className="text-gray-700">Look directly at the camera until verification is complete</p>
                        </li>
                        <li className="flex gap-3">
                          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                            4
                          </div>
                          <p className="text-gray-700">Remain still during the verification process</p>
                        </li>
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>
                
                {!cameraActive && !faceVerified && (
                  <Button 
                    onClick={startCamera} 
                    className="w-full"
                    disabled={loading || !modelsLoaded}
                  >
                    {!modelsLoaded ? "Loading models..." : "Start Verification"}
                  </Button>
                )}
              </div>
            )}
            
            {/* Step 3: Verification complete */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-green-800">Verification Complete</h3>
                  <p className="mt-2 text-green-700">
                    Your identity has been verified successfully. You can now proceed to vote.
                  </p>
                </div>
                
                <div className="bg-white border rounded-lg p-5 space-y-4">
                  <h3 className="font-medium">Verification Summary</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-blue-600" />
                        <span>Identity Confirmation</span>
                      </div>
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        Verified
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center gap-3">
                        <Camera className="h-5 w-5 text-blue-600" />
                        <span>Face Recognition</span>
                      </div>
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        Verified
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between pb-1">
                      <div className="flex items-center gap-3">
                        <Fingerprint className="h-5 w-5 text-blue-600" />
                        <span>Biometric Match</span>
                      </div>
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        Verified
                      </span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={completeVerification} 
                  className="w-full"
                  disabled={loading}
                >
                  Proceed to Voting
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}