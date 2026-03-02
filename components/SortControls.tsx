'use client'

export type SortOrder = 'asc' | 'desc'

interface SortControlsProps {
  sortOrder: SortOrder
  onSortChange: (order: SortOrder) => void
}

export function SortControls({ sortOrder, onSortChange }: SortControlsProps) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <button
        onClick={() => onSortChange('desc')}
        className={`px-2 py-1 border transition-colors ${
          sortOrder === 'desc'
            ? 'text-[var(--accent)] border-[var(--accent)]'
            : 'text-[var(--fg-muted)] border-[var(--border)] hover:text-[var(--accent)] hover:border-[var(--accent)]'
        }`}
        aria-label="Sort by newest first"
        aria-pressed={sortOrder === 'desc'}
      >
        newest
      </button>
      <button
        onClick={() => onSortChange('asc')}
        className={`px-2 py-1 border transition-colors ${
          sortOrder === 'asc'
            ? 'text-[var(--accent)] border-[var(--accent)]'
            : 'text-[var(--fg-muted)] border-[var(--border)] hover:text-[var(--accent)] hover:border-[var(--accent)]'
        }`}
        aria-label="Sort by oldest first"
        aria-pressed={sortOrder === 'asc'}
      >
        oldest
      </button>
    </div>
  )
}
