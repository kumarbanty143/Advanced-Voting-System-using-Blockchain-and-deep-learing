// client/src/components/admin/ElectionsList.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash, Play, Square, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import axios from '@/lib/api';

const ElectionsList = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElection, setSelectedElection] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [statusAction, setStatusAction] = useState('');
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Fetch elections
  useEffect(() => {
    fetchElections();
  }, []);
  
  const fetchElections = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/elections');
      setElections(response.data.elections);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching elections:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load elections"
      });
      setLoading(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Handle delete election
  const handleDeleteElection = (election) => {
    setSelectedElection(election);
    setIsDeleteDialogOpen(true);
  };
  
  // Confirm delete
  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/elections/${selectedElection.id}`);
      
      toast({
        title: "Election deleted",
        description: "The election has been removed successfully"
      });
      
      // Refresh the list
      fetchElections();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting election:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to delete election"
      });
    }
  };
  
  // Handle election status change
  const handleStatusChange = (election, action) => {
    setSelectedElection(election);
    setStatusAction(action);
    setIsStatusDialogOpen(true);
  };
  
  // Confirm status change
  const confirmStatusChange = async () => {
    try {
      const endpoint = statusAction === 'start' 
        ? `/api/elections/${selectedElection.id}/start`
        : `/api/elections/${selectedElection.id}/end`;
      
      await axios.patch(endpoint);
      
      toast({
        title: statusAction === 'start' ? "Election started" : "Election ended",
        description: statusAction === 'start' 
          ? "The election is now active and open for voting"
          : "The election has been marked as completed"
      });
      
      // Refresh the list
      fetchElections();
      setIsStatusDialogOpen(false);
    } catch (error) {
      console.error('Error updating election status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update election status"
      });
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Elections</h2>
        <Button
          onClick={() => navigate('/admin/elections/create')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Election
        </Button>
      </div>
      
      {elections.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {elections.map(election => (
            <Card key={election.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{election.name}</CardTitle>
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
                <p className="text-sm text-gray-500">{election.type} Election</p>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Date Range</h3>
                    <div className="flex space-x-4">
                      <div className="flex-1 border rounded-md p-3">
                        <p className="text-xs text-gray-500">Start</p>
                        <p className="font-medium">{formatDate(election.start_date)}</p>
                      </div>
                      <div className="flex-1 border rounded-md p-3">
                        <p className="text-xs text-gray-500">End</p>
                        <p className="font-medium">{formatDate(election.end_date)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Constituencies</h3>
                    <div className="border rounded-md p-3">
                      <p className="font-medium">{election.constituency_count || 0} constituencies</p>
                      <Link 
                        to={`/admin/elections/${election.id}/constituencies`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View constituencies
                      </Link>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 justify-end">
                  <Link to={`/admin/elections/${election.id}/results`}>
                    <Button variant="outline" className="gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Results
                    </Button>
                  </Link>
                  
                  <Link to={`/admin/elections/${election.id}/edit`}>
                    <Button variant="outline" className="gap-2">
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  
                  {election.status === 'upcoming' && (
                    <Button 
                      variant="outline" 
                      className="gap-2 text-green-600"
                      onClick={() => handleStatusChange(election, 'start')}
                    >
                      <Play className="h-4 w-4" />
                      Start
                    </Button>
                  )}
                  
                  {election.status === 'active' && (
                    <Button 
                      variant="outline" 
                      className="gap-2 text-amber-600"
                      onClick={() => handleStatusChange(election, 'end')}
                    >
                      <Square className="h-4 w-4" />
                      End
                    </Button>
                  )}
                  
                  {election.status !== 'active' && (
                    <Button 
                      variant="outline" 
                      className="gap-2 text-red-600"
                      onClick={() => handleDeleteElection(election)}
                    >
                      <Trash className="h-4 w-4" />
                      Delete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No elections found</p>
              <Button
                onClick={() => navigate('/admin/elections/create')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Your First Election
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
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
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 text-white hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusAction === 'start' ? 'Start Election' : 'End Election'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusAction === 'start' 
                ? `This will make ${selectedElection?.name} active and open for voting. Continue?`
                : `This will end ${selectedElection?.name} and prevent further voting. Continue?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>
              {statusAction === 'start' ? 'Start Election' : 'End Election'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ElectionsList;