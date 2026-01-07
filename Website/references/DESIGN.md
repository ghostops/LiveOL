# Website Architecture & Design Document

**Project**: OrienteeringLiveResults.com Static Website
**Date**: 2025-11-16
**Version**: 1.0
**Status**: Design Phase

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Requirements](#requirements)
3. [Technology Stack](#technology-stack)
4. [Architecture Overview](#architecture-overview)
5. [Project Structure](#project-structure)
6. [Frontend Implementation](#frontend-implementation)
7. [Backend Implementation](#backend-implementation)
8. [Content Management](#content-management)
9. [Deployment Strategy](#deployment-strategy)
10. [VPS Configuration](#vps-configuration)
11. [Maintenance & Operations](#maintenance--operations)
12. [Implementation Timeline](#implementation-timeline)
13. [Code Examples](#code-examples)

---

## Executive Summary

This document outlines the architecture for a simple, maintainable static website to host 7 pages for OrienteeringLiveResults.com. The solution prioritizes:

- **Simplicity**: Minimal dependencies, straightforward architecture
- **Maintainability**: Easy to update, deploy, and manage
- **No Platform Lock-in**: Avoid Next.js and proprietary platforms
- **Git-based Content**: Version-controlled, easy to backup and migrate

### Key Decisions

- **CMS**: Decap CMS (Git-based, no database required)
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Express.js (serves static build + markdown API)
- **Deployment**: VPS with nginx + PM2
- **Content Storage**: Markdown files in Git repository

---

## Requirements

### Pages to Implement

The website must host the following pages (currently referenced in the LiveOL mobile app):

1. `/contact` - Contact information
2. `/newsletter` - Newsletter signup information
3. `/issues` - Bug reporting/GitHub issues
4. `/ludvig` - About Ludvig Larsendahl
5. `/terms` - Terms of Service
6. `/privacy` - Privacy Policy
7. `/licenses` - Open Source Licenses

### Technical Requirements

- **No Next.js**: Avoid platform lock-in
- **Express.js Backend**: Must use Express as the server framework
- **React Frontend**: Modern React with hooks
- **Tailwind CSS**: Utility-first styling
- **NodeJS CMS**: Content management system for non-technical editors
- **Simple Maintenance**: Easy to update without requiring development skills

### Non-Functional Requirements

- Fast page loads (< 2s)
- Mobile responsive
- SEO-friendly (meta tags, semantic HTML)
- Secure (HTTPS, security headers)
- Version-controlled content

---

## Technology Stack

### Frontend Stack

```
React 18.3+          - UI framework
React Router v6      - Client-side routing
Vite 5.0+           - Build tool & dev server
Tailwind CSS 3.3+   - Utility-first CSS framework
TypeScript 5.3+     - Type safety
React Markdown      - Markdown rendering
```

### Backend Stack

```
Node.js 20+         - Runtime environment
Express.js 4.18+    - Web server framework
TypeScript 5.3+     - Type safety
gray-matter         - Markdown frontmatter parser
```

### Content Management

```
Decap CMS 3.0+      - Git-based CMS (no database)
Git                 - Version control for content
GitHub/GitLab       - Git hosting & OAuth
```

### Development Tools

```
tsx                 - TypeScript execution
concurrently        - Run multiple commands
ESLint              - Code linting
Prettier            - Code formatting
```

### Production Environment

```
VPS (Ubuntu 22.04)  - Server hosting
nginx 1.24+         - Reverse proxy & SSL termination
PM2                 - Node.js process manager
Let's Encrypt       - SSL certificates
GitHub Actions      - CI/CD (optional)
```

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  React SPA (Vite Build)                         │  │
│  │  ├── React Router (client-side routing)         │  │
│  │  ├── Tailwind CSS (styling)                     │  │
│  │  └── React Markdown (content rendering)         │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  Decap CMS Admin UI                             │  │
│  │  └── /admin (content editing interface)         │  │
│  └─────────────────────────────────────────────────┘  │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP/HTTPS
                   ↓
┌─────────────────────────────────────────────────────────┐
│                    nginx (Port 80/443)                  │
│  ├── SSL/TLS Termination (Let's Encrypt)               │
│  ├── Static File Caching                               │
│  ├── Gzip Compression                                   │
│  └── Reverse Proxy → localhost:3000                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────┐
│              Express Server (Port 3000)                 │
│  ├── Serve static files from /dist                     │
│  ├── API: GET /api/content/:page (fetch markdown)      │
│  └── Fallback: /* → index.html (SPA routing)           │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────┐
│                Content Storage (Git)                    │
│  └── /content/*.md files                                │
│      ├── contact.md                                     │
│      ├── newsletter.md                                  │
│      ├── issues.md                                      │
│      ├── ludvig.md                                      │
│      ├── terms.md                                       │
│      ├── privacy.md                                     │
│      └── licenses.md                                    │
└─────────────────────────────────────────────────────────┘
```

### Request Flow

#### Static Asset Request (e.g., `/assets/main.js`)

```
Browser → nginx → Express → /dist/assets/main.js
         (cached)        (serve static)
```

#### Page Navigation (e.g., `/contact`)

```
Browser → nginx → Express → /dist/index.html
                           (SPA handles routing)
```

#### Content Fetch (e.g., API request for markdown)

```
Browser → nginx → Express → /api/content/contact
                           → Read /content/contact.md
                           → Return JSON
```

#### Admin UI (e.g., `/admin`)

```
Browser → nginx → Express → /dist/admin/index.html
                           (Decap CMS loads)
```

### Data Flow

1. **Content Creation/Update**:
   - Editor opens `/admin`
   - Decap CMS authenticates via GitHub OAuth
   - Editor updates content in UI
   - Decap CMS commits changes to Git
   - Git webhook triggers deployment (optional)

2. **Page Rendering**:
   - User navigates to `/contact`
   - React Router loads Contact component
   - Component fetches `/api/content/contact`
   - Express reads `contact.md` from filesystem
   - React Markdown renders content
   - Tailwind CSS applies styling

---

## Project Structure

### Directory Layout

```
website/
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD workflow (optional)
│
├── client/                         # React frontend
│   ├── public/
│   │   ├── admin/
│   │   │   ├── index.html          # Decap CMS admin UI
│   │   │   └── config.yml          # Decap CMS configuration
│   │   ├── images/                 # Static images
│   │   └── favicon.ico
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.tsx          # Main layout wrapper
│   │   │   ├── Navigation.tsx      # Header navigation
│   │   │   ├── Footer.tsx          # Footer component
│   │   │   └── MarkdownContent.tsx # Markdown renderer
│   │   │
│   │   ├── pages/
│   │   │   ├── Contact.tsx
│   │   │   ├── Newsletter.tsx
│   │   │   ├── Issues.tsx
│   │   │   ├── Ludvig.tsx
│   │   │   ├── Terms.tsx
│   │   │   ├── Privacy.tsx
│   │   │   └── Licenses.tsx
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts              # API client for content
│   │   │   └── constants.ts        # App constants
│   │   │
│   │   ├── App.tsx                 # React Router setup
│   │   ├── main.tsx                # React entry point
│   │   └── index.css               # Tailwind imports
│   │
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── server/                         # Express backend
│   ├── src/
│   │   ├── index.ts                # Server entry point
│   │   ├── routes/
│   │   │   └── content.ts          # Content API routes
│   │   └── middleware/
│   │       └── security.ts         # Security headers
│   │
│   ├── tsconfig.json
│   └── package.json
│
├── content/                        # Markdown content (Git-stored)
│   ├── contact.md
│   ├── newsletter.md
│   ├── issues.md
│   ├── ludvig.md
│   ├── terms.md
│   ├── privacy.md
│   └── licenses.md
│
├── scripts/
│   ├── deploy.sh                   # Deployment script
│   └── build.sh                    # Build script
│
├── .env.example                    # Environment variables template
├── .gitignore
├── package.json                    # Root monorepo config
├── README.md
└── DESIGN.md                       # This document
```

### File Size Estimates

```
client/dist/        ~500 KB (minified + gzipped)
server/dist/        ~50 KB
content/            ~20 KB (7 markdown files)
node_modules/       ~200 MB (dev), ~50 MB (prod)
```

---

## Frontend Implementation

### 1. Entry Point (`client/src/main.tsx`)

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 2. Router Configuration (`client/src/App.tsx`)

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Contact from './pages/Contact';
import Newsletter from './pages/Newsletter';
import Issues from './pages/Issues';
import Ludvig from './pages/Ludvig';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Licenses from './pages/Licenses';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Contact />} />
          <Route path="contact" element={<Contact />} />
          <Route path="newsletter" element={<Newsletter />} />
          <Route path="issues" element={<Issues />} />
          <Route path="ludvig" element={<Ludvig />} />
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="licenses" element={<Licenses />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### 3. Layout Component (`client/src/components/Layout.tsx`)

```typescript
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
```

### 4. Navigation Component (`client/src/components/Navigation.tsx`)

```typescript
import { Link } from 'react-router-dom';

export default function Navigation() {
  const links = [
    { path: '/contact', label: 'Contact' },
    { path: '/newsletter', label: 'Newsletter' },
    { path: '/issues', label: 'Report Bug' },
    { path: '/ludvig', label: 'About' },
    { path: '/terms', label: 'Terms' },
    { path: '/privacy', label: 'Privacy' },
    { path: '/licenses', label: 'Licenses' },
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-blue-600">
            LiveOL
          </Link>
          <div className="hidden md:flex space-x-6">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
```

### 5. Page Template (`client/src/pages/Contact.tsx`)

```typescript
import { useEffect, useState } from 'react';
import MarkdownContent from '../components/MarkdownContent';
import { fetchContent } from '../lib/api';

export default function Contact() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent('contact')
      .then((data) => {
        setContent(data.content);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load content:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return <MarkdownContent content={content} />;
}
```

### 6. Markdown Renderer (`client/src/components/MarkdownContent.tsx`)

```typescript
import ReactMarkdown from 'react-markdown';

interface Props {
  content: string;
}

export default function MarkdownContent({ content }: Props) {
  return (
    <article className="prose prose-lg max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </article>
  );
}
```

### 7. API Client (`client/src/lib/api.ts`)

```typescript
const API_BASE = import.meta.env.DEV
  ? 'http://localhost:3000/api'
  : '/api';

export async function fetchContent(page: string) {
  const response = await fetch(`${API_BASE}/content/${page}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${page}`);
  }
  return response.json();
}
```

### 8. Vite Configuration (`client/vite.config.ts`)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

### 9. Tailwind Configuration (`client/tailwind.config.js`)

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#334155',
            a: {
              color: '#2563eb',
              '&:hover': {
                color: '#1d4ed8',
              },
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

### 10. Tailwind CSS Entry (`client/src/index.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom global styles */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
```

### 11. Style guide

We use the style guide specified in STYLE_GUIDE.md!

---

## Backend Implementation

### 1. Server Entry Point (`server/src/index.ts`)

```typescript
import express from 'express';
import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';

const app = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== 'production';

// Security middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
  );
  next();
});

// API: Fetch markdown content
app.get('/api/content/:page', (req, res) => {
  const { page } = req.params;
  const allowedPages = [
    'contact',
    'newsletter',
    'issues',
    'ludvig',
    'terms',
    'privacy',
    'licenses',
  ];

  if (!allowedPages.includes(page)) {
    return res.status(404).json({ error: 'Page not found' });
  }

  const filePath = path.join(__dirname, `../../content/${page}.md`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Content not found' });
  }

  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    res.json({
      content,
      metadata: data,
      lastModified: fs.statSync(filePath).mtime
    });
  } catch (error) {
    console.error(`Error reading ${page}:`, error);
    res.status(500).json({ error: 'Failed to load content' });
  }
});

// Serve static files from Vite build
const staticPath = path.join(__dirname, '../../client/dist');
app.use(express.static(staticPath));

// SPA fallback - serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${isDev ? 'development' : 'production'}`);
});
```

### 2. TypeScript Configuration (`server/tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Content Management

### 1. Decap CMS Configuration (`client/public/admin/config.yml`)

```yaml
backend:
  name: git-gateway
  branch: main

media_folder: "client/public/images"
public_folder: "/images"

collections:
  - name: "pages"
    label: "Pages"
    files:
      - label: "Contact"
        name: "contact"
        file: "content/contact.md"
        fields:
          - { label: "Title", name: "title", widget: "string" }
          - { label: "Description", name: "description", widget: "string" }
          - { label: "Body", name: "body", widget: "markdown" }
          - { label: "Updated", name: "date", widget: "datetime" }

      - label: "Newsletter"
        name: "newsletter"
        file: "content/newsletter.md"
        fields:
          - { label: "Title", name: "title", widget: "string" }
          - { label: "Description", name: "description", widget: "string" }
          - { label: "Body", name: "body", widget: "markdown" }
          - { label: "Updated", name: "date", widget: "datetime" }

      - label: "Issues"
        name: "issues"
        file: "content/issues.md"
        fields:
          - { label: "Title", name: "title", widget: "string" }
          - { label: "Description", name: "description", widget: "string" }
          - { label: "Body", name: "body", widget: "markdown" }
          - { label: "Updated", name: "date", widget: "datetime" }

      - label: "About Ludvig"
        name: "ludvig"
        file: "content/ludvig.md"
        fields:
          - { label: "Title", name: "title", widget: "string" }
          - { label: "Description", name: "description", widget: "string" }
          - { label: "Body", name: "body", widget: "markdown" }
          - { label: "Updated", name: "date", widget: "datetime" }

      - label: "Terms of Service"
        name: "terms"
        file: "content/terms.md"
        fields:
          - { label: "Title", name: "title", widget: "string" }
          - { label: "Description", name: "description", widget: "string" }
          - { label: "Body", name: "body", widget: "markdown" }
          - { label: "Updated", name: "date", widget: "datetime" }

      - label: "Privacy Policy"
        name: "privacy"
        file: "content/privacy.md"
        fields:
          - { label: "Title", name: "title", widget: "string" }
          - { label: "Description", name: "description", widget: "string" }
          - { label: "Body", name: "body", widget: "markdown" }
          - { label: "Updated", name: "date", widget: "datetime" }

      - label: "Open Source Licenses"
        name: "licenses"
        file: "content/licenses.md"
        fields:
          - { label: "Title", name: "title", widget: "string" }
          - { label: "Description", name: "description", widget: "string" }
          - { label: "Body", name: "body", widget: "markdown" }
          - { label: "Updated", name: "date", widget: "datetime" }
```

### 2. Decap CMS Admin UI (`client/public/admin/index.html`)

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex" />
  <title>Content Manager</title>
</head>
<body>
  <!-- Include the Decap CMS script -->
  <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
</body>
</html>
```

### 3. Example Content File (`content/contact.md`)

```markdown
---
title: Contact Us
description: Get in touch with the LiveOL team
date: 2025-11-16T10:00:00.000Z
---

# Contact Us

Have questions, feedback, or suggestions? We'd love to hear from you!

## Email

Reach out to us at: **contact@orienteeringliveresults.com**

## Social Media

- Twitter: [@LiveOL](https://twitter.com/liveol)
- GitHub: [github.com/ludviglarsendahl/liveol](https://github.com/ludviglarsendahl/liveol)

## Response Time

We typically respond within 24-48 hours. For urgent matters, please mention "URGENT" in your subject line.
```

---

## Deployment Strategy

### Build Process

#### Development

```bash
# Install dependencies
npm install

# Start development servers
npm run dev
# This runs both:
# - client dev server (Vite) on localhost:5173
# - server dev server (Express) on localhost:3000
```

#### Production Build

```bash
# Build frontend
cd client
npm run build
# Outputs to client/dist/

# Build backend
cd server
npm run build
# Compiles TypeScript to server/dist/

# Or build all at once from root
npm run build
```

### Package.json Scripts

#### Root (`package.json`)

```json
{
  "name": "orienteering-live-results-website",
  "version": "1.0.0",
  "private": true,
  "workspaces": ["client", "server"],
  "scripts": {
    "dev": "concurrently \"npm run dev -w client\" \"npm run dev -w server\"",
    "build": "npm run build -w client && npm run build -w server",
    "start": "npm run start -w server",
    "deploy": "./scripts/deploy.sh"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

#### Client (`client/package.json`)

```json
{
  "name": "client",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.20.1",
    "react-markdown": "^9.0.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "@tailwindcss/typography": "^0.5.10",
    "typescript": "^5.3.3",
    "vite": "^5.0.8"
  }
}
```

#### Server (`server/package.json`)

```json
{
  "name": "server",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "gray-matter": "^4.0.3"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.6",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  }
}
```

---

## VPS Configuration

### Server Setup (Ubuntu 22.04)

#### 1. Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install nginx
sudo apt install -y nginx

# Install certbot for SSL
sudo apt install -y certbot python3-certbot-nginx

# Install PM2 globally
sudo npm install -g pm2

# Create app user
sudo useradd -m -s /bin/bash appuser
sudo usermod -aG sudo appuser
```

#### 2. Application Deployment

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/yourusername/website.git
sudo chown -R appuser:appuser website
cd website

# Install dependencies
npm install

# Build application
npm run build

# Setup PM2
pm2 start server/dist/index.js --name website
pm2 save
pm2 startup
```

#### 3. nginx Configuration

Create `/etc/nginx/sites-available/orienteeringliveresults.com`:

```nginx
# HTTP -> HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name orienteeringliveresults.com www.orienteeringliveresults.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name orienteeringliveresults.com www.orienteeringliveresults.com;

    # SSL configuration (certbot will add these)
    ssl_certificate /etc/letsencrypt/live/orienteeringliveresults.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/orienteeringliveresults.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    # Static files with long cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API requests
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Admin UI
    location /admin/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }

    # All other requests
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/orienteeringliveresults.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. SSL Certificate Setup

```bash
sudo certbot --nginx -d orienteeringliveresults.com -d www.orienteeringliveresults.com
```

#### 5. PM2 Configuration

Create `ecosystem.config.js` in project root:

```javascript
module.exports = {
  apps: [{
    name: 'website',
    script: './server/dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '500M',
    autorestart: true,
    watch: false
  }]
};
```

Start with PM2:

```bash
pm2 start ecosystem.config.js
pm2 save
```

---

## Maintenance & Operations

### Monitoring

#### PM2 Monitoring

```bash
# View logs
pm2 logs website

# Monitor processes
pm2 monit

# View process info
pm2 info website

# Restart application
pm2 restart website

# Reload (zero downtime)
pm2 reload website
```

#### Server Monitoring

```bash
# Check nginx status
sudo systemctl status nginx

# Check nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check disk space
df -h

# Check memory
free -h
```

### Deployment Workflow

#### Manual Deployment

Create `scripts/deploy.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Pull latest code
echo "📥 Pulling latest changes..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build application
echo "🔨 Building application..."
npm run build

# Restart PM2
echo "♻️  Restarting application..."
pm2 reload website

echo "✅ Deployment complete!"
```

Make executable:

```bash
chmod +x scripts/deploy.sh
```

Deploy:

```bash
./scripts/deploy.sh
```

#### Automated Deployment with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Deploy to VPS
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.VPS_HOST }}
        username: ${{ secrets.VPS_USER }}
        key: ${{ secrets.VPS_SSH_KEY }}
        script: |
          cd /var/www/website
          ./scripts/deploy.sh
```

### Backup Strategy

#### Content Backup

Content is automatically backed up in Git. Additional backup script:

```bash
#!/bin/bash
# scripts/backup.sh

BACKUP_DIR="/var/backups/website"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup content directory
tar -czf $BACKUP_DIR/content_$DATE.tar.gz content/

# Backup logs
tar -czf $BACKUP_DIR/logs_$DATE.tar.gz logs/

# Keep only last 30 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

Add to crontab:

```bash
# Daily backup at 2 AM
0 2 * * * /var/www/website/scripts/backup.sh
```

#### Server Snapshot

Create weekly DigitalOcean/Hetzner snapshots (automated via control panel).

### Updates

#### Dependency Updates

```bash
# Check for updates
npm outdated

# Update packages
npm update

# Test
npm run build
npm run dev

# Deploy if successful
./scripts/deploy.sh
```

#### Security Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Renew SSL certificates (auto-renewed by certbot)
sudo certbot renew --dry-run

# Check for npm vulnerabilities
npm audit
npm audit fix
```

---

## Implementation Timeline

### Week 1: Development Setup & Frontend

**Day 1-2: Project Setup**
- [ ] Create repository
- [ ] Setup monorepo structure
- [ ] Install dependencies
- [ ] Configure TypeScript, ESLint, Prettier
- [ ] Setup Git hooks (husky, lint-staged)

**Day 3-4: Frontend Development**
- [ ] Create React components (Layout, Navigation, Footer)
- [ ] Implement 7 page components
- [ ] Setup React Router
- [ ] Configure Tailwind CSS
- [ ] Create markdown renderer
- [ ] Add responsive design
- [ ] Test on mobile/desktop

**Day 5: Backend Development**
- [ ] Create Express server
- [ ] Implement content API
- [ ] Add security middleware
- [ ] Configure static file serving
- [ ] Setup SPA fallback routing
- [ ] Test API endpoints

### Week 2: CMS Integration & Content

**Day 6-7: Decap CMS Setup**
- [ ] Configure Decap CMS
- [ ] Setup Git Gateway (GitHub OAuth)
- [ ] Create admin UI
- [ ] Write initial content for all 7 pages
- [ ] Test content editing workflow
- [ ] Verify commit workflow

**Day 8: Testing & Optimization**
- [ ] Cross-browser testing
- [ ] Mobile responsiveness
- [ ] Performance optimization (lighthouse)
- [ ] Accessibility audit
- [ ] SEO optimization (meta tags)

### Week 3: Deployment & Production

**Day 9-10: VPS Setup**
- [ ] Provision VPS server
- [ ] Install Node.js, nginx, PM2
- [ ] Configure firewall (ufw)
- [ ] Setup user accounts
- [ ] Clone repository
- [ ] Configure environment variables

**Day 11: Production Configuration**
- [ ] Configure nginx
- [ ] Setup SSL certificates
- [ ] Configure PM2
- [ ] Setup logging
- [ ] Configure backups
- [ ] Test deployment script

**Day 12: Launch**
- [ ] Deploy application
- [ ] DNS configuration
- [ ] Test all pages in production
- [ ] Test admin UI
- [ ] Monitor logs
- [ ] Performance testing

**Day 13-14: Documentation & Handoff**
- [ ] Write operations documentation
- [ ] Create runbook for common tasks
- [ ] Setup monitoring/alerts
- [ ] Train content editors
- [ ] Final review

### Total Timeline: ~2-3 weeks

---

## Code Examples

### Environment Variables

#### `.env.example`

```bash
# Server
NODE_ENV=production
PORT=3000

# Decap CMS
# Setup Git Gateway: https://github.com/settings/apps
GITHUB_CLIENT_ID=your_github_oauth_app_id
GITHUB_CLIENT_SECRET=your_github_oauth_app_secret

# Domain
DOMAIN=orienteeringliveresults.com
```

### Git Configuration

#### `.gitignore`

```
# Dependencies
node_modules/
npm-debug.log*

# Build outputs
client/dist/
server/dist/
*.tsbuildinfo

# Environment variables
.env
.env.local

# Logs
logs/
*.log

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# PM2
.pm2/
```

### Health Check Endpoint

Add to `server/src/index.ts`:

```typescript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});
```

### Rate Limiting

Install:

```bash
npm install express-rate-limit
```

Add to server:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## Security Considerations

### Application Security

1. **Content Security Policy**: Prevent XSS attacks
2. **HTTPS Only**: Force SSL/TLS
3. **Security Headers**: X-Frame-Options, X-Content-Type-Options
4. **Rate Limiting**: Prevent abuse
5. **Input Validation**: Sanitize user inputs
6. **Dependency Scanning**: Regular npm audit

### Server Security

1. **Firewall**: ufw allow 22,80,443
2. **SSH Key Only**: Disable password authentication
3. **Automatic Updates**: unattended-upgrades
4. **Fail2ban**: Block brute force attacks
5. **Regular Backups**: Daily content + weekly snapshots

### CMS Security

1. **OAuth Authentication**: GitHub/GitLab login
2. **Branch Protection**: Require PR reviews
3. **Audit Trail**: Git history of all changes

---

## Performance Optimization

### Frontend Optimization

- **Code Splitting**: Separate vendor bundle
- **Lazy Loading**: Load images on demand
- **Minification**: Vite automatically minifies
- **Tree Shaking**: Remove unused code
- **Gzip Compression**: nginx configuration

### Backend Optimization

- **Static Caching**: nginx caches static assets
- **PM2 Clustering**: Run multiple instances (if needed)
- **Keep-Alive**: Persistent connections
- **Response Compression**: gzip middleware

### Expected Performance

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Lighthouse Score**: > 90
- **Page Size**: < 500 KB (gzipped)

---

## Cost Estimates

### Development Costs

- Developer time: ~80-100 hours
- Total: $0 (internal development)

### Hosting Costs (Monthly)

**Option 1: Budget VPS (Recommended)**
- Hetzner Cloud CX11: €4.51/month (~$5 USD)
  - 2 vCPU, 2GB RAM, 20GB SSD
  - 20TB traffic
  - Perfect for this use case

**Option 2: Premium VPS**
- DigitalOcean Droplet: $12/month
  - 2 vCPU, 2GB RAM, 50GB SSD
  - Better support, snapshots included

**Additional Costs**
- Domain name: ~$12/year
- SSL certificate: $0 (Let's Encrypt)
- Monitoring: $0 (PM2 built-in)

**Total Monthly Cost: $5-12**

---

## Alternatives Considered

### Why NOT These Options:

#### Next.js
- ❌ Platform lock-in concerns
- ❌ Opinionated framework
- ❌ Overkill for static pages
- ✅ Would provide SSR (not needed)

#### Strapi CMS
- ❌ Requires database (PostgreSQL/MongoDB)
- ❌ More complex setup
- ❌ Higher resource requirements
- ❌ Overkill for 7 static pages

#### Netlify CMS (now Decap CMS)
- ✅ Exactly what we're using!

#### WordPress
- ❌ Not Node.js
- ❌ PHP-based
- ❌ Heavier stack
- ❌ More attack surface

#### Static Site Generators (Hugo, Jekyll)
- ❌ Not React
- ❌ Not Express
- ❌ Different templating language

---

## Success Metrics

### Technical Metrics

- [ ] 99.9% uptime
- [ ] < 2s page load time
- [ ] Lighthouse score > 90
- [ ] Zero security vulnerabilities
- [ ] < 5 minute deployment time

### Business Metrics

- [ ] Content updates without developer
- [ ] Zero downtime deployments
- [ ] < 1 hour time to fix bugs
- [ ] Hosting costs < $15/month

---

## Conclusion

This architecture provides a simple, maintainable solution for hosting 7 static pages with:

- ✅ **No Database**: Content in Git reduces complexity
- ✅ **Easy Updates**: Decap CMS provides friendly editing UI
- ✅ **Low Cost**: ~$5/month hosting
- ✅ **No Lock-in**: Standard tools, easy to migrate
- ✅ **Developer Friendly**: TypeScript, modern tooling
- ✅ **Production Ready**: SSL, security headers, monitoring

The solution avoids overengineering while maintaining professional standards for security, performance, and maintainability.

---

## Appendix

### Useful Commands

```bash
# Development
npm run dev                 # Start dev servers
npm run build              # Build for production
npm run start              # Start production server

# Deployment
./scripts/deploy.sh        # Deploy to VPS
pm2 restart website        # Restart app
sudo systemctl reload nginx # Reload nginx

# Monitoring
pm2 logs website           # View logs
pm2 monit                  # Monitor resources
sudo tail -f /var/log/nginx/access.log

# Maintenance
npm audit                  # Check vulnerabilities
npm update                 # Update dependencies
sudo certbot renew         # Renew SSL (auto)
```

### Resources

- [Decap CMS Documentation](https://decapcms.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [React Router Documentation](https://reactrouter.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Express.js Documentation](https://expressjs.com/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [nginx Documentation](https://nginx.org/en/docs/)

---

**Document Version**: 1.0
**Last Updated**: 2025-11-16
**Author**: Claude
**Status**: Ready for Implementation
