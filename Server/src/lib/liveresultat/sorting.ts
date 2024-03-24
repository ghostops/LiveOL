import { LiveresultatApi } from './types';

export type SortedResult = LiveresultatApi.result;

const sortSplit =
  (sortingKey: string, direction: string) =>
  (a: SortedResult, b: SortedResult) => {
    const desc = direction === 'desc';
    const key = sortingKey.replace('split-', '');

    if (!a.splits[key]) {
      return desc ? -1 : 1;
    }

    if (!b.splits[key]) {
      return 0;
    }

    if (desc) {
      return b.splits[key]! - a.splits[key]!;
    }

    return a.splits[key]! - b.splits[key]!;
  };

// Parsing the place is a mess, so just flipping the already sorted list is easier
const sortPlace = (direction: string) => () => {
  const desc = direction === 'desc';

  return desc ? -1 : 1;
};

const sortStart = (direction: string) => (a: SortedResult, b: SortedResult) => {
  const desc = direction === 'desc';

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

    if (!a.start) {
      return 0;
    }

    const resA = a.result ? Number(a.result) : undefined;
    const resB = b.result ? Number(b.result) : undefined;

    const startDiffA = nowTimestamp - a.start;
    const startDiffB = nowTimestamp - b.start;

    const sortByA = resA ? resA : startDiffA > 0 ? startDiffA : 0;
    const sortByB = resB ? resB : startDiffB > 0 ? startDiffB : 0;

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
  sorting: string,
  nowTimestamp: number,
) => {
  const [sortingKey, sortingDirection] = sorting.split(':');

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
    sortingFunction = sortPlace(sortingDirection);
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
      if (b.status === 0) {
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
