import axios, { AxiosError } from 'axios';
import * as cheerio from 'cheerio';
import { EventorUrls } from './urls';
import logger from 'lib/logger';

export interface EventorStart {
  bib: string;
  className: string;
  punchCardNumber: string;
  name: string;
  club: string;
  startTime: string;
}

export class EventorStartsScraper {
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
    this.url = `${url}/Events/StartList?eventId=${this.eventorId}&groupBy=EventClass`;
  }

  async fetchResults(): Promise<EventorStart[]> {
    try {
      const response = await axios.get(this.url);
      const $ = cheerio.load(response.data);
      const results: EventorStart[] = [];

      $('.startList').each((_, table) => {
        const classHeader = $(table).prev();
        const className = classHeader.find('h3').first().text().trim();

        $(table)
          .find('tbody tr')
          .each((_, row) => {
            const cells = $(row).find('td');
            if (cells.length >= 5) {
              const bib = $(cells[0]).text().trim();
              const punchCardNumber = $(cells[1]).text().trim();
              const name = $(cells[2]).text().trim();
              const club = $(cells[3]).text().trim();
              const startTime = $(cells[4]).text().trim();

              results.push({
                className,
                bib,
                punchCardNumber,
                name,
                club,
                startTime,
              });
            }
          });
      });

      return results;
    } catch (error: AxiosError | unknown) {
      if (
        (error as AxiosError).response &&
        (error as AxiosError).response?.status === 404
      ) {
        logger.warn(
          `Eventor event starts with ID ${this.eventorId} not found (404).`,
        );
        return [];
      }
      logger.error(
        `Failed to fetch or parse Eventor starts: ID ${this.eventorId} ${error}`,
      );
      return [];
    }
  }
}
