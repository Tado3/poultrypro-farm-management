class Database {
    constructor() {
        this.dbName = 'poultry-farm-db';
        this.version = 2;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = (event) => {
                console.error('IndexedDB error:', event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('Database initialized successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                console.log('Creating database schema...');

                // Products (for sale items)
                if (!db.objectStoreNames.contains('products')) {
                    const productStore = db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
                    productStore.createIndex('category', 'category', { unique: false });
                    productStore.createIndex('unit', 'unit', { unique: false });
                }

                // Chicken Batches
                if (!db.objectStoreNames.contains('batches')) {
                    const batchStore = db.createObjectStore('batches', { keyPath: 'id', autoIncrement: true });
                    batchStore.createIndex('breed', 'breed', { unique: false });
                    batchStore.createIndex('status', 'status', { unique: false });
                    batchStore.createIndex('source', 'source', { unique: false });
                }

                // Feed Inventory
                if (!db.objectStoreNames.contains('feed')) {
                    const feedStore = db.createObjectStore('feed', { keyPath: 'id', autoIncrement: true });
                    feedStore.createIndex('type', 'type', { unique: false });
                    feedStore.createIndex('supplier', 'supplier', { unique: false });
                    feedStore.createIndex('status', 'status', { unique: false });
                }

                // Suppliers
                if (!db.objectStoreNames.contains('suppliers')) {
                    const supplierStore = db.createObjectStore('suppliers', { keyPath: 'id', autoIncrement: true });
                    supplierStore.createIndex('type', 'type', { unique: false });
                    supplierStore.createIndex('rating', 'rating', { unique: false });
                }

                // Sales History
                if (!db.objectStoreNames.contains('sales')) {
                    const saleStore = db.createObjectStore('sales', { keyPath: 'id', autoIncrement: true });
                    saleStore.createIndex('date', 'date', { unique: false });
                    saleStore.createIndex('total', 'total', { unique: false });
                    saleStore.createIndex('paymentMethod', 'paymentMethod', { unique: false });
                }

                // Customers
                if (!db.objectStoreNames.contains('customers')) {
                    const customerStore = db.createObjectStore('customers', { keyPath: 'id', autoIncrement: true });
                    customerStore.createIndex('email', 'email', { unique: false });
                    customerStore.createIndex('phone', 'phone', { unique: false });
                }

                // Cart (temporary sales cart)
                if (!db.objectStoreNames.contains('cart')) {
                    db.createObjectStore('cart', { keyPath: 'productId' });
                }

                console.log('Database schema created');
            };
        });
    }

    transaction(storeName, mode, operation) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            try {
                const transaction = this.db.transaction([storeName], mode);
                const store = transaction.objectStore(storeName);
                const request = operation(store);

                request.onsuccess = (event) => resolve(event.target.result);
                request.onerror = (event) => reject(event.target.error);
            } catch (error) {
                reject(error);
            }
        });
    }

    // ========== PRODUCT METHODS ==========
    async addProduct(product) {
        return this.transaction('products', 'readwrite', (store) => {
            return store.add(product);
        });
    }

    async getProducts() {
        return this.transaction('products', 'readonly', (store) => {
            return store.getAll();
        });
    }

    async getProduct(id) {
        return this.transaction('products', 'readonly', (store) => {
            return store.get(id);
        });
    }

    async updateProduct(id, updates) {
        return this.transaction('products', 'readwrite', async (store) => {
            const product = await store.get(id);
            if (product) {
                Object.assign(product, updates);
                return store.put(product);
            }
            throw new Error('Product not found');
        });
    }

    async deleteProduct(id) {
        return this.transaction('products', 'readwrite', (store) => {
            return store.delete(id);
        });
    }

    // ========== BATCH METHODS ==========
    async addBatch(batch) {
        return this.transaction('batches', 'readwrite', (store) => {
            return store.add(batch);
        });
    }

    async getBatches() {
        return this.transaction('batches', 'readonly', (store) => {
            return store.getAll();
        });
    }

    async getBatch(id) {
        return this.transaction('batches', 'readonly', (store) => {
            return store.get(id);
        });
    }

    async updateBatch(id, updates) {
        return this.transaction('batches', 'readwrite', async (store) => {
            const batch = await store.get(id);
            if (batch) {
                Object.assign(batch, updates);
                return store.put(batch);
            }
            throw new Error('Batch not found');
        });
    }

    async deleteBatch(id) {
        return this.transaction('batches', 'readwrite', (store) => {
            return store.delete(id);
        });
    }

    // ========== FEED METHODS ==========
    async addFeed(feed) {
        return this.transaction('feed', 'readwrite', (store) => {
            return store.add(feed);
        });
    }

    async getFeed() {
        return this.transaction('feed', 'readonly', (store) => {
            return store.getAll();
        });
    }

    async getFeedItem(id) {
        return this.transaction('feed', 'readonly', (store) => {
            return store.get(id);
        });
    }

    async updateFeed(id, updates) {
        return this.transaction('feed', 'readwrite', async (store) => {
            const feed = await store.get(id);
            if (feed) {
                Object.assign(feed, updates);
                return store.put(feed);
            }
            throw new Error('Feed item not found');
        });
    }

    async deleteFeed(id) {
        return this.transaction('feed', 'readwrite', (store) => {
            return store.delete(id);
        });
    }

    // ========== SUPPLIER METHODS ==========
    async addSupplier(supplier) {
        return this.transaction('suppliers', 'readwrite', (store) => {
            return store.add(supplier);
        });
    }

    async getSuppliers() {
        return this.transaction('suppliers', 'readonly', (store) => {
            return store.getAll();
        });
    }

    async getSupplier(id) {
        return this.transaction('suppliers', 'readonly', (store) => {
            return store.get(id);
        });
    }

    async updateSupplier(id, updates) {
        return this.transaction('suppliers', 'readwrite', async (store) => {
            const supplier = await store.get(id);
            if (supplier) {
                Object.assign(supplier, updates);
                return store.put(supplier);
            }
            throw new Error('Supplier not found');
        });
    }

    async deleteSupplier(id) {
        return this.transaction('suppliers', 'readwrite', (store) => {
            return store.delete(id);
        });
    }

    // ========== SALES METHODS ==========
    async addSale(sale) {
        return this.transaction('sales', 'readwrite', (store) => {
            return store.add(sale);
        });
    }

    async getSales() {
        return this.transaction('sales', 'readonly', (store) => {
            return store.getAll();
        });
    }

    async getSale(id) {
        return this.transaction('sales', 'readonly', (store) => {
            return store.get(id);
        });
    }

    // ========== CUSTOMER METHODS ==========
    async addCustomer(customer) {
        return this.transaction('customers', 'readwrite', (store) => {
            return store.add(customer);
        });
    }

    async getCustomers() {
        return this.transaction('customers', 'readonly', (store) => {
            return store.getAll();
        });
    }

    async getCustomer(id) {
        return this.transaction('customers', 'readonly', (store) => {
            return store.get(id);
        });
    }

    async updateCustomer(id, updates) {
        return this.transaction('customers', 'readwrite', async (store) => {
            const customer = await store.get(id);
            if (customer) {
                Object.assign(customer, updates);
                return store.put(customer);
            }
            throw new Error('Customer not found');
        });
    }

    async deleteCustomer(id) {
        return this.transaction('customers', 'readwrite', (store) => {
            return store.delete(id);
        });
    }

    // ========== CART METHODS ==========
    async addToCart(item) {
        return this.transaction('cart', 'readwrite', (store) => {
            return store.put(item);
        });
    }

    async getCart() {
        return this.transaction('cart', 'readonly', (store) => {
            return store.getAll();
        });
    }

    async updateCartItem(productId, quantity) {
        return this.transaction('cart', 'readwrite', async (store) => {
            const item = await store.get(productId);
            if (item) {
                item.quantity = quantity;
                return store.put(item);
            }
            return null;
        });
    }

    async removeFromCart(productId) {
        return this.transaction('cart', 'readwrite', (store) => {
            return store.delete(productId);
        });
    }

    async clearCart() {
        return this.transaction('cart', 'readwrite', (store) => {
            return store.clear();
        });
    }

    // ========== UTILITY METHODS ==========
    calculateFeedStatus(feedItem) {
        if (!feedItem) return 'unknown';
        
        const now = new Date();
        const expiryDate = feedItem.expiryDate ? new Date(feedItem.expiryDate) : null;
        
        if (expiryDate && expiryDate < now) {
            return 'expired';
        }
        
        if (expiryDate) {
            const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
            if (daysUntilExpiry <= 7) {
                return 'expiring-soon';
            }
        }
        
        if ((feedItem.quantity || 0) < 50) {
            return 'low-stock';
        }
        
        return 'in-stock';
    }
}

// Create global database instance
window.db = new Database();