import express from 'express';
import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({path: path.resolve(__dirname, '../../.env')});

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
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:;"
  );
  
  if (isDev) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  next();
});

// API: Fetch markdown content
app.get('/api/content/:page', async (req, res) => {
  const { page } = req.params;
  const allowedPages = [
    'contact',
    'newsletter',
    'issues',
    'ludvig',
    'terms',
    'privacy',
    'changelog',
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
  if (isDev) {
    console.log(`Visit http://localhost:5173 to access the development server.`);
  }
  console.log(`Environment: ${isDev ? 'development' : 'production'}`);
});
