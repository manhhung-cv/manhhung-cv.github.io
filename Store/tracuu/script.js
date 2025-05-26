// data.js
const products = [
    {
        "id": "P001",
        "Name": "4English chính chủ",
        "Date": "1 năm",
        "category": "Ứng dụng học tập",
        "price": "Liên hệ",
        "stock": 10
    },
    {
        "id": "P002",
        "Name": "AdGuard Premium Lifetime Key",
        "Date": "Vĩnh viễn",
        "category": "Tiện ích & Bảo mật",
        "price": "Liên hệ",
        "stock": 5
    },
    {
        "id": "P003",
        "Name": "Adobe Creative Cloud 3D substance app",
        "Date": "12 tháng",
        "category": "Phần mềm thiết kế",
        "price": "Liên hệ",
        "stock": 3
    },
    {
        "id": "P004",
        "Name": "Adobe Creative Cloud FULL APP 100GB",
        "Date": "12 tháng",
        "category": "Phần mềm thiết kế",
        "price": "Liên hệ",
        "stock": 7
    },
    {
        "id": "P005",
        "Name": "Apple Account TestFight Locket",
        "Date": "1 Apple ID", // Hoặc "Theo tài khoản"
        "category": "Tài khoản Apple & Tiện ích",
        "price": "Liên hệ",
        "stock": 12
    },
    {
        "id": "P006",
        "Name": "Apple Music 6 tháng/ 12 tháng chính chủ",
        "Date": "6 tháng/12 tháng",
        "category": "Tài khoản Apple & Tiện ích",
        "price": "Liên hệ",
        "stock": 15
    },
    {
        "id": "P007",
        "Name": "Canva Pro",
        "Date": "Vĩnh viễn", // Lưu ý: có sản phẩm Canva Pro chính chủ 1 năm
        "category": "Công cụ thiết kế Online",
        "price": "Liên hệ",
        "stock": 50
    },
    {
        "id": "P008",
        "Name": "Canva Pro chính chủ",
        "Date": "1 Năm",
        "category": "Công cụ thiết kế Online",
        "price": "Liên hệ",
        "stock": 30
    },
    {
        "id": "P009",
        "Name": "GPT Plus 4.0 cấp sẵn", // Có 2 mục GPT Plus với Date khác nhau, bạn cần phân biệt bằng Name hoặc ID
        "Date": "1 tháng",
        "category": "Công cụ AI",
        "price": "Liên hệ",
        "stock": 8
    },
    {
        "id": "P010",
        "Name": "Netflix Dài Hạn",
        "Date": "6 tháng/ 12 tháng",
        "category": "Giải trí xem phim",
        "price": "Liên hệ",
        "stock": 15
    },
    {
        "id": "P011",
        "Name": "Key Window 10/11 Pro bản quyền",
        "Date": "Vĩnh viễn",
        "category": "Phần mềm hệ thống",
        "price": "Liên hệ",
        "stock": 100
    },
    {
        "id": "P012",
        "Name": "Dung lượng Google Driver chính chủ 2TB",
        "Date": "12 tháng",
        "category": "Lưu trữ đám mây",
        "price": "Liên hệ",
        "stock": 9
    }
    // ... Thêm các sản phẩm còn lại từ danh sách của bạn,
    // đảm bảo mỗi sản phẩm có id, Name, Date, category, price, stock.
];

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const productListElement = document.getElementById('productList');
    const noResultsMessage = document.getElementById('noResultsMessage');

    let allProducts = [];

    function loadProducts() {
        // Đảm bảo biến 'products' từ data.js đã được tải
        if (typeof products !== 'undefined' && Array.isArray(products)) {
            allProducts = products;
            populateCategories();
            renderProducts(allProducts);
        } else {
            console.error("Dữ liệu sản phẩm (products) không tìm thấy hoặc không đúng định dạng.");
            productListElement.innerHTML = "<p>Lỗi tải dữ liệu sản phẩm.</p>";
        }
    }

    function populateCategories() {
        const categories = new Set();
        allProducts.forEach(product => {
            if (product.category) {
                categories.add(product.category);
            }
        });

        categoryFilter.innerHTML = '<option value="">Tất cả danh mục</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    function renderProducts(productsToRender) {
        productListElement.innerHTML = '';

        if (productsToRender.length === 0) {
            noResultsMessage.style.display = 'block';
            return;
        }
        noResultsMessage.style.display = 'none';

        productsToRender.forEach(product => {
            const listItem = document.createElement('li');
            listItem.classList.add('product-item');

            const productInfoDiv = document.createElement('div');
            productInfoDiv.classList.add('product-info');

            const nameSpan = document.createElement('span');
            nameSpan.classList.add('product-name');
            nameSpan.textContent = product.Name;

            const categorySpan = document.createElement('span');
            categorySpan.classList.add('product-category');
            categorySpan.textContent = `Danh mục: ${product.category || 'N/A'}`;

            // === THÊM HIỂN THỊ DATE ===
            const dateSpan = document.createElement('span');
            dateSpan.classList.add('product-date'); // Class CSS đã định nghĩa
            // Kiểm tra xem product.Date có tồn tại không
            dateSpan.textContent = `Thời hạn: ${product.Date || 'Không xác định'}`;
            // === KẾT THÚC THÊM DATE ===

            productInfoDiv.appendChild(nameSpan);
            productInfoDiv.appendChild(categorySpan);
            productInfoDiv.appendChild(dateSpan); // Thêm dateSpan vào productInfoDiv

            const productStatusDiv = document.createElement('div');
            productStatusDiv.classList.add('product-status');

            const priceSpan = document.createElement('span');
            priceSpan.classList.add('product-price');
            priceSpan.innerHTML = `Giá: <span>${product.price}</span>`;

            const stockSpan = document.createElement('span');
            stockSpan.classList.add('product-stock');

            if (product.stock > 0) {
                let stockText = `Tồn kho: ${product.stock}`;
                stockSpan.textContent = stockText;
                if (product.stock <= 5) {
                    stockSpan.classList.add('stock-low');
                } else {
                    stockSpan.classList.add('stock-available');
                }
            } else {
                stockSpan.textContent = 'Hết hàng';
                stockSpan.classList.add('stock-unavailable');
            }

            productStatusDiv.appendChild(priceSpan);
            productStatusDiv.appendChild(stockSpan);

            listItem.appendChild(productInfoDiv);
            listItem.appendChild(productStatusDiv);

            productListElement.appendChild(listItem);
        });
    }

    function filterProducts() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedCategory = categoryFilter.value;

        const filteredProducts = allProducts.filter(product => {
            const nameMatch = product.Name.toLowerCase().includes(searchTerm);
            const categoryMatch = selectedCategory === '' || product.category === selectedCategory;
            return nameMatch && categoryMatch;
        });

        renderProducts(filteredProducts);
    }

    searchInput.addEventListener('input', filterProducts);
    categoryFilter.addEventListener('change', filterProducts);

    loadProducts();
});