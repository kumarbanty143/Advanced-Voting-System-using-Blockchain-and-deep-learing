// client/src/components/results/ResultsVisualization.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart2, PieChart, MapPin } from 'lucide-react';
import axios from '@/lib/api';

const ResultsVisualization = ({ electionId }) => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/elections/${electionId}/results`);
        setResults(response.data.results);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching results:', err);
        setError('Failed to load election results');
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [electionId]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500 py-8">
            <p className="text-lg font-medium mb-2">Error</p>
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!results) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-gray-500">Results not available yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Colors for parties (more colors can be added if needed)
  const partyColors = {
    'NDA': '#FF6B35',
    'UPA': '#2E86AB',
    'RDF': '#A5C882',
    'PPP': '#8A4FFF',
    'IND': '#929292',
    'Others': '#CCCCCC'
  };
  
  // Get a color for a party
  const getPartyColor = (party) => {
    // Try to find exact match
    if (partyColors[party]) return partyColors[party];
    
    // Try to find by abbreviation (first letter of each word)
    const abbr = party.split(' ').map(word => word[0]).join('');
    if (partyColors[abbr]) return partyColors[abbr];
    
    // Return a default color
    return '#666666';
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{results.electionName} Results</CardTitle>
          <CardDescription>
            {results.status === 'completed' ? 'Final results' : 'Provisional results'} 
            with {results.votingPercentage}% voter turnout
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-500">Total Votes</p>
              <p className="text-2xl font-bold">{results.totalVotes.toLocaleString()}</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-500">Voter Turnout</p>
              <p className="text-2xl font-bold">{results.votingPercentage}%</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-500">Leading Party</p>
              <p className="text-2xl font-bold">
                {results.partyResults[0]?.party.split(' ').map(word => word[0]).join('')}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-500">Constituencies</p>
              <p className="text-2xl font-bold">{results.constituencies.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="overall">
        <TabsList className="mb-6">
          <TabsTrigger value="overall" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Overall Results
          </TabsTrigger>
          <TabsTrigger value="constituencies" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Constituency Results
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overall">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Party-wise Vote Share</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {results.partyResults.map((party, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{party.party}</span>
                      <span className="font-medium">{party.votes.toLocaleString()} ({party.percentage}%)</span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: `${party.percentage}%`, 
                          backgroundColor: getPartyColor(party.party)
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="constituencies">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Constituency-wise Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {results.constituencies.map((constituency, i) => (
                  <div key={i} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b">
                      <h3 className="font-medium">{constituency.name}</h3>
                    </div>
                    <div className="p-4 space-y-4">
                      {constituency.candidates.map((candidate, j) => (
                        <div key={j} className="flex items-center gap-4">
                          <div className="font-medium w-40 md:w-64 truncate">
                            {candidate.name}
                            <span className="text-sm font-normal text-gray-500 ml-2">
                              ({candidate.party})
                            </span>
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-center gap-3">
                              <div className="h-2 bg-gray-200 rounded-full flex-grow overflow-hidden">
                                <div 
                                  className="h-full rounded-full" 
                                  style={{ 
                                    width: `${candidate.percentage}%`,
                                    backgroundColor: j === 0 ? '#4CAF50' : 
                                                    j === 1 ? '#2196F3' : 
                                                    j === 2 ? '#FF9800' : '#9E9E9E'
                                  }}
                                ></div>
                              </div>
                              <div className="text-sm font-medium w-24 text-right">
                                {candidate.votes.toLocaleString()} ({candidate.percentage}%)
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResultsVisualization;