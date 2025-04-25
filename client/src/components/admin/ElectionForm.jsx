// client/src/components/admin/ElectionForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash, Calendar as CalendarIcon2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import axios from '@/lib/api';

const ElectionForm = ({ election = null }) => {
  const isEditing = !!election;
  const [formData, setFormData] = useState({
    name: election?.name || '',
    type: election?.type || 'General',
    description: election?.description || '',
    startDate: election?.start_date ? new Date(election.start_date) : null,
    endDate: election?.end_date ? new Date(election.end_date) : null,
    constituencies: election?.constituencies || [{ name: '', state: '' }]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
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
  
  // Handle date selection
  const handleDateChange = (name, date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };
  
  // Handle constituency changes
  const handleConstituencyChange = (index, field, value) => {
    const updatedConstituencies = [...formData.constituencies];
    updatedConstituencies[index] = {
      ...updatedConstituencies[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      constituencies: updatedConstituencies
    }));
  };
  
  // Add new constituency
  const addConstituency = () => {
    setFormData(prev => ({
      ...prev,
      constituencies: [...prev.constituencies, { name: '', state: '' }]
    }));
  };
  
  // Remove constituency
  const removeConstituency = (index) => {
    if (formData.constituencies.length === 1) return;
    
    const updatedConstituencies = [...formData.constituencies];
    updatedConstituencies.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      constituencies: updatedConstituencies
    }));
  };
  
  // Form validation
  const validateForm = () => {
    if (!formData.name || !formData.type || !formData.startDate || !formData.endDate) {
      toast({
        variant: "destructive",
        title: "Missing required fields",
        description: "Please fill in all required fields"
      });
      return false;
    }
    
    if (formData.endDate <= formData.startDate) {
      toast({
        variant: "destructive",
        title: "Invalid date range",
        description: "End date must be after start date"
      });
      return false;
    }
    
    // Check constituencies
    const emptyConstituency = formData.constituencies.some(c => !c.name || !c.state);
    if (emptyConstituency) {
      toast({
        variant: "destructive",
        title: "Incomplete constituencies",
        description: "Please fill in all constituency details"
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
        // Update existing election
        await axios.put(`/api/elections/${election.id}`, formData);
        toast({
          title: "Election updated",
          description: "The election has been updated successfully"
        });
      } else {
        // Create new election
        await axios.post('/api/elections', formData);
        toast({
          title: "Election created",
          description: "The election has been created successfully"
        });
      }
      
      // Redirect to elections list
      navigate('/admin/elections');
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
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Election' : 'Create New Election'}</CardTitle>
        <CardDescription>
          {isEditing ? 'Update election details' : 'Configure a new election for your voters'}
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500">Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">Election Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. General Election 2023"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Election Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelect('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="By-Election">By-Election</SelectItem>
                  <SelectItem value="Local">Local</SelectItem>
                  <SelectItem value="Municipal">Municipal</SelectItem>
                  <SelectItem value="State">State</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter a brief description"
              />
            </div>
          </div>
          
          {/* Date Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500">Date and Time</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? (
                        format(formData.startDate, 'PPP')
                      ) : (
                        <span>Pick a start date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => handleDateChange('startDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* End Date */}
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? (
                        format(formData.endDate, 'PPP')
                      ) : (
                        <span>Pick an end date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => handleDateChange('endDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          
          {/* Constituencies */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-500">Constituencies</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addConstituency}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Constituency
              </Button>
            </div>
            
            {formData.constituencies.map((constituency, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Constituency {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeConstituency(index)}
                    disabled={formData.constituencies.length === 1}
                    className="h-8 w-8 p-0 text-red-500"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Constituency Name</Label>
                    <Input
                      value={constituency.name}
                      onChange={(e) => handleConstituencyChange(index, 'name', e.target.value)}
                      placeholder="e.g. East Delhi"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Input
                      value={constituency.state}
                      onChange={(e) => handleConstituencyChange(index, 'state', e.target.value)}
                      placeholder="e.g. Delhi"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/elections')}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : isEditing ? "Update Election" : "Create Election"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ElectionForm;