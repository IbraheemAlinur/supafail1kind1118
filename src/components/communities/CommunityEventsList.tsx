import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { Event } from '../../store/eventStore';
import { format, isPast } from 'date-fns';

interface CommunityEventsListProps {
  events: Event[];
}

const CommunityEventsList: React.FC<CommunityEventsListProps> = ({ events }) => {
  // Filter out past events and sort by date
  const upcomingEvents = events
    .filter(event => !isPast(event.endDate))
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  if (upcomingEvents.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">No upcoming events</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {upcomingEvents.map((event) => (
        <Link
          key={event.id}
          to={`/dashboard/events/${event.id}`}
          className="block p-4 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <h4 className="font-medium text-gray-900 mb-2">{event.title}</h4>
          
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{format(event.startDate, 'MMM d, yyyy h:mm a')}</span>
            </div>
            
            {event.type === 'in_person' && event.location && (
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
            
            <div className="flex items-center text-sm text-gray-500">
              <Users className="h-4 w-4 mr-2" />
              <span>
                {event.attendees.filter(a => a.status === 'confirmed').length} attending
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center text-indigo-600 text-sm">
            View Details
            <ArrowRight className="h-4 w-4 ml-1" />
          </div>
        </Link>
      ))}

      {events.length > upcomingEvents.length && (
        <Link
          to="/dashboard/events"
          className="block text-center text-sm text-indigo-600 hover:text-indigo-500 mt-4"
        >
          View all events
        </Link>
      )}
    </div>
  );
};

export default CommunityEventsList;