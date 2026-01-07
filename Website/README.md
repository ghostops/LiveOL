# LiveOL Website

## Development

### Setup

```bash
# Install dependencies
npm install

# Start development servers
npm run dev
```

This runs:
- Client dev server (Vite) on http://localhost:5173
- Server dev server (Express) on http://localhost:3000

## Building for Production

```bash
# Build both client and server
npm run build

# Start production server
npm run start
```

The production server serves the built client from `client/dist/` and provides the content API at `/api/content/:page`.

## Content Management

### Decap CMS Admin

Access the admin interface at: http://localhost:5173/admin (development) or https://yourdomain.com/admin (production)

### Manual Content Editing

Content files are in `content/*.md` with frontmatter:

```markdown
---
title: Page Title
description: Page description
date: 2026-01-07T10:00:00.000Z
---

# Content goes here
```
