import axios from 'axios';
import * as cheerio from 'cheerio';

export interface EventorSignup {
  className: string;
  name: string;
  club: string;
  siCard: string;
}

export class EventorSignupsScraper {
  private readonly url: string;

  constructor(eventId: string) {
    this.url = `https://eventor.orientering.se/Events/Entries?eventId=${eventId}&groupBy=EventClass`;
  }

  async fetchEntries(): Promise<EventorSignup[]> {
    try {
      const response = await axios.get(this.url);
      const $ = cheerio.load(response.data);
      const entries: EventorSignup[] = [];

      $('.entryList').each((_, table) => {
        const classHeader = $(table).prev().text().trim();
        const className = classHeader.replace(/\s*\(\d+\)\s*$/, '').trim();

        $(table)
          .find('tbody tr')
          .each((_, row) => {
            const cells = $(row).find('td');
            if (cells.length >= 3) {
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
          });
      });

      return entries;
    } catch (error) {
      console.error('Failed to fetch or parse Eventor entries:', error);
      return [];
    }
  }
}
