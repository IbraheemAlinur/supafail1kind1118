import React from 'react';
import { Calendar, MapPin, Users, Clock, ExternalLink } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { Event } from '../../store/eventStore';
import EventStatusBadge from './EventStatusBadge';

interface EventDetailHeaderProps {
  event: Event;
  stats: {
    totalAttendees: number;
    confirmedAttendees: number;
    pendingAttendees: number;
    waitlistCount: number;
    availableSpots: number;
    rsvpDeadlinePassed: boolean;
  };
}

const EventDetailHeader: React.FC<EventDetailHeaderProps> = ({ event, stats }) => {
  const formatEventDate = (date: Date) => {
    return isValid(date) ? format(date, 'EEEE, MMMM d, yyyy h:mm a') : 'Date not available';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
        <EventStatusBadge event={event} />
      </div>

      <p className="text-gray-600 mb-6">{event.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center text-gray-700">
            <Calendar className="h-5 w-5 mr-2" />
            <span>{formatEventDate(event.startDate)}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <Clock className="h-5 w-5 mr-2" />
            <span>
              {isValid(event.startDate) ? format(event.startDate, 'h:mm a') : 'Time not available'} - {' '}
              {isValid(event.endDate) ? format(event.endDate, 'h:mm a') : 'Time not available'} ({event.timezone})
            </span>
          </div>
          {event.type === 'in_person' && event.location && (
            <div className="flex items-start text-gray-700">
              <MapPin className="h-5 w-5 mr-2 mt-1" />
              <span>{event.location}</span>
            </div>
          )}
          {event.type === 'online' && event.meetingLink && (
            <div className="flex items-start text-gray-700">
              <ExternalLink className="h-5 w-5 mr-2 mt-1" />
              <a
                href={event.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-500"
              >
                Join Meeting
              </a>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-gray-700">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              <span>Total Capacity</span>
            </div>
            <span className="font-medium">{event.capacity}</span>
          </div>
          <div className="flex items-center justify-between text-gray-700">
            <span>Confirmed Attendees</span>
            <span className="font-medium">{stats.confirmedAttendees}</span>
          </div>
          {event.requiresApproval && (
            <div className="flex items-center justify-between text-gray-700">
              <span>Pending Approval</span>
              <span className="font-medium">{stats.pendingAttendees}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-gray-700">
            <span>Waitlist</span>
            <span className="font-medium">{stats.waitlistCount}</span>
          </div>
          <div className="flex items-center justify-between text-gray-700">
            <span>Available Spots</span>
            <span className="font-medium">{stats.availableSpots}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailHeader;