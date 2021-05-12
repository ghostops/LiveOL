import { Cacher } from 'lib/redis';
import { getEnv } from './helpers/env';
import { LiveresultatAPIClient } from 'lib/liveresultat';
import { EventorCombiner, CombinedEventorApi } from './eventor/combiner';

export interface APIResponse {
	Liveresultat: LiveresultatAPIClient;
	Eventor: CombinedEventorApi;
}

const URLS = {
	liveresultat: 'https://liveresultat.orientering.se',
	eventorSweden: 'https://eventor.orientering.se',
	eventorAustralia: 'https://eventor.orienteering.asn.au',
};

class ApiSingletons {
	private singletons: APIResponse;

	public createApiSingletons = (): APIResponse => {
		if (this.singletons) return this.singletons;

		const cache = new Cacher({
			host: process.env.REDIS_HOST,
			port: 6379,
			password: process.env.REDIS_PASSWORD,
		});

		const eventorCombiner = new EventorCombiner({
			cache,
			endpoints: [
				{ url: URLS.eventorSweden, apiKey: process.env.EVENTOR_API_KEY_SE },
				{ url: URLS.eventorAustralia, apiKey: process.env.EVENTOR_API_KEY_AU },
			],
		});

		const combinedEventorApi = eventorCombiner.getCombinedApi();

		const liveresultatApi = new LiveresultatAPIClient(URLS.liveresultat, cache);

		this.singletons = {
			Liveresultat: liveresultatApi,
			Eventor: combinedEventorApi,
		};

		return this.singletons;
	};
}

export const apiSingletons = new ApiSingletons();
