import { eq, and } from 'drizzle-orm';
import { classTable, resultTable, splitControlTable } from 'lib/db/schema';
import type { LiveresultatApi } from 'lib/liveresultat/types';
import { APIResponse, apiSingletons } from 'lib/singletons';
import crypto from 'crypto';

export class SyncClassJob {
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

      console.log(`Synced ${results.className} successfully.`);
    } catch (error) {
      console.error('Error syncing class:', error);
    }
  }

  private async insertResults(
    classId: string,
    classResults: LiveresultatApi.getclassresults,
  ) {
    for (const result of classResults.results) {
      const resultCompositeId = `${classId}:${result.name.replace(/ /g, '_')}:${result.club?.replace(/ /g, '_')}`;
      const hashedResultId = crypto
        .createHash('md5')
        .update(resultCompositeId)
        .digest('hex');

      const existing = await this.api.Drizzle.db
        .select()
        .from(resultTable)
        .where(
          and(
            eq(resultTable.classId, classId),
            eq(resultTable.resultId, hashedResultId),
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

      const body = {
        name: result.name,
        club: result.club,
        result: !isEmpty(result.result) ? result.result : null,
        start: !isEmpty(result.start) ? result.start : null,
        status: !isEmpty(result.status) ? result.status : null,
        timeplus: !isEmpty(result.timeplus) ? result.timeplus : null,
        progress: !isEmpty(result.progress) ? result.progress : 0,
        splits: result.splits
          ? Object.fromEntries(
              Object.entries(result.splits).map(([k, v]) => [k, String(v)]),
            )
          : null,
      };

      if (existing.length === 0) {
        await this.api.Drizzle.db.insert(resultTable).values({
          ...body,
          classId,
          resultId: hashedResultId,
        });
      } else {
        await this.api.Drizzle.db
          .update(resultTable)
          .set(body)
          .where(
            and(
              eq(resultTable.classId, classId),
              eq(resultTable.resultId, hashedResultId),
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
      const existing = await this.api.Drizzle.db
        .select()
        .from(splitControlTable)
        .where(
          and(
            eq(splitControlTable.classId, classId),
            eq(splitControlTable.code, split.code),
          ),
        )
        .limit(1);

      const body = {
        name: split.name,
        code: split.code,
      };

      if (existing.length === 0) {
        await this.api.Drizzle.db.insert(splitControlTable).values({
          ...body,
          classId,
        });
      } else {
        const hasChanged = existing[0]?.name !== split.name;
        if (!hasChanged) continue;

        await this.api.Drizzle.db
          .update(splitControlTable)
          .set(body)
          .where(
            and(
              eq(splitControlTable.classId, classId),
              eq(splitControlTable.code, split.code),
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

    const existing = await this.api.Drizzle.db
      .select()
      .from(classTable)
      .where(eq(classTable.classId, hashedClassId))
      .limit(1);

    const body = {
      name: classResults.className,
      status: classResults.status,
      hash: classResults.hash,
      competitionId,
    };

    if (existing.length === 0) {
      await this.api.Drizzle.db.insert(classTable).values({
        classId: hashedClassId,
        ...body,
      });
    } else {
      const hasChanged = existing[0]?.hash !== classResults.hash;
      if (hasChanged) {
        await this.api.Drizzle.db
          .update(classTable)
          .set(body)
          .where(eq(classTable.classId, hashedClassId));
      }
    }

    return hashedClassId;
  }
}
