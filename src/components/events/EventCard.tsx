import React from 'react';
import { Calendar, MapPin, Users, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, isValid } from 'date-fns';
import { Event } from '../../store/eventStore';

interface EventCardProps extends Event {
  showCommunity?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  description,
  coverImage,
  startDate,
  endDate,
  type,
  location,
  capacity,
  attendees,
  organizer,
  communityId,
  showCommunity = false,
}) => {
  const remainingSpots = capacity - attendees.filter(a => a.status === 'confirmed').length;
  const formattedDate = startDate instanceof Date && isValid(startDate) 
    ? format(startDate, 'MMM d, yyyy')
    : 'Date not available';
  const formattedTime = startDate instanceof Date && isValid(startDate)
    ? format(startDate, 'h:mm a')
    : '';

  return (
    <Link 
      to={`/dashboard/events/${id}`}
      className="block bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      <div 
        className="h-48 bg-cover bg-center relative" 
        style={{ backgroundImage: `url(${coverImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              type === 'online'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {type === 'online' ? 'Online Event' : 'In Person'}
            </span>
            {showCommunity && communityId && (
              <Link
                to={`/dashboard/communities/${communityId}`}
                className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                onClick={(e) => e.stopPropagation()}
              >
                View Community
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>

        <div className="space-y-3">
          <div className="flex items-center text-gray-500">
            <Calendar className="h-5 w-5 mr-2" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center text-gray-500">
            <Clock className="h-5 w-5 mr-2" />
            <span>{formattedTime}</span>
          </div>
          {type === 'in_person' && location && (
            <div className="flex items-center text-gray-500">
              <MapPin className="h-5 w-5 mr-2" />
              <span className="line-clamp-1">{location}</span>
            </div>
          )}
          <div className="flex items-center text-gray-500">
            <Users className="h-5 w-5 mr-2" />
            <span>
              {attendees.filter(a => a.status === 'confirmed').length} attending · {remainingSpots} spots left
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={organizer.avatar}
              alt={organizer.name}
              className="h-8 w-8 rounded-full"
            />
            <span className="ml-2 text-sm text-gray-600">
              Organized by {organizer.name}
            </span>
          </div>
          <div className="flex items-center text-indigo-600">
            <span className="text-sm font-medium">View Details</span>
            <ArrowRight className="ml-1 h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;