# Migration plan: Liveresultat REST API (`api.orienteering.services`)

Status: proposal. Verified against the live API on 2026-09-19 (every claim below was
probed with real requests; raw samples in the appendix).

**This is a clean-slate rewrite of the Liveresultat integration.** No adapter layer, no
dual-source flag, no preservation of the legacy response shapes. Internal types are modelled
on the new API directly and the legacy `api.php` code is deleted rather than kept alive.

> **One boundary that is not ours to break:** `/v2/*` is consumed by App Store / Play Store
> builds already on users' phones, which cannot be forced to update. This plan therefore
> rewrites everything *behind* `/v2` freely and only **adds** fields to `/v2` responses.
> If breaking `/v2` for old clients is also acceptable, say so — §5 gets considerably
> simpler and the `olRunnerId` name-matching can go entirely.

## 1. Where we are today

| Concern | Current implementation |
| --- | --- |
| Competition list | `LiveresultatAPIClient.getcompetitions()` — already hits `https://api.orienteering.services/competitions`, **unfiltered** (8002 competitions, 875 KB) |
| Competition info | legacy `GET /api.php?method=getcompetitioninfo&comp=` |
| Classes | legacy `getclasses` + `last_hash` (Redis `liveresultat:lastHash:classes:{id}`) |
| Class results | legacy `getclassresults&unformattedTimes=true` + `last_hash` |
| Transport | `axios` (`lib/liveresultat/client.ts`) **and** a hand-rolled HTTP/2 client (`lib/liveresultat/http2-client.ts`) with duplicated hash logic, both on `liveresultat.orientering.se` |
| Change detection | `last_hash` → `status: "NOT MODIFIED"`; "new result" inferred from `DT_RowClass` |
| Result identity | `md5(classId + name + club)`, plus a `:start:seq` suffix to break collisions |
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

## 4. Sync architecture: export-first

Measured on `SM, lång (Swedish League, #7), Final` (1048 runners, 32 classes):

| Strategy | Requests | Bytes (raw) | Bytes (br) | Wall clock |
| --- | --- | --- | --- | --- |
| per-class `classresults` (today) | 32 | 388 328 | ~40 K | 15.4 s |
| single `/export` | **1** | 343 072 | **35 137** | <1 s |

One job, `sync-live-competition`, replaces the
`competitions → competition → class` fan-out:

1. Conditional `GET /competitions/{id}/export`.
2. **304 → stop.** One request replaces N class requests for an idle competition. Most
   "active" competitions are idle most of the time, so this is the dominant saving.
3. 200 → compare each result's `changed` against the stored high-water mark, and fetch
   `?class=` **only for classes that actually moved** — typically 1–3 of 32 per tick.
4. Write, using `changed` both to set `newResultAt` and to advance the mark.

`place` / `timeplus` / `progress` stay sourced from `classresults`. Export omits them and
deriving them for mass-start, relay and multi-day classes is a correctness risk for no gain.

**Poll tiers**, driven by `hasResults` and `/remaining`:

| Tier | Condition | Export poll |
| --- | --- | --- |
| hot | results changed in the last 5 min | 15 s |
| warm | started, no recent change, `/remaining` non-empty | 60 s |
| cold | `hasResults` false and start in the future, or `/remaining` empty | 10 min |

Peak Swedish Saturday (~30 competitions) goes from `30 × ~25 classes` ≈ 750 requests per
tick to ~30.

## 5. Result identity

Today a result row is keyed by `md5(classId + name + club)` with a `:start:seq` suffix to
break duplicate-name collisions. `/export` gives `runners[].id`, stable within a
competition, so `live_results` is keyed on `(liveCompetitionId, liveRunnerId)` instead.
Renames and club corrections stop creating orphan rows.

`olRunnerId` (the normalised `name~class~club` id from `lib/match/generateIds`) **stays** —
tracking is user-entered `name` + `clubs[]` (`ol_tracking`), matched by string in
`getAllTrackedRunnerIds`, so there is no stable id to migrate it to. The change is that
`olRunnerId` becomes a *lookup* key only, not the row's identity.

Migration: add `liveRunnerId integer`, backfill from export for competitions in the
retention window, then swap the unique constraint. `live_results` holds ≤3 days of data
(`purge-old-live-results`), so this drains on its own rather than needing a backfill of the
archive.

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

### Phase 3 — export-first sync
9. Rewrite `sync-live-competition` per §4; retire `sync-live-class` and the
   `sync-active-live-competitions` / `sync-live-competition` duplication (the two currently
   reimplement the same fetch-and-write loop against different HTTP clients).
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

### Phase 4 — identity
13. `liveRunnerId` migration per §5; remove the md5 hashing and the `:start:seq` collision
    workaround from `live-class-writer.ts`.

### Phase 5 — new capabilities (additive to `/v2`, each independently shippable)
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

With no compat layer there is no legacy/new diff to assert, so correctness rests on:

- `server/scripts/verify-liveresultat.ts` — fetch a fixed set of competitions
  (individual, relay, mass-start, multi-day, non-Swedish, zero-results) through the new
  client and assert the parsed shape, then diff two consecutive polls to confirm 304
  handling and `changed` high-water behaviour.
- Golden fixtures for `live-class-writer` covering the split-suffix parsing, the empty-class
  sweep guard, and duplicate runner names.
- A staging run across one competition weekend, comparing `live_results` row counts and
  `place`/`result` values against liveresultat.orientering.se by eye before production.

## 8. Risks

| Risk | Mitigation |
| --- | --- |
| Unknown/renamed class → 200 + empty results → mass soft-delete | Skip the sweep when `results` is empty and the class had rows (step 11) |
| Filtered list + existing `purgeStaleCompetitions` → archive wiped | Own nightly job on the unfiltered list (step 7) |
| No rollback path once the legacy client is deleted | Phase 1 ships behind a staging deploy first; legacy `api.php` stays available upstream, so a revert commit is the rollback |
| ETag varying with `accept-encoding` → permanent cache misses | Fixed `accept-encoding` header |
| `changed`-derived `newResultAt` changes the app's "new result" highlight | High-water mark per class; fixture tests on `checkIfRecentlyUpdated` |
| Identity swap breaking tracking | `olRunnerId` retained for tracking lookup (§5); only the row key changes |

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
