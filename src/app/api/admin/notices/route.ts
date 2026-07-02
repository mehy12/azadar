import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data } = await supabase
      .from('sabeels')
      .select('filters')
      .eq('sabeel_name', 'APP_NOTICES')
      .maybeSingle();

    let notices = [];
    if (data && Array.isArray(data.filters)) {
      notices = data.filters;
    }

    return NextResponse.json({ notices });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id, pin } = await req.json();

    const correctPin = process.env.NEXT_PUBLIC_ADMIN_PIN || '7860';
    if (pin !== correctPin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Notice ID is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data } = await supabase
      .from('sabeels')
      .select('filters')
      .eq('sabeel_name', 'APP_NOTICES')
      .maybeSingle();

    if (!data || !Array.isArray(data.filters)) {
      return NextResponse.json({ message: 'No notices found' });
    }

    const newNotices = data.filters.filter((n: any) => n.id !== id);

    await supabase
      .from('sabeels')
      .update({ filters: newNotices as any })
      .eq('sabeel_name', 'APP_NOTICES');

    return NextResponse.json({ success: true, message: 'Notice deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
