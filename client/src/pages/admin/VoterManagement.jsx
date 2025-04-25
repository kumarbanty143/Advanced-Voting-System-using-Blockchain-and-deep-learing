// src/pages/admin/VoterManagement.jsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, Check, X, Edit, Trash2, AlertCircle, UserCheck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Mock voter data
const mockVoters = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    voterId: "ABC1234567",
    aadhaarId: "********1234",
    constituency: "East Delhi",
    verified: true,
    voted: true,
    registeredOn: "2023-01-15"
  },
  {
    id: 2,
    name: "Priya Patel",
    email: "priya.patel@example.com",
    voterId: "DEF7891234",
    aadhaarId: "********5678",
    constituency: "West Delhi",
    verified: true,
    voted: false,
    registeredOn: "2023-01-18"
  },
  {
    id: 3,
    name: "Ahmed Khan",
    email: "ahmed.khan@example.com",
    voterId: "GHI4567890",
    aadhaarId: "********9012",
    constituency: "North Delhi",
    verified: false,
    voted: false,
    registeredOn: "2023-01-20"
  },
  {
    id: 4,
    name: "Lakshmi Rao",
    email: "lakshmi.rao@example.com",
    voterId: "JKL7890123",
    aadhaarId: "********3456",
    constituency: "South Delhi",
    verified: true,
    voted: true,
    registeredOn: "2023-01-22"
  },
  {
    id: 5,
    name: "Vikram Singh",
    email: "vikram.singh@example.com",
    voterId: "MNO1234567",
    aadhaarId: "********7890",
    constituency: "Central Delhi",
    verified: false,
    voted: false,
    registeredOn: "2023-01-25"
  }
];

export default function VoterManagement() {
  const { toast } = useToast();
  const [voters, setVoters] = useState([]);
  const [filteredVoters, setFilteredVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState('all');
  const [selectedVoter, setSelectedVoter] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  
  useEffect(() => {
    // In a real app, fetch data from API
    // const fetchVoters = async () => {
    //   try {
    //     const response = await axios.get('/api/admin/voters');
    //     setVoters(response.data);
    //     setFilteredVoters(response.data);
    //   } catch (error) {
    //     console.error('Error fetching voters:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    
    // Simulate API call
    setTimeout(() => {
      setVoters(mockVoters);
      setFilteredVoters(mockVoters);
      setLoading(false);
    }, 1000);
  }, []);
  
  // Filter voters based on tab and search query
  useEffect(() => {
    let result = [...voters];
    
    // Apply tab filter
    if (currentTab === 'verified') {
      result = result.filter(voter => voter.verified);
    } else if (currentTab === 'unverified') {
      result = result.filter(voter => !voter.verified);
    } else if (currentTab === 'voted') {
      result = result.filter(voter => voter.voted);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(voter => 
        voter.name.toLowerCase().includes(query) ||
        voter.email.toLowerCase().includes(query) ||
        voter.voterId.toLowerCase().includes(query) ||
        voter.constituency.toLowerCase().includes(query)
      );
    }
    
    setFilteredVoters(result);
  }, [voters, currentTab, searchQuery]);
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleTabChange = (value) => {
    setCurrentTab(value);
  };
  
  const handleDeleteVoter = (voter) => {
    setSelectedVoter(voter);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteVoter = () => {
    // In a real app, delete voter via API
    // const deleteVoter = async () => {
    //   try {
    //     await axios.delete(`/api/admin/voters/${selectedVoter.id}`);
    //     setVoters(voters.filter(v => v.id !== selectedVoter.id));
    //     toast({
    //       title: "Voter deleted",
    //       description: `${selectedVoter.name} has been removed from the system`,
    //     });
    //   } catch (error) {
    //     console.error('Error deleting voter:', error);
    //     toast({
    //       variant: "destructive",
    //       title: "Error",
    //       description: "Failed to delete voter. Please try again.",
    //     });
    //   }
    // };
    
    // Simulate API call
    setVoters(voters.filter(v => v.id !== selectedVoter.id));
    toast({
      title: "Voter deleted",
      description: `${selectedVoter.name} has been removed from the system`,
    });
    
    setIsDeleteDialogOpen(false);
    setSelectedVoter(null);
  };
  
  const handleVerifyVoter = (voter) => {
    setSelectedVoter(voter);
    setIsVerifyDialogOpen(true);
  };
  
  const confirmVerifyVoter = () => {
    // In a real app, verify voter via API
    // const verifyVoter = async () => {
    //   try {
    //     await axios.patch(`/api/admin/voters/${selectedVoter.id}/verify`);
    //     setVoters(voters.map(v => 
    //       v.id === selectedVoter.id ? { ...v, verified: true } : v
    //     ));
    //     toast({
    //       title: "Voter verified",
    //       description: `${selectedVoter.name} has been verified successfully`,
    //     });
    //   } catch (error) {
    //     console.error('Error verifying voter:', error);
    //     toast({
    //       variant: "destructive",
    //       title: "Error",
    //       description: "Failed to verify voter. Please try again.",
    //     });
    //   }
    // };
    
    // Simulate API call
    setVoters(voters.map(v => 
      v.id === selectedVoter.id ? { ...v, verified: true } : v
    ));
    toast({
      title: "Voter verified",
      description: `${selectedVoter.name} has been verified successfully`,
    });
    
    setIsVerifyDialogOpen(false);
    setSelectedVoter(null);
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
        <h2 className="text-2xl font-bold">Voter Management</h2>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add Voter
        </Button>
      </div>
      
      <div className="mb-6 flex flex-col md:flex-row gap-4">
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
                      <td className="py-3 px-4">{voter.voterId}</td>
                      <td className="py-3 px-4">{voter.constituency}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <Badge className={voter.verified ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-amber-100 text-amber-800 hover:bg-amber-100"}>
                            {voter.verified ? "Verified" : "Unverified"}
                          </Badge>
                          {voter.voted && (
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                              Voted
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                          {!voter.verified && (
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
}