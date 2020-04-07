export type EventorClubIconSize = 'MediumIcon' | 'InlineIcon';

export type EventorCompetitionDistance = 'ultralong' | 'long' | 'middle' | 'sprint';

export type EventorCompetitionType = 'foot' | 'ski' | 'mountainbike' | 'trail' | 'precision';

interface EventorEventBase {
    id: string;
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
