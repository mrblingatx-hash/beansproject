# Pokemon Card Analyzer

A web application to analyze eBay Pokemon card listings and optimize your bulk card sales strategy. Compare your inventory against current eBay "Pick Your Card" listings to get pricing recommendations.

## Features

- 📦 **Inventory Management**: Track your Pokemon card collection with set, quantity, and condition
- 🔍 **eBay Search**: Search for "Pick Your Card" listings on eBay
- 📊 **Price Analysis**: Compare your cards against eBay market prices
- 💰 **Pricing Recommendations**: Get suggested prices based on market data
- 🎨 **Modern Dark UI**: Professional, easy-to-use interface

## Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone or navigate to the project directory:
```bash
cd pokemon-card-analyzer
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (optional for mock data):
```bash
cp .env.example .env
```

Edit `.env` and add your eBay API credentials (see below).

4. Start the server:
```bash
npm start
```

5. Open your browser to `http://localhost:3000`

## eBay API Configuration

The app works with **mock data** by default, so you can explore the interface immediately. To use real eBay data:

### 1. Register for eBay Developer Account

1. Go to [eBay Developer Portal](https://developer.ebay.com/)
2. Sign in with your eBay account (or create one)
3. Register as a developer (free for hobby/non-commercial use)
4. Create a new application
5. Copy your **Client ID** and **Client Secret**

### 2. Configure Environment Variables

Edit the `.env` file:

```env
EBAY_CLIENT_ID=your_client_id_here
EBAY_CLIENT_SECRET=your_client_secret_here
EBAY_ENVIRONMENT=sandbox
EBAY_REDIRECT_URI=http://localhost:3000/auth/callback
PORT=3000
```

### 3. Test in Sandbox

Start with `EBAY_ENVIRONMENT=sandbox` to test without affecting live data.

### 4. Production Access

Once tested, change to `EBAY_ENVIRONMENT=production` for real listings.

## Usage

### Managing Inventory

1. Click the **"My Inventory"** tab
2. Click **"+ Add Card"** to add cards
3. Enter card name, set, quantity, condition, and optional notes
4. Use filters to search and filter your inventory

### Searching eBay

1. Click the **"Search eBay"** tab
2. Enter a search query (e.g., "pokemon base set pick your card")
3. Adjust category and result limit if needed
4. Click **"Search eBay"** to find listings
5. Click **"View Details"** on any listing to see card variations and prices

### Price Analysis

1. Add cards to your inventory
2. Search for relevant eBay listings
3. Click the **"Price Analysis"** tab
4. Click **"Run Analysis"** to compare your inventory against listings
5. Review pricing recommendations for each card

## Project Structure

```
pokemon-card-analyzer/
├── public/                 # Frontend files
│   ├── index.html         # Main HTML
│   ├── styles.css         # Styling
│   └── app.js             # Frontend JavaScript
├── src/
│   ├── services/          # Business logic
│   │   └── ebayService.js # eBay API integration
│   └── routes/            # API routes
│       ├── ebay.js        # eBay search endpoints
│       ├── inventory.js   # Inventory management
│       └── analysis.js    # Price analysis
├── data/                  # Data storage (auto-created)
│   └── inventory.json     # Your card inventory
├── server.js              # Express server
├── package.json           # Dependencies
└── .env                   # Environment variables (gitignored)
```

## API Endpoints

### Inventory
- `GET /api/inventory` - Get all cards
- `POST /api/inventory` - Add a card
- `PUT /api/inventory/:id` - Update a card
- `DELETE /api/inventory/:id` - Delete a card

### eBay
- `GET /api/ebay/search?query=...` - Search listings
- `GET /api/ebay/item/:itemId` - Get listing details
- `GET /api/ebay/item/:itemId/prices` - Get card prices from variations

### Analysis
- `POST /api/analysis/compare` - Compare inventory vs listings
- `GET /api/analysis/recommendations` - Get pricing recommendations

## Mock Data

When API credentials are not configured, the app uses realistic mock data:
- Sample Pokemon card listings
- Variation pricing examples
- Realistic card names and sets

This allows you to explore all features without API setup.

## Technologies Used

- **Backend**: Node.js, Express
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **API**: eBay Browse API (OAuth 2.0)
- **Storage**: JSON file (inventory)

## Future Enhancements

- [ ] Database integration (SQLite/PostgreSQL)
- [ ] Export/import inventory (CSV/JSON)
- [ ] Price history tracking
- [ ] Multi-set analysis
- [ ] Email alerts for price changes
- [ ] Bulk import from spreadsheet

## License

MIT - Free for hobby and personal use

## Support

For eBay API questions, refer to:
- [eBay Developer Documentation](https://developer.ebay.com/api-docs)
- [Browse API Reference](https://developer.ebay.com/api-docs/buy/browse/overview.html)

