import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { asc, eq, isNull } from 'drizzle-orm';
import {
  LiveClassesTable,
  LiveResultsTable,
  LiveSplitControllsTable,
  LiveSplitResultsTable,
} from 'lib/db/schema';
import { LiveresultatAPIClient } from 'lib/liveresultat/client';
import { LiveClassWriter } from 'jobs/liveresultat/live-class-writer';
import { marshalResult } from 'lib/marshal/results';
import { getUtcDate } from 'lib/helpers/time';
import { CompetitionId, OrganizationId } from 'lib/match/generateIds';
import type { LiveresultatApi } from 'lib/liveresultat/types';
import { createTestDb, type TestDb } from './helpers/db';
import { createTestRedis } from './helpers/redis';
import {
  fixtureRestHandler,
  startRestServer,
} from './helpers/liveresultat-server';
import { json, fixtureMeta } from './helpers/fixtures';

const { main } = fixtureMeta();
const SNAPSHOT = path.join(__dirname, 'snapshots', 'flow.json');

/**
 * End to end over the real pieces: recorded api.orienteering.services
 * response -> real HTTP -> real client (ETag handling, adapter) -> real writer -> real Postgres ->
 * real marshal. Nothing in the chain is stubbed except the upstream server.
 *
 * The snapshot is the point. When the client is repointed at the new API, this
 * same projection of the database must come out identical — that is what makes
 * the migration provably non-regressive. Regenerate deliberately with
 * UPDATE_SNAPSHOTS=1 and review the diff.
 */
describe('full Liveresultat sync flow', () => {
  let harness: Awaited<ReturnType<typeof createTestDb>>;
  let db: TestDb;
  let server: Awaited<ReturnType<typeof startRestServer>>;

  const respond = fixtureRestHandler();

  before(async () => {
    harness = await createTestDb();
    db = harness.db;
    server = await startRestServer(respond);
  });
  after(async () => {
    await server.close();
    await harness.close();
  });
  beforeEach(async () => {
    await harness.reset();
  });

  const syncOnce = async () => {
    const redis = await createTestRedis();
    const client = new LiveresultatAPIClient(server.url, redis);

    const classes = await client.getclasses(main.comp);
    assert.ok(classes, 'class list should come back on a cold cache');
    assert.ok(classes.classes.some(c => c.className === main.className));

    const results = await client.getclassresults(main.comp, main.className);
    assert.ok(results, 'class results should come back on a cold cache');

    await new LiveClassWriter(db).write(main.comp, results);
    return results;
  };

  /** Stable projection: no serial ids, no wall-clock columns. */
  const project = async () => {
    const classes = await db
      .select()
      .from(LiveClassesTable)
      .orderBy(asc(LiveClassesTable.name));
    const results = await db
      .select()
      .from(LiveResultsTable)
      .orderBy(asc(LiveResultsTable.liveResultId));
    const controls = await db
      .select()
      .from(LiveSplitControllsTable)
      .orderBy(asc(LiveSplitControllsTable.order));
    const splits = await db
      .select()
      .from(LiveSplitResultsTable)
      .orderBy(
        asc(LiveSplitResultsTable.liveResultId),
        asc(LiveSplitResultsTable.code),
      );

    return {
      classes: classes.map(c => ({
        liveClassId: c.liveClassId,
        liveCompetitionId: c.liveCompetitionId,
        name: c.name,
        status: c.status,
      })),
      splitControls: controls.map(c => ({
        liveClassId: c.liveClassId,
        code: c.code,
        name: c.name,
        order: c.order,
      })),
      results: results.map(r => ({
        liveResultId: r.liveResultId,
        liveClassId: r.liveClassId,
        liveCompetitionId: r.liveCompetitionId,
        olRunnerId: r.olRunnerId,
        olOrganizationId: r.olOrganizationId,
        name: r.name,
        organization: r.organization,
        result: r.result,
        timeplus: r.timeplus,
        progress: r.progress,
        status: r.status,
        place: r.place,
        start: r.start,
        deletedAt: r.deletedAt,
      })),
      splitResults: splits.map(s => ({
        liveResultId: s.liveResultId,
        code: s.code,
        time: s.time,
        place: s.place,
        timeplus: s.timeplus,
        status: s.status,
      })),
    };
  };

  test('a cold sync produces the committed database snapshot', async () => {
    await syncOnce();
    const actual = await project();

    if (process.env.UPDATE_SNAPSHOTS) {
      fs.mkdirSync(path.dirname(SNAPSHOT), { recursive: true });
      fs.writeFileSync(SNAPSHOT, JSON.stringify(actual, null, 2) + '\n');
      return;
    }

    assert.ok(
      fs.existsSync(SNAPSHOT),
      'snapshot missing — run with UPDATE_SNAPSHOTS=1 to create it',
    );
    const expected = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
    assert.deepEqual(
      JSON.parse(JSON.stringify(actual)),
      expected,
      'the synced database state changed — if this is intended, review and regenerate',
    );
  });

  test('a second sync is a no-op because the hash short-circuits it', async () => {
    const redis = await createTestRedis();
    const client = new LiveresultatAPIClient(server.url, redis);

    const first = await client.getclassresults(main.comp, main.className);
    assert.ok(first);
    await new LiveClassWriter(db).write(main.comp, first);
    const afterFirst = await project();

    // The fixture server always answers with a body, so the client itself is
    // what must notice nothing changed — it replays the stored hash and the
    // upstream would answer NOT MODIFIED in production. Here we assert the
    // weaker but still essential property: re-writing identical data is inert.
    await new LiveClassWriter(db).write(main.comp, first);
    assert.deepEqual(await project(), afterFirst);
  });

  test('the marshalled /v2 result keeps the fields the app reads', async () => {
    const results = await syncOnce();

    const rows = await db
      .select()
      .from(LiveResultsTable)
      .where(isNull(LiveResultsTable.deletedAt))
      .orderBy(asc(LiveResultsTable.place));

    const marshalled = rows.map(
      marshalResult({ className: main.className, nowTimestamp: 99_999_999 }),
    );

    assert.equal(marshalled.length, results.results.length);
    for (const m of marshalled) {
      // The shape `resultSchema` in controllers/results.ts promises
      for (const key of [
        'liveResultId',
        'liveClassId',
        'liveCompetitionId',
        'olRunnerId',
        'name',
        'olOrganizationId',
        'isLive',
        'isTracking',
        'hasRecentlyUpdated',
        'className',
      ]) {
        assert.ok(key in m, `marshalled result is missing ${key}`);
      }
      assert.equal(m.className, main.className);
    }

    // This fixture is a finished competition: nobody is still running
    assert.equal(marshalled.filter(m => m.isLive).length, 0);
  });

  test('competition-level transforms: date from timediff, and the id slugs', () => {
    const info = json<LiveresultatApi.getcompetitioninfo>(
      'legacy/getcompetitioninfo.json',
    );

    // This competition reports timediff 0 and an *empty* timezone, which is why
    // the plan keeps `timediff` as the fallback rather than relying on the new
    // API's IANA field.
    assert.equal(info.timediff, 0);
    assert.equal((info as { timezone?: string }).timezone, '');

    // Midnight CET for a 2026-09-13 competition is 22:00 UTC the day before.
    const date = getUtcDate(info.date, info.timediff);
    assert.equal(date.toISOString(), '2026-09-12T22:00:00.000Z');

    assert.equal(
      new OrganizationId().generateId({ organizationName: info.organizer }),
      'fkgoingarna',
    );
  });

  test('the olCompetitionId slug depends on the process timezone', () => {
    const info = json<LiveresultatApi.getcompetitioninfo>(
      'legacy/getcompetitioninfo.json',
    );
    const date = getUtcDate(info.date, info.timediff);

    const slug = new CompetitionId().generateId({
      competitionName: info.name,
      organizationName: info.organizer,
      date,
    });

    // `CompetitionId` formats the date with date-fns `format`, which uses local
    // time. The stored date is 22:00 UTC the day before the competition, so the
    // date component equals the competition day only when the process runs in
    // CET/CEST — under TZ=UTC it comes out a day early.
    //
    // olCompetitionId is the key that joins Liveresultat to Eventor, so the
    // dependency is pinned here on purpose: the plan's IANA-timezone step must
    // not silently move every slug.
    const separator = slug.indexOf('~');
    const datePart = slug.slice(0, separator);
    const rest = slug.slice(separator + 1);

    assert.equal(rest, 'smlang(swedishleague#7)final~fkgoingarna');

    // sv-SE renders YYYY-MM-DD, and without a timeZone it uses the process
    // zone — the same thing date-fns `format` does.
    const localDate = new Intl.DateTimeFormat('sv-SE').format(date);
    assert.equal(
      datePart,
      localDate,
      'the slug date tracks the process timezone rather than the competition date',
    );
  });
});
