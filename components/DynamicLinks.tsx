'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { DynamicLink } from '@/lib/links'

library.add(fas, fab)

interface DynamicLinksProps {
  links: DynamicLink[]
}

export function DynamicLinks({ links }: DynamicLinksProps) {
  return (
    <div className="space-y-0.5">
      {links.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visit ${link.name} (opens in new tab)`}
          className="flex items-center gap-3 px-2 py-1.5 text-xs text-[var(--fg-secondary)] hover:text-[var(--accent)] transition-colors group"
        >
          <FontAwesomeIcon
            icon={[link.icon.prefix, link.icon.name]}
            className="w-3.5 h-3.5 text-[var(--fg-muted)] group-hover:text-[var(--accent)] transition-colors"
            aria-hidden="true"
          />
          <span>{link.name}</span>
        </a>
      ))}
    </div>
  )
}
