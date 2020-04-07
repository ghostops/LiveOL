import { GraphQLObjectType, GraphQLString, GraphQLBoolean } from 'graphql';
import { EventorScraper } from 'lib/eventor/scraper';
import { EventorExtractor } from 'lib/eventor/exctractor';
import { LiveresultatAPIClient } from 'lib/liveresultat';
import { Cache } from 'lib/redis';
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
