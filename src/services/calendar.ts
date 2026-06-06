import * as Calendar from 'expo-calendar';
import { CalendarEventItem } from '../types';

export const loadUpcomingEvents = async (): Promise<CalendarEventItem[]> => {
  const permission = await Calendar.requestCalendarPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Calendar permission denied');
  }

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const calendarIds = calendars.map((cal) => cal.id);
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 7);

  const events = await Calendar.getEventsAsync(calendarIds, start, end);

  return events
    .filter((event) => event.startDate)
    .slice(0, 8)
    .map((event) => ({
      id: event.id,
      title: event.title || 'Untitled event',
      startDate: event.startDate,
      endDate: event.endDate,
      calendarTitle: event.calendar?.title || 'Calendar',
      location: event.location,
    }));
};
