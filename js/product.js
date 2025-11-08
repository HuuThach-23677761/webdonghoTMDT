// Product Detail Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeProductPage();
});

function initializeProductPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        loadProduct(productId);
    } else {
        showProductNotFound();
    }
}

function loadProduct(productId) {
    const product = window.dataManager.getProduct(productId);
    
    if (!product) {
        showProductNotFound();
        return;
    }
    
    displayProduct(product);
    updatePageMeta(product);
    loadRelatedProducts(product);
}

function displayProduct(product) {
    const container = document.getElementById('productDetail');
    if (!container) return;
    
    const discountPercentage = product.compareAt ? 
        Math.round(((product.compareAt - product.price) / product.compareAt) * 100) : 0;
    
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const isInWishlist = wishlist.includes(product.id);

    container.innerHTML = `
        <div class="row g-5">
            <!-- Product Images -->
            <div class="col-md-6">
                <div class="product-gallery">
                    <div class="main-image mb-3">
                        <img id="mainImage" src="${product.images[0]}" alt="${product.name}" 
                             class="img-fluid w-100 rounded" style="height: 500px; object-fit: cover; cursor: zoom-in;"
                             onclick="openImageModal('${product.images[0]}')">
                    </div>
                    ${product.images.length > 1 ? `
                        <div class="product-thumbnails d-flex gap-2">
                            ${product.images.map((image, index) => `
                                <img src="${image}" alt="${product.name}" 
                                     class="product-thumbnail ${index === 0 ? 'active' : ''}" 
                                     style="width: 80px; height: 80px; object-fit: cover; cursor: pointer; border-radius: 5px; border: 2px solid ${index === 0 ? '#ffc107' : 'transparent'};"
                                     onclick="changeMainImage('${image}', this)">
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Product Info -->
            <div class="col-md-6">
                <div class="product-info">
                    <small class="text-muted text-uppercase">${product.brand}</small>
                    <h1 class="display-6 fw-bold mb-3">${product.name}</h1>
                    
                    ${product.rating ? `
                        <div class="rating-stars mb-3">
                            ${generateStars(product.rating)}
                            <span class="ms-2 text-muted">(${product.reviews.length} reviews)</span>
                        </div>
                    ` : ''}
                    
                    <div class="price-section mb-4">
                        <span class="price-current display-6 fw-bold text-warning">${window.dataManager.formatPrice(product.price)}</span>
                        ${product.compareAt ? `
                            <span class="price-original fs-4 text-muted text-decoration-line-through ms-3">${window.dataManager.formatPrice(product.compareAt)}</span>
                            <span class="badge bg-danger ms-2">Save ${discountPercentage}%</span>
                        ` : ''}
                    </div>
                    
                    <div class="product-description mb-4">
                        ${product.description}
                    </div>
                    
                    <div class="product-form mb-4">
                        <div class="row g-3 align-items-end">
                            <div class="col-auto">
                                <label for="quantity" class="form-label">Quantity</label>
                                <div class="quantity-controls d-flex align-items-center border rounded">
                                    <button type="button" class="btn btn-sm" onclick="updateQuantity(-1)">-</button>
                                    <input type="number" id="quantity" class="form-control border-0 text-center" value="1" min="1" max="${product.inventory}" style="width: 60px;">
                                    <button type="button" class="btn btn-sm" onclick="updateQuantity(1)">+</button>
                                </div>
                            </div>
                            <div class="col">
                                <button class="btn btn-warning btn-lg me-2" onclick="addProductToCart('${product.id}')">
                                    <i class="bi bi-bag-plus me-2"></i>Add to Cart
                                </button>
                                <button class="btn btn-outline-secondary btn-lg" onclick="toggleWishlist('${product.id}')" title="Add to Wishlist">
                                    <i class="bi bi-heart${isInWishlist ? '-fill text-danger' : ''}"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="mt-3">
                            <small class="text-muted">
                                <i class="bi bi-box-seam me-1"></i>
                                ${product.inventory > 0 ? `${product.inventory} in stock` : 'Out of stock'}
                            </small>
                        </div>
                    </div>
                    
                    <!-- Product Specifications -->
                    <div class="product-specs">
                        <h5 class="mb-3">Specifications</h5>
                        <table class="table table-borderless">
                            ${Object.entries(product.attributes).map(([key, value]) => `
                                <tr>
                                    <th style="width: 40%;">${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</th>
                                    <td>${value}</td>
                                </tr>
                            `).join('')}
                            <tr>
                                <th>SKU</th>
                                <td>${product.sku}</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Product Reviews -->
        ${product.reviews.length > 0 ? `
            <div class="row mt-5">
                <div class="col-12">
                    <h3 class="mb-4">Customer Reviews</h3>
                    <div class="reviews-section">
                        ${product.reviews.map(review => `
                            <div class="review-item border-bottom pb-3 mb-3">
                                <div class="d-flex justify-content-between align-items-start mb-2">
                                    <div>
                                        <strong>${review.userName}</strong>
                                        ${review.verified ? '<span class="badge bg-success ms-2">Verified Purchase</span>' : ''}
                                    </div>
                                    <small class="text-muted">${window.dataManager.formatDate(review.date)}</small>
                                </div>
                                <div class="rating-stars mb-2">
                                    ${generateStars(review.stars)}
                                </div>
                                <p class="mb-0">${review.text}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        ` : ''}
        
        <!-- Related Products -->
        <div class="row mt-5">
            <div class="col-12">
                <h3 class="mb-4">Related Products</h3>
                <div id="relatedProducts" class="row g-4">
                    <!-- Related products will be loaded here -->
                </div>
            </div>
        </div>
    `;
}

function updatePageMeta(product) {
    // Update page title
    document.title = `${product.name} - Aurelius Time`;
    
    // Update meta description
    const metaDescription = document.getElementById('productDescription');
    if (metaDescription) {
        metaDescription.content = product.description.replace(/<[^>]*>/g, '').substring(0, 160);
    }
}

function loadRelatedProducts(product) {
    const allProducts = window.dataManager.getProducts();
    const relatedProducts = allProducts
        .filter(p => p.id !== product.id && (
            p.brand === product.brand || 
            p.categories.some(cat => product.categories.includes(cat))
        ))
        .slice(0, 4);
    
    const container = document.getElementById('relatedProducts');
    if (container && relatedProducts.length > 0) {
        container.innerHTML = relatedProducts.map(product => createRelatedProductCard(product)).join('');
    }
}

function createRelatedProductCard(product) {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const isInWishlist = wishlist.includes(product.id);

    return `
    <div class="col-md-6 col-lg-3">
    <div class="card product-card border-0 shadow-sm h-100">
        <div class="position-relative">
            <a href="product.html?id=${product.slug}">
                <img src="${product.images[0]}" class="card-img-top" alt="${product.name}" 
                     style="height: 200px; object-fit: cover;">
            </a>
            <div class="product-actions position-absolute top-0 end-0 m-2">
                <button class="btn btn-sm btn-light mb-1" onclick="toggleWishlist('${product.id}')" title="Add to Wishlist">
                    <i class="bi bi-heart${isInWishlist ? '-fill text-danger' : ''}"></i>
                </button>
                <button class="btn btn-sm btn-light" onclick="addToCart('${product.id}')" title="Add to Cart">
                    <i class="bi bi-bag-plus"></i>
                </button>
            </div>
        </div>
        <div class="card-body">
            <small class="text-muted text-uppercase">${product.brand}</small>
            <h6 class="card-title">
                <a href="product.html?id=${product.slug}" class="text-decoration-none text-dark">${product.name}</a>
            </h6>
            <div class="price-current fw-bold">${window.dataManager.formatPrice(product.price)}</div>
        </div>
    </div>
</div>

    `;
}

function changeMainImage(imageSrc, thumbnail) {
    const mainImage = document.getElementById('mainImage');
    if (mainImage) {
        mainImage.src = imageSrc;
    }
    
    // Update thumbnail active state
    const thumbnails = document.querySelectorAll('.product-thumbnail');
    thumbnails.forEach(thumb => {
        thumb.classList.remove('active');
        thumb.style.borderColor = 'transparent';
    });
    
    thumbnail.classList.add('active');
    thumbnail.style.borderColor = '#ffc107';
}

function openImageModal(imageSrc) {
    const modalImage = document.getElementById('modalImage');
    if (modalImage) {
        modalImage.src = imageSrc;
        const modal = new bootstrap.Modal(document.getElementById('imageModal'));
        modal.show();
    }
}

function updateQuantity(change) {
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        const currentValue = parseInt(quantityInput.value);
        const newValue = currentValue + change;
        const maxValue = parseInt(quantityInput.max);
        
        if (newValue >= 1 && newValue <= maxValue) {
            quantityInput.value = newValue;
        }
    }
}

function addProductToCart(productId) {
    const quantityInput = document.getElementById('quantity');
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
    
    window.cartManager.addItem(productId, quantity);
}

function showProductNotFound() {
    const container = document.getElementById('productDetail');
    if (container) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-exclamation-triangle display-1 text-muted"></i>
                <h2 class="mt-3">Product Not Found</h2>
                <p class="text-muted">The product you're looking for doesn't exist or has been removed.</p>
                <a href="shop.html" class="btn btn-primary">Browse Products</a>
            </div>
        `;
    }
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