# Security Audit & Recommendations

## Overview

This document outlines security concerns found in the LiveOL codebase and provides actionable remediation steps.

**Severity Levels:**
- 🔴 Critical: Immediate security risk
- 🟡 High: Should be fixed soon
- 🟢 Medium: Good practice, fix when possible
- 🔵 Low: Minor improvements

---

## 🔴 Critical Security Issues

### 1. Missing Input Validation on Search Endpoints
**Risk:** SQL Injection, DoS attacks, Server crashes

**Affected Files:**
- `Server/src/routes/search.ts`
- `Server/src/routes/eventor.ts`

**Issue:**
User inputs are not validated for length, type, or content. Attackers could:
- Send extremely long queries to cause DoS
- Inject malicious payloads
- Crash the server with unexpected input types

**Fix:**
```typescript
import { z } from 'zod'

const searchSchema = z.object({
  query: z.string()
    .min(1, 'Query too short')
    .max(100, 'Query too long')
    .trim()
    .regex(/^[\w\s\-åäöÅÄÖ]+$/, 'Invalid characters'),
  limit: z.number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .default(20)
})

router.post('/search', async (req, res) => {
  try {
    const validated = searchSchema.parse(req.body)
    // Use validated data
  } catch (error) {
    return res.status(400).json({ error: 'Invalid input' })
  }
})
```

---

### 2. Unvalidated JSON Parsing
**Risk:** Server crashes, Denial of Service

**Issue:**
Multiple instances of `JSON.parse()` without try-catch blocks.

**Locations:**
```bash
# Find all instances
grep -r "JSON.parse" Server/src/
```

**Fix:**
```typescript
// Create utility: Server/src/lib/safeJson.ts
export function safeJsonParse<T>(
  json: string,
  fallback: T,
  logger?: Logger
): T {
  try {
    return JSON.parse(json)
  } catch (error) {
    logger?.error('JSON parse failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      jsonPreview: json.substring(0, 100)
    })
    return fallback
  }
}

// Usage:
const data = safeJsonParse(response, [], logger)
```

---

### 3. No Rate Limiting
**Risk:** DoS attacks, API abuse, Resource exhaustion

**Issue:**
No rate limiting on any endpoints. Attackers can make unlimited requests.

**Fix:**
```bash
npm install express-rate-limit
```

```typescript
// Server/src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit'

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
})

export const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute for sensitive endpoints
})

// Apply globally
app.use('/api/', apiLimiter)

// Apply to specific routes
app.post('/api/search', strictLimiter, searchHandler)
```

---

## 🟡 High Severity Issues

### 4. Broad Error Catching
**Risk:** Information leakage, Poor error handling

**Issue:**
Many `catch (e: any)` blocks that swallow errors or expose internals.

**Example Problem:**
```typescript
try {
  // operation
} catch (e: any) {
  console.log(e)
  res.json({ error: e.message }) // ❌ Leaks internal errors
}
```

**Fix:**
```typescript
try {
  // operation
} catch (error) {
  logger.error('Operation failed', {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined
  })

  // Send safe error to client
  res.status(500).json({
    error: 'Internal server error',
    requestId: req.id // For support/debugging
  })
}
```

---

### 5. Missing Environment Variable Validation
**Risk:** Runtime failures, Security misconfigurations

**Issue:**
No validation that required environment variables are set correctly.

**Fix:**
```typescript
// Server/src/config/env.ts
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number).pipe(z.number().int().positive()),

  // Database
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_URL: z.string().url(),

  // Secrets (ensure they're strong in production)
  JWT_SECRET: z.string().min(32),

  // Optional
  SLACK_WEBHOOK_URL: z.string().url().optional(),
  BUGSNAG_API_KEY: z.string().optional(),
})

export const env = envSchema.parse(process.env)

// Import this at app startup to fail fast
```

---

### 6. Deprecated Dependencies
**Risk:** Known vulnerabilities, Security patches not received

**Outdated Packages:**
- `apollo-server@2.14.2` (released 2020, 4+ years old)
- `graphql@14.6.0` (released 2019)
- `axios@0.21.2` (has known vulnerabilities - update to 1.x)

**Fix:**
```bash
# Check for vulnerabilities
npm audit

# Update packages
npm update axios
npm install axios@latest

# For apollo-server, either upgrade or remove if unused
npm install @apollo/server@latest
# OR
npm uninstall apollo-server graphql
```

---

### 7. No HTTPS Enforcement
**Risk:** Man-in-the-middle attacks, Data interception

**Fix:**
```typescript
// Server/src/middleware/security.ts
import helmet from 'helmet'

app.use(helmet()) // Adds various security headers

// Redirect HTTP to HTTPS in production
if (env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`)
    } else {
      next()
    }
  })
}
```

---

## 🟢 Medium Severity Issues

### 8. No Request ID Tracking
**Risk:** Difficult to trace security incidents

**Fix:**
```typescript
import { randomUUID } from 'crypto'

app.use((req, res, next) => {
  req.id = randomUUID()
  res.setHeader('X-Request-ID', req.id)
  next()
})
```

---

### 9. Missing CORS Configuration
**Risk:** Unauthorized cross-origin requests

**Check:**
```bash
grep -r "cors" Server/src/
```

**Fix (if not configured):**
```bash
npm install cors
```

```typescript
import cors from 'cors'

const allowedOrigins = [
  'https://liveol.larsendahl.se',
  'capacitor://localhost', // Mobile app
  'ionic://localhost'
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))
```

---

### 10. No Content Security Policy
**Risk:** XSS attacks

**Fix:**
```typescript
import helmet from 'helmet'

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'", 'https://liveresultat.orientering.se'],
  }
}))
```

---

## 🔵 Low Severity Issues

### 11. Hardcoded Secrets Risk
**Check for secrets:**
```bash
# Check for potential secrets
grep -ri "password\|secret\|key\|token" --include="*.ts" --include="*.js" Server/src/ App/src/

# Check for actual values (not variable names)
grep -ri "password.*=.*['\"]" --include="*.ts" Server/src/
```

**Prevention:**
```bash
# Add to .gitignore
.env
.env.local
.env.*.local
*.key
*.pem

# Install git-secrets
# https://github.com/awslabs/git-secrets
```

---

### 12. Add Security Headers
**Install:**
```bash
npm install helmet
```

**Usage:**
```typescript
import helmet from 'helmet'

app.use(helmet({
  contentSecurityPolicy: true,
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: 'same-origin' },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}))
```

---

## Implementation Checklist

### Week 1 - Critical Fixes
- [ ] Add input validation (Zod schemas)
- [ ] Wrap all JSON.parse in try-catch
- [ ] Add rate limiting
- [ ] Update axios to latest

### Week 2 - High Priority
- [ ] Add environment validation
- [ ] Improve error handling
- [ ] Add helmet security headers
- [ ] Configure CORS properly

### Week 3 - Medium Priority
- [ ] Add request ID tracking
- [ ] Add CSP headers
- [ ] Review and upgrade dependencies
- [ ] Add git-secrets pre-commit hook

---

## Security Testing Checklist

After implementing fixes, test:

### Input Validation
```bash
# Test with long input
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"'$(python -c 'print("A"*1000)')'"}'

# Test with special characters
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"<script>alert(1)</script>"}'

# Test with SQL-like input
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"test\"; DROP TABLE users--"}'
```

### Rate Limiting
```bash
# Send 100 requests quickly
for i in {1..100}; do
  curl http://localhost:3000/api/search &
done
```

### HTTPS Enforcement
```bash
# Should redirect to HTTPS
curl -I http://yourdomain.com/api/search
```

---

## Monitoring & Alerting

Set up alerts for:
- High error rates
- Rate limit violations
- Authentication failures
- Unusual traffic patterns

**Tools:**
- Sentry for error tracking
- Datadog/New Relic for APM
- CloudWatch/Grafana for metrics

---

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

## Emergency Response

If a security issue is discovered:

1. **Assess impact:** What data/systems are affected?
2. **Contain:** Take affected systems offline if needed
3. **Investigate:** Check logs for exploitation
4. **Fix:** Deploy patch immediately
5. **Notify:** Inform affected users if needed
6. **Review:** Update security practices

---

*Generated: 2025-10-31*
*Review annually or after major changes*
