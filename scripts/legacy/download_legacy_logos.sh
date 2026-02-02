#!/bin/bash

# Download SVG logos for legacy WNBA & NBA teams
# Sources: Wikimedia Commons, various free logo repositories
# Credit: Logos are trademarks of their respective teams/leagues

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
WNBA_DIR="$PROJECT_ROOT/web/public/logos/wnba"
NBA_DIR="$PROJECT_ROOT/web/public/logos/nba"

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

# Function to try multiple sources for a logo
download_logo() {
  local code=$1
  local name=$2
  shift 2
  local urls=("$@")

  echo "📥 $code - $name"

  for url in "${urls[@]}"; do
    # Determine file extension from URL
    local ext="svg"
    if [[ "$url" == *.png ]]; then
      ext="png"
    fi

    if curl -f -s -L "$url" -o "${code}.${ext}.tmp"; then
      # Check if it's a valid file (SVG starts with <?xml or <svg, PNG with specific bytes)
      if [[ "$ext" == "svg" ]] && head -n 1 "${code}.${ext}.tmp" | grep -qE '(<\?xml|<svg)'; then
        mv "${code}.${ext}.tmp" "${code}.svg"
        size=$(stat -f%z "${code}.svg" 2>/dev/null || stat -c%s "${code}.svg" 2>/dev/null)
        echo "  ✅ Success - SVG (${size} bytes)"
        return 0
      elif [[ "$ext" == "png" ]] && file "${code}.${ext}.tmp" | grep -q "PNG image"; then
        mv "${code}.${ext}.tmp" "${code}.svg"
        size=$(stat -f%z "${code}.svg" 2>/dev/null || stat -c%s "${code}.svg" 2>/dev/null)
        echo "  ✅ Success - PNG converted to SVG naming (${size} bytes)"
        echo "  ⚠️  Note: File is PNG, consider converting to true SVG"
        return 0
      else
        rm -f "${code}.${ext}.tmp"
      fi
    fi
  done

  echo "  ❌ Could not find logo"
  return 1
}

# ============================================
# WNBA LEGACY LOGOS
# ============================================
if [ "$DOWNLOAD_WNBA" = true ]; then

mkdir -p "$WNBA_DIR"
cd "$WNBA_DIR"

echo ""
echo "🏀 Downloading Legacy WNBA Team Logos (SVG)"
echo "=============================================="
echo ""

# Cleveland Rockers
download_logo "CLE" "Cleveland Rockers" \
  "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Cleveland_Rockers.svg/512px-Cleveland_Rockers.svg.png" \
  "https://loodibee.com/wp-content/uploads/Cleveland-Rockers-300x300.png"

echo ""

# Detroit Shock
download_logo "DET" "Detroit Shock" \
  "https://upload.wikimedia.org/wikipedia/en/thumb/9/90/Detroit_Shock_logo.svg/512px-Detroit_Shock_logo.svg.png" \
  "https://loodibee.com/wp-content/uploads/Detroit-Shock-logo-300x300.png"

echo ""

# Houston Comets
download_logo "HOU" "Houston Comets" \
  "https://upload.wikimedia.org/wikipedia/en/thumb/9/91/Houston_Comets_logo.svg/512px-Houston_Comets_logo.svg.png" \
  "https://loodibee.com/wp-content/uploads/Houston-Comets-logo-300x300.png"

echo ""

# Sacramento Monarchs
download_logo "SAC" "Sacramento Monarchs" \
  "https://upload.wikimedia.org/wikipedia/en/thumb/9/97/Sacramento_Monarchs_logo.svg/512px-Sacramento_Monarchs_logo.svg.png" \
  "https://loodibee.com/wp-content/uploads/Sacramento-Monarchs-logo-300x300.png"

echo ""

# San Antonio Stars
download_logo "SAS" "San Antonio Stars" \
  "https://upload.wikimedia.org/wikipedia/en/thumb/d/d5/San_Antonio_Stars_logo.svg/512px-San_Antonio_Stars_logo.svg.png" \
  "https://loodibee.com/wp-content/uploads/San-Antonio-Stars-logo-300x300.png"

echo ""

# Tulsa Shock
download_logo "TUL" "Tulsa Shock" \
  "https://upload.wikimedia.org/wikipedia/en/thumb/7/71/Tulsa_Shock_logo.svg/512px-Tulsa_Shock_logo.svg.png" \
  "https://loodibee.com/wp-content/uploads/Tulsa-Shock-logo-300x300.png"

echo ""
echo "=============================================="
echo "✅ WNBA legacy download complete!"
echo ""

# Count results
svg_count=$(ls -1 CLE.svg DET.svg HOU.svg SAC.svg SAS.svg TUL.svg 2>/dev/null | wc -l | tr -d ' ')
echo "Successfully downloaded: $svg_count/6 legacy WNBA team SVG logos"
echo ""

if [ "$svg_count" -lt 6 ]; then
  echo "⚠️  Some logos could not be found in SVG format."
  echo "   You can either:"
  echo "   1. Keep the PNG versions for those teams"
  echo "   2. Convert PNGs to SVG using a tool like potrace or vectormagic.com"
  echo "   3. Manually download from sportslogos.net (with proper attribution)"
fi

fi # end DOWNLOAD_WNBA

# ============================================
# NBA LEGACY LOGOS
# ============================================
if [ "$DOWNLOAD_NBA" = true ]; then

mkdir -p "$NBA_DIR"
cd "$NBA_DIR"

echo ""
echo "🏀 Downloading Legacy NBA Team Logos (SVG)"
echo "=============================================="
echo ""

# Seattle SuperSonics (most important - actual defunct franchise)
download_logo "SEA" "Seattle SuperSonics" \
  "https://upload.wikimedia.org/wikipedia/en/9/9d/Seattle_SuperSonics_logo.svg" \
  "https://raw.githubusercontent.com/mlsrico/team-logos/master/nba/seattle-supersonics.svg"

echo ""

# Vancouver Grizzlies
download_logo "VAN" "Vancouver Grizzlies" \
  "https://upload.wikimedia.org/wikipedia/en/9/95/Vancouver_Grizzlies_logo.svg" \
  "https://raw.githubusercontent.com/mlsrico/team-logos/master/nba/vancouver-grizzlies.svg"

echo ""

# New Jersey Nets (pre-Brooklyn)
download_logo "NJN" "New Jersey Nets" \
  "https://upload.wikimedia.org/wikipedia/en/4/40/New_Jersey_Nets_logo.svg" \
  "https://raw.githubusercontent.com/mlsrico/team-logos/master/nba/new-jersey-nets.svg"

echo ""

# Charlotte Hornets (original 1988-2002)
download_logo "CHH" "Charlotte Hornets (1988-2002)" \
  "https://upload.wikimedia.org/wikipedia/en/9/91/Charlotte_Hornets_%281988-2002%29_logo.svg" \
  "https://raw.githubusercontent.com/mlsrico/team-logos/master/nba/charlotte-hornets-old.svg"

echo ""

# New Orleans Hornets
download_logo "NOH" "New Orleans Hornets" \
  "https://upload.wikimedia.org/wikipedia/en/0/0d/New_Orleans_Hornets_logo.svg" \
  "https://raw.githubusercontent.com/mlsrico/team-logos/master/nba/new-orleans-hornets.svg"

echo ""

# NOK (New Orleans/Oklahoma City Hornets - Hurricane Katrina era)
download_logo "NOK" "New Orleans/OKC Hornets" \
  "https://upload.wikimedia.org/wikipedia/en/0/0d/New_Orleans_Hornets_logo.svg" \
  "https://raw.githubusercontent.com/mlsrico/team-logos/master/nba/new-orleans-hornets.svg"

echo ""

# San Diego Clippers
download_logo "SDC" "San Diego Clippers" \
  "https://upload.wikimedia.org/wikipedia/en/c/c0/San_Diego_Clippers_logo.svg" \
  "https://raw.githubusercontent.com/mlsrico/team-logos/master/nba/san-diego-clippers.svg"

echo ""

# Kansas City Kings
download_logo "KCK" "Kansas City Kings" \
  "https://upload.wikimedia.org/wikipedia/en/9/95/Kansas_City_Kings_logo.svg" \
  "https://raw.githubusercontent.com/mlsrico/team-logos/master/nba/kansas-city-kings.svg"

echo ""

echo "=============================================="
echo "✅ NBA legacy download complete!"
echo ""

# Count NBA results
nba_svg_count=$(ls -1 SEA.svg VAN.svg NJN.svg CHH.svg NOH.svg NOK.svg SDC.svg KCK.svg 2>/dev/null | wc -l | tr -d ' ')
echo "Successfully downloaded: $nba_svg_count/8 legacy NBA team SVG logos"
echo ""

if [ "$nba_svg_count" -lt 8 ]; then
  echo "⚠️  Some NBA logos could not be found in SVG format."
  echo "   Wikimedia Commons may not have all historical NBA logos."
fi

fi # end DOWNLOAD_NBA

echo ""
echo "📝 Attribution:"
echo "   - Wikimedia Commons logos are in the public domain or CC-licensed"
echo "   - Team logos are trademarks of their respective organizations"
echo "   - For non-commercial/educational use under fair use doctrine"
echo "   - Credit to Sportslogos.net for logo research and references"
