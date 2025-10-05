import { eq } from 'drizzle-orm';
import { LiveCompetitionsTable } from 'lib/db/schema';
import type { LiveresultatApi } from 'lib/liveresultat/types';
import { APIResponse, apiSingletons } from 'lib/singletons';
import { parse } from 'date-fns';

export class SyncLiveCompetitionJob {
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
      await this.dispatchMatchEventorAndLive(competition);

      const classes = await this.api.Liveresultat.getclasses(
        this.competitionId,
      );

      await this.dispatchSyncClasses(classes);

      console.log(
        `Competition ${competition.name} (${this.competitionId}) synced successfully.`,
      );
    } catch (error) {
      console.error('Error syncing competitions:', error);
    }
  }

  private async dispatchSyncClasses(classes: LiveresultatApi.getclasses) {
    for (const classResult of classes.classes) {
      await this.api.Queue.addJob({
        name: 'sync-live-class',
        data: {
          competitionId: this.competitionId,
          className: classResult.className,
        },
      });
    }
  }

  private dispatchMatchEventorAndLive(
    competition: LiveresultatApi.competition,
  ) {
    return this.api.Queue.addJob({
      name: 'match-eventor-and-live',
      data: {
        liveId: competition.id,
      },
    });
  }

  private async insertLiveCompetition(
    competition: LiveresultatApi.competition,
  ) {
    const body = {
      name: competition.name,
      organizer: competition.organizer,
      date: this.parseDateToUtc(competition.date),
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

    await this.dispatchSyncOrganizer();
  }

  parseDateToUtc(dateString: string) {
    const format = 'yyyy-MM-dd';
    const parsed = parse(dateString, format, new Date());
    // Timediff has nothing to do with the date, just the time of the runners!
    // if (timediff && timediff > 0) {
    //   parsed.setHours(parsed.getHours() + timediff);
    // }
    // if (timediff && timediff < 0) {
    //   parsed.setHours(parsed.getHours() - timediff);
    // }

    // Neither do this, it gives wrong results
    // const utcDate = fromZonedTime(parsed, 'Europe/Stockholm');

    // The date given IS universal, so just return it as is.
    return parsed;
  }

  private dispatchSyncOrganizer() {
    return this.api.Queue.addJob({
      name: 'match-live-and-organizer',
      data: {
        competitionId: this.competitionId,
      },
    });
  }
}
