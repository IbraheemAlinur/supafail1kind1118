import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, MessageCircle, Sparkles, Calendar } from 'lucide-react';
import { useCommunities } from '../../hooks/useCommunities';
import CommunityTabs from './CommunityTabs';
import { useCommunityStore } from '../../store/communityStore';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function CommunityDetail() {
  const { id = '' } = useParams();
  const { communities, loading, error } = useCommunities();
  const updateCommunity = useCommunityStore(state => state.updateCommunity);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Error loading community</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <Link to="/dashboard/communities" className="mt-4 text-indigo-600 hover:text-indigo-500">
            Back to Communities
          </Link>
        </div>
      </div>
    );
  }

  const community = communities.find(c => c.id === id);

  if (!community) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Community not found</h2>
          <p className="mt-2 text-gray-600">The community you're looking for doesn't exist or has been removed.</p>
          <Link to="/dashboard/communities" className="mt-4 text-indigo-600 hover:text-indigo-500">
            Back to Communities
          </Link>
        </div>
      </div>
    );
  }

  const stats = {
    asks: community.stats?.asks || 0,
    offers: community.stats?.offers || 0,
    totalKiPoints: community.stats?.totalKiPoints || 0
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="h-48 bg-cover bg-center relative" style={{ backgroundImage: `url(${community.image})` }}>
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        {/* Community Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{community.name}</h1>
            <p className="mt-2 text-gray-600 max-w-3xl">{community.description}</p>
            
            <div className="mt-4 flex items-center space-x-6">
              <div className="flex items-center text-gray-500">
                <Users className="h-5 w-5 mr-2" />
                <span>{community.memberCount} members</span>
              </div>
              <div className="flex items-center text-gray-500">
                <MessageCircle className="h-5 w-5 mr-2" />
                <span>{stats.asks + stats.offers} posts</span>
              </div>
              <div className="flex items-center text-gray-500">
                <Sparkles className="h-5 w-5 mr-2" />
                <span>{stats.totalKiPoints} Ki shared</span>
              </div>
              <div className="flex items-center text-gray-500">
                <Calendar className="h-5 w-5 mr-2" />
                <span>Created {new Date(community.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Tags */}
            {community.tags && community.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {community.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs Section */}
        <CommunityTabs 
          community={community} 
          onUpdateCommunity={(updates) => updateCommunity(community.id, updates)} 
        />
      </div>
    </div>
  );
}