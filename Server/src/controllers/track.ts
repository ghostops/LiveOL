import { eq } from 'drizzle-orm';
import { defaultEndpointsFactory } from 'express-zod-api';
import db from 'lib/db';
import { trackingTable } from 'lib/db/schema';
import { z } from 'zod/v4';

const runnerSchema = z.object({
  id: z.number(),
  runnerName: z.string(),
});

export const getTrackedRunners = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    deviceId: z.string(),
  }),
  output: z.object({
    runners: z.array(runnerSchema),
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

export const removeTrackedRunner = defaultEndpointsFactory.build({
  method: 'delete',
  input: z.object({
    id: z.coerce.number(),
  }),
  output: z.object({
    success: z.boolean(),
  }),
  handler: async ({ input: { id } }) => {
    try {
      await db.delete(trackingTable).where(eq(trackingTable.id, id));

      return { success: true };
    } catch (err) {
      console.error('Error removing tracked runner:', err);
      return { success: false };
    }
  },
});

export const getTrackedRunner = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    id: z.coerce.number(),
  }),
  output: z.object({
    runner: runnerSchema,
  }),
  handler: async ({ input: { id } }) => {
    const runner = await db
      .select({ runnerName: trackingTable.runnerName, id: trackingTable.id })
      .from(trackingTable)
      .where(eq(trackingTable.id, id));

    if (runner.length === 0) {
      throw new Error('Runner not found');
    }

    return { runner: runner[0]! };
  },
});
