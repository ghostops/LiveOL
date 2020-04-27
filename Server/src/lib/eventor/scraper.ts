import { Cacher } from 'lib/redis';
import { getEnv } from 'lib/helpers/env';
import { ListResponseParser, EventResponseParser } from './parser';
import * as fs from 'fs';
import * as ms from 'ms';
import axios, { AxiosInstance } from 'axios';

const DEV = getEnv('env') !== 'live';

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
        const start = this.dateToString(startDate);
        const end = this.dateToString(endDate);

        const url = `${this.baseUrl}/Events?startDate=${start}&endDate=${end}`;

        let data: string;

        if (DEV) {
            console.info('Read range from DEV cache');
            data = fs.readFileSync(`${__dirname}/test/list-body.html`).toString();
        } else {
            const key = `eventor:range:${start}-${end}`;

            data = await this.cache.get(key);

            if (!data) {
                data = (await this.client.get(url)).data;

                await this.cache.set(
                    key,
                    data,
                    { ttlMs: ms('12 hours') },
                );
            }
        }

        const parser = new ListResponseParser(data, this.baseUrl);
        const parsed = parser.parse();

        return parsed;
    }

    public scrapeEvent = async (id: string | number) => {
        const url = `${this.baseUrl}/Events/Show/${id}`;

        let data: string;

        if (DEV) {
            console.info('Read event from DEV cache');
            data = fs.readFileSync(`${__dirname}/test/event-body.html`).toString();
        } else {
            const key = `eventor:event:${id}`;

            data = await this.cache.get(key);

            if (!data) {
                data = (await this.client.get(url)).data;

                await this.cache.set(
                    key,
                    data,
                    { ttlMs: ms('12 hours') },
                );
            }
        }

        const parser = new EventResponseParser(data, this.baseUrl);
        const parsed = parser.parse();

        return parsed;
    }

    private dateToString = (date: Date): string => {
        const pad = (num: number): string => num.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    }
}
