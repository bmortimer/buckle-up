#!/usr/bin/env python3
"""
WNBA 2026 Season Data Ingestion Script

Fetches the 2026 WNBA season schedule from WNBA.com since Basketball-Reference
doesn't have it yet. All scores will be null since these are future games.

Usage:
    python scripts/ingest_wnba_2026.py
"""

import json
import re
from pathlib import Path
from datetime import datetime
from typing import Optional

import requests
from bs4 import BeautifulSoup


HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}


# Map team names/abbreviations from WNBA.com to our 3-letter codes
TEAM_NAME_TO_CODE = {
    "ATL": "ATL",  # Atlanta Dream
    "CHI": "CHI",  # Chicago Sky
    "CON": "CON",  # Connecticut Sun
    "DAL": "DAL",  # Dallas Wings
    "GSV": "GSV",  # Golden State Valkyries
    "IND": "IND",  # Indiana Fever
    "LVA": "LVA",  # Las Vegas Aces
    "LAS": "LAS",  # Los Angeles Sparks
    "MIN": "MIN",  # Minnesota Lynx
    "NYL": "NYL",  # New York Liberty
    "PHO": "PHO",  # Phoenix Mercury
    "SEA": "SEA",  # Seattle Storm
    "WAS": "WAS",  # Washington Mystics
    # Alternate names/codes
    "ATLANTA": "ATL",
    "CHICAGO": "CHI",
    "CONNECTICUT": "CON",
    "DALLAS": "DAL",
    "GOLDEN STATE": "GSV",
    "INDIANA": "IND",
    "LAS VEGAS": "LVA",
    "LOS ANGELES": "LAS",
    "MINNESOTA": "MIN",
    "NEW YORK": "NYL",
    "PHOENIX": "PHO",
    "SEATTLE": "SEA",
    "WASHINGTON": "WAS",
}


def fetch_schedule_html() -> str:
    """
    Fetch the WNBA 2026 season schedule page from WNBA.com.

    Returns:
        HTML content as string
    """
    url = "https://www.wnba.com/schedule?season=2026&month=all"
    print(f"Fetching {url}...")

    try:
        resp = requests.get(url, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        return resp.text
    except requests.RequestException as e:
        print(f"Error fetching URL: {e}")
        return ""


def parse_team_code(team_str: str) -> Optional[str]:
    """
    Parse team code from various formats.

    Args:
        team_str: Team name or abbreviation

    Returns:
        3-letter team code or None if not found
    """
    team_upper = team_str.upper().strip()
    return TEAM_NAME_TO_CODE.get(team_upper)


def parse_schedule(html: str) -> list[dict]:
    """
    Parse WNBA 2026 schedule from HTML.

    The WNBA.com schedule page is typically rendered with JavaScript,
    but may have JSON data embedded in the page or structured HTML.

    Args:
        html: HTML content from wnba.com

    Returns:
        List of game dictionaries
    """
    games = []

    # First, try to find JSON data embedded in the page
    # WNBA.com often embeds schedule data in <script> tags
    soup = BeautifulSoup(html, "html.parser")

    # Look for script tags that might contain schedule data
    scripts = soup.find_all("script")
    for script in scripts:
        if script.string and ("schedule" in script.string.lower() or "games" in script.string.lower()):
            # Try to extract JSON from the script
            try:
                # Look for JSON object patterns
                json_match = re.search(r'(\{[\s\S]*"games"[\s\S]*\})', script.string)
                if json_match:
                    data = json.loads(json_match.group(1))
                    if "games" in data:
                        games_data = data["games"]
                        for game in games_data:
                            # Parse game data based on the structure
                            # This will need to be adjusted based on actual WNBA.com format
                            pass
            except (json.JSONDecodeError, AttributeError):
                continue

    # If we couldn't find JSON, try parsing HTML structure
    # (Note: This may need adjustment based on actual WNBA.com HTML structure)
    if not games:
        print("Attempting to parse HTML structure...")
        # Look for common schedule HTML patterns
        game_elements = soup.find_all(class_=re.compile(r'game|schedule', re.I))
        print(f"Found {len(game_elements)} potential game elements")

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
            'note': 'Games scheduled for future - scores are null'
        }
    }

    with open(output_file, 'w') as f:
        json.dump(season_data, f, indent=2)

    print(f"Saved {len(games)} games to {output_file}")


def main():
    season = "2026"

    # Fetch schedule HTML
    html = fetch_schedule_html()
    if not html:
        print("Failed to fetch schedule data")
        return

    # Save raw HTML for debugging
    debug_file = Path(__file__).parent.parent / 'data' / 'wnba' / '2026_debug.html'
    with open(debug_file, 'w') as f:
        f.write(html)
    print(f"Saved raw HTML to {debug_file} for inspection")

    # Parse games
    games = parse_schedule(html)

    if not games:
        print("\nNo games found in automatic parsing.")
        print("Please inspect the saved HTML file and we can adjust the parser.")
        print("\nAlternatively, you can:")
        print("1. Manually extract the schedule from the browser's Network tab")
        print("2. Copy the JSON API response if available")
        return

    # Save to file
    save_season_data(season, games)

    print(f"\n✓ Successfully ingested WNBA season {season}")
    print(f"  - {len(games)} games")
    print(f"  - Data saved to data/wnba/{season}.json")


if __name__ == '__main__':
    main()
