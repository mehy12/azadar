export interface Venue {
  id: string;
  name: string;
  area: string;
  maps_query: string;
  type: string;
  lat: number | null;
  lng: number | null;
  photo_url: string | null;
  zone: string;
}

export interface Event {
  id: string;
  venue_id: string;
  location_detail: string | null;
  date_type: string;
  date_iso: string | null; // Can be null for recurring_range
  day_numbers: number[];
  date_label: string;
  time: string;
  time_24h: string | null;
  minjanib: string;
  bayan_by: string;
  notes: string;
  youtube_url: string;
  is_procession: boolean;
}

export interface Day {
  day: number;
  date_iso: string;
  weekday: string;
  label: string;
  tag: string | null;
}

export interface AppState {
  tab: 'home' | 'venues';
  selectedDay: number;
  zone: string;
  pastExpanded: boolean;
}
