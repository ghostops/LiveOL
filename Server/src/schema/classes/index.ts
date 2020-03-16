import { GraphQLObjectType, GraphQLString, GraphQLInt } from 'graphql';
import { LiveresultatApi } from 'lib/api/types';

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
