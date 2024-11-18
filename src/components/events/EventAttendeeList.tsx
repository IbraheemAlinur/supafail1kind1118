import React from 'react';
import { Check, X, Clock } from 'lucide-react';
import { EventAttendee } from '../../store/eventStore';

interface EventAttendeeListProps {
  attendees: EventAttendee[];
  onApprove?: (attendeeId: string) => void;
  onReject?: (attendeeId: string) => void;
  showActions?: boolean;
}

const EventAttendeeList: React.FC<EventAttendeeListProps> = ({
  attendees,
  onApprove,
  onReject,
  showActions = false
}) => {
  const getStatusBadge = (status: EventAttendee['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            <Check className="h-3 w-3 mr-1" />
            Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
            <X className="h-3 w-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {attendees.map((attendee) => (
          <li key={attendee.id} className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src={attendee.avatar}
                  alt={attendee.name}
                  className="h-10 w-10 rounded-full"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{attendee.name}</p>
                  <div className="mt-1">
                    {getStatusBadge(attendee.status)}
                  </div>
                </div>
              </div>

              {showActions && attendee.status === 'pending' && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onApprove?.(attendee.id)}
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </button>
                  <button
                    onClick={() => onReject?.(attendee.id)}
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </button>
                </div>
              )}
            </div>

            {attendee.message && (
              <p className="mt-2 text-sm text-gray-500 ml-13">
                {attendee.message}
              </p>
            )}
          </li>
        ))}

        {attendees.length === 0 && (
          <li className="py-4 text-center text-gray-500">
            No attendees yet
          </li>
        )}
      </ul>
    </div>
  );
};

export default EventAttendeeList;