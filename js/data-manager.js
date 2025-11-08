// Data Manager cho website tĩnh
class DataManager {
    constructor() {
        // Không cần khởi tạo gì
    }

    // Phương thức sản phẩm
    getProducts() {
        return PRODUCTS;
    }

    getProduct(id) {
        return PRODUCTS.find(p => p.id === id || p.slug === id);
    }

    // Phương thức cài đặt
    getSettings() {
        return SETTINGS;
    }

    formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Phương thức tìm kiếm và lọc
    searchProducts(query, filters = {}) {
        let products = [...PRODUCTS];

        // Tìm kiếm văn bản
        if (query) {
            const searchTerm = query.toLowerCase();
            products = products.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.brand.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm) ||
                product.categories.some(cat => cat.toLowerCase().includes(searchTerm))
            );
        }

        // Lọc danh mục
        if (filters.categories && filters.categories.length > 0) {
            products = products.filter(product =>
                filters.categories.some(cat => product.categories.includes(cat))
            );
        }

        // Lọc thương hiệu
        if (filters.brands && filters.brands.length > 0) {
            products = products.filter(product =>
                filters.brands.includes(product.brand.toLowerCase())
            );
        }

        // Lọc khoảng giá
        if (filters.minPrice !== undefined) {
            products = products.filter(product => product.price >= filters.minPrice);
        }
        if (filters.maxPrice !== undefined) {
            products = products.filter(product => product.price <= filters.maxPrice);
        }

        // Sắp xếp sản phẩm
        if (filters.sort) {
            switch (filters.sort) {
                case 'name-asc':
                    products.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'name-desc':
                    products.sort((a, b) => b.name.localeCompare(a.name));
                    break;
                case 'price-asc':
                    products.sort((a, b) => a.price - b.price);
                    break;
                case 'price-desc':
                    products.sort((a, b) => b.price - a.price);
                    break;
                case 'rating':
                    products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                    break;
            }
        }

        return products;
    }
}

// Khởi tạo trình quản lý dữ liệu toàn cục
window.dataManager = new DataManager();
