#!/usr/bin/env python3
"""
WNBA Historical Game Ingestion
==============================

Downloads and stores WNBA game data from Basketball-Reference into a single CSV.

Output columns:
  - date (ISO)
  - season (YYYY)
  - game_type (regular/playoff)
  - home_team (3-letter code)
  - away_team (3-letter code)
  - home_score (int)
  - away_score (int)
  - overtimes (int, 0 for none, 1+ for number of OTs)
  - game_id (synthetic: YYYYMMDD_HOME)

Usage:
  python scripts/ingest_wnba.py --start 1997 --end 2024 --out data/wnba/all_games.csv
"""

import argparse
import re
from datetime import datetime
from time import sleep
import os

import pandas as pd
import requests
from bs4 import BeautifulSoup, Comment


HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Referer": "https://www.basketball-reference.com/",
    "DNT": "1",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1"
}


TEAM_NAME_TO_CODE = {
    "Charlotte Sting": "CHA", "Cleveland Rockers": "CLE", "Houston Comets": "HOU",
    "Los Angeles Sparks": "LAS", "New York Liberty": "NYL", "Phoenix Mercury": "PHO",
    "Sacramento Monarchs": "SAC", "Utah Starzz": "UTA", "Washington Mystics": "WAS",
    "Detroit Shock": "DET", "Minnesota Lynx": "MIN", "Orlando Miracle": "ORL",
    "Indiana Fever": "IND", "Miami Sol": "MIA", "Portland Fire": "POR",
    "Seattle Storm": "SEA", "Connecticut Sun": "CON", "San Antonio Silver Stars": "SAS",
    "Chicago Sky": "CHI", "Atlanta Dream": "ATL", "Tulsa Shock": "TUL",
    "San Antonio Stars": "SAS", "Dallas Wings": "DAL", "Las Vegas Aces": "LVA",
}


def parse_overtimes(notes: str) -> int:
    if not isinstance(notes, str):
        return 0
    multi = re.search(r"(\d+)OT", notes)
    if multi:
        return int(multi.group(1))
    return 1 if "OT" in notes else 0


def fetch_page(url: str) -> str:
    resp = requests.get(url, headers=HEADERS, timeout=30)
    if resp.status_code != 200:
        print(f"  [error] Got status {resp.status_code}")
        return ""
    return resp.text


def parse_season_schedule(html: str, season: int) -> pd.DataFrame:
    """Parse schedule table from HTML, handling playoff boundary."""
    soup = BeautifulSoup(html, "lxml")
    
    # Try visible table first
    table = soup.find("table", id="schedule")
    
    # If not visible, check comments
    if table is None:
        comments = soup.find_all(string=lambda text: isinstance(text, Comment))
        for comment in comments:
            if 'id="schedule"' in str(comment):
                comment_soup = BeautifulSoup(str(comment), "lxml")
                table = comment_soup.find("table", id="schedule")
                if table:
                    break
    
    if table is None:
        print(f"  [warning] No schedule table found for {season}")
        return pd.DataFrame()
    
    games = []
    game_type = "regular"
    
    # Process each row
    rows = table.find("tbody").find_all("tr") if table.find("tbody") else []
    
    for row in rows:
        # Check if this is the playoff header
        if "thead" in row.get("class", []):
            cell_text = row.get_text().strip().lower()
            if "playoff" in cell_text:
                game_type = "playoff"
                print(f"  [debug] Switched to playoffs at row")
            continue
        
        cells = row.find_all(["th", "td"])
        if len(cells) < 6:
            continue
        
        # Extract data from cells
        try:
            date_str = cells[0].get_text().strip()
            away_team = cells[1].get_text().strip()
            away_score = cells[2].get_text().strip()
            home_team = cells[3].get_text().strip()
            home_score = cells[4].get_text().strip()
            notes = cells[6].get_text().strip() if len(cells) > 6 else ""
            
            # Skip if scores are empty
            if not away_score or not home_score:
                continue
            
            # Parse date
            game_date = pd.to_datetime(date_str, errors="coerce")
            if pd.isna(game_date):
                continue
            
            # Convert scores
            try:
                away_pts = int(away_score)
                home_pts = int(home_score)
            except ValueError:
                continue
            
            # Map team names
            away_code = TEAM_NAME_TO_CODE.get(away_team, away_team)
            home_code = TEAM_NAME_TO_CODE.get(home_team, home_team)
            
            if away_code == away_team and away_team not in TEAM_NAME_TO_CODE.values():
                print(f"  [warning] Unknown away team: {away_team}")
            if home_code == home_team and home_team not in TEAM_NAME_TO_CODE.values():
                print(f"  [warning] Unknown home team: {home_team}")
            
            games.append({
                "date": game_date,
                "season": season,
                "game_type": game_type,
                "home_team": home_code,
                "away_team": away_code,
                "home_score": home_pts,
                "away_score": away_pts,
                "overtimes": parse_overtimes(notes),
                "game_id": f"{game_date.strftime('%Y%m%d')}_{home_code}",
            })
            
        except Exception as e:
            print(f"  [warning] Failed to parse row: {e}")
            continue
    
    if not games:
        return pd.DataFrame()
    
    df = pd.DataFrame(games)
    df = df.drop_duplicates(subset=["game_id"]).sort_values("date")
    
    reg_count = len(df[df["game_type"] == "regular"])
    playoff_count = len(df[df["game_type"] == "playoff"])
    print(f"  ✓ {season}: {reg_count} regular, {playoff_count} playoff games")
    
    return df


def ingest_all_games(start_year: int, end_year: int) -> pd.DataFrame:
    """Ingest all games from start_year to end_year."""
    all_games = []
    
    for year in range(start_year, end_year + 1):
        url = f"https://www.basketball-reference.com/wnba/years/{year}_games.html"
        print(f"Fetching {year} from {url}")
        
        html = fetch_page(url)
        if not html:
            continue
        
        df = parse_season_schedule(html, year)
        if not df.empty:
            all_games.append(df)
        
        sleep(5.0)
    
    if not all_games:
        print("\n[error] No games found!")
        return pd.DataFrame()
    
    combined = pd.concat(all_games, ignore_index=True)
    combined = combined.sort_values("date").reset_index(drop=True)
    print(f"\n✓ Total games collected: {len(combined):,}")
    return combined


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest WNBA historical game data.")
    current_year = datetime.now().year
    parser.add_argument("--start", type=int, default=1997, help="Start season year")
    parser.add_argument("--end", type=int, default=current_year, help="End season year")
    parser.add_argument("--out", type=str, required=True, help="Output CSV path")
    args = parser.parse_args()

    if args.start > args.end:
        raise SystemExit("--start must be <= --end")

    df = ingest_all_games(args.start, args.end)
    
    if df.empty:
        print("No data to save.")
        return
    
    df["date"] = pd.to_datetime(df["date"]).dt.strftime("%Y-%m-%d")
    os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
    df.to_csv(args.out, index=False)
    print(f"\n✓ Saved {len(df):,} games to {args.out}")
    
    print("\nSummary:")
    summary = df.groupby(["season", "game_type"]).size().reset_index(name="games")
    for _, row in summary.iterrows():
        print(f"  {row['season']} {row['game_type']:8s}: {row['games']:3d} games")


if __name__ == "__main__":
    main()