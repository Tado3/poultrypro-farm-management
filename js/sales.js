class SalesManager {
    constructor() {
        this.sales = [];
        this.init();
    }

    async init() {
        console.log('SalesManager initializing...');
        await this.loadSales();
        this.setupEventListeners();
    }

    async loadSales() {
        try {
            this.sales = await db.getSales();
            console.log('Sales loaded:', this.sales.length);
            this.updateStats();
            this.renderSales();
        } catch (error) {
            console.error('Error loading sales:', error);
            this.sales = [];
            this.updateStats();
        }
    }

    updateStats() {
        // Calculate today's sales
        const today = new Date().toISOString().split('T')[0];
        const todaySales = this.sales.filter(sale => 
            sale.date && sale.date.startsWith(today)
        ).reduce((sum, sale) => sum + (sale.total || 0), 0);
        
        // Calculate average order value
        const avgOrder = this.sales.length > 0 
            ? this.sales.reduce((sum, sale) => sum + (sale.total || 0), 0) / this.sales.length
            : 0;
        
        // Find top product
        let topProduct = '-';
        if (this.sales.length > 0) {
            const productCounts = {};
            this.sales.forEach(sale => {
                if (sale.items) {
                    sale.items.forEach(item => {
                        productCounts[item.name] = (productCounts[item.name] || 0) + item.quantity;
                    });
                }
            });
            
            const entries = Object.entries(productCounts);
            if (entries.length > 0) {
                entries.sort((a, b) => b[1] - a[1]);
                topProduct = entries[0][0];
            }
        }
        
        // Update UI elements
        const todaySalesEl = document.getElementById('today-sales');
        const totalOrdersEl = document.getElementById('total-orders');
        const avgOrderEl = document.getElementById('avg-order');
        const topProductEl = document.getElementById('top-product');
        
        if (todaySalesEl) todaySalesEl.textContent = `$${todaySales.toFixed(2)}`;
        if (totalOrdersEl) totalOrdersEl.textContent = this.sales.length;
        if (avgOrderEl) avgOrderEl.textContent = `$${avgOrder.toFixed(2)}`;
        if (topProductEl) topProductEl.textContent = topProduct;
        
        // Update header stats
        const todaySalesHeader = document.getElementById('today-sales-header');
        if (todaySalesHeader) todaySalesHeader.textContent = `$${todaySales.toFixed(2)}`;
    }

    renderSales() {
        const tbody = document.getElementById('sales-table-body');
        if (!tbody) return;
        
        if (this.sales.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <i class="fas fa-chart-bar"></i>
                        <h3>No sales records found</h3>
                        <p>Make your first sale to see records here</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Sort by date (newest first)
        const sortedSales = [...this.sales].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        tbody.innerHTML = sortedSales.slice(0, 10).map(sale => {
            const date = new Date(sale.date);
            const itemsCount = sale.items ? sale.items.length : 0;
            const customer = sale.customer || 'Walk-in';
            
            return `
                <tr>
                    <td><strong>#${sale.id.toString().padStart(4, '0')}</strong></td>
                    <td>${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                    <td>${customer}</td>
                    <td>${itemsCount} items</td>
                    <td>$${(sale.total || 0).toFixed(2)}</td>
                    <td>${sale.paymentMethod || 'Cash'}</td>
                    <td>
                        <span class="batch-status active">
                            Completed
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-secondary btn-sm view-sale-btn" data-id="${sale.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Add event listeners to view buttons
        tbody.querySelectorAll('.view-sale-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                const sale = await db.getSale(id);
                if (sale) {
                    this.viewSaleDetails(sale);
                }
            });
        });
    }

    viewSaleDetails(sale) {
        const date = new Date(sale.date);
        let details = `
            <h3>Sale #${sale.id} Details</h3>
            <p><strong>Date:</strong> ${date.toLocaleString()}</p>
            <p><strong>Total:</strong> $${sale.total.toFixed(2)}</p>
            <p><strong>Payment Method:</strong> ${sale.paymentMethod}</p>
        `;
        
        if (sale.items && sale.items.length > 0) {
            details += '<h4>Items:</h4><ul>';
            sale.items.forEach(item => {
                details += `<li>${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>`;
            });
            details += '</ul>';
        }
        
        alert(details);
    }

    setupEventListeners() {
        // Search functionality
        const salesSearch = document.getElementById('sales-search');
        if (salesSearch) {
            salesSearch.addEventListener('input', (e) => {
                this.searchSales(e.target.value);
            });
        }
        
        // Refresh button
        const refreshBtn = document.getElementById('refresh-sales');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadSales();
            });
        }
    }

    searchSales(query) {
        const filtered = this.sales.filter(sale =>
            sale.id.toString().includes(query) ||
            (sale.customer && sale.customer.toLowerCase().includes(query.toLowerCase())) ||
            (sale.items && sale.items.some(item => 
                item.name.toLowerCase().includes(query.toLowerCase())
            ))
        );
        
        const tbody = document.getElementById('sales-table-body');
        if (!tbody) return;
        
        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <i class="fas fa-search"></i>
                        <h3>No sales found</h3>
                        <p>Try a different search term</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Sort by date (newest first)
        const sortedSales = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        tbody.innerHTML = sortedSales.slice(0, 10).map(sale => {
            const date = new Date(sale.date);
            const itemsCount = sale.items ? sale.items.length : 0;
            const customer = sale.customer || 'Walk-in';
            
            return `
                <tr>
                    <td><strong>#${sale.id.toString().padStart(4, '0')}</strong></td>
                    <td>${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                    <td>${customer}</td>
                    <td>${itemsCount} items</td>
                    <td>$${(sale.total || 0).toFixed(2)}</td>
                    <td>${sale.paymentMethod || 'Cash'}</td>
                    <td>
                        <span class="batch-status active">
                            Completed
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-secondary btn-sm view-sale-btn" data-id="${sale.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
}

// Initialize sales manager
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing SalesManager...');
    window.salesManager = new SalesManager();
});