import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { LiveresultatHttp2Client } from 'lib/liveresultat/http2-client';
import { createTestRedis } from './helpers/redis';
import {
  fixtureRestHandler,
  startRestHttp2Server,
} from './helpers/liveresultat-server';
import { fixtureMeta } from './helpers/fixtures';
import type Redis from 'ioredis';
import type http2 from 'http2';

const { main } = fixtureMeta();

const respond = fixtureRestHandler();

/**
 * `SyncActiveLiveCompetitionsJob` — the bulk path — uses this client, not the
 * axios one, so it needs its own coverage. The reconnect test stands in for the
 * production hang that 9ec25e3 fixed: the replacement client must survive a
 * session dying underneath it.
 */
describe('LiveresultatHttp2Client (api.orienteering.services over h2c)', () => {
  let redis: Redis;

  beforeEach(async () => {
    redis = await createTestRedis();
  });

  test('getclasses and getclassresults return the legacy shapes', async () => {
    const server = await startRestHttp2Server(respond);
    const client = new LiveresultatHttp2Client(server.url, redis);
    try {
      const classes = await client.getclasses(main.comp);
      assert.ok(classes);
      assert.deepEqual(Object.keys(classes.classes[0]!), ['className']);

      const results = await client.getclassresults(main.comp, main.className);
      assert.ok(results);
      assert.equal(results.className, main.className);
      assert.ok(Array.isArray(results.splitcontrols));
      assert.ok(!('splitControls' in results));
      assert.equal(
        server.requests[1]!.path,
        `/competitions/${main.comp}/classresults?class=${main.className}`,
      );
    } finally {
      client.close();
      await server.close();
    }
  });

  test('stores the ETag and replays it as If-None-Match, returning null on 304', async () => {
    const server = await startRestHttp2Server(respond);
    const client = new LiveresultatHttp2Client(server.url, redis);
    try {
      const first = await client.getclassresults(main.comp, main.className);
      assert.ok(first);

      const second = await client.getclassresults(main.comp, main.className);
      assert.equal(second, null);
      assert.equal(server.requests[0]!.ifNoneMatch, undefined);
      assert.equal(server.requests[1]!.ifNoneMatch, first.hash);
    } finally {
      client.close();
      await server.close();
    }
  });

  test('recovers when the server drops the session between requests', async () => {
    const sessions: http2.ServerHttp2Session[] = [];
    const server = await startRestHttp2Server(respond, s => sessions.push(s));
    const client = new LiveresultatHttp2Client(server.url, redis);

    try {
      const first = await client.getclasses(main.comp);
      assert.ok(first, 'first request should succeed');

      // Simulate the half-open/GOAWAY case that used to hang the job forever
      for (const s of sessions) s.destroy();
      await new Promise(r => setTimeout(r, 50));

      // A fresh ETag-free fetch so the reply is a full body again
      await redis.flushall();
      const second = await client.getclasses(main.comp);
      assert.ok(second, 'the client must reconnect rather than hang or throw');
      assert.deepEqual(Object.keys(second.classes[0]!), ['className']);
    } finally {
      client.close();
      await server.close();
    }
  });

  test('close() is safe to call twice', async () => {
    const server = await startRestHttp2Server(respond);
    const client = new LiveresultatHttp2Client(server.url, redis);
    await client.getclasses(main.comp);
    client.close();
    client.close();
    await server.close();
  });
});
