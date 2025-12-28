import express from 'express';
import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INVENTORY_FILE = join(__dirname, '../../data/inventory.json');

export const inventoryRouter = express.Router();

/**
 * Get all inventory items
 * GET /api/inventory
 */
inventoryRouter.get('/', async (req, res) => {
  try {
    const inventory = await loadInventory();
    res.json(inventory);
  } catch (error) {
    console.error('Error loading inventory:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Add card to inventory
 * POST /api/inventory
 * Body: { cardName, set, quantity, condition, notes }
 */
inventoryRouter.post('/', async (req, res) => {
  try {
    const { cardName, set, quantity, condition, notes } = req.body;
    
    if (!cardName || !set || !quantity) {
      return res.status(400).json({ error: 'cardName, set, and quantity are required' });
    }

    const inventory = await loadInventory();
    const newCard = {
      id: Date.now().toString(),
      cardName,
      set,
      quantity: parseInt(quantity),
      condition: condition || 'Near Mint',
      notes: notes || '',
      addedAt: new Date().toISOString()
    };

    inventory.cards.push(newCard);
    await saveInventory(inventory);

    res.json(newCard);
  } catch (error) {
    console.error('Error adding card:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update card in inventory
 * PUT /api/inventory/:id
 */
inventoryRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const inventory = await loadInventory();
    const cardIndex = inventory.cards.findIndex(card => card.id === id);

    if (cardIndex === -1) {
      return res.status(404).json({ error: 'Card not found' });
    }

    inventory.cards[cardIndex] = {
      ...inventory.cards[cardIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await saveInventory(inventory);
    res.json(inventory.cards[cardIndex]);
  } catch (error) {
    console.error('Error updating card:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete card from inventory
 * DELETE /api/inventory/:id
 */
inventoryRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const inventory = await loadInventory();
    const cardIndex = inventory.cards.findIndex(card => card.id === id);

    if (cardIndex === -1) {
      return res.status(404).json({ error: 'Card not found' });
    }

    inventory.cards.splice(cardIndex, 1);
    await saveInventory(inventory);

    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Import inventory from CSV/JSON
 * POST /api/inventory/import
 */
inventoryRouter.post('/import', async (req, res) => {
  try {
    const { cards } = req.body;
    
    if (!Array.isArray(cards)) {
      return res.status(400).json({ error: 'cards array is required' });
    }

    const inventory = await loadInventory();
    
    cards.forEach(card => {
      const newCard = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        cardName: card.cardName || card.name || '',
        set: card.set || '',
        quantity: parseInt(card.quantity) || 1,
        condition: card.condition || 'Near Mint',
        notes: card.notes || '',
        addedAt: new Date().toISOString()
      };
      inventory.cards.push(newCard);
    });

    await saveInventory(inventory);
    res.json({ message: `Imported ${cards.length} cards`, cards: inventory.cards });
  } catch (error) {
    console.error('Error importing inventory:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
async function loadInventory() {
  try {
    const data = await readFile(INVENTORY_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty inventory
    if (error.code === 'ENOENT') {
      return { cards: [] };
    }
    throw error;
  }
}

async function saveInventory(inventory) {
  const { mkdir } = await import('fs/promises');
  const { dirname } = await import('path');
  
  // Ensure directory exists
  await mkdir(dirname(INVENTORY_FILE), { recursive: true });
  await writeFile(INVENTORY_FILE, JSON.stringify(inventory, null, 2));
}

