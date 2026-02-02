#!/bin/bash

# Simple script to download legacy team logos in SVG format
# Uses Wikimedia Commons as primary source
# Falls back to noting where SVGs aren't available

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo ""
echo "🏀 Legacy Team Logo Downloader"
echo "================================"
echo ""
echo "This script downloads SVG logos for defunct/relocated teams."
echo "Source: Wikimedia Commons (Public Domain / CC-Licensed)"
echo ""

# Parse arguments
LEAGUE="${1:-both}"

download_svg() {
  local league=$1
  local code=$2
  local name=$3
  local url=$4

  local dir="$PROJECT_ROOT/web/public/logos/$league"
  mkdir -p "$dir"

  echo -n "  $code ($name)... "

  if curl -f -s -L "$url" -o "$dir/${code}.svg" 2>/dev/null; then
    # Verify it's actually an SVG
    if head -n 1 "$dir/${code}.svg" | grep -qE '(<\?xml|<svg)'; then
      local size=$(stat -f%z "$dir/${code}.svg" 2>/dev/null || stat -c%s "$dir/${code}.svg" 2>/dev/null)
      echo "✅ ($size bytes)"
      return 0
    else
      rm -f "$dir/${code}.svg"
      echo "❌ (not valid SVG)"
      return 1
    fi
  else
    echo "❌ (not found)"
    return 1
  fi
}

# ============================================
# NBA LEGACY LOGOS
# ============================================
if [ "$LEAGUE" = "nba" ] || [ "$LEAGUE" = "both" ]; then

echo "NBA Legacy Teams:"
echo "-----------------"

# Seattle SuperSonics - most important one!
download_svg "nba" "SEA" "Seattle SuperSonics" \
  "https://upload.wikimedia.org/wikipedia/en/9/9d/Seattle_SuperSonics_logo.svg"

# Vancouver Grizzlies
download_svg "nba" "VAN" "Vancouver Grizzlies" \
  "https://upload.wikimedia.org/wikipedia/en/9/95/Vancouver_Grizzlies_logo.svg"

# New Jersey Nets
download_svg "nba" "NJN" "New Jersey Nets" \
  "https://upload.wikimedia.org/wikipedia/en/4/40/New_Jersey_Nets_logo.svg"

# Charlotte Hornets (original)
download_svg "nba" "CHH" "Charlotte Hornets (1988-2002)" \
  "https://upload.wikimedia.org/wikipedia/en/9/91/Charlotte_Hornets_%281988-2002%29_logo.svg"

# New Orleans Hornets
download_svg "nba" "NOH" "New Orleans Hornets" \
  "https://upload.wikimedia.org/wikipedia/en/0/0d/New_Orleans_Hornets_logo.svg"

# NOK = same as NOH (Hurricane Katrina temporary branding)
echo -n "  NOK (NO/Oklahoma City Hornets)... "
cp "$PROJECT_ROOT/web/public/logos/nba/NOH.svg" "$PROJECT_ROOT/web/public/logos/nba/NOK.svg" 2>/dev/null && echo "✅ (copied from NOH)" || echo "⏭️  (skip)"

# San Diego Clippers
download_svg "nba" "SDC" "San Diego Clippers" \
  "https://upload.wikimedia.org/wikipedia/en/c/c0/San_Diego_Clippers_logo.svg"

# Kansas City Kings
download_svg "nba" "KCK" "Kansas City Kings" \
  "https://upload.wikimedia.org/wikipedia/en/9/95/Kansas_City_Kings_logo.svg"

echo ""

fi

# ============================================
# WNBA LEGACY LOGOS
# ============================================
if [ "$LEAGUE" = "wnba" ] || [ "$LEAGUE" = "both" ]; then

echo "WNBA Legacy Teams:"
echo "------------------"

# Cleveland Rockers
download_svg "wnba" "CLE" "Cleveland Rockers" \
  "https://upload.wikimedia.org/wikipedia/commons/7/7f/Cleveland_Rockers.svg"

# Detroit Shock
download_svg "wnba" "DET" "Detroit Shock" \
  "https://upload.wikimedia.org/wikipedia/en/9/90/Detroit_Shock_logo.svg"

# Houston Comets
download_svg "wnba" "HOU" "Houston Comets" \
  "https://upload.wikimedia.org/wikipedia/en/9/91/Houston_Comets_logo.svg"

# Sacramento Monarchs
download_svg "wnba" "SAC" "Sacramento Monarchs" \
  "https://upload.wikimedia.org/wikipedia/en/9/97/Sacramento_Monarchs_logo.svg"

# San Antonio Stars
download_svg "wnba" "SAS" "San Antonio Stars" \
  "https://upload.wikimedia.org/wikipedia/en/d/d5/San_Antonio_Stars_logo.svg"

# Tulsa Shock
download_svg "wnba" "TUL" "Tulsa Shock" \
  "https://upload.wikimedia.org/wikipedia/en/7/71/Tulsa_Shock_logo.svg"

echo ""

fi

echo "================================"
echo "✅ Download complete!"
echo ""
echo "📝 Note: Some logos may not be available as SVG on Wikimedia."
echo "   For those, we'll keep using PNG files from Loodibee.com"
echo ""
echo "📄 See LEGACY_LOGOS_ATTRIBUTION.md for full attribution details"
echo ""
