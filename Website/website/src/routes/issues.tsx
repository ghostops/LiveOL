import { createFileRoute } from '@tanstack/react-router'
import MarkdownContent from '../components/MarkdownContent'
import { getContent } from '../utils/content'

export const Route = createFileRoute('/issues')({
  head: () => ({
    title: 'Report Issues | LiveOL',
    meta: [
      {
        name: 'description',
        content: 'Report bugs or issues with the LiveOL platform.',
      },
    ],
  }),
  loader: async () => await getContent('issues'),
  component: () => {
    const data = Route.useLoaderData()
    return <MarkdownContent content={data.content} />
  },
})
