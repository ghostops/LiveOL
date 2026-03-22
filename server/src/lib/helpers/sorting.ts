/* eslint-disable @typescript-eslint/no-unused-vars */
import { LiveresultatApi } from '../liveresultat/types';
import { MarshaledResult } from 'lib/marshal/results';

type SortedResult = MarshaledResult;

const sortSplit =
  (sortingKey: string, direction: string) =>
  (a: SortedResult, b: SortedResult) => {
    const desc = direction === 'desc';
    const key = sortingKey.replace('split-', '');

    const aSplit = a.splitResults?.find(s => s.code === key);
    const bSplit = b.splitResults?.find(s => s.code === key);

    if (!aSplit?.time) {
      return desc ? -1 : 1;
    }

    if (!bSplit?.time) {
      return 0;
    }

    if (desc) {
      return bSplit.time - aSplit.time;
    }

    return aSplit.time - bSplit.time;
  };

const sortStart = (direction: string) => (a: SortedResult, b: SortedResult) => {
  const desc = direction === 'desc';

  if (!a.start || !b.start) {
    return 0;
  }

  if (a.start > b.start) {
    return desc ? -1 : 1;
  } else if (a.start < b.start) {
    return desc ? 1 : -1;
  }

  return 0;
};

const sortResult =
  (direction: string, nowTimestamp: number) =>
  (a: SortedResult, b: SortedResult) => {
    const desc = direction === 'desc';

    if (!a.start || !b.start) {
      return 0;
    }

    const resA =
      a.place === '1' ? 0 : a.timeplus ? Number(a.result) : undefined;
    const resB =
      b.place === '1' ? 0 : b.timeplus ? Number(b.result) : undefined;

    const startDiffA = nowTimestamp - a.start;
    const startDiffB = nowTimestamp - b.start;

    const sortByA = resA !== undefined ? resA : startDiffA > 0 ? startDiffA : 0;
    const sortByB = resB !== undefined ? resB : startDiffB > 0 ? startDiffB : 0;

    if (sortByA === 0 && sortByB === 0) {
      return desc ? a.start - b.start : b.start - a.start;
    }

    if (sortByA > sortByB) {
      return desc ? -1 : 1;
    } else if (sortByA < sortByB) {
      return desc ? 1 : -1;
    }

    return 0;
  };

const sortPlace =
  (direction: string, nowTimestamp: number) =>
  (a: SortedResult, b: SortedResult) => {
    const desc = direction === 'desc';

    const placeA = a.place !== null ? parseInt(a.place, 10) : NaN;
    const placeB = b.place !== null ? parseInt(b.place, 10) : NaN;

    const aHasNumericPlace = !isNaN(placeA);
    const bHasNumericPlace = !isNaN(placeB);

    // Both have a numeric place — rank by it
    if (aHasNumericPlace && bHasNumericPlace) {
      if (placeA !== placeB) {
        return desc ? placeB - placeA : placeA - placeB;
      }
      // Same numeric place — tiebreak by result time
      const resA = a.result ?? 0;
      const resB = b.result ?? 0;
      return desc ? resB - resA : resA - resB;
    }

    // Only one has a numeric place — that one wins
    if (aHasNumericPlace) return -1;
    if (bHasNumericPlace) return 1;

    // Neither has a numeric place — both are non-finishers or tied
    // Runners still on course: sort by elapsed time descending (furthest along first)
    const elapsedA = a.start ? nowTimestamp - a.start : 0;
    const elapsedB = b.start ? nowTimestamp - b.start : 0;

    if (elapsedA !== elapsedB) {
      return elapsedB - elapsedA;
    }

    return 0;
  };

const sortName = (direction: string) => (a: SortedResult, b: SortedResult) => {
  const desc = direction === 'desc';

  if (a.name < b.name) {
    return desc ? 1 : -1;
  }
  if (a.name > b.name) {
    return desc ? -1 : 1;
  }
  return 0;
};

export const sortOptimal = (
  original: LiveresultatApi.result[],
  _sorting: string,
  _nowTimestamp: number,
) => {
  return original;
};

export const sortOptimalV2 = (
  original: MarshaledResult[],
  sortingKey: string,
  sortingDirection: string,
  nowTimestamp: number,
) => {
  if (!sortingKey || !sortingDirection) {
    throw new Error('invalid sorting options');
  }

  const sortSplitFunction = sortSplit(sortingKey, sortingDirection);

  let sortingFunction:
    | ((a: SortedResult, b: SortedResult) => number)
    | undefined = undefined;

  if (sortingKey.includes('split-')) {
    sortingFunction = sortSplitFunction;
  } else if (sortingKey === 'place') {
    sortingFunction = sortPlace(sortingDirection, nowTimestamp);
  } else if (sortingKey === 'result') {
    sortingFunction = sortResult(sortingDirection, nowTimestamp);
  } else if (sortingKey === 'name') {
    sortingFunction = sortName(sortingDirection);
  } else if (sortingKey === 'start') {
    sortingFunction = sortStart(sortingDirection);
  }

  if (sortingFunction === undefined) {
    throw new Error('no sorting function found');
  }

  let sorted = original.sort(sortingFunction);

  if (sortingKey === 'result' || sortingKey === 'place') {
    sorted = sorted.sort((a, b) => {
      if (b.status === null || b.status === 0) {
        return 0;
      }
      if (b.status > 0 && b.status !== 9 && b.status !== 10) {
        return -1;
      }

      return 0;
    });
  }

  return sorted;
};
