#!/bin/bash

# Convert PNG logos to SVG using ImageMagick/potrace
# For legacy teams where true SVG doesn't exist

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo ""
echo "🎨 PNG to SVG Logo Converter"
echo "============================="
echo ""

# Check if required tools are installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found. Install with:"
    echo "   macOS: brew install imagemagick"
    echo "   Linux: sudo apt-get install imagemagick"
    echo ""
    exit 1
fi

if ! command -v potrace &> /dev/null; then
    echo "❌ potrace not found. Install with:"
    echo "   macOS: brew install potrace"
    echo "   Linux: sudo apt-get install potrace"
    echo ""
    exit 1
fi

echo "✅ Required tools found (ImageMagick, potrace)"
echo ""

# Parse arguments
LEAGUE="${1:-wnba}"
DRY_RUN="${2:-}"

if [ "$LEAGUE" != "wnba" ] && [ "$LEAGUE" != "nba" ]; then
    echo "Usage: $0 [wnba|nba] [--dry-run]"
    exit 1
fi

LOGO_DIR="$PROJECT_ROOT/web/public/logos/$LEAGUE"

if [ ! -d "$LOGO_DIR" ]; then
    echo "❌ Directory not found: $LOGO_DIR"
    exit 1
fi

cd "$LOGO_DIR"

echo "Converting PNG logos in: $LOGO_DIR"
echo ""

# Counter
converted=0
skipped=0
failed=0

# Find all PNG files
for png_file in *.png; do
    if [ ! -f "$png_file" ]; then
        continue
    fi

    code="${png_file%.png}"
    svg_file="${code}.svg"

    echo -n "  $code... "

    # Check if SVG already exists
    if [ -f "$svg_file" ]; then
        # Check if SVG is actually valid (not a renamed PNG)
        if head -n 1 "$svg_file" | grep -qE '(<\?xml|<svg)'; then
            echo "⏭️  (SVG exists, skipping)"
            ((skipped++))
            continue
        fi
    fi

    if [ "$DRY_RUN" = "--dry-run" ]; then
        echo "🔄 (would convert)"
        ((converted++))
        continue
    fi

    # Convert PNG to PBM (bitmap), then trace to SVG
    if convert "$png_file" -colorspace gray -threshold 50% "${code}.pbm" 2>/dev/null; then
        if potrace -s -o "$svg_file" "${code}.pbm" 2>/dev/null; then
            rm -f "${code}.pbm"
            size=$(stat -f%z "$svg_file" 2>/dev/null || stat -c%s "$svg_file" 2>/dev/null)
            echo "✅ (converted, ${size} bytes)"
            ((converted++))
        else
            rm -f "${code}.pbm"
            echo "❌ (potrace failed)"
            ((failed++))
        fi
    else
        echo "❌ (ImageMagick failed)"
        ((failed++))
    fi
done

echo ""
echo "============================="
echo "Summary:"
echo "  ✅ Converted: $converted"
echo "  ⏭️  Skipped: $skipped"
echo "  ❌ Failed: $failed"
echo ""

if [ "$converted" -gt 0 ]; then
    echo "⚠️  Note: Auto-converted SVGs may need manual cleanup:"
    echo "   - Open in Inkscape or Illustrator"
    echo "   - Remove artifacts/noise"
    echo "   - Adjust colors and paths"
    echo "   - Optimize file size"
    echo ""
fi

if [ "$DRY_RUN" = "--dry-run" ]; then
    echo "🔄 Dry run complete. Run without --dry-run to actually convert."
    echo ""
fi

echo "📝 Remember to update LEGACY_LOGOS_ATTRIBUTION.md with conversion notes!"
echo ""
