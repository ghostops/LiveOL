// eslint-disable-next-line @typescript-eslint/no-unused-vars
import axios, { AxiosError } from 'axios';
import * as cheerio from 'cheerio';
import { EventorUrls } from './urls';

export interface EventorCompetition {
  id: string;
  eventorId: string;
  date: string;
  name: string;
  club: string;
  clubs?: string;
  clubLogoUrl?: string;
  district?: string;
  competitionDistance?: string;
  competitionType?: string;
  status?: string;
  info?: string;
  links: { text: string; href: string }[];
}

export class EventorCompetitionScraper {
  private readonly url: string;

  private metadata: Record<EventorMetadataInformationKeys, string>;

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
    this.metadata = eventorMetadataInformationI18n[
      this.countryCode.toLowerCase()
    ] as Record<EventorMetadataInformationKeys, string>;
  }

  async fetchCompetition(): Promise<EventorCompetition> {
    try {
      const response = await axios.get(this.url);
      const $ = cheerio.load(response.data);

      const eventTableData = this.extractInfoTableRowData($);

      if (
        !eventTableData.name ||
        !eventTableData.date ||
        !eventTableData.club
      ) {
        throw new Error('Missing required event data (name, date, or club)');
      }

      return {
        id: this.eventorId,
        ...eventTableData,
        eventorId: this.eventorId,
        name: eventTableData.name,
        date: eventTableData.date,
        club: eventTableData.club,
        links: [],
      };
    } catch (error: AxiosError | unknown) {
      console.error(
        this.url,
        'Failed to fetch or parse Eventor competitions:',
        error,
      );
      throw error;
    }
  }

  private extractInfoTableRowData(
    $: CheerioStatic,
  ): Record<EventorMetadataInformationKeys, string | undefined> {
    const rows: Record<string, string> = {};
    const table = $('.eventInfoTableContainer table');
    table.find('tr').each((_, row) => {
      const key = $(row).find('th').text().trim();

      if (key === this.metadata.clubs) {
        const clubs: string[] = [];
        $(row)
          .find('td span')
          .each((_, s) => {
            const clubName = $(s).text().trim();
            if (clubName) {
              clubs.push(clubName);
            }
          });

        if (clubs.length > 0) {
          rows[this.metadata.club] = clubs[0] ?? '';
        }
        rows[key] = clubs.join(', ');
        return;
      }

      const value = $(row).find('td').text().trim();
      rows[key] = value;
    });

    return {
      name: rows[this.metadata.name],
      date: rows[this.metadata.date],
      club: rows[this.metadata.club],
      clubs: rows[this.metadata.clubs],
      clubLogoUrl: rows[this.metadata.clubLogoUrl],
      district: rows[this.metadata.district],
      competitionDistance: rows[this.metadata.competitionDistance],
      competitionType: rows[this.metadata.competitionType],
      status: rows[this.metadata.status],
    };
  }
}

type EventorMetadataInformationKeys =
  | 'name'
  | 'date'
  | 'club'
  | 'clubs'
  | 'clubLogoUrl'
  | 'district'
  | 'competitionDistance'
  | 'competitionType'
  | 'status';

const eventorMetadataInformationI18n: Record<
  string,
  Record<EventorMetadataInformationKeys, string | null>
> = {
  se: {
    name: 'Tävling',
    date: 'Datum',
    club: 'Arrangörsorganisation',
    clubs: 'Arrangörsorganisationer',
    clubLogoUrl: 'Arrangörsorganisation',
    district: 'Distrikt',
    competitionDistance: 'Tävlingsdistans',
    competitionType: 'Gren',
    status: 'Status',
  },
  au: {
    name: 'Event',
    date: 'Date',
    club: 'Organiser',
    clubs: 'Organisers',
    clubLogoUrl: 'Organiser',
    district: 'State',
    competitionDistance: 'Race distance',
    competitionType: 'Discipline',
    status: 'Status',
  },
};
