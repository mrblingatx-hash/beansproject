# Quick Start Guide: Pokemon Card eBay Integration

## Immediate Action Items

### 1. Register for eBay Developer Account
**Time: ~15 minutes**

1. Go to https://developer.ebay.com/
2. Click "Sign In" or "Register"
3. Use your existing eBay account or create new one
4. Complete developer registration form
5. Create a new application
6. Copy your **Client ID** and **Client Secret**

### 2. Set Up Environment Variables

Create a `.env` file in your project root (already in `.gitignore`):

```env
EBAY_CLIENT_ID=your_client_id_from_portal
EBAY_CLIENT_SECRET=your_client_secret_from_portal
EBAY_ENVIRONMENT=sandbox
EBAY_REDIRECT_URI=http://localhost:3000/auth/callback
```

### 3. Understand the Data Flow

```
Your Inventory → eBay Search → Price Analysis → Pricing Decision
```

**How "Pick Your Card" Listings Work:**
- Sellers create ONE listing with multiple variations (different cards)
- Buyers select which specific card they want
- Each variation has its own price
- You need to extract variation data to see individual card prices

### 4. Key eBay API Endpoints You'll Use

**Authentication:**
```
POST https://api.ebay.com/identity/v1/oauth2/token
```

**Search Listings:**
```
GET https://api.ebay.com/buy/browse/v1/item_summary/search
Query params: q, category_ids, filter, sort, limit
```

**Get Listing Details (with variations):**
```
GET https://api.ebay.com/buy/browse/v1/item/{itemId}
Returns: variation details, pricing, images
```

### 5. Example Search Query for Pokemon Cards

```javascript
// Search for "Pokemon Base Set Pick Your Card" listings
const searchParams = {
  q: "pokemon base set pick your card",
  category_ids: ["183454"], // Pokemon Cards category
  filter: "buyingOptions:{FIXED_PRICE}",
  sort: "price",
  limit: 200
};
```

**Important Categories:**
- Pokemon Cards: `183454`
- Trading Card Singles: `261328` (might also be relevant)

### 6. Data You'll Extract from Listings

For pricing analysis, you need:
- **Card Name** (from variation name or title parsing)
- **Set Name** (from title/description)
- **Price per card** (from variation pricing)
- **Condition** (Near Mint, Lightly Played, etc.)
- **Shipping cost**
- **Seller feedback/rating**

### 7. Common Challenges & Solutions

**Challenge: Finding "Pick Your Card" listings**
- Solution: Search for `"pick your card"` or look for listings with variations
- Filter by Fixed Price format
- Look for listings with multiple items in title

**Challenge: Parsing card names from titles**
- Solution: Pattern matching, regex, or NLP
- Titles often follow patterns like: "Pokemon Base Set [Card Name] - Pick Your Card"
- May need manual mapping for edge cases

**Challenge: Rate Limits**
- Solution: Implement request throttling
- Cache results locally
- Batch requests when possible

### 8. Testing Strategy

1. **Start in Sandbox**
   - Use `EBAY_ENVIRONMENT=sandbox`
   - Test authentication flow
   - Try sample searches
   - Validate data structure

2. **Test with Real Data (Production)**
   - Switch to `EBAY_ENVIRONMENT=production`
   - Start with one set (e.g., Base Set)
   - Validate pricing makes sense
   - Check for edge cases

3. **Scale Up**
   - Add more sets
   - Improve parsing accuracy
   - Add error handling
   - Optimize performance

### 9. Sample Code Structure (Pseudocode)

```javascript
// 1. Authenticate
const token = await getEbayToken(clientId, clientSecret);

// 2. Search for listings
const listings = await searchEbay({
  query: "pokemon base set pick your card",
  category: "183454",
  token: token
});

// 3. Get detailed listing info (includes variations)
const detailedListings = await Promise.all(
  listings.map(listing => getListingDetails(listing.itemId, token))
);

// 4. Extract card prices from variations
const cardPrices = extractCardPrices(detailedListings);

// 5. Analyze and compare to your inventory
const pricingRecommendations = analyzePricing(cardPrices, myInventory);
```

### 10. Next Steps After Setup

1. ✅ Get API credentials
2. ✅ Set up `.env` file
3. ✅ Test authentication
4. ✅ Try one search query manually
5. ✅ Parse one listing's variation data
6. ✅ Build automation script
7. ✅ Integrate with your inventory

---

## Helpful Links

- **Developer Portal**: https://developer.ebay.com/my/keys
- **Browse API Docs**: https://developer.ebay.com/api-docs/buy/browse/overview.html
- **API Explorer**: https://developer.ebay.com/my/api_test_tool
- **OAuth Guide**: https://developer.ebay.com/api-docs/static/oauth-tokens.html
- **Rate Limits**: Check API documentation for current limits

---

## Questions to Ask Yourself

1. **Which sets to start with?** (Base Set, Jungle, Fossil, etc.)
2. **Tech stack preference?** (Node.js, Python, etc.)
3. **Do you have inventory cataloged?** (Excel, CSV, database?)
4. **Automated or manual trigger?** (Run on demand vs scheduled)
5. **Output format?** (Console, CSV, JSON, web interface?)

