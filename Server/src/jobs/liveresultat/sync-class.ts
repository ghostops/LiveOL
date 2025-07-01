import { eq } from 'drizzle-orm';
import { classTable, competitionTable } from 'lib/db/schema';
import type { LiveresultatApi } from 'lib/liveresultat/types';
import { APIResponse, apiSingletons } from 'lib/singletons';

export class SyncCompetitionJob {
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
      console.error('Error syncing competitions:', error);
    }
  }

  private async insertClass(classResults: LiveresultatApi.getclassresults) {
    const existing = await this.api.Drizzle.db
      .select()
      .from(classTable)
      .where(eq(competitionTable.id, classResults.))
      .limit(1);

    const body = {
      name: competition.name,
      organizer: competition.organizer,
      dateString: competition.date,
      date: this.parseDate(competition.date),
      timediff: String(competition.timediff),
      timezone: '',
      isPublic: 1,
    };

    if (existing.length === 0) {
      await this.api.Drizzle.db.insert(competitionTable).values({
        id: competition.id,
        ...body,
      });
    } else {
      await this.api.Drizzle.db
        .update(competitionTable)
        .set(body)
        .where(eq(competitionTable.id, competition.id));
    }
  }

  parseDate(dateString: string): string | null {
    try {
      return new Date(dateString + 'T00:00:00Z').toISOString();
    } catch {
      return null;
    }
  }

}
