import { z } from 'zod/v4';
import { defaultEndpointsFactory } from 'express-zod-api';
import { apiSingletons } from 'lib/singletons';
import { OLTrackingTable } from 'lib/db/schema/ol_tracking';
import { OLUsersTable } from 'lib/db/schema/ol_users';
import { and, desc, eq } from 'drizzle-orm';
import createHttpError from 'http-errors';
import { userMiddleware } from 'middleware/user';
import {
  countFollowedRunners,
  FREE_FOLLOW_LIMIT,
  partitionTracking,
  plusRequired,
} from 'lib/entitlements';
import { NOTIFICATION_EVENTS } from 'lib/notifications/types';
import { invalidateTrackedIndex } from 'lib/notifications/tracked-index';

const api = apiSingletons.createApiSingletons();

// Input schemas
const createTrackingSchema = z.object({
  uid: z.string().min(1),
  name: z.string().min(1).max(255),
  clubs: z.array(z.string().max(255)).default([]),
  isMe: z.boolean().default(false),
});

const updateTrackingSchema = z.object({
  id: z.coerce.number(),
  name: z.string().min(1).max(255),
  clubs: z.array(z.string().max(255)).default([]),
  notify: z.boolean().optional(),
  // Per-runner event override, Plus only. null resets to the global settings.
  notifyEvents: z.array(z.enum(NOTIFICATION_EVENTS)).nullable().optional(),
});

const deleteTrackingSchema = z.object({
  id: z.coerce.number(),
});

const listTrackingSchema = z.object({
  uid: z.string().min(1, 'User UID is required'),
});

// Output schema
const trackingResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  clubs: z.array(z.string()),
  notify: z.boolean(),
  notifyEvents: z.array(z.enum(NOTIFICATION_EVENTS)).nullable(),
});

const listedTrackingSchema = trackingResponseSchema.extend({
  // Followed beyond the free limit by a user without Plus
  locked: z.boolean(),
});

// List tracked runners for a user
export const listTracking = defaultEndpointsFactory.build({
  method: 'get',
  input: listTrackingSchema,
  output: z.object({
    tracking: z.array(listedTrackingSchema),
    limits: z.object({
      maxFollowed: z.number().nullable(),
      followedCount: z.number(),
    }),
  }),
  handler: async ({ input }) => {
    const { uid } = input;

    // Get user by uid
    const [user] = await api.Drizzle.db
      .select()
      .from(OLUsersTable)
      .where(eq(OLUsersTable.uid, uid))
      .limit(1);

    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    // Get tracking records with runner details
    const trackingRecords = await api.Drizzle.db
      .select()
      .from(OLTrackingTable)
      .where(
        and(
          eq(OLTrackingTable.olUserId, user.id),
          eq(OLTrackingTable.isMe, false),
        ),
      )
      .orderBy(desc(OLTrackingTable.createdAt));

    const { locked } = partitionTracking(user, trackingRecords);
    const lockedIds = new Set(locked.map(t => t.id));

    return {
      tracking: trackingRecords.map(t => ({
        ...t,
        locked: lockedIds.has(t.id),
      })),
      limits: {
        maxFollowed: user.hasPlus ? null : FREE_FOLLOW_LIMIT,
        followedCount: trackingRecords.length,
      },
    };
  },
});

// Create new tracked runner
export const createTracking = defaultEndpointsFactory.build({
  method: 'post',
  input: createTrackingSchema,
  output: trackingResponseSchema,
  handler: async ({ input }) => {
    const { uid, name, clubs, isMe } = input;

    // Get user by uid
    const [user] = await api.Drizzle.db
      .select()
      .from(OLUsersTable)
      .where(eq(OLUsersTable.uid, uid))
      .limit(1);

    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    if (
      !isMe &&
      !user.hasPlus &&
      (await countFollowedRunners(api.Drizzle.db, user.id)) >= FREE_FOLLOW_LIMIT
    ) {
      throw plusRequired();
    }

    // Create runner
    const [tracking] = await api.Drizzle.db
      .insert(OLTrackingTable)
      .values({
        name,
        clubs,
        olUserId: user.id,
        isMe,
      })
      .returning();

    if (!tracking) {
      throw createHttpError(500, 'Failed to create tracking record');
    }

    await invalidateTrackedIndex(api.Redis);

    return tracking;
  },
});

// Update tracked runner
export const updateTracking = defaultEndpointsFactory.build({
  method: 'put',
  input: updateTrackingSchema,
  output: trackingResponseSchema,
  handler: async ({ input }) => {
    const { id, name, clubs, notify, notifyEvents } = input;

    // Get tracking record to find runner ID
    const [trackingRecord] = await api.Drizzle.db
      .select()
      .from(OLTrackingTable)
      .where(eq(OLTrackingTable.id, id))
      .limit(1);

    if (!trackingRecord) {
      throw createHttpError(404, 'Tracking record not found');
    }

    if (notifyEvents) {
      const [owner] = await api.Drizzle.db
        .select({ hasPlus: OLUsersTable.hasPlus })
        .from(OLUsersTable)
        .where(eq(OLUsersTable.id, trackingRecord.olUserId))
        .limit(1);
      if (!owner?.hasPlus) {
        throw plusRequired();
      }
    }

    // Update tracking record timestamp
    const [updatedTracking] = await api.Drizzle.db
      .update(OLTrackingTable)
      .set({
        name,
        clubs,
        notify,
        notifyEvents,
        updatedAt: new Date(),
      })
      .where(eq(OLTrackingTable.id, id))
      .returning();

    if (!updatedTracking) {
      throw createHttpError(500, 'Failed to update tracking record');
    }

    await invalidateTrackedIndex(api.Redis);

    return updatedTracking;
  },
});

// Delete tracked runner
export const deleteTracking = defaultEndpointsFactory.build({
  method: 'delete',
  input: deleteTrackingSchema,
  output: z.object({
    success: z.boolean(),
  }),
  handler: async ({ input }) => {
    const { id } = input;

    await api.Drizzle.db
      .delete(OLTrackingTable)
      .where(eq(OLTrackingTable.id, id));

    await invalidateTrackedIndex(api.Redis);

    return { success: true };
  },
});

export const getUserSelfTracking = defaultEndpointsFactory
  .addMiddleware(userMiddleware)
  .build({
    method: 'get',
    output: z.object({
      tracking: trackingResponseSchema.nullable(),
    }),
    handler: async ({ options: { user } }) => {
      // Get tracking records with runner details
      const trackingRecord = await api.Drizzle.db
        .select()
        .from(OLTrackingTable)
        .where(
          and(
            eq(OLTrackingTable.olUserId, user.id),
            eq(OLTrackingTable.isMe, true),
          ),
        )
        .orderBy(desc(OLTrackingTable.createdAt))
        .limit(1);

      if (!trackingRecord[0]) {
        return { tracking: null };
      }

      return { tracking: trackingRecord[0] };
    },
  });
