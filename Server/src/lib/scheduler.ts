import { eq } from 'drizzle-orm';
import { ScheduledJobsTable } from './db/schema';
import logger from './logger';
import { Drizzle } from './db';
import { QueueBase } from './queue-base';

export class JobScheduler {
  private registeredJobIds = new Set<string>();

  constructor(
    private Drizzle: Drizzle,
    private Queue: QueueBase,
  ) {}

  async start() {
    logger.info('Starting job scheduler...');

    try {
      // Load all enabled scheduled jobs from the database
      const scheduledJobs = await this.Drizzle.db
        .select()
        .from(ScheduledJobsTable)
        .where(eq(ScheduledJobsTable.enabled, true));

      logger.info(`Found ${scheduledJobs.length} enabled scheduled jobs`);

      // Register each job with BullMQ
      for (const scheduledJob of scheduledJobs) {
        await this.registerJob(scheduledJob);
      }

      logger.info('Job scheduler started successfully');
    } catch (error) {
      logger.error(`Failed to start job scheduler: ${error}`);
      throw error;
    }
  }

  private async registerJob(
    scheduledJob: typeof ScheduledJobsTable.$inferSelect,
  ) {
    try {
      const jobId = `scheduled:${scheduledJob.id}`;

      await this.Queue.addRepeatingJob(
        {
          name: scheduledJob.jobName,
          data: scheduledJob.jobData as Record<
            string,
            string | number | boolean
          >,
        },
        scheduledJob.cronPattern,
        jobId,
      );

      this.registeredJobIds.add(jobId);
    } catch (error) {
      logger.error(
        `Failed to register scheduled job ${scheduledJob.id}: ${error}`,
      );
    }
  }

  async stop() {
    logger.info('Stopping job scheduler...');

    try {
      // Remove all registered repeating jobs
      for (const jobId of this.registeredJobIds) {
        await this.Queue.removeRepeatingJob(jobId);
      }

      this.registeredJobIds.clear();
      logger.info('Job scheduler stopped successfully');
    } catch (error) {
      logger.error(`Failed to stop job scheduler: ${error}`);
      throw error;
    }
  }

  async listScheduledJobs() {
    return await this.Queue.getRepeatableJobs();
  }
}
