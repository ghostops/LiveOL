import { and, eq, inArray, isNull, notInArray, sql } from 'drizzle-orm';
import {
  LiveClassesTable,
  LiveCompetitionsTable,
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
import logger from 'lib/logger';
import type { PushEvent, PushNotifier } from 'lib/notifications/notifier';
import type { TrackedSubscriber } from 'lib/notifications/tracked-index';
import {
  DetectedChange,
  detectResultChanges,
  detectSplitChange,
} from 'lib/notifications/detect';

type Db = NodePgDatabase<Record<string, never>>;

type ResultBody = Omit<typeof LiveResultsTable.$inferInsert, 'id'>;

type TrackedResult = {
  subscribers: TrackedSubscriber[];
  /** Absent for results seen for the first time; those never notify */
  hasPrevious: boolean;
};

/**
 * Encapsulates all DB write logic for a single live class sync.
 * Shared between SyncLiveClassJob (per-class queue job) and
 * SyncActiveLiveCompetitionsJob (bulk in-process sync).
 */
export class LiveClassWriter {
  constructor(
    private readonly db: Db,
    private readonly notifier?: PushNotifier,
  ) {}

  async write(
    competitionId: number,
    classResults: LiveresultatApi.getclassresults,
  ): Promise<void> {
    // Liveresultat sometimes answers without a class name; there is nothing to store
    if (!classResults.className) {
      logger.warn(
        `Skipping class results without className (${competitionId}, status ${classResults.status})`,
      );
      return;
    }

    const hashedClassId = await this.insertClass(competitionId, classResults);
    await this.insertSplitControls(hashedClassId, classResults);
    const events = await this.insertResults(
      hashedClassId,
      competitionId,
      classResults,
    );

    if (this.notifier && events.length > 0) {
      // Notifications must never break result syncing
      await this.notifier.dispatch(events).catch(error => {
        logger.error(`Push: failed to dispatch events: ${error}`);
      });
    }
  }

  /**
   * Finds the results in this class that someone wants notifications for, and
   * whether we have seen them before. Only these get diffed.
   */
  private async findTrackedResults(
    parsedResults: { body: ResultBody }[],
  ): Promise<Map<string, TrackedResult & { previous?: ResultBody }>> {
    const tracked = new Map<
      string,
      TrackedResult & { previous?: ResultBody }
    >();
    if (!this.notifier) return tracked;

    const index = await this.notifier.getIndex();
    for (const { body } of parsedResults) {
      const subscribers = this.notifier.subscribersFor(index, body.olRunnerId);
      if (subscribers?.length) {
        tracked.set(body.liveResultId, { subscribers, hasPrevious: false });
      }
    }

    if (tracked.size === 0) return tracked;

    const previousRows = await this.db
      .select()
      .from(LiveResultsTable)
      .where(inArray(LiveResultsTable.liveResultId, [...tracked.keys()]));

    for (const row of previousRows) {
      const entry = tracked.get(row.liveResultId);
      if (entry) {
        entry.hasPrevious = true;
        entry.previous = row;
      }
    }

    return tracked;
  }

  private toEvent(
    change: DetectedChange,
    body: ResultBody,
    className: string,
    subscribers: TrackedSubscriber[],
  ): PushEvent {
    return {
      type: change.type,
      key: change.key,
      liveResultId: body.liveResultId,
      liveCompetitionId: body.liveCompetitionId,
      liveClassId: body.liveClassId,
      className,
      runnerName: body.name,
      club: body.organization ?? null,
      result: body.result ?? null,
      place: body.place ?? null,
      status: body.status ?? null,
      subscribers,
    };
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
      // Only on a new class, so ordinary result writes don't touch the row
      await this.db
        .update(LiveCompetitionsTable)
        .set({ hasClasses: true })
        .where(
          and(
            eq(LiveCompetitionsTable.id, competitionId),
            eq(LiveCompetitionsTable.hasClasses, false),
          ),
        );
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
  ): Promise<PushEvent[]> {
    const firstPass = classResults.results
      .map(result => {
        const compositeId = [
          hashedClassId,
          (result.name ?? '').trim().replace(/ /g, '_'),
          (result.club ?? '').trim().replace(/ /g, '_'),
        ].join(':');
        return { result, compositeId };
      })
      .sort((a, b) => (a.result.start ?? 0) - (b.result.start ?? 0));

    const seenCounts = new Map<string, number>();

    const parsedResults = firstPass.map(({ result, compositeId }) => {
      const seen = seenCounts.get(compositeId) ?? 0;
      seenCounts.set(compositeId, seen + 1);

      const finalCompositeId =
        seen === 0
          ? compositeId
          : `${compositeId}:${result.start ?? ''}:${seen}`;

      const hashedResultId = crypto
        .createHash('md5')
        .update(finalCompositeId)
        .digest('hex');

      const body: ResultBody = {
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
      return [];
    }

    const events: PushEvent[] = [];
    const tracked = await this.findTrackedResults(parsedResults).catch(
      error => {
        logger.error(`Push: failed to load tracked results: ${error}`);
        return new Map<string, TrackedResult & { previous?: ResultBody }>();
      },
    );

    for (const { body } of parsedResults) {
      const entry = tracked.get(body.liveResultId);
      if (!entry?.previous) continue;
      const prev = entry.previous;
      const changes = detectResultChanges(
        {
          result: prev.result ?? null,
          status: prev.status ?? null,
          place: prev.place ?? null,
          progress: prev.progress ?? null,
        },
        {
          result: body.result ?? null,
          status: body.status ?? null,
          place: body.place ?? null,
          progress: body.progress ?? null,
        },
      );
      for (const change of changes) {
        events.push(
          this.toEvent(change, body, classResults.className, entry.subscribers),
        );
      }
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

    const splitNames = new Map(
      classResults.splitcontrols.map(s => [String(s.code), s.name]),
    );

    for (const result of parsedResults) {
      const entry = tracked.get(result.body.liveResultId);
      const splitChanges = await this.insertSplitResults(
        result.body.liveResultId,
        result.splits,
        Boolean(entry?.hasPrevious),
      );
      if (!entry) continue;
      for (const { change, split } of splitChanges) {
        events.push({
          ...this.toEvent(
            change,
            result.body,
            classResults.className,
            entry.subscribers,
          ),
          splitName: splitNames.get(split.code) ?? split.code,
          splitTime: split.time ?? null,
          splitPlace: split.place ?? null,
        });
      }
    }

    return events;
  }

  private async insertSplitResults(
    liveResultId: string,
    originalSplits: LiveresultatApi.result['splits'] | undefined,
    detectChanges: boolean,
  ): Promise<{ change: DetectedChange; split: ParsedSplit }[]> {
    const changes: { change: DetectedChange; split: ParsedSplit }[] = [];
    if (!originalSplits) return changes;

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

      if (detectChanges) {
        const change = detectSplitChange(split.code, existing, split);
        if (change) changes.push({ change, split });
      }

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

    return changes;
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
