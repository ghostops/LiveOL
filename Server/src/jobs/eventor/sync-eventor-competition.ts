import { eq } from 'drizzle-orm';
import {
  EventorClassesTable,
  EventorCompetitionsTable,
  OLCompetitionsTable,
  OLOrganizationsTable,
} from 'lib/db/schema';
import { APIResponse, apiSingletons } from 'lib/singletons';
import { snakeCase } from 'lodash';
import { isAfter } from 'date-fns';
import { CompetitionId, OrganizationId } from 'lib/match/generateIds';
import {
  EventorCompetition,
  EventorCompetitionScraper,
} from 'lib/eventor/scrapers/competition';

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

      // ToDo: Reimplement or scrap?
      // for (const cls of data.ageClasses.concat(data.openClasses)) {
      //   await this.insertEventorClass(cls);
      // }

      console.log(`Eventor competition ${data.id} synced successfully.`);
    } catch (error) {
      console.error('Error syncing eventor competition:', error);
    }
  }

  private async insertEventorCompetition(event: EventorCompetition) {
    const body: Omit<
      typeof EventorCompetitionsTable.$inferInsert,
      'eventorId' | 'date'
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
      countryCode: this.countryCode,
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

    existing
      ? await this.api.Drizzle.db
          .update(EventorCompetitionsTable)
          .set(body)
          .where(eq(EventorCompetitionsTable.eventorId, event.id))
      : await this.api.Drizzle.db.insert(EventorCompetitionsTable).values({
          eventorId: event.id,
          ...body,
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

    await this.dispatchOtherDataSyncs(event, existing?.date);
  }

  private async insertEventorClass(cls: string) {
    const eventorClassId = `${this.eventorId}-${snakeCase(cls.toLowerCase())}`;

    const [existing] = await this.api.Drizzle.db
      .select()
      .from(EventorClassesTable)
      .where(eq(EventorClassesTable.eventorClassId, eventorClassId))
      .limit(1);

    if (!existing) {
      await this.api.Drizzle.db
        .insert(EventorClassesTable)
        .values({ eventorClassId, eventorId: this.eventorId, name: cls });
    }
  }

  private dispatchOtherDataSyncs(
    event: EventorCompetition,
    utcDate?: Date | null,
  ) {
    const syncs = [];

    syncs.push(
      this.api.Queue.addJob({
        name: 'sync-eventor-signups',
        data: {
          eventorId: event.id,
        },
      }),
    );

    if (utcDate && isAfter(new Date(), utcDate)) {
      syncs.push(
        this.api.Queue.addJob({
          name: 'sync-eventor-results',
          data: {
            eventorId: event.id,
          },
        }),
      );
    }

    return Promise.all(syncs);
  }
}
