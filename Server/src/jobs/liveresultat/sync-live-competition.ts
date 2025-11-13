import { eq } from 'drizzle-orm';
import {
  LiveCompetitionsTable,
  OLCompetitionsTable,
  OLOrganizationsTable,
} from 'lib/db/schema';
import type { LiveresultatApi } from 'lib/liveresultat/types';
import { APIResponse, apiSingletons } from 'lib/singletons';
import { parse } from 'date-fns';
import { CompetitionId, OrganizationId } from 'lib/match/generateIds';
import logger from 'lib/logger';

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
      const competition = await this.api.Liveresultat.getcompetitioninfo(
        this.competitionId,
      );

      await this.insertLiveCompetition(competition);

      const classes = await this.api.Liveresultat.getclasses(
        this.competitionId,
      );

      // TODO: Sync results even if the classes have not changed
      if (classes) {
        await this.dispatchSyncClasses(classes);
      }

      logger.info(
        `Competition ${competition.name} (${this.competitionId}) synced successfully.`,
      );
    } catch (error) {
      logger.error(`Error syncing competition: ${error} ${this.competitionId}`);
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

  private async insertLiveCompetition(
    competition: LiveresultatApi.getcompetitioninfo,
  ) {
    const body: Omit<typeof LiveCompetitionsTable.$inferInsert, 'id'> = {
      name: competition.name,
      organizer: competition.organizer,
      date: this.parseDateToUtc(competition.date),
      isPublic: true,
      updatedAt: new Date(),
      olCompetitionId: new CompetitionId().generateId({
        competitionName: competition.name,
        organizationName: competition.organizer,
      }),
      olOrganizationId: new OrganizationId().generateId({
        organizationName: competition.organizer,
      }),
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

    await this.api.Drizzle.db
      .insert(OLCompetitionsTable)
      .values({
        id: body.olCompetitionId,
      })
      .onConflictDoNothing();

    await this.api.Drizzle.db
      .insert(OLOrganizationsTable)
      .values({
        id: body.olOrganizationId,
      })
      .onConflictDoNothing();
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
}
