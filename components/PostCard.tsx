'use client'

import Link from 'next/link'
import { Post } from '@/lib/types'

interface PostCardProps {
  post: Post
  searchTerm: string
}

function highlightText(text: string, searchTerm: string) {
  if (!searchTerm) return text
  const parts = text.split(new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === searchTerm.toLowerCase() ? (
      <mark key={i} className="search-highlight">{part}</mark>
    ) : (
      part
    )
  )
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000)
  return localDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function PostCard({ post, searchTerm }: PostCardProps) {
  return (
    <Link href={`/${post.slug}`} className="block group">
      <article className="border border-[var(--border)] group-hover:border-[var(--accent)] p-4 transition-colors">
        <div className="flex items-baseline justify-between gap-4 mb-2">
          <h2 className="text-sm font-medium text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">
            {highlightText(post.frontmatter.title, searchTerm)}
          </h2>
          <span className="text-xs text-[var(--fg-muted)] whitespace-nowrap shrink-0">
            {formatDate(post.frontmatter.date)}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2 text-xs text-[var(--fg-muted)]">
          {post.frontmatter.category && (
            <span className="text-[var(--fg-secondary)]">
              {post.frontmatter.category}
            </span>
          )}
          {post.frontmatter.category && post.frontmatter.tags.length > 0 && (
            <span className="text-[var(--border)]">/</span>
          )}
          <span>{post.frontmatter.tags.join(', ')}</span>
        </div>

        <p className="text-xs text-[var(--fg-secondary)] mb-3 line-clamp-2">
          {highlightText(post.frontmatter.summary, searchTerm)}
        </p>

        <span className="text-xs text-[var(--fg-muted)] group-hover:text-[var(--accent)] transition-colors">
          read more →
        </span>
      </article>
    </Link>
  )
}
