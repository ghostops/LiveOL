// src/routes/sitemap[.]xml.ts
import { createFileRoute } from '@tanstack/react-router'
import { routeTree } from '@/routeTree.gen'

function extractRoutes(node: any, parentPath = ''): Array<string> {
  const routes: Array<string> = []

  if (node.path) {
    const fullPath = parentPath + node.path
    // Skip API routes and dynamic routes
    if (!fullPath.startsWith('/api') && !fullPath.includes('$')) {
      routes.push(fullPath === '' ? '/' : fullPath)
    }
  }

  if (node.children) {
    node.children.forEach((child: any) => {
      routes.push(...extractRoutes(child, node.path || parentPath))
    })
  }

  return routes
}

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: () => {
        const base = 'https://orienteeringliveresults.com'
        const pages = extractRoutes(routeTree).filter(
          (page) => page !== '/sitemap.xml' && page !== '//',
        )

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map(
      (page) => `
  <url>
    <loc>${base}${page}</loc>
  </url>`,
    )
    .join('')}
</urlset>`

        return new Response(sitemap, {
          headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600, s-maxage=86400',
          },
        })
      },
    },
  },
})
