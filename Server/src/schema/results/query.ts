import { GQLContext } from 'lib/server';
import { GraphQLObjectType, GraphQLList, GraphQLInt, GraphQLString } from 'graphql';
import { marshallResult, IOLResult, OLResult, OLSplitControl, IOLSplitControl, marshallSplitControl } from 'schema/results';

export const ResultsQuery = new GraphQLObjectType({
    name: 'ResultsQuery',
    fields: () => ({
        getResults: {
            args: {
                competitionId: {
                    type: GraphQLInt,
                },
                className: {
                    type: GraphQLString,
                },
            },
            type: GraphQLList(OLResult),
            resolve: async (_, args, { Api }: GQLContext): Promise<IOLResult[]> => {
                if (!args.competitionId || !args.className) {
                    throw new Error('No competition id and/or class name present');
                }

                const res = await Api.getclassresults(args.competitionId, args.className);

                return res.results.map(marshallResult(args.competitionId, args.className, res.splitcontrols));
            },
        },
        getSplitControls: {
            args: {
                competitionId: {
                    type: GraphQLInt,
                },
                className: {
                    type: GraphQLString,
                },
            },
            type: GraphQLList(OLSplitControl),
            resolve: async (_, args, { Api }: GQLContext): Promise<IOLSplitControl[]> => {
                if (!args.competitionId || !args.className) {
                    throw new Error('No competition id and/or class name present');
                }

                const res = await Api.getclassresults(args.competitionId, args.className);

                return res.splitcontrols.map(marshallSplitControl);
            },
        },
    }),
});
