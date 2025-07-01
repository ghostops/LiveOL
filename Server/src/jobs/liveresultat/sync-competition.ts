import { eq } from 'drizzle-orm';
import { competitionTable } from 'lib/db/schema';
import type { LiveresultatApi } from 'lib/liveresultat/types';
import { APIResponse, apiSingletons } from 'lib/singletons';
import { SyncClassJob } from './sync-class';

export class SyncCompetitionJob {
  private api: APIResponse;

  constructor(private competitionId: number) {
    if (!competitionId) {
      throw new Error('Competition ID is required');
    }
    this.api = apiSingletons.createApiSingletons();
  }

  async run() {
    try {
      const competition = await this.api.Liveresultat.getcompetition(
        this.competitionId,
      );

      await this.insertCompetition(competition);

      console.log(`Synced ${competition.id} successfully.`);

      const classes = await this.api.Liveresultat.getclasses(
        this.competitionId,
      );

      await this.dispatchSyncClasses(classes);

      console.log(
        `Synced classes for competition ${competition.id} successfully.`,
      );
    } catch (error) {
      console.error('Error syncing competitions:', error);
    }
  }

  private async dispatchSyncClasses(classes: LiveresultatApi.getclasses) {
    for (const classResult of classes.classes) {
      const job = new SyncClassJob(this.competitionId, classResult.className);
      await job.run();
    }
  }

  private async insertCompetition(competition: LiveresultatApi.competition) {
    const existing = await this.api.Drizzle.db
      .select()
      .from(competitionTable)
      .where(eq(competitionTable.id, competition.id))
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
