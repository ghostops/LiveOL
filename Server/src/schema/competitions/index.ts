import { GraphQLObjectType, GraphQLString } from 'graphql';
import { LiveresultatApi } from 'lib/api/types';

export interface OLCompetition {
    id: number;
    name: string;
    organizer: string;
    date: string;
}

export const marshallCompetition = (res: LiveresultatApi.competition): OLCompetition => {
    return {
        id: res.id,
        name: res.name,
        organizer: res.organizer,
        date: new Date(res.date).toUTCString(),
    };
}

export const OLCompetition = new GraphQLObjectType({
    name: 'OLCompetition',
    fields: () => ({
        id: {
            type: GraphQLString,
            resolve: (comp: OLCompetition) => comp.id,
        },
        name: {
            type: GraphQLString,
            resolve: (comp: OLCompetition) => comp.name,
        },
        organizer: {
            type: GraphQLString,
            resolve: (comp: OLCompetition) => comp.organizer,
        },
        date: {
            type: GraphQLString,
            resolve: (comp: OLCompetition) => comp.date,
        },
    }),
});
