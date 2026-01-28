# Team Logos - Sources & Attribution

This document credits the sources for current and historical team logos used in this project across NBA, WNBA, and NHL.

## Legal Notice

All team logos are trademarks of their respective teams and leagues (NBA, WNBA, NHL).
This project uses them under fair use for non-commercial, educational, and statistical purposes.

## WNBA Legacy Teams

All WNBA legacy teams have logos, but some are PNG instead of SVG.

### Logos as PNG (Need SVG)

| Code | Team | Years | Current Source |
|------|------|-------|----------------|
| CHA | Charlotte Sting | 1997-2006 | Loodibee.com (PNG, 300x300) |
| CLE | Cleveland Rockers | 1997-2003 | Loodibee.com (PNG, 300x300) |
| DET | Detroit Shock | 1998-2009 | Loodibee.com (PNG, 300x300) |
| HOU | Houston Comets | 1997-2008 | Loodibee.com (PNG, 300x300) |
| MIA | Miami Sol | 2000-2002 | Loodibee.com (PNG, 300x300) |
| ORL | Orlando Miracle | 1999-2002 | Loodibee.com (PNG, 300x300) |
| SAC | Sacramento Monarchs | 1997-2009 | Loodibee.com (PNG, 300x300) |
| SAS | San Antonio Stars | 2014-2017 | Loodibee.com (PNG, 300x300) |
| TUL | Tulsa Shock | 2010-2015 | Loodibee.com (PNG, 300x300) |
| UTA | Utah Starzz | 1997-2002 | Loodibee.com (PNG, 300x300) |

### SVG Logos Available

All current WNBA teams have SVG logos.

## NBA Legacy Teams

All NBA legacy teams have logos, but many are PNG instead of SVG.

### Logos as PNG (Need SVG)

| Code | Team | Years | Current Source |
|------|------|-------|----------------|
| CHH | Charlotte Hornets (original) | 1988-2002 | Loodibee.com (PNG) - relocated to NOH |
| KCK | Kansas City Kings | 1975-1985 | Loodibee.com (PNG) - relocated to Sacramento |
| NJN | New Jersey Nets | 1977-2012 | Loodibee.com (PNG) - relocated to Brooklyn |
| NOH | New Orleans Hornets | 2002-2013 | Loodibee.com (PNG) - became Pelicans |
| NOJ | New Orleans Jazz | 1974-1979 | Loodibee.com (PNG) - relocated to Utah |
| NOK | New Orleans/OKC Hornets | 2005-2007 | Loodibee.com (PNG) - Hurricane Katrina era |
| NYN | New York Nets (ABA) | 1968-1977 | Loodibee.com (PNG) - relocated to New Jersey |
| SDC | San Diego Clippers | 1978-1984 | Loodibee.com (PNG) - relocated to LA |
| WSB | Washington Bullets | 1974-1997 | Loodibee.com (PNG) - renamed to Wizards |

### SVG Logos Available

All current NBA teams have SVG logos.

## NHL Legacy Teams

All NHL legacy teams have logos, but many are PNG instead of SVG.

### Logos as PNG (Need SVG)

| Code | Team | Years | Current Source |
|------|------|-------|----------------|
| AFM | Atlanta Flames | 1972-1980 | Loodibee.com (PNG) - relocated to Calgary |
| ARI | Arizona Coyotes | 2014-2024 | Loodibee.com (PNG) - relocated to Utah |
| ATL | Atlanta Thrashers | 1999-2011 | Loodibee.com (PNG) - relocated to Winnipeg |
| CGS | California Golden Seals | 1967-1976 | SportsLogos.net (PNG) - relocated to Cleveland |
| CLE | Cleveland Barons | 1976-1978 | SportsLogos.net (PNG) - merged with Minnesota |
| CLR | Colorado Rockies | 1976-1982 | Loodibee.com (PNG) - relocated to New Jersey |
| HFD | Hartford Whalers | 1979-1997 | Loodibee.com (PNG) - relocated to Carolina |
| KCS | Kansas City Scouts | 1974-1976 | Loodibee.com (PNG) - relocated to Colorado |
| MDA | Mighty Ducks of Anaheim | 1993-2006 | Loodibee.com (PNG) - rebranded to Anaheim Ducks |
| MNS | Minnesota North Stars | 1967-1993 | Loodibee.com (PNG) - relocated to Dallas |
| PHX | Phoenix Coyotes | 1996-2014 | Loodibee.com (PNG) - rebranded to Arizona |
| QUE | Quebec Nordiques | 1979-1995 | Loodibee.com (PNG) - relocated to Colorado |
| WPG1 | Winnipeg Jets (original) | 1979-1996 | Loodibee.com (PNG) - relocated to Phoenix |

### SVG Logos Available

All current NHL teams have SVG logos.

## Recommended Sources

### 1. Wikimedia Commons (BEST - Public Domain)
- URL: https://commons.wikimedia.org/
- Many team logos available in SVG format
- Public domain or CC-licensed
- **Preferred source** when available

### 2. Loodibee.com (Primary PNG Source)
- URL: https://loodibee.com/
- High-quality PNG files (300x300)
- Used for most NBA, WNBA, and NHL legacy teams
- Credit required: "Logos courtesy of Loodibee.com"

### 3. SportsLogos.net
- URL: https://www.sportslogos.net/
- Comprehensive logo database with historical logos
- Used for California Golden Seals and Cleveland Barons (NHL)
- Credit: "Logo research and images via SportsLogos.net"
- Has complete evolution timeline for all teams

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

- **Most Legacy Team PNGs**: Courtesy of [Loodibee.com](https://loodibee.com/)
- **California Golden Seals & Cleveland Barons**: From [SportsLogos.net](https://www.sportslogos.net/)
- **Logo Research**: Referenced from [SportsLogos.net](https://www.sportslogos.net/)
- **SVG Sources**: Where available, from Wikimedia Commons (Public Domain / CC-BY-SA)
- **Team Trademarks**: All team names and logos are trademarks of the NBA, WNBA, NHL, and their respective teams

## Need Help?

If you find high-quality SVG versions of any legacy team logos:

1. Add them to `web/public/logos/{league}/{CODE}.svg`
2. Update this document with the source
3. Ensure the source allows fair use / is public domain
4. Submit a PR!

## Status Summary

- ✅ **Current teams**: All NBA (30), WNBA (13), and NHL (32) active teams have SVG logos
- ✅ **All teams have logos**: All legacy/defunct teams now have logo files across all three leagues
- ⚠️ **NBA legacy teams**: 37 SVG, 9 PNG (needs SVG conversion)
- ⚠️ **WNBA legacy teams**: 20 SVG, 10 PNG (needs SVG conversion)
- ⚠️ **NHL legacy teams**: 32 SVG, 13 PNG (needs SVG conversion)

Total: **177 team logos** covering 75+ years of NBA/WNBA/NHL history
