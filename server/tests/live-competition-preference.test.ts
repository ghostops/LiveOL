import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { eq, sql } from 'drizzle-orm';
import {
  LiveClassesTable,
  LiveCompetitionsTable,
  OLCompetitionsTable,
} from 'lib/db/schema';
import {
  liveCompetitionPreference,
  preferredLiveCompetitionJoin,
} from 'lib/helpers/live-competition';
import { createTestDb, type TestDb } from './helpers/db';

/**
 * 40877 and 40878 are the same race uploaded twice to Liveresultat; the
 * organizer differs only by a space, so both slug to one olCompetitionId.
 * 40877 never got any classes. Reads by olCompetitionId must land on 40878.
 */
const OL_ID = '2026-10-14~veteran-3-stad~vanersborgssk';

describe('preferred live competition for a shared olCompetitionId', () => {
  let harness: Awaited<ReturnType<typeof createTestDb>>;
  let db: TestDb;

  const competition = (id: number, organizer: string) => ({
    id,
    name: 'Veteran-3-stad',
    organizer,
    olOrganizationId: 'vanersborgssk',
    olCompetitionId: OL_ID,
    date: new Date('2026-10-13T22:00:00Z'),
  });

  const addClass = (liveCompetitionId: number, name: string) =>
    db.insert(LiveClassesTable).values({
      liveClassId: `${liveCompetitionId}:${name}`,
      liveCompetitionId,
      name,
    });

  /** What getCompetition and the competition lists join on. */
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

  test('the upload with classes wins over a newer or older empty one', async () => {
    await db
      .insert(LiveCompetitionsTable)
      .values([
        competition(40877, 'VänersborgsSK'),
        competition(40878, 'Vänersborgs SK'),
      ]);
    await addClass(40878, 'Enkla');

    assert.deepEqual(await joined(), [{ id: 40878 }]);
    assert.equal(await picked(), 40878);

    // Same when the empty upload is the newer one
    await db
      .insert(LiveCompetitionsTable)
      .values(competition(40999, 'Vänersborgs SK.'));
    assert.deepEqual(await joined(), [{ id: 40878 }]);
    assert.equal(await picked(), 40878);
  });

  test('with no classes anywhere, the newest upload wins', async () => {
    await db
      .insert(LiveCompetitionsTable)
      .values([
        competition(40877, 'VänersborgsSK'),
        competition(40878, 'Vänersborgs SK'),
      ]);

    assert.deepEqual(await joined(), [{ id: 40878 }]);
    assert.equal(await picked(), 40878);
  });

  test('the join yields exactly one row, so lists show the race once', async () => {
    await db
      .insert(LiveCompetitionsTable)
      .values([
        competition(40877, 'VänersborgsSK'),
        competition(40878, 'Vänersborgs SK'),
      ]);
    await addClass(40877, 'Enkla');
    await addClass(40878, 'Enkla');

    assert.equal((await joined()).length, 1);
  });

  test('a competition without live data still joins to null', async () => {
    assert.deepEqual(await joined(), [{ id: null }]);
  });
});
