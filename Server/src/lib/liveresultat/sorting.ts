import { LiveresultatApi } from './types';

export type SortedResult = Omit<LiveresultatApi.result, 'place'> & {
  place: number;
};

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

const sortPlace = (direction: string) => (a: SortedResult, b: SortedResult) => {
  const desc = direction === 'desc';

  if (a.place > b.place) {
    return desc ? -1 : 1;
  } else if (a.place < b.place) {
    return desc ? 1 : -1;
  }

  return 0;
};

const sortResult =
  (direction: string) => (a: SortedResult, b: SortedResult) => {
    const desc = direction === 'desc';

    if (a.result > b.result) {
      return desc ? -1 : 1;
    } else if (a.result < b.result) {
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
) => {
  const copy: SortedResult[] = [...original].map(result => {
    const placeNumber = Number(result.place);

    return {
      ...result,
      place: placeNumber,
    } as any;
  });

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
    sortingFunction = sortResult(sortingDirection);
  } else if (sortingKey === 'name') {
    sortingFunction = sortName(sortingDirection);
  }

  if (sortingFunction === undefined) {
    throw new Error('no sorting function found');
  }

  let sorted = copy.sort(sortingFunction);

  if (sortingKey === 'result' || sortingKey === 'place') {
    sorted = sorted.sort((a, b) => {
      if (a.status > 0) {
        return 1;
      }
      if (b.status > 0) {
        return -1;
      }

      return 0;
    });
  }

  return sorted;
};
