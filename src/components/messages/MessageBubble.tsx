import React from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { Check, CheckCheck, Clock } from 'lucide-react';

interface MessageBubbleProps {
  content: string;
  timestamp: Date | string | number;
  isOwn: boolean;
  status?: 'sent' | 'delivered' | 'read' | 'pending';
  avatar: string;
  name: string;
}

export default function MessageBubble({ 
  content, 
  timestamp, 
  isOwn, 
  status = 'sent', 
  avatar, 
  name 
}: MessageBubbleProps) {
  const getFormattedTime = () => {
    if (timestamp instanceof Date && isValid(timestamp)) {
      return format(timestamp, 'h:mm a');
    }
    
    if (typeof timestamp === 'string') {
      const date = parseISO(timestamp);
      if (isValid(date)) {
        return format(date, 'h:mm a');
      }
    }
    
    if (typeof timestamp === 'number') {
      const date = new Date(timestamp);
      if (isValid(date)) {
        return format(date, 'h:mm a');
      }
    }
    
    return '';
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3 text-gray-400" />;
      case 'sent':
        return <Check className="h-3 w-3" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-indigo-600" />;
      default:
        return null;
    }
  };

  const formattedTime = getFormattedTime();

  return (
    <div className={`flex items-start space-x-3 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <img src={avatar} alt={name} className="w-8 h-8 rounded-full" />
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-2 rounded-lg max-w-md ${
            isOwn
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
        </div>
        <div className="flex items-center space-x-1 mt-1">
          {formattedTime && (
            <span className="text-xs text-gray-500">
              {formattedTime}
            </span>
          )}
          {isOwn && status && (
            <span className="text-gray-500">
              {getStatusIcon()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}