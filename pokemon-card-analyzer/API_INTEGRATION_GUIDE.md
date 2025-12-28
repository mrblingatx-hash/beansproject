# API Integration Points - Visual Guide

This document shows exactly where real eBay API calls are made and what the mock data structure looks like.

## 🔐 Authentication Flow

### Current Implementation (Mock Mode)
```javascript
// src/services/ebayService.js - Line ~30
async function getAccessToken() {
  // If credentials are not configured, return null (will use mock data)
  if (!EBAY_CLIENT_ID || !EBAY_CLIENT_SECRET) {
    return null;
  }
  // ... real OAuth implementation here
}
```

### Real API Integration
When credentials are set, this function will:
1. POST to `https://api.ebay.com/identity/v1/oauth2/token`
2. Send Client ID and Secret in Basic Auth header
3. Receive access token (expires in ~2 hours)
4. Token is cached until expiration

---

## 🔍 Search Listings

### Mock Data Structure
```javascript
// src/services/ebayService.js - getMockSearchResults()
{
  total: 4,
  items: [
    {
      itemId: 'mock-001',
      title: 'Pokemon Base Set PICK YOUR CARD - Charizard, Blastoise...',
      price: { value: '99.99', currency: 'USD' },
      itemWebUrl: 'https://www.ebay.com/itm/mock-001',
      thumbnailImages: [{ imageUrl: '...' }],
      condition: 'Near Mint',
      seller: { username: 'mock_seller_1', feedbackPercentage: '99.5' },
      itemHref: '/api/ebay/item/mock-001'
    },
    // ... more items
  ],
  mockData: true
}
```

### Real API Call
```javascript
// When API is configured, calls:
GET https://api.ebay.com/buy/browse/v1/item_summary/search
Headers: {
  'Authorization': 'Bearer {access_token}',
  'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
}
Query Params: {
  q: 'pokemon base set pick your card',
  category_ids: '183454',
  filter: 'buyingOptions:{FIXED_PRICE}',
  sort: 'price',
  limit: 200
}
```

**Response Structure (Real API):**
```json
{
  "total": 150,
  "itemSummaries": [
    {
      "itemId": "v1|123456789|0",
      "title": "Pokemon Base Set - Pick Your Card...",
      "price": {
        "value": "99.99",
        "currency": "USD"
      },
      "image": {
        "imageUrl": "https://..."
      },
      "condition": "NEW",
      "seller": {
        "username": "seller123",
        "feedbackPercentage": "99.5",
        "feedbackScore": 1500
      },
      "itemWebUrl": "https://www.ebay.com/itm/..."
    }
  ],
  "href": "...",
  "next": "..."
}
```

---

## 📦 Listing Details (Variations)

### Mock Data Structure
```javascript
// src/services/ebayService.js - getMockListingDetails()
{
  itemId: 'mock-001',
  title: 'Mock Pokemon Card Listing',
  price: { value: '99.99', currency: 'USD' },
  condition: 'Near Mint',
  itemVariations: [
    {
      specifications: [{ name: 'Charizard' }],
      price: { value: '299.99', currency: 'USD' },
      availableQuantity: 3
    },
    {
      specifications: [{ name: 'Blastoise' }],
      price: { value: '89.99', currency: 'USD' },
      availableQuantity: 5
    }
    // ... more variations
  ],
  mockData: true
}
```

### Real API Call
```javascript
GET https://api.ebay.com/buy/browse/v1/item/{itemId}
Headers: {
  'Authorization': 'Bearer {access_token}',
  'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
}
```

**Response Structure (Real API):**
```json
{
  "itemId": "v1|123456789|0",
  "title": "Pokemon Base Set - Pick Your Card...",
  "price": {
    "value": "99.99",
    "currency": "USD"
  },
  "condition": "NEW",
  "itemVariations": [
    {
      "specifications": [
        {
          "name": "Card Name",
          "value": "Charizard"
        }
      ],
      "price": {
        "value": "299.99",
        "currency": "USD"
      },
      "availableQuantity": 3
    }
    // ... more variations
  ],
  "image": {
    "imageUrl": "https://..."
  },
  "itemWebUrl": "https://www.ebay.com/itm/..."
}
```

---

## 🎯 How Mock Data is Used

### Frontend Display
The frontend doesn't know if it's receiving mock or real data. Both have the same structure:

```javascript
// Both mock and real data follow same structure
const listing = {
  itemId: string,
  title: string,
  price: { value: string, currency: string },
  itemVariations: [...],
  // ...
};
```

### Visual Indicators
The UI shows indicators when using mock data:
- **Yellow status badge**: "Using Mock Data"
- **Mock notices**: In search results and listing details
- **Green status badge**: "API Configured" (when real API is active)

---

## 📊 Data Flow Diagram

```
┌─────────────┐
│   Browser   │
│  (Frontend) │
└──────┬──────┘
       │
       │ HTTP Request
       ▼
┌─────────────────────────────────────┐
│         Express Server              │
│         (server.js)                 │
└──────┬──────────────────┬───────────┘
       │                  │
       ▼                  ▼
┌──────────────┐  ┌──────────────────┐
│   Routes     │  │    Services      │
│  (routes/)   │  │  (services/)     │
└──────┬───────┘  └────────┬─────────┘
       │                   │
       │                   ▼
       │          ┌──────────────────┐
       │          │  ebayService.js  │
       │          │                  │
       │          │  getAccessToken()│
       │          │  searchListings()│
       │          │  getListingDetails()│
       │          └────────┬─────────┘
       │                   │
       │                   │ Check: EBAY_CLIENT_ID exists?
       │                   │
       ├───────────────────┤
       │                   │
       ▼                   ▼
┌──────────────┐  ┌──────────────────┐
│   Real API   │  │   Mock Data      │
│              │  │                  │
│  eBay Browse │  │  getMockSearch   │
│     API      │  │  Results()       │
└──────────────┘  │  getMockListing  │
                  │  Details()       │
                  └──────────────────┘
```

---

## 🔄 Switching from Mock to Real API

### Step 1: Add Credentials to .env
```env
EBAY_CLIENT_ID=your_real_client_id
EBAY_CLIENT_SECRET=your_real_client_secret
EBAY_ENVIRONMENT=sandbox
```

### Step 2: Restart Server
```bash
npm start
```

### Step 3: Verify
- Status indicator turns green
- Search results show real eBay listings
- Listing details show actual variation data

### No Code Changes Needed!
The same code handles both mock and real data automatically.

---

## 📝 Key Files Reference

| File | Purpose | Lines of Interest |
|------|---------|-------------------|
| `src/services/ebayService.js` | API logic | 30-50 (auth), 70-100 (search), 120-150 (details) |
| `src/routes/ebay.js` | API endpoints | All routes handle both mock and real data |
| `public/app.js` | Frontend | Displays data regardless of source |
| `server.js` | Server setup | Checks for credentials on startup |

---

## ⚠️ Important Notes

1. **Rate Limits**: Real API has rate limits (check eBay docs)
2. **Sandbox vs Production**: Sandbox has limited test data
3. **Token Expiration**: Access tokens expire, service auto-refreshes
4. **Error Handling**: Falls back to mock data on API errors (for development)
5. **Mock Data**: Always available for testing/demo purposes

---

## 🎨 Visual Mockup of API Status

### Mock Mode (Current)
```
┌─────────────────────────────────────┐
│ ⚡ Pokemon Card Analyzer            │
│                                     │
│ 🟡 Using Mock Data - Configure API │
│    credentials for real data        │
└─────────────────────────────────────┘
```

### Real API Mode (After Setup)
```
┌─────────────────────────────────────┐
│ ⚡ Pokemon Card Analyzer            │
│                                     │
│ 🟢 API Configured - sandbox env    │
└─────────────────────────────────────┘
```

### In Search Results
```
┌─────────────────────────────────────┐
│ 🔶 Mock Data: These are sample      │
│ listings. Configure your eBay API   │
│ credentials in .env to access real  │
│ listings.                           │
└─────────────────────────────────────┘
```

---

## ✅ Testing Checklist

- [ ] App runs with mock data (no .env needed)
- [ ] Can add cards to inventory
- [ ] Can search eBay (mock results)
- [ ] Can view listing details (mock variations)
- [ ] Can run analysis (mock pricing)
- [ ] Add .env with sandbox credentials
- [ ] Status indicator turns green
- [ ] Search returns real eBay listings
- [ ] Listing details show real variations
- [ ] Analysis uses real pricing data

