import _ from 'lodash';
import * as moment from 'moment';
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
    const date = moment.utc(datestring);
    const now = moment.utc();

    const difference = now.diff(date);

    if (difference < 0) {
        return null;
    }

    const duration: any = moment.duration(difference);

    return duration.format('mm:ss');
};

export const padTime = (time: number, len: number = 2) => _.padStart(String(time), len, '0');
