// Chức năng tìm kiếm
class SearchManager {
    constructor() {
        this.searchInput = null;
        this.searchResults = null;
        this.debounceTimer = null;
        this.init();
    }

    init() {
        this.searchInput = document.getElementById('searchInput');
        this.searchResults = document.getElementById('searchResults');

        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });

            this.searchInput.addEventListener('focus', () => {
                if (this.searchInput.value.trim()) {
                    this.showResults();
                }
            });

            // Ẩn kết quả khi click bên ngoài
            document.addEventListener('click', (e) => {
                if (!this.searchInput.contains(e.target) && !this.searchResults.contains(e.target)) {
                    this.hideResults();
                }
            });
        }
    }

    handleSearch(query) {
        // Xóa timer trước đó
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // Debounce tìm kiếm
        this.debounceTimer = setTimeout(() => {
            this.performSearch(query);
        }, 300);
    }

    performSearch(query) {
        if (!query.trim()) {
            this.hideResults();
            return;
        }

        const products = window.dataManager.searchProducts(query);
        this.displayResults(products, query);
    }

    displayResults(products, query) {
        if (!this.searchResults) return;

        if (products.length === 0) {
            this.searchResults.innerHTML = `
                <div class="search-result-item text-center py-3">
                    <i class="bi bi-search text-muted"></i>
                    <p class="mb-0 text-muted">Không tìm thấy sản phẩm nào cho "${query}"</p>
                </div>
            `;
        } else {
            this.searchResults.innerHTML = products.slice(0, 5).map(product => `
                <div class="search-result-item d-flex align-items-center" onclick="window.location.href='product.html?id=${product.slug}'">
                    <img src="${product.images[0]}" alt="${product.name}" class="search-result-image me-3">
                    <div class="flex-grow-1">
                        <h6 class="mb-1">${this.highlightText(product.name, query)}</h6>
                        <small class="text-muted">${product.brand}</small>
                        <div class="fw-bold text-warning">${window.dataManager.formatPrice(product.price)}</div>
                    </div>
                </div>
            `).join('');

            if (products.length > 5) {
                this.searchResults.innerHTML += `
                    <div class="search-result-item text-center py-2 border-top">
                        <a href="shop.html?search=${encodeURIComponent(query)}" class="text-decoration-none">
                            Xem tất cả ${products.length} kết quả
                        </a>
                    </div>
                `;
            }
        }

        this.showResults();
    }

    highlightText(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    showResults() {
        if (this.searchResults) {
            this.searchResults.style.display = 'block';
        }
    }

    hideResults() {
        if (this.searchResults) {
            this.searchResults.style.display = 'none';
        }
    }

    // Tìm kiếm dựa trên URL cho trang shop
    getSearchParams() {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            search: urlParams.get('search') || '',
            category: urlParams.get('category') || '',
            brand: urlParams.get('brand') || '',
            minPrice: urlParams.get('minPrice') ? parseFloat(urlParams.get('minPrice')) : undefined,
            maxPrice: urlParams.get('maxPrice') ? parseFloat(urlParams.get('maxPrice')) : undefined,
            sort: urlParams.get('sort') || ''
        };
    }

    updateURL(params) {
        const url = new URL(window.location);
        
        // Xóa các tham số tìm kiếm hiện có
        url.searchParams.delete('search');
        url.searchParams.delete('category');
        url.searchParams.delete('brand');
        url.searchParams.delete('minPrice');
        url.searchParams.delete('maxPrice');
        url.searchParams.delete('sort');

        // Thêm tham số mới
        Object.keys(params).forEach(key => {
            if (params[key] && params[key] !== '') {
                if (Array.isArray(params[key])) {
                    params[key].forEach(value => {
                        url.searchParams.append(key, value);
                    });
                } else {
                    url.searchParams.set(key, params[key]);
                }
            }
        });

        // Cập nhật URL mà không tải lại trang
        window.history.replaceState({}, '', url);
    }
}

// Khởi tạo trình quản lý tìm kiếm toàn cục
window.searchManager = new SearchManager();