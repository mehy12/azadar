import { NextResponse } from 'next/server';
import { getSabeels, createSabeel, updateSabeel, deleteSabeel } from '@/services/sabeels';

export async function GET() {
  const sabeels = await getSabeels();
  return NextResponse.json(sabeels);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, data, id } = body;

    if (action === 'create') {
      const updatedSabeels = await createSabeel(data);
      return NextResponse.json({ success: true, sabeels: updatedSabeels });
    }

    if (action === 'update') {
      const updatedSabeels = await updateSabeel(data);
      return NextResponse.json({ success: true, sabeels: updatedSabeels });
    }

    if (action === 'delete') {
      const updatedSabeels = await deleteSabeel(id);
      return NextResponse.json({ success: true, sabeels: updatedSabeels });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error.' }, { status: 500 });
  }
}
