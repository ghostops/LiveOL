import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import { eq, isNull, isNotNull } from 'drizzle-orm';
import {
  LiveClassesTable,
  LiveResultsTable,
  LiveSplitControllsTable,
  LiveSplitResultsTable,
  OLOrganizationsTable,
  OLRunnersTable,
} from 'lib/db/schema';
import { LiveClassWriter } from 'jobs/liveresultat/live-class-writer';
import type { LiveresultatApi } from 'lib/liveresultat/types';
import type { PushEvent, PushNotifier } from 'lib/notifications/notifier';
import { createTestDb, type TestDb } from './helpers/db';
import { json, fixtureMeta } from './helpers/fixtures';

const { main } = fixtureMeta();
const COMP = main.comp;

const classIdFor = (competitionId: number, className: string) =>
  crypto
    .createHash('md5')
    .update(`${competitionId}${encodeURIComponent(className)}`)
    .digest('hex');

const resultIdFor = (classId: string, name: string, club: string) =>
  crypto
    .createHash('md5')
    .update(
      [
        classId,
        name.trim().replace(/ /g, '_'),
        club.trim().replace(/ /g, '_'),
      ].join(':'),
    )
    .digest('hex');

const fixture = () =>
  json<LiveresultatApi.getclassresults>('legacy/getclassresults.json');

/** Deep clone so a test can mutate the payload without touching the fixture. */
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

/**
 * Captures what the writer would notify, without pulling in entitlements or
 * the Redis-backed index. Only the three members the writer calls are needed.
 */
const stubNotifier = (trackedRunnerIds: string[] = []) => {
  const dispatched: PushEvent[][] = [];
  const notifier = {
    getIndex: async () => ({}),
    subscribersFor: (_index: unknown, olRunnerId: string) =>
      trackedRunnerIds.includes(olRunnerId)
        ? [{ userId: 1, trackingId: 1 }]
        : undefined,
    dispatch: async (events: PushEvent[]) => {
      dispatched.push(events);
    },
  } as unknown as PushNotifier;
  return { notifier, dispatched, flat: () => dispatched.flat() };
};

describe('LiveClassWriter', () => {
  let harness: Awaited<ReturnType<typeof createTestDb>>;
  let db: TestDb;
  let writer: LiveClassWriter;

  before(async () => {
    harness = await createTestDb();
    db = harness.db;
  });
  after(async () => {
    await harness.close();
  });
  beforeEach(async () => {
    await harness.reset();
    writer = new LiveClassWriter(db);
  });

  test('writes the class, its split controls and every result', async () => {
    const data = fixture();
    await writer.write(COMP, data);

    const classes = await db.select().from(LiveClassesTable);
    assert.equal(classes.length, 1);
    assert.equal(classes[0]!.name, main.className);
    assert.equal(classes[0]!.liveCompetitionId, COMP);
    // The envelope `status` is persisted — the new API has no such field, so the
    // adapter has to synthesise it or this column starts going null.
    assert.equal(classes[0]!.status, 'OK');
    assert.equal(classes[0]!.liveClassId, classIdFor(COMP, main.className));

    const splits = await db
      .select()
      .from(LiveSplitControllsTable)
      .orderBy(LiveSplitControllsTable.order);
    assert.equal(splits.length, data.splitcontrols.length);
    // Order is positional, taken from the response order
    assert.deepEqual(
      splits.map(s => s.code),
      data.splitcontrols.map(s => String(s.code)),
    );
    assert.deepEqual(
      splits.map(s => s.order),
      data.splitcontrols.map((_, i) => i),
    );

    const results = await db.select().from(LiveResultsTable);
    assert.equal(results.length, data.results.length);
  });

  test('parses string times into integers and rejects non-times', async () => {
    const data = fixture();
    await writer.write(COMP, data);

    const classId = classIdFor(COMP, main.className);
    const winner = data.results.find(r => r.place === '1')!;
    const [row] = await db
      .select()
      .from(LiveResultsTable)
      .where(
        eq(
          LiveResultsTable.liveResultId,
          resultIdFor(classId, winner.name, winner.club ?? ''),
        ),
      );

    assert.ok(row);
    // Legacy sends "338300" as a string; the column is an integer
    assert.equal(row.result, Number(winner.result));
    assert.equal(row.place, '1');
    assert.equal(row.progress, 100);
    assert.equal(row.status, 0);

    // A runner who never started has result "" -> null, and timeplus "" -> null.
    // `LiveresultatApi.result` declares these as `number`, but legacy actually
    // sends strings (and "" when absent), which is why `parseResultNumber`
    // exists. Widened locally rather than papering over the mismatch.
    const wire = data.results as unknown as {
      name: string;
      club?: string;
      result: unknown;
    }[];
    const dns = wire.find(r => r.result === '' || r.result === null);
    if (dns) {
      const [dnsRow] = await db
        .select()
        .from(LiveResultsTable)
        .where(
          eq(
            LiveResultsTable.liveResultId,
            resultIdFor(classId, dns.name, dns.club ?? ''),
          ),
        );
      assert.equal(dnsRow!.result, null);
    }
  });

  test('zero and negative times are treated as missing', async () => {
    const data = clone(fixture());
    data.results = [
      {
        ...data.results[0]!,
        name: 'Zero Time',
        club: 'Z',
        result: 0 as never,
        timeplus: 0 as never,
      },
    ];
    await writer.write(COMP, data);

    const [row] = await db.select().from(LiveResultsTable);
    assert.equal(row!.result, null, '0 is not a valid finish time');
    assert.equal(row!.timeplus, null);
  });

  test('derives ol_runner and ol_organization rows', async () => {
    const data = fixture();
    await writer.write(COMP, data);

    const runners = await db.select().from(OLRunnersTable);
    const orgs = await db.select().from(OLOrganizationsTable);

    assert.ok(runners.length > 0);
    assert.ok(orgs.length > 0);

    const results = await db.select().from(LiveResultsTable);
    // Every result points at a runner and an organization that exist
    const runnerIds = new Set(runners.map(r => r.id));
    const orgIds = new Set(orgs.map(o => o.id));
    for (const r of results) {
      assert.ok(runnerIds.has(r.olRunnerId), `missing runner ${r.olRunnerId}`);
      assert.ok(orgIds.has(r.olOrganizationId));
    }
  });

  test('stores split results keyed by control code', async () => {
    const data = fixture();
    await writer.write(COMP, data);

    const classId = classIdFor(COMP, main.className);
    const winner = data.results.find(r => r.place === '1')!;
    const resultId = resultIdFor(classId, winner.name, winner.club ?? '');

    const splits = await db
      .select()
      .from(LiveSplitResultsTable)
      .where(eq(LiveSplitResultsTable.liveResultId, resultId));

    const codes = Object.keys(winner.splits).filter(k => !k.includes('_'));
    assert.equal(splits.length, codes.length);

    const first = splits.find(s => s.code === codes[0])!;
    assert.equal(first.time, winner.splits[codes[0]!]);
    assert.equal(first.place, winner.splits[`${codes[0]}_place`]);
    assert.equal(first.timeplus, winner.splits[`${codes[0]}_timeplus`]);
    assert.equal(first.status, winner.splits[`${codes[0]}_status`]);
  });

  test('is idempotent — writing twice changes no row count', async () => {
    const data = fixture();
    await writer.write(COMP, data);
    const before = await db.select().from(LiveResultsTable);

    await writer.write(COMP, fixture());
    const after = await db.select().from(LiveResultsTable);

    assert.equal(after.length, before.length);
    assert.equal((await db.select().from(LiveClassesTable)).length, 1);
    assert.deepEqual(
      after.map(r => r.liveResultId).sort(),
      before.map(r => r.liveResultId).sort(),
    );
  });

  test('skips entirely when the response has no className', async () => {
    const data = clone(fixture());
    // Liveresultat does this occasionally; master added a guard for it
    (data as { className?: string }).className = undefined;

    await writer.write(COMP, data);

    assert.equal((await db.select().from(LiveClassesTable)).length, 0);
    assert.equal((await db.select().from(LiveResultsTable)).length, 0);
  });

  test('DT_RowClass=new_result sets newResultAt, and it survives later writes', async () => {
    const data = clone(fixture());
    const target = data.results[0]!;
    target.DT_RowClass = 'new_result';

    await writer.write(COMP, data);

    const classId = classIdFor(COMP, main.className);
    const resultId = resultIdFor(classId, target.name, target.club ?? '');
    const [flagged] = await db
      .select()
      .from(LiveResultsTable)
      .where(eq(LiveResultsTable.liveResultId, resultId));
    assert.ok(flagged!.newResultAt, 'expected newResultAt to be set');

    // A later poll without the flag must not clear it (COALESCE in the upsert)
    await writer.write(COMP, fixture());
    const [after] = await db
      .select()
      .from(LiveResultsTable)
      .where(eq(LiveResultsTable.liveResultId, resultId));
    assert.deepEqual(after!.newResultAt, flagged!.newResultAt);
  });

  test('a changed result time sets newResultAt, a changed place alone does not', async () => {
    const base = clone(fixture());
    for (const r of base.results) delete r.DT_RowClass;
    await writer.write(COMP, base);

    const classId = classIdFor(COMP, main.className);
    const newResultAt = async (r: LiveresultatApi.result) => {
      const [row] = await db
        .select()
        .from(LiveResultsTable)
        .where(
          eq(
            LiveResultsTable.liveResultId,
            resultIdFor(classId, r.name, r.club ?? ''),
          ),
        );
      return row!.newResultAt;
    };

    const placeOnly = clone(base);
    placeOnly.results[0]!.place = '99';
    await writer.write(COMP, placeOnly);
    assert.equal(await newResultAt(base.results[0]!), null);

    const resultChanged = clone(base);
    resultChanged.results[0]!.result = 123456;
    await writer.write(COMP, resultChanged);
    assert.ok(await newResultAt(base.results[0]!));
    assert.equal(await newResultAt(base.results[1]!), null);
  });

  test('rows missing from a later response are soft-deleted, and restored if they return', async () => {
    const full = fixture();
    await writer.write(COMP, full);

    const dropped = full.results[0]!;
    const classId = classIdFor(COMP, main.className);
    const droppedId = resultIdFor(classId, dropped.name, dropped.club ?? '');

    const partial = clone(full);
    partial.results = partial.results.slice(1);
    await writer.write(COMP, partial);

    const [gone] = await db
      .select()
      .from(LiveResultsTable)
      .where(eq(LiveResultsTable.liveResultId, droppedId));
    assert.ok(gone!.deletedAt, 'the missing row should be soft-deleted');
    // Soft, not hard: the row and its history stay
    assert.equal(
      (await db.select().from(LiveResultsTable)).length,
      full.results.length,
    );

    await writer.write(COMP, fixture());
    const [back] = await db
      .select()
      .from(LiveResultsTable)
      .where(eq(LiveResultsTable.liveResultId, droppedId));
    assert.equal(back!.deletedAt, null, 'returning rows are undeleted');
  });

  test('an empty result list is a no-op, not a mass soft-delete', async () => {
    await writer.write(COMP, fixture());
    const seeded = fixture().results.length;

    const empty = clone(fixture());
    empty.results = [];
    await writer.write(COMP, empty);

    // `insertResults` returns early on an empty parsed list, before the
    // `notInArray` sweep, so nothing is touched. This matters for the
    // migration: the new API answers 200 with `results: []` for an unknown or
    // renamed class, and that lands here harmlessly. No client-side guard is
    // needed for it.
    const live = await db
      .select()
      .from(LiveResultsTable)
      .where(isNull(LiveResultsTable.deletedAt));
    assert.equal(
      live.length,
      seeded,
      'existing rows must survive an empty payload',
    );
    assert.equal(
      (
        await db
          .select()
          .from(LiveResultsTable)
          .where(isNotNull(LiveResultsTable.deletedAt))
      ).length,
      0,
    );
  });

  test('duplicate name+club rows are kept apart by a start+sequence suffix', async () => {
    // Competition 40467 was uploaded twice: each runner appears once finished
    // and once as a never-started ghost, with an identical start time.
    const data = json<LiveresultatApi.getclassresults>(
      'legacy/getclassresults.duplicates.json',
    );
    await writer.write(40467, data);

    const rows = await db.select().from(LiveResultsTable);
    assert.equal(
      rows.length,
      data.results.length,
      'both halves of each duplicate pair must get their own row',
    );

    const classId = classIdFor(40467, data.className);
    const dupName = data.results[0]!;
    const baseId = resultIdFor(classId, dupName.name, dupName.club ?? '');
    const mine = rows.filter(r => r.name === dupName.name);
    assert.equal(mine.length, 2);
    assert.ok(
      mine.some(r => r.liveResultId === baseId),
      'the first occurrence keeps the unsuffixed id',
    );
  });

  test('reports a finish to the notifier for a tracked runner, once it has a previous row', async () => {
    const first = clone(fixture());
    // Make the winner unfinished on the first poll so the second poll is a finish
    const winner = first.results.find(r => r.place === '1')!;
    const runnerIdOfWinner = `${winner.name.toLowerCase().replace(/\s+/g, '')}`;
    winner.result = '' as never;
    winner.status = 9;
    winner.progress = 0;
    winner.place = '';

    // Discover the generated olRunnerId by writing once without a notifier
    await writer.write(COMP, first);
    const classId = classIdFor(COMP, main.className);
    const [row] = await db
      .select()
      .from(LiveResultsTable)
      .where(
        eq(
          LiveResultsTable.liveResultId,
          resultIdFor(classId, winner.name, winner.club ?? ''),
        ),
      );
    assert.ok(row, `expected a row for ${runnerIdOfWinner}`);

    const { notifier, flat } = stubNotifier([row.olRunnerId]);
    const notifying = new LiveClassWriter(db, notifier);

    // Second poll: the real fixture, where the winner has finished
    await notifying.write(COMP, fixture());

    const events = flat();
    const finish = events.find(e => e.type === 'finish');
    assert.ok(
      finish,
      `expected a finish event, got ${events.map(e => e.type).join(',')}`,
    );
    assert.equal(finish.runnerName, winner.name);
    assert.equal(finish.className, main.className);
    assert.deepEqual(finish.subscribers, [{ userId: 1, trackingId: 1 }]);
  });

  test('does not notify for a runner seen for the first time', async () => {
    const data = fixture();
    // Write once with no notifier so nothing is known, then notify on a fresh DB
    await harness.reset();

    const probe = new LiveClassWriter(db);
    await probe.write(COMP, clone(data));
    const rows = await db.select().from(LiveResultsTable);
    const trackedIds = rows.map(r => r.olRunnerId);
    await harness.reset();

    const { notifier, flat } = stubNotifier(trackedIds);
    await new LiveClassWriter(db, notifier).write(COMP, clone(data));

    assert.deepEqual(
      flat(),
      [],
      'first import of a class must stay silent, however many runners are tracked',
    );
  });
});
