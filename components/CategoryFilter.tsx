'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'

interface CategoryFilterProps {
  categories: string[]
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const filteredCategories = categories.filter((category) =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectCategory = (category: string | null) => {
    onCategoryChange(category)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className="relative" ref={dropdownRef} onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex items-center gap-2 px-3 py-2 text-xs border border-[var(--border)] hover:border-[var(--accent)] text-[var(--fg-secondary)] hover:text-[var(--accent)] transition-colors"
      >
        <span>{selectedCategory || 'all categories'}</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-56 bg-[var(--bg)] border border-[var(--border)]" role="listbox">
          <div className="p-2">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="filter..."
              aria-label="Search categories"
              className="w-full h-7 px-2 text-xs bg-[var(--bg)] text-[var(--fg)] border border-[var(--border)] focus:border-[var(--accent)] focus:outline-none placeholder:text-[var(--fg-muted)] transition-colors"
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            <button
              onClick={() => handleSelectCategory(null)}
              role="option"
              aria-selected={selectedCategory === null}
              className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                selectedCategory === null
                  ? 'text-[var(--accent)] bg-[var(--accent-bg)]'
                  : 'text-[var(--fg-secondary)] hover:text-[var(--accent)]'
              }`}
            >
              all
            </button>

            {filteredCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleSelectCategory(category)}
                role="option"
                aria-selected={selectedCategory === category}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                  selectedCategory === category
                    ? 'text-[var(--accent)] bg-[var(--accent-bg)]'
                    : 'text-[var(--fg-secondary)] hover:text-[var(--accent)]'
                }`}
              >
                {category.toLowerCase()}
              </button>
            ))}

            {filteredCategories.length === 0 && (
              <div className="px-3 py-1.5 text-xs text-[var(--fg-muted)]">
                no results
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
