import React, { useState } from 'react';
import { Link2, Trash2, Copy, Clock, Users } from 'lucide-react';
import { Community } from '../../store/communityStore';
import { format, isAfter } from 'date-fns';

interface InviteLinkManagerProps {
  community: Community;
  onCreateLink: (maxUses?: number, expiresIn?: number) => void;
  onRemoveLink: (code: string) => void;
}

const InviteLinkManager: React.FC<InviteLinkManagerProps> = ({
  community,
  onCreateLink,
  onRemoveLink,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [maxUses, setMaxUses] = useState<number | undefined>();
  const [expiresIn, setExpiresIn] = useState<number | undefined>();
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  const handleCreateLink = () => {
    onCreateLink(maxUses, expiresIn);
    setShowCreateForm(false);
    setMaxUses(undefined);
    setExpiresIn(undefined);
  };

  const copyToClipboard = async (code: string) => {
    const inviteUrl = `https://www.1kind.ai/communities/${community.id}/join?code=${code}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const isLinkValid = (link: Community['inviteLinks'][0]) => {
    if (link.expiresAt && isAfter(new Date(), new Date(link.expiresAt))) {
      return false;
    }
    if (link.maxUses && link.uses >= link.maxUses) {
      return false;
    }
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Invitation Links</h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Link2 className="h-4 w-4 mr-2" />
          Create New Link
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div>
            <label htmlFor="maxUses" className="block text-sm font-medium text-gray-700">
              Maximum Uses (optional)
            </label>
            <input
              type="number"
              id="maxUses"
              min="1"
              value={maxUses || ''}
              onChange={(e) => setMaxUses(e.target.value ? parseInt(e.target.value) : undefined)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Unlimited"
            />
          </div>

          <div>
            <label htmlFor="expiration" className="block text-sm font-medium text-gray-700">
              Expires In (optional)
            </label>
            <select
              id="expiration"
              value={expiresIn || ''}
              onChange={(e) => setExpiresIn(e.target.value ? parseInt(e.target.value) : undefined)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Never expires</option>
              <option value={3600000}>1 hour</option>
              <option value={86400000}>24 hours</option>
              <option value={604800000}>7 days</option>
              <option value={2592000000}>30 days</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateLink}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Create Link
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {community.inviteLinks?.map((link) => {
          const isValid = isLinkValid(link);
          return (
            <div
              key={link.code}
              className={`bg-white p-4 rounded-lg border ${
                isValid ? 'border-gray-200' : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {link.code}
                    </code>
                    {!isValid && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Expired
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {link.expiresAt
                        ? `Expires ${format(new Date(link.expiresAt), 'MMM d, yyyy')}`
                        : 'Never expires'}
                    </span>
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {link.maxUses
                        ? `${link.uses}/${link.maxUses} uses`
                        : `${link.uses} uses`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyToClipboard(link.code)}
                    className="p-2 text-gray-400 hover:text-gray-500"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onRemoveLink(link.code)}
                    className="p-2 text-red-400 hover:text-red-500"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {(!community.inviteLinks || community.inviteLinks.length === 0) && (
          <div className="text-center py-6 text-gray-500">
            No invitation links created yet
          </div>
        )}
      </div>

      {showCopiedMessage && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-md shadow-lg">
          Copied to clipboard!
        </div>
      )}
    </div>
  );
};

export default InviteLinkManager;