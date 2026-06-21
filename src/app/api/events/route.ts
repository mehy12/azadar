import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Event } from '@/types';

const dataPath = path.join(process.cwd(), 'src', 'data', 'events.json');

async function readEvents(): Promise<Event[]> {
  try {
    const raw = await fs.readFile(dataPath, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading events:', error);
    return [];
  }
}

async function writeEvents(events: Event[]): Promise<void> {
  await fs.writeFile(dataPath, JSON.stringify(events, null, 2), 'utf-8');
}

export async function GET() {
  const events = await readEvents();
  return NextResponse.json(events);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, data, id } = body;
    const events = await readEvents();

    if (action === 'create') {
      const newEvent: Event = data;
      // Ensure unique ID
      if (events.some(e => e.id === newEvent.id)) {
        return NextResponse.json({ error: 'Event with this ID already exists.' }, { status: 400 });
      }
      events.push(newEvent);
      await writeEvents(events);
      return NextResponse.json({ success: true, events });
    }

    if (action === 'update') {
      const updatedEvent: Event = data;
      const idx = events.findIndex(e => e.id === updatedEvent.id);
      if (idx === -1) {
        return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
      }
      events[idx] = updatedEvent;
      await writeEvents(events);
      return NextResponse.json({ success: true, events });
    }

    if (action === 'delete') {
      const filtered = events.filter(e => e.id !== id);
      if (filtered.length === events.length) {
        return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
      }
      await writeEvents(filtered);
      return NextResponse.json({ success: true, events: filtered });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error.' }, { status: 500 });
  }
}
