import { LiveresultatAPIClient } from 'lib/liveresultat/client';
import { getEnv } from './helpers/env';
import { Drizzle } from './db';
import { FastQueue, RegularQueue, RepeatingQueue } from './queue';
import { JobScheduler } from './scheduler';
import Redis from 'ioredis';
import { LiveresultatUrl } from './eventor/scrapers/urls';

export interface APIResponse {
  Liveresultat: LiveresultatAPIClient;
  Drizzle: Drizzle;
  Queue: {
    FastQueue: FastQueue;
    RegularQueue: RegularQueue;
    RepeatingQueue: RepeatingQueue;
  };
  Scheduler: JobScheduler;
  Redis: Redis;
}

class ApiSingletons {
  private singletons: APIResponse | undefined;

  public createApiSingletons = (): APIResponse => {
    if (this.singletons) return this.singletons;

    const cache = new Redis({
      host: process.env.REDIS_HOST,
      password: process.env.REDIS_PASSWORD,
      port: 6379,
    });

    const liveresultatApi = new LiveresultatAPIClient(LiveresultatUrl, cache);

    const redisHost = process.env.REDIS_HOST!;
    const redisPassword = process.env.REDIS_PASSWORD;

    const fastQueue = new FastQueue(redisHost, 6379, redisPassword);
    const regularQueue = new RegularQueue(redisHost, 6379, redisPassword);
    const repeatingQueue = new RepeatingQueue(redisHost, 6379, redisPassword);

    const drizzle = new Drizzle(getEnv('DATABASE_URL', false));

    this.singletons = {
      Liveresultat: liveresultatApi,
      Redis: cache,
      Drizzle: drizzle,
      Queue: {
        FastQueue: fastQueue,
        RegularQueue: regularQueue,
        RepeatingQueue: repeatingQueue,
      },
      Scheduler: new JobScheduler(drizzle, repeatingQueue),
    };

    return this.singletons;
  };
}

export const apiSingletons = new ApiSingletons();
