// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Required fields missing",
        description: "Please enter both email and password",
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log('Login Attempt Details:', {
        email,
        passwordLength: password.length,
        passwordType: typeof password
      });

      const loginResult = await login({ email, password });
      console.log('Complete Login Result:', loginResult);
      navigate('/');
    } catch (err) {
      console.error('Comprehensive Login Error:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        response: err.response?.data,
        status: err.response?.status
      });

      toast({
        variant: "destructive",
        title: "Login Failed",
        description: err.response?.data?.message || err.message || "Unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Direct login test function
  const testDirectLogin = async () => {
    try {
      setIsLoading(true);
      console.log('Testing direct login with axios');

      const response = await axios.post('http://localhost:5001/api/auth/login', {
        email,
        password
      });

      console.log('Direct login response:', response.data);

      if (response.data.token) {
        // Store token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        toast({
          title: "Direct login successful",
          description: "Login worked via direct API call",
        });

        navigate('/');
      }
    } catch (err) {
      console.error('Direct login error:', err);
      toast({
        variant: "destructive",
        title: "Direct login failed",
        description: err.response?.data?.message || "API error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch API login test
  const testFetchLogin = async () => {
    try {
      setIsLoading(true);
      console.log('Testing fetch login with correct port');

      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Fetch login response:', data);

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        toast({
          title: "Fetch login successful",
          description: "Login worked via Fetch API",
        });

        navigate('/');
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Fetch login error:', err);
      toast({
        variant: "destructive",
        title: "Fetch login failed",
        description: err.message || "API error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the e-voting platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 p-3 rounded-md flex items-start gap-2 text-red-700 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>

              {/* Test buttons for debugging */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={testDirectLogin}
                  disabled={isLoading}
                >
                  Test Axios
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={testFetchLogin}
                  disabled={isLoading}
                >
                  Test Fetch
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Register here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}