class FeedManager {
    constructor() {
        this.feed = [];
        this.init();
    }

    async init() {
        console.log('FeedManager initializing...');
        await this.loadFeed();
        this.setupEventListeners();
    }

    async loadFeed() {
        try {
            this.feed = await db.getFeed();
            console.log('Feed items loaded:', this.feed.length);
            this.renderFeed();
            this.updateStats();
        } catch (error) {
            console.error('Error loading feed:', error);
            this.feed = [];
            this.renderFeed();
        }
    }

    renderFeed() {
        const tbody = document.getElementById('feed-table-body');
        if (!tbody) return;
        
        if (this.feed.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i class="fas fa-wheat-awn"></i>
                        <h3>No feed inventory found</h3>
                        <p>Add your first feed stock to get started</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = this.feed.map(feedItem => {
            const status = db.calculateFeedStatus(feedItem);
            const expiryDate = feedItem.expiryDate ? new Date(feedItem.expiryDate).toLocaleDateString() : 'N/A';
            
            return `
                <tr>
                    <td><strong>${feedItem.type || 'Unknown'}</strong></td>
                    <td>${(feedItem.quantity || 0).toLocaleString()} kg</td>
                    <td>$${(feedItem.price || 0).toFixed(2)}/kg</td>
                    <td>${expiryDate}</td>
                    <td>
                        <span class="feed-status ${status}">
                            ${status.replace('-', ' ').toUpperCase()}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-danger btn-sm delete-feed-btn" data-id="${feedItem.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Add event listeners to delete buttons
        tbody.querySelectorAll('.delete-feed-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                if (confirm('Are you sure you want to delete this feed item?')) {
                    try {
                        await db.deleteFeed(id);
                        await this.loadFeed();
                        if (window.app) {
                            window.app.showNotification('Feed item deleted successfully!', 'success');
                        }
                    } catch (error) {
                        console.error('Error deleting feed:', error);
                        if (window.app) {
                            window.app.showNotification('Error deleting feed', 'error');
                        }
                    }
                }
            });
        });
    }

    updateStats() {
        const totalFeed = this.feed.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const feedTypes = new Set(this.feed.map(item => item.type)).size;
        const lowStockItems = this.feed.filter(item => {
            const status = db.calculateFeedStatus(item);
            return status === 'low-stock' || status === 'expiring-soon' || status === 'expired';
        }).length;
        
        // Update UI elements
        const totalFeedEl = document.getElementById('total-feed');
        const feedTypesEl = document.getElementById('feed-types');
        const lowStockEl = document.getElementById('low-stock');
        
        if (totalFeedEl) totalFeedEl.textContent = `${totalFeed.toLocaleString()}kg`;
        if (feedTypesEl) feedTypesEl.textContent = feedTypes;
        if (lowStockEl) lowStockEl.textContent = lowStockItems;
        
        // Update header stats
        const lowStockHeader = document.getElementById('low-stock-header');
        if (lowStockHeader) lowStockHeader.textContent = `${lowStockItems} Items`;
    }

    setupEventListeners() {
        // Search functionality
        const feedSearch = document.getElementById('feed-search');
        if (feedSearch) {
            feedSearch.addEventListener('input', (e) => {
                this.searchFeed(e.target.value);
            });
        }
        
        // Refresh button
        const refreshBtn = document.getElementById('refresh-feed');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadFeed();
            });
        }
    }

    searchFeed(query) {
        const filtered = this.feed.filter(feedItem =>
            (feedItem.type && feedItem.type.toLowerCase().includes(query.toLowerCase())) ||
            (feedItem.lot && feedItem.lot.toLowerCase().includes(query.toLowerCase()))
        );
        
        const tbody = document.getElementById('feed-table-body');
        if (!tbody) return;
        
        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i class="fas fa-search"></i>
                        <h3>No feed items found</h3>
                        <p>Try a different search term</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = filtered.map(feedItem => {
            const status = db.calculateFeedStatus(feedItem);
            const expiryDate = feedItem.expiryDate ? new Date(feedItem.expiryDate).toLocaleDateString() : 'N/A';
            
            return `
                <tr>
                    <td><strong>${feedItem.type || 'Unknown'}</strong></td>
                    <td>${(feedItem.quantity || 0).toLocaleString()} kg</td>
                    <td>$${(feedItem.price || 0).toFixed(2)}/kg</td>
                    <td>${expiryDate}</td>
                    <td>
                        <span class="feed-status ${status}">
                            ${status.replace('-', ' ').toUpperCase()}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-danger btn-sm delete-feed-btn" data-id="${feedItem.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
}

// Initialize feed manager
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing FeedManager...');
    window.feedManager = new FeedManager();
});