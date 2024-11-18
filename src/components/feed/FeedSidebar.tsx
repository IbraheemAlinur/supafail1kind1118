import React from 'react';
import { Tag, Users, X } from 'lucide-react';

interface FeedSidebarProps {
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  selectedCommunities: string[];
  setSelectedCommunities: (communities: string[]) => void;
}

const POPULAR_TAGS = [
  'Design',
  'Development',
  'Marketing',
  'Business',
  'Cloud',
  'AI/ML',
  'Mobile',
  'DevOps',
  'Blockchain',
  'UI/UX'
];

const POPULAR_COMMUNITIES = [
  'Tech Entrepreneurs',
  'Cloud Computing',
  'Digital Marketing',
  'Startup Founders',
  'Web Development',
  'Product Design',
  'Data Science',
  'Mobile Development'
];

export default function FeedSidebar({
  selectedTags,
  setSelectedTags,
  selectedCommunities,
  setSelectedCommunities
}: FeedSidebarProps) {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const toggleCommunity = (community: string) => {
    if (selectedCommunities.includes(community)) {
      setSelectedCommunities(selectedCommunities.filter(c => c !== community));
    } else {
      setSelectedCommunities([...selectedCommunities, community]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Filters */}
      {(selectedTags.length > 0 || selectedCommunities.length > 0) && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">Active Filters</h3>
            <button
              onClick={() => {
                setSelectedTags([]);
                setSelectedCommunities([]);
              }}
              className="text-xs text-indigo-600 hover:text-indigo-500"
            >
              Clear all
            </button>
          </div>
          <div className="space-y-2">
            {selectedTags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-2"
              >
                {tag}
                <button
                  onClick={() => toggleTag(tag)}
                  className="ml-1 text-indigo-600 hover:text-indigo-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {selectedCommunities.map(community => (
              <span
                key={community}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-2"
              >
                {community}
                <button
                  onClick={() => toggleCommunity(community)}
                  className="ml-1 text-purple-600 hover:text-purple-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Popular Tags */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Tag className="h-5 w-5 text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900">Popular Tags</h3>
        </div>
        <div className="space-y-2">
          {POPULAR_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${
                selectedTags.includes(tag)
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Popular Communities */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-5 w-5 text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900">Popular Communities</h3>
        </div>
        <div className="space-y-2">
          {POPULAR_COMMUNITIES.map(community => (
            <button
              key={community}
              onClick={() => toggleCommunity(community)}
              className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                selectedCommunities.includes(community)
                  ? 'bg-purple-100 text-purple-800'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {community}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}