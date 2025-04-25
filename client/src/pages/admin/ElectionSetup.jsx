// src/pages/admin/ElectionSetup.jsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Calendar, Clock, Plus, Edit, Trash2, Play, BarChart3, User, Flag } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Mock election data
const mockElections = [
  {
    id: 1,
    name: "2023 General Election",
    type: "General",
    startDate: "2023-03-10T09:00:00",
    endDate: "2023-03-10T18:00:00",
    status: "active",
    registeredVoters: 12456,
    votesSubmitted: 7823,
    constituencies: [
      "East Delhi", "West Delhi", "North Delhi", "South Delhi", "Central Delhi"
    ]
  },
  {
    id: 2,
    name: "Municipal Corporation Election 2023",
    type: "Municipal",
    startDate: "2023-04-15T09:00:00",
    endDate: "2023-04-15T18:00:00",
    status: "upcoming",
    registeredVoters: 10234,
    votesSubmitted: 0,
    constituencies: [
      "Ward 1", "Ward 2", "Ward 3", "Ward 4", "Ward 5"
    ]
  },
  {
    id: 3,
    name: "University Student Council Election",
    type: "Educational",
    startDate: "2023-05-20T09:00:00",
    endDate: "2023-05-20T17:00:00",
    status: "upcoming",
    registeredVoters: 5678,
    votesSubmitted: 0,
    constituencies: [
      "Engineering", "Arts", "Science", "Commerce", "Law"
    ]
  },
  {
    id: 4,
    name: "2022 By-Election",
    type: "By-Election",
    startDate: "2022-11-15T09:00:00",
    endDate: "2022-11-15T18:00:00",
    status: "completed",
    registeredVoters: 8765,
    votesSubmitted: 5432,
    constituencies: [
      "North Delhi"
    ]
  }
];

export default function ElectionSetup() {
  const { toast } = useToast();
  const [elections, setElections] = useState([]);
  const [filteredElections, setFilteredElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('all');
  const [selectedElection, setSelectedElection] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  
  useEffect(() => {
    // In a real app, fetch data from API
    // const fetchElections = async () => {
    //   try {
    //     const response = await axios.get('/api/admin/elections');
    //     setElections(response.data);
    //     setFilteredElections(response.data);
    //   } catch (error) {
    //     console.error('Error fetching elections:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    
    // Simulate API call
    setTimeout(() => {
      setElections(mockElections);
      setFilteredElections(mockElections);
      setLoading(false);
    }, 1000);
  }, []);
  
  // Filter elections based on tab
  useEffect(() => {
    let result = [...elections];
    
    // Apply tab filter
    if (currentTab === 'active') {
      result = result.filter(election => election.status === 'active');
    } else if (currentTab === 'upcoming') {
      result = result.filter(election => election.status === 'upcoming');
    } else if (currentTab === 'completed') {
      result = result.filter(election => election.status === 'completed');
    }
    
    setFilteredElections(result);
  }, [elections, currentTab]);
  
  const handleTabChange = (value) => {
    setCurrentTab(value);
  };
  
  const handleDeleteElection = (election) => {
    setSelectedElection(election);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteElection = () => {
    // In a real app, delete election via API
    // const deleteElection = async () => {
    //   try {
    //     await axios.delete(`/api/admin/elections/${selectedElection.id}`);
    //     setElections(elections.filter(e => e.id !== selectedElection.id));
    //     toast({
    //       title: "Election deleted",
    //       description: `${selectedElection.name} has been removed`,
    //     });
    //   } catch (error) {
    //     console.error('Error deleting election:', error);
    //     toast({
    //       variant: "destructive",
    //       title: "Error",
    //       description: "Failed to delete election. Please try again.",
    //     });
    //   }
    // };
    
    // Simulate API call
    setElections(elections.filter(e => e.id !== selectedElection.id));
    toast({
      title: "Election deleted",
      description: `${selectedElection.name} has been removed`,
    });
    
    setIsDeleteDialogOpen(false);
    setSelectedElection(null);
  };
  
  const handleStartElection = (election) => {
    setSelectedElection(election);
    setIsStartDialogOpen(true);
  };
  
  const confirmStartElection = () => {
    // In a real app, start election via API
    // const startElection = async () => {
    //   try {
    //     await axios.patch(`/api/admin/elections/${selectedElection.id}/start`);
    //     setElections(elections.map(e => 
    //       e.id === selectedElection.id ? { ...e, status: 'active' } : e
    //     ));
    //     toast({
    //       title: "Election started",
    //       description: `${selectedElection.name} is now active`,
    //     });
    //   } catch (error) {
    //     console.error('Error starting election:', error);
    //     toast({
    //       variant: "destructive",
    //       title: "Error",
    //       description: "Failed to start election. Please try again.",
    //     });
    //   }
    // };
    
    // Simulate API call
    setElections(elections.map(e => 
      e.id === selectedElection.id ? { ...e, status: 'active' } : e
    ));
    toast({
      title: "Election started",
      description: `${selectedElection.name} is now active`,
    });
    
    setIsStartDialogOpen(false);
    setSelectedElection(null);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <h2 className="text-2xl font-bold">Election Setup</h2>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Election
        </Button>
      </div>
      
      <Tabs defaultValue="all" value={currentTab} onValueChange={handleTabChange} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Elections</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="grid grid-cols-1 gap-6">
        {filteredElections.length > 0 ? (
          filteredElections.map(election => (
            <Card key={election.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{election.name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{election.type} Election</p>
                  </div>
                  <Badge
                    className={`
                      ${election.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                      ${election.status === 'upcoming' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : ''}
                      ${election.status === 'completed' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : ''}
                    `}
                  >
                    {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Calendar className="h-4 w-4" />
                        <span>Date & Time</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="border rounded-md p-3">
                          <Label className="text-xs">Start</Label>
                          <p className="font-medium">{formatDate(election.startDate)}</p>
                          <p className="text-sm text-gray-600">{formatTime(election.startDate)}</p>
                        </div>
                        <div className="border rounded-md p-3">
                          <Label className="text-xs">End</Label>
                          <p className="font-medium">{formatDate(election.endDate)}</p>
                          <p className="text-sm text-gray-600">{formatTime(election.endDate)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Flag className="h-4 w-4" />
                        <span>Constituencies</span>
                      </div>
                      <div className="border rounded-md p-3 flex flex-wrap gap-2">
                        {election.constituencies.map((constituency, index) => (
                          <Badge key={index} variant="outline" className="bg-gray-50">
                            {constituency}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <BarChart3 className="h-4 w-4" />
                        <span>Statistics</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="border rounded-md p-3">
                          <Label className="text-xs">Registered Voters</Label>
                          <p className="font-medium">{election.registeredVoters.toLocaleString()}</p>
                        </div>
                        <div className="border rounded-md p-3">
                          <Label className="text-xs">Votes Cast</Label>
                          <p className="font-medium">{election.votesSubmitted.toLocaleString()}</p>
                          {election.status !== 'upcoming' && (
                            <p className="text-sm text-gray-600">
                              {Math.round((election.votesSubmitted / election.registeredVoters) * 100)}% turnout
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-2">
                      {election.status === 'upcoming' && (
                        <Button
                          onClick={() => handleStartElection(election)}
                          className="gap-2 bg-green-600 hover:bg-green-700"
                        >
                          <Play className="h-4 w-4" />
                          Start Election
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      {election.status !== 'active' && (
                        <Button
                          variant="outline"
                          className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleDeleteElection(election)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 border rounded-lg bg-gray-50">
            <p className="text-gray-500">No elections found matching your criteria</p>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Election</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedElection?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteElection} className="bg-red-600 text-white hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Start Election Confirmation Dialog */}
      <AlertDialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start Election</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to start {selectedElection?.name}. This will allow voters to cast their ballots. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStartElection} className="bg-green-600 text-white hover:bg-green-700">
              Start Election
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}