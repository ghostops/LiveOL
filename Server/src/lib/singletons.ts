import { Cacher } from 'lib/redis';
import { LiveresultatAPIClient } from 'lib/liveresultat';
import { EventorCombiner, CombinedEventorApi } from './eventor/combiner';
import { getEnv } from './helpers/env';

export interface APIResponse {
  Liveresultat: LiveresultatAPIClient;
  LiveresultatLongCache: LiveresultatAPIClient;
  Eventor: CombinedEventorApi;
  Redis: Cacher;
}

const URLS = {
  liveresultat: 'https://liveresultat.orientering.se',
  eventorSweden: 'https://eventor.orientering.se',
  eventorAustralia: 'https://eventor.orienteering.asn.au',
};

class ApiSingletons {
  private singletons: APIResponse | undefined;

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
        {
          url: URLS.eventorSweden,
          apiKey: getEnv('EVENTOR_API_KEY_SE', false),
        },
        {
          url: URLS.eventorAustralia,
          apiKey: getEnv('EVENTOR_API_KEY_AU', false),
        },
      ],
    });

    const combinedEventorApi = eventorCombiner.getCombinedApi();

    const liveresultatApi = new LiveresultatAPIClient(URLS.liveresultat, cache);

    const liveresultatLongCacheApi = new LiveresultatAPIClient(
      URLS.liveresultat,
      cache,
      {
        getcompetitions: '1 hour',
        getcompetition: '10 minutes',
        getclasses: '10 minutes',
        getclassresults: '1 minute',
        getlastpassings: '10 minutes',
        getclubresults: '10 minutes',
      },
      'liveresultat-long-cache:',
    );

    this.singletons = {
      Liveresultat: liveresultatApi,
      LiveresultatLongCache: liveresultatLongCacheApi,
      Eventor: combinedEventorApi,
      Redis: cache,
    };

    return this.singletons;
  };
}

export const apiSingletons = new ApiSingletons();
