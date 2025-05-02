// src/pages/Register.jsx
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

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    voterId: '',
    aadhaarId: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register, error } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field ${name} updated: ${value}`); // Debug log
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const validateForm = () => {
    console.log("Validating form data:", formData); // Debug log

    if (!formData.name || !formData.email || !formData.voterId || !formData.aadhaarId || !formData.password) {
      toast({
        variant: "destructive",
        title: "Required fields missing",
        description: "Please fill in all required fields",
      });
      return false;
    }

    if (formData.aadhaarId.length !== 12 || !/^\d+$/.test(formData.aadhaarId)) {
      toast({
        variant: "destructive",
        title: "Invalid Aadhaar ID",
        description: "Aadhaar ID must be 12 digits",
      });
      return false;
    }

    if (formData.password.length < 8) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 8 characters",
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
      });
      return false;
    }

    console.log("Form validation passed"); // Debug log
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted"); // Debug log

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      console.log("Using context register function"); // Debug log
      await register({
        name: formData.name,
        email: formData.email,
        voterId: formData.voterId,
        aadhaarId: formData.aadhaarId,
        password: formData.password
      });

      toast({
        title: "Registration successful",
        description: "You can now log in with your credentials",
      });

      navigate('/login');
    } catch (err) {
      console.error("Registration error:", err); // Debug log
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: err.response?.data?.message || "An error occurred during registration",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Direct registration test
  const testDirectRegistration = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      console.log("Testing direct API registration"); // Debug log

      const userData = {
        name: formData.name,
        email: formData.email,
        voterId: formData.voterId,
        aadhaarId: formData.aadhaarId,
        password: formData.password
      };

      console.log("Registration data:", userData); // Debug log

      // Use direct axios call with port 5001
      const response = await axios.post('http://localhost:5001/api/auth/register', userData);

      console.log("Registration response:", response.data); // Debug log

      toast({
        title: "Registration successful",
        description: "Direct API registration worked! You can now log in.",
      });

      navigate('/login');
    } catch (err) {
      console.error("Direct registration error:", err); // Debug log
      toast({
        variant: "destructive",
        title: "Direct registration failed",
        description: err.response?.data?.message || "API error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch API registration test
  const testFetchRegistration = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      console.log("Testing Fetch API registration"); // Debug log

      const userData = {
        name: formData.name,
        email: formData.email,
        voterId: formData.voterId,
        aadhaarId: formData.aadhaarId,
        password: formData.password
      };

      console.log("Registration data:", userData); // Debug log

      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log("Fetch registration response:", data); // Debug log

      if (response.ok) {
        toast({
          title: "Registration successful",
          description: "Fetch API registration worked! You can now log in.",
        });

        navigate('/login');
      } else {
        throw new Error(data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Fetch registration error:", err); // Debug log
      toast({
        variant: "destructive",
        title: "Fetch registration failed",
        description: err.message || "API error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Register</CardTitle>
          <CardDescription>
            Create an account to participate in the e-voting platform
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
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="voterId">Voter ID</Label>
                <Input
                  id="voterId"
                  name="voterId"
                  placeholder="Enter your voter ID"
                  value={formData.voterId}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aadhaarId">Aadhaar Number</Label>
                <Input
                  id="aadhaarId"
                  name="aadhaarId"
                  placeholder="12-digit Aadhaar number"
                  value={formData.aadhaarId}
                  onChange={handleChange}
                  required
                />
                <p className="text-xs text-gray-500">
                  Must be a valid 12-digit Aadhaar number
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <p className="text-xs text-gray-500">
                  Must be at least 8 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Register"}
              </Button>

              {/* Test buttons for debugging */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={testDirectRegistration}
                  disabled={isLoading}
                >
                  Test Axios
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={testFetchRegistration}
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
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Login here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}