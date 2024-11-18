import React, { useState, useRef } from 'react';
import { Settings, Edit2, Camera, X, Check, MapPin, Link as LinkIcon, Twitter, Github } from 'lucide-react';
import { useStore } from '../../store/useStore';
import CustomUrlSection from './CustomUrlSection';
import { Skill } from '../../types';

interface ProfileHeaderProps {
  name: string;
  bio: string;
  avatar: string;
  kiPoints: number;
  isOwnProfile: boolean;
}

export default function ProfileHeader({ name, bio, avatar, kiPoints, isOwnProfile }: ProfileHeaderProps) {
  const user = useStore(state => state.user);
  const updateUser = useStore(state => state.updateUser);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [editedBio, setEditedBio] = useState(bio);
  const [editedAvatar, setEditedAvatar] = useState(avatar);
  const [editedLocation, setEditedLocation] = useState(user?.location || '');
  const [editedWebsite, setEditedWebsite] = useState(user?.website || '');
  const [editedTwitter, setEditedTwitter] = useState(user?.twitter || '');
  const [editedGithub, setEditedGithub] = useState(user?.github || '');
  const [editedSkills, setEditedSkills] = useState<Skill[]>(user?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (user) {
      setEditedName(user.name);
      setEditedBio(user.bio || '');
      setEditedAvatar(user.avatar);
      setEditedLocation(user.location || '');
      setEditedWebsite(user.website || '');
      setEditedTwitter(user.twitter || '');
      setEditedGithub(user.github || '');
      setEditedSkills(user.skills || []);
    }
  }, [user]);

  const handleSave = () => {
    if (!user) return;

    updateUser({
      name: editedName,
      bio: editedBio,
      avatar: editedAvatar,
      location: editedLocation,
      website: editedWebsite,
      twitter: editedTwitter,
      github: editedGithub,
      skills: editedSkills,
    });

    setIsEditing(false);
  };

  const handleCancel = () => {
    if (!user) return;

    setEditedName(user.name);
    setEditedBio(user.bio || '');
    setEditedAvatar(user.avatar);
    setEditedLocation(user.location || '');
    setEditedWebsite(user.website || '');
    setEditedTwitter(user.twitter || '');
    setEditedGithub(user.github || '');
    setEditedSkills(user.skills || []);
    setIsEditing(false);
  };

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      const newSkill: Skill = {
        name: skillInput.trim(),
        isTopSkill: false,
        level: 'intermediate',
        endorsements: 0
      };
      if (!editedSkills.some(s => s.name === newSkill.name)) {
        setEditedSkills([...editedSkills, newSkill]);
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skillName: string) => {
    setEditedSkills(editedSkills.filter(skill => skill.name !== skillName));
  };

  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
          <div className="relative group mb-4 md:mb-0">
            {isEditing ? (
              <div className="relative">
                <img
                  src={editedAvatar}
                  alt={editedName}
                  className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-sm"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => setEditedAvatar(e.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <button 
                  className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full text-white hover:bg-indigo-700"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <img
                src={user?.avatar}
                alt={user?.name}
                className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-sm"
              />
            )}
          </div>
          
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xl font-bold"
                  placeholder="Your name"
                />
                <textarea
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Write a short bio..."
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={editedLocation}
                        onChange={(e) => setEditedLocation(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Location"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <LinkIcon className="h-4 w-4 text-gray-400" />
                      <input
                        type="url"
                        value={editedWebsite}
                        onChange={(e) => setEditedWebsite(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Website"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Twitter className="h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={editedTwitter}
                        onChange={(e) => setEditedTwitter(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Twitter username"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Github className="h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={editedGithub}
                        onChange={(e) => setEditedGithub(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="GitHub username"
                      />
                    </div>
                  </div>
                </div>

                {/* Custom URL Section */}
                <CustomUrlSection
                  currentUrl={user?.customUrl}
                  onUpdateUrl={async (url) => {
                    await updateUser({ customUrl: url });
                  }}
                  isEditing={isEditing}
                />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                  {isOwnProfile && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </button>
                      <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </button>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-gray-500 max-w-2xl">{user?.bio}</p>
                <div className="mt-4 flex flex-wrap gap-4">
                  {user?.location && (
                    <div className="flex items-center text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  {user?.website && (
                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-500 hover:text-gray-700">
                      <LinkIcon className="h-4 w-4 mr-1" />
                      <span>Website</span>
                    </a>
                  )}
                  {user?.twitter && (
                    <a href={`https://twitter.com/${user.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-500 hover:text-gray-700">
                      <Twitter className="h-4 w-4 mr-1" />
                      <span>@{user.twitter}</span>
                    </a>
                  )}
                  {user?.github && (
                    <a href={`https://github.com/${user.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-500 hover:text-gray-700">
                      <Github className="h-4 w-4 mr-1" />
                      <span>{user.github}</span>
                    </a>
                  )}
                </div>
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {user?.skills?.map((skill) => (
                      <span
                        key={skill.name}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800"
                      >
                        {skill.name}
                        {skill.isTopSkill && (
                          <span className="ml-1 text-yellow-500">★</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex items-center space-x-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                    {user?.kiPoints} Ki Points
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
        
        {isEditing && (
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={handleSave}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}