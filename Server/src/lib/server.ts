import { ApolloServer } from 'apollo-server';
import { LiveresultatAPIClient } from 'lib/liveresultat';
import { schema } from 'schema';
import { apiSingletons } from './singletons';
import { CombinedEventorApi } from './eventor/combiner';
import { Cacher } from './redis';

export interface GQLContext {
  userId: string;
  Liveresultat: LiveresultatAPIClient;
  Eventor: CombinedEventorApi;
  Redis: Cacher;
}

export const server = new ApolloServer({
  schema,
  context: ({ req, res }): GQLContext | undefined => {
    if (req && res) {
      const singletons = apiSingletons.createApiSingletons();

      // Headers will transform to lower case
      const userId = req.headers.userid as string;

      const context: GQLContext = {
        userId,
        ...singletons,
      };

      return context;
    }
  },
  cors: true,
});
