# Legacy Team Logos - Sources & Attribution

This document credits the sources for historical/legacy team logos used in this project.

## Legal Notice

All team logos are trademarks of their respective teams and leagues (NBA, WNBA).
This project uses them under fair use for non-commercial, educational purposes.

## WNBA Legacy Teams

### Logos Successfully Downloaded

| Code | Team | Years | Source | License |
|------|------|-------|--------|---------|
| CHA | Charlotte Sting | 1997-2006 | Loodibee / Wikipedia | Public Domain / Fair Use |
| MIA | Miami Sol | 2000-2002 | Loodibee / Wikipedia | Public Domain / Fair Use |
| ORL | Orlando Miracle | 1999-2002 | Loodibee / Wikipedia | Public Domain / Fair Use |
| POR | Portland Fire | 2000-2002 | Loodibee / Wikipedia | Public Domain / Fair Use |
| UTA | Utah Starzz | 1997-2002 | Loodibee / Wikipedia | Public Domain / Fair Use |

### Logos Needed (Currently PNG)

| Code | Team | Years | Current Source |
|------|------|-------|----------------|
| CLE | Cleveland Rockers | 1997-2003 | Loodibee.com (PNG, 300x300) |
| DET | Detroit Shock | 1998-2009 | Loodibee.com (PNG, 300x300) |
| HOU | Houston Comets | 1997-2008 | Loodibee.com (PNG, 300x300) |
| SAC | Sacramento Monarchs | 1997-2009 | Loodibee.com (PNG, 300x300) |
| SAS | San Antonio Stars | 2003-2017 | Loodibee.com (PNG, 300x300) |
| TUL | Tulsa Shock | 2010-2015 | Loodibee.com (PNG, 300x300) |

## NBA Legacy Teams

### Teams Needed

| Code | Team | Years | Status |
|------|------|-------|--------|
| SEA | Seattle SuperSonics | 1967-2008 | Need SVG - relocated to OKC |
| VAN | Vancouver Grizzlies | 1995-2001 | Need SVG - relocated to Memphis |
| NJN | New Jersey Nets | 1977-2012 | Need SVG - relocated to Brooklyn |
| CHH | Charlotte Hornets (original) | 1988-2002 | Need SVG - relocated to New Orleans |
| NOH | New Orleans Hornets | 2002-2013 | Need SVG - became Pelicans |
| NOK | New Orleans/OKC Hornets | 2005-2007 | Need SVG - Hurricane Katrina era |
| SDC | San Diego Clippers | 1978-1984 | Need SVG - relocated to LA |
| KCK | Kansas City Kings | 1972-1985 | Need SVG - relocated to Sacramento |

## Recommended Sources

### 1. Wikimedia Commons (BEST - Public Domain)
- URL: https://commons.wikimedia.org/
- Many team logos available in SVG format
- Public domain or CC-licensed
- **Preferred source** when available

### 2. Loodibee.com (Current Fallback)
- URL: https://loodibee.com/
- High-quality PNG files (300x300)
- Used for WNBA legacy teams
- Credit required: "Logos courtesy of Loodibee.com"

### 3. SportsLogos.net (Reference Only)
- URL: https://www.sportslogos.net/
- Comprehensive logo database
- **Images are watermarked - for reference only**
- Would need permission for actual use
- Credit: "Logo research via SportsLogos.net"

### 4. Chris Creamer's SportsLogos.net
- Has historical logos with evolution timeline
- Great for reference and research
- Watermarked images (reference only)

## How to Download SVG Logos

### Option 1: Wikimedia Commons (Manual)

1. Go to https://commons.wikimedia.org/
2. Search for "{Team Name} logo"
3. Look for SVG format files
4. Download the SVG directly (not PNG thumbnail)
5. Save to `web/public/logos/{league}/{CODE}.svg`

### Option 2: Use Our Script

```bash
# Download all legacy logos (WNBA + NBA)
./scripts/download_legacy_logos.sh

# Download only WNBA
./scripts/download_legacy_logos.sh wnba

# Download only NBA
./scripts/download_legacy_logos.sh nba
```

### Option 3: Convert PNG to SVG (If No SVG Available)

If an SVG truly doesn't exist, you can convert PNG to SVG:

**Online Tools:**
- https://vectormagic.com/ (best quality, some free conversions)
- https://www.pngtosvg.com/ (free, lower quality)
- https://convertio.co/png-svg/ (free)

**Command Line (using potrace):**
```bash
# Install potrace
brew install potrace  # macOS
sudo apt-get install potrace  # Linux

# Convert PNG to SVG
potrace -s -o output.svg input.png
```

**Note:** Auto-converted logos may need manual cleanup for best results.

## Current Attribution

All logos displayed in this project are used under fair use for:
- Non-commercial purposes
- Educational/historical reference
- Sports statistics and analysis

### Credits

- **WNBA Legacy Team PNGs**: Courtesy of [Loodibee.com](https://loodibee.com/)
- **Logo Research**: Referenced from [SportsLogos.net](https://www.sportslogos.net/)
- **SVG Sources**: Where available, from Wikimedia Commons (Public Domain / CC-BY-SA)
- **Team Trademarks**: All team names and logos are trademarks of the WNBA, NBA, and their respective teams

## Need Help?

If you find high-quality SVG versions of any legacy team logos:

1. Add them to `web/public/logos/{league}/{CODE}.svg`
2. Update this document with the source
3. Ensure the source allows fair use / is public domain
4. Submit a PR!

## Status Summary

- ✅ Current teams (NBA & WNBA): All have SVG logos
- ⚠️ WNBA legacy teams: 5/11 have SVG, 6/11 are PNG
- ❌ NBA legacy teams: 0/8 have logos (need to download)
