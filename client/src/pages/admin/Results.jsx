// src/pages/admin/Results.jsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BarChart2, PieChart, Download, RefreshCw, ChevronDown, FileText, CheckSquare } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';

// Mock result data
const mockResultData = {
  electionId: 1,
  electionName: "2023 General Election",
  totalVotes: 7823,
  votingPercentage: 62.8,
  results: [
    { party: "National Democratic Alliance", votes: 3245, percentage: 41.5, seats: 3, color: "#FF6B35" },
    { party: "United Progressive Alliance", votes: 2890, percentage: 36.9, seats: 2, color: "#2E86AB" },
    { party: "Regional Democratic Front", votes: 1120, percentage: 14.3, seats: 0, color: "#A5C882" },
    { party: "Progressive People's Party", votes: 398, percentage: 5.1, seats: 0, color: "#8A4FFF" },
    { party: "Independent Candidates", votes: 170, percentage: 2.2, seats: 0, color: "#929292" }
  ],
  constituencies: [
    { 
      name: "East Delhi", 
      totalVotes: 1895,
      votingPercentage: 68.4,
      candidates: [
        { name: "Rahul Sharma", party: "NDA", votes: 845, percentage: 44.6 },
        { name: "Priya Patel", party: "UPA", votes: 760, percentage: 40.1 },
        { name: "Ahmed Khan", party: "RDF", votes: 223, percentage: 11.8 },
        { name: "Others", party: "Others", votes: 67, percentage: 3.5 }
      ]
    },
    { 
      name: "West Delhi", 
      totalVotes: 1756,
      votingPercentage: 64.2,
      candidates: [
        { name: "Anita Gupta", party: "NDA", votes: 765, percentage: 43.6 },
        { name: "Vijay Singh", party: "UPA", votes: 674, percentage: 38.4 },
        { name: "Deepak Kumar", party: "RDF", votes: 254, percentage: 14.5 },
        { name: "Others", party: "Others", votes: 63, percentage: 3.6 }
      ]
    },
    { 
      name: "North Delhi", 
      totalVotes: 1654,
      votingPercentage: 59.8,
      candidates: [
        { name: "Ravi Kapoor", party: "UPA", votes: 723, percentage: 43.7 },
        { name: "Sunita Verma", party: "NDA", votes: 685, percentage: 41.4 },
        { name: "Manish Tiwari", party: "RDF", votes: 198, percentage: 12.0 },
        { name: "Others", party: "Others", votes: 48, percentage: 2.9 }
      ]
    },
    { 
      name: "South Delhi", 
      totalVotes: 1432,
      votingPercentage: 57.3,
      candidates: [
        { name: "Shreya Reddy", party: "UPA", votes: 733, percentage: 51.2 },
        { name: "Aakash Malhotra", party: "NDA", votes: 455, percentage: 31.8 },
        { name: "Neha Sharma", party: "RDF", votes: 196, percentage: 13.7 },
        { name: "Others", party: "Others", votes: 48, percentage: 3.4 }
      ]
    },
    { 
      name: "Central Delhi", 
      totalVotes: 1086,
      votingPercentage: 57.6,
      candidates: [
        { name: "Vikram Chaudhary", party: "NDA", votes: 495, percentage: 45.6 },
        { name: "Meera Saxena", party: "UPA", votes: 312, percentage: 28.7 },
        { name: "Rakesh Kumar", party: "RDF", votes: 249, percentage: 22.9 },
        { name: "Others", party: "Others", votes: 30, percentage: 2.8 }
      ]
    }
  ]
};

export default function AdminResults() {
  const { toast } = useToast();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  
  useEffect(() => {
    // In a real app, fetch data from API
    // const fetchResults = async () => {
    //   try {
    //     const response = await axios.get('/api/admin/elections/1/results');
    //     setResults(response.data);
    //   } catch (error) {
    //     console.error('Error fetching results:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    
    // Simulate API call
    setTimeout(() => {
      setResults(mockResultData);
      setLoading(false);
    }, 1000);
  }, []);
  
  const handlePublishResults = () => {
    setPublishDialogOpen(true);
  };
  
  const confirmPublishResults = () => {
    // In a real app, this would be an API call
    // const publishResults = async () => {
    //   try {
    //     await axios.post(`/api/admin/elections/${results.electionId}/publish`);
    //     toast({
    //       title: "Results published",
    //       description: "Election results are now publicly available",
    //     });
    //   } catch (error) {
    //     console.error('Error publishing results:', error);
    //     toast({
    //       variant: "destructive",
    //       title: "Error",
    //       description: "Failed to publish results. Please try again.",
    //     });
    //   }
    // };
    
    // Simulate API call
    toast({
      title: "Results published",
      description: "Election results are now publicly available",
    });
    
    setPublishDialogOpen(false);
  };
  
  const handleDownloadResults = () => {
    toast({
      title: "Download started",
      description: "Election results are being downloaded as a PDF file",
    });
    
    // In a real app, this would download a file
    // window.location.href = `/api/admin/elections/${results.electionId}/export`;
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">{results.electionName} Results</h2>
          <p className="text-gray-500">Administration and Analysis</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            className="gap-2"
            onClick={handleDownloadResults}
          >
            <Download className="h-4 w-4" />
            Export Results
          </Button>
          <Button 
            className="gap-2"
            onClick={handlePublishResults}
          >
            <CheckSquare className="h-4 w-4" />
            Publish Results
          </Button>
        </div>
      </div>
      
      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-500">Total Votes</div>
            <div className="text-3xl font-bold mt-1">{results.totalVotes.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-1">{results.votingPercentage}% turnout</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-500">Leading Party</div>
            <div className="text-3xl font-bold mt-1">{results.results[0].party.split(' ').map(word => word[0]).join('')}</div>
            <div className="text-sm text-gray-500 mt-1">{results.results[0].percentage}% of votes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-500">Total Constituencies</div>
            <div className="text-3xl font-bold mt-1">{results.constituencies.length}</div>
            <div className="text-sm text-gray-500 mt-1">100% reported</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-500">Status</div>
            <div className="text-3xl font-bold mt-1 text-green-600">Final</div>
            <div className="text-sm text-gray-500 mt-1">Ready to publish</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overall" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="overall">Overall Results</TabsTrigger>
          <TabsTrigger value="constituencies">Constituency Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overall">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5" />
                  Party-wise Vote Share
                </CardTitle>
                <CardDescription>
                  Total votes received by each party
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {results.results.map((party, i) => (
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
                            backgroundColor: party.color 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Seat Distribution
                </CardTitle>
                <CardDescription>
                  Seats won by each party
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center py-4">
                  {/* In a real app, this would be a pie chart component */}
                  <div className="text-center bg-gray-100 p-12 rounded-full">
                    Pie Chart Placeholder
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  {results.results.filter(p => p.seats > 0).map((party, i) => (
                    <div key={i} className="flex justify-between items-center px-2 py-1">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: party.color }}
                        ></div>
                        <span>{party.party}</span>
                      </div>
                      <span className="font-medium">{party.seats} seats</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="constituencies">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Constituency-wise Results
              </CardTitle>
              <CardDescription>
                Detailed results for each constituency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {results.constituencies.map((constituency, i) => (
                  <div key={i} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{constituency.name}</h3>
                        <div className="text-sm text-gray-500">
                          {constituency.totalVotes.toLocaleString()} votes • {constituency.votingPercentage}% turnout
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="space-y-3">
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
                                    className="h-full rounded-full bg-blue-600" 
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Publish Results Dialog */}
      <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Election Results</AlertDialogTitle>
            <AlertDialogDescription>
              This will make the results publicly visible to all users. This action cannot be undone. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPublishResults} className="bg-blue-600 text-white hover:bg-blue-700">
              Publish Results
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}