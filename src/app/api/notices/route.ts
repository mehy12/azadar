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
