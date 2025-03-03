import { CalendarEvent } from "@/components/calendar/calendar-types";
import { format } from "date-fns";

/**
 * Formats a date for display in a human-readable format
 * @param date The date to format
 * @returns Formatted date string (e.g., "10 March 2025")
 */
export const formatDisplayDate = (date: Date | null): string => {
  if (!date) return "Not specified";
  return format(date, "d MMMM yyyy");
};

/**
 * Formats a date for Google Calendar URL
 * Format: YYYYMMDDTHHMMSSZ
 */
export const formatDateForGoogleCalendar = (date: Date): string => {
  return date.toISOString().replace(/-|:|\.\d+/g, "");
};

/**
 * Generates a Google Calendar event URL
 * @param event The calendar event to create a link for
 * @returns URL string that opens Google Calendar with the event details
 */
export const generateGoogleCalendarLink = (event: CalendarEvent): string => {
  const startTime = formatDateForGoogleCalendar(event.start);
  const endTime = formatDateForGoogleCalendar(event.end);

  const baseUrl = "https://calendar.google.com/calendar/render";
  const action = "action=TEMPLATE";
  const text = `text=${encodeURIComponent(event.title)}`;
  const dates = `dates=${startTime}/${endTime}`;
  const details = event.description
    ? `details=${encodeURIComponent(event.description)}`
    : "";

  return `${baseUrl}?${action}&${text}&${dates}&${details}`;
};
