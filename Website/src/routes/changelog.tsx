import { createFileRoute } from '@tanstack/react-router'
import MarkdownContent from '../components/MarkdownContent'
import { getContent } from '../utils/content'

export const Route = createFileRoute('/changelog')({
  head: () => ({
    meta: [
      { title: 'Changelog | LiveOL' },
      {
        name: 'description',
        content: 'View the latest updates and changes to the LiveOL platform.',
      },
    ],
  }),
  loader: async () => await getContent({data: 'changelog'}),
  component: () => {
    const data = Route.useLoaderData()
    return <MarkdownContent content={data.content} />
  },
})
