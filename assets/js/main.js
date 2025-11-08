// Aurelius Time - Luxury Watch E-commerce
// Main JavaScript Application

// Global State Management
class Store {
    constructor() {
        this.state = {
            user: null,
            cart: [],
            wishlist: [],
            products: [],
            categories: [],
            orders: [],
            coupons: [],
            settings: {}
        };
        this.listeners = {};
        this.init();
    }

    async init() {
        // Load data from localStorage first
        this.loadFromStorage();
        
        // Then load from JSON files
        await this.loadData();
        
        // Initialize user session
        this.initUserSession();
    }

    // Event System
    subscribe(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    // State Management
    setState(updates) {
        Object.assign(this.state, updates);
        this.saveToStorage();
        this.emit('stateChange', this.state);
    }

    getState() {
        return { ...this.state };
    }

    // Data Loading
    async loadData() {
        try {
            const [products, users, orders, coupons, settings] = await Promise.all([
                this.loadJSON('data/products.json'),
                this.loadJSON('data/users.json'),
                this.loadJSON('data/orders.json'),
                this.loadJSON('data/coupons.json'),
                this.loadJSON('data/settings.json')
            ]);

            this.setState({
                products,
                orders,
                coupons,
                settings
            });

            // Extract categories from products
            const categories = [...new Set(products.flatMap(p => p.categories))];
            this.setState({ categories });

        } catch (error) {
            console.warn('Could not load data files, using defaults:', error);
            this.initializeDefaults();
        }
    }

    async loadJSON(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.warn(`Failed to load ${url}:`, error);
            return [];
        }
    }

    initializeDefaults() {
        // Default products if JSON files don't exist
        const defaultProducts = [
            {
                id: 'p001',
                slug: 'aurelius-chronomaster-black',
                name: 'Aurelius Chronomaster Black',
                brand: 'Aurelius',
                price: 3299.00,
                compareAt: 3799.00,
                inventory: 12,
                sku: 'AUR-CHR-BK-42',
                images: [
                    'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=800',
                    'https://images.pexels.com/photos/277319/pexels-photo-277319.jpeg?auto=compress&cs=tinysrgb&w=800'
                ],
                categories: ['Men', 'Automatic'],
                attributes: {
                    movement: 'Automatic',
                    caseSize: '42mm',
                    waterResistance: '100m',
                    strap: 'Leather'
                },
                rating: 4.7,
                reviews: [
                    {
                        userId: 'u002',
                        stars: 5,
                        text: 'Stunning finish and incredible craftsmanship',
                        date: '2025-01-01'
                    }
                ],
                description: '<p>Swiss movement, sapphire crystal, and premium leather strap combine to create a timepiece of exceptional quality.</p>'
            },
            {
                id: 'p002',
                slug: 'tempus-elegance-rose-gold',
                name: 'Tempus Elegance Rose Gold',
                brand: 'Tempus',
                price: 2499.00,
                compareAt: null,
                inventory: 8,
                sku: 'TMP-ELG-RG-38',
                images: [
                    'https://images.pexels.com/photos/1697214/pexels-photo-1697214.jpeg?auto=compress&cs=tinysrgb&w=800'
                ],
                categories: ['Women', 'Automatic'],
                attributes: {
                    movement: 'Automatic',
                    caseSize: '38mm',
                    waterResistance: '50m',
                    strap: 'Steel Bracelet'
                },
                rating: 4.9,
                reviews: [],
                description: '<p>Elegant rose gold finish with automatic movement, perfect for any occasion.</p>'
            },
            {
                id: 'p003',
                slug: 'chronos-sport-titanium',
                name: 'Chronos Sport Titanium',
                brand: 'Chronos',
                price: 4299.00,
                compareAt: null,
                inventory: 5,
                sku: 'CHR-SPT-TI-44',
                images: [
                    'https://images.pexels.com/photos/280250/pexels-photo-280250.jpeg?auto=compress&cs=tinysrgb&w=800'
                ],
                categories: ['Men', 'Chronograph'],
                attributes: {
                    movement: 'Chronograph',
                    caseSize: '44mm',
                    waterResistance: '200m',
                    strap: 'Titanium Bracelet'
                },
                rating: 4.8,
                reviews: [],
                description: '<p>Professional sports chronograph with titanium construction for ultimate durability.</p>'
            }
        ];

        this.setState({
            products: defaultProducts,
            categories: ['Men', 'Women', 'Automatic', 'Chronograph'],
            settings: {
                storeName: 'Aurelius Time',
                currency: '$',
                contactEmail: 'contact@aureliustime.com'
            }
        });
    }

    // Local Storage
    loadFromStorage() {
        try {
            const stored = localStorage.getItem('aureliusTimeStore');
            if (stored) {
                const data = JSON.parse(stored);
                this.state = { ...this.state, ...data };
            }
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
        }
    }

    saveToStorage() {
        try {
            const toStore = {
                user: this.state.user,
                cart: this.state.cart,
                wishlist: this.state.wishlist,
                orders: this.state.orders
            };
            localStorage.setItem('aureliusTimeStore', JSON.stringify(toStore));
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    }

    // User Management
    initUserSession() {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const user = JSON.parse(localStorage.getItem('currentUser'));
                if (user) {
                    this.setState({ user });
                }
            } catch (error) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('currentUser');
            }
        }
    }

    // Product Methods
    getProducts(filters = {}) {
        let products = [...this.state.products];

        // Apply filters
        if (filters.category) {
            products = products.filter(p => 
                p.categories.some(cat => 
                    cat.toLowerCase().includes(filters.category.toLowerCase())
                )
            );
        }

        if (filters.brand) {
            products = products.filter(p => 
                p.brand.toLowerCase().includes(filters.brand.toLowerCase())
            );
        }

        if (filters.priceMin !== undefined) {
            products = products.filter(p => p.price >= filters.priceMin);
        }

        if (filters.priceMax !== undefined) {
            products = products.filter(p => p.price <= filters.priceMax);
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            products = products.filter(p => 
                p.name.toLowerCase().includes(searchTerm) ||
                p.brand.toLowerCase().includes(searchTerm) ||
                p.description.toLowerCase().includes(searchTerm)
            );
        }

        // Apply sorting
        if (filters.sort) {
            switch (filters.sort) {
                case 'price-asc':
                    products.sort((a, b) => a.price - b.price);
                    break;
                case 'price-desc':
                    products.sort((a, b) => b.price - a.price);
                    break;
                case 'name-asc':
                    products.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'name-desc':
                    products.sort((a, b) => b.name.localeCompare(a.name));
                    break;
                case 'rating':
                    products.sort((a, b) => b.rating - a.rating);
                    break;
                default:
                    break;
            }
        }

        return products;
    }

    getProduct(id) {
        return this.state.products.find(p => p.id === id || p.slug === id);
    }

    searchProducts(query) {
        if (!query) return [];
        
        const searchTerm = query.toLowerCase();
        return this.state.products.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.brand.toLowerCase().includes(searchTerm) ||
            p.categories.some(cat => cat.toLowerCase().includes(searchTerm))
        ).slice(0, 8);
    }

    // Cart Methods
    addToCart(productId, quantity = 1, variant = null) {
        const product = this.getProduct(productId);
        if (!product) return { error: 'Product not found' };

        if (product.inventory < quantity) {
            return { error: 'Not enough stock available' };
        }

        const cart = [...this.state.cart];
        const existingIndex = cart.findIndex(item => 
            item.productId === productId && 
            JSON.stringify(item.variant) === JSON.stringify(variant)
        );

        if (existingIndex >= 0) {
            const newQuantity = cart[existingIndex].quantity + quantity;
            if (product.inventory < newQuantity) {
                return { error: 'Not enough stock available' };
            }
            cart[existingIndex].quantity = newQuantity;
        } else {
            cart.push({
                id: `cart_${Date.now()}_${Math.random()}`,
                productId,
                quantity,
                variant,
                addedAt: new Date().toISOString()
            });
        }

        this.setState({ cart });
        this.emit('cartUpdated', cart);
        return { success: true };
    }

    updateCartItem(itemId, quantity) {
        const cart = [...this.state.cart];
        const index = cart.findIndex(item => item.id === itemId);
        
        if (index >= 0) {
            if (quantity <= 0) {
                cart.splice(index, 1);
            } else {
                const product = this.getProduct(cart[index].productId);
                if (product && product.inventory >= quantity) {
                    cart[index].quantity = quantity;
                } else {
                    return { error: 'Not enough stock available' };
                }
            }
            
            this.setState({ cart });
            this.emit('cartUpdated', cart);
            return { success: true };
        }
        
        return { error: 'Item not found in cart' };
    }

    removeFromCart(itemId) {
        const cart = this.state.cart.filter(item => item.id !== itemId);
        this.setState({ cart });
        this.emit('cartUpdated', cart);
    }

    clearCart() {
        this.setState({ cart: [] });
        this.emit('cartUpdated', []);
    }

    getCartTotal() {
        return this.state.cart.reduce((total, item) => {
            const product = this.getProduct(item.productId);
            return total + (product ? product.price * item.quantity : 0);
        }, 0);
    }

    getCartItemCount() {
        return this.state.cart.reduce((count, item) => count + item.quantity, 0);
    }

    // Wishlist Methods
    addToWishlist(productId) {
        const wishlist = [...this.state.wishlist];
        if (!wishlist.includes(productId)) {
            wishlist.push(productId);
            this.setState({ wishlist });
            this.emit('wishlistUpdated', wishlist);
        }
    }

    removeFromWishlist(productId) {
        const wishlist = this.state.wishlist.filter(id => id !== productId);
        this.setState({ wishlist });
        this.emit('wishlistUpdated', wishlist);
    }

    isInWishlist(productId) {
        return this.state.wishlist.includes(productId);
    }

    // Order Methods
    createOrder(orderData) {
        const order = {
            id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: this.state.user?.id,
            items: [...this.state.cart],
            shipping: orderData.shipping,
            payment: orderData.payment,
            subtotal: this.getCartTotal(),
            shipping: orderData.shippingCost || 0,
            tax: orderData.tax || 0,
            total: orderData.total,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const orders = [...this.state.orders, order];
        this.setState({ orders });
        this.clearCart();
        this.emit('orderCreated', order);
        
        return order;
    }

    getUserOrders(userId) {
        return this.state.orders.filter(order => order.userId === userId);
    }

    getOrder(orderId) {
        return this.state.orders.find(order => order.id === orderId);
    }
}

// Authentication Manager
class AuthManager {
    constructor() {
        this.init();
    }

    init() {
        this.checkSession();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'logout-button') {
                this.logout();
            }
        });

        if (window.store) {
            window.store.subscribe('stateChange', (state) => {
                this.updateAuthUI(state.user);
            });
        }
    }

    checkSession() {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('currentUser');
        
        if (token && userData) {
            try {
                const user = JSON.parse(userData);
                if (window.store) {
                    window.store.setState({ user });
                }
                this.updateAuthUI(user);
            } catch (error) {
                this.clearSession();
            }
        }
    }

    async login(email, password, rememberMe = false) {
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            const users = [
                {
                    id: 'u001',
                    email: 'admin@aureliustime.com',
                    name: 'Admin User',
                    role: 'admin',
                    avatar: null
                },
                {
                    id: 'u002',
                    email: 'customer@example.com',
                    name: 'John Customer',
                    role: 'customer',
                    avatar: null
                }
            ];

            const user = users.find(u => u.email === email);
            
            if (!user || password !== 'password') {
                throw new Error('Invalid email or password');
            }

            const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            localStorage.setItem('authToken', token);
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            if (rememberMe) {
                localStorage.setItem('rememberUser', 'true');
            }

            if (window.store) {
                window.store.setState({ user });
            }

            this.updateAuthUI(user);

            return { success: true, user };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    logout() {
        this.clearSession();
        
        if (window.store) {
            window.store.setState({ user: null });
        }

        this.updateAuthUI(null);

        if (window.ui) {
            window.ui.showToast('Signed out successfully', 'success');
        }

        if (window.location.pathname.includes('admin') || window.location.pathname.includes('account')) {
            window.location.href = 'index.html';
        }
    }

    clearSession() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberUser');
    }

    updateAuthUI(user) {
        const guestMenu = document.getElementById('account-menu-guest');
        const userMenu = document.getElementById('account-menu-user');

        if (user) {
            if (guestMenu) guestMenu.style.display = 'none';
            if (userMenu) userMenu.style.display = 'block';
        } else {
            if (guestMenu) guestMenu.style.display = 'block';
            if (userMenu) userMenu.style.display = 'none';
        }
    }

    getCurrentUser() {
        if (window.store) {
            return window.store.getState().user;
        }
        return null;
    }

    isAuthenticated() {
        return !!this.getCurrentUser();
    }

    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    }

    requireAuth() {
        if (!this.isAuthenticated()) {
            if (window.ui) {
                window.ui.showToast('Please sign in to continue', 'warning');
            }
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
}

// Cart Manager
class CartManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCartUI();
        
        if (window.store) {
            window.store.subscribe('cartUpdated', () => {
                this.updateCartUI();
            });
        }
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.cart-button')) {
                this.toggleDrawer();
            }
            
            if (e.target.classList.contains('cart-drawer-overlay')) {
                this.closeDrawer();
            }
            
            if (e.target.closest('.cart-drawer-close')) {
                this.closeDrawer();
            }

            if (e.target.closest('.add-to-cart')) {
                e.preventDefault();
                this.handleAddToCart(e.target.closest('.add-to-cart'));
            }

            if (e.target.closest('.quantity-decrease')) {
                this.updateQuantity(e.target.closest('.cart-item'), -1);
            }
            
            if (e.target.closest('.quantity-increase')) {
                this.updateQuantity(e.target.closest('.cart-item'), 1);
            }

            if (e.target.closest('.remove-item')) {
                this.removeItem(e.target.closest('.cart-item'));
            }

            if (e.target.closest('.wishlist-toggle')) {
                e.preventDefault();
                const button = e.target.closest('.wishlist-toggle');
                const productId = button.dataset.productId;
                if (productId) {
                    this.toggleWishlist(productId);
                }
            }
        });

        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('quantity-input')) {
                this.handleQuantityInput(e.target);
            }
        });

        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('product-form')) {
                e.preventDefault();
                this.handleProductForm(e.target);
            }
        });
    }

    handleAddToCart(button) {
        const productId = button.dataset.productId;
        const quantity = parseInt(button.dataset.quantity) || 1;
        
        if (!productId) return;

        const originalText = button.textContent;
        button.textContent = 'Adding...';
        button.disabled = true;

        const result = window.store.addToCart(productId, quantity);
        
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
        }, 1000);

        if (result.error) {
            if (window.ui) {
                window.ui.showToast(result.error, 'error');
            }
        } else {
            if (window.ui) {
                window.ui.showToast('Added to cart!', 'success');
            }
            this.showDrawer();
        }
    }

    handleProductForm(form) {
        const formData = new FormData(form);
        const productId = formData.get('productId');
        const quantity = parseInt(formData.get('quantity')) || 1;
        
        const variant = {};
        for (const [key, value] of formData.entries()) {
            if (key !== 'productId' && key !== 'quantity') {
                variant[key] = value;
            }
        }

        const result = window.store.addToCart(productId, quantity, Object.keys(variant).length > 0 ? variant : null);
        
        if (result.error) {
            if (window.ui) {
                window.ui.showToast(result.error, 'error');
            }
        } else {
            if (window.ui) {
                window.ui.showToast('Added to cart!', 'success');
            }
            this.showDrawer();
        }
    }

    updateQuantity(cartItemElement, change) {
        const itemId = cartItemElement.dataset.itemId;
        const currentQuantity = parseInt(cartItemElement.querySelector('.quantity-input').value);
        const newQuantity = Math.max(1, currentQuantity + change);
        
        const result = window.store.updateCartItem(itemId, newQuantity);
        
        if (result.error) {
            if (window.ui) {
                window.ui.showToast(result.error, 'error');
            }
        }
    }

    handleQuantityInput(input) {
        const cartItem = input.closest('.cart-item');
        const itemId = cartItem.dataset.itemId;
        const quantity = Math.max(1, parseInt(input.value) || 1);
        
        input.value = quantity;
        
        const result = window.store.updateCartItem(itemId, quantity);
        
        if (result.error) {
            if (window.ui) {
                window.ui.showToast(result.error, 'error');
            }
            const cart = window.store.getState().cart;
            const item = cart.find(item => item.id === itemId);
            if (item) {
                input.value = item.quantity;
            }
        }
    }

    removeItem(cartItemElement) {
        const itemId = cartItemElement.dataset.itemId;
        window.store.removeFromCart(itemId);
        
        if (window.ui) {
            window.ui.showToast('Item removed from cart', 'info');
        }
    }

    toggleDrawer() {
        const drawer = document.getElementById('cart-drawer');
        if (drawer) {
            drawer.classList.toggle('active');
        }
    }

    showDrawer() {
        const drawer = document.getElementById('cart-drawer');
        if (drawer) {
            drawer.classList.add('active');
        }
    }

    closeDrawer() {
        const drawer = document.getElementById('cart-drawer');
        if (drawer) {
            drawer.classList.remove('active');
        }
    }

    updateCartUI() {
        this.updateCartCount();
        this.updateCartDrawer();
    }

    updateCartCount() {
        const countElement = document.getElementById('cart-count');
        if (countElement) {
            const count = window.store.getCartItemCount();
            countElement.textContent = count;
            countElement.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    updateCartDrawer() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotalElement = document.getElementById('cart-total');
        
        if (!cartItemsContainer || !window.store) return;

        const cart = window.store.getState().cart;
        const products = window.store.getState().products;

        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="cart-empty">
                    <div class="cart-empty-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L6 21H20"/>
                            <circle cx="9" cy="19" r="2"/>
                            <circle cx="20" cy="19" r="2"/>
                        </svg>
                    </div>
                    <h3>Your cart is empty</h3>
                    <p>Add some watches to get started</p>
                    <a href="shop.html" class="btn btn-primary">Continue Shopping</a>
                </div>
            `;
        } else {
            cart.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    const cartItemHTML = this.createCartItemHTML(item, product);
                    cartItemsContainer.insertAdjacentHTML('beforeend', cartItemHTML);
                }
            });
        }

        if (cartTotalElement) {
            const total = window.store.getCartTotal();
            cartTotalElement.textContent = this.formatPrice(total);
        }
    }

    createCartItemHTML(item, product) {
        const itemTotal = product.price * item.quantity;
        
        return `
            <div class="cart-item" data-item-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${product.name}</h4>
                    <p class="cart-item-brand">${product.brand}</p>
                    ${item.variant ? `<p class="cart-item-variant">${this.formatVariant(item.variant)}</p>` : ''}
                    <div class="cart-item-price">${this.formatPrice(product.price)}</div>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-controls">
                        <button type="button" class="quantity-decrease" aria-label="Decrease quantity">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                        </button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="99">
                        <button type="button" class="quantity-increase" aria-label="Increase quantity">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                        </button>
                    </div>
                    <div class="cart-item-total">${this.formatPrice(itemTotal)}</div>
                    <button type="button" class="remove-item" aria-label="Remove item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    }

    formatVariant(variant) {
        return Object.entries(variant)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
    }

    toggleWishlist(productId) {
        if (!window.auth.isAuthenticated()) {
            if (window.ui) {
                window.ui.showToast('Please sign in to add to wishlist', 'warning');
            }
            return;
        }

        const isInWishlist = window.store.isInWishlist(productId);
        
        if (isInWishlist) {
            window.store.removeFromWishlist(productId);
            if (window.ui) {
                window.ui.showToast('Removed from wishlist', 'info');
            }
        } else {
            window.store.addToWishlist(productId);
            if (window.ui) {
                window.ui.showToast('Added to wishlist', 'success');
            }
        }

        this.updateWishlistUI();
    }

    updateWishlistUI() {
        const countElement = document.getElementById('wishlist-count');
        if (countElement) {
            const count = window.store.getState().wishlist.length;
            countElement.textContent = count;
            countElement.style.display = count > 0 ? 'flex' : 'none';
        }

        document.querySelectorAll('.wishlist-toggle').forEach(button => {
            const productId = button.dataset.productId;
            const isInWishlist = window.store.isInWishlist(productId);
            button.classList.toggle('active', isInWishlist);
            button.setAttribute('aria-pressed', isInWishlist);
        });
    }
}

// Search Manager
class SearchManager {
    constructor() {
        this.searchInput = null;
        this.searchResults = null;
        this.searchTimeout = null;
        this.isSearchActive = false;
        
        this.init();
    }

    init() {
        this.searchInput = document.getElementById('search-input');
        this.searchResults = document.getElementById('search-results');
        
        if (this.searchInput && this.searchResults) {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        this.searchInput.addEventListener('input', (e) => {
            this.handleSearchInput(e.target.value);
        });

        this.searchInput.addEventListener('focus', () => {
            if (this.searchInput.value.trim()) {
                this.showResults();
            }
        });

        this.searchInput.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });

        const searchButton = this.searchInput.parentElement.querySelector('.search-button');
        if (searchButton) {
            searchButton.addEventListener('click', () => {
                this.performSearch(this.searchInput.value.trim());
            });
        }

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.header-search')) {
                this.hideResults();
            }
        });

        this.searchResults.addEventListener('click', (e) => {
            const resultItem = e.target.closest('.search-result-item');
            if (resultItem) {
                const productId = resultItem.dataset.productId;
                const product = window.store.getProduct(productId);
                if (product) {
                    window.location.href = `product.html?id=${product.slug}`;
                    this.hideResults();
                    this.searchInput.blur();
                }
            }
        });
    }

    handleSearchInput(query) {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        this.searchTimeout = setTimeout(() => {
            if (query.trim().length >= 2) {
                this.search(query.trim());
            } else {
                this.hideResults();
            }
        }, 300);
    }

    handleKeydown(e) {
        const results = this.searchResults.querySelectorAll('.search-result-item');
        const activeResult = this.searchResults.querySelector('.search-result-item.active');
        let activeIndex = -1;

        if (activeResult) {
            activeIndex = Array.from(results).indexOf(activeResult);
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = Math.min(activeIndex + 1, results.length - 1);
                this.setActiveResult(results, nextIndex);
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = Math.max(activeIndex - 1, 0);
                this.setActiveResult(results, prevIndex);
                break;
                
            case 'Enter':
                e.preventDefault();
                if (activeResult) {
                    activeResult.click();
                } else {
                    this.performSearch(this.searchInput.value.trim());
                }
                break;
                
            case 'Escape':
                this.hideResults();
                this.searchInput.blur();
                break;
        }
    }

    setActiveResult(results, index) {
        results.forEach((result, i) => {
            result.classList.toggle('active', i === index);
        });
    }

    search(query) {
        if (!window.store) return;

        const results = window.store.searchProducts(query);
        this.renderResults(results, query);
        
        if (results.length > 0) {
            this.showResults();
        } else {
            this.renderNoResults(query);
            this.showResults();
        }
    }

    renderResults(products, query) {
        if (products.length === 0) {
            this.renderNoResults(query);
            return;
        }

        const resultsHTML = products.map(product => {
            const highlightedName = this.highlightText(product.name, query);
            const highlightedBrand = this.highlightText(product.brand, query);
            
            return `
                <div class="search-result-item" data-product-id="${product.id}">
                    <div class="search-result-image">
                        <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
                    </div>
                    <div class="search-result-content">
                        <div class="search-result-brand">${highlightedBrand}</div>
                        <div class="search-result-name">${highlightedName}</div>
                        <div class="search-result-price">${this.formatPrice(product.price)}</div>
                    </div>
                </div>
            `;
        }).join('');

        this.searchResults.innerHTML = `
            <div class="search-results-header">
                <span>Search Results</span>
                <button type="button" class="view-all-results" onclick="window.search.performSearch('${query}')">
                    View All (${products.length > 8 ? '8+' : products.length})
                </button>
            </div>
            <div class="search-results-list">
                ${resultsHTML}
            </div>
        `;
    }

    renderNoResults(query) {
        this.searchResults.innerHTML = `
            <div class="search-no-results">
                <div class="search-no-results-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="21 21L16.514 16.514"/>
                    </svg>
                </div>
                <h3>No results found</h3>
                <p>We couldn't find any watches matching "<strong>${this.escapeHtml(query)}</strong>"</p>
                <div class="search-suggestions">
                    <p>Try:</p>
                    <ul>
                        <li>Checking your spelling</li>
                        <li>Using different keywords</li>
                        <li>Searching for a specific brand</li>
                    </ul>
                </div>
                <button type="button" class="btn btn-outline btn-sm" onclick="window.location.href='shop.html'">
                    Browse All Watches
                </button>
            </div>
        `;
    }

    highlightText(text, query) {
        const regex = new RegExp(`(${this.escapeRegExp(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showResults() {
        this.searchResults.classList.add('active');
        this.isSearchActive = true;
    }

    hideResults() {
        this.searchResults.classList.remove('active');
        this.isSearchActive = false;
        
        this.searchResults.querySelectorAll('.search-result-item.active')
            .forEach(item => item.classList.remove('active'));
    }

    performSearch(query) {
        if (!query.trim()) return;

        window.location.href = `shop.html?search=${encodeURIComponent(query.trim())}`;
        this.hideResults();
        this.searchInput.blur();
    }

    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    }

    setQuery(query) {
        if (this.searchInput) {
            this.searchInput.value = query;
        }
    }

    clearSearch() {
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        this.hideResults();
    }
}

// UI Manager
class UIManager {
    constructor() {
        this.modals = new Map();
        this.toasts = [];
        this.init();
    }

    init() {
        this.setupGlobalEventListeners();
        this.initializeComponents();
    }

    setupGlobalEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }

            if (e.target.closest('.modal-close')) {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            }

            if (e.target.closest('.toast-close')) {
                const toast = e.target.closest('.toast');
                if (toast) {
                    this.closeToast(toast);
                }
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    this.closeModal(activeModal.id);
                }
            }
        });

        document.addEventListener('submit', (e) => {
            if (e.target.id === 'newsletter-form') {
                e.preventDefault();
                this.handleNewsletterSubmission(e.target);
            }
        });

        let lastScrollY = window.scrollY;
        window.addEventListener('scroll', () => {
            const header = document.getElementById('header');
            if (header) {
                const currentScrollY = window.scrollY;
                header.classList.toggle('scrolled', currentScrollY > 100);
                lastScrollY = currentScrollY;
            }
        });
    }

    initializeComponents() {
        document.querySelectorAll('.modal').forEach(modal => {
            this.registerModal(modal.id);
        });

        this.initLazyLoading();
        this.initTooltips();
    }

    registerModal(modalId) {
        this.modals.set(modalId, {
            element: document.getElementById(modalId),
            isOpen: false
        });
    }

    createModal(id, title, content, options = {}) {
        const modalHTML = `
            <div id="${id}" class="modal" role="dialog" aria-labelledby="${id}-title" aria-hidden="true">
                <div class="modal-content" style="max-width: ${options.maxWidth || '500px'};">
                    <div class="modal-header">
                        <h2 id="${id}-title" class="modal-title">${title}</h2>
                        <button type="button" class="modal-close" aria-label="Close modal">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    ${options.footer ? `<div class="modal-footer">${options.footer}</div>` : ''}
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.registerModal(id);
        
        return document.getElementById(id);
    }

    openModal(modalId) {
        const modal = this.modals.get(modalId);
        if (modal && modal.element) {
            modal.element.classList.add('active');
            modal.element.setAttribute('aria-hidden', 'false');
            modal.isOpen = true;
            
            const firstFocusable = modal.element.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
            
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = this.modals.get(modalId);
        if (modal && modal.element) {
            modal.element.classList.remove('active');
            modal.element.setAttribute('aria-hidden', 'true');
            modal.isOpen = false;
            
            document.body.style.overflow = '';
        }
    }

    showToast(message, type = 'info', duration = 4000, title = '') {
        const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const toastHTML = `
            <div id="${toastId}" class="toast ${type}" role="alert" aria-live="polite">
                <div class="toast-content">
                    ${title ? `<div class="toast-title">${title}</div>` : ''}
                    <div class="toast-message">${message}</div>
                </div>
                <button type="button" class="toast-close" aria-label="Close notification">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        `;

        const container = document.getElementById('toast-container');
        if (container) {
            container.insertAdjacentHTML('beforeend', toastHTML);
            
            const toast = document.getElementById(toastId);
            
            requestAnimationFrame(() => {
                toast.classList.add('active');
            });

            const timer = setTimeout(() => {
                this.closeToast(toast);
            }, duration);

            this.toasts.push({
                id: toastId,
                element: toast,
                timer: timer
            });

            if (this.toasts.length > 5) {
                const oldestToast = this.toasts.shift();
                this.closeToast(oldestToast.element);
            }
        }
    }

    closeToast(toastElement) {
        if (!toastElement) return;

        const toastId = toastElement.id;
        const toastIndex = this.toasts.findIndex(t => t.id === toastId);
        
        if (toastIndex >= 0) {
            const toast = this.toasts[toastIndex];
            clearTimeout(toast.timer);
            this.toasts.splice(toastIndex, 1);
        }

        toastElement.classList.remove('active');
        
        setTimeout(() => {
            if (toastElement.parentNode) {
                toastElement.parentNode.removeChild(toastElement);
            }
        }, 300);
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

    initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    initTooltips() {
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            element.addEventListener('mouseenter', this.showTooltip);
            element.addEventListener('mouseleave', this.hideTooltip);
        });
    }

    showTooltip(e) {
        const element = e.target;
        const text = element.dataset.tooltip;
        
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
        
        element._tooltip = tooltip;
    }

    hideTooltip(e) {
        const element = e.target;
        if (element._tooltip) {
            element._tooltip.remove();
            delete element._tooltip;
        }
    }

    handleNewsletterSubmission(form) {
        const email = form.email.value.trim();
        
        if (!email) {
            this.showToast('Please enter your email address', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showToast('Please enter a valid email address', 'error');
            return;
        }

        const button = form.querySelector('button[type="submit"]');
        const originalText = button.textContent;
        
        button.textContent = 'Subscribing...';
        button.disabled = true;

        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
            form.reset();
            this.showToast('Successfully subscribed to newsletter!', 'success');
        }, 1500);
    }

    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let starsHTML = '';
        
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<span class="star filled">★</span>';
        }
        
        if (hasHalfStar) {
            starsHTML += '<span class="star half">☆</span>';
        }
        
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<span class="star">☆</span>';
        }

        return `<div class="stars">${starsHTML}</div>`;
    }

    createProductCard(product) {
        const isInWishlist = window.store && window.store.isInWishlist(product.id);
        const discount = product.compareAt ? Math.round((1 - product.price / product.compareAt) * 100) : 0;

        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
                    ${discount > 0 ? `<span class="product-badge">-${discount}%</span>` : ''}
                    ${product.inventory === 0 ? '<span class="product-badge out-of-stock">Out of Stock</span>' : ''}
                    <div class="product-actions">
                        <button type="button" class="product-action wishlist-toggle ${isInWishlist ? 'active' : ''}" 
                                data-product-id="${product.id}" 
                                aria-label="Add to wishlist"
                                data-tooltip="Add to Wishlist">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="product-content">
                    <div class="product-brand">${product.brand}</div>
                    <h3 class="product-title">
                        <a href="product.html?id=${product.slug}">
                            ${product.name}
                        </a>
                    </h3>
                    <div class="product-rating">
                        ${this.renderStars(product.rating)}
                        <span class="rating-count">(${product.reviews?.length || 0})</span>
                    </div>
                    <div class="product-price">
                        <span class="price-current">${this.formatPrice(product.price)}</span>
                        ${product.compareAt ? `
                            <span class="price-original">${this.formatPrice(product.compareAt)}</span>
                            <span class="price-discount">-${discount}%</span>
                        ` : ''}
                    </div>
                    <div class="product-actions-bottom">
                        <button type="button" 
                                class="btn btn-primary btn-full add-to-cart" 
                                data-product-id="${product.id}"
                                ${product.inventory === 0 ? 'disabled' : ''}>
                            ${product.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

// Page-specific functionality
class PageManager {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        return filename.replace('.html', '');
    }

    init() {
        switch (this.currentPage) {
            case 'index':
                this.initHomePage();
                break;
            case 'shop':
                this.initShopPage();
                break;
            case 'product':
                this.initProductPage();
                break;
            case 'cart':
                this.initCartPage();
                break;
            default:
                break;
        }
    }

    initHomePage() {
        const newArrivalsGrid = document.getElementById('new-arrivals-grid');
        if (newArrivalsGrid && window.store) {
            const products = window.store.getProducts().slice(0, 4);
            newArrivalsGrid.innerHTML = products.map(product => 
                window.ui.createProductCard(product)
            ).join('');
        }
    }

    initShopPage() {
        this.setupFilters();
        this.loadProducts();
    }

    setupFilters() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Set initial filter values from URL
        const category = urlParams.get('category');
        const brand = urlParams.get('brand');
        const search = urlParams.get('search');
        const sort = urlParams.get('sort');

        if (category) {
            const checkbox = document.getElementById(`cat-${category}`);
            if (checkbox) checkbox.checked = true;
        }

        if (brand) {
            const checkbox = document.getElementById(`brand-${brand}`);
            if (checkbox) checkbox.checked = true;
        }

        if (search) {
            const searchInput = document.getElementById('search-input');
            if (searchInput) searchInput.value = search;
        }

        if (sort) {
            const sortSelect = document.getElementById('sort-select');
            if (sortSelect) sortSelect.value = sort;
        }

        // Setup filter event listeners
        document.addEventListener('change', (e) => {
            if (e.target.name === 'category' || e.target.name === 'brand' || e.target.id === 'sort-select') {
                this.applyFilters();
            }
        });

        document.addEventListener('input', (e) => {
            if (e.target.id === 'price-min' || e.target.id === 'price-max') {
                this.updatePriceDisplay();
                this.applyFilters();
            }
        });

        document.getElementById('clear-filters')?.addEventListener('click', () => {
            this.clearFilters();
        });

        this.updatePriceDisplay();
    }

    updatePriceDisplay() {
        const minSlider = document.getElementById('price-min');
        const maxSlider = document.getElementById('price-max');
        const minDisplay = document.getElementById('price-min-display');
        const maxDisplay = document.getElementById('price-max-display');

        if (minSlider && maxSlider && minDisplay && maxDisplay) {
            minDisplay.textContent = `$${parseInt(minSlider.value).toLocaleString()}`;
            maxDisplay.textContent = `$${parseInt(maxSlider.value).toLocaleString()}`;
        }
    }

    applyFilters() {
        const filters = this.getActiveFilters();
        this.loadProducts(filters);
        this.updateURL(filters);
    }

    getActiveFilters() {
        const filters = {};

        // Category filters
        const categoryCheckboxes = document.querySelectorAll('input[name="category"]:checked');
        if (categoryCheckboxes.length > 0) {
            filters.categories = Array.from(categoryCheckboxes).map(cb => cb.value);
        }

        // Brand filters
        const brandCheckboxes = document.querySelectorAll('input[name="brand"]:checked');
        if (brandCheckboxes.length > 0) {
            filters.brands = Array.from(brandCheckboxes).map(cb => cb.value);
        }

        // Price range
        const minPrice = document.getElementById('price-min');
        const maxPrice = document.getElementById('price-max');
        if (minPrice && maxPrice) {
            filters.priceMin = parseInt(minPrice.value);
            filters.priceMax = parseInt(maxPrice.value);
        }

        // Sort
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect && sortSelect.value) {
            filters.sort = sortSelect.value;
        }

        // Search
        const urlParams = new URLSearchParams(window.location.search);
        const search = urlParams.get('search');
        if (search) {
            filters.search = search;
        }

        return filters;
    }

    loadProducts(filters = {}) {
        if (!window.store) return;

        let products = window.store.getProducts();

        // Apply filters
        if (filters.categories) {
            products = products.filter(p => 
                filters.categories.some(cat => 
                    p.categories.some(pCat => pCat.toLowerCase().includes(cat.toLowerCase()))
                )
            );
        }

        if (filters.brands) {
            products = products.filter(p => 
                filters.brands.some(brand => 
                    p.brand.toLowerCase().includes(brand.toLowerCase())
                )
            );
        }

        if (filters.priceMin !== undefined) {
            products = products.filter(p => p.price >= filters.priceMin);
        }

        if (filters.priceMax !== undefined) {
            products = products.filter(p => p.price <= filters.priceMax);
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            products = products.filter(p => 
                p.name.toLowerCase().includes(searchTerm) ||
                p.brand.toLowerCase().includes(searchTerm) ||
                p.description.toLowerCase().includes(searchTerm)
            );
        }

        // Apply sorting
        if (filters.sort) {
            switch (filters.sort) {
                case 'price-asc':
                    products.sort((a, b) => a.price - b.price);
                    break;
                case 'price-desc':
                    products.sort((a, b) => b.price - a.price);
                    break;
                case 'name-asc':
                    products.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'name-desc':
                    products.sort((a, b) => b.name.localeCompare(a.name));
                    break;
                case 'rating':
                    products.sort((a, b) => b.rating - a.rating);
                    break;
            }
        }

        this.renderProducts(products);
        this.updateResultsCount(products.length);
    }

    renderProducts(products) {
        const productsGrid = document.getElementById('products-grid');
        if (!productsGrid) return;

        if (products.length === 0) {
            productsGrid.innerHTML = `
                <div class="no-products">
                    <h3>No products found</h3>
                    <p>Try adjusting your filters or search terms.</p>
                    <button type="button" class="btn btn-outline" onclick="window.pageManager.clearFilters()">
                        Clear All Filters
                    </button>
                </div>
            `;
            return;
        }

        productsGrid.innerHTML = products.map(product => 
            window.ui.createProductCard(product)
        ).join('');
    }

    updateResultsCount(count) {
        const resultsCount = document.getElementById('results-count');
        if (resultsCount) {
            resultsCount.textContent = `${count} product${count !== 1 ? 's' : ''} found`;
        }
    }

    clearFilters() {
        // Clear checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });

        // Reset price sliders
        const minSlider = document.getElementById('price-min');
        const maxSlider = document.getElementById('price-max');
        if (minSlider && maxSlider) {
            minSlider.value = 0;
            maxSlider.value = 10000;
            this.updatePriceDisplay();
        }

        // Reset sort
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.value = '';
        }

        // Update URL
        window.history.replaceState({}, '', window.location.pathname);

        // Reload products
        this.loadProducts();
    }

    updateURL(filters) {
        const params = new URLSearchParams();

        if (filters.categories) {
            filters.categories.forEach(cat => params.append('category', cat));
        }

        if (filters.brands) {
            filters.brands.forEach(brand => params.append('brand', brand));
        }

        if (filters.sort) {
            params.set('sort', filters.sort);
        }

        if (filters.search) {
            params.set('search', filters.search);
        }

        const newURL = params.toString() ? 
            `${window.location.pathname}?${params.toString()}` : 
            window.location.pathname;

        window.history.replaceState({}, '', newURL);
    }

    initProductPage() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        if (!productId) {
            this.showProductNotFound();
            return;
        }

        const product = window.store.getProduct(productId);
        if (!product) {
            this.showProductNotFound();
            return;
        }

        this.renderProductDetail(product);
        this.setupProductInteractions(product);
    }

    showProductNotFound() {
        const productDetail = document.getElementById('product-detail');
        if (productDetail) {
            productDetail.innerHTML = `
                <div class="product-not-found">
                    <h2>Product Not Found</h2>
                    <p>The product you're looking for doesn't exist or has been removed.</p>
                    <a href="shop.html" class="btn btn-primary">Browse All Products</a>
                </div>
            `;
        }
    }

    renderProductDetail(product) {
        const productDetail = document.getElementById('product-detail');
        if (!productDetail) return;

        const discount = product.compareAt ? Math.round((1 - product.price / product.compareAt) * 100) : 0;
        const isInWishlist = window.store.isInWishlist(product.id);

        productDetail.innerHTML = `
            <div class="product-gallery">
                <div class="main-image" id="main-image">
                    <img src="${product.images[0]}" alt="${product.name}" id="main-image-img">
                </div>
                ${product.images.length > 1 ? `
                    <div class="thumbnail-images">
                        ${product.images.map((image, index) => `
                            <div class="thumbnail ${index === 0 ? 'active' : ''}" data-image="${image}">
                                <img src="${image}" alt="${product.name}">
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            
            <div class="product-info">
                <div class="product-meta">
                    <div class="product-brand">${product.brand}</div>
                    <h1 class="product-name">${product.name}</h1>
                    <div class="product-rating">
                        ${window.ui.renderStars(product.rating)}
                        <span class="rating-count">(${product.reviews?.length || 0} reviews)</span>
                    </div>
                </div>
                
                <div class="product-price">
                    <span class="price-current">${window.ui.formatPrice(product.price)}</span>
                    ${product.compareAt ? `
                        <span class="price-original">${window.ui.formatPrice(product.compareAt)}</span>
                        <span class="price-discount">-${discount}%</span>
                    ` : ''}
                </div>
                
                <form class="product-form" data-product-id="${product.id}">
                    <input type="hidden" name="productId" value="${product.id}">
                    
                    <div class="quantity-selector">
                        <label for="quantity">Quantity:</label>
                        <div class="quantity-controls">
                            <button type="button" class="quantity-btn" id="quantity-decrease">-</button>
                            <input type="number" id="quantity" name="quantity" value="1" min="1" max="${product.inventory}" class="quantity-input">
                            <button type="button" class="quantity-btn" id="quantity-increase">+</button>
                        </div>
                    </div>
                    
                    <div class="product-actions">
                        <button type="submit" class="btn btn-primary add-to-cart" ${product.inventory === 0 ? 'disabled' : ''}>
                            ${product.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                        <button type="button" class="add-to-wishlist ${isInWishlist ? 'active' : ''}" data-product-id="${product.id}">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                        </button>
                    </div>
                </form>
                
                <div class="product-description">
                    ${product.description}
                </div>
                
                <div class="product-specs">
                    <h3>Specifications</h3>
                    <table class="specs-table">
                        ${Object.entries(product.attributes).map(([key, value]) => `
                            <tr>
                                <th>${key.charAt(0).toUpperCase() + key.slice(1)}</th>
                                <td>${value}</td>
                            </tr>
                        `).join('')}
                        <tr>
                            <th>SKU</th>
                            <td>${product.sku}</td>
                        </tr>
                        <tr>
                            <th>Availability</th>
                            <td>${product.inventory > 0 ? `${product.inventory} in stock` : 'Out of stock'}</td>
                        </tr>
                    </table>
                </div>
            </div>
        `;

        // Update page title and meta
        document.title = `${product.name} - ${product.brand} - Aurelius Time`;
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.content = product.description.replace(/<[^>]*>/g, '').substring(0, 160);
        }

        // Update breadcrumb
        const breadcrumbProduct = document.getElementById('breadcrumb-product');
        if (breadcrumbProduct) {
            breadcrumbProduct.textContent = product.name;
        }
    }

    setupProductInteractions(product) {
        // Image gallery
        document.querySelectorAll('.thumbnail').forEach(thumbnail => {
            thumbnail.addEventListener('click', () => {
                const image = thumbnail.dataset.image;
                const mainImg = document.getElementById('main-image-img');
                if (mainImg) {
                    mainImg.src = image;
                }
                
                document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                thumbnail.classList.add('active');
            });
        });

        // Image lightbox
        const mainImage = document.getElementById('main-image');
        if (mainImage) {
            mainImage.addEventListener('click', () => {
                this.openLightbox(product.images, 0);
            });
        }

        // Quantity controls
        const quantityInput = document.getElementById('quantity');
        const decreaseBtn = document.getElementById('quantity-decrease');
        const increaseBtn = document.getElementById('quantity-increase');

        if (quantityInput && decreaseBtn && increaseBtn) {
            decreaseBtn.addEventListener('click', () => {
                const currentValue = parseInt(quantityInput.value);
                if (currentValue > 1) {
                    quantityInput.value = currentValue - 1;
                }
            });

            increaseBtn.addEventListener('click', () => {
                const currentValue = parseInt(quantityInput.value);
                if (currentValue < product.inventory) {
                    quantityInput.value = currentValue + 1;
                }
            });
        }
    }

    openLightbox(images, currentIndex) {
        const lightbox = document.getElementById('image-lightbox');
        if (!lightbox) return;

        const lightboxImage = document.getElementById('lightbox-image');
        const lightboxCurrent = document.getElementById('lightbox-current');
        const lightboxTotal = document.getElementById('lightbox-total');

        if (lightboxImage && lightboxCurrent && lightboxTotal) {
            lightboxImage.src = images[currentIndex];
            lightboxCurrent.textContent = currentIndex + 1;
            lightboxTotal.textContent = images.length;
            
            lightbox.classList.add('active');
            
            // Setup navigation
            const prevBtn = document.querySelector('.lightbox-prev');
            const nextBtn = document.querySelector('.lightbox-next');
            
            if (prevBtn && nextBtn) {
                prevBtn.onclick = () => {
                    currentIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
                    this.updateLightbox(images, currentIndex);
                };
                
                nextBtn.onclick = () => {
                    currentIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
                    this.updateLightbox(images, currentIndex);
                };
            }
        }

        // Close lightbox
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('lightbox') || e.target.closest('.lightbox-close')) {
                lightbox.classList.remove('active');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (lightbox.classList.contains('active')) {
                if (e.key === 'Escape') {
                    lightbox.classList.remove('active');
                } else if (e.key === 'ArrowLeft') {
                    currentIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
                    this.updateLightbox(images, currentIndex);
                } else if (e.key === 'ArrowRight') {
                    currentIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
                    this.updateLightbox(images, currentIndex);
                }
            }
        });
    }

    updateLightbox(images, currentIndex) {
        const lightboxImage = document.getElementById('lightbox-image');
        const lightboxCurrent = document.getElementById('lightbox-current');
        
        if (lightboxImage && lightboxCurrent) {
            lightboxImage.src = images[currentIndex];
            lightboxCurrent.textContent = currentIndex + 1;
        }
    }

    initCartPage() {
        this.renderCartPage();
        
        if (window.store) {
            window.store.subscribe('cartUpdated', () => {
                this.renderCartPage();
            });
        }
    }

    renderCartPage() {
        const cartPage = document.getElementById('cart-page');
        if (!cartPage || !window.store) return;

        const cart = window.store.getState().cart;
        const products = window.store.getState().products;

        if (cart.length === 0) {
            cartPage.innerHTML = `
                <div class="cart-empty">
                    <div class="cart-empty-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L6 21H20"/>
                            <circle cx="9" cy="19" r="2"/>
                            <circle cx="20" cy="19" r="2"/>
                        </svg>
                    </div>
                    <h3>Your cart is empty</h3>
                    <p>Looks like you haven't added any watches to your cart yet.</p>
                    <a href="shop.html" class="btn btn-primary">Continue Shopping</a>
                </div>
            `;
            return;
        }

        const subtotal = window.store.getCartTotal();
        const shipping = subtotal > 1000 ? 0 : 25;
        const tax = subtotal * 0.08;
        const total = subtotal + shipping + tax;

        cartPage.innerHTML = `
            <div class="cart-content">
                <div class="cart-items-section">
                    ${cart.map(item => {
                        const product = products.find(p => p.id === item.productId);
                        if (!product) return '';
                        
                        const itemTotal = product.price * item.quantity;
                        
                        return `
                            <div class="cart-item" data-item-id="${item.id}">
                                <div class="cart-item-image">
                                    <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
                                </div>
                                <div class="cart-item-details">
                                    <h3 class="cart-item-title">${product.name}</h3>
                                    <p class="cart-item-brand">${product.brand}</p>
                                    <div class="cart-item-price">${window.ui.formatPrice(product.price)}</div>
                                </div>
                                <div class="cart-item-actions">
                                    <div class="quantity-controls">
                                        <button type="button" class="quantity-btn quantity-decrease">-</button>
                                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="99">
                                        <button type="button" class="quantity-btn quantity-increase">+</button>
                                    </div>
                                    <div class="cart-item-total">${window.ui.formatPrice(itemTotal)}</div>
                                    <button type="button" class="remove-item" aria-label="Remove item">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="3,6 5,6 21,6"/>
                                            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="cart-summary">
                    <h3>Order Summary</h3>
                    
                    <div class="summary-line">
                        <span>Subtotal</span>
                        <span>${window.ui.formatPrice(subtotal)}</span>
                    </div>
                    
                    <div class="summary-line">
                        <span>Shipping</span>
                        <span>${shipping === 0 ? 'Free' : window.ui.formatPrice(shipping)}</span>
                    </div>
                    
                    <div class="summary-line">
                        <span>Tax</span>
                        <span>${window.ui.formatPrice(tax)}</span>
                    </div>
                    
                    <div class="coupon-form">
                        <h4>Promo Code</h4>
                        <div class="coupon-input-group">
                            <input type="text" class="coupon-input" placeholder="Enter code">
                            <button type="button" class="apply-coupon">Apply</button>
                        </div>
                    </div>
                    
                    <div class="summary-line total">
                        <span>Total</span>
                        <span>${window.ui.formatPrice(total)}</span>
                    </div>
                    
                    <a href="checkout.html" class="btn btn-primary btn-full btn-lg">
                        Proceed to Checkout
                    </a>
                    
                    <a href="shop.html" class="btn btn-ghost btn-full">
                        Continue Shopping
                    </a>
                </div>
            </div>
        `;
    }
}

// Application Initialization
class App {
    constructor() {
        this.init();
    }

    async init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    }

    async start() {
        console.log('🕰️ Aurelius Time - Luxury Watch E-commerce Platform');
        
        // Initialize core modules
        window.store = new Store();
        window.auth = new AuthManager();
        window.cart = new CartManager();
        window.search = new SearchManager();
        window.ui = new UIManager();
        window.pageManager = new PageManager();
        
        // Wait for store to load
        await window.store.init();
        
        console.log('✅ Application initialized successfully');
        
        // Setup global error handling
        this.setupErrorHandling();
        
        // Setup mobile menu
        this.setupMobileMenu();
        
        // Hide loading
        window.ui.hideLoading();
    }

    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            
            if (window.ui) {
                window.ui.showToast(
                    'Something went wrong. Please refresh the page and try again.',
                    'error',
                    6000
                );
            }
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            
            if (window.ui) {
                window.ui.showToast(
                    'A network error occurred. Please check your connection.',
                    'error',
                    6000
                );
            }
        });
    }

    setupMobileMenu() {
        const mobileMenuButton = document.querySelector('.mobile-menu-button');
        const headerNav = document.querySelector('.header-nav');
        
        if (mobileMenuButton && headerNav) {
            mobileMenuButton.addEventListener('click', () => {
                const isOpen = mobileMenuButton.classList.toggle('active');
                headerNav.classList.toggle('active', isOpen);
                
                const spans = mobileMenuButton.querySelectorAll('span');
                spans.forEach((span, index) => {
                    if (isOpen) {
                        if (index === 0) span.style.transform = 'translateY(6px) rotate(45deg)';
                        if (index === 1) span.style.opacity = '0';
                        if (index === 2) span.style.transform = 'translateY(-6px) rotate(-45deg)';
                    } else {
                        span.style.transform = '';
                        span.style.opacity = '';
                    }
                });
                
                document.body.style.overflow = isOpen ? 'hidden' : '';
            });
        }
    }

    static formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    }

    static formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options })
            .format(new Date(date));
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

// Initialize the application
const app = new App();

// Add search results CSS
const searchCSS = `
.search-results {
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-lg);
    max-height: 400px;
    overflow-y: auto;
}

.search-results-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--color-border-light);
    background: var(--color-background-alt);
}

.search-results-header span {
    font-weight: 600;
    color: var(--color-text);
}

.view-all-results {
    color: var(--color-accent);
    font-size: var(--font-size-sm);
    font-weight: 500;
    transition: color var(--transition-fast);
}

.view-all-results:hover {
    color: var(--color-text);
}

.search-results-list {
    padding: var(--spacing-sm);
}

.search-result-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-sm);
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: background-color var(--transition-fast);
}

.search-result-item:hover,
.search-result-item.active {
    background: var(--color-background-alt);
}

.search-result-image {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    border-radius: var(--border-radius-sm);
    overflow: hidden;
    background: var(--color-background-alt);
}

.search-result-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.search-result-content {
    flex: 1;
    min-width: 0;
}

.search-result-brand {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.search-result-name {
    font-weight: 500;
    color: var(--color-text);
    margin-bottom: var(--spacing-xs);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.search-result-name mark,
.search-result-brand mark {
    background: rgba(212, 175, 55, 0.2);
    color: var(--color-accent);
    padding: 0 2px;
    border-radius: 2px;
}

.search-result-price {
    font-weight: 600;
    color: var(--color-accent);
}

.search-no-results {
    padding: var(--spacing-2xl);
    text-align: center;
}

.search-no-results-icon {
    color: var(--color-text-muted);
    margin-bottom: var(--spacing-lg);
}

.search-no-results h3 {
    margin-bottom: var(--spacing-md);
    color: var(--color-text);
}

.search-no-results p {
    color: var(--color-text-light);
    margin-bottom: var(--spacing-lg);
}

.search-suggestions {
    text-align: left;
    max-width: 300px;
    margin: 0 auto var(--spacing-lg);
}

.search-suggestions p {
    font-weight: 500;
    margin-bottom: var(--spacing-sm);
}

.search-suggestions ul {
    color: var(--color-text-light);
    font-size: var(--font-size-sm);
}

.search-suggestions li {
    list-style: disc;
    margin-left: var(--spacing-lg);
    margin-bottom: var(--spacing-xs);
}

.no-products {
    grid-column: 1 / -1;
    text-align: center;
    padding: var(--spacing-3xl);
}

.no-products h3 {
    margin-bottom: var(--spacing-md);
}

.no-products p {
    color: var(--color-text-light);
    margin-bottom: var(--spacing-xl);
}

.product-not-found {
    text-align: center;
    padding: var(--spacing-3xl);
}

.product-not-found h2 {
    margin-bottom: var(--spacing-md);
}

.product-not-found p {
    color: var(--color-text-light);
    margin-bottom: var(--spacing-xl);
}
`;

// Inject search CSS
const searchStyleSheet = document.createElement('style');
searchStyleSheet.textContent = searchCSS;
document.head.appendChild(searchStyleSheet);