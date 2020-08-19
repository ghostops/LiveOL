import { Cacher } from 'lib/redis';
import { getEnv } from 'lib/helpers/env';
import { LiveresultatApi } from './types';
import * as fs from 'fs';
import * as moment from 'moment';
import * as ms from 'ms';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { LiveresultatReplayer } from './replay';

const DEV = getEnv('test') === 'true';

export class LiveresultatAPIClient {
    private replayer: LiveresultatReplayer;

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
            '30 minutes',
        );

    public getcompetition = async (id: number): Promise<LiveresultatApi.competition> =>
        this.cachedRequest(
            this.client.get(`${this.root}/api.php?method=getcompetitioninfo&comp=${id}`),
            `getcompetition:${id}`,
            '5 minutes',
        );

    public getclasses = async (id: number): Promise<LiveresultatApi.getclasses> =>
        this.cachedRequest(
            this.client.get(`${this.root}/api.php?method=getclasses&comp=${id}`),
            `getclasses:${id}`,
            '5 minutes',
        );

    public getclassresults = async (id: number, _class: string): Promise<LiveresultatApi.getclassresults> =>
        this.cachedRequest(
            this.client.get(`${this.root}/api.php?method=getclassresults&comp=${id}&class=${this.classNameString(_class)}`, {
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8'
                },
            }),
            `getclassresults:${id}:${this.classNameString(_class)}`,
            '15 seconds',
        );

    public getlastpassings = async (id: number): Promise<LiveresultatApi.lastpassings> =>
        this.cachedRequest(
            this.client.get(`${this.root}/api.php?method=getlastpassings&comp=${id}`),
            `getlastpassings:${id}`,
            '15 seconds',
        );

    // Replace all occurances åäö with ao
    private classNameString = (str: string): string => str.replace(/å|ä/g, 'a').replace(/Å|Ä/g, 'A').replace(/ö/g, 'o').replace(/Ö/g, 'O');

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

                await this.cache.set(
                    key,
                    data,
                    { ttlMs: ms(ttlString) },
                );
            }

            // Anti-tab measure
            if (typeof data === 'string') {
                try {
                    data = data.replace('\t', '');
                    data = JSON.parse(data);
                } catch {
                    console.error('json still could not be parsed!');
                }
            }

            return data;
        } catch (err) {
            console.error(err);
            return null;
        }
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

        console.info(`Read ${file}.json from DEV cache ${moment().format()}`);

        // if (file === 'getclassresults') {
        //     if (!this.replayer) {
        //         this.replayer = new LiveresultatReplayer(`${__dirname}/test/getclassresults-replay`);
        //     }

        //     return this.replayer.getCurrentResults();
        // }

        const str = fs.readFileSync(`${__dirname}/test/${file}.json`).toString();

        let data = JSON.parse(str);

        if (file === 'allcompetitions') {
            data = {
                competitions: (data as LiveresultatApi.getcompetitions).competitions.map((v) => ({
                    ...v,
                    date: v.date === 'TODAY' ? moment().format('YYYY-MM-DD') : v.date,
                })),
            } as LiveresultatApi.getcompetitions;
        }

        return data;
    };
}
