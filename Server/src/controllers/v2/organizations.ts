import { eq, inArray, or } from 'drizzle-orm';
import { defaultEndpointsFactory } from 'express-zod-api';
import {
  EventorCompetitionsTable,
  LiveCompetitionsTable,
  OLCompetitionsTable,
  OLOrganizationsTable,
} from 'lib/db/schema';
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
    const result = await api.Drizzle.db
      .select()
      .from(OLOrganizationsTable)
      .where(eq(OLOrganizationsTable.id, id))
      .limit(1);

    // ToDo: Omit created/updated at
    return {
      organization: result[0],
    };
  },
});

export const getOrganizationCompetitions = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    id: z.coerce.number(),
  }),
  output: z.object({
    // TODO!
    competitions: z.any(),
  }),
  handler: async ({ input: { id } }) => {
    const liveCompetitions = await api.Drizzle.db
      .select()
      .from(LiveCompetitionsTable)
      .where(eq(LiveCompetitionsTable.olOrganizerId, id));

    const eventorCompetitions = await api.Drizzle.db
      .select()
      .from(EventorCompetitionsTable)
      .where(eq(EventorCompetitionsTable.olOrganizerId, id));

    const liveIds = liveCompetitions.map(c => c.id);
    const eventorIds = eventorCompetitions.map(c => c.eventorId);

    const olCompetitions = await api.Drizzle.db
      .select()
      .from(OLCompetitionsTable)
      .where(
        or(
          inArray(OLCompetitionsTable.liveId, liveIds),
          inArray(OLCompetitionsTable.eventorId, eventorIds),
        ),
      );

    const competitions = olCompetitions.map(olComp => {
      const live = liveCompetitions.find(lc => lc.id === olComp.liveId);
      const eventor = eventorCompetitions.find(
        ec => ec.eventorId === olComp.eventorId,
      );
      return {
        id: olComp.id,
        live,
        eventor,
      };
    });

    return {
      competitions,
    };
  },
});
