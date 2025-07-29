// 1. Đồng bộ (tải) danh sách sản phẩm từ Firestore
async function syncProductsFromFirebase() {
    const productsGrid = document.getElementById('products');
    if (!productsGrid) return;

    console.log("Đang tải danh sách sản phẩm từ Firestore...");
    productsGrid.innerHTML = '<p>Đang tải sản phẩm...</p>';

    try {
        const snapshot = await db.collection('products').orderBy('name').get();
        if (snapshot.empty) {
            productsGrid.innerHTML = '<p>Chưa có sản phẩm nào trong cơ sở dữ liệu.</p>';
            return;
        }

        productsGrid.innerHTML = ''; // Xóa thông báo tải
        snapshot.forEach(doc => {
            const product = { id: doc.id, ...doc.data() };
            
            // Tái sử dụng logic render sản phẩm của bạn hoặc tạo mới
            const productEl = document.createElement('div');
            productEl.className = 'product-item'; // Giả sử bạn có class này
            productEl.innerHTML = `
                <img src="${product.imageUrl || './Asset/Logo.png'}" alt="${product.name}">
                <div class="product-name">${product.name}</div>
                <div class="product-price">${Number(product.price).toLocaleString('vi-VN')} ₫</div>
            `;
            // Gán sự kiện để thêm sản phẩm vào giỏ hàng
            productEl.onclick = () => {
                // Giả định bạn có một hàm `CartManager.addItem`
                // CartManager.addItem(product); 
                alert(`Đã thêm: ${product.name}`);
            };
            productsGrid.appendChild(productEl);
        });
    } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
        productsGrid.innerHTML = '<p>Không thể tải danh sách sản phẩm.</p>';
    }
}

// 2. Đồng bộ (tải) danh sách khách hàng từ Firestore
async function syncCustomersFromFirebase() {
    console.log("Đang tải danh sách khách hàng...");
    try {
        const snapshot = await db.collection('customers').get();
        const customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Tải thành công:", customers);
        // Lưu danh sách này vào một biến toàn cục để sử dụng, ví dụ:
        // window.allCustomers = customers;
        Swal.fire('Thành công', `Đã tải ${customers.length} khách hàng.`, 'success');
    } catch (error) {
        console.error("Lỗi khi tải khách hàng:", error);
        Swal.fire('Lỗi', 'Không thể tải danh sách khách hàng.', 'error');
    }
}

// 3. Lưu hoá đơn hiện tại lên Firestore
async function saveInvoiceToFirebase() {
    console.log("Chuẩn bị lưu hoá đơn...");
    
    // Bạn cần hoàn thiện logic lấy dữ liệu từ giỏ hàng ở đây
    const itemsInCart = [ /* ... logic để lấy sản phẩm trong giỏ hàng ... */ ];

    if (itemsInCart.length === 0) {
        Swal.fire('Chưa có sản phẩm', 'Vui lòng thêm sản phẩm vào giỏ hàng trước khi lưu.', 'warning');
        return;
    }

    const invoiceData = {
        customerName: document.getElementById('customer-name').value || 'Khách lẻ',
        cashier: document.getElementById('staff-name').value,
        paymentMethod: document.getElementById('payment-method').value,
        total: document.getElementById('total').textContent, // Cần parse về dạng số
        items: itemsInCart,
        createdAt: firebase.firestore.FieldValue.serverTimestamp() // Dùng timestamp của server
    };

    try {
        const docRef = await db.collection('invoices').add(invoiceData);
        console.log("Lưu hoá đơn thành công với ID:", docRef.id);
        Swal.fire('Đã lưu!', 'Hoá đơn của bạn đã được lưu trữ an toàn.', 'success');
        // Xóa giỏ hàng sau khi lưu
        // CartManager.clearCart();
    } catch (error) {
        console.error("Lỗi lưu hoá đơn:", error);
        Swal.fire('Thất bại', 'Không thể lưu hoá đơn, vui lòng thử lại.', 'error');
    }
}

// 4. Tải lịch sử hoá đơn từ Firestore
async function loadHistoryFromFirebase() {
    const historyList = document.getElementById('historylist');
    historyList.innerHTML = '<p>Đang tải lịch sử...</p>';

    try {
        const snapshot = await db.collection('invoices').orderBy('createdAt', 'desc').limit(30).get();
        if (snapshot.empty) {
            historyList.innerHTML = '<p>Không có hoá đơn nào trong lịch sử.</p>';
            return;
        }

        historyList.innerHTML = '';
        snapshot.forEach(doc => {
            const invoice = doc.data();
            const date = invoice.createdAt ? invoice.createdAt.toDate().toLocaleString('vi-VN') : 'Không rõ';
            const itemEl = document.createElement('div');
            itemEl.className = 'history-item'; // Giả sử có class này
            itemEl.innerHTML = `
                <div><strong>Khách hàng:</strong> ${invoice.customerName}</div>
                <div><strong>Tổng tiền:</strong> ${invoice.total}</div>
                <div><strong>Ngày:</strong> ${date}</div>
            `;
            historyList.appendChild(itemEl);
        });
    } catch (error) {
        console.error("Lỗi tải lịch sử hoá đơn:", error);
        historyList.innerHTML = '<p>Không thể tải lịch sử hoá đơn.</p>';
    }
}