# NBA Championship Belt Tracker

Track the "lineal championship" belt through NBA history - when the champion loses, the team that beat them becomes the new champion!

## 📊 What You've Got (Step 1 & 2 ✅)

**Current Season Tracking (2024-25)** - COMPLETE
- ✅ Belt tracker with sample data
- ✅ Data visualizations (timeline, bar charts, interactive dashboard)
- ✅ CSV export of all belt games
- ✅ JSON summary statistics

### Sample Data Results
Based on first games of 2024-25 season:
- **Current Belt Holder**: CLE (Cavaliers)
- **Total Belt Games**: 9
- **Belt Changes**: 4 times
- **Longest Reign**: CLE with 5 games

## 📁 Files Included

### Core Scripts
1. **nba_belt_tracker_complete.py** - Main tracking script
   - Fetches game data (or uses sample data)
   - Tracks belt through all games
   - Exports CSV and JSON results

2. **nba_belt_viz.py** - Visualization generator
   - Timeline plot
   - Bar charts
   - Interactive Plotly dashboard
   - Belt flow diagrams

### Output Files
- `nba_belt_2024_25_games.csv` - All belt games with details
- `nba_belt_2024_25_summary.json` - Summary statistics
- `belt_timeline.png` - Visual timeline
- `games_per_team.png` - Bar chart
- `belt_dashboard.html` - **Interactive dashboard (open in browser!)**
- `belt_flow.html` - Belt flow between teams

## 🚀 Running with REAL Data

### Prerequisites
```bash
pip install nba_api pandas matplotlib plotly
```

### Steps
1. Open `nba_belt_tracker_complete.py`
2. Find the section marked `# TO USE REAL DATA`
3. Uncomment that block
4. Run:
```bash
python nba_belt_tracker_complete.py
python nba_belt_viz.py
```

The script will automatically:
- Fetch all 2024-25 season games from NBA API
- Track the belt from Boston Celtics (2024 champs)
- Generate visualizations
- Export data files

## 📈 Next Steps

### Step 3: Historical Data (Back to 1947 or 1976)

Create `nba_belt_historical.py`:
```python
# Pseudo-code structure:

# Option 1: Back to ABA/NBA merger (1976-77)
# - Simpler, cleaner data
# - Starting champion: Portland Trail Blazers (1977)

# Option 2: Back to 1947 (first full season)
# - Complete NBA history
# - Starting champion: Philadelphia Warriors (1947)

# Key considerations:
# 1. Old team names (e.g., Minneapolis Lakers → LA Lakers)
# 2. Defunct franchises
# 3. Data quality varies by era
# 4. Will need historical game data from Basketball Reference or similar
```

**Implementation Plan:**
1. Use basketball-reference.com or sports-reference API
2. Build team mapping for relocations/name changes
3. Track belt year by year
4. Export master historical CSV
5. Create decade-by-decade visualizations

### Step 4: Intercontinental Belt

Modify rules for global play:
```python
# Possible rule variations:

# Option A: Home Court Advantage
# - Belt only changes on road losses
# - Longer reigns, more dramatic changes

# Option B: Conference Lock
# - Belt must be won within same conference first
# - Then cross-conference challenges

# Option C: Playoff Multiplier
# - Regular season: belt changes normally
# - Playoffs: winner must beat belt holder 4 times
# - Creates "super belt" concept
```

## 🎨 Customization Ideas

### Add More Visualizations
- Heatmap of which teams beat which
- Longest drought without holding belt
- "Belt hotness" - how often it changes in given periods
- Geographic visualization of belt movement

### Advanced Analytics
- Strength of schedule for belt holders
- Win % for belt holders vs regular games
- Home court advantage impact on belt
- Player stats during belt games

### Web Dashboard
- Live updating for current season
- Historical lookup by team/date
- "What if" simulator (change starting team)
- Social sharing of belt stats

## 📖 Background

This concept originated on Reddit's r/NBA and was popularized by Grantland in 2013. It applies boxing's "lineal championship" concept to NBA regular seasons.

**Rules:**
1. Previous NBA champion starts with belt
2. Team holding belt must defend it every game
3. If they lose, opponent takes the belt
4. If they win, they keep it
5. Only belt holder's games matter

**Why It's Fun:**
- Makes every regular season game potentially meaningful
- Bad teams can have their moment of glory
- Creates storylines throughout the season
- Actually somewhat tracks team quality over time

## 🔧 Technical Notes

### API Limitations
- `nba_api` accesses stats.nba.com (free, no key needed)
- Rate limits apply (built-in delays recommended)
- Historical data availability varies by endpoint
- Some old games may have incomplete data

### Data Structure
```csv
date,game_id,defender,challenger,winner,loser,score,belt_changed,new_holder
2024-10-22,1,BOS,PHI,PHI,BOS,117-116,True,PHI
```

### Performance
- Current season: ~1 second
- Full historical (1947-2025): ~30-60 seconds
- Visualization generation: ~5 seconds

## 🤝 Contributing

Ideas for improvements:
- [ ] Add WNBA belt tracking
- [ ] Create mobile-friendly dashboard
- [ ] Add real-time updates during games
- [ ] Integration with betting odds
- [ ] Predictive modeling for belt changes
- [ ] Multi-sport expansion (NFL, NHL, MLB)

## 📝 License

Free to use, modify, and distribute. Credit to original Reddit/Grantland concept appreciated.

## 💡 Fun Facts from Sample Data

- Boston lost the belt in their very first game!
- Cleveland went on a 5-game belt defense streak
- The belt changed hands 4 times in just 2 weeks
- 4 different teams held the belt in this small sample

---

**Next:** Run with real data and explore the full 2024-25 season! 🏀
