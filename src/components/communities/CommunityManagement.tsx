import React from 'react';
import { Shield, Users, Settings, AlertTriangle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import MemberManagement from './MemberManagement';
import CommunitySettings from './CommunitySettings';
import ModeratorLogs from './ModeratorLogs';
import { Community } from '../../store/communityStore';

interface CommunityManagementProps {
  community: Community;
  onUpdateCommunity: (updates: Partial<Community>) => void;
}

const CommunityManagement: React.FC<CommunityManagementProps> = ({ community, onUpdateCommunity }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Community Management</h2>
          <Shield className="h-5 w-5 text-indigo-600" />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Manage your community settings, members, and moderation tools.
        </p>
      </div>

      <Tabs defaultValue="members" className="p-6">
        <TabsList>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-2" />
            Members
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="moderation">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Moderation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <MemberManagement community={community} />
        </TabsContent>

        <TabsContent value="settings">
          <CommunitySettings 
            community={community} 
            onUpdateCommunity={onUpdateCommunity} 
          />
        </TabsContent>

        <TabsContent value="moderation">
          <ModeratorLogs community={community} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityManagement;