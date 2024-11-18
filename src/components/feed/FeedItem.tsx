import React from 'react';
import { MessageCircle, ThumbsUp, Tag, Clock, AlertCircle, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow, isValid } from 'date-fns';
import { useStore } from '../../store/useStore';

interface FeedItemProps {
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
  community?: {
    id: string;
    name: string;
  };
  responseCount: number;
  type: 'ask' | 'offer';
  createdAt: Date;
  status: 'open' | 'in_progress' | 'completed';
  isInterested?: boolean;
  onInterest?: () => void;
  onClick?: () => void;
}

export default function FeedItem({
  id,
  title,
  description,
  tags,
  kiPoints,
  author,
  community,
  responseCount,
  type,
  createdAt,
  status,
  isInterested,
  onInterest,
  onClick
}: FeedItemProps) {
  const navigate = useNavigate();
  const user = useStore(state => state.user);

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
    if (createdAt instanceof Date && isValid(createdAt)) {
      return formatDistanceToNow(createdAt, { addSuffix: true });
    }
    return 'Invalid date';
  };

  const isExpiringSoon = () => {
    if (createdAt instanceof Date && isValid(createdAt)) {
      const daysSinceCreation = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceCreation >= 7 && status === 'open';
    }
    return false;
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img 
              src={author.avatar} 
              alt={author.name} 
              className="h-10 w-10 rounded-full object-cover border border-gray-200"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <div className="flex items-center text-sm text-gray-500 space-x-2">
                <span>{author.name}</span>
                <span>•</span>
                <span>{getFormattedDate()}</span>
                {community && (
                  <>
                    <span>•</span>
                    <span>{community.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge()}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              type === 'ask' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
            }`}>
              {type === 'ask' ? 'Ask' : 'Offer'}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-4 line-clamp-3">{description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800"
            >
              <Tag className="h-4 w-4 mr-1" />
              {tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleMessageClick}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              {responseCount} responses
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
            {user && user.id !== author.id && status === 'open' && (
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
    </div>
  );
}