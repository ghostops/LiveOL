import { EventorDateParser } from 'jobs/eventor/eventor-date-parser';
import { SyncEventorCompetition } from 'jobs/eventor/sync-eventor-competition';
import { SyncEventorCompetitions } from 'jobs/eventor/sync-eventor-competitions';
import { SyncEventorResultsJob } from 'jobs/eventor/sync-eventor-results';
import { SyncEventorSignupsJob } from 'jobs/eventor/sync-eventor-signups';
import { SyncLiveClassJob } from 'jobs/liveresultat/sync-live-class';
import { SyncLiveCompetitionJob } from 'jobs/liveresultat/sync-live-competition';
import { SyncLiveCompetitionsJob } from 'jobs/liveresultat/sync-live-competitions';
import { SyncEventorStartsJob } from 'jobs/eventor/sync-eventor-starts';
import {
  QueueBase,
  QueueConfig,
  WorkerConfig,
  JobRegistry,
} from './queue-base';

// Register all job handlers in the centralized registry
JobRegistry.register('sync-live-class', data =>
  new SyncLiveClassJob(data.competitionId, data.className).run(),
);

JobRegistry.register('sync-live-competitions', data =>
  new SyncLiveCompetitionsJob(data.startDate, data.endDate).run(),
);

JobRegistry.register('sync-live-competition', data =>
  new SyncLiveCompetitionJob(data.competitionId).run(),
);

JobRegistry.register('sync-eventor-competitions', data =>
  new SyncEventorCompetitions(
    data.countryCode,
    data.startDate,
    data.endDate,
  ).run(),
);

JobRegistry.register('sync-eventor-competition', data =>
  new SyncEventorCompetition(data.eventorId, data.countryCode).run(),
);

JobRegistry.register('sync-eventor-signups', data =>
  new SyncEventorSignupsJob(data.eventorDatabaseId).run(),
);

JobRegistry.register('sync-eventor-results', data =>
  new SyncEventorResultsJob(data.eventorDatabaseId).run(),
);

JobRegistry.register('sync-eventor-starts', data =>
  new SyncEventorStartsJob(data.eventorDatabaseId).run(),
);

JobRegistry.register('parse-eventor-dates', () =>
  new EventorDateParser().run(),
);

/**
 * Fast Queue - High throughput, minimal retries
 * Best for: Leaf jobs with quick database operations (e.g., sync-live-class)
 * Can handle: ANY job type from the JobRegistry
 */
export class FastQueue extends QueueBase {
  public static queueName = 'ol_queue_fast';

  constructor(host: string, port: number, password?: string) {
    super(FastQueue.queueName, host, port, password);
  }

  protected getQueueConfig(): QueueConfig {
    return {
      attempts: 1,
      removeOnFail: true,
      removeOnComplete: true,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    };
  }

  protected getWorkerConfig(): WorkerConfig {
    return {
      concurrency: 10,
    };
  }
}

/**
 * Regular Queue - Standard settings for most jobs
 * Best for: Parent jobs, API calls with moderate throughput needs
 * Can handle: ANY job type from the JobRegistry
 */
export class RegularQueue extends QueueBase {
  public static queueName = 'ol_queue_regular';

  constructor(host: string, port: number, password?: string) {
    super(RegularQueue.queueName, host, port, password);
  }

  protected getQueueConfig(): QueueConfig {
    return {
      attempts: 3,
      removeOnFail: true,
      removeOnComplete: true,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    };
  }

  protected getWorkerConfig(): WorkerConfig {
    return {
      concurrency: 3,
      limiter: { duration: 1000, max: 9 },
    };
  }
}

/**
 * Repeating Queue - Maximum reliability for scheduled jobs
 * Best for: Cron-scheduled jobs that need guaranteed execution
 * Can handle: ANY job type from the JobRegistry
 */
export class RepeatingQueue extends QueueBase {
  public static queueName = 'ol_queue_repeating';

  constructor(host: string, port: number, password?: string) {
    super(RepeatingQueue.queueName, host, port, password);
  }

  protected getQueueConfig(): QueueConfig {
    return {
      attempts: 7,
      removeOnFail: false,
      removeOnComplete: { count: 20 },
      backoff: {
        type: 'exponential',
        delay: 5000, // 5 second initial delay
      },
    };
  }

  protected getWorkerConfig(): WorkerConfig {
    return {
      concurrency: 1,
      limiter: { duration: 1000, max: 2 },
    };
  }
}
