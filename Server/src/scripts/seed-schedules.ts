import dotenv from 'dotenv';
import { apiSingletons } from '../lib/singletons';
import { ScheduledJobsTable } from '../lib/db/schema';
import logger from '../lib/logger';

dotenv.config();

async function seedScheduledJobs() {
  const api = apiSingletons.createApiSingletons();

  try {
    logger.info('Starting scheduled jobs seeding...');

    const schedules: any[] = [
      // ToDo: Add your scheduled jobs here
    ];

    for (const schedule of schedules) {
      await api.Drizzle.db.insert(ScheduledJobsTable).values(schedule);
      logger.info(
        `Seeded schedule: ${schedule.jobName} (${schedule.cronPattern})`,
      );
    }

    logger.info('Scheduled jobs seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error(`Failed to seed scheduled jobs: ${error}`);
    process.exit(1);
  }
}

seedScheduledJobs();
