import { GraphQLObjectType, GraphQLString, GraphQLBoolean } from 'graphql';
import { EventorScraper } from 'lib/eventor/scraper';
import { Cache } from 'lib/redis';

export const ServerQuery = new GraphQLObjectType({
    name: 'ServerQuery',
    fields: () => ({
        version: {
            type: GraphQLString,
            resolve: () => require('../../../package.json').version,
        },
        test: {
            type: GraphQLBoolean,
            resolve: async () => {
                const scraper = new EventorScraper('https://eventor.orientering.se', Cache);

                const res = await scraper.scrapeDateRange(new Date('2020-01-01'), new Date('2020-01-01'));

                console.log(res);

                return true;
            },
        },
    }),
});
