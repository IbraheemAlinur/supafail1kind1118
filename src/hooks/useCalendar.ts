import { useMemoizedCallback } from './useMemoizedCallback';
import { createEvents } from 'ics';
import { format } from 'date-fns';
import { Event } from '../store/eventStore';

export function useCalendar() {
  const generateICS = useMemoizedCallback((event: Event) => {
    const { error, value } = createEvents([{
      start: [
        event.startDate.getFullYear(),
        event.startDate.getMonth() + 1,
        event.startDate.getDate(),
        event.startDate.getHours(),
        event.startDate.getMinutes()
      ],
      end: [
        event.endDate.getFullYear(),
        event.endDate.getMonth() + 1,
        event.endDate.getDate(),
        event.endDate.getHours(),
        event.endDate.getMinutes()
      ],
      title: event.title,
      description: event.description,
      location: event.location,
      url: event.meetingLink,
      organizer: { name: event.organizer.name },
      status: 'CONFIRMED',
      busyStatus: 'BUSY',
      productId: '1kind-ai/events'
    }]);

    if (error) {
      throw error;
    }

    return value;
  }, []);

  const downloadCalendarFile = useMemoizedCallback((event: Event) => {
    const icsContent = generateICS(event);
    if (!icsContent) return;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${event.title.toLowerCase().replace(/\s+/g, '-')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, [generateICS]);

  const addToGoogleCalendar = useMemoizedCallback((event: Event) => {
    const startTime = format(event.startDate, "yyyyMMdd'T'HHmmss");
    const endTime = format(event.endDate, "yyyyMMdd'T'HHmmss");
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      details: event.description,
      location: event.location || event.meetingLink || '',
      dates: `${startTime}/${endTime}`,
      ctz: event.timezone
    });

    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
  }, []);

  return {
    generateICS,
    downloadCalendarFile,
    addToGoogleCalendar
  };
}