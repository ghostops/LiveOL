import { getEnv } from 'lib/helpers/env';
import dotenv from 'dotenv';
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

  console.info(`Test responses enabled: "${getEnv('test') || 'false'}"`);

  startExpressServer();
})();
