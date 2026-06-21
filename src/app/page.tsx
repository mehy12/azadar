import { Venue, Event, Day } from '@/types';
import venuesData from '../data/venues.json';
import eventsData from '../data/events.json';
import daysData from '../data/days.json';
import configData from '../data/config.json';
import { ScheduleApp } from '../components/ScheduleApp';

export default function Home() {
  const venues = venuesData as Venue[];
  const events = eventsData as Event[];
  const days = daysData as Day[];
  const config = configData as { moharram1: string };

  return (
    <ScheduleApp
      venues={venues}
      events={events}
      days={days}
      config={config}
    />
  );
}
