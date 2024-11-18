import React, { useState } from 'react';
import { MessageCircle, ThumbsUp, Tag, Clock, AlertCircle, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow, isValid } from 'date-fns';
import { useStore } from '../../store/useStore';
import AskDetailsModal from './AskDetailsModal';

const DESCRIPTION_LIMIT = 150; // Character limit for description preview

interface AskCardProps {
  id: string;
  title: string;
  description: string;
  tags: string[];
  kiPoints: number;
  author: {
    name: string;
    avatar: string;
    id: string;
  };
  responseCount: number;
  type: 'ask' | 'offer';
  createdAt: Date;
  status?: 'open' | 'in_progress' | 'completed';
  isInterested?: boolean;
  onInterest?: () => void;
}

export default function AskCard({ 
  id, 
  title, 
  description, 
  tags, 
  kiPoints, 
  author, 
  responseCount, 
  type,
  createdAt,
  status = 'open',
  isInterested,
  onInterest
}: AskCardProps) {
  const navigate = useNavigate();
  const user = useStore(state => state.user);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleMessageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/dashboard/messages/${id}`, { 
      state: { 
        title,
        type,
        kiPoints,
        author
      } 
    });
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Completed
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Open
          </span>
        );
    }
  };

  const getFormattedDate = () => {
    const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
    if (!isValid(date)) return 'Invalid date';
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const isExpiringSoon = () => {
    const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
    if (!isValid(date)) return false;
    const daysSinceCreation = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceCreation >= 7 && status === 'open';
  };

  const truncatedDescription = description.length > DESCRIPTION_LIMIT 
    ? `${description.substring(0, DESCRIPTION_LIMIT)}...` 
    : description;

  return (
    <>
      <div 
        onClick={() => setShowDetailsModal(true)}
        className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer relative"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <img src={author.avatar} alt={author.name} className="h-10 w-10 rounded-full" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-500">{author.name}</p>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-500">
                  {getFormattedDate()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge()}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              type === 'ask' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
            }`}>
              {type === 'ask' ? 'Ask' : 'Offer'}
            </span>
          </div>
        </div>

        <p className="mt-4 text-gray-600 line-clamp-3">{truncatedDescription}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
              <Tag className="h-4 w-4 mr-1" />
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleMessageClick}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              {responseCount} {responseCount === 1 ? 'response' : 'responses'}
            </button>
            {status === 'open' && user && user.id !== author.id && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onInterest?.();
                }}
                className={`inline-flex items-center text-sm ${
                  isInterested
                    ? 'text-indigo-600 hover:text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ThumbsUp className={`h-4 w-4 mr-1 ${isInterested ? 'fill-current' : ''}`} />
                {isInterested ? 'Interested' : 'Show Interest'}
              </button>
            )}
            {isExpiringSoon() && (
              <div className="flex items-center text-sm text-amber-600">
                <AlertCircle className="h-4 w-4 mr-1" />
                Expiring soon
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              {kiPoints} Ki
            </span>
            {user && user.id !== author.id && (
              <button
                onClick={handleMessageClick}
                className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Send className="h-4 w-4 mr-1" />
                Message
              </button>
            )}
          </div>
        </div>
      </div>

      <AskDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={title}
        description={description}
        author={author}
        type={type}
        kiPoints={kiPoints}
        tags={tags}
        createdAt={createdAt}
        status={status}
        onMessage={handleMessageClick}
        isCurrentUser={user?.id === author.id}
      />
    </>
  );
}