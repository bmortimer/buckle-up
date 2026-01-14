'use client'

import { useState, useEffect } from 'react'

export default function BuyMeCoffee() {
  const [isVisible, setIsVisible] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    // Pop in after 10 seconds
    const showTimer = setTimeout(() => {
      setIsVisible(true)
    }, 10000)

    // Collapse to just coffee cup after 15 seconds total
    const collapseTimer = setTimeout(() => {
      setIsCollapsed(true)
    }, 15000)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(collapseTimer)
    }
  }, [])

  const isExpanded = isHovered || !isCollapsed

  return (
    <a
      href="https://buymeacoffee.com/bmortimer"
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`hidden sm:flex fixed bottom-6 right-6 z-50 items-center justify-center scoreboard-panel border-emerald-500 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] group transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      } ${isExpanded ? 'gap-2 px-4 py-3' : 'p-3'}`}
    >
      <span className="text-2xl leading-none">☕</span>
      <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
        <span className="text-[0.6rem] font-orbitron uppercase tracking-wider text-muted-foreground whitespace-nowrap">
          Support
        </span>
        <span className="text-xs font-mono text-emerald-500 group-hover:text-emerald-400 underline decoration-1 underline-offset-2 transition-colors whitespace-nowrap">
          Buy Coffee
        </span>
      </div>
    </a>
  )
}
