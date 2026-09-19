# Migration plan: Liveresultat REST API (`api.orienteering.services`)

Status: proposal. Verified against the live API on 2026-09-19 (every claim below was
probed with real requests; raw samples in the appendix).

## 1. Where we are today

| Concern | Current implementation |
| --- | --- |
| Competition list | `LiveresultatAPIClient.getcompetitions()` — already hits `https://api.orienteering.services/competitions`, **unfiltered** |
| Competition info | legacy `GET /api.php?method=getcompetitioninfo&comp=` |
| Classes | legacy `getclasses` + `last_hash` (Redis `liveresultat:lastHash:classes:{id}`) |
| Class results | legacy `getclassresults&unformattedTimes=true` + `last_hash` |
| Transport | `axios` (`lib/liveresultat/client.ts`) and a hand-rolled HTTP/2 client (`lib/liveresultat/http2-client.ts`), both pointed at `liveresultat.orientering.se` |
| Change detection | `last_hash` → `status: "NOT MODIFIED"`; "new result" flag from `DT_RowClass` |
| Runner identity | `md5(classId + name + club)` with a `:start:seq` suffix for collisions (`live-class-writer.ts`) |
| Sync shape | `sync-live-competitions` → `sync-live-competition` → `sync-live-class` (one request per class), plus `sync-active-live-competitions` doing the same in-process with `p-limit(10)` |

The legacy `api.php` endpoints are **still live and unchanged** (verified), so we can
migrate incrementally with no flag-day.

## 2. Endpoint mapping and every breaking difference

| Legacy | New | Differences that break us |
| --- | --- | --- |
| `getcompetitions` | `GET /competitions` (+ `?year=`, `?date=`, `?today=true`, `?pastDays=N`, `?search=`) | Already in use. Unfiltered list is **8002 competitions / 875 KB** per call. Filtered responses add `country`, `hasResults`, `multiDayStage`, `multiDayFirstDay` (all optional — absent on the unfiltered list) |
| `getcompetitioninfo&comp=` | `GET /competitions/{id}` | Adds `timezone` (IANA), `isPublic` (bool, was `1`), `serverTime` (epoch ms). `timediff` still present. **404** for unknown id (legacy returned a body) |
| `getclasses` | `GET /competitions/{id}/classes` | **`{ classes: string[] }`**, not `{ classes: [{ className }] }`. **No `hash`, no `status`** — change detection is `ETag`/`If-None-Match` |
| `getclassresults` | `GET /competitions/{id}/classresults?class=` | `splitcontrols` → **`splitControls`**. No `hash`/`status`. No `DT_RowClass` → **`changed`** (unix seconds) per row + `startChanged`. New: `bib`, `isMultiDay`, `isMassStart`, `qualificationLimits`. Splits gain a `<code>_changed` key. Unknown class → **200 with empty `results`**, not an error |
| `getlastpassings` | `GET /competitions/{id}/passings` | Completely different shape: ints instead of formatted strings — `{ class, control, controlName, place, bib, name, club, time, timeplus, wallClock, changed }` vs legacy `{ passtime, runnerName, control, controlName, time }` |
| `getclubresults` | `GET /competitions/{id}/clubresults?club=` | No `hash`; rows carry `class` |
| — | `GET /competitions/{id}/remaining` | New. Max 100 runners still out, in start order |
| — | `GET /competitions/{id}/export` | New. Full competition state in one request, with **stable numeric runner ids** |

### Verified quirks worth encoding in the client

- **Class names containing `/` must use the query form.** `/classresults?class=K20%2F21` → 200;
  `/classes/K20%2F21/results` → **404**. Always use `?class=`, never the path form.
- **Unknown class is not an error.** `?class=NOPE` returns
  `{"className":"NOPE","splitControls":[],"results":[],…}`. A typo'd/renamed class would
  silently soft-delete every result in that class via the `notInArray` sweep in
  `insertResults`. Guard: skip the delete sweep when `results` is empty but the class
  previously had rows.
- **Brotli is a 10× win and we currently don't ask for it.** `SM, lång` export is
  343 072 B raw, **35 137 B** with `accept-encoding: gzip, br`. The HTTP/2 client sends no
  `accept-encoding` at all; axios negotiates gzip but not br.
- **Caching:** every read returns `ETag` + `cache-control: public, max-age=5`, fronted by
  CloudFront (`x-cache: Hit from cloudfront`, `age`). `If-None-Match` → **304** (verified).
- **Rate limits:** 15 rapid identical requests all returned 200 — no throttling observed,
  but the documented contract is *≥10 s between polls of a read endpoint, always with
  `If-None-Match`*. We will enforce that ourselves rather than rely on absence of 429s.
- **`/export` is not a superset of `/classresults`.** Export rows are
  `{ runnerId, control, time, status, changed }` — **no `place`, `timeplus`, `progress`**,
  and no split `place`/`timeplus`. Those are derived server-side by `classresults`.
- **Relays** are exposed as per-leg classes with `relayLeg` + `relayClassName` in
  `/export` (`Ungdom-1`, `relayLeg: 1`, `relayClassName: "Ungdom"`), club = team name.
- **`hasResults`** only appears (and is only meaningful) on the filtered list endpoints.

### Landmine in `live-class-writer.ts`

`insertSplitResults` folds `splits` by stripping everything after `_`, and treats any key
not ending in `status|timeplus|place` as the split *time*. The new `<code>_changed` key
falls into that bucket. It happens to survive today only because integer-like JS object
keys are iterated in numeric order, so the bare `1049` key is seen before `1049_changed`
and `obj.time` is already set (verified in Node). That is luck, not correctness — any
non-integer control code would write a unix timestamp into `time`. Fix while we are here:
explicitly ignore `_changed` (and unknown suffixes), and drop the copy-paste
`obj.timeplus === undefined` guards on the `status`/`place` branches.

## 3. Backwards-compatibility strategy

**Principle: the new API is adapted to the existing internal types, not the other way
around.** `LiveresultatApi.getclasses` / `getclassresults` stay the contract; the writers,
jobs, DB schema and the app's `/v2` responses are untouched in phases 0–3.

- New `lib/liveresultat/rest-client.ts` implements the same method surface
  (`getcompetitions`, `getcompetitioninfo`, `getclasses`, `getclassresults`) and returns
  the **legacy-shaped** types, with `null` for "not modified" exactly as today.
  - `classes: string[]` → `{ classes: [{ className }], hash: <etag>, status: 'OK' }`
  - `splitControls` → `splitcontrols`
  - `changed` → synthesise `DT_RowClass: 'new_result'` when `changed` is newer than the
    stored `updatedAt`, preserving the existing `newResultAt` semantics and the app's
    `hasRecentlyUpdated` behaviour
  - 304 → `null` (same as `status: 'NOT MODIFIED'`)
- Both `LiveresultatAPIClient` and `LiveresultatHttp2Client` keep their signatures. Add an
  interface `LiveresultatSource` that all three satisfy, resolved in `singletons.ts`.
- Rollout via env flag `LIVERESULTAT_SOURCE=legacy|rest` (default `legacy`, per-deploy
  flip), so a regression is a config change, not a revert.
- Keep `scrape.ts` as the last-resort fallback for the competition list; it is untouched.
- `selfhelp/index.ts` still health-checks `api.php?method=getcompetitions`; add the new
  base URL as a second `ServiceStatusTable` entry rather than replacing it, so
  `/v2/status` keeps reporting during the overlap.

### Regression harness (do this first)

Add `server/scripts/compare-liveresultat.ts`: for a list of competition ids, fetch both
legacy and REST, run both through the adapters, and diff the normalised
`LiveresultatApi.getclassresults` objects field by field. Run it against a mix of
individual, relay, mass-start, multi-day and non-Swedish competitions. This is the actual
proof of "100 % backwards compatible" and it is cheap to keep in CI as a smoke test.

## 4. Implementation phases

### Phase 0 — transport layer
1. `lib/liveresultat/http.ts`: one `undici`/`fetch`-based helper with keep-alive,
   `accept-encoding: gzip, br`, `user-agent: LiveOL Server`, `If-None-Match` from Redis,
   timeout + bounded retry (retry only on 5xx/network, never on 304/404).
2. `lib/liveresultat/etag-store.ts`: Redis-backed ETag cache, keys
   `lr:etag:{path}` with a TTL (keep the existing 10-minute expiry trick so corrupted
   state self-heals). Store the ETag **and** the last-seen `changed` high-water mark per
   class so we can compute "new result" without `DT_RowClass`.
   Keep `accept-encoding` constant — CloudFront varies on it, so a varying header would
   invalidate ETags.
3. `lib/liveresultat/poll-guard.ts`: per-path minimum interval (default 10 s, configurable)
   with a small jitter, enforced in Redis. This is what makes us compliant regardless of
   how the schedulers are tuned.

### Phase 1 — drop-in REST client (no behaviour change)
4. `rest-client.ts` + adapters per §3. Delete nothing yet.
5. Wire the flag in `singletons.ts`; `SyncLiveClassJob`, `SyncLiveCompetitionJob` and
   `SyncActiveLiveCompetitionsJob` only change which object they are handed.
6. Fix the split-parser landmine and the empty-`results` delete-sweep guard.
7. Run the comparison harness; gate the flag flip on a clean diff.

### Phase 2 — stop downloading the whole archive
8. `SyncLiveCompetitionsJob` currently pulls all 8002 competitions (875 KB) every run.
   Replace with `?today=true` for the hot path and `?date=` / `?pastDays=` for the
   date-ranged path it already accepts (`startDate`/`endDate`).
9. **`purgeStaleCompetitions` must not run on a filtered list.** It deletes every
   `live_competitions` row whose id is absent from the response — with `?today=true` that
   would wipe the archive. Split it into its own nightly job that does one unfiltered
   `GET /competitions` (ETag'd, brotli'd) and keeps the current logic.
10. Use `timezone` from `GET /competitions/{id}` instead of the `timediff`→IANA lookup
    table in `lib/helpers/time.ts`. The table maps CET+offset to a representative zone and
    is DST-lossy; the API's IANA zone is authoritative. Keep `getUtcDate(date, timediff)`
    as the fallback when `timezone` is absent.

### Phase 3 — export-first sync (the real throughput win)
Measured on `SM, lång (Swedish League, #7), Final` (1048 runners, 32 classes):

| Strategy | Requests | Bytes (raw) | Bytes (br) | Wall clock |
| --- | --- | --- | --- | --- |
| per-class `classresults` (today) | 32 | 388 328 | ~40 K | 15.4 s |
| single `/export` | **1** | 343 072 | **35 137** | <1 s |

11. New `sync-live-competition-export` job: conditional `GET /competitions/{id}/export`.
    - **304 → do nothing at all.** One request replaces N class requests for an idle
      competition. This is the single biggest saving, since most "active" competitions are
      idle most of the time.
    - 200 → compare each result's `changed` against the stored high-water mark and fetch
      `?class=` **only for the classes that actually moved**. On a typical tick that is
      1–3 classes instead of 32.
12. Keep `place`/`timeplus`/`progress` sourced from `classresults` — do **not** try to
    recompute them from `/export`. Export omits them, and deriving them for mass-start,
    relay and multi-day classes would be a correctness risk for zero gain.
13. Use `hasResults` from the list endpoint to skip competitions that have not started, and
    `/remaining` (100 runners max, 1 request) to decide when a competition is finished and
    can drop to a slow poll tier. Concretely, three tiers:
    - **hot** (results changed in the last 5 min): 15 s export poll
    - **warm** (started, no recent change, `/remaining` non-empty): 60 s
    - **cold** (`hasResults` false and start in the future, or `/remaining` empty): 10 min
14. Keep `p-limit` but size it from the poll budget, not a constant: with a 10 s floor per
    path, the ceiling is `activeCompetitions` requests / 10 s, which for a peak Swedish
    Saturday (~30 competitions) is trivially within budget — versus today's
    `30 × ~25 classes` = ~750 requests per tick.

### Phase 4 — new capabilities (additive; each is independently shippable)
15. **Stable runner ids.** `/export` gives `runners[].id`, stable within a competition.
    Add `live_results.liveRunnerId integer` (nullable, backfilled from export) alongside the
    existing md5 `liveResultId`. This retires the
    `md5(class+name+club)` + `:start:seq` collision hack, makes renames non-destructive,
    and makes tracking (`ol_tracking`, `OLRunnersTable`) far more robust than the current
    `name + club` string matching in `marshal/results.ts`.
    Migrate by writing both ids for a season before switching the primary key.
16. **Last passings, restored.** `/passings` (50 newest, with `place`, `timeplus` at the
    control, and `wallClock`). The app still has a dangling type reference to
    `/v1/competitions/{competitionId}/last-passings` (`app/src/views/components/competition/header.tsx`,
    `lastPassing.tsx`) but no server route exists. New `live_passings` table +
    `GET /v2/competitions/:id/passings`, one request per competition per tick.
17. **"Still out on course".** `/remaining` powers a genuinely new screen — who is still
    running, in start order — and is the cheapest possible "is this competition live?"
    signal.
18. **Radio controls with names up front.** `/export` `classes[].radioControls` gives
    `{ code, name }` before any runner has punched, so split columns can render on an empty
    result list instead of appearing mid-race.
19. **Class metadata.** `isMassStart`, `qualificationLimits`, `isMultiDay` → surface on
    `live_classes` so the app can render chase-start and qualification-heat semantics
    correctly.
20. **Relay support.** `relayLeg` + `relayClassName` let us group `Ungdom-1..4` into one
    relay view instead of four unrelated classes.
21. **Country + multi-day.** `country`, `multiDayStage`, `multiDayFirstDay` on the list
    endpoint: country filtering/flags in the competition list (today `countryCode` only
    ever comes from Eventor, so non-Swedish live competitions show none), and multi-day
    linking that the existing `CompetitionId` matcher cannot infer.
22. **`serverTime`** from `GET /competitions/{id}` gives a clock-skew correction for the
    `isLive` / `start <= nowTimestamp` logic in `marshal/results.ts`.
23. **Eventor cross-linking.** `country` + `organizer` + `date` from the live list will
    improve the `lib/match/generateIds` join rate against Eventor competitions.

### Phase 5 — decommission
24. Delete the legacy `api.php` paths from `client.ts`, the bespoke
    `http2-client.ts` (superseded by Phase 0), the `last_hash` Redis keys, and
    `jsonrepair` (the new API returns valid JSON — the `jsonParse` repair path exists only
    for legacy malformed responses). Keep `scrape.ts` until the REST list has a season of
    uptime.

## 5. Rate-limit / politeness contract

- Every read sends `If-None-Match` — enforced in the transport, not left to callers.
- Hard 10 s minimum per `(path)` in Redis, with jitter to avoid thundering herds after a
  deploy.
- `accept-encoding: gzip, br` on every request, constant so ETags stay valid.
- Retry only 5xx/network, exponential backoff, max 3; 304 and 404 are terminal.
- Respect `cache-control: max-age=5` — never poll faster than the CDN can serve fresh data.
- Treat `serverTime` drift and `age` as observability signals; log them.

## 6. Risks

| Risk | Mitigation |
| --- | --- |
| Unknown/renamed class returns 200 + empty results → mass soft-delete | Skip the `notInArray` sweep when `results` is empty and the class had rows before |
| Filtered list + existing `purgeStaleCompetitions` → archive wiped | Move the purge to its own nightly job on the unfiltered list (Phase 2, step 9) |
| `changed` vs `DT_RowClass` mismatch changes the app's "new result" highlight | High-water mark per class in Redis; comparison harness asserts parity |
| ETag varying with `accept-encoding` causes permanent cache misses | Fixed `accept-encoding` header |
| `/export` omitting `place`/`timeplus` tempts a rewrite | Explicit decision: export is a change-detection oracle only |
| Runner-id migration breaking tracking | Dual-write `liveRunnerId` + md5 id for a full season before switching |

## 7. Appendix — verified samples

```
GET /competitions?today=true
{"id":40537,…,"timediff":1,"multiDayStage":1,"multiDayFirstDay":40537,"country":"bg","hasResults":false}

GET /competitions/40538
{"id":40538,"name":"XXXIII MPiK runda 10","organizer":"Aktywne Choszczno","date":"2026-09-19",
 "timediff":0,"timezone":"Europe/Warsaw","isPublic":true,"serverTime":1789805125558}

GET /competitions/40538/classes
{"classes":["K10","K10M",…,"K20/21",…]}

GET /competitions/40490/classresults?class=M12
{"className":"M12","splitControls":[{"code":1049,"name":"(49)"}],
 "results":[{"place":"1","name":"Jānis Ruža","club":"Meridiāns OK/CPSS","bib":"303",
   "result":252000,"status":0,"timeplus":0,"progress":100,"start":4380000,
   "changed":1789302753,"startChanged":1789302753,
   "splits":{"1049":229900,"1049_status":0,"1049_place":7,"1049_timeplus":1500,"1049_changed":1789302753}}],
 "isMultiDay":false,"isMassStart":false,"qualificationLimits":[]}

GET /competitions/40538/passings
{"passings":[{"class":"M20/21","control":1000,"controlName":null,"place":1,"bib":"",
  "name":"Stanisław Kabata","club":"KOS BnO Szczecin","time":199200,"timeplus":0,
  "wallClock":3619200,"changed":1789805036}]}

GET /competitions/40538/remaining
{"runners":[{"class":"K10M","bib":"","name":"Wiktoria Sadocha","club":"SKS Aktywne Choszczno",
  "start":3420000,"status":9}]}

GET /competitions/40541/export   (relay)
classes: [{"name":"Ungdom-1","isMassStart":true,"qualificationLimits":"",
           "radioControls":[{"code":1077,"name":"77"}],"relayLeg":1,"relayClassName":"Ungdom"}]
runners: [{"id":6779,"name":"Johan Klippmark","club":"Haparanda OK 1","class":"Vuxen-1","bib":"9","start":5127800}]
results: [{"runnerId":1,"control":1000,"time":199200,"status":0,"changed":1789805036}]
```

Conventions confirmed: times in hundredths of a second, start times from local midnight,
control `100` = start / `1000` = finish, radio controls `1000 × passing + code`,
status codes `0 OK, 1 DNS, 2 DNF, 3 MP, 4 DSQ, 5 overtime, 9 not started, 10 running,
11 walkover, 12 moved up, 20 approved without time`.

## 8. Out of scope

The write side (`POST /competitions`, `PUT /competitions/{id}`, `POST /mop`,
`POST /upload`, `POST /upload/iofxml/*`) is for timing software and organisers. LiveOL is a
read-only consumer, so none of it is in this plan. Worth revisiting only if LiveOL ever
wants to host its own competitions.
