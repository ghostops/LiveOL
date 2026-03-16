import ReactMarkdown from 'react-markdown'

interface Props {
  content: string
  children?: React.ReactNode
}

export default function MarkdownContent({
  content,
  children: reactChildren,
}: Props) {
  return (
    <div className="bg-white md:bg-transparent">
      <article className="max-w-4xl mx-auto">
        <div className="md:bg-white md:border md:border-border md:rounded-sm md:shadow-sm p-8 md:p-12">
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-4xl md:text-5xl font-black uppercase italic text-brand-primary mb-6 leading-tight tracking-tight">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl md:text-3xl font-black uppercase italic text-brand-primary mt-12 mb-4 leading-tight">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl md:text-2xl font-bold uppercase text-text-main mt-8 mb-3 leading-tight">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-text-main text-base md:text-lg leading-relaxed mb-4">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="space-y-2 mb-6 ml-6">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="space-y-2 mb-6 ml-6">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-text-main text-base md:text-lg leading-relaxed pl-2">
                    <span className="inline-block mr-2 text-brand-primary font-bold">
                      •
                    </span>
                    {children}
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-text-main">
                    {children}
                  </strong>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-brand-primary hover:underline font-medium"
                    target={href?.startsWith('http') ? '_blank' : undefined}
                    rel={
                      href?.startsWith('http')
                        ? 'noopener noreferrer'
                        : undefined
                    }
                  >
                    {children}
                  </a>
                ),
                hr: () => <hr className="border-t border-border my-8" />,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-brand-primary pl-4 py-2 my-6 italic text-text-muted">
                    {children}
                  </blockquote>
                ),
                code: ({ children }) => (
                  <code className="bg-base-background px-2 py-1 rounded text-sm font-mono text-brand-primary">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-base-background p-4 rounded border border-border overflow-x-auto my-6">
                    {children}
                  </pre>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
          {reactChildren}
        </div>
      </article>
    </div>
  )
}
