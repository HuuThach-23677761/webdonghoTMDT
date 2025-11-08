document.addEventListener('DOMContentLoaded', function() {
    initializeCheckout();
});

function initializeCheckout() {
    const items = window.cartManager.getItems();

    if (items.length === 0) {
        displayEmptyCheckout();
        return;
    }

    loadOrderSummary();
    setupPaymentMethodToggle();
    loadUserInfo();
}

function displayEmptyCheckout() {
    const container = document.getElementById('checkoutContent');
    if (container) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-bag display-1 text-muted"></i>
                <h3 class="mt-4 mb-3">Giỏ hàng của bạn đang trống</h3>
                <p class="text-muted mb-4">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
                <a href="shop.html" class="btn btn-warning btn-lg">Mua sắm ngay</a>
            </div>
        `;
    }
}

function loadOrderSummary() {
    const container = document.getElementById('orderSummary');
    if (!container) return;

    const items = window.cartManager.getItems();
    const subtotal = window.cartManager.getSubtotal();
    const couponDiscount = window.cartManager.getCouponDiscount();
    const tax = window.cartManager.getTax();
    const shipping = window.cartManager.getShipping();
    const total = subtotal - couponDiscount + tax + shipping;

    container.innerHTML = items.map(item => `
        <div class="d-flex align-items-center mb-3 pb-3 border-bottom">
            <img src="${item.product.images[0]}" alt="${item.product.name}"
                 class="rounded me-3" style="width: 60px; height: 60px; object-fit: cover;">
            <div class="flex-grow-1">
                <h6 class="mb-0">${item.product.name}</h6>
                <small class="text-muted">${item.quantity} x ${window.dataManager.formatPrice(item.product.price)}</small>
            </div>
            <div class="fw-bold">${window.dataManager.formatPrice(item.product.price * item.quantity)}</div>
        </div>
    `).join('');

    document.getElementById('summarySubtotal').textContent = window.dataManager.formatPrice(subtotal);
    document.getElementById('summaryShipping').textContent = shipping === 0 ? 'Miễn phí' : window.dataManager.formatPrice(shipping);
    document.getElementById('summaryTax').textContent = window.dataManager.formatPrice(tax);
    document.getElementById('summaryTotal').textContent = window.dataManager.formatPrice(total);

    if (couponDiscount > 0) {
        document.getElementById('discountRow').style.display = 'flex';
        document.getElementById('summaryDiscount').textContent = '-' + window.dataManager.formatPrice(couponDiscount);
    }
}

function setupPaymentMethodToggle() {
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    const cardDetails = document.getElementById('cardDetails');

    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            if (this.value === 'card') {
                cardDetails.style.display = 'block';
            } else {
                cardDetails.style.display = 'none';
            }
        });
    });
}

function loadUserInfo() {
    const currentUser = window.authManager ? window.authManager.getCurrentUser() : null;

    if (currentUser) {
        const emailField = document.getElementById('email');
        if (emailField) {
            emailField.value = currentUser.email;
        }

        if (currentUser.firstName) {
            const firstNameField = document.getElementById('firstName');
            if (firstNameField) firstNameField.value = currentUser.firstName;
        }

        if (currentUser.lastName) {
            const lastNameField = document.getElementById('lastName');
            if (lastNameField) lastNameField.value = currentUser.lastName;
        }

        if (currentUser.phone) {
            const phoneField = document.getElementById('phone');
            if (phoneField) phoneField.value = currentUser.phone;
        }
    }
}

function placeOrder() {
    const form = document.getElementById('checkoutForm');
    const agreeTerms = document.getElementById('agreeTerms');

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    if (!agreeTerms.checked) {
        showToast('Vui lòng đồng ý với điều khoản dịch vụ', 'error');
        return;
    }

    const orderData = collectOrderData();

    if (!orderData) {
        showToast('Vui lòng điền đầy đủ thông tin', 'error');
        return;
    }

    processOrder(orderData);
}

function collectOrderData() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value.trim();
    const district = document.getElementById('district').value.trim();
    const notes = document.getElementById('notes').value.trim();
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

    if (!firstName || !lastName || !email || !phone || !address || !city || !district) {
        return null;
    }

    const items = window.cartManager.getItems();
    const subtotal = window.cartManager.getSubtotal();
    const couponDiscount = window.cartManager.getCouponDiscount();
    const tax = window.cartManager.getTax();
    const shipping = window.cartManager.getShipping();
    const total = subtotal - couponDiscount + tax + shipping;
    const appliedCoupon = window.cartManager.getAppliedCoupon();

    return {
        id: generateOrderId(),
        customer: {
            firstName,
            lastName,
            email,
            phone
        },
        shipping: {
            address,
            city,
            district,
            notes
        },
        items: items.map(item => ({
            productId: item.product.id,
            productName: item.product.name,
            productImage: item.product.images[0],
            quantity: item.quantity,
            price: item.product.price,
            total: item.product.price * item.quantity
        })),
        payment: {
            method: paymentMethod,
            subtotal,
            discount: couponDiscount,
            tax,
            shipping,
            total
        },
        coupon: appliedCoupon ? appliedCoupon.code : null,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
}

function generateOrderId() {
    return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function processOrder(orderData) {
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang xử lý...';

    setTimeout(() => {
        saveOrder(orderData);

        window.cartManager.clearCart();

        btn.disabled = false;
        btn.innerHTML = originalText;

        showOrderSuccess(orderData);
    }, 2000);
}

function saveOrder(orderData) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(orders));

    const currentUser = window.authManager ? window.authManager.getCurrentUser() : null;
    if (currentUser) {
        const userOrders = JSON.parse(localStorage.getItem(`orders_${currentUser.email}`) || '[]');
        userOrders.push(orderData);
        localStorage.setItem(`orders_${currentUser.email}`, JSON.stringify(userOrders));
    }
}

function showOrderSuccess(orderData) {
    const container = document.getElementById('checkoutContent');
    if (container) {
        container.innerHTML = `
            <div class="text-center py-5">
                <div class="mb-4">
                    <i class="bi bi-check-circle-fill text-success" style="font-size: 100px;"></i>
                </div>
                <h2 class="display-5 fw-bold mb-3">Đặt hàng thành công!</h2>
                <p class="lead text-muted mb-4">
                    Cảm ơn bạn đã đặt hàng tại Aurelius Time.<br>
                    Mã đơn hàng của bạn là: <strong class="text-warning">${orderData.id}</strong>
                </p>
                <div class="card border-0 shadow-sm mx-auto mb-4" style="max-width: 500px;">
                    <div class="card-body text-start">
                        <h5 class="card-title mb-3">Thông tin đơn hàng</h5>
                        <div class="mb-2">
                            <strong>Tên:</strong> ${orderData.customer.firstName} ${orderData.customer.lastName}
                        </div>
                        <div class="mb-2">
                            <strong>Email:</strong> ${orderData.customer.email}
                        </div>
                        <div class="mb-2">
                            <strong>Số điện thoại:</strong> ${orderData.customer.phone}
                        </div>
                        <div class="mb-2">
                            <strong>Địa chỉ:</strong> ${orderData.shipping.address}, ${orderData.shipping.district}, ${orderData.shipping.city}
                        </div>
                        <div class="mb-2">
                            <strong>Phương thức thanh toán:</strong> ${getPaymentMethodName(orderData.payment.method)}
                        </div>
                        <hr>
                        <div class="d-flex justify-content-between">
                            <strong>Tổng cộng:</strong>
                            <strong class="text-warning fs-5">${window.dataManager.formatPrice(orderData.payment.total)}</strong>
                        </div>
                    </div>
                </div>
                <p class="text-muted mb-4">
                    Chúng tôi đã gửi email xác nhận đến <strong>${orderData.customer.email}</strong>.<br>
                    Đơn hàng sẽ được xử lý và giao trong vòng 3-5 ngày làm việc.
                </p>
                <div class="d-flex gap-3 justify-content-center">
                    <a href="orders.html" class="btn btn-warning btn-lg">Xem đơn hàng</a>
                    <a href="shop.html" class="btn btn-outline-secondary btn-lg">Tiếp tục mua sắm</a>
                </div>
            </div>
        `;

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function getPaymentMethodName(method) {
    const methods = {
        'cod': 'Thanh toán khi nhận hàng',
        'bank': 'Chuyển khoản ngân hàng',
        'card': 'Thẻ tín dụng/Ghi nợ'
    };
    return methods[method] || method;
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
