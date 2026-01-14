import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About | WNBA Belt Tracker',
  description: 'Learn how the WNBA lineal championship belt works. Inspired by Grantland\'s NBA belt tracker, we follow who would hold the title if championships worked like boxing.',
  openGraph: {
    title: 'About the WNBA Belt Tracker',
    description: 'The lineal championship belt works like a boxing title. The defending champion starts each season with the belt. Lose a game? Lose the belt.',
  },
}

// FAQ Schema for rich snippets
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Why only regular season games?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The playoffs already determine a champion—that\'s their job. The belt tracker asks, and answers, a different question entirely.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens if the belt holder misses the playoffs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'It doesn\'t matter for the belt! The lineal championship only tracks regular season games. A team could hold the belt at season\'s end, miss the playoffs entirely, and we\'d still reset to the actual Finals champion next season. The belt and the "real" championship are separate things.',
      },
    },
    {
      '@type': 'Question',
      name: 'How far back does the data go?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We track the belt from the WNBA\'s inaugural 1997 season to present day. The Houston Comets, as the first champions, started 1998 with the belt. Before that, for 1997, we gave the belt to the winner of the league\'s very first game (the New York Liberty).',
      },
    },
    {
      '@type': 'Question',
      name: 'Why the WNBA? Will you bring this to other leagues?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Why not? The WNBA deserves the same obsessive treatment as every other league and it\'s a close cousin to the NBA. If the people demand it, we could bring The Belt to other leagues too but the WNBA felt like a natural place to start.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where did this idea come from?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The lineal championship concept was popularized by Grantland, the late, great sports and pop culture website founded by Bill Simmons. They tracked an NBA lineal championship (https://grantland.com/the-triangle/introducing-the-nba-regular-season-championship-belt/) that made random regular season games feel important. When Grantland shut down in 2015, the belt tracker went with it. The original idea came from a Reddit thread (https://www.reddit.com/r/nba/comments/1pn9t2/can_we_keep_track_of_the_owner_of_the/).',
      },
    },
  ],
}

export default function AboutPage() {
  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <article className="max-w-3xl mx-auto">
        {/* Back link */}
        <nav className="mb-8">
          <Link
            href="/"
            className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
          >
            &larr; Back to Belt Tracker
          </Link>
        </nav>

        {/* Header - Scoreboard Style */}
        <header className="scoreboard-panel p-6 sm:p-8 md:p-10 text-center mb-8 sm:mb-12 relative overflow-hidden">
          {/* Top LED strip */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-60" />

          <div className="text-[0.6rem] sm:text-xs font-orbitron uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground mb-4">
            ◆ About ◆
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display tracking-wide uppercase mb-4 sm:mb-6 led-text" style={{ color: 'hsl(var(--led-amber))' }}>
            The Belt
          </h1>

          <div className="h-0.5 bg-gradient-to-r from-transparent via-border to-transparent mb-4 sm:mb-6" />

          <p className="text-base sm:text-lg text-muted-foreground font-body leading-relaxed max-w-2xl mx-auto">
            What if our sports leagues worked a bit more like boxing or wrestling? One belt to rule them all. To become the champion, you have to <em className="text-foreground">beat</em> the champion.
          </p>
        </header>

        {/* The Concept */}
        <section className="mb-8 sm:mb-12">
          <div className="scoreboard-panel p-5 sm:p-6">
            <div className="text-[0.6rem] sm:text-xs font-orbitron uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground mb-4 text-center border-b border-border pb-3">
              <span aria-hidden="true">◆ </span>
              <h2 className="inline font-normal">The Concept</h2>
              <span aria-hidden="true"> ◆</span>
            </div>
            <div className="text-muted-foreground font-body text-sm sm:text-base leading-relaxed">
              <p>
                The lineal championship (a.k.a. Regular-Season Championship Belt) applies the logic of king of the hill to our favorite sports leagues. The result? Hilarity, of course. The Belt adds a little sizzle to meaningless regular season games, where any old Tuesday could be a title bout and bottom-feeding teams have their opportunity to shine.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-8 sm:mb-12">
          <div className="scoreboard-panel p-5 sm:p-6">
            <div className="text-[0.6rem] sm:text-xs font-orbitron uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground mb-6 text-center border-b border-border pb-3">
              <span aria-hidden="true">◆ </span>
              <h2 className="inline font-normal">How It Works</h2>
              <span aria-hidden="true"> ◆</span>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="text-xl sm:text-2xl font-mono led-text flex-shrink-0 w-8 text-center" style={{ color: 'hsl(var(--led-green))' }}>1</div>
                <div>
                  <h3 className="font-display text-sm uppercase tracking-wide mb-1">Season Start</h3>
                  <p className="text-muted-foreground font-body text-sm">
                    The previous year's Finals champion begins the season holding the belt.
                  </p>
                </div>
              </div>
              <div className="h-px bg-gradient-to-r from-border/50 via-border to-border/50" />
              <div className="flex gap-4 items-start">
                <div className="text-xl sm:text-2xl font-mono led-text flex-shrink-0 w-8 text-center" style={{ color: 'hsl(var(--led-amber))' }}>2</div>
                <div>
                  <h3 className="font-display text-sm uppercase tracking-wide mb-1">Title Defenses</h3>
                  <p className="text-muted-foreground font-body text-sm">
                    Every regular season game the belt holder plays is a title defense. Win, and you keep the belt. But&hellip;
                  </p>
                </div>
              </div>
              <div className="h-px bg-gradient-to-r from-border/50 via-border to-border/50" />
              <div className="flex gap-4 items-start">
                <div className="text-xl sm:text-2xl font-mono led-text flex-shrink-0 w-8 text-center" style={{ color: 'hsl(var(--led-red))' }}>3</div>
                <div>
                  <h3 className="font-display text-sm uppercase tracking-wide mb-1">Belt Changes</h3>
                  <p className="text-muted-foreground font-body text-sm">
                    Lose a game, lose the belt. The winner becomes the new lineal champion and must defend it.
                  </p>
                </div>
              </div>
              <div className="h-px bg-gradient-to-r from-border/50 via-border to-border/50" />
              <div className="flex gap-4 items-start">
                <div className="text-xl sm:text-2xl font-mono led-text flex-shrink-0 w-8 text-center" style={{ color: 'hsl(var(--led-green))' }}>4</div>
                <div>
                  <h3 className="font-display text-sm uppercase tracking-wide mb-1">Season Reset</h3>
                  <p className="text-muted-foreground font-body text-sm">
                    At the start of each new season, the belt resets to the actual Finals champion, from the year before.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-8 sm:mb-12">
          <div className="text-[0.6rem] sm:text-xs font-orbitron uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground mb-6 text-center">
            <span aria-hidden="true">◆ </span>
            <h2 className="inline font-normal">Questions</h2>
            <span aria-hidden="true"> ◆</span>
          </div>
          <div className="space-y-3">
            <details className="group scoreboard-panel" open>
              <summary className="font-display text-sm uppercase tracking-wide cursor-pointer list-none flex justify-between items-center p-4 hover:bg-muted/20 transition-colors">
                Why only regular season games?
                <span className="text-muted-foreground group-open:rotate-180 transition-transform text-xs">&#9662;</span>
              </summary>
              <div className="px-4 pb-4 text-muted-foreground font-body text-sm border-t border-border/40 pt-4 mx-4 mb-0">
                The playoffs already determine a champion&mdash;that's their job. The belt tracker asks, and answers, a different question entirely.
              </div>
            </details>

            <details className="group scoreboard-panel">
              <summary className="font-display text-sm uppercase tracking-wide cursor-pointer list-none flex justify-between items-center p-4 hover:bg-muted/20 transition-colors">
                What happens if the belt holder misses the playoffs?
                <span className="text-muted-foreground group-open:rotate-180 transition-transform text-xs">&#9662;</span>
              </summary>
              <div className="px-4 pb-4 text-muted-foreground font-body text-sm border-t border-border/40 pt-4 mx-4 mb-0">
                It doesn't matter for the belt! The lineal championship only tracks regular season games. A team could hold the belt at season's end, miss the playoffs entirely, and we'd still reset to the actual Finals champion next season. The belt and the "real" championship are separate things.
              </div>
            </details>

            <details className="group scoreboard-panel">
              <summary className="font-display text-sm uppercase tracking-wide cursor-pointer list-none flex justify-between items-center p-4 hover:bg-muted/20 transition-colors">
                How far back does the data go?
                <span className="text-muted-foreground group-open:rotate-180 transition-transform text-xs">&#9662;</span>
              </summary>
              <div className="px-4 pb-4 text-muted-foreground font-body text-sm border-t border-border/40 pt-4 mx-4 mb-0">
                We track the belt from the WNBA's inaugural 1997 season to present day. The Houston Comets, as the first champions, started 1998 with the belt. Before that, for 1997, we gave the belt to the winner of the league's very first game (the New York Liberty).
              </div>
            </details>

            <details className="group scoreboard-panel">
              <summary className="font-display text-sm uppercase tracking-wide cursor-pointer list-none flex justify-between items-center p-4 hover:bg-muted/20 transition-colors">
                Why the WNBA? Will you bring this to other leagues?
                <span className="text-muted-foreground group-open:rotate-180 transition-transform text-xs">&#9662;</span>
              </summary>
              <div className="px-4 pb-4 text-muted-foreground font-body text-sm border-t border-border/40 pt-4 mx-4 mb-0">
                <p className="mb-3">
                  Why not? The WNBA deserves the same obsessive treatment as every other league and it's a close cousin to the NBA.
                </p>
                <p>
                  If the people demand it, we could bring The Belt to other leagues too but the WNBA felt like a natural place to start.
                </p>
              </div>
            </details>

            <details className="group scoreboard-panel">
              <summary className="font-display text-sm uppercase tracking-wide cursor-pointer list-none flex justify-between items-center p-4 hover:bg-muted/20 transition-colors">
                Where did this idea come from?
                <span className="text-muted-foreground group-open:rotate-180 transition-transform text-xs">&#9662;</span>
              </summary>
              <div className="px-4 pb-4 text-muted-foreground font-body text-sm border-t border-border/40 pt-4 mx-4 mb-0">
                <p className="mb-3">
                  The lineal championship concept was conceived in a <a href="https://www.reddit.com/r/nba/comments/1pn9t2/can_we_keep_track_of_the_owner_of_the/" target="_blank" rel="noopener noreferrer" className="text-primary hover:opacity-80 underline">Reddit thread</a> and popularized by <a href="https://grantland.com/the-triangle/introducing-the-nba-regular-season-championship-belt/" target="_blank" rel="noopener noreferrer" className="text-primary hover:opacity-80 underline"><strong>Grantland</strong></a>, the late, great sports and pop culture website founded by Bill Simmons.
                </p>
                <p>
                  When Grantland shut down in 2015, the belt tracker went with it. Occasionally someone pops up and calculates who owns the belt across various leagues but no one has done it consistently...until now.
                </p>
              </div>
            </details>
          </div>
        </section>

        {/* Footer */}
        <footer className="scoreboard-panel p-6 text-center relative overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent" />
          <p className="text-xs text-muted-foreground font-mono tracking-wider uppercase mb-3">
            Data updates nightly at 03:00 ET.
          </p>
          <div className="flex items-center justify-center gap-3 text-xs font-mono uppercase tracking-wider">
            <Link href="/" className="text-primary hover:opacity-80 transition-colors">
              &larr; Back to the Belt Tracker
            </Link>
            <span className="text-muted-foreground">•</span>
            <a href="https://forms.gle/LPBtZDxih1HQT53E9" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400 underline decoration-1 underline-offset-2 transition-colors">
              Feedback
            </a>
          </div>
        </footer>
      </article>
    </>
  )
}
