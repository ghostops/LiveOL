import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { LiveresultatAPIClient } from 'lib/liveresultat/client';
import { createTestRedis } from './helpers/redis';
import { startLegacyServer } from './helpers/liveresultat-server';
import { raw, fixtureMeta } from './helpers/fixtures';
import type Redis from 'ioredis';

const { main } = fixtureMeta();

/**
 * Characterises the axios client against recorded legacy responses. This is the
 * layer the migration replaces, so every behaviour asserted here is a contract
 * the new client has to reproduce.
 */
describe('LiveresultatAPIClient (legacy api.php)', () => {
  let server: Awaited<ReturnType<typeof startLegacyServer>>;
  let redis: Redis;
  let client: LiveresultatAPIClient;

  const respond = (query: URLSearchParams) => {
    const method = query.get('method');
    const lastHash = query.get('last_hash');

    if (method === 'getcompetitioninfo') {
      return raw('legacy/getcompetitioninfo.json');
    }
    if (method === 'getclasses') {
      return lastHash && lastHash !== 'null'
        ? raw('legacy/getclasses.notmodified.json')
        : raw('legacy/getclasses.json');
    }
    if (method === 'getclassresults') {
      if (lastHash && lastHash !== 'null') {
        return raw('legacy/getclassresults.notmodified.json');
      }
      return query.get('class') === 'broken'
        ? // trailing comma + unquoted key: what jsonrepair exists for
          '{ "status": "OK", "className": "broken", splitcontrols: [], "results": [], "hash": "h1", }'
        : raw('legacy/getclassresults.json');
    }
    return { status: 400, body: '{}' };
  };

  before(async () => {
    server = await startLegacyServer(respond);
  });
  after(async () => {
    await server.close();
  });
  beforeEach(async () => {
    redis = await createTestRedis();
    client = new LiveresultatAPIClient(server.url, redis);
    server.requests.length = 0;
  });

  test('getcompetitioninfo returns the parsed competition', async () => {
    const info = await client.getcompetitioninfo(main.comp);

    assert.equal(info.id, main.comp);
    assert.equal(typeof info.name, 'string');
    assert.equal(typeof info.date, 'string');
    assert.equal(typeof info.timediff, 'number');
    assert.match(server.requests[0]!, /method=getcompetitioninfo&comp=40488/);
  });

  test('getclasses returns classes as { className } objects and stores the hash', async () => {
    const res = await client.getclasses(main.comp);

    assert.ok(res, 'expected a response on the first call');
    assert.equal(res.status, 'OK');
    assert.ok(Array.isArray(res.classes));
    assert.ok(res.classes.length > 0);
    // The shape the writer and jobs consume — not a bare string[]
    assert.deepEqual(Object.keys(res.classes[0]!), ['className']);
    assert.ok(res.classes.some(c => c.className === main.className));

    const stored = await redis.get(
      `liveresultat:lastHash:classes:${main.comp}`,
    );
    assert.equal(stored, res.hash);
    // Stored with an expiry so corrupt state self-heals
    const ttl = await redis.ttl(`liveresultat:lastHash:classes:${main.comp}`);
    assert.ok(ttl > 0 && ttl <= 600, `expected a 10 minute ttl, got ${ttl}`);
  });

  test('getclasses sends the stored hash and returns null when NOT MODIFIED', async () => {
    const first = await client.getclasses(main.comp);
    assert.ok(first);

    const second = await client.getclasses(main.comp);

    assert.equal(second, null, 'NOT MODIFIED must surface as null');
    assert.match(server.requests[1]!, new RegExp(`last_hash=${first.hash}`));
  });

  test('the first call sends last_hash=null rather than omitting it', async () => {
    await client.getclasses(main.comp);

    // Pinned because it is what the server currently receives; the replacement
    // must not start omitting a parameter the upstream may treat differently.
    assert.match(server.requests[0]!, /last_hash=null/);
  });

  test('getclassresults asks for unformatted times and stores its own hash', async () => {
    const res = await client.getclassresults(main.comp, main.className);

    assert.ok(res);
    assert.equal(res.className, main.className);
    assert.match(server.requests[0]!, /unformattedTimes=true/);
    assert.match(server.requests[0]!, /class=D18A/);

    const stored = await redis.get(
      `liveresultat:lastHash:class:${main.className}:results:${main.comp}`,
    );
    assert.equal(stored, res.hash);
  });

  test('getclassresults returns null when NOT MODIFIED', async () => {
    assert.ok(await client.getclassresults(main.comp, main.className));
    assert.equal(await client.getclassresults(main.comp, main.className), null);
  });

  test('class names containing a slash are URL encoded', async () => {
    await client.getclassresults(main.comp, 'K20/21');

    assert.match(server.requests[0]!, /class=K20%2F21/);
    assert.ok(
      !server.requests[0]!.includes('class=K20/21'),
      'an unencoded slash would change the request path',
    );
  });

  test('legacy splitcontrols and string times survive parsing unchanged', async () => {
    const res = await client.getclassresults(main.comp, main.className);
    assert.ok(res);

    // Lowercase `splitcontrols` is the legacy spelling the writer reads
    assert.ok(Array.isArray(res.splitcontrols));
    assert.equal(typeof res.splitcontrols[0]!.code, 'number');

    // Legacy sends result/timeplus as strings even with unformattedTimes=true.
    // The new API sends integers, so this is a difference the adapter inherits.
    const finished = res.results.find(r => r.place === '1')!;
    assert.equal(typeof finished.result, 'string');
    assert.equal(typeof finished.timeplus, 'string');
  });

  test('malformed JSON is repaired rather than thrown', async () => {
    const res = await client.getclassresults(main.comp, 'broken');

    assert.ok(res, 'jsonrepair should have rescued the response');
    assert.equal(res.className, 'broken');
  });
});
