// client/src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { User, Lock, History, AlertCircle, Check, Edit, Key } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import axios from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function Profile() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [voteHistory, setVoteHistory] = useState([]);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
  });
  
  const { toast } = useToast();
  
  useEffect(() => {
    // Fetch vote history
    const fetchVoteHistory = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/voters/vote-history');
        setVoteHistory(response.data.votes);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching vote history:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load vote history"
        });
        setLoading(false);
      }
    };
    
    fetchVoteHistory();
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await axios.put('/api/voters/profile', formData);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully"
      });
      
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.response?.data?.message || "Failed to update profile"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "New password and confirmation must match"
      });
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 8 characters long"
      });
      return;
    }
    
    try {
      setLoading(true);
      await axios.put('/api/voters/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      toast({
        title: "Password changed",
        description: "Your password has been updated successfully"
      });
      
      // Reset form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.response?.data?.message || "Failed to change password"
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !currentUser) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">My Profile</h1>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Voting History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Manage your account details
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(!editMode)}
                  className="flex items-center gap-1.5"
                >
                  {editMode ? (
                    <>Cancel</>
                  ) : (
                    <>
                      <Edit className="h-4 w-4" />
                      Edit
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  {editMode ? (
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                    />
                  ) : (
                    <p className="text-gray-700 border rounded-md p-2.5">{currentUser?.name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  {editMode ? (
                    <Input
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Your email address"
                    />
                  ) : (
                    <p className="text-gray-700 border rounded-md p-2.5">{currentUser?.email}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Voter ID</Label>
                  <p className="text-gray-700 border rounded-md p-2.5">{currentUser?.voterId}</p>
                  <p className="text-xs text-gray-500">Voter ID cannot be changed</p>
                </div>
                
                <div className="space-y-2">
                  <Label>Constituency</Label>
                  <p className="text-gray-700 border rounded-md p-2.5">{currentUser?.constituency}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Label>Verification Status:</Label>
                <Badge className={currentUser?.isVerified ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
                  {currentUser?.isVerified ? "Verified" : "Not Verified"}
                </Badge>
              </div>
            </CardContent>
            {editMode && (
              <CardFooter>
                <Button
                  disabled={loading}
                  onClick={handleSaveProfile}
                  className="ml-auto"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter your current password"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Create a new password"
                    required
                  />
                  <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm your new password"
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  className="flex items-center gap-1.5"
                  disabled={loading}
                >
                  <Key className="h-4 w-4" />
                  {loading ? "Updating..." : "Change Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Voting History</CardTitle>
              <CardDescription>
                Record of your past votes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <LoadingSpinner size="small" />
              ) : voteHistory.length > 0 ? (
                <div className="space-y-4">
                  {voteHistory.map((vote, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{vote.election_name}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(vote.timestamp).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          Vote Recorded
                        </Badge>
                      </div>
                      
                      <div className="mt-3 text-sm">
                        <div className="bg-gray-50 p-3 rounded-md font-mono text-xs break-all">
                          {vote.vote_hash}
                        </div>
                        <p className="mt-2 text-blue-600">
                          <a href={`/verify?hash=${vote.vote_hash}`} className="flex items-center gap-1.5">
                            <Check className="h-3.5 w-3.5" />
                            Verify this vote
                          </a>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="flex justify-center">
                    <AlertCircle className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="mt-4 text-gray-600">You haven't cast any votes yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}