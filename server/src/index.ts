import { getEnv } from 'lib/helpers/env';
import dotenv from 'dotenv';
import { OLSelfHelper } from 'lib/selfhelp';
import { startExpressServer } from 'express/server';
import { apiSingletons } from 'lib/singletons';
import logger from 'lib/logger';

const singletons = apiSingletons.createApiSingletons();

(async () => {
  dotenv.config();

  if (getEnv('NODE_ENV', true) !== 'development') {
    // Todo: Turn this on at some point
    // const selfHelp = new OLSelfHelper();
    // selfHelp.start();
  }

  // Start all queue workers
  await Promise.all([
    singletons.Queue.FastQueue.startWorker(),
    singletons.Queue.RegularQueue.startWorker(),
    singletons.Queue.RepeatingQueue.startWorker(),
  ]);

  // Start the job scheduler
  await singletons.Scheduler.start();

  startExpressServer();

  logger.info(
    `Server timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
  );
})();

async function gracefulShutdown() {
  await singletons.Scheduler.stop();
  await Promise.all([
    singletons.Queue.FastQueue.stopWorker(),
    singletons.Queue.RegularQueue.stopWorker(),
    singletons.Queue.RepeatingQueue.stopWorker(),
  ]);
}

process.on('SIGINT', async () => {
  console.info('SIGINT received, shutting down gracefully...');
  await gracefulShutdown();
  process.exit(0);
});

process.once('SIGUSR2', async () => {
  console.log('SIGUSR2 received (nodemon restart)');
  await gracefulShutdown();
  process.kill(process.pid, 'SIGUSR2');
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received');
  await gracefulShutdown();
  process.exit(0);
});
