'use client'

import { useState, useMemo } from 'react'
import Fuse from 'fuse.js'
import { Post } from '@/lib/types'
import { PostCard } from './PostCard'
import { SearchBar } from './SearchBar'
import { CategoryFilter } from './CategoryFilter'
import { SortControls, SortOrder } from './SortControls'
import { TagList } from './TagList'
import { Sidebar } from './Sidebar'
import { DynamicLinks } from './DynamicLinks'
import { ThemeToggle } from './ThemeToggle'
import { BackToTop } from './BackToTop'
import { links } from '@/lib/links'
import { Menu, X } from 'lucide-react'

interface PostListProps {
  posts: Post[]
  allTags: string[]
  allCategories: string[]
}

export function PostList({ posts, allTags, allCategories }: PostListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [showLeftSidebar, setShowLeftSidebar] = useState(false)
  const [showRightSidebar, setShowRightSidebar] = useState(false)

  const fuse = useMemo(
    () =>
      new Fuse(posts, {
        keys: ['frontmatter.title', 'frontmatter.summary', 'content'],
        threshold: 0.3,
      }),
    [posts]
  )

  const tagsForCategory = useMemo(() => {
    if (!selectedCategory) return allTags
    const categoryPosts = posts.filter((p) => p.frontmatter.category === selectedCategory)
    const tags = new Set<string>()
    categoryPosts.forEach((p) => p.frontmatter.tags.forEach((t) => tags.add(t)))
    return Array.from(tags)
  }, [posts, selectedCategory, allTags])

  const filteredPosts = useMemo(() => {
    let result = posts

    if (searchTerm) {
      result = fuse.search(searchTerm).map(({ item }) => item)
    }

    if (selectedCategory) {
      result = result.filter((post) => post.frontmatter.category === selectedCategory)
    }

    if (selectedTags.length > 0) {
      result = result.filter((post) =>
        selectedTags.every((tag) => post.frontmatter.tags.includes(tag))
      )
    }

    return [...result].sort((a, b) => {
      const dateA = new Date(a.frontmatter.date).getTime()
      const dateB = new Date(b.frontmatter.date).getTime()
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
    })
  }, [posts, searchTerm, selectedCategory, selectedTags, fuse, sortOrder])

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const closeSidebars = () => {
    setShowLeftSidebar(false)
    setShowRightSidebar(false)
  }

  return (
    <div className="min-h-screen">
      {/* Fixed controls — top right */}
      <div className="fixed top-4 right-4 z-50 flex gap-1">
        <BackToTop />
        <ThemeToggle />
      </div>

      {/* Mobile sidebar toggles — bottom */}
      <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 z-50 lg:hidden flex gap-1">
        <button
          onClick={() => {
            setShowRightSidebar(false)
            setShowLeftSidebar(!showLeftSidebar)
          }}
          className="w-8 h-8 flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--accent)] border border-[var(--border)] hover:border-[var(--accent)] bg-[var(--bg)] transition-colors"
          aria-label={showLeftSidebar ? 'Close tags' : 'Open tags'}
        >
          {showLeftSidebar ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-50 lg:hidden">
        <button
          onClick={() => {
            setShowLeftSidebar(false)
            setShowRightSidebar(!showRightSidebar)
          }}
          className="w-8 h-8 flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--accent)] border border-[var(--border)] hover:border-[var(--accent)] bg-[var(--bg)] transition-colors text-xs"
          aria-label={showRightSidebar ? 'Close links' : 'Open links'}
        >
          {showRightSidebar ? <X className="h-4 w-4" /> : '↗'}
        </button>
      </div>

      {/* Mobile overlay */}
      {(showLeftSidebar || showRightSidebar) && (
        <div
          className="fixed inset-0 bg-[var(--bg)]/80 z-40 lg:hidden"
          onClick={closeSidebars}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left sidebar — Tags */}
          <aside
            className={`w-60 shrink-0 ${
              showLeftSidebar
                ? 'fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom))] left-4 right-4 w-auto z-50 lg:relative lg:inset-auto lg:w-60'
                : 'hidden lg:block'
            }`}
          >
            <Sidebar title="Tags">
              <TagList tags={tagsForCategory} selectedTags={selectedTags} onTagToggle={handleTagToggle} />
            </Sidebar>
          </aside>

          {/* Center — Content */}
          <main className="flex-1 min-w-0 space-y-4">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />

            <div className="flex items-center justify-between">
              <CategoryFilter
                categories={allCategories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
              <SortControls sortOrder={sortOrder} onSortChange={setSortOrder} />
            </div>

            <div className="space-y-3">
              {filteredPosts.map((post) => (
                <PostCard key={post.slug} post={post} searchTerm={searchTerm} />
              ))}

              {filteredPosts.length === 0 && (
                <div className="text-center py-12 text-xs text-[var(--fg-muted)]">
                  no posts found.
                </div>
              )}
            </div>
          </main>

          {/* Right sidebar — Links */}
          <aside
            className={`w-56 shrink-0 ${
              showRightSidebar
                ? 'fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom))] left-4 right-4 w-auto z-50 lg:relative lg:inset-auto lg:w-56'
                : 'hidden lg:block'
            }`}
          >
            <Sidebar title="Links">
              <DynamicLinks links={links} />
            </Sidebar>
          </aside>
        </div>
      </div>
    </div>
  )
}
