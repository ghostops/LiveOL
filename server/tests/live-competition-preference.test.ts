import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { eq, sql } from 'drizzle-orm';
import { LiveCompetitionsTable, OLCompetitionsTable } from 'lib/db/schema';
import {
  liveCompetitionPreference,
  preferredLiveCompetitionJoin,
} from 'lib/helpers/live-competition';
import { LiveClassWriter } from 'jobs/liveresultat/live-class-writer';
import type { LiveresultatApi } from 'lib/liveresultat/types';
import { createTestDb, type TestDb } from './helpers/db';
import { json } from './helpers/fixtures';

/**
 * 40877 and 40878 are the same race uploaded twice to Liveresultat; the
 * organizer differs only by a space, so both slug to one olCompetitionId.
 * 40877 never got any classes. Every read by olCompetitionId must land on
 * 40878, and the race must be listed once.
 */
const OL_ID = '2026-10-14~veteran-3-stad~vanersborgssk';

describe('preferred live competition for a shared olCompetitionId', () => {
  let harness: Awaited<ReturnType<typeof createTestDb>>;
  let db: TestDb;

  const competition = (id: number, hasClasses = false) => ({
    id,
    name: 'Veteran-3-stad',
    organizer: 'Vänersborgs SK',
    olOrganizationId: 'vanersborgssk',
    olCompetitionId: OL_ID,
    date: new Date('2026-10-13T22:00:00Z'),
    hasClasses,
  });

  /** What getCompetition and the list queries join on. */
  const joined = async () => {
    const res = await db.execute<{ id: number | null }>(sql`
      SELECT lc.id FROM ol_competitions AS oc
      ${preferredLiveCompetitionJoin}
      WHERE oc.id = ${OL_ID}
    `);
    return res.rows;
  };

  /** What getLiveResultsForOrganisation picks. */
  const picked = async () => {
    const [row] = await db
      .select()
      .from(LiveCompetitionsTable)
      .where(eq(LiveCompetitionsTable.olCompetitionId, OL_ID))
      .orderBy(liveCompetitionPreference('"live_competitions"'))
      .limit(1);
    return row?.id;
  };

  const plan = async (query: ReturnType<typeof sql>) =>
    (await db.execute<{ 'QUERY PLAN': string }>(sql`EXPLAIN ${query}`)).rows
      .map(r => r['QUERY PLAN'])
      .join('\n');

  before(async () => {
    harness = await createTestDb();
    db = harness.db;
  });
  after(async () => {
    await harness.close();
  });
  beforeEach(async () => {
    await harness.reset();
    await db.insert(OLCompetitionsTable).values({ id: OL_ID });
  });

  test('the upload with classes wins over an older or newer empty one', async () => {
    await db
      .insert(LiveCompetitionsTable)
      .values([competition(40877), competition(40878, true)]);

    assert.deepEqual(await joined(), [{ id: 40878 }]);
    assert.equal(await picked(), 40878);

    await db.insert(LiveCompetitionsTable).values(competition(40999));
    assert.deepEqual(await joined(), [{ id: 40878 }]);
    assert.equal(await picked(), 40878);
  });

  test('with no classes anywhere, the newest upload wins', async () => {
    await db
      .insert(LiveCompetitionsTable)
      .values([competition(40877), competition(40878)]);

    assert.deepEqual(await joined(), [{ id: 40878 }]);
    assert.equal(await picked(), 40878);
  });

  test('the race is listed once even when every upload has classes', async () => {
    await db
      .insert(LiveCompetitionsTable)
      .values([competition(40877, true), competition(40878, true)]);

    assert.deepEqual(await joined(), [{ id: 40878 }]);
  });

  test('a competition without live data still joins to null', async () => {
    assert.deepEqual(await joined(), [{ id: null }]);
  });

  test('the writer sets hasClasses when it writes the first class', async () => {
    await db.insert(LiveCompetitionsTable).values(competition(40878));
    const results = json<LiveresultatApi.getclassresults>(
      'legacy/getclassresults.json',
    );

    await new LiveClassWriter(db).write(40878, results);

    const [row] = await db
      .select()
      .from(LiveCompetitionsTable)
      .where(eq(LiveCompetitionsTable.id, 40878));
    assert.equal(row!.hasClasses, true);
  });

  test('the migration backfills hasClasses from existing classes', async () => {
    await db
      .insert(LiveCompetitionsTable)
      .values([competition(40877), competition(40878)]);
    await db.execute(sql`
      INSERT INTO live_classes ("liveClassId", "liveCompetitionId", name)
      VALUES ('x', 40878, 'Enkla')`);

    const migration = fs.readFileSync(
      path.join(
        __dirname,
        '..',
        'drizzle',
        '0015_live_competitions_has_classes.sql',
      ),
      'utf8',
    );
    const backfill = migration.split('--> statement-breakpoint')[1]!;
    await db.execute(sql.raw(backfill));

    const rows = await db
      .select({
        id: LiveCompetitionsTable.id,
        hasClasses: LiveCompetitionsTable.hasClasses,
      })
      .from(LiveCompetitionsTable)
      .orderBy(LiveCompetitionsTable.id);
    assert.deepEqual(rows, [
      { id: 40877, hasClasses: false },
      { id: 40878, hasClasses: true },
    ]);
  });

  test('at production size the joins never touch live_classes and lists stay a hash join', async () => {
    // #94 put a subquery on live_classes in the list queries and took the API
    // down; a per-row LATERAL lookup was ~10x slower on the main page too.
    await db.execute(sql`
      INSERT INTO ol_competitions (id)
      SELECT 'c' || g FROM generate_series(1, 4000) g`);
    await db.execute(sql`
      INSERT INTO live_competitions (id, name, "olOrganizationId", "olCompetitionId", date, "hasClasses")
      SELECT g, 'n', 'o', 'c' || g, now(), true FROM generate_series(1, 4000) g`);
    await db.execute(sql`
      INSERT INTO live_classes ("liveClassId", "liveCompetitionId", name)
      SELECT g || ':' || k, g, 'K' || k
      FROM generate_series(1, 4000) g, generate_series(1, 20) k`);
    await db.execute(sql`ANALYZE`);

    const listPlan = await plan(sql`
      SELECT COUNT(*) FROM ol_competitions AS oc
      ${preferredLiveCompetitionJoin}`);
    const getCompetitionPlan = await plan(sql`
      SELECT lc.id FROM ol_competitions AS oc
      ${preferredLiveCompetitionJoin}
      WHERE oc.id = 'c2000'`);
    const resultsLookupPlan = await plan(
      sql`SELECT * FROM live_competitions
          WHERE "olCompetitionId" = 'c2000'
          ORDER BY ${liveCompetitionPreference('"live_competitions"')}
          LIMIT 1`,
    );

    for (const p of [listPlan, getCompetitionPlan, resultsLookupPlan]) {
      assert.doesNotMatch(p, /live_classes/, p);
    }
    assert.match(listPlan, /Hash Anti Join/, listPlan);
    assert.doesNotMatch(listPlan, /Nested Loop/, listPlan);
    assert.match(getCompetitionPlan, /competitions_olCompetitionId_idx/);
  });
});
