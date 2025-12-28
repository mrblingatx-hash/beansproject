# Quick Setup Guide

## Getting Started (5 minutes)

### Step 1: Install Dependencies
```bash
cd pokemon-card-analyzer
npm install
```

### Step 2: Run with Mock Data
```bash
npm start
```
Open `http://localhost:3000` - **It works immediately with mock data!**

### Step 3: Explore the Interface
- Add some cards to your inventory
- Search for eBay listings (uses mock data)
- Run price analysis

---

## Setting Up Real eBay API (15 minutes)

### Step 1: Get eBay Credentials

1. **Register at eBay Developer Portal**
   - Go to: https://developer.ebay.com/
   - Click "Sign In" or "Register"
   - Use your eBay account (or create one)

2. **Create Application**
   - After signing in, go to "My Account" → "Keys"
   - Click "Create an App Key"
   - Fill in:
     - App Name: "Pokemon Card Analyzer" (or your choice)
     - Dev ID: Will be auto-generated
     - Environment: Start with "Sandbox"
   - Click "Create"
   - **Save your Client ID and Client Secret!**

### Step 2: Configure Environment

1. **Create `.env` file** (already in `.gitignore`)
```bash
cp .env.example .env
```

2. **Edit `.env` and add your credentials:**
```env
EBAY_CLIENT_ID=YourClientIdFromPortal
EBAY_CLIENT_SECRET=YourClientSecretFromPortal
EBAY_ENVIRONMENT=sandbox
EBAY_REDIRECT_URI=http://localhost:3000/auth/callback
PORT=3000
```

3. **Restart the server:**
```bash
npm start
```

4. **Verify API is working:**
   - Check the status indicator at the top (should turn green)
   - Try a search - should use real eBay data

### Step 3: Switch to Production (when ready)

1. **Get Production Credentials**
   - In eBay Developer Portal, create a production app key
   - Copy the new Client ID and Secret

2. **Update `.env`:**
```env
EBAY_CLIENT_ID=YourProductionClientId
EBAY_CLIENT_SECRET=YourProductionClientSecret
EBAY_ENVIRONMENT=production
```

3. **Restart server**

---

## Understanding the Interface

### Mock Data vs Real Data

**🔶 Yellow Indicator = Mock Data**
- App works fully but shows sample data
- Good for exploring features
- No API credentials needed

**🟢 Green Indicator = Real API**
- Shows actual eBay listings
- Requires valid credentials
- Respects API rate limits

### Tab Overview

**1. My Inventory**
- Add, edit, delete cards
- Filter by name or set
- View statistics

**2. Search eBay**
- Search for "Pick Your Card" listings
- View listing details
- See card variations and prices

**3. Price Analysis**
- Compare your inventory to eBay prices
- Get pricing recommendations
- See market averages and ranges

---

## Common Issues

### "API credentials not configured"
- ✅ Normal if using mock data
- To fix: Set up `.env` file with credentials (see above)

### "Error getting eBay access token"
- Check your Client ID and Secret are correct
- Ensure environment matches your app key type (sandbox/production)
- Verify you're connected to the internet

### "No listings found"
- Try different search queries
- Check that category ID is correct (183454 for Pokemon)
- If using sandbox, note that sandbox has limited data

### Port already in use
- Change `PORT=3001` in `.env`
- Or kill the process using port 3000

---

## Next Steps

1. ✅ Get app running (mock data is fine)
2. ✅ Explore the interface
3. ✅ Add your actual card inventory
4. ⚙️ Set up eBay API (optional, for real data)
5. 📊 Run analysis on your cards
6. 💰 Use recommendations to price your listings

---

## Need Help?

- **eBay API Docs**: https://developer.ebay.com/api-docs
- **API Status**: Check the indicator at top of page
- **Mock Data**: App works without API - explore first!

