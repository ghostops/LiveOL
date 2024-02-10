import moment from 'moment';
import 'moment-duration-format';

export const isDateToday = (date: string): boolean => {
  const input = moment.utc(date);
  const today = moment.utc();

  return today.isSame(input, 'date');
};

export const dateToReadable = (date: string): string => {
  return moment.utc(date).format('YYYY-MM-DD');
};

export const diffDateNow = (datestring: string): string | null => {
  if (datestring === 'Invalid date') {
    return null;
  }

  const date = moment(datestring).utcOffset(-120);
  // To use this with the liveresults replayer (serverside) you need to set your clock locally
  // to match the results returned by the replayer.
  const now = moment();

  const difference = now.diff(date);

  if (difference < 0) {
    return null;
  }

  const duration: any = moment.duration(difference);
  const formated = duration.format('mm:ss', { trim: false }) as string;

  return formated;
};

export const padTime = (time: number, len = 2) =>
  String(time).padStart(len, '0');
