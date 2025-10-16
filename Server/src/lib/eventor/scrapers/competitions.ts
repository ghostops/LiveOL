// eslint-disable-next-line @typescript-eslint/no-unused-vars
import axios, { AxiosError } from 'axios';
import * as cheerio from 'cheerio';
import { format } from 'date-fns';
import { EventorUrls } from './urls';

export interface EventorCompetitions {
  eventorId: string;
  date: string;
}

export class EventorCompetitionsScraper {
  private readonly url: string;

  constructor(
    private countryCode: string,
    private startDate: Date,
    private endDate: Date,
  ) {
    const url =
      EventorUrls[this.countryCode.toLowerCase() as keyof typeof EventorUrls];
    if (!url) {
      throw new Error(`Unsupported country code: ${this.countryCode}`);
    }
    const start = format(this.startDate, 'yyyy-MM-dd');
    const end = format(this.endDate, 'yyyy-MM-dd');
    this.url = `${url}/Events?startDate=${start}&endDate=${end}&mode=List&canceled=false&competitionTypes=level1,level2,level3`;
  }

  async fetchCompetitions(): Promise<EventorCompetitions[]> {
    try {
      const response = await axios.get(this.url);
      const $ = cheerio.load(response.data);
      const competitions: EventorCompetitions[] = [];
      $('#eventList > table > tbody tr').each((_, row) => {
        const cells = $(row).find('td');
        const date = $(cells[0]).find('span').data('date');
        const link = $(cells[1]).find('a').attr('href');

        if (date && link) {
          const cleanedLink = link.replace(/\/+$/, '');
          const eventorId = cleanedLink.substring(
            cleanedLink.lastIndexOf('/') + 1,
          );
          if (eventorId) {
            competitions.push({
              eventorId,
              date,
            });
          }
        }
      });
      return competitions;
    } catch (error: AxiosError | unknown) {
      console.error(
        this.url,
        'Failed to fetch or parse Eventor competitions:',
        error,
      );
      return [];
    }
  }
}
