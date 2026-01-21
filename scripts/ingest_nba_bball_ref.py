#!/usr/bin/env python3
"""
NBA Historical Season Data Ingestion Script (Basketball-Reference)

Fetches NBA games from Basketball-Reference for seasons not available in the NBA API.
Use this for historical seasons (primarily 1976-77 through 1982-83).

Usage:
    python scripts/ingest_nba_bball_ref.py --season 1976-77
    python scripts/ingest_nba_bball_ref.py --season 1982-83
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
# This includes historical teams and name changes
TEAM_NAME_TO_CODE = {
    # Current teams
    "Atlanta Hawks": "ATL",
    "Boston Celtics": "BOS",
    "Brooklyn Nets": "BKN",
    "Charlotte Hornets": "CHA",
    "Chicago Bulls": "CHI",
    "Cleveland Cavaliers": "CLE",
    "Dallas Mavericks": "DAL",
    "Denver Nuggets": "DEN",
    "Detroit Pistons": "DET",
    "Golden State Warriors": "GSW",
    "Houston Rockets": "HOU",
    "Indiana Pacers": "IND",
    "Los Angeles Clippers": "LAC",
    "Los Angeles Lakers": "LAL",
    "Memphis Grizzlies": "MEM",
    "Miami Heat": "MIA",
    "Milwaukee Bucks": "MIL",
    "Minnesota Timberwolves": "MIN",
    "New Orleans Pelicans": "NOP",
    "New York Knicks": "NYK",
    "Oklahoma City Thunder": "OKC",
    "Orlando Magic": "ORL",
    "Philadelphia 76ers": "PHI",
    "Phoenix Suns": "PHX",
    "Portland Trail Blazers": "POR",
    "Sacramento Kings": "SAC",
    "San Antonio Spurs": "SAS",
    "Toronto Raptors": "TOR",
    "Utah Jazz": "UTA",
    "Washington Wizards": "WAS",

    # Historical names (1976-1983)
    "Buffalo Braves": "BUF",
    "Capital Bullets": "CAP",
    "Kansas City Kings": "KCK",
    "Kansas City-Omaha Kings": "KCK",
    "New Jersey Nets": "NJN",
    "New Orleans Jazz": "NOJ",
    "San Diego Clippers": "SDC",
    "San Diego Rockets": "SDR",
    "Seattle SuperSonics": "SEA",
    "Washington Bullets": "WSB",

    # ABA teams that joined NBA in 1976
    "Denver Rockets": "DEN",  # became Nuggets
    "New York Nets": "NJN",
    "Virginia Squires": "VIR",
    "Kentucky Colonels": "KEN",
}


def season_to_year(season_str: str) -> int:
    """Convert season string like '1976-77' to year for URL (1977)."""
    return int(season_str.split('-')[0]) + 1


def fetch_season_html(season: str, month: str = None) -> str:
    """
    Fetch the NBA season schedule page from Basketball-Reference.

    Args:
        season: Season string (e.g., '1976-77')
        month: Optional month name (e.g., 'october', 'november')

    Returns:
        HTML content as string
    """
    year = season_to_year(season)

    if month:
        url = f"https://www.basketball-reference.com/leagues/NBA_{year}_games-{month}.html"
    else:
        url = f"https://www.basketball-reference.com/leagues/NBA_{year}_games.html"

    print(f"Fetching {url}...")

    try:
        resp = requests.get(url, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        return resp.text
    except requests.RequestException as e:
        print(f"Error fetching URL: {e}")
        return ""


def parse_season_schedule(html: str, season: str) -> list[dict]:
    """
    Parse NBA season schedule from HTML.

    Args:
        html: HTML content from basketball-reference.com
        season: Season string (e.g., '1976-77')

    Returns:
        List of game dictionaries
    """
    soup = BeautifulSoup(html, "html.parser")

    # Find the schedule table
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

    print(f"Found schedule table")

    games = []
    game_type = "regular"  # Track if we're in regular season or playoffs
    year = season_to_year(season)

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
            # Format: Date | Visitor/Neutral | PTS | Home/Neutral | PTS | ...
            date_str = cells[0].get_text().strip()

            # Skip if no date (header rows, etc.)
            if not date_str or date_str == "Date":
                continue

            away_team_name = cells[1].get_text().strip()
            away_score_str = cells[2].get_text().strip()
            home_team_name = cells[3].get_text().strip()
            home_score_str = cells[4].get_text().strip()

            # Skip if scores are empty (game not played yet)
            if not away_score_str or not home_score_str:
                continue

            # Parse date (format like "Tue, Oct 21, 1976")
            try:
                # Try with day of week
                game_date = datetime.strptime(date_str, "%a, %b %d, %Y")
            except ValueError:
                try:
                    # Try without day of week
                    game_date = datetime.strptime(date_str, "%b %d, %Y")
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

            # Only include regular season games
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
        league: League name ('nba')
        season: Season string (e.g., '1976-77')
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
            'ingested_at': datetime.now().isoformat(),
            'source': 'basketball-reference.com'
        }
    }

    with open(output_file, 'w') as f:
        json.dump(season_data, f, indent=2)

    print(f"Saved {len(games)} games to {output_file}")


def main():
    parser = argparse.ArgumentParser(
        description='Ingest NBA historical season data from Basketball-Reference and save as JSON'
    )
    parser.add_argument(
        '--season',
        required=True,
        type=str,
        help='NBA season (e.g., 1976-77, 1982-83)'
    )

    args = parser.parse_args()
    season = args.season

    # Validate season format
    if not re.match(r'^\d{4}-\d{2}$', season):
        print(f"Error: Season must be in format YYYY-YY (e.g., 1976-77)")
        return

    # Known regular season end dates to filter out playoffs
    # Basketball-Reference doesn't distinguish between regular season and playoffs on monthly pages
    REGULAR_SEASON_END_DATES = {
        "1976-77": "1977-04-10",
        "1977-78": "1978-04-09",
        "1978-79": "1979-04-08",
        "1979-80": "1980-03-30",
        "1980-81": "1981-03-29",
        "1981-82": "1982-04-18",
        "1982-83": "1983-04-17",
    }

    # For modern seasons (1983-84 onwards), regular season typically ends mid-April
    # We'll use a heuristic: include games through April, stop at May
    # This works because playoffs never start before mid-April
    cutoff_date = REGULAR_SEASON_END_DATES.get(season)

    # Months of the NBA season
    months = ['october', 'november', 'december', 'january', 'february', 'march', 'april']

    # For seasons with known playoff dates, we can safely fetch May/June
    # For others, stop at April to be safe
    if cutoff_date:
        months.extend(['may', 'june'])

    all_games = []

    # Fetch and parse each month
    for month in months:
        print(f"\n--- Processing {month.title()} ---")
        html = fetch_season_html(season, month)

        if not html:
            print(f"  Skipping {month} (no data)")
            continue

        # Parse games from this month
        month_games = parse_season_schedule(html, season)
        all_games.extend(month_games)

        # Be respectful to Basketball-Reference servers (5 second delay between month pages)
        sleep(5)

    if not all_games:
        print("\nNo games found across all months")
        return

    # Sort all games by date
    all_games.sort(key=lambda g: g["date"])

    # Filter out playoff games if we have a cutoff date
    if cutoff_date:
        original_count = len(all_games)
        all_games = [g for g in all_games if g["date"] <= cutoff_date]
        filtered_count = original_count - len(all_games)
        if filtered_count > 0:
            print(f"\nFiltered out {filtered_count} playoff games (cutoff: {cutoff_date})")

    # Save to file
    save_season_data('nba', season, all_games)

    print(f"\n✓ Successfully ingested NBA season {season}")
    print(f"  - {len(all_games)} games")
    print(f"  - Data saved to data/nba/{season}.json")


if __name__ == '__main__':
    main()
