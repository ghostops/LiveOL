import _ from 'lodash';
import moment from 'moment';

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

export const isDateToday = (date: string, todaysDate: string): boolean => {
  if (!validateDate(date)) {
    return false;
  }

  const input = moment(date);
  const today = todaysDate ? moment(todaysDate) : moment.utc();

  return today.isSame(input, 'date');
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

export const getMonthFromDate = (
  date: moment.Moment,
): [moment.Moment, moment.Moment] => {
  const start = date.clone().startOf('month');
  const end = date.clone().endOf('month');

  return [start, end];
};
