import * as _ from 'lodash';

export const datesAreOnSameDay = (first: Date, second: Date) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();

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

export const splitTimestampToReadable = (time: number): string => {
    const { hours, minutes, seconds } = timestampToObject(time);

    const realMinutes = minutes + (hours * 60);

    return `${padTime(realMinutes)}:${padTime(seconds)}`;
};

export const startToReadable = (time: number): string => {
    const { hours, minutes, seconds } = timestampToObject(time);
    return `${padTime(hours)}:${padTime(minutes)}:${padTime(seconds)}`;
};

export const timeplusToReadable = (time: number): string => {
    const { hours, minutes, seconds } = timestampToObject(time);

    const realMinutes = minutes + (hours * 60);

    return `+${padTime(realMinutes)}:${padTime(seconds)}`;
};

export const getWeek = (date: Date): number => {
    date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));

    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));

    const diff = (date as any) - (yearStart as any);

    const weekNo = Math.ceil(((diff / 86400000) + 1) / 7);

    return weekNo;
};

export const weekNumberToDate = (weekNumber: number, year: number): Date => {
    const day = (1 + (weekNumber - 1) * 7);
    const date = new Date(year, 0, day);
    return date;
};

export const getDatesFromWeek = (weekNumber: number, year: number): [Date, Date] => {
    const start = weekNumberToDate(weekNumber, year);

    // Add 6 days to get the last day of the week
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return [start, end];
};

export const getLiveRunningStart = (start: number): Date => {
    const [hours, seconds, ms] = startToReadable(start).split(':').map((n) => Number(n));

    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    const date = new Date().getDate();

    const constructed = new Date(year, month, date, hours, seconds, ms);

    return constructed;
};
