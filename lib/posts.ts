import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { Post } from './types'

const postsDirectory = path.join(process.cwd(), 'content/posts')

function extractBacklinks(content: string): string[] {
  const backlinks = new Set<string>()
  const backlinkRegex = /\{\{((?!youtube\.)[^{}]*?)\}\}/g
  let match

  while ((match = backlinkRegex.exec(content)) !== null) {
    backlinks.add(match[1].trim())
  }

  return Array.from(backlinks)
}

function processBacklinkSyntax(content: string): string {
  return content.replace(/\{\{((?!youtube\.)[^{}]*?)\}\}/g, (_, text) => {
    const linkText = text.trim()
    const slug = linkText
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\s-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')

    return `[${linkText}](/${slug})`
  })
}

export function getAllPosts(includeDrafts = false, includeHidden = false): Post[] {
  const filenames = fs.readdirSync(postsDirectory)

  const posts = filenames
    .filter((name) => name.endsWith('.md'))
    .map((filename) => {
      const slug = filename.replace(/\.md$/, '')
      const fullPath = path.join(postsDirectory, filename)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)
      const backlinks = extractBacklinks(content)
      const processedContent = processBacklinkSyntax(content)

      return {
        slug,
        content: processedContent,
        frontmatter: {
          ...(data as Post['frontmatter']),
          backlinks,
        },
      }
    })

  return posts.filter((post) => {
    const shouldIncludeDraft = !post.frontmatter.draft || includeDrafts
    const shouldIncludeHidden = !post.frontmatter.hidden || includeHidden
    return shouldIncludeDraft && shouldIncludeHidden
  })
}

export function getPostBySlug(slug: string): Post | undefined {
  const allPosts = getAllPosts(false, true)
  return allPosts.find((post) => post.slug === slug)
}

export function getPostBySlugCaseInsensitive(slug: string): Post | undefined {
  const allPosts = getAllPosts(false, true)
  return allPosts.find(
    (post) => post.slug.toLowerCase() === slug.toLowerCase()
  )
}

export function findReferencingPosts(posts: Post[], targetSlug: string): Post[] {
  return posts.filter(
    (post) =>
      post.frontmatter.backlinks?.includes(targetSlug) &&
      post.slug !== targetSlug
  )
}

export function extractAllTags(posts: Post[], categoryFilter?: string | null): string[] {
  const tags = new Set<string>()
  const postsToConsider = categoryFilter
    ? posts.filter((post) => post.frontmatter.category === categoryFilter)
    : posts

  postsToConsider.forEach((post) => {
    post.frontmatter.tags.forEach((tag) => tags.add(tag))
  })

  return Array.from(tags)
}

export function extractAllCategories(posts: Post[]): string[] {
  const categories = new Set<string>()

  posts.forEach((post) => {
    if (post.frontmatter.category) {
      categories.add(post.frontmatter.category)
    }
  })

  return Array.from(categories)
}

export function sortPostsByDate(posts: Post[], ascending = false): Post[] {
  return [...posts].sort((a, b) => {
    const dateA = new Date(a.frontmatter.date).getTime()
    const dateB = new Date(b.frontmatter.date).getTime()
    return ascending ? dateA - dateB : dateB - dateA
  })
}

export function getAllSlugs(): string[] {
  return getAllPosts(false, true).map((post) => post.slug)
}
