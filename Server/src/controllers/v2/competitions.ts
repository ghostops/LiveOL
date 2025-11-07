import { defaultEndpointsFactory } from 'express-zod-api';
import {
  EventorCompetitionsTable,
  LiveClassesTable,
  LiveCompetitionsTable,
  OLCompetitionsTable,
} from 'lib/db/schema';
import { apiSingletons } from 'lib/singletons';
import { z } from 'zod/v4';
import { eq, sql } from 'drizzle-orm';
import { EventorUrls } from 'lib/eventor/scrapers/urls';
import { URL } from 'url';

const api = apiSingletons.createApiSingletons();

export const competitionSchema = z.object({
  id: z.string(),
  olCompetitionId: z.string(),
  organizer: z.string().nullish(),
  olOrganizationId: z.string(),
  name: z.string(),
  date: z.string(),
  eventorId: z.string().nullish(),
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
  countryCode: z.string().nullish(),
  hasLiveData: z.boolean(),
  hasEventorData: z.boolean(),
});

export type Competition = z.infer<typeof competitionSchema>;
const marshalCompetition = (competition: {
  id: string;
  live: typeof LiveCompetitionsTable.$inferSelect | null;
  eventor: typeof EventorCompetitionsTable.$inferSelect | null;
}): Competition => {
  // Eventor will have prio always
  const e = competition.eventor;
  const l = competition.live;

  const eventorUrl = e
    ? EventorUrls[e.countryCode as keyof typeof EventorUrls]
    : null;

  return {
    id: competition.id,
    date: e ? (e.date as unknown as string) : (l?.date as unknown as string),
    lat: e?.lat ? Number(e.lat) : undefined,
    lng: e?.lng ? Number(e.lng) : undefined,
    links: eventorUrl
      ? e?.links?.map(link => ({
          href: new URL(link.href, eventorUrl).toString(),
          text: link.text,
        })) ?? []
      : [],
    name: e?.name ?? l?.name ?? 'Unnamed Competition',
    olCompetitionId: e ? e.olCompetitionId : l ? l.olCompetitionId : '',
    olOrganizationId: e ? e.olOrganizationId : l ? l.olOrganizationId : '',
    organizer: e?.organizer ?? l?.organizer ?? null,
    eventorId: e?.eventorId ?? null,
    distance: e?.distance ?? null,
    punchSystem: e?.punchSystem ?? null,
    notification: e?.notification ?? null,
    countryCode: e?.countryCode ?? null,
    hasLiveData: !!l,
    hasEventorData: !!e,
  };
};

export const getCompetitions = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    cursor: z.coerce.number().default(1),
    countryCode: z.string().optional(),
    now: z.string().optional(),
  }),
  output: z.object({
    page: z.number(),
    lastPage: z.number(),
    nextPage: z.number().nullable(),
    competitions: z.array(
      z.object({
        competition_date: z.string(),
        competitions: z.array(competitionSchema),
      }),
    ),
  }),
  handler: async ({ input: { cursor } }) => {
    const page: number = cursor < 1 ? 1 : cursor;
    const PER_PAGE = 10;

    const countRes = await api.Drizzle.db.execute<{ total: string }>(sql`
      SELECT COUNT(DISTINCT COALESCE(ec.date, lc.date)) as total
      FROM ol_competitions AS oc
      LEFT JOIN live_competitions AS lc ON lc."olCompetitionId" = oc.id
      LEFT JOIN eventor_competitions AS ec ON ec."olCompetitionId" = oc.id
    `);

    const totalCount = Number(countRes.rows[0]?.total || 0);

    const qRes = await api.Drizzle.db.execute<{
      competition_date: string;
      competitions: {
        competition: typeof OLCompetitionsTable.$inferSelect;
        live: typeof LiveCompetitionsTable.$inferSelect | null;
        eventor: typeof EventorCompetitionsTable.$inferSelect | null;
      }[];
    }>(sql`
      SELECT 
        DATE(COALESCE(ec.date, lc.date)) AS competition_date,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'competition', oc,
            'live', to_jsonb(lc),
            'eventor', to_jsonb(ec)
          )
        ) AS competitions
      FROM ol_competitions AS oc
      LEFT JOIN live_competitions AS lc 
        ON lc."olCompetitionId" = oc.id
      LEFT JOIN eventor_competitions AS ec 
        ON ec."olCompetitionId" = oc.id
      GROUP BY 
        DATE(COALESCE(ec.date, lc.date))
      ORDER BY 
        DATE(COALESCE(ec.date, lc.date)) DESC
      LIMIT ${PER_PAGE}
      OFFSET ${(page - 1) * PER_PAGE};
    `);

    const lastPage = Math.ceil(totalCount / PER_PAGE);
    const nextPage = page < lastPage ? page + 1 : null;

    return {
      page,
      lastPage,
      nextPage,
      competitions: qRes.rows.map(row => ({
        competition_date: row.competition_date,
        competitions: row.competitions.map(comp =>
          marshalCompetition({
            id: comp.competition.id,
            live: comp.live,
            eventor: comp.eventor,
          }),
        ),
      })),
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
    classes: z.array(
      z.object({
        name: z.string(),
        liveClassId: z.string(),
      }),
    ),
  }),
  handler: async ({ input: { id } }) => {
    const result = await api.Drizzle.db.execute<{
      competition: {
        competition: typeof OLCompetitionsTable.$inferSelect;
        live: typeof LiveCompetitionsTable.$inferSelect | null;
        eventor: typeof EventorCompetitionsTable.$inferSelect | null;
      };
    }>(sql`
      SELECT 
        JSON_BUILD_OBJECT(
          'competition', to_jsonb(oc),
          'live', to_jsonb(lc),
          'eventor', to_jsonb(ec)
        ) AS competition
      FROM ol_competitions AS oc
      LEFT JOIN live_competitions AS lc 
        ON lc."olCompetitionId" = oc.id
      LEFT JOIN eventor_competitions AS ec 
        ON ec."olCompetitionId" = oc.id
      WHERE oc.id = ${id}
      LIMIT 1;
    `);

    const competitionRow = result.rows[0]?.competition;

    if (!competitionRow) {
      throw new Error('Competition not found');
    }

    let classes: Pick<
      typeof LiveClassesTable.$inferSelect,
      'name' | 'liveClassId'
    >[] = [];

    if (competitionRow.live) {
      classes = await api.Drizzle.db
        .select({
          name: LiveClassesTable.name,
          liveClassId: LiveClassesTable.liveClassId,
        })
        .from(LiveClassesTable)
        .where(eq(LiveClassesTable.liveCompetitionId, competitionRow.live.id))
        .orderBy(LiveClassesTable.name);
    }

    return {
      competition: marshalCompetition({
        id: competitionRow.competition.id,
        live: competitionRow.live,
        eventor: competitionRow.eventor,
      }),
      classes,
    };
  },
});
