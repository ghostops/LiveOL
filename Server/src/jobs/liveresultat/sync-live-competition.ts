import { eq } from 'drizzle-orm';
import {
  LiveClassesTable,
  LiveCompetitionsTable,
  OLCompetitionsTable,
  OLOrganizationsTable,
} from 'lib/db/schema';
import type { LiveresultatApi } from 'lib/liveresultat/types';
import { APIResponse, apiSingletons } from 'lib/singletons';
import { CompetitionId, OrganizationId } from 'lib/match/generateIds';
import logger from 'lib/logger';
import { getUtcDate } from 'lib/helpers/time';

export class SyncLiveCompetitionJob {
  private api: APIResponse;

  constructor(
    private competitionId: number,
    private classesOnly: boolean = false,
  ) {
    if (!competitionId) {
      throw new Error('Competition ID is required');
    }
    this.api = apiSingletons.createApiSingletons();
  }

  async run() {
    try {
      if (!this.classesOnly) {
        const competition = await this.api.Liveresultat.getcompetitioninfo(
          this.competitionId,
        );

        await this.insertLiveCompetition(competition);

        logger.info(
          `Competition ${competition.name} (${this.competitionId}) synced successfully.`,
        );
      }

      let classes: string[] = [];
      const classesResponse = await this.api.Liveresultat.getclasses(
        this.competitionId,
      );

      // If classesResponse is null we still want to sync the results of the classes
      if (classesResponse) {
        classes = classesResponse.classes.map(c => c.className);
      } else {
        const storedClasses = await this.api.Drizzle.db
          .select()
          .from(LiveClassesTable)
          .where(eq(LiveClassesTable.liveCompetitionId, this.competitionId));

        classes = storedClasses.map(c => c.name);
      }

      if (classes.length > 0) {
        await this.dispatchSyncClasses(classes);
      }
    } catch (error) {
      logger.error(`Error syncing competition: ${error} ${this.competitionId}`);
    }
  }

  private async dispatchSyncClasses(classes: string[]) {
    for (const className of classes) {
      await this.api.Queue.FastQueue.addJob({
        name: 'sync-live-class',
        data: {
          competitionId: this.competitionId,
          className,
        },
      });
    }
  }

  private async insertLiveCompetition(
    competition: LiveresultatApi.getcompetitioninfo,
  ) {
    const date = getUtcDate(competition.date, competition.timediff);
    const body: typeof LiveCompetitionsTable.$inferInsert = {
      id: competition.id,
      name: competition.name,
      organizer: competition.organizer,
      date,
      isPublic: true,
      updatedAt: new Date(),
      olCompetitionId: new CompetitionId().generateId({
        competitionName: competition.name,
        organizationName: competition.organizer,
        date,
      }),
      olOrganizationId: new OrganizationId().generateId({
        organizationName: competition.organizer,
      }),
    };

    await this.api.Drizzle.db
      .insert(LiveCompetitionsTable)
      .values(body)
      .onConflictDoUpdate({
        target: [LiveCompetitionsTable.id],
        set: {
          updatedAt: new Date(),
        },
      });

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
}
