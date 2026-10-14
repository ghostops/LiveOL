import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { LiveresultatAPIClient } from 'lib/liveresultat/client';
import { createTestRedis } from './helpers/redis';
import {
  fixtureRestHandler,
  startRestServer,
} from './helpers/liveresultat-server';
import { json, fixtureMeta } from './helpers/fixtures';
import type { LiveresultatApi } from 'lib/liveresultat/types';
import type Redis from 'ioredis';

const { main } = fixtureMeta();
const UNKNOWN = 999999999;

/**
 * The axios client against recorded api.orienteering.services responses. The
 * contracts asserted here are the ones the legacy api.php client had: the
 * shapes, the stored hash and its expiry, and NOT MODIFIED → null.
 */
describe('LiveresultatAPIClient (api.orienteering.services)', () => {
  let server: Awaited<ReturnType<typeof startRestServer>>;
  let redis: Redis;
  let client: LiveresultatAPIClient;

  const fixtures = fixtureRestHandler();

  before(async () => {
    server = await startRestServer((url, ifNoneMatch) => {
      if (url.pathname.startsWith(`/competitions/${UNKNOWN}`)) {
        return { status: 404, body: '{"error":"Not found"}' };
      }
      if (url.searchParams.get('class') === 'broken') {
        // trailing comma + unquoted key: what jsonrepair exists for
        return {
          body: '{ "className": "broken", splitControls: [], "results": [], }',
          etag: '"broken"',
        };
      }
      return fixtures(url, ifNoneMatch);
    });
  });
  after(async () => {
    await server.close();
  });
  beforeEach(async () => {
    redis = await createTestRedis();
    client = new LiveresultatAPIClient(server.url, redis);
    server.requests.length = 0;
  });

  test('getcompetitions reads /competitions', async () => {
    const res = await client.getcompetitions();

    assert.deepEqual(res.competitions, []);
    assert.equal(server.requests[0]!.path, '/competitions');
  });

  test('getcompetitioninfo returns the legacy shape', async () => {
    const info = await client.getcompetitioninfo(main.comp);
    const legacy = json<LiveresultatApi.getcompetitioninfo>(
      'legacy/getcompetitioninfo.json',
    );

    for (const key of [
      'id',
      'name',
      'organizer',
      'date',
      'timediff',
    ] as const) {
      assert.equal(info[key], legacy[key], key);
    }
    assert.equal(server.requests[0]!.path, `/competitions/${main.comp}`);
  });

  test('getclasses returns classes as { className } objects and stores the ETag', async () => {
    const res = await client.getclasses(main.comp);

    assert.ok(res, 'expected a response on the first call');
    assert.equal(res.status, 'OK');
    // The shape the writer and jobs consume — not a bare string[]
    assert.deepEqual(Object.keys(res.classes[0]!), ['className']);
    assert.ok(res.classes.some(c => c.className === main.className));
    assert.equal(
      server.requests[0]!.path,
      `/competitions/${main.comp}/classes`,
    );

    const key = `liveresultat:lastHash:classes:${main.comp}`;
    assert.ok(res.hash, 'the ETag becomes the hash');
    assert.equal(await redis.get(key), res.hash);
    // Stored with an expiry so corrupt state self-heals
    const ttl = await redis.ttl(key);
    assert.ok(ttl > 0 && ttl <= 600, `expected a 10 minute ttl, got ${ttl}`);
  });

  test('the class list matches legacy', async () => {
    const res = await client.getclasses(main.comp);
    const legacy = json<LiveresultatApi.getclasses>('legacy/getclasses.json');

    assert.deepEqual(res!.classes, legacy.classes);
  });

  test('the first request is unconditional, the next sends If-None-Match and gets null on 304', async () => {
    const first = await client.getclasses(main.comp);
    assert.ok(first);
    assert.equal(server.requests[0]!.ifNoneMatch, undefined);

    const second = await client.getclasses(main.comp);

    assert.equal(second, null, '304 must surface as null');
    assert.equal(server.requests[1]!.ifNoneMatch, first.hash);
  });

  test('getclassresults uses the query form and stores its own hash', async () => {
    const res = await client.getclassresults(main.comp, main.className);

    assert.ok(res);
    assert.equal(res.status, 'OK');
    assert.equal(res.className, main.className);
    assert.equal(
      server.requests[0]!.path,
      `/competitions/${main.comp}/classresults?class=${main.className}`,
    );
    assert.equal(
      await redis.get(
        `liveresultat:lastHash:class:${main.className}:results:${main.comp}`,
      ),
      res.hash,
    );
  });

  test('getclassresults returns null on 304', async () => {
    assert.ok(await client.getclassresults(main.comp, main.className));
    assert.equal(await client.getclassresults(main.comp, main.className), null);
  });

  test('class names containing a slash are URL encoded in the query', async () => {
    await client.getclassresults(main.comp, 'K20/21');

    // The path form (/classes/K20%2F21/results) 404s upstream
    assert.equal(
      server.requests[0]!.path,
      `/competitions/${main.comp}/classresults?class=K20%2F21`,
    );
  });

  test('an unknown class is an empty result, not an error', async () => {
    const res = await client.getclassresults(main.comp, 'NoSuchClass');

    assert.ok(res);
    assert.deepEqual(res.results, []);
  });

  test('splitControls arrives as the legacy splitcontrols', async () => {
    const res = await client.getclassresults(main.comp, main.className);
    const legacy = json<LiveresultatApi.getclassresults>(
      'legacy/getclassresults.json',
    );

    assert.deepEqual(res!.splitcontrols, legacy.splitcontrols);
    assert.ok(!('splitControls' in res!));
  });

  test('an unknown competition throws, like any other fetch error', async () => {
    await assert.rejects(client.getclasses(UNKNOWN), /404/);
    assert.equal(
      await redis.get(`liveresultat:lastHash:classes:${UNKNOWN}`),
      null,
    );
  });

  test('malformed JSON is repaired rather than thrown', async () => {
    const res = await client.getclassresults(main.comp, 'broken');

    assert.ok(res, 'jsonrepair should have rescued the response');
    assert.equal(res.className, 'broken');
  });
});
