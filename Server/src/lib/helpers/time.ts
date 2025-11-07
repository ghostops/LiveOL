import {
  endOfMonth,
  startOfMonth,
  isSameDay,
  isBefore,
  isAfter,
  addDays,
} from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import _ from 'lodash';

const validateDate = (dateString?: string): boolean => {
  if (!dateString) {
    return false;
  }

  const [year] = dateString.split('-');

  if (!year) {
    return false;
  }

  if (year.startsWith('-')) {
    return false;
  }

  return true;
};

// Parse a date string in UTC (equivalent to moment.utc(string))
const parseUTC = (dateString: string): Date => {
  // For date strings like "2024-01-15", treat them as UTC midnight
  const date = new Date(dateString + 'T00:00:00Z');
  return date;
};

export const isDateToday = (date: string, todaysDate: string): boolean => {
  if (!validateDate(date)) {
    return false;
  }

  const input = parseUTC(date);
  const today = todaysDate
    ? parseUTC(todaysDate)
    : toZonedTime(new Date(), 'UTC');

  return isSameDay(today, input);
};

export const isDateTodayOrFutureWithin7Days = (
  date: string,
  todaysDate: string,
): boolean => {
  if (!validateDate(date)) {
    return false;
  }

  const input = parseUTC(date);
  const today = todaysDate
    ? parseUTC(todaysDate)
    : toZonedTime(new Date(), 'UTC');
  const sevenDaysFromToday = addDays(today, 7);

  return (
    isBefore(input, sevenDaysFromToday) &&
    (isAfter(input, today) || isSameDay(input, today))
  );
};

export const timestampToObject = (time: number) => {
  const hours = Math.floor(time / 360000);
  const minutes = Math.floor((time - hours * 360000) / 6000);
  const seconds = Math.floor((time - minutes * 6000 - hours * 360000) / 100);
  const tenth = Math.floor(
    (time - minutes * 6000 - hours * 360000 - seconds * 100) / 10,
  );

  // If hours in NaN then time is falsey
  if (_.isNaN(hours)) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      tenth: 0,
    };
  }

  return {
    hours,
    minutes,
    seconds,
    tenth,
  };
};

export const padTime = (time: number, len: number = 2) =>
  _.padStart(String(time), len, '0');

export const splitTimestampToReadable = (time: number): string => {
  const { hours, minutes, seconds } = timestampToObject(time);

  const realMinutes = minutes + hours * 60;

  return `${padTime(realMinutes)}:${padTime(seconds)}`;
};

export const startToReadable = (time: number): string => {
  const { hours, minutes, seconds } = timestampToObject(time);
  return `${padTime(hours)}:${padTime(minutes)}:${padTime(seconds)}`;
};

export const timeplusToReadable = (time: number): string => {
  const { hours, minutes, seconds } = timestampToObject(time);

  const realMinutes = minutes + hours * 60;

  return `+${padTime(realMinutes)}:${padTime(seconds)}`;
};

export const getMonthFromDate = (date: Date): [Date, Date] => {
  const start = startOfMonth(new Date(date.getTime()));
  const end = endOfMonth(new Date(date.getTime()));

  return [start, end];
};
