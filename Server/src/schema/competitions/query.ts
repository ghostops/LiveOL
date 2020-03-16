import { OLCompetition, marshallCompetition } from 'schema/competitions';
import { GraphQLObjectType, GraphQLList, GraphQLInt, GraphQLString } from 'graphql';
import { GQLContext } from 'lib/server';

export const CompetitionsQuery = new GraphQLObjectType({
    name: 'CompetitionsQuery',
    fields: () => ({
        getAllCompetitions: {
            type: GraphQLList(OLCompetition),
            resolve: async (_, args, { Api }: GQLContext): Promise<OLCompetition[]> => {
                const { competitions } = await Api.getcompetitions();
                return competitions.map(marshallCompetition);
            },
        },
        getCompetition: {
            args: {
                competitionId: {
                    type: GraphQLInt,
                },
            },
            type: OLCompetition,
            resolve: async (_, args, { Api }: GQLContext): Promise<OLCompetition> => {
                if (!args.competitionId) {
                    throw new Error('No competition id present');
                }

                const competition = await Api.getcompetition(args.competitionId);

                return marshallCompetition(competition);
            },
        },
        getCompetitionClasses: {
            args: {
                competitionId: {
                    type: GraphQLInt,
                },
                className: {
                    type: GraphQLString,
                },
            },
            type: OLCompetition,
            resolve: async (_, args, { Api }: GQLContext): Promise<OLCompetition> => {
                if (!args.competitionId || !args.className) {
                    throw new Error('No competition id and/or class name present');
                }

                const competition = await Api.getcompetition(args.competitionId);

                return marshallCompetition(competition);
            },
        }
    }),
});
