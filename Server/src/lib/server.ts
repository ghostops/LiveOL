import { ApolloServer } from 'apollo-server';
import { Cache } from 'lib/redis';
import { EventorApi } from './eventor/api';
import { EventorExtractor } from './eventor/exctractor';
import { EventorScraper } from './eventor/scraper';
import { LiveresultatAPIClient } from 'lib/liveresultat';
import { schema } from 'schema';

export interface GQLContext {
    userId: string;
    Liveresultat: LiveresultatAPIClient;
    Eventor: {
        scraper: EventorExtractor;
        api: EventorApi;
    };
}

export const server = new ApolloServer({
    schema,
    context: ({ req, res }): GQLContext => {
        if (req && res) {
            const scraper = new EventorScraper('https://eventor.orientering.se', Cache);
            const eventorScraper = new EventorExtractor(scraper);

            const eventorApi = new EventorApi('https://eventor.orientering.se', process.env.EVENTOR_API_KEY, Cache);

            const liveresultatApi = new LiveresultatAPIClient(
                'https://liveresultat.orientering.se',
                Cache,
            );

            const context: GQLContext = {
                userId: req['userId'],
                Liveresultat: liveresultatApi,
                Eventor: {
                    api: eventorApi,
                    scraper: eventorScraper,
                },
            };

            return context;
        }
    },
    cors: true,
});
