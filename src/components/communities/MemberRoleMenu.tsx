import React, { useState } from 'react';
import { Shield, Star, UserMinus, MoreVertical } from 'lucide-react';
import { CommunityMember } from '../../store/communityStore';

interface MemberRoleMenuProps {
  member: CommunityMember;
  onRoleChange: (role: CommunityMember['role']) => void;
  onRemoveMember: () => void;
  isCurrentUserAdmin: boolean;
}

const MemberRoleMenu: React.FC<MemberRoleMenuProps> = ({
  member,
  onRoleChange,
  onRemoveMember,
  isCurrentUserAdmin
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleRoleChange = (role: CommunityMember['role']) => {
    onRoleChange(role);
    setIsOpen(false);
  };

  const handleRemove = () => {
    onRemoveMember();
    setIsOpen(false);
  };

  // Don't show menu for admins if current user is not an admin
  if (member.role === 'admin' && !isCurrentUserAdmin) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-50"
      >
        <MoreVertical className="h-5 w-5 text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
            <div className="py-1" role="menu">
              {isCurrentUserAdmin && member.role !== 'admin' && (
                <button
                  onClick={() => handleRoleChange('admin')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Shield className="h-4 w-4 mr-2 text-purple-500" />
                  Make Admin
                </button>
              )}
              
              {member.role !== 'moderator' && (
                <button
                  onClick={() => handleRoleChange('moderator')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Star className="h-4 w-4 mr-2 text-indigo-500" />
                  Make Moderator
                </button>
              )}
              
              {member.role !== 'member' && (
                <button
                  onClick={() => handleRoleChange('member')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  Remove Role
                </button>
              )}
              
              <button
                onClick={handleRemove}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <UserMinus className="h-4 w-4 mr-2" />
                Remove Member
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MemberRoleMenu;