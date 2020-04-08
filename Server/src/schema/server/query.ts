import { GraphQLObjectType, GraphQLString, GraphQLBoolean } from 'graphql';
import { GQLContext } from 'lib/server';

export const ServerQuery = new GraphQLObjectType({
    name: 'ServerQuery',
    fields: () => ({
        version: {
            type: GraphQLString,
            resolve: () => require('../../../package.json').version,
        },
        test: {
            type: GraphQLBoolean,
            resolve: async (_, args, { }: GQLContext) => {
                return true;
            },
        },
    }),
});
