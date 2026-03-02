'use client'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="w-full">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent)] text-sm select-none pointer-events-none">
          {'>'}
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="search posts..."
          aria-label="Search posts"
          className="w-full h-10 pl-8 pr-4 text-sm bg-[var(--bg)] text-[var(--fg)] border border-[var(--border)] focus:border-[var(--accent)] focus:outline-none placeholder:text-[var(--fg-muted)] transition-colors"
        />
      </div>
    </div>
  )
}
