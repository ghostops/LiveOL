import * as cheerio from 'cheerio';
import * as ms from 'ms';
import { LiveresultatApi } from './types';
import { Cacher } from 'lib/redis';
import { AxiosInstance } from 'axios';

export const scrapeAllCompetitions = async (
  client: AxiosInstance,
  cache: Cacher,
): Promise<LiveresultatApi.getcompetitions> => {
  let data: LiveresultatApi.competition[] = await cache.get(
    'getcompetitionsScrape',
  );

  if (!data) {
    data = [];

    const res = await client.get('/');
    const $ = cheerio.load(res.data);

    $('#tblComps tbody tr').each((i, el) => {
      if (i === 0) return;

      const idRegex = new RegExp(/comp=?(.*?)&/g);

      const date = el.children?.[0].children?.[0].data || '';

      const idExec = idRegex.exec(
        el.children?.[2].children?.[0]?.attribs?.href,
      );
      const id = Number(idExec?.[1]) || 0;

      const name = el.children?.[2].children?.[0].children?.[0]?.data || '';

      const organizer = el.children?.[4]?.children?.[0]?.data || '';

      data.push({ date, name, id, organizer, timediff: 0 });
    });

    cache.set('getcompetitionsScrape', data, ms('1 minute'));
  }

  return { competitions: data };
};
