# Championship Belt Tracker - Web App

Auto-updating web dashboard for tracking lineal championship belts across NBA, WNBA, and NHL seasons.

## Features

- 🏀 🏒 **NBA, WNBA, and NHL** support
- 📊 **Interactive visualizations**
  - Current belt holder card with live stats
  - Next game preview (for current seasons)
  - Bar chart (games/wins/streaks by team)
  - Last 5 belt changes timeline
  - Detailed calendar view (monthly breakdown)
  - Team-specific belt calendars
- 🎯 **Powerful filtering**
  - All Time view or single season
  - Team selection with franchise lineage support
  - Year range slider
- 🌙 **Nightly auto-updates** via GitHub Actions (05:00 ET)
- ⚡ **Static site** - blazing fast, free hosting on Vercel
- 🎨 **Official team colors and logos**
- 🌓 **Dark/light mode** with retro LED scoreboard aesthetic

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

See [DEPLOY.md](../DEPLOY.md) in the root directory for full deployment instructions.

**Quick summary:**
- Framework: Next.js (static export)
- Root Directory: `./` (project root, not `web`)
- Build Command: `cd web && npm run build`
- Output Directory: `web/out`

The site auto-deploys on every commit to `main`.

## How It Works

1. **Data Ingestion** (Python scripts)
   - Runs nightly via GitHub Actions at 5 AM ET
   - Fetches latest games for current NBA/WNBA seasons
   - Saves to `data/` directory as JSON

2. **Static Generation** (Next.js)
   - Loads JSON files at build time
   - Tracks belt through games (client-side)
   - Generates static HTML pages

3. **Auto-Deploy** (Vercel)
   - Detects commits to `main` branch
   - Rebuilds and deploys automatically
   - New data visible within minutes

## Project Structure

```
web/
├── app/
│   ├── layout.tsx           # Root layout with metadata
│   ├── page.tsx             # Landing page (league selector)
│   ├── about/               # About page
│   ├── nba/                 # NBA belt tracker
│   ├── wnba/                # WNBA belt tracker
│   └── nhl/                 # NHL belt tracker
├── components/
│   ├── BeltDashboard.tsx    # Main dashboard orchestrator
│   ├── BeltHolderCard.tsx   # Current belt holder display
│   ├── TeamBeltCard.tsx     # Team-specific view
│   ├── BarChartView.tsx     # Games/wins/streaks chart
│   ├── Last5BeltChanges.tsx # Recent belt changes
│   ├── DetailedCalendar.tsx # Monthly calendar view
│   ├── BeltCalendar.tsx     # Team-specific calendar
│   ├── NextGamePreview.tsx  # Upcoming game info
│   ├── TeamLogo.tsx         # Logo component
│   └── ThemeSwitcher.tsx    # Dark/light mode toggle
├── lib/
│   ├── types.ts             # TypeScript types
│   ├── beltTracker.ts       # Belt tracking algorithm
│   ├── dataLoader.ts        # Load season JSON files
│   ├── franchises.ts        # Team colors & lineage
│   ├── seasonConfig.ts      # Season-specific configs
│   └── __tests__/           # Vitest test suite (86 tests)
├── public/
│   ├── logos/               # Team logos (NBA/WNBA/NHL)
│   └── *.png                # Favicons
└── package.json
```

## Testing

```bash
npm test              # Run tests in watch mode
npm run test:run      # Run all tests once
```

**Test Coverage:**
- 86 tests across 4 test suites
- Belt tracking (ties, streaks, franchise handling)
- Data filtering (All Time mode, team selection)
- Franchise lineage (relocations, rebranding)
- League health checks

## Environment Variables

None required! Everything runs at build time.

## License

MIT
