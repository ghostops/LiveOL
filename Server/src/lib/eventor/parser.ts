import * as cheerio from 'cheerio';
import * as _ from 'lodash';
import { invertKeyValues } from '../helpers/invert';
import * as moment from 'moment-timezone';
import {
  EventorCompetitionType,
  EventorCompetitionDistance,
  EventorEventItem,
  EventorListItem,
} from './types';

const parseClubLogo = (base: string, path: string): string | null => {
  if (!base || !path) return null;

  let clubLogoUrl: string | undefined = path;
  clubLogoUrl = clubLogoUrl.split('?')[0];
  if (!clubLogoUrl) {
    return null;
  }
  clubLogoUrl = `${base}${clubLogoUrl}`;

  return clubLogoUrl;
};

const parseCompetitionType = (input: string): EventorCompetitionType | null => {
  if (!input) {
    return null;
  }

  switch (input.toLowerCase()) {
    case 'p':
    case 'precisionsorientering':
      return 'precision';
    case 's':
    case 'skidorientering':
      return 'ski';
    case 'm':
    case 'mountainbikeorientering':
      return 'mountainbike';
    case 't':
    case 'trailorienteering':
      return 'trail';
    case 'l':
    case 'orienteringslöpning':
    case 'FootO':
    default:
      return 'foot';
  }
};

const parseCompetitionDistance = (
  input?: string,
): EventorCompetitionDistance | null => {
  if (!input) {
    return null;
  }

  switch (input.toLowerCase()) {
    case 'u':
    case 'ultralång':
      return 'ultralong';
    case 'l':
    case 'lång':
      return 'long';
    case 's':
    case 'sprint':
      return 'sprint';
    case 'm':
    case 'medel':
    default:
      return 'middle';
  }
};

export class ListResponseParser {
  constructor(
    private body: string,
    private base: string,
  ) {}

  private currentWeek: string | undefined;
  private currentDay: string | undefined;

  private startDate: moment.Moment | undefined;
  private endDate: moment.Moment | undefined;

  public parse = (): EventorListItem[] => {
    const $ = cheerio.load(this.body);

    this.setStartAndEndDates($('#main > div.noAutofocus > p').text());

    const entries = $('#eventCalendar tbody tr').toArray();

    return entries.map(this.parseRow).filter(row => !!row) as EventorListItem[];
  };

  private setStartAndEndDates = (text: string): void => {
    try {
      const [startDateStr, endDateStr] = text.match(
        /(\d+)(\/|-)(\d+)(\/|-)(\d+)/gm,
      )!;

      let startDate = startDateStr!;
      let endDate = endDateStr!;

      if (startDate.includes('/') || endDate.includes('/')) {
        const [startD, startM, startY] = startDate.split('/');
        const [endD, endM, endY] = endDate.split('/');

        startDate = `${startY}-${startM}-${startD}`;
        endDate = `${endY}-${endM}-${endD}`;
      }

      this.startDate = moment.utc(startDate);
      this.endDate = moment.utc(endDate);
    } catch (err) {
      console.info('No start or end date could be extracted');
      this.startDate = moment.utc();
      this.endDate = moment.utc();
    }
  };

  private parseDate = (input: string | undefined): moment.Moment | null => {
    if (!input || !this.startDate || !this.endDate) return null;

    // @ts-expect-error nullcheck
    const [day, month] = input.split(' ')[1].split('/');

    let year = this.startDate.year();

    // If we have an end date for the range, and the year on that date
    // does not match the start, and the month is 1 we can assume
    // it will be January in the end-date
    if (this.startDate.year() !== this.endDate.year() && month === '1') {
      year = this.endDate.year();
    }

    return moment.utc(`${year}-${month}-${day}`, 'YYYY-MM-DD');
  };

  private parseRow = (row: CheerioElement): EventorListItem | null => {
    try {
      let indexModifier = 0;

      const isWeek =
        row.attribs.class && row.attribs.class.includes('firstRowOfWeek');

      const isDay =
        row.attribs.class && row.attribs.class.includes('firstRowOfDate');

      if (isWeek) {
        indexModifier = 2;

        this.currentWeek = _.get(row, `children.0.children.0.data`);
        this.currentDay = _.get(row, `children.1.children.0.data`);
      }

      if (isDay) {
        indexModifier = 1;

        this.currentDay = _.get(row, `children.0.children.0.data`);
      }

      const date = this.parseDate(this.currentDay)?.format();

      const canceled = !!(
        row.attribs.class && row.attribs.class.includes('canceled')
      );

      const name = _.get(
        row,
        `children[${0 + indexModifier}].children.0.children.0.data`,
      );

      let id = _.get(
        row,
        `children[${0 + indexModifier}].children.0.attribs.href`,
      );

      if (id) {
        id = _.last(id.split('/'));
      }

      const club = _.get(
        row,
        `children[${1 + indexModifier}].children.0.children.1.data`,
      );

      const clubLogoUrl = parseClubLogo(
        this.base,
        _.get(
          row,
          `children[${1 + indexModifier}].children.0.children.0.attribs.src`,
        ),
      );

      const district = _.get(
        row,
        `children[${2 + indexModifier}].children.0.data`,
      );

      const competitionType = parseCompetitionType(
        _.get(
          row,
          `children[${3 + indexModifier}].children.0.children.0.data`,
          'foot' as EventorCompetitionType,
        ),
      );

      const competitionDistance = parseCompetitionDistance(
        _.get(row, `children[${6 + indexModifier}].children.0.children.0.data`),
      );

      let liveloxLink = _.get(
        row,
        `children[${9 + indexModifier}].children.0.children.0.attribs.href`,
      );
      if (liveloxLink) {
        liveloxLink = `${this.base}${liveloxLink}`;
      }

      let resultsLink = _.get(
        row,
        `children[${9 + indexModifier}].children.1.children.0.attribs.href`,
      );
      if (resultsLink) {
        resultsLink = `${this.base}${resultsLink}`;
      }

      // If no id is found just return null
      if (!id) {
        return null;
      }

      return {
        id,
        date,
        name,
        club,
        clubLogoUrl,
        district,
        competitionType,
        competitionDistance,
        liveloxLink,
        resultsLink,
        canceled,
      };
    } catch (error) {
      console.error('Failed to parse eventor row', error);
      return null;
    }
  };
}

export class EventResponseParser {
  constructor(
    private body: string,
    private base: string,
    private eventUrl: string,
  ) {}

  public parse = (): EventorEventItem => {
    const $ = cheerio.load(this.body, { decodeEntities: false });

    const bodyLanguage = determineLanguage($('#main > div > h2').text());

    const infoMap: any = invertKeyValues({
      name: eventorMetadataInformationI18n[bodyLanguage].name,
      date: eventorMetadataInformationI18n[bodyLanguage].date,
      club: eventorMetadataInformationI18n[bodyLanguage].club,
      clubLogoUrl: eventorMetadataInformationI18n[bodyLanguage].clubLogoUrl,
      district: eventorMetadataInformationI18n[bodyLanguage].district,
      competitionDistance:
        eventorMetadataInformationI18n[bodyLanguage].competitionDistance,
      competitionType:
        eventorMetadataInformationI18n[bodyLanguage].competitionType,
      status: eventorMetadataInformationI18n[bodyLanguage].status,
    });

    const mappedInfoData: Partial<EventorEventItem> = {};

    // This array contains all the table data to the left on the event page
    const infoTable = $('.eventInfo tbody tr').toArray();

    infoTable.forEach(element => {
      const title = _.get(element, 'children.1.children.0.data');
      const value = _.get(element, 'children.3.children.0.data', '').trim();

      if (infoMap[title]) {
        // Hacky special case for club data
        if (
          infoMap[title].includes('club') ||
          infoMap[title].includes('clubLogoUrl')
        ) {
          const imageUrl = _.get(
            element,
            'children.3.children.0.children.0.attribs.src',
          );
          const club = _.get(element, 'children.3.children.0.children.1.data');

          mappedInfoData.club = club;
          mappedInfoData.clubLogoUrl = imageUrl;

          return;
        }

        // @ts-expect-error key-types
        mappedInfoData[infoMap[title]] = value;
      }
    });

    const info = $('#main > div > p.info').html();

    const links = $('.documents .documentName')
      .toArray()
      .map(element => {
        const href = element.attribs.href?.startsWith('/')
          ? `${this.base}${element.attribs.href}`
          : element.attribs.href;

        const text = _.get(element, 'children.0.data', 'Unnamed Link');

        return { href, text };
      });

    let signups: string | number = $('.entryBox span.count').text();

    if (signups && signups.length) {
      signups = Number(signups.replace('(', '').replace(')', ''));
    } else {
      signups = 0;
    }

    // Hacky way of selecting the id
    let id = $(
      '#main > div > p.toolbar16 > a.hoverableImageAndText16x16.calendar16x16',
    ).attr('href');

    if (id) {
      id = _.last(id.split('/'));
    }

    return {
      // @ts-expect-error nullcheck
      id,
      // @ts-expect-error nullcheck
      links,
      // @ts-expect-error nullcheck
      info,
      signups: signups as number,
      // @ts-expect-error nullcheck
      name: mappedInfoData.name,
      // @ts-expect-error nullcheck
      club: mappedInfoData.club,
      // @ts-expect-error nullcheck
      district: mappedInfoData.district,
      competitionDistance: parseCompetitionDistance(
        // @ts-expect-error nullcheck
        mappedInfoData.competitionDistance,
      ),
      // @ts-expect-error nullcheck
      competitionType: parseCompetitionType(mappedInfoData.competitionType),
      // @ts-expect-error nullcheck and language?
      canceled: mappedInfoData.status === 'inställd',
      // @ts-expect-error nullcheck
      clubLogoUrl: parseClubLogo(this.base, mappedInfoData.clubLogoUrl),
      url: this.eventUrl,
    };
  };
}

type EventorI18n = 'en' | 'se';

type EventorMetadataInformationKeys =
  | 'name'
  | 'date'
  | 'club'
  | 'clubLogoUrl'
  | 'district'
  | 'competitionDistance'
  | 'competitionType'
  | 'status';

const determineLanguage = (title: string): EventorI18n => {
  if (title.toLowerCase().includes('tävlingsinformation')) {
    return 'se';
  }

  return 'en';
};

const eventorMetadataInformationI18n: Record<
  EventorI18n,
  Record<EventorMetadataInformationKeys, string>
> = {
  se: {
    name: 'Tävling',
    date: 'Datum',
    club: 'Arrangörsorganisation',
    clubLogoUrl: 'Arrangörsorganisation',
    district: 'Distrikt',
    competitionDistance: 'Tävlingsdistans',
    competitionType: 'Gren',
    status: 'Status',
  },
  en: {
    name: 'Event',
    date: 'Date',
    club: 'Organiser',
    clubLogoUrl: 'Organiser',
    district: 'State',
    competitionDistance: 'Race distance',
    competitionType: 'Discipline',
    status: 'Status',
  },
};
