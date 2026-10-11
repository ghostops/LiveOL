import type { NotificationEvent } from './types';

/** Liveresultat statuses worth a notification: DNS, DNF, MP, DSQ, OT */
export const NOTIFIABLE_STATUSES = [1, 2, 3, 4, 5];
const STATUS_OK = 0;

export type ResultSnapshot = {
  result: number | null;
  status: number | null;
  place: string | null;
  progress: number | null;
};

export type SplitSnapshot = {
  time?: number | null;
  place?: number | null;
};

export type DetectedChange = {
  type: NotificationEvent;
  /** Distinguishes repeated events of the same type, e.g. the split code */
  key: string;
};

/**
 * Compares a stored result row with the incoming one. Callers should skip
 * results without a previous row (first import of a class, late entries).
 */
export const detectResultChanges = (
  prev: ResultSnapshot,
  next: ResultSnapshot,
): DetectedChange[] => {
  const changes: DetectedChange[] = [];

  const finishedNow =
    next.status === STATUS_OK && next.result !== null && next.result > 0;
  const finishedBefore =
    prev.status === STATUS_OK && prev.result !== null && prev.result > 0;

  if (finishedNow && !finishedBefore) {
    changes.push({ type: 'finish', key: 'finish' });
  } else if (
    finishedNow &&
    finishedBefore &&
    next.place &&
    prev.place &&
    next.place !== prev.place
  ) {
    changes.push({ type: 'placeChange', key: `place:${next.place}` });
  }

  if (
    next.status !== null &&
    next.status !== prev.status &&
    NOTIFIABLE_STATUSES.includes(next.status)
  ) {
    changes.push({ type: 'status', key: `status:${next.status}` });
  }

  if (!prev.progress && next.progress && next.progress > 0 && !finishedNow) {
    changes.push({ type: 'start', key: 'start' });
  }

  return changes;
};

export const detectSplitChange = (
  code: string,
  prev: SplitSnapshot | undefined,
  next: SplitSnapshot,
): DetectedChange | null => {
  const hasTimeNow = typeof next.time === 'number' && next.time > 0;
  const hadTime = typeof prev?.time === 'number' && prev.time > 0;
  if (hasTimeNow && !hadTime) {
    return { type: 'split', key: `split:${code}` };
  }
  return null;
};

/** When one sync produces several events for a runner, only the most important is sent. */
export const EVENT_PRIORITY: NotificationEvent[] = [
  'finish',
  'status',
  'split',
  'start',
  'placeChange',
];
