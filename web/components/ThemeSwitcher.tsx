'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { useSkin } from './SkinProvider'

type Skin = 'default' | 'midnight'

interface ThemeOption {
  id: Skin
  name: string
  description: string
  lightPreview: { bg: string; accent: string; text: string }
  darkPreview: { bg: string; accent: string; text: string }
}

const themes: ThemeOption[] = [
  {
    id: 'default',
    name: 'Court Classic',
    description: 'Hardwood light, Retro dark',
    lightPreview: { bg: '#f0e6d2', accent: '#ea580c', text: '#292018' },
    darkPreview: { bg: '#0a0a0a', accent: '#e63333', text: '#f2f2f2' },
  },
  {
    id: 'midnight',
    name: 'Midnight Court',
    description: 'Clean cards, gold accents',
    lightPreview: { bg: '#f7f8fa', accent: '#e6b800', text: '#172554' },
    darkPreview: { bg: '#0c1424', accent: '#fbbf24', text: '#f0f4f8' },
  },
]

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const { skin, setSkin } = useSkin()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-md border border-border bg-card" aria-hidden="true" />
        <div className="w-9 h-9 rounded-md border border-border bg-card" aria-hidden="true" />
      </div>
    )
  }

  const isDark = theme === 'dark'
  const currentTheme = themes.find(t => t.id === skin) || themes[0]

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <div className="flex items-center gap-2">
      {/* Skin Selector */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-card hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Select theme skin"
          aria-expanded={isOpen}
          type="button"
        >
          {/* Mini preview */}
          <div
            className="w-4 h-4 rounded-sm border border-border overflow-hidden flex"
            style={{
              backgroundColor: isDark ? currentTheme.darkPreview.bg : currentTheme.lightPreview.bg,
            }}
          >
            <div
              className="w-1/2 h-full"
              style={{
                backgroundColor: isDark ? currentTheme.darkPreview.accent : currentTheme.lightPreview.accent,
              }}
            />
          </div>
          <span className="text-xs font-orbitron uppercase tracking-wider hidden sm:inline">
            {currentTheme.name}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute right-0 mt-2 w-64 rounded-md border border-border bg-card shadow-lg z-50 overflow-hidden">
              <div className="p-2 border-b border-border">
                <span className="text-[0.65rem] font-orbitron uppercase tracking-wider text-muted-foreground">
                  Select Theme
                </span>
              </div>
              <div className="p-1">
                {themes.map((option) => {
                  const isSelected = skin === option.id
                  const preview = isDark ? option.darkPreview : option.lightPreview

                  return (
                    <button
                      key={option.id}
                      onClick={() => {
                        setSkin(option.id)
                        setIsOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 p-2 rounded-sm transition-colors ${
                        isSelected
                          ? 'bg-accent/20 text-foreground'
                          : 'hover:bg-muted text-foreground'
                      }`}
                      type="button"
                    >
                      {/* Preview swatch showing both light and dark */}
                      <div className="flex-shrink-0 w-10 h-10 rounded border border-border overflow-hidden flex">
                        {/* Light half */}
                        <div
                          className="w-1/2 h-full flex flex-col"
                          style={{ backgroundColor: option.lightPreview.bg }}
                        >
                          <div
                            className="h-1/2"
                            style={{ backgroundColor: option.lightPreview.accent }}
                          />
                          <div
                            className="h-1/2 flex items-center justify-center"
                          >
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: option.lightPreview.text }}
                            />
                          </div>
                        </div>
                        {/* Dark half */}
                        <div
                          className="w-1/2 h-full flex flex-col"
                          style={{ backgroundColor: option.darkPreview.bg }}
                        >
                          <div
                            className="h-1/2"
                            style={{ backgroundColor: option.darkPreview.accent }}
                          />
                          <div
                            className="h-1/2 flex items-center justify-center"
                          >
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: option.darkPreview.text }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Text */}
                      <div className="flex-1 text-left">
                        <div className="text-sm font-orbitron uppercase tracking-wide flex items-center gap-2">
                          {option.name}
                          {isSelected && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="w-4 h-4 text-accent"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="text-[0.65rem] text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Light/Dark Toggle */}
      <button
        onClick={toggleTheme}
        className="relative w-9 h-9 rounded-md border border-border bg-card hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        type="button"
      >
        {/* Sun icon (light mode) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`absolute inset-0 m-auto w-5 h-5 transition-all ${
            isDark ? 'scale-0 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'
          }`}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
          />
        </svg>

        {/* Moon icon (dark mode) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`absolute inset-0 m-auto w-5 h-5 transition-all ${
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
      </button>
    </div>
  )
}
