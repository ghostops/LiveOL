import { addDays, isAfter, isValid, parse } from 'date-fns';
import { inArray, notInArray } from 'drizzle-orm';
import { LiveClassesTable } from 'lib/db/schema/live_classes';
import { LiveCompetitionsTable } from 'lib/db/schema/live_competitions';
import { LiveResultsTable } from 'lib/db/schema/live_results';
import { OLCompetitionsTable } from 'lib/db/schema/ol_competitions';
import type { LiveresultatApi } from 'lib/liveresultat/types';
import logger from 'lib/logger';
import { APIResponse, apiSingletons } from 'lib/singletons';
import _ from 'lodash';

export class SyncLiveCompetitionsJob {
  private api: APIResponse;

  constructor(
    private startDate?: string,
    private endDate?: string,
  ) {
    this.api = apiSingletons.createApiSingletons();
  }

  async run() {
    try {
      const { competitions } = await this.api.Liveresultat.getcompetitions();

      const batches = _.chunk(competitions, 50);

      await Promise.all(
        batches.map(batch => this.dispatchCompetitionSync(batch)),
      );

      if (batches.length > 0) {
        logger.info(
          `Dispatched live competitions for sync: ${this.startDate} to ${this.endDate}`,
        );
      }

      await this.purgeStaleCompetitions(competitions.map(c => c.id));
    } catch (error) {
      logger.error(`Error syncing competitions: ${error}`);
    }
  }

  private async purgeStaleCompetitions(liveIds: number[]) {
    try {
      const db = this.api.Drizzle.db;

      // Find all live_competitions rows whose ID is no longer in the Liveresultat response.
      const staleCompetitions = await db
        .select({
          id: LiveCompetitionsTable.id,
          olCompetitionId: LiveCompetitionsTable.olCompetitionId,
        })
        .from(LiveCompetitionsTable)
        .where(notInArray(LiveCompetitionsTable.id, liveIds));

      if (staleCompetitions.length === 0) {
        return;
      }

      const staleIds = staleCompetitions.map(c => c.id);
      const staleOlCompetitionIds = staleCompetitions.map(
        c => c.olCompetitionId,
      );

      logger.info(
        `Purging ${staleIds.length} stale live competition(s): [${staleIds.join(', ')}]`,
      );

      // Fetch all liveClassIds belonging to the stale competitions.
      const staleClasses = await db
        .select({ liveClassId: LiveClassesTable.liveClassId })
        .from(LiveClassesTable)
        .where(inArray(LiveClassesTable.liveCompetitionId, staleIds));

      const staleClassIds = staleClasses.map(c => c.liveClassId);

      // Delete results → classes → competitions in dependency order.
      if (staleClassIds.length > 0) {
        await db
          .delete(LiveResultsTable)
          .where(inArray(LiveResultsTable.liveClassId, staleClassIds));

        await db
          .delete(LiveClassesTable)
          .where(inArray(LiveClassesTable.liveCompetitionId, staleIds));
      }

      await db
        .delete(LiveCompetitionsTable)
        .where(inArray(LiveCompetitionsTable.id, staleIds));

      // Remove the ol_competitions slug only if no other live_competitions row still
      // references it (e.g. a same-named Eventor-linked competition).
      const remainingRefs = await db
        .select({ olCompetitionId: LiveCompetitionsTable.olCompetitionId })
        .from(LiveCompetitionsTable)
        .where(
          inArray(LiveCompetitionsTable.olCompetitionId, staleOlCompetitionIds),
        );

      const stillReferenced = new Set(
        remainingRefs.map(r => r.olCompetitionId),
      );
      const orphanedOlIds = staleOlCompetitionIds.filter(
        id => !stillReferenced.has(id),
      );

      if (orphanedOlIds.length > 0) {
        await db
          .delete(OLCompetitionsTable)
          .where(inArray(OLCompetitionsTable.id, orphanedOlIds));
      }

      logger.info(
        `Purge complete — removed ${staleIds.length} competition(s), ${staleClassIds.length} class(es), and ${orphanedOlIds.length} ol_competition slug(s)`,
      );
    } catch (error) {
      logger.error(`Error purging stale live competitions: ${error}`);
    }
  }

  private async dispatchCompetitionSync(
    competitions: LiveresultatApi.getcompetitioninfo[],
  ) {
    const start = this.startDate
      ? parse(this.startDate, 'yyyy-MM-dd', new Date())
      : new Date();
    const end = this.endDate
      ? parse(this.endDate, 'yyyy-MM-dd', new Date())
      : addDays(start, 1);

    competitions.forEach(competition => {
      const parsedDate = this.parseDate(competition.date);

      if (
        !parsedDate ||
        isAfter(parsedDate, end) ||
        isAfter(start, parsedDate)
      ) {
        return;
      }

      this.api.Queue.RegularQueue.addJob({
        name: 'sync-live-competition',
        data: {
          competitionId: competition.id,
        },
      });
    });
  }

  private parseDate(dateString: string): Date | null {
    if (!dateString) return null;
    try {
      const date = parse(dateString, 'yyyy-MM-dd', new Date());
      return isValid(date) ? date : null;
    } catch {
      return null;
    }
  }
}
