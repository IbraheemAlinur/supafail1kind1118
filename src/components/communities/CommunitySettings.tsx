import React, { useState } from 'react';
import { Shield, Globe, Lock, Users, AlertTriangle } from 'lucide-react';
import { Community } from '../../store/communityStore';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import InviteLinkManager from './InviteLinkManager';

interface CommunitySettingsProps {
  community: Community;
  onUpdateCommunity: (updates: Partial<Community>) => void;
}

const CommunitySettings: React.FC<CommunitySettingsProps> = ({ community, onUpdateCommunity }) => {
  const [name, setName] = useState(community.name);
  const [description, setDescription] = useState(community.description);
  const [guidelines, setGuidelines] = useState(community.guidelines || '');
  const [visibility, setVisibility] = useState(community.visibility);
  const [requiresApproval, setRequiresApproval] = useState(community.requiresApproval);
  const [settings, setSettings] = useState(community.settings);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await onUpdateCommunity({
        name,
        description,
        guidelines,
        visibility,
        requiresApproval,
        settings
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update community settings');
    }
  };

  const handleCreateInviteLink = (maxUses?: number, expiresIn?: number) => {
    if (!community.settings.allowMemberInvites) {
      setError('Member invites are not allowed in this community');
      return;
    }

    try {
      onUpdateCommunity({
        inviteLinks: [
          ...(community.inviteLinks || []),
          {
            code: Math.random().toString(36).substring(2, 10).toUpperCase(),
            createdBy: 'user-id', // Replace with actual user ID
            createdAt: new Date(),
            expiresAt: expiresIn ? new Date(Date.now() + expiresIn) : undefined,
            maxUses,
            uses: 0,
          },
        ],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invite link');
    }
  };

  const handleRemoveInviteLink = (code: string) => {
    try {
      onUpdateCommunity({
        inviteLinks: community.inviteLinks?.filter((link) => link.code !== code) || [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove invite link');
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 rounded-md">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <p className="ml-3 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="invites">Invites</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Community Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="guidelines" className="block text-sm font-medium text-gray-700">
                Community Guidelines
              </label>
              <textarea
                id="guidelines"
                rows={6}
                value={guidelines}
                onChange={(e) => setGuidelines(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter community rules and guidelines..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visibility
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setVisibility('public')}
                  className={`flex items-center justify-center px-3 py-2 border rounded-md ${
                    visibility === 'public'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 bg-white text-gray-700'
                  }`}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Public
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('private')}
                  className={`flex items-center justify-center px-3 py-2 border rounded-md ${
                    visibility === 'private'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 bg-white text-gray-700'
                  }`}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Private
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('unlisted')}
                  className={`flex items-center justify-center px-3 py-2 border rounded-md ${
                    visibility === 'unlisted'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 bg-white text-gray-700'
                  }`}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Unlisted
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requiresApproval"
                    checked={requiresApproval}
                    onChange={(e) => setRequiresApproval(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="requiresApproval" className="ml-2 block text-sm text-gray-900">
                    Require approval for new members
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowMemberPosts"
                    checked={settings.allowMemberPosts}
                    onChange={(e) => setSettings({ ...settings, allowMemberPosts: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="allowMemberPosts" className="ml-2 block text-sm text-gray-900">
                    Allow members to create posts
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowMemberEvents"
                    checked={settings.allowMemberEvents}
                    onChange={(e) => setSettings({ ...settings, allowMemberEvents: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="allowMemberEvents" className="ml-2 block text-sm text-gray-900">
                    Allow members to create events
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowMemberInvites"
                    checked={settings.allowMemberInvites}
                    onChange={(e) => setSettings({ ...settings, allowMemberInvites: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="allowMemberInvites" className="ml-2 block text-sm text-gray-900">
                    Allow members to invite others
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Save Changes
              </button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="invites">
          <InviteLinkManager
            community={community}
            onCreateLink={handleCreateInviteLink}
            onRemoveLink={handleRemoveInviteLink}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunitySettings;