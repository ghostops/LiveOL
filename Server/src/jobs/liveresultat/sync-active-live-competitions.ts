import { addDays, subDays, startOfDay } from 'date-fns';
import { and, eq, gte, lte } from 'drizzle-orm';
import { LiveCompetitionsTable } from 'lib/db/schema';
import logger from 'lib/logger';
import { APIResponse, apiSingletons } from 'lib/singletons';

export class SyncActiveLiveCompetitionsJob {
  private api: APIResponse;

  constructor() {
    this.api = apiSingletons.createApiSingletons();
  }

  async run() {
    try {
      // Calculate date range: yesterday to tomorrow
      const today = startOfDay(new Date());
      const yesterday = subDays(today, 1);
      const tomorrow = addDays(today, 1);

      // Query for active competitions in the date range
      const activeCompetitions = await this.api.Drizzle.db
        .select()
        .from(LiveCompetitionsTable)
        .where(
          and(
            eq(LiveCompetitionsTable.isLive, true),
            gte(LiveCompetitionsTable.date, yesterday),
            lte(LiveCompetitionsTable.date, tomorrow),
          ),
        );

      // Dispatch sync jobs for each active competition
      for (const competition of activeCompetitions) {
        await this.api.Queue.RegularQueue.addJob({
          name: 'sync-live-competition',
          data: {
            competitionId: competition.id,
            classesOnly: true,
          },
        });
      }

      if (activeCompetitions.length > 0) {
        logger.info(
          `Dispatched ${activeCompetitions.length} active live competitions for sync.`,
        );
      }
    } catch (error) {
      logger.error(`Error syncing active competitions: ${error}`);
    }
  }
}
