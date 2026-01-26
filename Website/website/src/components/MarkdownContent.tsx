import ReactMarkdown from 'react-markdown'

interface Props {
  content: string
}

export default function MarkdownContent({ content }: Props) {
  return (
    <article className="prose prose-lg prose-invert max-w-none bg-gray-900 p-8 rounded-lg border border-gray-800">
      <ReactMarkdown>{content}</ReactMarkdown>
    </article>
  )
}
