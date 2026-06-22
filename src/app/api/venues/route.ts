import { NextResponse } from 'next/server';
import { getVenues, createVenue, updateVenue, deleteVenue } from '@/services/venues';

export async function GET() {
  const venues = await getVenues();
  return NextResponse.json(venues);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, data, id } = body;

    if (action === 'create') {
      const updatedVenues = await createVenue(data);
      return NextResponse.json({ success: true, venues: updatedVenues });
    }

    if (action === 'update') {
      const updatedVenues = await updateVenue(data);
      return NextResponse.json({ success: true, venues: updatedVenues });
    }

    if (action === 'delete') {
      const updatedVenues = await deleteVenue(id);
      return NextResponse.json({ success: true, venues: updatedVenues });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error.' }, { status: 500 });
  }
}

