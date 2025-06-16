import { createServer } from 'express-zod-api';
import { docsEndpoint } from './openapi';
import { config, routing } from './setup';

routing['v1/documentation'] = docsEndpoint;

// Start server
export const startExpressServer = async () => {
  await createServer(config, routing);
};
