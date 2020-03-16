import { APIClient } from 'lib/api';
import { Cache } from 'lib/redis';
import { gql, ApolloServer } from 'apollo-server';
import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList } from 'graphql';
import { schema } from 'schema';

export interface GQLContext {
    userId: string;
    Api: APIClient
}

export const server = new ApolloServer({
    schema,
    context: ({ req, res, connection }): GQLContext => {
        if (req && res) {
            const context: GQLContext = {
                userId: req['userId'],
                Api: new APIClient(
                    'https://liveresultat.orientering.se',
                    Cache,
                ),
            };

            return context;
        }
    },
});
