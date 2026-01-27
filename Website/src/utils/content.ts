import { createServerFn } from '@tanstack/react-start'

export const getContent = createServerFn().inputValidator((page: string) => page).handler(async ({ data: page }) => {
  const fs = await import('node:fs/promises')
  const path = await import('node:path')
  const matter = (await import('gray-matter')).default

  const contentDir = path.resolve(process.cwd(), 'content')
  const filePath = path.join(contentDir, `${page}.md`)

  try {
    const fileContents = await fs.readFile(filePath, 'utf8')
    const { data, content } = matter(fileContents)

    return {
      content,
      metadata: data,
    }
  } catch (error) {
    throw new Error(`Content not found: ${page}`)
  }
});
