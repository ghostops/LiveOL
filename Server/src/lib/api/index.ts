import { Cacher } from 'lib/redis';
import { LiveresultatApi } from './types';
import * as ms from 'ms';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

export class APIClient {
    private client: AxiosInstance;

    constructor(private root: string, private cache: Cacher) {
        this.client = axios.create({
            headers: {
                'User-Agent': 'LiveOL Server',
            },
        });
    }

    public getcompetitions = async (): Promise<LiveresultatApi.getcompetitions> =>
        this.cachedRequest(
            this.client.get(`${this.root}/api.php?method=getcompetitions`),
            'getcompetitions',
            '1 day',
        );

    public getcompetition = async (id: number): Promise<LiveresultatApi.competition> =>
        this.cachedRequest(
            this.client.get(`${this.root}/api.php?method=getcompetitioninfo&comp=${id}`),
            `getcompetition:${id}`,
            '2 hours',
        );

    public getclasses = async (id: number): Promise<LiveresultatApi.getclasses> =>
        this.cachedRequest(
            this.client.get(`${this.root}/api.php?method=getclasses&comp=${id}`),
            `getclasses:${id}`,
            '30 minutes',
        );

    public getclassresults = async (id: number, _class: string): Promise<LiveresultatApi.getclassresults> =>
        this.cachedRequest(
            this.client.get(`${this.root}/api.php?method=getclassresults&comp=${id}&class=${_class}`),
            `getclassresults:${id}:${_class}`,
            '15 seconds',
        );

    public getlastpassings = async (id: number): Promise<LiveresultatApi.lastpassings> =>
        this.cachedRequest(
            this.client.get(`${this.root}/api.php?method=getlastpassings&comp=${id}`),
            `getlastpassings:${id}`,
            '15 seconds',
        );

    private cachedRequest = async (
        request: Promise<AxiosResponse<any>>,
        key: string,
        ttlString: string,
    ): Promise<any> => {
        try {
            let data = await this.cache.get(key);

            if (!data) {
                const res = await request;
                data = res.data;
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
