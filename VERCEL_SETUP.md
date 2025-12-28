# Vercel Deployment Setup

## Quick Setup for Pokemon Card Analyzer on Vercel

### Option 1: Set Root Directory (Easiest) ⭐

1. Go to your Vercel project dashboard
2. Click **Settings** → **General**
3. Scroll to **Root Directory**
4. Set it to: `pokemon-card-analyzer`
5. Save and redeploy

This will make the Pokemon Card Analyzer your main app at your Vercel domain.

### Option 2: Use Current Structure

The `vercel.json` is configured, but you may need to:

1. In Vercel dashboard → **Settings** → **Build & Development Settings**
2. Set **Build Command**: `cd pokemon-card-analyzer && npm install`
3. Set **Output Directory**: `pokemon-card-analyzer/public`
4. Set **Install Command**: (leave empty or `npm install`)

### Environment Variables

Don't forget to add your eBay API credentials in Vercel:

1. Go to **Settings** → **Environment Variables**
2. Add:
   - `EBAY_CLIENT_ID` = your_client_id
   - `EBAY_CLIENT_SECRET` = your_client_secret
   - `EBAY_ENVIRONMENT` = sandbox (or production)
   - `PORT` = (leave empty, Vercel sets this automatically)

### Testing Locally First

Before deploying to Vercel, test locally:

```bash
cd pokemon-card-analyzer
npm install
npm start
```

Visit `http://localhost:3000` to verify it works.

---

## Current Structure

- `/` - Landing page (links to projects)
- `/pokemon-card-analyzer/` - Pokemon Card Analyzer app
- `/beans.html` - Beans landing page

If you want Pokemon Card Analyzer as your main page on Vercel, use **Option 1** above.

