#!/usr/bin/env python3
"""
NHL Season Data Ingestion Script

Fetches all games for a given NHL season from Hockey-Reference and saves them as JSON.
Uses web scraping with responsible rate limiting and browser-like headers.

Usage:
    python scripts/ingest_nhl.py --season 1942-43
    python scripts/ingest_nhl.py --season 2024-25
"""

import argparse
import json
import re
from pathlib import Path
from datetime import datetime
from time import sleep

import requests
from bs4 import BeautifulSoup


HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Referer": "https://www.hockey-reference.com/",
    "DNT": "1",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
}


# Map full team names to 3-letter abbreviations
# This will be populated dynamically from the page, but we can provide fallbacks
TEAM_NAME_TO_CODE = {
    # Modern teams
    "Anaheim Ducks": "ANA",
    "Arizona Coyotes": "ARI",
    "Boston Bruins": "BOS",
    "Buffalo Sabres": "BUF",
    "Calgary Flames": "CGY",
    "Carolina Hurricanes": "CAR",
    "Chicago Blackhawks": "CHI",
    "Chicago Black Hawks": "CHI",  # Historical spelling
    "Colorado Avalanche": "COL",
    "Columbus Blue Jackets": "CBJ",
    "Dallas Stars": "DAL",
    "Detroit Red Wings": "DET",
    "Edmonton Oilers": "EDM",
    "Florida Panthers": "FLA",
    "Los Angeles Kings": "LAK",
    "Minnesota Wild": "MIN",
    "Montreal Canadiens": "MTL",
    "Nashville Predators": "NSH",
    "New Jersey Devils": "NJD",
    "New York Islanders": "NYI",
    "New York Rangers": "NYR",
    "Ottawa Senators": "OTT",
    "Philadelphia Flyers": "PHI",
    "Pittsburgh Penguins": "PIT",
    "San Jose Sharks": "SJS",
    "Seattle Kraken": "SEA",
    "St. Louis Blues": "STL",
    "Tampa Bay Lightning": "TBL",
    "Toronto Maple Leafs": "TOR",
    "Utah Hockey Club": "UTA",
    "Vancouver Canucks": "VAN",
    "Vegas Golden Knights": "VGK",
    "Washington Capitals": "WSH",
    "Winnipeg Jets": "WPG",

    # Historical teams
    "Atlanta Flames": "AFM",
    "Atlanta Thrashers": "ATL",
    "Brooklyn Americans": "BRK",
    "California Golden Seals": "CGS",
    "Cleveland Barons": "CLE",
    "Colorado Rockies": "CLR",
    "Detroit Cougars": "DCG",
    "Detroit Falcons": "DFL",
    "Hamilton Tigers": "HAM",
    "Hartford Whalers": "HFD",
    "Kansas City Scouts": "KCS",
    "Minnesota North Stars": "MNS",
    "Montreal Maroons": "MMR",
    "Montreal Wanderers": "MWN",
    "New York Americans": "NYA",
    "Oakland Seals": "OAK",
    "Ottawa Senators (original)": "OTS",
    "Philadelphia Quakers": "QUA",
    "Phoenix Coyotes": "PHX",
    "Pittsburgh Pirates": "PIR",
    "Quebec Nordiques": "QUE",
    "St. Louis Eagles": "SLE",
    "Toronto Arenas": "TAN",
    "Toronto St. Patricks": "TSP",
    "Winnipeg Jets (original)": "WIN",
}


def extract_team_code_from_link(team_cell):
    """
    Extract team abbreviation from the team cell's href link.
    Hockey-reference uses hrefs like /teams/BOS/1943.html

    Args:
        team_cell: BeautifulSoup cell containing team link

    Returns:
        Team code (e.g., 'BOS') or None
    """
    link = team_cell.find('a')
    if link and link.get('href'):
        href = link.get('href')
        # Extract team code from pattern /teams/XXX/YYYY.html
        match = re.search(r'/teams/([A-Z]{3})/\d+\.html', href)
        if match:
            return match.group(1)
    return None


def fetch_season_html(season_str: str) -> str:
    """
    Fetch the NHL season schedule page from Hockey-Reference.

    Args:
        season_str: Season in format 'YYYY-YY' (e.g., '1942-43')

    Returns:
        HTML content as string
    """
    # Convert season format from 1942-43 to 1943 (end year is what hockey-reference uses)
    parts = season_str.split('-')
    start_year = parts[0]
    end_year = parts[1]

    if len(end_year) == 2:
        # For years like 99-00, we need to handle century rollover
        start_year_int = int(start_year)
        end_year_int = int(end_year)

        # If end year digits are less than start year last 2 digits, it's next century
        if end_year_int < int(start_year[-2:]):
            # Century rollover (e.g., 1999-00 -> 2000)
            century = (start_year_int // 100 + 1) * 100
            end_year = str(century + end_year_int)
        else:
            # Same century (e.g., 1942-43 -> 1943)
            end_year = start_year[:2] + end_year

    url = f"https://www.hockey-reference.com/leagues/NHL_{end_year}_games.html"
    print(f"Fetching {url}...")

    # Be respectful - add a small delay
    sleep(1)

    try:
        resp = requests.get(url, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        return resp.text
    except requests.RequestException as e:
        print(f"Error fetching URL: {e}")
        return ""


def parse_season_schedule(html: str, season_str: str) -> list[dict]:
    """
    Parse NHL season schedule from HTML.

    Args:
        html: HTML content from hockey-reference.com
        season_str: Season string (e.g., '1942-43')

    Returns:
        List of game dictionaries (regular season only)
    """
    soup = BeautifulSoup(html, "html.parser")

    # Find the regular season games table (id="games")
    table = soup.find("table", id="games")

    if table is None:
        print(f"Warning: No games table found for {season_str}")
        return []

    games = []
    tbody = table.find("tbody")
    if not tbody:
        return []

    rows = tbody.find_all("tr")

    for row in rows:
        # Skip header rows
        if "thead" in row.get("class", []):
            continue

        cells = row.find_all(["th", "td"])
        if len(cells) < 6:
            continue

        try:
            # Extract data from cells
            # Format: Date | Time | Visitor | G | Home | G | (OT) | Att. | LOG | Notes
            date_str = cells[0].get_text().strip()
            # cells[1] is time (not needed)
            visitor_team_cell = cells[2]
            visitor_goals_str = cells[3].get_text().strip()
            home_team_cell = cells[4]
            home_goals_str = cells[5].get_text().strip()

            # Skip if scores are empty (game not played yet)
            if not visitor_goals_str or not home_goals_str:
                continue

            # Parse date (format like "1942-10-31")
            try:
                game_date = datetime.strptime(date_str, "%Y-%m-%d")
            except ValueError:
                print(f"Warning: Could not parse date: {date_str}")
                continue

            # Convert scores to integers
            try:
                away_score = int(visitor_goals_str)
                home_score = int(home_goals_str)
            except ValueError:
                print(f"Warning: Could not parse scores: {visitor_goals_str}, {home_goals_str}")
                continue

            # Extract team codes from links
            away_code = extract_team_code_from_link(visitor_team_cell)
            home_code = extract_team_code_from_link(home_team_cell)

            if not away_code:
                away_team_name = visitor_team_cell.get_text().strip()
                away_code = TEAM_NAME_TO_CODE.get(away_team_name)
                if not away_code:
                    print(f"Warning: Unknown visitor team: {away_team_name}")
                    continue

            if not home_code:
                home_team_name = home_team_cell.get_text().strip()
                home_code = TEAM_NAME_TO_CODE.get(home_team_name)
                if not home_code:
                    print(f"Warning: Unknown home team: {home_team_name}")
                    continue

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
        league: League name ('nhl')
        season: Season string (e.g., '1942-43')
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


def parse_season_arg(season_str: str) -> str:
    """
    Parse and validate season string.

    Args:
        season_str: Season in format 'YYYY-YY' (e.g., '1942-43')

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

    return season_str


def main():
    parser = argparse.ArgumentParser(
        description='Ingest NHL season data and save as JSON'
    )
    parser.add_argument(
        '--season',
        required=True,
        help='NHL season in format YYYY-YY (e.g., 1942-43, 2024-25)'
    )

    args = parser.parse_args()

    # Parse and validate season
    season = parse_season_arg(args.season)

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
    save_season_data('nhl', season, games)

    print(f"\n✓ Successfully ingested NHL season {season}")
    print(f"  - {len(games)} games")
    print(f"  - Data saved to data/nhl/{season}.json")


if __name__ == '__main__':
    main()
