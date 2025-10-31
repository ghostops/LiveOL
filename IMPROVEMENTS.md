# LiveOL Improvement Plan

## Executive Summary

LiveOL is a well-structured orienteering results app with a modern tech stack, but there are several areas that need attention to improve code quality, security, and maintainability.

**Code Stats:**
- Total Lines: ~8,000 (App: 5,738 | Server: 2,271)
- Test Coverage: 0%
- Type Safety: ~70% (many `any` types)
- Overall Quality: 3.5/5

---

## 1. Critical Issues (Fix Immediately)

### 1.1 Broken Subscription Feature
**Location:** `App/src/hooks/useIap.ts:44`

**Issue:** Subscription check is hardcoded to always return `true`, making premium features freely accessible.

```typescript
// Current (broken):
const hasActiveSubscription = true // TODO: Implement

// Should be:
const hasActiveSubscription = useMemo(() => {
  if (!customerInfo) return false
  return Object.values(customerInfo.entitlements.active).length > 0
}, [customerInfo])
```

**Impact:** Revenue loss, unpaid access to premium features

**Effort:** 2-4 hours

---

### 1.2 Missing Input Validation
**Location:** `Server/src/routes/search.ts`, `Server/src/routes/eventor.ts`

**Issue:** Search queries and external inputs are not validated, risking DoS attacks and injection vulnerabilities.

**Fix:**
```typescript
// Add Zod validation schemas
const searchSchema = z.object({
  query: z.string().min(1).max(100).trim(),
  limit: z.number().int().min(1).max(50).optional().default(20)
})

// Use in route handlers
router.post('/search', async (req, res) => {
  const validated = searchSchema.parse(req.body)
  // ... use validated data
})
```

**Impact:** Security vulnerability, potential service disruption

**Effort:** 4-8 hours

---

### 1.3 Unvalidated JSON Parsing
**Location:** Multiple locations in Server code

**Issue:** JSON parsing without try-catch blocks can crash the server.

**Fix:**
```typescript
// Add safe JSON parser utility
function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json)
  } catch (error) {
    logger.error('JSON parse error', { error, json: json.substring(0, 100) })
    return fallback
  }
}
```

**Impact:** Service crashes, poor error handling

**Effort:** 2-4 hours

---

## 2. High Priority Improvements

### 2.1 Replace Deprecated Dependencies

#### Replace moment.js with date-fns
**Reason:** moment.js is deprecated and large (adding ~290KB to bundle)

**Current usage:**
- `App/package.json`: moment-duration-format
- `Server/package.json`: moment, moment-timezone

**Migration:**
```bash
# App
npm uninstall moment-duration-format
# Already using date-fns 3.3.1

# Server
npm uninstall moment moment-timezone
npm install date-fns date-fns-tz
```

**Effort:** 8-16 hours (need to update all usages)

---

#### Upgrade Apollo Server (if still needed)
**Current:** apollo-server@2.14.2 (released 2020, outdated)
**Latest:** @apollo/server@4.x

**Question:** Is Apollo Server still needed? The codebase uses tRPC and express-zod-api. Consider removing if unused.

**Effort:** 4-8 hours to upgrade OR 2 hours to remove

---

### 2.2 Implement Comprehensive Testing

**Current State:**
- Only 1 smoke test in `App/__tests__/App-test.tsx`
- 0% coverage
- No server tests

**Recommended Testing Strategy:**

```typescript
// Example: Test critical hooks
// App/src/hooks/__tests__/useIap.test.ts
describe('useIap', () => {
  it('should return false when no customer info', () => {
    // Mock RevenueCat
    // Test subscription logic
  })

  it('should return true when active subscription exists', () => {
    // Test with active subscription
  })
})

// Example: Test server endpoints
// Server/src/routes/__tests__/search.test.ts
describe('Search API', () => {
  it('should validate search query length', async () => {
    const response = await request(app)
      .post('/api/search')
      .send({ query: '' })
    expect(response.status).toBe(400)
  })
})
```

**Setup:**
```bash
# Server: Add Jest
cd Server
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest

# Add jest.config.js
npx ts-jest config:init
```

**Effort:** 40-80 hours for comprehensive coverage (do incrementally)

---

### 2.3 Add Error Logging and Monitoring

**Issue:** 22+ console.log statements, no structured logging

**Solution:**

```typescript
// Server/src/lib/logger.ts
import winston from 'winston'

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})
```

**Replace all console.log:**
```typescript
// Before:
console.log('Fetching data', { url })

// After:
logger.info('Fetching data', { url })
```

**Add error tracking:**
```bash
npm install @sentry/node @sentry/react-native
```

**Effort:** 8-12 hours

---

### 2.4 Improve Type Safety

**Issue:** 28+ instances of `any` type, weakening TypeScript benefits

**Examples to fix:**

```typescript
// App/src/util/colors.ts - any types for color functions
export function getEventColor(event: any): string // ❌

export function getEventColor(event: Event): string // ✅

// App/src/hooks/useSearch.ts - any in state
const [results, setResults] = useState<any[]>([]) // ❌

const [results, setResults] = useState<SearchResult[]>([]) // ✅

// Server - broad error catches
} catch (e: any) { // ❌
  console.log(e)
}

} catch (error) { // ✅
  if (error instanceof Error) {
    logger.error('Operation failed', { error: error.message, stack: error.stack })
  }
  throw error
}
```

**Effort:** 16-24 hours

---

### 2.5 Environment Variable Validation

**Issue:** No validation of required environment variables at startup

**Solution:**

```typescript
// Server/src/config/env.ts
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number).pipe(z.number().int().positive()),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  SLACK_WEBHOOK_URL: z.string().url().optional(),
  // ... all other env vars
})

export const env = envSchema.parse(process.env)

// Use in code:
import { env } from '@/config/env'
console.log(env.PORT) // Type-safe!
```

**Effort:** 4-6 hours

---

## 3. Medium Priority Improvements

### 3.1 Configure React Query Defaults

**Issue:** No default configuration for QueryClient

**Fix:**

```typescript
// App/src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
})
```

**Effort:** 2-3 hours

---

### 3.2 Add API Rate Limiting

**Issue:** No rate limiting on server endpoints

**Solution:**

```bash
npm install express-rate-limit
```

```typescript
// Server/src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit'

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
})

// Apply to routes
app.use('/api/', apiLimiter)
```

**Effort:** 2-4 hours

---

### 3.3 Extract Business Logic from Controllers

**Issue:** Fat controllers with business logic mixed in

**Example refactor:**

```typescript
// Before: Server/src/routes/search.ts
router.post('/search', async (req, res) => {
  const results = await db.query(/* complex logic */)
  const filtered = results.filter(/* more logic */)
  const sorted = filtered.sort(/* even more logic */)
  res.json(sorted)
})

// After: Separate service layer
// Server/src/services/SearchService.ts
export class SearchService {
  async search(query: string, options: SearchOptions): Promise<SearchResult[]> {
    const results = await this.fetchResults(query)
    return this.processResults(results, options)
  }

  private async fetchResults(query: string) { /* ... */ }
  private processResults(results: any[], options: SearchOptions) { /* ... */ }
}

// Server/src/routes/search.ts
const searchService = new SearchService()

router.post('/search', async (req, res) => {
  const validated = searchSchema.parse(req.body)
  const results = await searchService.search(validated.query, validated.options)
  res.json(results)
})
```

**Effort:** 20-30 hours (refactor gradually)

---

### 3.4 Improve Documentation

**Missing:**
- API documentation
- Architecture decision records (ADRs)
- Contributing guidelines
- Development setup guide
- Deployment documentation

**Add:**

```markdown
# docs/ARCHITECTURE.md
# docs/API.md
# docs/CONTRIBUTING.md
# docs/DEVELOPMENT.md
# docs/DEPLOYMENT.md
```

**Effort:** 12-20 hours

---

### 3.5 Add Pre-commit Hooks

**Setup:**

```bash
npm install --save-dev husky lint-staged

# Add to package.json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}

npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

**Effort:** 2-3 hours

---

## 4. Long-term Enhancements

### 4.1 Migrate to Monorepo with Turborepo/Nx
**Benefit:** Better code sharing, unified builds
**Effort:** 40-60 hours

### 4.2 Add E2E Testing with Detox
**Benefit:** Catch integration bugs
**Effort:** 40-80 hours

### 4.3 Implement GraphQL Federation
**Benefit:** Better API composition (if GraphQL is kept)
**Effort:** 60-80 hours

### 4.4 Add Observability (OpenTelemetry)
**Benefit:** Better production debugging
**Effort:** 20-30 hours

### 4.5 Implement Feature Flags
**Benefit:** Safe rollouts, A/B testing
**Effort:** 16-24 hours

---

## Implementation Roadmap

### Sprint 1 (1-2 weeks) - Critical Fixes
- [ ] Fix subscription feature
- [ ] Add input validation
- [ ] Add safe JSON parsing
- [ ] Setup error logging
- [ ] Validate environment variables

### Sprint 2 (2-3 weeks) - Quality Improvements
- [ ] Replace moment.js with date-fns
- [ ] Remove console.log statements
- [ ] Add pre-commit hooks
- [ ] Configure React Query defaults
- [ ] Add API rate limiting

### Sprint 3 (3-4 weeks) - Testing & Type Safety
- [ ] Setup test infrastructure
- [ ] Add unit tests for critical paths
- [ ] Fix `any` types
- [ ] Add integration tests

### Sprint 4+ (Ongoing) - Long-term
- [ ] Extract service layer
- [ ] Improve documentation
- [ ] Add E2E tests
- [ ] Consider monorepo migration

---

## Metrics to Track

- **Test Coverage:** Target 80%+ for critical paths
- **Type Safety:** Remove all `any` types
- **Performance:** Bundle size reduction (target: remove 290KB from moment.js)
- **Errors:** Track error rates in production
- **Code Quality:** ESLint warnings/errors should be 0

---

## Questions for Maintainer

1. **Is Apollo Server still needed?** The codebase has tRPC and express-zod-api. Can we remove Apollo/GraphQL?

2. **What's the subscription revenue model?** Need to understand before fixing the IAP implementation.

3. **What's the target test coverage?** Should we prioritize certain areas first?

4. **Are there production error logs?** Need to understand current failure modes.

5. **What's the deployment process?** Need to know before adding CI/CD improvements.

---

## Resources

- [React Native Testing Guide](https://reactnative.dev/docs/testing-overview)
- [tRPC Best Practices](https://trpc.io/docs/best-practices)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)

---

*Generated: 2025-10-31*
*Codebase Version: commit adabc83*
