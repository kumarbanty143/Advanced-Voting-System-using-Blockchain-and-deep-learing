// src/pages/Results.jsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, BarChart3, Clock, User, List, Award, Map } from 'lucide-react';
import axios from '@/lib/api';

// Mock result data
const mockResultData = {
  totalVotes: 1254876,
  votingPercentage: 67.8,
  leadingParty: "National Democratic Alliance",
  totalConstituencies: 543,
  declaredConstituencies: 498,
  results: [
    { party: "National Democratic Alliance", seats: 245, color: "#FF6B35" },
    { party: "United Progressive Alliance", seats: 189, color: "#2E86AB" },
    { party: "Regional Democratic Front", seats: 35, color: "#A5C882" },
    { party: "Progressive People's Party", seats: 15, color: "#8A4FFF" },
    { party: "Others", seats: 14, color: "#929292" }
  ],
  constituencies: [
    { 
      name: "East Delhi", 
      winner: "Rahul Sharma", 
      party: "NDA", 
      votes: 456789, 
      margin: 52345,
      status: "Declared"
    },
    { 
      name: "West Delhi", 
      winner: "Priya Patel", 
      party: "UPA", 
      votes: 423156, 
      margin: 12567,
      status: "Declared"
    },
    { 
      name: "North Delhi", 
      winner: "Ahmed Khan", 
      party: "RDF", 
      votes: 392654, 
      margin: 8765,
      status: "Declared"
    },
    { 
      name: "South Delhi", 
      winner: "Lakshmi Rao", 
      party: "UPA", 
      votes: 387621, 
      margin: 5432,
      status: "Declared"
    },
    { 
      name: "Central Delhi", 
      winner: "Counting in progress", 
      party: "", 
      votes: 0, 
      margin: 0,
      status: "Counting"
    }
  ]
};

export default function Results() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        
        // In a real app, this would be an API call
        // const response = await axios.get('/api/results');
        
        // Using mock data for now
        setTimeout(() => {
          setResults(mockResultData);
          setLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Error fetching results:', error);
        setLoading(false);
      }
    };
    
    fetchResults();
  }, []);
  
  if (loading || !results) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <Clock className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading election results...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-5xl mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Election Results</h1>
        <p className="text-gray-600 mt-2">Live election results and statistics</p>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Votes</p>
                <p className="text-2xl font-bold mt-1">{results.totalVotes.toLocaleString()}</p>
              </div>
              <div className="h-9 w-9 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {results.votingPercentage}% voter turnout
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Leading Party</p>
                <p className="text-2xl font-bold mt-1">{results.results[0].party.split(' ').map(p => p[0]).join('')}</p>
              </div>
              <div className="h-9 w-9 bg-orange-100 rounded-lg flex items-center justify-center">
                <Award className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {results.results[0].seats} of {results.totalConstituencies} seats
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Results Declared</p>
                <p className="text-2xl font-bold mt-1">{results.declaredConstituencies}</p>
              </div>
              <div className="h-9 w-9 bg-green-100 rounded-lg flex items-center justify-center">
                <List className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {Math.round(results.declaredConstituencies / results.totalConstituencies * 100)}% of total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Constituencies</p>
                <p className="text-2xl font-bold mt-1">{results.totalConstituencies}</p>
              </div>
              <div className="h-9 w-9 bg-purple-100 rounded-lg flex items-center justify-center">
                <Map className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {results.totalConstituencies - results.declaredConstituencies} counting in progress
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="constituencies">Constituencies</TabsTrigger>
          <TabsTrigger value="verification">Vote Verification</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Party-wise Results
              </CardTitle>
              <CardDescription>
                Current seat distribution among political parties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {results.results.map((party, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{party.party}</span>
                      <span className="font-medium">{party.seats} seats</span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: `${(party.seats / results.totalConstituencies) * 100}%`, 
                          backgroundColor: party.color 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Leading Candidates
                </CardTitle>
                <CardDescription>
                  Candidates with highest victory margins
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.constituencies
                    .filter(c => c.status === "Declared")
                    .sort((a, b) => b.margin - a.margin)
                    .slice(0, 5)
                    .map((constituency, i) => (
                      <div key={i} className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0">
                        <div>
                          <p className="font-medium">{constituency.winner}</p>
                          <p className="text-sm text-gray-600">{constituency.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{constituency.party}</p>
                          <p className="text-sm text-gray-600">Margin: {constituency.margin.toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Declarations
                </CardTitle>
                <CardDescription>
                  Latest announced constituency results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.constituencies
                    .filter(c => c.status === "Declared")
                    .slice(0, 5)
                    .map((constituency, i) => (
                      <div key={i} className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0">
                        <div>
                          <p className="font-medium">{constituency.name}</p>
                          <p className="text-sm text-gray-600">{constituency.winner}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{constituency.party}</p>
                          <p className="text-sm text-gray-600">{constituency.votes.toLocaleString()} votes</p>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="constituencies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                Constituency Results
              </CardTitle>
              <CardDescription>
                Results by individual constituencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="py-3 px-4 text-left font-medium text-gray-600">Constituency</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-600">Winner</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-600">Party</th>
                      <th className="py-3 px-4 text-right font-medium text-gray-600">Votes</th>
                      <th className="py-3 px-4 text-right font-medium text-gray-600">Margin</th>
                      <th className="py-3 px-4 text-center font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.constituencies.map((constituency, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-3 px-4 font-medium">{constituency.name}</td>
                        <td className="py-3 px-4">{constituency.winner}</td>
                        <td className="py-3 px-4">{constituency.party}</td>
                        <td className="py-3 px-4 text-right">{constituency.votes.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">{constituency.margin.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            constituency.status === "Declared" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {constituency.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="verification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Vote Verification
              </CardTitle>
              <CardDescription>
                Verify your vote was counted correctly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <p className="font-medium">Blockchain Verification</p>
                  <p className="mt-1">
                    Enter your vote transaction hash to verify your vote was recorded correctly on the blockchain.
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter vote transaction hash"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <button className="h-10 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                    Verify
                  </button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <p className="text-center text-gray-500">
                    Enter your transaction hash above to verify your vote
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}