import React, { useState } from 'react';
import { Book, MessageCircle, Users, Star, Briefcase, Search } from 'lucide-react';
import { PostTemplate, getTemplatesByType } from '../../data/postTemplates';

interface TemplateSelectorProps {
  type: 'ask' | 'offer';
  onSelect: (template: PostTemplate) => void;
}

export default function TemplateSelector({ type, onSelect }: TemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PostTemplate['category'] | 'all'>('all');
  
  const templates = getTemplatesByType(type);
  
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories: { id: PostTemplate['category'] | 'all', label: string, icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Templates', icon: <Star className="h-5 w-5 text-gray-400" /> },
    { id: 'mentorship', label: 'Mentorship', icon: <Star className="h-5 w-5 text-yellow-500" /> },
    { id: 'feedback', label: 'Feedback', icon: <MessageCircle className="h-5 w-5 text-blue-500" /> },
    { id: 'networking', label: 'Networking', icon: <Users className="h-5 w-5 text-green-500" /> },
    { id: 'expertise', label: 'Expertise', icon: <Briefcase className="h-5 w-5 text-purple-500" /> },
    { id: 'resources', label: 'Resources', icon: <Book className="h-5 w-5 text-red-500" /> }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Start with a template</h3>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                selectedCategory === category.id
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.icon}
              <span className="ml-1.5">{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className="text-left p-4 rounded-lg border border-gray-200 hover:border-indigo-500 hover:shadow-sm transition-all"
          >
            <div className="flex items-start space-x-3">
              {categories.find(c => c.id === template.category)?.icon}
              <div>
                <h4 className="text-sm font-medium text-gray-900">{template.title}</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Suggested: {template.suggestedKiPoints} Ki
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {template.suggestedTags.slice(0, 2).map(tag => (
                    <span
                      key={tag}
                      className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {template.suggestedTags.length > 2 && (
                    <span className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                      +{template.suggestedTags.length - 2}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No templates found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}