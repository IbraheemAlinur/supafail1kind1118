import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import CommunityCard from './CommunityCard';
import CreateCommunityModal from './CreateCommunityModal';
import { useCommunities } from '../../hooks/useCommunities';
import ErrorBoundary from '../ErrorBoundary';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function CommunitiesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'member'>('all');
  const { communities, loading, error, fetchCommunities } = useCommunities();

  useEffect(() => {
    fetchCommunities().catch(console.error);
  }, [fetchCommunities]);

  const filteredCommunities = communities.filter(community => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = community.name?.toLowerCase().includes(query) || false;
      const descMatch = community.description?.toLowerCase().includes(query) || false;
      if (!nameMatch && !descMatch) return false;
    }

    // Member filter
    if (filter === 'member') {
      return community.members.some(member => member.status === 'approved');
    }

    return true;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Error loading communities: {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communities</h1>
          <p className="mt-2 text-gray-600">Join communities that match your interests and goals.</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Community
        </button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'member')}
            className="border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Communities</option>
            <option value="member">My Communities</option>
          </select>
        </div>
      </div>

      <ErrorBoundary>
        {filteredCommunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map((community) => (
              <CommunityCard
                key={community.id}
                id={community.id}
                name={community.name}
                description={community.description}
                memberCount={community.member_count}
                image={community.image_url || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2000'}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            {searchQuery 
              ? "No communities found matching your search. Try adjusting your filters."
              : "No communities found. Create one to get started!"}
          </div>
        )}
      </ErrorBoundary>

      <CreateCommunityModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}