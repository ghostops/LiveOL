import { firstBy } from 'thenby';
import * as _ from 'lodash';
import { LiveresultatApi } from './types';

interface ResultCopy extends LiveresultatApi.result {
    place: any;
    start: any;
}

const parseToNumber = (maybeNumber: any, fallback: number): number => {
    let asNumber = _.isNaN(_.toNumber(maybeNumber)) ? 0 : _.toNumber(maybeNumber);
    if (asNumber === 0) asNumber = fallback;
    return asNumber;
};

export const sortOptimal = (original: LiveresultatApi.result[]): LiveresultatApi.result[] => {
    let copy: ResultCopy[] = [...original];

    copy = copy.map((result) => {
        const place = parseToNumber(result.place, copy.length);
        const start = parseToNumber(result.start, 999999999);

        return {
            ...result,
            place,
            start,
        };
    });

    copy = copy.sort(
        firstBy('place')
        .thenBy('start')
        .thenBy('status')
    );

    const sorted: LiveresultatApi.result[] = [];

    original.forEach((result) => {
        const inCopyIndex = copy.findIndex((_result) => _result.name === result.name);
        sorted[inCopyIndex] = result;
    });

    return sorted;
};
