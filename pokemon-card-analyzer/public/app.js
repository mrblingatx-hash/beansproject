// API Base URL
const API_BASE = '/api';

// State
let currentInventory = [];
let currentSearchResults = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeModal();
    loadInventory();
    checkApiStatus();
    setupEventListeners();
});

// Tab Navigation
function initializeTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;

            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update active content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${targetTab}Tab`) {
                    content.classList.add('active');
                }
            });
        });
    });
}

// Modal Management
function initializeModal() {
    const modal = document.getElementById('cardModal');
    const addCardBtn = document.getElementById('addCardBtn');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const cardForm = document.getElementById('cardForm');

    addCardBtn?.addEventListener('click', () => openModal());
    closeModal?.addEventListener('click', () => closeModalFunc());
    cancelBtn?.addEventListener('click', () => closeModalFunc());

    cardForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleAddCard();
    });

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalFunc();
        }
    });
}

function openModal(card = null) {
    const modal = document.getElementById('cardModal');
    const form = document.getElementById('cardForm');
    
    if (card) {
        // Edit mode
        document.getElementById('cardName').value = card.cardName;
        document.getElementById('cardSet').value = card.set;
        document.getElementById('cardQuantity').value = card.quantity;
        document.getElementById('cardCondition').value = card.condition;
        document.getElementById('cardNotes').value = card.notes || '';
        form.dataset.editId = card.id;
    } else {
        // Add mode
        form.reset();
        delete form.dataset.editId;
    }
    
    modal.classList.add('active');
}

function closeModalFunc() {
    const modal = document.getElementById('cardModal');
    modal.classList.remove('active');
    document.getElementById('cardForm').reset();
}

// Event Listeners
function setupEventListeners() {
    // Search
    document.getElementById('searchBtn')?.addEventListener('click', handleSearch);
    
    // Analysis
    document.getElementById('runAnalysisBtn')?.addEventListener('click', handleAnalysis);
    
    // Filters
    document.getElementById('filterSearch')?.addEventListener('input', filterInventory);
    document.getElementById('filterSet')?.addEventListener('change', filterInventory);
}

// Inventory Management
async function loadInventory() {
    try {
        const response = await fetch(`${API_BASE}/inventory`);
        const data = await response.json();
        currentInventory = data.cards || [];
        renderInventory();
        updateInventoryStats();
        updateSetFilter();
    } catch (error) {
        console.error('Error loading inventory:', error);
        showError('Failed to load inventory');
    }
}

async function handleAddCard() {
    const form = document.getElementById('cardForm');
    const formData = {
        cardName: document.getElementById('cardName').value,
        set: document.getElementById('cardSet').value,
        quantity: parseInt(document.getElementById('cardQuantity').value),
        condition: document.getElementById('cardCondition').value,
        notes: document.getElementById('cardNotes').value
    };

    try {
        const editId = form.dataset.editId;
        let response;

        if (editId) {
            // Update existing card
            response = await fetch(`${API_BASE}/inventory/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        } else {
            // Add new card
            response = await fetch(`${API_BASE}/inventory`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        }

        if (response.ok) {
            closeModalFunc();
            loadInventory();
        } else {
            throw new Error('Failed to save card');
        }
    } catch (error) {
        console.error('Error saving card:', error);
        showError('Failed to save card');
    }
}

async function deleteCard(id) {
    if (!confirm('Are you sure you want to delete this card?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/inventory/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadInventory();
        } else {
            throw new Error('Failed to delete card');
        }
    } catch (error) {
        console.error('Error deleting card:', error);
        showError('Failed to delete card');
    }
}

function renderInventory(filteredCards = null) {
    const container = document.getElementById('inventoryList');
    const cards = filteredCards || currentInventory;

    if (cards.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No cards in inventory yet. Add your first card to get started!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = cards.map(card => `
        <div class="inventory-item">
            <div class="inventory-item-header">
                <div>
                    <div class="inventory-item-title">${escapeHtml(card.cardName)}</div>
                    <div class="inventory-item-set">${escapeHtml(card.set)}</div>
                </div>
                <div class="inventory-item-actions">
                    <button class="btn btn-secondary" onclick="editCard('${card.id}')" style="padding: 0.5rem 1rem; font-size: 0.9rem;">Edit</button>
                    <button class="btn btn-danger" onclick="deleteCard('${card.id}')" style="padding: 0.5rem 1rem; font-size: 0.9rem;">Delete</button>
                </div>
            </div>
            <div class="inventory-item-body">
                <div class="inventory-item-info">
                    <div class="info-label">Quantity</div>
                    <div class="info-value">${card.quantity}</div>
                </div>
                <div class="inventory-item-info">
                    <div class="info-label">Condition</div>
                    <div class="info-value">${card.condition}</div>
                </div>
                ${card.notes ? `
                <div class="inventory-item-info">
                    <div class="info-label">Notes</div>
                    <div class="info-value">${escapeHtml(card.notes)}</div>
                </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function editCard(id) {
    const card = currentInventory.find(c => c.id === id);
    if (card) {
        openModal(card);
    }
}

function filterInventory() {
    const searchTerm = document.getElementById('filterSearch').value.toLowerCase();
    const setFilter = document.getElementById('filterSet').value.toLowerCase();

    const filtered = currentInventory.filter(card => {
        const matchesSearch = !searchTerm || 
            card.cardName.toLowerCase().includes(searchTerm) ||
            card.set.toLowerCase().includes(searchTerm);
        const matchesSet = !setFilter || card.set.toLowerCase().includes(setFilter);
        return matchesSearch && matchesSet;
    });

    renderInventory(filtered);
}

function updateInventoryStats() {
    const totalCards = currentInventory.reduce((sum, card) => sum + card.quantity, 0);
    const uniqueCards = currentInventory.length;
    const sets = new Set(currentInventory.map(card => card.set)).size;

    document.getElementById('totalCards').textContent = totalCards;
    document.getElementById('uniqueCards').textContent = uniqueCards;
    document.getElementById('totalSets').textContent = sets;
}

function updateSetFilter() {
    const select = document.getElementById('filterSet');
    const sets = [...new Set(currentInventory.map(card => card.set))].sort();

    // Keep "All Sets" option, then add unique sets
    const currentValue = select.value;
    select.innerHTML = '<option value="">All Sets</option>';
    
    sets.forEach(set => {
        const option = document.createElement('option');
        option.value = set;
        option.textContent = set;
        select.appendChild(option);
    });

    // Restore previous selection if it still exists
    if (currentValue && sets.includes(currentValue)) {
        select.value = currentValue;
    }
}

// eBay Search
async function handleSearch() {
    const query = document.getElementById('searchQuery').value;
    const categoryId = document.getElementById('searchCategory').value;
    const limit = document.getElementById('searchLimit').value;

    if (!query.trim()) {
        showError('Please enter a search query');
        return;
    }

    try {
        showLoading('searchResults', 'Searching eBay listings...');
        
        const params = new URLSearchParams({
            query,
            categoryId,
            limit
        });

        const response = await fetch(`${API_BASE}/ebay/search?${params}`);
        const data = await response.json();
        
        currentSearchResults = data.items || [];
        renderSearchResults(data);
    } catch (error) {
        console.error('Error searching:', error);
        showError('Failed to search eBay listings');
        document.getElementById('searchResults').innerHTML = `
            <div class="empty-state">
                <p>Error searching eBay. Please try again.</p>
            </div>
        `;
    }
}

function renderSearchResults(data) {
    const container = document.getElementById('searchResults');

    if (!data.items || data.items.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No listings found. Try a different search query.</p>
                ${data.mockData ? `
                <div class="mock-data-notice">
                    <strong>Note:</strong> Currently showing mock data. Configure your eBay API credentials to access real listings.
                </div>
                ` : ''}
            </div>
        `;
        return;
    }

    const mockNotice = data.mockData ? `
        <div class="mock-data-notice" style="margin-bottom: 1.5rem;">
            <strong>🔶 Mock Data:</strong> These are sample listings. Configure your eBay API credentials in .env to access real listings.
        </div>
    ` : '';

    container.innerHTML = mockNotice + data.items.map(item => `
        <div class="listing-item">
            <img src="${item.thumbnailImages?.[0]?.imageUrl || 'https://via.placeholder.com/120'}" 
                 alt="${escapeHtml(item.title)}" 
                 class="listing-image"
                 onerror="this.src='https://via.placeholder.com/120'">
            <div class="listing-content">
                <div class="listing-title">
                    <a href="${item.itemWebUrl}" target="_blank">${escapeHtml(item.title)}</a>
                </div>
                <div class="listing-info">
                    <div class="listing-price">
                        $${parseFloat(item.price?.value || 0).toFixed(2)}
                    </div>
                    <div class="listing-details">
                        <div>Condition: ${item.condition || 'N/A'}</div>
                        <div>Seller: ${item.seller?.username || 'N/A'} (${item.seller?.feedbackPercentage || 'N/A'}% feedback)</div>
                    </div>
                </div>
            </div>
            <div class="listing-actions">
                <button class="btn btn-primary" onclick="viewListingDetails('${item.itemId}')" style="padding: 0.75rem 1rem; font-size: 0.9rem;">
                    View Details
                </button>
            </div>
        </div>
    `).join('');
}

async function viewListingDetails(itemId) {
    try {
        showLoading('searchResults', 'Loading listing details...');
        
        const response = await fetch(`${API_BASE}/ebay/item/${itemId}/prices`);
        const data = await response.json();
        
        renderListingDetails(data);
    } catch (error) {
        console.error('Error loading listing details:', error);
        showError('Failed to load listing details');
    }
}

function renderListingDetails(data) {
    const container = document.getElementById('searchResults');
    
    const mockNotice = data.mockData ? `
        <div class="mock-data-notice" style="margin-bottom: 1.5rem;">
            <strong>🔶 Mock Data:</strong> These are sample card prices. Real API data will show actual variation pricing.
        </div>
    ` : '';

    if (!data.cardPrices || data.cardPrices.length === 0) {
        container.innerHTML = mockNotice + `
            <div class="empty-state">
                <p>No card price variations found for this listing.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = mockNotice + `
        <div class="analysis-card" style="margin-bottom: 1.5rem;">
            <div class="analysis-card-header">
                <h3>${escapeHtml(data.title)}</h3>
            </div>
            <div class="analysis-card-body">
                ${data.cardPrices.map(card => `
                    <div class="recommendation">
                        <div class="recommendation-label">Card Name</div>
                        <div style="font-weight: 600; margin: 0.5rem 0;">${escapeHtml(card.cardName)}</div>
                        <div class="recommendation-label">Price</div>
                        <div class="recommendation-price">$${card.price.toFixed(2)}</div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">
                            Available: ${card.availableQuantity} | Condition: ${card.condition}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        <button class="btn btn-secondary" onclick="handleSearch()">Back to Results</button>
    `;
}

// Analysis
async function handleAnalysis() {
    if (currentInventory.length === 0) {
        showError('Please add cards to your inventory first');
        return;
    }

    if (currentSearchResults.length === 0) {
        showError('Please search for eBay listings first');
        return;
    }

    try {
        showLoading('analysisResults', 'Analyzing pricing data...');
        
        const itemIds = currentSearchResults.map(item => item.itemId);
        const sets = [...new Set(currentInventory.map(card => card.set))];
        const set = sets[0]; // Use first set for now

        const response = await fetch(`${API_BASE}/analysis/compare`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ set, itemIds })
        });

        const data = await response.json();
        renderAnalysis(data);
    } catch (error) {
        console.error('Error running analysis:', error);
        showError('Failed to run analysis');
        document.getElementById('analysisResults').innerHTML = `
            <div class="empty-state">
                <p>Error running analysis. Please try again.</p>
            </div>
        `;
    }
}

function renderAnalysis(data) {
    const container = document.getElementById('analysisResults');

    if (!data.matches || data.matches.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No matching cards found between your inventory and eBay listings.</p>
            </div>
        `;
        return;
    }

    const cardsWithPricing = data.matches.filter(m => m.pricing);
    
    container.innerHTML = `
        <div class="analysis-card" style="margin-bottom: 2rem;">
            <div class="analysis-card-header">
                <h3>Analysis Summary</h3>
            </div>
            <div class="analysis-card-body">
                <div>
                    <div class="info-label">Cards Analyzed</div>
                    <div class="info-value" style="font-size: 2rem; color: var(--accent-blue);">${data.totalCardsAnalyzed}</div>
                </div>
                <div>
                    <div class="info-label">Cards with Pricing</div>
                    <div class="info-value" style="font-size: 2rem; color: var(--accent-green);">${data.cardsWithPricing}</div>
                </div>
                <div>
                    <div class="info-label">Listings Analyzed</div>
                    <div class="info-value" style="font-size: 2rem; color: var(--accent-yellow);">${data.summary.totalListingsAnalyzed}</div>
                </div>
            </div>
        </div>

        <h3 style="margin-bottom: 1rem; color: var(--text-primary);">Card Pricing Recommendations</h3>

        ${data.matches.map(match => {
            const card = match.card;
            const pricing = match.pricing;
            const recommendation = match.recommendation;

            if (!pricing) {
                return `
                    <div class="analysis-card">
                        <div class="analysis-card-header">
                            <div class="analysis-card-title">${escapeHtml(card.cardName)} - ${escapeHtml(card.set)}</div>
                        </div>
                        <div style="color: var(--text-secondary);">
                            No pricing data found for this card in the analyzed listings.
                        </div>
                    </div>
                `;
            }

            return `
                <div class="analysis-card">
                    <div class="analysis-card-header">
                        <div class="analysis-card-title">${escapeHtml(card.cardName)} - ${escapeHtml(card.set)}</div>
                        <div style="font-size: 0.9rem; color: var(--text-secondary);">
                            Your Quantity: ${card.quantity} | Condition: ${card.condition}
                        </div>
                    </div>
                    <div class="analysis-card-body">
                        <div class="recommendation">
                            <div class="recommendation-label">Recommended Price</div>
                            <div class="recommendation-price">$${recommendation.suggestedPrice.toFixed(2)}</div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">
                                Confidence: <span style="color: ${recommendation.confidence === 'high' ? 'var(--accent-green)' : recommendation.confidence === 'medium' ? 'var(--accent-yellow)' : 'var(--accent-red)'}">${recommendation.confidence}</span>
                            </div>
                        </div>
                        <div class="recommendation">
                            <div class="recommendation-label">Market Average</div>
                            <div style="font-size: 1.2rem; font-weight: 600; color: var(--text-primary); margin: 0.5rem 0;">
                                $${pricing.avg.toFixed(2)}
                            </div>
                        </div>
                        <div class="recommendation">
                            <div class="recommendation-label">Price Range</div>
                            <div style="font-size: 1rem; color: var(--text-primary); margin: 0.5rem 0;">
                                ${recommendation.priceRange}
                            </div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary);">
                                Min: $${pricing.min.toFixed(2)} | Max: $${pricing.max.toFixed(2)}
                            </div>
                        </div>
                        <div class="recommendation">
                            <div class="recommendation-label">Data Points</div>
                            <div style="font-size: 1rem; color: var(--text-primary); margin: 0.5rem 0;">
                                ${pricing.count} listings analyzed
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('')}
    `;
}

// API Status Check
async function checkApiStatus() {
    try {
        const response = await fetch(`${API_BASE}/health`);
        const data = await response.json();
        
        const statusEl = document.getElementById('apiStatus');
        if (statusEl) {
            const indicator = statusEl.querySelector('.status-indicator');
            const text = statusEl.querySelector('span:last-child');
            
            if (data.apiConfigured) {
                indicator.classList.add('active');
                indicator.classList.remove('mock');
                text.textContent = `API Configured - ${data.environment} environment`;
                statusEl.style.background = 'rgba(16, 185, 129, 0.1)';
                statusEl.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                statusEl.style.color = 'var(--accent-green)';
            } else {
                indicator.classList.remove('active');
                indicator.classList.add('mock');
                text.textContent = 'Using Mock Data - Configure API credentials for real data';
            }
        }
    } catch (error) {
        console.error('Error checking API status:', error);
    }
}

// Utility Functions
function showLoading(containerId, message = 'Loading...') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="empty-state">
                <p>${escapeHtml(message)}</p>
            </div>
        `;
    }
}

function showError(message) {
    // Could be enhanced with a toast notification
    alert(message);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions global for inline onclick handlers
window.deleteCard = deleteCard;
window.editCard = editCard;
window.viewListingDetails = viewListingDetails;

