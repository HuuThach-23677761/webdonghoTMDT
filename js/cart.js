// Quản lý giỏ hàng
class CartManager {
    constructor() {
        this.cart = [];
        this.init();
    }

    init() {
        // Tải giỏ hàng từ localStorage
        const cartData = localStorage.getItem('cart');
        if (cartData) {
            this.cart = JSON.parse(cartData);
        }
        this.updateUI();
    }

    addItem(productId, quantity = 1, variant = null) {
        const product = window.dataManager.getProduct(productId);
        if (!product) {
            throw new Error('Không tìm thấy sản phẩm');
        }

        // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
        const existingItem = this.cart.find(item => 
            item.productId === productId && 
            JSON.stringify(item.variant) === JSON.stringify(variant)
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                id: 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                productId,
                quantity,
                variant,
                addedAt: new Date().toISOString()
            });
        }

        this.saveCart();
        this.updateUI();
        this.showNotification(`${product.name} đã được thêm vào giỏ hàng`);
    }

    removeItem(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.saveCart();
        this.updateUI();
    }

    updateQuantity(itemId, quantity) {
        const item = this.cart.find(item => item.id === itemId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(itemId);
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.updateUI();
            }
        }
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateUI();
    }

    getItems() {
        return this.cart.map(item => {
            const product = window.dataManager.getProduct(item.productId);
            return {
                ...item,
                product
            };
        });
    }

    getItemCount() {
        return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    getSubtotal() {
        return this.cart.reduce((sum, item) => {
            const product = window.dataManager.getProduct(item.productId);
            return sum + (product ? product.price * item.quantity : 0);
        }, 0);
    }

    getTax() {
        const settings = window.dataManager.getSettings();
        const subtotal = this.getSubtotal();
        return settings.tax && settings.tax.enabled ? subtotal * settings.tax.rate : 0;
    }

    getShipping() {
        const settings = window.dataManager.getSettings();
        const subtotal = this.getSubtotal();
        
        if (subtotal >= settings.shipping.freeShippingThreshold) {
            return 0;
        }
        
        return settings.shipping.standardRate;
    }

    getTotal() {
        return this.getSubtotal() + this.getTax() + this.getShipping();
    }

    applyCoupon(couponCode) {
        const coupon = window.dataManager.getCoupon(couponCode);
        if (!coupon) {
            throw new Error('Mã giảm giá không hợp lệ');
        }

        const subtotal = this.getSubtotal();
        if (coupon.minSpend && subtotal < coupon.minSpend) {
            throw new Error(`Yêu cầu chi tiêu tối thiểu ${window.dataManager.formatPrice(coupon.minSpend)}`);
        }

        // Lưu mã giảm giá đã áp dụng
        localStorage.setItem('appliedCoupon', JSON.stringify(coupon));
        this.updateUI();
        
        return coupon;
    }

    removeCoupon() {
        localStorage.removeItem('appliedCoupon');
        this.updateUI();
    }

    getAppliedCoupon() {
        const couponData = localStorage.getItem('appliedCoupon');
        return couponData ? JSON.parse(couponData) : null;
    }

    getCouponDiscount() {
        const coupon = this.getAppliedCoupon();
        if (!coupon) return 0;

        const subtotal = this.getSubtotal();
        let discount = 0;

        if (coupon.type === 'percentage') {
            discount = subtotal * (coupon.value / 100);
            if (coupon.maxDiscount) {
                discount = Math.min(discount, coupon.maxDiscount);
            }
        } else if (coupon.type === 'fixed') {
            discount = coupon.value;
        }

        return Math.min(discount, subtotal);
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    updateUI() {
        // Cập nhật số lượng giỏ hàng trong navigation
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = this.getItemCount();
            if (totalItems > 0) {
                cartCount.textContent = totalItems;
                cartCount.style.display = 'inline';
            } else {
                cartCount.style.display = 'none';
            }
        }

        // Cập nhật drawer giỏ hàng
        this.updateCartDrawer();
    }

    updateCartDrawer() {
        const cartItems = document.getElementById('cartItems');
        const cartFooter = document.getElementById('cartFooter');
        const cartTotal = document.getElementById('cartTotal');

        if (!cartItems) return;

        const items = this.getItems();

        if (items.length === 0) {
            cartItems.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-bag text-muted display-4"></i>
                    <p class="text-muted mt-3">Giỏ hàng của bạn đang trống</p>
                </div>
            `;
            if (cartFooter) cartFooter.style.display = 'none';
        } else {
            cartItems.innerHTML = items.map(item => `
                <div class="cart-item d-flex align-items-center mb-3">
                    <img src="${item.product.images[0]}" alt="${item.product.name}" 
                         class="cart-item-image me-3" style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">
                    <div class="flex-grow-1">
                        <h6 class="mb-1">${item.product.name}</h6>
                        <small class="text-muted">${item.product.brand}</small>
                        <div class="d-flex align-items-center mt-1">
                            <button class="btn btn-sm btn-outline-secondary" onclick="cartManager.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                            <span class="mx-2">${item.quantity}</span>
                            <button class="btn btn-sm btn-outline-secondary" onclick="cartManager.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                        </div>
                    </div>
                    <div class="text-end">
                        <div class="fw-bold">${window.dataManager.formatPrice(item.product.price * item.quantity)}</div>
                        <button class="btn btn-sm btn-link text-danger p-0" onclick="cartManager.removeItem('${item.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');

            if (cartFooter) cartFooter.style.display = 'block';
            if (cartTotal) cartTotal.textContent = window.dataManager.formatPrice(this.getTotal());
        }
    }

    showNotification(message) {
        // Tạo thông báo toast
        const toastContainer = document.querySelector('.toast-container') || this.createToastContainer();
        
        const toast = document.createElement('div');
        toast.className = 'toast show';
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="toast-header">
                <i class="bi bi-check-circle-fill text-success me-2"></i>
                <strong class="me-auto">Thành công</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        `;

        toastContainer.appendChild(toast);

        // Tự động xóa sau 3 giây
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(container);
        return container;
    }
}

// Hàm toàn cục cho các thao tác giỏ hàng
function addToCart(productId, quantity = 1) {
    window.cartManager.addItem(productId, quantity);
}

function removeFromCart(itemId) {
    window.cartManager.removeItem(itemId);
}

function updateCartQuantity(itemId, quantity) {
    window.cartManager.updateQuantity(itemId, quantity);
}

// Khởi tạo trình quản lý giỏ hàng toàn cục
window.cartManager = new CartManager();