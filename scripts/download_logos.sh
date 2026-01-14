#!/bin/bash

# WNBA & NBA Logo Downloader - SVG Edition
# Downloads team logos in SVG format from official sources

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Parse arguments
DOWNLOAD_WNBA=false
DOWNLOAD_NBA=false

if [ $# -eq 0 ]; then
  # No args = download both
  DOWNLOAD_WNBA=true
  DOWNLOAD_NBA=true
else
  for arg in "$@"; do
    case $arg in
      wnba) DOWNLOAD_WNBA=true ;;
      nba) DOWNLOAD_NBA=true ;;
      *) echo "Unknown argument: $arg"; echo "Usage: $0 [wnba] [nba]"; exit 1 ;;
    esac
  done
fi

# ============================================
# WNBA LOGOS
# ============================================
if [ "$DOWNLOAD_WNBA" = true ]; then

# Create logos directory
mkdir -p "$PROJECT_ROOT/web/public/logos/wnba"

cd "$PROJECT_ROOT/web/public/logos/wnba"

echo "Downloading WNBA team logos (SVG format)..."
echo ""

# Active Teams - Official WNBA Stats CDN (all SVG!)
# Pattern: https://stats.wnba.com/media/img/teams/logos/{CODE}.svg

teams=(
  "ATL:Atlanta Dream"
  "CHI:Chicago Sky"
  "CON:Connecticut Sun"
  "DAL:Dallas Wings"
  "IND:Indiana Fever"
  "LVA:Las Vegas Aces"
  "LAS:Los Angeles Sparks"
  "MIN:Minnesota Lynx"
  "NYL:New York Liberty"
  "PHO:Phoenix Mercury"
  "SEA:Seattle Storm"
  "WAS:Washington Mystics"
)

echo "📥 Active Teams (Official WNBA CDN):"
for team in "${teams[@]}"; do
  code="${team%%:*}"
  name="${team#*:}"

  if curl -f -s "https://stats.wnba.com/media/img/teams/logos/${code}.svg" -o "${code}.svg"; then
    size=$(stat -f%z "${code}.svg" 2>/dev/null || stat -c%s "${code}.svg" 2>/dev/null)
    echo "  ✅ $code - $name (${size} bytes)"
  else
    echo "  ❌ $code - $name (failed)"
    rm -f "${code}.svg"
  fi
done

echo ""

# Historical/Defunct Teams - PNG from loodibee.com
# These teams are defunct, SVGs not widely available

echo "📥 Historical/Defunct Teams (Loodibee PNG - 300x300):"

# Detroit Shock
curl -s "https://loodibee.com/wp-content/uploads/Detroit-Shock-logo-300x300.png" -o DET.png
echo "  ✅ DET - Detroit Shock"

# Orlando Miracle
curl -s "https://loodibee.com/wp-content/uploads/Orlando-Miracle-logo-300x300.png" -o ORL.png
echo "  ✅ ORL - Orlando Miracle"

# San Antonio Stars
curl -s "https://loodibee.com/wp-content/uploads/San-Antonio-Stars-logo-300x300.png" -o SAS.png
echo "  ✅ SAS - San Antonio Stars"

# Tulsa Shock
curl -s "https://loodibee.com/wp-content/uploads/Tulsa-Shock-logo-300x300.png" -o TUL.png
echo "  ✅ TUL - Tulsa Shock"

# Utah Starzz
curl -s "https://loodibee.com/wp-content/uploads/Utah-Starzz-logo-300x300.png" -o UTA.png
echo "  ✅ UTA - Utah Starzz"

# Charlotte Sting
curl -s "https://loodibee.com/wp-content/uploads/Charlotte-Sting-logo-300x300.png" -o CHA.png
echo "  ✅ CHA - Charlotte Sting"

# Cleveland Rockers
curl -s "https://loodibee.com/wp-content/uploads/Cleveland-Rockers-300x300.png" -o CLE.png
echo "  ✅ CLE - Cleveland Rockers"

# Houston Comets
curl -s "https://loodibee.com/wp-content/uploads/Houston-Comets-logo-300x300.png" -o HOU.png
echo "  ✅ HOU - Houston Comets"

# Miami Sol
curl -s "https://loodibee.com/wp-content/uploads/Miami-Sol-logo-300x300.png" -o MIA.png
echo "  ✅ MIA - Miami Sol"

# Portland Fire
curl -s "https://loodibee.com/wp-content/uploads/Portland-Fire-logo-300x300.png" -o PFI.png
echo "  ✅ PFI - Portland Fire"

# Sacramento Monarchs
curl -s "https://loodibee.com/wp-content/uploads/Sacramento-Monarchs-logo-300x300.png" -o SAC.png
echo "  ✅ SAC - Sacramento Monarchs"

echo ""
echo "✅ Download complete!"
echo ""
echo "Summary:"
svg_count=$(ls -1 *.svg 2>/dev/null | wc -l | tr -d ' ')
png_count=$(ls -1 *.png 2>/dev/null | wc -l | tr -d ' ')
echo "  SVG logos (current teams): $svg_count"
echo "  PNG logos (historical teams): $png_count"
echo "  Total logos: $((svg_count + png_count))"

echo ""
echo "All WNBA logos saved to: web/public/logos/wnba/"

fi # end DOWNLOAD_WNBA

# ============================================
# NBA LOGOS
# ============================================
if [ "$DOWNLOAD_NBA" = true ]; then

# Create logos directory
mkdir -p "$PROJECT_ROOT/web/public/logos/nba"

cd "$PROJECT_ROOT/web/public/logos/nba"

echo ""
echo "=========================================="
echo "Downloading NBA team logos (SVG format)..."
echo "=========================================="
echo ""

# All 30 NBA Teams - Official NBA Stats CDN
# Pattern: https://cdn.nba.com/logos/nba/{TEAM_ID}/primary/L/logo.svg

# NBA team IDs (from nba.com API)
nba_teams=(
  "1610612737:ATL:Atlanta Hawks"
  "1610612738:BOS:Boston Celtics"
  "1610612751:BKN:Brooklyn Nets"
  "1610612766:CHA:Charlotte Hornets"
  "1610612741:CHI:Chicago Bulls"
  "1610612739:CLE:Cleveland Cavaliers"
  "1610612742:DAL:Dallas Mavericks"
  "1610612743:DEN:Denver Nuggets"
  "1610612765:DET:Detroit Pistons"
  "1610612744:GSW:Golden State Warriors"
  "1610612745:HOU:Houston Rockets"
  "1610612754:IND:Indiana Pacers"
  "1610612746:LAC:LA Clippers"
  "1610612747:LAL:Los Angeles Lakers"
  "1610612763:MEM:Memphis Grizzlies"
  "1610612748:MIA:Miami Heat"
  "1610612749:MIL:Milwaukee Bucks"
  "1610612750:MIN:Minnesota Timberwolves"
  "1610612740:NOP:New Orleans Pelicans"
  "1610612752:NYK:New York Knicks"
  "1610612760:OKC:Oklahoma City Thunder"
  "1610612753:ORL:Orlando Magic"
  "1610612755:PHI:Philadelphia 76ers"
  "1610612756:PHX:Phoenix Suns"
  "1610612757:POR:Portland Trail Blazers"
  "1610612758:SAC:Sacramento Kings"
  "1610612759:SAS:San Antonio Spurs"
  "1610612761:TOR:Toronto Raptors"
  "1610612762:UTA:Utah Jazz"
  "1610612764:WAS:Washington Wizards"
)

echo "📥 NBA Teams (Official NBA CDN):"
for team in "${nba_teams[@]}"; do
  team_id="${team%%:*}"
  rest="${team#*:}"
  code="${rest%%:*}"
  name="${rest#*:}"

  # Try the CDN URL first
  if curl -f -s "https://cdn.nba.com/logos/nba/${team_id}/primary/L/logo.svg" -o "${code}.svg"; then
    size=$(stat -f%z "${code}.svg" 2>/dev/null || stat -c%s "${code}.svg" 2>/dev/null)
    echo "  ✅ $code - $name (${size} bytes)"
  else
    echo "  ❌ $code - $name (failed)"
    rm -f "${code}.svg"
  fi
done

echo ""
echo "✅ NBA Download complete!"
echo ""
echo "Summary:"
nba_svg_count=$(ls -1 *.svg 2>/dev/null | wc -l | tr -d ' ')
echo "  SVG logos: $nba_svg_count"
echo ""
echo "All NBA logos saved to: web/public/logos/nba/"

fi # end DOWNLOAD_NBA
