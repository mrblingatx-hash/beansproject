import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { ebayRouter } from './src/routes/ebay.js';
import { inventoryRouter } from './src/routes/inventory.js';
import { analysisRouter } from './src/routes/analysis.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// API Routes
app.use('/api/ebay', ebayRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/analysis', analysisRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    environment: process.env.EBAY_ENVIRONMENT || 'not configured',
    apiConfigured: !!(process.env.EBAY_CLIENT_ID && process.env.EBAY_CLIENT_SECRET)
  });
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Pokemon Card Analyzer running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.EBAY_ENVIRONMENT || 'not configured'}`);
  if (!process.env.EBAY_CLIENT_ID) {
    console.log('⚠️  Warning: eBay API credentials not configured. Using mock data.');
    console.log('   Set up EBAY_CLIENT_ID and EBAY_CLIENT_SECRET in .env file for real API access.');
  }
});

