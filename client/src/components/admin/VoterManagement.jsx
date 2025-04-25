// client/src/components/admin/VoterManagement.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Search, UserPlus, User, CheckCircle, XCircle, Edit, Trash2, UserCheck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import axios from '@/lib/api';

const VoterManagement = () => {
  const [voters, setVoters] = useState([]);
  const [filteredVoters, setFilteredVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState('all');
  const [selectedVoter, setSelectedVoter] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  
  const { toast } = useToast();
  
  // Fetch voters
  useEffect(() => {
    fetchVoters();
  }, []);
  
  const fetchVoters = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/voters');
      setVoters(response.data.voters);
      setFilteredVoters(response.data.voters);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching voters:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load voters"
      });
      setLoading(false);
    }
  };
  
  // Filter voters based on tab and search query
  useEffect(() => {
    let result = [...voters];
    
    // Apply tab filter
    if (currentTab === 'verified') {
      result = result.filter(voter => voter.is_verified);
    } else if (currentTab === 'unverified') {
      result = result.filter(voter => !voter.is_verified);
    } else if (currentTab === 'voted') {
      result = result.filter(voter => voter.has_voted);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(voter => 
        voter.name.toLowerCase().includes(query) ||
        voter.email.toLowerCase().includes(query) ||
        voter.voter_id.toLowerCase().includes(query) ||
        voter.constituency.toLowerCase().includes(query)
      );
    }
    
    setFilteredVoters(result);
  }, [voters, currentTab, searchQuery]);
  
  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle tab change
  const handleTabChange = (value) => {
    setCurrentTab(value);
  };
  
  // Handle delete voter
  const handleDeleteVoter = (voter) => {
    setSelectedVoter(voter);
    setIsDeleteDialogOpen(true);
  };
  
  // Confirm delete
  const confirmDeleteVoter = async () => {
    try {
      await axios.delete(`/api/admin/voters/${selectedVoter.id}`);
      
      // Update state
      setVoters(voters.filter(v => v.id !== selectedVoter.id));
      
      toast({
        title: "Voter deleted",
        description: `${selectedVoter.name} has been removed from the system`
      });
      
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting voter:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to delete voter"
      });
    }
  };
  
  // Handle verify voter
  const handleVerifyVoter = (voter) => {
    setSelectedVoter(voter);
    setIsVerifyDialogOpen(true);
  };
  
  // Confirm verify
  const confirmVerifyVoter = async () => {
    try {
      await axios.patch(`/api/admin/voters/${selectedVoter.id}/verify`);
      
      // Update state
      setVoters(voters.map(v => 
        v.id === selectedVoter.id ? { ...v, is_verified: true } : v
      ));
      
      toast({
        title: "Voter verified",
        description: `${selectedVoter.name} has been verified successfully`
      });
      
      setIsVerifyDialogOpen(false);
    } catch (error) {
      console.error('Error verifying voter:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to verify voter"
      });
    }
  };
  
  // Format createdAt date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
        <h2 className="text-2xl font-bold">Voter Management</h2>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add Voter
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search voters..."
            className="pl-9"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        
        <Tabs defaultValue="all" value={currentTab} onValueChange={handleTabChange} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="all">All Voters</TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
            <TabsTrigger value="unverified">Unverified</TabsTrigger>
            <TabsTrigger value="voted">Voted</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="py-3 px-4 text-left font-medium text-gray-600">Name</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-600">Voter ID</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-600">Constituency</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-600">Status</th>
                  <th className="py-3 px-4 text-center font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVoters.length > 0 ? (
                  filteredVoters.map(voter => (
                    <tr key={voter.id} className="border-b">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{voter.name}</p>
                          <p className="text-sm text-gray-500">{voter.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">{voter.voter_id}</td>
                      <td className="py-3 px-4">{voter.constituency}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <Badge className={voter.is_verified ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-amber-100 text-amber-800 hover:bg-amber-100"}>
                            {voter.is_verified ? "Verified" : "Unverified"}
                          </Badge>
                          {voter.has_voted && (
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                              Voted
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                          {!voter.is_verified && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 px-2 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                              onClick={() => handleVerifyVoter(voter)}
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 px-2 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 px-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleDeleteVoter(voter)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500">
                      No voters found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Voter</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedVoter?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteVoter} className="bg-red-600 text-white hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Verify Confirmation Dialog */}
      <AlertDialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verify Voter</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark {selectedVoter?.name} as verified, allowing them to vote in elections. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmVerifyVoter} className="bg-green-600 text-white hover:bg-green-700">
              Verify
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VoterManagement;