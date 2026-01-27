import { createFileRoute } from '@tanstack/react-router'
import MarkdownContent from '../components/MarkdownContent'
import { getContent } from '../utils/content'

export const Route = createFileRoute('/privacy')({
  head: () => ({
    meta: [
      { title: 'Privacy Policy | LiveOL' },
      {
        name: 'description',
        content:
          'Read LiveOL privacy policy and learn how we protect your data.',
      },
    ],
  }),
  loader: async () => await getContent({data: 'privacy'}),
  component: () => {
    const data = Route.useLoaderData()
    return <MarkdownContent content={data.content} />
  },
})
