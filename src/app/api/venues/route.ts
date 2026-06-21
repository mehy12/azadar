import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Venue } from '@/types';

const dataPath = path.join(process.cwd(), 'src', 'data', 'venues.json');

async function readVenues(): Promise<Venue[]> {
  try {
    const raw = await fs.readFile(dataPath, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading venues:', error);
    return [];
  }
}

async function writeVenues(venues: Venue[]): Promise<void> {
  await fs.writeFile(dataPath, JSON.stringify(venues, null, 2), 'utf-8');
}

export async function GET() {
  const venues = await readVenues();
  return NextResponse.json(venues);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, data, id } = body;
    const venues = await readVenues();

    if (action === 'create') {
      const newVenue: Venue = data;
      // Ensure unique ID
      if (venues.some(v => v.id === newVenue.id)) {
        return NextResponse.json({ error: 'Venue with this ID already exists.' }, { status: 400 });
      }
      venues.push(newVenue);
      await writeVenues(venues);
      return NextResponse.json({ success: true, venues });
    }

    if (action === 'update') {
      const updatedVenue: Venue = data;
      const idx = venues.findIndex(v => v.id === updatedVenue.id);
      if (idx === -1) {
        return NextResponse.json({ error: 'Venue not found.' }, { status: 404 });
      }
      venues[idx] = updatedVenue;
      await writeVenues(venues);
      return NextResponse.json({ success: true, venues });
    }

    if (action === 'delete') {
      const filtered = venues.filter(v => v.id !== id);
      if (filtered.length === venues.length) {
        return NextResponse.json({ error: 'Venue not found.' }, { status: 404 });
      }
      await writeVenues(filtered);
      return NextResponse.json({ success: true, venues: filtered });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error.' }, { status: 500 });
  }
}
