import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { subDays, subSeconds } from 'date-fns';
import {
  marshalResult,
  RECENTLY_UPDATED_THRESHOLD_SECONDS,
  type ResultWithMaybeSplits,
} from 'lib/marshal/results';

/**
 * `isLive` and `hasRecentlyUpdated` are what the app renders as "running" and
 * as the highlight flash. They are derived from columns the writer fills, so
 * the migration must keep feeding them the same values.
 */
const row = (
  over: Partial<ResultWithMaybeSplits> = {},
): ResultWithMaybeSplits =>
  ({
    id: 1,
    liveResultId: 'r1',
    liveClassId: 'c1',
    liveCompetitionId: 1,
    olRunnerId: 'annaandersson~h21~okexempel',
    name: 'Anna Andersson',
    organization: 'OK Exempel',
    olOrganizationId: 'okexempel',
    result: null,
    timeplus: null,
    progress: 50,
    status: 0,
    place: null,
    start: 1000,
    deletedAt: null,
    newResultAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...over,
  }) as ResultWithMaybeSplits;

const marshal = (r: ResultWithMaybeSplits, nowTimestamp = 2000) =>
  marshalResult({ nowTimestamp })(r);

describe('marshalResult', () => {
  test('isLive when started, in progress and recently synced', () => {
    assert.equal(marshal(row()).isLive, true);
  });

  test('not live once a result exists', () => {
    assert.equal(marshal(row({ result: 123456 })).isLive, false);
  });

  test('not live at 100% progress', () => {
    assert.equal(marshal(row({ progress: 100 })).isLive, false);
  });

  test('not live before the start time passes', () => {
    assert.equal(marshal(row({ start: 5000 }), 2000).isLive, false);
  });

  test('not live without a start time', () => {
    assert.equal(marshal(row({ start: null })).isLive, false);
  });

  test('not live when the row has not been synced for three days', () => {
    assert.equal(
      marshal(row({ updatedAt: subDays(new Date(), 4) })).isLive,
      false,
    );
  });

  test('hasRecentlyUpdated inside the threshold and not outside it', () => {
    assert.equal(
      marshal(
        row({
          newResultAt: subSeconds(
            new Date(),
            RECENTLY_UPDATED_THRESHOLD_SECONDS - 10,
          ),
        }),
      ).hasRecentlyUpdated,
      true,
    );
    assert.equal(
      marshal(
        row({
          newResultAt: subSeconds(
            new Date(),
            RECENTLY_UPDATED_THRESHOLD_SECONDS + 10,
          ),
        }),
      ).hasRecentlyUpdated,
      false,
    );
    assert.equal(marshal(row()).hasRecentlyUpdated, false);
  });

  test('isTracking matches a tracked name and club through olRunnerId', () => {
    // Tracking rows store the name and club as typed; `norm` strips spaces, so
    // the match is against "annaandersson" ... "okexempel".
    const tracking = [
      {
        id: 1,
        olUserId: 1,
        name: 'Anna Andersson',
        clubs: ['OK Exempel'],
        isMe: false,
      },
    ] as never;

    assert.equal(
      marshalResult({ tracking, nowTimestamp: 2000 })(row()).isTracking,
      true,
    );
    assert.equal(
      marshalResult({ tracking, nowTimestamp: 2000 })(
        row({ olRunnerId: 'bertil~h21~annanklubb' }),
      ).isTracking,
      false,
    );
  });
});
