import { defaultEndpointsFactory, Documentation } from 'express-zod-api';
import { routing, config } from './setup';
import { z } from 'zod/v4';

const openApiJson = new Documentation({
  routing,
  config,
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  version: require('../../package.json').version,
  title: 'LiveOL API',
  serverUrl: 'https://api-liveol.larsendahl.se',
  composition: 'inline',
}).getSpecAsJson();

const parsed = JSON.parse(openApiJson);

export const docsEndpoint = defaultEndpointsFactory.build({
  method: 'get',
  input: undefined,
  output: z.any(),
  handler: async () => {
    return parsed;
  },
});
