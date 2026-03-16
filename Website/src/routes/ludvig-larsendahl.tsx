import { createFileRoute } from '@tanstack/react-router'
import MarkdownContent from '../components/MarkdownContent'
import { getContent } from '../utils/content'

export const Route = createFileRoute('/ludvig-larsendahl')({
  head: () => ({
    meta: [
      {
        title: 'About Ludvig | LiveOL',
      },
      {
        name: 'description',
        content: 'Learn about Ludvig, the creator of LiveOL.',
      },
    ],
  }),
  loader: async () => await getContent({data: 'ludvig'}),
  component: () => {
    const data = Route.useLoaderData()
    return <MarkdownContent content={data.content} />
  },
})
