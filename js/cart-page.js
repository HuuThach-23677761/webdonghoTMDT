// Cart Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeCartPage();
});

function initializeCartPage() {
    loadCartPage();
    initializeCouponForm();
}

function loadCartPage() {
    const container = document.getElementById('cartPage');
    if (!container) return;
    
    const items = window.cartManager.getItems();
    
    if (items.length === 0) {
        displayEmptyCart(container);
    } else {
        displayCartContent(container, items);
    }
}

function displayEmptyCart(container) {
    container.innerHTML = `
        <div class="text-center py-5">
            <i class="bi bi-bag display-1 text-muted"></i>
            <h3 class="mt-4 mb-3">Your cart is empty</h3>
            <p class="text-muted mb-4">Looks like you haven't added any items to your cart yet.</p>
            <a href="shop.html" class="btn btn-warning btn-lg">Start Shopping</a>
        </div>
    `;
}

function displayCartContent(container, items) {
    const appliedCoupon = window.cartManager.getAppliedCoupon();
    const subtotal = window.cartManager.getSubtotal();
    const couponDiscount = window.cartManager.getCouponDiscount();
    const tax = window.cartManager.getTax();
    const shipping = window.cartManager.getShipping();
    const total = subtotal - couponDiscount + tax + shipping;

    container.innerHTML = `
        <div class="row g-5">
            <!-- Cart Items -->
            <div class="col-lg-8">
                <div class="cart-items">
                    ${items.map(item => createCartItemHTML(item)).join('')}
                </div>
            </div>
            
            <!-- Cart Summary -->
            <div class="col-lg-4">
                <div class="card border-0 shadow-sm">
                    <div class="card-header bg-light">
                        <h5 class="mb-0">Order Summary</h5>
                    </div>
                    <div class="card-body">
                        <div class="d-flex justify-content-between mb-2">
                            <span>Subtotal</span>
                            <span>${window.dataManager.formatPrice(subtotal)}</span>
                        </div>
                        
                        ${appliedCoupon ? `
                            <div class="d-flex justify-content-between mb-2 text-success">
                                <span>Discount (${appliedCoupon.code})</span>
                                <span>-${window.dataManager.formatPrice(couponDiscount)}</span>
                            </div>
                        ` : ''}
                        
                        <div class="d-flex justify-content-between mb-2">
                            <span>Shipping</span>
                            <span>${shipping === 0 ? 'Free' : window.dataManager.formatPrice(shipping)}</span>
                        </div>
                        
                        <div class="d-flex justify-content-between mb-2">
                            <span>Tax</span>
                            <span>${window.dataManager.formatPrice(tax)}</span>
                        </div>
                        
                        <hr>
                        
                        <div class="d-flex justify-content-between mb-4">
                            <strong>Total</strong>
                            <strong class="text-warning">${window.dataManager.formatPrice(total)}</strong>
                        </div>
                        
                        <!-- Coupon Form -->
                        <div class="coupon-section mb-4">
                            <h6>Have a coupon?</h6>
                            ${appliedCoupon ? `
                                <div class="alert alert-success d-flex justify-content-between align-items-center">
                                    <span><strong>${appliedCoupon.code}</strong> applied</span>
                                    <button class="btn btn-sm btn-outline-success" onclick="removeCoupon()">Remove</button>
                                </div>
                            ` : `
                                <form id="couponForm" class="d-flex gap-2">
                                    <input type="text" class="form-control" id="couponCode" placeholder="Enter coupon code">
                                    <button type="submit" class="btn btn-outline-secondary">Apply</button>
                                </form>
                                <div id="couponError" class="text-danger mt-2" style="display: none;"></div>
                            `}
                        </div>
                        
                        <div class="d-grid gap-2">
                            <a href="checkout.html" class="btn btn-warning btn-lg">Proceed to Checkout</a>
                            <a href="shop.html" class="btn btn-outline-secondary">Continue Shopping</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createCartItemHTML(item) {
    return `
        <div class="cart-item border rounded p-4 mb-3">
            <div class="row g-3 align-items-center">
                <div class="col-md-2">
                    <img src="${item.product.images[0]}" alt="${item.product.name}" 
                         class="img-fluid rounded" style="height: 100px; object-fit: cover;">
                </div>
                <div class="col-md-4">
                    <h6 class="mb-1">
                        <a href="product.html?id=${item.product.slug}" class="text-decoration-none text-dark">
                            ${item.product.name}
                        </a>
                    </h6>
                    <small class="text-muted text-uppercase">${item.product.brand}</small>
                    <div class="mt-2">
                        <span class="fw-bold">${window.dataManager.formatPrice(item.product.price)}</span>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="quantity-controls d-flex align-items-center justify-content-center border rounded">
                        <button class="btn btn-sm" onclick="updateCartItemQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <input type="number" class="form-control border-0 text-center" value="${item.quantity}" 
                               min="1" max="${item.product.inventory}" style="width: 60px;" readonly>
                        <button class="btn btn-sm" onclick="updateCartItemQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <div class="col-md-2 text-center">
                    <div class="fw-bold">${window.dataManager.formatPrice(item.product.price * item.quantity)}</div>
                </div>
                <div class="col-md-1 text-center">
                    <button class="btn btn-sm btn-outline-danger" onclick="removeCartItem('${item.id}')" title="Remove item">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function initializeCouponForm() {
    // Event delegation for coupon form
    document.addEventListener('submit', function(e) {
        if (e.target.id === 'couponForm') {
            e.preventDefault();
            applyCoupon();
        }
    });
}

function updateCartItemQuantity(itemId, newQuantity) {
    window.cartManager.updateQuantity(itemId, newQuantity);
    loadCartPage(); // Reload the page to reflect changes
}

function removeCartItem(itemId) {
    if (confirm('Are you sure you want to remove this item from your cart?')) {
        window.cartManager.removeItem(itemId);
        loadCartPage(); // Reload the page to reflect changes
    }
}

function applyCoupon() {
    const couponCodeInput = document.getElementById('couponCode');
    const couponError = document.getElementById('couponError');
    
    if (!couponCodeInput || !couponError) return;
    
    const couponCode = couponCodeInput.value.trim().toUpperCase();
    
    if (!couponCode) {
        showCouponError('Please enter a coupon code');
        return;
    }
    
    try {
        const coupon = window.cartManager.applyCoupon(couponCode);
        showToast(`Coupon "${coupon.code}" applied successfully!`, 'success');
        loadCartPage(); // Reload to show applied coupon
    } catch (error) {
        showCouponError(error.message);
    }
}

function removeCoupon() {
    window.cartManager.removeCoupon();
    showToast('Coupon removed', 'info');
    loadCartPage(); // Reload to hide coupon
}

function showCouponError(message) {
    const couponError = document.getElementById('couponError');
    if (couponError) {
        couponError.textContent = message;
        couponError.style.display = 'block';
        
        // Hide error after 5 seconds
        setTimeout(() => {
            couponError.style.display = 'none';
        }, 5000);
    }
}

function showToast(message, type = 'info') {
    const toastContainer = document.querySelector('.toast-container') || createToastContainer();
    
    const iconMap = {
        success: 'bi-check-circle-fill text-success',
        error: 'bi-x-circle-fill text-danger',
        warning: 'bi-exclamation-triangle-fill text-warning',
        info: 'bi-info-circle-fill text-info'
    };

    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="toast-header">
            <i class="bi ${iconMap[type]} me-2"></i>
            <strong class="me-auto">${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;

    toastContainer.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.remove();
    }, 4000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(container);
    return container;
}