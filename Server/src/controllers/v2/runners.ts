import { defaultEndpointsFactory } from 'express-zod-api';
import { apiSingletons } from 'lib/singletons';
import { z } from 'zod/v4';

const api = apiSingletons.createApiSingletons();

export const getRunnersForCompetition = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    id: z.coerce.number(),
  }),
  output: z.object({
    // TODO!
    runners: z.any(),
  }),
  handler: async ({ input: { id } }) => {
    api.Drizzle;
    id;
    return { runners: [] };
  },
});
