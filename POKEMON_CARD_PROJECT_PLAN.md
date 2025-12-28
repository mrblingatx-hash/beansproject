# Pokemon Card Bulk Selling Project Plan

## Goal
Sell bulk Pokemon cards by analyzing eBay "Pick Your Card" listings for specific sets to determine pricing strategies.

---

## Phase 1: Research & Setup

### 1.1 eBay Developer Account Setup
- [ ] Register for eBay Developer Program account (free for hobby/non-commercial use)
  - Visit: https://developer.ebay.com/
  - Sign up with your eBay account or create new account
  - Complete developer registration

### 1.2 API Credentials & Environment Variables
You'll need to create a `.env` file with the following variables:

```env
# eBay API Credentials (from Developer Portal)
EBAY_CLIENT_ID=your_client_id_here
EBAY_CLIENT_SECRET=your_client_secret_here

# eBay Environment (sandbox or production)
EBAY_ENVIRONMENT=sandbox
# EBAY_ENVIRONMENT=production

# OAuth Redirect URI (for your app)
EBAY_REDIRECT_URI=http://localhost:3000/auth/callback

# Optional: eBay App ID (if using older APIs)
# EBAY_APP_ID=your_app_id

# Optional: User Token (after OAuth flow)
# EBAY_USER_TOKEN=your_user_token
```

**Important:** 
- Start with `sandbox` environment for testing
- Never commit `.env` file to git (add to `.gitignore`)
- Credentials are available from eBay Developer Portal after registration

### 1.3 Understanding eBay APIs for This Project

**Primary APIs to Use:**
1. **Browse API** (Recommended)
   - Search for active listings by keywords
   - Filter by category, price, condition, etc.
   - Returns listing details including variations
   - Better for "Pick Your Card" style searches

2. **Finding API** (Alternative)
   - Legacy API, still functional
   - Good for basic searches
   - May have limitations with variation listings

**Key Endpoints:**
- `GET /buy/browse/v1/item_summary/search` - Search listings
- `GET /buy/browse/v1/item/{item_id}` - Get detailed listing info
- OAuth token endpoint for authentication

---

## Phase 2: Data Access Strategy

### 2.1 Authentication Flow
```
1. Register app → Get Client ID & Secret
2. Implement OAuth 2.0 flow
3. Exchange authorization code for access token
4. Use token for API requests (token expires, need refresh)
```

### 2.2 Search Strategy for "Pick Your Card" Listings

**Search Parameters to Consider:**
- Keywords: `"pokemon" + "set name" + "pick your card"` or `"pokemon" + "set name" + "single"`
- Category: Trading Cards > Pokemon
- Listing Format: Fixed Price (Buy It Now)
- Sort by: Price (to see competitive pricing)
- Filters: Condition (Near Mint, Lightly Played, etc.)

**Example Search Query Structure:**
```javascript
{
  q: "pokemon base set pick your card",
  category_ids: ["183454"], // Pokemon Cards category
  filter: "buyingOptions:{FIXED_PRICE}",
  sort: "price",
  limit: 200
}
```

### 2.3 Data Points to Extract
For each listing, capture:
- Listing title
- Set name (extract from title/description)
- Individual card prices (from variations if available)
- Card condition
- Shipping cost
- Seller rating/feedback
- Quantity available
- Listing end date
- Images

---

## Phase 3: Technical Implementation

### 3.1 Project Structure
```
pokemon-card-analyzer/
├── .env                    # Environment variables (gitignored)
├── .gitignore             # Include .env
├── README.md
├── package.json
├── src/
│   ├── config/
│   │   └── ebay.js        # eBay API configuration
│   ├── services/
│   │   ├── ebayAuth.js    # OAuth authentication
│   │   ├── ebaySearch.js  # Search listings
│   │   └── dataParser.js  # Parse listing data
│   ├── models/
│   │   └── card.js        # Card data model
│   └── main.js            # Main script
└── data/
    └── output/            # Saved search results
```

### 3.2 Key Dependencies
```json
{
  "axios": "^1.6.0",           // HTTP requests
  "dotenv": "^16.3.1",         // Environment variables
  "csv-writer": "^1.6.0",      // Export to CSV (optional)
  "node-fetch": "^3.3.2"       // Alternative to axios
}
```

### 3.3 Implementation Steps

**Step 1: OAuth Authentication**
- Implement OAuth 2.0 flow
- Store and refresh tokens
- Handle token expiration

**Step 2: Search Function**
- Build search query builder
- Handle pagination (eBay limits ~200 results per request)
- Rate limiting (respect eBay API limits)

**Step 3: Data Parsing**
- Extract card names from listing titles
- Parse variation data for "Pick Your Card" listings
- Normalize set names and card identifiers

**Step 4: Data Storage**
- Store results in JSON/CSV format
- Create local database of your inventory
- Match your cards to eBay listings

**Step 5: Analysis & Pricing**
- Calculate average prices per card/set
- Identify pricing trends
- Compare your inventory to market prices

---

## Phase 4: Legal & Ethical Considerations

### 4.1 API Usage Guidelines
- ✅ eBay APIs are free for hobby/non-commercial use
- ✅ Respect rate limits (check API documentation)
- ✅ Don't scrape HTML directly (use APIs)
- ✅ Follow eBay's API Terms of Service

### 4.2 Rate Limits
- Check current rate limits in API documentation
- Implement request throttling
- Cache results when possible
- Use sandbox for development/testing

### 4.3 Data Usage
- Use data only for personal pricing research
- Don't republish eBay listing data publicly
- Respect seller privacy
- Follow fair use principles

---

## Phase 5: Alternative Approaches

### 5.1 If API Access is Limited
- **eBay Seller Hub**: Manual research tool (free, but manual)
- **eBay Advanced Search**: Direct URL parameters (limited automation)
- **eBay Terapeak** (paid): Professional market research tool

### 5.2 Third-Party Tools
- Consider existing Pokemon card price tracking sites
- TCGPlayer API (alternative data source)
- PriceCharting API (gaming card prices)

---

## Phase 6: MVP Development Roadmap

### Week 1: Setup & Authentication
- [ ] Create project structure
- [ ] Set up eBay Developer account
- [ ] Implement OAuth flow
- [ ] Test authentication in sandbox

### Week 2: Search Implementation
- [ ] Build search function
- [ ] Test with sample queries
- [ ] Handle pagination
- [ ] Implement error handling

### Week 3: Data Processing
- [ ] Parse listing data
- [ ] Extract card information
- [ ] Normalize data format
- [ ] Export to readable format (JSON/CSV)

### Week 4: Analysis & Integration
- [ ] Create inventory input system
- [ ] Match cards to listings
- [ ] Generate pricing recommendations
- [ ] Create simple report/visualization

---

## Next Steps

1. **Start with eBay Developer Registration**
   - Go to https://developer.ebay.com/
   - Create account and register application
   - Get your Client ID and Client Secret

2. **Choose Your Tech Stack**
   - Node.js/Python for backend
   - Simple CLI tool or web interface
   - Database for storing results (SQLite for simplicity)

3. **Begin with Sandbox Testing**
   - Test authentication flow
   - Try sample searches
   - Validate data extraction

4. **Build MVP**
   - Focus on one Pokemon set initially
   - Get basic search and parsing working
   - Expand from there

---

## Useful Resources

- **eBay Developer Portal**: https://developer.ebay.com/
- **Browse API Docs**: https://developer.ebay.com/api-docs/buy/browse/overview.html
- **OAuth Guide**: https://developer.ebay.com/api-docs/static/oauth-tokens.html
- **API Explorer**: https://developer.ebay.com/my/api_test_tool
- **Sandbox Environment**: https://api.sandbox.ebay.com/

---

## Questions to Answer Before Starting

1. Which Pokemon sets do you want to focus on first?
2. Do you prefer Node.js, Python, or another language?
3. CLI tool or web interface?
4. Do you already have your card inventory cataloged?
5. What's your timeline for MVP?

