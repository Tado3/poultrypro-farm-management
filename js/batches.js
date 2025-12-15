class BatchesManager {
    constructor() {
        this.batches = [];
        this.init();
    }

    async init() {
        console.log('BatchesManager initializing...');
        await this.loadBatches();
        this.setupEventListeners();
    }

    async loadBatches() {
        try {
            this.batches = await db.getBatches();
            console.log('Batches loaded:', this.batches.length);
            this.renderBatches();
            this.updateStats();
        } catch (error) {
            console.error('Error loading batches:', error);
            this.batches = [];
            this.renderBatches();
        }
    }

    renderBatches() {
        const tbody = document.getElementById('batches-table-body');
        if (!tbody) return;
        
        if (this.batches.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <i class="fas fa-kiwi-bird"></i>
                        <h3>No chicken batches found</h3>
                        <p>Add your first batch to get started</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = this.batches.map(batch => `
            <tr>
                <td><strong>${batch.name || 'Unnamed Batch'}</strong></td>
                <td>${batch.breed || 'Unknown'}</td>
                <td>${batch.age || 0} days</td>
                <td>${(batch.quantity || 0).toLocaleString()}</td>
                <td>${(batch.weight || 0).toFixed(1)} kg</td>
                <td>Healthy</td>
                <td>
                    <span class="batch-status ${(batch.status || 'active').toLowerCase()}">
                        ${batch.status || 'Active'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-secondary btn-sm edit-batch-btn" data-id="${batch.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm delete-batch-btn" data-id="${batch.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        // Add event listeners to action buttons
        tbody.querySelectorAll('.edit-batch-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                const batch = await db.getBatch(id);
                if (batch && window.app) {
                    window.app.openBatchModal(batch);
                }
            });
        });
        
        tbody.querySelectorAll('.delete-batch-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                if (confirm('Are you sure you want to delete this batch?')) {
                    try {
                        await db.deleteBatch(id);
                        await this.loadBatches();
                        if (window.app) {
                            window.app.showNotification('Batch deleted successfully!', 'success');
                        }
                    } catch (error) {
                        console.error('Error deleting batch:', error);
                        if (window.app) {
                            window.app.showNotification('Error deleting batch', 'error');
                        }
                    }
                }
            });
        });
    }

    updateStats() {
        const totalChickens = this.batches.reduce((sum, batch) => sum + (batch.quantity || 0), 0);
        const activeBatches = this.batches.filter(batch => batch.status === 'Active').length;
        const totalWeight = this.batches.reduce((sum, batch) => sum + (batch.weight || 0), 0);
        const avgWeight = this.batches.length > 0 ? (totalWeight / this.batches.length).toFixed(1) : 0;
        
        // Update UI elements
        const totalChickensEl = document.getElementById('total-chickens');
        const activeBatchesEl = document.getElementById('active-batches');
        const avgWeightEl = document.getElementById('avg-weight');
        
        if (totalChickensEl) totalChickensEl.textContent = totalChickens.toLocaleString();
        if (activeBatchesEl) activeBatchesEl.textContent = activeBatches;
        if (avgWeightEl) avgWeightEl.textContent = `${avgWeight}kg`;
        
        // Update header stats
        const activeBirdsHeader = document.getElementById('active-birds-header');
        if (activeBirdsHeader) activeBirdsHeader.textContent = totalChickens.toLocaleString();
    }

    setupEventListeners() {
        // Search functionality
        const batchesSearch = document.getElementById('batches-search');
        if (batchesSearch) {
            batchesSearch.addEventListener('input', (e) => {
                this.searchBatches(e.target.value);
            });
        }
        
        // Refresh button
        const refreshBtn = document.getElementById('refresh-batches');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadBatches();
            });
        }
    }

    searchBatches(query) {
        const filtered = this.batches.filter(batch =>
            (batch.name && batch.name.toLowerCase().includes(query.toLowerCase())) ||
            (batch.breed && batch.breed.toLowerCase().includes(query.toLowerCase())) ||
            (batch.status && batch.status.toLowerCase().includes(query.toLowerCase()))
        );
        
        const tbody = document.getElementById('batches-table-body');
        if (!tbody) return;
        
        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <i class="fas fa-search"></i>
                        <h3>No batches found</h3>
                        <p>Try a different search term</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = filtered.map(batch => `
            <tr>
                <td><strong>${batch.name || 'Unnamed Batch'}</strong></td>
                <td>${batch.breed || 'Unknown'}</td>
                <td>${batch.age || 0} days</td>
                <td>${(batch.quantity || 0).toLocaleString()}</td>
                <td>${(batch.weight || 0).toFixed(1)} kg</td>
                <td>Healthy</td>
                <td>
                    <span class="batch-status ${(batch.status || 'active').toLowerCase()}">
                        ${batch.status || 'Active'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-secondary btn-sm edit-batch-btn" data-id="${batch.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm delete-batch-btn" data-id="${batch.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

// Initialize batches manager
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing BatchesManager...');
    window.batchesManager = new BatchesManager();
});