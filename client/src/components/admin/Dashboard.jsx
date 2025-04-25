// client/src/components/admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, Vote, Calendar, CheckSquare, BarChart2, TrendingUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import axios from '@/lib/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalVoters: 0,
    verifiedVoters: 0,
    totalVotes: 0,
    activeElections: 0,
    upcomingElections: 0,
    completedElections: 0
  });
  const [loading, setLoading] = useState(true);
  
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/admin/stats');
        setStats(response.data.stats);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load dashboard statistics"
        });
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Registered Voters</p>
                <p className="text-2xl font-bold mt-1">{stats.totalVoters.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.verifiedVoters.toLocaleString()} verified ({Math.round((stats.verifiedVoters / stats.totalVoters) * 100) || 0}%)
                </p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Votes Cast</p>
                <p className="text-2xl font-bold mt-1">{stats.totalVotes.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {Math.round((stats.totalVotes / stats.verifiedVoters) * 100) || 0}% participation rate
                </p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckSquare className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Elections</p>
                <p className="text-2xl font-bold mt-1">
                  {stats.activeElections + stats.upcomingElections + stats.completedElections}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.activeElections} active, {stats.upcomingElections} upcoming
                </p>
              </div>
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Vote className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link to="/admin/elections/create">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Create New Election
                </Button>
              </Link>
              <Link to="/admin/voters">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Voters
                </Button>
              </Link>
              <Link to="/admin/results">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart2 className="mr-2 h-4 w-4" />
                  View Results
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span>Database Connection</span>
                </div>
                <span className="text-sm text-green-600">Connected</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span>Blockchain Service</span>
                </div>
                <span className="text-sm text-green-600">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span>Face Recognition Service</span>
                </div>
                <span className="text-sm text-green-600">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;