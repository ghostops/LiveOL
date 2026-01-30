import { createFileRoute } from '@tanstack/react-router'
import MarkdownContent from '../components/MarkdownContent'
import { getContent } from '../utils/content'

export const Route = createFileRoute('/contact')({
  head: () => ({
    meta: [
      {
        title: 'Contact Us | LiveOL',
      },
      {
        name: 'description',
        content:
          'Get in touch with LiveOL. Contact us for support, feedback, or inquiries about our orienteering live results platform.',
      },
      {
        property: 'og:title',
        content: 'Contact Us | LiveOL',
      },
      {
        property: 'og:description',
        content:
          'Get in touch with LiveOL. Contact us for support, feedback, or inquiries about our orienteering live results platform.',
      },
    ],
  }),
  loader: async () => {
    const data = await getContent({ data: 'contact' })
    return data
  },
  component: ContactPage,
})

function ContactPage() {
  const data = Route.useLoaderData()
  return (
    <div>
      <MarkdownContent content={data.content}>
        <form
          action="https://formspree.io/f/xqkyzjaq"
          method="POST"
          className="max-w-2xl mx-auto space-y-6 mt-8"
        >
          <div className="flex flex-col gap-2">
            <label
              htmlFor="name"
              className="font-mono text-text-main text-sm font-bold tracking-wider uppercase"
            >
              Your name:
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              className="border-2 border-border bg-white px-4 py-3 text-text-main focus:border-brand-primary focus:outline-none transition-colors"
              placeholder="John Doe"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="font-mono text-text-main text-sm font-bold tracking-wider uppercase"
            >
              Your email:
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              className="border-2 border-border bg-white px-4 py-3 text-text-main focus:border-brand-primary focus:outline-none transition-colors"
              placeholder="your.email@example.com"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="message"
              className="font-mono text-text-main text-sm font-bold tracking-wider uppercase"
            >
              Your message:
            </label>
            <textarea
              name="message"
              id="message"
              rows={6}
              required
              className="border-2 border-border bg-white px-4 py-3 text-text-main focus:border-brand-primary focus:outline-none transition-colors resize-vertical"
              placeholder="Tell us what's on your mind..."
            ></textarea>
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-3 border-2 border-brand-primary bg-brand-primary text-white h-14 px-10 text-sm font-black uppercase tracking-[0.2em] hover:bg-white hover:text-brand-primary transition-all group"
          >
            Send Message
            <span className="text-xl group-hover:translate-x-1 transition-transform">
              →
            </span>
          </button>
        </form>
      </MarkdownContent>
    </div>
  )
}
