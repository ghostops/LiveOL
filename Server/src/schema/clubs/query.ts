import { GQLContext } from 'lib/server';
import { GraphQLObjectType, GraphQLList, GraphQLInt, GraphQLString } from 'graphql';
import { marshallPassing, IOLPassing, OLPassing } from 'schema/lastPassings';

export const ClubsQuery = new GraphQLObjectType({
    name: 'ClubsQuery',
    fields: () => ({
        getClubById: {
            args: {
                clubId: {
                    type: GraphQLInt,
                },
            },
            type: GraphQLList(OLPassing),
            resolve: async (_, args, { Liveresultat }: GQLContext): Promise<IOLPassing[]> => {
                if (!args.competitionId) {
                    throw new Error('No competition id present');
                }

                const { passings } = await Liveresultat.getlastpassings(args.competitionId);

                return passings.map(marshallPassing);
            },
        },
    }),
});
