import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Orbitron, Share_Tech_Mono } from 'next/font/google'

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
})

const shareTechMono = Share_Tech_Mono({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-share-tech',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Championship Belt Tracker',
  description: 'Track the lineal championship belt across NBA and WNBA seasons',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`min-h-screen bg-background text-foreground transition-colors ${orbitron.variable} ${shareTechMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
