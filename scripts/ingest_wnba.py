#!/usr/bin/env python3
"""
WNBA Season Data Ingestion Script

Fetches all games for a given WNBA season from Basketball-Reference and saves them as JSON.
Uses web scraping since WNBA doesn't have a widely-available API like NBA.

Usage:
    python scripts/ingest_wnba.py --season 2024
    python scripts/ingest_wnba.py --season 2023
"""

import argparse
import json
import re
from pathlib import Path
from datetime import datetime
from time import sleep

import requests
from bs4 import BeautifulSoup, Comment


HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Referer": "https://www.basketball-reference.com/",
    "DNT": "1",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
}


# Map full team names to 3-letter abbreviations
TEAM_NAME_TO_CODE = {
    "Atlanta Dream": "ATL",
    "Chicago Sky": "CHI",
    "Connecticut Sun": "CON",
    "Dallas Wings": "DAL",
    "Golden State Valkyries": "GSV",
    "Indiana Fever": "IND",
    "Las Vegas Aces": "LVA",
    "Los Angeles Sparks": "LAS",
    "Minnesota Lynx": "MIN",
    "New York Liberty": "NYL",
    "Phoenix Mercury": "PHO",
    "Seattle Storm": "SEA",
    "Washington Mystics": "WAS",
    # Historical teams
    "Charlotte Sting": "CHA",
    "Cleveland Rockers": "CLE",
    "Detroit Shock": "DET",
    "Houston Comets": "HOU",
    "Miami Sol": "MIA",
    "Orlando Miracle": "ORL",
    "Portland Fire": "POR",
    "Sacramento Monarchs": "SAC",
    "San Antonio Silver Stars": "SAS",
    "San Antonio Stars": "SAS",
    "Tulsa Shock": "TUL",
    "Utah Starzz": "UTA",
}


def fetch_season_html(season: int) -> str:
    """
    Fetch the WNBA season schedule page from Basketball-Reference.

    Args:
        season: Year of the season (e.g., 2024)

    Returns:
        HTML content as string
    """
    url = f"https://www.basketball-reference.com/wnba/years/{season}_games.html"
    print(f"Fetching {url}...")

    try:
        resp = requests.get(url, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        return resp.text
    except requests.RequestException as e:
        print(f"Error fetching URL: {e}")
        return ""


def parse_season_schedule(html: str, season: int) -> list[dict]:
    """
    Parse WNBA season schedule from HTML.

    Args:
        html: HTML content from basketball-reference.com
        season: Year of the season

    Returns:
        List of game dictionaries
    """
    soup = BeautifulSoup(html, "html.parser")

    # Find the schedule table (may be in comments)
    table = soup.find("table", id="schedule")

    if table is None:
        # Check in HTML comments (Basketball-Reference sometimes hides tables there)
        comments = soup.find_all(string=lambda text: isinstance(text, Comment))
        for comment in comments:
            if 'id="schedule"' in str(comment):
                comment_soup = BeautifulSoup(str(comment), "html.parser")
                table = comment_soup.find("table", id="schedule")
                if table:
                    break

    if table is None:
        print(f"Warning: No schedule table found for {season}")
        return []

    games = []
    game_type = "regular"  # Track if we're in regular season or playoffs

    tbody = table.find("tbody")
    if not tbody:
        return []

    rows = tbody.find_all("tr")

    for row in rows:
        # Check if this is a playoff header row
        if "thead" in row.get("class", []):
            cell_text = row.get_text().strip().lower()
            if "playoff" in cell_text:
                game_type = "playoff"
            continue

        cells = row.find_all(["th", "td"])
        if len(cells) < 6:
            continue

        try:
            # Extract data from cells
            # Format: Date | Visitor/Neutral | PTS | Home/Neutral | PTS | ... | Notes
            date_str = cells[0].get_text().strip()
            away_team_name = cells[1].get_text().strip()
            away_score_str = cells[2].get_text().strip()
            home_team_name = cells[3].get_text().strip()
            home_score_str = cells[4].get_text().strip()

            # Skip if scores are empty (game not played yet)
            if not away_score_str or not home_score_str:
                continue

            # Parse date (format like "Fri, May 19, 2023")
            try:
                game_date = datetime.strptime(date_str, "%a, %b %d, %Y")
            except ValueError:
                # Try alternative format
                try:
                    game_date = datetime.strptime(date_str, "%B %d, %Y")
                except ValueError:
                    print(f"Warning: Could not parse date: {date_str}")
                    continue

            # Convert scores to integers
            try:
                away_score = int(away_score_str)
                home_score = int(home_score_str)
            except ValueError:
                print(f"Warning: Could not parse scores: {away_score_str}, {home_score_str}")
                continue

            # Map team names to codes
            away_code = TEAM_NAME_TO_CODE.get(away_team_name)
            home_code = TEAM_NAME_TO_CODE.get(home_team_name)

            if not away_code:
                print(f"Warning: Unknown away team: {away_team_name}")
                continue
            if not home_code:
                print(f"Warning: Unknown home team: {home_team_name}")
                continue

            # Only include regular season games for now
            if game_type == "regular":
                games.append({
                    "date": game_date.strftime("%Y-%m-%d"),
                    "homeTeam": home_code,
                    "awayTeam": away_code,
                    "homeScore": home_score,
                    "awayScore": away_score,
                })

        except Exception as e:
            print(f"Warning: Failed to parse row: {e}")
            continue

    # Sort by date
    games.sort(key=lambda g: g["date"])

    print(f"Parsed {len(games)} regular season games")

    return games


def save_season_data(league: str, season: str, games: list[dict]):
    """
    Save season data to JSON file.

    Args:
        league: League name ('wnba')
        season: Season string (e.g., '2024')
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
        description='Ingest WNBA season data and save as JSON'
    )
    parser.add_argument(
        '--season',
        required=True,
        type=int,
        help='WNBA season year (e.g., 2024, 2023)'
    )

    args = parser.parse_args()
    season = args.season

    # Fetch season HTML
    html = fetch_season_html(season)
    if not html:
        print("Failed to fetch season data")
        return

    # Parse games
    games = parse_season_schedule(html, season)

    if not games:
        print("No games found")
        return

    # Save to file
    save_season_data('wnba', str(season), games)

    print(f"\n✓ Successfully ingested WNBA season {season}")
    print(f"  - {len(games)} games")
    print(f"  - Data saved to data/wnba/{season}.json")


if __name__ == '__main__':
    main()
