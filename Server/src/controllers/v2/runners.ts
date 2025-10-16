import { eq } from 'drizzle-orm';
import { defaultEndpointsFactory } from 'express-zod-api';
import {
  EventorCompetitionsTable,
  EventorResultsTable,
  LiveCompetitionsTable,
  LiveResultsTable,
} from 'lib/db/schema';
import { apiSingletons } from 'lib/singletons';
import { z } from 'zod/v4';

const api = apiSingletons.createApiSingletons();

export const getEventorResultsForCompetition = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    id: z.string(),
  }),
  output: z.object({
    results: z.array(
      z.object({
        eventorClassId: z.string(),
        eventorId: z.string(),
        olRunnerId: z.string(),
        place: z.string().nullish(),
        name: z.string().nullish(),
        organization: z.string().nullish(),
        olOrganizationId: z.string().nullish(),
        time: z.number().nullish(),
        timePlus: z.number().nullable(),
        status: z.string().nullish(),
        distanceInMeters: z.number().nullish(),
      }),
    ),
  }),
  handler: async ({ input: { id } }) => {
    const [competition] = await api.Drizzle.db
      .select()
      .from(EventorCompetitionsTable)
      .where(eq(EventorCompetitionsTable.olCompetitionId, id))
      .limit(1);

    if (!competition) {
      throw new Error('Competition not found');
    }

    const results = await api.Drizzle.db
      .select()
      .from(EventorResultsTable)
      .where(eq(EventorResultsTable.eventorId, competition.eventorId));

    return { results };
  },
});

const liveResultSchema = z.object({
  liveResultId: z.string(),
  liveClassId: z.string(),
  liveCompetitionId: z.number(),
  olRunnerId: z.string(),
  name: z.string(),
  organization: z.string().nullish(),
  olOrganizationId: z.string().nullish(),
  progress: z.number().nullish(),
  status: z.number().nullish(),
  place: z.string().nullish(),
});

export const getLiveResultsForCompetition = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    id: z.string(),
  }),
  output: z.object({
    results: z.array(liveResultSchema),
  }),
  handler: async ({ input: { id } }) => {
    const [competition] = await api.Drizzle.db
      .select()
      .from(LiveCompetitionsTable)
      .where(eq(LiveCompetitionsTable.olCompetitionId, id))
      .limit(1);

    if (!competition) {
      throw new Error('Competition not found');
    }

    const results = await api.Drizzle.db
      .select()
      .from(LiveResultsTable)
      .where(eq(LiveResultsTable.liveCompetitionId, competition.id));

    return { results };
  },
});
