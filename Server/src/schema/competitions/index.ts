import { EventorEventItem, EventorCompetitionDistance } from 'lib/eventor/types';
import { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLBoolean, GraphQLEnumType } from 'graphql';
import { LiveresultatApi } from 'lib/liveresultat/types';
import { UTCTime } from 'types';
import * as _ from 'lodash';

export interface IOLCompetition {
    id: number;
    name: string;
    organizer: string;
    date: UTCTime;

    // Eventor props
    info?: string;
    club?: string;
    clubLogoUrl?: string;
    canceled?: boolean | null;
    distance?: EventorCompetitionDistance;
    district?: string;
}

export const marshallCompetition = (eventor?: EventorEventItem) => (liveres: LiveresultatApi.competition): IOLCompetition => {
    let marshall: IOLCompetition = {
        id: liveres.id,
        name: liveres.name,
        organizer: liveres.organizer,
        date: new Date(liveres.date).toUTCString(),
    };

    if (eventor) {
        marshall = {
            ...marshall,
            info: eventor.info,
            club: eventor.club,
            clubLogoUrl: eventor.clubLogoUrl,
            canceled: eventor.canceled,
            distance: eventor.competitionDistance,
            district: eventor.district,
        };
    }

    return marshall;
}

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
        canceled: {
            type: GraphQLBoolean,
            resolve: (comp: IOLCompetition) => _.isBoolean(comp.canceled) ? comp.canceled : false,
        },
        distance: {
            type: GraphQLString,
            resolve: (comp: IOLCompetition) => comp.distance,
        },
        district: {
            type: GraphQLString,
            resolve: (comp: IOLCompetition) => comp.district,
        },
    }),
});
