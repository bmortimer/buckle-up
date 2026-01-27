#!/usr/bin/env python3
"""
NHL Data Update Script for GitHub Actions

This script is designed to run in GitHub Actions to update NHL data automatically.
It fetches the current season's data and updates the local JSON file.

The script includes:
- Automatic season detection based on current date
- Exponential backoff retry logic for reliability
- Rate limiting to be a responsible citizen when hitting hockey-reference.com
- Proper error handling for CI/CD environments

Usage:
    python scripts/update_nhl.py
"""

import sys
import time
from datetime import datetime
from pathlib import Path
from functools import wraps

# Import the existing ingestion logic
from ingest_nhl import (
    fetch_season_html,
    parse_season_schedule,
    save_season_data,
    parse_season_arg
)


def retry_with_backoff(max_attempts=3, initial_delay=5):
    """
    Decorator to retry a function with exponential backoff.

    This ensures we're being a responsible citizen when hitting hockey-reference.com
    by gradually increasing wait times between retries.

    Args:
        max_attempts: Maximum number of retry attempts
        initial_delay: Initial delay in seconds (doubles each retry)
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            attempt = 1
            delay = initial_delay

            while attempt <= max_attempts:
                try:
                    # Add a small delay before each request to be respectful
                    if attempt > 1:
                        print(f"Waiting {delay}s before retry {attempt}/{max_attempts}...")
                        time.sleep(delay)

                    return func(*args, **kwargs)

                except Exception as e:
                    error_msg = str(e).lower()

                    # Check if it's a retriable error
                    is_retriable = any(keyword in error_msg for keyword in [
                        'timeout', 'timed out', 'connection', 'temporary'
                    ])

                    if is_retriable and attempt < max_attempts:
                        print(f"Retriable error on attempt {attempt}/{max_attempts}: {e}")
                        delay *= 2  # Exponential backoff
                        attempt += 1
                    else:
                        if attempt >= max_attempts:
                            print(f"Failed after {max_attempts} attempts")
                        raise

        return wrapper
    return decorator


@retry_with_backoff(max_attempts=3, initial_delay=5)
def fetch_current_season():
    """
    Fetch the current NHL season with retry logic.

    Returns:
        Tuple of (season_str, games_list)
    """
    # Determine current season based on date
    # NHL seasons run from October to April/June
    # Oct-Dec: current year is start year (e.g., Oct 2025 = 2025-26)
    # Jan-Sep: previous year is start year (e.g., Jan 2026 = 2025-26)

    now = datetime.now()
    current_month = now.month
    current_year = now.year

    if current_month >= 10:
        # October or later - season just started this year
        start_year = current_year
    else:
        # Before October - season started last year
        start_year = current_year - 1

    end_year = start_year + 1
    season = f"{start_year}-{str(end_year)[-2:]}"

    print(f"Fetching current NHL season: {season}")

    # Validate season format
    season = parse_season_arg(season)

    # Fetch and parse the data
    html = fetch_season_html(season)
    if not html:
        raise Exception(f"Failed to fetch season data for {season}")

    games = parse_season_schedule(html, season)
    if not games:
        raise Exception(f"No games found for {season}")

    return season, games


def main():
    """
    Main function for updating NHL data.

    Exit codes:
        0: Success
        1: General error
        2: No changes (data already up to date)
    """
    try:
        print("=" * 60)
        print("NHL Data Update Script")
        print(f"Run time: {datetime.now().isoformat()}")
        print("=" * 60)

        # Fetch current season
        season, games = fetch_current_season()

        # Check if we already have this data
        data_dir = Path(__file__).parent.parent / 'data' / 'nhl'
        output_file = data_dir / f'{season}.json'

        if output_file.exists():
            import json
            with open(output_file, 'r') as f:
                existing_data = json.load(f)

            existing_games = len(existing_data.get('games', []))
            new_games = len(games)

            if existing_games == new_games:
                print(f"\nNo changes detected ({existing_games} games)")
                print("Data is already up to date")
                return 0
            else:
                print(f"\nChanges detected:")
                print(f"  Existing: {existing_games} games")
                print(f"  New:      {new_games} games")
                print(f"  Delta:    {new_games - existing_games:+d} games")

        # Save the data
        save_season_data('nhl', season, games)

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
