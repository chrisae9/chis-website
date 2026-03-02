'use client'

import { useState } from 'react'

interface TagListProps {
  tags: string[]
  selectedTags: string[]
  onTagToggle: (tag: string) => void
}

export function TagList({ tags, selectedTags, onTagToggle }: TagListProps) {
  const [tagSearch, setTagSearch] = useState('')

  const filteredTags = tags.filter((tag) =>
    tag.toLowerCase().includes(tagSearch.toLowerCase())
  )

  return (
    <div className="space-y-3">
      <div className="relative">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] text-xs select-none pointer-events-none">
          /
        </span>
        <input
          type="text"
          value={tagSearch}
          onChange={(e) => setTagSearch(e.target.value)}
          placeholder="filter..."
          aria-label="Filter tags"
          className="w-full h-8 pl-6 pr-3 text-xs bg-[var(--bg)] text-[var(--fg)] border border-[var(--border)] focus:border-[var(--accent)] focus:outline-none placeholder:text-[var(--fg-muted)] transition-colors"
        />
      </div>

      <div className="space-y-0.5">
        {filteredTags.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagToggle(tag)}
            aria-pressed={selectedTags.includes(tag)}
            className={`block w-full text-left px-2 py-1 text-xs transition-colors ${
              selectedTags.includes(tag)
                ? 'text-[var(--accent)] bg-[var(--accent-bg)] border-l-2 border-l-[var(--accent)]'
                : 'text-[var(--fg-secondary)] hover:text-[var(--accent)] border-l-2 border-l-transparent'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
}
