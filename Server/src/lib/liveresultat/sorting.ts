import { firstBy } from 'thenby';
import { LiveresultatApi } from './types';
import _ from 'lodash';

interface ResultCopy extends LiveresultatApi.result {
  start: any;
  place: any;
}

const parseToNumber = (maybeNumber: unknown, fallback: number): number => {
  if (_.isNaN(_.toNumber(maybeNumber))) {
    return fallback;
  }

  if (maybeNumber === '') {
    return fallback;
  }

  return _.toNumber(maybeNumber);
};

const sortSplit = (sortingKey: string) => (a: ResultCopy, b: ResultCopy) => {
  const key = sortingKey.replace('split-', '');

  if (!a.splits[key]) {
    return 1;
  }

  if (!b.splits[key]) {
    return 0;
  }

  return a.splits[key]! - b.splits[key]!;
};

const sortResult = (a: ResultCopy, b: ResultCopy) => {
  const [aMinString, aSecString] = a.result.split(':');
  const [bMinString, bSecString] = b.result.split(':');

  const bMin = Number(bMinString);
  const bSec = Number(bSecString);

  if (Number.isNaN(bMin) || Number.isNaN(bSec)) {
    return -1;
  }

  const aMin = Number(aMinString);
  const aSec = Number(aSecString);

  if (Number.isNaN(aMin) || Number.isNaN(aSec)) {
    return 1;
  }

  const aComb = aMin * 60 + aSec;
  const bComb = bMin * 60 + bSec;

  return bComb > aComb ? -1 : 1;
};

export const sortOptimal = (
  original: LiveresultatApi.result[],
  sorting: string,
): LiveresultatApi.result[] => {
  let copy: ResultCopy[] = [...original];

  copy = copy.map(result => {
    const place = parseToNumber(result.place, copy.length);
    const start = parseToNumber(result.start, Number.MAX_SAFE_INTEGER);

    return {
      ...result,
      place,
      start,
    };
  });

  const [sortingKey, sortingDirection] = sorting.split(':');

  if (!sortingKey || !sortingDirection) {
    throw new Error('invalid sorting options');
  }

  const sortSplitFunction = sortSplit(sortingKey);

  let sortingFunction: string | ((a: ResultCopy, b: ResultCopy) => number) =
    sortingKey;

  if (sortingKey.includes('split-')) {
    sortingFunction = sortSplitFunction;
  }

  if (sortingKey === 'result') {
    sortingFunction = sortResult;
  }

  const sorted = copy.sort(
    firstBy(sortingFunction as any, sortingDirection as SortOrder),
  );

  const parsed = sorted.map(res => ({
    ...res,
    start: res.start === Number.MAX_SAFE_INTEGER ? 0 : res.start?.toString(),
    place: res.place?.toString(),
  }));

  return parsed;
};
