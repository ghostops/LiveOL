import { GraphQLObjectType, GraphQLString, GraphQLInt } from 'graphql';
import { LiveresultatApi } from 'lib/api/types';

export interface IOLResult {

}

// export interface IOLResults {
//     className: string;
//     splits: IOLSplit[];
//     results: IOLResult[];
// }

// export const marshallCompetition = (res: LiveresultatApi.competition): IOLCompetition => {
//     return {
//         id: res.id,
//         name: res.name,
//         organizer: res.organizer,
//         date: new Date(res.date).toUTCString(),
//     };
// }

// export const OLCompetition = new GraphQLObjectType({
//     name: 'OLCompetition',
//     fields: () => ({
//         id: {
//             type: GraphQLString,
//             resolve: (comp: IOLCompetition) => comp.id,
//         },
//         name: {
//             type: GraphQLString,
//             resolve: (comp: IOLCompetition) => comp.name,
//         },
//         organizer: {
//             type: GraphQLString,
//             resolve: (comp: IOLCompetition) => comp.organizer,
//         },
//         date: {
//             type: GraphQLString,
//             resolve: (comp: IOLCompetition) => comp.date,
//         },
//     }),
// });
