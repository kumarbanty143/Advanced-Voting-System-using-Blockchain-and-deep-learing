// client/src/components/blockchain/BlockchainVerifier.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CheckCircle2, Lock, AlertCircle, Search, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import axios from '@/lib/api';

const BlockchainVerifier = () => {
  const [transactionHash, setTransactionHash] = useState('');
  const [voteHash, setVoteHash] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('transaction');
  
  const { toast } = useToast();
  
  const handleVerifyTransaction = async () => {
    if (!transactionHash.trim()) {
      toast({
        variant: "destructive",
        title: "Missing hash",
        description: "Please enter a blockchain transaction hash"
      });
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.get(`/api/blockchain/verify-transaction/${transactionHash}`);
      setVerificationResult(response.data);
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationResult({
        success: false,
        verified: false,
        message: error.response?.data?.message || "Transaction not found or verification failed"
      });
      
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: error.response?.data?.message || "Unable to verify this transaction"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyVote = async () => {
    if (!voteHash.trim()) {
      toast({
        variant: "destructive",
        title: "Missing hash",
        description: "Please enter a vote hash"
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
        description: error.response?.data?.message || "Unable to verify this vote"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleReset = () => {
    setTransactionHash('');
    setVoteHash('');
    setVerificationResult(null);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Blockchain Verification
        </CardTitle>
        <CardDescription>
          Verify votes and transactions on the blockchain
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs defaultValue="transaction" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transaction">Transaction Hash</TabsTrigger>
            <TabsTrigger value="vote">Vote Hash</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transaction" className="space-y-4 pt-4">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
              <p className="font-medium">Transaction Verification</p>
              <p className="mt-1">
                Enter a blockchain transaction hash to verify its authenticity and status.
              </p>
            </div>
            
            <div className="flex gap-2">
              <Input
                value={transactionHash}
                onChange={(e) => setTransactionHash(e.target.value)}
                placeholder="Enter transaction hash"
                className="flex-1"
              />
              <Button 
                onClick={handleVerifyTransaction}
                disabled={loading || !transactionHash.trim()}
                className="flex-shrink-0"
              >
                {loading ? "Verifying..." : "Verify"}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="vote" className="space-y-4 pt-4">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
              <p className="font-medium">Vote Verification</p>
              <p className="mt-1">
                Enter your vote hash to verify that your vote was recorded on the blockchain.
              </p>
            </div>
            
            <div className="flex gap-2">
              <Input
                value={voteHash}
                onChange={(e) => setVoteHash(e.target.value)}
                placeholder="Enter vote hash"
                className="flex-1"
              />
              <Button 
                onClick={handleVerifyVote}
                disabled={loading || !voteHash.trim()}
                className="flex-shrink-0"
              >
                {loading ? "Verifying..." : "Verify"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
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
                  {verificationResult.verified ? 'Verification Successful' : 'Verification Failed'}
                </p>
                <p className="text-sm mt-1">
                  {verificationResult.verified 
                    ? activeTab === 'transaction' 
                      ? 'This transaction was found and verified on the blockchain.'
                      : 'Your vote was found and verified on the blockchain.'
                    : verificationResult.message || 'This hash could not be verified.'}
                </p>
                
                {verificationResult.verified && verificationResult.details && (
                  <div className="mt-3 text-sm">
                    <p className="font-medium">Verification Details:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      {Object.entries(verificationResult.details).map(([key, value]) => (
                        <li key={key}>{key}: {String(value)}</li>
                      ))}
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

export default BlockchainVerifier;