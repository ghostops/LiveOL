import { Job, Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { SyncLiveClassJob } from 'jobs/liveresultat/sync-live-class';
import { SyncLiveCompetitionJob } from 'jobs/liveresultat/sync-live-competition';
import { SyncLiveCompetitionsJob } from 'jobs/liveresultat/sync-live-competitions';

type OLQueueMessage = {
  name: string;
  data: Record<string, string | number | boolean>;
};

export class OLQueue {
  public static queueName = 'ol_queue';

  private queue: Queue;
  private connection: Redis;
  private worker: Worker;

  constructor(
    private host: string,
    private port: number,
    private password?: string,
  ) {
    this.connection = new Redis({
      host: this.host,
      port: this.port,
      password: this.password,
      maxRetriesPerRequest: null,
    });
    this.queue = new Queue(OLQueue.queueName, { connection: this.connection });
    this.worker = new Worker(OLQueue.queueName, this.handleJob, {
      autorun: false,
      connection: this.connection,
      concurrency: 1,
      limiter: { duration: 1000, max: 3 },
    });
  }

  public async addJob(message: OLQueueMessage) {
    await this.queue.add(message.name, message.data, {
      attempts: 3,
      removeOnFail: false,
      removeOnComplete: true,
    });
  }

  public async startWorker() {
    if (this.worker.isRunning()) {
      await this.worker.close();
    }
    this.worker.run();
    this.worker.on('ready', () => {
      console.log('Worker is ready');
    });
    this.worker.on('error', e => {
      console.error('Queue error:', e.stack || e);
    });
    this.worker.on('failed', e => {
      console.error('Queue failed:', e?.stacktrace || e);
    });
  }

  public async purge() {
    await this.queue.drain();
    await this.queue.close();
    await this.connection.quit();
  }

  private async handleJob(job: Job) {
    switch (job.name) {
      case 'sync-live-competitions':
        new SyncLiveCompetitionsJob().run();
        break;
      case 'sync-live-competition':
        new SyncLiveCompetitionJob(job.data.competitionId).run();
        break;
      case 'sync-live-class':
        new SyncLiveClassJob(job.data.competitionId, job.data.className).run();
        break;
      default:
        console.warn(`Unknown job type: ${job.name}`);
        break;
    }
    return true;
  }
}
