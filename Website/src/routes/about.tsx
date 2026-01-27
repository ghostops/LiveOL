import { createFileRoute } from '@tanstack/react-router'
import MarkdownContent from '../components/MarkdownContent'
import { getContent } from '../utils/content'

export const Route = createFileRoute('/about')({
  head: () => ({
    meta: [
      {
        title: 'About LiveOL',
      },
      {
        name: 'description',
        content:
          'Learn about LiveOL - the leading mobile app for real-time orienteering results and competition tracking.',
      },
    ],
  }),
  loader: async () => await getContent({ data: 'about' }),
  component: () => {
    const data = Route.useLoaderData()
    return <MarkdownContent content={data.content} />
  },
})
