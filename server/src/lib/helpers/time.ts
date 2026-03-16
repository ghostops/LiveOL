import { fromZonedTime } from 'date-fns-tz';
import { parseISO } from 'date-fns';

export function getUtcDate(competitionDate: string, timediff?: number) {
  timediff = timediff ?? 0;
  const competitionTz = getTimezoneFromOffset(timediff);

  // Parse and convert to UTC
  const localDate = parseISO(`${competitionDate}T00:00:00`);
  const utcDate = fromZonedTime(localDate, competitionTz);

  return utcDate;
}

function getTimezoneFromOffset(timediff: number): string {
  // timediff is offset from CET (UTC+1/+2)
  const cetBaseOffset = 1; // CET is UTC+1 (CEST is UTC+2, but API uses CET as reference)
  const utcOffset = cetBaseOffset + timediff;

  // Map UTC offsets to primary IANA timezones
  const tzMap: Record<string, string> = {
    '-12': 'Etc/GMT+12',
    '-11': 'Pacific/Midway',
    '-10': 'Pacific/Honolulu',
    '-9': 'America/Anchorage',
    '-8': 'America/Los_Angeles',
    '-7': 'America/Denver',
    '-6': 'America/Chicago',
    '-5': 'America/New_York',
    '-4': 'America/Halifax',
    '-3': 'America/Sao_Paulo',
    '-2': 'Atlantic/South_Georgia',
    '-1': 'Atlantic/Azores',
    '0': 'Europe/London',
    '1': 'Europe/Paris',
    '2': 'Europe/Helsinki',
    '3': 'Europe/Moscow',
    '4': 'Asia/Dubai',
    '5': 'Asia/Karachi',
    '6': 'Asia/Dhaka',
    '7': 'Asia/Bangkok',
    '8': 'Asia/Shanghai',
    '9': 'Asia/Tokyo',
    '10': 'Australia/Sydney',
    '11': 'Pacific/Noumea',
    '12': 'Pacific/Auckland',
    '13': 'Pacific/Tongatapu',
    '14': 'Pacific/Kiritimati',
  };

  const key = String(utcOffset);
  return tzMap[key]
    ? tzMap[key]
    : `Etc/GMT${utcOffset > 0 ? '-' : '+'}${Math.abs(utcOffset)}`;
}
