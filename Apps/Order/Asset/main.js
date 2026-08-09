// --- CHẾ ĐỘ DARK MODE ---
window.getCurrentTheme = () => localStorage.getItem('app_theme') || 'system';

window.applyTheme = (theme) => {
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
};

window.changeTheme = (theme) => {
    localStorage.setItem('app_theme', theme);
    window.applyTheme(theme);
    if (typeof render === 'function') render();
};

window.toggleThemeCycle = () => {
    const current = window.getCurrentTheme();
    const next = current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system';
    window.changeTheme(next);
    showToast(next === 'system' ? 'Giao diện: Thiết bị' : next === 'light' ? 'Giao diện: Sáng' : 'Giao diện: Tối');
};

window.getThemeIcon = () => {
    const current = window.getCurrentTheme();
    if (current === 'system') return '<i class="fa-solid fa-desktop"></i>';
    if (current === 'light') return '<i class="fa-solid fa-sun"></i>';
    return '<i class="fa-solid fa-moon"></i>';
};

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (window.getCurrentTheme() === 'system') window.applyTheme('system');
});

window.applyTheme(window.getCurrentTheme());

// --- FIREBASE IMPORTS & SETUP ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, deleteDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyArx-5hcMsrq9DHTcy5HvN_aVehrVDv3HM",
    authDomain: "order-manager-d4042.firebaseapp.com",
    projectId: "order-manager-d4042",
    storageBucket: "order-manager-d4042.appspot.com",
    messagingSenderId: "62807324372",
    appId: "1:62807324372:web:b658e72655d03b8b03ed41",
    measurementId: "G-Q05TTEEG73"
};

const appFirebase = initializeApp(firebaseConfig);
const auth = getAuth(appFirebase);
const db = getFirestore(appFirebase);

const MA_GIOI_THIEU_HOP_LE = "VIP2026";

// --- CẤU HÌNH CỘT MẶC ĐỊNH & LƯU TRỮ ---
const defaultTableCols = {
    stt: true,              
    recipient: false,       
    tracking: true,         
    productName: true,      
    quantity: false,        
    price: false,           
    deliveryStatus: true,   
    note: false             
};
const savedTableCols = JSON.parse(localStorage.getItem('app_table_cols')) || defaultTableCols;

// --- TRẠNG THÁI ỨNG DỤNG ---
const state = {
    view: 'landing',
    user: null,
    packages: [],
    currentPkgId: null,
    tempNewPkgId: null,
    currentGuestPkg: null,
    modals: { package: false, export: false, editOrder: false, share: false, guestPasswordPrompt: false, cameraScan: false, exportJson: false, importConfirm: false },
    selectedPackages: [],
    pendingImport: null,
    editingPkgId: null,
    editingOrderId: null,
    selectedOrders: [],
    
    groupByRecipient: false,
    
    // Cấu hình Sắp xếp & Lọc nâng cao
    sortConfig: { key: null, direction: 'asc' },
    isAdvancedFilterOpen: false,
    filterConfig: { status: 'all' },
    
    tableCols: savedTableCols,
    colMenuOpen: false,
    isCheckingMode: false,
    isSelectMode: false,
    scannerInstance: null,
    lastScanned: null,

    tempAddForm: { recipient: '', tracking: '', note: '', productName: '', quantity: 1, price: '', deliveryStatus: 'Chờ xử lý' },
    isAddingScanMode: false,
    addScannerInstance: null
};

// --- HỆ THỐNG MODAL PREMIUM (MINIMAL STYLE) ---
window.showDialog = ({ type = 'alert', title = '', message = '', inputType = 'text', placeholder = '', onConfirm = null }) => {
    const existing = document.getElementById('minimal-dialog-root');
    if(existing) existing.remove();

    const root = document.createElement('div');
    root.id = 'minimal-dialog-root';
    root.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 fade-in';
    
    let inputHtml = type === 'prompt' ? `<input type="${inputType}" id="dialog-input" class="w-full mt-4 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-slate-900 dark:focus:border-white transition-colors" placeholder="${placeholder}" onkeydown="if(event.key === 'Enter') window.confirmDialog()">` : '';

    let buttonsHtml = type === 'alert' 
        ? `<button class="w-full py-3 mt-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm" onclick="window.closeDialog()">Đồng ý</button>`
        : `<div class="flex gap-3 mt-6">
             <button class="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" onclick="window.closeDialog()">Hủy</button>
             <button class="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm" onclick="window.confirmDialog()">Xác nhận</button>
           </div>`;

    root.innerHTML = `
        <div class="bg-white dark:bg-slate-900 w-full max-w-[360px] rounded-2xl p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-slate-800">
            ${title ? `<h3 class="text-base font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">${title}</h3>` : ''}
            <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">${message}</p>
            ${inputHtml}
            ${buttonsHtml}
        </div>
    `;
    document.body.appendChild(root);

    if (type === 'prompt') setTimeout(() => document.getElementById('dialog-input').focus(), 100);

    window.closeDialog = () => root.remove();
    window.confirmDialog = () => {
        let val = null;
        if(type === 'prompt') {
            val = document.getElementById('dialog-input').value.trim();
            if(!val) return;
        }
        if(onConfirm) onConfirm(val);
        window.closeDialog();
    };
};

window.showAlert = (msg, title="Thông báo") => window.showDialog({type: 'alert', title, message: msg});
window.showConfirm = (title, msg, onConfirm) => window.showDialog({type: 'confirm', title, message: msg, onConfirm});
window.showPrompt = (title, msg, placeholder, onConfirm) => window.showDialog({type: 'prompt', title, message: msg, placeholder, onConfirm});

// --- NHẬP/XUẤT DỮ LIỆU JSON & CSV ---
window.openExportJsonModal = () => {
    if (state.packages.length === 0) return window.showAlert('Không có dữ liệu kiện hàng để xuất', 'Thất bại');
    state.selectedPackages = state.packages.map(p => p.id);
    state.modals.exportJson = true;
    render();
};

window.toggleSelectPackage = (id, isChecked) => {
    if (isChecked) {
        if (!state.selectedPackages.includes(id)) state.selectedPackages.push(id);
    } else {
        state.selectedPackages = state.selectedPackages.filter(pId => pId !== id);
    }
    render();
};

window.toggleSelectAllPackages = (isChecked) => {
    if (isChecked) {
        state.selectedPackages = state.packages.map(p => p.id);
    } else {
        state.selectedPackages = [];
    }
    render();
};

window.executeExportJson = () => {
    if (state.selectedPackages.length === 0) return showToast('Vui lòng chọn ít nhất 1 kiện', 'error');
    const packagesToExport = state.packages.filter(p => state.selectedPackages.includes(p.id));
    const dataStr = JSON.stringify(packagesToExport, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_${packagesToExport.length}_Packages_${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Đã xuất ${packagesToExport.length} kiện hàng`);
    closeModal('exportJson');
};

window.importPackagesJSON = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    event.target.value = '';

    const extension = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    reader.onload = async (e) => {
        try {
            let importedPackages = [];
            const result = e.target.result;

            if (extension === 'json') {
                importedPackages = JSON.parse(result);
            } else if (extension === 'csv') {
                return window.showAlert('Vui lòng vào chi tiết 1 kiện hàng để sử dụng tính năng Nhập CSV Thêm đơn nhanh.', 'Lưu ý');
            }

            if (!Array.isArray(importedPackages)) throw new Error("Sai định dạng");
            
            const existingIds = state.packages.map(p => p.id);
            const duplicates = importedPackages.filter(p => existingIds.includes(p.id));
            state.pendingImport = { packages: importedPackages, duplicateCount: duplicates.length };
            state.modals.importConfirm = true;
            render();
        } catch (err) {
            showToast('File không hợp lệ!', 'error');
        }
    };
    reader.readAsText(file);
};

window.executeImportJson = async () => {
    const actionEl = document.querySelector('input[name="importAction"]:checked');
    const action = actionEl ? actionEl.value : 'replace';
    closeModal('importConfirm');
    showLoader('Đang nhập dữ liệu...');
    try {
        const importedPackages = state.pendingImport.packages;
        const existingIds = state.packages.map(p => p.id);

        for (let pkg of importedPackages) {
            let finalPkg = { ...pkg };
            finalPkg.ownerId = state.user.uid;

            if (existingIds.includes(pkg.id)) {
                if (action === 'clone') {
                    let newId = generatePackageCode();
                    while (existingIds.includes(newId)) newId = generatePackageCode();
                    finalPkg.id = newId;
                    finalPkg.name = finalPkg.name + " - Bản sao";
                    existingIds.push(newId);
                }
            } else {
                existingIds.push(pkg.id);
            }
            await setDoc(doc(db, "packages", finalPkg.id), finalPkg);
        }

        await fetchAdminPackages();
        render();
        showToast(`Đã nhập thành công ${importedPackages.length} kiện hàng!`);
    } catch (err) {
        showToast('Lỗi khi lưu dữ liệu lên máy chủ', 'error');
    }
    hideLoader();
    state.pendingImport = null;
};

// --- IMPORT CSV LOGIC THÔNG MINH ---
window.importOrdersCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    event.target.value = '';

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const text = e.target.result;
            const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
            if (lines.length < 2) return window.showAlert('File CSV trống hoặc sai định dạng', 'Lỗi file');
            
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/(^"|"$)/g, ''));
            
            const getColIdx = (keywords) => {
                for (let word of keywords) {
                    const idx = headers.findIndex(h => h.includes(word));
                    if (idx !== -1) return idx;
                }
                return -1;
            };

            const idxRecipient = getColIdx(['khách', 'người nhận', 'tên', 'recipient']);
            const idxProductName = getColIdx(['sản phẩm', 'sp', 'product', 'hàng']);
            const idxQuantity = getColIdx(['số lượng', 'sl', 'quantity', 'qty']);
            const idxPrice = getColIdx(['thành tiền', 'tiền', 'giá', 'price']);
            const idxTracking = getColIdx(['mã', 'tracking', 'vận đơn', 'mã đơn']);
            const idxStatus = getColIdx(['trạng thái', 'status']);
            const idxNote = getColIdx(['ghi chú', 'note']);

            if (idxTracking === -1) {
                return window.showAlert('Lỗi: File CSV phải có ít nhất 1 cột chứa tiêu đề "Mã đơn" hoặc "Tracking"', 'Thiếu Cột');
            }

            const newOrders = [];
            
            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/(^"|"$)/g, ''));
                
                const tracking = cols[idxTracking]?.toUpperCase();
                if (!tracking) continue; 

                newOrders.push({
                    id: 'ord-' + generateId(),
                    recipient: idxRecipient !== -1 && cols[idxRecipient] ? cols[idxRecipient] : 'Khách vãng lai',
                    productName: idxProductName !== -1 ? cols[idxProductName] : '',
                    quantity: idxQuantity !== -1 && !isNaN(cols[idxQuantity]) ? Number(cols[idxQuantity]) : 1,
                    price: idxPrice !== -1 ? cols[idxPrice] : '',
                    trackingCodes: [tracking],
                    deliveryStatus: idxStatus !== -1 && cols[idxStatus] ? cols[idxStatus] : 'Chờ xử lý',
                    note: idxNote !== -1 ? cols[idxNote] : ''
                });
            }

            if (newOrders.length === 0) return window.showAlert('Không tìm thấy đơn hàng hợp lệ nào để nhập.', 'Lỗi');

            const pkg = state.packages.find(p => p.id === state.currentPkgId);
            
            const existingCodes = pkg.orders.map(o => o.trackingCodes[0]);
            const importedCodes = newOrders.map(o => o.trackingCodes[0]);
            const duplicates = importedCodes.filter(c => existingCodes.includes(c));
            
            if (duplicates.length > 0) {
                return window.showAlert(`Đã hủy nhập CSV vì trùng lặp mã đơn [${duplicates[0]}] đang có sẵn trong kiện.`, 'Trùng lặp');
            }

            pkg.orders = [...newOrders, ...pkg.orders];
            
            showLoader('Đang xử lý dữ liệu CSV...');
            await window.syncPackageToDB(pkg);
            
            showToast(`Đã nhập thành công ${newOrders.length} đơn hàng!`);
            render();
            
        } catch (err) {
            console.error(err);
            showToast('Đã xảy ra lỗi đọc tệp CSV', 'error');
        }
        hideLoader();
    };
    reader.readAsText(file, "UTF-8"); 
};

// --- CÁC HÀM TIỆN ÍCH ---
const generateId = () => Math.random().toString(36).substr(2, 9);
const generatePackageCode = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    return letters[Math.floor(Math.random() * letters.length)] +
        numbers[Math.floor(Math.random() * numbers.length)] +
        numbers[Math.floor(Math.random() * numbers.length)] +
        numbers[Math.floor(Math.random() * numbers.length)];
};

const hideLoader = () => { document.getElementById('global-loader').style.display = 'none'; };
const showLoader = (text = 'Đang xử lý...') => {
    const loader = document.getElementById('global-loader');
    loader.querySelector('p').textContent = text;
    loader.style.display = 'flex';
};

const showToast = (message, type = 'success') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const bgClass = type === 'success' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-rose-600 text-white';
    toast.className = `${bgClass} rounded-xl px-4 py-3 flex justify-center items-center gap-2 fade-in font-bold text-sm shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] text-center pointer-events-auto w-full max-w-xs mx-auto`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

const copyTrackingCode = (text, event) => {
    if (event) event.stopPropagation();
    const fallbackCopy = (textToCopy) => {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy; textArea.style.position = "fixed"; document.body.appendChild(textArea);
        textArea.focus(); textArea.select();
        try { document.execCommand('copy'); showToast('Đã chép: ' + textToCopy); }
        catch (err) { showToast('Lỗi sao chép!', 'error'); }
        document.body.removeChild(textArea);
    };
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => showToast('Đã chép: ' + text)).catch(() => fallbackCopy(text));
    } else { fallbackCopy(text); }
};
window.copyTrackingCode = copyTrackingCode;

const getGuestChecked = (pkgId) => {
    try { return JSON.parse(localStorage.getItem(`pkg_checked_${pkgId}`) || '[]'); } catch { return []; }
};
const setGuestChecked = (pkgId, arr) => localStorage.setItem(`pkg_checked_${pkgId}`, JSON.stringify(arr));

window.isOrderChecked = (pkgId, orderId, isGuest, orderNote) => {
    if (isGuest) return getGuestChecked(pkgId).includes(orderId);
    return (orderNote || '').includes('[#Đã kiểm hàng]');
};

window.getStatusBadge = (status) => {
    const s = status || 'Chờ xử lý';
    let color = 'bg-slate-100 text-slate-600 border-slate-200';
    if(s === 'Đang giao') color = 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400';
    else if(s === 'Đã giao') color = 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400';
    else if(s === 'Hoàn hàng') color = 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-400';
    else if(s === 'Chờ xử lý') color = 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400';
    
    return `<span class="px-2.5 py-1 text-[11px] font-bold rounded-md border uppercase tracking-wider whitespace-nowrap ${color}">${s}</span>`;
};

// --- SẮP XẾP & BỘ LỌC NÂNG CAO ---
window.handleSort = (key) => {
    if (state.sortConfig.key === key) {
        state.sortConfig.direction = state.sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
        state.sortConfig.key = key;
        state.sortConfig.direction = 'asc';
    }
    render();
};

window.getSortIcon = (key) => {
    if (state.sortConfig.key !== key) return '<i class="fa-solid fa-sort text-slate-300 ml-1"></i>';
    return state.sortConfig.direction === 'asc' 
        ? '<i class="fa-solid fa-sort-up text-slate-900 dark:text-white ml-1"></i>' 
        : '<i class="fa-solid fa-sort-down text-slate-900 dark:text-white ml-1"></i>';
};

window.toggleAdvancedFilter = () => {
    state.isAdvancedFilterOpen = !state.isAdvancedFilterOpen;
    render();
};

window.applyStatusFilter = (status) => {
    state.filterConfig.status = status;
    render();
};

// --- DATABASE FETCHING ---
const fetchAdminPackages = async () => {
    if (!state.user) return;
    try {
        const q = query(collection(db, "packages"), where("ownerId", "==", state.user.uid));
        const querySnapshot = await getDocs(q);
        state.packages = [];
        querySnapshot.forEach((doc) => state.packages.push(doc.data()));
        state.packages.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } catch (error) { showToast("Lỗi khi tải dữ liệu từ máy chủ", "error"); }
};

const fetchGuestPackage = async (pkgId) => {
    try {
        const docRef = doc(db, "packages", pkgId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (error) { return null; }
};

const syncPackageToDB = async (pkgData) => {
    try { await setDoc(doc(db, "packages", pkgData.id), pkgData); }
    catch (error) { showToast("Lỗi đồng bộ dữ liệu", "error"); throw error; }
};

const deletePackageDB = async (pkgId) => {
    try { await deleteDoc(doc(db, "packages", pkgId)); }
    catch (error) { showToast("Lỗi khi xoá kiện hàng", "error"); throw error; }
};

// --- RENDER ROUTER ---
const render = () => {
    const app = document.getElementById('app');
    app.innerHTML = '';
    if (state.view === 'landing') app.innerHTML = getLandingHTML();
    else if (state.view === 'login') app.innerHTML = getLoginHTML();
    else if (state.view === 'register') app.innerHTML = getRegisterHTML();
    else if (state.view === 'forgotPassword') app.innerHTML = getForgotHTML();
    else if (state.view === 'dashboard') app.innerHTML = getDashboardHTML();
    else if (state.view === 'packageDetail') app.innerHTML = getPackageDetailHTML(false);
    else if (state.view === 'guestPackageDetail') app.innerHTML = getPackageDetailHTML(true);
    renderModals();
};
window.render = render;

// --- VIEWS HTML ---
const getLandingHTML = () => `
    <div class="flex-grow flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
        <div class="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-slate-200/40 dark:bg-slate-800/40 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute bottom-[-15%] right-[-10%] w-[400px] h-[400px] bg-slate-300/30 dark:bg-slate-700/30 rounded-full blur-3xl pointer-events-none"></div>

        <div class="glass-panel p-8 md:p-12 rounded-[2rem] w-full max-w-2xl text-center relative z-10 fade-in">
            <div class="w-16 h-16 bg-gradient-to-tr from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 text-white dark:text-slate-900 rounded-[1.2rem] flex items-center justify-center mx-auto mb-6 text-2xl shadow-lg shadow-slate-900/20 dark:shadow-white/10">
                <i class="fa-solid fa-box-open"></i>
            </div>
            
            <h1 class="text-3xl md:text-4xl font-extrabold mb-3 text-slate-900 tracking-tight">Tra Cứu Đơn Hàng</h1>
            <p class="text-slate-500 text-sm md:text-base mb-8 font-medium max-w-lg mx-auto">
                Nhập mã kiện hàng của bạn để kiểm tra lộ trình tức thì.
            </p>

            <div class="max-w-xl mx-auto mb-8 bg-white p-2.5 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col sm:flex-row gap-3">
                <div class="relative flex-grow flex items-center">
                    <i class="fa-solid fa-magnifying-glass absolute left-4 text-slate-400 text-lg"></i>
                    <input type="text" id="guest-pkg-id" onkeydown="if(event.key === 'Enter') handleGuestLookup()" oninput="this.value = this.value.toUpperCase()" class="w-full bg-transparent pl-12 pr-4 py-3.5 text-slate-900 font-semibold text-base focus:outline-none focus:ring-0 placeholder-slate-300 tracking-wide uppercase" placeholder="Nhập mã đơn hàng...">
                </div>
                <button onclick="handleGuestLookup()" class="w-full sm:w-auto btn-premium px-8 py-3.5 font-bold text-sm whitespace-nowrap flex items-center justify-center gap-2">
                    Tra Cứu <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>

            <div class="border-t border-slate-100 pt-6">
                <button onclick="setView('login')" class="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center justify-center gap-2 mx-auto">
                    <i class="fa-solid fa-shield-halved"></i> Đăng nhập Quản lý
                </button>
            </div>
        </div>
    </div>
`;

const getLoginHTML = () => `
    <div class="flex-grow flex items-center justify-center p-4 fade-in">
        <div class="apple-card p-8 md:p-10 w-full max-w-sm relative z-10">
            <div class="flex justify-between items-center mb-8">
                <button onclick="setView('landing')" class="text-slate-500 w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors"><i class="fa-solid fa-arrow-left"></i></button>
                <h1 class="text-xl font-extrabold text-slate-900">Đăng nhập</h1>
                <div class="w-8"></div>
            </div>
            <div class="space-y-5 mb-8">
                <div>
                    <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Email</label>
                    <input type="email" id="auth-email" onkeydown="if(event.key === 'Enter') handleLogin()" class="w-full ios-input" placeholder="Nhập email...">
                </div>
                <div>
                    <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Mật khẩu</label>
                    <input type="password" id="auth-password" onkeydown="if(event.key === 'Enter') handleLogin()" class="w-full ios-input" placeholder="••••••••">
                </div>
            </div>
            <button onclick="handleLogin()" class="w-full btn-premium py-3.5 rounded-xl font-bold mb-5 text-sm">Đăng nhập</button>
            <div class="flex justify-between text-sm font-semibold text-slate-500">
                <button onclick="setView('forgotPassword')" class="hover:text-slate-900 transition-colors">Quên mật khẩu?</button>
                <button onclick="setView('register')" class="text-blue-600 hover:text-blue-700 transition-colors">Tạo tài khoản</button>
            </div>
        </div>
    </div>
`;

const getRegisterHTML = () => `
    <div class="flex-grow flex items-center justify-center p-4 fade-in">
        <div class="apple-card p-8 md:p-10 w-full max-w-sm relative z-10">
            <div class="flex justify-between items-center mb-8">
                <button onclick="setView('login')" class="text-slate-500 w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors"><i class="fa-solid fa-arrow-left"></i></button>
                <h1 class="text-xl font-extrabold text-slate-900">Đăng ký</h1>
                <div class="w-8"></div>
            </div>
            <div class="space-y-5 mb-8">
                <div>
                    <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Email</label>
                    <input type="email" id="reg-email" onkeydown="if(event.key === 'Enter') handleRegister()" class="w-full ios-input" placeholder="Nhập email...">
                </div>
                <div>
                    <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Mật khẩu</label>
                    <input type="password" id="reg-password" onkeydown="if(event.key === 'Enter') handleRegister()" class="w-full ios-input" placeholder="Từ 6 ký tự">
                </div>
                <div>
                    <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Mã bảo mật <span class="text-rose-500">*</span></label>
                    <input type="text" id="reg-refcode" onkeydown="if(event.key === 'Enter') handleRegister()" class="w-full ios-input" placeholder="Mã cấp quyền...">
                </div>
            </div>
            <button onclick="handleRegister()" class="w-full btn-premium py-3.5 rounded-xl font-bold text-sm">Tạo tài khoản</button>
        </div>
    </div>
`;

const getForgotHTML = () => `
    <div class="flex-grow flex items-center justify-center p-4 fade-in">
        <div class="apple-card p-8 md:p-10 w-full max-w-sm relative z-10">
            <div class="flex justify-between items-center mb-6">
                <button onclick="setView('login')" class="text-slate-500 w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors"><i class="fa-solid fa-arrow-left"></i></button>
                <h1 class="text-xl font-extrabold text-slate-900">Khôi phục</h1>
                <div class="w-8"></div>
            </div>
            <p class="text-sm text-slate-500 mb-6 font-medium text-center">Nhập email để nhận link tạo lại mật khẩu.</p>
            <div class="mb-8">
                <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Email</label>
                <input type="email" id="reset-email" onkeydown="if(event.key === 'Enter') handleResetPassword()" class="w-full ios-input" placeholder="Nhập email...">
            </div>
            <button onclick="handleResetPassword()" class="w-full btn-premium py-3.5 rounded-xl font-bold text-sm">Gửi liên kết</button>
        </div>
    </div>
`;

const getDashboardHTML = () => `
    <header class="glass-nav sticky top-0 z-30">
        <div class="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
            <div class="flex items-center gap-3 font-extrabold text-lg text-slate-900 tracking-tight">
                <div class="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md">
                    <i class="fa-solid fa-box-open text-sm"></i>
                </div> 
                Tổng Quan
            </div>
            <div class="flex items-center gap-2">
                <button onclick="toggleThemeCycle()" class="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                    ${window.getThemeIcon()}
                </button>
                <div class="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                <button onclick="handleLogout()" class="text-sm font-bold text-slate-500 hover:text-slate-900 px-3 py-2 rounded-lg transition-colors">
                    Đăng xuất
                </button>
            </div>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 lg:px-8 py-8 w-full flex-grow fade-in">
        <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
                <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">Kiện hàng của bạn</h2>
                <p class="text-slate-500 font-medium text-sm mt-1">Quản lý và theo dõi số lượng lớn đơn hàng dễ dàng.</p>
            </div>
            <div class="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                <button onclick="openExportJsonModal()" class="flex-shrink-0 bg-white text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold hover:border-slate-300 hover:shadow-sm transition-all flex items-center gap-2">
                    <i class="fa-solid fa-download"></i> Sao lưu
                </button>
                <label class="flex-shrink-0 bg-white text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold hover:border-slate-300 hover:shadow-sm transition-all flex items-center gap-2 cursor-pointer">
                    <i class="fa-solid fa-upload"></i> Khôi phục
                    <input type="file" accept=".json" onchange="importPackagesJSON(event)" class="hidden">
                </label>
                <button onclick="openPackageModal()" class="flex-shrink-0 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 shadow-md shadow-slate-900/10 transition-all flex items-center gap-2">
                    <i class="fa-solid fa-plus"></i> Tạo kiện mới
                </button>
            </div>
        </div>

        ${state.packages.length === 0 ? `
            <div class="text-center py-24 apple-card">
                <div class="w-16 h-16 bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"><i class="fa-solid fa-box-archive"></i></div>
                <h3 class="text-slate-900 font-extrabold text-lg mb-1">Chưa có dữ liệu</h3>
                <p class="text-slate-500 text-sm mb-6 font-medium">Bắt đầu bằng cách tạo kiện hàng đầu tiên của bạn.</p>
                <button onclick="openPackageModal()" class="text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-6 py-2.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Tạo ngay</button>
            </div>
        ` : `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                ${state.packages.map(pkg => `
                    <div class="apple-card p-6 cursor-pointer flex flex-col relative group" onclick="viewPackage('${pkg.id}')">
                        <div class="flex justify-between items-start mb-4">
                            <div class="flex-grow min-w-0 pr-3">
                                <h3 class="font-bold text-lg text-slate-900 truncate leading-tight">${pkg.name}</h3>
                                <p class="text-xs font-mono font-bold text-slate-400 mt-1 uppercase">ID: ${pkg.id}</p>
                            </div>
                            <span class="pill-badge bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 whitespace-nowrap">${pkg.status}</span>
                        </div>
                        
                        <p class="text-slate-500 text-sm mb-6 line-clamp-2 min-h-[2.5rem]">${pkg.desc || '<span class="italic opacity-50">Không có mô tả</span>'}</p>
                        
                        ${pkg.password ? `<div class="mb-4"><span class="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md uppercase flex items-center inline-flex gap-1 w-max"><i class="fa-solid fa-lock text-slate-400"></i> Có mật khẩu</span></div>` : ''}
                        
                        <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700 mt-auto">
                            <div class="flex flex-col">
                                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Số lượng</span>
                                <span class="text-base font-extrabold text-slate-900">${pkg.orders?.length || 0} đơn</span>
                            </div>
                            <div class="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onclick="event.stopPropagation(); openShareModal('${pkg.id}')" class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all" title="Chia sẻ"><i class="fa-solid fa-share-nodes"></i></button>
                                <button onclick="event.stopPropagation(); openPackageModal('${pkg.id}')" class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all" title="Sửa"><i class="fa-solid fa-pen"></i></button>
                                <button onclick="event.stopPropagation(); deletePackage('${pkg.id}')" class="w-8 h-8 rounded-full flex items-center justify-center text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all" title="Xóa"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `}
    </main>
`;

const getPackageDetailHTML = (isGuest = false) => {
    const pkg = isGuest ? state.currentGuestPkg : state.packages.find(p => p.id === state.currentPkgId);
    if (!pkg) return '';

    const sortOrders = (ordersList) => {
        let filtered = ordersList;
        
        // Áp dụng bộ lọc nâng cao
        if (state.filterConfig.status !== 'all') {
            filtered = filtered.filter(o => (o.deliveryStatus || 'Chờ xử lý') === state.filterConfig.status);
        }

        // Áp dụng sắp xếp
        if (!state.sortConfig.key) return filtered;
        
        return [...filtered].sort((a, b) => {
            let valA = a[state.sortConfig.key] || '';
            let valB = b[state.sortConfig.key] || '';
            
            if (state.sortConfig.key === 'quantity') {
                valA = Number(valA); valB = Number(valB);
            } else if (state.sortConfig.key === 'deliveryStatus') {
                const priority = { 'Chờ xử lý': 1, 'Đang giao': 2, 'Đã giao': 3, 'Hoàn hàng': 4 };
                valA = priority[valA] || 99; valB = priority[valB] || 99;
            } else if (typeof valA === 'string') {
                valA = valA.toLowerCase(); valB = valB.toLowerCase();
            }

            if (valA < valB) return state.sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return state.sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const renderOrderRows = (orders, hideRecipient = false) => {
        const processedOrders = sortOrders(orders);
        
        return processedOrders.map((order, idx) => {
            const checked = window.isOrderChecked(pkg.id, order.id, isGuest, order.note);
            const rowBg = checked ? 'bg-slate-50 dark:bg-slate-800/50' : '';
            const checkIcon = checked ? '<i class="fa-solid fa-check text-slate-900 dark:text-white ml-2"></i>' : '';

            return `
                <tr class="order-row group ${rowBg}" data-search="${order.recipient.toLowerCase()} ${order.trackingCodes.join(' ').toLowerCase()} ${(order.note || '').toLowerCase()} ${(order.productName || '').toLowerCase()}">
                    ${state.isSelectMode ? `
                    <td class="text-center w-12 border-r border-slate-100 dark:border-slate-700">
                        <input type="checkbox" value="${order.id}" onchange="toggleSelectOrder('${order.id}', this)" ${state.selectedOrders.includes(order.id) ? 'checked' : ''} class="order-checkbox w-4 h-4 accent-slate-900 dark:accent-white rounded cursor-pointer">
                    </td>` : ''}
                    ${state.tableCols.stt ? `<td class="text-center text-slate-400 font-mono text-xs w-12">${idx + 1}</td>` : ''}
                    ${(!hideRecipient && state.tableCols.recipient) ? `<td class="font-bold text-slate-900 dark:text-white">${order.recipient}</td>` : ''}
                    ${state.tableCols.productName ? `<td class="text-sm font-medium text-slate-800 dark:text-slate-200">${order.productName || '-'}</td>` : ''}
                    ${state.tableCols.quantity ? `<td class="text-sm text-center font-bold">${order.quantity || 1}</td>` : ''}
                    ${state.tableCols.price ? `<td class="text-sm font-bold text-slate-900 dark:text-white">${order.price || '-'}</td>` : ''}
                    ${state.tableCols.tracking ? `
                    <td>
                        <button onclick="copyTrackingCode('${order.trackingCodes[0]}', event)" class="inline-flex items-center font-mono font-bold text-sm hover:text-blue-600 transition-colors" title="Nhấn để chép">
                            ${order.trackingCodes[0]} ${checkIcon}
                        </button>
                    </td>` : ''}
                    ${state.tableCols.deliveryStatus ? `<td>${window.getStatusBadge(order.deliveryStatus)}</td>` : ''}
                    ${state.tableCols.note ? `<td class="text-sm text-slate-500">${(order.note || '').replace('[#Đã kiểm hàng]', '').trim() || '-'}</td>` : ''}
                    
                    ${!isGuest ? `
                    <td class="text-right w-20 sticky right-0 bg-white group-hover:bg-slate-50 dark:bg-[#1e293b] dark:group-hover:bg-[#0f172a] shadow-[-10px_0_15px_-10px_rgba(0,0,0,0.05)] transition-colors border-l border-slate-100 dark:border-slate-700">
                        <button onclick="openEditOrderModal('${order.id}')" class="text-slate-400 hover:text-blue-600 transition-colors px-1.5"><i class="fa-solid fa-pen"></i></button>
                        <button onclick="deleteOrder('${order.id}')" class="text-slate-400 hover:text-rose-600 transition-colors px-1.5"><i class="fa-solid fa-trash"></i></button>
                    </td>` : ''}
                </tr>
            `;
        }).join('');
    };

    return `
        <header class="glass-nav sticky top-0 z-30">
            <div class="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-3">
                <div class="flex items-center flex-grow min-w-0">
                    <button onclick="${isGuest ? "setView('landing')" : "goBack()"}" class="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mr-2">
                        <i class="fa-solid fa-arrow-left"></i>
                    </button>
                    <div class="flex flex-col min-w-0">
                        <h1 class="font-extrabold text-lg text-slate-900 truncate leading-tight">${pkg.name}</h1>
                        <div class="flex items-center gap-2 mt-0.5">
                            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">${pkg.status}</span>
                            <span class="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span class="text-[10px] font-mono font-bold text-slate-400">ID: ${pkg.id}</span>
                        </div>
                    </div>
                </div>
                <div class="flex gap-2 shrink-0">
                    <button onclick="toggleCheckMode()" class="${state.isCheckingMode ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'} px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
                        <i class="fa-solid fa-clipboard-check"></i> <span class="hidden sm:inline">${state.isCheckingMode ? 'Đóng Kiểm' : 'Kiểm hàng'}</span>
                    </button>
                    
                    <div class="relative">
                        <button onclick="toggleColMenu()" class="bg-white border border-slate-200 text-slate-700 w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-all">
                            <i class="fa-solid fa-sliders"></i>
                        </button>
                        ${state.colMenuOpen ? `
                            <div class="fixed inset-0 z-40" onclick="toggleColMenu()"></div>
                            <div class="absolute right-0 top-full mt-3 w-56 bg-white border border-slate-100 dark:border-slate-700 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] z-50 p-3 fade-in">
                                <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Cột hiển thị</h4>
                                ${Object.keys(state.tableCols).map(col => `
                                    <label class="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors">
                                        <input type="checkbox" onchange="toggleCol('${col}')" ${state.tableCols[col] ? 'checked' : ''} class="w-4 h-4 accent-slate-900 dark:accent-white rounded cursor-pointer"> 
                                        <span class="text-sm font-semibold text-slate-700 capitalize">${col === 'stt' ? 'STT' : col === 'productName' ? 'Sản phẩm' : col === 'deliveryStatus' ? 'Trạng thái giao' : col}</span>
                                    </label>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </header>
        
        <main class="max-w-7xl mx-auto px-4 lg:px-8 py-8 w-full flex-grow fade-in">
             ${state.isCheckingMode ? `
                <div class="apple-card p-6 border-2 border-slate-900 dark:border-white mb-8 animate-[fadeIn_0.2s]">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="font-extrabold text-slate-900 text-sm uppercase tracking-wider"><i class="fa-solid fa-clipboard-check mr-2"></i>Chế độ Kiểm hàng</h3>
                    </div>
                    
                    <div class="flex flex-col sm:flex-row gap-3 mb-6 relative">
                        <div class="relative flex-grow">
                            <input type="text" id="scan-input" autocomplete="off" oninput="handleScanInput(this.value)" onkeydown="if(event.key==='Enter') processCheckOrder(this.value)" class="w-full ios-input font-mono focus:border-slate-900 dark:focus:border-white" placeholder="Nhập mã đơn để kiểm...">
                            <div id="scan-suggestions" class="absolute z-50 w-full bg-white dark:bg-slate-800 shadow-lg rounded-xl mt-2 hidden max-h-60 overflow-y-auto border border-slate-100 dark:border-slate-700 divide-y divide-slate-50 dark:divide-slate-700"></div>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="processCheckOrder(document.getElementById('scan-input').value)" class="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 rounded-xl font-bold transition-colors shrink-0 flex-grow sm:flex-grow-0 py-3.5">Kiểm</button>
                            <button onclick="openCameraScan()" class="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 rounded-xl hover:bg-slate-200 transition-colors shrink-0 py-3.5"><i class="fa-solid fa-camera"></i></button>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div class="p-4 max-h-[50vh] overflow-y-auto space-y-4">
                            ${(() => {
                const groups = groupOrders(pkg.orders);
                return Object.keys(groups).sort().map(recipient => {
                    const groupOrdersList = groups[recipient];
                    const checkedCount = groupOrdersList.filter(o => window.isOrderChecked(pkg.id, o.id, isGuest, o.note)).length;
                    const total = groupOrdersList.length;
                    const allChecked = checkedCount === total && total > 0;

                    return `
                                    <div class="border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden">
                                        <div class="bg-slate-50 dark:bg-slate-800 px-4 py-3 flex justify-between items-center border-b border-slate-100 dark:border-slate-700">
                                            <div class="font-bold text-slate-900 text-sm">${recipient}</div>
                                            <div class="text-[11px] font-bold ${allChecked ? 'text-white bg-emerald-500 px-2.5 py-1 rounded-md' : 'text-slate-500'}">
                                                ${checkedCount} / ${total}
                                            </div>
                                        </div>
                                        <div class="divide-y divide-slate-50 dark:divide-slate-800/50 bg-white dark:bg-slate-900">
                                            ${groupOrdersList.map(o => {
                        const checked = window.isOrderChecked(pkg.id, o.id, isGuest, o.note);
                        return `
                                                <label class="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                                                    <input type="checkbox" ${checked ? 'checked' : ''} onchange="window.toggleOrderCheck('${o.id}', this.checked)" class="w-5 h-5 accent-slate-900 dark:accent-white rounded cursor-pointer">
                                                    <div class="flex-grow">
                                                        <div class="font-mono text-sm font-bold ${checked ? 'text-slate-400 line-through' : 'text-slate-900'}">${o.trackingCodes[0]}</div>
                                                        ${o.note ? `<div class="text-[11px] text-slate-500 mt-0.5 font-medium">${o.note.replace('[#Đã kiểm hàng]', '').trim()}</div>` : ''}
                                                    </div>
                                                </label>
                                                `;
                    }).join('')}
                                        </div>
                                    </div>
                                    `;
                }).join('');
            })()}
                        </div>
                    </div>
                </div>
                ` : `
            
            ${!isGuest ? `
            <div class="apple-card p-6 md:p-8 mb-8">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                        <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center"><i class="fa-solid fa-bolt"></i></div>
                        Thêm đơn nhanh
                    </h3>
                    
                    <label class="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-3 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-2">
                        <i class="fa-solid fa-file-csv text-slate-500"></i> Nhập file CSV
                        <input type="file" accept=".csv" onchange="importOrdersCSV(event)" class="hidden">
                    </label>
                </div>
                
                <div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-4">
                        <div class="lg:col-span-2 xl:col-span-1">
                            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Người nhận *</label>
                            <input type="text" id="ord-recipient" onkeydown="if(event.key === 'Enter') saveOrder()" oninput="state.tempAddForm.recipient = this.value" value="${state.tempAddForm.recipient}" class="w-full ios-input" placeholder="Tên khách...">
                        </div>
                        <div class="lg:col-span-2 xl:col-span-2">
                            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Sản phẩm & Ghi chú</label>
                            <div class="flex gap-2">
                                <input type="text" id="ord-product-name" onkeydown="if(event.key === 'Enter') saveOrder()" oninput="state.tempAddForm.productName = this.value" value="${state.tempAddForm.productName}" class="w-1/2 ios-input" placeholder="Tên SP...">
                                <input type="text" id="ord-note" onkeydown="if(event.key === 'Enter') saveOrder()" oninput="state.tempAddForm.note = this.value" value="${state.tempAddForm.note}" class="w-1/2 ios-input" placeholder="Ghi chú...">
                            </div>
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">SL & Giá</label>
                            <div class="flex gap-2">
                                <input type="number" id="ord-quantity" onkeydown="if(event.key === 'Enter') saveOrder()" oninput="state.tempAddForm.quantity = this.value" value="${state.tempAddForm.quantity}" class="w-20 ios-input text-center px-2" min="1" placeholder="SL">
                                <input type="text" id="ord-price" onkeydown="if(event.key === 'Enter') saveOrder()" oninput="state.tempAddForm.price = this.value" value="${state.tempAddForm.price}" class="w-full ios-input" placeholder="Thành tiền">
                            </div>
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Trạng thái</label>
                            <select id="ord-delivery-status" onchange="state.tempAddForm.deliveryStatus = this.value" class="w-full ios-input cursor-pointer font-semibold text-slate-700 dark:text-slate-200">
                                <option value="Chờ xử lý" ${state.tempAddForm.deliveryStatus === 'Chờ xử lý' ? 'selected' : ''}>Chờ xử lý</option>
                                <option value="Đang giao" ${state.tempAddForm.deliveryStatus === 'Đang giao' ? 'selected' : ''}>Đang giao</option>
                                <option value="Đã giao" ${state.tempAddForm.deliveryStatus === 'Đã giao' ? 'selected' : ''}>Đã giao</option>
                                <option value="Hoàn hàng" ${state.tempAddForm.deliveryStatus === 'Hoàn hàng' ? 'selected' : ''}>Hoàn hàng</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="flex flex-col md:flex-row gap-4 mt-4">
                        <div class="flex-1 flex flex-col relative">
                            <div class="flex justify-between items-end mb-1.5 ml-1">
                                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mã đơn (Tracking) *</label>
                                <div class="flex gap-3">
                                    <button onclick="toggleAddScanMode()" class="text-xs font-bold ${state.isAddingScanMode ? 'text-blue-600' : 'text-slate-400 hover:text-slate-900'} transition-colors">
                                        <i class="fa-solid ${state.isAddingScanMode ? 'fa-video-slash' : 'fa-camera'} mr-1"></i> ${state.isAddingScanMode ? 'Đóng quét' : 'Quét'}
                                    </button>
                                    <button onclick="pasteToTracking()" class="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors">
                                        <i class="fa-solid fa-clipboard mr-1"></i> Dán
                                    </button>
                                </div>
                            </div>
                            <textarea id="ord-tracking" rows="${state.isAddingScanMode ? '10' : '2'}" oninput="this.value = this.value.toUpperCase(); state.tempAddForm.tracking = this.value; window.checkDuplicateTracking()" class="w-full flex-grow ios-input font-mono text-sm leading-relaxed uppercase" placeholder="Nhập mã đơn, cách nhau bằng dấu phẩy hoặc xuống dòng...">${state.tempAddForm.tracking}</textarea>
                            <div id="ord-tracking-warning" class="text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 border border-slate-900 dark:border-white px-3 py-2 text-[11px] font-bold mt-2 hidden items-center gap-2 rounded-lg">
                                <i class="fa-solid fa-triangle-exclamation"></i> <span></span>
                            </div>
                        </div>
                        ${state.isAddingScanMode ? `
                            <div class="w-full md:w-64 shrink-0 bg-slate-900 rounded-2xl overflow-hidden border-4 border-slate-900 relative min-h-[150px] shadow-lg">
                                <div id="add-qr-reader" class="absolute inset-0"></div>
                            </div>
                        ` : ''}
                    </div>

                    <div class="flex justify-end mt-6">
                        <button onclick="saveOrder()" class="w-full md:w-auto bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm rounded-xl hover:bg-slate-800 shadow-md transition-all px-10 py-3.5">
                            Lưu ${state.tempAddForm.tracking ? 'Đơn' : ''}
                        </button>
                    </div>
                </div>
            </div>` : ''}

            <!-- Thanh công cụ lọc, tìm kiếm, gộp nhóm -->
            <div class="flex flex-col gap-3 mb-4">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div class="flex flex-wrap items-center gap-4 md:gap-6 px-2">
                        <button onclick="toggleSelectMode()" class="px-4 py-2 rounded-xl text-sm font-bold transition-all border shadow-sm ${state.isSelectMode ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-white dark:border-slate-700'}">
                            <i class="fa-solid fa-check-double mr-1"></i> ${state.isSelectMode ? 'Hủy Chọn' : 'Chọn Nhiều'}
                        </button>

                        <label class="flex items-center cursor-pointer relative gap-3 group">
                            <input type="checkbox" onchange="toggleGroupBy(this)" ${state.groupByRecipient ? 'checked' : ''} class="sr-only">
                            <div class="w-11 h-6 bg-slate-200 dark:bg-slate-600 rounded-full transition-colors duration-300" style="${state.groupByRecipient ? 'background-color: #3b82f6;' : ''}"></div>
                            <div class="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-sm" style="${state.groupByRecipient ? 'transform: translateX(1.25rem);' : ''}"></div>
                            <span class="text-sm font-bold text-slate-700 dark:text-slate-200 select-none">Gộp theo khách</span>
                        </label>
                        
                        <!-- Nút Bộ lọc Nâng cao -->
                        <button onclick="toggleAdvancedFilter()" class="flex items-center gap-2 text-sm font-bold border-l border-slate-200 dark:border-slate-700 pl-4 md:pl-6 transition-colors ${state.isAdvancedFilterOpen ? 'text-blue-600' : 'text-slate-700 dark:text-slate-200 hover:text-blue-600'}">
                            <i class="fa-solid fa-filter text-slate-400"></i> Bộ lọc
                        </button>

                        <!-- NÚT XUẤT FILE VỪA ĐƯỢC THÊM VÀO -->
                        <button onclick="openExportModal()" class="flex items-center gap-2 text-sm font-bold border-l border-slate-200 dark:border-slate-700 pl-4 md:pl-6 transition-colors text-slate-700 dark:text-slate-200 hover:text-blue-600">
                            <i class="fa-solid fa-file-export text-slate-400"></i> Xuất file
                        </button>
                    </div>

                    <div class="flex items-center gap-3 w-full md:w-auto">
                        <div id="bulk-actions" class="${state.selectedOrders.length > 0 ? 'flex' : 'hidden'} items-center gap-2 fade-in">
                            <span id="selected-count" class="text-[11px] font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-2 py-1 rounded-md mr-1">${state.selectedOrders.length}</span>
                            ${!isGuest ? `
                            <button onclick="deleteSelected()" class="px-3 py-1.5 bg-white dark:bg-slate-800 border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors font-bold text-xs shadow-sm">
                                Xóa
                            </button>` : ''}
                        </div>

                        <div class="flex-1 relative">
                            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <i class="fa-solid fa-search text-slate-400"></i>
                            </div>
                            <input type="text" onkeyup="filterOrders(this.value)" class="w-full ios-input pl-10 shadow-sm min-w-[200px]" placeholder="Tìm đơn, khách...">
                        </div>
                    </div>
                </div>

                <!-- Panel Bộ Lọc Nâng Cao -->
                ${state.isAdvancedFilterOpen ? `
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4 fade-in">
                        <span class="text-xs font-bold text-slate-500 uppercase tracking-widest"><i class="fa-solid fa-sliders mr-1"></i> Lọc Trạng Thái:</span>
                        <select onchange="applyStatusFilter(this.value)" class="ios-input text-sm font-semibold max-w-xs cursor-pointer">
                            <option value="all" ${state.filterConfig.status === 'all' ? 'selected' : ''}>Tất cả trạng thái</option>
                            <option value="Chờ xử lý" ${state.filterConfig.status === 'Chờ xử lý' ? 'selected' : ''}>Chờ xử lý</option>
                            <option value="Đang giao" ${state.filterConfig.status === 'Đang giao' ? 'selected' : ''}>Đang giao</option>
                            <option value="Đã giao" ${state.filterConfig.status === 'Đã giao' ? 'selected' : ''}>Đã giao</option>
                            <option value="Hoàn hàng" ${state.filterConfig.status === 'Hoàn hàng' ? 'selected' : ''}>Hoàn hàng</option>
                        </select>
                    </div>
                ` : ''}
            </div>

            ${(!pkg.orders || pkg.orders.length === 0) ? `
                <div class="text-center py-20 border border-slate-100 dark:border-slate-700 rounded-3xl bg-white dark:bg-slate-900 shadow-sm">
                    <p class="text-slate-400 font-semibold">Kiện hàng đang trống.</p>
                </div>
            ` : `
                <div id="table-container" class="table-container-premium">
                    ${state.groupByRecipient ? (() => {
            const groups = groupOrders(pkg.orders);
            return Object.keys(groups).sort().map(recipient => `
                                <div class="border-b-[8px] border-slate-50 dark:border-[#0f172a] last:border-0">
                                    <div class="bg-slate-50 dark:bg-slate-800 px-5 py-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-700">
                                        <span class="font-extrabold text-slate-900 dark:text-white uppercase tracking-wide text-sm">${recipient}</span>
                                        <span class="text-[10px] font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md shadow-sm border border-slate-100 dark:border-slate-700">${groups[recipient].length} đơn</span>
                                    </div>
                                    <div class="overflow-x-auto">
                                        <table class="w-full min-table text-sm text-left">
                                            <thead>
                                                <tr>
                                                    ${state.isSelectMode ? '<th class="w-12 text-center border-r border-slate-100 dark:border-slate-700"></th>' : ''}
                                                    ${state.tableCols.stt ? '<th class="w-12 text-center">STT</th>' : ''}
                                                    ${state.tableCols.productName ? `<th class="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none transition-colors" onclick="handleSort('productName')">Tên SP ${window.getSortIcon('productName')}</th>` : ''}
                                                    ${state.tableCols.quantity ? `<th class="text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none transition-colors" onclick="handleSort('quantity')">SL ${window.getSortIcon('quantity')}</th>` : ''}
                                                    ${state.tableCols.price ? `<th class="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none transition-colors" onclick="handleSort('price')">Thành tiền ${window.getSortIcon('price')}</th>` : ''}
                                                    ${state.tableCols.tracking ? `<th class="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none transition-colors" onclick="handleSort('trackingCodes')">Mã đơn ${window.getSortIcon('trackingCodes')}</th>` : ''}
                                                    ${state.tableCols.deliveryStatus ? `<th class="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none transition-colors" onclick="handleSort('deliveryStatus')">Trạng thái ${window.getSortIcon('deliveryStatus')}</th>` : ''}
                                                    ${state.tableCols.note ? '<th>Ghi chú</th>' : ''}
                                                    ${!isGuest ? '<th class="text-right w-20 sticky right-0 bg-[#f8fafc] dark:bg-[#0f172a] shadow-[-10px_0_15px_-10px_rgba(0,0,0,0.05)]">Sửa</th>' : ''}
                                                </tr>
                                            </thead>
                                            <tbody class="orders-tbody">
                                                ${renderOrderRows(groups[recipient], true)}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            `).join('');
        })() : `
                        <div class="overflow-x-auto">
                            <table class="w-full min-table text-sm text-left">
                                <thead>
                                    <tr>
                                        ${state.isSelectMode ? `
                                        <th class="w-12 text-center border-r border-slate-100 dark:border-slate-700">
                                            <input type="checkbox" id="globalSelectAll" onchange="toggleSelectAll(this)" class="w-4 h-4 accent-slate-900 dark:accent-white rounded cursor-pointer">
                                        </th>` : ''}
                                        ${state.tableCols.stt ? '<th class="w-12 text-center">STT</th>' : ''}
                                        ${state.tableCols.recipient ? `<th class="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none transition-colors" onclick="handleSort('recipient')">Khách hàng ${window.getSortIcon('recipient')}</th>` : ''}
                                        ${state.tableCols.productName ? `<th class="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none transition-colors" onclick="handleSort('productName')">Tên SP ${window.getSortIcon('productName')}</th>` : ''}
                                        ${state.tableCols.quantity ? `<th class="text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none transition-colors" onclick="handleSort('quantity')">SL ${window.getSortIcon('quantity')}</th>` : ''}
                                        ${state.tableCols.price ? `<th class="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none transition-colors" onclick="handleSort('price')">Thành tiền ${window.getSortIcon('price')}</th>` : ''}
                                        ${state.tableCols.tracking ? `<th class="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none transition-colors" onclick="handleSort('trackingCodes')">Mã đơn ${window.getSortIcon('trackingCodes')}</th>` : ''}
                                        ${state.tableCols.deliveryStatus ? `<th class="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none transition-colors" onclick="handleSort('deliveryStatus')">Trạng thái ${window.getSortIcon('deliveryStatus')}</th>` : ''}
                                        ${state.tableCols.note ? '<th>Ghi chú</th>' : ''}
                                        ${!isGuest ? '<th class="text-right w-20 sticky right-0 bg-[#f8fafc] dark:bg-[#0f172a] shadow-[-10px_0_15px_-10px_rgba(0,0,0,0.05)]">Sửa</th>' : ''}
                                    </tr>
                                </thead>
                                <tbody class="orders-tbody">
                                    ${renderOrderRows(pkg.orders)}
                                </tbody>
                            </table>
                        </div>
                        `}
                </div>
            `}
            `}
        </main>
    `;
};

const renderModals = () => {
    const existingModals = document.getElementById('modals-container');
    if (existingModals) existingModals.remove();

    const container = document.createElement('div');
    container.id = 'modals-container';
    let modalsHTML = '';

    const overlayClass = "fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 fade-in";
    const modalBoxClass = "bg-white dark:bg-slate-900 w-full max-w-md overflow-hidden rounded-t-3xl sm:rounded-2xl flex flex-col max-h-[90vh] shadow-2xl border border-slate-100 dark:border-slate-700";
    const modalHeaderClass = "px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0";

    if (state.modals.package) {
        const pkg = state.editingPkgId ? state.packages.find(p => p.id === state.editingPkgId) : null;
        modalsHTML += `
            <div class="${overlayClass}">
                <div class="${modalBoxClass}">
                    <div class="${modalHeaderClass}">
                        <h3 class="font-extrabold text-slate-900 uppercase tracking-wide">${pkg ? 'Sửa kiện hàng' : 'Tạo kiện mới'}</h3>
                        <button onclick="closeModal('package')" class="text-slate-400 w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                    <div class="p-6 overflow-y-auto">
                        <div class="mb-5">
                            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Mã kiện (3-9 ký tự) *</label>
                            <input type="text" id="pkg-id-input" onkeydown="if(event.key === 'Enter') savePackage()" oninput="this.value = this.value.toUpperCase()" value="${pkg ? pkg.id : state.tempNewPkgId}" class="w-full ios-input font-mono uppercase font-bold" maxlength="9" placeholder="VD: A123">
                        </div>
                        <div class="mb-5">
                            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Tên kiện *</label>
                            <input type="text" id="pkg-name" onkeydown="if(event.key === 'Enter') savePackage()" value="${pkg ? pkg.name : ''}" class="w-full ios-input" placeholder="Tên kiện...">
                        </div>
                        <div class="mb-5">
                            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Mật khẩu (Tùy chọn)</label>
                            <input type="text" id="pkg-password" onkeydown="if(event.key === 'Enter') savePackage()" value="${pkg?.password || ''}" class="w-full ios-input" placeholder="Để trống nếu không cần">
                        </div>
                        <div class="mb-5">
                            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Mô tả</label>
                            <input type="text" id="pkg-desc" onkeydown="if(event.key === 'Enter') savePackage()" value="${pkg ? pkg.desc : ''}" class="w-full ios-input" placeholder="Mô tả kiện hàng...">
                        </div>
                        <div class="mb-8">
                            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Trạng thái</label>
                            <select id="pkg-status" class="w-full ios-input cursor-pointer font-semibold">
                                <option value="Đang gom" ${pkg?.status === 'Đang gom' ? 'selected' : ''}>Đang gom</option>
                                <option value="Đang vận chuyển" ${pkg?.status === 'Đang vận chuyển' ? 'selected' : ''}>Đang vận chuyển</option>
                                <option value="Đã nhận" ${pkg?.status === 'Đã nhận' ? 'selected' : ''}>Đã nhận</option>
                            </select>
                        </div>
                        <div class="flex gap-3 mt-auto">
                            <button onclick="closeModal('package')" class="flex-1 py-3.5 font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors">Hủy</button>
                            <button onclick="savePackage()" class="flex-1 py-3.5 font-bold text-sm text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl hover:opacity-90 transition-opacity">Lưu kiện</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    if (state.modals.editOrder) {
        const pkg = state.packages.find(p => p.id === state.currentPkgId);
        const order = pkg.orders.find(o => o.id === state.editingOrderId);
        if (order) {
            modalsHTML += `
                <div class="${overlayClass}">
                    <div class="${modalBoxClass}">
                        <div class="${modalHeaderClass}">
                            <h3 class="font-extrabold text-slate-900 uppercase tracking-wide">Sửa thông tin đơn</h3>
                            <button onclick="closeModal('editOrder')" class="text-slate-400 w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><i class="fa-solid fa-xmark"></i></button>
                        </div>
                        <div class="p-6 overflow-y-auto">
                            <div class="mb-4">
                                <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Người nhận</label>
                                <input type="text" id="edit-ord-recipient" onkeydown="if(event.key === 'Enter') saveEditOrder()" value="${order.recipient}" class="w-full ios-input">
                            </div>
                            <div class="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Tên sản phẩm</label>
                                    <input type="text" id="edit-ord-product" onkeydown="if(event.key === 'Enter') saveEditOrder()" value="${order.productName || ''}" class="w-full ios-input">
                                </div>
                                <div>
                                    <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Số lượng</label>
                                    <input type="number" id="edit-ord-qty" onkeydown="if(event.key === 'Enter') saveEditOrder()" value="${order.quantity || 1}" class="w-full ios-input text-center">
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Thành tiền</label>
                                    <input type="text" id="edit-ord-price" onkeydown="if(event.key === 'Enter') saveEditOrder()" value="${order.price || ''}" class="w-full ios-input">
                                </div>
                                <div>
                                    <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Trạng thái giao</label>
                                    <select id="edit-ord-status" class="w-full ios-input cursor-pointer font-semibold">
                                        <option value="Chờ xử lý" ${order.deliveryStatus === 'Chờ xử lý' ? 'selected' : ''}>Chờ xử lý</option>
                                        <option value="Đang giao" ${order.deliveryStatus === 'Đang giao' ? 'selected' : ''}>Đang giao</option>
                                        <option value="Đã giao" ${order.deliveryStatus === 'Đã giao' ? 'selected' : ''}>Đã giao</option>
                                        <option value="Hoàn hàng" ${order.deliveryStatus === 'Hoàn hàng' ? 'selected' : ''}>Hoàn hàng</option>
                                    </select>
                                </div>
                            </div>
                            <div class="mb-4">
                                <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Mã đơn</label>
                                <input type="text" id="edit-ord-tracking" onkeydown="if(event.key === 'Enter') saveEditOrder()" oninput="this.value = this.value.toUpperCase()" value="${order.trackingCodes[0] || ''}" class="w-full ios-input font-mono uppercase">
                            </div>
                            <div class="mb-8">
                                <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Ghi chú</label>
                                <input type="text" id="edit-ord-note" onkeydown="if(event.key === 'Enter') saveEditOrder()" value="${order.note || ''}" class="w-full ios-input">
                            </div>
                            <div class="flex gap-3 mt-auto">
                                <button onclick="closeModal('editOrder')" class="flex-1 py-3.5 font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors">Hủy</button>
                                <button onclick="saveEditOrder()" class="flex-1 py-3.5 font-bold text-sm text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl hover:opacity-90 transition-opacity">Cập nhật</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    if (state.modals.export) {
        const rawPkg = state.view === 'guestPackageDetail' ? state.currentGuestPkg : state.packages.find(p => p.id === state.currentPkgId);
        const totalCount = rawPkg.orders.length;
        const selectedCount = state.selectedOrders.length;
        
        modalsHTML += `
            <div class="${overlayClass}">
                <div class="${modalBoxClass}">
                    <div class="${modalHeaderClass}">
                        <h3 class="font-extrabold text-slate-900 uppercase tracking-wide">Xuất dữ liệu</h3>
                        <button onclick="closeModal('export')" class="text-slate-400 w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                    <div class="p-6 overflow-y-auto">
                        
                        <!-- CHỌN PHẠM VI XUẤT -->
                        <div class="mb-6">
                            <h4 class="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Phạm vi xuất</h4>
                            <div class="flex flex-col gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                <label class="flex items-center gap-3 cursor-pointer">
                                    <input type="radio" name="exportScope" value="all" ${selectedCount === 0 ? 'checked' : ''} class="w-4 h-4 accent-slate-900 dark:accent-white">
                                    <span class="text-sm font-semibold text-slate-900 dark:text-white">Toàn bộ kiện (${totalCount} đơn)</span>
                                </label>
                                <label class="flex items-center gap-3 cursor-pointer ${selectedCount === 0 ? 'opacity-50 pointer-events-none' : ''}">
                                    <input type="radio" name="exportScope" value="selected" ${selectedCount > 0 ? 'checked' : ''} class="w-4 h-4 accent-slate-900 dark:accent-white">
                                    <span class="text-sm font-semibold text-slate-900 dark:text-white">Chỉ các đơn đã chọn (${selectedCount} đơn)</span>
                                </label>
                            </div>
                        </div>

                        <!-- CẤU HÌNH CỘT (CHỈ DÀNH CHO ẢNH & PDF) -->
                        <h4 class="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Tùy chọn hiển thị (Dành cho Ảnh/PDF)</h4>
                        <div class="grid grid-cols-2 gap-3 mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                            <label class="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" id="exp-stt" checked class="w-4 h-4 accent-slate-900 dark:accent-white rounded"> <span class="text-sm font-semibold">Cột STT</span>
                            </label>
                            <label class="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" id="exp-recipient" checked class="w-4 h-4 accent-slate-900 dark:accent-white rounded"> <span class="text-sm font-semibold">Khách hàng</span>
                            </label>
                            <label class="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" id="exp-productName" checked class="w-4 h-4 accent-slate-900 dark:accent-white rounded"> <span class="text-sm font-semibold">Sản phẩm</span>
                            </label>
                            <label class="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" id="exp-quantity" checked class="w-4 h-4 accent-slate-900 dark:accent-white rounded"> <span class="text-sm font-semibold">Số lượng</span>
                            </label>
                            <label class="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" id="exp-price" checked class="w-4 h-4 accent-slate-900 dark:accent-white rounded"> <span class="text-sm font-semibold">Thành tiền</span>
                            </label>
                            <label class="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" id="exp-tracking" checked class="w-4 h-4 accent-slate-900 dark:accent-white rounded"> <span class="text-sm font-semibold">Mã đơn</span>
                            </label>
                            <label class="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" id="exp-deliveryStatus" checked class="w-4 h-4 accent-slate-900 dark:accent-white rounded"> <span class="text-sm font-semibold">Trạng thái</span>
                            </label>
                            <label class="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" id="exp-note" checked class="w-4 h-4 accent-slate-900 dark:accent-white rounded"> <span class="text-sm font-semibold">Ghi chú</span>
                            </label>
                            <label class="flex items-center gap-3 cursor-pointer col-span-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                <input type="checkbox" id="exp-group" ${state.groupByRecipient ? 'checked' : ''} class="w-4 h-4 accent-slate-900 dark:accent-white rounded">
                                <span class="text-sm font-bold text-slate-900 dark:text-white">Tách bảng theo từng khách hàng</span>
                            </label>
                        </div>
                        
                        <h4 class="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Định dạng xuất</h4>
                        <div class="grid grid-cols-3 gap-3">
                            <button onclick="executeExport('image')" class="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-slate-900 dark:hover:border-white transition-colors gap-2 shadow-sm">
                                <i class="fa-regular fa-image text-2xl text-slate-700 dark:text-slate-200"></i><span class="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-white">PNG</span>
                            </button>
                            <button onclick="executeExport('pdf')" class="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-slate-900 dark:hover:border-white transition-colors gap-2 shadow-sm">
                                <i class="fa-regular fa-file-pdf text-2xl text-slate-700 dark:text-slate-200"></i><span class="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-white">PDF</span>
                            </button>
                            <button onclick="executeExport('csv')" title="Xuất CSV đầy đủ cột để sau này import lại" class="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl hover:border-blue-400 transition-colors gap-2 shadow-sm">
                                <i class="fa-solid fa-file-csv text-2xl text-blue-600 dark:text-blue-400"></i><span class="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">CSV</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    if (state.modals.cameraScan) {
        modalsHTML += `
            <div class="${overlayClass}">
                <div class="${modalBoxClass}">
                    <div class="${modalHeaderClass}">
                        <h3 class="font-extrabold text-slate-900 uppercase tracking-wide">Quét mã vạch</h3>
                        <button onclick="closeCameraScan()" class="text-slate-400 w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                    <div class="p-4 bg-slate-900">
                        <div id="qr-reader" class="w-full"></div>
                    </div>
                </div>
            </div>
        `;
    }

    if (state.modals.share) {
        const basePath = window.location.pathname.replace(/\/index\.html$/, '/');
        const cleanBasePath = basePath.endsWith('/') ? basePath : basePath + '/';
        const link = window.location.origin + (cleanBasePath === '' ? '' : cleanBasePath) + '#' + state.editingPkgId;

        modalsHTML += `
            <div class="${overlayClass}">
                <div class="${modalBoxClass}">
                    <div class="${modalHeaderClass}">
                        <h3 class="font-extrabold text-slate-900 uppercase tracking-wide"> Chia sẻ</h3>
                        <button onclick="closeModal('share')" class="text-slate-400 w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                    <div class="p-6">
                        <div class="mb-5">
                            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Mã tra cứu</label>
                            <div class="flex gap-2">
                                <input type="text" readonly value="${state.editingPkgId}" class="w-full ios-input font-mono font-bold text-slate-900">
                                <button onclick="copyTrackingCode('${state.editingPkgId}')" class="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 rounded-xl text-sm font-bold hover:opacity-90"><i class="fa-regular fa-copy"></i></button>
                            </div>
                        </div>
                        <div>
                            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Link chia sẻ</label>
                            <div class="flex gap-2">
                                <input type="text" readonly value="${link}" class="w-full ios-input font-mono text-slate-500 text-sm">
                                <button onclick="copyTrackingCode('${link}')" class="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 rounded-xl text-sm font-bold hover:opacity-90"><i class="fa-regular fa-copy"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    if (state.modals.guestPasswordPrompt) {
        modalsHTML += `
            <div class="${overlayClass}">
                <div class="${modalBoxClass} p-8 text-center max-w-sm border-none">
                    <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"><i class="fa-solid fa-lock"></i></div>
                    <h3 class="text-xl font-extrabold text-slate-900 mb-2 tracking-tight">Kiện hàng bảo mật</h3>
                    <p class="text-slate-500 text-sm mb-6 font-medium">Vui lòng nhập mật khẩu để tiếp tục.</p>
                    
                    <input type="password" id="guest-password-input" onkeydown="if(event.key === 'Enter') submitGuestPassword()" class="w-full ios-input mb-4 text-center font-mono tracking-widest" placeholder="Mật khẩu...">
                    
                    <label class="flex items-center justify-center gap-2 mb-8 cursor-pointer">
                        <input type="checkbox" id="guest-remember-pwd" class="w-4 h-4 accent-slate-900 dark:accent-white rounded cursor-pointer">
                        <span class="text-sm font-semibold text-slate-600">Lưu mật khẩu cho lần sau</span>
                    </label>

                    <div class="flex gap-3">
                        <button onclick="closeModal('guestPasswordPrompt'); setView(state.user ? 'dashboard' : 'landing')" class="flex-1 py-3.5 font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors">Quay lại</button>
                        <button onclick="submitGuestPassword()" class="flex-1 py-3.5 font-bold text-sm bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl hover:opacity-90 transition-opacity">Mở khóa</button>
                    </div>
                </div>
            </div>
        `;
    }

    if (state.modals.exportJson) {
        const allSelected = state.selectedPackages.length === state.packages.length && state.packages.length > 0;
        modalsHTML += `
            <div class="${overlayClass}">
                <div class="${modalBoxClass}">
                    <div class="${modalHeaderClass}">
                        <h3 class="font-extrabold text-slate-900 uppercase tracking-wide">Chọn kiện để xuất</h3>
                        <button onclick="closeModal('exportJson')" class="text-slate-400 w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                    <div class="p-6 overflow-y-auto">
                        <div class="mb-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3">
                            <span class="font-bold text-sm text-slate-600">Danh sách kiện hàng:</span>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" onchange="toggleSelectAllPackages(this.checked)" ${allSelected ? 'checked' : ''} class="w-4 h-4 accent-slate-900 dark:accent-white rounded cursor-pointer">
                                <span class="text-sm font-semibold">Chọn tất cả</span>
                            </label>
                        </div>
                        <div class="space-y-2 max-h-[40vh] overflow-y-auto mb-6 pr-2">
                            ${state.packages.length === 0 ? '<p class="text-sm text-slate-400 italic text-center py-4">Không có kiện hàng nào.</p>' : ''}
                            ${state.packages.map(pkg => `
                                <label class="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer transition-colors ${state.selectedPackages.includes(pkg.id) ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-900'}">
                                    <input type="checkbox" onchange="toggleSelectPackage('${pkg.id}', this.checked)" ${state.selectedPackages.includes(pkg.id) ? 'checked' : ''} class="w-4 h-4 accent-slate-900 dark:accent-white rounded cursor-pointer">
                                    <div class="flex-grow min-w-0">
                                        <div class="font-bold text-sm text-slate-900 truncate">${pkg.name}</div>
                                        <div class="text-[11px] text-slate-500 font-mono mt-0.5">ID: ${pkg.id} • ${pkg.orders?.length || 0} đơn</div>
                                    </div>
                                </label>
                            `).join('')}
                        </div>
                        <button onclick="executeExportJson()" class="w-full py-3.5 font-bold text-sm text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl hover:opacity-90 transition-opacity">
                            Xuất ${state.selectedPackages.length} kiện
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    if (state.modals.importConfirm && state.pendingImport) {
        const dupCount = state.pendingImport.duplicateCount;
        const totalCount = state.pendingImport.packages.length;
        modalsHTML += `
            <div class="${overlayClass}">
                <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-700 w-full max-w-sm p-8 fade-in text-center shadow-2xl">
                    <div class="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"><i class="fa-solid fa-cloud-arrow-down"></i></div>
                    <h3 class="text-xl font-extrabold text-slate-900 mb-2 tracking-tight">Nhập dữ liệu</h3>
                    <p class="text-slate-600 text-sm mb-6 font-medium">Tìm thấy <b>${totalCount}</b> kiện hàng trong file.</p>
                    
                    ${dupCount > 0 ? `
                        <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 p-4 rounded-xl mb-6 text-left">
                            <p class="text-[11px] font-bold text-amber-800 dark:text-amber-400 mb-3 uppercase tracking-widest"><i class="fa-solid fa-triangle-exclamation"></i> Trùng ${dupCount} mã kiện</p>
                            <div class="flex flex-col gap-3">
                                <label class="flex items-center gap-3 cursor-pointer">
                                    <input type="radio" name="importAction" value="replace" checked class="w-4 h-4 accent-slate-900 dark:accent-white cursor-pointer">
                                    <span class="text-sm font-semibold text-slate-900">Ghi đè bản cũ</span>
                                </label>
                                <label class="flex items-center gap-3 cursor-pointer">
                                    <input type="radio" name="importAction" value="clone" class="w-4 h-4 accent-slate-900 dark:accent-white cursor-pointer">
                                    <span class="text-sm font-semibold text-slate-900">Tạo bản sao mới</span>
                                </label>
                            </div>
                        </div>
                    ` : ''}

                    <div class="flex gap-3">
                        <button onclick="closeModal('importConfirm')" class="flex-1 py-3.5 font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors">Hủy</button>
                        <button onclick="executeImportJson()" class="flex-1 py-3.5 font-bold text-sm bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl hover:opacity-90 transition-opacity">Xác nhận</button>
                    </div>
                </div>
            </div>
        `;
    }

    container.innerHTML = modalsHTML;
    document.body.appendChild(container);

    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('fixed') && e.target.classList.contains('inset-0')) {
            Object.keys(state.modals).forEach(k => state.modals[k] = false);
            render();
        }
    });
};

// --- AUTH & ROUTING ---
const setView = (viewName) => {
    if (state.scannerInstance) window.closeCameraScan();
    if (state.addScannerInstance) {
        state.addScannerInstance.clear().catch(e => console.log(e));
        state.addScannerInstance = null;
    }
    state.isCheckingMode = false;
    state.isAddingScanMode = false;
    state.isSelectMode = false;
    state.tempAddForm = { recipient: '', tracking: '', note: '', productName: '', quantity: 1, price: '', deliveryStatus: 'Chờ xử lý' };
    state.view = viewName;
    render();
};
window.setView = setView;

const checkHashRouting = async () => {
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
        const pkgId = hash.substring(1).toUpperCase();
        showLoader('Đang tìm kiện...');
        
        // KIỂM TRA QUYỀN ADMIN TRƯỚC NẾU ĐÃ ĐĂNG NHẬP
        if (state.user) {
            await fetchAdminPackages(); 
            const adminPkg = state.packages.find(p => p.id === pkgId);
            if (adminPkg) {
                hideLoader();
                state.currentPkgId = pkgId;
                setView('packageDetail');
                return;
            }
        }
        
        // NẾU KHÔNG PHẢI ADMIN HOẶC KHÔNG PHẢI KIỆN CỦA ADMIN, KIỂM TRA GUEST
        const pkg = await fetchGuestPackage(pkgId);
        hideLoader();

        if (pkg) {
            state.currentGuestPkg = pkg;
            if (pkg.password) {
                const savedPwd = localStorage.getItem('pkg_pwd_' + pkg.id);
                // Admin xem link ẩn danh không cần pass nếu đó là kiện do họ tạo
                if (savedPwd === pkg.password || (state.user && pkg.ownerId === state.user.uid)) {
                    setView('guestPackageDetail');
                } else {
                    state.modals.guestPasswordPrompt = true;
                    setView('landing'); 
                }
            } else {
                setView('guestPackageDetail');
            }
        } else {
            showToast('Không tìm thấy mã kiện!', 'error');
            setView(state.user ? 'dashboard' : 'landing');
            window.location.hash = '';
        }
    }
};

onAuthStateChanged(auth, async (user) => {
    state.user = user;
    const loader = document.getElementById('global-loader');
    
    if (user) await fetchAdminPackages();

    if (window.location.hash && window.location.hash.length > 1) {
        await checkHashRouting();
    } else if (user) {
        setView('dashboard');
    } else {
        setView('landing');
    }
    
    if (loader) loader.style.display = 'none';
});

// --- AUTH ACTIONS ---
window.handleLogin = async () => {
    const email = document.getElementById('auth-email').value;
    const pass = document.getElementById('auth-password').value;
    if (!email || !pass) return showToast('Vui lòng nhập đủ thông tin', 'error');
    try {
        showLoader();
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
        hideLoader();
        showToast('Sai email hoặc mật khẩu!', 'error');
    }
};

window.handleRegister = async () => {
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-password').value;
    const refCode = document.getElementById('reg-refcode').value;

    if (!email || !pass || !refCode) return showToast('Nhập đủ thông tin', 'error');
    if (pass.length < 6) return showToast('Mật khẩu tối thiểu 6 ký tự', 'error');
    if (refCode !== MA_GIOI_THIEU_HOP_LE) return showToast('Mã bảo mật sai!', 'error');

    try {
        showLoader();
        await createUserWithEmailAndPassword(auth, email, pass);
        showToast('Đăng ký thành công!');
    } catch (error) {
        hideLoader();
        showToast('Lỗi: ' + error.message, 'error');
    }
};

window.handleResetPassword = async () => {
    const email = document.getElementById('reset-email').value;
    if (!email) return showToast('Vui lòng nhập email', 'error');
    try {
        showLoader();
        await sendPasswordResetEmail(auth, email);
        hideLoader();
        window.showAlert('Đã gửi link khôi phục mật khẩu vào email của bạn.', 'Thành công');
        setView('login');
    } catch (error) {
        hideLoader();
        showToast('Lỗi: ' + error.message, 'error');
    }
};

window.handleLogout = async () => {
    try {
        await signOut(auth);
        state.packages = [];
        window.location.hash = '';
    } catch (err) { console.error(err); }
};

// --- GUEST ACTIONS ---
window.handleGuestLookup = async () => {
    const code = document.getElementById('guest-pkg-id').value.trim().toUpperCase();
    if (!code) return window.showAlert('Vui lòng nhập mã vận đơn để tra cứu', 'Thiếu thông tin');

    showLoader('Đang tìm...');
    const pkg = await fetchGuestPackage(code);
    hideLoader();

    if (pkg) {
        state.currentGuestPkg = pkg;
        window.location.hash = pkg.id;
        if (pkg.password) {
            const savedPwd = localStorage.getItem('pkg_pwd_' + pkg.id);
            if (savedPwd === pkg.password || (state.user && pkg.ownerId === state.user.uid)) {
                setView('guestPackageDetail');
            } else {
                state.modals.guestPasswordPrompt = true;
                render();
            }
        } else {
            setView('guestPackageDetail');
        }
    } else {
        window.showAlert('Mã kiện không tồn tại hoặc đã bị xóa', 'Không tìm thấy');
    }
};

window.submitGuestPassword = () => {
    const input = document.getElementById('guest-password-input').value;
    const remember = document.getElementById('guest-remember-pwd')?.checked;
    if (input === state.currentGuestPkg.password) {
        if (remember) {
            localStorage.setItem('pkg_pwd_' + state.currentGuestPkg.id, input);
        }
        closeModal('guestPasswordPrompt');
        setView('guestPackageDetail');
    } else {
        showToast('Sai mật khẩu!', 'error');
    }
};

window.openShareModal = (pkgId) => {
    state.editingPkgId = pkgId;
    state.modals.share = true;
    render();
};

// --- ADMIN ACTIONS (UI & FIRESTORE) ---
window.goBack = () => {
    state.currentPkgId = null;
    state.selectedOrders = [];
    state.isCheckingMode = false;
    state.isSelectMode = false;
    setView('dashboard');
};
window.viewPackage = (id) => { state.currentPkgId = id; state.selectedOrders = []; state.isSelectMode = false; setView('packageDetail'); };
window.closeModal = (type) => { state.modals[type] = false; render(); };
window.toggleGroupBy = (cb) => { state.groupByRecipient = cb.checked; state.selectedOrders = []; render(); };
window.toggleColMenu = () => { state.colMenuOpen = !state.colMenuOpen; render(); };

window.toggleCol = (cName) => {
    state.tableCols[cName] = !state.tableCols[cName];
    localStorage.setItem('app_table_cols', JSON.stringify(state.tableCols));
    render();
};

window.toggleSelectMode = () => {
    state.isSelectMode = !state.isSelectMode;
    if (!state.isSelectMode) {
        state.selectedOrders = [];
    }
    render();
};

window.openPackageModal = (id = null) => {
    state.editingPkgId = id;
    state.tempNewPkgId = id ? id : generatePackageCode();
    state.modals.package = true;
    render();
};

window.savePackage = async () => {
    const newId = document.getElementById('pkg-id-input').value.trim().toUpperCase();
    const name = document.getElementById('pkg-name').value.trim();
    const desc = document.getElementById('pkg-desc').value.trim();
    const status = document.getElementById('pkg-status').value;
    const password = document.getElementById('pkg-password').value.trim();

    if (!newId || newId.length < 3 || newId.length > 9) return showToast('Mã từ 3-9 ký tự', 'error');
    if (!name) return showToast('Nhập tên kiện', 'error');

    showLoader();

    try {
        if (!state.editingPkgId || state.editingPkgId !== newId) {
            const existSnap = await getDoc(doc(db, "packages", newId));
            if (existSnap.exists()) {
                hideLoader();
                return window.showAlert('Mã này đã tồn tại trong hệ thống. Vui lòng chọn mã khác.', 'Lỗi');
            }
        }

        if (state.editingPkgId) {
            const pkg = state.packages.find(p => p.id === state.editingPkgId);
            const updatedPkg = { ...pkg, id: newId, name, desc, status, password };

            await setDoc(doc(db, "packages", newId), updatedPkg);

            if (state.editingPkgId !== newId) {
                await deleteDoc(doc(db, "packages", state.editingPkgId));
            }

            const index = state.packages.findIndex(p => p.id === state.editingPkgId);
            state.packages[index] = updatedPkg;
            if (state.currentPkgId === state.editingPkgId) state.currentPkgId = newId;

            showToast('Đã lưu thay đổi');
        } else {
            const newPkg = {
                id: newId,
                name, desc, status, password,
                orders: [],
                ownerId: state.user.uid,
                createdAt: Date.now()
            };
            await syncPackageToDB(newPkg);
            state.packages.unshift(newPkg);
            showToast('Đã tạo kiện mới');
        }
    } catch (e) {
        showToast('Lỗi lưu dữ liệu', 'error');
    }

    hideLoader();
    closeModal('package');
};

window.deletePackage = (id) => {
    window.showConfirm('Xóa kiện hàng?', 'Dữ liệu trong kiện hàng này sẽ bị mất vĩnh viễn và không thể khôi phục.', async () => {
        showLoader();
        try {
            await deletePackageDB(id);
            state.packages = state.packages.filter(p => p.id !== id);
            showToast('Đã xóa kiện');
            render();
        } catch (e) { }
        hideLoader();
    });
};

// --- KIỂM HÀNG & SCANNER ---
window.toggleCheckMode = () => {
    state.isCheckingMode = !state.isCheckingMode;
    render();
    if (state.isCheckingMode) {
        setTimeout(() => {
            const el = document.getElementById('scan-input');
            if (el) el.focus();
        }, 100);
    }
};

window.handleScanInput = (val) => {
    const container = document.getElementById('scan-suggestions');
    if (!val.trim()) {
        if (container) { container.classList.add('hidden'); container.innerHTML = ''; }
        return;
    }
    const query = val.trim();
    let mode = 'any'; let searchStr = query.toLowerCase();

    if (query.startsWith('@')) { mode = 'starts'; searchStr = query.substring(1); }
    else if (query.startsWith('#')) { mode = 'ends'; searchStr = query.substring(1); }

    if (!searchStr) {
        if (container) { container.classList.add('hidden'); container.innerHTML = ''; }
        return;
    }

    const isGuest = state.view === 'guestPackageDetail';
    const pkg = isGuest ? state.currentGuestPkg : state.packages.find(p => p.id === state.currentPkgId);

    const matches = pkg.orders.filter(o => o.trackingCodes.some(c => {
        const lc = c.toLowerCase();
        if (mode === 'starts') return lc.startsWith(searchStr);
        if (mode === 'ends') return lc.endsWith(searchStr);
        return lc.includes(searchStr);
    }));

    if (matches.length === 0) {
        container.classList.add('hidden');
        container.innerHTML = '';
        return;
    }

    container.classList.remove('hidden');
    container.innerHTML = matches.slice(0, 10).map(o => {
        const checked = window.isOrderChecked(pkg.id, o.id, isGuest, o.note);
        return `
            <div class="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex justify-between items-center transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0" onclick="processCheckOrder('${o.trackingCodes[0]}')">
                <div>
                    <div class="font-mono text-sm font-bold ${checked ? 'text-slate-400 line-through' : 'text-slate-900'}">${o.trackingCodes[0]}</div>
                    <div class="text-xs text-slate-500 font-medium">${o.recipient}</div>
                </div>
                ${checked ? '<i class="fa-solid fa-check text-slate-900 dark:text-white"></i>' : ''}
            </div>
            `;
    }).join('');
};

window.toggleOrderCheck = async (orderId, forceState) => {
    const isGuest = state.view === 'guestPackageDetail';
    const pkg = isGuest ? state.currentGuestPkg : state.packages.find(p => p.id === state.currentPkgId);
    const order = pkg.orders.find(o => o.id === orderId);
    if (!order) return;

    if (isGuest) {
        let checkedArr = getGuestChecked(pkg.id);
        const isCurrentlyChecked = checkedArr.includes(orderId);
        const newState = forceState !== undefined ? forceState : !isCurrentlyChecked;

        if (newState && !isCurrentlyChecked) checkedArr.push(orderId);
        else if (!newState && isCurrentlyChecked) checkedArr = checkedArr.filter(id => id !== orderId);

        setGuestChecked(pkg.id, checkedArr);
        render();
        if (state.isCheckingMode) setTimeout(() => { const el = document.getElementById('scan-input'); if (el) el.focus(); }, 50);
    } else {
        const hasTag = (order.note || '').includes('[#Đã kiểm hàng]');
        const newState = forceState !== undefined ? forceState : !hasTag;

        if (newState && !hasTag) {
            order.note = '[#Đã kiểm hàng] ' + (order.note || '');
        } else if (!newState && hasTag) {
            order.note = (order.note || '').replace('[#Đã kiểm hàng]', '').trim();
        }

        try {
            await syncPackageToDB(pkg);
            render();
            if (state.isCheckingMode) setTimeout(() => { const el = document.getElementById('scan-input'); if (el) el.focus(); }, 50);
        } catch (e) { }
    }
};

window.processCheckOrder = async (codeStr) => {
    if (!codeStr || !codeStr.trim()) return;
    const code = codeStr.trim().toUpperCase();
    const isGuest = state.view === 'guestPackageDetail';
    const pkg = isGuest ? state.currentGuestPkg : state.packages.find(p => p.id === state.currentPkgId);

    let order = pkg.orders.find(o => o.trackingCodes.some(c => c.toUpperCase() === code));

    if (!order) {
        let mode = 'any'; let searchStr = code.toLowerCase();
        if (searchStr.startsWith('@')) { mode = 'starts'; searchStr = searchStr.substring(1); }
        else if (searchStr.startsWith('#')) { mode = 'ends'; searchStr = searchStr.substring(1); }

        const matches = pkg.orders.filter(o => o.trackingCodes.some(c => {
            const lc = c.toLowerCase();
            if (mode === 'starts') return lc.startsWith(searchStr);
            if (mode === 'ends') return lc.endsWith(searchStr);
            return lc.includes(searchStr);
        }));

        if (matches.length === 1) order = matches[0];
    }

    if (!order) {
        showToast(`Không khớp: ${code}`, 'error');
    } else {
        const isChecked = window.isOrderChecked(pkg.id, order.id, isGuest, order.note);
        if (isChecked) {
            showToast(`Mã ${order.trackingCodes[0]} đã được kiểm!`, 'error');
        } else {
            await window.toggleOrderCheck(order.id, true);
            showToast(`OK: ${order.trackingCodes[0]}`);
        }
    }

    const inputEl = document.getElementById('scan-input');
    if (inputEl) {
        inputEl.value = '';
        inputEl.focus();
        window.handleScanInput('');
    }
};

window.processAddScan = (codeStr) => {
    if (!codeStr || !codeStr.trim()) return;
    const code = codeStr.trim().toUpperCase();
    const textarea = document.getElementById('ord-tracking');
    if (!textarea) return;

    const currentCodes = textarea.value.split(/[,\n]/).map(c => c.trim().toUpperCase()).filter(c => c !== '');

    if (currentCodes.includes(code)) {
        showToast(`Đã có mã: ${code}`, 'error');
        return;
    }

    const newValue = textarea.value ? textarea.value + '\n' + code : code;
    textarea.value = newValue;
    state.tempAddForm.tracking = newValue;
    showToast(`Thêm mã: ${code}`);
    window.checkDuplicateTracking();
};

window.openCameraScan = () => {
    state.modals.cameraScan = true;
    render();
    setTimeout(() => {
        state.scannerInstance = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
        state.scannerInstance.render((decodedText) => {
            if (state.lastScanned !== decodedText) {
                state.lastScanned = decodedText;
                window.processCheckOrder(decodedText);
                setTimeout(() => { state.lastScanned = null; }, 2000);
            }
        }, (err) => { });
    }, 200);
};

window.closeCameraScan = () => {
    if (state.scannerInstance) {
        state.scannerInstance.clear().catch(e => console.log(e));
        state.scannerInstance = null;
    }
    state.modals.cameraScan = false;
    render();
    if (state.isCheckingMode) {
        setTimeout(() => { const el = document.getElementById('scan-input'); if (el) el.focus(); }, 100);
    }
};

window.toggleAddScanMode = () => {
    state.isAddingScanMode = !state.isAddingScanMode;
    if (!state.isAddingScanMode && state.addScannerInstance) {
        state.addScannerInstance.clear().catch(e => console.log(e));
        state.addScannerInstance = null;
    }
    render();

    if (state.isAddingScanMode) {
        setTimeout(() => {
            state.addScannerInstance = new Html5QrcodeScanner("add-qr-reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
            state.addScannerInstance.render((decodedText) => {
                if (state.lastScanned !== decodedText) {
                    state.lastScanned = decodedText;
                    window.processAddScan(decodedText);
                    setTimeout(() => { state.lastScanned = null; }, 2000);
                }
            }, (err) => { });
        }, 200);
    }

    setTimeout(() => { window.checkDuplicateTracking(); }, 250);
};

// --- ORDER MANAGEMENT ---
window.checkDuplicateTracking = () => {
    const textarea = document.getElementById('ord-tracking');
    if (!textarea) return false;

    const warningEl = document.getElementById('ord-tracking-warning');
    const warningText = warningEl.querySelector('span');

    const val = textarea.value.toUpperCase();
    const codes = val.split(/[,\n]/).map(c => c.trim()).filter(c => c !== '');
    const pkg = state.packages.find(p => p.id === state.currentPkgId);

    const existingCodes = pkg.orders.map(o => o.trackingCodes[0]);
    const duplicatesWithExisting = codes.filter(c => existingCodes.includes(c));
    const internalDuplicates = codes.filter((item, index) => codes.indexOf(item) !== index);
    const allDuplicates = [...new Set([...duplicatesWithExisting, ...internalDuplicates])];

    if (allDuplicates.length > 0) {
        warningText.textContent = `Trùng mã: ${allDuplicates.join(', ')}`;
        warningEl.classList.remove('hidden');
        warningEl.classList.add('flex');
        textarea.classList.add('border-rose-500', 'dark:border-rose-500');
        return true;
    } else {
        warningEl.classList.add('hidden');
        warningEl.classList.remove('flex');
        textarea.classList.remove('border-rose-500', 'dark:border-rose-500');
        return false;
    }
};

window.pasteToTracking = async () => {
    try {
        const text = await navigator.clipboard.readText();
        const textarea = document.getElementById('ord-tracking');
        if (textarea) {
            textarea.value = (textarea.value ? textarea.value + '\n' + text : text).toUpperCase();
            state.tempAddForm.tracking = textarea.value;
            showToast('Đã dán');
            window.checkDuplicateTracking();
        }
    } catch { showToast('Hãy dùng Ctrl+V', 'error'); }
};

window.saveOrder = async () => {
    const recipient = document.getElementById('ord-recipient').value.trim();
    const trackingRaw = document.getElementById('ord-tracking').value.toUpperCase();
    const note = document.getElementById('ord-note').value.trim();

    const productName = document.getElementById('ord-product-name')?.value.trim() || '';
    const quantity = document.getElementById('ord-quantity')?.value || 1;
    const price = document.getElementById('ord-price')?.value.trim() || '';
    const deliveryStatus = document.getElementById('ord-delivery-status')?.value || 'Chờ xử lý';

    if (!recipient) return showToast('Nhập khách hàng', 'error');
    if (!trackingRaw.trim()) return showToast('Nhập mã', 'error');

    const trackingCodes = trackingRaw.split(/[,\n]/).map(c => c.trim()).filter(c => c !== '');
    const pkg = state.packages.find(p => p.id === state.currentPkgId);

    const existingCodes = pkg.orders.map(o => o.trackingCodes[0]);
    const duplicatesWithExisting = trackingCodes.filter(c => existingCodes.includes(c));
    const internalDuplicates = trackingCodes.filter((item, index) => trackingCodes.indexOf(item) !== index);
    const allDuplicates = [...new Set([...duplicatesWithExisting, ...internalDuplicates])];

    if (allDuplicates.length > 0) return window.showAlert(`Phát hiện mã trùng lặp: ${allDuplicates[0]}. Không thể lưu đơn.`, 'Lỗi');

    const newOrders = trackingCodes.map(code => ({
        id: 'ord-' + generateId(),
        recipient,
        trackingCodes: [code],
        note,
        productName,
        quantity,
        price,
        deliveryStatus
    }));

    pkg.orders = [...newOrders, ...pkg.orders];

    showLoader('Lưu...');
    try {
        await syncPackageToDB(pkg);
        showToast(`Đã lưu ${newOrders.length} đơn`);
        state.tempAddForm = { recipient: '', tracking: '', note: '', productName: '', quantity: 1, price: '', deliveryStatus: 'Chờ xử lý' };
        render();
        setTimeout(() => { window.checkDuplicateTracking(); }, 100);
    } catch (e) { }
    hideLoader();
};

window.openEditOrderModal = (oId) => { state.editingOrderId = oId; state.modals.editOrder = true; render(); };

window.saveEditOrder = async () => {
    const recipient = document.getElementById('edit-ord-recipient').value.trim();
    const trackingRaw = document.getElementById('edit-ord-tracking').value.trim().toUpperCase();
    const note = document.getElementById('edit-ord-note').value.trim();

    const productName = document.getElementById('edit-ord-product').value.trim();
    const quantity = document.getElementById('edit-ord-qty').value;
    const price = document.getElementById('edit-ord-price').value.trim();
    const deliveryStatus = document.getElementById('edit-ord-status').value.trim();

    if (!recipient || !trackingRaw) return showToast('Điền đủ thông tin', 'error');

    const pkg = state.packages.find(p => p.id === state.currentPkgId);
    const existingOtherCodes = pkg.orders.filter(o => o.id !== state.editingOrderId).map(o => o.trackingCodes[0]);
    if (existingOtherCodes.includes(trackingRaw)) return window.showAlert(`Mã ${trackingRaw} đã tồn tại trong một đơn khác!`, 'Lỗi');

    const order = pkg.orders.find(o => o.id === state.editingOrderId);
    if (order) {
        order.recipient = recipient;
        order.trackingCodes = [trackingRaw];
        order.note = note;
        order.productName = productName;
        order.quantity = quantity;
        order.price = price;
        order.deliveryStatus = deliveryStatus;

        showLoader();
        try {
            await syncPackageToDB(pkg);
            showToast('Đã lưu thay đổi');
            closeModal('editOrder');
        } catch (e) { }
        hideLoader();
    }
};

window.deleteOrder = (orderId) => {
    window.showConfirm('Xóa đơn hàng?', 'Bạn chắc chắn muốn xoá đơn hàng này khỏi kiện?', async () => {
        const pkg = state.packages.find(p => p.id === state.currentPkgId);
        pkg.orders = pkg.orders.filter(o => o.id !== orderId);
        state.selectedOrders = state.selectedOrders.filter(id => id !== orderId);
        showLoader();
        try { await syncPackageToDB(pkg); render(); } catch (e) { }
        hideLoader();
    });
};

window.deleteSelected = () => {
    window.showConfirm('Xóa hàng loạt?', `Bạn sắp xoá vĩnh viễn ${state.selectedOrders.length} đơn hàng.`, async () => {
        const pkg = state.packages.find(p => p.id === state.currentPkgId);
        pkg.orders = pkg.orders.filter(o => !state.selectedOrders.includes(o.id));
        state.selectedOrders = [];
        showLoader();
        try { await syncPackageToDB(pkg); render(); } catch (e) { }
        hideLoader();
    });
};

// --- FILTER & EXPORT ---
window.filterOrders = (query) => {
    const lowerQ = query.toLowerCase();
    document.querySelectorAll('.order-row').forEach(row => { row.style.display = row.getAttribute('data-search').includes(lowerQ) ? '' : 'none'; });
    state.selectedOrders = [];
    document.querySelectorAll('.order-checkbox').forEach(cb => cb.checked = false);
    if (document.getElementById('globalSelectAll')) document.getElementById('globalSelectAll').checked = false;
    updateBulkActionsDOM();
};

window.toggleSelectOrder = (id, cb) => {
    if (cb.checked && !state.selectedOrders.includes(id)) state.selectedOrders.push(id);
    else if (!cb.checked) state.selectedOrders = state.selectedOrders.filter(oId => oId !== id);
    const visibleCbs = Array.from(document.querySelectorAll('.order-checkbox')).filter(c => c.closest('tr').style.display !== 'none');
    const allChecked = visibleCbs.length > 0 && visibleCbs.every(c => c.checked);
    if (document.getElementById('globalSelectAll')) document.getElementById('globalSelectAll').checked = allChecked;
    updateBulkActionsDOM();
};

window.toggleSelectAll = (globalCb) => {
    state.selectedOrders = [];
    document.querySelectorAll('.order-row').forEach(row => {
        if (row.style.display !== 'none') {
            const cb = row.querySelector('.order-checkbox');
            cb.checked = globalCb.checked;
            if (cb.checked) state.selectedOrders.push(cb.value);
        }
    });
    updateBulkActionsDOM();
};

const updateBulkActionsDOM = () => {
    const toolbar = document.getElementById('bulk-actions');
    const countSpan = document.getElementById('selected-count');
    if (toolbar && countSpan) {
        if (state.selectedOrders.length > 0) {
            toolbar.classList.remove('hidden'); toolbar.classList.add('flex'); countSpan.textContent = state.selectedOrders.length;
        } else {
            toolbar.classList.add('hidden'); toolbar.classList.remove('flex');
        }
    }
};

window.openExportModal = () => { state.modals.export = true; render(); };
window.executeExport = async (format) => {
    const rawPkg = state.view === 'guestPackageDetail' ? state.currentGuestPkg : state.packages.find(p => p.id === state.currentPkgId);
    
    // Đọc phạm vi xuất: Tất cả hay Đã chọn
    const scopeEl = document.querySelector('input[name="exportScope"]:checked');
    const scope = scopeEl ? scopeEl.value : 'all';
    
    let ordersToExport = (scope === 'selected' && state.selectedOrders.length > 0) 
        ? rawPkg.orders.filter(o => state.selectedOrders.includes(o.id)) 
        : rawPkg.orders;

    if (!ordersToExport || ordersToExport.length === 0) return showToast('Không có dữ liệu', 'error');

    // Chèn mộc [#Đã kiểm hàng] nếu đang ở chế độ guest
    if (state.view === 'guestPackageDetail') {
        const checkedArr = getGuestChecked(rawPkg.id);
        ordersToExport = ordersToExport.map(o => ({
            ...o,
            note: checkedArr.includes(o.id) && !(o.note || '').includes('[#Đã kiểm hàng]') ? '[#Đã kiểm hàng] ' + (o.note || '') : o.note
        }));
    }

    const config = {
        stt: document.getElementById('exp-stt').checked,
        recipient: document.getElementById('exp-recipient').checked,
        productName: document.getElementById('exp-productName').checked,
        quantity: document.getElementById('exp-quantity').checked,
        price: document.getElementById('exp-price').checked,
        tracking: document.getElementById('exp-tracking').checked,
        deliveryStatus: document.getElementById('exp-deliveryStatus').checked,
        note: document.getElementById('exp-note').checked,
        group: document.getElementById('exp-group').checked
    };

    showToast('Đang tạo file...'); closeModal('export');
    
    // Nếu chọn CSV, bỏ qua config hiển thị và xuất thẳng File CSV Tiêu chuẩn
    if (format === 'csv') {
        exportToStandardCSV({ ...rawPkg, orders: ordersToExport });
    } else {
        await exportToGraphics({ ...rawPkg, orders: ordersToExport }, config, format);
    }
};


const groupOrders = (orders) => orders.reduce((acc, o) => { (acc[o.recipient] = acc[o.recipient] || []).push(o); return acc; }, {});

// Hàm xuất CSV chuẩn xác để có thể Import (Thêm đơn nhanh) ngược lại vào hệ thống mà không lỗi
const exportToStandardCSV = (pkg) => {
    let csv = "\uFEFF"; 
    // Các tiêu đề cột được fix cứng dựa theo format đọc của hàm importOrdersCSV
    const headers = ["Mã đơn", "Khách hàng", "Sản phẩm", "Số lượng", "Thành tiền", "Trạng thái", "Ghi chú"];
    csv += headers.join(",") + "\n";

    pkg.orders.forEach((o) => {
        const row = [
            `"${o.trackingCodes[0] || ''}"`,
            `"${o.recipient || ''}"`,
            `"${o.productName || ''}"`,
            `"${o.quantity || 1}"`,
            `"${o.price || ''}"`,
            `"${o.deliveryStatus || 'Chờ xử lý'}"`,
            `"${o.note || ''}"`
        ];
        csv += row.join(",") + "\n";
    });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = `CSV_Chuan_${pkg.name}.csv`; 
    a.click();
};
const exportToGraphics = async (pkg, config, format) => {
    const container = document.getElementById('export-container');
    
    // 1. Ép cứng chiều rộng 1200px cho div ngoài cùng để đảm bảo bố cục không bị bóp trên mobile
    let html = `
            <div style="font-family: 'Inter', sans-serif; color: #000; padding: 40px; background: #fff; width: 1200px; box-sizing: border-box;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <h2 style="font-size: 28px; font-weight: 800; margin: 0 0 12px 0; color: #000; text-transform: uppercase;">${pkg.name}</h2>
                    <span style="font-size: 13px; font-weight: 700; background: #f3f4f6; color: #000; padding: 6px 14px; border: 1px solid #e5e7eb; border-radius: 4px;">Trạng thái: ${pkg.status}</span>
                </div>
        `;

    const bTbl = (orders, title = null) => {
        let t = title ? `<div style="font-weight: 800; font-size: 16px; margin-top: 32px; margin-bottom: 12px; color: #000; text-transform: uppercase;">KHÁCH HÀNG: ${title}</div>` : '';
        t += `<div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 24px;"><table style="width: 100%; border-collapse: collapse; font-size: 14px; text-align: left; table-layout: auto;"><thead><tr>`;

        // Ngăn tiêu đề bảng bị ngắt dòng (white-space: nowrap)
        const th = `padding: 14px 16px; background: #f8fafc; font-weight: 700; color: #475569; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; white-space: nowrap;`;
        if (config.stt) t += `<th style="${th} width: 50px; text-align: center;">STT</th>`;
        if (config.recipient && !title) t += `<th style="${th}">Khách hàng</th>`;
        if (config.productName) t += `<th style="${th}">Tên SP</th>`;
        if (config.quantity) t += `<th style="${th} text-align: center;">SL</th>`;
        if (config.price) t += `<th style="${th}">Thành tiền</th>`;
        if (config.tracking) t += `<th style="${th}">Mã đơn</th>`;
        if (config.deliveryStatus) t += `<th style="${th}">Trạng thái</th>`;
        if (config.note) t += `<th style="${th}">Ghi chú</th>`;
        t += `</tr></thead><tbody>`;

        orders.forEach((o, i) => {
            t += `<tr>`;
            const td = `padding: 14px 16px; border-bottom: 1px solid #f1f5f9; color: #0f172a; background: #fff; word-break: break-word;`;
            if (config.stt) t += `<td style="${td} text-align: center; font-weight: 600; color: #64748b;">${i + 1}</td>`;
            if (config.recipient && !title) t += `<td style="${td} font-weight: 700;">${o.recipient}</td>`;
            if (config.productName) t += `<td style="${td}">${o.productName || '-'}</td>`;
            if (config.quantity) t += `<td style="${td} text-align: center; font-weight: 600;">${o.quantity || 1}</td>`;
            if (config.price) t += `<td style="${td} font-weight: 600;">${o.price || '-'}</td>`;
            if (config.tracking) { t += `<td style="${td}"><span style="font-family: monospace; font-weight: 700;">${o.trackingCodes[0] || ''}</span></td>`; }
            if (config.deliveryStatus) t += `<td style="${td}"><span style="font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 8px; border-radius: 4px; background: #f1f5f9; color: #475569; white-space: nowrap;">${o.deliveryStatus || 'Chờ xử lý'}</span></td>`;
            if (config.note) t += `<td style="${td}">${o.note || ''}</td>`;
            t += `</tr>`;
        });
        return t + `</tbody></table></div>`;
    };

    if (config.group) {
        const groups = groupOrders(pkg.orders);
        Object.keys(groups).forEach(r => html += bTbl(groups[r], r));
    } else { html += bTbl(pkg.orders); }

    container.innerHTML = html + `<div style="text-align: right; font-size: 12px; font-weight: 600; color: #9ca3af; margin-top: 32px;">Xuất lúc: ${new Date().toLocaleString('vi-VN')}</div></div>`;
    
    // Đợi DOM render hoàn tất
    await new Promise(r => setTimeout(r, 200));

    try {
        // 2. Chụp trực tiếp thẻ div con bên trong để lấy chính xác mốc 1200px
        const targetElement = container.firstElementChild;
        
        const canvas = await html2canvas(targetElement, { 
            scale: 2, 
            useCORS: true, 
            backgroundColor: '#ffffff',
            windowWidth: 1200, // Giả lập trình duyệt rộng 1200px
            width: 1200,       // Ép kích thước canvas xuất ra
            scrollX: 0,        // Bỏ qua thanh cuộn
            scrollY: 0
        });
        
        if (format === 'image') {
            const l = document.createElement('a'); 
            l.download = `EXP_${pkg.name}.png`; 
            l.href = canvas.toDataURL('image/png'); 
            l.click();
        } else if (format === 'pdf') {
            const pdf = new window.jspdf.jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
            const img = canvas.toDataURL('image/png'); 
            const props = pdf.getImageProperties(img);
            const w = pdf.internal.pageSize.getWidth(); 
            // Tính toán chiều cao tương ứng theo tỷ lệ khung hình
            pdf.addImage(img, 'PNG', 0, 0, w, (props.height * w) / props.width);
            pdf.save(`EXP_${pkg.name}.pdf`);
        }
    } catch (err) { 
        console.error(err);
        showToast('Lỗi xuất file', 'error'); 
    }
};