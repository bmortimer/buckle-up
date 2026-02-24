#!/usr/bin/env python3
"""
PWHL Data Update Script for GitHub Actions

This script is designed to run in GitHub Actions to update PWHL data automatically.
It fetches the current season's data and updates the local JSON file.

The script includes:
- Automatic season detection based on current date
- Exponential backoff retry logic for reliability
- Rate limiting to be a responsible citizen when hitting HockeyTech API
- Proper error handling for CI/CD environments
- NO sitemap updates during dark launch phase

Usage:
    python scripts/update_pwhl.py
"""

import sys
import time
from datetime import datetime
from pathlib import Path
from functools import wraps

# Import the existing ingestion logic
from ingest_pwhl import (
    fetch_season_games,
    parse_games,
    save_season_data,
    parse_season_arg
)


def retry_with_backoff(max_attempts=3, initial_delay=5):
    """
    Decorator to retry a function with exponential backoff.

    This ensures we're being a responsible citizen when hitting the HockeyTech API
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
    Fetch the current PWHL season with retry logic.

    Returns:
        Tuple of (season_str, games_list)
    """
    # Determine current season based on date
    # PWHL seasons run from November to May
    # Nov-Dec: current year is start year (e.g., Nov 2025 = 2025-26)
    # Jan-Oct: previous year is start year (e.g., Jan 2026 = 2025-26)

    now = datetime.now()
    current_month = now.month
    current_year = now.year

    if current_month >= 11:
        # November or December - season just started this year
        start_year = current_year
    else:
        # Before November - season started last year
        start_year = current_year - 1

    end_year = start_year + 1
    season = f"{start_year}-{str(end_year)[-2:]}"

    print(f"Fetching current PWHL season: {season}")

    # Validate season format
    season = parse_season_arg(season)

    # Fetch and parse the data
    raw_games = fetch_season_games(season)
    if not raw_games:
        raise Exception(f"Failed to fetch season data for {season}")

    games = parse_games(raw_games, season)
    if not games:
        raise Exception(f"No games found for {season}")

    return season, games


def main():
    """
    Main function for updating PWHL data.

    Exit codes:
        0: Success
        1: General error
        2: No changes (data already up to date)
    """
    try:
        print("=" * 60)
        print("PWHL Data Update Script (Dark Launch)")
        print(f"Run time: {datetime.now().isoformat()}")
        print("=" * 60)

        # Fetch current season
        season, games = fetch_current_season()

        # Check if we already have this data
        data_dir = Path(__file__).parent.parent / 'data' / 'pwhl'
        output_file = data_dir / f'{season}.json'

        if output_file.exists():
            import json
            with open(output_file, 'r') as f:
                existing_data = json.load(f)

            existing_games = existing_data.get('games', [])
            new_games_count = len(games)
            existing_games_count = len(existing_games)

            # Compare actual game data to detect score updates
            # Convert to JSON strings for comparison (excluding metadata)
            existing_json = json.dumps(existing_games, sort_keys=True)
            new_json = json.dumps(games, sort_keys=True)

            if existing_json == new_json:
                print(f"\nNo changes detected ({existing_games_count} games)")
                print("Data is already up to date")
                return 0
            else:
                # Count score changes
                existing_completed = sum(1 for g in existing_games if g.get('homeScore') is not None)
                new_completed = sum(1 for g in games if g.get('homeScore') is not None)

                print(f"\nChanges detected:")
                print(f"  Total games:      {existing_games_count} -> {new_games_count} ({new_games_count - existing_games_count:+d})")
                print(f"  Completed games:  {existing_completed} -> {new_completed} ({new_completed - existing_completed:+d})")
                print(f"  Scheduled games:  {existing_games_count - existing_completed} -> {new_games_count - new_completed}")

        # Save the data
        save_season_data('pwhl', season, games)

        # NOTE: During dark launch, we do NOT update the sitemap
        # Uncomment this section when ready for public launch:
        #
        # try:
        #     import subprocess
        #     result = subprocess.run(
        #         ['python3', str(Path(__file__).parent / 'update_sitemap.py'), '--league', 'pwhl'],
        #         capture_output=True,
        #         text=True,
        #         timeout=10
        #     )
        #     if result.returncode == 0:
        #         print(f"  {result.stdout.strip()}")
        #     else:
        #         print(f"  Warning: Failed to update sitemap: {result.stderr}")
        # except Exception as e:
        #     print(f"  Warning: Failed to update sitemap: {e}")

        print("\n" + "=" * 60)
        print("✓ Update completed successfully (dark launch - no sitemap update)")
        print("=" * 60)

        return 0

    except Exception as e:
        print(f"\n✗ Error during update: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())
