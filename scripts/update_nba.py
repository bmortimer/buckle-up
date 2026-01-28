#!/usr/bin/env python3
"""
NBA Data Update Script for GitHub Actions

This script is designed to run in GitHub Actions to update NBA data automatically.
It fetches the current season's data and updates the local JSON file.

The script includes:
- Automatic season detection based on current date
- Change detection to only update sitemap when data changes
- Proper error handling for CI/CD environments

Usage:
    python scripts/update_nba.py
"""

import sys
import json
from datetime import datetime
from pathlib import Path


def get_current_season() -> str:
    """
    Determine the current NBA season based on the current date.

    Returns:
        Season string in format 'YYYY-YY' (e.g., '2025-26')
    """
    now = datetime.now()
    current_month = now.month
    current_year = now.year

    # NBA season runs Oct-June across two calendar years
    # Oct-Dec: season started this year (e.g., Oct 2025 = 2025-26)
    # Jan-Sep: season started last year (e.g., Jan 2026 = 2025-26)
    if current_month >= 10:
        start_year = current_year
    else:
        start_year = current_year - 1

    end_year = start_year + 1
    season = f"{start_year}-{str(end_year)[-2:]}"

    return season


def main():
    """
    Main function for updating NBA data.

    Exit codes:
        0: Success (data updated)
        1: General error
        2: No changes (data already up to date)
    """
    try:
        print("=" * 60)
        print("NBA Data Update Script")
        print(f"Run time: {datetime.now().isoformat()}")
        print("=" * 60)

        # Determine current season
        season = get_current_season()
        print(f"Current NBA season: {season}")

        # Check if we have existing data
        data_dir = Path(__file__).parent.parent / 'data' / 'nba'
        output_file = data_dir / f'{season}.json'

        existing_data = None
        if output_file.exists():
            with open(output_file, 'r') as f:
                existing_data = json.load(f)

        # Run the ingestion script
        import subprocess
        result = subprocess.run(
            ['python3', str(Path(__file__).parent / 'ingest_nba.py'), '--season', season],
            capture_output=True,
            text=True,
            timeout=300
        )

        if result.returncode != 0:
            print(f"Error running ingestion script:")
            print(result.stderr)
            return 1

        print(result.stdout)

        # Check if data changed
        if output_file.exists():
            with open(output_file, 'r') as f:
                new_data = json.load(f)

            if existing_data:
                # Compare game data
                existing_games = existing_data.get('games', [])
                new_games = new_data.get('games', [])

                existing_json = json.dumps(existing_games, sort_keys=True)
                new_json = json.dumps(new_games, sort_keys=True)

                if existing_json == new_json:
                    print(f"\nNo changes detected ({len(existing_games)} games)")
                    print("Data is already up to date")
                    return 0
                else:
                    # Count changes
                    existing_completed = sum(1 for g in existing_games if g.get('homeScore') is not None)
                    new_completed = sum(1 for g in new_games if g.get('homeScore') is not None)

                    print(f"\nChanges detected:")
                    print(f"  Total games:      {len(existing_games)} → {len(new_games)} ({len(new_games) - len(existing_games):+d})")
                    print(f"  Completed games:  {existing_completed} → {new_completed} ({new_completed - existing_completed:+d})")

            # Update sitemap lastmod date since we changed NBA data
            try:
                result = subprocess.run(
                    ['python3', str(Path(__file__).parent / 'update_sitemap.py'), '--league', 'nba'],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                if result.returncode == 0:
                    print(f"  {result.stdout.strip()}")
                else:
                    print(f"  Warning: Failed to update sitemap: {result.stderr}")
            except Exception as e:
                print(f"  Warning: Failed to update sitemap: {e}")

        print("\n" + "=" * 60)
        print("✓ Update completed successfully")
        print("=" * 60)

        return 0

    except Exception as e:
        print(f"\n✗ Error during update: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())
