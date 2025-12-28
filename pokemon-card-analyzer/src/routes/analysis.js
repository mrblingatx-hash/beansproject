import express from 'express';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getListingDetails, extractCardPrices } from '../services/ebayService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INVENTORY_FILE = join(__dirname, '../../data/inventory.json');

export const analysisRouter = express.Router();

/**
 * Analyze inventory against eBay pricing
 * POST /api/analysis/compare
 * Body: { set: 'Base Set', itemIds: ['item1', 'item2'] }
 */
analysisRouter.post('/compare', async (req, res) => {
  try {
    const { set, itemIds } = req.body;
    
    if (!itemIds || !Array.isArray(itemIds)) {
      return res.status(400).json({ error: 'itemIds array is required' });
    }

    // Load inventory
    let inventory;
    try {
      const data = await readFile(INVENTORY_FILE, 'utf-8');
      inventory = JSON.parse(data);
    } catch {
      inventory = { cards: [] };
    }

    // Filter inventory by set if provided
    const relevantCards = set 
      ? inventory.cards.filter(card => card.set.toLowerCase().includes(set.toLowerCase()))
      : inventory.cards;

    // Get pricing data from eBay listings
    const pricingData = [];
    for (const itemId of itemIds) {
      try {
        const listingDetails = await getListingDetails(itemId);
        const cardPrices = extractCardPrices(listingDetails);
        pricingData.push({
          itemId,
          title: listingDetails.title,
          cardPrices
        });
      } catch (error) {
        console.error(`Error fetching listing ${itemId}:`, error);
      }
    }

    // Analyze and match cards
    const analysis = analyzePricing(relevantCards, pricingData);

    res.json(analysis);
  } catch (error) {
    console.error('Error in analysis:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get pricing recommendations for inventory
 * GET /api/analysis/recommendations
 */
analysisRouter.get('/recommendations', async (req, res) => {
  try {
    const { set } = req.query;
    
    // Load inventory
    let inventory;
    try {
      const data = await readFile(INVENTORY_FILE, 'utf-8');
      inventory = JSON.parse(data);
    } catch {
      inventory = { cards: [] };
    }

    // Filter by set if provided
    const relevantCards = set 
      ? inventory.cards.filter(card => card.set.toLowerCase().includes(set.toLowerCase()))
      : inventory.cards;

    // This would ideally search eBay for current listings
    // For now, return structure with placeholder recommendations
    const recommendations = relevantCards.map(card => ({
      cardName: card.cardName,
      set: card.set,
      quantity: card.quantity,
      condition: card.condition,
      recommendedPrice: null, // Would be calculated from eBay data
      marketAverage: null,
      priceRange: null,
      note: 'Search eBay listings to get pricing recommendations'
    }));

    res.json({ recommendations });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Analyze pricing data
 */
function analyzePricing(inventoryCards, pricingData) {
  // Flatten all card prices from all listings
  const allPrices = {};
  
  pricingData.forEach(listing => {
    listing.cardPrices.forEach(cardPrice => {
      const cardName = cardPrice.cardName.toLowerCase();
      if (!allPrices[cardName]) {
        allPrices[cardName] = [];
      }
      allPrices[cardName].push({
        price: cardPrice.price,
        source: listing.title,
        itemId: listing.itemId
      });
    });
  });

  // Calculate statistics for each card
  const priceStats = {};
  Object.keys(allPrices).forEach(cardName => {
    const prices = allPrices[cardName].map(p => p.price);
    priceStats[cardName] = {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((a, b) => a + b, 0) / prices.length,
      median: prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)],
      count: prices.length
    };
  });

  // Match with inventory
  const matches = inventoryCards.map(card => {
    const cardName = card.cardName.toLowerCase();
    const stats = priceStats[cardName];
    
    return {
      card: card,
      pricing: stats || null,
      recommendation: stats ? {
        suggestedPrice: stats.median,
        priceRange: `$${stats.min.toFixed(2)} - $${stats.max.toFixed(2)}`,
        marketAverage: stats.avg,
        confidence: stats.count > 3 ? 'high' : stats.count > 1 ? 'medium' : 'low'
      } : null
    };
  });

  return {
    totalCardsAnalyzed: inventoryCards.length,
    cardsWithPricing: matches.filter(m => m.pricing).length,
    matches,
    summary: {
      totalListingsAnalyzed: pricingData.length,
      uniqueCardsFound: Object.keys(priceStats).length
    }
  };
}

