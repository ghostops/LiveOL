import { and, inArray, ne, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type Redis from 'ioredis';
import {
  OLPushTokensTable,
  OLTrackingTable,
  OLUsersTable,
} from 'lib/db/schema';
import { effectiveEvents, partitionTracking } from 'lib/entitlements';
import { globalSeparator } from 'lib/match/generateIds';
import { getTrackedRunnerIds } from 'lib/match/getAllTrackedRunnerIds';
import logger from 'lib/logger';

type Db = NodePgDatabase<Record<string, never>>;

export type TrackedSubscriber = { userId: number; trackingId: number };

/** Runner key ("name~club") -> users that want notifications for that runner. */
export type TrackedIndex = Record<string, TrackedSubscriber[]>;

const REDIS_KEY = 'push:tracked-index';
const REDIS_TTL_SECONDS = 60 * 60;
const MEMO_MS = 15 * 1000;

let memo: { index: TrackedIndex; at: number } | undefined;
let pending: Promise<TrackedIndex> | undefined;

/**
 * Maps an olRunnerId ("name~class~org") to the key tracking rows produce
 * ("name~club"). Mirrors the `name~%~club` LIKE match used by the results API.
 */
export const runnerKeyFromRunnerId = (olRunnerId: string) => {
  const parts = olRunnerId.split(globalSeparator);
  if (parts.length < 3) return null;
  return `${parts[0]}${globalSeparator}${parts[parts.length - 1]}`;
};

export const buildTrackedIndex = async (db: Db): Promise<TrackedIndex> => {
  const users = await db
    .select()
    .from(OLUsersTable)
    .where(
      and(
        sql`(${OLUsersTable.notificationPrefs} ->> 'enabled')::boolean = true`,
        inArray(
          OLUsersTable.id,
          db
            .select({ id: OLPushTokensTable.olUserId })
            .from(OLPushTokensTable)
            .where(ne(OLPushTokensTable.permissionStatus, 'denied')),
        ),
      ),
    );

  if (users.length === 0) return {};

  const tracking = await db
    .select()
    .from(OLTrackingTable)
    .where(
      inArray(
        OLTrackingTable.olUserId,
        users.map(u => u.id),
      ),
    );

  const index: TrackedIndex = {};

  for (const user of users) {
    const own = tracking.filter(t => t.olUserId === user.id);
    const { active } = partitionTracking(user, own);

    for (const row of active) {
      if (effectiveEvents(user, row).length === 0) continue;
      for (const key of getTrackedRunnerIds(row)) {
        (index[key] ??= []).push({ userId: user.id, trackingId: row.id });
      }
    }
  }

  return index;
};

export const getTrackedIndex = async (
  db: Db,
  redis: Redis,
): Promise<TrackedIndex> => {
  if (memo && Date.now() - memo.at < MEMO_MS) return memo.index;
  if (pending) return pending;

  pending = (async () => {
    try {
      const cached = await redis.get(REDIS_KEY);
      let index: TrackedIndex;
      if (cached) {
        index = JSON.parse(cached);
      } else {
        index = await buildTrackedIndex(db);
        await redis.set(
          REDIS_KEY,
          JSON.stringify(index),
          'EX',
          REDIS_TTL_SECONDS,
        );
      }
      memo = { index, at: Date.now() };
      return index;
    } finally {
      pending = undefined;
    }
  })();

  return pending;
};

/** Call whenever tracking, notification prefs, push tokens or Plus status change. */
export const invalidateTrackedIndex = async (redis: Redis) => {
  memo = undefined;
  try {
    await redis.del(REDIS_KEY);
  } catch (error) {
    logger.warn(`Failed to invalidate tracked index: ${error}`);
  }
};
