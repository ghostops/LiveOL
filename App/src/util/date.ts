import _ from 'lodash';

export const datesAreOnSameDay = (first: Date, second: Date) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();

export const dateToReadable = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
};

export const secondsFromDate = (datestring: string): number => {
    const date = new Date(datestring);
    const now = new Date();

    const difference = (now.getTime() - date.getTime()) / 1000;

    return Math.abs(difference);
};

export const padTime = (time: number, len: number = 2) => _.padStart(String(time), len, '0');
