import express from 'express';
import { searchListings, getListingDetails, extractCardPrices } from '../services/ebayService.js';

export const ebayRouter = express.Router();

/**
 * Search eBay listings
 * GET /api/ebay/search?query=pokemon+base+set&categoryId=183454&limit=200
 */
ebayRouter.get('/search', async (req, res) => {
  try {
    const { query, categoryId, limit, sort } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const results = await searchListings({
      query,
      categoryId: categoryId || '183454',
      limit: parseInt(limit) || 200,
      sort: sort || 'price'
    });

    res.json(results);
  } catch (error) {
    console.error('Error in search route:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get detailed listing information
 * GET /api/ebay/item/:itemId
 */
ebayRouter.get('/item/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const listingDetails = await getListingDetails(itemId);
    res.json(listingDetails);
  } catch (error) {
    console.error('Error in item details route:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get card prices from a listing's variations
 * GET /api/ebay/item/:itemId/prices
 */
ebayRouter.get('/item/:itemId/prices', async (req, res) => {
  try {
    const { itemId } = req.params;
    const listingDetails = await getListingDetails(itemId);
    const cardPrices = extractCardPrices(listingDetails);
    
    res.json({
      itemId,
      title: listingDetails.title,
      cardPrices,
      mockData: listingDetails.mockData || false
    });
  } catch (error) {
    console.error('Error extracting card prices:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Batch get prices from multiple listings
 * POST /api/ebay/prices/batch
 * Body: { itemIds: ['item1', 'item2', ...] }
 */
ebayRouter.post('/prices/batch', async (req, res) => {
  try {
    const { itemIds } = req.body;
    
    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({ error: 'itemIds array is required' });
    }

    const results = await Promise.all(
      itemIds.map(async (itemId) => {
        const listingDetails = await getListingDetails(itemId);
        const cardPrices = extractCardPrices(listingDetails);
        return {
          itemId,
          title: listingDetails.title,
          cardPrices,
          mockData: listingDetails.mockData || false
        };
      })
    );

    res.json({ results });
  } catch (error) {
    console.error('Error in batch prices route:', error);
    res.status(500).json({ error: error.message });
  }
});

