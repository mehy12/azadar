import { supabase } from '@/lib/supabase';
import eventsJson from '@/data/events.json';
import { Event } from '@/types';

// Helper to map DB row to legacy Event interface
export function mapRowToEvent(row: any): Event {
  return {
    id: row.slug, // the slug is the legacy id
    venue_id: row.venues?.slug || row.venue_id, // we map the venue slug back
    location_detail: row.location_detail || null,
    date_type: row.date_type || 'regular',
    date_iso: row.date_iso || null,
    day_numbers: row.day_numbers || [],
    date_label: row.date_label || '',
    time: row.time || '',
    time_24h: row.time_24h || null,
    minjanib: row.minjanib || '',
    bayan_by: row.bayan_by || '',
    notes: row.notes || '',
    youtube_url: row.youtube_url || '',
    is_procession: !!row.is_procession
  };
}

// Helper to map legacy Event interface to DB row
export function mapEventToRow(event: Event, venueUuid: string) {
  return {
    venue_id: venueUuid,
    title: event.bayan_by || event.notes || 'Majlis', // set title as requested (non-null in schema)
    slug: event.id,
    speaker: event.bayan_by,
    min_janib: event.minjanib,
    date: event.date_iso ? event.date_iso : null,
    start_time: event.time_24h ? `${event.time_24h}:00` : null, // start_time in HH:MM:SS
    end_time: null,
    poster_url: null,
    livestream_url: event.youtube_url || null,
    description: event.notes || null,
    
    // Legacy / UI fields
    location_detail: event.location_detail,
    date_type: event.date_type,
    date_iso: event.date_iso,
    day_numbers: event.day_numbers,
    date_label: event.date_label,
    time: event.time,
    time_24h: event.time_24h,
    minjanib: event.minjanib,
    bayan_by: event.bayan_by,
    notes: event.notes,
    youtube_url: event.youtube_url,
    is_procession: event.is_procession
  };
}

export async function getEvents(): Promise<Event[]> {
  if (!supabase) {
    return eventsJson as Event[];
  }

  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        venues (
          slug
        )
      `);

    if (error) {
      console.error('Error fetching events from Supabase, using local fallback:', error);
      return eventsJson as Event[];
    }

    return (data || []).map(mapRowToEvent);
  } catch (error) {
    console.error('Exception fetching events from Supabase, using local fallback:', error);
    return eventsJson as Event[];
  }
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  if (!supabase) {
    const found = (eventsJson as Event[]).find(e => e.id === slug);
    return found || null;
  }

  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        venues (
          slug
        )
      `)
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) return null;
    return mapRowToEvent(data);
  } catch (error) {
    console.error(`Exception fetching event ${slug} from Supabase:`, error);
    const found = (eventsJson as Event[]).find(e => e.id === slug);
    return found || null;
  }
}

// Write helper for local fallback (runs server-side only)
async function readLocalEvents(): Promise<Event[]> {
  if (typeof window !== 'undefined') {
    return eventsJson as Event[];
  }
  try {
    const fs = require('fs/promises');
    const path = require('path');
    const dataPath = path.join(process.cwd(), 'src', 'data', 'events.json');
    const raw = await fs.readFile(dataPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return eventsJson as Event[];
  }
}

async function writeLocalEvents(events: Event[]): Promise<void> {
  if (typeof window !== 'undefined') return;
  const fs = require('fs/promises');
  const path = require('path');
  const dataPath = path.join(process.cwd(), 'src', 'data', 'events.json');
  await fs.writeFile(dataPath, JSON.stringify(events, null, 2), 'utf-8');
}

export async function createEvent(event: Event): Promise<Event[]> {
  if (!supabase) {
    const list = await readLocalEvents();
    if (list.some(e => e.id === event.id)) {
      throw new Error('Event with this ID already exists.');
    }
    list.push(event);
    await writeLocalEvents(list);
    return list;
  }

  // Find venue UUID
  const { data: venueData, error: venueError } = await supabase
    .from('venues')
    .select('id')
    .eq('slug', event.venue_id)
    .maybeSingle();

  if (venueError || !venueData) {
    throw new Error(`Venue "${event.venue_id}" not found in database. Please create it first.`);
  }

  const { error } = await supabase
    .from('events')
    .insert(mapEventToRow(event, venueData.id));

  if (error) {
    throw new Error(error.message);
  }

  return getEvents();
}

export async function updateEvent(event: Event): Promise<Event[]> {
  if (!supabase) {
    const list = await readLocalEvents();
    const idx = list.findIndex(e => e.id === event.id);
    if (idx === -1) {
      throw new Error('Event not found.');
    }
    list[idx] = event;
    await writeLocalEvents(list);
    return list;
  }

  // Find venue UUID
  const { data: venueData, error: venueError } = await supabase
    .from('venues')
    .select('id')
    .eq('slug', event.venue_id)
    .maybeSingle();

  if (venueError || !venueData) {
    throw new Error(`Venue "${event.venue_id}" not found in database.`);
  }

  const { error } = await supabase
    .from('events')
    .update(mapEventToRow(event, venueData.id))
    .eq('slug', event.id);

  if (error) {
    throw new Error(error.message);
  }

  return getEvents();
}

export async function deleteEvent(id: string): Promise<Event[]> {
  if (!supabase) {
    const list = await readLocalEvents();
    const filtered = list.filter(e => e.id !== id);
    if (filtered.length === list.length) {
      throw new Error('Event not found.');
    }
    await writeLocalEvents(filtered);
    return filtered;
  }

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('slug', id);

  if (error) {
    throw new Error(error.message);
  }

  return getEvents();
}
