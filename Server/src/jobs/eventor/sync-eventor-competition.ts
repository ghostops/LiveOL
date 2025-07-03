import { EventorScraper } from 'lib/eventor/scraper';
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
      console.log(data);
    } catch (error) {
      console.error('Error syncing eventor competition:', error);
    }
  }
}
