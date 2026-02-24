#!/usr/bin/env python3
"""Find gaps >14 games during NBA, WNBA, and NHL seasons."""

import json
import os
from datetime import datetime, timedelta
from pathlib import Path

def parse_date(date_str):
    """Parse date string to datetime object."""
    return datetime.strptime(date_str, "%Y-%m-%d")

def find_gaps_in_season(file_path, league):
    """Find gaps >14 games during a season (excluding pre/post season gaps)."""
    with open(file_path) as f:
        data = json.load(f)

    season = data.get("season", "")
    games = data.get("games", [])

    if not games:
        return []

    # Sort games by date
    games = sorted(games, key=lambda g: g["date"])

    gaps = []

    for i in range(len(games) - 1):
        current_date = parse_date(games[i]["date"])
        next_date = parse_date(games[i + 1]["date"])
        gap_days = (next_date - current_date).days

        # Count number of games before this gap
        games_before = i + 1
        games_after = len(games) - games_before

        # Only consider gaps where there are significant games before AND after
        # This filters out pre-season and post-season gaps
        if gap_days > 14 and games_before > 10 and games_after > 10:
            gaps.append({
                "league": league,
                "season": season,
                "file": os.path.basename(file_path),
                "gap_days": gap_days,
                "start_date": games[i]["date"],
                "end_date": games[i + 1]["date"],
                "games_before": games_before,
                "games_after": games_after,
            })

    return gaps

def main():
    """Main function to analyze all league files."""
    base_dir = Path("/Users/mort/code/buckle-up/data")

    all_gaps = []

    # Process NBA files
    nba_dir = base_dir / "nba"
    if nba_dir.exists():
        for file_path in sorted(nba_dir.glob("*.json")):
            gaps = find_gaps_in_season(file_path, "NBA")
            all_gaps.extend(gaps)

    # Process WNBA files
    wnba_dir = base_dir / "wnba"
    if wnba_dir.exists():
        for file_path in sorted(wnba_dir.glob("*.json")):
            gaps = find_gaps_in_season(file_path, "WNBA")
            all_gaps.extend(gaps)

    # Process NHL files
    nhl_dir = base_dir / "nhl"
    if nhl_dir.exists():
        for file_path in sorted(nhl_dir.glob("*.json")):
            gaps = find_gaps_in_season(file_path, "NHL")
            all_gaps.extend(gaps)

    # Sort by league, then season, then gap size
    all_gaps.sort(key=lambda x: (x["league"], x["season"], -x["gap_days"]))

    # Print results
    print(f"Found {len(all_gaps)} gaps >14 days during seasons:\n")

    current_league = None
    for gap in all_gaps:
        if gap["league"] != current_league:
            current_league = gap["league"]
            print(f"\n{'='*80}")
            print(f"{current_league}")
            print(f"{'='*80}\n")

        print(f"Season: {gap['season']}")
        print(f"  Gap: {gap['gap_days']} days")
        print(f"  From: {gap['start_date']} to {gap['end_date']}")
        print(f"  Context: {gap['games_before']} games before, {gap['games_after']} games after")
        print()

if __name__ == "__main__":
    main()
