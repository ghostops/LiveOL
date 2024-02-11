import { LiveresultatApi } from 'lib/liveresultat/types';
import { OLTime } from 'types';
import * as Helpers from 'lib/helpers/time';
import _ from 'lodash';
import { createHash } from 'crypto';
import { SortedResult } from 'lib/liveresultat/sorting';

export interface IOLSplit {
  id: string;
  code: number;
  name: string;
  status: number;
  place: number;
  time: OLTime;
  timeplus: OLTime;
}

const parsePlace = (place: any): number => {
  if (_.isNumber(place)) {
    return place;
  } else if (place.trim() === '-') {
    return -1;
  }

  return 0;
};

export const marshallSplits =
  (split: LiveresultatApi.split) =>
  (result: LiveresultatApi.result | SortedResult): IOLSplit => {
    const keys = Object.keys(result.splits);
    const foundKeys = keys.filter(key => key.includes(String(split.code)));
    const keyValue: Record<string, number | undefined> = {};

    for (const key of foundKeys) {
      if (Number(key) === split.code) {
        keyValue['time'] = result.splits[key];
      } else {
        const newKey = key.replace(`${split.code}_`, '');
        keyValue[newKey] = result.splits[key];
      }
    }

    return {
      id: `${split.code}:${result.name.replace(/ /g, '_')}`,
      code: split.code,
      name: split.name,
      time: Helpers.splitTimestampToReadable(keyValue['time'] || 0),
      status: keyValue['status'] || NaN,
      place: parsePlace(keyValue['place'] || 0),
      timeplus: Helpers.timeplusToReadable(keyValue['timeplus'] || 0),
    };
  };

export interface IOLSplitControl {
  id: string;
  code: number;
  name: string;
}

export const marshallSplitControl = (
  res: LiveresultatApi.split,
): IOLSplitControl => ({
  id: `${res.code}`,
  code: res.code,
  name: res.name,
});

export interface IOLResult {
  id: string;
  splits: IOLSplit[];
  hasSplits: boolean;
  place?: number;
  name: string;
  club?: string;
  class?: string;
  status: number;
  start: OLTime;
  startTime: number;
  result: OLTime;
  timeplus: OLTime;
  progress: number;
  hasUpdated: boolean;
}

export const marshallResult =
  (
    comp: number,
    _class: string | undefined,
    splitControlls: LiveresultatApi.split[],
  ) =>
  (res: LiveresultatApi.result | SortedResult): IOLResult => {
    const start = Helpers.startToReadable(res.start);

    const compositeKey = `${comp}:${_class}:${res.name.replace(/ /g, '_')}:${res.club?.replace(/ /g, '_')}`;
    const id = createHash('md5').update(compositeKey).digest('hex');

    const place = typeof res.place === 'string' ? Number(res.place) : res.place;

    return {
      id,
      splits: splitControlls
        ? splitControlls.map(split => {
            return marshallSplits(split)(res);
          })
        : [],
      hasSplits: Boolean(!!splitControlls && splitControlls.length),
      start,
      place: res.status > 0 ? undefined : place,
      club: res?.club,
      class: res?.class || _class,
      name: res.name,
      result: Helpers.splitTimestampToReadable(res.result),
      status: res.status,
      timeplus: Helpers.timeplusToReadable(res.timeplus),
      startTime: res.start,
      progress: res.progress,
      hasUpdated: res.DT_RowClass === 'new_result',
    };
  };
