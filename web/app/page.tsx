import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Championship Belt Tracker | WNBA & NBA Lineal Title',
  description: 'Track lineal championship belts for WNBA and NBA. Boxing-style title tracking for basketball. Every game is a title defense.',
  alternates: {
    canonical: 'https://whohasthebelt.com'
  },
}

export default function Home() {
  redirect('/wnba')
}
