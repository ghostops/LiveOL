import axios, { AxiosInstance, AxiosResponse } from 'axios';
import ms from 'ms';
import moment from 'moment';
import fs from 'fs';
import { scrapeAllCompetitions } from './scrape';
import { LiveresultatReplayer } from './replay';
import { LiveresultatApi } from './types';
import { getEnv } from 'lib/helpers/env';
import { Cacher } from 'lib/redis';

const DEV = getEnv('test') === 'true';

export class LiveresultatAPIClient {
  private replayer: LiveresultatReplayer | undefined;

  private client: AxiosInstance;

  constructor(
    private root: string,
    private cache: Cacher,
    private cacheTimes = {
      getcompetitions: '1 minute',
      getcompetition: '1 minute',
      getclasses: '1 minute',
      getclassresults: '15 seconds',
      getlastpassings: '15 seconds',
      getclubresults: '15 seconds',
    },
    private cacheKeyPrefix = 'liveresultat:',
  ) {
    this.client = axios.create({
      headers: {
        'User-Agent': 'LiveOL Server',
      },
      baseURL: this.root,
    });
  }

  public getcompetitions =
    async (): Promise<LiveresultatApi.getcompetitions> => {
      try {
        return await this.cachedRequest(
          this.client.get(`/api.php?method=getcompetitions`),
          'getcompetitions',
          this.cacheTimes.getcompetitions,
        );
      } catch (error: any) {
        if (error?.message?.includes('JSON at position')) {
          console.warn(error.message + ': getcompetitions');
          return await scrapeAllCompetitions(this.client, this.cache);
        }

        throw error;
      }
    };

  public getcompetition = async (
    id: number,
  ): Promise<LiveresultatApi.competition> =>
    this.cachedRequest(
      this.client.get(`/api.php?method=getcompetitioninfo&comp=${id}`),
      `getcompetition:${id}`,
      this.cacheTimes.getcompetition,
    );

  public getclasses = async (id: number): Promise<LiveresultatApi.getclasses> =>
    this.cachedRequest(
      this.client.get(`/api.php?method=getclasses&comp=${id}`),
      `getclasses:${id}`,
      this.cacheTimes.getclasses,
    );

  public getclassresults = async (
    id: number,
    _class: string,
  ): Promise<LiveresultatApi.getclassresults> =>
    this.cachedRequest(
      this.client.get(
        `/api.php?method=getclassresults&comp=${id}&class=${encodeURIComponent(_class)}&unformattedTimes=true`,
        {
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
          },
        },
      ),
      `getclassresults:${id}:${encodeURIComponent(_class)}`,
      this.cacheTimes.getclassresults,
    );

  public getlastpassings = async (
    id: number,
  ): Promise<LiveresultatApi.lastpassings> =>
    this.cachedRequest(
      this.client.get(`/api.php?method=getlastpassings&comp=${id}`),
      `getlastpassings:${id}`,
      this.cacheTimes.getlastpassings,
    );

  public getclubresults = async (
    id: number,
    club: string,
  ): Promise<LiveresultatApi.getclubresults> => {
    return this.cachedRequest(
      this.client.get(
        `/api.php?method=getclubresults&comp=${id}&club=${encodeURIComponent(club)}&unformattedTimes=true`,
      ),
      `getclubresults:${id}:${encodeURIComponent(club)}`,
      this.cacheTimes.getclubresults,
    );
  };

  private cachedRequest = async (
    request: Promise<AxiosResponse<any>>,
    key: string,
    ttlString: string,
  ): Promise<any> => {
    if (DEV) {
      return this.testRequest(key);
    }

    let data = await this.cache.get(this.cacheKeyPrefix + key);

    if (!data) {
      const res = await request;
      data = this.parseApiData(res.data);

      await this.cache.set(this.cacheKeyPrefix + key, data, {
        ttlMs: ms(ttlString),
      });
    }

    return data;
  };

  private parseApiData = (data: any) => {
    let parsedData = data;

    // Broken JSON fixes
    if (typeof parsedData === 'string') {
      parsedData = parsedData.replace('\t', '');
      parsedData = JSON.parse(parsedData);
    }

    return parsedData;
  };

  private testRequest = (key: string): any => {
    const file = (() => {
      if (key === 'getcompetitions') {
        return 'allcompetitions';
      }

      if (key.startsWith('getcompetition')) {
        return 'getcompetitioninfo';
      }

      if (key.startsWith('getclasses')) {
        return 'getclasses';
      }

      if (key.startsWith('getlastpassings')) {
        return 'getlastpassings';
      }

      if (key.startsWith('getclassresults')) {
        return 'getclassresults';
      }

      return null;
    })();

    if (!file) {
      return null;
    }

    if (file === 'getclassresults') {
      if (!this.replayer) {
        this.replayer = new LiveresultatReplayer(
          `${__dirname}/test/getclassresults-replay`,
        );
      }

      return this.replayer.getCurrentResults();
    }

    console.info(`Read ${file}.json from DEV cache ${moment().format()}`);

    const str = fs.readFileSync(`${__dirname}/test/${file}.json`).toString();

    let data = JSON.parse(str);

    if (file === 'allcompetitions') {
      data = {
        competitions: (
          data as LiveresultatApi.getcompetitions
        ).competitions.map(v => ({
          ...v,
          date: v.date === 'TODAY' ? moment().format('YYYY-MM-DD') : v.date,
        })),
      } as LiveresultatApi.getcompetitions;
    }

    return data;
  };
}
