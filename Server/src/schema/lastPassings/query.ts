import { GQLContext } from 'lib/server';
import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLInt,
  GraphQLString,
} from 'graphql';
import { marshallPassing, IOLPassing, OLPassing } from 'schema/lastPassings';

export const LastPassingsQuery = new GraphQLObjectType({
  name: 'LastPassingsQuery',
  fields: () => ({
    getLastPassings: {
      args: {
        competitionId: {
          type: GraphQLInt,
        },
      },
      type: GraphQLList(OLPassing),
      resolve: async (
        _,
        args,
        { Liveresultat }: GQLContext,
      ): Promise<IOLPassing[]> => {
        if (!args.competitionId) {
          throw new Error('No competition id present');
        }

        const { passings } = await Liveresultat.getlastpassings(
          args.competitionId,
        );

        return passings.map(marshallPassing);
      },
    },
  }),
});
