# Buckle Up - Championship Belt Tracker

Track the lineal championship belt across NBA, WNBA, NHL, and PWHL seasons.

Live at: **[whohasthebelt.com](https://whohasthebelt.com)** (also [buckle-up.vercel.app](https://buckle-up.vercel.app))

## Concept

The lineal championship belt starts with the defending champion at the beginning of each season. When the belt holder loses a game, the belt passes to the winning team. This continues throughout the season, tracking which team holds the "belt" at any given time.

## Architecture

**Next.js Web App + Python Data Ingestion:**
- **Python scripts** - Data ingestion from sports APIs (scheduled via GitHub Actions)
- **Next.js (TypeScript)** - Static web app with client-side belt tracking and visualization
- **Deployment** - Vercel (auto-deploys on data updates)

## Project Structure

```
buckle-up/
├── web/                    # Next.js web application
│   ├── app/               # Next.js app router pages
│   ├── components/        # React components
│   ├── lib/               # Belt tracking logic, types, utilities
│   └── public/            # Static assets (logos, favicons)
├── data/                  # Game data (JSON files)
│   ├── nba/              # NBA seasons (1976-77 to present)
│   ├── wnba/             # WNBA seasons (1997 to present)
│   ├── nhl/              # NHL seasons (1942-43 to present)
│   └── pwhl/             # PWHL seasons (2023-24 to present)
└── scripts/              # Python data ingestion scripts
```

## Setup

### Web App Development
```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Python (for data ingestion)
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Data Ingestion

### Manual Update
```bash
# Fetch current NBA season
python scripts/ingest_nba.py

# Fetch current WNBA season
python scripts/ingest_wnba.py

# Fetch current NHL season
python scripts/ingest_nhl.py

# Fetch current PWHL season
python scripts/ingest_pwhl.py
```

### Automated Updates
Data is automatically updated nightly at 6:30 AM ET via GitHub Actions. See `.github/workflows/update-data.yml`.

## Data Format

Season data is stored as JSON in `data/{league}/{season}.json`:

```json
{
  "season": "2024-25",
  "league": "NBA",
  "games": [
    {
      "date": "2024-10-30",
      "homeTeam": "BOS",
      "awayTeam": "MIA",
      "homeScore": 107,
      "awayScore": 120,
      "isPlayoffs": false
    }
  ]
}
```

Team franchise data (for handling relocations/rebranding) is in `data/{league}/franchises.csv`.

## Development

### Running Tests
```bash
cd web
npm test              # Run tests in watch mode
npm run test:run      # Run tests once
```

The project has 174 tests covering:
- Belt tracking logic (ties, streaks, franchise lineage)
- Data filtering (All Time mode, year ranges, team selection)
- Franchise handling (relocations, historical teams)
- League health checks (data validation)

### Tech Stack
- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Testing**: Vitest
- **Deployment**: Vercel (static export)
- **CI/CD**: GitHub Actions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for any new functionality
4. Submit a pull request

## License

MIT
