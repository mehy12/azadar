import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local or .env
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
  console.log('Starting migration to Supabase...');
  loadEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in env/dotenv files.');
    process.exit(1);
  }

  console.log(`Connected to Supabase at: ${supabaseUrl}`);
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // 1. Migrate Config
  console.log('\n--- Migrating App Config ---');
  const configPath = path.join(process.cwd(), 'src', 'data', 'config.json');
  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(raw);

    // Upsert full 'config' object
    const { error: err1 } = await supabase
      .from('app_config')
      .upsert({ key: 'config', value: config }, { onConflict: 'key' });

    if (err1) {
      console.error('Error migrating app_config (full config):', err1.message);
    } else {
      console.log('Successfully upserted "config" object key.');
    }

    // Upsert individual 'moharram1' key
    if (config.moharram1) {
      const { error: err2 } = await supabase
        .from('app_config')
        .upsert({ key: 'moharram1', value: config.moharram1 }, { onConflict: 'key' });

      if (err2) {
        console.error('Error migrating app_config (moharram1 key):', err2.message);
      } else {
        console.log(`Successfully upserted "moharram1" value: ${config.moharram1}`);
      }
    }
  } else {
    console.log('No config.json found to migrate.');
  }

  // 2. Migrate Venues
  console.log('\n--- Migrating Venues ---');
  const venuesPath = path.join(process.cwd(), 'src', 'data', 'venues.json');
  if (fs.existsSync(venuesPath)) {
    const raw = fs.readFileSync(venuesPath, 'utf-8');
    const venues = JSON.parse(raw);
    console.log(`Found ${venues.length} venues to migrate.`);

    let successCount = 0;
    let failCount = 0;

    for (const venue of venues) {
      const row = {
        slug: venue.id,
        name: venue.name,
        area: venue.area || '',
        address: venue.area || '',
        maps_query: venue.maps_query || '',
        type: venue.type || 'azakhana',
        latitude: venue.lat || null,
        longitude: venue.lng || null,
        image_url: venue.photo_url || null,
        zone: venue.zone || ''
      };

      const { error } = await supabase
        .from('venues')
        .upsert(row, { onConflict: 'slug' });

      if (error) {
        console.error(`Failed to upsert venue "${venue.id}":`, error.message);
        failCount++;
      } else {
        successCount++;
      }
    }
    console.log(`Venues migration summary: ${successCount} succeeded, ${failCount} failed.`);
  } else {
    console.log('No venues.json found to migrate.');
  }

  // 3. Migrate Events
  console.log('\n--- Migrating Events ---');
  const eventsPath = path.join(process.cwd(), 'src', 'data', 'events.json');
  if (fs.existsSync(eventsPath)) {
    const raw = fs.readFileSync(eventsPath, 'utf-8');
    const events = JSON.parse(raw);
    console.log(`Found ${events.length} events to migrate.`);

    // Fetch latest venues to map slug to ID
    const { data: dbVenues, error: venueFetchError } = await supabase
      .from('venues')
      .select('id, slug');

    if (venueFetchError || !dbVenues) {
      console.error('Error fetching venues from database to map relations. Aborting events migration.', venueFetchError?.message);
      process.exit(1);
    }

    const venueMap = new Map<string, string>();
    dbVenues.forEach(v => {
      venueMap.set(v.slug, v.id);
    });

    let successCount = 0;
    let failCount = 0;
    let skipCount = 0;

    for (const event of events) {
      const venueUuid = venueMap.get(event.venue_id);
      if (!venueUuid) {
        console.warn(`Skipping event "${event.id}": venue slug "${event.venue_id}" not found in database.`);
        skipCount++;
        continue;
      }

      const row = {
        venue_id: venueUuid,
        title: event.bayan_by || event.notes || 'Majlis',
        slug: event.id,
        speaker: event.bayan_by || null,
        min_janib: event.minjanib || null,
        date: event.date_iso ? event.date_iso : null,
        start_time: event.time_24h ? `${event.time_24h}:00` : null,
        end_time: null,
        poster_url: null,
        livestream_url: event.youtube_url || null,
        description: event.notes || null,
        
        // Legacy / UI fields
        location_detail: event.location_detail || null,
        date_type: event.date_type || 'regular',
        date_iso: event.date_iso || null,
        day_numbers: event.day_numbers || [],
        date_label: event.date_label || '',
        time: event.time || '',
        time_24h: event.time_24h || null,
        minjanib: event.minjanib || '',
        bayan_by: event.bayan_by || '',
        notes: event.notes || '',
        youtube_url: event.youtube_url || '',
        is_procession: !!event.is_procession
      };

      const { error } = await supabase
        .from('events')
        .upsert(row, { onConflict: 'slug' });

      if (error) {
        console.error(`Failed to upsert event "${event.id}":`, error.message);
        failCount++;
      } else {
        successCount++;
      }
    }
    console.log(`Events migration summary: ${successCount} succeeded, ${failCount} failed, ${skipCount} skipped.`);
  } else {
    console.log('No events.json found to migrate.');
  }

  console.log('\nMigration complete!');
}

run().catch(err => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
