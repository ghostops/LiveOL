# Migration plan: Liveresultat REST API (`api.orienteering.services`)

Status: implemented (pending staging, §7.4–7.5). Verified against the live API on 2026-09-19,
re-checked 2026-10-14.

**Goal:** stop calling the legacy `api.php` endpoints and use `api.orienteering.services`
instead, with no loss of functionality. Nothing else.

**Scope:** two files in `lib/liveresultat/` plus one small new adapter file. `types.ts`, the
jobs, `LiveClassWriter`, the controllers, the database and the app don't change.

## 1. What changes

The server makes four Liveresultat calls. One already uses the new API.

| Method | Today | After |
| --- | --- | --- |
| `getcompetitions` | `api.orienteering.services/competitions` | unchanged |
| `getcompetitioninfo` | `api.php?method=getcompetitioninfo&comp=` | `GET /competitions/{id}` |
| `getclasses` | `api.php?method=getclasses&comp=&last_hash=` | `GET /competitions/{id}/classes` + `If-None-Match` |
| `getclassresults` | `api.php?method=getclassresults&comp=&class=&unformattedTimes=true&last_hash=` | `GET /competitions/{id}/classresults?class=` + `If-None-Match` |

`getclasses` and `getclassresults` exist twice: in `client.ts` (axios, used by
`sync-live-competition` / `sync-live-class`) and in `http2-client.ts` (used by
`sync-active-live-competitions`). Both are switched. The HTTP/2 client keeps all its
hardening (request timeout, ping keepalive, GOAWAY handling, settle-once). Only its host and
paths change. The new host serves HTTP/2 (verified).

## 2. The adapter

One function per response, in a new `lib/liveresultat/adapt.ts`, used by both clients. It
turns the new responses into the existing `LiveresultatApi` types, so nothing downstream can
tell the difference.

| New API | Existing contract | Adapter |
| --- | --- | --- |
| `{ classes: string[] }` | `{ classes: [{ className }], hash, status }` | map to `[{ className }]` |
| `splitControls` | `splitcontrols` | rename (same `{ code, name }[]` shape) |
| split keys `<code>_changed` | not present | strip them. `insertSplitResults` treats any unknown suffix as a split time |
| no `hash` | `hash` | the response's `ETag` |
| no `status` | `status: 'OK'` | set it. `live_classes.status` is written from it |
| row `changed` (unix s) | `DT_RowClass: 'new_result'` | set when `changed` is recent (§4) |
| 304 Not Modified | `status: 'NOT MODIFIED'` → client returns `null` | return `null` |
| `getcompetitioninfo` | same shape | pass through. `timediff` is still present; extra fields (`timezone`, `country`, `serverTime`) are ignored |

New row fields (`bib`, `startChanged`) and envelope fields (`isMultiDay`, `isMassStart`,
`qualificationLimits`) pass through unused.

## 3. ETags in the existing Redis keys

Store the ETag in the same keys the `last_hash` lives in today, with the same 10-minute
expiry:

- `liveresultat:lastHash:classes:{id}`
- `liveresultat:lastHash:class:{class}:results:{id}`

This matters beyond tidiness. `getResultByLiveClassId` (`controllers/results.ts`) reads the
results key and returns it as `hash` in `/v2`, and the app vibrates when it changes. An ETag
changes exactly when the content does, so that keeps working with no controller or app change.

Send the stored value back as `If-None-Match`. Skip the header when the key is empty, so the
first request is unconditional.

## 4. `DT_RowClass` → `changed`

Legacy flagged a row `new_result` when it had changed recently. The writer turns that flag
into `newResultAt`, which drives the "recently updated" highlight in the app
(`RECENTLY_UPDATED_THRESHOLD_SECONDS = 120`).

The new API gives a per-row `changed` timestamp instead. The adapter sets
`DT_RowClass: 'new_result'` when `now - changed` is within a fixed window. This is stateless:
there is no stored high-water mark.

The window has to be at least the poll interval, or a change could land between two polls
and never be flagged. Poll schedules are stored in the database (`lib/scheduler.ts`), so
read the actual interval there and pick the window from it. Too large a window only means
the highlight can last a bit longer, because an unrelated change in the same class refetches
the class and re-flags the row. Missing a highlight is the worse failure.

Implemented as `NEW_RESULT_WINDOW_SECONDS = 180` in `adapt.ts`: cron patterns are at most
once a minute, and the rest covers job runtime and clock skew. Check it against the live
`scheduled_jobs` rows before production.

## 5. Deletions

- `scrape.ts`: already referenced nowhere.
- The `api.php` URL strings, and `LiveresultatUrl` as the client root (keep the constant if
  other code still uses it for links).
- `jsonrepair`: the new API returns valid JSON, so the parser is plain `JSON.parse` and the
  dependency is removed.

## 6. Verified quirks to respect

- **Use `?class=`, never the path form.** Class names can contain `/` (`K20/21`):
  `?class=K20%2F21` → 200, `/classes/K20%2F21/results` → 404.
- **Unknown class → 200 with empty `results`.** Harmless: `insertResults` returns early on an
  empty list, before the soft-delete sweep (pinned by `live-class-writer.test.ts`).
- **Unknown competition → 404.** The axios client throws and the job logs it, same as any
  other fetch error.
- **`result` / `timeplus` are integers** in the new API, strings in legacy. `parseResultNumber`
  already handles both.
- **Tie order can differ.** For runners tied on time, legacy and new may list them in a
  different order, so which row carries the place (`5`) and which carries `=` can swap. Seen
  once in the `D18A` fixture. It's a display detail of the tie, not lost data.
- **Rate limit:** the documented contract is at least 10 s between polls of the same
  resource, always with `If-None-Match`. Today's schedules already poll per class, so this is
  met as long as no schedule is tightened below 10 s.

## 7. Validation

The harness is `server/tests/` (`npm test`, runs in CI). It needs no services.

1. Point the fixture server at `tests/fixtures/new/` and run `flow.test.ts`. The
   `tests/snapshots/flow.json` projection must match. The only accepted difference is the tie
   order from §6; review it and regenerate the snapshot only for that.
2. Add adapter tests: the `classes` mapping, the rename, `_changed` stripping, `status: 'OK'`,
   ETag → `hash`, 304 → `null`, and the `DT_RowClass` window on both sides.
3. Point the existing `liveresultat-http2-client.test.ts` at the new paths. Its
   dropped-session recovery test must still pass.
4. Manual: the app still vibrates on update, and `live_classes.status` is not null after a sync.
5. Run it on staging over one competition weekend before production.

`tests/fixtures/legacy/` is recorded from `api.php`. Once that is switched off upstream, it
cannot be recorded again, so keep it as the reference.

`bruno/liveresultat/` has both APIs side by side for checking by hand.

## 8. Rollback

`api.php` stays live upstream, so reverting the commit is the rollback.

## 9. Not doing

Considered and left out, because none of them are needed to switch endpoints:

- a new HTTP client (`undici`), a Redis poll guard, poll tiers
- the filtered competition list (`?today=true`) and splitting out `purgeStaleCompetitions`
- IANA `timezone` instead of `timediff`
- brotli (`accept-encoding: br`)
- `/export`-based sync and stable runner ids
- new features from `/passings`, `/remaining`, `/clubresults`

Each can be done later on its own if there's a reason to.

## Appendix: verified samples

```
GET /competitions/40488
{"id":40488,"name":"SM, lång (Swedish League, #7), Final","organizer":"FK Göingarna",
 "date":"2026-09-13","timediff":0,"timezone":"","isPublic":true,"country":"SE",
 "serverTime":1791994301627}

GET /competitions/40538/classes
{"classes":["K10","K10M",…,"K20/21",…]}

GET /competitions/40490/classresults?class=M12
{"className":"M12","splitControls":[{"code":1049,"name":"(49)"}],
 "results":[{"place":"1","name":"Jānis Ruža","club":"Meridiāns OK/CPSS","bib":"303",
   "result":252000,"status":0,"timeplus":0,"progress":100,"start":4380000,
   "changed":1789302753,"startChanged":1789302753,
   "splits":{"1049":229900,"1049_status":0,"1049_place":7,"1049_timeplus":1500,"1049_changed":1789302753}}],
 "isMultiDay":false,"isMassStart":false,"qualificationLimits":[]}

GET /competitions/40488/classes   (If-None-Match: <etag>)
HTTP/2 304

GET /competitions/999999999
404
```

Conventions: times in hundredths of a second, start times from local midnight, status codes
`0 OK, 1 DNS, 2 DNF, 3 MP, 4 DSQ, 5 overtime, 9 not started, 10 running, 11 walkover,
12 moved up, 20 approved without time`.
