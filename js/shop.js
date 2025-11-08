// Shop Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeShopPage();
});

function initializeShopPage() {
    // Initialize filters
    initializeFilters();
    
    // Initialize sorting
    initializeSorting();
    
    // Initialize view toggle
    initializeViewToggle();
    
    // Load products
    loadProducts();
    
    // Apply URL parameters
    applyURLFilters();
}

function initializeFilters() {
    // Category filters
    const categoryFilters = document.querySelectorAll('input[name="category"]');
    categoryFilters.forEach(filter => {
        filter.addEventListener('change', applyFilters);
    });

    // Brand filters
    const brandFilters = document.querySelectorAll('input[name="brand"]');
    brandFilters.forEach(filter => {
        filter.addEventListener('change', applyFilters);
    });

    // Price range filters
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    
    if (priceMin) priceMin.addEventListener('input', debounce(applyFilters, 500));
    if (priceMax) priceMax.addEventListener('input', debounce(applyFilters, 500));

    // Clear filters button
    const clearFiltersBtn = document.querySelector('[onclick="clearFilters()"]');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }
}

function initializeSorting() {
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', applyFilters);
    }
}

function initializeViewToggle() {
    const gridView = document.getElementById('gridView');
    const listView = document.getElementById('listView');
    
    if (gridView) {
        gridView.addEventListener('click', () => {
            setView('grid');
        });
    }
    
    if (listView) {
        listView.addEventListener('click', () => {
            setView('list');
        });
    }
}

function setView(viewType) {
    const gridView = document.getElementById('gridView');
    const listView = document.getElementById('listView');
    const productsContainer = document.getElementById('productsContainer');
    
    if (viewType === 'grid') {
        gridView.classList.add('active');
        listView.classList.remove('active');
        productsContainer.className = 'row g-4';
    } else {
        listView.classList.add('active');
        gridView.classList.remove('active');
        productsContainer.className = 'row g-3';
    }
    
    // Reload products with new view
    loadProducts();
}

function applyURLFilters() {
    const params = window.searchManager.getSearchParams();

    // Apply category filter
    if (params.category) {
        // Map URL category params to Vietnamese category values
        const categoryMap = {
            'men': 'Nam',
            'women': 'Nữ',
            'automatic': 'Cơ tự động',
            'chronograph': 'Chronograph'
        };

        const categoryValue = categoryMap[params.category.toLowerCase()] || params.category;
        const categoryCheckbox = document.getElementById(`cat${params.category.charAt(0).toUpperCase() + params.category.slice(1)}`);
        if (categoryCheckbox) {
            categoryCheckbox.checked = true;
        }
    }

    // Apply brand filter
    if (params.brand) {
        const brandCheckbox = document.getElementById(`brand${params.brand.charAt(0).toUpperCase() + params.brand.slice(1)}`);
        if (brandCheckbox) {
            brandCheckbox.checked = true;
        }
    }
    
    // Apply price filters
    if (params.minPrice) {
        const priceMin = document.getElementById('priceMin');
        if (priceMin) priceMin.value = params.minPrice;
    }
    
    if (params.maxPrice) {
        const priceMax = document.getElementById('priceMax');
        if (priceMax) priceMax.value = params.maxPrice;
    }
    
    // Apply sort
    if (params.sort) {
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) sortSelect.value = params.sort;
    }
    
    // Apply search if from URL
    if (params.search) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = params.search;
    }
}

function applyFilters() {
    const filters = getActiveFilters();
    const products = window.dataManager.searchProducts(filters.search, filters);
    
    displayProducts(products);
    updateResultsCount(products.length);
    updateURL(filters);
}

function getActiveFilters() {
    const filters = {
        search: document.getElementById('searchInput')?.value || '',
        categories: [],
        brands: [],
        minPrice: undefined,
        maxPrice: undefined,
        sort: document.getElementById('sortSelect')?.value || ''
    };

    // Get checked category (radio button)
    const categoryFilter = document.querySelector('input[name="category"]:checked');
    if (categoryFilter && categoryFilter.value) {
        filters.categories = [categoryFilter.value];
    }

    // Get checked brand (radio button)
    const brandFilter = document.querySelector('input[name="brand"]:checked');
    if (brandFilter && brandFilter.value) {
        filters.brands = [brandFilter.value];
    }

    // Get price range
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');

    if (priceMin && priceMin.value) {
        filters.minPrice = parseFloat(priceMin.value);
    }

    if (priceMax && priceMax.value) {
        filters.maxPrice = parseFloat(priceMax.value);
    }

    return filters;
}

function loadProducts() {
    const params = window.searchManager.getSearchParams();

    // Map URL category params to Vietnamese category values
    const categoryMap = {
        'men': 'Nam',
        'women': 'Nữ',
        'automatic': 'Cơ tự động',
        'chronograph': 'Chronograph'
    };

    const categoryValue = params.category ? (categoryMap[params.category.toLowerCase()] || params.category) : null;

    const filters = {
        search: params.search,
        categories: categoryValue ? [categoryValue] : [],
        brands: params.brand ? [params.brand] : [],
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        sort: params.sort
    };

    const products = window.dataManager.searchProducts(filters.search, filters);
    displayProducts(products);
    updateResultsCount(products.length);
}

function displayProducts(products) {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    
    const isListView = document.getElementById('listView')?.classList.contains('active');
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="text-center py-5">
                    <i class="bi bi-search display-1 text-muted"></i>
                    <h3 class="mt-3">No products found</h3>
                    <p class="text-muted">Try adjusting your filters or search terms</p>
                    <button class="btn btn-outline-primary" onclick="clearFilters()">Clear Filters</button>
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = products.map(product => {
        return isListView ? createProductListItem(product) : createProductGridItem(product);
    }).join('');
}

function createProductGridItem(product) {
    const discountPercentage = product.compareAt ? 
        Math.round(((product.compareAt - product.price) / product.compareAt) * 100) : 0;
    
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const isInWishlist = wishlist.includes(product.id);

    return `
        <div class="col-md-6 col-lg-4">
            <div class="card product-card border-0 shadow-sm h-100">
                <div class="position-relative">
                <a href="product.html?id=${product.id}">
                        <img src="${product.images[0]}" class="card-img-top" alt="${product.name}" 
                             style="height: 250px; object-fit: cover;">
                     </a>
                    ${product.new ? '<span class="badge bg-warning text-dark position-absolute top-0 start-0 m-2">New</span>' : ''}
                    ${discountPercentage > 0 ? `<span class="badge bg-danger position-absolute top-0 end-0 m-2">-${discountPercentage}%</span>` : ''}
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
                        <small class="text-muted">${product.inventory} in stock</small>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createProductListItem(product) {
    const discountPercentage = product.compareAt ? 
        Math.round(((product.compareAt - product.price) / product.compareAt) * 100) : 0;
    
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const isInWishlist = wishlist.includes(product.id);

    return `
        <div class="col-12">
            <div class="card product-card border-0 shadow-sm">
                <div class="row g-0">
                    <div class="col-md-3">
                        <div class="position-relative">
                            <img src="${product.images[0]}" class="img-fluid w-100" alt="${product.name}" 
                                 style="height: 200px; object-fit: cover;">
                            ${product.new ? '<span class="badge bg-warning text-dark position-absolute top-0 start-0 m-2">New</span>' : ''}
                            ${discountPercentage > 0 ? `<span class="badge bg-danger position-absolute top-0 end-0 m-2">-${discountPercentage}%</span>` : ''}
                        </div>
                    </div>
                    <div class="col-md-9">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <div class="flex-grow-1">
                                    <small class="text-muted text-uppercase">${product.brand}</small>
                                    <h5 class="card-title">
                                        <a href="product.html?id=${product.slug}" class="text-decoration-none text-dark">${product.name}</a>
                                    </h5>
                                    ${product.rating ? `
                                        <div class="rating-stars mb-2">
                                            ${generateStars(product.rating)}
                                            <small class="text-muted ms-1">(${product.reviews.length})</small>
                                        </div>
                                    ` : ''}
                                    <p class="card-text text-muted">${product.description.replace(/<[^>]*>/g, '').substring(0, 150)}...</p>
                                    <div class="d-flex align-items-center">
                                        <span class="price-current fw-bold me-2">${window.dataManager.formatPrice(product.price)}</span>
                                        ${product.compareAt ? `<span class="price-original text-muted">${window.dataManager.formatPrice(product.compareAt)}</span>` : ''}
                                        <small class="text-muted ms-auto">${product.inventory} in stock</small>
                                    </div>
                                </div>
                                <div class="ms-3">
                                    <div class="d-flex flex-column gap-2">
                                        <button class="btn btn-sm btn-outline-secondary" onclick="toggleWishlist('${product.id}')" title="Add to Wishlist">
                                            <i class="bi bi-heart${isInWishlist ? '-fill text-danger' : ''}"></i>
                                        </button>
                                        <button class="btn btn-sm btn-warning" onclick="addToCart('${product.id}')" title="Add to Cart">
                                            <i class="bi bi-bag-plus"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function updateResultsCount(count) {
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = `Showing ${count} product${count !== 1 ? 's' : ''}`;
    }
}

function updateURL(filters) {
    const params = {};
    
    if (filters.search) params.search = filters.search;
    if (filters.categories.length > 0) params.category = filters.categories[0];
    if (filters.brands.length > 0) params.brand = filters.brands[0];
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.sort) params.sort = filters.sort;
    
    window.searchManager.updateURL(params);
}

function clearFilters() {
    // Reset category to "All"
    const catAll = document.getElementById('catAll');
    if (catAll) catAll.checked = true;

    // Reset brand to "All"
    const brandAll = document.getElementById('brandAll');
    if (brandAll) brandAll.checked = true;

    // Clear price inputs
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    if (priceMin) priceMin.value = '';
    if (priceMax) priceMax.value = '';

    // Clear sort
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = '';

    // Clear search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';

    // Apply filters (which will show all products)
    applyFilters();
}

// Utility function for debouncing
function debounce(func, wait) {
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