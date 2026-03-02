'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Copy, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Utterances } from './Utterances'
import { YouTubeEmbed } from './YouTubeEmbed'
import { Post } from '@/lib/types'
import { utterancesConfig } from '@/lib/config'
import { useTheme } from 'next-themes'

interface PostContentProps {
  post: Post
  allPosts: Post[]
  onSectionChange?: (section: { connected: boolean; comments: boolean }) => void
}

function sanitizeId(text: string | undefined): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .replace(/[`*_{}[\]()#+\-.!]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function isExternalUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://')
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

export function PostContent({ post, allPosts, onSectionChange }: PostContentProps) {
  const [copyStatus, setCopyStatus] = useState<string>('')
  const { theme } = useTheme()
  const darkMode = theme === 'dark'

  const contentWithoutTitle = post.content.replace(/^#\s+.*$/m, '').trim()
  const formattedDate = formatDate(post.frontmatter.date)

  const referencingPosts = allPosts.filter(
    (p) => p.frontmatter.backlinks?.includes(post.slug) && p.slug !== post.slug
  )

  const hasConnectedPosts =
    (post.frontmatter.backlinks?.length ?? 0) > 0 || referencingPosts.length > 0

  const disableUtterances = post.frontmatter.disableUtterances === true

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopyStatus(text.substring(0, 20))
          setTimeout(() => setCopyStatus(''), 2000)
        })
        .catch(() => {
          setCopyStatus('Failed to copy')
          setTimeout(() => setCopyStatus(''), 2000)
        })
    }
  }

  const markdownComponents = {
    a: ({ node, ...props }: any) => {
      const href = props.href || ''
      if (isExternalUrl(href)) {
        return (
          <a
            {...props}
            className="text-[var(--accent)] hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          />
        )
      }
      return (
        <Link href={href} className="text-[var(--accent)] hover:underline">
          {props.children}
        </Link>
      )
    },
    h2: ({ node, ...props }: any) => (
      <h2 ref={(el: HTMLElement | null) => { if (el && !el.id) el.id = sanitizeId(el.textContent || '') }} {...props} />
    ),
    h3: ({ node, ...props }: any) => (
      <h3 ref={(el: HTMLElement | null) => { if (el && !el.id) el.id = sanitizeId(el.textContent || '') }} {...props} />
    ),
    h4: ({ node, ...props }: any) => (
      <h4 ref={(el: HTMLElement | null) => { if (el && !el.id) el.id = sanitizeId(el.textContent || '') }} {...props} />
    ),
    table: ({ node, ...props }: any) => (
      <div className="table-scroll-wrapper">
        <table {...props} />
      </div>
    ),
  }

  const processContent = (content: string): React.ReactNode[] => {
    const parts: Array<{ type: 'code' | 'text'; content: string }> = []
    let currentIndex = 0

    const codeBlockRegex = /```[\s\S]*?```/g
    let match

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > currentIndex) {
        parts.push({ type: 'text', content: content.substring(currentIndex, match.index) })
      }
      parts.push({ type: 'code', content: match[0] })
      currentIndex = match.index + match[0].length
    }

    if (currentIndex < content.length) {
      parts.push({ type: 'text', content: content.substring(currentIndex) })
    }

    return parts
      .map((part, index) => {
        if (part.type === 'code') {
          return (
            <div key={index} className="relative group">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                {part.content}
              </ReactMarkdown>
              <button
                onClick={() => {
                  const codeContent = part.content
                    .replace(/^```.*\n/, '')
                    .replace(/```$/, '')
                    .trim()
                  copyToClipboard(codeContent)
                }}
                className="absolute top-2 right-2 p-1.5 text-[var(--fg-muted)] hover:text-[var(--accent)] border border-transparent hover:border-[var(--accent)] opacity-0 group-hover:opacity-100 transition-all"
                aria-label="Copy code"
              >
                {copyStatus && part.content.includes(copyStatus.substring(0, 20)) ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          )
        } else {
          const customContent: React.ReactNode[] = []
          let lastIndex = 0
          const partContent = part.content

          const customImageRegex = /!(\d+)\[([^\]]+)\]\(([^)]+)\)/g
          const youtubeRegex = /\{\{youtube\.(.*?)\}\}/g

          let customMatch
          while ((customMatch = customImageRegex.exec(partContent)) !== null) {
            if (customMatch.index > lastIndex) {
              customContent.push(
                <ReactMarkdown
                  key={`text-before-img-${index}-${lastIndex}`}
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={markdownComponents}
                >
                  {partContent.substring(lastIndex, customMatch.index)}
                </ReactMarkdown>
              )
            }

            const width = parseInt(customMatch[1], 10)
            const alt = customMatch[2]
            const src = customMatch[3]

            customContent.push(
              <div key={`custom-img-${index}-${customMatch.index}`} className="flex justify-center">
                <img
                  src={src}
                  alt={alt}
                  style={{ width: `${width}%`, maxWidth: '100%' }}
                  className="border border-[var(--border)]"
                />
              </div>
            )

            lastIndex = customMatch.index + customMatch[0].length
          }

          if (lastIndex < partContent.length) {
            const remainingContent = partContent.substring(lastIndex)
            const segments: React.ReactNode[] = []
            let ytLastIndex = 0
            let embedMatch

            while ((embedMatch = youtubeRegex.exec(remainingContent)) !== null) {
              if (embedMatch.index > ytLastIndex) {
                segments.push(
                  <ReactMarkdown
                    key={`text-${index}-${ytLastIndex}`}
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={markdownComponents}
                  >
                    {remainingContent.substring(ytLastIndex, embedMatch.index)}
                  </ReactMarkdown>
                )
              }

              const videoId = embedMatch[1].trim()
              if (videoId) {
                segments.push(
                  <YouTubeEmbed key={`youtube-${index}-${embedMatch.index}`} videoId={videoId} />
                )
              } else {
                segments.push(<span key={`invalid-${index}-${embedMatch.index}`}>{embedMatch[0]}</span>)
              }

              ytLastIndex = embedMatch.index + embedMatch[0].length
            }

            if (ytLastIndex < remainingContent.length) {
              segments.push(
                <ReactMarkdown
                  key={`text-final-${index}-${ytLastIndex}`}
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={markdownComponents}
                >
                  {remainingContent.substring(ytLastIndex)}
                </ReactMarkdown>
              )
            }

            customContent.push(...segments)
          }

          return customContent
        }
      })
      .flat()
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [post.slug])

  useEffect(() => {
    if (!hasConnectedPosts) return

    const handleScroll = () => {
      const connectedPostsSection = document.getElementById('connected-posts')
      const commentsSection = document.getElementById('comments')
      if (!connectedPostsSection || !commentsSection) return

      const scrollY = window.scrollY
      const connectedPostsTop = connectedPostsSection.getBoundingClientRect().top + window.scrollY - 100
      const commentsTop = commentsSection.getBoundingClientRect().top + window.scrollY - 100

      const isAtConnectedPosts = scrollY >= connectedPostsTop && scrollY < commentsTop
      const isAtComments = scrollY >= commentsTop

      if (onSectionChange) {
        onSectionChange({ connected: isAtConnectedPosts, comments: isAtComments })
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasConnectedPosts, onSectionChange])

  return (
    <div className="space-y-4">
      {/* Back link */}
      <Link
        href="/"
        className="inline-block text-xs text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors mb-2"
      >
        ← back
      </Link>

      <article className="border border-[var(--border)] bg-[var(--bg)]">
        <div className="p-6">
          {/* Header */}
          <div className="border-b border-[var(--border)] pb-4 mb-6">
            <h1 className="text-lg font-bold text-[var(--fg)] mb-2">
              {post.frontmatter.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--fg-muted)]">
              <span>{formattedDate}</span>
              {post.frontmatter.category && (
                <>
                  <span className="text-[var(--border)]">/</span>
                  <span className="text-[var(--fg-secondary)]">{post.frontmatter.category}</span>
                </>
              )}
              {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
                <>
                  <span className="text-[var(--border)]">/</span>
                  <span>{post.frontmatter.tags.join(', ')}</span>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="prose max-w-none">
            {processContent(contentWithoutTitle)}
          </div>
        </div>
      </article>

      {/* Connected Posts */}
      {hasConnectedPosts && (
        <aside id="connected-posts" className="border border-[var(--border)] bg-[var(--bg)]">
          <div className="p-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--fg-muted)] mb-4 pb-2 border-b border-[var(--border)]">
              Connected Posts
            </h2>

            <div className="space-y-4">
              {post.frontmatter.backlinks && post.frontmatter.backlinks.length > 0 && (
                <div>
                  <h3 className="text-xs text-[var(--fg-muted)] mb-2">links in this post:</h3>
                  <div className="space-y-1">
                    {post.frontmatter.backlinks.map((slug) => {
                      const linkedPost = allPosts.find((p) => p.slug === slug)
                      return linkedPost ? (
                        <Link
                          key={slug}
                          href={`/${slug}`}
                          className="block text-xs text-[var(--accent)] hover:underline"
                        >
                          → {linkedPost.frontmatter.title}
                        </Link>
                      ) : null
                    })}
                  </div>
                </div>
              )}

              {referencingPosts.length > 0 && (
                <div>
                  <h3 className="text-xs text-[var(--fg-muted)] mb-2">referenced by:</h3>
                  <div className="space-y-1">
                    {referencingPosts.map((referencingPost) => (
                      <Link
                        key={referencingPost.slug}
                        href={`/${referencingPost.slug}`}
                        className="block text-xs text-[var(--accent)] hover:underline"
                      >
                        → {referencingPost.frontmatter.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* Comments */}
      {!disableUtterances && (
        <div id="comments" className="border border-[var(--border)] bg-[var(--bg)]">
          <div className="p-6">
            <Utterances
              repo={utterancesConfig.repo}
              theme={darkMode ? utterancesConfig.theme.dark : utterancesConfig.theme.light}
            />
          </div>
        </div>
      )}
    </div>
  )
}
