import { eq } from 'drizzle-orm';
import { EventorClassesTable, EventorCompetitionsTable } from 'lib/db/schema';
import { EventorScraper } from 'lib/eventor/scraper';
import { EventorEventItem } from 'lib/eventor/types';
import { APIResponse, apiSingletons, URLS } from 'lib/singletons';
import { snakeCase } from 'lodash';
import { parse } from 'date-fns';
import { sv } from 'date-fns/locale';

export class SyncEventorCompetition {
  private api: APIResponse;
  private scraper: EventorScraper;

  constructor(private eventorId: string) {
    if (!eventorId) {
      throw new Error('Eventor ID is required');
    }

    this.api = apiSingletons.createApiSingletons();
    this.scraper = new EventorScraper(URLS.eventorSweden, this.api.Redis);
  }

  async run() {
    try {
      const data = await this.scraper.scrapeEvent(this.eventorId);

      await this.insertEventorCompetition(data);

      for (const cls of data.ageClasses.concat(data.openClasses)) {
        await this.insertEventorClass(cls);
      }

      console.log(`Eventor competition ${data.id} synced successfully.`);
    } catch (error) {
      console.error('Error syncing eventor competition:', error);
    }
  }

  private async insertEventorCompetition(event: EventorEventItem) {
    let organizerId: number | null = null;
    if (event.clubLogoUrl) {
      const parts = event.clubLogoUrl.split('/');
      const id = parts[parts.length - 1];
      if (id) {
        organizerId = Number(id);
      }
    }
    const body = {
      name: event.name,
      organizer: event.club,
      organizerId,
      notification: event.info,
      links: event.links,
      date: event.date
        ? //TODO: Make this UTC
          parse(event.date, "EEEE d MMMM yyyy 'klockan' HH:mm", new Date(), {
            locale: sv,
          })
        : undefined,
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
      : await this.api.Drizzle.db
          .insert(EventorCompetitionsTable)
          .values({ eventorId: event.id, ...body });

    await this.dispatchMatchEventorAndLive(event);
    await this.dispatchOtherDataSyncs(event);
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

  private dispatchMatchEventorAndLive(event: EventorEventItem) {
    return this.api.Queue.addJob({
      name: 'match-eventor-and-live',
      data: {
        eventorId: event.id,
      },
    });
  }

  private dispatchOtherDataSyncs(event: EventorEventItem) {
    const a = this.api.Queue.addJob({
      name: 'sync-eventor-signups',
      data: {
        eventorId: event.id,
      },
    });

    const b = this.api.Queue.addJob({
      name: 'sync-eventor-results',
      data: {
        eventorId: event.id,
      },
    });

    return Promise.all([a, b]);
  }
}
