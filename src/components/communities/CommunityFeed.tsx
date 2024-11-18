import React, { useEffect } from 'react';
import { useCommunityPosts } from '../../hooks/useCommunityPosts';
import AskCard from '../asks/AskCard';
import { Plus, Filter } from 'lucide-react';
import CreateAskModal from '../asks/CreateAskModal';
import { useStore } from '../../store/useStore';
import LoadingSpinner from '../ui/LoadingSpinner';

interface CommunityFeedProps {
  communityId: string;
}

export default function CommunityFeed({ communityId }: CommunityFeedProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [filter, setFilter] = React.useState<'all' | 'asks' | 'offers'>('all');
  const { loading, error, fetchPosts } = useCommunityPosts(communityId);
  const [posts, setPosts] = React.useState<any[]>([]);
  const user = useStore(state => state.user);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const fetchedPosts = await fetchPosts();
        setPosts(fetchedPosts);
      } catch (err) {
        console.error('Error loading posts:', err);
      }
    };
    loadPosts();
  }, [fetchPosts]);

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    return post.type === filter;
  });

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'asks' | 'offers')}
            className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Posts</option>
            <option value="asks">Asks Only</option>
            <option value="offers">Offers Only</option>
          </select>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Post
        </button>
      </div>

      {filteredPosts.length > 0 ? (
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <AskCard key={post.id} {...post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No posts found. Be the first to create one!</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Post
          </button>
        </div>
      )}

      <CreateAskModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        communityId={communityId}
      />
    </div>
  );
}