import React from 'react';
import { MessageCircle, Calendar, Users, Award, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useProfile } from '../../hooks/useProfile';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function ActivityTimeline() {
  const { activity, activityLoading } = useProfile();

  if (activityLoading) {
    return <LoadingSpinner />;
  }

  if (!activity || activity.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No Activity</h3>
        <p className="mt-1 text-sm text-gray-500">
          Start participating in the community to see your activity here.
        </p>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ask':
      case 'offer':
        return <MessageCircle className="h-5 w-5" />;
      case 'event':
        return <Calendar className="h-5 w-5" />;
      case 'community':
        return <Users className="h-5 w-5" />;
      case 'achievement':
        return <Award className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'ask':
        return 'text-purple-500 bg-purple-100';
      case 'offer':
        return 'text-green-500 bg-green-100';
      case 'event':
        return 'text-blue-500 bg-blue-100';
      case 'community':
        return 'text-indigo-500 bg-indigo-100';
      case 'achievement':
        return 'text-yellow-500 bg-yellow-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activity.map((item, idx) => (
          <li key={item.id}>
            <div className="relative pb-8">
              {idx !== activity.length - 1 && (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex space-x-3">
                <div>
                  <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getActivityColor(item.type)}`}>
                    {getActivityIcon(item.type)}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-900">{item.description}</p>
                    <p className="mt-0.5 text-sm font-medium text-gray-900">{item.title}</p>
                    {item.status && (
                      <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'completed' ? 'bg-green-100 text-green-800' :
                        item.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    <time dateTime={item.timestamp}>
                      {format(new Date(item.timestamp), 'MMM d, yyyy')}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}