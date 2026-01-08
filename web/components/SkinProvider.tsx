'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type Skin = 'default' | 'midnight'

interface SkinContextType {
  skin: Skin
  setSkin: (skin: Skin) => void
}

const SkinContext = createContext<SkinContextType | undefined>(undefined)

const SKIN_STORAGE_KEY = 'belt-tracker-skin'

export function SkinProvider({ children }: { children: React.ReactNode }) {
  const [skin, setSkinState] = useState<Skin>('default')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Load saved skin from localStorage
    const savedSkin = localStorage.getItem(SKIN_STORAGE_KEY)
    // Migrate old values to new schema
    if (savedSkin === 'retro' || savedSkin === 'hardwood') {
      localStorage.setItem(SKIN_STORAGE_KEY, 'default')
      setSkinState('default')
      document.documentElement.removeAttribute('data-skin')
    } else if (savedSkin === 'midnight') {
      setSkinState('midnight')
      document.documentElement.setAttribute('data-skin', 'midnight')
    } else {
      // Default - no attribute needed
      document.documentElement.removeAttribute('data-skin')
    }
    setMounted(true)
  }, [])

  const setSkin = useCallback((newSkin: Skin) => {
    setSkinState(newSkin)
    localStorage.setItem(SKIN_STORAGE_KEY, newSkin)
    // Only set attribute for midnight, remove for default
    if (newSkin === 'midnight') {
      document.documentElement.setAttribute('data-skin', 'midnight')
    } else {
      document.documentElement.removeAttribute('data-skin')
    }
  }, [])

  // Always provide the context, even before mount (with default values)
  return (
    <SkinContext.Provider value={{ skin, setSkin }}>
      {children}
    </SkinContext.Provider>
  )
}

export function useSkin() {
  const context = useContext(SkinContext)
  if (context === undefined) {
    throw new Error('useSkin must be used within a SkinProvider')
  }
  return context
}
