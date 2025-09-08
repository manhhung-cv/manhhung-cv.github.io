document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Config ---
    const firebaseConfig = {
        apiKey: "AIzaSyArx-5hcMsrq9DHTcy5HvN_aVehrVDv3HM",
        authDomain: "order-manager-d4042.firebaseapp.com",
        projectId: "order-manager-d4042",
        storageBucket: "order-manager-d4042.firebasestorage.app",
        messagingSenderId: "62807324372",
        appId: "1:62807324372:web:b658e72655d03b8b03ed41",
        measurementId: "G-Q05TTEEG73"
    };

    // --- Initialize Firebase ---
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    // --- DOM Elements ---
    const userDisplay = document.getElementById('user-display');
    const loginBtnMain = document.getElementById('login-btn-main');
    const logoutBtn = document.getElementById('logout-btn');
    const authModal = document.getElementById('auth-modal');
    const closeAuthModalBtn = document.getElementById('close-auth-modal-btn');
    const loginForm = document.getElementById('login-form');
    const guestView = document.getElementById('guest-view');
    const guestWarehouseCodeInput = document.getElementById('guest-warehouse-code');
    const viewWarehouseBtn = document.getElementById('view-warehouse-btn');
    const warehouseContainer = document.getElementById('warehouse-container');
    const warehouseSelect = document.getElementById('warehouse-select');
    const createWarehouseBtn = document.getElementById('create-warehouse-btn');
    const copyWarehouseCodeBtn = document.getElementById('copy-warehouse-code-btn');
    const renameWarehouseBtn = document.getElementById('rename-warehouse-btn');
    const tableContainer = document.getElementById('table-container');
    const mainActions = document.getElementById('main-actions');
    const controlsContainer = document.getElementById('controls-container');
    const deleteConfirmModal = document.getElementById('delete-confirm-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    // Order Modal Elements
    const orderModal = document.getElementById('order-modal');
    const orderModalContent = orderModal.querySelector('.modal-content');
    const closeModalBtn1 = document.getElementById('close-modal-btn-1');
    const closeModalBtn2 = document.getElementById('close-modal-btn-2');
    const step1 = document.getElementById('step-1');
    const customerNameInput = document.getElementById('customer-name');
    const nextStepBtn = document.getElementById('next-step-btn');
    const step2 = document.getElementById('step-2');
    const orderCodeTextarea = document.getElementById('order-code');
    const orderNotesTextarea = document.getElementById('order-notes');
    const pasteBtn = document.getElementById('paste-btn');
    const quickPasteToggle = document.getElementById('quick-paste-toggle');
    const backStepBtn = document.getElementById('back-step-btn');
    const confirmOrderBtn = document.getElementById('confirm-order-btn');
    // Scanner Modal Elements
    const scannerModal = document.getElementById('scanner-modal');
    const closeScannerBtn = document.getElementById('close-scanner-btn');
    const scannedOrdersContainer = document.getElementById('scanned-orders-container');
    const exportImgBtn = document.getElementById('export-img-btn');
    const copyTextBtn = document.getElementById('copy-text-btn');
    const exportExcelBtn = document.getElementById('export-excel-btn');
    const clearScannedBtn = document.getElementById('clear-scanned-btn');
    const foundOrderModal = document.getElementById('found-order-modal');
    const foundOrderInfo = document.getElementById('found-order-info');
    const saveAndScanAgainBtn = document.getElementById('save-and-scan-again-btn');
    const cancelScanResultBtn = document.getElementById('cancel-scan-result-btn');


    // --- State ---
    let currentUser = null;
    let currentWarehouseId = null;
    let unsubscribeOrders = null;
    let orderToDeleteId = null;
    let ordersCache = [];
    let scannedOrders = JSON.parse(localStorage.getItem('scannedOrders')) || [];
    let foundOrderCache = null;
    let editingOrderId = null;
    let html5QrCode;


    // =================================================================
    // 1. AUTHENTICATION & UI MANAGEMENT
    // =================================================================

    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            userDisplay.textContent = `Xin chào, ${user.email}`;
            loginBtnMain.classList.add('hidden');
            logoutBtn.classList.remove('hidden');
            warehouseContainer.classList.remove('hidden');
            guestView.classList.add('hidden');
            hideAuthModal();
            loadUserWarehouses();
        } else {
            currentUser = null;
            currentWarehouseId = null;
            userDisplay.textContent = '';
            loginBtnMain.classList.remove('hidden');
            logoutBtn.classList.add('hidden');
            warehouseContainer.classList.add('hidden');
            guestView.classList.remove('hidden');
            mainActions.classList.add('hidden');
            controlsContainer.classList.add('hidden');
            if (unsubscribeOrders) unsubscribeOrders();
            tableContainer.innerHTML = '';
        }
    });

    const showAuthModal = () => {
        authModal.classList.remove('invisible', 'opacity-0');
        authModal.querySelector('.modal-content').classList.remove('scale-95');
    }
    const hideAuthModal = () => {
        authModal.querySelector('.modal-content').classList.add('scale-95');
        authModal.classList.add('invisible', 'opacity-0');
    }
    loginBtnMain.addEventListener('click', showAuthModal);
    closeAuthModalBtn.addEventListener('click', hideAuthModal);
    logoutBtn.addEventListener('click', () => auth.signOut());

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        auth.signInWithEmailAndPassword(email, password)
            .then(() => loginForm.reset())
            .catch(error => alert(`Lỗi đăng nhập: ${error.message}`));
    });

    // =================================================================
    // 2. WAREHOUSE MANAGEMENT
    // =================================================================
    
    viewWarehouseBtn.addEventListener('click', () => {
        const code = guestWarehouseCodeInput.value.trim().toUpperCase();
        if (code.length !== 6) return alert("Mã kho phải có đúng 6 ký tự.");
        db.collection('warehouses').doc(code).get().then(doc => {
            if (doc.exists) {
                currentWarehouseId = code;
                loadOrders();
            } else {
                alert("Mã kho không tồn tại hoặc không hợp lệ.");
                tableContainer.innerHTML = '';
            }
        });
    });

    async function loadUserWarehouses() {
        if (!currentUser) return;
        const snapshot = await db.collection('warehouses').where('ownerId', '==', currentUser.uid).get();
        const warehouses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        warehouseSelect.innerHTML = '';
        if (warehouses.length > 0) {
            warehouses.sort((a, b) => a.name.localeCompare(b.name)).forEach(wh => {
                const option = document.createElement('option');
                option.value = wh.id;
                option.textContent = `${wh.name} (${wh.id})`;
                warehouseSelect.appendChild(option);
            });
            currentWarehouseId = warehouseSelect.value;
            loadOrders();
        } else {
            tableContainer.innerHTML = `<div class="bg-white rounded-xl p-12 text-center text-gray-400">
                <i class="fas fa-warehouse fa-3x mb-3"></i><p>Bạn chưa có kho nào. Hãy tạo một kho để bắt đầu!</p></div>`;
            mainActions.classList.add('hidden');
            controlsContainer.classList.add('hidden');
        }
    }

    warehouseSelect.addEventListener('change', () => {
        currentWarehouseId = warehouseSelect.value;
        loadOrders();
    });

    copyWarehouseCodeBtn.addEventListener('click', () => {
        if (!currentWarehouseId) return;
        navigator.clipboard.writeText(currentWarehouseId)
            .then(() => alert(`Đã sao chép mã kho: ${currentWarehouseId}`))
            .catch(() => alert('Sao chép thất bại.'));
    });

    renameWarehouseBtn.addEventListener('click', async () => {
        if (!currentWarehouseId) return;
        const currentOption = warehouseSelect.options[warehouseSelect.selectedIndex];
        const currentName = currentOption.text.substring(0, currentOption.text.lastIndexOf('(')).trim();
        const newName = prompt("Nhập tên mới cho kho:", currentName);
        if (newName && newName.trim() && newName !== currentName) {
            await db.collection('warehouses').doc(currentWarehouseId).update({ name: newName.trim() });
            alert("Đổi tên kho thành công!");
            loadUserWarehouses();
        }
    });

    createWarehouseBtn.addEventListener('click', async () => {
        const name = prompt("Nhập tên cho kho mới:");
        if (name && currentUser) {
            const uniqueCode = await generateUniqueWarehouseCode();
            await db.collection('warehouses').doc(uniqueCode).set({ name, ownerId: currentUser.uid });
            alert(`Đã tạo kho "${name}" thành công!\nMã kho của bạn là: ${uniqueCode}`);
            loadUserWarehouses();
        }
    });

    async function generateUniqueWarehouseCode() {
        let code;
        let isUnique = false;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        while (!isUnique) {
            code = Array.from({ length: 6 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
            const doc = await db.collection('warehouses').doc(code).get();
            if (!doc.exists) isUnique = true;
        }
        return code;
    }

    // =================================================================
    // 3. ORDER & SCANNER MODAL LOGIC
    // =================================================================
    
    // --- Order Modal ---
    const showOrderModal = () => {
        if (!currentUser) return alert("Vui lòng đăng nhập để tạo đơn hàng.");
        resetOrderModal();
        orderModal.classList.remove('invisible', 'opacity-0');
        orderModalContent.classList.remove('scale-95');
    };
    const hideOrderModal = () => {
        orderModalContent.classList.add('scale-95');
        orderModal.classList.add('invisible', 'opacity-0');
    };
    const resetOrderModal = () => {
        step1.classList.remove('hidden');
        step2.classList.add('hidden');
        customerNameInput.value = '';
        orderCodeTextarea.value = '';
        orderNotesTextarea.value = '';
        quickPasteToggle.checked = false;
    };
    closeModalBtn1.addEventListener('click', hideOrderModal);
    closeModalBtn2.addEventListener('click', hideOrderModal);
    nextStepBtn.addEventListener('click', () => {
        if (customerNameInput.value.trim() === '') return alert('Vui lòng nhập tên khách hàng.');
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
    });
    backStepBtn.addEventListener('click', () => {
        step2.classList.add('hidden');
        step1.classList.remove('hidden');
    });

    // --- Scanner Modal ---
    const showScannerModal = () => {
        if (!html5QrCode) {
            html5QrCode = new Html5Qrcode("qr-reader");
        }
        scannerModal.classList.remove('invisible', 'opacity-0');
        scannerModal.querySelector('.bg-white').classList.remove('scale-95');
        renderScannedOrdersTable();
        startScanner();
    };
    const hideScannerModal = () => {
        if (html5QrCode) {
            html5QrCode.stop().catch(() => {});
        }
        scannerModal.querySelector('.bg-white').classList.add('scale-95');
        scannerModal.classList.add('invisible', 'opacity-0');
    };
    closeScannerBtn.addEventListener('click', hideScannerModal);

    // --- Found Order Modal ---
    const showFoundOrderModal = (order) => {
        foundOrderCache = order;
        foundOrderInfo.innerHTML = `Mã <strong>${escapeHTML(order.code)}</strong> của KH <strong>${escapeHTML(order.customer)}</strong>.`;
        foundOrderModal.classList.remove('invisible', 'opacity-0');
        foundOrderModal.querySelector('.modal-content').classList.remove('scale-95');
    };
    const hideFoundOrderModal = () => {
        foundOrderModal.querySelector('.modal-content').classList.add('scale-95');
        foundOrderModal.classList.add('invisible', 'opacity-0');
        foundOrderCache = null;
    };
    cancelScanResultBtn.addEventListener('click', () => {
        hideFoundOrderModal();
        startScanner(); // Go back to scanning without closing the whole modal
    });
    saveAndScanAgainBtn.addEventListener('click', () => {
        if (foundOrderCache) {
            if (!scannedOrders.some(o => o.id === foundOrderCache.id)) {
                scannedOrders.push(foundOrderCache);
                localStorage.setItem('scannedOrders', JSON.stringify(scannedOrders));
            }
            renderScannedOrdersTable();
            hideFoundOrderModal();
            startScanner();
        }
    });

    // =================================================================
    // 4. CORE FUNCTIONALITY (CREATE, SCAN, DELETE)
    // =================================================================

    confirmOrderBtn.addEventListener('click', () => {
        const codes = orderCodeTextarea.value.trim().split('\n').filter(Boolean);
        if (codes.length === 0) return alert("Vui lòng nhập ít nhất một mã đơn hàng.");

        const batch = db.batch();
        codes.forEach(code => {
            const newOrderRef = db.collection('orders').doc();
            batch.set(newOrderRef, {
                customer: customerNameInput.value.trim(),
                code: code.trim(),
                notes: orderNotesTextarea.value.trim(),
                warehouseId: currentWarehouseId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });
        batch.commit().then(() => hideOrderModal());
    });

    const startScanner = () => {
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
        html5QrCode.start({ facingMode: "environment" }, config,
            (decodedText) => { // onSuccess
                html5QrCode.stop().catch(() => {});
                const foundOrder = ordersCache.find(o => o.code === decodedText);
                if (foundOrder) {
                    showFoundOrderModal(foundOrder);
                } else {
                    alert(`Không tìm thấy đơn hàng với mã: ${decodedText} trong kho này.`);
                    startScanner(); // Restart if not found
                }
            },
            () => {} // onError
        ).catch(() => alert("Không thể khởi động camera. Vui lòng cấp quyền và thử lại."));
    };
    
    // --- Delete Confirmation ---
    const showDeleteConfirmModal = (orderId) => {
        orderToDeleteId = orderId;
        deleteConfirmModal.classList.remove('invisible', 'opacity-0');
        deleteConfirmModal.querySelector('.modal-content').classList.remove('scale-95');
    };
    const hideDeleteConfirmModal = () => {
        deleteConfirmModal.querySelector('.modal-content').classList.add('scale-95');
        deleteConfirmModal.classList.add('invisible', 'opacity-0');
        orderToDeleteId = null;
    };
    cancelDeleteBtn.addEventListener('click', hideDeleteConfirmModal);
    confirmDeleteBtn.addEventListener('click', () => {
        if (orderToDeleteId && currentUser) {
            db.collection('orders').doc(orderToDeleteId).delete().catch(e => alert("Lỗi: " + e.message));
        }
        hideDeleteConfirmModal();
    });

    // =================================================================
    // 5. RENDERING & UI LOGIC
    // =================================================================

    function loadOrders() {
        if (unsubscribeOrders) unsubscribeOrders();
        if (!currentWarehouseId) return;

        mainActions.classList.remove('hidden');
        
        unsubscribeOrders = db.collection('orders')
            .where('warehouseId', '==', currentWarehouseId)
            .orderBy('createdAt', 'desc')
            .onSnapshot(snapshot => {
                ordersCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                if (ordersCache.length > 0) {
                    controlsContainer.classList.remove('hidden');
                } else {
                    controlsContainer.classList.add('hidden');
                }
                
                handleFilterAndSearch(); // Initial render and applies any existing filters
                updateCustomerFilter(ordersCache);
            }, error => {
                console.error("Lỗi tải đơn hàng:", error);
                tableContainer.innerHTML = `<p class="text-center text-red-500 font-semibold p-4">Lỗi tải dữ liệu. Vui lòng kiểm tra lại Firebase Index.<br><span class="font-normal text-sm text-gray-600">Nếu bạn vừa tạo Index, hãy đợi vài phút và tải lại trang.</span></p>`;
            });
    }

    function render(ordersToDisplay) {
        if (ordersCache.length === 0) {
            tableContainer.innerHTML = `<div class="bg-white rounded-xl shadow-lg p-12 text-center text-gray-400">
                <i class="fas fa-box-open fa-3x mb-3"></i><p>Kho này chưa có đơn hàng nào.</p></div>`;
            return;
        }
        if (ordersToDisplay.length === 0) {
            tableContainer.innerHTML = `<div class="bg-white rounded-xl shadow-lg p-12 text-center text-gray-400">
                <i class="fas fa-search fa-3x mb-3"></i><p>Không tìm thấy đơn hàng nào khớp với tìm kiếm.</p></div>`;
            return;
        }
        tableContainer.innerHTML = createTableHTML(ordersToDisplay);
    }

    function createTableHTML(orderList) {
        const canEdit = !!currentUser;
        const rows = orderList.map((order, index) => {
            const isEditing = editingOrderId === order.id;
            if (isEditing && canEdit) {
                return `
                <tr class="bg-yellow-100" data-id="${order.id}">
                    <td class="px-6 py-4 text-sm text-gray-500">${index + 1}</td>
                    <td class="px-2 py-2"><input type="text" class="w-full border rounded px-2 py-1" name="customer" value="${escapeHTML(order.customer)}"></td>
                    <td class="px-2 py-2"><input type="text" class="w-full border rounded px-2 py-1 font-mono" name="code" value="${escapeHTML(order.code)}"></td>
                    <td class="px-2 py-2"><input type="text" class="w-full border rounded px-2 py-1" name="notes" value="${escapeHTML(order.notes || '')}"></td>
                    <td class="px-6 py-4 text-center">
                        <button data-action="save" data-id="${order.id}" class="text-green-600 hover:text-green-900" title="Lưu"><i class="fas fa-save pointer-events-none"></i></button>
                        <button data-action="cancel" class="text-gray-600 hover:text-gray-900 ml-4" title="Hủy"><i class="fas fa-times pointer-events-none"></i></button>
                    </td>
                </tr>`;
            }
            return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 text-sm text-gray-500">${index + 1}</td>
                <td class="px-6 py-4 font-medium">${escapeHTML(order.customer)}</td>
                <td class="px-6 py-4 font-mono">${escapeHTML(order.code)}</td>
                <td class="px-6 py-4">${escapeHTML(order.notes || '')}</td>
                <td class="px-6 py-4 text-center">
                    ${canEdit ? `
                        <button data-action="edit" data-id="${order.id}" class="text-blue-600 hover:text-blue-900" title="Sửa"><i class="fas fa-edit pointer-events-none"></i></button>
                        <button data-action="delete" data-id="${order.id}" class="text-red-600 hover:text-red-900 ml-4" title="Xóa"><i class="fas fa-trash pointer-events-none"></i></button>
                    ` : `<span class="text-xs text-gray-400">CHỈ XEM</span>`}
                </td>
            </tr>`;
        }).join('');

        return `<div class="table-wrapper bg-white rounded-xl shadow-lg overflow-hidden">
                    <div class="p-4 border-b"><h2 class="text-xl font-semibold">Danh Sách Đơn Hàng</h2></div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs uppercase">STT</th>
                                    <th class="px-6 py-3 text-left text-xs uppercase">Khách Hàng</th>
                                    <th class="px-6 py-3 text-left text-xs uppercase">Mã Đơn</th>
                                    <th class="px-6 py-3 text-left text-xs uppercase">Ghi chú</th>
                                    <th class="px-6 py-3 text-center text-xs uppercase">Hành động</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">${rows}</tbody>
                        </table>
                    </div>
                </div>`;
    }

    function updateCustomerFilter(orders) {
        const customerFilter = document.getElementById('customer-filter');
        if (!customerFilter) return;
        const currentSelection = customerFilter.value;
        const uniqueCustomers = [...new Set(orders.map(o => o.customer))].sort();
        customerFilter.innerHTML = '<option value="all">Tất cả khách hàng</option>';
        uniqueCustomers.forEach(customer => {
            const option = document.createElement('option');
            option.value = escapeHTML(customer);
            option.textContent = escapeHTML(customer);
            if (customer === currentSelection) {
                option.selected = true;
            }
            customerFilter.appendChild(option);
        });
    }

    const handleFilterAndSearch = () => {
        const searchInput = document.getElementById('search-input');
        const customerFilter = document.getElementById('customer-filter');
        if (!searchInput || !customerFilter) return render(ordersCache);

        const searchTerm = searchInput.value.toLowerCase();
        const selectedCustomer = customerFilter.value;

        const filteredOrders = ordersCache.filter(order => {
            const matchesSearch = searchTerm === '' || 
                                  order.customer.toLowerCase().includes(searchTerm) ||
                                  order.code.toLowerCase().includes(searchTerm) ||
                                  (order.notes || '').toLowerCase().includes(searchTerm);
            const matchesFilter = selectedCustomer === 'all' || order.customer === selectedCustomer;
            return matchesSearch && matchesFilter;
        });
        render(filteredOrders);
    };

    // =================================================================
    // 6. EVENT DELEGATION & UTILITIES
    // =================================================================
    document.addEventListener('click', (event) => {
        const target = event.target.closest('[data-action]');
        if (!target) return;

        const { action, id } = target.dataset;
        if (!action) return;

        switch (action) {
            case 'create': showOrderModal(); break;
            case 'scan': showScannerModal(); break;
            case 'delete':
                if (!currentUser) return alert("Bạn không có quyền xóa.");
                showDeleteConfirmModal(id);
                break;
            case 'edit':
                if (!currentUser) return alert("Bạn không có quyền sửa.");
                editingOrderId = id;
                handleFilterAndSearch(); // Re-render to show input fields
                break;
            case 'save':
                if (!currentUser) return;
                const row = document.querySelector(`tr[data-id="${id}"]`);
                const updatedData = {
                    customer: row.querySelector('input[name="customer"]').value,
                    code: row.querySelector('input[name="code"]').value,
                    notes: row.querySelector('input[name="notes"]').value,
                };
                db.collection('orders').doc(id).update(updatedData)
                    .then(() => editingOrderId = null); // onSnapshot will re-render
                break;
            case 'cancel':
                editingOrderId = null;
                handleFilterAndSearch(); // Re-render to hide input fields
                break;
        }
    });

    controlsContainer.addEventListener('input', (event) => {
        if (event.target.id === 'search-input') handleFilterAndSearch();
    });
    controlsContainer.addEventListener('change', (event) => {
        if (event.target.id === 'customer-filter') handleFilterAndSearch();
    });

    function escapeHTML(str) {
        return str?.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]) || '';
    }

    // --- Scanned Orders Table & Export ---
    clearScannedBtn.addEventListener('click', () => {
        if (scannedOrders.length > 0 && confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu đã quét không?')) {
            scannedOrders = [];
            localStorage.removeItem('scannedOrders');
            renderScannedOrdersTable();
        }
    });
    
    copyTextBtn.addEventListener('click', () => {
        if (scannedOrders.length === 0) return;
        const text = scannedOrders.map((o, i) => `${i + 1}. KH: ${o.customer} - Mã: ${o.code}`).join('\n');
        navigator.clipboard.writeText(text).then(() => alert('Đã sao chép vào clipboard!'));
    });

    exportExcelBtn.addEventListener('click', () => {
        if (scannedOrders.length === 0) return;
        const data = scannedOrders.map((order, index) => ({
            'STT': index + 1, 'Khách Hàng': order.customer, 'Mã Đơn Hàng': order.code, 'Ghi chú': order.notes
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Đơn đã quét");
        XLSX.writeFile(wb, "danh-sach-da-quet.xlsx");
    });
    
    exportImgBtn.addEventListener('click', () => {
        if (scannedOrders.length === 0) return;
        html2canvas(scannedOrdersContainer).then(canvas => {
            const link = document.createElement('a');
            link.download = 'danh-sach-da-quet.png';
            link.href = canvas.toDataURL();
            link.click();
        });
    });

    function renderScannedOrdersTable() {
        const exportButtons = document.getElementById('export-buttons');
        if (scannedOrders.length === 0) {
            scannedOrdersContainer.innerHTML = `<p class="text-gray-500 text-center py-4">Chưa có đơn hàng nào được quét.</p>`;
            if (exportButtons) exportButtons.classList.add('hidden');
            return;
        }
        if (exportButtons) exportButtons.classList.remove('hidden');

        const tableRows = scannedOrders.map((order, index) => `
            <tr class="border-b">
                <td class="p-2 text-sm">${index + 1}</td>
                <td class="p-2 text-sm">${escapeHTML(order.customer)}</td>
                <td class="p-2 text-sm">${escapeHTML(order.code)}</td>
            </tr>`).join('');
        scannedOrdersContainer.innerHTML = `
            <table class="min-w-full text-left">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="p-2 text-xs uppercase">STT</th>
                        <th class="p-2 text-xs uppercase">Khách Hàng</th>
                        <th class="p-2 text-xs uppercase">Mã Đơn</th>
                    </tr>
                </thead>
                <tbody>${tableRows}</tbody>
            </table>`;
    }

});