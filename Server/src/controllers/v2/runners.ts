import { eq, inArray } from 'drizzle-orm';
import { defaultEndpointsFactory } from 'express-zod-api';
import {
  EventorResultsTable,
  LiveResultsTable,
  OLCompetitionsTable,
  OLRunnersTable,
} from 'lib/db/schema';
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
    const [competition] = await api.Drizzle.db
      .select()
      .from(OLCompetitionsTable)
      .where(eq(OLCompetitionsTable.id, id))
      .limit(1);

    if (!competition) {
      throw new Error('Competition not found');
    }

    let eventorResults: any[] = [];
    let eventorSignups: any[] = [];
    let liveRunners: any[] = [];

    if (competition.eventorId) {
      eventorResults = await api.Drizzle.db
        .select()
        .from(EventorResultsTable)
        .where(eq(EventorResultsTable.eventorId, competition.eventorId));

      eventorSignups = await api.Drizzle.db
        .select()
        .from(EventorResultsTable)
        .where(eq(EventorResultsTable.eventorId, competition.eventorId));
    }

    if (competition.liveId) {
      liveRunners = await api.Drizzle.db
        .select()
        .from(LiveResultsTable)
        .where(eq(LiveResultsTable.liveCompetitionId, competition.liveId));
    }

    const allOlRunnerIds = [
      ...eventorResults.map(r => r.olRunnerId).filter(Boolean),
      ...eventorSignups.map(r => r.olRunnerId).filter(Boolean),
      ...liveRunners.map(r => r.olRunnerId).filter(Boolean),
    ] as number[];

    const uniqueOlRunnerIds = Array.from(new Set(allOlRunnerIds));

    const olRunners = await api.Drizzle.db
      .select()
      .from(OLRunnersTable)
      .where(inArray(OLRunnersTable.id, uniqueOlRunnerIds));

    return {
      runners: olRunners,
      competition,
    };
  },
});
