import { Cacher } from 'lib/redis';
import { LiveresultatApi } from './types';
import * as fs from 'fs';
import * as ms from 'ms';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

const DEV = true;

export class LiveresultatAPIClient {
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
        if (DEV) {
            return this.testRequest(key);
        }

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

    private testRequest = async (key: string) => {
        console.log(key);

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

        console.info(`Read ${file} from DEV cache`);
        const data = fs.readFileSync(`${__dirname}/test/${file}.json`).toString();
        return JSON.parse(data);
    };
}
