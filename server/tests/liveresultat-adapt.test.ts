import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  adaptClasses,
  adaptClassResults,
  adaptCompetitionInfo,
  NEW_RESULT_WINDOW_SECONDS,
  type RawResponse,
} from 'lib/liveresultat/adapt';
import type { LiveresultatApi } from 'lib/liveresultat/types';
import { json, raw } from './helpers/fixtures';

const ok = (body: string, etag: string | null = '"abc"'): RawResponse => ({
  status: 200,
  etag,
  body,
});

const notModified: RawResponse = { status: 304, etag: '"abc"', body: '' };

const NOW = 1_800_000_000_000;
const nowSeconds = NOW / 1000;

const oneRow = (fields: Record<string, unknown>) =>
  JSON.stringify({
    className: 'H21',
    splitControls: [{ code: 31, name: '31' }],
    results: [
      {
        place: '1',
        name: 'A',
        club: 'B',
        result: 100,
        status: 0,
        timeplus: 0,
        progress: 100,
        start: 0,
        ...fields,
      },
    ],
  });

/** Legacy sends result/timeplus as strings; compare on the parsed value. */
const comparable = (r: LiveresultatApi.result) => ({
  name: r.name,
  club: r.club,
  place: r.place,
  result: Number(r.result),
  timeplus: Number(r.timeplus),
  status: r.status,
  progress: r.progress,
  start: r.start,
  splits: r.splits,
});

const byRunner = (a: { name: string; start: number }, b: typeof a) =>
  a.name.localeCompare(b.name) || a.start - b.start;

describe('Liveresultat REST adapter', () => {
  test('classes: string[] becomes [{ className }]', () => {
    const res = adaptClasses(ok('{"classes":["H21","K20/21"]}'));

    assert.deepEqual(res, {
      status: 'OK',
      hash: '"abc"',
      classes: [{ className: 'H21' }, { className: 'K20/21' }],
    });
  });

  test('classes: matches the legacy fixture', () => {
    const res = adaptClasses(ok(raw('new/classes.json')));
    const legacy = json<LiveresultatApi.getclasses>('legacy/getclasses.json');

    assert.deepEqual(res!.classes, legacy.classes);
  });

  test('304 becomes null for both', () => {
    assert.equal(adaptClasses(notModified), null);
    assert.equal(adaptClassResults(notModified, NOW), null);
  });

  test('the ETag becomes the hash, and a missing ETag an empty one', () => {
    assert.equal(adaptClassResults(ok(oneRow({}), '"x"'), NOW)!.hash, '"x"');
    assert.equal(adaptClassResults(ok(oneRow({}), null), NOW)!.hash, '');
  });

  test("status is 'OK' so live_classes.status is written", () => {
    assert.equal(adaptClasses(ok('{"classes":[]}'))!.status, 'OK');
    assert.equal(adaptClassResults(ok(oneRow({})), NOW)!.status, 'OK');
  });

  test('splitControls is renamed to splitcontrols', () => {
    const res = adaptClassResults(ok(oneRow({})), NOW)!;

    assert.deepEqual(res.splitcontrols, [{ code: 31, name: '31' }]);
    assert.ok(!('splitControls' in res));
  });

  test('<code>_changed split keys are stripped, the rest kept', () => {
    const res = adaptClassResults(
      ok(
        oneRow({
          splits: {
            '31': 1000,
            '31_status': 0,
            '31_place': 1,
            '31_timeplus': 0,
            '31_changed': 1_700_000_000,
          },
        }),
      ),
      NOW,
    )!;

    assert.deepEqual(res.results[0]!.splits, {
      '31': 1000,
      '31_status': 0,
      '31_place': 1,
      '31_timeplus': 0,
    });
  });

  test('rows without splits stay without splits, like legacy', () => {
    const res = adaptClassResults(ok(oneRow({})), NOW)!;
    assert.ok(!('splits' in res.results[0]!));
  });

  test('changed inside the window flags new_result', () => {
    const at = (changed: number) =>
      adaptClassResults(ok(oneRow({ changed })), NOW)!.results[0]!;

    assert.equal(at(nowSeconds).DT_RowClass, 'new_result');
    assert.equal(
      at(nowSeconds - NEW_RESULT_WINDOW_SECONDS).DT_RowClass,
      'new_result',
    );
    // Upstream clock slightly ahead of ours still counts as new
    assert.equal(at(nowSeconds + 5).DT_RowClass, 'new_result');
  });

  test('changed outside the window, or absent, does not flag', () => {
    const at = (fields: Record<string, unknown>) =>
      adaptClassResults(ok(oneRow(fields)), NOW)!.results[0]!;

    assert.equal(
      at({ changed: nowSeconds - NEW_RESULT_WINDOW_SECONDS - 1 }).DT_RowClass,
      undefined,
    );
    assert.equal(at({}).DT_RowClass, undefined);
    assert.ok(!('changed' in at({ changed: nowSeconds })));
  });

  test('the window covers at least a once-a-minute poll', () => {
    assert.ok(NEW_RESULT_WINDOW_SECONDS >= 60);
  });

  test('competition info passes through with the legacy fields intact', () => {
    const info = adaptCompetitionInfo(raw('new/competition.json'));
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
  });

  for (const [label, file, legacyFile] of [
    ['main', 'new/classresults.json', 'legacy/getclassresults.json'],
    [
      'duplicates',
      'new/classresults.duplicates.json',
      'legacy/getclassresults.duplicates.json',
    ],
  ] as const) {
    test(`recorded ${label} fixture adapts to the legacy rows`, () => {
      const res = adaptClassResults(ok(raw(file)), NOW)!;
      const legacy = json<LiveresultatApi.getclassresults>(legacyFile);

      assert.equal(res.className, legacy.className);
      assert.deepEqual(res.splitcontrols, legacy.splitcontrols);

      // Tie order can differ (§6), so only the multiset of `place` is compared
      const strip = (r: LiveresultatApi.result) => ({
        ...comparable(r),
        place: undefined,
      });
      assert.deepEqual(
        res.results.map(strip).sort(byRunner),
        legacy.results.map(strip).sort(byRunner),
      );
      assert.deepEqual(
        res.results.map(r => r.place).sort(),
        legacy.results.map(r => r.place).sort(),
      );
    });
  }
});
