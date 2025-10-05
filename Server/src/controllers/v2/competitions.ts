import { eq } from 'drizzle-orm';
import { defaultEndpointsFactory } from 'express-zod-api';
import {
  EventorCompetitionsTable,
  LiveCompetitionsTable,
  OLCompetitionsTable,
} from 'lib/db/schema';
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
    const offset = (page - 1) * PER_PAGE;

    const r = await api.Drizzle.db
      .select()
      .from(OLCompetitionsTable)
      .leftJoin(
        LiveCompetitionsTable,
        eq(OLCompetitionsTable.liveId, LiveCompetitionsTable.id),
      )
      .leftJoin(
        EventorCompetitionsTable,
        eq(OLCompetitionsTable.eventorId, EventorCompetitionsTable.eventorId),
      )
      .limit(PER_PAGE)
      .offset(offset);

    return {
      page,
      search,
      lastPage: 1,
      nextPage: Math.min(page + 1, 1),
      competitions: r,
    };
  },
});
