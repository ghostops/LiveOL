# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LiveOL is a mobile app for displaying live orienteering results. The project consists of two main components:
- **App/** - React Native mobile app (iOS/Android)
- **Server/** - Node.js backend with Express/tRPC API

## Development Commands

### App (React Native)

```bash
cd App

# Development
npm start                  # Start Metro bundler
npm run ios               # Run on iOS simulator
npm run android           # Run on Android emulator

# Testing & Quality
npm test                  # Run Jest tests
npm run lint             # ESLint check

# Schema Generation (automatic via postinstall)
npm run schema           # Generate TypeScript types from server's OpenAPI spec
                        # Fetches from http://localhost:3036/v1/documentation

# Build & Release
npm run archive:ios      # Build & upload iOS via Fastlane
npm run archive:android  # Build & upload Android via Fastlane
npm run archive          # Build both platforms
```

**Important**: The `schema` script must run with the server running on `localhost:3036` to generate API types.

### Server (Node.js)

```bash
cd Server

# Development
npm run dev              # Start with nodemon + pino-pretty logs
npm start                # Production start (ts-node)

# Testing & Quality
npm run tscheck          # TypeScript type checking (no emit)
npm run lint            # ESLint check
npm run format          # Prettier format

# Database Migrations
npx drizzle-kit generate # Generate migrations from schema changes
npx drizzle-kit migrate  # Run pending migrations
npx drizzle-kit studio   # Open Drizzle Studio (DB GUI)
```

**Environment Setup**: Copy `.env.example` to `.env` and configure:
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_HOST`, `REDIS_PASSWORD` - Redis for caching & job queue
- `EVENTOR_API_KEY_SE`, `EVENTOR_API_KEY_AU` - Eventor API credentials
- `SLACK_WEBHOOK` - Notifications (optional)
- `GOOGLE_GENAI_API_KEY` - Google GenAI integration (optional)

## Architecture

### App Architecture (React Native)

**Navigation**: Nested stack/tab pattern using React Navigation
- Bottom tabs: `Tracking`, `Home`, `Profile`
- Stack screens: `CompetitionV2`, `Results`, `Club`, `TrackRunner`, etc.
- Main router: `App/src/lib/nav/router.tsx`

**State Management**: Zustand with AsyncStorage persistence
- Store files in `App/src/store/`
- Pattern: Each store uses `persist()` middleware with `zustandAsyncStorage` adapter
- Key stores: `following.ts` (tracked runners), `plus.ts` (subscriptions), `liveRunning.ts`

**API Client**: Type-safe OpenAPI client with React Query
- Client setup: `App/src/lib/react-query/api.ts`
- Auto-generated types: `App/src/lib/react-query/schema.d.ts` (from `schema.js` postinstall)
- Usage pattern: `$api.useQuery('get', '/v2/competitions/{id}', {...})`
- Base URL: `https://api-liveol.larsendahl.se` (production)

**Path Aliases**: `~/` maps to `App/src/` (configured in `tsconfig.json` and `babel.config.js`)

### Server Architecture (Node.js/Express)

**Dual Protocol Server**:
- **Express + Zod API** on port 3000 (main HTTP API with OpenAPI documentation)
- **tRPC** on port 3001 (legacy RPC endpoints)

**API Structure**:
- Controllers: `Server/src/controllers/` - Request handlers with Zod validation
- Express setup: `Server/src/express/setup.ts` - Route definitions
- tRPC router: `Server/src/trpc/router.ts` - RPC procedures
- OpenAPI generation: Auto-generated via `express-zod-api`

**Service Layer** (`Server/src/lib/`):
- `singletons.ts` - Single instances of API clients, DB, Queue, Cache
- `liveresultat/` - Swedish live results API client with Redis caching
- `eventor/` - Multi-endpoint Eventor API combiner (Sweden + Australia)
- `db/` - Drizzle ORM setup and schema
- `queue.ts` - BullMQ job dispatcher
- `redis.ts` - Caching layer (TTL-based)

**Database** (PostgreSQL + Drizzle ORM):
- Schema: `Server/src/lib/db/schema/`
  - `live_*.ts` - Liveresultat competition/class/result data
  - `eventor_*.ts` - Eventor competition/result data
  - `ol_*.ts` - App-specific data (users, tracking, runners)
- Connection: Environment variable `DATABASE_URL`
- Migrations: Managed via `drizzle-kit` (config in `drizzle.config.ts`)

**Background Jobs** (BullMQ + Redis):
- Queue: `ol_queue` with concurrency=1, rate limit 3/second
- Job types in `Server/src/jobs/`:
  - `liveresultat/` - Sync competitions/classes/results (15s-1h intervals)
  - `eventor/` - Sync competitions/signups/results/starts
- Pattern: Parent jobs dispatch child jobs (batch processing)

### External Service Integrations

**Liveresultat API** (Primary data source):
- Swedish live orienteering results
- Caching: Redis with 15s-1h TTL depending on endpoint
- Fallback: HTML scraping with Cheerio if JSON API fails
- Key methods: `getcompetitions()`, `getclassresults()`, `getlastpassings()`

**Eventor API** (International events):
- Multiple endpoints combined (Sweden, Australia)
- Architecture: `EventorCombiner` aggregates multiple `EventorApi` instances
- Requires API keys: `EVENTOR_API_KEY_SE`, `EVENTOR_API_KEY_AU`
- Pattern: Scraper fallback if API fails

### Data Flow

```
App → OpenAPI Fetch Client ($api) → Express/Zod API (Port 3000)
                                  ↓
                    Express Controller/tRPC Procedure
                                  ↓
              ┌───────────────────┼───────────────────┐
              ↓                   ↓                   ↓
      Liveresultat API    Eventor API         Database (Drizzle)
      (with Redis cache)  (multi-endpoint)    (PostgreSQL)
                                  ↓
                            BullMQ Jobs
                            (background sync)
```

## Code Patterns & Conventions

### TypeScript Usage
- Both App and Server use TypeScript with strict type checking
- App: Extends `@react-native/typescript-config`
- Server: Custom config with path aliases (`tsconfig-paths`)
- Use `npm run tscheck` (Server) to verify types without emitting

### React Native Best Practices
- Use functional components with hooks (per `.github/copilot-instructions.md`)
- Navigation via React Navigation (stack + tabs)
- Styling: Inline styles (avoid StyleSheet when possible)
- Performance: Use `@shopify/flash-list` for long lists (not FlatList)

### API Development
- Server: Define controllers with Zod schemas for input/output validation
- Schema changes automatically generate OpenAPI docs
- App: Run `npm run schema` to update TypeScript types after server changes

### Database Workflow
1. Modify schema files in `Server/src/lib/db/schema/`
2. Run `npx drizzle-kit generate` to create migration
3. Run `npx drizzle-kit migrate` to apply migration
4. Use Drizzle Studio (`npx drizzle-kit studio`) for debugging

### Job System
- Jobs should be idempotent (can be retried safely)
- Use batch processing pattern: parent job dispatches child jobs
- Max retries: 3 with exponential backoff
- Jobs auto-cleanup on success

## Important File Locations

| Purpose | Location |
|---------|----------|
| App navigation | `App/src/lib/nav/router.tsx` |
| App API client | `App/src/lib/react-query/api.ts` |
| App stores | `App/src/store/` |
| Server entry | `Server/src/index.ts` |
| API routes | `Server/src/express/setup.ts` |
| Controllers | `Server/src/controllers/` |
| DB schema | `Server/src/lib/db/schema/` |
| Jobs | `Server/src/jobs/` |
| Service singletons | `Server/src/lib/singletons.ts` |

## Release Process

**iOS** (via Fastlane):
```bash
cd App
npm run archive:ios
```
- Requires: `.env.local` with `IOS_KEY_FILENAME`, `IOS_ISSUER_ID`, `IOS_KEY_ID`
- Uploads to TestFlight

**Android** (via Fastlane):
```bash
cd App
npm run archive:android
```
- Requires: `.env.local` with `ANDROID_STORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`
- Uploads to Google Play + sourcemaps to Bugsnag

## Testing

**App**: Jest tests in `App/__tests__/`
```bash
cd App && npm test
```

**Server**: No test suite currently configured (manual testing + type checking)
```bash
cd Server && npm run tscheck
```
