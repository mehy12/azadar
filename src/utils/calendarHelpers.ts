import { Event, Venue } from '../types';

export function generateGoogleCalendarLink(event: Event, venue: Venue): string | null {
  if (!event.date_iso || !event.time_24h) return null;

  // Construct start date in IST (+05:30)
  const startDateISO = `${event.date_iso}T${event.time_24h}:00+05:30`;
  const parsedStart = Date.parse(startDateISO);
  if (isNaN(parsedStart)) return null;

  const startDt = new Date(parsedStart);
  // Default duration of 90 minutes for Majlis
  const endDt = new Date(startDt.getTime() + 90 * 60000);

  const formatGoogleDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, "");
  };

  const start = formatGoogleDate(startDt);
  const end = formatGoogleDate(endDt);
  
  const titleParts = [];
  if (event.bayan_by) titleParts.push(`Majlis: ${event.bayan_by}`);
  else if (event.notes) titleParts.push(`Majlis: ${event.notes.split(';')[0]}`);
  else titleParts.push('Majlis-e-Aza');

  const title = titleParts.join('');
  const location = [venue.name, venue.area].filter(Boolean).join(', ');
  
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${start}/${end}`,
    details: event.notes || "",
    location: location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
