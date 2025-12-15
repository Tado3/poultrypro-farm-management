class POSSystem {
    constructor() {
        this.cart = [];
        this.products = [];
        this.taxRate = 0.10;
        this.currentPaymentMethod = 'cash';
        this.init();
    }

    async init() {
        console.log('POSSystem initializing...');
        
        try {
            await this.loadProducts();
            await this.loadCart();
            this.renderProducts();
            this.updateCartDisplay();
            this.setupEventListeners();
            
            console.log('POSSystem initialized successfully');
        } catch (error) {
            console.error('POSSystem init error:', error);
        }
    }

    async loadProducts() {
        try {
            this.products = await db.getProducts();
            console.log('POS products loaded:', this.products.length);
            
            // Add sample products if empty
            if (this.products.length === 0) {
                await this.addSampleProducts();
                this.products = await db.getProducts();
            }
        } catch (error) {
            console.error('Error loading products:', error);
            this.products = [];
        }
    }

    async addSampleProducts() {
        const sampleProducts = [
            { name: "Whole Chicken", category: "processed", unit: "each", price: 12.99, stock: 50, description: "Fresh whole chicken", createdAt: new Date().toISOString() },
            { name: "Chicken Breast", category: "processed", unit: "kg", price: 8.99, stock: 30, description: "Boneless chicken breast", createdAt: new Date().toISOString() },
            { name: "Chicken Thighs", category: "processed", unit: "kg", price: 6.99, stock: 40, description: "Chicken thighs with bone", createdAt: new Date().toISOString() },
            { name: "Chicken Wings", category: "processed", unit: "kg", price: 5.99, stock: 35, description: "Fresh chicken wings", createdAt: new Date().toISOString() },
            { name: "Live Broiler", category: "live", unit: "each", price: 15.99, stock: 100, description: "Live broiler chicken", createdAt: new Date().toISOString() },
            { name: "Live Layer", category: "live", unit: "each", price: 18.99, stock: 80, description: "Live layer chicken for eggs", createdAt: new Date().toISOString() },
            { name: "Fresh Eggs", category: "eggs", unit: "dozen", price: 3.99, stock: 200, description: "Farm fresh eggs", createdAt: new Date().toISOString() },
            { name: "Jumbo Eggs", category: "eggs", unit: "dozen", price: 4.99, stock: 150, description: "Jumbo size fresh eggs", createdAt: new Date().toISOString() },
            { name: "Organic Eggs", category: "eggs", unit: "dozen", price: 6.99, stock: 100, description: "Organic free-range eggs", createdAt: new Date().toISOString() },
            { name: "Starter Feed", category: "feed", unit: "bag", price: 25.99, stock: 50, description: "25kg bag - chicks 0-3 weeks", createdAt: new Date().toISOString() },
            { name: "Grower Feed", category: "feed", unit: "bag", price: 23.99, stock: 40, description: "25kg bag - chickens 3-6 weeks", createdAt: new Date().toISOString() },
            { name: "Layer Feed", category: "feed", unit: "bag", price: 27.99, stock: 30, description: "25kg bag - egg production", createdAt: new Date().toISOString() }
        ];

        for (const product of sampleProducts) {
            try {
                await db.addProduct(product);
            } catch (error) {
                console.error('Error adding sample product:', error);
            }
        }
        
        console.log('Sample products added');
    }

    async loadCart() {
        try {
            const cartItems = await db.getCart();
            this.cart = await Promise.all(cartItems.map(async item => {
                const product = await db.getProduct(item.productId);
                return {
                    ...item,
                    product: product || { name: 'Unknown Product', price: 0, unit: 'each' }
                };
            }));
        } catch (error) {
            console.error('Error loading cart:', error);
            this.cart = [];
        }
    }

    renderProducts() {
        const productGrid = document.getElementById('product-grid');
        if (!productGrid) return;
        
        if (this.products.length === 0) {
            productGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h3>No products available</h3>
                    <p>Add products in the inventory section</p>
                </div>
            `;
            return;
        }
        
        productGrid.innerHTML = this.products.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image-placeholder">
                    <i class="fas fa-box"></i>
                </div>
                <div class="product-name">${product.name}</div>
                <div class="product-price">$${product.price.toFixed(2)}/${product.unit}</div>
                <div class="${product.stock < 10 ? 'product-stock low' : 'product-stock'}">
                    Stock: ${product.stock}
                </div>
            </div>
        `).join('');
        
        // Add click event to product cards
        productGrid.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const productId = parseInt(e.currentTarget.dataset.productId);
                this.addToCart(productId, 1);
            });
        });
    }

    filterProductsByCategory(category) {
        const productGrid = document.getElementById('product-grid');
        if (!productGrid) return;
        
        const filtered = this.products.filter(product => 
            product.category === category
        );
        
        if (filtered.length === 0) {
            productGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No ${category} products found</h3>
                    <p>Try a different category or add new products</p>
                </div>
            `;
            return;
        }
        
        productGrid.innerHTML = filtered.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image-placeholder">
                    <i class="fas fa-box"></i>
                </div>
                <div class="product-name">${product.name}</div>
                <div class="product-price">$${product.price.toFixed(2)}/${product.unit}</div>
                <div class="${product.stock < 10 ? 'product-stock low' : 'product-stock'}">
                    Stock: ${product.stock}
                </div>
            </div>
        `).join('');
        
        // Re-add event listeners
        productGrid.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const productId = parseInt(e.currentTarget.dataset.productId);
                this.addToCart(productId, 1);
            });
        });
    }

    filterProducts(query) {
        const productGrid = document.getElementById('product-grid');
        if (!productGrid) return;
        
        const filtered = this.products.filter(product =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(query.toLowerCase()))
        );
        
        if (filtered.length === 0) {
            productGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No products found</h3>
                    <p>Try a different search term</p>
                </div>
            `;
            return;
        }
        
        productGrid.innerHTML = filtered.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image-placeholder">
                    <i class="fas fa-box"></i>
                </div>
                <div class="product-name">${product.name}</div>
                <div class="product-price">$${product.price.toFixed(2)}/${product.unit}</div>
                <div class="${product.stock < 10 ? 'product-stock low' : 'product-stock'}">
                    Stock: ${product.stock}
                </div>
            </div>
        `).join('');
        
        // Re-add event listeners
        productGrid.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const productId = parseInt(e.currentTarget.dataset.productId);
                this.addToCart(productId, 1);
            });
        });
    }

    async addToCart(productId, quantity = 1) {
        try {
            const product = this.products.find(p => p.id === productId);
            
            if (!product) {
                if (window.app) {
                    window.app.showNotification('Product not found!', 'error');
                }
                return;
            }

            if (product.stock < quantity) {
                if (window.app) {
                    window.app.showNotification(`Insufficient stock! Only ${product.stock} items available.`, 'warning');
                }
                return;
            }

            const existingItem = this.cart.find(item => item.productId === productId);
            
            if (existingItem) {
                const newQuantity = existingItem.quantity + quantity;
                
                if (product.stock < newQuantity) {
                    if (window.app) {
                        window.app.showNotification(`Insufficient stock! Only ${product.stock} items available.`, 'warning');
                    }
                    return;
                }
                
                existingItem.quantity = newQuantity;
                await db.updateCartItem(productId, newQuantity);
            } else {
                const cartItem = {
                    productId,
                    quantity,
                    price: product.price,
                    name: product.name,
                    unit: product.unit
                };
                
                this.cart.push({
                    ...cartItem,
                    product
                });
                
                await db.addToCart(cartItem);
            }

            this.updateCartDisplay();
            
            if (window.app) {
                window.app.showNotification(`${product.name} added to cart`, 'success');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            if (window.app) {
                window.app.showNotification('Error adding to cart', 'error');
            }
        }
    }

    async updateCartItem(productId, quantity) {
        try {
            if (quantity <= 0) {
                await this.removeFromCart(productId);
                return;
            }

            const product = this.products.find(p => p.id === productId);
            
            if (!product) return;
            
            if (product.stock < quantity) {
                if (window.app) {
                    window.app.showNotification(`Insufficient stock! Only ${product.stock} items available.`, 'warning');
                }
                return;
            }

            const item = this.cart.find(item => item.productId === productId);
            
            if (item) {
                item.quantity = quantity;
                await db.updateCartItem(productId, quantity);
                this.updateCartDisplay();
            }
        } catch (error) {
            console.error('Error updating cart item:', error);
        }
    }

    async removeFromCart(productId) {
        try {
            this.cart = this.cart.filter(item => item.productId !== productId);
            await db.removeFromCart(productId);
            this.updateCartDisplay();
        } catch (error) {
            console.error('Error removing from cart:', error);
        }
    }

    async clearCart() {
        try {
            if (this.cart.length === 0) return;
            
            if (!confirm('Clear all items from cart?')) return;
            
            this.cart = [];
            await db.clearCart();
            this.updateCartDisplay();
            
            if (window.app) {
                window.app.showNotification('Cart cleared', 'info');
            }
        } catch (error) {
            console.error('Error clearing cart:', error);
        }
    }

    calculateTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * this.taxRate;
        const total = subtotal + tax;
        
        return { subtotal, tax, total };
    }

    updateCartDisplay() {
        const cartItemsContainer = document.getElementById('cart-items');
        const totals = this.calculateTotals();
        
        // Update totals display
        const subtotalEl = document.getElementById('subtotal');
        const taxEl = document.getElementById('tax');
        const totalEl = document.getElementById('total');
        const cartCountEl = document.getElementById('cart-count');
        
        if (subtotalEl) subtotalEl.textContent = `$${totals.subtotal.toFixed(2)}`;
        if (taxEl) taxEl.textContent = `$${totals.tax.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `$${totals.total.toFixed(2)}`;
        if (cartCountEl) cartCountEl.textContent = this.cart.length;
        
        // Update cart items
        if (this.cart.length === 0) {
            if (cartItemsContainer) {
                cartItemsContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-shopping-cart"></i>
                        <p>No items added</p>
                        <small>Add products from the catalog</small>
                    </div>
                `;
            }
            return;
        }
        
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = this.cart.map(item => `
                <div class="cart-item" data-product-id="${item.productId}">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)}/${item.unit}</div>
                    </div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn decrease" data-product-id="${item.productId}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn increase" data-product-id="${item.productId}">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="remove-item" data-product-id="${item.productId}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="cart-item-total">
                        $${(item.price * item.quantity).toFixed(2)}
                    </div>
                </div>
            `).join('');
            
            // Add event listeners to cart buttons
            cartItemsContainer.querySelectorAll('.decrease').forEach(button => {
                button.addEventListener('click', (e) => {
                    const productId = parseInt(e.currentTarget.dataset.productId);
                    const item = this.cart.find(item => item.productId === productId);
                    if (item) {
                        this.updateCartItem(productId, item.quantity - 1);
                    }
                });
            });
            
            cartItemsContainer.querySelectorAll('.increase').forEach(button => {
                button.addEventListener('click', (e) => {
                    const productId = parseInt(e.currentTarget.dataset.productId);
                    const item = this.cart.find(item => item.productId === productId);
                    if (item) {
                        this.updateCartItem(productId, item.quantity + 1);
                    }
                });
            });
            
            cartItemsContainer.querySelectorAll('.remove-item').forEach(button => {
                button.addEventListener('click', (e) => {
                    const productId = parseInt(e.currentTarget.dataset.productId);
                    this.removeFromCart(productId);
                });
            });
        }
    }

    setupEventListeners() {
        console.log('Setting up POS event listeners...');
        
        // Product search
        const productSearch = document.getElementById('product-search');
        if (productSearch) {
            productSearch.addEventListener('input', (e) => {
                this.filterProducts(e.target.value);
            });
        }
        
        // Checkout modal payment methods
        document.addEventListener('click', (e) => {
            if (e.target.closest('.payment-method')) {
                const method = e.target.closest('.payment-method');
                document.querySelectorAll('.payment-method').forEach(m => {
                    m.classList.remove('active');
                });
                method.classList.add('active');
                this.currentPaymentMethod = method.dataset.method;
            }
        });
        
        // Amount received calculation
        const amountReceived = document.getElementById('amount-received');
        if (amountReceived) {
            amountReceived.addEventListener('input', () => {
                this.calculateChange();
            });
        }
        
        // Complete sale button
        const completeSaleBtn = document.getElementById('complete-sale');
        if (completeSaleBtn) {
            completeSaleBtn.addEventListener('click', async () => {
                await this.processSale();
            });
        }
    }

    openCheckoutModal() {
        const modal = document.getElementById('checkout-modal-overlay');
        if (!modal) return;
        
        if (this.cart.length === 0) {
            if (window.app) {
                window.app.showNotification('Cart is empty!', 'warning');
            }
            return;
        }
        
        // Update checkout items
        const checkoutItems = document.getElementById('checkout-items');
        if (checkoutItems) {
            checkoutItems.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name} x${item.quantity}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)}/${item.unit}</div>
                    </div>
                    <div class="cart-item-total">
                        $${(item.price * item.quantity).toFixed(2)}
                    </div>
                </div>
            `).join('');
        }
        
        // Update totals
        const totals = this.calculateTotals();
        const checkoutSubtotal = document.getElementById('checkout-subtotal');
        const checkoutTax = document.getElementById('checkout-tax');
        const checkoutTotal = document.getElementById('checkout-total');
        
        if (checkoutSubtotal) checkoutSubtotal.textContent = `$${totals.subtotal.toFixed(2)}`;
        if (checkoutTax) checkoutTax.textContent = `$${totals.tax.toFixed(2)}`;
        if (checkoutTotal) checkoutTotal.textContent = `$${totals.total.toFixed(2)}`;
        
        // Reset amount received
        const amountReceived = document.getElementById('amount-received');
        if (amountReceived) {
            amountReceived.value = '';
            amountReceived.focus();
        }
        
        this.calculateChange();
        modal.classList.add('active');
    }

    calculateChange() {
        const amountReceived = document.getElementById('amount-received');
        const changeDue = document.getElementById('change-due');
        
        if (!amountReceived || !changeDue) return;
        
        const amount = parseFloat(amountReceived.value) || 0;
        const totals = this.calculateTotals();
        const change = amount - totals.total;
        
        if (change >= 0) {
            changeDue.textContent = `Change: $${change.toFixed(2)}`;
            changeDue.style.color = 'var(--success-color)';
        } else {
            changeDue.textContent = `Short: $${Math.abs(change).toFixed(2)}`;
            changeDue.style.color = 'var(--danger-color)';
        }
    }

    async processSale() {
        try {
            const amountReceived = parseFloat(document.getElementById('amount-received').value) || 0;
            const totals = this.calculateTotals();
            
            if (amountReceived < totals.total && this.currentPaymentMethod === 'cash') {
                if (window.app) {
                    window.app.showNotification(`Insufficient amount received! Need $${totals.total.toFixed(2)}`, 'error');
                }
                return;
            }
            
            // Create sale record
            const sale = {
                date: new Date().toISOString(),
                items: this.cart.map(item => ({
                    productId: item.productId,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    unit: item.unit
                })),
                subtotal: totals.subtotal,
                tax: totals.tax,
                total: totals.total,
                paymentMethod: this.currentPaymentMethod,
                amountReceived: amountReceived,
                changeGiven: Math.max(0, amountReceived - totals.total),
                createdAt: new Date().toISOString()
            };
            
            // Save sale
            await db.addSale(sale);
            
            // Update product stock
            for (const item of this.cart) {
                const product = this.products.find(p => p.id === item.productId);
                if (product) {
                    const newStock = product.stock - item.quantity;
                    await db.updateProduct(product.id, { 
                        stock: newStock,
                        updatedAt: new Date().toISOString()
                    });
                }
            }
            
            // Clear cart
            await this.clearCart();
            
            // Close modal
            if (window.app) {
                window.app.closeAllModals();
                window.app.showNotification(`Sale completed! Total: $${totals.total.toFixed(2)}`, 'success');
            }
            
            // Reload products
            await this.loadProducts();
            this.renderProducts();
            
        } catch (error) {
            console.error('Error processing sale:', error);
            if (window.app) {
                window.app.showNotification('Error processing sale: ' + error.message, 'error');
            }
        }
    }
}

// Initialize POS system
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing POSSystem...');
    window.posSystem = new POSSystem();
});