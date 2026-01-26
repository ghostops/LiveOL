import { createFileRoute } from '@tanstack/react-router'
import MarkdownContent from '../components/MarkdownContent'
import { getContent } from '../utils/content'

export const Route = createFileRoute('/terms')({
  head: () => ({
    meta: [
      { title: 'Terms of Service | LiveOL' },
      {
        name: 'description',
        content: 'Read LiveOL terms of service and usage guidelines.',
      },
    ],
  }),
  loader: async () => await getContent('terms'),
  component: () => {
    const data = Route.useLoaderData()
    return <MarkdownContent content={data.content} />
  },
})
