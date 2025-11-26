import { getEnv } from 'lib/helpers/env';
import dotenv from 'dotenv';
import { OLSelfHelper } from 'lib/selfhelp';
import { startExpressServer } from 'express/server';
import { apiSingletons } from 'lib/singletons';

const singletons = apiSingletons.createApiSingletons();

(async () => {
  dotenv.config();

  if (getEnv('NODE_ENV', true) !== 'development') {
    const selfHelp = new OLSelfHelper();
    selfHelp.start();
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
})();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.info('SIGTERM received, shutting down gracefully...');
  await singletons.Scheduler.stop();
  await Promise.all([
    singletons.Queue.FastQueue.stopWorker(),
    singletons.Queue.RegularQueue.stopWorker(),
    singletons.Queue.RepeatingQueue.stopWorker(),
  ]);
});

process.on('SIGINT', async () => {
  console.info('SIGINT received, shutting down gracefully...');
  await singletons.Scheduler.stop();
  await Promise.all([
    singletons.Queue.FastQueue.stopWorker(),
    singletons.Queue.RegularQueue.stopWorker(),
    singletons.Queue.RepeatingQueue.stopWorker(),
  ]);
});
