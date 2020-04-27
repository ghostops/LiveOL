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

const Logging = {
    // Fires whenever a GraphQL request is received from a client.
    requestDidStart(requestContext) {
        console.log('Request started! Query:\n' + requestContext.request.query);

        return {
            // Fires whenever Apollo Server will parse a GraphQL
            // request to create its associated document AST.
            parsingDidStart(requestContext) {
                console.log('Parsing started!');
            },

            // Fires whenever Apollo Server will validate a
            // request's document AST against your GraphQL schema.
            validationDidStart(requestContext) {
                console.log('Validation started!');
            },
        }
    },
};

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

            // Headers will transform to lower case
            const userId = req.headers.userid;

            const context: GQLContext = {
                userId,
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
    // plugins: [Logging]
});
