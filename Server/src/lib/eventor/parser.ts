import * as cheerio from 'cheerio';
import * as _ from 'lodash';

export type EventorClubIconSize = 'MediumIcon' | 'InlineIcon';

interface EventorEventBase {
    date: string;
    name: string;
    club: string;
    clubLogoUrl: string;
    district: string;
    competitionDistance: string;
    raceType: string;
    canceled: boolean;
}

export interface EventorEventItem extends EventorEventBase {
    cancelReason?: string;
}

export interface EventorListItem extends EventorEventBase {
    // competitionType:  'L' | 'S' | 'M' | 'P';
    // competitionFormat: string;
    liveloxLink: string;
    resultsLink: string;
}


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

            // TODO: Parse this to a JS date
            const date = this.currentDay;

            const canceled = !!(row.attribs.class && row.attribs.class.includes('canceled'));

            const name = _.get(row, `children[${0 + indexModifier}].children.0.children.0.data`);
            const club = _.get(row, `children[${1 + indexModifier}].children.0.children.1.data`);

            let clubLogoUrl = _.get(row, `children[${1 + indexModifier}].children.0.children.0.attribs.src`);
            if (clubLogoUrl) {
                clubLogoUrl = clubLogoUrl.split('?')[0];
                clubLogoUrl = `${this.base}${clubLogoUrl}`;
            }

            const district = _.get(row, `children[${2 + indexModifier}].children.0.data`);
            // TODO: parse to common type
            const raceType = _.get(row, `children[${3 + indexModifier}].children.0.children.0.data`, 'L');

            // const competitionType = _.get(row, `children[${4 + indexModifier}].children.0.children.0.data`);
            // const competitionFormat = _.get(row, `children[${5 + indexModifier}].children.0.children.0.data`, 'D');
            // TODO: parse to common type
            const competitionDistance = _.get(row, `children[${6 + indexModifier}].children.0.children.0.data`);

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
                raceType,
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
        
        const date = $('#main > div > div.eventInfoTableContainer > table:nth-child(1) > tbody > tr:nth-child(5) > td').text().trim();
        const name = $('#main > div > h2').text();
        const club = $('#main > div > div.eventInfoTableContainer > table:nth-child(1) > tbody > tr:nth-child(2) > td > span').text();
        
        let clubLogoUrl = $('#main > div > div.eventInfoTableContainer > table:nth-child(1) > tbody > tr:nth-child(2) > td > span > img').attr('src');
        if (clubLogoUrl) {
            clubLogoUrl = clubLogoUrl.split('?')[0];
            clubLogoUrl = `${this.base}${clubLogoUrl}`;
        }

        
        const district = $('#main > div > div.eventInfoTableContainer > table:nth-child(1) > tbody > tr:nth-child(3) > td').text();
        // TODO: parse to common type
        const competitionDistance = $('#main > div > div.eventInfoTableContainer > table:nth-child(1) > tbody > tr:nth-child(9) > td').text();
        // TODO: parse to common type
        const raceType = $('#main > div > div.eventInfoTableContainer > table:nth-child(1) > tbody > tr:nth-child(11) > td').text();
        
        const cancelReason = $('#main > div > p.info').text();

        console.log('------');
        return {
            date,
            name,
            club,
            clubLogoUrl,
            district,
            competitionDistance,
            raceType,
            cancelReason,
            canceled: !!cancelReason,
        };
    }
}
