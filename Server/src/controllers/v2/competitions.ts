import { asc, eq, gt } from 'drizzle-orm';
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

    const result = await api.Drizzle.db
      .select()
      .from(OLCompetitionsTable)
      .where(cursor ? gt(OLCompetitionsTable.id, cursor) : undefined)
      .leftJoin(
        LiveCompetitionsTable,
        eq(OLCompetitionsTable.liveId, LiveCompetitionsTable.id),
      )
      .leftJoin(
        EventorCompetitionsTable,
        eq(OLCompetitionsTable.eventorId, EventorCompetitionsTable.eventorId),
      )
      .limit(PER_PAGE)
      .orderBy(asc(EventorCompetitionsTable.date));

    const mapped = result.map(r => ({
      id: r.ol_competitions.id,
      eventor: r.eventor_competitions,
      live: r.live_competitions,
    }));

    return {
      page,
      search,
      // TODO: Fix page params
      lastPage: 1,
      nextPage: Math.min(page + 1, 1),
      competitions: mapped,
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
    const result = await api.Drizzle.db
      .select()
      .from(OLCompetitionsTable)
      .where(eq(OLCompetitionsTable.id, id))
      .leftJoin(
        LiveCompetitionsTable,
        eq(OLCompetitionsTable.liveId, LiveCompetitionsTable.id),
      )
      .leftJoin(
        EventorCompetitionsTable,
        eq(OLCompetitionsTable.eventorId, EventorCompetitionsTable.eventorId),
      )
      .limit(1);

    const mapped = result.map(r => ({
      id: r.ol_competitions.id,
      eventor: r.eventor_competitions,
      live: r.live_competitions,
    }));

    return {
      competition: mapped[0],
    };
  },
});
