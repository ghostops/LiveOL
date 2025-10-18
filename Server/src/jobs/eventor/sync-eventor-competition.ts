import { eq } from 'drizzle-orm';
import {
  EventorCompetitionsTable,
  OLCompetitionsTable,
  OLOrganizationsTable,
} from 'lib/db/schema';
import { APIResponse, apiSingletons } from 'lib/singletons';
import { isAfter } from 'date-fns';
import { CompetitionId, OrganizationId } from 'lib/match/generateIds';
import {
  EventorCompetition,
  EventorCompetitionScraper,
} from 'lib/eventor/scrapers/competition';
import logger from 'lib/logger';

export class SyncEventorCompetition {
  private api: APIResponse;
  private scraper: EventorCompetitionScraper;

  constructor(
    private eventorId: string,
    private countryCode: string,
  ) {
    if (!eventorId) {
      throw new Error('Eventor ID is required');
    }
    if (!countryCode) {
      throw new Error('Country code is required');
    }

    this.api = apiSingletons.createApiSingletons();
    this.scraper = new EventorCompetitionScraper(
      this.countryCode,
      this.eventorId,
    );
  }

  async run() {
    try {
      const data = await this.scraper.fetchCompetition();

      await this.insertEventorCompetition(data);

      logger.info(`Eventor competition ${data.id} synced successfully.`);
    } catch (error) {
      console.error('Error syncing eventor competition:', error);
    }
  }

  private async insertEventorCompetition(event: EventorCompetition) {
    const body: Omit<
      typeof EventorCompetitionsTable.$inferInsert,
      'eventorId' | 'countryCode'
    > = {
      name: event.name,
      organizer: event.club,
      notification: event.info,
      links: event.links,
      olOrganizationId: new OrganizationId().generateId({
        organizationName: event.club,
      }),
      additionalOlOrganizationIds:
        event.clubs && event.clubs.length > 1
          ? event.clubs
              .split(',')
              .filter(club => club !== event.club)
              .map(club =>
                new OrganizationId().generateId({
                  organizationName: club.trim(),
                }),
              )
          : undefined,
      olCompetitionId: new CompetitionId().generateId({
        competitionName: event.name,
        organizationName: event.club,
      }),
      dateString: event.date,
      punchSystem: event.punchSystem,
      lat: event.lat,
      lng: event.lng,
      distance: event.distance,
      status: undefined,
    };

    const [existing] = await this.api.Drizzle.db
      .select()
      .from(EventorCompetitionsTable)
      .where(eq(EventorCompetitionsTable.eventorId, event.id))
      .limit(1);

    const [createdOrUpdated] = existing
      ? await this.api.Drizzle.db
          .update(EventorCompetitionsTable)
          .set(body)
          .where(eq(EventorCompetitionsTable.eventorId, event.id))
          .returning({
            id: EventorCompetitionsTable.id,
            date: EventorCompetitionsTable.date,
          })
      : await this.api.Drizzle.db
          .insert(EventorCompetitionsTable)
          .values({
            eventorId: event.id,
            countryCode: this.countryCode,
            ...body,
          })
          .returning({
            id: EventorCompetitionsTable.id,
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

    await this.dispatchOtherDataSyncs(createdOrUpdated);
  }

  private dispatchOtherDataSyncs(
    event?:
      | {
          id: number;
          date?: Date | null;
        }
      | { id: number },
  ) {
    if (!event) {
      return Promise.resolve();
    }

    const syncs = [];

    syncs.push(
      this.api.Queue.addJob({
        name: 'sync-eventor-signups',
        data: {
          eventorDatabaseId: event.id,
        },
      }),
    );

    if ('date' in event && event.date && isAfter(new Date(), event.date)) {
      syncs.push(
        this.api.Queue.addJob({
          name: 'sync-eventor-results',
          data: {
            eventorDatabaseId: event.id,
          },
        }),
      );
    }

    return Promise.all(syncs);
  }
}
