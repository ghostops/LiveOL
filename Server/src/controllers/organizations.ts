import { eq, sql } from 'drizzle-orm';
import { defaultEndpointsFactory } from 'express-zod-api';
import {
  EventorCompetitionsTable,
  LiveCompetitionsTable,
  OLOrganizationsTable,
} from 'lib/db/schema';
import { apiSingletons } from 'lib/singletons';
import { z } from 'zod/v4';

const api = apiSingletons.createApiSingletons();

export const getOrganization = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    id: z.string(),
  }),
  output: z.object({
    organization: z
      .object({
        id: z.string(),
        eventorName: z.string().nullish(),
        liveName: z.string().nullish(),
      })
      .nullable(),
  }),
  handler: async ({ input: { id } }) => {
    const [olOrganization] = await api.Drizzle.db
      .select()
      .from(OLOrganizationsTable)
      .where(eq(OLOrganizationsTable.id, id))
      .limit(1);

    if (!olOrganization) {
      return {
        organization: null,
      };
    }

    const [eventor] = await api.Drizzle.db
      .select()
      .from(EventorCompetitionsTable)
      .where(eq(EventorCompetitionsTable.olOrganizationId, olOrganization.id))
      .orderBy(sql`${EventorCompetitionsTable.createdAt} desc`)
      .limit(1);

    const [live] = await api.Drizzle.db
      .select()
      .from(LiveCompetitionsTable)
      .where(eq(LiveCompetitionsTable.olOrganizationId, olOrganization.id))
      .orderBy(sql`${LiveCompetitionsTable.createdAt} desc`)
      .limit(1);

    const organization = {
      id: olOrganization.id,
      eventorName: eventor?.organizer,
      liveName: live?.organizer,
    };

    return {
      organization,
    };
  },
});

export const getOrganizationCompetitions = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    id: z.string(),
  }),
  output: z.object({
    competitions: z.any(),
  }),
  handler: async ({ input: { id } }) => {
    const [olOrganization] = await api.Drizzle.db
      .select()
      .from(OLOrganizationsTable)
      .where(eq(OLOrganizationsTable.id, id))
      .limit(1);

    if (!olOrganization) {
      return {
        competitions: [],
      };
    }

    const eventorCompetitions = await api.Drizzle.db
      .select()
      .from(EventorCompetitionsTable)
      .where(eq(EventorCompetitionsTable.olOrganizationId, olOrganization.id))
      .orderBy(sql`${EventorCompetitionsTable.date} desc`);

    const liveCompetitions = await api.Drizzle.db
      .select()
      .from(LiveCompetitionsTable)
      .where(eq(LiveCompetitionsTable.olOrganizationId, olOrganization.id))
      .orderBy(sql`${LiveCompetitionsTable.date} desc`);

    const allIds = Array.from(
      new Set([
        ...eventorCompetitions.map(comp => comp.id),
        ...liveCompetitions.map(comp => comp.id),
      ]),
    );

    const competitions = allIds.map(id => {
      const live = liveCompetitions.find(comp => comp.id === id);
      const eventor = eventorCompetitions.find(comp => comp.id === id);
      return {
        id: (eventor?.olCompetitionId || live?.olCompetitionId) as string,
        live: live
          ? {
              ...live,
              date: live.date ? live.date.toISOString() : '',
              isPublic: Boolean(live.isPublic),
            }
          : undefined,
        eventor: eventor
          ? {
              ...eventor,
              date: eventor.date ? eventor.date.toISOString() : '',
              lat: eventor.lat ? Number(eventor.lat) : undefined,
              lng: eventor.lng ? Number(eventor.lng) : undefined,
              links: eventor.links ?? [],
            }
          : undefined,
      };
    });

    return {
      competitions,
    };
  },
});
