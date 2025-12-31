#!/usr/bin/env python3
"""
NBA Season Data Ingestion Script

Fetches all games for a given NBA season and saves them as JSON.
Uses the nba_api library to access stats.nba.com data.

Usage:
    python scripts/ingest_nba.py --season 2012-13
    python scripts/ingest_nba.py --season 2024-25
"""

import argparse
import json
from pathlib import Path
from datetime import datetime
from nba_api.stats.endpoints import leaguegamefinder
import time


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
        league_id_nullable='00'  # NBA
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

    args = parser.parse_args()

    # Parse and validate season
    season, start_year = parse_season(args.season)

    # Fetch games
    games = fetch_nba_season(season)

    # Save to file
    save_season_data('nba', season, games)

    print(f"\n✓ Successfully ingested NBA season {season}")
    print(f"  - {len(games)} games")
    print(f"  - Data saved to data/nba/{season}.json")


if __name__ == '__main__':
    main()
