import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { LiveresultatApi } from './types';
import { Cacher } from 'lib/redis';
import * as ms from 'ms';
import * as _ from 'lodash';

export class APIClient {
    private client: AxiosInstance;

    constructor(private root: string, private cache: Cacher) {
        this.client = axios.create({
            headers: {
                'User-Agent': 'LiveOL Server',
            },
        });
    }

    public getcompetitions = async (): Promise<LiveresultatApi.getcompetitions> => {
        const cacheKey = 'getcompetitions';
        try {
            let data = await this.cache.get(cacheKey);

            if (!data) {
                const res = await this.client.get(`${this.root}/api.php?method=getcompetitions`);
                data = res.data;
            }

            await this.cache.set(
                cacheKey,
                data,
                { ttlMs: ms('1 day') },
            );

            return data;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    public getcompetition = async (id: number): Promise<LiveresultatApi.competition> =>
        this.cachedRequest(
            this.client.get(`${this.root}/api.php?method=getcompetitioninfo&comp=${id}`),
            null,
            `getcompetition:${id}`,
            '2 hours',
        );

    public getclasses = async (id: number): Promise<LiveresultatApi.getclasses> =>
        this.cachedRequest(
            this.client.get(`${this.root}/api.php?method=getclasses&comp=${id}`),
            'classes',
            `getclasses:${id}`,
            '30 minutes',
        );

    private cachedRequest = async (
        request: Promise<AxiosResponse<any>>,
        getter: string,
        key: string,
        ttlString: string,
    ): Promise<any> => {
        try {
            let data = await this.cache.get(key);

            if (!data) {
                const res = await request;

                data = (
                    getter && getter.length
                    ? _.get(res.data, getter)
                    : res.data
                );
            }

            await this.cache.set(
                key,
                data,
                { ttlMs: ms(ttlString) },
            );

            return data;
        } catch (err) {
            console.error(err);
            return null;
        }
    };
}
