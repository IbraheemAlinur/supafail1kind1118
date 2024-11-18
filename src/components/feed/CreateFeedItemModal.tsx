import React, { useState } from 'react';
import { X, Tag as TagIcon, Plus, Minus, Shield, Globe, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { supabase } from '../../lib/supabase/client';
import { POST_TEMPLATES } from '../../data/postTemplates';

interface CreateFeedItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityId?: string;
}

export default function CreateFeedItemModal({ isOpen, onClose, communityId }: CreateFeedItemModalProps) {
  const [type, setType] = useState<'ask' | 'offer'>('ask');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [kiPoints, setKiPoints] = useState(100);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);

  const user = useStore(state => state.user);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    if (kiPoints < 100) {
      setError('Minimum Ki Points is 100');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create the post in Supabase
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert([{
          title: title.trim(),
          description: description.trim(),
          type,
          ki_points: kiPoints,
          author_id: user.id,
          community_id: communityId || null,
          status: 'open',
          visibility: 'public',
          metadata: {
            attachments: [],
            requirements: [],
            timeEstimate: null,
            preferredSkills: [],
            completionCriteria: []
          }
        }])
        .select()
        .single();

      if (postError) throw postError;

      if (!post) throw new Error('Failed to create post');

      // Add tags if any
      if (tags.length > 0) {
        const { error: tagError } = await supabase
          .from('post_tags')
          .insert(
            tags.map(tag => ({
              post_id: post.id,
              tag
            }))
          );

        if (tagError) throw tagError;
      }

      onClose();
      resetForm();
      
      // Navigate to the post detail page
      navigate(`/dashboard/posts/${post.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
      console.error('Error creating post:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTemplateSelect = (template: typeof POST_TEMPLATES[0]) => {
    setTitle(template.title);
    setDescription(template.description);
    setKiPoints(template.suggestedKiPoints);
    setTags(template.suggestedTags);
    setShowTemplates(false);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const resetForm = () => {
    setType('ask');
    setTitle('');
    setDescription('');
    setKiPoints(100);
    setTags([]);
    setTagInput('');
    setError(null);
    setShowTemplates(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {showTemplates ? 'Choose a Template' : `Create new ${type}`}
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {showTemplates ? (
              <>
                <div className="flex space-x-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setType('ask')}
                    className={`flex-1 py-3 px-4 rounded-md text-left relative ${
                      type === 'ask'
                        ? 'bg-purple-100 text-purple-800 ring-2 ring-purple-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <div className="font-medium mb-1">Ask for Help</div>
                    <p className="text-sm opacity-75">Request expertise or assistance</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('offer')}
                    className={`flex-1 py-3 px-4 rounded-md text-left relative ${
                      type === 'offer'
                        ? 'bg-green-100 text-green-800 ring-2 ring-green-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <div className="font-medium mb-1">Offer Help</div>
                    <p className="text-sm opacity-75">Share your expertise</p>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {POST_TEMPLATES.filter(t => t.type === type).map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className="text-left p-4 rounded-lg border border-gray-200 hover:border-indigo-500 hover:shadow-sm transition-all"
                    >
                      <h4 className="font-medium text-gray-900">{template.title}</h4>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{template.description}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {template.suggestedTags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-indigo-600">{template.suggestedKiPoints} Ki</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowTemplates(false)}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    Start from scratch instead
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder={type === 'ask' ? 'What do you need help with?' : 'What can you help with?'}
                    required
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
                    placeholder="Provide more details..."
                    required
                  />
                </div>

                <div>
                  <label htmlFor="kiPoints" className="block text-sm font-medium text-gray-700">
                    Ki Points
                  </label>
                  <input
                    type="number"
                    id="kiPoints"
                    min="100"
                    step="100"
                    value={kiPoints}
                    onChange={(e) => setKiPoints(Math.max(100, parseInt(e.target.value)))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">Minimum 100 Ki Points</p>
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                    Tags
                  </label>
                  <div className="mt-1">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800"
                        >
                          <TagIcon className="h-4 w-4 mr-1" />
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Add tags (press Enter)"
                    />
                  </div>
                </div>

                <div className="mt-5 sm:mt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </div>
                    ) : (
                      `Create ${type}`
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}