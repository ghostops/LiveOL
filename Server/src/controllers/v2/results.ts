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
  }),
  output: z.object({
    className: z.string(),
    results: resultSchema.array(),
    liveSplitControls: z
      .object({
        name: z.string(),
        code: z.string(),
      })
      .array()
      .optional(),
  }),
  handler: async ({ input: { liveClassId } }) => {
    const classData = await api.Drizzle.db
      .select()
      .from(LiveClassesTable)
      .where(eq(LiveClassesTable.liveClassId, liveClassId))
      .limit(1);

    const className = classData[0]?.name || 'N/A';

    const results = await api.Drizzle.db
      .select()
      .from(LiveResultsTable)
      .where(eq(LiveResultsTable.liveClassId, liveClassId))
      .orderBy(
        sql`CASE WHEN ${LiveResultsTable.status} > 0 THEN 1 ELSE 0 END ASC, ${LiveResultsTable.result} ASC NULLS LAST`,
      );

    // Add additional options
    const resultsWithLiveCheck = results.map(result => {
      return {
        ...result,
        isLive: !!(
          result.start !== null &&
          result.progress !== null &&
          result.progress < 100 &&
          result.status &&
          result.status < 1
        ),
        hasRecentlyUpdated: result.updatedAt
          ? differenceInSeconds(new Date(), result.updatedAt) <= 60
          : false,
      };
    });

    const liveSplitControls = await api.Drizzle.db
      .select()
      .from(LiveSplitControllsTable)
      .where(eq(LiveSplitControllsTable.liveClassId, liveClassId));

    if (liveSplitControls.length !== 0) {
      const resultsWithSplits = await Promise.all(
        resultsWithLiveCheck.map(r => attachSplitControls(r)),
      );

      return {
        className,
        results: resultsWithSplits,
        liveSplitControls: liveSplitControls.map(lsc => ({
          name: lsc.name,
          // Same here, the code must exist...
          code: lsc.code!,
        })),
      };
    }

    return {
      className,
      results: resultsWithLiveCheck,
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
