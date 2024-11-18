import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import ProfileHeader from './ProfileHeader';
import ProfileStats from './ProfileStats';
import ActivityTimeline from './ActivityTimeline';
import AccountSettings from './AccountSettings';
import SkillsSection from './SkillsSection';
import { useProfile } from '../../hooks/useProfile';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function ProfilePage() {
  const { profile, loading, error, activity, activityLoading, isOwnProfile } = useProfile();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          Error loading profile: {error}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500">
          Please sign in to view your profile
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileHeader
        name={profile.name}
        bio={profile.bio || ''}
        avatar={profile.avatar_url || ''}
        kiPoints={profile.ki_points}
        isOwnProfile={isOwnProfile}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfileStats stats={profile.stats} />

        <div className="mt-8">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              {isOwnProfile && (
                <TabsTrigger value="settings">Settings</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <ActivityTimeline 
                    activity={activity}
                    loading={activityLoading}
                  />
                </div>
                <div>
                  <SkillsSection
                    skills={profile.skills || []}
                    isEditing={false}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="skills">
              <SkillsSection
                skills={profile.skills || []}
                isEditing={true}
              />
            </TabsContent>

            <TabsContent value="activity">
              <ActivityTimeline 
                activity={activity}
                loading={activityLoading}
              />
            </TabsContent>

            {isOwnProfile && (
              <TabsContent value="settings">
                <AccountSettings profile={profile} />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}