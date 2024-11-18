import React from 'react';
import { format } from 'date-fns';
import { useMessages } from '../../hooks/useMessages';

interface MessageListProps {
  onSelectThread: (threadId: string) => void;
  selectedThreadId: string | null;
}

export default function MessageList({ onSelectThread, selectedThreadId }: MessageListProps) {
  const { threads } = useMessages();

  return (
    <div className="overflow-y-auto h-full">
      {threads.map((thread) => (
        <button
          key={`thread-${thread.id}`}
          onClick={() => onSelectThread(thread.id)}
          className={`w-full p-4 flex items-start space-x-3 hover:bg-gray-50 transition-colors ${
            selectedThreadId === thread.id ? 'bg-indigo-50' : ''
          }`}
        >
          <img
            src={thread.participants.find(p => p.id !== thread.lastMessage.senderId)?.avatar}
            alt={thread.participants.find(p => p.id !== thread.lastMessage.senderId)?.name}
            className="w-12 h-12 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium text-gray-900 truncate">
                {thread.participants.find(p => p.id !== thread.lastMessage.senderId)?.name}
              </p>
              <span className="text-xs text-gray-500">
                {format(new Date(thread.lastMessage.timestamp), 'h:mm a')}
              </span>
            </div>
            <p className="text-sm text-gray-600 truncate">{thread.lastMessage.content}</p>
            <div className="mt-1 flex items-center space-x-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                thread.type === 'ask' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {thread.type === 'ask' ? 'Ask' : 'Offer'}
              </span>
              <span className="text-xs text-gray-500">{thread.title}</span>
              <span className="text-xs text-indigo-600">{thread.kiPoints} Ki</span>
            </div>
          </div>
        </button>
      ))}

      {threads.length === 0 && (
        <div className="p-4 text-center text-gray-500">
          No messages yet. Start a conversation by responding to an ask or offer!
        </div>
      )}
    </div>
  );
}