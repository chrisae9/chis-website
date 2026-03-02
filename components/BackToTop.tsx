'use client'

import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300)
    }

    window.addEventListener('scroll', toggleVisibility, { passive: true })
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  if (!isVisible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="w-8 h-8 flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--accent)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors"
      aria-label="Back to top"
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  )
}
