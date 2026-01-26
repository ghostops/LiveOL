import { createFileRoute } from '@tanstack/react-router'
import MarkdownContent from '../components/MarkdownContent'
import { getContent } from '../utils/content'

export const Route = createFileRoute('/licenses')({
  head: () => ({
    meta: [
      { title: 'Open Source Licenses | LiveOL' },
      {
        name: 'description',
        content:
          'View open source licenses for software used in LiveOL.',
      },
    ],
  }),
  loader: async () => await getContent('licenses'),
  component: () => {
    const data = Route.useLoaderData()
    return <MarkdownContent content={data.content} />
  },
})
