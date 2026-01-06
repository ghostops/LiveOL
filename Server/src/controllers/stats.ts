import { defaultEndpointsFactory } from 'express-zod-api';
import { z } from 'zod/v4';
import { userMiddleware } from 'middleware/user';
import { apiSingletons } from 'lib/singletons';
import {
  OLTrackingTable,
  LiveResultsTable,
  LiveSplitResultsTable,
} from 'lib/db/schema';
import { and, eq, isNull, inArray, sql } from 'drizzle-orm';
import { getTrackedRunnerIds } from 'lib/match/getAllTrackedRunnerIds';

const api = apiSingletons.createApiSingletons();

export const getUserStats = defaultEndpointsFactory
  .addMiddleware(userMiddleware)
  .build({
    method: 'get',
    output: z.object({
      stats: z.object({
        racesEntered: z.number(),
        splitControlsTaken: z.number(),
        totalTimeMs: z.number(),
        averagePosition: z.number().nullable(),
      }),
    }),
    handler: async ({ options: { user } }) => {
      const [tracking] = await api.Drizzle.db
        .select()
        .from(OLTrackingTable)
        .where(
          and(
            eq(OLTrackingTable.olUserId, user.id),
            eq(OLTrackingTable.isMe, true),
          ),
        )
        .limit(1);

      if (!tracking) {
        return {
          stats: {
            racesEntered: 0,
            splitControlsTaken: 0,
            totalTimeMs: 0,
            averagePosition: null,
          },
        };
      }

      const runnerIds = getTrackedRunnerIds(tracking);

      const results = await api.Drizzle.db
        .select({
          liveResultId: LiveResultsTable.liveResultId,
          result: LiveResultsTable.result,
          place: LiveResultsTable.place,
          status: LiveResultsTable.status,
        })
        .from(LiveResultsTable)
        .where(
          and(
            inArray(LiveResultsTable.olRunnerId, runnerIds),
            isNull(LiveResultsTable.deletedAt),
          ),
        );

      const racesEntered = results.length;

      const totalTimeMs =
        results.reduce((sum, r) => {
          if (r.result && r.status === 0) return sum + r.result;
          return sum;
        }, 0) * 10; // Multiply by 10 to convert from deciseconds to milliseconds

      const validCheckpoints = results
        .map(r => r.place)
        .filter((p): p is string => p !== null)
        .map(p => parseInt(p, 10))
        .filter(p => !isNaN(p));

      const averagePosition =
        validCheckpoints.length > 0
          ? validCheckpoints.reduce((sum, p) => sum + p, 0) /
            validCheckpoints.length
          : null;

      const liveResultIds = results.map(r => r.liveResultId);
      const splitControlsCount =
        liveResultIds.length > 0
          ? await api.Drizzle.db
              .select({ count: sql<number>`count(*)::int` })
              .from(LiveSplitResultsTable)
              .where(inArray(LiveSplitResultsTable.liveResultId, liveResultIds))
              .then(rows => rows[0]?.count || 0)
          : 0;

      return {
        stats: {
          racesEntered,
          splitControlsTaken: splitControlsCount,
          totalTimeMs,
          averagePosition: averagePosition ? Math.floor(averagePosition) : null,
        },
      };
    },
  });
