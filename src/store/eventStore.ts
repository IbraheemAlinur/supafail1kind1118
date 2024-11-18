import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Database } from '../lib/supabase/types';

type Event = Database['public']['Tables']['events']['Row'];
type EventAttendee = Database['public']['Tables']['event_attendees']['Row'];

interface EventStore {
  events: Event[];
  addEvent: (event: Event) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  removeEvent: (id: string) => void;
  addAttendee: (eventId: string, attendee: EventAttendee) => void;
  removeAttendee: (eventId: string, attendeeId: string) => void;
  addToWaitlist: (eventId: string, attendee: EventAttendee) => void;
  removeFromWaitlist: (eventId: string, attendeeId: string) => void;
  updateAttendeeStatus: (eventId: string, attendeeId: string, status: EventAttendee['status']) => void;
  generateCustomUrl: (eventId: string, customUrl: string) => void;
}

export const useEventStore = create<EventStore>()(
  devtools(
    (set) => ({
      events: [],
      addEvent: (event) =>
        set((state) => ({
          events: [...state.events, event],
        })),
      updateEvent: (id, updates) =>
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id ? { ...event, ...updates, updated_at: new Date().toISOString() } : event
          ),
        })),
      removeEvent: (id) =>
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
        })),
      addAttendee: (eventId, attendee) =>
        set((state) => ({
          events: state.events.map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  attendees: [...event.attendees, attendee],
                  updated_at: new Date().toISOString(),
                }
              : event
          ),
        })),
      removeAttendee: (eventId, attendeeId) =>
        set((state) => ({
          events: state.events.map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  attendees: event.attendees.filter((a) => a.user_id !== attendeeId),
                  updated_at: new Date().toISOString(),
                }
              : event
          ),
        })),
      addToWaitlist: (eventId, attendee) =>
        set((state) => ({
          events: state.events.map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  waitlist: [...event.waitlist, attendee],
                  updated_at: new Date().toISOString(),
                }
              : event
          ),
        })),
      removeFromWaitlist: (eventId, attendeeId) =>
        set((state) => ({
          events: state.events.map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  waitlist: event.waitlist.filter((a) => a.user_id !== attendeeId),
                  updated_at: new Date().toISOString(),
                }
              : event
          ),
        })),
      updateAttendeeStatus: (eventId, attendeeId, status) =>
        set((state) => ({
          events: state.events.map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  attendees: event.attendees.map((a) =>
                    a.user_id === attendeeId ? { ...a, status } : a
                  ),
                  updated_at: new Date().toISOString(),
                }
              : event
          ),
        })),
      generateCustomUrl: (eventId, customUrl) =>
        set((state) => ({
          events: state.events.map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  custom_url: customUrl,
                  updated_at: new Date().toISOString(),
                }
              : event
          ),
        })),
    }),
    { name: 'event-store' }
  )
);