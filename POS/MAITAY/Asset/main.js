/**
 * Tệp JavaScript chính cho ứng dụng Mai Tây Hair Salon.
 * Chịu trách nhiệm cho:
 * - Quản lý giao diện người dùng (UI).
 * - Xử lý logic giỏ hàng (CartManager).
 * - Quản lý hóa đơn (BillManager).
 * - Các chức năng phụ trợ khác.
 *
 * Tệp này KHÔNG chứa logic của Firebase. Logic Firebase được đặt trong
 * các tệp /firebase/auth.js và /firebase/firestore.js.
 */

// Hàm tiện ích để định dạng số thành tiền tệ Việt Nam
function formatCurrency(number) {
    if (isNaN(number)) return "0 ₫";
    return number.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

// Hàm chuyển đổi chuỗi tiền tệ về số
function parseCurrency(currencyString) {
    return Number(currencyString.replace(/[^0-9]/g, '')) || 0;
}

// Hàm chuyển đổi tab
function switchTab(tabId) {
    // Ẩn tất cả nội dung tab
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active');
    });

    // Bỏ active tất cả các nút tab
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    // Hiển thị tab và nút được chọn
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.style.display = 'block';
        selectedTab.classList.add('active');
    }

    const selectedButton = document.querySelector(`.tab-button[onclick="switchTab('${tabId}')"]`);
    if (selectedButton) {
        selectedButton.classList.add('active');
    }

    // Tải lịch sử nếu chuyển đến tab history
    if (tabId === 'history') {
        loadHistoryFromFirebase();
    }
}


/**
 * ===================================================================
 * Quản lý giỏ hàng (CartManager)
 * ===================================================================
 */
const CartManager = {
    currentInvoiceId: 'invoice-1',
    invoices: {
        'invoice-1': { items: [], discount: 0, discountType: '%' }
    },

    // Thêm sản phẩm vào giỏ hàng
    addItem: function (product) {
        if (!product || !product.id) {
            console.error("Sản phẩm không hợp lệ", product);
            return;
        }

        const cart = this.invoices[this.currentInvoiceId];
        const existingItem = cart.items.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.items.push({ ...product, quantity: 1 });
        }

        this.renderCart();
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `Đã thêm: ${product.name}`,
            showConfirmButton: false,
            timer: 1500
        });
    },

    // Cập nhật số lượng sản phẩm
    updateQuantity: function (productId, newQuantity) {
        const cart = this.invoices[this.currentInvoiceId];
        const item = cart.items.find(item => item.id === productId);

        if (item) {
            item.quantity = Math.max(0, newQuantity); // không cho số lượng âm
            if (item.quantity === 0) {
                // Nếu số lượng về 0, xóa sản phẩm khỏi giỏ hàng
                cart.items = cart.items.filter(i => i.id !== productId);
            }
        }

        this.renderCart();
    },
    
    // Xóa giỏ hàng hiện tại
    clearCart: function () {
        Swal.fire({
            title: 'Bạn chắc chắn?',
            text: "Bạn có muốn xóa toàn bộ sản phẩm trong giỏ hàng này không?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Vâng, xóa đi!',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                this.invoices[this.currentInvoiceId].items = [];
                this.renderCart();
                Swal.fire('Đã xóa!', 'Giỏ hàng đã được dọn dẹp.', 'success');
            }
        });
    },

    // Tính toán và cập nhật tổng tiền
    updateSummary: function () {
        const cart = this.invoices[this.currentInvoiceId];
        const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const discountType = document.getElementById('discountType').checked ? 'đ' : '%';
        let discountValue = 0;
        let discountDisplay = "0";

        if (discountType === '%') {
            const discountPercent = parseFloat(document.getElementById('discount').value) || 0;
            discountValue = (subtotal * discountPercent) / 100;
            discountDisplay = `${discountPercent}%`;
        } else {
            discountValue = parseCurrency(document.getElementById('discountAmount').value);
            discountDisplay = formatCurrency(discountValue);
        }

        const total = subtotal - discountValue;

        document.getElementById('subtotal').textContent = formatCurrency(subtotal);
        document.getElementById('discount-info').textContent = formatCurrency(discountValue);
        document.getElementById('total').textContent = formatCurrency(total > 0 ? total : 0);
        document.getElementById('total-items').textContent = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    },

    // Vẽ lại toàn bộ giao diện giỏ hàng
    renderCart: function () {
        const cartItemsContainer = document.getElementById('cart-items');
        const cart = this.invoices[this.currentInvoiceId];

        cartItemsContainer.innerHTML = ''; // Xóa nội dung cũ

        if (!cart || cart.items.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Giỏ hàng trống</p>
                </div>`;
        } else {
            cart.items.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.innerHTML = `
                    <span class="item-name">${item.name}</span>
                    <div class="item-controls">
                        <input type="number" class="item-quantity" value="${item.quantity}" min="1" onchange="CartManager.updateQuantity('${item.id}', parseInt(this.value))">
                    </div>
                    <span class="item-price">${formatCurrency(item.price * item.quantity)}</span>
                `;
                cartItemsContainer.appendChild(itemEl);
            });
        }
        this.updateSummary();
    },

    // Chuyển đổi giữa các hóa đơn (nếu có nhiều hóa đơn)
    switchInvoice: function(invoiceId) {
        this.currentInvoiceId = invoiceId;
        this.renderCart();
    }
};

/**
 * ===================================================================
 * Quản lý hóa đơn (BillManager)
 * ===================================================================
 */
const BillManager = {
    // In hóa đơn (sử dụng API in của trình duyệt)
    printBill: function() {
        // Cần xây dựng một giao diện hóa đơn thân thiện với việc in ấn
        alert('Chức năng In đang được xây dựng!');
    },

    // In và lưu (thực hiện 2 hành động)
    printBilltoSave: function() {
        this.printBill();
        // Gọi hàm lưu từ firestore.js
        saveInvoiceToFirebase();
    }
};

/**
 * ===================================================================
 * Quản lý Lịch sử (HistoryManager)
 * ===================================================================
 */
const HistoryManager = {
    downloadAsExcel: function() {
        alert('Chức năng xuất Excel đang được xây dựng!');
        // Logic xuất ra file Excel có thể được thêm ở đây
    },
    clearHistory: function() {
        alert('Chức năng xóa lịch sử cần được kết nối với Firestore!');
    }
};

/**
 * ===================================================================
 * Khởi tạo và gán sự kiện
 * ===================================================================
 */
document.addEventListener('DOMContentLoaded', () => {
    // Chỉ chạy khi người dùng đã đăng nhập thành công.
    // Logic kiểm tra đăng nhập nằm trong `firebase/auth.js`.
    // Nếu chưa đăng nhập, các element này sẽ không tồn tại hoặc bị ẩn.
    
    // Mặc định hiển thị tab POS
    switchTab('pos');

    // Gán sự kiện cho thanh tìm kiếm sản phẩm
    const productSearch = document.getElementById('product-search');
    if(productSearch) {
        productSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            document.querySelectorAll('.product-item').forEach(item => {
                const productName = item.querySelector('.product-name').textContent.toLowerCase();
                if (productName.includes(searchTerm)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // Gán sự kiện cho các ô nhập chiết khấu
    const discountInput = document.getElementById('discount');
    const discountAmountInput = document.getElementById('discountAmount');
    if(discountInput) discountInput.addEventListener('input', () => CartManager.updateSummary());
    if(discountAmountInput) discountAmountInput.addEventListener('input', () => CartManager.updateSummary());

    // Render giỏ hàng lần đầu
    CartManager.renderCart();
});

// Hàm chuyển đổi loại chiết khấu (% hoặc tiền)
function toggleDiscountType() {
    const isAmount = document.getElementById('discountType').checked;
    document.getElementById('discount').style.display = isAmount ? 'none' : 'block';
    document.getElementById('discountAmount').style.display = isAmount ? 'block' : 'none';
    CartManager.updateSummary();
}