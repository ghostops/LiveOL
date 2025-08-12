import { addDays } from 'date-fns';
import { EventorScraper } from 'lib/eventor/scraper';
import { EventorListItem } from 'lib/eventor/types';
import { APIResponse, apiSingletons, URLS } from 'lib/singletons';

export class SyncEventorCompetitions {
  private api: APIResponse;
  private scraper: EventorScraper;

  constructor() {
    this.api = apiSingletons.createApiSingletons();
    // ToDo: Provide country in job options
    this.scraper = new EventorScraper(URLS.eventorSweden, this.api.Redis);
  }

  async run() {
    try {
      const now = new Date();
      // ToDo: Scrape more days!
      const end = addDays(now, 1);
      const data = await this.scraper.scrapeDateRange(now, end);
      await this.dispatchScrapeCompetition(data);
    } catch (error) {
      console.error('Error syncing eventor competitions:', error);
    }
  }

  private async dispatchScrapeCompetition(items: EventorListItem[]) {
    for (const item of items) {
      await this.api.Queue.addJob({
        name: 'sync-eventor-competition',
        data: {
          eventorId: item.id,
        },
      });
    }
  }
}
