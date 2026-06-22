import { NextResponse } from 'next/server';
import { getEvents, createEvent, updateEvent, deleteEvent } from '@/services/events';

export async function GET() {
  const events = await getEvents();
  return NextResponse.json(events);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, data, id } = body;

    if (action === 'create') {
      const updatedEvents = await createEvent(data);
      return NextResponse.json({ success: true, events: updatedEvents });
    }

    if (action === 'update') {
      const updatedEvents = await updateEvent(data);
      return NextResponse.json({ success: true, events: updatedEvents });
    }

    if (action === 'delete') {
      const updatedEvents = await deleteEvent(id);
      return NextResponse.json({ success: true, events: updatedEvents });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error.' }, { status: 500 });
  }
}

