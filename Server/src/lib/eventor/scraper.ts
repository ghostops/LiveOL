import { Cacher } from 'lib/redis';
import { getEnv } from 'lib/helpers/env';
import { ListResponseParser, EventResponseParser } from './parser';
import fs from 'fs';
import ms from 'ms';
import axios, { AxiosInstance } from 'axios';
import { format } from 'date-fns';

const DEV = getEnv('test') === 'true';

export class EventorScraper {
  private client: AxiosInstance;

  constructor(
    private baseUrl: string,
    private cache: Cacher,
  ) {
    this.client = axios.create({
      headers: {
        'User-Agent': 'LiveOL Server',
      },
    });
  }

  public scrapeDateRange = async (startDate: Date, endDate: Date) => {
    const start = format(startDate, 'yyyy-MM-dd');
    const end = format(endDate, 'yyyy-MM-dd');

    const url = `${this.baseUrl}/Events?startDate=${start}&endDate=${end}`;

    let data: string;

    if (DEV) {
      console.info('Read range from DEV cache');
      data = fs.readFileSync(`${__dirname}/test/list-body.html.txt`).toString();
    } else {
      const key = `eventor:${this.getEventorDomain()}:range:${start}-${end}`;

      data = await this.cache.get(key);

      if (!data) {
        data = (await this.client.get(url)).data;

        await this.cache.set(key, data, { ttlMs: ms('12 hours') });
      }
    }

    const parser = new ListResponseParser(data, this.baseUrl);
    const parsed = parser.parse();

    return parsed;
  };

  public scrapeEvent = async (id: string | number) => {
    const url = `${this.baseUrl}/Events/Show/${id}`;

    let data: string;

    if (DEV) {
      console.info('Read event from DEV cache');
      data = fs
        .readFileSync(`${__dirname}/test/event-body.html.txt`)
        .toString();
    } else {
      const key = `eventor:event:${id}`;

      data = await this.cache.get(key);

      if (!data) {
        data = (await this.client.get(url)).data;

        await this.cache.set(key, data, { ttlMs: ms('12 hours') });
      }
    }

    const parser = new EventResponseParser(data, this.baseUrl, url);
    const parsed = parser.parse();

    return parsed;
  };

  private getEventorDomain = (): string => this.baseUrl.split('://')[1]!;
}
