# Migration plan: Liveresultat REST API (`api.orienteering.services`)

Status: proposal. Verified against the live API on 2026-09-19 (every claim below was
probed with real requests; raw samples in the appendix).

**This is a clean-slate rewrite of the Liveresultat *fetch layer*.** No adapter layer, no
dual-source flag, no preservation of the legacy response shapes: internal types are modelled
on the new API directly and the legacy `api.php` code is deleted rather than kept alive.

**The core migration changes no tables.** It keeps today's per-class sync shape and swaps
`last_hash` for `ETag`, so Phases 1–3 are a fetch-layer replacement and nothing else.

**`/export` is deliberately deferred** to an optional later phase (§5). It cuts requests
~32× and is the only source of stable runner ids — but neither is needed to get off
`api.php`, and the per-class path with ETag is already strictly better than today.

> **`/v2/*` stays compatible**, because it is consumed by App Store / Play Store builds
> already on users' phones, which cannot be forced to update. `/v2` responses only ever gain
> fields — see §5 for the one place the identity change touches the payload.

## 1. Where we are today

| Concern | Current implementation |
| --- | --- |
| Competition list | `LiveresultatAPIClient.getcompetitions()` — already hits `https://api.orienteering.services/competitions`, **unfiltered** (8002 competitions, 875 KB) |
| Competition info | legacy `GET /api.php?method=getcompetitioninfo&comp=` |
| Classes | legacy `getclasses` + `last_hash` (Redis `liveresultat:lastHash:classes:{id}`) |
| Class results | legacy `getclassresults&unformattedTimes=true` + `last_hash` |
| Transport | `axios` (`lib/liveresultat/client.ts`) **and** a hand-rolled HTTP/2 client (`lib/liveresultat/http2-client.ts`) with duplicated hash logic, both on `liveresultat.orientering.se` |
| Change detection | `last_hash` → `status: "NOT MODIFIED"`; "new result" inferred from `DT_RowClass` |
| Result identity | `md5(classId + name + club)`, plus a `:start:seq` suffix to break collisions — **kept** unless §5 is adopted |
| Sync shape | `sync-live-competitions` → `sync-live-competition` → `sync-live-class`, **one request per class** |
| Dead code | `lib/liveresultat/scrape.ts` — exported, referenced nowhere |

## 2. Endpoint mapping and field differences

| Legacy | New | What changes |
| --- | --- | --- |
| `getcompetitions` | `GET /competitions` (+ `?year=`, `?date=`, `?today=true`, `?pastDays=N`, `?search=`) | Filtered responses add `country`, `hasResults`, `multiDayStage`, `multiDayFirstDay` (all optional — absent on the unfiltered list) |
| `getcompetitioninfo&comp=` | `GET /competitions/{id}` | Adds `timezone` (IANA), `isPublic` (bool, was `1`), `serverTime` (epoch ms). **404** for unknown id |
| `getclasses` | `GET /competitions/{id}/classes` | `{ classes: string[] }`, not `{ classes: [{ className }] }`. No `hash`/`status` — `ETag`/`If-None-Match` instead |
| `getclassresults` | `GET /competitions/{id}/classresults?class=` | `splitcontrols` → `splitControls`. No `hash`/`status`. `DT_RowClass` → **`changed`** (unix s) + `startChanged`. New: `bib`, `isMultiDay`, `isMassStart`, `qualificationLimits`. Splits gain `<code>_changed` |
| `getlastpassings` | `GET /competitions/{id}/passings` | Integers instead of formatted strings: `{ class, control, controlName, place, bib, name, club, time, timeplus, wallClock, changed }` |
| `getclubresults` | `GET /competitions/{id}/clubresults?club=` | No `hash`; rows carry `class` |
| — | `GET /competitions/{id}/remaining` | New. Max 100 still out, in start order |
| — | `GET /competitions/{id}/export` | New. Full competition state in one request, with **stable numeric runner ids** |

### Verified quirks the implementation must handle

- **Class names containing `/` must use the query form.** `?class=K20%2F21` → 200;
  `/classes/K20%2F21/results` → **404**. Only ever use `?class=`.
- **Unknown class returns 200 with empty `results`**, not an error. A renamed class would
  otherwise soft-delete every row in it via the `notInArray` sweep in `insertResults`.
- **Brotli is a 10× win we currently don't ask for.** `SM, lång` export: 343 072 B raw →
  **35 137 B** with `accept-encoding: gzip, br`. The HTTP/2 client sends no
  `accept-encoding` at all; axios negotiates gzip but not br.
- **Caching:** every read returns `ETag` + `cache-control: public, max-age=5` behind
  CloudFront. `If-None-Match` → **304** (verified).
- **Rate limits:** 15 rapid identical requests all returned 200 — no throttling observed.
  The documented contract is ≥10 s between polls, always with `If-None-Match`. We enforce
  that ourselves rather than rely on the absence of 429s.
- **`/export` is not a superset of `/classresults`.** Export rows are
  `{ runnerId, control, time, status, changed }` — no `place`, `timeplus`, `progress`, and
  no split `place`/`timeplus`. Those are derived server-side by `classresults`.
- **Relays** are per-leg classes with `relayLeg` + `relayClassName` in `/export`
  (`Ungdom-1`, `relayLeg: 1`, `relayClassName: "Ungdom"`), club = team name.
- **`hasResults`** only appears on the filtered list endpoints.

## 3. New internal types

`lib/liveresultat/types.ts` is rewritten to mirror the API — no `hashed` base interface, no
`DT_RowClass`, no legacy casing:

```ts
export namespace Liveresultat {
  interface CompetitionListEntry {
    id: number; name: string; organizer: string; date: string;
    timediff: number;
    country?: string; hasResults?: boolean;
    multiDayStage?: number; multiDayFirstDay?: number;
  }
  interface Competition extends CompetitionListEntry {
    timezone?: string; isPublic: boolean; serverTime: number;
  }
  interface ClassResults {
    className: string;
    splitControls: { code: number; name: string }[];
    results: Result[];
    isMultiDay: boolean; isMassStart: boolean; qualificationLimits: string[];
  }
  interface Result {
    place: string; name: string; club?: string; bib?: string;
    result: number | ''; timeplus: number | ''; status: number;
    progress: number; start: number;
    changed?: number; startChanged?: number;
    splits?: Record<string, number>;
  }
  interface Export { /* eventid, competition, classes, runners, results */ }
}
```

Note `result` / `timeplus` arrive as `''` for non-finishers — the existing
`parseResultNumber` already handles that and stays.

## 4. Sync architecture: per-class conditional GET

The core migration keeps today's shape — one request per class — and swaps `last_hash` for
`ETag` / `If-None-Match`. `sync-live-competition` fans out to `sync-live-class` as it does
now; only the change-detection mechanism and the transport change.

1. `GET /competitions/{id}/classes` (conditional) for the class list, falling back to the
   stored classes on 304, exactly as today.
2. `GET /competitions/{id}/classresults?class=` per class, conditional.
3. **304 → skip the write.** Same as today's `status: "NOT MODIFIED"`.
4. 200 → write via the existing `LiveClassWriter`, using each row's `changed` to set
   `newResultAt` in place of `DT_RowClass`.

A 304 is cheap but not free: measured on `SM, lång, Final` (32 classes), 32 conditional
requests all returning 304 took **15.7 s serial, ~490 ms each** — about 1.6 s at
`p-limit(10)`. That is the cost we already pay, so the core migration is strictly better than
today (brotli, keep-alive, ETag) without being cleverer than today.

**Poll tiers**, driven by `hasResults` and `/remaining`:

| Tier | Condition | Poll |
| --- | --- | --- |
| hot | results changed in the last 5 min | 15 s |
| warm | started, no recent change, `/remaining` non-empty | 60 s |
| cold | `hasResults` false and start in the future, or `/remaining` empty | 10 min |

Tiering matters more here than it would with export, because the per-tick cost scales with
class count: it is what keeps a peak Saturday (~30 competitions × ~25 classes) off a hot
poll for competitions that have not started or have finished.

### Endpoint roles

| Need | Endpoint | Notes |
| --- | --- | --- |
| tick work list | `/competitions?today=true` | `hasResults` gates whether to poll at all; never the unfiltered list except in the nightly purge |
| competition metadata | `/competitions/{id}` | once per competition per day, not per tick — IANA `timezone`, `serverTime` |
| class list | `/competitions/{id}/classes` | conditional; 304 → use stored |
| everything displayed | `/classresults?class=` | **only source** of `place`, `timeplus`, `progress` and per-split `place`/`timeplus`; `start` is 100 % present here vs 82.5 % in export |
| recent activity feed | `/passings` | 1 request regardless of class count |
| is it still running | `/remaining` | 1 request; going empty is the cheapest "drop to cold tier" signal |

`bib` is sparse in both `classresults` and `export` (organisers often do not use bibs) — not
a field to rely on from either.

## 5. Optional later phase: export-first sync and stable runner ids

**Not part of the core migration.** `/export` is a single-request view of a whole
competition, and it buys two things — fewer requests, and runner ids. Both are real, neither
is needed to get off `api.php`. Deferring it keeps Phases 1–3 small; adopting it later is
additive.

Measured on `SM, lång, Final` (1048 runners, 32 classes):

| Strategy | Requests | Bytes (raw) | Bytes (br) | Idle tick (all 304) |
| --- | --- | --- | --- | --- |
| per-class `classresults` (§4) | 32 | 388 328 | ~40 K | 15.7 s serial / ~1.6 s at limit 10 |
| single `/export` | **1** | 343 072 | **35 137** | **0.75 s** |

### What it would look like

1. Conditional `GET /competitions/{id}/export`.
2. **304 → stop.** One request replaces N class requests for an idle competition, and most
   "active" competitions are idle most of the time.
3. 200 → diff `results[].changed` against the stored high-water mark, map `runnerId` →
   `runners[].class`, and fetch `?class=` **only for the classes that moved** — typically
   1–3 of 32.
4. Write from the `classresults` payload as in §4.

Export stays a change-detection oracle; displayed values still come from `classresults`,
because export omits `place` / `timeplus` / `progress` and deriving them for mass-start,
relay, multi-day and qualification classes is a correctness risk for no gain.

Note export is not free in the worst case: when every class has moved, its ~35 KB is paid on
top of the `classresults` requests you would have made anyway. It wins only when some classes
are idle.

### The identity change rides on this

`/export` is the **only** source of runner ids, so replacing
`live_results.liveResultId` — `md5(classId + name + club)` plus a `:start:seq` suffix — with
`(liveCompetitionId, liveRunnerId)` is only possible if export is adopted. Without export the
md5 stays as-is.

`olRunnerId` is **not** touched either way. It is the project's own cross-source runner key,
generated identically from Liveresultat and from Eventor (`sync-eventor-signups`, `-results`,
`-starts`), returned in the `/v2` results payload, and matched with `LIKE 'name~%~club'`
for tracking and user stats (`controllers/results.ts`, `controllers/stats.ts`,
`marshal/results.ts`). The Liveresultat ids are competition-scoped and cannot serve that.

**It would fix a latent bug.** Today `insertResults` sorts by `start`, then gives the first
occurrence of a `class:name:club` the base id and later ones a `:start:seq` suffix. When two
rows share a name, club **and** start time, the seq assignment falls back to whatever order
the API returned — so the "base" and ":1" rows can swap between polls, flipping `place` and
`result` between two DB rows. Competition 40467 has exactly this shape: class `M21E-1`
returns 53 rows of which 23 name+club pairs are duplicated, each pair being one finished row
(`status: 0`) and one never-started ghost (`status: 9`) with an identical `start: 4140000` —
the residue of the competition being uploaded twice by different routes. A stable per-row id
removes the flip entirely.

**The wrinkle.** `classresults` rows carry no id —
`{ place, name, club, bib, result, status, timeplus, progress, start, changed, startChanged, splits }`,
verified — so ids have to be attached in memory:

1. Join on `(class, name, club)`.
2. Tie-break a duplicate group by whether the export runner has a finish result
   (`control: 1000` with `time > 0`) matching the row's `status`.
3. Fall back to a stable sequence over `(start, result)` for anything still tied.

Over 28 competitions / 8070 runners, `(name, club)` is ambiguous within a class for **2.75 %**
of runners, nearly all of it one pathological competition (40467: 179 of 378). On its worst
class, step 2 resolves **21 of 23** duplicate groups; 2 need step 3. `start` cannot be the
tie-break — **10.7 %** of export runners omit it. Residual ambiguity is no worse than today's
`:start:seq`, and the common case is strictly better: the id survives a rename or a club
correction, where the md5 does not.

**`/v2` keeps its `liveResultId` field.** `resultSchema` in `controllers/results.ts` exposes
`liveResultId: z.string()`, and shipped app builds use it — in
`app/src/views/scenes/tracking/results.tsx` it is the FlashList `keyExtractor`, its only use.
So the *column* would be replaced but the *response field* stays, derived as
`${liveCompetitionId}:${liveRunnerId}`. A list key only has to be stable and unique per row,
so old clients are unaffected and `/v2` needs no version bump.

**Migration**, if adopted: add `liveRunnerId integer`, write both keys for one retention
window, then swap the unique constraint and drop the `liveResultId` column. `live_results`
holds ≤3 days (`purge-old-live-results`), so this drains on its own — no archive backfill.

## 6. Implementation phases

### Phase 1 — transport + types
1. `lib/liveresultat/http.ts`: one `undici`-based client with keep-alive,
   `accept-encoding: gzip, br` (constant — CloudFront varies on it, so a varying header
   would invalidate ETags), `If-None-Match`, timeout, and retry on 5xx/network only
   (304 and 404 are terminal).
2. `lib/liveresultat/etag-store.ts`: Redis ETag cache (`lr:etag:{path}`), keeping the
   10-minute expiry trick so corrupted state self-heals, plus the per-class `changed`
   high-water mark.
3. `lib/liveresultat/poll-guard.ts`: per-path minimum interval (10 s default) with jitter,
   enforced in Redis so compliance doesn't depend on how the schedulers are tuned.
4. Rewrite `types.ts` per §3.
5. **Delete** `client.ts`, `http2-client.ts`, `scrape.ts` (already dead), the `last_hash`
   Redis keys, and the `jsonrepair` dependency — its only purpose was repairing malformed
   legacy responses; the new API returns valid JSON.

### Phase 2 — competition list
6. `?today=true` for the hot path, `?date=` / `?pastDays=` for the date-ranged path
   `SyncLiveCompetitionsJob` already accepts via `startDate`/`endDate`.
7. **Move `purgeStaleCompetitions` out.** It deletes every `live_competitions` row absent
   from the response — against a filtered list that wipes the archive. It becomes its own
   nightly job doing one unfiltered, ETag'd, brotli'd `GET /competitions`.
8. Use the IANA `timezone` from `GET /competitions/{id}` and **delete
   `getTimezoneFromOffset`** in `lib/helpers/time.ts` — a 27-entry CET-offset→zone table
   that is DST-lossy. Keep `timediff` only as the fallback when `timezone` is absent.

### Phase 3 — sync loop
9. Point `sync-live-competition` / `sync-live-class` at the new client per §4, and collapse
   the `sync-active-live-competitions` / `sync-live-competition` duplication — the two
   currently reimplement the same fetch-and-write loop against different HTTP clients. The
   fan-out shape itself does not change.
10. Poll tiers per §4, replacing the `p-limit(10)` constants with a budget derived from the
    10 s floor.
11. Guard the delete sweep: skip `notInArray` when `results` is empty but the class
    previously had rows.
12. Rewrite `insertSplitResults`. It currently strips everything after `_` and treats any
    key not ending in `status|timeplus|place` as the split *time*, so the new
    `<code>_changed` key lands in the time bucket — it survives today only because
    integer-like JS object keys iterate numerically, putting bare `1049` before
    `1049_changed` (verified in Node). Parse the suffix explicitly, and drop the copy-paste
    `obj.timeplus === undefined` guards on the `status` / `place` branches.

**Phases 1–3 are the migration.** Everything below is optional and independently
shippable; stop here and the integration is fully off `api.php`.

### Phase 4 (optional) — export-first sync and stable runner ids
13. Add the conditional `/export` step in front of the class fan-out per §5, refetching only
    the classes whose `changed` advanced.
14. Only with step 13: the `liveRunnerId` migration per §5 — add the column, implement the
    export→classresults join with its tie-breaks, dual-write for one retention window, then
    swap the unique constraint and remove the md5 hashing and the `:start:seq` workaround
    from `live-class-writer.ts`. Keep emitting `/v2`'s `liveResultId` string.

### Phase 5 (optional) — new capabilities

Additive only, and none of it is required by the migration — each item is an independent
follow-up that adds a column or table beside the existing model rather than altering it.
Ship Phases 1–3 first; treat these as a menu.

Two items (radio-control names, relay grouping) read fields only `/export` carries. They do
**not** require Phase 4: export can be fetched once per competition per day for metadata,
which is a fixed 1 request and unrelated to adopting it as the per-tick change oracle.

15. **Last passings.** `/passings` (50 newest, with `place`, `timeplus` at the control and
    `wallClock`). The app still carries a dangling type reference to
    `/v1/competitions/{competitionId}/last-passings`
    (`app/src/views/components/competition/header.tsx`, `lastPassing.tsx`) with no server
    route behind it. New `live_passings` table + `GET /v2/competitions/:id/passings`.
16. **Still out on course.** `/remaining` — a genuinely new screen, and the cheapest
    is-this-live signal for the poll tiers.
17. **Radio controls up front.** `classes[].radioControls` in `/export` gives
    `{ code, name }` before anyone has punched, so split columns render on an empty result
    list instead of appearing mid-race.
18. **Class metadata.** `isMassStart`, `qualificationLimits`, `isMultiDay` on
    `live_classes` → chase-start and qualification-heat rendering.
19. **Relay grouping.** `relayLeg` + `relayClassName` group `Ungdom-1..4` into one relay
    view instead of four unrelated classes.
20. **Country + multi-day.** `country` (today `countryCode` only ever comes from Eventor,
    so non-Swedish live competitions show no flag), `multiDayStage` / `multiDayFirstDay`
    for linking the `CompetitionId` matcher cannot infer.
21. **`serverTime`** gives clock-skew correction for the `isLive` / `start <= nowTimestamp`
    logic in `marshal/results.ts`.
22. **Eventor cross-linking.** `country` + `organizer` + `date` improve the
    `lib/match/generateIds` join rate against Eventor competitions.

### Phase 6 — cleanup
23. `selfhelp/index.ts` health-checks `api.php?method=getcompetitions`; repoint it at the
    new base URL and update the `ServiceStatusTable` id (`/v2/status` reads it by
    `LiveresultatUrl`).

## 7. Validation

With no compat layer there is no legacy/new diff to assert, so correctness rests on:

- `server/scripts/verify-liveresultat.ts` — fetch a fixed set of competitions
  (individual, relay, mass-start, multi-day, non-Swedish, zero-results) through the new
  client and assert the parsed shape, then diff two consecutive polls to confirm 304
  handling and `changed` high-water behaviour.
- Golden fixtures for `live-class-writer` covering the split-suffix parsing and the
  empty-class sweep guard. If Phase 4 is adopted, add fixtures for the export→classresults
  identity join — including competition 40467's duplicate-upload shape and a rename across
  two polls.
- A staging run across one competition weekend, comparing `live_results` row counts and
  `place`/`result` values against liveresultat.orientering.se by eye before production.

## 8. Risks

| Risk | Mitigation |
| --- | --- |
| Unknown/renamed class → 200 + empty results → mass soft-delete | Skip the sweep when `results` is empty and the class had rows (step 11) |
| Filtered list + existing `purgeStaleCompetitions` → archive wiped | Own nightly job on the unfiltered list (step 7) |
| Per-class ticks stay request-heavy without export | Poll tiers (§4) keep idle competitions off a hot poll; Phase 4 cuts it ~32× if the volume becomes a problem |
| No rollback path once the legacy client is deleted | Phase 1 ships behind a staging deploy first; legacy `api.php` stays available upstream, so a revert commit is the rollback |
| ETag varying with `accept-encoding` → permanent cache misses | Fixed `accept-encoding` header |
| `changed`-derived `newResultAt` changes the app's "new result" highlight | High-water mark per class; fixture tests on `checkIfRecentlyUpdated` |
| *(Phase 4 only)* Duplicate-upload competitions mint two ids for one runner, where the md5 merged them | Tie-break on finish result then a stable sequence (§5); measured residual 2 of 23 groups on the worst class found |
| *(Phase 4 only)* `classresults` has no runner id, so identity depends on an in-memory join | Join is `(class, name, club)` + tie-breaks; export is already fetched on every writing tick, so no extra requests (§5) |
| *(Phase 4 only)* Dropping the `liveResultId` column breaks old app builds' list keys | The `/v2` field is retained, derived from the new key (§5) |

## 9. Appendix — verified samples

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

## 10. Out of scope

The write side (`POST /competitions`, `PUT /competitions/{id}`, `POST /mop`, `POST /upload`,
`POST /upload/iofxml/*`) is for timing software and organisers. LiveOL is a read-only
consumer. Worth revisiting only if LiveOL ever hosts its own competitions.
