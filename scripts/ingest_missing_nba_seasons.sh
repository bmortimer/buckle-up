#!/bin/bash
# Ingest the 7 missing NBA seasons (1976-77 through 1982-83)
# These seasons are between the ABA-NBA merger and when the NBA API data starts

set -e

echo "Ingesting missing NBA seasons from Basketball-Reference..."
echo "This will take about 1-2 minutes per season to be respectful to their servers."
echo ""

seasons=(
  "1976-77"
  "1977-78"
  "1978-79"
  "1979-80"
  "1980-81"
  "1981-82"
  "1982-83"
)

for season in "${seasons[@]}"; do
  echo ""
  echo "========================================"
  echo "Ingesting season: $season"
  echo "========================================"
  python3 scripts/ingest_nba_bball_ref.py --season "$season"

  echo ""
  echo "Waiting 30 seconds before next season to be respectful..."
  sleep 30
done

echo ""
echo "========================================"
echo "✓ All 7 missing seasons have been ingested!"
echo "========================================"
