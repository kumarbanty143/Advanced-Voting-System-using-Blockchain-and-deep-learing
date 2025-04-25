// client/src/pages/Results.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BarChart2, PieChart, Map, AlertCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import axios from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ResultsVisualization from '@/components/results/ResultsVisualization';

export default function Results() {
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const location = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    // Check for election ID in query params
    const params = new URLSearchParams(location.search);
    const electionId = params.get('election');
    
    if (electionId) {
      setSelectedElectionId(electionId);
    }
    
    fetchElections();
  }, [location]);
  
  const fetchElections = async () => {
    try {
      setLoading(true);
      
      // Get all elections (can be filtered by completed status in a real app)
      const response = await axios.get('/api/elections');
      
      // Filter for completed elections
      const completedElections = response.data.elections.filter(e => e.status === 'completed');
      
      if (completedElections.length === 0) {
        setError('No completed elections found');
      } else {
        setElections(completedElections);
        
        // If no election was selected via URL, select the first one
        if (!selectedElectionId && completedElections.length > 0) {
          setSelectedElectionId(completedElections[0].id.toString());
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching elections:', err);
      setError('Failed to load elections');
      setLoading(false);
    }
  };
  
  if (loading && !elections.length) {
    return <LoadingSpinner />;
  }
  
  if (error && !elections.length) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center flex-col py-10 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-medium mb-2">No Results Available</h2>
              <p className="text-gray-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto max-w-5xl py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Election Results</h1>
      
      {elections.length > 1 && (
        <div className="mb-6">
          <Select value={selectedElectionId} onValueChange={setSelectedElectionId}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Select an election" />
            </SelectTrigger>
            <SelectContent>
              {elections.map(election => (
                <SelectItem key={election.id} value={election.id.toString()}>
                  {election.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {selectedElectionId ? (
        <ResultsVisualization electionId={selectedElectionId} />
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Select an election to view results</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}