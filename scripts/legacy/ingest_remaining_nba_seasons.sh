#!/bin/bash
# Ingest the remaining NBA seasons that weren't completed due to rate limiting

set -e

echo "Ingesting remaining NBA seasons from Basketball-Reference..."
echo "Using longer delays to avoid rate limiting."
echo ""

# Only include seasons that failed or were incomplete
seasons=(
  "1979-80"  # Was incomplete (missing last 3 months)
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
echo "✓ All remaining seasons have been ingested!"
echo "========================================"
