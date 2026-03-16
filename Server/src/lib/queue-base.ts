import { Job, Queue, Worker } from 'bullmq';
import logger from './logger';

type OLQueueMessage = {
  name: string;
  data: Record<string, string | number | boolean>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type JobHandler = (data: any) => void | Promise<void>;

export class JobRegistry {
  private static handlers = new Map<string, JobHandler>();

  public static register(jobName: string, handler: JobHandler) {
    this.handlers.set(jobName, handler);
  }

  public static get(jobName: string): JobHandler | undefined {
    return this.handlers.get(jobName);
  }

  public static getAll(): Map<string, JobHandler> {
    return this.handlers;
  }
}

export interface QueueConfig {
  attempts: number;
  removeOnFail: boolean | { age?: number; count?: number };
  removeOnComplete: boolean | { age?: number; count?: number };
  backoff: {
    type: 'exponential';
    delay: number;
  };
}

export interface WorkerConfig {
  concurrency: number;
  limiter?: {
    max: number;
    duration: number;
  };
}

export abstract class QueueBase {
  protected queue: Queue;
  protected worker: Worker;

  constructor(
    protected queueName: string,
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
    this.queue = new Queue(this.queueName, {
      connection: connectionOptions,
    });

    const workerConfig = this.getWorkerConfig();
    this.worker = new Worker(this.queueName, this.handleJob.bind(this), {
      autorun: false,
      connection: connectionOptions,
      concurrency: workerConfig.concurrency,
      limiter: workerConfig.limiter,
      // Skip duplicate jobs - prevents piling up of same scheduled jobs
      skipStalledCheck: false,
      skipLockRenewal: false,
    });
  }

  protected abstract getQueueConfig(): QueueConfig;
  protected abstract getWorkerConfig(): WorkerConfig;

  protected async handleJob(job: Job): Promise<boolean> {
    const handler = JobRegistry.get(job.name);
    if (!handler) {
      logger.warn(`Unknown job type in ${this.queueName}: ${job.name}`);
      return false;
    }
    await handler(job.data);
    return true;
  }

  public async addJob(message: OLQueueMessage) {
    const config = this.getQueueConfig();
    await this.queue.add(message.name, message.data, {
      attempts: config.attempts,
      removeOnFail: config.removeOnFail,
      removeOnComplete: config.removeOnComplete,
      backoff: config.backoff,
    });
  }

  public async addRepeatingJob(
    message: OLQueueMessage,
    cronPattern: string,
    jobId: string,
  ) {
    const config = this.getQueueConfig();

    // Register the repeatable job - BullMQ handles the scheduling
    // Skip if running is handled via skipIfExists option
    await this.queue.add(message.name, message.data, {
      jobId,
      repeat: {
        pattern: cronPattern,
        // Skip if another job with same key is already scheduled
        immediately: false,
      },
      attempts: config.attempts,
      removeOnFail: config.removeOnFail,
      removeOnComplete: config.removeOnComplete,
      backoff: config.backoff,
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
      logger.info(`${this.queueName} worker is ready`);
    });
    this.worker.on('error', e => {
      console.error(`${this.queueName} error:`, e.stack || e);
    });
    this.worker.on('failed', e => {
      console.error(`${this.queueName} failed:`, e?.stacktrace || e);
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
}
