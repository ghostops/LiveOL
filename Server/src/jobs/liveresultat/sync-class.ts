import { eq } from 'drizzle-orm';
import { classTable } from 'lib/db/schema';
import type { LiveresultatApi } from 'lib/liveresultat/types';
import { APIResponse, apiSingletons } from 'lib/singletons';

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

      await this.insertClass(results);

      console.log(`Synced ${results.className} successfully.`);
    } catch (error) {
      console.error('Error syncing class:', error);
    }
  }

  private async insertClass(classResults: LiveresultatApi.getclassresults) {
    const hashedClassId = 'abc123';

    const existing = await this.api.Drizzle.db
      .select()
      .from(classTable)
      .where(eq(classTable.id, hashedClassId))
      .limit(1);

    const body = {
      name: classResults.className,
      status: classResults.status,
      hash: classResults.hash,
    };

    if (existing.length === 0) {
      await this.api.Drizzle.db.insert(classTable).values({
        id: hashedClassId,
        ...body,
      });
    } else {
      await this.api.Drizzle.db
        .update(classTable)
        .set(body)
        .where(eq(classTable.id, hashedClassId));
    }
  }
}
