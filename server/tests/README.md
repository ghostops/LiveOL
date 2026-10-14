# Server integration tests

Characterisation tests for the Liveresultat sync flow, written so the migration
to `api.orienteering.services`
([plan](../../docs/liveresultat-new-api-migration.md)) can be shown not to
change behaviour.

```bash
cd server
npm test                  # the whole suite
npm run test:snapshots    # regenerate tests/snapshots/ (review the diff!)
npm run test:fixtures     # re-record tests/fixtures/ from the live APIs
```

No services required. Postgres is [PGlite](https://pglite.dev) — real Postgres
compiled to WASM — with the project's own `drizzle/` migrations applied, and
Redis is `ioredis-mock`. Upstream Liveresultat is a local HTTP/1.1 and h2c
server replaying recorded responses, so the client's own hash handling,
`jsonParse` and URL construction all really execute.

## What each file covers

| File | Layer |
| --- | --- |
| `liveresultat-client.test.ts` | the axios client: hash store/replay, `NOT MODIFIED` → `null`, URL shape, `jsonrepair` |
| `liveresultat-http2-client.test.ts` | the HTTP/2 client the bulk sync uses, including recovery after a dropped session |
| `live-class-writer.test.ts` | every database semantic: identity, dedupe, the soft-delete sweep, `newResultAt`, split parsing, push events |
| `marshal-results.test.ts` | `isLive` / `hasRecentlyUpdated` / `isTracking` — what the app renders |
| `notifications-detect.test.ts` | which result changes become push events |
| `flow.test.ts` | end to end: HTTP → client → writer → Postgres → marshal, against a committed snapshot |

## The snapshot is the regression guard

`flow.test.ts` projects the synced database into `tests/snapshots/flow.json`,
leaving out serial ids and wall-clock columns. **When the client is repointed at
the new API, that projection must come out byte-identical.** That is the
evidence the migration is a drop-in; a diff there is the migration changing
stored data.

## Fixtures

`tests/fixtures/legacy/` is recorded from `api.php`, which the migration
retires — **once it is switched off these recordings cannot be made again**, so
treat them as the reference for what the new client must reproduce.
`tests/fixtures/new/` is the same data from the new API, ready for the adapter's
own tests.

Two competitions are recorded:

- **40488** SM lång 2026 — 1048 runners, 32 classes; class `D18A` has 5 split
  controls. The main fixture.
- **40467** uploaded twice, so `M21E-1` carries 23 duplicate name+club pairs,
  each one finished row plus a never-started ghost with an identical start time.
  The dedupe and identity edge case.

## Known gaps

- **`getcompetitions` is not covered.** `LiveresultatAPIClient.getcompetitions`
  hardcodes `https://api.orienteering.services/competitions` rather than using
  the client's `root`, so it cannot be pointed at the fixture server without a
  production change. Making that base URL default-injectable would close the gap
  with no behaviour change.
- **BullMQ dispatch is not covered.** The sync jobs call
  `apiSingletons.createApiSingletons()` in their constructors, which opens real
  Redis and queue connections, so they cannot be instantiated under test without
  dependency injection. The flow test therefore wires client → writer directly.
  The parent/child dispatch plumbing is also the part the migration leaves
  alone.
- Entitlements and the Redis-backed tracked index are not exercised; the writer's
  push integration is covered with a minimal notifier instead.
