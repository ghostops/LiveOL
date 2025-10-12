import { defaultEndpointsFactory } from 'express-zod-api';
import { apiSingletons } from 'lib/singletons';
import { z } from 'zod/v4';

const api = apiSingletons.createApiSingletons();

export const getOrganization = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    id: z.coerce.number(),
  }),
  output: z.object({
    // TODO!
    organization: z.any(),
  }),
  handler: async ({ input: { id } }) => {
    id;
    api;
    // ToDo: Omit created/updated at
    return {
      organization: [],
    };
  },
});

export const getOrganizationCompetitions = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    id: z.string(),
  }),
  output: z.object({
    // TODO!
    competitions: z.any(),
  }),
  handler: async ({ input: { id } }) => {
    id;

    return {
      competitions: [],
    };
  },
});
