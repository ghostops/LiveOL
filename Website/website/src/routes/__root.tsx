import {
  HeadContent,
  Scripts,
  Outlet,
  ScrollRestoration,
  createRootRoute,
  useMatches,
} from '@tanstack/react-router'

import Navigation from '../components/Navigation'
import Footer from '../components/Footer'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { title: 'LiveOL - Orienteering Live Results' },
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        name: 'description',
        content:
          'Real-time orienteering competition tracking and analysis. Follow live results, track your favorite athletes, and stay updated with the latest orienteering events.',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico',
      },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/assets/favicon/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/assets/favicon/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/assets/favicon/favicon-16x16.png',
      },
      {
        rel: 'manifest',
        href: '/assets/favicon/site.webmanifest',
      },
    ],
  }),

  component: RootComponent,
  shellComponent: RootDocument,
})

function RootComponent() {
  const matches = useMatches()
  // Check if we're on the exact landing page route (not just including root)
  const isLandingPage = matches.some((match) => match.id === '//')

  // Landing page has its own layout
  if (isLandingPage) {
    return (
      <>
        <Outlet />
        <ScrollRestoration />
      </>
    )
  }

  // Other pages use the standard layout
  return (
    <>
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen flex flex-col bg-base-background">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
