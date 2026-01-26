import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

export async function getContent(page: string) {
  const currentDir = path.dirname(fileURLToPath(import.meta.url))
  const contentDir = path.resolve(currentDir, '../../content')
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
}
