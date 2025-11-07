import { padTime } from './date';

export const startIsAfterNow = (result: { start: number | null }): boolean => {
  const diff = (result.start || 0) - nowTimestamp();
  return diff < 1;
};

export const isLiveRunning = (result: {
  result: number | null;
  start: number | null;
}): boolean => {
  return !!(
    !result.result &&
    result.start &&
    result.start > 0 &&
    startIsAfterNow(result)
  );
};

const objectToTimestamp = (dateObj: {
  hours: number;
  minutes: number;
  seconds: number;
  tenth: number;
}) => {
  const { hours, minutes, seconds, tenth } = dateObj;
  const timestamp =
    hours * 360000 + minutes * 6000 + seconds * 100 + tenth * 10;
  return timestamp;
};

export const timestampToString = (time: number) => {
  const t = timestampToObject(time);
  return [t.minutes + t.hours * 60, t.seconds]
    .map(v => padTime(v, 2))
    .join(':');
};

const timestampToObject = (time: number) => {
  const hours = Math.floor(time / 360000);
  const minutes = Math.floor((time - hours * 360000) / 6000);
  const seconds = Math.floor((time - minutes * 6000 - hours * 360000) / 100);
  const tenth = Math.floor(
    (time - minutes * 6000 - hours * 360000 - seconds * 100) / 10,
  );

  // If hours in NaN then time is falsey
  if (Number.isNaN(hours)) {
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

export const nowTimestamp = () => {
  const now = new Date();
  return objectToTimestamp({
    hours: now.getHours(),
    minutes: now.getMinutes(),
    seconds: now.getSeconds(),
    tenth: 0,
  });
};

export const getLiveRunningTime = (startTime: number) => {
  const diff = nowTimestamp() - startTime;
  const tsString = timestampToObject(diff);
  return [tsString.minutes + tsString.hours * 60, tsString.seconds]
    .map(v => padTime(v, 2))
    .join(':');
};
