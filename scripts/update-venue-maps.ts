import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const mapsMapping: Record<string, string> = {
  'azakhana-sartaj': 'https://maps.app.goo.gl/eknsuo3bc9JQm46w8?g_st=ac',
  'azakhana-hashim-raza': 'https://maps.app.goo.gl/m9xsRofwt6SuqdYX9?g_st=ac',
  'baab-ash-shifa': 'https://maps.app.goo.gl/dJm6hyKTf78MuAwL6',
  'azakhana-raza-ali-khan': 'https://maps.app.goo.gl/zFRm65UgUYGycoGb6?g_st=ac',
  'ashurkhana-ebrahim': 'https://maps.app.goo.gl/s6R8rpX6WczjaLBF6',
  'hussainabad': 'https://maps.app.goo.gl/DVwmjVtHddyrx1LP6?g_st=ac',
  'azakhana-raza-e-ghareeb': 'https://maps.app.goo.gl/eknsuo3bc9JQm46w8?g_st=ac',
  'ashurkhana-shirazi': 'https://maps.app.goo.gl/BmzPLfFQkAvVSH7v8?g_st=ac',
  'hussainy-chowk-pandal': 'https://maps.app.goo.gl/EEB4DGzyQ8gNC2U2A?g_st=ac',
  'imamia-manzil': 'https://maps.app.goo.gl/gx5fteMN4A54ruxdA',
  'azakhana-zehra': 'https://maps.app.goo.gl/MaYo1RkQcqqLtM6a9?g_st=ac',
  'hussainia-saqqa-e-sakina': 'https://maps.app.goo.gl/YhsEVzcYnCsV4VfT9?g_st=ac',
  'azakhana-arman-e-zainab': 'https://maps.app.goo.gl/xiPtf4fSgCMjjuu17?g_st=ac',
  'hassan-enclave': 'https://maps.app.goo.gl/qRZpShYrVdFvvmFa7?g_st=ac',
  'azakhana-shezada-e-qasim': 'https://maps.app.goo.gl/SXsQZpW4PtYM3Zhg6?g_st=ac',
  'darbar-e-hyderi': 'https://maps.app.goo.gl/77QFL2arDrAN6Mtu9?g_st=ac'
};

function loadEnv() {
  const envPaths = [
    path.join(process.cwd(), '.env.local'),
    path.join(process.cwd(), '.env')
  ];
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const firstEquals = trimmed.indexOf('=');
          if (firstEquals !== -1) {
            const key = trimmed.substring(0, firstEquals).trim();
            const val = trimmed.substring(firstEquals + 1).trim().replace(/^['"]|['"]$/g, '');
            process.env[key] = val;
          }
        }
      }
    }
  }
}

async function run() {
  console.log('Starting venue Google Maps updates...');
  loadEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const hasSupabase = !!(supabaseUrl && supabaseAnonKey);
  let supabaseClient: any = null;
  if (hasSupabase) {
    console.log(`Connected to Supabase at: ${supabaseUrl}`);
    supabaseClient = createClient(supabaseUrl!, supabaseAnonKey!);
  } else {
    console.log('No Supabase credentials found. Skipping database updates (JSON only).');
  }

  // 1. Update Local JSON
  const venuesPath = path.join(process.cwd(), 'src', 'data', 'venues.json');
  if (fs.existsSync(venuesPath)) {
    const raw = fs.readFileSync(venuesPath, 'utf-8');
    const venues = JSON.parse(raw);
    let updatedCount = 0;

    for (const venue of venues) {
      if (mapsMapping[venue.id]) {
        venue.maps_query = mapsMapping[venue.id];
        updatedCount++;
      }
    }

    fs.writeFileSync(venuesPath, JSON.stringify(venues, null, 2), 'utf-8');
    console.log(`Successfully updated ${updatedCount} venues in local venues.json.`);
  } else {
    console.error('Error: venues.json not found!');
  }

  // 2. Update Supabase Database
  if (supabaseClient) {
    console.log('\nUpdating Supabase database...');
    let successCount = 0;
    let failCount = 0;

    for (const [slug, mapsUrl] of Object.entries(mapsMapping)) {
      const { error } = await supabaseClient
        .from('venues')
        .update({ maps_query: mapsUrl })
        .eq('slug', slug);

      if (error) {
        console.error(`Failed to update venue "${slug}" in Supabase:`, error.message);
        failCount++;
      } else {
        console.log(`Updated venue "${slug}" successfully.`);
        successCount++;
      }
    }
    console.log(`Supabase update summary: ${successCount} succeeded, ${failCount} failed.`);
  }

  console.log('\nUpdates complete!');
}

run().catch(err => {
  console.error('Fatal error running maps update script:', err);
  process.exit(1);
});
