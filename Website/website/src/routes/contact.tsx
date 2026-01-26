import { createFileRoute } from '@tanstack/react-router'
import MarkdownContent from '../components/MarkdownContent'
import { getContent } from '../utils/content'

export const Route = createFileRoute('/contact')({
  head: () => ({
    title: 'Contact Us | LiveOL',
    meta: [
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
    const data = await getContent('contact')
    return data
  },
  component: ContactPage,
})

function ContactPage() {
  const data = Route.useLoaderData()
  return <MarkdownContent content={data.content} />
}
