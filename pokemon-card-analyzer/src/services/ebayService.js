import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const EBAY_CLIENT_ID = process.env.EBAY_CLIENT_ID;
const EBAY_CLIENT_SECRET = process.env.EBAY_CLIENT_SECRET;
const EBAY_ENVIRONMENT = process.env.EBAY_ENVIRONMENT || 'sandbox';

const BASE_URL = EBAY_ENVIRONMENT === 'production' 
  ? 'https://api.ebay.com'
  : 'https://api.sandbox.ebay.com';

// Cache for OAuth token
let accessToken = null;
let tokenExpiry = null;

/**
 * Get OAuth 2.0 access token from eBay
 * @returns {Promise<string>} Access token
 */
async function getAccessToken() {
  // If we have a valid token, return it
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  // If credentials are not configured, return null (will use mock data)
  if (!EBAY_CLIENT_ID || !EBAY_CLIENT_SECRET) {
    return null;
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/identity/v1/oauth2/token`,
      'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${EBAY_CLIENT_ID}:${EBAY_CLIENT_SECRET}`).toString('base64')}`
        }
      }
    );

    accessToken = response.data.access_token;
    // Token expires in response.data.expires_in seconds, refresh 5 minutes early
    tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

    return accessToken;
  } catch (error) {
    console.error('Error getting eBay access token:', error.message);
    throw error;
  }
}

/**
 * Search eBay listings
 * @param {Object} params - Search parameters
 * @returns {Promise<Object>} Search results
 */
export async function searchListings(params) {
  const { query, categoryId = '183454', limit = 200, sort = 'price' } = params;
  
  const token = await getAccessToken();
  
  // If no token (mock mode), return mock data
  if (!token) {
    return getMockSearchResults(query, categoryId, limit);
  }

  try {
    const response = await axios.get(
      `${BASE_URL}/buy/browse/v1/item_summary/search`,
      {
        params: {
          q: query,
          category_ids: categoryId,
          filter: 'buyingOptions:{FIXED_PRICE}',
          sort: sort,
          limit: limit
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
        }
      }
    );

    return {
      total: response.data.total,
      items: response.data.itemSummaries || [],
      href: response.data.href
    };
  } catch (error) {
    console.error('Error searching eBay listings:', error.message);
    // Fall back to mock data on error
    return getMockSearchResults(query, categoryId, limit);
  }
}

/**
 * Get detailed listing information including variations
 * @param {string} itemId - eBay item ID
 * @returns {Promise<Object>} Detailed listing data
 */
export async function getListingDetails(itemId) {
  const token = await getAccessToken();
  
  // If no token (mock mode), return mock data
  if (!token) {
    return getMockListingDetails(itemId);
  }

  try {
    const response = await axios.get(
      `${BASE_URL}/buy/browse/v1/item/${itemId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error getting listing details:', error.message);
    // Fall back to mock data on error
    return getMockListingDetails(itemId);
  }
}

/**
 * Extract card prices from listing variations
 * @param {Object} listingDetails - Detailed listing data
 * @returns {Array} Array of card price objects
 */
export function extractCardPrices(listingDetails) {
  if (!listingDetails.itemVariations) {
    return [];
  }

  return listingDetails.itemVariations.map(variation => ({
    cardName: variation.specifications?.[0]?.name || 'Unknown',
    price: parseFloat(variation.price?.value || 0),
    currency: variation.price?.currency || 'USD',
    availableQuantity: variation.availableQuantity || 0,
    condition: listingDetails.condition || 'Unknown'
  }));
}

// ==================== MOCK DATA ====================
// These functions provide mock data when API is not configured

function getMockSearchResults(query, categoryId, limit) {
  console.log('🔶 Using MOCK data for search:', query);
  
  const mockListings = [
    {
      itemId: 'mock-001',
      title: 'Pokemon Base Set PICK YOUR CARD - Charizard, Blastoise, Venusaur + More',
      price: { value: '99.99', currency: 'USD' },
      itemWebUrl: 'https://www.ebay.com/itm/mock-001',
      thumbnailImages: [{ imageUrl: 'https://via.placeholder.com/150' }],
      condition: 'Near Mint',
      seller: { username: 'mock_seller_1', feedbackPercentage: '99.5' },
      itemHref: '/api/ebay/item/mock-001'
    },
    {
      itemId: 'mock-002',
      title: 'Pokemon Base Set Singles - PICK YOUR CARD - NM Condition',
      price: { value: '149.99', currency: 'USD' },
      itemWebUrl: 'https://www.ebay.com/itm/mock-002',
      thumbnailImages: [{ imageUrl: 'https://via.placeholder.com/150' }],
      condition: 'Near Mint',
      seller: { username: 'mock_seller_2', feedbackPercentage: '98.8' },
      itemHref: '/api/ebay/item/mock-002'
    },
    {
      itemId: 'mock-003',
      title: 'Pokemon Jungle Set PICK YOUR CARD - Complete Set Available',
      price: { value: '79.99', currency: 'USD' },
      itemWebUrl: 'https://www.ebay.com/itm/mock-003',
      thumbnailImages: [{ imageUrl: 'https://via.placeholder.com/150' }],
      condition: 'Lightly Played',
      seller: { username: 'mock_seller_3', feedbackPercentage: '100' },
      itemHref: '/api/ebay/item/mock-003'
    },
    {
      itemId: 'mock-004',
      title: 'Pokemon Fossil Set - Pick Your Card - Near Mint Singles',
      price: { value: '89.99', currency: 'USD' },
      itemWebUrl: 'https://www.ebay.com/itm/mock-004',
      thumbnailImages: [{ imageUrl: 'https://via.placeholder.com/150' }],
      condition: 'Near Mint',
      seller: { username: 'mock_seller_4', feedbackPercentage: '97.5' },
      itemHref: '/api/ebay/item/mock-004'
    }
  ];

  return {
    total: mockListings.length,
    items: mockListings.slice(0, limit),
    href: '/api/mock/search',
    mockData: true
  };
}

function getMockListingDetails(itemId) {
  console.log('🔶 Using MOCK data for listing details:', itemId);
  
  const mockVariations = {
    'mock-001': [
      { specifications: [{ name: 'Charizard' }], price: { value: '299.99', currency: 'USD' }, availableQuantity: 3 },
      { specifications: [{ name: 'Blastoise' }], price: { value: '89.99', currency: 'USD' }, availableQuantity: 5 },
      { specifications: [{ name: 'Venusaur' }], price: { value: '79.99', currency: 'USD' }, availableQuantity: 4 },
      { specifications: [{ name: 'Alakazam' }], price: { value: '39.99', currency: 'USD' }, availableQuantity: 8 },
      { specifications: [{ name: 'Pikachu' }], price: { value: '24.99', currency: 'USD' }, availableQuantity: 12 }
    ],
    'mock-002': [
      { specifications: [{ name: 'Charizard' }], price: { value: '289.99', currency: 'USD' }, availableQuantity: 2 },
      { specifications: [{ name: 'Blastoise' }], price: { value: '85.99', currency: 'USD' }, availableQuantity: 6 },
      { specifications: [{ name: 'Venusaur' }], price: { value: '75.99', currency: 'USD' }, availableQuantity: 5 },
      { specifications: [{ name: 'Raichu' }], price: { value: '29.99', currency: 'USD' }, availableQuantity: 10 }
    ],
    'mock-003': [
      { specifications: [{ name: 'Pidgeot' }], price: { value: '19.99', currency: 'USD' }, availableQuantity: 15 },
      { specifications: [{ name: 'Snorlax' }], price: { value: '49.99', currency: 'USD' }, availableQuantity: 7 },
      { specifications: [{ name: 'Clefable' }], price: { value: '14.99', currency: 'USD' }, availableQuantity: 20 }
    ],
    'mock-004': [
      { specifications: [{ name: 'Aerodactyl' }], price: { value: '34.99', currency: 'USD' }, availableQuantity: 9 },
      { specifications: [{ name: 'Gengar' }], price: { value: '44.99', currency: 'USD' }, availableQuantity: 6 },
      { specifications: [{ name: 'Kabutops' }], price: { value: '24.99', currency: 'USD' }, availableQuantity: 12 }
    ]
  };

  const variations = mockVariations[itemId] || mockVariations['mock-001'];

  return {
    itemId: itemId,
    title: `Mock Pokemon Card Listing ${itemId}`,
    price: { value: '99.99', currency: 'USD' },
    condition: 'Near Mint',
    itemVariations: variations,
    itemWebUrl: `https://www.ebay.com/itm/${itemId}`,
    image: { imageUrl: 'https://via.placeholder.com/400' },
    mockData: true
  };
}

