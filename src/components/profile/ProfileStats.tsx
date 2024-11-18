import React from 'react';
import { MessageCircle, Award, Users } from 'lucide-react';
import { useProfile } from '../../hooks/useProfile';

export default function ProfileStats() {
  const { profile } = useProfile();

  if (!profile) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Ki Points</p>
            <p className="mt-1 text-2xl font-semibold text-indigo-600">{profile.ki_points}</p>
          </div>
          <Award className="h-8 w-8 text-indigo-200" />
        </div>
        <div className="mt-2">
          <p className="text-xs text-gray-500">
            {profile.stats.totalEarned > profile.stats.totalSpent ? '+' : '-'}
            {Math.abs(profile.stats.totalEarned - profile.stats.totalSpent)} last 30 days
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Success Rate</p>
            <p className="mt-1 text-2xl font-semibold text-green-600">
              {profile.stats.responseRate}%
            </p>
          </div>
          <Users className="h-8 w-8 text-green-200" />
        </div>
        <div className="mt-2">
          <p className="text-xs text-gray-500">Based on completed tasks</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Completed Tasks</p>
            <p className="mt-1 text-2xl font-semibold text-purple-600">
              {profile.stats.asksCompleted + profile.stats.offersCompleted}
            </p>
          </div>
          <MessageCircle className="h-8 w-8 text-purple-200" />
        </div>
        <div className="mt-2">
          <p className="text-xs text-gray-500">
            {profile.stats.asksCompleted} asks, {profile.stats.offersCompleted} offers
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Reputation</p>
            <p className="mt-1 text-2xl font-semibold text-blue-600">
              {profile.stats.reputation}
            </p>
          </div>
          <Award className="h-8 w-8 text-blue-200" />
        </div>
        <div className="mt-2">
          <p className="text-xs text-gray-500">
            {profile.stats.totalRatings} ratings, {profile.stats.averageRating.toFixed(1)} avg
          </p>
        </div>
      </div>
    </div>
  );
}