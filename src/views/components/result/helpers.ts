import { timestampToObject, padTime } from 'util/date';

export const getSplitData = (split: SplitControl, result: Result) => {
    const keys = Object.keys(result.splits);
    const foundKeys = keys.filter((key) => key.includes(String(split.code)));
    const keyValue = {};

    for (const key of foundKeys) {
        if (Number(key) === split.code) {
            keyValue['time'] = result.splits[key];
        } else {
            const newKey = key.replace(`${split.code}_`, '');
            keyValue[newKey] = result.splits[key];
        }
    }

    return {
        time: keyValue['time'] || NaN,
        status: keyValue['status'] || NaN,
        place: keyValue['place'] || NaN,
        timeplus: keyValue['timeplus'] || NaN,
    };
};

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
