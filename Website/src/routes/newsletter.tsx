import { createFileRoute } from '@tanstack/react-router'
import MarkdownContent from '../components/MarkdownContent'
import { getContent } from '../utils/content'

export const Route = createFileRoute('/newsletter')({
  head: () => ({
    meta: [
      {
        title: 'Newsletter | LiveOL',
      },
      {
        name: 'description',
        content:
          'Subscribe to the LiveOL newsletter for updates on new features, orienteering events, and live results updates.',
      },
    ],
  }),
  loader: async () => await getContent({data: 'newsletter'}),
  component: () => {
    const data = Route.useLoaderData()
    return <MarkdownContent content={data.content} />
  },
})
