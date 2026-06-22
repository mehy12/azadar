-- Create Venues table
CREATE TABLE IF NOT EXISTS venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  address text,
  latitude numeric,
  longitude numeric,
  description text,
  image_url text,
  phone text,
  whatsapp text,
  created_at timestamp DEFAULT now(),
  
  -- UI / Legacy fields
  type text,
  zone text,
  maps_query text,
  area text
);

-- Create Events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid REFERENCES venues(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  speaker text,
  min_janib text,
  date date,
  start_time time,
  end_time time,
  poster_url text,
  livestream_url text,
  description text,
  created_at timestamp DEFAULT now(),

  -- UI / Legacy fields
  location_detail text,
  date_type text,
  date_iso text,
  day_numbers integer[],
  date_label text,
  time text,
  time_24h text,
  minjanib text,
  bayan_by text,
  notes text,
  youtube_url text,
  is_procession boolean
);

-- Create App Config table
CREATE TABLE IF NOT EXISTS app_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb,
  created_at timestamp DEFAULT now()
);
