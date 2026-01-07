# WNBA Team Logos - Sourcing Guide

## Teams Requiring Logos (25 Total)

### Active Teams (13)
- **ATL** - Atlanta Dream (2008-present)
- **CHI** - Chicago Sky (2006-present)
- **CON** - Connecticut Sun (2003-present)
- **DAL** - Dallas Wings (2016-present)
- **GSV** - Golden State Valkyries (2025-present) ⭐ NEW
- **IND** - Indiana Fever (2000-present)
- **LVA** - Las Vegas Aces (2018-present)
- **LAS** - Los Angeles Sparks (1997-present)
- **MIN** - Minnesota Lynx (1999-present)
- **NYL** - New York Liberty (1997-present)
- **PHO** - Phoenix Mercury (1997-present)
- **SEA** - Seattle Storm (2000-present)
- **WAS** - Washington Mystics (1998-present)

### Historical Teams - Relocated/Rebranded (6)
- **DET** - Detroit Shock (1998-2009) → became Tulsa Shock
- **ORL** - Orlando Miracle (1999-2002) → became Connecticut Sun
- **SAS** - San Antonio Stars/Silver Stars (2003-2017) → became Las Vegas Aces
- **TUL** - Tulsa Shock (2010-2015) → became Dallas Wings
- **UTA** - Utah Starzz (1997-2002) → became San Antonio Silver Stars

### Defunct Teams (6)
- **CHA** - Charlotte Sting (1997-2006)
- **CLE** - Cleveland Rockers (1997-2003)
- **HOU** - Houston Comets (1997-2008)
- **MIA** - Miami Sol (2000-2002)
- **PFI** - Portland Fire (2000-2002)
- **SAC** - Sacramento Monarchs (1997-2009)

## Recommended Logo Sources

### 1. **Wikimedia Commons** (BEST for historical logos)
- URL: [Category:Women's National Basketball Association logos](https://en.wikipedia.org/wiki/Category:Women's_National_Basketball_Association_logos)
- **Pros:**
  - Free to use (public domain or Creative Commons)
  - High quality SVG and PNG formats
  - 24+ WNBA team logos available
  - Includes historical/defunct teams
  - No copyright issues for non-commercial use
- **Cons:**
  - May need to download individually
  - Some logos might be older versions

### 2. **SportsLogos.Net** (BEST for comprehensive coverage)
- URL: [WNBA Logos](https://www.sportslogos.net/teams/list_by_league/16/Womens-National-Basketball-Association-Logos/WNBA-Logos/)
- **Pros:**
  - Has ALL 13 current teams + 11 historical teams
  - Multiple logo versions per team (primary, alternate, historical)
  - Shows logo evolution over time
  - GIF and PNG formats available
- **Cons:**
  - Watermarked images (for reference only)
  - Not for commercial use without permission
  - Would need to source elsewhere or contact for licensing

### 3. **GitHub - team-logos Repository**
- URL: [klunn91/team-logos](https://github.com/klunn91/team-logos)
- **Pros:**
  - Open source
  - One-stop shop for sports team logos
  - May include WNBA logos
  - Easy to integrate into build process
- **Cons:**
  - Unknown coverage of WNBA teams
  - Would need to verify quality/completeness

### 4. **SeekLogo / BrandEPS**
- URLs:
  - [SeekLogo WNBA](https://seeklogo.com/free-vector-logos/wnba)
  - [BrandEPS WNBA](https://brandeps.com/logo/W/WNBA-01)
- **Pros:**
  - Multiple formats (SVG, PNG, EPS, AI)
  - High quality vector files
  - Clean, professional logos
- **Cons:**
  - Primarily have individual team logos, not comprehensive
  - Copyright notice - verify usage rights
  - May not have all historical teams

## Recommended Approach

### Option 1: Wikimedia Commons (RECOMMENDED for open source project)
1. Visit [Wikipedia WNBA Logos Category](https://en.wikipedia.org/wiki/Category:Women's_National_Basketball_Association_logos)
2. Download SVG or PNG versions of each team logo
3. Resize to consistent dimensions (recommend 512x512px or 256x256px)
4. Store in `/web/public/logos/wnba/` directory
5. Attribution: Most are public domain or CC-licensed

### Option 2: Official Team Websites (BEST quality for current teams)
1. Visit each active team's official website
2. Download logos from press/media section
3. Only covers 13 active teams (not historical)
4. May have usage restrictions - verify

### Option 3: Hybrid Approach (BEST OVERALL)
1. Use Wikimedia Commons for historical/defunct teams
2. Use official team websites for current teams
3. Ensures highest quality for active teams
4. Free/legal for all historical teams

## Technical Requirements

### Image Specifications
- **Format:** SVG (preferred) or PNG with transparency
- **Size:** 512x512px (or 256x256px for smaller file sizes)
- **Aspect Ratio:** Square (1:1) or maintain original aspect ratio
- **Background:** Transparent
- **File Naming:** `{TEAM_CODE}.svg` or `{TEAM_CODE}.png`
  - Example: `LVA.svg`, `HOU.png`

### Storage Location
```
web/public/logos/wnba/
├── ATL.svg
├── CHI.svg
├── CON.svg
├── DAL.svg
├── GSV.svg
├── IND.svg
├── LVA.svg
├── LAS.svg
├── MIN.svg
├── NYL.svg
├── PHO.svg
├── SEA.svg
├── WAS.svg
├── DET.svg
├── ORL.svg
├── SAS.svg
├── TUL.svg
├── UTA.svg
├── CHA.svg
├── CLE.svg
├── HOU.svg
├── MIA.svg
├── PFI.svg
└── SAC.svg
```

### Code Update Required
Update `web/components/TeamLogo.tsx` to:
1. Check if logo file exists for team
2. If exists: render `<img>` with logo
3. If not: fallback to current colored circle with team code

```tsx
// Pseudocode
const logoPath = `/logos/wnba/${teamCode}.svg`
const hasLogo = // check if file exists

return hasLogo
  ? <img src={logoPath} alt={teamCode} className={sizeMap[size]} />
  : <div className="colored-circle">...</div> // current implementation
```

## Copyright & Usage Notes

⚠️ **Important:** Team logos are trademarked by their respective organizations. For a non-commercial, educational, or reference project, fair use may apply, but verify based on your use case:

- **Non-commercial use:** Generally acceptable under fair use
- **Commercial use:** Requires explicit permission/licensing
- **Attribution:** Always recommended, especially for CC-licensed content
- **Wikimedia/Public Domain:** Safest option for open source projects

## Next Steps

1. ✅ Identify all 25 teams requiring logos
2. ✅ Research and document sources
3. ⬜ Choose sourcing strategy (recommend Option 3: Hybrid)
4. ⬜ Download and process logos to consistent format
5. ⬜ Add to `/web/public/logos/wnba/` directory
6. ⬜ Update `TeamLogo.tsx` component to use actual logos
7. ⬜ Test all logos render correctly at different sizes
8. ⬜ Add attribution file if using CC-licensed content

## Reference Links

- [Wikipedia: WNBA Logos Category](https://en.wikipedia.org/wiki/Category:Women's_National_Basketball_Association_logos)
- [SportsLogos.Net: WNBA](https://www.sportslogos.net/teams/list_by_league/16/Womens-National-Basketball-Association-Logos/WNBA-Logos/)
- [GitHub: team-logos](https://github.com/klunn91/team-logos)
- [SeekLogo: WNBA](https://seeklogo.com/free-vector-logos/wnba)
- [Sports Logo History: WNBA](https://sportslogohistory.com/wnba-logo-history/)
