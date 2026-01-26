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
    "User-Agent": "Mozilla/5.0 (Personal NBA stats project; respecting sports-reference.com/bot-traffic.html rate limits)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.basketball-reference.com/",
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


def fetch_season_html(season: str, month: str = None, max_retries: int = 3) -> str:
    """
    Fetch the NBA season schedule page from Basketball-Reference with retry logic.

    Args:
        season: Season string (e.g., '1976-77')
        month: Optional month name (e.g., 'october', 'november')
        max_retries: Maximum number of retry attempts (default: 3)

    Returns:
        HTML content as string
    """
    year = season_to_year(season)

    if month:
        url = f"https://www.basketball-reference.com/leagues/NBA_{year}_games-{month}.html"
    else:
        url = f"https://www.basketball-reference.com/leagues/NBA_{year}_games.html"

    print(f"Fetching {url}...")

    for attempt in range(max_retries):
        try:
            resp = requests.get(url, headers=HEADERS, timeout=30)
            resp.raise_for_status()
            return resp.text
        except requests.Timeout:
            if attempt < max_retries - 1:
                backoff_time = 2 ** attempt  # 1s, 2s, 4s
                print(f"  Timeout on attempt {attempt + 1}/{max_retries}. Retrying in {backoff_time}s...")
                sleep(backoff_time)
            else:
                print(f"  Failed after {max_retries} attempts (timeout)")
                return ""
        except requests.RequestException as e:
            print(f"  Error fetching URL: {e}")
            return ""

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
            # Format: Date | Time | Visitor/Neutral | PTS | Home/Neutral | PTS | Box Score | ...
            # Note: Basketball-Reference added a time column around 2025-26
            date_str = cells[0].get_text().strip()

            # Skip if no date (header rows, etc.)
            if not date_str or date_str == "Date":
                continue

            # Check if cells[1] is the time column (format like "6:00p" or empty for older seasons)
            # If it's a time column, shift all indices by 1
            # The time column exists if:
            # 1) It has a colon (actual time like "6:00p"), OR
            # 2) It's empty AND cells[2] is NOT a number (because if cells[2] is a number,
            #    then cells[1] would be the team name, not a time column)
            time_str = cells[1].get_text().strip() if len(cells) > 1 else ""

            # Check if this looks like the time column by looking at cells[2]
            # If cells[2] is text (team name), then cells[1] is a time column (even if empty)
            # If cells[2] is a number (score), then cells[1] is the team name
            cells_2_text = cells[2].get_text().strip() if len(cells) > 2 else ""
            cells_2_is_score = cells_2_text.isdigit()

            has_time_column = ':' in time_str or (not cells_2_is_score and time_str == '')

            offset = 1 if has_time_column else 0

            away_team_name = cells[1 + offset].get_text().strip()
            away_score_str = cells[2 + offset].get_text().strip()
            home_team_name = cells[3 + offset].get_text().strip()
            home_score_str = cells[4 + offset].get_text().strip()

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
    Save season data to JSON file, preserving any scheduled games with null scores.

    Args:
        league: League name ('nba')
        season: Season string (e.g., '1976-77')
        games: List of game dictionaries (completed games only)
    """
    data_dir = Path(__file__).parent.parent / 'data' / league.lower()
    data_dir.mkdir(parents=True, exist_ok=True)

    output_file = data_dir / f'{season}.json'

    # Load existing data to preserve scheduled games
    scheduled_games = []
    if output_file.exists():
        try:
            with open(output_file, 'r') as f:
                existing_data = json.load(f)
                # Keep games with null scores (scheduled games)
                scheduled_games = [
                    g for g in existing_data.get('games', [])
                    if g.get('homeScore') is None
                ]
                if scheduled_games:
                    print(f"Preserving {len(scheduled_games)} scheduled games from existing file")
        except (json.JSONDecodeError, KeyError) as e:
            print(f"Warning: Could not load existing file: {e}")

    # Merge completed games with scheduled games
    # Use a dict to deduplicate by date+teams (completed games override scheduled)
    games_dict = {}

    # Add completed games first
    for game in games:
        key = f"{game['date']}:{game['homeTeam']}:{game['awayTeam']}"
        games_dict[key] = game

    # Add scheduled games if they don't conflict with completed games
    for game in scheduled_games:
        key = f"{game['date']}:{game['homeTeam']}:{game['awayTeam']}"
        if key not in games_dict:
            games_dict[key] = game

    # Convert back to list and sort by date
    all_games = list(games_dict.values())
    all_games.sort(key=lambda g: g['date'])

    season_data = {
        'season': season,
        'league': league.upper(),
        'games': all_games,
        'metadata': {
            'total_games': len(all_games),
            'ingested_at': datetime.now().isoformat(),
            'source': 'basketball-reference.com'
        }
    }

    with open(output_file, 'w') as f:
        json.dump(season_data, f, indent=2)

    completed_count = len([g for g in all_games if g.get('homeScore') is not None])
    scheduled_count = len(all_games) - completed_count

    print(f"Saved {len(all_games)} games to {output_file}")
    if scheduled_count > 0:
        print(f"  ({completed_count} completed, {scheduled_count} scheduled)")


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
