import { Cacher } from 'lib/redis';
import { getEnv } from 'lib/helpers/env';
import { LiveresultatApi } from './types';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { LiveresultatReplayer } from './replay';
import * as fs from 'fs';
import * as moment from 'moment';
import * as ms from 'ms';

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
			'1 minute',
		);

	public getcompetition = async (id: number): Promise<LiveresultatApi.competition> =>
		this.cachedRequest(
			this.client.get(`${this.root}/api.php?method=getcompetitioninfo&comp=${id}`),
			`getcompetition:${id}`,
			'1 minute',
		);

	public getclasses = async (id: number): Promise<LiveresultatApi.getclasses> =>
		this.cachedRequest(
			this.client.get(`${this.root}/api.php?method=getclasses&comp=${id}`),
			`getclasses:${id}`,
			'1 minute',
		);

	public getclassresults = async (id: number, _class: string): Promise<LiveresultatApi.getclassresults> =>
		this.cachedRequest(
			this.client.get(
				`${this.root}/api.php?method=getclassresults&comp=${id}&class=${encodeURIComponent(_class)}`,
				{
					headers: {
						'Content-Type': 'application/json;charset=UTF-8',
					},
				},
			),
			`getclassresults:${id}:${encodeURIComponent(_class)}`,
			'15 seconds',
		);

	public getlastpassings = async (id: number): Promise<LiveresultatApi.lastpassings> =>
		this.cachedRequest(
			this.client.get(`${this.root}/api.php?method=getlastpassings&comp=${id}`),
			`getlastpassings:${id}`,
			'15 seconds',
		);

	public getclubresults = async (id: string, club: string): Promise<LiveresultatApi.getclubresults> => {
		return this.cachedRequest(
			this.client.get(`${this.root}/api.php?method=getclubresults&comp=${id}&club=${encodeURIComponent(club)}`),
			`getclubresults:${id}:${encodeURIComponent(club)}`,
			'15 seconds',
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

		let data = await this.cache.get(key);

		if (!data) {
			const res = await request;
			data = this.parseApiData(res.data);

			await this.cache.set(key, data, { ttlMs: ms(ttlString) });
		}

		return data;
	};

	private parseApiData = (data: any) => {
		let parsedData = data;

		// Broken JSON fixes
		if (typeof parsedData === 'string') {
			parsedData = parsedData.replace('\t', '');

			try {
				parsedData = JSON.parse(parsedData);
			} catch (error) {
				throw error;
			}
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
				this.replayer = new LiveresultatReplayer(`${__dirname}/test/getclassresults-replay`);
			}

			return this.replayer.getCurrentResults();
		}

		console.info(`Read ${file}.json from DEV cache ${moment().format()}`);

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
