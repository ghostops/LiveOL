import { createFileRoute } from '@tanstack/react-router'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import Hero from '../components/landing/Hero'
import StatsBar from '../components/landing/StatsBar'
import Features from '../components/landing/Features'
import TechnicalSpecs from '../components/landing/TechnicalSpecs'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      {
        title: 'LiveOL - High-Precision Live Orienteering Results',
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
      <StatsBar />
      <Features />
      <TechnicalSpecs />
      <Footer />
    </div>
  )
}
