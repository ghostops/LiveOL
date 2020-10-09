import _ from 'lodash';
import moment from 'moment';
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
	const date = moment(datestring).utcOffset(-120);
	const now = moment();

	const difference = now.diff(date);

	if (difference < 0) {
		return null;
	}

	const duration: any = moment.duration(difference);
	const formated = duration.format('mm:ss', { trim: false }) as string;

	return formated;
};

export const padTime = (time: number, len = 2) => _.padStart(String(time), len, '0');
