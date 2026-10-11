import { and, asc, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import createHttpError from 'http-errors';
import { OLTrackingTable, OLUsersTable } from 'lib/db/schema';
import {
  NOTIFICATION_EVENTS,
  NotificationEvent,
  NotificationPrefs,
} from 'lib/notifications/types';

type Db = NodePgDatabase<Record<string, never>>;
type User = typeof OLUsersTable.$inferSelect;
type Tracking = typeof OLTrackingTable.$inferSelect;

/** Runners a free user may follow, not counting their own "me" profile. */
export const FREE_FOLLOW_LIMIT = 1;

export const FREE_NOTIFICATION_EVENTS: NotificationEvent[] = ['finish'];

export const PLUS_REQUIRED = 'plus_required';

export const plusRequired = () => createHttpError(403, PLUS_REQUIRED);

export const allowedEvents = (user: Pick<User, 'hasPlus'>) =>
  user.hasPlus ? [...NOTIFICATION_EVENTS] : FREE_NOTIFICATION_EVENTS;

export const defaultNotificationPrefs = (): NotificationPrefs => ({
  enabled: false,
  events: {
    start: false,
    split: true,
    finish: true,
    placeChange: false,
    status: true,
  },
  quietHours: null,
});

export const resolveNotificationPrefs = (
  user: Pick<User, 'notificationPrefs'>,
): NotificationPrefs => {
  const defaults = defaultNotificationPrefs();
  const stored = user.notificationPrefs;
  if (!stored) return defaults;
  return {
    enabled: stored.enabled ?? defaults.enabled,
    events: { ...defaults.events, ...stored.events },
    quietHours: stored.quietHours ?? null,
  };
};

/**
 * Events a user will actually receive for a given tracked runner: what they
 * enabled, limited to what their tier allows. Per-runner overrides are Plus only.
 */
export const effectiveEvents = (
  user: Pick<User, 'hasPlus' | 'notificationPrefs'>,
  tracking?: Pick<Tracking, 'notify' | 'notifyEvents'>,
): NotificationEvent[] => {
  const prefs = resolveNotificationPrefs(user);
  if (!prefs.enabled || tracking?.notify === false) return [];

  const allowed = allowedEvents(user);
  const override = user.hasPlus ? tracking?.notifyEvents : null;

  return allowed.filter(event =>
    override ? override.includes(event) : prefs.events[event],
  );
};

/**
 * Splits a user's tracking rows into the ones they can use and the ones
 * locked behind Plus. Free users keep "me" plus their oldest followed runner.
 */
export const partitionTracking = <T extends Tracking>(
  user: Pick<User, 'hasPlus'>,
  tracking: T[],
): { active: T[]; locked: T[] } => {
  if (user.hasPlus) return { active: tracking, locked: [] };

  const me = tracking.filter(t => t.isMe);
  const followed = tracking
    .filter(t => !t.isMe)
    .sort(
      (a, b) =>
        (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0) ||
        a.id - b.id,
    );

  return {
    active: [...me, ...followed.slice(0, FREE_FOLLOW_LIMIT)],
    locked: followed.slice(FREE_FOLLOW_LIMIT),
  };
};

export const getActiveTracking = async (
  db: Db,
  user: Pick<User, 'id' | 'hasPlus'>,
) => {
  const tracking = await db
    .select()
    .from(OLTrackingTable)
    .where(eq(OLTrackingTable.olUserId, user.id))
    .orderBy(asc(OLTrackingTable.createdAt), asc(OLTrackingTable.id));

  return partitionTracking(user, tracking).active;
};

export const countFollowedRunners = async (db: Db, userId: number) => {
  const rows = await db
    .select({ id: OLTrackingTable.id })
    .from(OLTrackingTable)
    .where(
      and(
        eq(OLTrackingTable.olUserId, userId),
        eq(OLTrackingTable.isMe, false),
      ),
    );
  return rows.length;
};
