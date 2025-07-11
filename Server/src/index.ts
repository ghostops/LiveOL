import { getEnv } from 'lib/helpers/env';
import dotenv from 'dotenv';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { appRouter, createContext } from 'trpc';
import { OLSelfHelper } from 'lib/selfhelp';
import { startExpressServer } from 'express/server';
import { apiSingletons } from 'lib/singletons';

apiSingletons.createApiSingletons().Queue.startWorker();

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

  startExpressServer();
})();
