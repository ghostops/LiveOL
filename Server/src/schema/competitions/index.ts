import {
  EventorEventItem,
  EventorCompetitionDistance,
  EventorClubIconSize,
  EVENTOR_CLUB_ICON_SIZES,
} from 'lib/eventor/types';
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLList,
} from 'graphql';
import { LiveresultatApi } from 'lib/liveresultat/types';
import { UTCTime } from 'types';
import * as _ from 'lodash';
import * as moment from 'moment';

export interface IOLCompetitionResponse {
  competitions: IOLCompetition[];
  today: IOLCompetition[];
  page: number;
  lastPage: number;
  search: string | null;
}

export interface IOLCompetition {
  id: number;
  name: string;
  organizer: string;
  date: UTCTime;

  // Eventor props
  eventorAvailable: boolean;
  info?: string;
  club?: string;
  clubLogoUrl?: string;
  clubLogoSizes: EventorClubIconSize[];
  canceled?: boolean | null;
  distance?: EventorCompetitionDistance;
  district?: string;
  signups?: number;
  eventorUrl?: string;
}

export const marshallCompetition =
  (eventor?: EventorEventItem) =>
  (liveres: LiveresultatApi.competition): IOLCompetition => {
    let marshall: IOLCompetition = {
      id: liveres.id,
      name: liveres.name,
      organizer: liveres.organizer,
      date: moment.utc(liveres.date).format(),
      clubLogoSizes: EVENTOR_CLUB_ICON_SIZES,
      eventorAvailable: false,
      eventorUrl: undefined,
    };

    if (eventor) {
      marshall = {
        ...marshall,
        eventorAvailable: true,
        info: eventor.info,
        club: eventor.club,
        clubLogoUrl: eventor.clubLogoUrl,
        canceled: eventor.canceled,
        distance: eventor.competitionDistance,
        district: eventor.district,
        signups: eventor.signups,
        eventorUrl: eventor.url,
      };
    }

    return marshall;
  };

export const OLCompetitionResponse = new GraphQLObjectType({
  name: 'OLCompetitionResponse',
  fields: () => ({
    competitions: {
      type: new GraphQLList(OLCompetition),
      resolve: (res: IOLCompetitionResponse) => res.competitions,
    },
    today: {
      type: new GraphQLList(OLCompetition),
      resolve: (res: IOLCompetitionResponse) => res.today,
    },
    search: {
      type: GraphQLString,
      resolve: (res: IOLCompetitionResponse) => res.search,
    },
    page: {
      type: GraphQLInt,
      resolve: (res: IOLCompetitionResponse) => res.page,
    },
    lastPage: {
      type: GraphQLInt,
      resolve: (res: IOLCompetitionResponse) => res.lastPage,
    },
  }),
});

export const OLCompetition = new GraphQLObjectType({
  name: 'OLCompetition',
  fields: () => ({
    id: {
      type: GraphQLInt,
      resolve: (comp: IOLCompetition) => comp.id,
    },
    name: {
      type: GraphQLString,
      resolve: (comp: IOLCompetition) => comp.name,
    },
    organizer: {
      type: GraphQLString,
      resolve: (comp: IOLCompetition) => comp.organizer,
    },
    date: {
      type: GraphQLString,
      resolve: (comp: IOLCompetition) => comp.date,
    },
    // Eventor
    info: {
      type: GraphQLString,
      resolve: (comp: IOLCompetition) => comp.info,
    },
    club: {
      type: GraphQLString,
      resolve: (comp: IOLCompetition) => comp.club,
    },
    clubLogoUrl: {
      type: GraphQLString,
      resolve: (comp: IOLCompetition) => comp.clubLogoUrl,
    },
    clubLogoSizes: {
      type: new GraphQLList(GraphQLString),
      resolve: (comp: IOLCompetition) => comp.clubLogoSizes,
    },
    canceled: {
      type: GraphQLBoolean,
      resolve: (comp: IOLCompetition) =>
        _.isBoolean(comp.canceled) ? comp.canceled : false,
    },
    distance: {
      type: GraphQLString,
      resolve: (comp: IOLCompetition) => comp.distance,
    },
    district: {
      type: GraphQLString,
      resolve: (comp: IOLCompetition) => comp.district,
    },
    eventor: {
      type: GraphQLBoolean,
      resolve: (comp: IOLCompetition) => comp.eventorAvailable,
    },
    signups: {
      type: GraphQLInt,
      resolve: (comp: IOLCompetition) => comp.signups,
    },
    eventorUrl: {
      type: GraphQLString,
      resolve: (comp: IOLCompetition) => comp.eventorUrl,
    },
  }),
});
