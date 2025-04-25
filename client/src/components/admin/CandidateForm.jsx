// client/src/components/admin/CandidateForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import axios from '@/lib/api';

const CandidateForm = ({ candidate = null }) => {
  const { electionId } = useParams();
  const isEditing = !!candidate;

  const [formData, setFormData] = useState({
    name: candidate?.name || '',
    party: candidate?.party || '',
    partySymbol: candidate?.party_symbol || '',
    bio: candidate?.bio || '',
    imageUrl: candidate?.image_url || '',
    constituencyId: candidate?.constituency_id || '',
    electionId: electionId || candidate?.election_id || ''
  });

  const [constituencies, setConstituencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch constituencies for the election
  useEffect(() => {
    const fetchConstituencies = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/elections/${formData.electionId}`);
        setConstituencies(response.data.election.constituencies);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching constituencies:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load constituencies"
        });
        setLoading(false);
      }
    };

    if (formData.electionId) {
      fetchConstituencies();
    }
  }, [formData.electionId]);

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle dropdown select
  const handleSelect = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Form validation
  const validateForm = () => {
    if (!formData.name || !formData.party || !formData.constituencyId) {
      toast({
        variant: "destructive",
        title: "Missing required fields",
        description: "Please fill in all required fields"
      });
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      if (isEditing) {
        // Update existing candidate
        await axios.put(`/api/candidates/${candidate.id}`, formData);
        toast({
          title: "Candidate updated",
          description: "The candidate has been updated successfully"
        });
      } else {
        // Create new candidate
        await axios.post('/api/candidates', formData);
        toast({
          title: "Candidate created",
          description: "The candidate has been created successfully"
        });
      }

      // Navigate back to election management
      navigate(`/admin/elections/${formData.electionId}`);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to process your request"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Candidate' : 'Add Candidate'}</CardTitle>
        <CardDescription>
          {isEditing ? 'Update candidate information' : 'Add a new candidate to the election'}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Candidate Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="party">Political Party</Label>
              <Input
                id="party"
                name="party"
                value={formData.party}
                onChange={handleChange}
                placeholder="e.g. National Democratic Alliance"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="partySymbol">Party Symbol</Label>
              <Input
                id="partySymbol"
                name="partySymbol"
                value={formData.partySymbol}
                onChange={handleChange}
                placeholder="e.g. 🌼 or Lotus"
              />
              <p className="text-xs text-gray-500">
                You can use an emoji or a short text description
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="constituencyId">Constituency</Label>
              <Select
                value={formData.constituencyId}
                onValueChange={(value) => handleSelect('constituencyId', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select constituency" />
                </SelectTrigger>
                <SelectContent>
                  {constituencies.map(constituency => (
                    <SelectItem key={constituency.id} value={constituency.id.toString()}>
                      {constituency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biography</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Brief candidate biography"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Profile Image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-500">
                Enter a URL for the candidate's image
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/admin/elections/${formData.electionId}`)}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : isEditing ? "Update Candidate" : "Add Candidate"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CandidateForm;