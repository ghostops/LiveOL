import { lt } from 'drizzle-orm';
import { LiveResultsTable } from 'lib/db/schema/live_results';
import logger from 'lib/logger';
import { APIResponse, apiSingletons } from 'lib/singletons';
import { subDays } from 'date-fns';

export class PurgeOldLiveResultsJob {
  private api: APIResponse;

  constructor() {
    this.api = apiSingletons.createApiSingletons();
  }

  async run() {
    try {
      const cutoff = subDays(new Date(), 3);

      const result = await this.api.Drizzle.db
        .delete(LiveResultsTable)
        .where(lt(LiveResultsTable.deletedAt, cutoff));

      logger.info(
        `Purged live_results rows with deletedAt older than ${cutoff.toISOString()} (${result.rowCount ?? 0} rows deleted)`,
      );
    } catch (error) {
      logger.error(`Error purging old live results: ${error}`);
    }
  }
}
