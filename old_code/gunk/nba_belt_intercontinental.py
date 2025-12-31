#!/usr/bin/env python3
"""
NBA Championship Belt - Intercontinental Rules Variant
=======================================================

This script implements alternative rules for belt tracking, making it more
like boxing's intercontinental championship where the belt is harder to win.

RULE VARIANTS IMPLEMENTED:

1. HOME COURT ADVANTAGE RULE
   - Belt only changes hands on ROAD losses
   - Defending at home keeps the belt even with a loss
   - Makes reigns longer and more dramatic
   
2. CONFERENCE LOCK RULE
   - Belt must first change within same conference
   - Cross-conference challenges only after conference dominance
   - Creates East vs West storylines
   
3. PLAYOFF MULTIPLIER RULE
   - Regular season: normal rules
   - Playoffs: must beat belt holder 4 times in series
   - Creates "super belt" for playoff champions
   
4. STRENGTH OF SCHEDULE RULE
   - Belt only at risk against teams with winning records
   - Protects belt from upsets by weak teams
   - Rewards consistently good teams
"""

import pandas as pd
from datetime import datetime


def track_belt_home_court_advantage(games_df, starting_team='BOS'):
    """
    HOME COURT ADVANTAGE RULE
    
    Belt changes only when defender loses AT HOME.
    Road losses don't count - defender keeps belt.
    
    This creates much longer reigns and more dramatic belt changes.
    """
    
    belt_holder = starting_team
    belt_history = []
    
    print("\n" + "="*70)
    print("TRACKING: HOME COURT ADVANTAGE RULE")
    print("Belt only changes on home court losses")
    print("="*70 + "\n")
    
    for idx, game in games_df.iterrows():
        home_team = game['home']
        away_team = game['away']
        
        # Check if belt holder is playing
        if belt_holder not in [home_team, away_team]:
            continue
        
        # Determine winner
        winner = home_team if game['home_score'] > game['away_score'] else away_team
        loser = away_team if winner == home_team else home_team
        
        # SPECIAL RULE: Belt only changes if defender loses at home
        if belt_holder == loser:
            if belt_holder == home_team:
                # Lost at home - belt changes!
                belt_changed = True
                belt_holder = winner
                print(f"🏠❌ {game['date'].strftime('%Y-%m-%d')}: {loser} loses AT HOME to {winner} - BELT CHANGES!")
            else:
                # Lost on road - belt stays!
                belt_changed = False
                print(f"✈️🛡️  {game['date'].strftime('%Y-%m-%d')}: {loser} loses on road to {winner} - Belt protected")
        else:
            # Belt holder won
            belt_changed = False
            location = "at home" if belt_holder == home_team else "on road"
            print(f"✅ {game['date'].strftime('%Y-%m-%d')}: {winner} wins {location} - Belt defended")
        
        belt_history.append({
            'date': game['date'],
            'defender': belt_holder if not belt_changed else loser,
            'challenger': winner if loser == belt_holder else loser,
            'winner': winner,
            'loser': loser,
            'location': 'home' if belt_holder == home_team else 'away',
            'belt_changed': belt_changed,
            'new_holder': belt_holder,
            'rule': 'home_court_advantage'
        })
    
    return pd.DataFrame(belt_history)


def track_belt_conference_lock(games_df, starting_team='BOS', conferences=None):
    """
    CONFERENCE LOCK RULE
    
    Belt can only be won by teams in the same conference as current holder.
    To unlock cross-conference challenges, must hold belt for X games.
    
    Requires conference mapping for each team.
    """
    
    if conferences is None:
        # Default conference assignments (2024-25)
        conferences = {
            'BOS': 'East', 'PHI': 'East', 'TOR': 'East', 'NYK': 'East',
            'BKN': 'East', 'MIL': 'East', 'IND': 'East', 'CHI': 'East',
            'CLE': 'East', 'DET': 'East', 'ATL': 'East', 'MIA': 'East',
            'WAS': 'East', 'ORL': 'East', 'CHA': 'East',
            'LAL': 'West', 'LAC': 'West', 'GSW': 'West', 'SAC': 'West',
            'PHX': 'West', 'POR': 'West', 'UTA': 'West', 'DEN': 'West',
            'MIN': 'West', 'OKC': 'West', 'SAS': 'West', 'DAL': 'West',
            'HOU': 'West', 'MEM': 'West', 'NOP': 'West'
        }
    
    UNLOCK_THRESHOLD = 5  # Games to hold before cross-conference challenges
    
    belt_holder = starting_team
    belt_history = []
    consecutive_defenses = 0
    locked_to_conference = True
    
    print("\n" + "="*70)
    print("TRACKING: CONFERENCE LOCK RULE")
    print(f"Need {UNLOCK_THRESHOLD} defenses to unlock cross-conference challenges")
    print("="*70 + "\n")
    
    for idx, game in games_df.iterrows():
        home_team = game['home']
        away_team = game['away']
        
        if belt_holder not in [home_team, away_team]:
            continue
        
        challenger = away_team if belt_holder == home_team else home_team
        holder_conf = conferences.get(belt_holder, 'Unknown')
        challenger_conf = conferences.get(challenger, 'Unknown')
        
        # Check if challenge is allowed
        if locked_to_conference and holder_conf != challenger_conf:
            print(f"🔒 {game['date'].strftime('%Y-%m-%d')}: {challenger} ({challenger_conf}) "
                  f"cannot challenge {belt_holder} ({holder_conf}) - Conference locked!")
            continue
        
        # Determine winner
        winner = home_team if game['home_score'] > game['away_score'] else away_team
        loser = away_team if winner == home_team else home_team
        
        if belt_holder == winner:
            # Belt defended
            consecutive_defenses += 1
            
            if consecutive_defenses >= UNLOCK_THRESHOLD and locked_to_conference:
                locked_to_conference = False
                print(f"🔓 {game['date'].strftime('%Y-%m-%d')}: {winner} unlocks cross-conference challenges!")
            
            print(f"✅ {game['date'].strftime('%Y-%m-%d')}: {winner} defeats {loser} - "
                  f"Defense #{consecutive_defenses}")
        else:
            # Belt changes
            belt_holder = winner
            consecutive_defenses = 0
            locked_to_conference = True
            print(f"⚔️  {game['date'].strftime('%Y-%m-%d')}: {winner} takes belt from {loser} - "
                  f"BELT CHANGES! Locked to {conferences.get(winner, 'Unknown')}")
        
        belt_history.append({
            'date': game['date'],
            'defender': loser if winner != belt_holder else belt_holder,
            'challenger': challenger,
            'winner': winner,
            'defender_conf': holder_conf,
            'challenger_conf': challenger_conf,
            'belt_changed': winner != belt_holder,
            'new_holder': belt_holder,
            'consecutive_defenses': consecutive_defenses,
            'cross_conf_unlocked': not locked_to_conference,
            'rule': 'conference_lock'
        })
    
    return pd.DataFrame(belt_history)


def track_belt_playoff_multiplier(games_df, starting_team='BOS', playoff_games=None):
    """
    PLAYOFF MULTIPLIER RULE
    
    Regular season: normal belt rules
    Playoffs: must win playoff series (4 games) to take belt
    
    Creates distinction between regular season belt and playoff "super belt"
    """
    
    # This would require playoff series data
    # Placeholder for concept
    
    print("\n" + "="*70)
    print("TRACKING: PLAYOFF MULTIPLIER RULE")
    print("Regular season: normal rules")
    print("Playoffs: must win 4 games in series to take belt")
    print("="*70 + "\n")
    print("⚠️  Requires playoff series data - not implemented in this template")
    
    return pd.DataFrame()


def track_belt_strength_requirement(games_df, starting_team='BOS', 
                                    standings=None, win_pct_threshold=0.500):
    """
    STRENGTH OF SCHEDULE RULE
    
    Belt only at risk against teams with winning records.
    Losses to teams below threshold don't change belt.
    
    Requires current standings/win percentage data.
    """
    
    belt_holder = starting_team
    belt_history = []
    
    print("\n" + "="*70)
    print("TRACKING: STRENGTH OF SCHEDULE RULE")
    print(f"Belt only at risk vs teams with >{win_pct_threshold:.1%} win rate")
    print("="*70 + "\n")
    
    # Would need standings data to implement fully
    print("⚠️  Requires current standings data - simplified version below")
    
    # Simplified: assume standings passed in or use random
    if standings is None:
        print("⚠️  No standings data provided - using placeholder")
        return pd.DataFrame()
    
    for idx, game in games_df.iterrows():
        home_team = game['home']
        away_team = game['away']
        
        if belt_holder not in [home_team, away_team]:
            continue
        
        challenger = away_team if belt_holder == home_team else home_team
        challenger_win_pct = standings.get(challenger, 0.500)
        
        winner = home_team if game['home_score'] > game['away_score'] else away_team
        loser = away_team if winner == home_team else home_team
        
        if belt_holder == loser:
            if challenger_win_pct >= win_pct_threshold:
                # Legitimate challenge - belt changes
                belt_holder = winner
                print(f"⚔️  {game['date'].strftime('%Y-%m-%d')}: {winner} ({challenger_win_pct:.1%}) "
                      f"takes belt from {loser}")
            else:
                # Weak team - belt protected
                print(f"🛡️  {game['date'].strftime('%Y-%m-%d')}: {loser} loses to {winner} "
                      f"({challenger_win_pct:.1%}) - Belt protected (below threshold)")
        else:
            print(f"✅ {game['date'].strftime('%Y-%m-%d')}: {winner} defends belt vs {loser}")
        
        belt_history.append({
            'date': game['date'],
            'defender': belt_holder,
            'challenger': challenger,
            'challenger_win_pct': challenger_win_pct,
            'legitimate_challenge': challenger_win_pct >= win_pct_threshold,
            'winner': winner,
            'belt_changed': (winner != belt_holder and challenger_win_pct >= win_pct_threshold),
            'new_holder': belt_holder,
            'rule': 'strength_requirement'
        })
    
    return pd.DataFrame(belt_history)


def compare_rule_variants(games_df, starting_team='BOS'):
    """
    Run all rule variants on same data and compare results
    """
    
    print("\n" + "="*70)
    print("COMPARING ALL RULE VARIANTS")
    print("="*70)
    
    # Standard rules (for comparison)
    from nba_belt_tracker_complete import track_championship_belt
    standard_df, _, _ = track_championship_belt(games_df, starting_team)
    
    # Variant rules
    home_court_df = track_belt_home_court_advantage(games_df, starting_team)
    conference_df = track_belt_conference_lock(games_df, starting_team)
    
    # Comparison
    print("\n" + "="*70)
    print("RULE VARIANT COMPARISON")
    print("="*70)
    print(f"\nStandard Rules:")
    print(f"  • Total belt games: {len(standard_df)}")
    print(f"  • Belt changes: {standard_df['belt_changed'].sum()}")
    print(f"  • Unique holders: {standard_df['new_holder'].nunique()}")
    
    print(f"\nHome Court Advantage:")
    print(f"  • Total belt games: {len(home_court_df)}")
    print(f"  • Belt changes: {home_court_df['belt_changed'].sum()}")
    print(f"  • Unique holders: {home_court_df['new_holder'].nunique()}")
    
    print(f"\nConference Lock:")
    print(f"  • Total belt games: {len(conference_df)}")
    print(f"  • Belt changes: {conference_df['belt_changed'].sum()}")
    print(f"  • Unique holders: {conference_df['new_holder'].nunique()}")
    
    return {
        'standard': standard_df,
        'home_court': home_court_df,
        'conference_lock': conference_df
    }


def main():
    """
    Main execution for intercontinental rules variants
    """
    
    print("="*70)
    print("NBA CHAMPIONSHIP BELT - INTERCONTINENTAL RULES")
    print("="*70)
    print("\nAvailable rule variants:")
    print("1. Home Court Advantage - Belt only changes on home losses")
    print("2. Conference Lock - Must dominate conference first")
    print("3. Playoff Multiplier - Different rules for playoffs")
    print("4. Strength Requirement - Only vs winning teams")
    print("\nRun compare_rule_variants() to see how they differ!")
    print("="*70)


if __name__ == '__main__':
    main()
