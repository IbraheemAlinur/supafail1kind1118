import React, { useState } from 'react';
import { Lock, Mail, Bell, Shield, AlertTriangle, Check } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useProfile } from '../../hooks/useProfile';

export default function AccountSettings() {
  const { profile, updateProfile } = useProfile();
  const [emailNotifications, setEmailNotifications] = useState(profile?.email_notifications ?? true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleNotificationChange = async (enabled: boolean) => {
    try {
      setEmailNotifications(enabled);
      await updateProfile({ email_notifications: enabled });
      setSuccess('Notification preferences updated');
    } catch (err) {
      setError('Failed to update notification preferences');
      setEmailNotifications(!enabled); // Revert on error
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Email Settings */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Mail className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Email</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="mt-1 flex items-center">
              <input
                type="email"
                value={profile.email}
                readOnly
                className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm"
              />
              <Shield className="h-5 w-5 text-green-500 ml-2" />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Your email is {profile.email_verified ? 'verified' : 'not verified'}
            </p>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Bell className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-500">
                Receive updates about your asks, offers, and community activity
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleNotificationChange(!emailNotifications)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                emailNotifications ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  emailNotifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-4 bg-red-50 rounded-md">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <p className="ml-3 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 rounded-md">
          <div className="flex">
            <Check className="h-5 w-5 text-green-400" />
            <p className="ml-3 text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}
    </div>
  );
}