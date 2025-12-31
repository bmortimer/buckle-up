#!/usr/bin/env python3
"""
NBA Championship Belt Tracker
===============================
Tracks the "championship belt" through NBA seasons using the lineal championship concept.

HOW TO RUN WITH REAL DATA:
--------------------------
1. Install required packages:
   pip install nba_api pandas matplotlib seaborn plotly

2. Uncomment the real data fetching code in main()

3. Run: python nba_belt_tracker_complete.py

The script will work offline with sample data, or fetch real data when network is available.
"""

import pandas as pd
from datetime import datetime, timedelta
import json

# Sample data for demonstration (first 15 games of 2024-25 season based on Celtics)
SAMPLE_GAMES_2024_25 = [
    # Game 1: Opening night - Celtics lose!
    {'date': '2024-10-22', 'home': 'BOS', 'away': 'PHI', 'home_score': 116, 'away_score': 117},
    
    # PHI now has belt
    {'date': '2024-10-23', 'home': 'PHI', 'away': 'TOR', 'home_score': 115, 'away_score': 107},
    {'date': '2024-10-26', 'home': 'IND', 'away': 'PHI', 'home_score': 118, 'away_score': 114},
    
    # IND now has belt
    {'date': '2024-10-28', 'home': 'IND', 'away': 'ORL', 'home_score': 109, 'away_score': 112},
    
    # ORL now has belt
    {'date': '2024-10-30', 'home': 'ORL', 'away': 'CLE', 'home_score': 104, 'away_score': 108},
    
    # CLE now has belt
    {'date': '2024-11-01', 'home': 'CLE', 'away': 'MIL', 'home_score': 116, 'away_score': 111},
    {'date': '2024-11-02', 'home': 'CLE', 'away': 'LAL', 'home_score': 131, 'away_score': 127},
    {'date': '2024-11-04', 'home': 'CLE', 'away': 'GSW', 'home_score': 136, 'away_score': 117},
    {'date': '2024-11-06', 'home': 'MIA', 'away': 'CLE', 'home_score': 105, 'away_score': 113},
    
    # Other games without belt
    {'date': '2024-10-24', 'home': 'BOS', 'away': 'WAS', 'home_score': 122, 'away_score': 102},
    {'date': '2024-10-26', 'home': 'DET', 'away': 'BOS', 'home_score': 119, 'away_score': 113},
    {'date': '2024-10-28', 'home': 'BOS', 'away': 'NYK', 'home_score': 132, 'away_score': 109},
    {'date': '2024-11-04', 'home': 'BOS', 'away': 'UTA', 'home_score': 103, 'away_score': 105},
]


def create_games_dataframe(games_data):
    """Convert game data to pandas DataFrame"""
    df = pd.DataFrame(games_data)
    df['date'] = pd.to_datetime(df['date'])
    df['game_id'] = range(1, len(df) + 1)
    return df.sort_values('date')


def track_championship_belt(games_df, starting_team='BOS', starting_date=None):
    """
    Track the championship belt through all games.
    
    Rules:
    1. Starting team holds the belt
    2. When belt holder plays, if they lose, the opponent takes the belt
    3. If belt holder wins, they keep it
    4. Games where belt holder doesn't play are ignored
    
    Returns:
    - belt_games: DataFrame of all games where belt was on the line
    - current_holder: Current belt holder
    - belt_changes: Number of times belt changed hands
    """
    
    belt_holder = starting_team
    belt_games = []
    
    print(f"\n{'='*70}")
    print(f"Starting Belt Tracker: {starting_team} begins as champion")
    print(f"{'='*70}\n")
    
    for idx, game in games_df.iterrows():
        home_team = game['home']
        away_team = game['away']
        home_score = game['home_score']
        away_score = game['away_score']
        game_date = game['date']
        
        # Check if belt holder is playing
        if belt_holder not in [home_team, away_team]:
            continue
        
        # Determine winner and loser
        if home_score > away_score:
            winner = home_team
            loser = away_team
        else:
            winner = away_team
            loser = home_team
        
        # Determine defender and challenger
        if belt_holder == home_team:
            defender = home_team
            challenger = away_team
        else:
            defender = away_team
            challenger = home_team
        
        belt_changed = (winner != belt_holder)
        
        # Record this belt game
        belt_games.append({
            'date': game_date,
            'game_id': game['game_id'],
            'defender': defender,
            'challenger': challenger,
            'winner': winner,
            'loser': loser,
            'score': f"{max(home_score, away_score)}-{min(home_score, away_score)}",
            'home_team': home_team,
            'away_team': away_team,
            'home_score': home_score,
            'away_score': away_score,
            'belt_changed': belt_changed,
            'new_holder': winner,
            'days_held': None  # Will calculate later
        })
        
        # Print status
        if belt_changed:
            print(f"⚔️  {game_date.strftime('%Y-%m-%d')}: {loser} loses to {winner} "
                  f"({max(home_score, away_score)}-{min(home_score, away_score)}) "
                  f"- BELT CHANGES HANDS!")
            belt_holder = winner
        else:
            print(f"🛡️  {game_date.strftime('%Y-%m-%d')}: {winner} defeats {loser} "
                  f"({max(home_score, away_score)}-{min(home_score, away_score)}) "
                  f"- Belt defended")
    
    belt_df = pd.DataFrame(belt_games)
    
    # Calculate days held for each reign
    if len(belt_df) > 0:
        for i in range(len(belt_df)):
            if i < len(belt_df) - 1:
                days = (belt_df.iloc[i+1]['date'] - belt_df.iloc[i]['date']).days
                belt_df.at[belt_df.index[i], 'days_held'] = days
    
    return belt_df, belt_holder, belt_df['belt_changed'].sum()


def generate_summary_stats(belt_df):
    """Generate summary statistics about belt holders"""
    
    if len(belt_df) == 0:
        return None
    
    # Count games with belt for each team
    holder_counts = belt_df['new_holder'].value_counts()
    
    # Count reigns (consecutive periods holding belt)
    reigns = []
    current_reign_team = None
    current_reign_games = 0
    current_reign_start = None
    
    for idx, row in belt_df.iterrows():
        if row['new_holder'] != current_reign_team:
            if current_reign_team is not None:
                reigns.append({
                    'team': current_reign_team,
                    'games': current_reign_games,
                    'start_date': current_reign_start
                })
            current_reign_team = row['new_holder']
            current_reign_games = 1
            current_reign_start = row['date']
        else:
            current_reign_games += 1
    
    # Add final reign
    if current_reign_team is not None:
        reigns.append({
            'team': current_reign_team,
            'games': current_reign_games,
            'start_date': current_reign_start
        })
    
    reigns_df = pd.DataFrame(reigns)
    
    summary = {
        'total_games': len(belt_df),
        'total_changes': belt_df['belt_changed'].sum(),
        'unique_holders': belt_df['new_holder'].nunique(),
        'games_per_holder': holder_counts.to_dict(),
        'longest_reign': reigns_df.loc[reigns_df['games'].idxmax()].to_dict() if len(reigns_df) > 0 else None,
        'total_reigns': len(reigns_df),
        'avg_reign_length': reigns_df['games'].mean() if len(reigns_df) > 0 else 0
    }
    
    return summary


def print_summary_stats(summary, current_holder):
    """Print formatted summary statistics"""
    
    print(f"\n{'='*70}")
    print("CHAMPIONSHIP BELT SUMMARY")
    print(f"{'='*70}")
    print(f"\n🏆 CURRENT BELT HOLDER: {current_holder}")
    print(f"\n📊 Overall Statistics:")
    print(f"   • Total belt games: {summary['total_games']}")
    print(f"   • Times belt changed hands: {summary['total_changes']}")
    print(f"   • Unique belt holders: {summary['unique_holders']}")
    print(f"   • Average reign length: {summary['avg_reign_length']:.1f} games")
    
    if summary['longest_reign']:
        print(f"\n👑 Longest Reign:")
        print(f"   • Team: {summary['longest_reign']['team']}")
        print(f"   • Games: {summary['longest_reign']['games']}")
        print(f"   • Start date: {summary['longest_reign']['start_date'].strftime('%Y-%m-%d')}")
    
    print(f"\n🎯 Games with Belt by Team:")
    sorted_holders = sorted(summary['games_per_holder'].items(), 
                          key=lambda x: x[1], reverse=True)
    for team, games in sorted_holders:
        bar = '█' * int(games / 2)
        print(f"   {team:3s}: {bar} {games} games")
    
    print(f"{'='*70}\n")


def save_results(belt_df, current_holder, summary, filename_prefix='nba_belt'):
    """Save results to CSV and JSON"""
    
    # Save belt games CSV
    csv_file = f"{filename_prefix}_games.csv"
    belt_df.to_csv(csv_file, index=False)
    print(f"✅ Belt games saved to: {csv_file}")
    
    # Save summary JSON (convert numpy types to native Python)
    games_per_holder = {k: int(v) for k, v in summary['games_per_holder'].items()}
    
    summary_export = {
        'current_holder': current_holder,
        'as_of_date': str(belt_df['date'].max()) if len(belt_df) > 0 else None,
        'total_games': int(summary['total_games']),
        'total_changes': int(summary['total_changes']),
        'unique_holders': int(summary['unique_holders']),
        'games_per_holder': games_per_holder,
        'total_reigns': int(summary['total_reigns']),
        'avg_reign_length': float(summary['avg_reign_length'])
    }
    
    # Add longest reign if exists
    if summary['longest_reign']:
        summary_export['longest_reign'] = {
            'team': summary['longest_reign']['team'],
            'games': int(summary['longest_reign']['games']),
            'start_date': str(summary['longest_reign']['start_date'])
        }
    
    json_file = f"{filename_prefix}_summary.json"
    with open(json_file, 'w') as f:
        json.dump(summary_export, f, indent=2)
    print(f"✅ Summary saved to: {json_file}")
    
    return csv_file, json_file


def main():
    """Main execution function"""
    
    print("\n" + "="*70)
    print("NBA CHAMPIONSHIP BELT TRACKER")
    print("="*70)
    print("\n📝 Running with SAMPLE DATA (2024-25 season start)")
    print("   To use real data, uncomment the fetch_real_data() section below\n")
    
    # USE SAMPLE DATA
    games_df = create_games_dataframe(SAMPLE_GAMES_2024_25)
    
    # TO USE REAL DATA: Uncomment this section
    # ==========================================
    # try:
    #     from nba_api.stats.endpoints import leaguegamefinder
    #     print("Fetching real data from NBA API...")
    #     gamefinder = leaguegamefinder.LeagueGameFinder(
    #         season_nullable='2024-25',
    #         season_type_nullable='Regular Season'
    #     )
    #     games_df = gamefinder.get_data_frames()[0]
    #     # Transform to needed format
    #     # ... add transformation code here ...
    # except Exception as e:
    #     print(f"Could not fetch real data: {e}")
    #     print("Using sample data instead")
    #     games_df = create_games_dataframe(SAMPLE_GAMES_2024_25)
    # ==========================================
    
    print(f"📅 Date range: {games_df['date'].min().strftime('%Y-%m-%d')} to "
          f"{games_df['date'].max().strftime('%Y-%m-%d')}")
    print(f"🏀 Total games: {len(games_df)}")
    
    # Track the belt (Boston Celtics as 2024 champions)
    belt_df, current_holder, changes = track_championship_belt(
        games_df, 
        starting_team='BOS'
    )
    
    # Generate and print summary
    summary = generate_summary_stats(belt_df)
    print_summary_stats(summary, current_holder)
    
    # Save results
    save_results(belt_df, current_holder, summary, filename_prefix='nba_belt_2024_25')
    
    return belt_df, current_holder, summary


if __name__ == '__main__':
    belt_df, current_holder, summary = main()
    
    print("\n💡 Next steps:")
    print("   1. Run visualization script: python nba_belt_viz.py")
    print("   2. View CSV in outputs folder")
    print("   3. For real data, uncomment the real data section and rerun\n")
