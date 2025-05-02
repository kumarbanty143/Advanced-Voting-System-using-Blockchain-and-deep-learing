// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // API base URL - Explicitly use port 5001
  const API_URL = 'http://localhost:5001/api';

  // Debug log
  console.log('Using API URL:', API_URL);

  // Initialize auth state from local storage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      // Set the default authorization header for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setCurrentUser(JSON.parse(user));

      // Verify the token with the backend
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  // Verify token with backend
  const verifyToken = async (token) => {
    try {
      console.log('Verifying token with API URL:', `${API_URL}/auth/verify`);
      const response = await axios.get(`${API_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update user data with latest from server
      setCurrentUser(response.data.user);
      setIsVerified(response.data.user.isVerified || false);
      setHasVoted(response.data.user.hasVoted || false);
      setLoading(false);
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
      setLoading(false);
    }
  };

  // Register a new user
  const register = async (userData) => {
    setError(null);
    try {
      console.log('Registering user with API URL:', `${API_URL}/auth/register`);
      console.log('User data:', userData);

      const response = await axios.post(`${API_URL}/auth/register`, userData);
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error);
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const login = async (...args) => {
    setError(null);
    try {
      // Handle both object and separate arguments
      const credentials = args.length === 1 && typeof args[0] === 'object'
        ? args[0]
        : { email: args[0], password: args[1] };

      console.log('Processed Login Credentials:', credentials);

      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      const { token, user } = response.data;

      // Save to local storage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Set default auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Update state
      setCurrentUser(user);
      setIsVerified(user.isVerified || false);
      setHasVoted(user.hasVoted || false);

      return user;
    } catch (error) {
      console.error('Full login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  // Logout a user
  const logout = () => {
    // Remove from local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Remove default auth header
    delete axios.defaults.headers.common['Authorization'];

    // Reset state
    setCurrentUser(null);
    setIsVerified(false);
    setHasVoted(false);
  };

  // Update user data
  const updateUser = async (userData) => {
    setError(null);
    try {
      const response = await axios.put(`${API_URL}/auth/profile`, userData);
      const updatedUser = response.data;

      // Update local storage
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Update state
      setCurrentUser(updatedUser);
      return updatedUser;
    } catch (error) {
      setError(error.response?.data?.message || 'Update failed');
      throw error;
    }
  };

  // Mark user as verified after facial/biometric verification
  const setUserAsVerified = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/verify-identity`);
      setIsVerified(true);

      // Update user in storage
      const updatedUser = { ...currentUser, isVerified: true };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Verification failed');
      throw error;
    }
  };

  // Mark user as having voted
  const setUserHasVoted = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/mark-voted`);
      setHasVoted(true);

      // Update user in storage
      const updatedUser = { ...currentUser, hasVoted: true };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update voting status');
      throw error;
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return currentUser?.role === 'admin';
  };

  // Value object to be provided to context consumers
  const value = {
    currentUser,
    loading,
    error,
    isVerified,
    hasVoted,
    register,
    login,
    logout,
    updateUser,
    setUserAsVerified,
    setUserHasVoted,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the AuthProvider component
export default AuthContext;