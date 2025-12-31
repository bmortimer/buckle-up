# Buckle Up - Championship Belt Tracker

Track the lineal championship belt across NBA and WNBA seasons.

## Concept

The lineal championship belt starts with the defending champion at the beginning of each season. When the belt holder loses a game, the belt passes to the winning team. This continues throughout the season, tracking which team holds the "belt" at any given time.

## Architecture

**Hybrid Python + TypeScript:**
- **Python scripts** - Data ingestion only (run once per season)
- **TypeScript** - Belt tracking, visualization, and analysis

## Setup

### Python (for data ingestion)
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### TypeScript (for tracking and visualization)
```bash
npm install
```

## Usage

### 1. Ingest season data
```bash
# Fetch 2012-13 NBA season
python scripts/ingest_nba.py --season 2012-13

# Fetch 2024 WNBA season
python scripts/ingest_wnba.py --season 2024
```

### 2. Track the belt
```bash
# Track belt for a season
npm run track -- --league nba --season 2012-13 --champion MIA
```

### 3. Visualize
```bash
# Generate visualizations
npm run track -- --league nba --season 2012-13 --champion MIA --visualize
```

## Data Format

Season data is stored as JSON in `data/{league}/{season}.json`:

```json
{
  "season": "2012-13",
  "league": "NBA",
  "games": [
    {
      "date": "2012-10-30",
      "homeTeam": "BOS",
      "awayTeam": "MIA",
      "homeScore": 107,
      "awayScore": 120
    }
  ]
}
```

## Development

- Old code archived in `old_code/`
- Python virtual environment: `.venv/`
- TypeScript source: `src/`
- Ingested data: `data/`
