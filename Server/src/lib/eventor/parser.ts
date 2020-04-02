import * as cheerio from 'cheerio';
import * as _ from 'lodash';
import { invertKeyValues } from '../helpers/invert';

export type EventorClubIconSize = 'MediumIcon' | 'InlineIcon';

export type EventorCompetitionDistance = 'ultralong' | 'long' | 'middle' | 'sprint';

export type EventorCompetitionType = 'foot' | 'ski' | 'mountainbike' | 'trail' | 'precision';

interface EventorEventBase {
    date: Date;
    name: string;
    club: string;
    clubLogoUrl: string;
    district: string;
    competitionDistance: EventorCompetitionDistance;
    competitionType: EventorCompetitionType;
    canceled: boolean;
}

export interface EventorEventItem extends EventorEventBase {
    info?: string;
    links: {
        href: string;
        text: string;
    }[];
}

export interface EventorListItem extends EventorEventBase {
    liveloxLink: string;
    resultsLink: string;
}

const parseDate = (input: string): Date | null => {
    if (!input) return null;

    // TODO: Parse the date to JS here!

    return new Date('2100-01-01');
};

const parseClubLogo = (base: string, path: string): string | null => {
    if (!base || !path) return null;

    let clubLogoUrl: string = path;
    clubLogoUrl = clubLogoUrl.split('?')[0];
    clubLogoUrl = `${base}${clubLogoUrl}`;

    return clubLogoUrl;
};

const parseCompetitionType = (input: string): EventorCompetitionType => {
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
        default:
            return 'foot';
    };
};

const parseCompetitionDistance = (input: string): EventorCompetitionDistance => {
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
    };
};

export class ListResponseParser {
    constructor(private body: string, private base: string) {}

    private currentWeek: string;
    private currentDay: string;

    public parse = (): EventorListItem[] => {
        const $ = cheerio.load(this.body);

        const entries = $('#eventCalendar tbody tr').toArray();
        
        return entries.map(this.parseRow).filter((row) => !!row);
    }

    private parseRow = (row: CheerioElement): EventorListItem => {
        try {
            let indexModifier = 0;

            const isWeek = (
                row.attribs.class &&
                row.attribs.class.includes('firstRowOfWeek')
            );

            const isDay = (
                row.attribs.class &&
                row.attribs.class.includes('firstRowOfDate')
            );

            if (isWeek) {
                indexModifier = 2;

                this.currentWeek = _.get(row, `children.0.children.0.data`);
                this.currentDay = _.get(row, `children.1.children.0.data`);
            }

            if (isDay) {
                indexModifier = 1;

                this.currentDay = _.get(row, `children.1.children.0.data`);
            }

            const date = parseDate(this.currentDay);

            const canceled = !!(row.attribs.class && row.attribs.class.includes('canceled'));

            const name = _.get(row, `children[${0 + indexModifier}].children.0.children.0.data`);
            const club = _.get(row, `children[${1 + indexModifier}].children.0.children.1.data`);

            let clubLogoUrl = parseClubLogo(
                this.base,
                _.get(row, `children[${1 + indexModifier}].children.0.children.0.attribs.src`)
            );

            const district = _.get(row, `children[${2 + indexModifier}].children.0.data`);

            const competitionType = parseCompetitionType(
                _.get(
                    row,
                    `children[${3 + indexModifier}].children.0.children.0.data`,
                    'foot' as EventorCompetitionType,
                )
            );

            const competitionDistance = parseCompetitionDistance(
                _.get(row, `children[${6 + indexModifier}].children.0.children.0.data`)
            );

            let liveloxLink = _.get(row, `children[${9 + indexModifier}].children.0.children.0.attribs.href`);
            if (liveloxLink) {
                liveloxLink = `${this.base}${liveloxLink}`;
            }

            let resultsLink = _.get(row, `children[${9 + indexModifier}].children.1.children.0.attribs.href`);
            if (resultsLink) {
                resultsLink = `${this.base}${resultsLink}`;
            }
            
            return {
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
    }
}

export class EventResponseParser {
    constructor(private body: string, private base: string) {}

    public parse = (): EventorEventItem => {
        const $ = cheerio.load(this.body);

        const infoMap = invertKeyValues({
            name: 'Tävling',
            date: 'Datum',
            club: 'Arrangörsorganisation',
            clubLogoUrl: 'Arrangörsorganisation',
            district: 'Distrikt',
            competitionDistance: 'Tävlingsdistans',
            competitionType: 'Gren',
            status: 'Status',
        });

        const mappedInfoData: Partial<EventorEventItem> = {};

        // This array contains all the table data to the left on the event page
        const infoTable = $('.eventInfo tbody tr').toArray();
        
        infoTable.forEach((element) => {
            const title = _.get(element, 'children.1.children.0.data');
            const value = _.get(element, 'children.3.children.0.data', '').trim();

            if (infoMap[title]) {
                // Hacky special case for club data
                if (
                    infoMap[title].includes('club') ||
                    infoMap[title].includes('clubLogoUrl')
                ) {
                    const imageUrl = _.get(element, 'children.3.children.0.children.0.attribs.src');
                    const club = _.get(element, 'children.3.children.0.children.1.data');
                    
                    mappedInfoData.club = club;
                    mappedInfoData.clubLogoUrl = imageUrl;

                    return;
                }

                mappedInfoData[infoMap[title]] = value;
            }
        });
        
        const info = $('#main > div > p.info').text().trim();
        
        const links = $('.documents .documentName').toArray().map((element) => {
            const href = (
                element.attribs.href.startsWith('/')
                ? `${this.base}${element.attribs.href}`
                : element.attribs.href
            );

            const text = _.get(element, 'children.0.data', 'Unnamed Link');

            return { href, text };
        });

        return {
            date: parseDate(mappedInfoData.date as unknown as string),
            name: mappedInfoData.name,
            club: mappedInfoData.club,
            district: mappedInfoData.district,
            competitionDistance: parseCompetitionDistance(mappedInfoData.competitionDistance),
            competitionType: parseCompetitionType(mappedInfoData.competitionType),
            canceled: (mappedInfoData as any).status === 'inställd',
            clubLogoUrl: parseClubLogo(this.base, mappedInfoData.clubLogoUrl),
            links,
            info,
        };
    }
}
