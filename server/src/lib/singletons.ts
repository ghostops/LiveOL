import { LiveresultatAPIClient } from 'lib/liveresultat/client';
import { getEnv } from './helpers/env';
import { Drizzle } from './db';
import { FastQueue, PushQueue, RegularQueue, RepeatingQueue } from './queue';
import { PushNotifier } from './notifications/notifier';
import { JobScheduler } from './scheduler';
import Redis from 'ioredis';
import { LiveresultatApiUrl } from './liveresultat/adapt';

export interface APIResponse {
  Liveresultat: LiveresultatAPIClient;
  Drizzle: Drizzle;
  Queue: {
    FastQueue: FastQueue;
    RegularQueue: RegularQueue;
    RepeatingQueue: RepeatingQueue;
    PushQueue: PushQueue;
  };
  Scheduler: JobScheduler;
  Redis: Redis;
  Notifier: PushNotifier;
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

    const liveresultatApi = new LiveresultatAPIClient(
      LiveresultatApiUrl,
      cache,
    );

    const redisHost = process.env.REDIS_HOST!;
    const redisPassword = process.env.REDIS_PASSWORD;

    const fastQueue = new FastQueue(redisHost, 6379, redisPassword);
    const regularQueue = new RegularQueue(redisHost, 6379, redisPassword);
    const repeatingQueue = new RepeatingQueue(redisHost, 6379, redisPassword);
    const pushQueue = new PushQueue(redisHost, 6379, redisPassword);

    const drizzle = new Drizzle(getEnv('DATABASE_URL', false));

    this.singletons = {
      Liveresultat: liveresultatApi,
      Redis: cache,
      Drizzle: drizzle,
      Queue: {
        FastQueue: fastQueue,
        RegularQueue: regularQueue,
        RepeatingQueue: repeatingQueue,
        PushQueue: pushQueue,
      },
      Scheduler: new JobScheduler(drizzle, repeatingQueue),
      Notifier: new PushNotifier(drizzle.db, cache, pushQueue),
    };

    return this.singletons;
  };
}

export const apiSingletons = new ApiSingletons();
