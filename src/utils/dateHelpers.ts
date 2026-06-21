import { Day, Event } from '../types';

// Get today's date in YYYY-MM-DD in Asia/Kolkata (Bengaluru time)
export function todayISO(): string {
  const d = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const parts = formatter.formatToParts(d);
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  return `${year}-${month}-${day}`;
}

export function isDateInPast(dateIso: string | null): boolean {
  if (!dateIso) return false;
  return dateIso < todayISO();
}

export function isDateToday(dateIso: string | null): boolean {
  if (!dateIso) return false;
  return dateIso === todayISO();
}

export function isDateInFuture(dateIso: string | null): boolean {
  if (!dateIso) return false;
  return dateIso > todayISO();
}

export function findTodayDay(days: Day[]): number {
  const iso = todayISO();
  const match = days.find(d => d.date_iso === iso);
  return match ? match.day : 1;
}

/**
 * Returns a Date object representing the event start time in UTC,
 * constructed assuming the event's date_iso and time_24h are in Asia/Kolkata (IST).
 */
export function eventDateTimeIST(ev: Event, day: Day | undefined): Date | null {
  if (!ev.time_24h || !day || !day.date_iso) return null;
  // Construct the ISO string with IST offset (+05:30)
  // Example: "2026-06-21T13:30:00+05:30"
  const isoString = `${day.date_iso}T${ev.time_24h}:00+05:30`;
  const parsed = Date.parse(isoString);
  if (isNaN(parsed)) return null;
  return new Date(parsed);
}

export function getStatus(ev: Event, day: Day | undefined): 'past' | 'upcoming' | 'live' | 'plain' | 'flexible' {
  if (!day || !day.date_iso) return 'plain';

  const dateIso = day.date_iso;
  if (isDateInPast(dateIso)) {
    return 'past';
  }
  if (isDateInFuture(dateIso)) {
    return 'upcoming';
  }

  // It is today in Bengaluru!
  const dt = eventDateTimeIST(ev, day);
  if (!dt) return 'flexible';
  
  const now = new Date();
  // An event is considered live from its start time until 90 minutes later
  const end = new Date(dt.getTime() + 90 * 60000);
  
  if (now < dt) return 'upcoming';
  if (now >= dt && now <= end) return 'live';
  return 'past';
}

export function getGregorianDateLabel(dateIso: string): string {
  // We want the Gregorian date label format matching India region standard format
  const dateObj = new Date(dateIso + 'T00:00:00+05:30'); // Parse in IST context
  return dateObj.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
}

export function getFullGregorianDateLabel(dateIso: string): string {
  const dateObj = new Date(dateIso + 'T00:00:00+05:30'); // Parse in IST context
  return dateObj.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
}

export function getTodayGregorianLabel(): string {
  const d = new Date();
  return d.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
}

