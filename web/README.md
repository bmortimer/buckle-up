# Championship Belt Tracker - Web App

Auto-updating web dashboard for tracking lineal championship belts across NBA and WNBA seasons.

## Features

- 🏀 **Both NBA and WNBA** support
- 📊 **Real-time visualizations**
  - Current belt holder card
  - Bar chart (games held by team)
  - Belt changes timeline
  - Calendar heatmap (coming soon)
- 🌙 **Nightly auto-updates** via GitHub Actions
- ⚡ **Static site** - fast, free hosting on Vercel
- 🎨 **Team colors** from franchise data

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

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/buckle-up)

### Manual Deploy

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `web`
   - **Build Command:** `npm run build`
   - **Output Directory:** (leave default)
6. Deploy!

The site will auto-deploy on every commit to `main`.

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
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/
│   ├── BeltHolderCard.tsx
│   ├── BarChartView.tsx
│   ├── Timeline.tsx
│   └── CalendarHeatmap.tsx
├── lib/
│   ├── types.ts          # TypeScript types
│   ├── beltTracker.ts    # Belt tracking logic
│   ├── dataLoader.ts     # Load JSON files
│   └── franchises.ts     # Team colors & relocations
└── package.json
```

## Environment Variables

None required! Everything runs at build time.

## License

MIT
