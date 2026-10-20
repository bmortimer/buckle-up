// Generates lib/logoManifest.json from the files in public/logos/{league}/.
// TeamLogo uses it to know which teams have a logo and in which format, so
// adding a logo is just dropping the file in and running `npm run logos`
// (also runs automatically before dev/build; a test fails if it's stale).
import { readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const webDir = join(dirname(fileURLToPath(import.meta.url)), '..')

/** @returns {Record<string, Record<string, 'svg' | 'png'>>} */
export function buildLogoManifest(logosDir = join(webDir, 'public/logos')) {
  const manifest = {}
  for (const league of readdirSync(logosDir).sort()) {
    const leagueDir = join(logosDir, league)
    if (!statSync(leagueDir).isDirectory()) continue
    const teams = {}
    for (const file of readdirSync(leagueDir).sort()) {
      const match = file.match(/^([A-Z0-9]+)\.(svg|png)$/)
      if (!match) continue // skips subdirectories such as backups
      const [, team, ext] = match
      if (teams[team]) {
        throw new Error(
          `${league}/${team} has both .${teams[team]} and .${ext}; keep one (move the other to a backup folder)`
        )
      }
      teams[team] = ext
    }
    manifest[league] = teams
  }
  return manifest
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = join(webDir, 'lib/logoManifest.json')
  writeFileSync(out, JSON.stringify(buildLogoManifest(), null, 2) + '\n')
  console.log(`Wrote ${out}`)
}
