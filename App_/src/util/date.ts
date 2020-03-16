import * as _ from 'lodash';

export const today = () => {
    const d = new Date();

    const month = d.getMonth() + 1;
    const day = d.getDate();

    // tslint:disable
    const output = d.getFullYear() + '-' +
        (month < 10 ? '0' : '') + month + '-' +
        (day < 10 ? '0' : '') + day;
    // tslint:enable

    return output;
};

export const timestampToObject = (time: number) => {
    const hours = Math.floor(time / 360000);
    const minutes = Math.floor((time - hours * 360000) / 6000);
    const seconds = Math.floor((time - minutes * 6000 - hours * 360000) / 100);
    const tenth = Math.floor((time - minutes * 6000 - hours * 360000 - seconds * 100) / 10);

    // If hours in NaN then time is falsey
    if (_.isNaN(hours)) {
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

export const padTime = (time: number, len: number = 2) => _.padStart(String(time), len, '0');
