import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
  GraphQLNonNull,
} from 'graphql';
import { PlusCodeHandler } from 'lib/plusCodes/validator';
import { GQLContext } from 'lib/server';

export const ServerQuery = new GraphQLObjectType({
  name: 'ServerQuery',
  fields: () => ({
    version: {
      type: GraphQLString,
      resolve: () => require('../../../package.json').version,
    },
    validatePlusCode: {
      args: {
        code: {
          type: GraphQLNonNull(GraphQLString),
        },
        deviceId: {
          type: GraphQLNonNull(GraphQLString),
        },
      },
      type: GraphQLBoolean,
      resolve: async (
        _,
        args: { code: string; deviceId: string },
        { Redis }: GQLContext,
      ) => {
        const handler = new PlusCodeHandler(Redis);
        const hasPlus = await handler.validatePlusCode(
          args.code,
          args.deviceId,
        );
        return hasPlus;
      },
    },
  }),
});
