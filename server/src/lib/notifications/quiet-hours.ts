import { formatInTimeZone } from 'date-fns-tz';
import type { QuietHours } from './types';

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

/** Handles windows that wrap midnight, e.g. 22:00 -> 07:00. */
export const isWithinQuietHours = (
  quietHours: QuietHours,
  now = new Date(),
) => {
  let current: number;
  try {
    current = toMinutes(formatInTimeZone(now, quietHours.timezone, 'HH:mm'));
  } catch {
    return false;
  }
  const from = toMinutes(quietHours.from);
  const to = toMinutes(quietHours.to);
  if (from === to) return false;
  return from < to
    ? current >= from && current < to
    : current >= from || current < to;
};
