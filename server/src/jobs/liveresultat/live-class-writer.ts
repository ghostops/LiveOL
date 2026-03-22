import { and, eq, isNull, notInArray, sql } from 'drizzle-orm';
import {
  LiveClassesTable,
  LiveResultsTable,
  LiveSplitControllsTable,
  LiveSplitResultsTable,
  OLOrganizationsTable,
  OLRunnersTable,
} from 'lib/db/schema';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { LiveresultatApi } from 'lib/liveresultat/types';
import { OrganizationId, RunnerId } from 'lib/match/generateIds';
import crypto from 'crypto';

type Db = NodePgDatabase<Record<string, never>>;

/**
 * Encapsulates all DB write logic for a single live class sync.
 * Shared between SyncLiveClassJob (per-class queue job) and
 * SyncActiveLiveCompetitionsJob (bulk in-process sync).
 */
export class LiveClassWriter {
  constructor(private readonly db: Db) {}

  async write(
    competitionId: number,
    classResults: LiveresultatApi.getclassresults,
  ): Promise<void> {
    const hashedClassId = await this.insertClass(competitionId, classResults);
    await this.insertSplitControls(hashedClassId, classResults);
    await this.insertResults(hashedClassId, competitionId, classResults);
  }

  private async insertClass(
    competitionId: number,
    classResults: LiveresultatApi.getclassresults,
  ): Promise<string> {
    const hashedClassId = crypto
      .createHash('md5')
      .update(`${competitionId}${encodeURIComponent(classResults.className)}`)
      .digest('hex');

    const [existing] = await this.db
      .select()
      .from(LiveClassesTable)
      .where(eq(LiveClassesTable.liveClassId, hashedClassId))
      .limit(1);

    const body: Omit<typeof LiveClassesTable.$inferInsert, 'liveClassId'> = {
      name: classResults.className,
      status: classResults.status,
      liveCompetitionId: competitionId,
      updatedAt: new Date(),
    };

    if (!existing) {
      await this.db.insert(LiveClassesTable).values({
        liveClassId: hashedClassId,
        ...body,
      });
    } else {
      await this.db
        .update(LiveClassesTable)
        .set(body)
        .where(eq(LiveClassesTable.liveClassId, hashedClassId));
    }

    return hashedClassId;
  }

  private async insertSplitControls(
    classId: string,
    classResults: LiveresultatApi.getclassresults,
  ): Promise<void> {
    let order = 0;
    for (const split of classResults.splitcontrols) {
      const [existing] = await this.db
        .select()
        .from(LiveSplitControllsTable)
        .where(
          and(
            eq(LiveSplitControllsTable.liveClassId, classId),
            eq(LiveSplitControllsTable.code, String(split.code)),
          ),
        )
        .limit(1);

      const body = {
        name: split.name,
        code: String(split.code),
        order,
        updatedAt: new Date(),
      };

      if (!existing) {
        await this.db.insert(LiveSplitControllsTable).values({
          ...body,
          liveClassId: classId,
        });
      } else {
        const hasChanged =
          existing.name !== split.name || existing.order !== order;
        if (!hasChanged) {
          order += 1;
          continue;
        }
        await this.db
          .update(LiveSplitControllsTable)
          .set(body)
          .where(
            and(
              eq(LiveSplitControllsTable.liveClassId, classId),
              eq(LiveSplitControllsTable.code, String(split.code)),
            ),
          );
      }

      order += 1;
    }
  }

  private async insertResults(
    hashedClassId: string,
    competitionId: number,
    classResults: LiveresultatApi.getclassresults,
  ): Promise<void> {
    // First pass: compute hashes without start time (stable IDs for the common case)
    const firstPass = classResults.results.map(result => {
      const compositeId = [
        hashedClassId,
        result.name.replace(/ /g, '_'),
        result.club?.replace(/ /g, '_'),
        result.place.replace(/ /g, '_') ?? '',
      ].join(':');
      return { result, compositeId };
    });

    // Detect which base compositeIds are shared by more than one runner
    const idCounts = new Map<string, number>();
    for (const { compositeId } of firstPass) {
      idCounts.set(compositeId, (idCounts.get(compositeId) ?? 0) + 1);
    }

    const parsedResults = firstPass.map(({ result, compositeId }) => {
      // If this compositeId is a collision, disambiguate using start time
      const finalCompositeId =
        (idCounts.get(compositeId) ?? 1) > 1
          ? `${compositeId}:${result.start ?? ''}`
          : compositeId;

      const hashedResultId = crypto
        .createHash('md5')
        .update(finalCompositeId)
        .digest('hex');

      const body: Omit<typeof LiveResultsTable.$inferInsert, 'id'> = {
        name: result.name,
        organization: result.club,
        result: parseResultNumber(result.result),
        timeplus: parseResultNumber(result.timeplus),
        progress: !isEmpty(result.progress) ? Math.round(result.progress) : 0,
        place: result.place ? String(result.place) : null,
        status: !isEmpty(result.status) ? result.status : null,
        start: parseResultNumber(result.start),
        updatedAt: new Date(),
        newResultAt:
          result.DT_RowClass && result.DT_RowClass.includes('new_result')
            ? new Date()
            : null,

        olRunnerId: new RunnerId().generateId({
          className: classResults.className,
          fullName: result.name,
          organizationName: result.club,
        }),
        olOrganizationId: new OrganizationId().generateId({
          organizationName: result.club,
        }),

        liveClassId: hashedClassId,
        liveResultId: hashedResultId,
        liveCompetitionId: competitionId,
      };

      return { body, splits: result.splits };
    });

    if (parsedResults.length === 0) {
      return;
    }

    await this.db
      .insert(LiveResultsTable)
      .values(parsedResults.map(r => r.body))
      .onConflictDoUpdate({
        target: [LiveResultsTable.liveResultId],
        set: {
          deletedAt: null,
          updatedAt: new Date(),
          name: sql`excluded.name`,
          organization: sql`excluded.organization`,
          result: sql`excluded.result`,
          timeplus: sql`excluded.timeplus`,
          progress: sql`excluded.progress`,
          place: sql`excluded.place`,
          status: sql`excluded.status`,
          start: sql`excluded.start`,
          newResultAt: sql`COALESCE(excluded."newResultAt", ${LiveResultsTable.newResultAt})`,
        },
      });

    await this.db
      .update(LiveResultsTable)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(LiveResultsTable.liveClassId, hashedClassId),
          notInArray(
            LiveResultsTable.liveResultId,
            parsedResults.map(r => r.body.liveResultId),
          ),
          isNull(LiveResultsTable.deletedAt),
        ),
      );

    await this.db
      .insert(OLOrganizationsTable)
      .values(parsedResults.map(r => ({ id: r.body.olOrganizationId })))
      .onConflictDoNothing();

    await this.db
      .insert(OLRunnersTable)
      .values(parsedResults.map(r => ({ id: r.body.olRunnerId })))
      .onConflictDoNothing();

    for (const result of parsedResults) {
      await this.insertSplitResults(result.body.liveResultId, result.splits);
    }
  }

  private async insertSplitResults(
    liveResultId: string,
    originalSplits: LiveresultatApi.result['splits'] | undefined,
  ): Promise<void> {
    if (!originalSplits) return;

    const splits = Object.entries(originalSplits).reduce(
      (root, [key, value]) => {
        const keyWithoutUnderscore = key.includes('_')
          ? key.split('_')[0]!
          : key;

        const isNotTime =
          key.endsWith('status') ||
          key.endsWith('timeplus') ||
          key.endsWith('place');

        const obj: Partial<ParsedSplit> = root[keyWithoutUnderscore] || {};
        if (obj.code === undefined) {
          obj.code = keyWithoutUnderscore;
        }
        if (obj.time === undefined && !isNotTime) {
          obj.time = typeof value === 'number' ? value : undefined;
        }
        if (obj.timeplus === undefined && key.endsWith('timeplus')) {
          obj.timeplus = typeof value === 'number' ? value : undefined;
        }
        if (obj.timeplus === undefined && key.endsWith('status')) {
          obj.status = typeof value === 'number' ? value : undefined;
        }
        if (obj.timeplus === undefined && key.endsWith('place')) {
          obj.place = typeof value === 'number' ? value : undefined;
        }

        return Object.assign(root, { [keyWithoutUnderscore]: obj });
      },
      {} as Record<string, ParsedSplit>,
    );

    for (const split of Object.values(splits)) {
      const [existing] = await this.db
        .select()
        .from(LiveSplitResultsTable)
        .where(
          and(
            eq(LiveSplitResultsTable.liveResultId, liveResultId),
            eq(LiveSplitResultsTable.code, String(split.code)),
          ),
        )
        .limit(1);

      const body = { ...split, updatedAt: new Date() };

      if (!existing) {
        await this.db
          .insert(LiveSplitResultsTable)
          .values({ ...body, liveResultId });
      } else {
        await this.db
          .update(LiveSplitResultsTable)
          .set(body)
          .where(
            and(
              eq(LiveSplitResultsTable.liveResultId, liveResultId),
              eq(LiveSplitResultsTable.code, String(split.code)),
            ),
          );
      }
    }
  }
}

type ParsedSplit = {
  code: string;
  status?: number;
  time?: number;
  place?: number;
  timeplus?: number;
};

export function parseResultNumber(value: unknown): number | null {
  let result: number | null = null;
  if (typeof value === 'number') {
    result = value;
  } else if (typeof value === 'string') {
    const parsed = parseFloat(value);
    result = isNaN(parsed) ? null : parsed;
  }
  // Treat 0 and negatives as invalid timing data
  if (typeof result === 'number' && result < 1) {
    result = null;
  }
  return result;
}

export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  return false;
}
