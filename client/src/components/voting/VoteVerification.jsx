// client/src/components/voting/VoteVerification.jsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import axios from '@/lib/api';

const VoteVerification = () => {
  const [voteHash, setVoteHash] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();
  
  const handleVerify = async () => {
    if (!voteHash.trim()) {
      toast({
        variant: "destructive",
        title: "Missing hash",
        description: "Please enter a vote transaction hash"
      });
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.get(`/api/votes/verify/${voteHash}`);
      setVerificationResult(response.data);
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationResult({
        success: false,
        verified: false,
        message: error.response?.data?.message || "Vote not found or verification failed"
      });
      
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: error.response?.data?.message || "Unable to verify this vote hash"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleReset = () => {
    setVoteHash('');
    setVerificationResult(null);
  };
  
  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Vote Verification</CardTitle>
        <CardDescription>
          Verify that your vote was correctly recorded on the blockchain
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-medium">How verification works</p>
          <p className="mt-2">
            Each vote cast in the system generates a unique transaction hash. 
            Enter your vote hash below to verify that your vote was recorded correctly.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Input
            value={voteHash}
            onChange={(e) => setVoteHash(e.target.value)}
            placeholder="Enter your vote transaction hash"
            className="flex-1"
          />
          <Button 
            onClick={handleVerify}
            disabled={loading || !voteHash.trim()}
            className="flex-shrink-0"
          >
            {loading ? "Verifying..." : "Verify"}
          </Button>
        </div>
        
        {verificationResult && (
          <div className={`border rounded-lg p-4 ${
            verificationResult.verified 
              ? 'bg-green-50 border-green-100' 
              : 'bg-red-50 border-red-100'
          }`}>
            <div className="flex items-start gap-3">
              {verificationResult.verified ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              )}
              
              <div>
                <p className="font-medium">
                  {verificationResult.verified ? 'Vote Verified Successfully' : 'Verification Failed'}
                </p>
                <p className="text-sm mt-1">
                  {verificationResult.verified 
                    ? 'Your vote was found and verified on the blockchain.'
                    : verificationResult.message || 'This vote hash could not be verified.'}
                </p>
                
                {verificationResult.verified && verificationResult.blockchainVerified && (
                  <div className="mt-3 text-sm">
                    <p className="font-medium">Verification Details:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Blockchain verification: {verificationResult.blockchainVerified ? 'Successful' : 'Failed'}</li>
                      <li>Database verification: {verificationResult.databaseVerified ? 'Successful' : 'Failed'}</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end">
        {verificationResult && (
          <Button variant="outline" onClick={handleReset}>
            Check Another Hash
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default VoteVerification;