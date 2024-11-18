import React from 'react';
import { useEvents } from '../../hooks/useEvents';
import EventCard from '../events/EventCard';
import { Plus } from 'lucide-react';
import CreateEventModal from '../events/CreateEventModal';

interface CommunityEventsProps {
  communityId: string;
}

export default function CommunityEvents({ communityId }: CommunityEventsProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const { events, loading } = useEvents(communityId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Event
        </button>
      </div>

      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No events scheduled. Create one to get started!</p>
        </div>
      )}

      <CreateEventModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        communityId={communityId}
      />
    </div>
  );
}