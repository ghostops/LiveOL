import { defaultEndpointsFactory } from 'express-zod-api';
import {
  LiveClassesTable,
  LiveCompetitionsTable,
  LiveResultsTable,
  LiveSplitControllsTable,
  LiveSplitResultsTable,
  OLTrackingTable,
} from 'lib/db/schema';
import { apiSingletons } from 'lib/singletons';
import { z } from 'zod/v4';
import { and, eq, getTableColumns, isNull, sql } from 'drizzle-orm';
import { sortOptimalV2 } from 'lib/helpers/sorting';
import crypto from 'crypto';
import { marshalResult } from 'lib/marshal/results';
import { userMiddleware } from 'middleware/user';
import { getTrackedRunnerIds } from 'lib/match/getAllTrackedRunnerIds';
import createHttpError from 'http-errors';

const api = apiSingletons.createApiSingletons();

export const resultSchema = z.object({
  liveResultId: z.string(),
  liveClassId: z.string(),
  liveCompetitionId: z.number(),
  olRunnerId: z.string(),
  name: z.string(),
  organization: z.string().nullable(),
  olOrganizationId: z.string(),
  result: z.number().nullable(),
  timeplus: z.number().nullable(),
  progress: z.number().nullable(),
  status: z.number().nullable(),
  place: z.string().nullable(),
  start: z.number().nullable(),
  isLive: z.boolean(),
  isTracking: z.boolean(),
  hasRecentlyUpdated: z.boolean().optional(),
  className: z.string().optional(),
  splitResults: z
    .array(
      z.object({
        code: z.string(),
        status: z.number().nullish(),
        time: z.number().nullish(),
        place: z.number().nullish(),
        timeplus: z.number().nullish(),
      }),
    )
    .optional(),
});

export type Result = z.infer<typeof resultSchema>;

export const getResultByLiveClassId = defaultEndpointsFactory
  .addMiddleware(userMiddleware)
  .build({
    method: 'get',
    input: z.object({
      liveClassId: z.string(),
      sortingKey: z.string().optional(),
      sortingDirection: z.enum(['asc', 'desc']).optional(),
      nowTimestamp: z.coerce.number(),
    }),
    output: z.object({
      hash: z.string(),
      className: z.string(),
      results: resultSchema.array(),
      liveSplitControls: z
        .object({
          name: z.string(),
          code: z.string(),
        })
        .array(),
    }),
    handler: async ({
      input: { liveClassId, sortingDirection, sortingKey, nowTimestamp },
      options: { user },
    }) => {
      const classData = await api.Drizzle.db
        .select()
        .from(LiveClassesTable)
        .where(eq(LiveClassesTable.liveClassId, liveClassId))
        .limit(1);

      const className = classData[0]?.name || 'N/A';

      let results = await api.Drizzle.db
        .select()
        .from(LiveResultsTable)
        .where(
          and(
            eq(LiveResultsTable.liveClassId, liveClassId),
            isNull(LiveResultsTable.deletedAt),
          ),
        )
        .orderBy(sql`${LiveResultsTable.result} ASC NULLS LAST`);

      const liveSplitControls = await api.Drizzle.db
        .select()
        .from(LiveSplitControllsTable)
        .where(eq(LiveSplitControllsTable.liveClassId, liveClassId));

      if (liveSplitControls.length !== 0) {
        results = await Promise.all(results.map(r => attachSplitControls(r)));
      }

      const tracking = await api.Drizzle.db
        .select()
        .from(OLTrackingTable)
        .where(eq(OLTrackingTable.olUserId, user.id));

      const marshaledResults = results.map(
        marshalResult({ user, tracking, className }),
      );

      const sortedResults = sortOptimalV2(
        marshaledResults,
        sortingKey || 'place',
        sortingDirection || 'asc',
        nowTimestamp,
      );

      const hash = crypto
        .createHash('md5')
        .update(JSON.stringify(sortedResults))
        .digest('hex');

      return {
        className,
        results: sortedResults,
        liveSplitControls: liveSplitControls.map(lsc => ({
          name: lsc.name,
          // Same here, the code must exist...
          code: lsc.code!,
        })),
        hash,
      };
    },
  });

// This can probably be optimized with a join, but for now this will do.
async function attachSplitControls(
  liveResult: typeof LiveResultsTable.$inferSelect,
) {
  const liveSplitResults = await api.Drizzle.db
    .select()
    .from(LiveSplitResultsTable)
    .where(eq(LiveSplitResultsTable.liveResultId, liveResult.liveResultId))
    .orderBy(LiveSplitResultsTable.code);

  return {
    ...liveResult,
    splitResults: liveSplitResults
      .map(lsr => ({
        ...lsr,
        // The code must exist at this point, hopefully.
        code: lsr.code!,
      }))
      .sort((a, b) => (a.code < b.code ? -1 : 1)),
  };
}

export const getLiveResultsForOrganisation = defaultEndpointsFactory
  .addMiddleware(userMiddleware)
  .build({
    method: 'get',
    input: z.object({
      olCompetitionId: z.string(),
      olOrganizationId: z.string(),
      sortingKey: z.string().optional(),
      sortingDirection: z.enum(['asc', 'desc']).optional(),
      nowTimestamp: z.coerce.number(),
    }),
    output: z.object({
      results: resultSchema.array(),
    }),
    handler: async ({
      input: {
        olCompetitionId,
        olOrganizationId,
        sortingKey,
        sortingDirection,
        nowTimestamp,
      },
      options: { user },
    }) => {
      const [competition] = await api.Drizzle.db
        .select()
        .from(LiveCompetitionsTable)
        .where(eq(LiveCompetitionsTable.olCompetitionId, olCompetitionId))
        .limit(1);

      if (!competition) {
        throw createHttpError(404, 'Competition not found');
      }

      const results = await api.Drizzle.db
        .select({
          ...getTableColumns(LiveResultsTable),
          className: LiveClassesTable.name,
        })
        .from(LiveResultsTable)
        .leftJoin(
          LiveClassesTable,
          eq(LiveResultsTable.liveClassId, LiveClassesTable.liveClassId),
        )
        .where(
          and(
            eq(LiveResultsTable.liveCompetitionId, competition.id),
            eq(LiveResultsTable.olOrganizationId, olOrganizationId),
            isNull(LiveResultsTable.deletedAt),
          ),
        )
        .orderBy(sql`${LiveResultsTable.result} ASC NULLS LAST`);

      const marshaledResults = results.map(marshalResult({ user }));

      const sortedResults = sortOptimalV2(
        marshaledResults,
        sortingKey || 'place',
        sortingDirection || 'asc',
        nowTimestamp,
      );

      return { results: sortedResults };
    },
  });

export const getLiveResultsForTrackedRunner = defaultEndpointsFactory
  .addMiddleware(userMiddleware)
  .build({
    method: 'get',
    input: z.object({
      trackingId: z.coerce.number(),
      sortingKey: z.string().optional(),
      sortingDirection: z.enum(['asc', 'desc']).optional(),
      nowTimestamp: z.coerce.number(),
    }),
    output: z.object({
      results: resultSchema
        .extend({
          competitionName: z.string().nullish(),
          olCompetitionId: z.string().nullish(),
        })
        .array(),
    }),
    handler: async ({
      input: { trackingId, nowTimestamp, sortingDirection, sortingKey },
      options: { user },
    }) => {
      const [tracking] = await api.Drizzle.db
        .select()
        .from(OLTrackingTable)
        .where(eq(OLTrackingTable.id, trackingId))
        .limit(1);

      if (!tracking) {
        throw createHttpError(404, 'Tracking not found');
      }

      const allPotentialIds = getTrackedRunnerIds(tracking);

      if (allPotentialIds.length === 0) {
        return { results: [] };
      }

      const results = await api.Drizzle.db
        .select({
          ...getTableColumns(LiveResultsTable),
          className: LiveClassesTable.name,
          competitionName: LiveCompetitionsTable.name,
          olCompetitionId: LiveCompetitionsTable.olCompetitionId,
        })
        .from(LiveResultsTable)
        .leftJoin(
          LiveClassesTable,
          eq(LiveResultsTable.liveClassId, LiveClassesTable.liveClassId),
        )
        .leftJoin(
          LiveCompetitionsTable,
          eq(LiveResultsTable.liveCompetitionId, LiveCompetitionsTable.id),
        )
        .where(
          and(
            // Build a safe IN (...) clause from the list of ids
            sql`${LiveResultsTable.olRunnerId} IN (${sql.join(
              allPotentialIds.map(id => sql`${id}`),
              sql`, `,
            )})`,
            isNull(LiveResultsTable.deletedAt),
          ),
        )
        .orderBy(sql`${LiveResultsTable.updatedAt} ASC NULLS LAST`);

      const marshaledResults = results.map(marshalResult({ user }));

      const sortedResults = sortOptimalV2(
        marshaledResults,
        sortingKey || 'place',
        sortingDirection || 'asc',
        nowTimestamp,
      );

      return { results: sortedResults };
    },
  });
