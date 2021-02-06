import { ApolloServer } from 'apollo-server';
import { EventorApi } from './eventor/api';
import { EventorExtractor } from './eventor/extractor';
import { EventorScraper } from './eventor/scraper';
import { LiveresultatAPIClient } from 'lib/liveresultat';
import { schema } from 'schema';
import { apiSingletons } from './singletons';
import { CombinedEventorApi } from './eventor/combiner';

export interface GQLContext {
	userId: string;
	Liveresultat: LiveresultatAPIClient;
	Eventor: CombinedEventorApi;
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
		};
	},
};

export const server = new ApolloServer({
	schema,
	context: ({ req, res }): GQLContext => {
		if (req && res) {
			const { Eventor, Liveresultat } = apiSingletons.createApiSingletons();

			// Headers will transform to lower case
			const userId = req.headers.userid;

			const context: GQLContext = {
				userId,
				Liveresultat,
				Eventor,
			};

			return context;
		}
	},
	cors: true,
	// plugins: [Logging]
});
