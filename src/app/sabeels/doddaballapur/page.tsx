import ClientSabeelPage, { Sabeel } from './ClientSabeelPage';
import sabeelsData from '@/data/doddaballapur_sabeels.json';
import { createClient } from '@supabase/supabase-js';

export const metadata = {
  title: "Doddaballapur Sabeel Info",
  description: "Sabeels on the Bangalore to Doddaballapur route for 16th Muharram."
};

// Force dynamic rendering since we are fetching from DB
export const dynamic = 'force-dynamic';

export default async function Page() {
  let sabeels: Sabeel[] = sabeelsData as any;
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase.from('sabeels').select('*').order('sl_num', { ascending: true });
      if (!error && data && data.length > 0) {
        sabeels = data as Sabeel[];
      }
    }
  } catch (e) {
    console.error('Failed to fetch sabeels from Supabase, falling back to JSON', e);
  }

  return <ClientSabeelPage sabeels={sabeels} />;
}
