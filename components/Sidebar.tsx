'use client'

import { ReactNode } from 'react'

interface SidebarProps {
  title: string
  showMobileHeader?: boolean
  children: ReactNode
}

export function Sidebar({ title, showMobileHeader = false, children }: SidebarProps) {
  return (
    <div
      className="sticky top-6 border border-[var(--border)] bg-[var(--bg)] p-4"
      role="complementary"
      aria-label={title}
    >
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--fg-muted)] mb-4 pb-2 border-b border-[var(--border)]">
        {title}
      </h2>
      <div className="overflow-y-auto max-h-[calc(100vh-8rem)]">
        {children}
      </div>
    </div>
  )
}
