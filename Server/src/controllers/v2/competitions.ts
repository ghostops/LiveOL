import { defaultEndpointsFactory } from 'express-zod-api';
import {
  EventorCompetitionsTable,
  LiveCompetitionsTable,
  OLCompetitionsTable,
} from 'lib/db/schema';
import { apiSingletons } from 'lib/singletons';
import { z } from 'zod/v4';
import { count, eq, isNull, or } from 'drizzle-orm';

const api = apiSingletons.createApiSingletons();

export const competitionSchema = z.object({
  id: z.string(),
  live: z
    .object({
      name: z.string(),
      organizer: z.string().nullish(),
      olOrganizationId: z.string(),
      date: z.string(),
      isPublic: z.boolean(),
      olCompetitionId: z.string(),
    })
    .optional(),
  eventor: z
    .object({
      eventorId: z.string(),
      name: z.string(),
      organizer: z.string().nullish(),
      olOrganizationId: z.string(),
      status: z.string().nullish(),
      date: z.string(),
      distance: z.string().nullish(),
      punchSystem: z.string().nullish(),
      lat: z.number().nullish(),
      lng: z.number().nullish(),
      notification: z.string().nullish(),
      links: z.array(
        z.object({
          href: z.string(),
          text: z.string(),
        }),
      ),
      olCompetitionId: z.string(),
      countryCode: z.string(),
    })
    .optional(),
});

const fetchCompetitions = async (
  olCompetitions: (typeof OLCompetitionsTable.$inferSelect)[],
) => {
  return await Promise.all(
    olCompetitions.map(async comp => {
      const [liveComp] = await api.Drizzle.db
        .select()
        .from(LiveCompetitionsTable)
        .where(eq(LiveCompetitionsTable.olCompetitionId, comp.id))
        .limit(1);
      const [eventorComp] = await api.Drizzle.db
        .select()
        .from(EventorCompetitionsTable)
        .where(eq(EventorCompetitionsTable.olCompetitionId, comp.id))
        .limit(1);

      return {
        id: comp.id,
        live: liveComp
          ? {
              ...liveComp,
              date: liveComp.date ? liveComp.date.toISOString() : '',
              isPublic: Boolean(liveComp.isPublic),
            }
          : undefined,
        eventor: eventorComp
          ? {
              ...eventorComp,
              date: eventorComp.date ? eventorComp.date.toISOString() : '',
              lat: eventorComp.lat ? Number(eventorComp.lat) : undefined,
              lng: eventorComp.lng ? Number(eventorComp.lng) : undefined,
              links: eventorComp.links ?? [],
            }
          : undefined,
      };
    }),
  );
};

export const getCompetitions = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    cursor: z.coerce.number().default(1),
    countryCode: z.string().optional(),
  }),
  output: z.object({
    page: z.number(),
    lastPage: z.number(),
    nextPage: z.number(),
    competitions: z.array(competitionSchema),
  }),
  handler: async ({ input: { cursor, countryCode } }) => {
    const page: number = cursor < 1 ? 1 : cursor;
    const PER_PAGE = 50;

    // Get total count for pagination
    const [res] = await api.Drizzle.db
      .select({ count: count() })
      .from(OLCompetitionsTable)
      .where(
        // If we have a country code, filter by it and include all with null country code
        countryCode
          ? or(
              eq(OLCompetitionsTable.countryCode, countryCode),
              isNull(OLCompetitionsTable.countryCode),
            )
          : undefined,
      );

    const lastPage = Math.max(1, Math.ceil(Number(res?.count) / PER_PAGE));
    const nextPage = page < lastPage ? page + 1 : lastPage;

    const olCompetitions = await api.Drizzle.db
      .select()
      .from(OLCompetitionsTable)
      .limit(PER_PAGE)
      .offset((page - 1) * PER_PAGE);

    return {
      page,
      lastPage,
      nextPage,
      competitions: await fetchCompetitions(olCompetitions),
    };
  },
});

export const getCompetition = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    id: z.string(),
  }),
  output: z.object({
    competition: competitionSchema,
  }),
  handler: async ({ input: { id } }) => {
    const olCompetitions = await api.Drizzle.db
      .select()
      .from(OLCompetitionsTable)
      .where(eq(OLCompetitionsTable.id, id));

    const [competition] = await fetchCompetitions(olCompetitions);
    if (!competition) {
      throw new Error('Competition not found');
    }
    return {
      competition,
    };
  },
});
