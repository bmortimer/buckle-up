#!/bin/bash

# WNBA Logo Downloader - SVG Edition
# Downloads team logos in SVG format from official sources

set -e

# Create logos directory
mkdir -p web/public/logos/wnba

cd web/public/logos/wnba

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
echo "All logos saved to: web/public/logos/wnba/"
