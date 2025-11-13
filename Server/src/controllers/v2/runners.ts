import { eq } from 'drizzle-orm';
import { defaultEndpointsFactory } from 'express-zod-api';
import { EventorCompetitionsTable, EventorResultsTable } from 'lib/db/schema';
import { apiSingletons } from 'lib/singletons';
import { z } from 'zod/v4';
import createHttpError from 'http-errors';

const api = apiSingletons.createApiSingletons();

export const getEventorResultsForCompetition = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    id: z.string(),
  }),
  output: z.object({
    results: z.array(
      z.object({
        olClassId: z.string(),
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
      throw createHttpError(404, 'Competition not found');
    }

    const results = await api.Drizzle.db
      .select()
      .from(EventorResultsTable)
      // TODO: FIX THIS
      .where(eq(EventorResultsTable.eventorDatabaseId, 1));

    return { results };
  },
});
