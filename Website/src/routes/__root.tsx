import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useMatches,
} from '@tanstack/react-router'

import Navigation from '../components/Navigation'
import Footer from '../components/Footer'

import '../styles.css'

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
          'Real-time orienteering competition tracking and analysis. Follow live results, track your favorite runners, and stay updated with the latest orienteering events.',
      },
      {
        name: 'apple-itunes-app',
        content: 'app-id=1450106846',
      },
    ],
    links: [
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
      </>
    )
  }

  // Other pages use the standard layout
  return (
    <>
      <Navigation />
      <main className="flex-1 container mx-auto md:px-4 md:py-8 max-w-4xl">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'LiveOL',
            operatingSystem: 'iOS, Android',
            applicationCategory: 'SportsApplication',
            offers: [
              {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              {
                '@type': 'Offer',
                name: 'LiveOL+',
                price: '10.00',
                priceCurrency: 'USD',
                priceValidUntil: '2026-12-31',
                billingDuration: 'P1Y',
              },
            ],
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.5',
              ratingCount: '350',
            },
            downloadUrl: [
              'https://itunes.apple.com/app/liveol/id1450106846',
              'https://play.google.com/store/apps/details?id=se.liveol.rn',
            ],
          })}
        </script>
      </head>
      <body
        className="min-h-screen flex flex-col bg-base-background"
        suppressHydrationWarning
      >
        {children}
        <Scripts />
      </body>
    </html>
  )
}
