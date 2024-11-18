import React, { useState } from 'react';
import { MessageCircle, ThumbsUp, UserPlus, X, Check } from 'lucide-react';

interface NotificationsDropdownProps {
  onClose: () => void;
}

interface Notification {
  id: string;
  type: 'response' | 'interest' | 'join';
  message: string;
  time: string;
  icon: React.ElementType;
  read: boolean;
}

export default function NotificationsDropdown({ onClose }: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'response',
      message: 'Sarah Chen responded to your ask about UI/UX feedback',
      time: '5m ago',
      icon: MessageCircle,
      read: false,
    },
    {
      id: '2',
      type: 'interest',
      message: 'Michael Ross is interested in your cloud architecture mentorship',
      time: '1h ago',
      icon: ThumbsUp,
      read: false,
    },
    {
      id: '3',
      type: 'join',
      message: 'Tech Entrepreneurs community has 5 new members',
      time: '2h ago',
      icon: UserPlus,
      read: true,
    },
  ]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.notifications-dropdown')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const dismissNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="notifications-dropdown absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
          <button 
            onClick={markAllAsRead}
            className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center"
          >
            <Check className="h-4 w-4 mr-1" />
            Mark all as read
          </button>
        </div>
        <div className="space-y-4">
          {notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <div
                key={notification.id}
                className={`flex items-start space-x-3 p-3 rounded-lg group ${
                  notification.read ? 'bg-white' : 'bg-indigo-50'
                }`}
              >
                <div className={`flex-shrink-0 ${
                  notification.read ? 'text-gray-400' : 'text-indigo-500'
                }`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                    {notification.message}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{notification.time}</p>
                </div>
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            );
          })}

          {notifications.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              No new notifications
            </div>
          )}
        </div>
        {notifications.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="w-full text-center text-sm text-indigo-600 hover:text-indigo-500">
              View all notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
}