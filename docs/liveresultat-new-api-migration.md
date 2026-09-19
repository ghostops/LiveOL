# Migration plan: Liveresultat REST API (`api.orienteering.services`)

Status: proposal. Verified against the live API on 2026-09-19 (every claim below was
probed with real requests; raw samples in the appendix).

**This is a drop-in replacement.** `LiveresultatAPIClient` keeps its method names and return
types; the new endpoints are adapted to the existing `LiveresultatApi` shapes inside
`lib/liveresultat/` (§3). The legacy `api.php` code is deleted — this is the new API wearing
the old contract, not the old client kept on life support.

**Phase 1 changes no files outside `lib/liveresultat/`.** No table changes, no `/v2` changes,
no changes in the jobs, the writer or the controllers. The behaviour improvements that do
reach outside it — filtered competition list, IANA `timezone`, poll tiers — ship alongside in
Phases 2–4 and are listed separately so they can be backed out on their own.

**`/export` and the stable runner ids stay optional** (§5). Neither is needed to get off
`api.php`.

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
| `/v2` leak | `getResultByLiveClassId` returns the `last_hash` value as `hash`; the app vibrates on it changing (§3) |
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
  otherwise soft-delete every row in it via the `notInArray` sweep in `insertResults` —
  handled in the adapter, see §3.
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

## 3. The client surface does not change

`LiveresultatApi` in `lib/liveresultat/types.ts` stays exactly as it is, and
`LiveresultatAPIClient` keeps its method names and return types. The new endpoints are
adapted to the existing shapes **inside** `lib/liveresultat/`, so the swap itself changes
nothing in the jobs, the writer or the controllers.

This is not the legacy code kept alive — `api.php` is gone and the legacy clients are
deleted. It is the new API presented through the contract the codebase already speaks.

| Existing contract | How the adapter satisfies it |
| --- | --- |
| `getclasses()` → `{ classes: [{ className }], hash, status }` | map `string[]` → `[{ className }]`; `hash` = the ETag |
| `getclassresults()` → `{ className, splitcontrols, results, hash, status }` | rename `splitControls` → `splitcontrols`; `hash` = the ETag |
| `null` return for "not modified" | HTTP **304** instead of `status: "NOT MODIFIED"` |
| `result.DT_RowClass === 'new_result'` | synthesised when the row's `changed` is newer than the stored high-water mark |
| `result.splits` keyed `1065`, `1065_status`, … | pass through, **stripping the new `<code>_changed` keys** |
| `getcompetitions()` / `getcompetitioninfo()` | already legacy-shaped; `timezone`, `country`, `hasResults` etc. are additive |

### The ETag goes in the existing Redis key

The current hash keys — `liveresultat:lastHash:classes:{id}` and
`liveresultat:lastHash:class:{class}:results:{id}` — become the ETag store, same names, same
10-minute expiry. That is not just tidiness: **`getResultByLiveClassId` reads that key
directly and returns it as `hash` in the `/v2` response**, and the app feeds it to
`useNotifyOnUpdate` (`app/src/views/scenes/live-results/`) to vibrate the phone when results
change. Deleting those keys would pin `hash` to `'none'`, so `hash !== previousHash.current`
never fires and vibrate-on-update dies silently on every shipped build. An ETag changes
exactly when the content changes, so storing it there preserves the feature with no
controller or app change.

### Two correctness fixes land in the adapter, not the writer

Both risks the new API introduces are handled before the writer sees the data, which is what
keeps `live-class-writer.ts` untouched:

- **Empty `results` on an unknown class.** A renamed or mistyped class returns 200 with
  `results: []`, which would drive the `notInArray` sweep in `insertResults` to soft-delete
  every row in the class. The adapter returns `null` (i.e. "not modified") for an empty
  result set, so the sweep never runs. The trade is deliberate: a class legitimately emptied
  by the organiser keeps stale rows, which is the safer failure than mass-deleting on a typo.
- **The `<code>_changed` split key.** `insertSplitResults` treats any split key not ending in
  `status|timeplus|place` as the *time*, so `_changed` lands in the time bucket. It survives
  today only because integer-like JS object keys iterate numerically, putting bare `1049`
  before `1049_changed` (verified in Node) — luck, not correctness. Stripping `_changed` in
  the adapter removes the hazard without touching the parser.

Hardening `insertSplitResults` itself (explicit suffix parsing, dropping the copy-paste
`obj.timeplus === undefined` guards on the `status` / `place` branches) stays worth doing, but
it becomes optional hygiene rather than part of the migration.

## 4. Sync architecture: per-class conditional GET

The core migration keeps today's shape — one request per class — and swaps `last_hash` for
`ETag` / `If-None-Match`. `sync-live-competition` fans out to `sync-live-class` as it does
now; only the change-detection mechanism and the transport change.

1. `GET /competitions/{id}/classes` (conditional) for the class list, falling back to the
   stored classes on 304, exactly as today.
2. `GET /competitions/{id}/classresults?class=` per class, conditional.
3. **304 → skip the write.** Same as today's `status: "NOT MODIFIED"`.
4. 200 → write via the existing `LiveClassWriter`, unchanged: the adapter has already turned
   `changed` into the `DT_RowClass` flag the writer looks for (§3).

A 304 is cheap but not free: measured on `SM, lång, Final` (32 classes), 32 conditional
requests all returning 304 took **16.1 s serial** (~490 ms each) and **2.5 s at concurrency
10**. That is the cost we already pay, so the core migration is strictly better than today
(brotli, keep-alive, ETag) without being cleverer than today.

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

| Strategy | Requests | Idle tick, serial | Idle tick, concurrency 10 | Full fetch (br) |
| --- | --- | --- | --- | --- |
| per-class `classresults` (§4) | 32 | 16.1 s | 2.5 s | ~40 K |
| single `/export` | **1** | **0.64 s** | **0.64 s** | 35 137 |

Read that carefully — the three axes do not move together:

- **Requests: 32 → 1**, and the 32 is just the class count, so the ratio is `N → 1`. This is
  the figure that matters, because the API's contract is a poll interval *per endpoint*, so
  request count is the budget being spent.
- **Latency: ~4×**, not 32×. Concurrency already hides most of the serial cost.
- **Bytes: no steady-state saving at all.** On a 304 tick both are headers only; on a tick
  that writes, export's 35 KB is *additional* to the `classresults` still being fetched. The
  388 KB / 343 KB full-payload comparison describes an initial sync, not a poll.

The saving also decays with activity: with M classes changed it is `1 + M` against `N`, so
`N / (1 + M)` — 32× when nothing moved, ~5× at M=5, a net loss when everything moved. Export
wins because most competitions are idle on most ticks, not because it is faster.

At fleet scale that is the real argument: a peak Saturday of ~30 competitions × ~25 classes is
~750 requests per tick against ~30.

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

### Phase 1 — the swap (nothing outside `lib/liveresultat/`)
1. `lib/liveresultat/http.ts`: one `undici`-based client with keep-alive,
   `accept-encoding: gzip, br` (constant — CloudFront varies on it, so a varying header
   would invalidate ETags), `If-None-Match`, timeout, and retry on 5xx/network only
   (304 and 404 are terminal).
2. ETag storage in the **existing** `liveresultat:lastHash:*` Redis keys, same names and
   10-minute expiry, so `getResultByLiveClassId`'s `hash` field and the app's
   vibrate-on-update keep working untouched (§3). Add the per-class `changed` high-water mark
   alongside, for synthesising `DT_RowClass`.
3. `lib/liveresultat/poll-guard.ts`: per-path minimum interval (10 s default) with jitter,
   enforced in Redis so compliance doesn't depend on how the schedulers are tuned.
4. Re-point `LiveresultatAPIClient` at the new endpoints behind its existing method
   signatures, with the field mapping and the two adapter-level correctness fixes in §3.
   `types.ts` is **not** changed.
5. **Delete** `http2-client.ts` (superseded — `sync-active-live-competitions` goes back to the
   one client), `scrape.ts` (already dead code), and the `jsonrepair` dependency — its only
   purpose was repairing malformed legacy responses; the new API returns valid JSON.
6. Verify against the comparison harness in §7 before the behaviour phases land, so any
   regression is attributable to the swap alone.

### Phase 2 — competition list *(reaches outside `lib/liveresultat/`)*
7. `?today=true` for the hot path, `?date=` / `?pastDays=` for the date-ranged path
   `SyncLiveCompetitionsJob` already accepts via `startDate`/`endDate`.
8. **Move `purgeStaleCompetitions` out.** It deletes every `live_competitions` row absent
   from the response — against a filtered list that wipes the archive. It becomes its own
   nightly job doing one unfiltered, ETag'd, brotli'd `GET /competitions`.
9. Use the IANA `timezone` from `GET /competitions/{id}` and **delete
   `getTimezoneFromOffset`** in `lib/helpers/time.ts` — a 27-entry CET-offset→zone table
   that is DST-lossy. Keep `timediff` only as the fallback when `timezone` is absent.

### Phase 3 — sync loop *(reaches outside `lib/liveresultat/`)*
10. Collapse the `sync-active-live-competitions` / `sync-live-competition` duplication — the
    two currently reimplement the same fetch-and-write loop against different HTTP clients.
    The fan-out shape itself does not change.
11. Poll tiers per §4, replacing the `p-limit(10)` constants with a budget derived from the
    10 s floor.

**Phase 1 is the migration.** It is fully off `api.php` on its own; Phases 2–3 are the
operational wins riding along, and everything below is optional.

### Phase 4 (optional) — export-first sync and stable runner ids
12. Add the conditional `/export` step in front of the class fan-out per §5, refetching only
    the classes whose `changed` advanced.
13. Only with step 12: the `liveRunnerId` migration per §5 — add the column, implement the
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

14. **Last passings.** `/passings` (50 newest, with `place`, `timeplus` at the control and
    `wallClock`). The app still carries a dangling type reference to
    `/v1/competitions/{competitionId}/last-passings`
    (`app/src/views/components/competition/header.tsx`, `lastPassing.tsx`) with no server
    route behind it. New `live_passings` table + `GET /v2/competitions/:id/passings`.
15. **Still out on course.** `/remaining` — a genuinely new screen, and the cheapest
    is-this-live signal for the poll tiers.
16. **Radio controls up front.** `classes[].radioControls` in `/export` gives
    `{ code, name }` before anyone has punched, so split columns render on an empty result
    list instead of appearing mid-race.
17. **Class metadata.** `isMassStart`, `qualificationLimits`, `isMultiDay` on
    `live_classes` → chase-start and qualification-heat rendering.
18. **Relay grouping.** `relayLeg` + `relayClassName` group `Ungdom-1..4` into one relay
    view instead of four unrelated classes.
19. **Country + multi-day.** `country` (today `countryCode` only ever comes from Eventor,
    so non-Swedish live competitions show no flag), `multiDayStage` / `multiDayFirstDay`
    for linking the `CompetitionId` matcher cannot infer.
20. **`serverTime`** gives clock-skew correction for the `isLive` / `start <= nowTimestamp`
    logic in `marshal/results.ts`.
21. **Eventor cross-linking.** `country` + `organizer` + `date` improve the
    `lib/match/generateIds` join rate against Eventor competitions.

### Phase 6 — cleanup
22. `selfhelp/index.ts` health-checks `api.php?method=getcompetitions`; repoint it at the
    new base URL and update the `ServiceStatusTable` id (`/v2/status` reads it by
    `LiveresultatUrl`).

## 7. Validation

Preserving the client surface buys the strongest check available: the old and new clients
return the *same type*, so they can be diffed directly.

- `server/scripts/compare-liveresultat.ts` — for a list of competition ids, call the legacy
  `api.php` client and the new one, and diff the resulting `LiveresultatApi.getclasses` /
  `getclassresults` objects field by field. Upstream `api.php` is still live, so this runs for
  real against both. A clean diff across a mixed set — individual, relay, mass-start,
  multi-day, non-Swedish, zero-results, and 40467's duplicate-upload shape — is the actual
  evidence that Phase 1 is a drop-in. Keep it as a CI smoke test for as long as `api.php`
  answers.
- Fixtures for the adapter specifically: the `<code>_changed` strip, the empty-`results` →
  `null` guard, ETag → `hash` passthrough, and `DT_RowClass` synthesis across two polls
  (unchanged row must **not** be flagged).
- One manual check the harness cannot cover: confirm the app still vibrates on update, since
  that path runs through the `hash` field end to end (§3).
- A staging run across one competition weekend before production, comparing `live_results`
  row counts and `place` / `result` values against liveresultat.orientering.se.

## 8. Risks

| Risk | Mitigation |
| --- | --- |
| Unknown/renamed class → 200 + empty results → mass soft-delete | Adapter returns `null` for an empty result set, so the sweep never runs (§3) |
| Filtered list + existing `purgeStaleCompetitions` → archive wiped | Own nightly job on the unfiltered list (step 8) |
| Per-class ticks stay request-heavy without export | Poll tiers (§4) keep idle competitions off a hot poll; Phase 4 cuts it ~32× if the volume becomes a problem |
| No rollback path once the legacy client is deleted | `api.php` stays live upstream, so a revert commit is the rollback; the §7 diff harness gates the deploy in the first place |
| Deleting the `last_hash` keys silently kills the app's vibrate-on-update | ETag stored in those same keys; `hash` keeps changing exactly when content does (§3) |
| ETag varying with `accept-encoding` → permanent cache misses | Fixed `accept-encoding` header |
| `changed`-derived `DT_RowClass` changes the app's "new result" highlight | High-water mark per class, synthesised in the adapter; fixtures assert an unchanged row is not flagged |
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
