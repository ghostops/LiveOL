import { getEnv } from 'lib/helpers/env';
import dotenv from 'dotenv';
import { OLSelfHelper } from 'lib/selfhelp';
import { startExpressServer } from 'express/server';
import { apiSingletons } from 'lib/singletons';

const singletons = apiSingletons.createApiSingletons();

(async () => {
  dotenv.config();

  const selfHelp = new OLSelfHelper();

  if (getEnv('NODE_ENV', true) !== 'development') {
    selfHelp.start();
  }

  await singletons.Queue.startWorker();

  // Start the job scheduler
  await singletons.Scheduler.start();

  console.info(`Test responses enabled: "${getEnv('test') || 'false'}"`);

  startExpressServer();
})();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.info('SIGTERM received, shutting down gracefully...');
  await singletons.Scheduler.stop();
  await singletons.Queue.stopWorker();
});

process.on('SIGINT', async () => {
  console.info('SIGINT received, shutting down gracefully...');
  await singletons.Scheduler.stop();
  await singletons.Queue.stopWorker();
});
