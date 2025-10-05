import { eq } from 'drizzle-orm';
import { EventorClassesTable, EventorCompetitionsTable } from 'lib/db/schema';
import { EventorScraper } from 'lib/eventor/scraper';
import { EventorEventItem } from 'lib/eventor/types';
import { APIResponse, apiSingletons, URLS } from 'lib/singletons';
import { snakeCase } from 'lodash';
import { isAfter, Locale, parse } from 'date-fns';
import { sv } from 'date-fns/locale';
import { fromZonedTime } from 'date-fns-tz';

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

    const utcDate = this.parseDateToUtc(event.date, 'Europe/Stockholm', sv);

    const body = {
      name: event.name,
      organizer: event.club,
      organizerId,
      notification: event.info,
      links: event.links,
      date: utcDate,
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
    await this.dispatchOtherDataSyncs(event, utcDate);
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

  private dispatchOtherDataSyncs(
    event: EventorEventItem,
    utcDate: Date | null,
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

    syncs.push(
      this.api.Queue.addJob({
        name: 'match-eventor-and-organizer',
        data: {
          eventorId: event.id,
        },
      }),
    );

    return Promise.all(syncs);
  }

  private parseDateToUtc(
    dateString: string = '',
    timezone: string,
    locale: Locale,
  ) {
    if (!dateString) return null;

    // Try multiple formats until one succeeds
    const formats = [
      'EEEE d MMMM yyyy', // söndag 5 oktober 2025 ELLER måndag 16 juni 2025 - söndag 26 oktober 2025
      "EEEE d MMMM yyyy 'klockan' HH:mm", // söndag 3 augusti 2025 klockan 10:00 ELLER söndag 5 oktober 2025 klockan 11:00 - 12:30
    ];

    let localDate: Date | null = null;

    for (const format of formats) {
      try {
        if (dateString.includes(' - ')) {
          dateString = dateString.split(' - ')[0]!.trim();
        }
        const parsed = parse(dateString, format, new Date(), { locale });
        if (!isNaN(parsed.getTime())) {
          localDate = parsed;
          break;
        }
      } catch {
        // Ignore parse errors and try next format
      }
    }

    if (!localDate) {
      console.warn(`Could not parse date string: "${dateString}"`);
      return null;
    }

    const utcDate = fromZonedTime(localDate, timezone);

    return utcDate;
  }
}
