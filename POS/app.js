// 1. IMPORT
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    doc,
    deleteDoc,
    updateDoc,
    getDoc,
    getDocs,
    setDoc,
    runTransaction,
    serverTimestamp,
    query,
    where,
    orderBy,
    limit,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// 2. CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyAFVEewFQpvq7awQi4xobqNvOq2Fmsso1E",
    authDomain: "pos-hunq.firebaseapp.com",
    projectId: "pos-hunq",
    storageBucket: "pos-hunq.firebasestorage.app",
    messagingSenderId: "723349111259",
    appId: "1:723349111259:web:84d6d982b838c68da7e7fe",
    measurementId: "G-6Z229N0WFX"
};

const appId = 'pos-hunq-store';
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 3. GLOBAL STATE
let currentUser = null;
let userRole = 'staff';
let currentUserData = null;

// State Chi nhánh
let branches = [];
let currentBranchId = localStorage.getItem('pos_current_branch') || null;

// Data Sync
let products = [];
let categories = [];
let customers = [];
let ordersHistory = [];
let giftCards = [];

// --- LOGIC LƯU TRỮ LOCALSTORAGE ---
// Load đơn hàng tạm từ LocalStorage nếu có, nếu không khởi tạo mặc định
const savedOrders = localStorage.getItem('pos_orders_temp');
let orders = savedOrders ? JSON.parse(savedOrders) : [{ id: 1, name: 'Đơn #1', items: [], discount: { type: 'none', value: 0 }, customer: null, createdAt: Date.now() }];

// Đảm bảo currentOrderId hợp lệ
if (!orders || orders.length === 0) orders = [{ id: 1, name: 'Đơn #1', items: [], discount: { type: 'none', value: 0 }, customer: null, createdAt: Date.now() }];
let currentOrderId = orders[0].id;

// Hàm lưu tự động
const saveLocalOrders = () => {
    localStorage.setItem('pos_orders_temp', JSON.stringify(orders));
};

let currentView = 'pos';
let currentFilter = 'all';
let paymentMethod = 'cash';
let revenueChart = null;

// --- CONFIG HẠNG KHÁCH HÀNG ---
const RANKS = {
    member: { name: 'Thành viên', rate: 0.01, min: 0, color: 'bg-slate-100 text-slate-600' },
    regular: { name: 'Khách quen', rate: 0.03, min: 2000000, color: 'bg-blue-100 text-blue-600' }, // > 2 Triệu
    vip: { name: 'VIP', rate: 0.05, min: 10000000, color: 'bg-yellow-100 text-yellow-700' } // > 10 Triệu
};

// --- HELPER FUNCTIONS ---
window.formatInput = (el) => {
    let val = el.value.replace(/\D/g, '');
    if (val === '') { el.value = ''; return; }
    el.value = parseInt(val).toLocaleString('en-US');
};

window.getCleanValue = (id) => {
    const el = document.getElementById(id);
    if (!el) return 0;

    // Kiểm tra: Nếu có thuộc tính value (input) thì lấy, không thì lấy text (span/div)
    const rawVal = (el.value !== undefined) ? el.value : el.textContent;

    if (!rawVal) return 0;

    // Regex: Chỉ giữ lại số (0-9), dấu chấm (.) và dấu trừ (-)
    // Giúp loại bỏ các ký tự như "₫", ",", " "
    return parseFloat(rawVal.toString().replace(/[^0-9.-]/g, '')) || 0;
};

window.handleEnter = (e, btnId) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const btn = document.getElementById(btnId);
        if (btn) btn.click();
    }
};

window.formatMoney = (n) => n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

// Ẩn số điện thoại (chỉ hiện 5 số đầu, 3 số cuối)
const maskPhone = (phone) => {
    if (!phone || phone.length < 8) return phone;
    return phone.substring(0, 5) + '***' + phone.slice(-3);
};

// Ẩn dữ liệu nhạy cảm
const maskData = () => "******";

window.copyVar = (el) => {
    const text = el.innerText;
    navigator.clipboard.writeText(text).then(() => {
        const originalText = el.innerText;
        el.innerText = "Đã chép!";
        el.classList.add('bg-slate-800', 'text-white');
        setTimeout(() => {
            el.innerText = text;
            el.classList.remove('bg-slate-800', 'text-white');
        }, 1000);
    });
};

// --- DIALOG & TOAST ---
let dialogResolve = null;
let dialogKeyHandler = null;

const showDialog = (type, message, title = 'Thông báo', defaultValue = '') => {
    return new Promise((resolve) => {
        dialogResolve = resolve;
        const modal = document.getElementById('global-dialog');
        document.getElementById('dialog-title').textContent = title;
        document.getElementById('dialog-msg').textContent = message;
        const inputContainer = document.getElementById('dialog-input-container');
        const inputEl = document.getElementById('dialog-input');
        const cancelBtn = document.getElementById('dialog-cancel-btn');
        const confirmBtn = document.getElementById('dialog-confirm-btn');
        const iconEl = document.getElementById('dialog-icon');

        inputEl.value = defaultValue;
        modal.classList.remove('hidden');
        cancelBtn.classList.add('hidden');
        inputContainer.classList.add('hidden');

        if (dialogKeyHandler) document.removeEventListener('keydown', dialogKeyHandler);
        const finish = (val) => {
            if (dialogKeyHandler) document.removeEventListener('keydown', dialogKeyHandler);
            closeDialog(val);
        };

        confirmBtn.onclick = () => finish(true);
        cancelBtn.onclick = () => finish(false);

        dialogKeyHandler = (e) => {
            if (e.key === 'Enter') { e.preventDefault(); finish(true); }
            else if (e.key === 'Escape') { e.preventDefault(); finish(false); }
        };
        document.addEventListener('keydown', dialogKeyHandler);

        if (type === 'confirm') {
            iconEl.innerHTML = '<i class="fa-solid fa-circle-question text-orange-500"></i>';
            cancelBtn.classList.remove('hidden');
            confirmBtn.textContent = 'Đồng ý';
        } else if (type === 'prompt') {
            iconEl.innerHTML = '<i class="fa-solid fa-pen-to-square text-blue-500"></i>';
            cancelBtn.classList.remove('hidden');
            inputContainer.classList.remove('hidden');
            confirmBtn.textContent = 'Lưu';
            setTimeout(() => inputEl.focus(), 100);
        } else {
            iconEl.innerHTML = '<i class="fa-solid fa-circle-info text-blue-500"></i>';
            confirmBtn.textContent = 'OK';
        }
    });
};

const closeDialog = (res) => {
    const m = document.getElementById('global-dialog');
    m.classList.add('hidden');
    if (dialogResolve) {
        if (res === true && !document.getElementById('dialog-input-container').classList.contains('hidden'))
            dialogResolve(document.getElementById('dialog-input').value);
        else dialogResolve(res);
        dialogResolve = null;
    }
};

window.customAlert = (m) => showDialog('alert', m);
window.customConfirm = (m) => showDialog('confirm', m, 'Xác nhận');
window.customPrompt = (m, d) => showDialog('prompt', '', m, d);

window.showToast = (msg, err) => {
    const t = document.getElementById('toast');
    document.getElementById('toast-msg').textContent = msg;
    t.querySelector('i').className = err ? "fa-solid fa-exclamation text-red-400" : "fa-solid fa-check text-emerald-400";
    t.querySelector('div').className = err ? "w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 text-xl" : "w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 text-xl";
    t.classList.remove('translate-y-32', 'opacity-0');
    setTimeout(() => t.classList.add('translate-y-32', 'opacity-0'), 3000);
};

// --- AUTH & PHÂN QUYỀN ---
const applyRolePermissions = (role) => {
    const adminTabs = ['menu-inventory', 'menu-reports', 'menu-promos', 'btn-delete-all-history', 'btn-reset-counter', 'menu-print-settings'];

    adminTabs.forEach(id => {
        const el = document.getElementById(id);
        if (el) role === 'admin' ? el.classList.remove('hidden') : el.classList.add('hidden');
    });

    const btnBranch = document.getElementById('btn-manage-branches');
    if (btnBranch) role === 'admin' ? btnBranch.classList.remove('hidden') : btnBranch.classList.add('hidden');

    if (role !== 'admin' && (currentView === 'inventory' || currentView === 'reports' || currentView === 'promos')) {
        switchView('pos');
    }
};

onAuthStateChanged(auth, async (user) => {
    const loginModal = document.getElementById('login-modal');
    if (user) {
        currentUser = user;
        try {
            const userDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid));
            if (userDoc.exists()) {
                currentUserData = userDoc.data();
                userRole = currentUserData.role || 'staff';
                const roleName = userRole === 'admin' ? 'QUẢN LÝ' : 'NHÂN VIÊN';
                const displayEl = document.getElementById('user-role-display');
                if (displayEl) {
                    displayEl.innerHTML = `<span class="font-normal">${currentUserData.name || user.email}</span><span class="bg-slate-700 text-slate-300 text-[10px] px-1.5 py-0.5 rounded ml-1 border border-slate-600">${roleName}</span>`;
                }
                showToast(`Xin chào ${currentUserData.name || 'bạn'}!`);
            } else {
                userRole = 'staff';
                if (user.email.includes('admin')) userRole = 'admin';
            }
        } catch (e) { console.error(e); userRole = 'staff'; }

        applyRolePermissions(userRole);
        loginModal.classList.add('hidden');
        subscribeAll();
    } else {
        currentUser = null;
        userRole = null;
        currentUserData = null;
        loginModal.classList.remove('hidden');
    }
});

window.handleLogin = async () => {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    const btn = document.getElementById('btn-login');
    if (!email || !pass) return;

    try {
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Đang xử lý...';
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
        btn.innerHTML = '<span>Truy cập</span> <i class="fa-solid fa-arrow-right"></i>';
        document.getElementById('login-error').classList.remove('hidden');
        document.getElementById('login-error').textContent = "Đăng nhập thất bại!";
    }
};

window.handleLogout = async () => {
    if (await customConfirm("Bạn muốn kết thúc phiên làm việc?")) {
        await signOut(auth);
        window.location.reload();
    }
};

// --- DATA SYNC (MULTI-TENANT) ---
function subscribeAll() {
    // 1. Tải Chi Nhánh
    onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'branches'), (s) => {
        branches = [];
        s.forEach(d => branches.push({ id: d.id, ...d.data() }));

        if (branches.length > 0) {
            if (!currentBranchId || !branches.find(b => b.id === currentBranchId)) {
                currentBranchId = branches[0].id;
                localStorage.setItem('pos_current_branch', currentBranchId);
            }
        } else {
            currentBranchId = null;
        }
        renderBranchSelectUI();
        renderBranchListModal();
    });

    // 2. Tải Danh mục (LỌC theo chi nhánh)
    onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'categories'), (s) => {
        categories = [];
        s.forEach(d => {
            const data = d.data();
            if (currentBranchId && data.ownerBranchId === currentBranchId) {
                categories.push({ id: d.id, ...data });
            }
        });
        renderCategories();
    });

    // 3. Tải Sản phẩm (LỌC theo chi nhánh)
    onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'products'), (s) => {
        products = [];
        s.forEach(d => {
            const data = d.data();
            if (currentBranchId && data.ownerBranchId === currentBranchId) {
                products.push({
                    id: d.id,
                    ...data,
                    stock: typeof data.stock === 'number' ? data.stock : 0
                });
            }
        });
        renderProducts();
        if (userRole === 'admin') renderInventoryTable();
    });

    // 4. Khách hàng (Global)
    onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'customers'), (s) => {
        customers = []; s.forEach(d => customers.push({ id: d.id, ...d.data() }));
        renderCustomerList();
    });

    // 5. Lịch sử đơn hàng (Global)
    onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), (s) => {
        ordersHistory = []; s.forEach(d => ordersHistory.push({ id: d.id, ...d.data() }));
        renderHistoryTable();
        if (userRole === 'admin') renderStats();
    });

    // 6. Giftcards (Global)
    onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'giftcards'), (s) => {
        giftCards = []; s.forEach(d => giftCards.push({ id: d.id, ...d.data() }));
        renderGiftCardList();
    });
}

// --- BRANCH & COPY TOOL ---
window.renderBranchSelectUI = () => {
    const sel = document.getElementById('global-branch-select');
    if (!sel) return;
    if (branches.length === 0) { sel.innerHTML = '<option>Chưa có CN</option>'; return; }

    sel.innerHTML = branches.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
    if (currentBranchId) sel.value = currentBranchId;
};

window.switchBranch = (branchId) => {
    if (!branchId) return;
    currentBranchId = branchId;
    localStorage.setItem('pos_current_branch', branchId);
    window.location.reload();
};

window.toggleBranchModal = () => document.getElementById('branch-modal').classList.toggle('hidden');

window.renderBranchListModal = () => {
    const c = document.getElementById('branch-list-container');
    if (!c) return;
    c.innerHTML = branches.map(b => `
        <div class="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span class="font-bold text-slate-700">${b.name}</span>
            ${userRole === 'admin' ?
            `<div class="flex gap-2">
                    <button onclick="editBranch('${b.id}')" class="text-blue-500 hover:bg-blue-100 p-2 rounded transition"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="deleteBranch('${b.id}')" class="text-red-500 hover:bg-red-100 p-2 rounded transition"><i class="fa-solid fa-trash"></i></button>
                </div>` : ''}
        </div>
    `).join('');

    const fromSel = document.getElementById('copy-from-branch');
    const toSel = document.getElementById('copy-to-branch');
    if (fromSel && toSel) {
        const options = branches.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
        fromSel.innerHTML = options;
        toSel.innerHTML = options;
        if (currentBranchId && toSel.options.length > 0) toSel.value = currentBranchId;
    }
};

window.addNewBranch = async () => {
    if (userRole !== 'admin') return showToast("Chỉ Admin được thêm!", true);
    const name = document.getElementById('new-branch-name').value;
    if (!name) return showToast("Nhập tên chi nhánh!", true);
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'branches'), { name, createdAt: serverTimestamp() });
    document.getElementById('new-branch-name').value = '';
    showToast("Đã thêm chi nhánh");
};

window.deleteBranch = async (id) => {
    if (userRole !== 'admin') return showToast("Chỉ Admin được xóa!", true);
    if (branches.length <= 1) return showToast("Giữ ít nhất 1 chi nhánh!", true);
    if (await customConfirm("Xóa chi nhánh này?")) {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'branches', id));
    }
};

window.editBranch = async (id) => {
    if (userRole !== 'admin') return showToast("Chỉ Admin được sửa!", true);
    const currentBranch = branches.find(b => b.id === id);
    if (!currentBranch) return;
    const newName = await customPrompt("Đổi tên chi nhánh:", currentBranch.name);
    if (newName && newName !== currentBranch.name) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'branches', id), { name: newName });
        showToast("Đã cập nhật tên chi nhánh");
    }
};

// --- COPY STOCK TOOL (DEEP CLONE) ---
window.executeCopyStock = async () => {
    if (userRole !== 'admin') return showToast("Chỉ Admin được thao tác!", true);
    const fromId = document.getElementById('copy-from-branch').value;
    const toId = document.getElementById('copy-to-branch').value;
    if (!fromId || !toId || fromId === toId) return showToast("Chọn nguồn/đích khác nhau!", true);

    const fromName = branches.find(b => b.id === fromId)?.name;
    const toName = branches.find(b => b.id === toId)?.name;

    if (await customConfirm(`⚠️ COPY TOÀN BỘ?\n\nSao chép Danh mục & Sản phẩm từ [${fromName}] sang [${toName}]?`)) {
        try {
            showToast("⏳ Đang sao chép...", false);
            const catQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'categories'), where("ownerBranchId", "==", fromId));
            const catSnap = await getDocs(catQuery);
            const catIdMap = {};
            for (const docSnap of catSnap.docs) {
                const data = docSnap.data();
                const newRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'categories'), {
                    ...data, ownerBranchId: toId, createdAt: serverTimestamp()
                });
                catIdMap[docSnap.id] = newRef.id;
            }
            const prodQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'products'), where("ownerBranchId", "==", fromId));
            const prodSnap = await getDocs(prodQuery);
            const prodUpdates = prodSnap.docs.map(async (docSnap) => {
                const data = docSnap.data();
                const newCatId = catIdMap[data.category] || data.category;
                await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), {
                    ...data, category: newCatId, ownerBranchId: toId, createdAt: serverTimestamp()
                });
            });
            await Promise.all(prodUpdates);
            showToast(`✅ Đã sao chép xong!`);
            if (currentBranchId === toId) window.location.reload();
        } catch (e) { console.error(e); showToast("Lỗi sao chép: " + e.message, true); }
    }
};

// --- CUSTOMER MANAGEMENT (CRM - NEW) ---
window.toggleCustomerModal = () => {
    const m = document.getElementById('customer-modal');
    if (m.classList.contains('hidden')) {
        // Reset form
        ['cust-id', 'cust-name', 'cust-phone', 'cust-email', 'cust-social', 'cust-notes', 'cust-dob'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('cust-rank').value = 'member';
        // Chỉ Admin mới được sửa hạng thủ công
        document.getElementById('cust-rank').disabled = (userRole !== 'admin');
        m.classList.remove('hidden');
    } else m.classList.add('hidden');
};

window.saveCustomer = async () => {
    const id = document.getElementById('cust-id').value;
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const rank = document.getElementById('cust-rank').value;
    const email = document.getElementById('cust-email').value;
    const social = document.getElementById('cust-social').value;
    const notes = document.getElementById('cust-notes').value;
    const dob = document.getElementById('cust-dob').value;

    if (!name || !phone) return showToast("Nhập tên và số điện thoại!", true);

    const payload = {
        name, phone, email, rank, socialLink: social, notes, dob,
        updatedAt: serverTimestamp()
    };

    try {
        if (id) {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'customers', id), payload);
            showToast("Đã cập nhật khách hàng");
        } else {
            payload.points = 0;
            payload.totalSpent = 0;
            payload.lastVisit = null;
            payload.createdAt = serverTimestamp();
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'customers'), payload);
            showToast("Đã thêm khách hàng mới");
        }
        toggleCustomerModal();
    } catch (e) { showToast("Lỗi: " + e.message, true); }
};

window.editCustomer = (id) => {
    const c = customers.find(x => x.id === id);
    if (!c) return;

    // Nếu không phải admin thì không cho xem chi tiết dạng edit để tránh lộ full số
    if (userRole !== 'admin') return showToast("Chỉ Admin được sửa thông tin!", true);

    document.getElementById('cust-id').value = c.id;
    document.getElementById('cust-name').value = c.name;
    document.getElementById('cust-phone').value = c.phone;
    document.getElementById('cust-email').value = c.email || '';
    document.getElementById('cust-social').value = c.socialLink || '';
    document.getElementById('cust-notes').value = c.notes || '';
    document.getElementById('cust-dob').value = c.dob || '';
    document.getElementById('cust-rank').value = c.rank || 'member';

    document.getElementById('cust-rank').disabled = false;
    document.getElementById('customer-modal').classList.remove('hidden');
};

window.renderCustomerList = () => {
    const list = document.getElementById('customer-list');

    if (customers.length === 0) {
        list.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-slate-400">Chưa có dữ liệu khách hàng</td></tr>`;
        return;
    }

    list.innerHTML = customers.map(c => {
        const isAdmin = userRole === 'admin';

        // 1. Xử lý dữ liệu nhạy cảm
        const phone = isAdmin ? c.phone : maskPhone(c.phone);
        const email = c.email ? (isAdmin ? c.email : '*******') : '';
        const spent = isAdmin ? formatMoney(c.totalSpent || 0) : maskData();

        // 2. Xử lý Hạng & Màu sắc
        const rankInfo = RANKS[c.rank || 'member'] || RANKS.member;

        // 3. Thời gian ghé cuối
        const lastVisit = c.lastVisit ? new Date(c.lastVisit.seconds * 1000).toLocaleDateString('vi-VN') : 'Chưa có';

        // 4. Mạng xã hội icon
        let socialIcon = '';
        if (c.socialLink) {
            if (c.socialLink.includes('facebook')) socialIcon = '<i class="fa-brands fa-facebook text-blue-600"></i>';
            else if (c.socialLink.includes('zalo')) socialIcon = '<i class="fa-solid fa-z text-blue-500 font-black border border-blue-500 rounded-full px-1 text-[8px]"></i>';
            else if (c.socialLink.includes('instagram')) socialIcon = '<i class="fa-brands fa-instagram text-pink-600"></i>';
            else socialIcon = '<i class="fa-solid fa-link text-slate-400"></i>';
        }

        return `
        <tr class="border-b border-slate-100 hover:bg-slate-50 transition group">
            <td class="p-4 align-top">
                <div class="font-bold text-slate-700 text-sm">${c.name}</div>
                ${c.socialLink ? `<a href="${c.socialLink}" target="_blank" class="inline-flex items-center gap-1 mt-1 text-[10px] bg-slate-100 px-2 py-0.5 rounded-full hover:bg-blue-50 transition">${socialIcon} <span class="text-slate-500">Social</span></a>` : ''}
            </td>

            <td class="p-4 align-top">
                <div class="text-sm font-medium text-slate-600"><i class="fa-solid fa-phone text-[10px] w-4 text-slate-400"></i> ${phone}</div>
                ${email ? `<div class="text-xs text-slate-400 mt-0.5 truncate max-w-[120px]" title="${email}"><i class="fa-solid fa-envelope text-[10px] w-4"></i> ${email}</div>` : ''}
            </td>

            <td class="p-4 align-top">
                <span class="${rankInfo.color} px-2 py-1 rounded text-[10px] font-bold uppercase inline-block mb-1 border border-black/5">${rankInfo.name}</span>
                <div class="text-xs font-bold text-orange-500"><i class="fa-solid fa-star text-[10px] mr-1"></i>${(c.points || 0).toLocaleString('en-US')} điểm</div>
            </td>

            <td class="p-4 align-top font-bold text-slate-700 text-sm">
                ${spent}
            </td>

            <td class="p-4 align-top text-sm text-slate-500">
                ${lastVisit}
            </td>

            <td class="p-4 align-top">
                <div class="text-xs text-slate-500 line-clamp-2 max-w-[180px] italic" title="${c.notes || ''}">
                    ${c.notes || '-'}
                </div>
            </td>

            <td class="p-4 align-top text-right">
                <div class="flex justify-end gap-2 opacity-100 sm:opacity-100 ">
                    <button onclick="editCustomer('${c.id}')" class="bg-white border border-slate-200 text-blue-600 w-8 h-8 rounded-lg hover:bg-blue-50 hover:border-blue-200 shadow-sm transition" title="Sửa & Lịch sử">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    ${userRole === 'admin' ?
                `<button onclick="deleteCustomer('${c.id}')" class="bg-white border border-slate-200 text-red-500 w-8 h-8 rounded-lg hover:bg-red-50 hover:border-red-200 shadow-sm transition" title="Xóa khách hàng">
                        <i class="fa-solid fa-trash"></i>
                    </button>` : ''}
                </div>
            </td>
        </tr>`;
    }).join('');
};

// --- DELETE CUSTOMER ---
window.deleteCustomer = async (id) => {
    // 1. Kiểm tra quyền
    if (userRole !== 'admin') return showToast("Chỉ Admin được xóa khách hàng!", true);

    // 2. Xác nhận
    if (await customConfirm("⚠️ Xóa khách hàng này?\n\nDữ liệu điểm và lịch sử mua hàng gắn với khách này sẽ mất liên kết.")) {
        try {
            // 3. Xóa trên Firestore
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'customers', id));

            showToast("Đã xóa khách hàng thành công");
            // onSnapshot sẽ tự động cập nhật lại danh sách, không cần gọi render thủ công
        } catch (e) {
            console.error(e);
            showToast("Lỗi xóa: " + e.message, true);
        }
    }
};

// --- SMART CUSTOMER SELECT (POS) ---
window.toggleCustomerSelectModal = () => {
    const m = document.getElementById('customer-select-modal');
    if (m.classList.contains('hidden')) {
        m.classList.remove('hidden');
        document.getElementById('cust-search-input').value = '';
        document.getElementById('cust-search-input').focus();
        renderCustomerSelectItems();
    } else {
        m.classList.add('hidden');
    }
};

window.renderCustomerSelectItems = () => {
    const s = document.getElementById('cust-search-input').value.toLowerCase();
    const list = document.getElementById('customer-select-list');

    const filtered = customers.filter(c => c.name.toLowerCase().includes(s) || c.phone.includes(s)).slice(0, 10);

    if (filtered.length === 0) {
        list.innerHTML = `<div class="p-4 text-center text-slate-400 text-sm">Không tìm thấy khách hàng.<br>Hãy tạo mới!</div>`;
        return;
    }

    list.innerHTML = filtered.map(c => {
        const rankInfo = RANKS[c.rank || 'member'] || RANKS.member;
        return `
        <div onclick="selectCustomerFromModal('${c.id}')" class="p-3 bg-white border border-slate-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition flex justify-between items-center group">
            <div>
                <div class="font-bold text-slate-700 group-hover:text-blue-700">${c.name}</div>
                <div class="text-xs text-slate-400">${c.phone}</div>
            </div>
            <div class="text-right">
                <span class="${rankInfo.color} px-2 py-0.5 rounded text-[10px] font-bold uppercase">${rankInfo.name}</span>
                <div class="text-xs text-slate-400 mt-1">Điểm: <b>${c.points || 0}</b></div>
            </div>
        </div>`;
    }).join('');
};

window.selectCustomerFromModal = (id) => {
    const cust = customers.find(c => c.id === id);
    if (cust) {
        getActiveOrder().customer = cust;
        document.getElementById('current-customer-name').textContent = cust.name;
        showToast(`Đã chọn: ${cust.name}`);
        saveLocalOrders();
        toggleCustomerSelectModal();
    }
};

window.selectCustomerForOrder = () => {
    toggleCustomerSelectModal();
};

// --- VIEW SWITCHING ---
window.switchView = (view) => {
    if (userRole !== 'admin' && ['inventory', 'reports', 'promos'].includes(view)) return showToast("Không có quyền!", true);
    currentView = view;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const menuItem = document.getElementById(`menu-${view}`);
    if (menuItem) menuItem.classList.add('active');
    ['pos', 'inventory', 'history', 'customers', 'reports', 'promos', 'print-settings'].forEach(v => {
        document.getElementById(`view-${v}`).classList.add('hidden');
    });
    document.getElementById(`view-${view}`).classList.remove('hidden');
    view === 'pos' ? document.getElementById('sidebar-cart').classList.remove('hidden') : document.getElementById('sidebar-cart').classList.add('hidden');
};

// --- STOCK LOGIC ---
function checkStockAvailability(productId, requestQty) {
    const product = products.find(p => p.id === productId);
    if (!product) return false;
    if (product.stock === -1) return true;
    return requestQty <= product.stock;
}

// --- ADMIN ACTIONS (NO IMAGE/NO COLOR) ---
window.saveProduct = async () => {
    if (userRole !== 'admin') return showToast("Chỉ Admin được sửa!", true);
    if (!currentBranchId) return showToast("Chọn chi nhánh trước!", true);

    const id = document.getElementById('prod-id').value;
    const name = document.getElementById('prod-name').value;
    const price = getCleanValue('prod-price');
    const category = document.getElementById('prod-cat').value;
    const stockType = document.querySelector('input[name="stock-type"]:checked').value;
    const stockQty = stockType === 'infinite' ? -1 : getCleanValue('prod-stock');
    const desc = document.getElementById('prod-desc').value;

    if (!name || !price) return showToast("Thiếu thông tin", true);

    const d = {
        name, price, category, stock: stockQty, ownerBranchId: currentBranchId,
        description: desc, updatedAt: serverTimestamp(), color: 'bg-slate-100'
    };

    try {
        if (id) await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', id), d);
        else { d.createdAt = serverTimestamp(); await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), d); }
        showToast("Đã lưu sản phẩm");
        toggleAddProductModal();
    } catch (e) { showToast("Lỗi: " + e.message, true); }
};

window.deleteProduct = async () => {
    if (userRole !== 'admin') return showToast("Không có quyền!", true);
    const id = document.getElementById('prod-id').value;
    if (await customConfirm("Xóa sản phẩm này vĩnh viễn?")) {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', id));
        showToast("Đã xóa");
        toggleAddProductModal();
    }
};

window.editProduct = (id) => {
    if (userRole !== 'admin') return showToast("Chỉ Admin được sửa!", true);
    const p = products.find(x => x.id === id);
    if (!p) return;

    document.getElementById('prod-id').value = p.id;
    document.getElementById('prod-name').value = p.name;
    document.getElementById('prod-price').value = p.price.toLocaleString('en-US');
    document.getElementById('prod-cat').value = p.category;
    if (p.stock === -1) {
        document.querySelector('input[value="infinite"]').checked = true;
        document.getElementById('prod-stock').value = '';
    } else {
        document.querySelector('input[value="limited"]').checked = true;
        document.getElementById('prod-stock').value = p.stock.toLocaleString('en-US');
    }
    window.toggleStockInput();
    document.getElementById('prod-desc').value = p.description || '';
    document.getElementById('modal-prod-title').innerText = "✏️ Sửa sản phẩm";
    document.getElementById('btn-delete-prod').classList.remove('hidden');
    document.getElementById('add-product-modal').classList.remove('hidden');
};

window.addCategory = async () => {
    if (!currentBranchId) return showToast("Chọn chi nhánh!", true);
    const n = document.getElementById('new-cat-name').value;
    if (n) {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'categories'), {
            name: n, ownerBranchId: currentBranchId
        });
        document.getElementById('new-cat-name').value = '';
    }
};

// --- CART & ORDER ---
function getActiveOrder() { return orders.find(o => o.id === currentOrderId) || orders[0]; }

window.addToCart = (p) => {
    const o = getActiveOrder();
    const existingItem = o.items.find(x => x.id === p.id);
    const currentQty = existingItem ? existingItem.qty : 0;
    if (!checkStockAvailability(p.id, currentQty + 1)) return showToast(`Hết hàng! Kho còn ${p.stock}`, true);

    if (existingItem) existingItem.qty++;
    else o.items.push({ ...p, qty: 1 });
    renderCart();
};

window.updateQty = (id, change) => {
    const o = getActiveOrder();
    const item = o.items.find(x => x.id === id);
    if (!item) return;
    const newQty = item.qty + change;
    if (change > 0 && !checkStockAvailability(id, newQty)) return showToast("Không đủ tồn kho!", true);
    item.qty = newQty;
    if (item.qty <= 0) o.items = o.items.filter(x => x.id !== id);
    renderCart();
};

window.updateItemPrice = (id, valStr) => {
    const order = getActiveOrder();
    const item = order.items.find(x => x.id === id);
    if (item) { item.price = parseFloat(valStr.replace(/,/g, '')) || 0; renderCart(); }
};

window.renderCart = () => {
    const o = getActiveOrder();
    const c = document.getElementById('cart-items');
    // SAVE TO LOCALSTORAGE
    saveLocalOrders();

    if (o.items.length === 0) {
        c.innerHTML = `<div class="flex flex-col items-center justify-center h-48 text-slate-300"><i class="fa-solid fa-basket-shopping text-4xl mb-3 opacity-30"></i><p>Trống</p></div>`;
    } else {
        c.innerHTML = o.items.map(i => `
            <div class="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition">
                <div class="flex-1 min-w-0">
                    <div class="font-bold text-slate-700 text-sm truncate mb-1">${i.name}</div>
                    <div class="flex items-center gap-1">
                        <input type="text" inputmode="numeric" class="text-xs font-medium text-blue-600 bg-blue-50/50 border-b border-transparent hover:border-blue-200 focus:border-blue-500 rounded px-1 w-20 outline-none" value="${i.price.toLocaleString('en-US')}" oninput="formatInput(this)" onchange="updateItemPrice('${i.id}', this.value)">
                        <span class="text-[10px] text-slate-400">đ</span>
                    </div>
                </div>
                <div class="flex items-center bg-slate-50 rounded-lg p-1">
                    <button onclick="updateQty('${i.id}',-1)" class="w-7 h-7 rounded text-slate-400 hover:text-red-500"><i class="fa-solid fa-minus text-xs"></i></button>
                    <span class="w-8 text-center text-sm font-bold">${i.qty}</span>
                    <button onclick="updateQty('${i.id}',1)" class="w-7 h-7 rounded text-slate-400 hover:text-blue-500"><i class="fa-solid fa-plus text-xs"></i></button>
                </div>
            </div>`).join('');
    }
    updateTotals(o);
};

function updateTotals(o) {
    // A. Khởi tạo cấu trúc giảm giá nếu chưa có (tránh lỗi null)
    if (!o.discounts) o.discounts = { coupon: null, manual: null, points: 0 };

    // B. Tính Tổng tiền hàng (Subtotal)
    const subtotal = o.items.reduce((a, b) => a + (b.price * b.qty), 0);

    let totalDiscountMoney = 0; // Tổng số tiền được giảm

    // C. Cộng dồn các khoản giảm:

    // 1. Từ Coupon
    if (o.discounts.coupon) {
        if (o.discounts.coupon.type === 'percent') {
            totalDiscountMoney += subtotal * (o.discounts.coupon.value / 100);
        } else {
            totalDiscountMoney += o.discounts.coupon.value;
        }
    }

    // 2. Từ Giảm tay (Manual)
    if (o.discounts.manual) {
        if (o.discounts.manual.type === 'percent') {
            totalDiscountMoney += subtotal * (o.discounts.manual.value / 100);
        } else {
            totalDiscountMoney += o.discounts.manual.value;
        }
    }

    // 3. Từ Điểm (1 điểm = 1đ)
    totalDiscountMoney += (o.discounts.points || 0);

    // D. Tính Khách phải trả (Final Total)
    // Không được âm (Math.max 0)
    const finalTotal = Math.max(0, subtotal - totalDiscountMoney);

    // E. Hiển thị lên giao diện
    document.getElementById('cart-subtotal').textContent = formatMoney(subtotal);
    document.getElementById('cart-total').textContent = formatMoney(finalTotal);

    // Hiển thị dòng "Giảm giá" nếu có
    const discRow = document.getElementById('row-discount');
    const discVal = document.getElementById('cart-discount');
    const discLabel = document.getElementById('discount-label'); // Label nhỏ hiển thị chi tiết

    if (totalDiscountMoney > 0) {
        discRow.classList.remove('hidden');
        discVal.textContent = `-${formatMoney(totalDiscountMoney)}`;

        // Tạo dòng mô tả chi tiết (VD: Voucher, Điểm, Giảm tay)
        let details = [];
        if (o.discounts.coupon) details.push(`Mã ${o.discounts.coupon.code}`);
        if (o.discounts.manual) details.push(`Giảm tay`);
        if (o.discounts.points > 0) details.push(`Tiêu điểm`);

        discLabel.textContent = details.join(', ');
    } else {
        discRow.classList.add('hidden');
    }

    // F. Trạng thái nút thanh toán
    const btnCheckout = document.getElementById('btn-checkout');
    btnCheckout.disabled = o.items.length === 0;
    if (o.items.length === 0) btnCheckout.classList.add('opacity-50', 'grayscale');
    else btnCheckout.classList.remove('opacity-50', 'grayscale');
}

// --- PAYMENT & TRANSACTION (MT-XXXXXX + LOYALTY) ---
window.processPayment = async (print) => {
    // 1. VALIDATE
    if (!currentBranchId) return showToast("Lỗi: Chưa chọn chi nhánh!", true);

    const totalVal = parseInt(document.getElementById('modal-total-amount').textContent.replace(/\D/g, ''));
    if (paymentMethod === 'cash' && getCleanValue('cash-given') < totalVal) {
        return showToast("Thiếu tiền khách đưa!", true);
    }

    const order = getActiveOrder();
    if (!order.discounts) order.discounts = { coupon: null, manual: null, points: 0 };

    let pointsEarned = 0;
    let pointsUsed = order.discounts.points || 0;

    // Tính điểm
    if (order.customer) {
        const currentCust = customers.find(c => c.id === order.customer.id) || order.customer;
        const rankKey = currentCust.rank || 'member';
        const rankConfig = RANKS[rankKey] || RANKS.member;
        pointsEarned = Math.floor(totalVal * rankConfig.rate);
    }

    const basePayload = {
        items: order.items,
        totals: {
            subtotal: getCleanValue('cart-subtotal'),
            finalTotal: totalVal,
            discountVal: getCleanValue('cart-discount')
        },
        customer: order.customer ? { id: order.customer.id, name: order.customer.name, phone: order.customer.phone } : null,
        paymentMethod, // <--- Biến toàn cục này đã có giá trị
        discountsApplied: order.discounts,
        pointsEarned,
        pointsUsed,
        cashierId: currentUser.uid,
        cashierName: currentUserData?.name || 'Unknown',
        branchId: currentBranchId,
        branchName: branches.find(b => b.id === currentBranchId)?.name || 'Unknown',
        completedAt: serverTimestamp(),
        status: 'active'
    };

    let newId = null;

    try {
        if (order.originalId) {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', order.originalId), basePayload);
            showToast("Đã cập nhật đơn hàng");
        } else {
            await runTransaction(db, async (transaction) => {
                const counterRef = doc(db, 'artifacts', appId, 'public', 'data', 'counters', 'orders');
                const counterSnap = await transaction.get(counterRef);

                let custRef = null;
                let custSnap = null;
                if (order.customer) {
                    custRef = doc(db, 'artifacts', appId, 'public', 'data', 'customers', order.customer.id);
                    custSnap = await transaction.get(custRef);
                }

                let couponRef = null;
                let couponSnap = null;
                if (order.discounts.coupon && order.discounts.coupon.id) {
                    couponRef = doc(db, 'artifacts', appId, 'public', 'data', 'giftcards', order.discounts.coupon.id);
                    couponSnap = await transaction.get(couponRef);
                }

                let newIndex = 0;
                if (counterSnap.exists()) {
                    newIndex = counterSnap.data().lastIndex + 1;
                }

                newId = `MT-${String(newIndex).padStart(6, '0')}`;

                if (couponSnap) {
                    if (!couponSnap.exists()) throw "Mã giảm giá không tồn tại!";
                    if (couponSnap.data().status === 'used') throw "Mã giảm giá này đã bị sử dụng!";
                }

                let custUpdateData = null;
                let logUseData = null;
                let logEarnData = null;

                if (custSnap && custSnap.exists()) {
                    const cData = custSnap.data();
                    const currentPoints = cData.points || 0;

                    if (pointsUsed > currentPoints) throw `Khách hàng không đủ điểm!`;

                    let runningBalance = currentPoints;

                    if (pointsUsed > 0) {
                        runningBalance -= pointsUsed;
                        logUseData = {
                            customerId: order.customer.id, orderId: newId, type: 'use', amount: -pointsUsed,
                            balanceAfter: runningBalance, description: `Thanh toán đơn ${newId}`, createdAt: serverTimestamp()
                        };
                    }

                    const dbRankKey = cData.rank || 'member';
                    const dbRankConfig = RANKS[dbRankKey] || RANKS.member;
                    const dbPointsEarned = Math.floor(totalVal * dbRankConfig.rate);

                    if (dbPointsEarned > 0) {
                        runningBalance += dbPointsEarned;
                        logEarnData = {
                            customerId: order.customer.id, orderId: newId, type: 'earn', amount: dbPointsEarned,
                            balanceAfter: runningBalance, description: `Tích điểm đơn ${newId}`, createdAt: serverTimestamp()
                        };
                    }

                    const newTotalSpent = (cData.totalSpent || 0) + totalVal;
                    let newRank = cData.rank || 'member';
                    if (newTotalSpent >= RANKS.vip.min) newRank = 'vip';
                    else if (newTotalSpent >= RANKS.regular.min) newRank = 'regular';

                    custUpdateData = { points: runningBalance, totalSpent: newTotalSpent, rank: newRank, lastVisit: serverTimestamp() };
                }

                transaction.set(counterRef, { lastIndex: newIndex }, { merge: true });
                const newOrderRef = doc(db, 'artifacts', appId, 'public', 'data', 'orders', newId);
                transaction.set(newOrderRef, { ...basePayload, id: newId });

                if (couponRef) {
                    transaction.update(couponRef, {
                        status: 'used',
                        usageLog: { orderId: newId, customerId: order.customer ? order.customer.id : null, customerName: order.customer ? order.customer.name : 'Khách lẻ', usedAt: serverTimestamp() }
                    });
                }

                if (custRef && custUpdateData) {
                    transaction.update(custRef, custUpdateData);
                    if (logUseData) transaction.set(doc(collection(db, 'artifacts', appId, 'public', 'data', 'point_logs')), logUseData);
                    if (logEarnData) transaction.set(doc(collection(db, 'artifacts', appId, 'public', 'data', 'point_logs')), logEarnData);
                }
            });

            for (const item of order.items) {
                if (item.stock !== -1) {
                    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', item.id), { stock: item.stock - item.qty });
                }
            }

            let msg = "Thanh toán thành công!";
            if (pointsEarned > 0) msg += ` (+${pointsEarned} điểm)`;
            if (pointsUsed > 0) msg += ` (-${pointsUsed} điểm)`;
            showToast(msg);
        }

        // 5. IN HÓA ĐƠN & RESET
        closeCheckoutModal();

        if (print) {
            const printId = newId || order.originalId;

            // --- SỬA LỖI TẠI ĐÂY: Thêm paymentMethod vào object in ---
            const printData = {
                id: printId,
                items: order.items,
                totals: basePayload.totals,
                customer: order.customer,
                cashierName: currentUserData?.name,
                paymentMethod: basePayload.paymentMethod, // <--- DÒNG QUAN TRỌNG VỪA THÊM
                completedAt: { seconds: Date.now() / 1000 }
            };

            setTimeout(() => printReceiptData(printData), 500);
        }

        if (orders.length > 1) {
            orders = orders.filter(o => o.id !== currentOrderId);
            currentOrderId = orders[orders.length - 1].id;
        } else {
            orders[0].items = [];
            orders[0].discounts = { coupon: null, manual: null, points: 0 };
            orders[0].customer = null;
            orders[0].originalId = null;
        }

        saveLocalOrders();
        renderOrderTabs();
        renderCart();

        ['disc-coupon-input', 'disc-manual-input', 'disc-point-input'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });

    } catch (e) {
        console.error(e);
        showToast("Lỗi: " + (typeof e === 'string' ? e : e.message), true);
    }
};

// --- POINT HISTORY LOGIC ---

// Hàm tải và hiển thị lịch sử
window.renderPointHistory = async (customerId) => {
    const container = document.getElementById('cust-point-history-list');
    if (!container) return;

    container.innerHTML = `<tr><td colspan="3" class="p-4 text-center text-slate-400"><i class="fa-solid fa-circle-notch fa-spin"></i> Đang tải...</td></tr>`;

    try {
        // Query bảng point_logs, lọc theo customerId, sắp xếp mới nhất, lấy 20 dòng
        // Cần import orderBy và limit ở đầu file app.js
        const q = query(
            collection(db, 'artifacts', appId, 'public', 'data', 'point_logs'),
            where("customerId", "==", customerId),
            orderBy("createdAt", "desc"),
            limit(30)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            container.innerHTML = `<tr><td colspan="3" class="p-4 text-center text-slate-400 italic text-xs">Chưa có lịch sử điểm</td></tr>`;
            return;
        }

        container.innerHTML = querySnapshot.docs.map(doc => {
            const d = doc.data();
            const date = d.createdAt ? new Date(d.createdAt.seconds * 1000).toLocaleString('vi-VN') : '-';
            const isEarn = d.type === 'earn';
            const amountClass = isEarn ? 'text-emerald-600' : 'text-red-500';
            const sign = isEarn ? '+' : '';

            return `
            <tr class="border-b border-slate-50 hover:bg-slate-50">
                <td class="p-2 text-[10px] text-slate-500 align-top">${date}</td>
                <td class="p-2 text-xs text-slate-700">
                    <div class="font-bold">${isEarn ? 'Tích điểm' : 'Sử dụng'}</div>
                    <div class="text-[10px] text-slate-400">${d.description || ''}</div>
                </td>
                <td class="p-2 text-right font-bold text-xs ${amountClass}">${sign}${d.amount}</td>
            </tr>`;
        }).join('');

    } catch (e) {
        console.error("Lỗi tải lịch sử điểm:", e);
        // Lưu ý: Nếu lỗi "The query requires an index", bạn cần mở Console Firebase và tạo Index theo link nó gợi ý.
        // Tạm thời nếu chưa có index, có thể bỏ orderBy để test.
        container.innerHTML = `<tr><td colspan="3" class="p-2 text-center text-red-400 text-xs">Cần tạo Index trên Firebase</td></tr>`;
    }
};

// Hàm wrapper để nút refresh gọi
window.refreshPointHistory = () => {
    const id = document.getElementById('cust-id').value;
    if (id) renderPointHistory(id);
};

// Cập nhật hàm editCustomer để gọi render lịch sử
window.editCustomer = (id) => {
    if (userRole !== 'admin') return showToast("Chỉ Admin được xem chi tiết!", true);
    const c = customers.find(x => x.id === id); if (!c) return;

    // Fill data cũ
    document.getElementById('cust-id').value = c.id;
    document.getElementById('cust-name').value = c.name;
    document.getElementById('cust-phone').value = c.phone;
    document.getElementById('cust-email').value = c.email || '';
    document.getElementById('cust-social').value = c.socialLink || '';
    document.getElementById('cust-notes').value = c.notes || '';
    document.getElementById('cust-dob').value = c.dob || '';
    document.getElementById('cust-rank').value = c.rank || 'member';
    document.getElementById('cust-rank').disabled = false;

    document.getElementById('customer-modal').classList.remove('hidden');

    // GỌI HÀM TẢI LỊCH SỬ
    renderPointHistory(c.id);
};

// --- RENDERS & FILTERS ---
window.renderCategories = () => {
    const html = `<button onclick="filterCategory('all')" class="cat-btn ${currentFilter === 'all' ? 'active' : 'bg-white text-slate-600 border border-slate-200'} px-5 py-2 rounded-xl text-sm font-bold shadow-sm transition">Tất cả</button>` +
        categories.map(c => `<button onclick="filterCategory('${c.id}')" class="cat-btn ${currentFilter === c.id ? 'active' : 'bg-white text-slate-600 border border-slate-200'} px-5 py-2 rounded-xl text-sm font-bold shadow-sm transition">${c.name}</button>`).join('');
    document.getElementById('pos-categories').innerHTML = html;
    document.getElementById('prod-cat').innerHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
};

window.renderProducts = () => {
    const s = document.getElementById('pos-search-input').value.toLowerCase();
    document.getElementById('products-grid').innerHTML = products.filter(p => p.name.toLowerCase().includes(s) && (currentFilter === 'all' || p.category === currentFilter)).map(p => `
        <div onclick="addToCart({id:'${p.id}',name:'${p.name}',price:${p.price},stock:${p.stock}})" 
             class="product-card group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-500 hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col h-[140px] select-none">
            <div class="p-4 flex flex-col justify-between h-full">
                <div>
                    <div class="flex justify-between items-start mb-2">
                         ${p.stock === -1 ? '<span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Có sẵn</span>' :
            (p.stock > 0 ? `<span class="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">Kho: ${p.stock}</span>` : '<span class="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">Hết hàng</span>')}
                    </div>
                    <h3 class="font-bold text-slate-700 text-sm leading-snug line-clamp-3 group-hover:text-blue-600 transition" title="${p.name}">${p.name}</h3>
                </div>
                <div class="flex justify-between items-end mt-1">
                    <span class="font-black text-lg text-slate-800 tracking-tight">${formatMoney(p.price)}</span>
                    <i class="fa-solid fa-circle-plus text-slate-200 text-2xl group-hover:text-blue-600 transition"></i>
                </div>
            </div>
        </div>`).join('');
};

window.filterCategory = (c) => { currentFilter = c; renderCategories(); renderProducts(); };
window.renderOrderTabs = () => {
    const container = document.getElementById('order-tabs-container');
    if (!container) return;

    container.innerHTML = orders.map(o => {
        const isActive = o.id === currentOrderId;

        // CSS cho nút Tab chính (Thêm relative, group, và padding phải pr-7)
        const tabBtnClass = `relative group px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition pr-7 border ${isActive ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`;

        // CSS cho nút Xoá nhỏ (Tuyệt đối ở góc phải, chỉ hiện khi hover group)
        // Nút X sẽ có màu khác một chút tùy vào tab đó có đang active hay không
        const deleteBtnClass = `absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-sm transition-all opacity-0 group-hover:opacity-100 hover:scale-110 ${isActive ? 'bg-slate-600 text-slate-200 hover:bg-red-500 hover:text-white' : 'bg-slate-200 text-slate-400 hover:bg-red-500 hover:text-white'}`;

        return `
        <button onclick="switchOrder(${o.id})" class="${tabBtnClass}">
            ${o.name}
            
            <div onclick="deleteSpecificOrder(${o.id}, event)" class="${deleteBtnClass}" title="Xoá tab này">
                <i class="fa-solid fa-xmark"></i>
            </div>
        </button>
        `;
    }).join('');

    // Cập nhật tên đơn hàng hiện tại trên tiêu đề
    const currentOrder = getActiveOrder();
    if (currentOrder) {
        document.getElementById('current-order-name').textContent = currentOrder.name;
        document.getElementById('current-customer-name').textContent = currentOrder.customer ? currentOrder.customer.name : 'Khách lẻ';
    }
}; window.switchOrder = (id) => { currentOrderId = id; renderOrderTabs(); renderCart(); document.getElementById('current-customer-name').textContent = getActiveOrder().customer ? getActiveOrder().customer.name : 'Khách lẻ'; };
window.createNewOrder = () => { const id = Date.now(); orders.push({ id, name: `Đơn #${orders.length + 1}`, items: [], discount: { type: 'none', value: 0 }, customer: null }); currentOrderId = id; renderOrderTabs(); renderCart(); };
window.deleteSpecificOrder = async (id, event) => {
    // NGĂN CHẶN SỰ KIỆN LAN TRUYỀN
    // (Để khi bấm nút X không bị kích hoạt sự kiện switchOrder của nút cha)
    if (event) event.stopPropagation();

    // Không cho phép xoá nếu chỉ còn 1 tab
    if (orders.length <= 1) {
        showToast("Cần giữ lại ít nhất 1 tab đơn hàng!", true);
        return;
    }

    if (await customConfirm(`Bạn muốn xoá tab "${orders.find(o => o.id === id)?.name}"?`)) {
        // Lọc bỏ đơn hàng có id tương ứng
        orders = orders.filter(o => o.id !== id);

        // Nếu tab vừa xoá là tab đang mở, chuyển về tab cuối cùng còn lại
        if (id === currentOrderId) {
            currentOrderId = orders[orders.length - 1].id;
        }

        // Lưu và render lại
        saveLocalOrders();
        renderOrderTabs();
        renderCart();
        showToast("Đã xoá tab đơn hàng");
    }
};
window.deleteCurrentOrder = async () => { if (orders.length <= 1) { if (await customConfirm("Xóa sạch đơn?")) { orders[0].items = []; renderCart(); } } else { if (await customConfirm("Đóng đơn?")) { orders = orders.filter(o => o.id !== currentOrderId); currentOrderId = orders[orders.length - 1].id; renderOrderTabs(); renderCart(); } } };
window.renameCurrentOrder = async () => { const o = getActiveOrder(); const n = await customPrompt("Tên đơn:", o.name); if (n) { o.name = n; renderOrderTabs(); document.getElementById('current-order-name').textContent = n; saveLocalOrders(); } };

window.toggleAddProductModal = () => { const m = document.getElementById('add-product-modal'); if (m.classList.contains('hidden')) { document.getElementById('modal-prod-title').innerText = "✨ Thêm dịch vụ"; document.getElementById('prod-id').value = ''; document.getElementById('prod-name').value = ''; document.getElementById('prod-price').value = ''; document.getElementById('prod-stock').value = ''; document.getElementById('btn-delete-prod').classList.add('hidden'); m.classList.remove('hidden'); } else m.classList.add('hidden'); };
window.openProductModal = () => window.toggleAddProductModal();
window.toggleCategoryModal = () => document.getElementById('category-modal').classList.toggle('hidden');
window.openCategoryModal = () => document.getElementById('category-modal').classList.remove('hidden');
window.closeCheckoutModal = () => document.getElementById('checkout-modal').classList.add('hidden');
window.toggleStockInput = () => { const v = document.querySelector('input[name="stock-type"]:checked').value; document.getElementById('stock-input-container').classList.toggle('hidden', v !== 'limited'); };

window.renderInventoryTable = () => {
    const s = document.getElementById('inv-search').value.toLowerCase();
    const bName = branches.find(b => b.id === currentBranchId)?.name || 'N/A';
    document.getElementById('inventory-list').innerHTML = products.filter(p => p.name.toLowerCase().includes(s)).map(p => `
        <tr class="hover:bg-slate-50 transition border-b border-slate-100">
            <td class="p-4 font-bold text-slate-700">${p.name}<div class="text-[10px] text-slate-400 font-normal line-clamp-1">${p.description || ''}</div></td>
            <td class="p-4 text-sm">${categories.find(c => c.id === p.category)?.name || '-'}</td>
            <td class="p-4 font-medium text-blue-600">${formatMoney(p.price)}</td>
            <td class="p-4">${p.stock === -1 ? '<span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Vô hạn</span>' : `<span class="font-bold text-slate-700">${p.stock}</span> <span class="text-xs text-slate-400">tại ${bName}</span>`}</td>
            <td class="p-4 text-right"><button onclick="editProduct('${p.id}')" class="bg-slate-100 hover:bg-slate-200 text-slate-600 w-8 h-8 rounded-lg transition"><i class="fa-solid fa-pen"></i></button></td>
        </tr>`).join('');
};

// --- HISTORY & STATS ---
window.renderHistoryTable = () => {
    const cashierSel = document.getElementById('filter-cashier');
    if (cashierSel && cashierSel.options.length <= 1 && ordersHistory.length > 0) {
        const uniqueCashiers = [...new Set(ordersHistory.map(o => o.cashierName || 'Unknown'))];
        const currentVal = cashierSel.value;
        cashierSel.innerHTML = '<option value="all">Tất cả</option>' + uniqueCashiers.map(n => `<option value="${n}">${n}</option>`).join('');
        if (currentVal) cashierSel.value = currentVal;

        const branchSel = document.getElementById('filter-branch-history');
        if (branchSel && branches.length > 0) {
            const currentBranchVal = branchSel.value;
            branchSel.innerHTML = '<option value="all">Tất cả</option>' + branches.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
            if (currentBranchVal) branchSel.value = currentBranchVal;
        }
    }

    const search = document.getElementById('history-search')?.value.toLowerCase() || '';
    const startDate = document.getElementById('filter-date-start')?.value;
    const endDate = document.getElementById('filter-date-end')?.value;
    const filterBranch = document.getElementById('filter-branch-history')?.value || 'all';
    const filterCashier = document.getElementById('filter-cashier')?.value || 'all';
    const filterStatus = document.getElementById('filter-status')?.value || 'active';

    let filtered = ordersHistory.filter(o => {
        const isDeleted = o.status === 'deleted';
        if (filterStatus === 'active' && isDeleted) return false;
        if (filterStatus === 'deleted' && !isDeleted) return false;
        const custName = o.customer ? o.customer.name.toLowerCase() : '';
        const matchText = o.id.toLowerCase().includes(search) || custName.includes(search);
        if (!matchText) return false;
        if (filterBranch !== 'all' && o.branchId !== filterBranch) return false;
        if (filterCashier !== 'all' && (o.cashierName || 'Unknown') !== filterCashier) return false;
        if (startDate || endDate) {
            const orderDate = new Date(o.completedAt?.seconds * 1000); orderDate.setHours(0, 0, 0, 0);
            if (startDate && orderDate < new Date(startDate).setHours(0, 0, 0, 0)) return false;
            if (endDate && orderDate > new Date(endDate).setHours(0, 0, 0, 0)) return false;
        }
        return true;
    });

    filtered.sort((a, b) => (b.completedAt?.seconds || 0) - (a.completedAt?.seconds || 0));

    const container = document.getElementById('history-list');
    if (!container) return;
    if (filtered.length === 0) { container.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-slate-400 italic">Không tìm thấy đơn hàng.</td></tr>`; return; }

    container.innerHTML = filtered.map(o => {
        const isDeleted = o.status === 'deleted';
        const rowClass = isDeleted ? 'bg-slate-50 grayscale opacity-70' : 'hover:bg-slate-50';
        const customerName = o.customer ? o.customer.name : 'Khách lẻ';
        const customerPhone = o.customer ? `<div class="text-[10px] text-slate-400 mt-0.5"><i class="fa-solid fa-phone text-[8px] mr-1"></i>${o.customer.phone}</div>` : '';
        const pmMap = { 'cash': 'Tiền mặt', 'transfer': 'Chuyển khoản', 'gift': 'Thẻ quà tặng' };
        const pmDisplay = pmMap[o.paymentMethod] || o.paymentMethod;

        return `<tr class="border-b border-slate-100 transition duration-200 ${rowClass}">
            <td class="p-4 align-top"><div class="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded w-fit">#${o.id}</div>${isDeleted ? `<div class="text-[10px] text-red-600 font-bold mt-1 border border-red-200 bg-red-50 px-1 rounded w-fit">ĐÃ HỦY</div>` : ''}</td>
            <td class="p-4 align-top text-sm"><div class="font-medium text-slate-700">${new Date(o.completedAt?.seconds * 1000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div><div class="text-xs text-slate-400">${new Date(o.completedAt?.seconds * 1000).toLocaleDateString('vi-VN')}</div></td>
            <td class="p-4 align-top text-sm"><div class="font-bold text-slate-800">${customerName}</div>${customerPhone}</td>
            <td class="p-4 align-top text-sm text-slate-600 font-medium">${o.branchName || '-'}</td>
            <td class="p-4 align-top text-sm text-slate-600">${o.cashierName || '-'}</td>
            <td class="p-4 align-top"><div class="font-black ${isDeleted ? 'text-slate-500 line-through' : 'text-blue-600'} text-base">${formatMoney(o.totals?.finalTotal || 0)}</div><div class="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">${pmDisplay}</div></td>
            <td class="p-4 align-top text-right"><div class="flex gap-2 justify-end">${isDeleted ? `<button onclick="customAlert('🛑 Lý do xóa: ${o.deletedReason || 'Không có lý do'}')" class="text-xs bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-300 font-bold transition">Lý do</button>${userRole === 'admin' ? `<button onclick="deleteOrderPermanently('${o.id}')" class="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 transition shadow-sm" title="Xóa vĩnh viễn"><i class="fa-solid fa-ban"></i></button>` : ''}` : `<button onclick="printOrder('${o.id}')" class="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition shadow-sm border border-blue-100" title="In lại"><i class="fa-solid fa-print"></i></button><button onclick="deleteOrder('${o.id}')" class="bg-red-50 text-red-500 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition shadow-sm border border-red-100" title="Xóa đơn"><i class="fa-solid fa-trash"></i></button>`}</div></td>
        </tr>`;
    }).join('');
};

window.renderStats = () => {
    if (userRole !== 'admin') return;
    const validOrders = ordersHistory.filter(o => o.status !== 'deleted' && (!currentBranchId || o.branchId === currentBranchId));
    const today = new Date().setHours(0, 0, 0, 0);
    const todayOrders = validOrders.filter(o => (o.completedAt?.seconds * 1000) >= today);
    document.getElementById('stat-today-revenue').textContent = formatMoney(todayOrders.reduce((sum, o) => sum + (o.totals?.finalTotal || 0), 0));
    document.getElementById('stat-total-orders').textContent = todayOrders.length;
    document.getElementById('stat-new-customers').textContent = customers.filter(c => (c.createdAt?.seconds * 1000) >= today).length;
    const productCount = {}; validOrders.forEach(o => { o.items?.forEach(i => { productCount[i.name] = (productCount[i.name] || 0) + i.qty; }); });
    document.getElementById('top-products-list').innerHTML = Object.entries(productCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map((p, i) => `<tr class="border-b border-slate-50 last:border-0 hover:bg-slate-50"><td class="py-3 text-slate-500 font-bold text-sm w-8">#${i + 1}</td><td class="py-3 font-medium text-slate-700 truncate max-w-[120px]" title="${p[0]}">${p[0]}</td><td class="py-3 text-right font-bold text-blue-600">${p[1]} <span class="text-[10px] text-slate-400">bán</span></td></tr>`).join('');
    const ctx = document.getElementById('revenueChart'); if (!ctx) return; if (revenueChart) revenueChart.destroy();
    const labels = [], data = []; for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); labels.push(d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })); const s = new Date(d).setHours(0, 0, 0, 0), e = new Date(d).setHours(23, 59, 59, 999); data.push(validOrders.filter(o => { const t = o.completedAt?.seconds * 1000; return t >= s && t <= e; }).reduce((sum, o) => sum + (o.totals?.finalTotal || 0), 0)); }
    revenueChart = new Chart(ctx.getContext('2d'), { type: 'bar', data: { labels, datasets: [{ label: 'Doanh thu', data, backgroundColor: '#3b82f6', borderRadius: 4, barThickness: 20 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { borderDash: [2, 4] }, ticks: { callback: v => v >= 1000 ? v / 1000 + 'k' : v } }, x: { grid: { display: false } } } } });
};

// --- MISC & TOOLS ---
window.togglePromoModal = () => document.getElementById('promo-modal').classList.toggle('hidden');
window.saveGiftCard = async () => {
    if (userRole !== 'admin') return showToast("Không có quyền!", true);

    const code = document.getElementById('promo-code').value.toUpperCase().trim();
    const type = document.getElementById('promo-type').value; // fixed hoặc percent
    const value = getCleanValue('promo-value');

    if (!code || value <= 0) return showToast("Thiếu thông tin hoặc giá trị sai!", true);
    if (type === 'percent' && value > 100) return showToast("Phần trăm không quá 100!", true);

    // Check trùng mã (Optional nhưng nên có)
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'giftcards'), where("code", "==", code));
    const snap = await getDocs(q);
    if (!snap.empty) return showToast("Mã này đã tồn tại!", true);

    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'giftcards'), {
        code,
        type,
        value,
        status: 'active', // active hoặc used
        usageLog: null,   // Lưu thông tin người dùng sau này
        createdAt: serverTimestamp(),
        createdBy: currentUserData.name
    });

    showToast("Đã tạo mã ưu đãi");
    togglePromoModal();
};

window.renderGiftCardList = () => {
    document.getElementById('promo-list').innerHTML = giftCards.map(g => {
        const isUsed = g.status === 'used';
        const typeBadge = g.type === 'percent' ? '%' : '₫';

        // Hiển thị lịch sử sử dụng
        let usageInfo = '<span class="text-slate-400 text-xs italic">Chưa sử dụng</span>';
        if (isUsed && g.usageLog) {
            const date = g.usageLog.usedAt ? new Date(g.usageLog.usedAt.seconds * 1000).toLocaleDateString('vi-VN') : '';
            usageInfo = `
                <div class="text-xs font-bold text-slate-700">Đơn: #${g.usageLog.orderId}</div>
                <div class="text-[10px] text-slate-500">Khách: ${g.usageLog.customerName || 'Khách lẻ'}</div>
                <div class="text-[10px] text-slate-400">${date}</div>
            `;
        }

        return `<tr class="border-b border-slate-100 hover:bg-slate-50">
            <td class="p-4 font-mono font-bold text-slate-700 text-sm">${g.code}</td>
            <td class="p-4">
                <span class="font-black text-orange-500">${formatMoney(g.value)}</span>
                <span class="ml-1 bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold">${g.type === 'percent' ? 'Giảm %' : 'Tiền mặt'}</span>
            </td>
            <td class="p-4">
                <span class="${isUsed ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'} px-2 py-1 rounded text-xs font-bold uppercase">
                    ${isUsed ? 'Đã dùng' : 'Khả dụng'}
                </span>
            </td>
            <td class="p-4 align-top">
                ${usageInfo}
            </td>
            <td class="p-4 text-right">
                <button onclick="deletePromo('${g.id}')" class="text-slate-400 hover:text-red-600 transition"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>`;
    }).join('');
};

window.deletePromo = async (id) => { if (userRole === 'admin' && await customConfirm("Xóa thẻ?")) deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'giftcards', id)); };
// 1. Quản lý hiển thị Panel giảm giá
window.toggleDiscountPanel = () => {
    const p = document.getElementById('discount-panel');
    const a = document.getElementById('disc-arrow'); // Mũi tên xoay

    // Toggle hiển thị
    p.classList.toggle('hidden');

    // Hiệu ứng xoay mũi tên
    if (a) a.style.transform = p.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';

    // Kiểm tra xem đã chọn khách chưa để hiện số điểm khả dụng
    const order = getActiveOrder();
    const ptSec = document.getElementById('point-usage-section');
    const ptLabel = document.getElementById('cust-max-points');

    if (ptSec && ptLabel) {
        if (order.customer) {
            ptSec.classList.remove('opacity-50', 'pointer-events-none');
            ptLabel.textContent = `Có ${order.customer.points || 0} điểm`;
        } else {
            ptSec.classList.add('opacity-50', 'pointer-events-none');
            ptLabel.textContent = `(Chọn khách trước)`;
        }
    }
};

// 2. Hàm áp dụng Mã Giảm Giá (Voucher)
window.applyCoupon = async () => {
    const codeInput = document.getElementById('disc-coupon-input');
    const code = codeInput.value.toUpperCase().trim();
    if (!code) return;

    // Hiển thị loading
    const btn = event.currentTarget; // Nút bấm
    const originalText = btn.textContent;
    btn.textContent = "...";
    btn.disabled = true;

    try {
        // Query tìm mã
        const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'giftcards'), where("code", "==", code));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            showToast("❌ Mã không tồn tại!", true);
            getActiveOrder().discounts.coupon = null;
        } else {
            const docData = snapshot.docs[0].data();
            const docId = snapshot.docs[0].id;

            // Kiểm tra trạng thái
            if (docData.status === 'used') {
                showToast("⚠️ Mã này đã được sử dụng!", true);
                getActiveOrder().discounts.coupon = null;
            } else {
                // Hợp lệ -> Lưu vào đơn hàng (Kèm ID để lát nữa thanh toán xong thì khóa lại)
                getActiveOrder().discounts.coupon = {
                    id: docId, // Lưu ID document để update status
                    code: docData.code,
                    type: docData.type || 'fixed', // 'percent' hoặc 'fixed'
                    value: docData.value
                };

                const valDisplay = docData.type === 'percent' ? `${docData.value}%` : formatMoney(docData.value);
                showToast(`✅ Áp dụng: ${docData.code} (-${valDisplay})`);
            }
        }
    } catch (e) {
        console.error(e);
        showToast("Lỗi kiểm tra mã!", true);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
        renderCart();
    }
};

// 3. Hàm áp dụng Chiết khấu thủ công (Do nhân viên nhập)
window.applyManualDisc = () => {
    const val = getCleanValue('disc-manual-input');
    const type = document.getElementById('disc-manual-type').value; // 'amount' hoặc 'percent'

    if (val < 0) return;

    // Lưu vào object discounts
    getActiveOrder().discounts.manual = { type: type, value: val };

    showToast(`✅ Đã giảm tay: ${type === 'amount' ? formatMoney(val) : val + '%'}`);
    renderCart();
};
// 4. Hàm áp dụng Điểm tích lũy (1 điểm = 1 VNĐ)
// Hàm xử lý nút bấm nhanh (20%, 50%, 80%)
window.setQuickPoints = (percent) => {
    const order = getActiveOrder();
    if (!order.customer) return showToast("Chưa chọn khách hàng!", true);

    const currentPoints = order.customer.points || 0;

    // 1. Tính số điểm dựa trên % quỹ điểm
    let amount = Math.floor(currentPoints * (percent / 100));

    // 2. Tính số tiền cần thanh toán hiện tại (để không dùng quá số tiền này)
    // Tính lại subtotal và trừ đi các khuyến mãi khác (nếu có)
    const subtotal = order.items.reduce((a, b) => a + (b.price * b.qty), 0);
    let currentTotal = subtotal;

    // Trừ Coupon
    if (order.discounts && order.discounts.coupon) {
        if (order.discounts.coupon.type === 'percent') currentTotal -= subtotal * (order.discounts.coupon.value / 100);
        else currentTotal -= order.discounts.coupon.value;
    }
    // Trừ Manual
    if (order.discounts && order.discounts.manual) {
        if (order.discounts.manual.type === 'percent') currentTotal -= subtotal * (order.discounts.manual.value / 100);
        else currentTotal -= order.discounts.manual.value;
    }

    // 3. Logic thông minh: Dùng số nhỏ nhất giữa (Điểm tính theo %) và (Tổng tiền đơn hàng)
    // Ví dụ: Đơn 50k, Khách có 1 triệu điểm -> Bấm 50% (500k điểm) -> Chỉ điền 50k thôi.
    if (amount > currentTotal) {
        amount = Math.floor(currentTotal);
    }

    // Điền vào ô input và gọi hàm apply
    document.getElementById('disc-point-input').value = amount.toLocaleString('en-US');
    applyPoints();
};

// Cập nhật hàm applyPoints (Validate chặt chẽ hơn)
window.applyPoints = () => {
    const order = getActiveOrder();
    if (!order.customer) return showToast("Chưa chọn khách hàng!", true);

    const requestPoints = getCleanValue('disc-point-input');
    const currentPoints = order.customer.points || 0;

    // Quy tắc 1: Chỉ được dùng tối đa 80% điểm hiện có
    const maxAllowedByPolicy = Math.floor(currentPoints * 0.8);

    if (requestPoints > maxAllowedByPolicy) {
        // Tự động sửa về mức tối đa nếu nhập lố
        document.getElementById('disc-point-input').value = maxAllowedByPolicy.toLocaleString('en-US');
        return showToast(`⚠️ Chỉ được dùng tối đa 80% quỹ điểm (${maxAllowedByPolicy})`, true);
    }

    if (requestPoints < 0) return;

    // Quy tắc 2: Không được dùng điểm quá số tiền đơn hàng (đã xử lý ở updateTotals nhưng check ở đây để UX tốt hơn)

    order.discounts.points = requestPoints;
    showToast(`✅ Đã dùng ${requestPoints} điểm`);
    renderCart();
};

// 5. Hàm Xóa tất cả ưu đãi (Reset)
window.clearAllDiscounts = () => {
    const o = getActiveOrder();
    // Reset về 0 hết
    o.discounts = { coupon: null, manual: null, points: 0 };

    // Xóa chữ trong các ô input
    ['disc-coupon-input', 'disc-manual-input', 'disc-point-input'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    renderCart();
    showToast("Đã hủy toàn bộ ưu đãi");
};


window.openCheckoutModal = () => { if (getActiveOrder().items.length > 0) { document.getElementById('modal-total-amount').textContent = document.getElementById('cart-total').textContent; document.getElementById('checkout-modal').classList.remove('hidden'); } };
window.setPaymentMethod = (m) => { paymentMethod = m; document.querySelectorAll('.pm-btn').forEach(b => b.classList.remove('active')); document.getElementById(`pm-${m}`).classList.add('active');['pay-cash-ui', 'pay-transfer-ui', 'pay-gift-ui'].forEach(id => document.getElementById(id).classList.add('hidden')); document.getElementById(`pay-${m}-ui`).classList.remove('hidden'); };
window.calculateChange = () => { document.getElementById('cash-change').textContent = formatMoney(getCleanValue('cash-given') - parseInt(document.getElementById('modal-total-amount').textContent.replace(/\D/g, ''))); };
window.setQuickCash = (v) => { document.getElementById('cash-given').value = v.toLocaleString('en-US'); calculateChange(); };
window.checkGiftCard = () => { const c = document.getElementById('gift-code-input').value.toUpperCase(), g = giftCards.find(x => x.code === c && x.status === 'active'), t = parseInt(document.getElementById('modal-total-amount').textContent.replace(/\D/g, '')); const s = document.getElementById('gift-status'); if (g) { s.textContent = g.value >= t ? `Đủ tiền (${formatMoney(g.value)})` : `Thiếu ${formatMoney(t - g.value)}`; s.className = g.value >= t ? "mt-4 text-center text-sm font-bold text-emerald-600" : "mt-4 text-center text-sm font-bold text-orange-500"; } else { s.textContent = "Thẻ lỗi"; s.className = "mt-4 text-center text-sm font-bold text-red-500"; } };

// --- PRINTING ENGINE (CORE) ---
window.printReceiptData = (order) => {
    // 1. Lấy cấu hình in
    const config = JSON.parse(localStorage.getItem('pos_print_config')) || { type: 'k80', code: TEMPLATE_K80 };
    // Ưu tiên dùng mẫu mặc định nếu là K80 để đảm bảo cập nhật mới nhất
    let template = (config.type === 'k80') ? TEMPLATE_K80 : config.code;

    // 2. Tạo HTML cho danh sách món
    let itemsHtml = '';
    if (config.type === 'k58') {
        itemsHtml = order.items.map(i => `
            <div style="border-bottom: 1px dashed #eee; padding: 5px 0;">
                <div class="item-name" style="font-weight:bold">${i.name}</div>
                <div class="item-meta" style="display:flex; justify-content:space-between; font-size:90%">
                    <span>${i.qty} x ${formatMoney(i.price).replace('₫','')}</span>
                    <span style="font-weight:bold">${formatMoney(i.price * i.qty).replace('₫','')}</span>
                </div>
            </div>
        `).join('');
    } else {
        itemsHtml = order.items.map((i, index) => `
            <tr>
                <td style="text-align: center;">${index + 1}</td>
                <td>${i.name}</td>
                <td style="text-align: center;">${i.qty}</td>
                <td style="text-align: right;">${formatMoney(i.price).replace('₫', '')}</td>
                <td style="text-align: right; font-weight: bold;">${formatMoney(i.price * i.qty).replace('₫', '')}</td>
            </tr>
        `).join('');
    }

    // 3. Chuẩn bị dữ liệu chi tiết
    const dateObj = order.completedAt ? new Date(order.completedAt.seconds * 1000) : new Date();
    
    // Tính toán tiền nong
    const subtotalVal = order.totals.subtotal;
    const finalVal = order.totals.finalTotal;
    const discountVal = subtotalVal - finalVal;
    
    // Lấy thông tin khách hàng
    const custName = order.customer ? order.customer.name : 'Khách lẻ';
    const custPhone = order.customer ? (userRole === 'admin' ? order.customer.phone : maskPhone(order.customer.phone)) : '';
    const ptsEarned = order.pointsEarned || 0;
    const currentPts = order.customer ? "..." : ""; 

    // Tiền khách đưa / Tiền thừa
    let givenVal = finalVal;
    let changeVal = 0;
    
    const cashGivenEl = document.getElementById('cash-given');
    // Chỉ lấy từ UI nếu đang ở đúng view POS và là tiền mặt
    if(currentView === 'pos' && cashGivenEl && paymentMethod === 'cash') {
        const inputVal = getCleanValue('cash-given');
        if(inputVal > 0) {
            givenVal = inputVal;
            changeVal = inputVal - finalVal;
        }
    }

    // --- SỬA LỖI TẠI ĐÂY: KHAI BÁO pmRaw ---
    const pmMap = { 'cash': 'Tiền mặt', 'transfer': 'Chuyển khoản', 'gift': 'Thẻ quà tặng' };
    // Nếu không có paymentMethod, mặc định là 'cash'
    const pmRaw = order.paymentMethod || 'cash'; 
    const pmDisplay = pmMap[pmRaw] || pmRaw;

    // 4. Bảng ánh xạ dữ liệu (MAP DATA)
    const mapData = {
        shopName: "MAI TÂY HAIR SALON",
        
        orderId: order.id,
        date: dateObj.toLocaleDateString('vi-VN'),
        time: dateObj.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}),
        cashier: order.cashierName || 'Staff',
        
        customer: custName,
        customerPhone: custPhone,
        currentPoints: currentPts,
        pointsEarned: ptsEarned,

        subtotal: formatMoney(subtotalVal).replace('₫', ''),
        discount: formatMoney(discountVal).replace('₫', ''),
        total: formatMoney(finalVal).replace('₫', ''),
        rawTotal: finalVal,
        
        given: formatMoney(givenVal).replace('₫', ''),
        change: formatMoney(changeVal).replace('₫', ''),
        
        paymentMethod: pmDisplay, // Sử dụng biến đã xử lý
        
        items: itemsHtml
    };

    // 5. Thay thế vào Template
    for (const [key, value] of Object.entries(mapData)) {
        template = template.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    // 6. Thực thi In
    const iframe = document.getElementById('print-frame');
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(template);
    doc.close();

    setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
    }, 800);
};

// Override hàm printOrder cũ
window.printOrder = (id) => {
    const order = ordersHistory.find(x => x.id === id);
    if (order) {
        showToast("🖨️ Đang gửi lệnh in...");
        printReceiptData(order);
    }
};
window.deleteOrder = async (orderId) => { if (userRole !== 'admin') return showToast("Chỉ Admin được xóa đơn!", true); const reason = await customPrompt("⚠️ Lý do xóa đơn hàng:", ""); if (!reason) return; try { const order = ordersHistory.find(o => o.id === orderId); if (!order) return; await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId), { status: 'deleted', deletedReason: reason, deletedAt: serverTimestamp(), deletedBy: currentUserData.name }); if (order.items && order.items.length > 0) { for (const item of order.items) { if (item.stock !== -1) { const pRef = doc(db, 'artifacts', appId, 'public', 'data', 'products', item.id); const pSnap = await getDoc(pRef); if (pSnap.exists()) await updateDoc(pRef, { stock: (pSnap.data().stock || 0) + item.qty }); } } } showToast("Đã xóa đơn và hoàn kho"); } catch (e) { showToast("Lỗi: " + e.message, true); } };
window.deleteOrderPermanently = async (orderId) => { if (userRole !== 'admin') return showToast("Chỉ Admin được thực hiện!", true); if (await customConfirm("⚠️ CẢNH BÁO CUỐI CÙNG!\n\nXóa vĩnh viễn đơn hàng này?\nKhông thể khôi phục.")) { try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId)); showToast("Đã xóa vĩnh viễn"); } catch (e) { showToast("Lỗi: " + e.message, true); } } };
window.deleteAllHistory = async () => { if (userRole !== 'admin') return; const activeOrders = ordersHistory.filter(o => o.status !== 'deleted'); if (activeOrders.length === 0) return showToast("Không có gì để xóa!", true); if (!await customConfirm(`⚠️ Xóa ${activeOrders.length} đơn hàng?\nTồn kho sẽ được cộng lại.`)) return; const reason = await customPrompt("📝 Lý do xóa:", ""); if (!reason) return; try { showToast("Đang xử lý...", false); const promises = activeOrders.map(async (order) => { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', order.id), { status: 'deleted', deletedReason: `[Mass Delete] ${reason}`, deletedAt: serverTimestamp(), deletedBy: currentUserData.name || 'Admin' }); if (order.items) { for (const item of order.items) { if (item.stock !== -1) { const pRef = doc(db, 'artifacts', appId, 'public', 'data', 'products', item.id); const pSnap = await getDoc(pRef); if (pSnap.exists()) await updateDoc(pRef, { stock: (pSnap.data().stock || 0) + item.qty }); } } } }); await Promise.all(promises); showToast(`✅ Đã xóa ${activeOrders.length} đơn!`); if (currentView === 'reports') renderStats(); } catch (e) { showToast("Lỗi: " + e.message, true); } };
window.resetOrderCounter = async () => { if (userRole !== 'admin') return; const input = await customPrompt("Số bắt đầu lại (VD: 0):", "0"); if (input === null) return; const newIndex = parseInt(input); if (isNaN(newIndex) || newIndex < 0) return; const nextCode = `MT-${String(newIndex + 1).padStart(6, '0')}`; if (!await customConfirm(`⚠️ Đơn sau sẽ là: [ ${nextCode} ]\nTiếp tục?`)) return; try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'counters', 'orders'), { lastIndex: newIndex }, { merge: true }); showToast(`✅ Xong. Đơn sau là ${nextCode}`); } catch (e) { showToast("Lỗi: " + e.message, true); } };
window.exportHistoryToExcel = () => { const search = document.getElementById('history-search')?.value.toLowerCase() || '', startDate = document.getElementById('filter-date-start')?.value, endDate = document.getElementById('filter-date-end')?.value, filterBranch = document.getElementById('filter-branch-history')?.value || 'all', filterCashier = document.getElementById('filter-cashier')?.value || 'all', filterStatus = document.getElementById('filter-status')?.value || 'active'; let data = ordersHistory.filter(o => { const isDeleted = o.status === 'deleted'; if (filterStatus === 'active' && isDeleted) return false; if (filterStatus === 'deleted' && !isDeleted) return false; const cName = o.customer ? o.customer.name.toLowerCase() : ''; if (!(o.id.toLowerCase().includes(search) || cName.includes(search))) return false; if (filterBranch !== 'all' && o.branchId !== filterBranch) return false; if (filterCashier !== 'all' && (o.cashierName || 'Unknown') !== filterCashier) return false; if (startDate || endDate) { const t = new Date(o.completedAt?.seconds * 1000); t.setHours(0, 0, 0, 0); if (startDate && t < new Date(startDate).setHours(0, 0, 0, 0)) return false; if (endDate && t > new Date(endDate).setHours(0, 0, 0, 0)) return false; } return true; }); if (data.length === 0) return showToast("Không có dữ liệu!", true); let csv = "data:text/csv;charset=utf-8,\uFEFFMã đơn,Thời gian,Ngày,Khách hàng,SĐT Khách,Chi nhánh,Thu ngân,Tổng tiền,PTTT,Trạng thái,Lý do\n"; const pmMap = { 'cash': 'Tiền mặt', 'transfer': 'Chuyển khoản', 'gift': 'Thẻ quà tặng' }; data.forEach(o => { const d = new Date(o.completedAt?.seconds * 1000); const pm = pmMap[o.paymentMethod] || o.paymentMethod; csv += [`'${o.id}`, d.toLocaleTimeString('vi-VN'), d.toLocaleDateString('vi-VN'), o.customer ? o.customer.name.replace(/,/g, ' ') : 'Khách lẻ', o.customer ? `'${o.customer.phone}` : '', (o.branchName || '').replace(/,/g, ' '), (o.cashierName || '').replace(/,/g, ' '), o.totals.finalTotal, pm, o.status === 'deleted' ? 'Đã hủy' : 'Thành công', (o.deletedReason || '').replace(/,/g, ' ')].join(",") + "\n"; }); const link = document.createElement("a"); link.href = encodeURI(csv); link.download = `Bao_cao_${new Date().toISOString().slice(0, 10)}.csv`; document.body.appendChild(link); link.click(); document.body.removeChild(link); };

// --- PRINT CONFIGURATION SYSTEM ---

// Mẫu K80 Chuẩn
// Mẫu K80 (Mai Tây Hair Salon Style)
const TEMPLATE_K80 = `
<html>
    <head>
        <title>In hóa đơn</title>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 0 5px; width: 80mm; margin: 0 auto; color: #000; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { padding: 6px 2px; text-align: left; border-bottom: 1px solid #ddd; font-size: 12px; }
            th { font-size: 11px; border-bottom: 2px solid black; font-weight: bold; }
            td:last-child, th:last-child { text-align: right; }
            .preview-header { text-align: center; margin-bottom: 10px; }
            .preview-header h2 { margin: 5px 0; font-size: 18px; text-transform: uppercase; }
            .preview-header h3 { margin: 5px 0; font-size: 14px; border-top: 1px dashed #000; padding-top: 10px; }
            .bill-info { font-size: 12px; margin-bottom: 10px; }
            .bill-info p { margin: 3px 0; }
            .bill-summary { margin-top: 10px; text-align: right; font-size: 12px; }
            .total { font-weight: bold; font-size: 16px; margin-top: 5px; }
            .bill-footer { text-align: center; margin-top: 15px; font-size: 12px; }
            .info-Salon { font-size: 12px; margin-top: 5px; }
            .info-Salon i { width: 15px; text-align: center; }
            .QR-Banking { margin-top: 15px; border: 2px solid #000; padding: 5px; display: flex; align-items: center; gap: 10px; border-radius: 8px; }
            .QR-Banking img { width: 80px; height: 80px; display: block; }
            .Banking { text-align: left; flex: 1; border-left: 1px dashed #000; padding-left: 10px; }
            .Banking p { margin: 0; font-size: 10px; font-weight: bold; }
            .Banking h1 { margin: 2px 0; font-size: 18px; letter-spacing: 1px; }
            .Banking .alert { font-size: 9px; font-weight: normal; font-style: italic; margin-top: 2px; }
            .Hunq { font-size: 10px; margin-top: 5px; font-style: italic; color: #555; }
        .preview-header img {
            width: 200px;
            display: block;
            margin: 0 auto;
            padding-right: 20px;
        }
            </style>
    </head>
    <body>
        <div class="preview-header">
                <img src="./Logo.png" alt="Logo">

            <h2>{{shopName}}</h2>
            <div class="info-Salon">
                <p><i class="fa-solid fa-location-dot"></i> 4A Hiền Hoà, Phước Thái, Long Thành, ĐN</p>
                <p><i class="fa-brands fa-facebook"></i> MaiTayHairSalon | <i class="fa-solid fa-phone"></i> 0938.123.962</p>
            </div>
            <h3>HOÁ ĐƠN THANH TOÁN</h3>
        </div>
        <div class="bill-info">
            <p><strong>Số HĐ:</strong> {{orderId}}</p>
            <p><strong>Thời gian:</strong>{{time}} {{date}}</p>
            <p><strong>Khách hàng:</strong> {{customer}}</p>
            <p><strong>Thu ngân:</strong> {{cashier}}</p>
            <p><strong>Thanh toán:</strong> {{paymentMethod}}</p>
        </div>
        <table>
            <thead>
                <tr>
                    <th style="width: 20px">#</th>
                    <th>Dịch vụ</th>
                    <th style="width: 25px; text-align: center;">SL</th>
                    <th style="text-align: right;">Đơn giá</th>
                    <th style="text-align: right;">Thành tiền</th>
                </tr>
            </thead>
            <tbody>
                {{items}}
            </tbody>
        </table>
        <div class="bill-summary">
            <p>Tạm tính: {{subtotal}}</p>
            <p>Chiết khấu: {{discount}}</p>
            <p class="total">TỔNG TIỀN: {{total}}</p>
        </div>
        
        <div class="QR-Banking">
            <div class="QR">
                <img src="https://img.vietqr.io/image/BIDV-8834272720-compact.jpg?amount={{rawTotal}}&addInfo={{orderId}}" alt="QR">
            </div>
            <div class="Banking">
                <p>BIDV - DINH HOA XUAN MAI</p>
                <h1>8834272720</h1>
                <p class="alert">Quét mã để thanh toán chính xác số tiền.</p>
            </div>
        </div>

        <div class="bill-footer">
            <p>Cảm ơn quý khách ❤️</p>
            <p class="Hunq">Powered by Đinh Mạnh Hùng</p>
        </div>
    </body>
</html>`;

// Mẫu K58 Nhỏ
const TEMPLATE_K58 = `
<html>
<head>
<style>
    body { font-family: sans-serif; width: 58mm; margin: 0; padding: 2px; font-size: 10px; color: #000; }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .line { border-bottom: 1px dotted #000; margin: 5px 0; }
    .item-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
    .item-name { width: 100%; font-weight: bold; }
    .item-meta { display: flex; justify-content: space-between; font-size: 9px; padding-left: 10px; color: #333; }
    .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 12px; margin-top: 5px; }
</style>
</head>
<body>
    <div class="center bold" style="font-size: 14px">{{shopName}}</div>
    <div class="center" style="font-size: 9px">Đơn: {{orderId}}</div>
    <div class="center" style="font-size: 9px">{{date}}</div>
    <div class="line"></div>
    <div id="items-container">
        {{items}}
    </div>
    <div class="line"></div>
    <div class="item-row"><span>Tổng:</span><span class="bold">{{subtotal}}</span></div>
    <div class="item-row"><span>Giảm:</span><span>{{discount}}</span></div>
    <div class="total-row"><span>PHẢI TRẢ:</span><span>{{total}}</span></div>
    <div class="center" style="margin-top:10px; font-style:italic">Thank you!</div>
</body>
</html>`;

// State cấu hình
let printConfig = JSON.parse(localStorage.getItem('pos_print_config')) || {
    type: 'k80',
    code: TEMPLATE_K80
};

// Hàm khởi tạo khi load trang
window.initPrintSettings = () => {
    const select = document.getElementById('print-template-select');
    const editor = document.getElementById('print-code-editor');

    if (select && editor) {
        select.value = printConfig.type;
        editor.value = printConfig.code;
        updatePreview();

        // Auto update preview khi gõ code
        editor.addEventListener('input', () => {
            printConfig.code = editor.value; // Lưu tạm vào biến
            updatePreview();
        });
    }
};

window.loadTemplate = (type) => {
    printConfig.type = type;
    if (type === 'k80') printConfig.code = TEMPLATE_K80;
    else if (type === 'k58') printConfig.code = TEMPLATE_K58;
    // Nếu custom thì giữ nguyên code hiện tại hoặc load từ storage

    document.getElementById('print-code-editor').value = printConfig.code;
    updatePreview();
};

window.resetTemplate = () => {
    if (confirm("Khôi phục mã nguồn về mặc định của mẫu đang chọn?")) {
        loadTemplate(printConfig.type);
    }
};

window.savePrintSettings = () => {
    const code = document.getElementById('print-code-editor').value;
    const type = document.getElementById('print-template-select').value;

    printConfig = { type, code };
    localStorage.setItem('pos_print_config', JSON.stringify(printConfig));
    showToast("✅ Đã lưu cấu hình in!");
};

// Hàm tạo HTML giả lập để xem trước (Preview)
window.updatePreview = () => {
    const container = document.getElementById('print-preview-container');
    const frame = document.getElementById('preview-frame');
    if (!container || !frame) return;

    if (printConfig.type === 'k58') container.style.width = '58mm';
    else container.style.width = '80mm';

    // MOCK DATA ĐẦY ĐỦ (Dùng để test mẫu in)
    const mockData = {
        shopName: "MAI TÂY HAIR SALON",
        orderId: "MT-000001",
        date: "06/12/2025",
        time: "14:30",
        cashier: "Admin",

        customer: "Nguyễn Văn A",
        customerPhone: "090***123",
        currentPoints: "1,250",
        pointsEarned: "50",

        items: printConfig.type === 'k80'
            ? `<tr><td style="text-align:center">1</td><td>Cắt tóc nam</td><td style="text-align:center">1</td><td style="text-align:right">100.000</td><td style="text-align:right">100.000</td></tr>
               <tr><td style="text-align:center">2</td><td>Gội đầu</td><td style="text-align:center">1</td><td style="text-align:right">50.000</td><td style="text-align:right">50.000</td></tr>`
            : `<div class="item-name">Cắt tóc nam</div><div class="item-meta"><span>1 x 100.000</span><span>100.000</span></div>`,

        subtotal: "150.000",
        discount: "0",
        total: "150.000",
        rawTotal: "150000", // Số thô để tạo QR

        given: "200.000",
        change: "50.000",
        paymentMethod: "Tiền mặt"
    };

    let html = printConfig.code;
    for (const [key, value] of Object.entries(mockData)) {
        html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    const doc = frame.contentWindow.document;
    doc.open(); doc.write(html); doc.close();
};

// Gọi init khi chuyển tab
const originalSwitchView = window.switchView;
window.switchView = (view) => {
    originalSwitchView(view);
    if (view === 'print-settings') initPrintSettings();
};


const sb = document.getElementById('sidebar-cart'), h = document.getElementById('resize-handle');
h.addEventListener('mousedown', e => { e.preventDefault(); document.addEventListener('mousemove', rs); document.addEventListener('mouseup', sp); document.body.style.cursor = 'col-resize'; h.classList.add('resizing'); });
function rs(e) { const w = window.innerWidth - e.clientX; if (w >= 320 && w <= 600) sb.style.width = `${w}px`; }
function sp() { document.removeEventListener('mousemove', rs); document.removeEventListener('mouseup', sp); document.body.style.cursor = ''; h.classList.remove('resizing'); }

setInterval(() => { const d = new Date(); document.getElementById('current-order-time').textContent = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`; }, 1000);
document.getElementById('pos-search-input').addEventListener('input', renderProducts);

// AUTO INIT
renderOrderTabs();
renderCart();