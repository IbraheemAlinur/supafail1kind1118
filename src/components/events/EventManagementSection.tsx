import React, { useState } from 'react';
import { Link as LinkIcon, Copy, Share2, Settings, Mail, Globe, Calendar, Clock, MapPin, Users, AlertTriangle, Edit2, X, Check } from 'lucide-react';
import { Event } from '../../store/eventStore';
import { format } from 'date-fns';

interface EventManagementSectionProps {
  event: Event;
  onUpdateEvent: (eventId: string, updates: Partial<Event>) => void;
}

const EventManagementSection: React.FC<EventManagementSectionProps> = ({ event, onUpdateEvent }) => {
  const [customUrl, setCustomUrl] = useState(event.customUrl || '');
  const [isEditingUrl, setIsEditingUrl] = useState(!event.customUrl);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editedEvent, setEditedEvent] = useState(event);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = 'www.1kind.ai/events';
  const fullUrl = `${baseUrl}/${customUrl || event.id}`;

  const validateCustomUrl = (url: string) => {
    if (url.length < 3) return 'URL must be at least 3 characters long';
    if (url.length > 50) return 'URL must be less than 50 characters';
    if (!/^[a-zA-Z0-9-]+$/.test(url)) return 'URL can only contain letters, numbers, and hyphens';
    return null;
  };

  const validateEventDetails = () => {
    if (!editedEvent.title.trim()) return 'Title is required';
    if (!editedEvent.description.trim()) return 'Description is required';
    if (!editedEvent.startDate || !editedEvent.endDate) return 'Start and end dates are required';
    if (editedEvent.endDate <= editedEvent.startDate) return 'End date must be after start date';
    if (editedEvent.type === 'in_person' && !editedEvent.location?.trim()) return 'Location is required for in-person events';
    if (editedEvent.type === 'online' && !editedEvent.meetingLink?.trim()) return 'Meeting link is required for online events';
    if (editedEvent.capacity < 1) return 'Capacity must be at least 1';
    return null;
  };

  const handleSaveUrl = async () => {
    const error = validateCustomUrl(customUrl);
    if (error) {
      setUrlError(error);
      return;
    }

    try {
      await onUpdateEvent(event.id, { customUrl });
      setIsEditingUrl(false);
      setUrlError(null);
    } catch (err) {
      setUrlError('Failed to update custom URL. Please try again.');
    }
  };

  const handleSaveDetails = async () => {
    const validationError = validateEventDetails();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await onUpdateEvent(event.id, editedEvent);
      setIsEditingDetails(false);
      setError(null);
    } catch (err) {
      setError('Failed to update event details. Please try again.');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const shareEvent = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Join me at ${event.title}!`,
          url: `https://${fullUrl}`
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      copyToClipboard(`https://${fullUrl}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Event Details Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Event Details</h3>
          <button
            onClick={() => setIsEditingDetails(!isEditingDetails)}
            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            {isEditingDetails ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Details
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 rounded-md">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <p className="ml-3 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {isEditingDetails ? (
          <form className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Event Title
              </label>
              <input
                type="text"
                id="title"
                value={editedEvent.title}
                onChange={(e) => setEditedEvent({ ...editedEvent, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={editedEvent.description}
                onChange={(e) => setEditedEvent({ ...editedEvent, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date & Time
                </label>
                <div className="mt-1">
                  <input
                    type="datetime-local"
                    id="startDate"
                    value={format(editedEvent.startDate, "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) => setEditedEvent({ ...editedEvent, startDate: new Date(e.target.value) })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  End Date & Time
                </label>
                <div className="mt-1">
                  <input
                    type="datetime-local"
                    id="endDate"
                    value={format(editedEvent.endDate, "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) => setEditedEvent({ ...editedEvent, endDate: new Date(e.target.value) })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {editedEvent.type === 'in_person' ? (
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="location"
                    value={editedEvent.location}
                    onChange={(e) => setEditedEvent({ ...editedEvent, location: e.target.value })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="meetingLink" className="block text-sm font-medium text-gray-700">
                  Meeting Link
                </label>
                <div className="mt-1">
                  <input
                    type="url"
                    id="meetingLink"
                    value={editedEvent.meetingLink}
                    onChange={(e) => setEditedEvent({ ...editedEvent, meetingLink: e.target.value })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                Capacity
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  id="capacity"
                  min="1"
                  value={editedEvent.capacity}
                  onChange={(e) => setEditedEvent({ ...editedEvent, capacity: parseInt(e.target.value) })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditingDetails(false);
                  setEditedEvent(event);
                  setError(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDetails}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center text-gray-700">
              <Calendar className="h-5 w-5 mr-2" />
              <span>{format(event.startDate, 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <Clock className="h-5 w-5 mr-2" />
              <span>
                {format(event.startDate, 'h:mm a')} - {format(event.endDate, 'h:mm a')} ({event.timezone})
              </span>
            </div>
            {event.type === 'in_person' && event.location && (
              <div className="flex items-center text-gray-700">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{event.location}</span>
              </div>
            )}
            {event.type === 'online' && event.meetingLink && (
              <div className="flex items-center text-gray-700">
                <LinkIcon className="h-5 w-5 mr-2" />
                <a
                  href={event.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  {event.meetingLink}
                </a>
              </div>
            )}
            <div className="flex items-center text-gray-700">
              <Users className="h-5 w-5 mr-2" />
              <span>Capacity: {event.capacity} attendees</span>
            </div>
          </div>
        )}
      </div>

      {/* Custom URL Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Event URL</h3>
          <button
            onClick={() => setIsEditingUrl(!isEditingUrl)}
            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            {isEditingUrl ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Edit2 className="h-4 w-4 mr-2" />
                Customize URL
              </>
            )}
          </button>
        </div>

        {isEditingUrl ? (
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="text-gray-500 bg-gray-50 px-3 py-2 border border-r-0 border-gray-300 rounded-l-md">
                {baseUrl}/
              </span>
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value.toLowerCase())}
                placeholder="your-event-name"
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            {urlError && (
              <p className="text-sm text-red-600">{urlError}</p>
            )}
            <button
              onClick={handleSaveUrl}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Save Custom URL
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <Globe className="h-5 w-5 text-gray-400" />
              <span className="text-gray-900 truncate">{fullUrl}</span>
            </div>
            <button
              onClick={() => copyToClipboard(`https://${fullUrl}`)}
              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </button>
          </div>
        )}
      </div>

      {/* Quick Share Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Share Event</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={shareEvent}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Event
          </button>
          <button
            onClick={() => {
              const mailtoLink = `mailto:?subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent(
                `Join me at ${event.title}!\n\nEvent Details:\n${event.description}\n\nRSVP here: https://${fullUrl}`
              )}`;
              window.location.href = mailtoLink;
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Mail className="h-4 w-4 mr-2" />
            Email Invite
          </button>
        </div>
      </div>

      {/* Copied Message */}
      {showCopiedMessage && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-md shadow-lg">
          Copied to clipboard!
        </div>
      )}
    </div>
  );
};

export default EventManagementSection;