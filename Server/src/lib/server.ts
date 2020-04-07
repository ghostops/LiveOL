import { ApolloServer } from 'apollo-server';
import { Cache } from 'lib/redis';
import { EventorExtractor } from './eventor/exctractor';
import { EventorScraper } from './eventor/scraper';
import { LiveresultatAPIClient } from 'lib/liveresultat';
import { schema } from 'schema';

export interface GQLContext {
    userId: string;
    Liveresultat: LiveresultatAPIClient;
    Eventor: EventorExtractor;
}

export const server = new ApolloServer({
    schema,
    context: ({ req, res, connection }): GQLContext => {
        if (req && res) {
            const scraper = new EventorScraper('https://eventor.orientering.se', Cache);

            const context: GQLContext = {
                userId: req['userId'],
                Liveresultat: new LiveresultatAPIClient(
                    'https://liveresultat.orientering.se',
                    Cache,
                ),
                Eventor:new EventorExtractor(scraper),
            };

            return context;
        }
    },
    cors: true,
});
