import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type Redis from 'ioredis';
import logger from 'lib/logger';
import type { NotificationEvent } from './types';
import {
  getTrackedIndex,
  runnerKeyFromRunnerId,
  TrackedIndex,
  TrackedSubscriber,
} from './tracked-index';

type Db = NodePgDatabase<Record<string, never>>;

export type PushEvent = {
  type: NotificationEvent;
  key: string;
  liveResultId: string;
  liveCompetitionId: number;
  liveClassId: string;
  className: string;
  runnerName: string;
  club: string | null;
  result: number | null;
  place: string | null;
  status: number | null;
  splitName?: string;
  splitTime?: number | null;
  splitPlace?: number | null;
  subscribers: TrackedSubscriber[];
};

export type PushEventQueue = {
  addJob(message: {
    name: string;
    data: Record<string, string | number | boolean>;
  }): Promise<void>;
};

export const SEND_PUSH_JOB = 'send-push';

const DEDUPE_TTL_SECONDS = 3 * 24 * 60 * 60;

/**
 * Bridges result syncing and push delivery. The writer asks which runners are
 * tracked (cheap, memoized), reports changes for those only, and the notifier
 * dedupes them and hands them to the push queue.
 */
export class PushNotifier {
  constructor(
    private readonly db: Db,
    private readonly redis: Redis,
    private readonly queue: PushEventQueue,
  ) {}

  async getIndex(): Promise<TrackedIndex> {
    try {
      return await getTrackedIndex(this.db, this.redis);
    } catch (error) {
      logger.warn(`Push: failed to load tracked index: ${error}`);
      return {};
    }
  }

  subscribersFor(index: TrackedIndex, olRunnerId: string) {
    const key = runnerKeyFromRunnerId(olRunnerId);
    return key ? index[key] : undefined;
  }

  async dispatch(events: PushEvent[]) {
    if (events.length === 0) return;

    const fresh: PushEvent[] = [];
    for (const event of events) {
      // Idempotent across re-syncs and job retries: each change notifies once
      const set = await this.redis.set(
        `push:evt:${event.liveResultId}:${event.key}`,
        '1',
        'EX',
        DEDUPE_TTL_SECONDS,
        'NX',
      );
      if (set === 'OK') fresh.push(event);
    }

    if (fresh.length === 0) return;

    await this.queue.addJob({
      name: SEND_PUSH_JOB,
      data: { events: JSON.stringify(fresh) },
    });
  }
}
