import { startOfDay, endOfDay } from 'date-fns';
import { and, gte, lte } from 'drizzle-orm';
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
      const start = startOfDay(new Date());
      const end = endOfDay(new Date());

      // Query for active competitions in the date range
      const activeCompetitions = await this.api.Drizzle.db
        .select()
        .from(LiveCompetitionsTable)
        .where(
          and(
            gte(LiveCompetitionsTable.date, start),
            lte(LiveCompetitionsTable.date, end),
          ),
        );

      await Promise.all(
        activeCompetitions.map(competition =>
          this.api.Queue.RegularQueue.addJob({
            name: 'sync-live-competition',
            data: {
              competitionId: competition.id,
              classesOnly: true,
            },
          }),
        ),
      );

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
