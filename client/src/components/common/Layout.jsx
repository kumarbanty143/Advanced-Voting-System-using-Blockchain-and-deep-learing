// src/components/common/Layout.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Home, Vote, BarChart3, Shield, Settings } from 'lucide-react';

export default function Layout({ children }) {
  const { currentUser, logout, isAdmin } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Vote className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl">SecureVote</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-blue-600">Home</Link>
            <Link to="/results" className="text-gray-600 hover:text-blue-600">Results</Link>
            {currentUser && !isAdmin && (
              <Link to="/voting" className="text-gray-600 hover:text-blue-600">Vote</Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="text-gray-600 hover:text-blue-600">Admin</Link>
            )}
          </nav>
          
          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2 text-sm">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="hidden md:inline">{currentUser.name}</span>
                </Link>
                <button 
                  onClick={logout}
                  className="text-sm text-gray-600 hover:text-red-600 flex items-center gap-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
                >
                  Log in
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t py-6">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} SecureVote | Blockchain & AI-powered E-Voting System</p>
          <p className="mt-1">Ensuring secure, transparent, and accessible elections</p>
        </div>
      </footer>
    </div>
  );
}