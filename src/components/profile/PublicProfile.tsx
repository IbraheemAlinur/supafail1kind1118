import React from 'react';
import { useParams } from 'react-router-dom';
import { User } from '../../types';
import { useStore } from '../../store/useStore';
import { Shield, MapPin, Link as LinkIcon, Twitter, Github, Linkedin } from 'lucide-react';

export default function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // In a real app, fetch user data from API
    // For demo, simulate API call with timeout
    const timer = setTimeout(() => {
      if (username === 'demo') {
        setUser({
          id: 'demo',
          name: 'Demo User',
          email: 'demo@example.com',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
          customUrl: 'demo',
          bio: 'Tech enthusiast and developer passionate about building great products.',
          location: 'San Francisco, CA',
          skills: [
            { name: 'React', isTopSkill: true, level: 'expert', endorsements: 25 },
            { name: 'TypeScript', isTopSkill: true, level: 'expert', endorsements: 20 },
            { name: 'Node.js', isTopSkill: true, level: 'intermediate', endorsements: 15 }
          ],
          kiPoints: 2500,
          createdAt: new Date(),
          lastActive: new Date(),
          socialLinks: {
            website: 'https://demo.com',
            twitter: 'demouser',
            github: 'demouser',
            linkedin: 'in/demouser'
          }
        });
        setLoading(false);
      } else {
        setError('User not found');
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Profile not found</h2>
          <p className="mt-2 text-gray-600">The profile you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
            <img
              src={user.avatar}
              alt={user.name}
              className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-sm"
            />
            <div className="mt-4 md:mt-0">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="mt-1 text-lg text-gray-600">{user.bio}</p>
              <div className="mt-4 flex flex-wrap gap-4">
                {user.location && (
                  <div className="flex items-center text-gray-500">
                    <MapPin className="h-5 w-5 mr-1" />
                    <span>{user.location}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-500">
                  <Shield className="h-5 w-5 mr-1" />
                  <span>{user.kiPoints} Ki Points</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Top Skills */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Top Skills</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.skills.filter(s => s.isTopSkill).map((skill) => (
                  <div
                    key={skill.name}
                    className="bg-gray-50 rounded-lg p-4"
                  >
                    <h3 className="font-medium text-gray-900">{skill.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{skill.level}</p>
                    {skill.endorsements && (
                      <p className="mt-2 text-sm text-gray-600">
                        {skill.endorsements} endorsements
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Social Links */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Connect</h2>
              <div className="space-y-3">
                {user.socialLinks?.website && (
                  <a
                    href={user.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-600 hover:text-gray-900"
                  >
                    <LinkIcon className="h-5 w-5 mr-2" />
                    Website
                  </a>
                )}
                {user.socialLinks?.twitter && (
                  <a
                    href={`https://twitter.com/${user.socialLinks.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-600 hover:text-gray-900"
                  >
                    <Twitter className="h-5 w-5 mr-2" />
                    Twitter
                  </a>
                )}
                {user.socialLinks?.github && (
                  <a
                    href={`https://github.com/${user.socialLinks.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-600 hover:text-gray-900"
                  >
                    <Github className="h-5 w-5 mr-2" />
                    GitHub
                  </a>
                )}
                {user.socialLinks?.linkedin && (
                  <a
                    href={`https://linkedin.com/${user.socialLinks.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-600 hover:text-gray-900"
                  >
                    <Linkedin className="h-5 w-5 mr-2" />
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}