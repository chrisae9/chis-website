'use client'

import { useState, useEffect } from 'react'

interface TOCItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
  hasConnectedPosts?: boolean
  onConnectedPostsClick?: () => void
  onCommentsClick?: () => void
  isConnectedPostsActive?: boolean
  isCommentsActive?: boolean
  onHeadingClick?: () => void
}

function sanitizeId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`*_{}[\]()#+\-.!]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function TableOfContents({
  content,
  hasConnectedPosts = false,
  onConnectedPostsClick,
  onCommentsClick,
  isConnectedPostsActive = false,
  isCommentsActive = false,
  onHeadingClick,
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')
  const [headings, setHeadings] = useState<TOCItem[]>([])

  useEffect(() => {
    const contentWithoutCode = content.replace(/```[\s\S]*?```/g, '')
    const headingRegex = /^(#{2,4})\s+(.+)$/gm
    const matches = [...contentWithoutCode.matchAll(headingRegex)]
    const extracted = matches.map((match) => ({
      id: sanitizeId(match[2].trim()),
      text: match[2].trim(),
      level: match[1].length,
    }))
    setHeadings(extracted)
  }, [content])

  useEffect(() => {
    if (isConnectedPostsActive || isCommentsActive) {
      setActiveId('')
    }
  }, [isConnectedPostsActive, isCommentsActive])

  useEffect(() => {
    if (headings.length === 0) return

    const handleScroll = () => {
      if (isConnectedPostsActive || isCommentsActive) return

      const headingElements = headings
        .map((heading) => document.getElementById(heading.id))
        .filter((el) => el !== null) as HTMLElement[]

      if (headingElements.length === 0) return

      const scrollPosition = window.scrollY + 80

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const top = headingElements[i].getBoundingClientRect().top + window.scrollY
        if (top <= scrollPosition) {
          setActiveId(headingElements[i].id)
          return
        }
      }

      if (headingElements.length > 0) {
        setActiveId(headingElements[0].id)
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [headings, isConnectedPostsActive, isCommentsActive])

  const scrollToSection = (id: string) => {
    onHeadingClick?.()
    const element = document.getElementById(id)
    if (!element) return
    setActiveId(id)
    const top = element.getBoundingClientRect().top + window.scrollY - 80
    window.scrollTo({
      top,
      behavior: 'smooth',
    })
  }

  return (
    <div>
      {headings.length === 0 ? (
        <div className="text-xs text-[var(--fg-muted)] italic">
          No headings found.
        </div>
      ) : (
        <nav aria-label="Table of contents" className="space-y-0.5">
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className={`block text-xs py-1 border-l-2 transition-colors ${
                heading.level === 2 ? 'pl-3' : heading.level === 3 ? 'pl-6' : 'pl-9'
              } ${
                activeId === heading.id
                  ? 'border-l-[var(--accent)] text-[var(--accent)]'
                  : 'border-l-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:border-l-[var(--fg-muted)]'
              }`}
              onClick={(e) => {
                e.preventDefault()
                scrollToSection(heading.id)
              }}
              aria-current={activeId === heading.id ? 'location' : undefined}
            >
              {heading.text}
            </a>
          ))}
        </nav>
      )}

      <div className="mt-4 pt-3 border-t border-[var(--border)] space-y-1">
        {hasConnectedPosts && onConnectedPostsClick && (
          <button
            onClick={onConnectedPostsClick}
            className={`block text-xs py-1 transition-colors ${
              isConnectedPostsActive
                ? 'text-[var(--accent)]'
                : 'text-[var(--fg-muted)] hover:text-[var(--accent)]'
            }`}
            aria-label="Scroll to connected posts section"
          >
            → connected posts
          </button>
        )}

        {onCommentsClick && (
          <button
            onClick={onCommentsClick}
            className={`block text-xs py-1 transition-colors ${
              isCommentsActive
                ? 'text-[var(--accent)]'
                : 'text-[var(--fg-muted)] hover:text-[var(--accent)]'
            }`}
            aria-label="Scroll to comments section"
          >
            → comments
          </button>
        )}
      </div>
    </div>
  )
}
