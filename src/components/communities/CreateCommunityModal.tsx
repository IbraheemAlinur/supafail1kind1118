import React, { useState } from 'react';
import { X, Upload, Tag as TagIcon, Plus, Minus, Shield, Globe, Lock } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateCommunityModal({ isOpen, onClose }: CreateCommunityModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [applicationQuestions, setApplicationQuestions] = useState<string[]>([]);
  const [guidelines, setGuidelines] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'unlisted'>('public');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const user = useStore(state => state.user);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!name.trim()) {
      setError('Community name is required');
      return;
    }

    if (!description.trim()) {
      setError('Community description is required');
      return;
    }

    if (requiresApproval && applicationQuestions.length === 0) {
      setError('Please add at least one application question');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create the community
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .insert([{
          name: name.trim(),
          description: description.trim(),
          image_url: image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2070',
          owner_id: user.id,
          visibility,
          requires_approval: requiresApproval,
          guidelines,
          settings: {
            allowMemberPosts: true,
            allowMemberEvents: true,
            allowMemberInvites: true,
            autoApproveMembers: !requiresApproval
          }
        }])
        .select()
        .single();

      if (communityError) throw communityError;
      if (!community) throw new Error('Failed to create community');

      // Add tags if any
      if (tags.length > 0) {
        const { error: tagError } = await supabase
          .from('community_tags')
          .insert(
            tags.map(tag => ({
              community_id: community.id,
              tag
            }))
          );

        if (tagError) throw tagError;
      }

      // Add application questions if required
      if (requiresApproval && applicationQuestions.length > 0) {
        const { error: questionError } = await supabase
          .from('community_application_questions')
          .insert(
            applicationQuestions.map((question, index) => ({
              community_id: community.id,
              question,
              order: index
            }))
          );

        if (questionError) throw questionError;
      }

      onClose();
      resetForm();
      navigate(`/dashboard/communities/${community.id}`);
    } catch (err) {
      console.error('Error creating community:', err);
      setError(err instanceof Error ? err.message : 'Failed to create community');
    } finally {
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

  const addApplicationQuestion = () => {
    setApplicationQuestions([...applicationQuestions, '']);
  };

  const updateApplicationQuestion = (index: number, value: string) => {
    const newQuestions = [...applicationQuestions];
    newQuestions[index] = value;
    setApplicationQuestions(newQuestions);
  };

  const removeApplicationQuestion = (index: number) => {
    setApplicationQuestions(applicationQuestions.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setImage('');
    setTags([]);
    setTagInput('');
    setRequiresApproval(false);
    setApplicationQuestions([]);
    setGuidelines('');
    setVisibility('public');
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Create New Community</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Community Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                  required
                />
              </div>

              <div>
                <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">
                  Visibility
                </label>
                <div className="mt-1 grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setVisibility('public')}
                    className={`flex items-center justify-center px-3 py-2 border rounded-md ${
                      visibility === 'public'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibility('private')}
                    className={`flex items-center justify-center px-3 py-2 border rounded-md ${
                      visibility === 'private'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Private
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibility('unlisted')}
                    className={`flex items-center justify-center px-3 py-2 border rounded-md ${
                      visibility === 'unlisted'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Unlisted
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                  Cover Image URL
                </label>
                <div className="mt-1 flex items-center">
                  <input
                    type="text"
                    id="image"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="https://example.com/image.jpg"
                  />
                  <Upload className="h-5 w-5 ml-2 text-gray-400" />
                </div>
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

              <div>
                <label htmlFor="guidelines" className="block text-sm font-medium text-gray-700">
                  Community Guidelines
                </label>
                <textarea
                  id="guidelines"
                  rows={4}
                  value={guidelines}
                  onChange={(e) => setGuidelines(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter community guidelines and rules..."
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requiresApproval"
                    checked={requiresApproval}
                    onChange={(e) => setRequiresApproval(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="requiresApproval" className="ml-2 block text-sm text-gray-900">
                    Require approval for new members
                  </label>
                </div>

                {requiresApproval && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Application Questions
                    </label>
                    {applicationQuestions.map((question, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={question}
                          onChange={(e) => updateApplicationQuestion(index, e.target.value)}
                          placeholder="Enter question"
                          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeApplicationQuestion(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Minus className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addApplicationQuestion}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Question
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-5 sm:mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    'Create Community'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}