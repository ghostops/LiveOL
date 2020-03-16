import { GQLContext } from 'lib/server';
import { GraphQLObjectType, GraphQLList, GraphQLInt, GraphQLString } from 'graphql';
import { OLClass, IOLClass, marshallClass } from 'schema/classes';
import { OLCompetition, marshallCompetition, IOLCompetition } from 'schema/competitions';

export const CompetitionsQuery = new GraphQLObjectType({
    name: 'CompetitionsQuery',
    fields: () => ({
        getAllCompetitions: {
            type: GraphQLList(OLCompetition),
            resolve: async (_, args, { Api }: GQLContext): Promise<IOLCompetition[]> => {
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
            resolve: async (_, args, { Api }: GQLContext): Promise<IOLCompetition> => {
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
            },
            type: GraphQLList(OLClass),
            resolve: async (_, args, { Api }: GQLContext): Promise<IOLClass[]> => {
                if (!args.competitionId) {
                    throw new Error('No competition id present');
                }

                const { classes } = await Api.getclasses(args.competitionId);

                return classes.map(marshallClass(args.competitionId));
            },
        }
    }),
});
