// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import Layout from '@/components/common/Layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminRoute from '@/components/auth/AdminRoute';

// Import pages
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import VoterVerification from '@/pages/VoterVerification';
import Voting from '@/pages/Voting';
import Results from '@/pages/Results';
import AdminDashboard from '@/pages/admin/Dashboard';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/results" element={<Results />} />

          {/* Protected voter routes */}
          <Route
            path="/verification"
            element={
              <ProtectedRoute>
                <VoterVerification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/voting"
            element={
              <ProtectedRoute>
                <Voting />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
      {/* <Toaster /> */}
    </AuthProvider>
  );
}

export default App;