import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { MessageCircle, Calendar, Users, Settings } from 'lucide-react';
import CommunityFeed from './CommunityFeed';
import CommunityEvents from './CommunityEvents';
import CommunityMembers from './CommunityMembers';
import CommunityManagement from './CommunityManagement';
import { Community } from '../../store/communityStore';
import { useStore } from '../../store/useStore';

interface CommunityTabsProps {
  community: Community;
  onUpdateCommunity: (updates: Partial<Community>) => void;
}

export default function CommunityTabs({ community, onUpdateCommunity }: CommunityTabsProps) {
  const user = useStore(state => state.user);
  const isAdmin = user && community.members.some(m => m.id === user.id && m.role === 'admin');
  const isModerator = user && community.members.some(m => m.id === user.id && m.role === 'moderator');

  return (
    <Tabs defaultValue="feed">
      <TabsList>
        <TabsTrigger value="feed">
          <MessageCircle className="h-4 w-4 mr-2" />
          Feed
        </TabsTrigger>
        <TabsTrigger value="events">
          <Calendar className="h-4 w-4 mr-2" />
          Events
        </TabsTrigger>
        <TabsTrigger value="members">
          <Users className="h-4 w-4 mr-2" />
          Members
        </TabsTrigger>
        {(isAdmin || isModerator) && (
          <TabsTrigger value="manage">
            <Settings className="h-4 w-4 mr-2" />
            Manage
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="feed">
        <CommunityFeed communityId={community.id} />
      </TabsContent>

      <TabsContent value="events">
        <CommunityEvents communityId={community.id} />
      </TabsContent>

      <TabsContent value="members">
        <CommunityMembers community={community} />
      </TabsContent>

      {(isAdmin || isModerator) && (
        <TabsContent value="manage">
          <CommunityManagement 
            community={community} 
            onUpdateCommunity={onUpdateCommunity} 
          />
        </TabsContent>
      )}
    </Tabs>
  );
}