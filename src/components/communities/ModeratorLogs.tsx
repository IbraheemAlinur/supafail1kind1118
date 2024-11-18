import React from 'react';
import { Shield, Clock, AlertTriangle, UserMinus, Settings } from 'lucide-react';
import { Community } from '../../store/communityStore';
import { format } from 'date-fns';

interface ModeratorAction {
  id: string;
  type: 'member_removed' | 'role_changed' | 'settings_updated' | 'member_banned';
  moderatorId: string;
  moderatorName: string;
  targetId?: string;
  targetName?: string;
  details: string;
  timestamp: Date;
}

interface ModeratorLogsProps {
  community: Community;
}

// Sample moderator actions for demonstration
const SAMPLE_ACTIONS: ModeratorAction[] = [
  {
    id: '1',
    type: 'member_removed',
    moderatorId: 'mod1',
    moderatorName: 'John Doe',
    targetId: 'user1',
    targetName: 'Jane Smith',
    details: 'Removed member for violating community guidelines',
    timestamp: new Date(Date.now() - 3600000) // 1 hour ago
  },
  {
    id: '2',
    type: 'role_changed',
    moderatorId: 'mod1',
    moderatorName: 'John Doe',
    targetId: 'user2',
    targetName: 'Mike Johnson',
    details: 'Promoted to moderator',
    timestamp: new Date(Date.now() - 86400000) // 1 day ago
  },
  {
    id: '3',
    type: 'settings_updated',
    moderatorId: 'mod2',
    moderatorName: 'Sarah Wilson',
    details: 'Updated community visibility settings',
    timestamp: new Date(Date.now() - 172800000) // 2 days ago
  }
];

const ModeratorLogs: React.FC<ModeratorLogsProps> = ({ community }) => {
  const getActionIcon = (type: ModeratorAction['type']) => {
    switch (type) {
      case 'member_removed':
        return <UserMinus className="h-5 w-5 text-red-500" />;
      case 'role_changed':
        return <Shield className="h-5 w-5 text-indigo-500" />;
      case 'settings_updated':
        return <Settings className="h-5 w-5 text-gray-500" />;
      case 'member_banned':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Moderation History</h3>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
          Last 30 days
        </span>
      </div>

      <div className="bg-white overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {SAMPLE_ACTIONS.map((action) => (
            <li key={action.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getActionIcon(action.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {action.moderatorName}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {format(action.timestamp, 'MMM d, yyyy h:mm a')}
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {action.details}
                    {action.targetName && (
                      <span className="font-medium"> - {action.targetName}</span>
                    )}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {SAMPLE_ACTIONS.length === 0 && (
          <div className="text-center py-6">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No moderation actions</h3>
            <p className="mt-1 text-sm text-gray-500">
              No moderation actions have been taken in the last 30 days.
            </p>
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-gray-400" />
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-gray-900">
              About Moderation Logs
            </h4>
            <p className="mt-1 text-sm text-gray-500">
              Moderation logs are kept for transparency and accountability. All actions taken by moderators and admins are recorded here.
              Logs are retained for 30 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeratorLogs;