import { GQLContext } from 'lib/server';
import { GraphQLObjectType, GraphQLString, graphql, introspectionQuery } from 'graphql';
import { schema } from 'schema';

export const ServerQuery = new GraphQLObjectType({
    name: 'ServerQuery',
    fields: () => ({
        getSchema: {
            type: GraphQLString,
            resolve: async (_, args, { Api }: GQLContext): Promise<string> => {
                const json = await graphql(schema, introspectionQuery);
                return JSON.stringify(json);
            },
        },
    }),
});
