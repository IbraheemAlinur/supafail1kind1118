import React from 'react';
import { Event } from '../../store/eventStore';
import { isPast } from 'date-fns';

interface EventStatusBadgeProps {
  event: Event;
  className?: string;
}

const EventStatusBadge: React.FC<EventStatusBadgeProps> = ({ event, className = '' }) => {
  const getStatusInfo = () => {
    const eventPassed = isPast(event.endDate);
    const hasStarted = isPast(event.startDate);

    if (event.status === 'cancelled') {
      return {
        label: 'Cancelled',
        className: 'bg-red-100 text-red-800'
      };
    }

    if (eventPassed) {
      return {
        label: 'Completed',
        className: 'bg-gray-100 text-gray-800'
      };
    }

    if (hasStarted) {
      return {
        label: 'In Progress',
        className: 'bg-green-100 text-green-800'
      };
    }

    return {
      label: 'Upcoming',
      className: 'bg-blue-100 text-blue-800'
    };
  };

  const { label, className: statusClassName } = getStatusInfo();

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusClassName} ${className}`}>
      {label}
    </span>
  );
};

export default EventStatusBadge;