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
            className="text-sm font-mono text-muted-foreground hover:text-primary transition-colors"
          >
            &larr; Back to Belt Tracker
          </Link>
        </nav>

        {/* Header */}
        <header className="mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display tracking-wide uppercase mb-4">
            About the Belt
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground font-body leading-relaxed">
            What if our sports leagues worked a bit more like boxing or wrestling? One belt to rule them all. To become the champion, you have to <em>beat</em> the champion.
          </p>
        </header>

        {/* The Concept */}
        <section className="mb-12">
          <h2 className="text-xl sm:text-2xl font-display tracking-wide uppercase mb-4 text-primary">
            The Concept
          </h2>
          <div className="space-y-4 text-foreground/90 font-body text-base sm:text-lg leading-relaxed">
            <p>
              The lineal championship (a.k.a. Regular-Season Championship Belt) applies the logic of king of the hill to our favorite sports leagues. The result? Hilarity, of course. The Belt adds a little sizzle to meaningless regular season games, where any old Tuesday could be a title bout and bottom-feeding teams have their opportunity to shine.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="text-xl sm:text-2xl font-display tracking-wide uppercase mb-4 text-primary">
            How It Works
          </h2>
          <div className="scoreboard-panel p-6 space-y-4">
            <div className="flex gap-4">
              <div className="text-2xl">1.</div>
              <div>
                <h3 className="font-display text-base uppercase tracking-wide mb-1">Season Start</h3>
                <p className="text-muted-foreground font-body">
                  The previous year's Finals champion begins the season holding the belt.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-2xl">2.</div>
              <div>
                <h3 className="font-display text-base uppercase tracking-wide mb-1">Title Defenses</h3>
                <p className="text-muted-foreground font-body">
                  Every regular season game the belt holder plays is a title defense. Win, and you keep the belt. But&hellip;
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-2xl">3.</div>
              <div>
                <h3 className="font-display text-base uppercase tracking-wide mb-1">Belt Changes</h3>
                <p className="text-muted-foreground font-body">
                  Lose a game, lose the belt. The winner becomes the new lineal champion and must defend it.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-2xl">4.</div>
              <div>
                <h3 className="font-display text-base uppercase tracking-wide mb-1">Season Reset</h3>
                <p className="text-muted-foreground font-body">
                  At the start of each new season, the belt resets to the actual Finals champion, from the year before.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-xl sm:text-2xl font-display tracking-wide uppercase mb-6 text-primary">
            Questions
          </h2>
          <div className="space-y-6">
            <details className="group scoreboard-panel p-4" open>
              <summary className="font-display uppercase tracking-wide cursor-pointer list-none flex justify-between items-center">
                Why only regular season games?
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <div className="mt-4 text-muted-foreground font-body border-t border-border pt-4">
                The playoffs already determine a champion&mdash;that's their job. The belt tracker asks, and answers, a different question entirely.
              </div>
            </details>

            <details className="group scoreboard-panel p-4">
              <summary className="font-display uppercase tracking-wide cursor-pointer list-none flex justify-between items-center">
                What happens if the belt holder misses the playoffs?
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <div className="mt-4 text-muted-foreground font-body border-t border-border pt-4">
                It doesn't matter for the belt! The lineal championship only tracks regular season games. A team could hold the belt at season's end, miss the playoffs entirely, and we'd still reset to the actual Finals champion next season. The belt and the "real" championship are separate things.
              </div>
            </details>

            <details className="group scoreboard-panel p-4">
              <summary className="font-display uppercase tracking-wide cursor-pointer list-none flex justify-between items-center">
                How far back does the data go?
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <div className="mt-4 text-muted-foreground font-body border-t border-border pt-4">
                We track the belt from the WNBA's inaugural 1997 season to present day. The Houston Comets, as the first champions, started 1998 with the belt. Before that, for 1997, we gave the belt to the winner of the league's very first game (the New York Liberty).
              </div>
            </details>

            <details className="group scoreboard-panel p-4">
              <summary className="font-display uppercase tracking-wide cursor-pointer list-none flex justify-between items-center">
                Why the WNBA? Will you bring this to other leagues?
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <div className="mt-4 text-muted-foreground font-body border-t border-border pt-4">
                <p className="mb-3">
                  Why not? The WNBA deserves the same obsessive treatment as every other league and it's a close cousin to the NBA.
                </p>
                <p>
                  If the people demand it, we could bring The Belt to other leagues too but the WNBA felt like a natural place to start.
                </p>
              </div>
            </details>

            <details className="group scoreboard-panel p-4">
              <summary className="font-display uppercase tracking-wide cursor-pointer list-none flex justify-between items-center">
                Where did this idea come from?
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <div className="mt-4 text-muted-foreground font-body border-t border-border pt-4">
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
        <footer className="border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground font-mono">
            Data updates nightly. Built with obsessive attention to detail.
          </p>
          <p className="text-sm text-muted-foreground font-mono mt-2">
            <Link href="/" className="text-primary hover:opacity-80 transition-colors">
              &larr; Back to the Belt Tracker
            </Link>
          </p>
        </footer>
      </article>
    </>
  )
}
