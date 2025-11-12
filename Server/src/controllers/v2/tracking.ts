import { z } from 'zod/v4';
import { defaultEndpointsFactory } from 'express-zod-api';
import { apiSingletons } from 'lib/singletons';
import { OLTrackingTable } from 'lib/db/schema/ol_tracking';
import { OLUsersTable } from 'lib/db/schema/ol_users';
import { desc, eq } from 'drizzle-orm';

const api = apiSingletons.createApiSingletons();

// Input schemas
const createTrackingSchema = z.object({
  uid: z.string().min(1),
  name: z.string().min(1).max(255),
  clubs: z.array(z.string().max(255)).default([]),
  classes: z.array(z.string().max(255)).default([]),
});

const updateTrackingSchema = z.object({
  id: z.coerce.number(),
  name: z.string().min(1).max(255),
  clubs: z.array(z.string().max(255)).default([]),
  classes: z.array(z.string().max(255)).default([]),
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
  classes: z.array(z.string()),
});

// List tracked runners for a user
export const listTracking = defaultEndpointsFactory.build({
  method: 'get',
  input: listTrackingSchema,
  output: z.object({
    tracking: z.array(trackingResponseSchema),
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
      throw new Error('User not found');
    }

    // Get tracking records with runner details
    const trackingRecords = await api.Drizzle.db
      .select()
      .from(OLTrackingTable)
      .where(eq(OLTrackingTable.olUserId, user.id))
      .orderBy(desc(OLTrackingTable.createdAt));

    return { tracking: trackingRecords };
  },
});

// Create new tracked runner
export const createTracking = defaultEndpointsFactory.build({
  method: 'post',
  input: createTrackingSchema,
  output: trackingResponseSchema,
  handler: async ({ input }) => {
    const { uid, name, clubs, classes } = input;

    // Get user by uid
    const [user] = await api.Drizzle.db
      .select()
      .from(OLUsersTable)
      .where(eq(OLUsersTable.uid, uid))
      .limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    // Create runner
    const [tracking] = await api.Drizzle.db
      .insert(OLTrackingTable)
      .values({
        name,
        clubs,
        classes,
        olUserId: user.id,
      })
      .returning();

    if (!tracking) {
      throw new Error('Failed to create tracking record');
    }

    return tracking;
  },
});

// Update tracked runner
export const updateTracking = defaultEndpointsFactory.build({
  method: 'put',
  input: updateTrackingSchema,
  output: trackingResponseSchema,
  handler: async ({ input }) => {
    const { id, name, clubs, classes } = input;

    // Get tracking record to find runner ID
    const [trackingRecord] = await api.Drizzle.db
      .select()
      .from(OLTrackingTable)
      .where(eq(OLTrackingTable.id, id))
      .limit(1);

    if (!trackingRecord) {
      throw new Error('Tracking record not found');
    }

    // Update tracking record timestamp
    const [updatedTracking] = await api.Drizzle.db
      .update(OLTrackingTable)
      .set({
        name,
        clubs,
        classes,
        updatedAt: new Date(),
      })
      .where(eq(OLTrackingTable.id, id))
      .returning();

    if (!updatedTracking) {
      throw new Error('Failed to update tracking record');
    }

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

    return { success: true };
  },
});
