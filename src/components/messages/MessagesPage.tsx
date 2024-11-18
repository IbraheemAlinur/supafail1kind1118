import React from 'react';
import { Search } from 'lucide-react';
import MessageList from './MessageList';
import MessageThread from './MessageThread';
import { useParams, useNavigate } from 'react-router-dom';
import ErrorBoundary from '../ErrorBoundary';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function MessagesPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [selectedThread, setSelectedThread] = React.useState<string | null>(id || null);

  const handleSelectThread = (threadId: string) => {
    setSelectedThread(threadId);
    navigate(`/dashboard/messages/${threadId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex h-[calc(100vh-10rem)] bg-white rounded-lg shadow-sm">
        {/* Messages Sidebar */}
        <div className="w-96 border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <ErrorBoundary>
            <MessageList 
              onSelectThread={handleSelectThread} 
              selectedThreadId={selectedThread} 
            />
          </ErrorBoundary>
        </div>

        {/* Message Thread */}
        <div className="flex-1">
          {selectedThread ? (
            <ErrorBoundary>
              <MessageThread />
            </ErrorBoundary>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}