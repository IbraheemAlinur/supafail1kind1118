import React, { useState } from 'react';
import { X, Tag as TagIcon, Plus, Minus, ChevronUp, ChevronDown, Shield, Globe, Lock, Info, HelpCircle, Users, Check } from 'lucide-react';
import { useFeed } from '../../hooks/useFeed';
import { useStore } from '../../store/useStore';
import { POST_TEMPLATES } from '../../data/postTemplates';
import { useCommunities } from '../../hooks/useCommunities';

interface CreateAskModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityId?: string;
}

export default function CreateAskModal({ isOpen, onClose, communityId }: CreateAskModalProps) {
  const [type, setType] = useState<'ask' | 'offer'>('ask');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [kiPoints, setKiPoints] = useState(100);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState(communityId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(true);
  const [showKiPointsInfo, setShowKiPointsInfo] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { createPost } = useFeed();
  const { communities, fetchCommunities } = useCommunities();
  const user = useStore(state => state.user);

  React.useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  const handleTemplateSelect = (template: typeof POST_TEMPLATES[0]) => {
    setTitle(template.title);
    setDescription(template.description);
    setKiPoints(template.suggestedKiPoints);
    setTags(template.suggestedTags);
    setShowTemplates(false);
  };

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
      await createPost({
        title: title.trim(),
        description: description.trim(),
        type,
        kiPoints,
        tags,
        communityId: selectedCommunity || undefined
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        resetForm();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
      console.error('Error creating post:', err);
      setIsSubmitting(false);
    }
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
    setSelectedCommunity(communityId || '');
    setShowTemplates(true);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 id="modal-title" className="text-lg font-medium text-gray-900">
                {showTemplates ? 'Choose a Template' : `Create new ${type}`}
              </h2>
              <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 rounded-md" role="alert">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {showSuccess && (
              <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50" role="alert">
                <div className="flex items-center">
                  <Check className="h-5 w-5 mr-2" />
                  <p className="font-medium">Post created successfully!</p>
                </div>
              </div>
            )}

            {showTemplates ? (
              <>
                <div className="flex space-x-4 mb-4" role="radiogroup" aria-label="Post type">
                  <button
                    type="button"
                    onClick={() => setType('ask')}
                    className={`flex-1 py-3 px-4 rounded-md text-left relative ${
                      type === 'ask'
                        ? 'bg-purple-100 text-purple-800 ring-2 ring-purple-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    aria-checked={type === 'ask'}
                    role="radio"
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
                    aria-checked={type === 'offer'}
                    role="radio"
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
                      aria-label={`Use template: ${template.title}`}
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
                <div className="flex space-x-4 mb-4" role="radiogroup" aria-label="Post type">
                  <button
                    type="button"
                    onClick={() => setType('ask')}
                    className={`flex-1 py-3 px-4 rounded-md text-left relative ${
                      type === 'ask'
                        ? 'bg-purple-100 text-purple-800 ring-2 ring-purple-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    aria-checked={type === 'ask'}
                    role="radio"
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
                    aria-checked={type === 'offer'}
                    role="radio"
                  >
                    <div className="font-medium mb-1">Offer Help</div>
                    <p className="text-sm opacity-75">Share your expertise</p>
                  </button>
                </div>

                <div>
                  <label htmlFor="post-title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    id="post-title"
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder={type === 'ask' ? 'What do you need help with?' : 'What expertise can you share?'}
                    required
                    aria-required="true"
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label htmlFor="post-description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="post-description"
                    name="description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder={type === 'ask' 
                      ? 'Describe what you need help with in detail. Be specific about your requirements and goals.'
                      : 'Describe what you can offer. Include your experience level and any specific areas of expertise.'
                    }
                    required
                    aria-required="true"
                  />
                </div>

                <div>
                  <label htmlFor="post-community" className="block text-sm font-medium text-gray-700">
                    Community
                  </label>
                  <div className="mt-1 relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      id="post-community"
                      name="community"
                      value={selectedCommunity}
                      onChange={(e) => setSelectedCommunity(e.target.value)}
                      className="mt-1 block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      aria-label="Select community"
                    >
                      <option value="">No community (post to main feed)</option>
                      {communities.map((community) => (
                        <option key={community.id} value={community.id}>
                          {community.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="post-tags" className="block text-sm font-medium text-gray-700">
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
                            aria-label={`Remove tag ${tag}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      id="post-tags"
                      name="tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Add relevant skills or topics (press Enter)"
                      aria-label="Add tags"
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="post-ki-points" className="block text-sm font-medium text-gray-700">
                      Ki Points
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowKiPointsInfo(!showKiPointsInfo)}
                      className="text-gray-400 hover:text-gray-500"
                      aria-label="Show Ki Points information"
                    >
                      <HelpCircle className="h-5 w-5" />
                    </button>
                  </div>

                  {showKiPointsInfo && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg" role="tooltip">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">About Ki Points</h4>
                      <p className="text-sm text-blue-700">
                        {type === 'ask'
                          ? 'Ki points represent the value you place on receiving help. Higher points increase visibility and show commitment to compensating helpers fairly.'
                          : 'Ki points represent the value of your expertise. Set them based on the time and effort required to help others.'
                        }
                      </p>
                      <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
                        <li>Minimum: 100 points</li>
                        <li>Increments of 100 points</li>
                        <li>Points are transferred upon completion</li>
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center space-x-4">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        id="post-ki-points"
                        name="kiPoints"
                        value={kiPoints}
                        readOnly
                        className="block w-full rounded-md border-gray-300 bg-gray-50 pr-20 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm cursor-default"
                        aria-label="Ki Points amount"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center">
                        <div className="flex flex-col border-l border-gray-300">
                          <button
                            type="button"
                            onClick={() => setKiPoints(prev => prev + 100)}
                            className="flex-1 px-2 hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                            aria-label="Increase Ki Points"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setKiPoints(prev => Math.max(100, prev - 100))}
                            className="flex-1 px-2 hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                            disabled={kiPoints <= 100}
                            aria-label="Decrease Ki Points"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    aria-disabled={isSubmitting}
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