// src/pages/Home.jsx
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, CheckSquare, Lock, FileText, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-16 py-8">
      {/* Hero section */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Secure, Transparent, Accessible E-Voting
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Revolutionizing electoral systems with blockchain technology and advanced biometric verification.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          {currentUser ? (
            <Link to="/voting">
              <Button size="lg" className="gap-2">
                <CheckSquare className="h-5 w-5" />
                Cast Your Vote
              </Button>
            </Link>
          ) : (
            <Link to="/register">
              <Button size="lg" className="gap-2">
                <Users className="h-5 w-5" />
                Register to Vote
              </Button>
            </Link>
          )}
          <Link to="/results">
            <Button variant="outline" size="lg" className="gap-2">
              <FileText className="h-5 w-5" />
              View Results
            </Button>
          </Link>
        </div>
      </section>

      {/* Features section */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Biometric Verification</h3>
            <p className="text-gray-600">
              Advanced facial recognition ensures only registered voters can access the system, preventing fraud.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Blockchain Security</h3>
            <p className="text-gray-600">
              Immutable blockchain technology ensures votes cannot be altered or tampered with, maintaining integrity.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <CheckSquare className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Transparent Counting</h3>
            <p className="text-gray-600">
              Real-time vote tallying with cryptographic verification, allowing voters to confirm their vote was counted.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
        <div className="max-w-3xl mx-auto">
          <ol className="relative border-l border-gray-200 ml-3 space-y-8">
            <li className="ml-6">
              <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white">
                1
              </span>
              <h3 className="text-lg font-semibold">Register & Verify</h3>
              <p className="text-gray-600 mt-1">
                Create an account with your voter ID and Aadhaar number. Verify your identity with facial recognition.
              </p>
            </li>
            <li className="ml-6">
              <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white">
                2
              </span>
              <h3 className="text-lg font-semibold">Access Ballot</h3>
              <p className="text-gray-600 mt-1">
                Log in securely during the election period to access your personalized ballot based on your constituency.
              </p>
            </li>
            <li className="ml-6">
              <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white">
                3
              </span>
              <h3 className="text-lg font-semibold">Cast Your Vote</h3>
              <p className="text-gray-600 mt-1">
                Select your candidate. Review and confirm your selection. Your vote is encrypted and added to the blockchain.
              </p>
            </li>
            <li className="ml-6">
              <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white">
                4
              </span>
              <h3 className="text-lg font-semibold">Verify & Track</h3>
              <p className="text-gray-600 mt-1">
                Receive a unique verification code to confirm your vote was recorded. Track results in real-time.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-blue-50 p-8 rounded-lg">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold">Ready to experience the future of voting?</h2>
          <p className="text-gray-600">
            Join thousands of citizens already using our secure e-voting platform.
          </p>
          <div className="pt-2">
            {currentUser ? (
              <Link to="/voting">
                <Button size="lg">Cast Your Vote Now</Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button size="lg">Register Now</Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}