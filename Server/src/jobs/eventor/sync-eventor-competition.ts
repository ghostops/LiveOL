import { eq } from 'drizzle-orm';
import { EventorCompetitionsTable } from 'lib/db/schema';
import { EventorScraper } from 'lib/eventor/scraper';
import { EventorEventItem } from 'lib/eventor/types';
import { APIResponse, apiSingletons, URLS } from 'lib/singletons';

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
  }
}
