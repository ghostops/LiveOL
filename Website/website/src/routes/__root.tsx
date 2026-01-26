import {
  HeadContent,
  Scripts,
  Outlet,
  ScrollRestoration,
  createRootRoute,
} from '@tanstack/react-router'

import Navigation from '../components/Navigation'
import Footer from '../components/Footer'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
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
    title: 'LiveOL - Orienteering Live Results',
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
      <body className="min-h-screen flex flex-col bg-gray-950 text-white">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
