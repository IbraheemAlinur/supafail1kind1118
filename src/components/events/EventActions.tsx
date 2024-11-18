import React from 'react';
import { Calendar as CalendarIcon, Share2, Bell, BellOff } from 'lucide-react';
import { useCalendar } from '../../hooks/useCalendar';
import { useEventReminders } from '../../hooks/useEventReminders';
import { Event } from '../../store/eventStore';

interface EventActionsProps {
  event: Event;
  isAttending: boolean;
  onToggleReminders: () => void;
  hasReminders: boolean;
}

export default function EventActions({ event, isAttending, onToggleReminders, hasReminders }: EventActionsProps) {
  const { downloadCalendarFile, addToGoogleCalendar } = useCalendar();
  const [showCalendarOptions, setShowCalendarOptions] = React.useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to copying link
      navigator.clipboard.writeText(window.location.href);
      // Show a toast notification (implement as needed)
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <button
          onClick={() => setShowCalendarOptions(!showCalendarOptions)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <CalendarIcon className="h-4 w-4 mr-2" />
          Add to Calendar
        </button>

        {showCalendarOptions && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
            <div className="py-1" role="menu">
              <button
                onClick={() => {
                  downloadCalendarFile(event);
                  setShowCalendarOptions(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                Download .ics file
              </button>
              <button
                onClick={() => {
                  addToGoogleCalendar(event);
                  setShowCalendarOptions(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                Add to Google Calendar
              </button>
            </div>
          </div>
        )}
      </div>

      {isAttending && (
        <button
          onClick={onToggleReminders}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          {hasReminders ? (
            <>
              <BellOff className="h-4 w-4 mr-2" />
              Disable Reminders
            </>
          ) : (
            <>
              <Bell className="h-4 w-4 mr-2" />
              Enable Reminders
            </>
          )}
        </button>
      )}

      <button
        onClick={handleShare}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </button>
    </div>
  );
}