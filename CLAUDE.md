# Buckle Up - Championship Belt Tracker

## Project Overview

Lineal championship belt tracker for NBA, WNBA, NHL, and PWHL. Live at [whohasthebelt.com](https://whohasthebelt.com).

The belt starts with the defending champion each season. When the holder loses, the belt passes to the winner. Ties retain the belt.

## Architecture

- **`web/`** - Next.js 16 static export (App Router, React 19, TypeScript, Tailwind CSS)
- **`scripts/`** - Python data ingestion (scraping + API calls, run nightly via GitHub Actions)
- **`data/`** - JSON game data and franchise CSV files per league

## Key Commands

```bash
# Web development
cd web && npm install && npm run dev    # Dev server at localhost:3000
npm test                                # Vitest watch mode
npm run test:run                        # Single test run (also runs as pre-commit hook)
npm run test:coverage                   # Coverage report

# Python data ingestion
python scripts/update_nba.py            # Update current NBA season
python scripts/update_nhl.py            # Update current NHL season
python scripts/update_wnba.py           # Update current WNBA season
python scripts/update_pwhl.py           # Update current PWHL season
```

## Code Structure

### Core Logic (`web/lib/`)

- **`beltTracker.ts`** - `BeltTracker` class and `trackAllSeasons()`. Processes games in order; if the holder loses, belt passes to winner. Resets belt to champion at each season start.
- **`dataLoader.ts`** - Server-side file I/O for loading season JSON, franchises CSV, and champions data.
- **`franchises.ts`** - Franchise lineage resolution. Walks `successorFranchiseId` chains so relocated/rebranded teams (e.g., WSB → WAS) are treated as the same franchise. Uses WeakMap memoization.
- **`seasonConfig.ts`** - **Must be manually updated each season.** Hardcoded `currentYear` and `isInSeason` per league. Controls UI default state.
- **`types.ts`** - All TypeScript types (`League`, `Game`, `SeasonData`, `BeltChange`, etc.)
- **`streakCalculator.ts`** - Consecutive win streak calculation across season boundaries.
- **`calendarDayClassifier.ts`** - Pure function mapping calendar days to display classifications.
- **`scheduleBreaks.ts`** - Known schedule interruptions (Olympics, COVID, lockout) per league.

### Components (`web/components/`)

`BeltDashboard.tsx` is the central component for each league page. It has four UI contexts:
- `THIS_YEAR` - current in-progress season
- `PAST_YEAR` - single completed historical season
- `OFF_SEASON` - league is off
- `TEAM` - team is selected (shows team-specific views)

### Data Format

Season files (`data/{league}/{season}.json`):
```json
{
  "season": "2024-25",
  "league": "NHL",
  "games": [
    { "date": "2024-10-08", "homeTeam": "BOS", "awayTeam": "FLA", "homeScore": 4, "awayScore": 3 }
  ]
}
```
- `null` scores = future scheduled games (not yet played)
- `champions.json` per league maps season → previous year's champion (belt starter)
- `franchises.csv` per league defines team abbreviations, lineage, colors, and status

### Tests (`web/lib/__tests__/`)

Tests use Vitest with jsdom. Fixtures in `__tests__/fixtures/`. Pre-commit hook runs all tests via Husky.

Key test files: `beltTracker.test.ts`, `franchises.test.ts`, `data-filtering.test.ts`, `league-health.test.ts` (validates live data integrity), `calendarDayClassifier.test.ts`, `streakCalculator.test.ts`.

## Conventions

- All new features should have tests
- Belt logic lives in `web/lib/`, UI in `web/components/`
- League pages follow a pattern: server component loads data → passes to `BeltDashboard` (sometimes via a thin `*Client.tsx` wrapper)
- Team abbreviations must match between season JSON, franchises CSV, and champions JSON
- Use `isSameFranchise()` when comparing teams across eras, never raw string comparison
- `seasonConfig.ts` requires manual updates at the start/end of each league's season
- Python scripts use rate-limiting delays between requests; GitHub Actions adds 10s delays between scrapers

## Adding a New League
Consider, before you add a new league, if it would be compelling to users.  Sports with insufficient games or unusual scheduling may now translate well for a lineal championship, or may require additional data considerations.

1. Create `data/{league}/` with season JSON files, `franchises.csv`, and `champions.json`
2. Add the league to the `League` union type in `web/lib/types.ts`
3. Add season config in `web/lib/seasonConfig.ts`
4. Create `app/{league}/page.tsx` (server data load) and optionally a `*Client.tsx` wrapper
5. Add league card to `app/HomeClient.tsx`
6. Add nav link in `BeltDashboard.tsx`
7. Add team logos to `web/public/logos/{league}/`
8. Create ingestion + update scripts in `scripts/`
9. Add schedule breaks to `web/lib/scheduleBreaks.ts` if applicable
10. Wire into `.github/workflows/update-data.yml`
11. Add league-health tests in `web/lib/__tests__/league-health.test.ts`

## Deployment

- Vercel static export (`output: 'export'` in next.config.js)
- Auto-deploys on push to main
- Data updates trigger deploy via GitHub Actions commit → push
- Security headers configured in `vercel.json`
