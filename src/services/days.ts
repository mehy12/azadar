import daysJson from '@/data/days.json';
import { Day } from '@/types';

export async function getDays(): Promise<Day[]> {
  return daysJson as Day[];
}
