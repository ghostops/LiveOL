import axios from 'axios';
import * as cheerio from 'cheerio';
import { EventorUrls } from './urls';

export interface EventorSignup {
  className: string;
  name: string;
  club: string;
  siCard: string;
}

export class EventorSignupsScraper {
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
    this.url = `${url}/Events/Entries?eventId=${this.eventorId}&groupBy=EventClass`;
  }

  async fetchEntries(): Promise<EventorSignup[]> {
    try {
      const response = await axios.get(this.url);
      const $ = cheerio.load(response.data);
      const entries: EventorSignup[] = [];

      const isRelay = $('.relayLineupEntryList').length > 0;

      if (isRelay) {
        console.log('Event contains relay entries, which are not supported.');
      }

      $('.entryList').each((_, table) => {
        const classHeader = $(table).prev().text().trim();
        const className = classHeader.replace(/\s*\(\d+\)\s*$/, '').trim();

        $(table)
          .find('tbody tr')
          .each((_, row) => {
            const cells = $(row).find('td');
            const rowIsRelayLineup = $(cells[1])
              .first()
              .hasClass('relayLineup');

            if (cells.length >= 3 && !isRelay) {
              const name = $(cells[0]).text().trim();
              const club = $(cells[1]).text().trim();
              const siCard = $(cells[2]).text().trim();

              entries.push({
                className,
                name,
                club,
                siCard,
              });
            }

            if (isRelay && !rowIsRelayLineup) {
              const name = $(cells[1]).text().trim();
              const club = $(row)
                .parent()
                .parent()
                .parent()
                .prev()
                .find('a')
                .text()
                .trim();
              const siCard = $(cells[2]).text().trim();

              if (className && name && club) {
                entries.push({
                  className,
                  name,
                  club,
                  siCard,
                });
              }
            }
          });
      });

      return entries;
    } catch (error) {
      console.error('Failed to fetch or parse Eventor entries:', error);
      return [];
    }
  }
}
