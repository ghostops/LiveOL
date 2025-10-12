import { defaultEndpointsFactory } from 'express-zod-api';
import { apiSingletons } from 'lib/singletons';
import { z } from 'zod/v4';

const api = apiSingletons.createApiSingletons();

export const getCompetitions = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    cursor: z.coerce.number().default(1),
    search: z.string().optional(),
  }),
  output: z.object({
    page: z.number(),
    search: z.string().optional(),
    lastPage: z.number(),
    nextPage: z.number(),
    // TODO!
    competitions: z.any(),
  }),
  handler: async ({ input: { cursor, search } }) => {
    const page: number = cursor < 1 ? 1 : cursor;
    const PER_PAGE = 50;
    PER_PAGE;

    return {
      page,
      search,
      // TODO: Fix page params
      lastPage: 1,
      nextPage: Math.min(page + 1, 1),
      competitions: [],
    };
  },
});

export const getCompetition = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    id: z.coerce.number(),
  }),
  output: z.object({
    // TODO!
    competition: z.any(),
  }),
  handler: async ({ input: { id } }) => {
    id;
    api;
    return {
      competition: null,
    };
  },
});
