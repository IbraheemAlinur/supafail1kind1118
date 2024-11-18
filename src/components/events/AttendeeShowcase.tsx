import React from 'react';
import { MessageCircle, Filter } from 'lucide-react';
import { useFeedStore } from '../../store/feedStore';
import { Event } from '../../store/eventStore';
import AskCard from '../asks/AskCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';

interface AttendeeShowcaseProps {
  event: Event;
}

const AttendeeShowcase: React.FC<AttendeeShowcaseProps> = ({ event }) => {
  const [filter, setFilter] = React.useState<'all' | 'asks' | 'offers'>('all');
  const items = useFeedStore(state => state.items);
  
  // Get all confirmed attendee IDs
  const confirmedAttendeeIds = event.attendees
    .filter(a => a.status === 'confirmed')
    .map(a => a.id);

  // Filter feed items by confirmed attendees
  const attendeeItems = items.filter(item => 
    confirmedAttendeeIds.includes(item.author.id)
  );

  const filteredItems = attendeeItems.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  if (attendeeItems.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Asks or Offers</h3>
          <p className="mt-1 text-sm text-gray-500">
            Attendees haven't posted any asks or offers yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          Attendee Asks & Offers
        </h3>
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'asks' | 'offers')}
            className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Posts</option>
            <option value="asks">Asks Only</option>
            <option value="offers">Offers Only</option>
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {filteredItems.map((item) => (
          <AskCard key={item.id} {...item} />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-6">
          <p className="text-gray-500">
            No {filter === 'all' ? 'posts' : filter} found for the selected filter.
          </p>
        </div>
      )}
    </div>
  );
};

export default AttendeeShowcase;