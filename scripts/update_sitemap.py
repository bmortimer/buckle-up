#!/usr/bin/env python3
"""
Sitemap Update Utility

Updates the lastmod date for a specific league page in the sitemap.
Only updates if data was actually changed for that league.

Usage:
    python scripts/update_sitemap.py --league nba
    python scripts/update_sitemap.py --league wnba
    python scripts/update_sitemap.py --league nhl
"""

import argparse
import sys
from datetime import datetime
from pathlib import Path
import re


def update_sitemap_lastmod(league: str) -> bool:
    """
    Update the lastmod date for a specific league in the sitemap.

    Args:
        league: League identifier ('nba', 'wnba', or 'nhl')

    Returns:
        True if sitemap was updated, False otherwise
    """
    # Validate league
    league = league.lower()
    if league not in ['nba', 'wnba', 'nhl']:
        print(f"Error: Invalid league '{league}'. Must be 'nba', 'wnba', or 'nhl'")
        return False

    # Find sitemap file
    sitemap_path = Path(__file__).parent.parent / 'web' / 'public' / 'sitemap.xml'

    if not sitemap_path.exists():
        print(f"Error: Sitemap not found at {sitemap_path}")
        return False

    # Read current sitemap
    with open(sitemap_path, 'r', encoding='utf-8') as f:
        sitemap_content = f.read()

    # Get today's date in ISO format
    today = datetime.now().strftime('%Y-%m-%d')

    # Build the URL pattern for this league
    league_url = f'https://whohasthebelt.com/{league}'

    # Pattern to match the <url> block for this league
    # This regex captures the entire <url>...</url> block
    pattern = rf'(<url>\s*<loc>{re.escape(league_url)}</loc>\s*<lastmod>)(\d{{4}}-\d{{2}}-\d{{2}})(</lastmod>.*?</url>)'

    # Check if the date is already current
    match = re.search(pattern, sitemap_content, re.DOTALL)
    if not match:
        print(f"Error: Could not find {league_url} in sitemap")
        return False

    current_date = match.group(2)
    if current_date == today:
        print(f"Sitemap for {league.upper()} already has today's date ({today})")
        return False

    # Replace with today's date
    updated_content = re.sub(
        pattern,
        rf'\g<1>{today}\g<3>',
        sitemap_content,
        flags=re.DOTALL
    )

    # Write back to file
    with open(sitemap_path, 'w', encoding='utf-8') as f:
        f.write(updated_content)

    print(f"✓ Updated sitemap lastmod for {league.upper()}: {current_date} → {today}")
    return True


def main():
    parser = argparse.ArgumentParser(
        description='Update sitemap lastmod date for a league'
    )
    parser.add_argument(
        '--league',
        required=True,
        choices=['nba', 'wnba', 'nhl'],
        help='League to update (nba, wnba, or nhl)'
    )

    args = parser.parse_args()

    try:
        success = update_sitemap_lastmod(args.league)
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
