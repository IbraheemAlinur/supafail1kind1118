import React, { useState } from 'react';
import { Search, Shield, Star, Users } from 'lucide-react';
import { Community, CommunityMember } from '../../store/communityStore';
import { useCommunityStore } from '../../store/communityStore';
import { useStore } from '../../store/useStore';
import MemberRoleMenu from './MemberRoleMenu';

interface MemberManagementProps {
  community: Community;
}

const MemberManagement: React.FC<MemberManagementProps> = ({ community }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'moderator' | 'member'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const updateMemberRole = useCommunityStore(state => state.updateMemberRole);
  const removeMember = useCommunityStore(state => state.removeMember);
  const updateMemberStatus = useCommunityStore(state => state.updateMemberStatus);
  const currentUser = useStore(state => state.user);

  const isCurrentUserAdmin = currentUser && 
    community.members.some(m => m.id === currentUser.id && m.role === 'admin');

  const filteredMembers = community.members.filter(member => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!member.name.toLowerCase().includes(query)) return false;
    }
    if (roleFilter !== 'all' && member.role !== roleFilter) return false;
    if (statusFilter !== 'all' && member.status !== statusFilter) return false;
    return true;
  });

  const handleRoleChange = async (memberId: string, newRole: CommunityMember['role']) => {
    if (!isCurrentUserAdmin) return;
    
    try {
      await updateMemberRole(community.id, memberId, newRole);
    } catch (error) {
      console.error('Failed to update member role:', error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!isCurrentUserAdmin) return;

    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await removeMember(community.id, memberId);
      } catch (error) {
        console.error('Failed to remove member:', error);
      }
    }
  };

  const handleStatusChange = async (memberId: string, newStatus: CommunityMember['status']) => {
    if (!isCurrentUserAdmin) return;

    try {
      await updateMemberStatus(community.id, memberId, newStatus);
    } catch (error) {
      console.error('Failed to update member status:', error);
    }
  };

  const getRoleBadge = (role: CommunityMember['role']) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
            <Shield className="h-3 w-3 mr-1" />
            Admin
          </span>
        );
      case 'moderator':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            <Star className="h-3 w-3 mr-1" />
            Moderator
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
          className="border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admins</option>
          <option value="moderator">Moderators</option>
          <option value="member">Members</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Members List */}
      <div className="bg-white overflow-hidden rounded-lg">
        <ul className="divide-y divide-gray-200">
          {filteredMembers.map((member) => (
            <li key={member.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center min-w-0">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="h-10 w-10 rounded-full"
                  />
                  <div className="ml-3">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {member.name}
                      </p>
                      {getRoleBadge(member.role)}
                    </div>
                    <p className="text-sm text-gray-500">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {member.status === 'pending' && isCurrentUserAdmin && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStatusChange(member.id, 'approved')}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange(member.id, 'rejected')}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  <MemberRoleMenu
                    member={member}
                    onRoleChange={(role) => handleRoleChange(member.id, role)}
                    onRemoveMember={() => handleRemoveMember(member.id)}
                    isCurrentUserAdmin={isCurrentUserAdmin}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>

        {filteredMembers.length === 0 && (
          <div className="text-center py-6">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No members found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No members match your current filters.
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Members</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{community.members.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-500">Admins</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {community.members.filter(m => m.role === 'admin').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-500">Moderators</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {community.members.filter(m => m.role === 'moderator').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {community.members.filter(m => m.status === 'pending').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MemberManagement;