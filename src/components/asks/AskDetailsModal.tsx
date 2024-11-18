import React from 'react';
import { X, Tag, MessageCircle, Send } from 'lucide-react';
import { format } from 'date-fns';

interface AskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  author: {
    name: string;
    avatar: string;
    id: string;
  };
  type: 'ask' | 'offer';
  kiPoints: number;
  tags: string[];
  createdAt: Date;
  status: string;
  onMessage: (e: React.MouseEvent) => void;
  isCurrentUser: boolean;
}

export default function AskDetailsModal({
  isOpen,
  onClose,
  title,
  description,
  author,
  type,
  kiPoints,
  tags,
  createdAt,
  status,
  onMessage,
  isCurrentUser
}: AskDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <img src={author.avatar} alt={author.name} className="h-12 w-12 rounded-full" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                  <p className="text-sm text-gray-500">Posted by {author.name}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(createdAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-4">
              <div className="flex items-center space-x-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  type === 'ask' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                }`}>
                  {type === 'ask' ? 'Ask' : 'Offer'}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  {kiPoints} Ki Points
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  status === 'completed' ? 'bg-green-100 text-green-800' :
                  status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{description}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                    <Tag className="h-4 w-4 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {!isCurrentUser && (
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={onMessage}
                className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                <Send className="h-4 w-4 mr-2" />
                Message
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}