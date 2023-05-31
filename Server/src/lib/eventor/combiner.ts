import { LiveresultatApi } from 'lib/liveresultat/types';
import { Cacher } from 'lib/redis';
import { reject } from 'lodash';
import { EventorApi } from './api';
import { EventorExtractor } from './extractor';
import { EventorScraper } from './scraper';
import { EventorClub, EventorEventItem } from './types';

interface CombinerConstructorOptions {
	endpoints: {
		url: string;
		apiKey: string;
	}[];
	cache: Cacher;
}

export interface CombinedEventorApi {
	getEventorData: (liveresultatComp: LiveresultatApi.competition) => Promise<EventorEventItem | null>;
	getClubs: () => Promise<EventorClub[]>;
}

interface EventorApiObject {
	api: EventorApi;
	extractor: EventorExtractor;
}

export class EventorCombiner {
	constructor(private options: CombinerConstructorOptions) {}

	public getCombinedApi = (): CombinedEventorApi => {
		const apis = this.options.endpoints.map(({ url, apiKey }) => this.buildApiObject(url, apiKey));

		return {
			getClubs: async () => {
				const promises = [];
				for (const api of apis) {
					promises.push(api.api.getClubs());
				}
				const clubs = await Promise.all(promises);
				return clubs.reduce((root, clubs) => [...root, ...clubs], []);
			},
			getEventorData: async (liveresultatComp) => {
				try {
					const promises = [];
					for (const api of apis) {
						promises.push(api.extractor.getEventorData(liveresultatComp));
					}
					const events = await Promise.all<EventorEventItem | null>(promises);
					return events.find((event) => !!event) || null;
				} catch (error) {
					console.error(error);
					return null;
				}
			},
		};
	};

	private buildApiObject = (url: string, apiKey: string): EventorApiObject => {
		const scraper = new EventorScraper(url, this.options.cache);
		const eventorExctactor = new EventorExtractor(scraper);

		const eventorApi = new EventorApi(url, process.env.EVENTOR_API_KEY_SE, this.options.cache);

		return {
			api: eventorApi,
			extractor: eventorExctactor,
		};
	};
}
