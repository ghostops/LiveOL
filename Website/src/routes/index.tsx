import { createFileRoute } from '@tanstack/react-router'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import Hero from '../components/landing/Hero'
import ScreenshotGallery from '../components/landing/ScreenshotGallery'
import Features from '../components/landing/Features'
import PlusFeatures from '../components/landing/PlusFeatures'
import Newsletter from '../components/landing/Newsletter'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      {
        title: 'LiveOL - Live Orienteering Results',
      },
      {
        name: 'description',
        content:
          'Real-time orienteering competition tracking and analysis. Follow live results, track your favorite runners, and stay updated with the latest orienteering events.',
      },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
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
        }),
      },
    ],
  }),
  component: LandingPage,
})

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <Hero />
      <Features />
      <ScreenshotGallery />
      <PlusFeatures />
      <Newsletter />
      <Footer />
    </div>
  )
}
