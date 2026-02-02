#!/bin/bash

# Download PNG logos for NBA legacy teams
# Source: Loodibee.com (high-quality 300x300 PNGs with transparency)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
NBA_DIR="$PROJECT_ROOT/web/public/logos/nba"

mkdir -p "$NBA_DIR"
cd "$NBA_DIR"

echo ""
echo "🏀 NBA Legacy Team Logo Downloader"
echo "==================================="
echo ""
echo "Downloading PNG logos from Loodibee.com"
echo "These will have white backgrounds for dark mode visibility"
echo ""

# Function to download and verify
download_logo() {
  local code=$1
  local name=$2
  local url=$3

  echo -n "  $code - $name... "

  if curl -f -s -L "$url" -o "${code}.png"; then
    # Verify it's a PNG
    if file "${code}.png" | grep -q "PNG image"; then
      size=$(stat -f%z "${code}.png" 2>/dev/null || stat -c%s "${code}.png" 2>/dev/null)
      echo "✅ (${size} bytes)"
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

echo "Downloading legacy NBA team logos:"
echo ""

# Seattle SuperSonics - THE most important one!
download_logo "SEA" "Seattle SuperSonics" \
  "https://loodibee.com/wp-content/uploads/nba-seattle-supersonics-logo-2008-300x300.png"

# Vancouver Grizzlies
download_logo "VAN" "Vancouver Grizzlies" \
  "https://loodibee.com/wp-content/uploads/nba-vancouver-grizzlies-logo-300x300.png"

# New Jersey Nets
download_logo "NJN" "New Jersey Nets" \
  "https://loodibee.com/wp-content/uploads/nba-new-jersey-nets-logo-300x300.png"

# Charlotte Hornets (original 1988-2002)
download_logo "CHH" "Charlotte Hornets (1988-2002)" \
  "https://loodibee.com/wp-content/uploads/nba-charlotte-hornets-logo-1989-300x300.png"

# New Orleans Hornets
download_logo "NOH" "New Orleans Hornets" \
  "https://loodibee.com/wp-content/uploads/nba-new-orleans-hornets-logo-300x300.png"

# NOK - New Orleans/Oklahoma City Hornets (same logo as NOH)
if [ -f "NOH.png" ]; then
  cp NOH.png NOK.png
  echo "  NOK - NO/Oklahoma City Hornets... ✅ (copied from NOH)"
fi

# San Diego Clippers
download_logo "SDC" "San Diego Clippers" \
  "https://loodibee.com/wp-content/uploads/nba-san-diego-clippers-logo-300x300.png"

# Kansas City Kings
download_logo "KCK" "Kansas City Kings" \
  "https://loodibee.com/wp-content/uploads/nba-kansas-city-kings-logo-300x300.png"

echo ""
echo "==================================="

# Count results
count=$(ls -1 SEA.png VAN.png NJN.png CHH.png NOH.png NOK.png SDC.png KCK.png 2>/dev/null | wc -l | tr -d ' ')
echo "✅ Downloaded: $count/8 legacy NBA team logos"
echo ""

if [ "$count" -eq 8 ]; then
  echo "🎉 All legacy NBA logos downloaded successfully!"
  echo ""
  echo "Next steps:"
  echo "  1. Update web/components/TeamLogo.tsx to enable these teams"
  echo "  2. Uncomment the NBA_PNG_TEAMS codes for dark mode support"
  echo "  3. Test on your site to verify they look good"
else
  echo "⚠️  Some logos failed to download. Check URLs or try manually:"
  echo "   https://loodibee.com/nba-logos/"
fi

echo ""
echo "📝 Attribution:"
echo "   - Logos courtesy of Loodibee.com"
echo "   - Will display with white background in dark mode"
echo "   - All logos are trademarks of the NBA and respective teams"
echo ""
