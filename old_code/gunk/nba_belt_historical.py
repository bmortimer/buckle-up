#!/usr/bin/env python3
"""
NBA Championship Belt - Historical Tracker (1947-Present or 1976-Present)
=========================================================================

This script tracks the championship belt through NBA history.

Two options:
1. Start from 1947 (Philadelphia Warriors) - Complete NBA history
2. Start from 1976 (Portland Trail Blazers) - Post-merger era

IMPORTANT: This requires historical game data, which needs different data sources
than current season tracking.

Data Sources:
- Basketball-Reference.com (preferred for historical data)
- sports-reference Python package
- Manual CSV import from historical records
"""

import pandas as pd
from datetime import datetime
import requests
from time import sleep

# Team relocations and name changes
TEAM_RELOCATIONS = {
    # Format: 'OLD_NAME': ('NEW_NAME', year_changed)
    'MNL': ('LAL', 1960),  # Minneapolis Lakers → LA Lakers
    'PHW': ('GSW', 1962),  # Philadelphia Warriors → SF Warriors → GS Warriors
    'SYR': ('PHI', 1963),  # Syracuse Nationals → Philadelphia 76ers
    'STL': ('ATL', 1968),  # St. Louis Hawks → Atlanta Hawks
    'SAN': ('SAS', 1973),  # San Antonio - from ABA
    'KCO': ('SAC', 1985),  # Kansas City Kings → Sacramento Kings
    'SDC': ('LAC', 1984),  # San Diego Clippers → LA Clippers
    'NJN': ('BKN', 2012),  # New Jersey Nets → Brooklyn Nets
    'SEA': ('OKC', 2008),  # Seattle SuperSonics → Oklahoma City Thunder
    'VAN': ('MEM', 2001),  # Vancouver Grizzlies → Memphis Grizzlies
    'CHA': ('NOP', 2013),  # Charlotte Bobcats → New Orleans Pelicans
    'NOH': ('NOP', 2013),  # New Orleans Hornets → New Orleans Pelicans
}

# NBA Champions by Year (for starting points)
NBA_CHAMPIONS = {
    1947: 'PHW',  # Philadelphia Warriors
    1948: 'BAL',  # Baltimore Bullets
    1949: 'MNL',  # Minneapolis Lakers
    1950: 'MNL',  # Minneapolis Lakers
    # ... (complete list needed)
    1976: 'BOS',  # Boston Celtics
    1977: 'POR',  # Portland Trail Blazers
    1978: 'WAS',  # Washington Bullets
    # ... (complete list needed)
    2023: 'DEN',  # Denver Nuggets
    2024: 'BOS',  # Boston Celtics
}


def get_historical_games(season_start_year, season_end_year):
    """
    Fetch historical game data for given season range.
    
    NOTE: This is a template. You'll need to implement data fetching
    from your chosen source.
    
    Options:
    1. Basketball-Reference scraping (requires BeautifulSoup)
    2. sports-reference package
    3. Manual CSV import
    4. Database with historical data
    """
    
    all_games = []
    
    for year in range(season_start_year, season_end_year + 1):
        print(f"Fetching {year}-{year+1} season data...")
        
        # OPTION 1: Basketball-Reference (pseudo-code)
        # url = f"https://www.basketball-reference.com/leagues/NBA_{year+1}_games.html"
        # games = scrape_basketball_reference(url)
        # all_games.extend(games)
        
        # OPTION 2: Pre-downloaded CSV files
        # try:
        #     season_df = pd.read_csv(f"data/nba_games_{year}_{year+1}.csv")
        #     all_games.append(season_df)
        # except FileNotFoundError:
        #     print(f"Warning: No data file for {year}-{year+1}")
        
        # OPTION 3: API (if available)
        # games = fetch_from_historical_api(year)
        # all_games.extend(games)
        
        # Rate limiting
        sleep(1)
    
    return pd.DataFrame(all_games)


def normalize_team_name(team_abbr, year):
    """Convert historical team names to modern equivalents"""
    
    for old_name, (new_name, change_year) in TEAM_RELOCATIONS.items():
        if team_abbr == old_name and year >= change_year:
            return new_name
    
    return team_abbr


def track_historical_belt(games_df, starting_year=1947):
    """
    Track belt through historical games.
    
    Similar to current season tracker, but handles:
    - Team relocations
    - Defunct franchises
    - Data quality issues
    - Multi-decade spans
    """
    
    # Get starting champion
    starting_team = NBA_CHAMPIONS.get(starting_year)
    if not starting_team:
        raise ValueError(f"No champion data for {starting_year}")
    
    print(f"Starting historical tracking from {starting_year}")
    print(f"Initial belt holder: {starting_team}")
    
    belt_holder = starting_team
    belt_history = []
    
    # Sort games chronologically
    games_df = games_df.sort_values('date')
    
    for idx, game in games_df.iterrows():
        # Normalize team names for this year
        year = game['date'].year
        home_team = normalize_team_name(game['home_team'], year)
        away_team = normalize_team_name(game['away_team'], year)
        
        # Check if belt holder is playing
        if belt_holder not in [home_team, away_team]:
            continue
        
        # Determine winner
        if game['home_score'] > game['away_score']:
            winner = home_team
            loser = away_team
        else:
            winner = away_team
            loser = home_team
        
        # Record belt game
        belt_history.append({
            'date': game['date'],
            'season': f"{year-1}-{year}" if game['date'].month < 7 else f"{year}-{year+1}",
            'defender': belt_holder,
            'challenger': away_team if belt_holder == home_team else home_team,
            'winner': winner,
            'loser': loser,
            'belt_changed': winner != belt_holder,
            'new_holder': winner
        })
        
        # Update belt holder
        if winner != belt_holder:
            belt_holder = winner
    
    return pd.DataFrame(belt_history)


def generate_historical_summary(belt_df):
    """Generate summary statistics for historical belt data"""
    
    summary = {
        'total_games': len(belt_df),
        'total_changes': belt_df['belt_changed'].sum(),
        'years_covered': belt_df['date'].dt.year.nunique(),
        'date_range': f"{belt_df['date'].min()} to {belt_df['date'].max()}",
        
        # By team
        'games_by_team': belt_df['new_holder'].value_counts().to_dict(),
        
        # By decade
        'games_by_decade': belt_df.groupby(
            belt_df['date'].dt.year // 10 * 10
        ).size().to_dict(),
        
        # Longest reigns
        # ... calculate longest consecutive runs
        
        # Most changes in a season
        # ... calculate by season
    }
    
    return summary


def main():
    """
    Main execution for historical belt tracking
    
    IMPLEMENTATION STEPS:
    1. Choose starting year (1947 or 1976)
    2. Implement data fetching (see get_historical_games)
    3. Run tracking
    4. Generate visualizations
    5. Export results
    """
    
    print("="*70)
    print("NBA HISTORICAL CHAMPIONSHIP BELT TRACKER")
    print("="*70)
    print()
    print("⚠️  This is a TEMPLATE - implementation required!")
    print()
    print("Steps to complete:")
    print("1. Choose data source (Basketball-Reference, CSV files, etc.)")
    print("2. Implement get_historical_games() function")
    print("3. Verify team name mappings in TEAM_RELOCATIONS")
    print("4. Add all champions to NBA_CHAMPIONS dictionary")
    print("5. Test on small date range first")
    print()
    
    # Example usage (once implemented):
    # games_df = get_historical_games(1976, 2024)
    # belt_df = track_historical_belt(games_df, starting_year=1976)
    # summary = generate_historical_summary(belt_df)
    # 
    # belt_df.to_csv('nba_belt_1976_2024.csv', index=False)
    # print(f"Tracked {len(belt_df)} belt games across {summary['years_covered']} years")


if __name__ == '__main__':
    main()


# SAMPLE DATA STRUCTURE NEEDED:
# 
# games_df columns:
# - date: datetime
# - home_team: str (3-letter abbreviation)
# - away_team: str (3-letter abbreviation)  
# - home_score: int
# - away_score: int
# - season: str (e.g., "1976-77")
# - game_id: str (unique identifier)
#
# Example:
# date,home_team,away_team,home_score,away_score,season,game_id
# 1976-10-22,BOS,CLE,111,105,1976-77,197610220BOS
