import { GQLContext } from 'lib/server';
import { GraphQLObjectType, GraphQLString, graphql, introspectionQuery } from 'graphql';
import { schema } from 'schema';

export const ServerQuery = new GraphQLObjectType({
    name: 'ServerQuery',
    fields: () => ({
        version: {
            type: GraphQLString,
            resolve: () => require('../../../package.json').version,
        },
    }),
});
