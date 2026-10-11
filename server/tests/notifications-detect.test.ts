import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  detectResultChanges,
  detectSplitChange,
} from 'lib/notifications/detect';

/**
 * The push path diffs the stored row against the incoming one, so it depends on
 * `result`, `status`, `place` and `progress` being filled the same way after
 * the migration — notably `progress`, which only `/classresults` carries.
 */
const snap = (
  over: Partial<Parameters<typeof detectResultChanges>[0]> = {},
) => ({
  result: null,
  status: null,
  place: null,
  progress: null,
  ...over,
});

describe('detectResultChanges', () => {
  test('finish when a time appears with status OK', () => {
    const changes = detectResultChanges(
      snap({ status: 9, progress: 50 }),
      snap({ status: 0, result: 123456, place: '3', progress: 100 }),
    );
    assert.deepEqual(
      changes.map(c => c.type),
      ['finish'],
    );
  });

  test('placeChange when an already-finished runner moves', () => {
    const changes = detectResultChanges(
      snap({ status: 0, result: 123456, place: '3' }),
      snap({ status: 0, result: 123456, place: '5' }),
    );
    assert.deepEqual(
      changes.map(c => c.type),
      ['placeChange'],
    );
    assert.equal(changes[0]!.key, 'place:5');
  });

  test('no placeChange when the place is unchanged', () => {
    const changes = detectResultChanges(
      snap({ status: 0, result: 1, place: '3' }),
      snap({ status: 0, result: 1, place: '3' }),
    );
    assert.deepEqual(changes, []);
  });

  test('status events only for DNS, DNF, MP, DSQ and OT', () => {
    for (const status of [1, 2, 3, 4, 5]) {
      const changes = detectResultChanges(
        snap({ status: 10 }),
        snap({ status }),
      );
      assert.ok(
        changes.some(c => c.type === 'status'),
        `status ${status} should notify`,
      );
    }
    // 10 = running, 9 = not started, 0 = OK are not notifiable on their own
    for (const status of [0, 9, 10]) {
      const changes = detectResultChanges(
        snap({ status: 11 }),
        snap({ status }),
      );
      assert.ok(
        !changes.some(c => c.type === 'status'),
        `status ${status} should stay quiet`,
      );
    }
  });

  test('start fires when progress first moves off zero', () => {
    const changes = detectResultChanges(
      snap({ progress: 0 }),
      snap({ progress: 5 }),
    );
    assert.deepEqual(
      changes.map(c => c.type),
      ['start'],
    );
  });

  test('start does not fire for a runner who went straight to finished', () => {
    const changes = detectResultChanges(
      snap({ progress: 0 }),
      snap({ progress: 100, status: 0, result: 1000 }),
    );
    assert.deepEqual(
      changes.map(c => c.type),
      ['finish'],
    );
  });
});

describe('detectSplitChange', () => {
  test('reports a split the first time a time appears', () => {
    const change = detectSplitChange('1065', undefined, {
      time: 60000,
      place: 2,
    });
    assert.ok(change);
    assert.equal(change.type, 'split');
    assert.ok(change.key.includes('1065'));
  });

  test('stays quiet when the split time is unchanged', () => {
    assert.equal(
      detectSplitChange(
        '1065',
        { time: 60000, place: 2 },
        { time: 60000, place: 2 },
      ),
      null,
    );
  });
});
