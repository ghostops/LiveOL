import { startOfDay, endOfDay, subHours, addHours } from 'date-fns';
import { and, eq, gte, lte } from 'drizzle-orm';
import { LiveClassesTable, LiveCompetitionsTable } from 'lib/db/schema';
import type { LiveresultatApi } from 'lib/liveresultat/types';
import {
  getHttp2Client,
  LiveresultatHttp2Client,
} from 'lib/liveresultat/http2-client';
import logger from 'lib/logger';
import { APIResponse, apiSingletons } from 'lib/singletons';
import { LiveClassWriter } from './live-class-writer';
import pLimit from 'p-limit';

const LIMIT_FETCH_CLASSES = pLimit(10);
const LIMIT_FETCH_RESULTS = pLimit(10);
const LIMIT_DB_WRITES = pLimit(15);

export class SyncActiveLiveCompetitionsJob {
  private api: APIResponse;
  private http2: LiveresultatHttp2Client;
  private writer: LiveClassWriter;

  constructor() {
    this.api = apiSingletons.createApiSingletons();
    this.http2 = getHttp2Client(this.api.Redis);
    this.writer = new LiveClassWriter(this.api.Drizzle.db);
  }

  async run() {
    try {
      const start = subHours(startOfDay(new Date()), 12);
      const end = addHours(endOfDay(new Date()), 12);

      const activeCompetitions = await this.api.Drizzle.db
        .select()
        .from(LiveCompetitionsTable)
        .where(
          and(
            gte(LiveCompetitionsTable.date, start),
            lte(LiveCompetitionsTable.date, end),
          ),
        );

      if (activeCompetitions.length === 0) {
        return;
      }

      const classResults = await Promise.allSettled(
        activeCompetitions.map(competition =>
          LIMIT_FETCH_CLASSES(async () => {
            const fetched = await this.http2.getclasses(competition.id);

            // NOT MODIFIED — fall back to stored classes from DB
            if (!fetched) {
              const stored = await this.api.Drizzle.db
                .select()
                .from(LiveClassesTable)
                .where(eq(LiveClassesTable.liveCompetitionId, competition.id));

              return {
                competitionId: competition.id,
                classes: stored.map(c => c.name),
              };
            }

            return {
              competitionId: competition.id,
              classes: fetched.classes.map(c => c.className),
            };
          }),
        ),
      );

      // Flatten to (competitionId, className) pairs, skipping failed competitions
      const pairs: Array<{ competitionId: number; className: string }> = [];
      let competitionFailures = 0;

      for (const result of classResults) {
        if (result.status === 'fulfilled') {
          for (const className of result.value.classes) {
            pairs.push({
              competitionId: result.value.competitionId,
              className,
            });
          }
        } else {
          competitionFailures++;
          logger.error(`Failed to fetch classes: ${result.reason}`);
        }
      }

      const resultFetches = await Promise.allSettled(
        pairs.map(pair =>
          LIMIT_FETCH_RESULTS(async () => {
            const data = await this.http2.getclassresults(
              pair.competitionId,
              pair.className,
            );
            return { competitionId: pair.competitionId, data };
          }),
        ),
      );

      // Collect non-null results (null = NOT MODIFIED, skip DB write)
      const toWrite: Array<{
        competitionId: number;
        data: LiveresultatApi.getclassresults;
      }> = [];
      let notModified = 0;
      let fetchFailures = 0;

      for (const result of resultFetches) {
        if (result.status === 'fulfilled') {
          if (result.value.data !== null) {
            toWrite.push({
              competitionId: result.value.competitionId,
              data: result.value.data,
            });
          } else {
            notModified++;
          }
        } else {
          fetchFailures++;
          logger.error(`Failed to fetch class results: ${result.reason}`);
        }
      }

      const writeResults = await Promise.allSettled(
        toWrite.map(item =>
          LIMIT_DB_WRITES(() =>
            this.writer.write(item.competitionId, item.data),
          ),
        ),
      );

      let writeFailures = 0;
      for (const result of writeResults) {
        if (result.status === 'rejected') {
          writeFailures++;
          const err = result.reason;
          const cause = err?.cause ?? err;
          logger.error(
            { err: cause },
            `Failed to sync class: ${cause?.message ?? err}`,
          );
        }
      }

      logger.info(
        `Synced ${activeCompetitions.length} competitions, ` +
          `${toWrite.length} classes updated, ` +
          `${notModified} skipped (NOT MODIFIED), ` +
          `${competitionFailures + fetchFailures + writeFailures} failed.`,
      );
    } catch (error) {
      logger.error(`Error syncing active competitions: ${error}`);
    }
  }
}
