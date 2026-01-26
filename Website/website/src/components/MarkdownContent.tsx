import ReactMarkdown from 'react-markdown'

interface Props {
  content: string
}

export default function MarkdownContent({ content }: Props) {
  return (
    <article className="prose prose-lg max-w-none bg-base-surface p-8 border border">
      <ReactMarkdown>{content}</ReactMarkdown>
    </article>
  )
}
