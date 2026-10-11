import { z } from 'zod/v4';
import { defaultEndpointsFactory } from 'express-zod-api';
import { and, eq } from 'drizzle-orm';
import { apiSingletons } from 'lib/singletons';
import { OLPushTokensTable, OLUsersTable } from 'lib/db/schema';
import { userMiddleware } from 'middleware/user';
import {
  allowedEvents,
  plusRequired,
  resolveNotificationPrefs,
} from 'lib/entitlements';
import {
  NOTIFICATION_EVENTS,
  PERMISSION_STATUSES,
} from 'lib/notifications/types';
import { invalidateTrackedIndex } from 'lib/notifications/tracked-index';

const api = apiSingletons.createApiSingletons();

const eventSchema = z.enum(NOTIFICATION_EVENTS);
const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:mm');

const quietHoursSchema = z.object({
  from: timeSchema,
  to: timeSchema,
  timezone: z.string().min(1).max(64),
});

const prefsSchema = z.object({
  enabled: z.boolean(),
  events: z.record(eventSchema, z.boolean()),
  quietHours: quietHoursSchema.nullable(),
});

const settingsResponseSchema = z.object({
  isPlus: z.boolean(),
  allowedEvents: z.array(eventSchema),
  prefs: prefsSchema,
});

const toSettingsResponse = (user: typeof OLUsersTable.$inferSelect) => ({
  isPlus: user.hasPlus,
  allowedEvents: allowedEvents(user),
  prefs: resolveNotificationPrefs(user),
});

export const getNotificationSettings = defaultEndpointsFactory
  .addMiddleware(userMiddleware)
  .build({
    method: 'get',
    output: settingsResponseSchema,
    handler: async ({ options: { user } }) => toSettingsResponse(user),
  });

export const updateNotificationSettings = defaultEndpointsFactory
  .addMiddleware(userMiddleware)
  .build({
    method: 'post',
    input: z.object({
      enabled: z.boolean().optional(),
      events: z.partialRecord(eventSchema, z.boolean()).optional(),
      quietHours: quietHoursSchema.nullable().optional(),
    }),
    output: settingsResponseSchema,
    handler: async ({ input, options: { user } }) => {
      const allowed = allowedEvents(user);
      const enablesLockedEvent = Object.entries(input.events ?? {}).some(
        ([event, on]) =>
          on && !allowed.includes(event as (typeof allowed)[number]),
      );
      if (enablesLockedEvent || (input.quietHours && !user.hasPlus)) {
        throw plusRequired();
      }

      const current = resolveNotificationPrefs(user);
      const prefs = {
        enabled: input.enabled ?? current.enabled,
        events: { ...current.events, ...input.events },
        quietHours:
          input.quietHours === undefined
            ? current.quietHours
            : input.quietHours,
      };

      const [updated] = await api.Drizzle.db
        .update(OLUsersTable)
        .set({ notificationPrefs: prefs, updatedAt: new Date() })
        .where(eq(OLUsersTable.id, user.id))
        .returning();

      await invalidateTrackedIndex(api.Redis);

      return toSettingsResponse(
        updated ?? { ...user, notificationPrefs: prefs },
      );
    },
  });

export const registerPushToken = defaultEndpointsFactory
  .addMiddleware(userMiddleware)
  .build({
    method: 'post',
    input: z.object({
      token: z.string().min(1).max(512),
      platform: z.enum(['ios', 'android']),
      permissionStatus: z.enum(PERMISSION_STATUSES),
    }),
    output: z.object({ success: z.boolean() }),
    handler: async ({
      input: { token, platform, permissionStatus },
      options: { user },
    }) => {
      const now = new Date();
      // A token belongs to one install; re-registering moves it to this user
      await api.Drizzle.db
        .insert(OLPushTokensTable)
        .values({
          olUserId: user.id,
          token,
          platform,
          permissionStatus,
          lastSeenAt: now,
        })
        .onConflictDoUpdate({
          target: [OLPushTokensTable.token],
          set: {
            olUserId: user.id,
            platform,
            permissionStatus,
            lastSeenAt: now,
            updatedAt: now,
          },
        });

      await invalidateTrackedIndex(api.Redis);

      return { success: true };
    },
  });

export const unregisterPushToken = defaultEndpointsFactory
  .addMiddleware(userMiddleware)
  .build({
    method: 'post',
    input: z.object({
      token: z.string().min(1).max(512),
    }),
    output: z.object({ success: z.boolean() }),
    handler: async ({ input: { token }, options: { user } }) => {
      await api.Drizzle.db
        .delete(OLPushTokensTable)
        .where(
          and(
            eq(OLPushTokensTable.token, token),
            eq(OLPushTokensTable.olUserId, user.id),
          ),
        );

      await invalidateTrackedIndex(api.Redis);

      return { success: true };
    },
  });
