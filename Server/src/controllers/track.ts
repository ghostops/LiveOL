import { eq } from 'drizzle-orm';
import { defaultEndpointsFactory } from 'express-zod-api';
import db from 'lib/db';
import { trackingTable } from 'lib/db/schema';
import { z } from 'zod/v4';

export const getTrackedRunners = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    deviceId: z.string(),
  }),
  output: z.object({
    runners: z.array(
      z.object({
        id: z.number(),
        runnerName: z.string(),
      }),
    ),
  }),
  handler: async ({ input: { deviceId } }) => {
    const runners = await db
      .select({ runnerName: trackingTable.runnerName, id: trackingTable.id })
      .from(trackingTable)
      .where(() => eq(trackingTable.deviceId, deviceId));

    return { runners };
  },
});

export const trackNewRunner = defaultEndpointsFactory.build({
  method: 'post',
  input: z.object({
    runnerName: z.string(),
    runnerClasses: z.array(z.string()),
    runnerClubs: z.array(z.string()),
    deviceId: z.string(),
  }),
  output: z.object({
    trackId: z.string(),
  }),
  handler: async ({
    input: { deviceId, runnerClasses, runnerClubs, runnerName },
  }) => {
    const res = await db
      .insert(trackingTable)
      .values({
        deviceId,
        runnerClasses: JSON.stringify(runnerClasses),
        runnerClubs: JSON.stringify(runnerClubs),
        runnerName,
      })
      .returning({ trackId: trackingTable.id });

    return { trackId: res[0]?.trackId.toString() ?? '' };
  },
});
