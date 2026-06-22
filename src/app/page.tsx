import { getVenues } from '@/services/venues';
import { getEvents } from '@/services/events';
import { getDays } from '@/services/days';
import { getConfig } from '@/services/config';
import { ScheduleApp } from '../components/ScheduleApp';

export default async function Home() {
  const [venues, events, days, config] = await Promise.all([
    getVenues(),
    getEvents(),
    getDays(),
    getConfig()
  ]);

  return (
    <ScheduleApp
      venues={venues}
      events={events}
      days={days}
      config={config}
    />
  );
}

