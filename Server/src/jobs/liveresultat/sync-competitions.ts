import { eq } from 'drizzle-orm';
import { competitionTable } from 'lib/db/schema';
import type { LiveresultatApi } from 'lib/liveresultat/types';
import { APIResponse, apiSingletons } from 'lib/singletons';
import _ from 'lodash';

export class SyncCompetitionsJob {
  private api: APIResponse;

  constructor() {
    this.api = apiSingletons.createApiSingletons();
  }

  async run() {
    try {
      const { competitions } = await this.api.Liveresultat.getcompetitions();

      const batches = _.chunk(competitions, 50);

      await Promise.all(
        batches.map(batch => this.dispatchCompetitionSync(batch)),
      );

      console.log(`Synced ${competitions.length} competitions successfully.`);
    } catch (error) {
      console.error('Error syncing competitions:', error);
    }
  }

  private async dispatchCompetitionSync(
    competitions: LiveresultatApi.competition[],
  ) {
    competitions.forEach(competition => {
      this.api.Queue.addJob({
        name: 'sync-competition',
        data: {
          competitionId: competition.id,
        },
      });
    });
  }

  /**
   * Can be used instead of dispatching jobs if you want to insert directly
   */
  private async insertBatch(competitions: LiveresultatApi.competition[]) {
    for (const competition of competitions) {
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
  }

  parseDate(dateString: string): string | null {
    try {
      return new Date(dateString + 'T00:00:00Z').toISOString();
    } catch {
      return null;
    }
  }
}
