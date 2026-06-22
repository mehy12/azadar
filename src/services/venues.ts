import { supabase } from '@/lib/supabase';
import venuesJson from '@/data/venues.json';
import { Venue } from '@/types';

// Helper to map DB row to legacy Venue interface
export function mapRowToVenue(row: any): Venue {
  return {
    id: row.slug, // the slug is the legacy id
    name: row.name,
    area: row.area || row.address || '',
    maps_query: row.maps_query || '',
    type: row.type || 'azakhana',
    lat: row.latitude ? parseFloat(row.latitude) : null,
    lng: row.longitude ? parseFloat(row.longitude) : null,
    photo_url: row.image_url || null,
    zone: row.zone || '',
    hidden: !!row.hidden
  };
}

// Helper to map legacy Venue interface to DB row
export function mapVenueToRow(venue: Venue) {
  return {
    slug: venue.id,
    name: venue.name,
    area: venue.area,
    address: venue.area, // map area to address
    maps_query: venue.maps_query,
    type: venue.type,
    latitude: venue.lat,
    longitude: venue.lng,
    image_url: venue.photo_url,
    zone: venue.zone,
    hidden: !!venue.hidden
  };
}

export async function getVenues(): Promise<Venue[]> {
  if (!supabase) {
    return venuesJson as Venue[];
  }

  try {
    const { data, error } = await supabase
      .from('venues')
      .select('*');

    if (error) {
      console.error('Error fetching venues from Supabase, using local fallback:', error);
      return venuesJson as Venue[];
    }

    return (data || []).map(mapRowToVenue);
  } catch (error) {
    console.error('Exception fetching venues from Supabase, using local fallback:', error);
    return venuesJson as Venue[];
  }
}

export async function getVenueBySlug(slug: string): Promise<Venue | null> {
  if (!supabase) {
    const found = (venuesJson as Venue[]).find(v => v.id === slug);
    return found || null;
  }

  try {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) return null;
    return mapRowToVenue(data);
  } catch (error) {
    console.error(`Exception fetching venue ${slug} from Supabase:`, error);
    const found = (venuesJson as Venue[]).find(v => v.id === slug);
    return found || null;
  }
}

// Write helper for local fallback (runs server-side only)
async function readLocalVenues(): Promise<Venue[]> {
  if (typeof window !== 'undefined') {
    return venuesJson as Venue[];
  }
  try {
    const fs = require('fs/promises');
    const path = require('path');
    const dataPath = path.join(process.cwd(), 'src', 'data', 'venues.json');
    const raw = await fs.readFile(dataPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return venuesJson as Venue[];
  }
}

async function writeLocalVenues(venues: Venue[]): Promise<void> {
  if (typeof window !== 'undefined') return;
  try {
    const fs = require('fs/promises');
    const path = require('path');
    const dataPath = path.join(process.cwd(), 'src', 'data', 'venues.json');
    await fs.writeFile(dataPath, JSON.stringify(venues, null, 2), 'utf-8');
  } catch (err: any) {
    console.error('Failed to write to local venues.json:', err);
    if (err.code === 'EROFS' || err.message?.includes('read-only')) {
      throw new Error('Local database fallback is read-only in this hosting environment (e.g. Vercel). Please configure your Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY) to enable database modifications.');
    }
    throw err;
  }
}

export async function createVenue(venue: Venue): Promise<Venue[]> {
  if (!supabase) {
    const list = await readLocalVenues();
    if (list.some(v => v.id === venue.id)) {
      throw new Error('Venue with this ID already exists.');
    }
    list.push(venue);
    await writeLocalVenues(list);
    return list;
  }

  const { error } = await supabase
    .from('venues')
    .insert(mapVenueToRow(venue));

  if (error) {
    throw new Error(error.message);
  }

  return getVenues();
}

export async function updateVenue(venue: Venue): Promise<Venue[]> {
  if (!supabase) {
    const list = await readLocalVenues();
    const idx = list.findIndex(v => v.id === venue.id);
    if (idx === -1) {
      throw new Error('Venue not found.');
    }
    list[idx] = venue;
    await writeLocalVenues(list);
    return list;
  }

  const { error } = await supabase
    .from('venues')
    .update(mapVenueToRow(venue))
    .eq('slug', venue.id);

  if (error) {
    throw new Error(error.message);
  }

  return getVenues();
}

export async function deleteVenue(id: string): Promise<Venue[]> {
  if (!supabase) {
    const list = await readLocalVenues();
    const filtered = list.filter(v => v.id !== id);
    if (filtered.length === list.length) {
      throw new Error('Venue not found.');
    }
    await writeLocalVenues(filtered);
    return filtered;
  }

  const { error } = await supabase
    .from('venues')
    .delete()
    .eq('slug', id);

  if (error) {
    throw new Error(error.message);
  }

  return getVenues();
}
