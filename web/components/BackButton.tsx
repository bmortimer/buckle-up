'use client'

import { useRouter } from 'next/navigation'

interface BackButtonProps {
  className?: string
  children: React.ReactNode
}

export default function BackButton({ className, children }: BackButtonProps) {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    // Check if there's history to go back to
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      // Fallback to home page
      router.push('/')
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      aria-label="Go back to previous page or home"
    >
      {children}
    </button>
  )
}
