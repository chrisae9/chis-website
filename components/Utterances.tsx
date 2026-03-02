'use client'

import { useEffect, useRef } from 'react'

interface UtterancesProps {
  repo: string
  theme: string
}

export function Utterances({ repo, theme }: UtterancesProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const utterancesDiv = containerRef.current
    if (!utterancesDiv) return

    utterancesDiv.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://utteranc.es/client.js'
    script.setAttribute('repo', repo)
    script.setAttribute('issue-term', 'pathname')
    script.setAttribute('theme', theme)
    script.setAttribute('crossorigin', 'anonymous')
    script.async = true

    utterancesDiv.appendChild(script)

    return () => {
      utterancesDiv.innerHTML = ''
    }
  }, [repo, theme])

  return <div ref={containerRef} className="utterances-comments w-full mt-8" aria-label="Comments section" />
}
