import axios from 'axios';
import * as cheerio from 'cheerio';

export interface EventorResult {
  className: string;
  position: string;
  name: string;
  club: string;
  time: string;
  timePlus: string;
  distance: string;
}

export class EventorResultsScraper {
  private readonly url: string;

  constructor(eventId: string) {
    this.url = `https://eventor.orientering.se/Events/ResultList?eventId=${eventId}&groupBy=EventClass`;
  }

  async fetchResults(): Promise<EventorResult[]> {
    try {
      const response = await axios.get(this.url);
      const $ = cheerio.load(response.data);
      const results: EventorResult[] = [];

      $('.resultList').each((_, table) => {
        const classHeader = $(table).prev();
        const className = classHeader.find('h3').first().text().trim();
        const distance = classHeader
          .text()
          .replace(className, '')
          .split(',')[0]! // dangerous!
          .trim();

        $(table)
          .find('tbody tr')
          .each((_, row) => {
            const cells = $(row).find('td');
            if (cells.length >= 5) {
              const position = $(cells[0]).text().trim();
              const name = $(cells[1]).text().trim();
              const club = $(cells[2]).text().trim();
              const time = $(cells[3]).text().trim();
              const timePlus = $(cells[4]).text().trim();

              results.push({
                className,
                position,
                name,
                club,
                time,
                timePlus,
                distance,
              });
            }
          });
      });

      return results;
    } catch (error) {
      console.error('Failed to fetch or parse Eventor results:', error);
      return [];
    }
  }
}
