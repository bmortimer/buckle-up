#!/usr/bin/env python3
"""
NBA Championship Belt Visualizations
====================================
Creates interactive and static visualizations of belt tracking data.

Visualizations included:
1. Belt timeline showing all holders
2. Bar chart of games with belt by team
3. Reign length distribution
4. Interactive plotly dashboard
"""

import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import json

# Team colors (NBA official colors)
TEAM_COLORS = {
    'BOS': '#007A33',  # Celtics green
    'PHI': '#006BB6',  # 76ers blue
    'IND': '#002D62',  # Pacers navy
    'ORL': '#0077C0',  # Magic blue
    'CLE': '#860038',  # Cavaliers wine
    'MIL': '#00471B',  # Bucks green
    'LAL': '#552583',  # Lakers purple
    'GSW': '#1D428A',  # Warriors blue
    'MIA': '#98002E',  # Heat red
    'TOR': '#CE1141',  # Raptors red
    'WAS': '#002B5C',  # Wizards navy
    'NYK': '#F58426',  # Knicks orange
    'DET': '#C8102E',  # Pistons red
    'UTA': '#002B5C',  # Jazz navy
}


def load_data(csv_file='nba_belt_2024_25_games.csv', 
              json_file='nba_belt_2024_25_summary.json'):
    """Load belt tracking data"""
    
    belt_df = pd.read_csv(csv_file)
    belt_df['date'] = pd.to_datetime(belt_df['date'])
    
    with open(json_file, 'r') as f:
        summary = json.load(f)
    
    return belt_df, summary


def create_timeline_plot(belt_df, output_file='belt_timeline.png'):
    """Create a timeline showing belt holders"""
    
    fig, ax = plt.subplots(figsize=(16, 8))
    
    # Plot each game as a segment
    for idx, row in belt_df.iterrows():
        team = row['new_holder']
        date = row['date']
        
        # Get team color
        color = TEAM_COLORS.get(team, '#333333')
        
        # Draw vertical line for each game
        ax.plot([date, date], [0, 1], color=color, linewidth=4, alpha=0.8)
        
        # Add team label
        if idx == 0 or belt_df.iloc[idx-1]['new_holder'] != team:
            ax.text(date, 1.05, team, rotation=45, fontsize=10, 
                   fontweight='bold', color=color)
    
    # Formatting
    ax.set_ylim(-0.1, 1.3)
    ax.set_xlim(belt_df['date'].min(), belt_df['date'].max())
    ax.set_xlabel('Date', fontsize=14, fontweight='bold')
    ax.set_title('NBA Championship Belt Timeline', fontsize=18, fontweight='bold', pad=20)
    ax.set_yticks([])
    
    # Format x-axis
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%m/%d'))
    ax.xaxis.set_major_locator(mdates.DayLocator(interval=3))
    plt.xticks(rotation=45)
    
    # Add grid
    ax.grid(axis='x', alpha=0.3, linestyle='--')
    
    # Add legend
    legend_teams = belt_df['new_holder'].unique()
    legend_elements = [plt.Line2D([0], [0], color=TEAM_COLORS.get(team, '#333333'), 
                                   lw=4, label=team) for team in legend_teams]
    ax.legend(handles=legend_elements, loc='upper left', ncol=len(legend_teams))
    
    plt.tight_layout()
    plt.savefig(output_file, dpi=300, bbox_inches='tight')
    print(f"📊 Timeline saved to: {output_file}")
    plt.close()


def create_games_bar_chart(summary, output_file='games_per_team.png'):
    """Create bar chart of games with belt per team"""
    
    games_data = summary['games_per_holder']
    teams = list(games_data.keys())
    games = list(games_data.values())
    colors = [TEAM_COLORS.get(team, '#333333') for team in teams]
    
    # Sort by games
    sorted_data = sorted(zip(teams, games, colors), key=lambda x: x[1], reverse=True)
    teams, games, colors = zip(*sorted_data)
    
    fig, ax = plt.subplots(figsize=(12, 6))
    bars = ax.bar(teams, games, color=colors, alpha=0.8, edgecolor='black', linewidth=1.5)
    
    # Add value labels on bars
    for bar in bars:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height,
                f'{int(height)}',
                ha='center', va='bottom', fontweight='bold', fontsize=12)
    
    ax.set_xlabel('Team', fontsize=14, fontweight='bold')
    ax.set_ylabel('Games with Belt', fontsize=14, fontweight='bold')
    ax.set_title('Championship Belt - Games per Team', fontsize=16, fontweight='bold', pad=15)
    ax.grid(axis='y', alpha=0.3, linestyle='--')
    
    plt.tight_layout()
    plt.savefig(output_file, dpi=300, bbox_inches='tight')
    print(f"📊 Bar chart saved to: {output_file}")
    plt.close()


def create_interactive_dashboard(belt_df, summary, output_file='belt_dashboard.html'):
    """Create interactive Plotly dashboard"""
    
    # Create subplots
    fig = make_subplots(
        rows=2, cols=2,
        subplot_titles=('Belt Timeline', 'Games per Team', 
                       'Belt Changes Over Time', 'Current Status'),
        specs=[[{"type": "scatter"}, {"type": "bar"}],
               [{"type": "scatter"}, {"type": "indicator"}]],
        row_heights=[0.6, 0.4]
    )
    
    # 1. Timeline
    for team in belt_df['new_holder'].unique():
        team_data = belt_df[belt_df['new_holder'] == team]
        fig.add_trace(
            go.Scatter(
                x=team_data['date'],
                y=[1] * len(team_data),
                mode='markers+text',
                name=team,
                marker=dict(
                    size=15,
                    color=TEAM_COLORS.get(team, '#333333'),
                    line=dict(width=2, color='white')
                ),
                text=team,
                textposition='top center',
                hovertemplate='%{text}<br>%{x}<extra></extra>'
            ),
            row=1, col=1
        )
    
    # 2. Games per team bar chart
    games_data = summary['games_per_holder']
    teams = list(games_data.keys())
    games = list(games_data.values())
    colors = [TEAM_COLORS.get(team, '#333333') for team in teams]
    
    fig.add_trace(
        go.Bar(
            x=teams,
            y=games,
            marker_color=colors,
            text=games,
            textposition='outside',
            name='Games'
        ),
        row=1, col=2
    )
    
    # 3. Cumulative belt changes
    belt_df['cumulative_changes'] = belt_df['belt_changed'].cumsum()
    fig.add_trace(
        go.Scatter(
            x=belt_df['date'],
            y=belt_df['cumulative_changes'],
            mode='lines+markers',
            name='Belt Changes',
            line=dict(color='#FF6B6B', width=3),
            marker=dict(size=8),
            fill='tozeroy'
        ),
        row=2, col=1
    )
    
    # 4. Current holder indicator
    fig.add_trace(
        go.Indicator(
            mode="number+delta",
            value=summary['total_games'],
            title={"text": f"Current Holder: {summary['current_holder']}<br>"
                          f"<span style='font-size:0.8em'>Total Belt Games</span>"},
            delta={'reference': summary['total_changes'], 'relative': False},
            domain={'x': [0, 1], 'y': [0, 1]}
        ),
        row=2, col=2
    )
    
    # Update layout
    fig.update_layout(
        title_text="NBA Championship Belt Dashboard",
        title_font_size=24,
        showlegend=True,
        height=900,
        hovermode='closest'
    )
    
    fig.update_xaxes(title_text="Date", row=1, col=1)
    fig.update_xaxes(title_text="Team", row=1, col=2)
    fig.update_xaxes(title_text="Date", row=2, col=1)
    
    fig.update_yaxes(title_text="", row=1, col=1, showticklabels=False)
    fig.update_yaxes(title_text="Games", row=1, col=2)
    fig.update_yaxes(title_text="Total Changes", row=2, col=1)
    
    # Save
    fig.write_html(output_file)
    print(f"📊 Interactive dashboard saved to: {output_file}")


def create_flow_diagram(belt_df, output_file='belt_flow.html'):
    """Create a Sankey diagram showing belt flow between teams"""
    
    # Create source->target pairs
    transitions = []
    for i in range(len(belt_df) - 1):
        if belt_df.iloc[i]['new_holder'] != belt_df.iloc[i+1]['new_holder']:
            transitions.append((
                belt_df.iloc[i]['new_holder'],
                belt_df.iloc[i+1]['new_holder']
            ))
    
    if not transitions:
        print("⚠️  Not enough transitions for flow diagram")
        return
    
    # Count transitions
    from collections import Counter
    transition_counts = Counter(transitions)
    
    # Get unique teams
    all_teams = sorted(list(set([t[0] for t in transitions] + [t[1] for t in transitions])))
    team_indices = {team: idx for idx, team in enumerate(all_teams)}
    
    # Create Sankey data
    sources = [team_indices[t[0]] for t in transition_counts.keys()]
    targets = [team_indices[t[1]] for t in transition_counts.keys()]
    values = list(transition_counts.values())
    
    # Colors
    node_colors = [TEAM_COLORS.get(team, '#333333') for team in all_teams]
    
    fig = go.Figure(data=[go.Sankey(
        node = dict(
            pad = 15,
            thickness = 20,
            line = dict(color = "black", width = 0.5),
            label = all_teams,
            color = node_colors
        ),
        link = dict(
            source = sources,
            target = targets,
            value = values
        )
    )])
    
    fig.update_layout(
        title_text="Championship Belt Flow Between Teams",
        font_size=14,
        height=600
    )
    
    fig.write_html(output_file)
    print(f"📊 Flow diagram saved to: {output_file}")


def main():
    """Generate all visualizations"""
    
    print("\n" + "="*70)
    print("NBA CHAMPIONSHIP BELT VISUALIZATIONS")
    print("="*70 + "\n")
    
    try:
        # Load data
        belt_df, summary = load_data()
        print(f"✅ Loaded data: {len(belt_df)} belt games\n")
        
        # Create visualizations
        print("Creating visualizations...\n")
        
        create_timeline_plot(belt_df)
        create_games_bar_chart(summary)
        create_interactive_dashboard(belt_df, summary)
        create_flow_diagram(belt_df)
        
        print("\n" + "="*70)
        print("✅ All visualizations created successfully!")
        print("="*70)
        print("\nGenerated files:")
        print("  • belt_timeline.png - Static timeline")
        print("  • games_per_team.png - Bar chart")
        print("  • belt_dashboard.html - Interactive dashboard (open in browser)")
        print("  • belt_flow.html - Belt flow diagram (open in browser)")
        print("\n💡 Open the HTML files in your browser for interactive views!\n")
        
    except FileNotFoundError as e:
        print(f"❌ Error: Could not find data files")
        print(f"   Make sure you've run nba_belt_tracker_complete.py first")
        print(f"   Error details: {e}")
    except Exception as e:
        print(f"❌ Error creating visualizations: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()
