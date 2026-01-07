'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type Skin = 'retro' | 'midnight' | 'hardwood'

interface SkinContextType {
  skin: Skin
  setSkin: (skin: Skin) => void
}

const SkinContext = createContext<SkinContextType | undefined>(undefined)

const SKIN_STORAGE_KEY = 'belt-tracker-skin'

export function SkinProvider({ children }: { children: React.ReactNode }) {
  const [skin, setSkinState] = useState<Skin>('retro')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Load saved skin from localStorage
    const savedSkin = localStorage.getItem(SKIN_STORAGE_KEY) as Skin | null
    if (savedSkin && ['retro', 'midnight', 'hardwood'].includes(savedSkin)) {
      setSkinState(savedSkin)
      // Set on html element (same as next-themes dark class)
      document.documentElement.setAttribute('data-skin', savedSkin)
    }
    setMounted(true)
  }, [])

  const setSkin = useCallback((newSkin: Skin) => {
    setSkinState(newSkin)
    localStorage.setItem(SKIN_STORAGE_KEY, newSkin)
    // Set on html element (same as next-themes dark class)
    document.documentElement.setAttribute('data-skin', newSkin)
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
