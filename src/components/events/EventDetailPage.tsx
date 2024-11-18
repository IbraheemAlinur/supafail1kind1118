import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useEvents } from '../../hooks/useEvents';
import { useStore } from '../../store/useStore';
import LoadingSpinner from '../ui/LoadingSpinner';
import EventDetailHeader from './EventDetailHeader';
import EventAttendeeList from './EventAttendeeList';
import EventActions from './EventActions';
import EventManagementSection from './EventManagementSection';
import AttendeeShowcase from './AttendeeShowcase';
import { Event } from '../../store/eventStore';

const EventDetailPage: React.FC = () => {
  const { id = '' } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getEventStats, approveAttendee, rejectAttendee, updateEvent, fetchEvents } = useEvents();
  const user = useStore(state => state.user);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        const events = await fetchEvents();
        const foundEvent = events.find(e => e.id === id);
        if (foundEvent) {
          setEvent(foundEvent);
        } else {
          setError('Event not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id, fetchEvents]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Event not found</h2>
          <p className="mt-2 text-gray-600">The event you're looking for doesn't exist or has been removed.</p>
          <Link to="/dashboard/events" className="mt-4 text-indigo-600 hover:text-indigo-500 inline-flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to events
          </Link>
        </div>
      </div>
    );
  }

  const stats = getEventStats(event.id);
  const isAttending = event.attendees.some(a => a.id === user?.id && a.status === 'confirmed');
  const isOrganizer = event.organizer.id === user?.id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/dashboard/events" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to events
        </Link>
      </div>

      <EventDetailHeader event={event} stats={stats} />

      {error && (
        <div className="mt-4 p-4 bg-red-50 rounded-md">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="ml-3 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {isOrganizer && (
        <div className="mt-6">
          <EventManagementSection 
            event={event}
            onUpdateEvent={updateEvent}
          />
        </div>
      )}

      <div className="mt-6 space-y-6">
        {/* Attendees Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Attendees</h3>
          <EventAttendeeList
            attendees={event.attendees.filter(a => a.status === 'confirmed')}
            onApprove={approveAttendee}
            onReject={rejectAttendee}
            showActions={isOrganizer}
          />
        </div>

        {/* Waitlist Section */}
        {event.waitlist.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Waitlist</h3>
            <EventAttendeeList attendees={event.waitlist} />
          </div>
        )}

        {/* Attendee Showcase */}
        {(isAttending || isOrganizer) && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Attendee Showcase</h3>
            <AttendeeShowcase event={event} />
          </div>
        )}

        {/* Event Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <EventActions
            event={event}
            isAttending={isAttending}
            onToggleReminders={() => {}}
            hasReminders={false}
          />
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;