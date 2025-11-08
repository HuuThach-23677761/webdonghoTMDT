// JavaScript chính cho Aurelius Time
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo các thành phần
    initializeNavigation();
    initializeHomePage();
    initializeWishlist();
    
    // Cập nhật UI dựa trên trạng thái xác thực
    if (window.authManager) {
        window.authManager.updateUI();
    }
});

function initializeNavigation() {
    // Toggle menu mobile
    const mobileMenuButton = document.querySelector('.navbar-toggler');
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function() {
            const navbarCollapse = document.querySelector('.navbar-collapse');
            navbarCollapse.classList.toggle('show');
        });
    }

    // Hiệu ứng hover dropdown
    const dropdowns = document.querySelectorAll('.nav-item.dropdown');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('mouseenter', function() {
            const dropdownMenu = this.querySelector('.dropdown-menu');
            if (dropdownMenu) {
                dropdownMenu.classList.add('show');
            }
        });

        dropdown.addEventListener('mouseleave', function() {
            const dropdownMenu = this.querySelector('.dropdown-menu');
            if (dropdownMenu) {
                dropdownMenu.classList.remove('show');
            }
        });
    });

    // Hiệu ứng cuộn navbar
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });
}

function initializeHomePage() {
    // Tải sản phẩm mới trên trang chủ
    const newArrivalsContainer = document.getElementById('newArrivals');
    if (newArrivalsContainer) {
        loadNewArrivals();
    }

    // Form đăng ký bản tin
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            // Mô phỏng đăng ký bản tin
            showToast('Cảm ơn bạn đã đăng ký bản tin của chúng tôi!', 'success');
            this.reset();
        });
    }
}

function loadNewArrivals() {
    const products = window.dataManager.getProducts();
    const newProducts = products.filter(p => p.new || p.featured).slice(0, 4);
    
    const container = document.getElementById('newArrivals');
    if (container) {
        container.innerHTML = newProducts.map(product => createProductCard(product)).join('');
    }
}

function createProductCard(product) {
    const discountPercentage = product.compareAt ? 
        Math.round(((product.compareAt - product.price) / product.compareAt) * 100) : 0;

    return `
        <div class="col-md-6 col-lg-3">
            <div class="card product-card border-0 shadow-sm h-100">
                <div class="position-relative">
                    <a href="product.html?id=${product.id}">
                        <img src="${product.images[0]}" class="card-img-top" alt="${product.name}">
                    </a>
                    ${product.new ? '<span class="badge bg-warning text-dark position-absolute top-0 start-0 m-2">Mới</span>' : ''}
                    ${discountPercentage > 0 ? `<span class="badge bg-danger position-absolute top-0 end-0 m-2">-${discountPercentage}%</span>` : ''}
                    <div class="product-actions position-absolute top-0 end-0 m-2">
                        <button class="btn btn-sm btn-light mb-1" onclick="toggleWishlist('${product.id}')" title="Thêm vào yêu thích">
                            <i class="bi bi-heart"></i>
                        </button>
                        <button class="btn btn-sm btn-light" onclick="addToCart('${product.id}')" title="Thêm vào giỏ hàng">
                            <i class="bi bi-bag-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <small class="text-muted text-uppercase">${product.brand}</small>
                    <h6 class="card-title">
                        <a href="product.html?id=${product.slug}" class="text-decoration-none text-dark">${product.name}</a>
                    </h6>
                    ${product.rating ? `
                        <div class="rating-stars mb-2">
                            ${generateStars(product.rating)}
                            <small class="text-muted ms-1">(${product.reviews.length})</small>
                        </div>
                    ` : ''}
                    <div class="d-flex align-items-center justify-content-between">
                        <div>
                            <span class="price-current fw-bold">${window.dataManager.formatPrice(product.price)}</span>
                            ${product.compareAt ? `<span class="price-original text-muted ms-2">${window.dataManager.formatPrice(product.compareAt)}</span>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';

    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="bi bi-star-fill text-warning"></i>';
    }

    if (hasHalfStar) {
        stars += '<i class="bi bi-star-half text-warning"></i>';
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="bi bi-star text-muted"></i>';
    }

    return stars;
}

// Quản lý Wishlist
function initializeWishlist() {
    updateWishlistUI();
}

function toggleWishlist(productId) {
    if (!window.authManager.isLoggedIn()) {
        showToast('Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích', 'warning');
        return;
    }

    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const index = wishlist.indexOf(productId);

    if (index > -1) {
        wishlist.splice(index, 1);
        showToast('Đã xóa khỏi danh sách yêu thích', 'info');
    } else {
        wishlist.push(productId);
        showToast('Đã thêm vào danh sách yêu thích', 'success');
    }

    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistUI();
}

function updateWishlistUI() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const wishlistCount = document.getElementById('wishlistCount');
    
    if (wishlistCount) {
        if (wishlist.length > 0) {
            wishlistCount.textContent = wishlist.length;
            wishlistCount.style.display = 'inline';
        } else {
            wishlistCount.style.display = 'none';
        }
    }

    // Cập nhật trạng thái nút wishlist
    const wishlistButtons = document.querySelectorAll('[onclick*="toggleWishlist"]');
    wishlistButtons.forEach(button => {
        const productId = button.getAttribute('onclick').match(/'([^']+)'/)[1];
        const icon = button.querySelector('i');
        
        if (wishlist.includes(productId)) {
            icon.className = 'bi bi-heart-fill text-danger';
        } else {
            icon.className = 'bi bi-heart';
        }
    });
}

// Thông báo Toast
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

    // Tự động xóa sau 4 giây
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

// Hàm tiện ích
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Cuộn mượt cho các liên kết anchor
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Trạng thái loading
function showLoading(element) {
    if (element) {
        element.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-warning" role="status">
                    <span class="visually-hidden">Đang tải...</span>
                </div>
                <p class="mt-3 text-muted">Đang tải...</p>
            </div>
        `;
    }
}

function hideLoading() {
    const loadingElements = document.querySelectorAll('.spinner-border');
    loadingElements.forEach(element => {
        element.closest('.text-center').remove();
    });
}