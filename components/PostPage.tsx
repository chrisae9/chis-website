'use client'

import { useState, useMemo } from 'react'
import { Post } from '@/lib/types'
import { PostContent } from './PostContent'
import { TableOfContents } from './TableOfContents'
import { Sidebar } from './Sidebar'
import { ThemeToggle } from './ThemeToggle'
import { BackToTop } from './BackToTop'
import { Menu, X } from 'lucide-react'

interface PostPageProps {
  post: Post
  allPosts: Post[]
}

export function PostPage({ post, allPosts }: PostPageProps) {
  const [showMobileTOC, setShowMobileTOC] = useState(false)
  const [sectionState, setSectionState] = useState({ connected: false, comments: false })

  const referencingPosts = useMemo(
    () => allPosts.filter((p) => p.frontmatter.backlinks?.includes(post.slug) && p.slug !== post.slug),
    [allPosts, post.slug]
  )

  const hasConnectedPosts =
    (post.frontmatter.backlinks?.length ?? 0) > 0 || referencingPosts.length > 0

  const scrollToConnectedPosts = () => {
    const el = document.getElementById('connected-posts')
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top, behavior: 'smooth' })
    }
    setSectionState({ connected: true, comments: false })
    setShowMobileTOC(false)
  }

  const scrollToComments = () => {
    const el = document.getElementById('comments')
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top, behavior: 'smooth' })
    }
    setSectionState({ connected: false, comments: true })
    setShowMobileTOC(false)
  }

  const handleHeadingClick = () => {
    setSectionState({ connected: false, comments: false })
    setShowMobileTOC(false)
  }

  const tocProps = {
    content: post.content,
    hasConnectedPosts,
    onConnectedPostsClick: scrollToConnectedPosts,
    onCommentsClick: post.frontmatter.disableUtterances ? undefined : scrollToComments,
    isConnectedPostsActive: sectionState.connected,
    isCommentsActive: sectionState.comments,
    onHeadingClick: handleHeadingClick,
  }

  return (
    <div className="min-h-screen">
      {/* Fixed controls — top right */}
      <div className="fixed top-4 right-4 z-50 flex gap-1">
        <BackToTop />
        <ThemeToggle />
      </div>

      {/* Mobile TOC — bottom sheet */}
      <div className="lg:hidden">
        {/* Toggle button */}
        <button
          onClick={() => setShowMobileTOC(!showMobileTOC)}
          className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 z-50 w-8 h-8 flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--accent)] border border-[var(--border)] hover:border-[var(--accent)] bg-[var(--bg)] transition-colors"
          aria-label={showMobileTOC ? 'Close table of contents' : 'Open table of contents'}
        >
          {showMobileTOC ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        {/* Backdrop */}
        {showMobileTOC && (
          <div
            className="fixed inset-0 bg-[var(--bg)]/80 z-40"
            onClick={() => setShowMobileTOC(false)}
          />
        )}

        {/* Panel — anchored above the button */}
        {showMobileTOC && (
          <div className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom))] left-4 right-4 z-50 border border-[var(--border)] bg-[var(--bg)] p-4 max-h-[60vh] overflow-y-auto">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--fg-muted)] mb-4 pb-2 border-b border-[var(--border)]">
              Contents
            </h2>
            <TableOfContents {...tocProps} />
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Desktop sidebar — always visible */}
          <aside className="w-60 shrink-0 hidden lg:block">
            <Sidebar title="Contents">
              <TableOfContents {...tocProps} />
            </Sidebar>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <PostContent
              post={post}
              allPosts={allPosts}
              onSectionChange={setSectionState}
            />
          </main>
        </div>
      </div>
    </div>
  )
}
