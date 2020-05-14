import { Cacher } from 'lib/redis';
import { EventorApi } from './eventor/api';
import { EventorExtractor } from './eventor/exctractor';
import { EventorScraper } from './eventor/scraper';
import { getEnv } from './helpers/env';
import { LiveresultatAPIClient } from 'lib/liveresultat';

interface APIResponse {
    Liveresultat: LiveresultatAPIClient;
    Eventor: {
        api: EventorApi;
        extractor: EventorExtractor;
    };
}

const URLS = {
    liveresultat: 'https://liveresultat.orientering.se',
    eventorSweden: 'https://eventor.orientering.se',
};

export const createApiSingletons = (): APIResponse => {
    const cache = new Cacher({
        host: (
            getEnv('env') === 'live'
            ? 'redis'
            : 'localhost'
        ),
        port: 6379,
    });

    const scraper = new EventorScraper(URLS.eventorSweden, cache);
    const eventorExctactor = new EventorExtractor(scraper);

    const eventorApi = new EventorApi(URLS.eventorSweden, process.env.EVENTOR_API_KEY, cache);

    const liveresultatApi = new LiveresultatAPIClient(
        URLS.liveresultat,
        cache,
    );

    return {
        Liveresultat: liveresultatApi,
        Eventor: {
            api: eventorApi,
            extractor: eventorExctactor,
        },
    };
};
