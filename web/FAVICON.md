# Championship Belt Favicon

## Design Concept

A highly pixelated, retro 8-bit style championship belt icon that matches the LED scoreboard aesthetic of the site.

## Design Elements

- **Style**: Pure pixel art with no anti-aliasing
- **Colors**:
  - Background: Deep black (#0a0a0a)
  - Belt: Amber/gold tones (#f59e0b, #fbbf24, #fef3c7)
  - Center Plate: Metallic gray (#d6d3d1, #fafaf9)
  - Accents: Bronze shadows (#92400e)

- **Structure**:
  - Left and right belt straps with visible depth
  - Center championship plate (larger, shinier)
  - Gold studs/rivets on the belt straps
  - LED-style bright highlights

## Files Generated

- `favicon-16x16.png` - Simplified design for tiny displays (223 bytes!)
- `favicon-32x32.png` - Standard favicon with more detail (345 bytes)
- `icon-192x192.png` - Android home screen
- `icon-512x512.png` - High-resolution for various uses
- `apple-touch-icon.png` - iOS home screen (180x180)
- `manifest.json` - PWA manifest with icon references

## Generation Script

The favicons are generated using `generate-favicon.js` which:
- Uses HTML5 Canvas for pixel-perfect rendering
- Creates hard-edged pixels (no smoothing)
- Scales intelligently based on target size
- Outputs optimized PNG files

## Regenerating

If you need to regenerate the favicons:

```bash
cd web
npm install canvas  # Only needed once
node generate-favicon.js
```

## Integration

The favicons are automatically integrated via Next.js metadata in `app/layout.tsx`:
- All sizes are properly declared
- PWA manifest is linked
- Apple touch icon is configured
- Icons work in both light and dark mode browsers
