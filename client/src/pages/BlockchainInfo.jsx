// client/src/pages/BlockchainInfo.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Lock, FileText, Database, RefreshCw, Eye, EyeOff, CheckCircle2, Code } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BlockchainInfo() {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-2 text-center">Blockchain-Powered E-Voting</h1>
      <p className="text-center text-gray-600 mb-8">How we use blockchain technology to ensure secure and transparent elections</p>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Why Blockchain for E-Voting?</h2>
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                  <ShieldCheck className="h-12 w-12 text-blue-600 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Immutable Record</h3>
                  <p className="text-gray-600">
                    Once a vote is recorded on the blockchain, it cannot be altered or deleted by anyone,
                    ensuring the integrity of the electoral process.
                  </p>
                </div>
                
                <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                  <Lock className="h-12 w-12 text-blue-600 mb-4" />
                  <h3 className="text-lg font-medium mb-2">End-to-End Encryption</h3>
                  <p className="text-gray-600">
                    Your vote is encrypted from the moment you cast it until it's counted,
                    protecting your privacy and preventing tampering.
                  </p>
                </div>
                
                <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                  <EyeOff className="h-12 w-12 text-blue-600 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Voter Anonymity</h3>
                  <p className="text-gray-600">
                    While the system verifies your eligibility to vote, your actual vote is
                    anonymized, ensuring ballot secrecy.
                  </p>
                </div>
                
                <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                  <CheckCircle2 className="h-12 w-12 text-blue-600 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Verifiable Results</h3>
                  <p className="text-gray-600">
                    Anyone can verify that their vote was counted correctly without revealing
                    who they voted for.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 text-blue-800 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Identity Verification</h3>
                    <p className="text-gray-600">
                      Your identity is verified using biometric authentication (face recognition).
                      This ensures only eligible voters can access the system.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 text-blue-800 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Vote Casting</h3>
                    <p className="text-gray-600">
                      When you cast your vote, it is encrypted with your unique cryptographic key.
                      This ensures that your vote cannot be read by anyone else.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 text-blue-800 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Blockchain Recording</h3>
                    <p className="text-gray-600">
                      Your encrypted vote is added to a block which is then added to the blockchain.
                      This process is verified by multiple nodes in the network for security.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 text-blue-800 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Vote Verification</h3>
                    <p className="text-gray-600">
                      You receive a unique transaction hash that allows you to verify your vote was
                      recorded correctly without revealing who you voted for.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 text-blue-800 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                    5
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Result Calculation</h3>
                    <p className="text-gray-600">
                      When the election closes, votes are tallied using cryptographic methods that
                      maintain anonymity while ensuring accuracy.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
        
        <section className="text-center">
          <h2 className="text-2xl font-bold mb-4">Verify Your Vote</h2>
          <p className="text-gray-600 mb-6">
            Use our verification tool to confirm that your vote was correctly recorded on the blockchain.
          </p>
          <Link to="/verify">
            <Button size="lg" className="mx-auto">
              Verify My Vote
            </Button>
          </Link>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold mb-4">Technical Details</h2>
          <Card>
            <CardHeader>
              <CardTitle>Smart Contract Implementation</CardTitle>
              <CardDescription>
                Our blockchain implementation uses Ethereum-compatible smart contracts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-900 text-gray-200 p-4 rounded-md font-mono text-sm overflow-x-auto">
                  <pre>{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EVoting {
    // Simplified version of our voting contract
    address public admin;
    mapping(uint256 => mapping(uint256 => uint256)) private electionCandidateVotes;
    mapping(address => mapping(uint256 => bool)) private hasVoted;
    mapping(bytes32 => bool) private voteHashes;
    
    event VoteCast(bytes32 voteHash, uint256 electionId, uint256 timestamp);

    // Cast a vote function
    function castVote(uint256 _electionId, uint256 _candidateId, bytes32 _secretHash) public {
        // Verify voter hasn't already voted
        require(!hasVoted[msg.sender][_electionId], "Already voted");
        
        // Create vote hash
        bytes32 voteHash = keccak256(abi.encodePacked(
            msg.sender, _electionId, _candidateId, _secretHash
        ));
        
        // Record vote
        electionCandidateVotes[_electionId][_candidateId]++;
        hasVoted[msg.sender][_electionId] = true;
        voteHashes[voteHash] = true;
        
        emit VoteCast(voteHash, _electionId, block.timestamp);
    }
    
    // Verify vote hash exists
    function verifyVote(bytes32 _voteHash) public view returns (bool) {
        return voteHashes[_voteHash];
    }
}`}</pre>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Key Technical Features:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Zero-knowledge proofs for anonymous verification</li>
                    <li>Elliptic curve cryptography for secure key generation</li>
                    <li>Distributed consensus for tamper resistance</li>
                    <li>Immutable transaction ledger for vote integrity</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}