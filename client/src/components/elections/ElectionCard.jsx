// client/src/components/elections/ElectionCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, CheckSquare, Vote } from 'lucide-react';
import { format } from 'date-fns';

const ElectionCard = ({ election, showActions = true }) => {
  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Calculate time remaining
  const getTimeRemaining = () => {
    const now = new Date();
    const endDate = new Date(election.end_date);
    const startDate = new Date(election.start_date);
    
    // If election hasn't started yet
    if (now < startDate) {
      const diffTime = Math.abs(startDate - now);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `Starts in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    }
    
    // If election has ended
    if (now > endDate) {
      return 'Election ended';
    }
    
    // If election is ongoing
    const diffTime = Math.abs(endDate - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffDays > 1) {
      return `${diffDays} days remaining`;
    } else if (diffHours > 1) {
      return `${diffHours} hours remaining`;
    } else {
      return 'Ending soon';
    }
  };
  
  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="bg-gray-50 pb-3">
        <div className="flex justify-between items-start">
          <h3 className="font-medium">{election.name}</h3>
          <Badge
            className={`
              ${election.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
              ${election.status === 'upcoming' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : ''}
              ${election.status === 'completed' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : ''}
            `}
          >
            {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
          </Badge>
        </div>
        <p className="text-sm text-gray-500">{election.type} Election</p>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{formatDate(election.start_date)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{getTimeRemaining()}</span>
          </div>
        </div>
        
        {election.constituency_count > 0 && (
          <div className="text-sm flex items-center gap-1.5">
            <Users className="h-4 w-4 text-gray-500" />
            <span>{election.constituency_count} constituencies</span>
          </div>
        )}
        
        {showActions && (
          <div className="pt-2">
            {election.status === 'active' && (
              <Link to={`/voting?election=${election.id}`}>
                <Button className="w-full flex items-center gap-2">
                  <Vote className="h-4 w-4" />
                  Cast Your Vote
                </Button>
              </Link>
            )}
            
            {election.status === 'completed' && (
              <Link to={`/results?election=${election.id}`}>
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  View Results
                </Button>
              </Link>
            )}
            
            {election.status === 'upcoming' && (
              <div className="text-center text-sm text-gray-500">
                This election has not started yet
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ElectionCard;