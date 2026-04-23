#!/usr/bin/env python3
"""
PWHL Season Data Ingestion Script

Fetches all games for a given PWHL season from the HockeyTech/LeagueStat API and saves them as JSON.
Uses the unofficial but publicly accessible PWHL API.

Usage:
    python scripts/ingest_pwhl.py --season 2023-24
    python scripts/ingest_pwhl.py --season 2024-25
"""

import argparse
import json
import re
from pathlib import Path
from datetime import datetime
from time import sleep

import requests


# HockeyTech API configuration for PWHL
# This key is a publicly shared key embedded in PWHL's own web infrastructure,
# not a private credential. It is used by all third-party PWHL data consumers.
API_BASE_URL = "https://lscluster.hockeytech.com/feed/"
API_PARAMS = {
    "key": "446521baf8c38984",
    "client_code": "pwhl"
}

HEADERS = {
    "User-Agent": "WhoHasTheBelt.com belt tracker (contact via GitHub)",
    "Accept": "application/json",
}

# Map PWHL season strings to HockeyTech season IDs
# PWHL uses numeric season IDs in their API (regular season only, excludes preseason/playoffs)
SEASON_ID_MAP = {
    "2023-24": "1",  # Inaugural season (6 teams, 72 games total)
    "2024-25": "5",  # Season 2 (6 teams, 90 games total)
    "2025-26": "8",  # Season 3 (8 teams with expansion, 120 games total)
}

# Map team names to 3-letter abbreviations
# PWHL team names have evolved (some started as just cities, then got proper names)
TEAM_NAME_TO_CODE = {
    # Current team names (as of 2025-26)
    "Boston Fleet": "BOS",
    "Boston": "BOS",  # Used in early seasons
    "Minnesota Frost": "MIN",
    "Minnesota": "MIN",
    "Montréal Victoire": "MTL",
    "Montreal Victoire": "MTL",  # Without accent
    "Montréal": "MTL",
    "Montreal": "MTL",
    "New York Sirens": "NYS",
    "New York": "NYS",
    "Ottawa Charge": "OTT",
    "Ottawa": "OTT",
    "Toronto Sceptres": "TOR",
    "Toronto": "TOR",
    # Expansion teams (2025-26)
    "Seattle Torrent": "SEA",
    "Seattle": "SEA",
    "Vancouver Goldeneyes": "VAN",
    "Vancouver": "VAN",
}


def fetch_season_games(season_str: str) -> list[dict]:
    """
    Fetch all games for a PWHL season from the HockeyTech API.

    Args:
        season_str: Season in format 'YYYY-YY' (e.g., '2023-24')

    Returns:
        List of raw game data from API
    """
    season_id = SEASON_ID_MAP.get(season_str)
    if not season_id:
        raise ValueError(f"Unknown season: {season_str}. Valid seasons: {list(SEASON_ID_MAP.keys())}")

    # Use the scorebar endpoint which returns all games with scores in date order
    # This is more efficient than pagination
    params = {
        **API_PARAMS,
        "feed": "modulekit",
        "view": "scorebar",
        "numberofdaysback": "200",  # Covers a full season
        "numberofdaysahead": "200",  # Look ahead for scheduled games
    }

    url = API_BASE_URL
    print(f"Fetching PWHL {season_str} season data from HockeyTech API...")

    # Be respectful - add a delay
    sleep(2)

    try:
        resp = requests.get(url, params=params, headers=HEADERS, timeout=60)
        resp.raise_for_status()
        data = resp.json()

        # The scorebar endpoint returns games directly in an array
        # We need to filter for the specific season
        all_games = []

        if "SiteKit" in data and "Scorebar" in data["SiteKit"]:
            # Games are directly in Scorebar array
            for game in data["SiteKit"]["Scorebar"]:
                # Filter by season_id
                if str(game.get("SeasonID")) == season_id:
                    all_games.append(game)

        print(f"Fetched {len(all_games)} games for season {season_str}")
        return all_games

    except requests.RequestException as e:
        print(f"Error fetching API data: {e}")
        return []


def normalize_team_name(team_name: str) -> str:
    """
    Normalize team name to 3-letter code.

    Args:
        team_name: Full team name from API

    Returns:
        3-letter team code
    """
    # Clean up the name
    team_name = team_name.strip()

    # Try direct lookup
    if team_name in TEAM_NAME_TO_CODE:
        return TEAM_NAME_TO_CODE[team_name]

    # Try case-insensitive lookup
    for key, value in TEAM_NAME_TO_CODE.items():
        if key.lower() == team_name.lower():
            return value

    # If we can't find it, raise an error
    raise ValueError(f"Unknown team name: {team_name}")


def parse_games(raw_games: list[dict], season_str: str) -> list[dict]:
    """
    Parse raw API game data into our standard format.

    Args:
        raw_games: Raw game data from HockeyTech API
        season_str: Season string (e.g., '2023-24')

    Returns:
        List of game dictionaries in standard format
    """
    parsed_games = []

    for game in raw_games:
        try:
            # Extract game date from GameDateISO8601 field
            # Format: "2024-01-01T19:00:00-05:00"
            game_date_iso = game.get("GameDateISO8601", "")

            if not game_date_iso:
                print(f"Warning: No date found for game ID {game.get('ID', 'unknown')}")
                continue

            # Parse ISO8601 date
            try:
                # Extract just the date part (YYYY-MM-DD)
                game_date = game_date_iso.split('T')[0]
                parsed_date = datetime.strptime(game_date, "%Y-%m-%d")
            except ValueError as e:
                print(f"Warning: Could not parse date {game_date_iso}: {e}")
                continue

            # Extract teams - use City + Nickname or just City if no nickname
            # API gives us: HomeCity, HomeNickname, VisitorCity, VisitorNickname
            # In early seasons (2023-24), nickname was same as city
            home_city = game.get("HomeCity", "").strip()
            home_nickname = game.get("HomeNickname", "").strip()
            visitor_city = game.get("VisitorCity", "").strip()
            visitor_nickname = game.get("VisitorNickname", "").strip()

            # Build full team names - avoid duplication if nickname == city
            if home_nickname and home_nickname != home_city:
                home_team = f"{home_city} {home_nickname}".strip()
            else:
                home_team = home_city

            if visitor_nickname and visitor_nickname != visitor_city:
                away_team = f"{visitor_city} {visitor_nickname}".strip()
            else:
                away_team = visitor_city

            if not home_team or not away_team:
                print(f"Warning: Missing team names for game on {game_date}")
                continue

            # Normalize to 3-letter codes
            try:
                home_code = normalize_team_name(home_team)
                away_code = normalize_team_name(away_team)
            except ValueError as e:
                print(f"Warning: {e} (trying just city names)")
                # Try with just city names as fallback
                try:
                    home_code = normalize_team_name(home_city)
                    away_code = normalize_team_name(visitor_city)
                except ValueError as e2:
                    print(f"Warning: {e2}")
                    continue

            # Extract scores - HomeGoals and VisitorGoals
            home_score = game.get("HomeGoals")
            away_score = game.get("VisitorGoals")

            # Check if game has been played
            # GameStatus: 1 = scheduled, 2 = in progress, 3 = final, 4 = final/OT etc.
            # GameStatusString: "Final", "Final/OT", "Final/SO", or empty for scheduled
            game_status = game.get("GameStatus")
            game_status_str = game.get("GameStatusString", "").lower()
            is_final = game_status in [3, 4] or "final" in game_status_str

            # If game is final, ensure we have scores
            if is_final:
                if home_score is None or away_score is None or home_score == '' or away_score == '':
                    print(f"Warning: Final game missing scores on {game_date}")
                    continue

                # Convert to int
                try:
                    home_score_int = int(home_score)
                    away_score_int = int(away_score)
                except (ValueError, TypeError):
                    print(f"Warning: Invalid scores for game on {game_date}: H={home_score}, A={away_score}")
                    continue

                parsed_games.append({
                    "date": parsed_date.strftime("%Y-%m-%d"),
                    "homeTeam": home_code,
                    "awayTeam": away_code,
                    "homeScore": home_score_int,
                    "awayScore": away_score_int,
                })
            else:
                # Scheduled future game
                parsed_games.append({
                    "date": parsed_date.strftime("%Y-%m-%d"),
                    "homeTeam": home_code,
                    "awayTeam": away_code,
                    "homeScore": None,
                    "awayScore": None,
                })

        except Exception as e:
            print(f"Warning: Failed to parse game: {e}")
            import traceback
            traceback.print_exc()
            continue

    # Sort by date
    parsed_games.sort(key=lambda g: g["date"])

    # Count completed vs scheduled games
    completed_games = sum(1 for g in parsed_games if g["homeScore"] is not None)
    scheduled_games = len(parsed_games) - completed_games

    print(f"Parsed {len(parsed_games)} games ({completed_games} completed, {scheduled_games} scheduled)")

    return parsed_games


def save_season_data(league: str, season: str, games: list[dict]):
    """
    Save season data to JSON file.

    Args:
        league: League name ('pwhl')
        season: Season string (e.g., '2023-24')
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


def parse_season_arg(season_str: str) -> str:
    """
    Parse and validate season string.

    Args:
        season_str: Season in format 'YYYY-YY' (e.g., '2023-24')

    Returns:
        Validated season string
    """
    parts = season_str.split('-')
    if len(parts) != 2:
        raise ValueError(f"Season must be in format 'YYYY-YY', got: {season_str}")

    start_year = parts[0]
    end_year = parts[1]

    # Validate years
    if len(start_year) != 4 or len(end_year) != 2:
        raise ValueError(f"Invalid season format: {season_str}")

    # Verify end year is one more than start year
    expected_end = str(int(start_year) + 1)[-2:]
    if end_year != expected_end:
        raise ValueError(f"Invalid season: {season_str}. End year should be {expected_end}")

    # Verify this is a known PWHL season
    if season_str not in SEASON_ID_MAP:
        available = ", ".join(SEASON_ID_MAP.keys())
        raise ValueError(f"Unknown PWHL season: {season_str}. Available: {available}")

    return season_str


def main():
    parser = argparse.ArgumentParser(
        description='Ingest PWHL season data and save as JSON'
    )
    parser.add_argument(
        '--season',
        required=True,
        help='PWHL season in format YYYY-YY (e.g., 2023-24, 2024-25)'
    )

    args = parser.parse_args()

    # Parse and validate season
    season = parse_season_arg(args.season)

    # Fetch raw games from API
    raw_games = fetch_season_games(season)
    if not raw_games:
        print("No games found")
        return

    # Parse into our standard format
    games = parse_games(raw_games, season)

    if not games:
        print("No valid games parsed")
        return

    # Save to file
    save_season_data('pwhl', season, games)

    print(f"\n✓ Successfully ingested PWHL season {season}")
    print(f"  - {len(games)} games")
    print(f"  - Data saved to data/pwhl/{season}.json")


if __name__ == '__main__':
    main()
