import { createFileRoute } from '@tanstack/react-router'
import MarkdownContent from '../components/MarkdownContent'
import { getContent } from '../utils/content'

export const Route = createFileRoute('/translate')({
  head: () => ({
    meta: [
      { title: 'Translate the app | LiveOL' },
      {
        name: 'description',
        content: 'Help us make LiveOL accessible to more people by contributing translations for different languages.',
      },
    ],
  }),
  loader: async () => await getContent({data: 'translate'}),
  component: () => {
    const data = Route.useLoaderData()
    return <MarkdownContent content={data.content} />
  },
})
