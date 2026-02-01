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
          'The digital blueprint for global orienteering performance. Engineered for sub-second synchronization across elite championships.',
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
