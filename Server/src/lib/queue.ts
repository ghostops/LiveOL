import { Job, Queue, Worker } from 'bullmq';
import { EventorDateParser } from 'jobs/eventor/eventor-date-parser';
import { SyncEventorCompetition } from 'jobs/eventor/sync-eventor-competition';
import { SyncEventorCompetitions } from 'jobs/eventor/sync-eventor-competitions';
import { SyncEventorResultsJob } from 'jobs/eventor/sync-eventor-results';
import { SyncEventorSignupsJob } from 'jobs/eventor/sync-eventor-signups';
import { SyncLiveClassJob } from 'jobs/liveresultat/sync-live-class';
import { SyncLiveCompetitionJob } from 'jobs/liveresultat/sync-live-competition';
import { SyncLiveCompetitionsJob } from 'jobs/liveresultat/sync-live-competitions';
import logger from './logger';
import { SyncEventorStartsJob } from 'jobs/eventor/sync-eventor-starts';

type OLQueueMessage = {
  name: string;
  data: Record<string, string | number | boolean>;
};

export class OLQueue {
  public static queueName = 'ol_queue';

  private queue: Queue;
  private worker: Worker;

  constructor(
    private host: string,
    private port: number,
    private password?: string,
  ) {
    const connectionOptions = {
      host: this.host,
      port: this.port,
      password: this.password,
      maxRetriesPerRequest: null,
    };

    // BullMQ will create its own connections from these options
    this.queue = new Queue(OLQueue.queueName, {
      connection: connectionOptions,
    });

    this.worker = new Worker(OLQueue.queueName, this.handleJob, {
      autorun: false,
      connection: connectionOptions,
      concurrency: 3,
      limiter: { duration: 1000, max: 3 },
      // Skip duplicate jobs - prevents piling up of same scheduled jobs
      skipStalledCheck: false,
      skipLockRenewal: false,
    });
  }

  public async addJob(message: OLQueueMessage) {
    await this.queue.add(message.name, message.data, {
      attempts: 3,
      removeOnFail: true, // maybe change
      removeOnComplete: true,
      backoff: {
        type: 'exponential',
        delay: 1000, // initial delay of 1 second
      },
    });
  }

  public async addRepeatingJob(
    message: OLQueueMessage,
    cronPattern: string,
    jobId: string,
  ) {
    // Register the repeatable job - BullMQ handles the scheduling
    // Skip if running is handled via skipIfExists option
    await this.queue.add(message.name, message.data, {
      jobId,
      repeat: {
        pattern: cronPattern,
        // Skip if another job with same key is already scheduled
        immediately: false,
      },
      attempts: 3,
      removeOnFail: true,
      removeOnComplete: {
        count: 0, // Don't keep completed jobs to prevent memory buildup
      },
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });

    logger.info(
      `Registered repeating job: ${message.name} (${cronPattern}) with ID ${jobId}`,
    );
  }

  public async removeRepeatingJob(jobId: string) {
    await this.queue.removeJobScheduler(jobId);
  }

  public async getRepeatableJobs() {
    return await this.queue.getJobSchedulers();
  }

  public async startWorker() {
    if (this.worker.isRunning()) {
      await this.worker.close();
    }
    this.worker.run();
    this.worker.on('ready', () => {
      logger.info('Worker is ready');
    });
    this.worker.on('error', e => {
      console.error('Queue error:', e.stack || e);
    });
    this.worker.on('failed', e => {
      console.error('Queue failed:', e?.stacktrace || e);
    });
  }

  public async stopWorker() {
    await this.worker.close();
  }

  public async purge() {
    await this.queue.drain();
    await this.queue.close();
    await this.worker.close();
  }

  private async handleJob(job: Job) {
    switch (job.name) {
      case 'sync-live-competitions':
        new SyncLiveCompetitionsJob(job.data.startDate, job.data.endDate).run();
        break;
      case 'sync-live-competition':
        new SyncLiveCompetitionJob(job.data.competitionId).run();
        break;
      case 'sync-live-class':
        new SyncLiveClassJob(job.data.competitionId, job.data.className).run();
        break;
      case 'sync-eventor-competitions':
        new SyncEventorCompetitions(
          job.data.countryCode,
          job.data.startDate,
          job.data.endDate,
        ).run();
        break;
      case 'sync-eventor-competition':
        new SyncEventorCompetition(
          job.data.eventorId,
          job.data.countryCode,
        ).run();
        break;
      case 'sync-eventor-signups':
        new SyncEventorSignupsJob(job.data.eventorDatabaseId).run();
        break;
      case 'sync-eventor-results':
        new SyncEventorResultsJob(job.data.eventorDatabaseId).run();
        break;
      case 'sync-eventor-starts':
        new SyncEventorStartsJob(job.data.eventorDatabaseId).run();
        break;
      case 'parse-eventor-dates':
        new EventorDateParser().run();
        break;
      default:
        logger.warn(`Unknown job type: ${job.name}`);
        break;
    }
    return true;
  }
}
