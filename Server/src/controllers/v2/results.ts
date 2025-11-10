import { defaultEndpointsFactory } from 'express-zod-api';
import {
  LiveClassesTable,
  LiveResultsTable,
  LiveSplitControllsTable,
  LiveSplitResultsTable,
} from 'lib/db/schema';
import { apiSingletons } from 'lib/singletons';
import { z } from 'zod/v4';
import { eq, sql } from 'drizzle-orm';
import { differenceInSeconds } from 'date-fns';
import { sortOptimalV2 } from 'lib/liveresultat/sorting';
import crypto from 'crypto';

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
  isLive: z.boolean().optional(),
  hasRecentlyUpdated: z.boolean().optional(),
  splitResults: z
    .array(
      z.object({
        code: z.string(),
        status: z.number().nullable(),
        time: z.number().nullable(),
        place: z.number().nullable(),
        timeplus: z.number().nullable(),
      }),
    )
    .optional(),
});

export type Result = z.infer<typeof resultSchema>;

export const getResultByLiveClassId = defaultEndpointsFactory.build({
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
      .where(eq(LiveResultsTable.liveClassId, liveClassId))
      .orderBy(sql`${LiveResultsTable.result} ASC NULLS LAST`);

    const liveSplitControls = await api.Drizzle.db
      .select()
      .from(LiveSplitControllsTable)
      .where(eq(LiveSplitControllsTable.liveClassId, liveClassId));

    if (liveSplitControls.length !== 0) {
      results = await Promise.all(results.map(r => attachSplitControls(r)));
    }

    // Add additional options
    const resultsWithOptions = results.map(result => {
      return {
        ...result,
        isLive: !!(
          result.start !== null &&
          result.progress !== null &&
          result.progress < 100 &&
          result.status &&
          result.status < 1
        ),
        hasRecentlyUpdated: checkIfRecentlyUpdated(result),
      };
    });

    const sortedResults = sortOptimalV2(
      resultsWithOptions,
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

async function attachSplitControls(
  liveResult: typeof LiveResultsTable.$inferSelect,
) {
  const liveSplitResults = await api.Drizzle.db
    .select()
    .from(LiveSplitResultsTable)
    .where(eq(LiveSplitResultsTable.liveResultId, liveResult.liveResultId));

  return {
    ...liveResult,
    splitResults: liveSplitResults.map(lsr => ({
      ...lsr,
      // The code must exist at this point, hopefully.
      code: lsr.code!,
    })),
  };
}

function checkIfRecentlyUpdated(result: {
  updatedAt?: Date | null;
  splitResults?: { updatedAt?: Date | null }[];
}) {
  if (
    result.updatedAt &&
    differenceInSeconds(new Date(), result.updatedAt) <= 60
  ) {
    return true;
  }
  if (result.splitResults) {
    for (const splitResult of result.splitResults) {
      if (
        splitResult.updatedAt &&
        differenceInSeconds(new Date(), splitResult.updatedAt) <= 60
      ) {
        return true;
      }
    }
  }
  return false;
}
