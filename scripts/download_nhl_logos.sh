#!/bin/bash

# NHL Team Logo Downloader - SVG Edition
# Downloads team logos in SVG format from official NHL sources

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
NHL_DIR="$PROJECT_ROOT/web/public/logos/nhl"

mkdir -p "$NHL_DIR"
cd "$NHL_DIR"

echo ""
echo "🏒 NHL Team Logo Downloader"
echo "==================================="
echo ""

# Function to download and verify
download_logo() {
  local code=$1
  local name=$2
  local url=$3

  echo -n "  $code - $name... "

  if curl -f -s -L "$url" -o "${code}.svg"; then
    # Verify it's an SVG
    if head -n 1 "${code}.svg" | grep -q "svg" || grep -q "<svg" "${code}.svg"; then
      size=$(stat -f%z "${code}.svg" 2>/dev/null || stat -c%s "${code}.svg" 2>/dev/null)
      echo "✅ (${size} bytes)"
      return 0
    else
      rm -f "${code}.svg"
      echo "❌ (not an SVG)"
      return 1
    fi
  else
    echo "❌ (download failed)"
    return 1
  fi
}

# Function to download PNG from Loodibee
download_png() {
  local code=$1
  local name=$2
  local url=$3

  echo -n "  $code - $name... "

  if curl -f -s -L "$url" -o "${code}.png"; then
    # Verify it's a PNG
    if file "${code}.png" | grep -q "PNG image"; then
      size=$(stat -f%z "${code}.png" 2>/dev/null || stat -c%s "${code}.png" 2>/dev/null)
      echo "✅ PNG (${size} bytes)"
      return 0
    else
      rm -f "${code}.png"
      echo "❌ (not a PNG)"
      return 1
    fi
  else
    echo "❌ (download failed)"
    return 1
  fi
}

# ============================================
# CURRENT NHL TEAMS (32 teams)
# ============================================
echo "📥 Current NHL Teams (Official NHL CDN):"
echo ""

# Official NHL CDN pattern: https://assets.nhle.com/logos/nhl/svg/{CODE}_dark.svg
# Some teams use light/dark variants

download_logo "ANA" "Anaheim Ducks" \
  "https://assets.nhle.com/logos/nhl/svg/ANA_dark.svg"

download_logo "BOS" "Boston Bruins" \
  "https://assets.nhle.com/logos/nhl/svg/BOS_dark.svg"

download_logo "BUF" "Buffalo Sabres" \
  "https://assets.nhle.com/logos/nhl/svg/BUF_dark.svg"

download_logo "CGY" "Calgary Flames" \
  "https://assets.nhle.com/logos/nhl/svg/CGY_dark.svg"

download_logo "CAR" "Carolina Hurricanes" \
  "https://assets.nhle.com/logos/nhl/svg/CAR_dark.svg"

download_logo "CHI" "Chicago Blackhawks" \
  "https://assets.nhle.com/logos/nhl/svg/CHI_dark.svg"

download_logo "COL" "Colorado Avalanche" \
  "https://assets.nhle.com/logos/nhl/svg/COL_dark.svg"

download_logo "CBJ" "Columbus Blue Jackets" \
  "https://assets.nhle.com/logos/nhl/svg/CBJ_dark.svg"

download_logo "DAL" "Dallas Stars" \
  "https://assets.nhle.com/logos/nhl/svg/DAL_dark.svg"

download_logo "DET" "Detroit Red Wings" \
  "https://assets.nhle.com/logos/nhl/svg/DET_dark.svg"

download_logo "EDM" "Edmonton Oilers" \
  "https://assets.nhle.com/logos/nhl/svg/EDM_dark.svg"

download_logo "FLA" "Florida Panthers" \
  "https://assets.nhle.com/logos/nhl/svg/FLA_dark.svg"

download_logo "LAK" "Los Angeles Kings" \
  "https://assets.nhle.com/logos/nhl/svg/LAK_dark.svg"

download_logo "MIN" "Minnesota Wild" \
  "https://assets.nhle.com/logos/nhl/svg/MIN_dark.svg"

download_logo "MTL" "Montreal Canadiens" \
  "https://assets.nhle.com/logos/nhl/svg/MTL_dark.svg"

download_logo "NSH" "Nashville Predators" \
  "https://assets.nhle.com/logos/nhl/svg/NSH_dark.svg"

download_logo "NJD" "New Jersey Devils" \
  "https://assets.nhle.com/logos/nhl/svg/NJD_dark.svg"

download_logo "NYI" "New York Islanders" \
  "https://assets.nhle.com/logos/nhl/svg/NYI_dark.svg"

download_logo "NYR" "New York Rangers" \
  "https://assets.nhle.com/logos/nhl/svg/NYR_dark.svg"

download_logo "OTT" "Ottawa Senators" \
  "https://assets.nhle.com/logos/nhl/svg/OTT_dark.svg"

download_logo "PHI" "Philadelphia Flyers" \
  "https://assets.nhle.com/logos/nhl/svg/PHI_dark.svg"

download_logo "PIT" "Pittsburgh Penguins" \
  "https://assets.nhle.com/logos/nhl/svg/PIT_dark.svg"

download_logo "SJS" "San Jose Sharks" \
  "https://assets.nhle.com/logos/nhl/svg/SJS_dark.svg"

download_logo "SEA" "Seattle Kraken" \
  "https://assets.nhle.com/logos/nhl/svg/SEA_dark.svg"

download_logo "STL" "St. Louis Blues" \
  "https://assets.nhle.com/logos/nhl/svg/STL_dark.svg"

download_logo "TBL" "Tampa Bay Lightning" \
  "https://assets.nhle.com/logos/nhl/svg/TBL_dark.svg"

download_logo "TOR" "Toronto Maple Leafs" \
  "https://assets.nhle.com/logos/nhl/svg/TOR_dark.svg"

download_logo "VAN" "Vancouver Canucks" \
  "https://assets.nhle.com/logos/nhl/svg/VAN_dark.svg"

download_logo "VGK" "Vegas Golden Knights" \
  "https://assets.nhle.com/logos/nhl/svg/VGK_dark.svg"

download_logo "WSH" "Washington Capitals" \
  "https://assets.nhle.com/logos/nhl/svg/WSH_dark.svg"

download_logo "WPG" "Winnipeg Jets" \
  "https://assets.nhle.com/logos/nhl/svg/WPG_dark.svg"

download_logo "UTA" "Utah Hockey Club" \
  "https://assets.nhle.com/logos/nhl/svg/UTA_dark.svg"

echo ""
echo "==================================="
echo ""

# ============================================
# HISTORICAL/RELOCATED TEAMS
# ============================================
echo "📥 Historical/Relocated Teams (Loodibee PNG - 300x300):"
echo ""

# Minnesota North Stars -> Dallas Stars (1993)
download_png "MNS" "Minnesota North Stars" \
  "https://loodibee.com/wp-content/uploads/Minnesota-North-Stars-Logo-1967-1985.png"

# Atlanta Thrashers -> Winnipeg Jets (2011)
download_png "ATL" "Atlanta Thrashers" \
  "https://loodibee.com/wp-content/uploads/Atlanta-Thrashers-Logo-1999-2011.png"

# Quebec Nordiques -> Colorado Avalanche (1995)
download_png "QUE" "Quebec Nordiques" \
  "https://loodibee.com/wp-content/uploads/Quebec-Nordiques-Logo1985-1995.png"

# Hartford Whalers -> Carolina Hurricanes (1997)
download_png "HFD" "Hartford Whalers" \
  "https://loodibee.com/wp-content/uploads/Hartford-Whalers-Logo-1993-1997.png"

# Winnipeg Jets (original) -> Phoenix Coyotes (1996)
download_png "WPG1" "Winnipeg Jets (Original)" \
  "https://loodibee.com/wp-content/uploads/Winnipeg-Jets-Logo-1990-1996.png"

# Phoenix Coyotes -> Arizona Coyotes (2014) -> Utah Hockey Club (2024)
download_png "PHX" "Phoenix Coyotes" \
  "https://loodibee.com/wp-content/uploads/Phoenix-Coyotes-Logo-1996-1999.png"

download_png "ARI" "Arizona Coyotes" \
  "https://loodibee.com/wp-content/uploads/nhl-arizona-coyotes-logo.png"

# Atlanta Flames -> Calgary Flames (1980)
download_png "AFM" "Atlanta Flames" \
  "https://loodibee.com/wp-content/uploads/Atlanta-Flames-Logo-1972-1980.png"

# Colorado Rockies -> New Jersey Devils (1982)
download_png "CLR" "Colorado Rockies" \
  "https://loodibee.com/wp-content/uploads/Colorado-Rockies-Logo-1976-1982.png"

# Kansas City Scouts -> Colorado Rockies (1976)
download_png "KCS" "Kansas City Scouts" \
  "https://loodibee.com/wp-content/uploads/Kansas-City-Scouts-Logo-1974-1976.png"

# Mighty Ducks of Anaheim -> Anaheim Ducks (2006)
download_png "MDA" "Mighty Ducks of Anaheim" \
  "https://loodibee.com/wp-content/uploads/Mighty-Ducks-of-Anaheim-Logo-1993-2006.png"

# California Golden Seals -> Cleveland Barons (1976)
# Note: These logos may not be available on Loodibee
echo "  CGS - California Golden Seals... ⚠️  (not available on Loodibee)"
echo "  CLE - Cleveland Barons... ⚠️  (not available on Loodibee)"

echo ""
echo "==================================="
echo ""

# Count results
svg_count=$(ls -1 *.svg 2>/dev/null | wc -l | tr -d ' ')
png_count=$(ls -1 *.png 2>/dev/null | wc -l | tr -d ' ')

echo "✅ Download Summary:"
echo "  SVG logos (current teams): $svg_count/32"
echo "  PNG logos (historical teams): $png_count/11"
echo "  Total logos: $((svg_count + png_count))/43"
echo ""

if [ "$svg_count" -eq 32 ] && [ "$png_count" -eq 11 ]; then
  echo "🎉 All available NHL logos downloaded successfully!"
  echo ""
  echo "⚠️  Note: California Golden Seals and Cleveland Barons logos"
  echo "   are not available on Loodibee. You may need to find these manually."
else
  echo "⚠️  Some logos may have failed. Check output above."
fi

echo ""
echo "All NHL logos saved to: web/public/logos/nhl/"
echo ""
echo "📝 Notes:"
echo "  - Current teams use official NHL SVG logos"
echo "  - Historical teams use Loodibee PNG logos (typically 1200x1200)"
echo "  - Logos courtesy of NHL and Loodibee.com"
echo "  - All logos are trademarks of the NHL and respective teams"
echo "  - California Golden Seals & Cleveland Barons not available from this source"
echo ""
