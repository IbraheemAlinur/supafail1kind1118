import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search } from 'lucide-react';
import { useFeed } from '../../hooks/useFeed';
import { useStore } from '../../store/useStore';
import CreateAskModal from '../asks/CreateAskModal';
import FeedItem from './FeedItem';
import LoadingSpinner from '../ui/LoadingSpinner';
import FeedSidebar from './FeedSidebar';

export default function FeedPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'asks' | 'offers'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const { items, loading, error, fetchPosts } = useFeed();
  const user = useStore(state => state.user);

  useEffect(() => {
    fetchPosts().catch(console.error);
  }, [fetchPosts]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-6 text-red-600">
        Error: {error}
      </div>
    );
  }

  const filteredItems = items.filter(item => {
    if (filter !== 'all' && item.type !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }
    if (selectedTags.length > 0) {
      if (!item.tags.some(tag => selectedTags.includes(tag))) return false;
    }
    if (selectedCommunities.length > 0) {
      if (!item.community || !selectedCommunities.includes(item.community.id)) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feed</h1>
          <p className="mt-2 text-gray-600">Discover asks and offers from the community</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Post
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-64">
          <FeedSidebar
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            selectedCommunities={selectedCommunities}
            setSelectedCommunities={setSelectedCommunities}
          />
        </div>

        <div className="flex-1">
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'asks' | 'offers')}
                  className="rounded-md border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Posts</option>
                  <option value="asks">Asks Only</option>
                  <option value="offers">Offers Only</option>
                </select>
              </div>
            </div>
          </div>

          {filteredItems.length > 0 ? (
            <div className="space-y-6">
              {filteredItems.map((item) => (
                <FeedItem
                  key={item.id}
                  {...item}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500">
                {searchQuery || selectedTags.length > 0 || selectedCommunities.length > 0
                  ? "No posts match your search criteria. Try adjusting your filters."
                  : "No posts found. Be the first to create one!"}
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Post
              </button>
            </div>
          )}
        </div>
      </div>

      <CreateAskModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}