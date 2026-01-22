#!/usr/bin/env python3
"""
WNBA 2026 Season Data Ingestion Script using WNBA Stats API

Fetches the 2026 WNBA season schedule from the official WNBA Stats API.
All scores will be null since these are future games.

Usage:
    python scripts/ingest_wnba_2026_api.py
"""

import json
from pathlib import Path
from datetime import datetime

import requests


HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
}


def fetch_schedule_from_api(season: str = "2026") -> dict:
    """
    Fetch the WNBA season schedule from the stats API.

    Args:
        season: Season year (e.g., '2026')

    Returns:
        Raw API response as dict
    """
    url = "https://stats.wnba.com/stats/internationalbroadcasterschedule"
    params = {
        "LeagueID": "10",  # WNBA
        "Season": season,
        "RegionID": "1",
    }

    print(f"Fetching schedule for {season} from WNBA Stats API...")

    try:
        resp = requests.get(url, params=params, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException as e:
        print(f"Error fetching schedule: {e}")
        return {}


def parse_api_schedule(api_data: dict) -> list[dict]:
    """
    Parse games from WNBA Stats API response.

    Args:
        api_data: Raw API response

    Returns:
        List of game dictionaries in our format
    """
    games = []

    # The API returns games in resultSets[1].CompleteGameList
    if "resultSets" not in api_data or len(api_data["resultSets"]) < 2:
        print("Unexpected API response structure")
        return []

    game_list = api_data["resultSets"][1].get("CompleteGameList", [])
    print(f"Found {len(game_list)} games in API response")

    for game in game_list:
        try:
            # Parse date (format: "05/08/2026")
            date_str = game["date"]
            game_date = datetime.strptime(date_str, "%m/%d/%Y")

            # Extract team codes
            away_team = game["vtAbbreviation"]  # vt = visiting team
            home_team = game["htAbbreviation"]  # ht = home team

            # Create game entry with null scores (future games)
            games.append({
                "date": game_date.strftime("%Y-%m-%d"),
                "homeTeam": home_team,
                "awayTeam": away_team,
                "homeScore": None,
                "awayScore": None,
            })

        except (KeyError, ValueError) as e:
            print(f"Warning: Failed to parse game: {e}")
            print(f"  Game data: {game}")
            continue

    # Sort by date
    games.sort(key=lambda g: g["date"])

    return games


def save_season_data(season: str, games: list[dict]):
    """
    Save season data to JSON file.

    Args:
        season: Season string (e.g., '2026')
        games: List of game dictionaries
    """
    data_dir = Path(__file__).parent.parent / 'data' / 'wnba'
    data_dir.mkdir(parents=True, exist_ok=True)

    output_file = data_dir / f'{season}.json'

    season_data = {
        'season': season,
        'league': 'WNBA',
        'games': games,
        'metadata': {
            'total_games': len(games),
            'ingested_at': datetime.now().isoformat(),
            'note': 'Future games - scores are null and will be updated when games are played'
        }
    }

    with open(output_file, 'w') as f:
        json.dump(season_data, f, indent=2)

    print(f"Saved {len(games)} games to {output_file}")


def main():
    season = "2026"

    # Fetch schedule from API
    api_data = fetch_schedule_from_api(season)
    if not api_data:
        print("Failed to fetch schedule data")
        return

    # Parse games
    games = parse_api_schedule(api_data)

    if not games:
        print("No games found")
        return

    # Save to file
    save_season_data(season, games)

    print(f"\n✓ Successfully ingested WNBA season {season}")
    print(f"  - {len(games)} games scheduled")
    print(f"  - Data saved to data/wnba/{season}.json")
    print(f"\nNote: All scores are null since these are future games.")


if __name__ == '__main__':
    main()
