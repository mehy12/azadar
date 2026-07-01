import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase.from('reminders').select('fcm_token');
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ count: 0 });
    }

    // Extract unique tokens
    const uniqueTokens = new Set(data.map(r => r.fcm_token).filter(Boolean));

    return NextResponse.json({
      count: uniqueTokens.size
    });

  } catch (error: any) {
    console.error('Devices count Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
