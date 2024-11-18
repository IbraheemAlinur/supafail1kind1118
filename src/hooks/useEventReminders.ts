import { useCallback, useEffect, useRef } from 'react';
import { Event } from '../store/eventStore';
import { useStore } from '../store/useStore';
import { useMemoizedCallback } from './useMemoizedCallback';

export function useEventReminders() {
  const user = useStore(state => state.user);
  const remindersRef = useRef<{ [key: string]: NodeJS.Timeout[] }>({});

  const clearEventReminders = useCallback((eventId: string) => {
    if (remindersRef.current[eventId]) {
      remindersRef.current[eventId].forEach(timeout => clearTimeout(timeout));
      delete remindersRef.current[eventId];
    }
  }, []);

  const scheduleReminder = useMemoizedCallback((event: Event) => {
    if (!user) return;

    // Clear any existing reminders for this event
    clearEventReminders(event.id);

    const now = new Date().getTime();
    const eventTime = event.startDate.getTime();
    const reminders: NodeJS.Timeout[] = [];
    
    // 24 hour reminder
    const dayBefore = eventTime - (24 * 60 * 60 * 1000);
    if (dayBefore > now) {
      const timeout = setTimeout(() => {
        // Here you would integrate with your notification system
        console.log(`Reminder: "${event.title}" starts in 24 hours`);
      }, dayBefore - now);
      reminders.push(timeout);
    }

    // 1 hour reminder
    const hourBefore = eventTime - (60 * 60 * 1000);
    if (hourBefore > now) {
      const timeout = setTimeout(() => {
        // Here you would integrate with your notification system
        console.log(`Reminder: "${event.title}" starts in 1 hour`);
      }, hourBefore - now);
      reminders.push(timeout);
    }

    // Store the reminders
    remindersRef.current[event.id] = reminders;
  }, [user]);

  const cancelReminder = useMemoizedCallback((eventId: string) => {
    clearEventReminders(eventId);
  }, [clearEventReminders]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.keys(remindersRef.current).forEach(clearEventReminders);
    };
  }, [clearEventReminders]);

  return {
    scheduleReminder,
    cancelReminder
  };
}