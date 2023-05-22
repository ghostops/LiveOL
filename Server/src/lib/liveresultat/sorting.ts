import { firstBy } from 'thenby';
import { LiveresultatApi } from './types';
import * as _ from 'lodash';

interface ResultCopy extends LiveresultatApi.result {
    place: any;
    start: any;
}

const parseToNumber = (maybeNumber: any, fallback: number): number => {
    let asNumber = (
        _.isNaN(_.toNumber(maybeNumber))
        ? 0
        : _.toNumber(maybeNumber)
    );

    if (asNumber === 0) asNumber = fallback;

    return asNumber;
};

const sortSplit = (sortingKey: string) => (a: ResultCopy, b: ResultCopy) => {
    const key = sortingKey.replace('split-', '');
    
    if (!a.splits[key]) {
        return 1;
    }

    if (!b.splits[key]) {
        return 0;
    }

    return a.splits[key] - b.splits[key];
};

export const sortOptimal = (
    original: LiveresultatApi.result[],
    sorting: string,
): LiveresultatApi.result[] => {
    let copy: ResultCopy[] = [...original];

    copy = copy.map((result) => {
        const place = parseToNumber(result.place, copy.length);
        const start = parseToNumber(result.start, Number.MAX_SAFE_INTEGER);

        return {
            ...result,
            place,
            start,
        };
    });

    let [sortingKey, sortingDirection] = sorting.split(':');

    const sortSplitFunction = sortSplit(sortingKey);

    const sortingFunction: any = sortingKey.includes('split-') ? sortSplitFunction : sortingKey;

    copy = copy.sort(
        firstBy(sortingFunction, sortingDirection as SortOrder)
        .thenBy('start', {ignoreCase: true})
        .thenBy('status', {ignoreCase: true})
    );

    const sorted: LiveresultatApi.result[] = [];

    original.forEach((result) => {
        const inCopyIndex = copy.findIndex((_result) => _result.name === result.name);
        sorted[inCopyIndex] = result;
    });

    return sorted;
};
