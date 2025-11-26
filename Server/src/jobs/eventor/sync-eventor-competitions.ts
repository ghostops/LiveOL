import { parse } from 'date-fns';
import {
  EventorCompetitions,
  EventorCompetitionsScraper,
} from 'lib/eventor/scrapers/competitions';
import { APIResponse, apiSingletons } from 'lib/singletons';

export class SyncEventorCompetitions {
  private api: APIResponse;
  private scraper: EventorCompetitionsScraper;

  constructor(
    private countryCode: string,
    private startDate: string,
    private endDate: string,
  ) {
    if (!countryCode) {
      throw new Error('Country code is required');
    }
    if (!startDate) {
      throw new Error('Start date is required');
    }
    if (!endDate) {
      throw new Error('End date is required');
    }
    this.api = apiSingletons.createApiSingletons();
    this.scraper = new EventorCompetitionsScraper(
      this.countryCode,
      parse(this.startDate, 'yyyy-MM-dd', new Date()),
      parse(this.endDate, 'yyyy-MM-dd', new Date()),
    );
  }

  async run() {
    try {
      const data = await this.scraper.fetchCompetitions();
      await this.dispatchScrapeCompetition(data);
    } catch (error) {
      console.error('Error syncing eventor competitions:', error);
    }
  }

  private async dispatchScrapeCompetition(items: EventorCompetitions[]) {
    for (const item of items) {
      await this.api.Queue.RegularQueue.addJob({
        name: 'sync-eventor-competition',
        data: {
          eventorId: item.eventorId,
          countryCode: this.countryCode,
        },
      });
    }
  }
}
