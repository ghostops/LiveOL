export type EventorClubIconSize = 'MediumIcon' | 'InlineIcon' | 'LargeIcon';
export const EVENTOR_CLUB_ICON_SIZES: EventorClubIconSize[] = [
  'InlineIcon',
  'MediumIcon',
  'LargeIcon',
];

export type EventorCompetitionDistance =
  | 'ultralong'
  | 'long'
  | 'middle'
  | 'sprint';

export type EventorCompetitionType =
  | 'foot'
  | 'ski'
  | 'mountainbike'
  | 'trail'
  | 'precision';

interface EventorEventBase {
  id: string;
  date?: string;
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
  signups: number;
  url: string;
}

export interface EventorListItem extends EventorEventBase {
  liveloxLink: string;
  resultsLink: string;
}

export interface EventorClub {
  id: number;
  name: string;
  country: string;
  address: string;
  website: string;
  email: string;
  clubLogoUrl: string;
}
