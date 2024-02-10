import { getEnv } from 'lib/helpers/env';
import * as dotenv from 'dotenv';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { appRouter, createContext } from 'trpc';
import { OLSelfHelper } from 'lib/selfhelp';

(async () => {
  dotenv.config();

  const selfHelp = new OLSelfHelper();

  if (getEnv('NODE_ENV', true) !== 'development') {
    selfHelp.start();
  }

  const trpcServer = createHTTPServer({
    router: appRouter,
    createContext,
    batching: {
      enabled: false,
    },
  });

  const port = 3001;
  trpcServer.listen(port);
  console.info(
    `🚀  TRPC Server ready on port "${port}" with env "${getEnv('env') || 'dev'}"`,
  );

  console.info(`Test responses enabled: "${getEnv('test') || 'false'}"`);
})();
