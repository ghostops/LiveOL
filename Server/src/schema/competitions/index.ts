import { GraphQLObjectType, GraphQLString, GraphQLInt } from 'graphql';
import { LiveresultatApi } from 'lib/api/types';

export interface IOLCompetition {
    id: number;
    name: string;
    organizer: string;
    date: string;
}

export const marshallCompetition = (res: LiveresultatApi.competition): IOLCompetition => {
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
    }),
});

export interface IOLClass {
    id: string;
    name: string;
    competition: number;
}

export const marshallClass = (id: number) => (res: LiveresultatApi._class): IOLClass => {
    return {
        id: `${id}:${res.className}`,
        competition: id,
        name: res.className,
    };
}

export const OLClass = new GraphQLObjectType({
    name: 'OLClass',
    fields: () => ({
        id: {
            type: GraphQLString,
            resolve: (comp: IOLClass) => comp.id,
        },
        competition: {
            type: GraphQLInt,
            resolve: (comp: IOLClass) => comp.competition,
        },
        name: {
            type: GraphQLString,
            resolve: (comp: IOLClass) => comp.name,
        },
    }),
});
