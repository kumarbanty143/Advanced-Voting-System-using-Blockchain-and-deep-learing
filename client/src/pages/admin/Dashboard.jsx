// client/src/pages/admin/Dashboard.jsx
import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  BarChart3, Users, Calendar, Settings, Vote, FileText, LogOut, 
  Plus, ChevronRight, Home
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

import DashboardOverview from '@/components/admin/Dashboard';
import VoterManagement from '@/components/admin/VoterManagement';
import ElectionsList from '@/components/admin/ElectionsList';
import ElectionForm from '@/components/admin/ElectionForm';
import CandidateForm from '@/components/admin/CandidateForm';
import ResultsVisualization from '@/components/results/ResultsVisualization';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Parse the current path to highlight the active nav item
  const currentPath = location.pathname.split('/')[2] || '';
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <div className="text-sm breadcrumbs">
          <ul className="flex items-center space-x-2">
            <li><Link to="/admin" className="flex items-center"><Home className="h-3.5 w-3.5 mr-1" /> Admin</Link></li>
            {currentPath && (
              <>
                <li><ChevronRight className="h-3.5 w-3.5" /></li>
                <li className="capitalize">{currentPath}</li>
              </>
            )}
          </ul>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="p-4 bg-blue-50 border-b">
              <h2 className="font-bold text-lg text-blue-800">Admin Dashboard</h2>
              <p className="text-sm text-blue-600">Election management system</p>
            </div>
            
            <nav className="p-2">
              <ul className="space-y-1">
                <li>
                  <Link 
                    to="/admin" 
                    className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 ${
                      currentPath === '' ? 'bg-gray-100 font-medium' : ''
                    }`}
                  >
                    <BarChart3 className={`h-5 w-5 ${currentPath === '' ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span>Overview</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/voters" 
                    className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 ${
                      currentPath === 'voters' ? 'bg-gray-100 font-medium' : ''
                    }`}
                  >
                    <Users className={`h-5 w-5 ${currentPath === 'voters' ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span>Voter Management</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/elections" 
                    className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 ${
                      currentPath === 'elections' ? 'bg-gray-100 font-medium' : ''
                    }`}
                  >
                    <Vote className={`h-5 w-5 ${currentPath === 'elections' ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span>Election Setup</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/results" 
                    className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 ${
                      currentPath === 'results' ? 'bg-gray-100 font-medium' : ''
                    }`}
                  >
                    <FileText className={`h-5 w-5 ${currentPath === 'results' ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span>Results</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/settings" 
                    className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 ${
                      currentPath === 'settings' ? 'bg-gray-100 font-medium' : ''
                    }`}
                  >
                    <Settings className={`h-5 w-5 ${currentPath === 'settings' ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span>Settings</span>
                  </Link>
                </li>
                <li className="pt-4 border-t mt-2">
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-red-50 text-red-600 w-full text-left"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 bg-white border rounded-lg p-6">
          <Routes>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="/voters" element={<VoterManagement />} />
            <Route path="/elections" element={<ElectionsList />} />
            <Route path="/elections/create" element={<ElectionForm />} />
            <Route path="/elections/:electionId/edit" element={<ElectionForm />} />
            <Route path="/elections/:electionId/candidates/create" element={<CandidateForm />} />
            <Route path="/elections/:electionId/candidates/:candidateId/edit" element={<CandidateForm />} />
            <Route path="/elections/:electionId/results" element={<ResultsVisualization />} />
            <Route path="/results" element={<div className="text-center py-8 text-gray-500">Select an election to view results</div>} />
            <Route path="/settings" element={<div className="text-center py-8 text-gray-500">Settings page (under development)</div>} />
          </Routes>
        </div>
      </div>
    </div>
  );
};