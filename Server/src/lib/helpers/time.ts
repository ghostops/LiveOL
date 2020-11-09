import * as _ from 'lodash';
import * as moment from 'moment';

export const isDateToday = (date: string, todaysDate: string): boolean => {
	const input = moment.utc(date);
	const today = todaysDate ? moment.utc(todaysDate) : moment.utc();

	return today.isSame(input, 'date');
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

	const realMinutes = minutes + hours * 60;

	return `${padTime(realMinutes)}:${padTime(seconds)}`;
};

export const startToReadable = (time: number): string => {
	const { hours, minutes, seconds } = timestampToObject(time);
	return `${padTime(hours)}:${padTime(minutes)}:${padTime(seconds)}`;
};

export const timeplusToReadable = (time: number): string => {
	const { hours, minutes, seconds } = timestampToObject(time);

	const realMinutes = minutes + hours * 60;

	return `+${padTime(realMinutes)}:${padTime(seconds)}`;
};

export const weekNumberToMoment = (weekNumber: number, year: number): moment.Moment => {
	const day = 1 + (weekNumber - 1) * 7;
	const date = new Date(year, 0, day);
	return moment.utc(date);
};

export const getMomentsFromWeek = (weekNumber: number, year: number): [moment.Moment, moment.Moment] => {
	const start = weekNumberToMoment(weekNumber, year);

	// Add 6 days to get the last day of the week
	const end = moment.utc(start).add(6, 'days');

	return [start, end];
};

export const getLiveRunningStart = (start: number): moment.Moment => {
	const [hours, minutes, seconds] = startToReadable(start)
		.split(':')
		.map((n) => Number(n));
	const today = moment.utc().format('YYYY-MM-DD');

	const startTime = moment.tz(`${today} ${hours}:${minutes}:${seconds}`, 'YYYY-MM-DD HH:mm:ss', 'Europe/Stockholm');

	return startTime;
};
