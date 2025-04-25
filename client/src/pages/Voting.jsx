// client/src/pages/Voting.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Check, Clock, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import axios from '@/lib/api';
import FaceVerification from '@/components/voting/FaceVerification';
import Ballot from '@/components/voting/Ballot';

export default function Voting() {
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(33);
  const [activeElections, setActiveElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voteResult, setVoteResult] = useState(null);
  const [error, setError] = useState(null);
  
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Load active elections
  useEffect(() => {
    const fetchElections = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/elections/active');
        setActiveElections(response.data.elections);
        
        // If there's only one active election, select it automatically
        if (response.data.elections.length === 1) {
          setSelectedElection(response.data.elections[0]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching elections:', err);
        setError('Failed to load active elections');
        setLoading(false);
      }
    };
    
    fetchElections();
  }, []);
  
  // Update progress when step changes
  useEffect(() => {
    setProgress(step * 33.33);
  }, [step]);
  
  // Handle election selection
  const handleSelectElection = (election) => {
    setSelectedElection(election);
    
    // If user is already verified, go directly to ballot
    if (currentUser.isVerified) {
      setStep(2);
    }
  };
  
  // Handle verification completion
  const handleVerificationComplete = (success) => {
    if (success) {
      toast({
        title: "Verification successful",
        description: "You are now ready to vote"
      });
      setStep(2);
    }
  };
  
  // Handle vote completion
  const handleVoteComplete = (result) => {
    if (result.success) {
      setVoteResult(result);
      setStep(3);
    }
  };
  
  // View election results
  const viewResults = () => {
    navigate('/results');
  };
  
  // Return home
  const returnHome = () => {
    navigate('/');
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
              <p className="text-gray-600">{error}</p>
              <Button className="mt-4" onClick={returnHome}>Return Home</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (activeElections.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="text-blue-500 mb-4">
                <Clock className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Elections</h3>
              <p className="text-gray-600">There are currently no active elections. Please check back later.</p>
              <Button className="mt-4" onClick={returnHome}>Return Home</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Voting Process</CardTitle>
          <CardDescription>
            {step === 1 ? 'Verify your identity' : 
             step === 2 ? 'Cast your vote' : 
             'Vote confirmation'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Step {step} of 3</span>
              <span>
              {step === 1 ? 'Identity Verification' : 
                 step === 2 ? 'Ballot Selection' : 
                 'Vote Confirmation'}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          {/* Step 1: Election selection & verification */}
          {step === 1 && (
            <div className="space-y-6">
              {activeElections.length > 1 && (
                <div className="space-y-3">
                  <h3 className="font-medium">Select Election</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {activeElections.map(election => (
                      <div 
                        key={election.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedElection?.id === election.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => handleSelectElection(election)}
                      >
                        <h4 className="font-medium">{election.name}</h4>
                        <p className="text-sm text-gray-600">{election.type} Election</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedElection && (
                <FaceVerification 
                  onVerificationComplete={handleVerificationComplete} 
                />
              )}
            </div>
          )}
          
          {/* Step 2: Ballot */}
          {step === 2 && selectedElection && (
            <Ballot 
              electionId={selectedElection.id} 
              onVoteComplete={handleVoteComplete}
            />
          )}
          
          {/* Step 3: Confirmation */}
          {step === 3 && voteResult && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-100 rounded-lg p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-green-800">Thank You for Voting</h3>
                <p className="mt-2 text-green-700">
                  Your vote has been cast and securely recorded on the blockchain.
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">Verification Receipt</h3>
                <p className="text-sm text-blue-700 mb-3">
                  Your vote has been recorded with the following transaction hash:
                </p>
                <div className="bg-white border border-blue-100 rounded p-3 font-mono text-xs break-all">
                  {voteResult.voteHash}
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Save this hash to verify your vote was counted correctly.
                </p>
              </div>
              
              <div className="space-y-4">
                <Button 
                  onClick={viewResults} 
                  className="w-full flex items-center justify-center gap-2"
                  variant="outline"
                >
                  <FileText className="h-4 w-4" />
                  View Election Results
                </Button>
                
                <Button 
                  onClick={returnHome} 
                  className="w-full"
                >
                  Return Home
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}