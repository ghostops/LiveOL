import RedisMock from 'ioredis-mock';
import type Redis from 'ioredis';

/**
 * The Liveresultat flow only uses get / set (with EX) / expire / del, all of
 * which ioredis-mock implements faithfully. Using it keeps the suite free of a
 * Redis service.
 *
 * Instances share one in-memory store, so the store is flushed on creation —
 * otherwise a cached `last_hash` leaks into the next test and turns its first
 * request into a NOT MODIFIED.
 */
export const createTestRedis = async (): Promise<Redis> => {
  const redis = new RedisMock() as unknown as Redis;
  await redis.flushall();
  return redis;
};
