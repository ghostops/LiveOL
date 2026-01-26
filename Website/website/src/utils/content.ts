import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { fileURLToPath } from 'url'

export async function getContent(page: string) {
  // Resolve path relative to this file's directory
  const currentDir = path.dirname(fileURLToPath(import.meta.url))
  const contentDir = path.resolve(currentDir, '../../../content')
  const filePath = path.join(contentDir, `${page}.md`)

  if (!fs.existsSync(filePath)) {
    throw new Error(`Content not found: ${page}`)
  }

  const fileContents = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(fileContents)

  return {
    content,
    metadata: data,
  }
}
