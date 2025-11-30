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
import createHttpError from 'http-errors';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { endOfDay, startOfDay } from 'date-fns';

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

  const utcDate = e?.date
    ? new Date(e.date).toISOString()
    : l?.date
      ? new Date(l.date).toISOString()
      : null;

  if (!utcDate) {
    throw new Error(
      `Competition ${competition.id} is missing date in both Eventor and Live data`,
    );
  }

  return {
    id: competition.id,
    date: utcDate!,
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

export const getTodaysCompetitions = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    timezone: z.string(),
  }),
  output: z.object({
    competitions: z.array(competitionSchema),
  }),
  handler: async ({ input: { timezone } }) => {
    const nowInUserTz = toZonedTime(new Date(), timezone);

    // Get start and end of "today" in user's timezone
    const startOfToday = startOfDay(nowInUserTz);
    const endOfToday = endOfDay(nowInUserTz);

    // Convert back to UTC for DB query
    const startUTC = fromZonedTime(startOfToday, timezone);
    const endUTC = fromZonedTime(endOfToday, timezone);

    console.log('Fetching competitions between', startUTC, 'and', endUTC);

    const todayRes = await api.Drizzle.db.execute<
      typeof OLCompetitionsTable.$inferSelect & {
        live: typeof LiveCompetitionsTable.$inferSelect | null;
        eventor: typeof EventorCompetitionsTable.$inferSelect | null;
      }
    >(sql`
      SELECT 
        oc.*,
        to_jsonb(lc) AS live,
        to_jsonb(ec) AS eventor
      FROM ol_competitions AS oc
      LEFT JOIN live_competitions AS lc 
        ON lc."olCompetitionId" = oc.id
      LEFT JOIN eventor_competitions AS ec 
        ON ec."olCompetitionId" = oc.id
      WHERE DATE(COALESCE(ec.date, lc.date)) >= ${startUTC} AND DATE(COALESCE(ec.date, lc.date)) < ${endUTC};
    `);

    return {
      competitions: todayRes.rows.map(marshalCompetition),
    };
  },
});

export const getCompetitions = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    cursor: z.coerce.number().default(1),
    timezone: z.string().default('UTC'),
    countryCode: z.string().optional(),
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
    timezone: z.string(),
  }),
  handler: async ({ input: { cursor, timezone } }) => {
    const page: number = cursor < 1 ? 1 : cursor;
    const PER_PAGE = 10;

    const countRes = await api.Drizzle.db.execute<{ total: string }>(sql`
      SELECT COUNT(DISTINCT DATE(COALESCE(ec.date, lc.date) AT TIME ZONE 'UTC' AT TIME ZONE ${timezone})) as total
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
        local_date AS competition_date,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'competition', oc,
            'live', to_jsonb(lc),
            'eventor', to_jsonb(ec)
          )
        ) AS competitions
      FROM (
        SELECT 
          oc,
          lc,
          ec,
          DATE(COALESCE(ec.date, lc.date) AT TIME ZONE 'UTC' AT TIME ZONE ${timezone}) AS local_date
        FROM ol_competitions AS oc
        LEFT JOIN live_competitions AS lc 
          ON lc."olCompetitionId" = oc.id
        LEFT JOIN eventor_competitions AS ec 
          ON ec."olCompetitionId" = oc.id
      ) sub
      GROUP BY local_date
      ORDER BY local_date DESC
      LIMIT ${PER_PAGE}
      OFFSET ${(page - 1) * PER_PAGE};
    `);

    const lastPage = Math.ceil(totalCount / PER_PAGE);
    const nextPage = page < lastPage ? page + 1 : null;

    return {
      timezone,
      page,
      lastPage,
      nextPage,
      competitions: qRes.rows
        .filter(row => row.competition_date)
        .map(row => ({
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

export const searchCompetitions = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    q: z.string().optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be in YYYY-MM-DD format')
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must be in YYYY-MM-DD format')
      .optional(),
  }),
  output: z.object({
    competitions: z.array(competitionSchema),
    total: z.number(),
  }),
  handler: async ({ input: { q, startDate, endDate } }) => {
    const LIMIT = 100;

    // Build WHERE conditions dynamically
    const whereParts: ReturnType<typeof sql>[] = [];

    // Text search condition (name or organizer)
    if (q && q.trim().length > 0) {
      const searchTerm = `%${q.trim()}%`;
      whereParts.push(sql`(
        LOWER(lc.name) ILIKE ${searchTerm} OR
        LOWER(ec.name) ILIKE ${searchTerm} OR
        LOWER(lc.organizer) ILIKE ${searchTerm} OR
        LOWER(ec.organizer) ILIKE ${searchTerm}
      )`);
    }

    // Date range conditions
    if (startDate) {
      whereParts.push(sql`DATE(COALESCE(ec.date, lc.date)) >= ${startDate}`);
    }

    if (endDate) {
      whereParts.push(sql`DATE(COALESCE(ec.date, lc.date)) <= ${endDate}`);
    }

    // Combine conditions with AND
    const whereClause =
      whereParts.length > 0
        ? sql`WHERE ${sql.join(whereParts, sql` AND `)}`
        : sql``;

    const qRes = await api.Drizzle.db.execute<
      typeof OLCompetitionsTable.$inferSelect & {
        live: typeof LiveCompetitionsTable.$inferSelect | null;
        eventor: typeof EventorCompetitionsTable.$inferSelect | null;
      }
    >(sql`
      SELECT
        oc.*,
        to_jsonb(lc) AS live,
        to_jsonb(ec) AS eventor
      FROM ol_competitions AS oc
      LEFT JOIN live_competitions AS lc
        ON lc."olCompetitionId" = oc.id
      LEFT JOIN eventor_competitions AS ec
        ON ec."olCompetitionId" = oc.id
      ${whereClause}
      ORDER BY
        DATE(COALESCE(ec.date, lc.date)) DESC
      LIMIT ${LIMIT}
    `);

    return {
      competitions: qRes.rows.map(marshalCompetition),
      total: qRes.rows.length,
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
      throw createHttpError(404, 'Competition not found');
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
