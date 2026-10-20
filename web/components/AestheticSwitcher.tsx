'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

// Three-state cycle: light (sun) → dark (moon) → risograph (zap) → light …
const CYCLE = ['light', 'dark', 'theme-riso'] as const
type ThemeValue = (typeof CYCLE)[number]

const LABEL: Record<ThemeValue, string> = {
  light: 'light',
  dark: 'dark',
  'theme-riso': 'risograph',
}

// Same box model as the adjacent About link (text-[0.65rem], py-1.5, 1px border)
// so heights match in every theme. Icons are 1.5em = one line box tall, and
// px equals py, so the button comes out square. Icons stack in one grid cell.
const BOX = 'grid place-items-center px-1.5 py-1.5 text-[0.65rem] border border-border bg-card'

export function AestheticSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className={BOX} aria-hidden="true">
        <span className="w-[1.5em] h-[1.5em]" />
      </div>
    )
  }

  // Normalize current theme to one of the three cycle states (system → treat as dark)
  const current: ThemeValue = (CYCLE as readonly string[]).includes(theme ?? '')
    ? (theme as ThemeValue)
    : 'dark'

  const next = CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length]

  const isLight = current === 'light'
  const isDark = current === 'dark'
  const isRiso = current === 'theme-riso'

  return (
    <button
      onClick={() => setTheme(next)}
      className={`${BOX} text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
      aria-label={`Theme: ${LABEL[current]}. Switch to ${LABEL[next]}.`}
      title={`Theme: ${LABEL[current]} — click for ${LABEL[next]}`}
      type="button"
    >
      {/* Sun — light */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={`[grid-area:1/1] w-[1.5em] h-[1.5em] transition-[opacity,transform] ${
          isLight ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-90 opacity-0'
        }`}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
        />
      </svg>

      {/* Moon — dark */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={`[grid-area:1/1] w-[1.5em] h-[1.5em] transition-[opacity,transform] ${
          isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 rotate-90 opacity-0'
        }`}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
        />
      </svg>

      {/* Zap — risograph */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 24 24"
        className={`[grid-area:1/1] w-[1.5em] h-[1.5em] transition-[opacity,transform] ${
          isRiso ? 'scale-100 rotate-0 opacity-100' : 'scale-0 rotate-90 opacity-0'
        }`}
        aria-hidden="true"
      >
        <path d="M13 2L4.09 12.97a.75.75 0 00.58 1.23H10l-1 7.8 8.91-10.97a.75.75 0 00-.58-1.23H12l1-7.8z" />
      </svg>
    </button>
  )
}
