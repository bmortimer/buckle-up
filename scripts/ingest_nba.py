#!/usr/bin/env python3
"""
NBA Season Data Ingestion Script

Fetches all games for a given NBA season and saves them as JSON.
Uses the nba_api library to access stats.nba.com data.

For current/active seasons, uses ScheduleLeagueV2 to get both completed
games (with scores) and upcoming scheduled games (without scores).

For historical seasons, uses LeagueGameFinder for completed games only.

Usage:
    python scripts/ingest_nba.py --season 2012-13
    python scripts/ingest_nba.py --season 2024-25
"""

import argparse
import json
from pathlib import Path
from datetime import datetime
from nba_api.stats.endpoints import leaguegamefinder, scheduleleaguev2
from nba_api.stats.library.http import NBAStatsHTTP
import time
from functools import wraps

# Configure browser-like headers to avoid being blocked by NBA API
# These headers make the requests look like they're coming from a real browser
NBAStatsHTTP.headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Referer': 'https://www.nba.com/',
    'Origin': 'https://www.nba.com',
    'x-nba-stats-origin': 'stats',
    'x-nba-stats-token': 'true',
}


def retry_on_timeout(max_attempts=3, delay=5):
    """
    Decorator to retry a function if it times out.

    Args:
        max_attempts: Maximum number of retry attempts
        delay: Seconds to wait between retries (doubles each time)
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            attempt = 1
            current_delay = delay

            while attempt <= max_attempts:
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if 'timeout' in str(e).lower() or 'timed out' in str(e).lower():
                        if attempt < max_attempts:
                            print(f"Timeout on attempt {attempt}/{max_attempts}. Retrying in {current_delay}s...")
                            time.sleep(current_delay)
                            current_delay *= 2  # Exponential backoff
                            attempt += 1
                        else:
                            print(f"Failed after {max_attempts} attempts")
                            raise
                    else:
                        # If it's not a timeout error, raise immediately
                        raise

        return wrapper
    return decorator


def parse_season(season_str: str) -> tuple[str, str]:
    """
    Parse season string like '2012-13' into start/end years.

    Args:
        season_str: Season in format 'YYYY-YY' (e.g., '2012-13')

    Returns:
        Tuple of (full_season_format, start_year)
        e.g., ('2012-13', '2012')
    """
    parts = season_str.split('-')
    if len(parts) != 2:
        raise ValueError(f"Season must be in format 'YYYY-YY', got: {season_str}")

    start_year = parts[0]
    end_year = parts[1]

    # Validate years
    if len(start_year) != 4 or len(end_year) != 2:
        raise ValueError(f"Invalid season format: {season_str}")

    return f"{start_year}-{end_year}", start_year


@retry_on_timeout(max_attempts=3, delay=10)
def fetch_nba_season(season: str) -> list[dict]:
    """
    Fetch all games for an NBA season.

    Args:
        season: Season string like '2012-13'

    Returns:
        List of game dictionaries with normalized format
    """
    print(f"Fetching NBA season {season}...")

    # Query the NBA API for all games in the season
    # season_type_nullable='Regular Season' for regular season only
    # We can also include 'Playoffs' if needed
    gamefinder = leaguegamefinder.LeagueGameFinder(
        season_nullable=season,
        season_type_nullable='Regular Season',
        league_id_nullable='00',  # NBA
        timeout=60  # Increase timeout to 60 seconds
    )

    # Get the dataframe
    games_df = gamefinder.get_data_frames()[0]

    print(f"Retrieved {len(games_df)} game records")

    # The API returns one row per team per game, so we have duplicates
    # We need to deduplicate and combine home/away data
    games_dict = {}

    for _, row in games_df.iterrows():
        game_id = row['GAME_ID']

        if game_id not in games_dict:
            games_dict[game_id] = {
                'game_id': game_id,
                'date': row['GAME_DATE'],
                'teams': []
            }

        # Add team data
        games_dict[game_id]['teams'].append({
            'team_abbr': row['TEAM_ABBREVIATION'],
            'team_name': row['TEAM_NAME'],
            'matchup': row['MATCHUP'],
            'wl': row['WL'],  # W or L
            'points': row['PTS']
        })

    # Convert to list and determine home/away
    games = []
    for game_id, game_data in games_dict.items():
        if len(game_data['teams']) != 2:
            print(f"Warning: Game {game_id} has {len(game_data['teams'])} teams, skipping")
            continue

        team1, team2 = game_data['teams']

        # Determine home/away from matchup string
        # Format is either "TEAM1 @ TEAM2" (TEAM1 is away) or "TEAM1 vs. TEAM2" (TEAM1 is home)
        if '@' in team1['matchup']:
            away_team = team1
            home_team = team2
        else:
            home_team = team1
            away_team = team2

        games.append({
            'date': game_data['date'],
            'homeTeam': home_team['team_abbr'],
            'awayTeam': away_team['team_abbr'],
            'homeScore': home_team['points'],
            'awayScore': away_team['points']
        })

    # Sort by date
    games.sort(key=lambda g: datetime.strptime(g['date'], '%Y-%m-%d'))

    print(f"Processed {len(games)} unique games")

    return games


@retry_on_timeout(max_attempts=3, delay=10)
def fetch_nba_schedule(season: str) -> list[dict]:
    """
    Fetch full season schedule including upcoming games.

    Uses ScheduleLeagueV2 endpoint which includes:
    - Completed games (with scores)
    - Scheduled games (without scores, marked with null)

    Args:
        season: Season string like '2025-26'

    Returns:
        List of game dictionaries with normalized format
    """
    print(f"Fetching NBA schedule for {season}...")

    schedule = scheduleleaguev2.ScheduleLeagueV2(
        season=season,
        league_id='00',  # NBA
        timeout=60  # Increase timeout to 60 seconds
    )
    data = schedule.get_dict()

    games = []
    game_dates = data.get('leagueSchedule', {}).get('gameDates', [])

    for date_obj in game_dates:
        for game in date_obj.get('games', []):
            # Skip preseason and all-star games
            game_label = game.get('gameLabel', '')
            if game_label in ['Preseason', 'All-Star']:
                continue

            # Get game status: 1=scheduled, 2=in progress, 3=final
            status = game.get('gameStatus', 1)

            # Extract date (format: "2025-10-21T00:00:00Z")
            game_date_str = game.get('gameDateEst', '')[:10]
            if not game_date_str:
                continue

            # Get team info
            home_team = game.get('homeTeam', {})
            away_team = game.get('awayTeam', {})

            home_abbr = home_team.get('teamTricode', '')
            away_abbr = away_team.get('teamTricode', '')

            if not home_abbr or not away_abbr:
                continue

            # Get scores - only if game is final (status == 3)
            if status == 3:
                home_score = home_team.get('score', 0)
                away_score = away_team.get('score', 0)
            else:
                # Game not yet played - use null for scores
                home_score = None
                away_score = None

            games.append({
                'date': game_date_str,
                'homeTeam': home_abbr,
                'awayTeam': away_abbr,
                'homeScore': home_score,
                'awayScore': away_score
            })

    # Sort by date
    games.sort(key=lambda g: g['date'])

    completed = sum(1 for g in games if g['homeScore'] is not None)
    scheduled = len(games) - completed
    print(f"Retrieved {len(games)} games ({completed} completed, {scheduled} scheduled)")

    return games


def is_current_season(season: str) -> bool:
    """
    Check if the given season is current/active.

    A season is considered current if we're within its date range.
    NBA season runs roughly October to June.
    """
    start_year = int(season.split('-')[0])
    end_year_short = season.split('-')[1]
    end_year = int(f"20{end_year_short}") if len(end_year_short) == 2 else int(end_year_short)

    now = datetime.now()
    current_year = now.year
    current_month = now.month

    # Season runs Oct-June spanning two calendar years
    # If we're in Oct-Dec, current season started this year
    # If we're in Jan-Sep, current season started last year
    if current_month >= 10:
        active_season_start = current_year
    else:
        active_season_start = current_year - 1

    return start_year == active_season_start


def save_season_data(league: str, season: str, games: list[dict]):
    """
    Save season data to JSON file.

    Args:
        league: League name ('nba' or 'wnba')
        season: Season string like '2012-13'
        games: List of game dictionaries
    """
    data_dir = Path(__file__).parent.parent / 'data' / league.lower()
    data_dir.mkdir(parents=True, exist_ok=True)

    output_file = data_dir / f'{season}.json'

    # Skip write if game data hasn't changed (avoids updating ingested_at needlessly)
    if output_file.exists():
        with open(output_file, 'r') as f:
            existing = json.load(f)
        if existing.get('games') == games:
            print(f"No changes for {season} ({len(games)} games) - skipping write")
            return

    season_data = {
        'season': season,
        'league': league.upper(),
        'games': games,
        'metadata': {
            'total_games': len(games),
            'ingested_at': datetime.now().isoformat()
        }
    }

    with open(output_file, 'w') as f:
        json.dump(season_data, f, indent=2)

    print(f"Saved {len(games)} games to {output_file}")


def main():
    parser = argparse.ArgumentParser(
        description='Ingest NBA season data and save as JSON'
    )
    parser.add_argument(
        '--season',
        required=True,
        help='NBA season in format YYYY-YY (e.g., 2012-13, 2024-25)'
    )
    parser.add_argument(
        '--use-api',
        action='store_true',
        help='Use NBA Stats API instead of Basketball-Reference (may be blocked on some networks)'
    )

    args = parser.parse_args()

    # Parse and validate season
    season, start_year = parse_season(args.season)

    # For current season: Try Basketball-Reference first (more reliable)
    # For historical seasons: Try NBA Stats API first, fall back to Basketball-Reference
    games = None

    if is_current_season(season):
        print(f"Detected current season - using Basketball-Reference as primary source")

        # First, try Basketball-Reference (most reliable for current season data)
        try:
            import subprocess
            result = subprocess.run(
                ['python3', 'scripts/ingest_nba_bball_ref.py', '--season', season],
                capture_output=True,
                text=True,
                timeout=300
            )
            if result.returncode == 0:
                print(f"✓ Successfully updated with Basketball-Reference data")
                return
            else:
                raise Exception(f"Basketball-Reference failed: {result.stderr}")
        except Exception as e:
            print(f"\nBasketball-Reference failed: {e}")
            print(f"Falling back to NBA Stats API...")

            # Fallback: Try to get the schedule from NBA Stats API
            # This may fail due to timeouts, but we'll use it if available
            try:
                print(f"Attempting to fetch schedule from NBA Stats API...")
                games = fetch_nba_schedule(season)
                print(f"✓ Got schedule with {len(games)} games from NBA Stats API")
            except Exception as api_error:
                print(f"NBA Stats API schedule also failed: {api_error}")
                # Last resort: Try LeagueGameFinder
                print(f"Trying NBA Stats API game finder as last resort...")
                try:
                    games = fetch_nba_season(season)
                except Exception as finder_error:
                    print(f"NBA Stats API game finder also failed: {finder_error}")
                    raise Exception("All data sources failed")
    else:
        # Historical season - try NBA Stats API first
        print(f"Historical season - trying NBA Stats API first")
        try:
            games = fetch_nba_season(season)
        except Exception as e:
            print(f"\nNBA Stats API failed: {e}")
            print(f"Falling back to Basketball-Reference...")
            try:
                import subprocess
                result = subprocess.run(
                    ['python3', 'scripts/ingest_nba_bball_ref.py', '--season', season],
                    capture_output=True,
                    text=True,
                    timeout=300
                )
                if result.returncode == 0:
                    print(f"✓ Successfully fetched from Basketball-Reference")
                    return
                else:
                    raise Exception(f"Basketball-Reference also failed: {result.stderr}")
            except Exception as fallback_error:
                print(f"Basketball-Reference fallback failed: {fallback_error}")
                raise

    # Save to file (only if we got games from NBA Stats API)
    if games:
        save_season_data('nba', season, games)

        completed = sum(1 for g in games if g['homeScore'] is not None)
        scheduled = len(games) - completed

        print(f"\n✓ Successfully ingested NBA season {season}")
        print(f"  - {len(games)} total games")
        if scheduled > 0:
            print(f"  - {completed} completed, {scheduled} scheduled")
        print(f"  - Data saved to data/nba/{season}.json")


if __name__ == '__main__':
    main()
