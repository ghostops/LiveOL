# Bruno collections

API collections for [Bruno](https://www.usebruno.com/). Files are plain text and live
in git, so requests are reviewable in a diff.

## liveresultat/

The new Liveresultat REST API and the legacy `api.php` endpoints, side by side, for
the migration planned in
[`docs/liveresultat-new-api-migration.md`](../docs/liveresultat-new-api-migration.md).

| Folder | What it holds |
| --- | --- |
| `new-api/` | `https://api.orienteering.services` — all read endpoints, including conditional (304) variants |
| `legacy-api/` | `https://liveresultat.orientering.se/api.php` — the same calls we make today, matching `seq` numbers for pairing |
| `quirks/` | One request per verified behaviour the plan depends on |

### Opening it

Bruno → *Open Collection* → pick `bruno/liveresultat`, then select the **production**
environment (top right). That sets the base URLs and the competition under test:

| Variable | Default | Notes |
| --- | --- | --- |
| `compId` | `40488` | SM lång 2026 — 1048 runners, 32 classes, split controls |
| `className` | `D18A` | has 5 split controls |
| `clubName` | `IFK Göteborg Orientering` | 44 runners in that competition |
| `slashCompId` / `slashClassName` | `40538` / `K20/21` | for the slash-in-class-name quirk |

Point `compId` at a competition running today to watch live data move.

### Conditional requests

The `(conditional, expect 304)` requests read an ETag captured by the plain request
above them, so run the plain one first. That pair is the whole change-detection story:
legacy `last_hash` + `status: "NOT MODIFIED"` versus `If-None-Match` + a real 304.

### Running it headless

```bash
npm i -g @usebruno/cli
cd bruno/liveresultat
bru run --env production                  # everything
bru run new-api --env production           # one folder
```

Every request asserts its expected status, so this doubles as a smoke test: it is a
cheap way to notice upstream changing shape under us. All 24 requests were verified
green against the live APIs on 2026-09-19.

### What is deliberately missing

The write endpoints — `POST /competitions`, `PUT /competitions/{eventid}`, `/mop`,
`/upload`, `/upload/iofxml/*`. They create or mutate real competitions on a live
shared service, and LiveOL is a read-only consumer.
