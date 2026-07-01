import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Get config
export async function GET(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('sabeels')
      .select('filters')
      .eq('sabeel_name', 'APP_CONFIG')
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Default to false if not found
    return NextResponse.json({
      config: data?.filters || { doddaballapur_live: false }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Set config
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pin, config } = body;

    const correctPin = process.env.NEXT_PUBLIC_ADMIN_PIN || '7860';
    if (pin !== correctPin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // See if APP_CONFIG exists
    const { data: existing } = await supabase
      .from('sabeels')
      .select('id')
      .eq('sabeel_name', 'APP_CONFIG')
      .maybeSingle();

    if (existing) {
      // Update
      await supabase
        .from('sabeels')
        .update({ filters: config })
        .eq('id', existing.id);
    } else {
      // Insert
      await supabase
        .from('sabeels')
        .insert({
          sl_num: -1,
          sabeel_name: 'APP_CONFIG',
          location: 'INTERNAL',
          contact_person: '',
          contact_num: '',
          filters: config
        });
    }

    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
