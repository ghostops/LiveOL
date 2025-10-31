# Quick Fixes Checklist

This is a prioritized checklist of improvements you can implement immediately.

## 🔴 Critical (Do First - 1-2 days)

### 1. Fix Subscription Check
**File:** `App/src/hooks/useIap.ts:44`

Replace:
```typescript
const hasActiveSubscription = true // TODO: Implement
```

With:
```typescript
const hasActiveSubscription = useMemo(() => {
  if (!customerInfo) return false
  return Object.values(customerInfo.entitlements.active).length > 0
}, [customerInfo])
```

---

### 2. Add Input Validation
**Files:** `Server/src/routes/search.ts`, `Server/src/routes/eventor.ts`

```bash
# Already have zod, just need to use it
```

Add schemas:
```typescript
import { z } from 'zod'

const searchSchema = z.object({
  query: z.string().min(1).max(100).trim(),
  limit: z.number().int().min(1).max(50).default(20)
})

// In route handler:
const validated = searchSchema.parse(req.body)
```

---

### 3. Add Environment Validation
**Create:** `Server/src/config/env.ts`

```typescript
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
})

export const env = envSchema.parse(process.env)
```

Then in `Server/src/index.ts`:
```typescript
import './config/env' // Validates on startup
```

---

## 🟡 High Priority (Next 1-2 weeks)

### 4. Replace console.log with Logger
**Install:**
```bash
cd Server
npm install winston
```

**Create:** `Server/src/lib/logger.ts`
```typescript
import winston from 'winston'

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' })
  ]
})
```

**Replace all console.log:**
```bash
# Search for console.log
grep -r "console\\.log" Server/src/

# Replace with logger.info/error/debug
```

---

### 5. Configure React Query Defaults
**Edit:** `App/src/lib/queryClient.ts` (or create it)

```typescript
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
})
```

---

### 6. Add Rate Limiting
**Install:**
```bash
cd Server
npm install express-rate-limit
```

**Usage:**
```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // requests per window
})

app.use('/api/', limiter)
```

---

### 7. Start Replacing moment.js
**Why:** Deprecated, adds 290KB to bundle

**Already have date-fns in App**, just need to:
```bash
cd Server
npm uninstall moment moment-timezone
npm install date-fns date-fns-tz
```

Then gradually replace usages:
```typescript
// Before:
import moment from 'moment'
moment().format('YYYY-MM-DD')

// After:
import { format } from 'date-fns'
format(new Date(), 'yyyy-MM-dd')
```

---

## 🟢 Medium Priority (Next month)

### 8. Add Pre-commit Hooks
```bash
npm install --save-dev husky lint-staged

# In root package.json:
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}

npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

---

### 9. Setup Basic Tests
**Server:**
```bash
cd Server
npm install --save-dev jest @types/jest ts-jest

# Create jest.config.js:
npx ts-jest config:init
```

**App:** (already has jest)
Just need to write tests:
```typescript
// App/src/hooks/__tests__/useIap.test.ts
describe('useIap', () => {
  it('should return correct subscription status', () => {
    // Test implementation
  })
})
```

---

### 10. Fix TypeScript `any` Types
**Find them:**
```bash
# In App
grep -r ": any" App/src/ | wc -l

# In Server
grep -r ": any" Server/src/ | wc -l
```

**Replace with proper types:**
```typescript
// Before:
function handleEvent(event: any) { }

// After:
interface Event {
  id: string
  name: string
  // ... proper shape
}
function handleEvent(event: Event) { }
```

---

## 📊 Progress Tracker

Track your progress:

```
Critical Fixes:
[ ] 1. Fix subscription check
[ ] 2. Add input validation
[ ] 3. Add env validation

High Priority:
[ ] 4. Replace console.log
[ ] 5. Configure React Query
[ ] 6. Add rate limiting
[ ] 7. Replace moment.js

Medium Priority:
[ ] 8. Add pre-commit hooks
[ ] 9. Setup tests
[ ] 10. Fix any types
```

---

## 💡 Pro Tips

1. **Test locally first:** Always test changes in development before deploying
2. **Make small commits:** Each fix should be its own commit
3. **Update tests:** If tests exist, update them when changing code
4. **Check CI/CD:** Make sure changes don't break builds
5. **Document decisions:** Update docs when making significant changes

---

## 📚 Need Help?

- **TypeScript errors?** Run `npm run tscheck` in App or Server
- **Lint errors?** Run `npm run lint` in App or Server
- **Format code?** Run `npm run format` in Server
- **Questions?** See IMPROVEMENTS.md for detailed explanations

---

*Last updated: 2025-10-31*
