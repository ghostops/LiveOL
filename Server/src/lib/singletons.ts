import { LiveresultatAPIClient } from 'lib/liveresultat/client';
import { getEnv } from './helpers/env';
import { Drizzle } from './db';
import { OLQueue } from './queue';
import { JobScheduler } from './scheduler';
import Redis from 'ioredis';

export interface APIResponse {
  Liveresultat: LiveresultatAPIClient;
  Drizzle: Drizzle;
  Queue: OLQueue;
  Scheduler: JobScheduler;
  Redis: Redis;
}

export const URLS = {
  liveresultat: 'https://liveresultat.orientering.se',
  eventorSweden: 'https://eventor.orientering.se',
  eventorAustralia: 'https://eventor.orienteering.asn.au',
};

class ApiSingletons {
  private singletons: APIResponse | undefined;

  public createApiSingletons = (): APIResponse => {
    if (this.singletons) return this.singletons;

    const cache = new Redis({
      host: process.env.REDIS_HOST,
      password: process.env.REDIS_PASSWORD,
      port: 6379,
    });

    const liveresultatApi = new LiveresultatAPIClient(URLS.liveresultat, cache);

    const queue = new OLQueue(
      process.env.REDIS_HOST!,
      6379,
      process.env.REDIS_PASSWORD,
    );

    const drizzle = new Drizzle(getEnv('DATABASE_URL', false));

    this.singletons = {
      Liveresultat: liveresultatApi,
      Redis: cache,
      Drizzle: drizzle,
      Queue: queue,
      Scheduler: new JobScheduler(drizzle, queue),
    };

    return this.singletons;
  };
}

export const apiSingletons = new ApiSingletons();
