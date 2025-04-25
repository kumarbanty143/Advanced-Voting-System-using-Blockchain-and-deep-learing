// client/src/components/voting/Ballot.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Check, AlertCircle, Vote } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import axios from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const Ballot = ({ electionId, onVoteComplete }) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [votingInProgress, setVotingInProgress] = useState(false);
  const [constituency, setConstituency] = useState(null);
  const [constituencies, setConstituencies] = useState([]);
  const [error, setError] = useState(null);
  
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  // Load constituencies for this election
  useEffect(() => {
    const fetchConstituencies = async () => {
      try {
        const response = await axios.get(`/api/elections/${electionId}`);
        setConstituencies(response.data.election.constituencies);
        
        // Try to find user's constituency
        const userConstituency = response.data.election.constituencies.find(
          c => c.name === currentUser.constituency
        );
        
        if (userConstituency) {
          setConstituency(userConstituency);
          // Load candidates for this constituency
          fetchCandidates(userConstituency.id);
        } else {
          setError('Your constituency is not participating in this election');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching constituencies:', err);
        setError('Failed to load election information');
        setLoading(false);
      }
    };
    
    fetchConstituencies();
  }, [electionId, currentUser]);
  
  // Load candidates for selected constituency
  const fetchCandidates = async (constituencyId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/candidates/election/${electionId}/constituency/${constituencyId}`);
      setCandidates(response.data.candidates);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setError('Failed to load candidates');
      setLoading(false);
    }
  };
  
  // Handle candidate selection
  const handleSelectCandidate = (candidate) => {
    setSelectedCandidate(candidate);
  };
  
  // Open confirmation dialog
  const handleConfirmVote = () => {
    if (!selectedCandidate) {
      toast({
        variant: "destructive",
        title: "No candidate selected",
        description: "Please select a candidate to vote"
      });
      return;
    }
    
    setConfirmDialogOpen(true);
  };
  
  // Submit vote
  const castVote = async () => {
    try {
      setVotingInProgress(true);
      
      const response = await axios.post('/api/votes', {
        candidateId: selectedCandidate.id,
        electionId: parseInt(electionId),
        constituencyId: constituency.id
      });
      
      toast({
        title: "Vote cast successfully",
        description: "Your vote has been recorded securely"
      });
      
      // Close dialog and notify parent
      setConfirmDialogOpen(false);
      
      if (onVoteComplete) {
        onVoteComplete({
          success: true,
          voteHash: response.data.voteHash,
          transactionHash: response.data.transactionHash
        });
      }
    } catch (err) {
      console.error('Error casting vote:', err);
      toast({
        variant: "destructive",
        title: "Failed to cast vote",
        description: err.response?.data?.message || "Please try again"
      });
    } finally {
      setVotingInProgress(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-start gap-4 text-red-600">
            <AlertCircle className="h-6 w-6 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg">Error</h3>
              <p>{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Vote className="h-5 w-5" />
          Cast Your Vote
        </CardTitle>
        <CardDescription>
          {constituency && `${constituency.name} Constituency`}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-medium">Voting Instructions</p>
          <ul className="mt-2 space-y-1 list-disc pl-5">
            <li>Select one candidate by clicking on their card</li>
            <li>Review your selection and confirm your vote</li>
            <li>Once confirmed, your vote cannot be changed</li>
            <li>Your vote is anonymous and securely recorded</li>
          </ul>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-medium">Select Your Candidate</h3>
          
          {candidates.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {candidates.map(candidate => (
                <div 
                  key={candidate.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedCandidate?.id === candidate.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectCandidate(candidate)}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                      {candidate.image_url ? (
                        <img 
                          src={candidate.image_url} 
                          alt={candidate.name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-800 font-semibold text-xl">
                          {candidate.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{candidate.name}</h4>
                        <span className="text-2xl">{candidate.party_symbol || "🏛️"}</span>
                      </div>
                      <p className="text-sm text-gray-600">{candidate.party}</p>
                    </div>
                    
                    {selectedCandidate?.id === candidate.id && (
                      <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No candidates available for this constituency
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button
          onClick={handleConfirmVote}
          className="w-full"
          disabled={!selectedCandidate || candidates.length === 0}
        >
          {selectedCandidate ? 'Confirm Vote' : 'Select a Candidate'}
        </Button>
      </CardFooter>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Your Vote</AlertDialogTitle>
            <AlertDialogDescription>
              Please verify your selection. Once confirmed, your vote cannot be changed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {selectedCandidate && (
            <div className="border rounded-lg p-4 my-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  {selectedCandidate.image_url ? (
                    <img 
                      src={selectedCandidate.image_url} 
                      alt={selectedCandidate.name} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-800 font-semibold text-xl">
                      {selectedCandidate.name.charAt(0)}
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium">{selectedCandidate.name}</h4>
                  <p className="text-sm text-gray-600">{selectedCandidate.party}</p>
                </div>
                
                <div className="ml-auto text-2xl">{selectedCandidate.party_symbol || "🏛️"}</div>
              </div>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={votingInProgress}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={castVote} disabled={votingInProgress}>
              {votingInProgress ? "Processing..." : "Confirm Vote"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default Ballot;