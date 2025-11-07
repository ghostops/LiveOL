import { eq, and } from 'drizzle-orm';
import {
  LiveClassesTable,
  LiveResultsTable,
  LiveSplitControllsTable,
  LiveSplitResultsTable,
  OLOrganizationsTable,
  OLRunnersTable,
} from 'lib/db/schema';
import type { LiveresultatApi } from 'lib/liveresultat/types';
import { APIResponse, apiSingletons } from 'lib/singletons';
import crypto from 'crypto';
import { OrganizationId, RunnerId } from 'lib/match/generateIds';
import logger from 'lib/logger';

export class SyncLiveClassJob {
  private api: APIResponse;

  constructor(
    private competitionId: number,
    private className: string,
  ) {
    if (!competitionId) {
      throw new Error('Competition ID is required');
    }
    if (!className) {
      throw new Error('Class name is required');
    }
    this.api = apiSingletons.createApiSingletons();
  }

  async run() {
    try {
      const results = await this.api.Liveresultat.getclassresults(
        this.competitionId,
        this.className,
      );

      const id = await this.insertClass(this.competitionId, results);
      await this.insertSplitControls(id, results);
      await this.insertResults(id, results);

      logger.info(
        `Class ${this.className} (${this.competitionId}) synced successfully.`,
      );
    } catch (error) {
      logger.error(`Error syncing class: ${error}`);
    }
  }

  // The "hashedClassId" contains the competition ID so it will be unique
  private async insertResults(
    hashedClassId: string,
    classResults: LiveresultatApi.getclassresults,
  ) {
    for (const result of classResults.results) {
      const resultCompositeId = `${hashedClassId}:${result.name.replace(/ /g, '_')}:${result.club?.replace(/ /g, '_')}`;
      const hashedResultId = crypto
        .createHash('md5')
        .update(resultCompositeId)
        .digest('hex');

      const [existing] = await this.api.Drizzle.db
        .select()
        .from(LiveResultsTable)
        .where(
          and(
            eq(LiveResultsTable.liveClassId, hashedClassId),
            eq(LiveResultsTable.liveResultId, hashedResultId),
          ),
        )
        .limit(1);

      const isEmpty = (value: unknown): boolean => {
        if (value === null || value === undefined) {
          return true;
        }
        if (typeof value === 'string' && value.trim() === '') {
          return true;
        }
        return false;
      };

      const body: Omit<
        typeof LiveResultsTable.$inferInsert,
        'liveClassId' | 'liveResultId' | 'liveCompetitionId'
      > = {
        name: result.name,
        organization: result.club,
        result: this.parseResultNumber(result.result),
        timeplus: this.parseResultNumber(result.timeplus),
        progress: !isEmpty(result.progress) ? Math.round(result.progress) : 0,
        place: result.place ? String(result.place) : null,
        status: !isEmpty(result.status) ? result.status : null,
        start: this.parseResultNumber(result.start),
        updatedAt: new Date(),

        olRunnerId: new RunnerId().generateId({
          className: classResults.className,
          fullName: result.name,
          organizationName: result.club,
        }),
        olOrganizationId: new OrganizationId().generateId({
          organizationName: result.club,
        }),
      };

      if (!existing) {
        await this.api.Drizzle.db.insert(LiveResultsTable).values({
          ...body,
          liveClassId: hashedClassId,
          liveResultId: hashedResultId,
          liveCompetitionId: this.competitionId,
        });
      } else {
        await this.api.Drizzle.db
          .update(LiveResultsTable)
          .set(body)
          .where(
            and(
              eq(LiveResultsTable.liveClassId, hashedClassId),
              eq(LiveResultsTable.liveResultId, hashedResultId),
            ),
          );
      }

      await this.api.Drizzle.db
        .insert(OLOrganizationsTable)
        .values({
          id: body.olOrganizationId,
        })
        .onConflictDoNothing();

      await this.api.Drizzle.db
        .insert(OLRunnersTable)
        .values({
          id: body.olRunnerId,
        })
        .onConflictDoNothing();

      await this.insertSplitResults(hashedResultId, result);
    }
  }

  private parseResultNumber(value: unknown): number | null {
    let numberOrNull: number | null = null;
    if (value === null || value === undefined) {
      numberOrNull = null;
    }
    if (typeof value === 'number') {
      numberOrNull = value;
    }
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      numberOrNull = isNaN(parsed) ? null : parsed;
    }
    // Ignore all 0s or negative values as those can't be real
    if (typeof numberOrNull === 'number' && numberOrNull < 1) {
      numberOrNull = null;
    }
    return numberOrNull;
  }

  private async insertSplitResults(
    liveResultId: string,
    result: LiveresultatApi.result,
  ) {
    if (!result.splits) {
      return;
    }
    const splits = Object.entries(result.splits).reduce(
      (root, [key, value]) => {
        const keyWithoutUnderscore = key.includes('_')
          ? key.split('_')[0]!
          : key;

        const isNotTime =
          key.endsWith('status') ||
          key.endsWith('timeplus') ||
          key.endsWith('place');

        const obj: ParsedSplit = root[keyWithoutUnderscore] || {};
        if (obj.code === undefined) {
          obj.code = keyWithoutUnderscore;
        }
        if (obj.time === undefined && isNotTime === false) {
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

        return Object.assign(root, {
          [keyWithoutUnderscore]: obj,
        });
      },
      {} as Record<string, ParsedSplit>,
    );
    for (const split of Object.values(splits)) {
      const [existing] = await this.api.Drizzle.db
        .select()
        .from(LiveSplitResultsTable)
        .where(
          and(
            eq(LiveSplitResultsTable.liveResultId, liveResultId),
            eq(LiveSplitResultsTable.code, String(split.code)),
          ),
        )
        .limit(1);

      const body = {
        ...split,
        updatedAt: new Date(),
      };

      if (!existing) {
        await this.api.Drizzle.db.insert(LiveSplitResultsTable).values({
          ...body,
          liveResultId,
        });
      } else {
        await this.api.Drizzle.db
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

  private async insertSplitControls(
    classId: string,
    classResults: LiveresultatApi.getclassresults,
  ) {
    for (const split of classResults.splitcontrols) {
      const [existing] = await this.api.Drizzle.db
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
        updatedAt: new Date(),
      };

      if (!existing) {
        await this.api.Drizzle.db.insert(LiveSplitControllsTable).values({
          ...body,
          liveClassId: classId,
        });
      } else {
        const hasChanged = existing?.name !== split.name;
        if (!hasChanged) continue;

        await this.api.Drizzle.db
          .update(LiveSplitControllsTable)
          .set(body)
          .where(
            and(
              eq(LiveSplitControllsTable.liveClassId, classId),
              eq(LiveSplitControllsTable.code, String(split.code)),
            ),
          );
      }
    }
  }

  private async insertClass(
    competitionId: number,
    classResults: LiveresultatApi.getclassresults,
  ) {
    const hashedClassId = crypto
      .createHash('md5')
      .update(`${competitionId}${encodeURIComponent(classResults.className)}`)
      .digest('hex');

    const [existing] = await this.api.Drizzle.db
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
      await this.api.Drizzle.db.insert(LiveClassesTable).values({
        liveClassId: hashedClassId,
        ...body,
      });
    } else {
      await this.api.Drizzle.db
        .update(LiveClassesTable)
        .set(body)
        .where(eq(LiveClassesTable.liveClassId, hashedClassId));
    }

    return hashedClassId;
  }
}

type ParsedSplit = {
  code?: string;
  status?: number;
  time?: number;
  place?: number;
  timeplus?: number;
};
