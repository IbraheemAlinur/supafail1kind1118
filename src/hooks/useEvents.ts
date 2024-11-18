import { useState } from 'react';
import { useStore } from '../store/useStore';
import { useMemoizedCallback } from './useMemoizedCallback';
import { supabase } from '../lib/supabase/client';

export interface Event {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  startDate: Date;
  endDate: Date;
  timezone: string;
  type: 'online' | 'in_person';
  location?: string;
  meetingLink?: string;
  capacity: number;
  organizer: {
    id: string;
    name: string;
    avatar: string;
  };
  communityId?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  requiresApproval: boolean;
  customUrl?: string;
  attendees: Array<{
    id: string;
    name: string;
    avatar: string;
    status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'waitlist';
    joinedAt: Date;
    message?: string;
  }>;
}

interface UseEventsOptions {
  communityId?: string;
}

export function useEvents(options: UseEventsOptions = {}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const user = useStore(state => state.user);

  const fetchEvents = useMemoizedCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('events')
        .select(`
          *,
          organizer:users!events_organizer_id_fkey(
            id,
            name,
            avatar_url
          ),
          community:communities!events_community_id_fkey(
            id,
            name
          ),
          attendees:event_attendees(
            user:users(
              id,
              name,
              avatar_url
            ),
            status,
            joined_at,
            message
          )
        `)
        .order('start_date', { ascending: true });

      if (options.communityId) {
        query = query.eq('community_id', options.communityId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const formattedEvents: Event[] = data?.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        coverImage: event.cover_image || 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=2000',
        startDate: new Date(event.start_date),
        endDate: new Date(event.end_date),
        timezone: event.timezone,
        type: event.type,
        location: event.location,
        meetingLink: event.meeting_link,
        capacity: event.capacity,
        organizer: {
          id: event.organizer.id,
          name: event.organizer.name,
          avatar: event.organizer.avatar_url
        },
        communityId: event.community_id,
        status: event.status,
        requiresApproval: event.requires_approval,
        customUrl: event.custom_url,
        attendees: event.attendees.map((a: any) => ({
          id: a.user.id,
          name: a.user.name,
          avatar: a.user.avatar_url,
          status: a.status,
          joinedAt: new Date(a.joined_at),
          message: a.message
        }))
      })) || [];

      setEvents(formattedEvents);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch events';
      setError(message);
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, [options.communityId]);

  const createEvent = useMemoizedCallback(async (data: {
    title: string;
    description: string;
    coverImage?: string;
    startDate: Date;
    endDate: Date;
    timezone: string;
    type: 'online' | 'in_person';
    location?: string;
    meetingLink?: string;
    capacity: number;
    communityId?: string;
    requiresApproval?: boolean;
  }) => {
    if (!user) throw new Error('Must be logged in to create event');

    try {
      setLoading(true);
      setError(null);

      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert([{
          title: data.title,
          description: data.description,
          cover_image: data.coverImage,
          start_date: data.startDate.toISOString(),
          end_date: data.endDate.toISOString(),
          timezone: data.timezone,
          type: data.type,
          location: data.location,
          meeting_link: data.meetingLink,
          capacity: data.capacity,
          organizer_id: user.id,
          community_id: data.communityId,
          requires_approval: data.requiresApproval || false,
          status: 'scheduled',
          stats: {
            registeredCount: 0,
            waitlistCount: 0,
            attendedCount: 0,
            rating: null,
            feedback: [],
            lastUpdated: new Date().toISOString()
          },
          metadata: {
            agenda: [],
            sponsors: [],
            requirements: [],
            resources: [],
            recording: null
          }
        }])
        .select()
        .single();

      if (eventError) throw eventError;
      if (!event) throw new Error('Failed to create event');

      await fetchEvents();
      return event;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create event';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, fetchEvents]);

  const updateEvent = useMemoizedCallback(async (eventId: string, updates: Partial<Event>) => {
    if (!user) throw new Error('Must be logged in to update event');

    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('events')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId)
        .eq('organizer_id', user.id);

      if (updateError) throw updateError;

      await fetchEvents();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update event';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, fetchEvents]);

  const getEventStats = useMemoizedCallback((eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return null;

    const confirmedAttendees = event.attendees.filter(a => a.status === 'confirmed');
    const pendingAttendees = event.attendees.filter(a => a.status === 'pending');
    const waitlistAttendees = event.attendees.filter(a => a.status === 'waitlist');

    return {
      totalAttendees: event.attendees.length,
      confirmedAttendees: confirmedAttendees.length,
      pendingAttendees: pendingAttendees.length,
      waitlistCount: waitlistAttendees.length,
      availableSpots: Math.max(0, event.capacity - confirmedAttendees.length),
      rsvpDeadlinePassed: new Date() > event.startDate
    };
  }, [events]);

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    getEventStats
  };
}