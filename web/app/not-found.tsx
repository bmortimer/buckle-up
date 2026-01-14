import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="scoreboard-panel p-8 sm:p-12 text-center max-w-md">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-60" />

        <div
          className="text-6xl sm:text-8xl font-mono tracking-[0.2em] led-text mb-4"
          style={{ color: 'hsl(var(--led-red))' }}
        >
          404
        </div>

        <div className="text-xs sm:text-sm font-orbitron uppercase tracking-[0.2em] text-muted-foreground mb-6">
          Page Not Found
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6" />

        <p className="text-sm text-muted-foreground mb-6 font-body">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Link
          href="/"
          className="inline-block px-6 py-2 border border-amber-500/50 text-amber-500 font-orbitron text-xs uppercase tracking-wider hover:bg-amber-500/10 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}
