import { eq } from 'drizzle-orm';
import { LiveCompetitionsTable, OLCompetitionsTable } from 'lib/db/schema';
import type { LiveresultatApi } from 'lib/liveresultat/types';
import { APIResponse, apiSingletons } from 'lib/singletons';
import { SyncClassJob } from './sync-class';
import { parse } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';

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

      await this.insertLiveCompetition(competition);
      await this.createOLCompetitionIfNotExists(competition);

      const classes = await this.api.Liveresultat.getclasses(
        this.competitionId,
      );

      await this.dispatchSyncClasses(classes);
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

  private createOLCompetitionIfNotExists(
    competition: LiveresultatApi.competition,
  ) {
    // ToDo:
    // Check for EventorCompetitions and try to match them!
    return this.api.Drizzle.db
      .insert(OLCompetitionsTable)
      .values({
        liveId: competition.id,
      })
      .onConflictDoNothing();
  }

  private async insertLiveCompetition(
    competition: LiveresultatApi.competition,
  ) {
    const body = {
      name: competition.name,
      organizer: competition.organizer,
      date: this.parseDateToUtc(competition.date, competition.timediff),
      isPublic: true,
      updatedAt: new Date(),
    };

    const [existing] = await this.api.Drizzle.db
      .select()
      .from(LiveCompetitionsTable)
      .where(eq(LiveCompetitionsTable.id, competition.id))
      .limit(1);

    existing
      ? await this.api.Drizzle.db
          .update(LiveCompetitionsTable)
          .set(body)
          .where(eq(LiveCompetitionsTable.id, competition.id))
      : await this.api.Drizzle.db
          .insert(LiveCompetitionsTable)
          .values({ id: competition.id, ...body });
  }

  parseDateToUtc(dateString: string, timediff?: number) {
    const format = 'yyyy-MM-dd';
    const parsed = parse(dateString, format, new Date());
    if (timediff && timediff > 0) {
      parsed.setHours(parsed.getHours() + timediff);
    }
    if (timediff && timediff < 0) {
      parsed.setHours(parsed.getHours() - timediff);
    }

    const utcDate = fromZonedTime(parsed, 'Europe/Stockholm');

    return utcDate;
  }
}
