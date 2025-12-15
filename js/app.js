class InventoryPOSApp {
    constructor() {
        this.currentSection = 'pos';
        this.init();
    }

    async init() {
        console.log('App initializing...');
        
        try {
            // Initialize database first
            await db.init();
            console.log('Database ready');
            
            // Setup UI
            this.setupNavigation();
            this.updateCurrentTime();
            this.setupEventListeners();
            this.setupFAB();
            
            // Update time every minute
            setInterval(() => this.updateCurrentTime(), 60000);
            
            console.log('App initialized successfully');
            
            // Show initial notification
            this.showNotification('Welcome to PoultryPro! App is ready.', 'success');
            
        } catch (error) {
            console.error('App init error:', error);
            this.showNotification('Failed to initialize app. Please refresh the page.', 'error');
        }
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.switchSection(section);
            });
        });
    }

    switchSection(section) {
        console.log('Switching to section:', section);
        
        // Update active nav button
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`.nav-btn[data-section="${section}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Update content sections
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });
        
        const targetSection = document.getElementById(`${section}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        this.currentSection = section;
        
        // Load section data
        setTimeout(() => this.loadSectionData(section), 100);
    }

    loadSectionData(section) {
        console.log('Loading data for:', section);
        
        switch(section) {
            case 'batches':
                if (window.batchesManager) {
                    window.batchesManager.loadBatches();
                }
                break;
            case 'feed':
                if (window.feedManager) {
                    window.feedManager.loadFeed();
                }
                break;
            case 'pos':
                if (window.posSystem) {
                    window.posSystem.loadProducts();
                }
                break;
            case 'sales':
                if (window.salesManager) {
                    window.salesManager.loadSales();
                }
                break;
        }
    }

    updateCurrentTime() {
        const now = new Date();
        const timeElement = document.getElementById('current-time');
        
        if (timeElement) {
            const options = {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            };
            timeElement.textContent = now.toLocaleDateString("en-US", options);
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Navigation buttons are already set up in setupNavigation()
        
        // Modal open buttons
        this.setupModalButtons();
        
        // Form submissions
        this.setupFormSubmissions();
        
        // POS buttons
        this.setupPOSButtons();
        
        // Filter buttons
        this.setupFilterButtons();
        
        // Quick actions
        this.setupQuickActions();
        
        // Modal close buttons
        this.setupModalCloseButtons();
    }

    setupModalButtons() {
        // Add batch button
        const addBatchBtn = document.getElementById('add-batch-btn');
        if (addBatchBtn) {
            addBatchBtn.addEventListener('click', () => this.openBatchModal());
        }

        // Add feed button
        const addFeedBtn = document.getElementById('add-feed-btn');
        if (addFeedBtn) {
            addFeedBtn.addEventListener('click', () => this.openFeedModal());
        }

        // Add supplier button
        const addSupplierBtn = document.getElementById('add-supplier-btn');
        if (addSupplierBtn) {
            addSupplierBtn.addEventListener('click', () => this.openSupplierModal());
        }

        // Add product button
        const addProductBtn = document.getElementById('add-product-btn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => this.openProductModal());
        }

        // Add customer button
        const addCustomerBtn = document.getElementById('add-customer-btn');
        if (addCustomerBtn) {
            addCustomerBtn.addEventListener('click', () => this.openCustomerModal());
        }

        // Export buttons
        const exportSalesBtn = document.getElementById('export-sales-btn');
        if (exportSalesBtn) {
            exportSalesBtn.addEventListener('click', () => this.exportSales());
        }
    }

    setupFormSubmissions() {
        // Batch form
        const batchForm = document.getElementById('batch-form');
        if (batchForm) {
            batchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleBatchFormSubmit();
            });
        }

        // Feed form
        const feedForm = document.getElementById('feed-form');
        if (feedForm) {
            feedForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFeedFormSubmit();
            });
        }

        // Supplier form
        const supplierForm = document.getElementById('supplier-form');
        if (supplierForm) {
            supplierForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSupplierFormSubmit();
            });
        }

        // Product form
        const productForm = document.getElementById('product-form');
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleProductFormSubmit();
            });
        }

        // Customer form
        const customerForm = document.getElementById('customer-form');
        if (customerForm) {
            customerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCustomerFormSubmit();
            });
        }
    }

    setupPOSButtons() {
        // Category filter buttons
        document.querySelectorAll('.category-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.filterPOSProducts(category);
            });
        });

        // Checkout button (if exists)
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (window.posSystem) {
                    window.posSystem.openCheckoutModal();
                }
            });
        }

        // Clear cart button
        const clearCartBtn = document.getElementById('clear-cart');
        if (clearCartBtn && window.posSystem) {
            clearCartBtn.addEventListener('click', () => {
                window.posSystem.clearCart();
            });
        }
    }

    setupFilterButtons() {
        // Filter sales button
        const filterSalesBtn = document.getElementById('filter-sales');
        if (filterSalesBtn) {
            filterSalesBtn.addEventListener('click', () => {
                this.filterSales();
            });
        }

        // Clear filter button
        const clearFilterBtn = document.getElementById('clear-filter');
        if (clearFilterBtn) {
            clearFilterBtn.addEventListener('click', () => {
                this.clearFilter();
            });
        }
    }

    setupQuickActions() {
        // Quick sale button
        const quickSaleBtn = document.getElementById('quick-sale');
        if (quickSaleBtn) {
            quickSaleBtn.addEventListener('click', () => {
                this.switchSection('pos');
                this.closeAllModals();
            });
        }

        // Quick batch button
        const quickBatchBtn = document.getElementById('quick-batch');
        if (quickBatchBtn) {
            quickBatchBtn.addEventListener('click', () => {
                this.openBatchModal();
                this.closeAllModals();
            });
        }

        // Quick feed button
        const quickFeedBtn = document.getElementById('quick-feed');
        if (quickFeedBtn) {
            quickFeedBtn.addEventListener('click', () => {
                this.openFeedModal();
                this.closeAllModals();
            });
        }

        // Quick report button
        const quickReportBtn = document.getElementById('quick-report');
        if (quickReportBtn) {
            quickReportBtn.addEventListener('click', () => {
                this.generateTodayReport();
                this.closeAllModals();
            });
        }
    }

    setupModalCloseButtons() {
        // Close modal buttons
        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeAllModals();
            });
        });

        // Close modal on backdrop click
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAllModals();
                }
            });
        });
    }

    setupFAB() {
        const fabMain = document.getElementById('fab-main');
        const fabContainer = document.querySelector('.fab-container');
        
        if (fabMain && fabContainer) {
            fabMain.addEventListener('click', (e) => {
                e.stopPropagation();
                fabContainer.classList.toggle('open');
            });
            
            // Close FAB when clicking outside
            document.addEventListener('click', () => {
                fabContainer.classList.remove('open');
            });
        }
    }

    // ========== MODAL METHODS ==========
    
    openBatchModal(batch = null) {
        const modal = document.getElementById('batch-modal-overlay');
        const form = document.getElementById('batch-form');
        const title = document.getElementById('batch-modal-title');
        
        if (batch) {
            title.textContent = 'Edit Chicken Batch';
            document.getElementById('batch-id').value = batch.id;
            document.getElementById('batch-name').value = batch.name || '';
            document.getElementById('batch-breed').value = batch.breed || '';
            document.getElementById('batch-quantity').value = batch.quantity || '';
            document.getElementById('batch-age').value = batch.age || '';
            document.getElementById('batch-weight').value = batch.weight || '';
            document.getElementById('batch-source').value = batch.source || '';
            document.getElementById('batch-status').value = batch.status || 'Active';
            document.getElementById('batch-notes').value = batch.notes || '';
        } else {
            title.textContent = 'Add Chicken Batch';
            if (form) form.reset();
            document.getElementById('batch-id').value = '';
            document.getElementById('batch-status').value = 'Active';
            
            // Set default batch name
            const batchNameInput = document.getElementById('batch-name');
            if (batchNameInput) {
                const today = new Date();
                const batchNumber = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                batchNameInput.value = `BATCH-${today.getFullYear()}${(today.getMonth()+1).toString().padStart(2, '0')}${batchNumber}`;
            }
        }
        
        if (modal) modal.classList.add('active');
    }

    openFeedModal(feed = null) {
        const modal = document.getElementById('feed-modal-overlay');
        const form = document.getElementById('feed-form');
        const title = document.getElementById('feed-modal-title');
        
        if (feed) {
            title.textContent = 'Edit Feed Stock';
            document.getElementById('feed-id').value = feed.id;
            document.getElementById('feed-type').value = feed.type || '';
            document.getElementById('feed-quantity').value = feed.quantity || '';
            document.getElementById('feed-price').value = feed.price || '';
            document.getElementById('feed-supplier').value = feed.supplier || '';
            
            if (feed.expiryDate) {
                const expiryDate = new Date(feed.expiryDate);
                document.getElementById('feed-expiry').value = expiryDate.toISOString().split('T')[0];
            }
            
            document.getElementById('feed-lot').value = feed.lot || '';
        } else {
            title.textContent = 'Add Feed Stock';
            if (form) form.reset();
            document.getElementById('feed-id').value = '';
            
            // Set default expiry date to 3 months from now
            const expiryInput = document.getElementById('feed-expiry');
            if (expiryInput) {
                const futureDate = new Date();
                futureDate.setMonth(futureDate.getMonth() + 3);
                expiryInput.value = futureDate.toISOString().split('T')[0];
            }
        }
        
        if (modal) modal.classList.add('active');
    }

    openSupplierModal(supplier = null) {
        const modal = document.getElementById('supplier-modal-overlay');
        const form = document.getElementById('supplier-form');
        const title = document.getElementById('supplier-modal-title');
        
        if (supplier) {
            title.textContent = 'Edit Supplier';
            document.getElementById('supplier-id').value = supplier.id;
            document.getElementById('supplier-name').value = supplier.name || '';
            document.getElementById('supplier-type').value = supplier.type || '';
            document.getElementById('supplier-rating').value = supplier.rating || '5';
            document.getElementById('supplier-phone').value = supplier.phone || '';
            document.getElementById('supplier-email').value = supplier.email || '';
            document.getElementById('supplier-address').value = supplier.address || '';
            document.getElementById('supplier-notes').value = supplier.notes || '';
        } else {
            title.textContent = 'Add Supplier';
            if (form) form.reset();
            document.getElementById('supplier-id').value = '';
            document.getElementById('supplier-rating').value = '5';
        }
        
        if (modal) modal.classList.add('active');
    }

    openProductModal(product = null) {
        const modal = document.getElementById('product-modal-overlay');
        const form = document.getElementById('product-form');
        const title = document.getElementById('product-modal-title');
        
        if (product) {
            title.textContent = 'Edit Product';
            document.getElementById('product-id').value = product.id;
            document.getElementById('product-name').value = product.name || '';
            document.getElementById('product-category').value = product.category || '';
            document.getElementById('product-unit').value = product.unit || 'each';
            document.getElementById('product-price').value = product.price || '';
            document.getElementById('product-stock').value = product.stock || '';
            document.getElementById('product-description').value = product.description || '';
        } else {
            title.textContent = 'Add Product';
            if (form) form.reset();
            document.getElementById('product-id').value = '';
            document.getElementById('product-unit').value = 'each';
        }
        
        if (modal) modal.classList.add('active');
    }

    openCustomerModal(customer = null) {
        const modal = document.getElementById('customer-modal-overlay');
        const form = document.getElementById('customer-form');
        const title = document.getElementById('customer-modal-title');
        
        if (customer) {
            title.textContent = 'Edit Customer';
            document.getElementById('customer-id').value = customer.id;
            document.getElementById('customer-name').value = customer.name || '';
            document.getElementById('customer-phone').value = customer.phone || '';
            document.getElementById('customer-email').value = customer.email || '';
            document.getElementById('customer-address').value = customer.address || '';
        } else {
            title.textContent = 'Add Customer';
            if (form) form.reset();
            document.getElementById('customer-id').value = '';
        }
        
        if (modal) modal.classList.add('active');
    }

    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('active');
        });
        
        // Close FAB menu
        const fabContainer = document.querySelector('.fab-container');
        if (fabContainer) {
            fabContainer.classList.remove('open');
        }
    }

    // ========== FORM HANDLING METHODS ==========
    
    async handleBatchFormSubmit() {
        try {
            const batchId = document.getElementById('batch-id').value;
            const batchData = {
                name: document.getElementById('batch-name').value,
                breed: document.getElementById('batch-breed').value,
                quantity: parseInt(document.getElementById('batch-quantity').value) || 0,
                age: parseInt(document.getElementById('batch-age').value) || 0,
                weight: parseFloat(document.getElementById('batch-weight').value) || 0,
                source: document.getElementById('batch-source').value,
                status: document.getElementById('batch-status').value,
                notes: document.getElementById('batch-notes').value || '',
                updatedAt: new Date().toISOString()
            };

            if (batchId) {
                await db.updateBatch(parseInt(batchId), batchData);
                this.showNotification('Batch updated successfully!', 'success');
            } else {
                batchData.createdAt = new Date().toISOString();
                batchData.arrivalDate = new Date().toISOString();
                await db.addBatch(batchData);
                this.showNotification('Batch added successfully!', 'success');
            }
            
            this.closeAllModals();
            
            // Refresh batches if we're in batches section
            if (this.currentSection === 'batches' && window.batchesManager) {
                await window.batchesManager.loadBatches();
            }
            
        } catch (error) {
            console.error('Error saving batch:', error);
            this.showNotification('Error saving batch: ' + error.message, 'error');
        }
    }

    async handleFeedFormSubmit() {
        try {
            const feedId = document.getElementById('feed-id').value;
            const feedData = {
                type: document.getElementById('feed-type').value,
                quantity: parseFloat(document.getElementById('feed-quantity').value) || 0,
                price: parseFloat(document.getElementById('feed-price').value) || 0,
                supplier: document.getElementById('feed-supplier').value,
                lot: document.getElementById('feed-lot').value || '',
                updatedAt: new Date().toISOString()
            };

            const expiryDate = document.getElementById('feed-expiry').value;
            if (expiryDate) {
                feedData.expiryDate = new Date(expiryDate).toISOString();
            }

            if (feedId) {
                await db.updateFeed(parseInt(feedId), feedData);
                this.showNotification('Feed stock updated successfully!', 'success');
            } else {
                feedData.createdAt = new Date().toISOString();
                await db.addFeed(feedData);
                this.showNotification('Feed stock added successfully!', 'success');
            }
            
            this.closeAllModals();
            
            // Refresh feed if we're in feed section
            if (this.currentSection === 'feed' && window.feedManager) {
                await window.feedManager.loadFeed();
            }
            
        } catch (error) {
            console.error('Error saving feed:', error);
            this.showNotification('Error saving feed: ' + error.message, 'error');
        }
    }

    async handleSupplierFormSubmit() {
        try {
            const supplierId = document.getElementById('supplier-id').value;
            const supplierData = {
                name: document.getElementById('supplier-name').value,
                type: document.getElementById('supplier-type').value,
                rating: parseInt(document.getElementById('supplier-rating').value) || 5,
                phone: document.getElementById('supplier-phone').value,
                email: document.getElementById('supplier-email').value || '',
                address: document.getElementById('supplier-address').value || '',
                notes: document.getElementById('supplier-notes').value || '',
                updatedAt: new Date().toISOString()
            };

            if (supplierId) {
                await db.updateSupplier(parseInt(supplierId), supplierData);
                this.showNotification('Supplier updated successfully!', 'success');
            } else {
                supplierData.createdAt = new Date().toISOString();
                await db.addSupplier(supplierData);
                this.showNotification('Supplier added successfully!', 'success');
            }
            
            this.closeAllModals();
            
        } catch (error) {
            console.error('Error saving supplier:', error);
            this.showNotification('Error saving supplier: ' + error.message, 'error');
        }
    }

    async handleProductFormSubmit() {
        try {
            const productId = document.getElementById('product-id').value;
            const productData = {
                name: document.getElementById('product-name').value,
                category: document.getElementById('product-category').value,
                unit: document.getElementById('product-unit').value,
                price: parseFloat(document.getElementById('product-price').value) || 0,
                stock: parseInt(document.getElementById('product-stock').value) || 0,
                description: document.getElementById('product-description').value || '',
                updatedAt: new Date().toISOString()
            };

            if (productId) {
                await db.updateProduct(parseInt(productId), productData);
                this.showNotification('Product updated successfully!', 'success');
            } else {
                productData.createdAt = new Date().toISOString();
                await db.addProduct(productData);
                this.showNotification('Product added successfully!', 'success');
            }
            
            this.closeAllModals();
            
            // Refresh POS products
            if (window.posSystem) {
                await window.posSystem.loadProducts();
            }
            
        } catch (error) {
            console.error('Error saving product:', error);
            this.showNotification('Error saving product: ' + error.message, 'error');
        }
    }

    async handleCustomerFormSubmit() {
        try {
            const customerId = document.getElementById('customer-id').value;
            const customerData = {
                name: document.getElementById('customer-name').value,
                phone: document.getElementById('customer-phone').value || '',
                email: document.getElementById('customer-email').value || '',
                address: document.getElementById('customer-address').value || '',
                totalSpent: 0,
                updatedAt: new Date().toISOString()
            };

            if (customerId) {
                await db.updateCustomer(parseInt(customerId), customerData);
                this.showNotification('Customer updated successfully!', 'success');
            } else {
                customerData.createdAt = new Date().toISOString();
                await db.addCustomer(customerData);
                this.showNotification('Customer added successfully!', 'success');
            }
            
            this.closeAllModals();
            
        } catch (error) {
            console.error('Error saving customer:', error);
            this.showNotification('Error saving customer: ' + error.message, 'error');
        }
    }

    // ========== UTILITY METHODS ==========
    
    showNotification(message, type = 'info') {
        // Create a simple notification
        const alertDiv = document.createElement('div');
        alertDiv.className = `notification ${type}`;
        alertDiv.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add to body
        document.body.appendChild(alertDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
        
        // Also log to console
        console.log(`${type.toUpperCase()}: ${message}`);
    }

    filterSales() {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        
        if (!startDate || !endDate) {
            this.showNotification('Please select both start and end dates', 'warning');
            return;
        }
        
        this.showNotification('Filtering sales from ' + startDate + ' to ' + endDate, 'info');
    }

    clearFilter() {
        const startDate = document.getElementById('start-date');
        const endDate = document.getElementById('end-date');
        
        if (startDate) startDate.value = '';
        if (endDate) endDate.value = '';
        
        this.showNotification('Filter cleared', 'info');
    }

    generateTodayReport() {
        const today = new Date().toISOString().split('T')[0];
        const startDate = document.getElementById('start-date');
        const endDate = document.getElementById('end-date');
        
        if (startDate) startDate.value = today;
        if (endDate) endDate.value = today;
        
        this.filterSales();
    }

    filterPOSProducts(category) {
        // Update active category button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`.category-btn[data-category="${category}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        
        // Filter products in POS
        if (window.posSystem) {
            if (category !== 'all') {
                window.posSystem.filterProductsByCategory(category);
            } else {
                window.posSystem.renderProducts();
            }
        }
    }

    async exportSales() {
        try {
            const sales = await db.getSales();
            const dataStr = JSON.stringify(sales, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = `sales-export-${new Date().toISOString().split('T')[0]}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            this.showNotification('Sales data exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting sales:', error);
            this.showNotification('Error exporting sales: ' + error.message, 'error');
        }
    }

    showLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('active');
        }
    }

    hideLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('active');
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    
    // Create global app instance
    window.app = new InventoryPOSApp();
});