# Vercel Deployment Guide

## Overview
This project is a Next.js static site (`output: 'export'`) that loads NBA, WNBA, and NHL game data at build time from the `/data` directory. No environment variables or API keys are required.

## Quick Start

1. **Import Project to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select your GitHub repository: `buckle-up`
   - Vercel will auto-detect the `vercel.json` configuration

2. **Verify Build Settings** (should auto-populate from vercel.json)
   - **Framework Preset**: Other
   - **Root Directory**: `./` (project root)
   - **Build Command**: `cd web && npm run build`
   - **Output Directory**: `web/out`
   - **Install Command**: `cd web && npm install`

3. **Environment Variables**
   - ✅ **None required!** This app has no environment variables

4. **Deploy**
   - Click "Deploy"
   - First deployment will take ~2-3 minutes

## Data Updates

The app loads game data from the `/data` directory during build time. To update data:

1. Run data ingestion scripts locally:
   ```bash
   # For NBA
   python scripts/ingest_nba.py

   # For WNBA
   python scripts/ingest_wnba.py

   # For NHL
   python scripts/ingest_nhl.py
   ```

2. Commit and push changes:
   ```bash
   git add data/
   git commit -m "Update game data - YYYY-MM-DD"
   git push
   ```

3. Vercel will automatically rebuild and deploy

**Note:** Data updates happen automatically via GitHub Actions nightly at 6:30 AM ET (see `.github/workflows/update-data.yml`)

## Project Structure

```
buckle-up/
├── data/                    # Game data (loaded at build time)
│   ├── nba/
│   │   ├── 2012-13.json ... 2024-25.json
│   │   └── franchises.csv
│   ├── wnba/
│   │   ├── 1997.json ... 2026.json
│   │   └── franchises.csv
│   └── nhl/
│       ├── 1969-70.json ... 2024-25.json
│       └── franchises.csv
├── web/                     # Next.js app
│   ├── app/
│   │   ├── nba/
│   │   ├── wnba/
│   │   └── nhl/
│   ├── components/
│   ├── lib/
│   └── package.json
├── scripts/                 # Python data ingestion scripts
│   ├── ingest_nba.py
│   ├── ingest_wnba.py
│   └── ingest_nhl.py
└── vercel.json             # Vercel configuration
```

## Troubleshooting

### Build fails with "Cannot find module"
- Check that all data files are committed to git
- Verify `/data` directory structure matches `web/lib/dataLoader.ts` expectations

### Outdated data on production
- Push new data files to git
- Vercel will auto-deploy on push to main branch

### Want to trigger manual redeploy
- Go to your project on Vercel dashboard
- Click "Deployments" tab
- Click "⋯" menu on latest deployment → "Redeploy"

## Custom Domain Setup (Optional)

1. Go to your project on Vercel → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. SSL certificate is automatic

## Performance Notes

- Static export = blazing fast page loads
- All data bundled at build time = no API calls
- Vercel CDN = global edge caching
- Expected Lighthouse score: 95+
