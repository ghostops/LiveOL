// eslint-disable-next-line @typescript-eslint/no-unused-vars
import axios, { AxiosError } from 'axios';
import * as cheerio from 'cheerio';
import { EventorUrls } from './urls';

export interface EventorCompetition {
  eventorId: string;
  date: string;
}

export class EventorCompetitionScraper {
  private readonly url: string;

  constructor(
    private countryCode: string,
    private eventorId: string,
  ) {
    if (!eventorId) {
      throw new Error('Eventor ID is required');
    }
    const url =
      EventorUrls[this.countryCode.toLowerCase() as keyof typeof EventorUrls];
    if (!url) {
      throw new Error(`Unsupported country code: ${this.countryCode}`);
    }
    this.url = `${url}/Events/Show/${this.eventorId}`;
  }

  async fetchCompetition(): Promise<EventorCompetition | null> {
    try {
      const response = await axios.get(this.url);
      const $ = cheerio.load(response.data);

      const eventTableData = this.extractInfoTableRowData($);
      console.log(eventTableData);

      return {
        eventorId: this.eventorId,
        date: $('#eventDate').text().trim(),
      };
    } catch (error: AxiosError | unknown) {
      console.error(
        this.url,
        'Failed to fetch or parse Eventor competitions:',
        error,
      );
      return null;
    }
  }

  private extractInfoTableRowData($: CheerioStatic): Record<string, string> {
    const rows: Record<string, string> = {};
    const table = $('.eventInfoTableContainer table');
    table.find('tr').each((_, row) => {
      const key = $(row).find('th').text().trim();
      const value = $(row).find('td').text().trim();
      rows[key] = value;
    });
    return rows;
  }
}
