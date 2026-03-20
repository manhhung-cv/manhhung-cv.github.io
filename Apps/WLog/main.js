// ==========================================
// 1. CẤU HÌNH FIREBASE
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyAZMqF1hkGZ-vZl2Gj9YPAnwGGOiS-ZJ6A",
    authDomain: "sochamcong-hunq.firebaseapp.com",
    projectId: "sochamcong-hunq",
    storageBucket: "sochamcong-hunq.firebasestorage.app",
    messagingSenderId: "85426930976",
    appId: "1:85426930976:web:d98438d8fcf8a050364345"
};

let db, auth, googleProvider;
let currentUser = null;

try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    googleProvider = new firebase.auth.GoogleAuthProvider();

    auth.onAuthStateChanged(user => {
        currentUser = user;
        if (user) {
            document.getElementById('loggedOutUI').classList.add('hidden');
            document.getElementById('loggedInUI').classList.remove('hidden');
            document.getElementById('loggedInUI').classList.add('flex');
            document.getElementById('userEmailDisplay').innerText = user.email || user.displayName || 'Người dùng';
            loadFirebaseBackups();
        } else {
            document.getElementById('loggedOutUI').classList.remove('hidden');
            document.getElementById('loggedInUI').classList.add('hidden');
            document.getElementById('loggedInUI').classList.remove('flex');
            document.getElementById('cloudBackupsList').innerHTML = '<p class="text-xs font-medium text-gray-400 text-center py-6">Vui lòng đăng nhập để xem dữ liệu.</p>';
        }
    });
} catch (error) { 
    console.log("Firebase chưa được cấu hình đúng:", error); 
}


// ==========================================
// 2. BIẾN TOÀN CỤC & DỮ LIỆU LOCAL
// ==========================================
let appConfig = {};
let workEntries = JSON.parse(localStorage.getItem('payrollEntriesV5')) || [];
let storedExpenses = JSON.parse(localStorage.getItem('payrollExpensesV6')) || {};
let savedPayslips = JSON.parse(localStorage.getItem('savedPayslipsV1')) || [];
let currentGrossIncome = 0;

let currentTargetDate = new Date();
let selectedDayString = "";
let timelineViewMode = 'week';

const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const headersGrid = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const getLocalISOString = (date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return (new Date(date - offset)).toISOString().split('T')[0];
};
const getMonthKey = () => document.getElementById('cycleMonthPicker').value || "default";


// ==========================================
// 3. XỬ LÝ TIỀN TỆ & SỐ (CHUẨN VIỆT NAM)
// ==========================================
// Chuyển chuỗi hiển thị thành số thực (VD: "1.000,5" -> 1000.5)
window.getMoneyValue = (str) => {
    if (str === null || str === undefined || str === '') return 0;
    let s = String(str);
    s = s.replace(/\./g, ''); // Bỏ dấu chấm hàng nghìn
    s = s.replace(',', '.');  // Đổi dấu phẩy thành dấu chấm thập phân
    s = s.replace(/[^0-9.\-]/g, ''); // Bỏ ký tự lạ
    return parseFloat(s) || 0;
};

// Định dạng số để hiển thị (VD: 1000.5 -> "1.000,5")
window.formatNumToVN = (num) => {
    const n = Number(num) || 0;
    return n.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
};

// Định dạng tiền tệ có đuôi ($ hoặc đ)
window.formatMoney = (amount, currency = 'đ') => {
    const formatted = window.formatNumToVN(amount);
    return currency === '$' ? `$${formatted}` : `${formatted} ${currency}`;
};

// Xử lý sự kiện gõ phím trực tiếp trên ô input
window.formatInputMoney = (e) => {
    let input = e.target;
    let val = input.value;

    val = val.replace(/[^0-9,\-]/g, '');
    const parts = val.split(',');
    if (parts.length > 2) val = parts[0] + ',' + parts.slice(1).join('');
    if (val === '' || val === '-') { input.value = val; return; }

    let isNegative = val.startsWith('-');
    if (isNegative) val = val.substring(1);

    let intPart = val.split(',')[0];
    let decPart = val.split(',').length > 1 ? ',' + val.split(',')[1] : '';

    if (intPart !== '') {
        intPart = parseInt(intPart, 10).toLocaleString('vi-VN');
    }
    input.value = (isNegative ? '-' : '') + intPart + decPart;
};

// Nút cộng/trừ giờ nhanh
window.adjustHours = (id, amount) => {
    const input = document.getElementById(id);
    let val = window.getMoneyValue(input.value);
    val += amount;
    if (val < 0) val = 0;
    input.value = window.formatNumToVN(val);
};


// ==========================================
// 4. CUSTOM MODAL & GIAO DIỆN CHUNG
// ==========================================
window.customModalResolve = null;

function openCustomModal({ type, title, message, defaultValue = '' }) {
    return new Promise(resolve => {
        const overlay = document.getElementById('customModalOverlay');
        const box = document.getElementById('customModalBox');
        const titleEl = document.getElementById('customModalTitle');
        const msgEl = document.getElementById('customModalMessage');
        const inputEl = document.getElementById('customModalInput');
        const cancelBtn = document.getElementById('customModalCancel');
        const okBtn = document.getElementById('customModalOK');

        titleEl.textContent = title;
        msgEl.textContent = message;
        inputEl.classList.add('hidden');
        cancelBtn.classList.add('hidden');
        inputEl.value = '';

        if (type === 'prompt') {
            inputEl.classList.remove('hidden');
            cancelBtn.classList.remove('hidden');
            inputEl.value = defaultValue;
        } else if (type === 'confirm') {
            cancelBtn.classList.remove('hidden');
        }

        overlay.classList.remove('hidden');
        void overlay.offsetWidth; // Reflow
        overlay.classList.remove('opacity-0');
        box.classList.remove('scale-95');

        if (type === 'prompt') setTimeout(() => inputEl.focus(), 300);

        window.customModalResolve = resolve;

        const closeModal = (result) => {
            overlay.classList.add('opacity-0');
            box.classList.add('scale-95');
            setTimeout(() => {
                overlay.classList.add('hidden');
                if (window.customModalResolve) {
                    window.customModalResolve(result);
                    window.customModalResolve = null;
                }
            }, 300);
        };

        cancelBtn.onclick = () => closeModal(null);
        okBtn.onclick = () => {
            if (type === 'prompt') closeModal(inputEl.value);
            else closeModal(true);
        };
        inputEl.onkeydown = (e) => { if (e.key === 'Enter') okBtn.click(); };
    });
}

window.customAlert = (message, title = 'Thông báo') => openCustomModal({ type: 'alert', title, message });
window.customConfirm = (message, title = 'Xác nhận') => openCustomModal({ type: 'confirm', title, message });
window.customPrompt = (message, defaultValue = '', title = 'Nhập liệu') => openCustomModal({ type: 'prompt', title, message, defaultValue });

function switchTab(tabId, btnElement) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.getElementById(tabId).classList.remove('hidden');
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('bg-white', 'dark:bg-gray-800', 'shadow-sm', 'text-gray-900', 'dark:text-white');
        b.classList.add('text-gray-500');
    });
    btnElement.classList.remove('text-gray-500');
    btnElement.classList.add('bg-white', 'dark:bg-gray-800', 'shadow-sm', 'text-gray-900', 'dark:text-white');
    updateDataDisplays();
}

window.switchSetTab = (tabId, btnEl) => {
    document.querySelectorAll('.set-tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(tabId).classList.remove('hidden');
    document.querySelectorAll('.set-tab-btn').forEach(btn => {
        btn.className = "set-tab-btn px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-semibold shrink-0 transition";
    });
    btnEl.className = "set-tab-btn px-4 py-1.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-semibold shrink-0 transition";
};

// ==========================================
// 5. QUẢN LÝ GIAO DIỆN (THEME)
// ==========================================
function initTheme() {
    const savedTheme = localStorage.getItem('themePref') || 'system';
    const themeBtn = Array.from(document.querySelectorAll('.theme-btn')).find(b => b.getAttribute('onclick').includes(`'${savedTheme}'`));
    setThemeType(savedTheme, themeBtn);
}

function changeTheme(theme) { 
    localStorage.setItem('themePref', theme); 
    applyTheme(theme); 
}

function applyTheme(theme) {
    document.documentElement.classList.remove('dark', 'oled');
    if (theme === 'oled') document.documentElement.classList.add('dark', 'oled');
    else if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (localStorage.getItem('themePref') === 'system') applyTheme('system');
});

window.setThemeType = (val, btn) => {
    document.getElementById('themeSelect').value = val;
    document.querySelectorAll('.theme-btn').forEach(b => {
        b.className = "theme-btn py-2.5 text-xs font-medium rounded-xl text-gray-500 bg-gray-100 dark:bg-gray-800/60 transition hover:text-gray-900 dark:hover:text-white";
    });
    if (btn) btn.className = "theme-btn py-2.5 text-xs font-bold rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm transition";
    changeTheme(val);
};


// ==========================================
// 6. XÁC THỰC FIREBASE (AUTH)
// ==========================================
async function loginGoogle() {
    if (!auth) return await customAlert("Vui lòng cấu hình Firebase Config.");
    auth.signInWithPopup(googleProvider).catch(async err => await customAlert(err.message, "Lỗi"));
}

async function loginEmail() {
    if (!auth) return await customAlert("Vui lòng cấu hình Firebase Config.");
    const email = document.getElementById('emailInput').value;
    const pass = document.getElementById('passInput').value;
    if (!email || !pass) return await customAlert('Vui lòng nhập Email và Mật khẩu.');

    auth.signInWithEmailAndPassword(email, pass).catch(async err => {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
            if (await customConfirm("Tài khoản không tồn tại. Bạn muốn ĐĂNG KÝ mới?")) {
                auth.createUserWithEmailAndPassword(email, pass).catch(async e => await customAlert(e.message, "Lỗi"));
            }
        } else await customAlert(err.message, "Lỗi");
    });
}

window.resetPassword = async () => {
    if (!auth) return await customAlert("Vui lòng cấu hình Firebase Config.");
    const email = document.getElementById('emailInput').value.trim();
    if (!email) return await customAlert("Vui lòng nhập Email của bạn vào ô đăng nhập trước, sau đó bấm 'Quên mật khẩu'.");

    try {
        await auth.sendPasswordResetEmail(email);
        await customAlert("Đã gửi liên kết đặt lại mật khẩu! Vui lòng kiểm tra hộp thư (bao gồm cả thư rác).", "Thành công");
    } catch (err) {
        if (err.code === 'auth/user-not-found') await customAlert("Tài khoản này chưa được đăng ký.", "Lỗi");
        else await customAlert(err.message, "Lỗi");
    }
};

function logout() { if (auth) auth.signOut(); }


// ==========================================
// 7. ĐỒNG BỘ DỮ LIỆU ĐÁM MÂY (SYNC)
// ==========================================
function toggleAutoBackup(isON) { localStorage.setItem('autoBackupON', isON ? '1' : '0'); }

async function createCloudBackup(name, isAuto = false) {
    if (!db || !currentUser || !navigator.onLine) return false;
    const data = { config: appConfig, entries: workEntries, expenses: storedExpenses, payslips: savedPayslips, timestamp: new Date().toISOString(), name, isAuto };
    try {
        const userBackupsRef = db.collection('users').doc(currentUser.uid).collection('backups');
        if (isAuto) await userBackupsRef.doc('auto_backup').set(data);
        else await userBackupsRef.add(data);
        loadFirebaseBackups(); 
        return true;
    } catch (err) { return false; }
}

function promptManualBackup() {
    if (!currentUser) { customAlert("Bạn cần đăng nhập trước."); return; }
    customPrompt("Nhập tên bản sao lưu:").then(async name => {
        if (name) {
            const ok = await createCloudBackup(name, false);
            if (ok) await customAlert('Đã tạo bản sao lưu thành công!');
        }
    });
}

let autoBackupTimeout;
function triggerAutoBackup() {
    if (localStorage.getItem('autoBackupON') === '1' && currentUser) {
        clearTimeout(autoBackupTimeout);
        autoBackupTimeout = setTimeout(() => { createCloudBackup("Tự động sao lưu", true); }, 3000);
    }
}

async function loadFirebaseBackups() {
    if (!db || !currentUser) return;
    const listEl = document.getElementById('cloudBackupsList');
    listEl.innerHTML = '<p class="text-xs font-medium text-gray-400 text-center py-6">Đang tải...</p>';
    try {
        const snap = await db.collection('users').doc(currentUser.uid).collection('backups').get();
        let backups = []; 
        snap.forEach(doc => { backups.push({ id: doc.id, ...doc.data() }); });
        backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        if (backups.length === 0) { 
            listEl.innerHTML = '<p class="text-xs font-medium text-gray-400 text-center py-6">Chưa có bản sao lưu nào.</p>'; 
            return; 
        }

        listEl.innerHTML = backups.map(b => `
            <div class="py-2.5 px-3 flex justify-between items-center group hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition">
                <div>
                    <div class="text-sm font-medium text-gray-800 dark:text-gray-200">${b.name} ${b.isAuto ? '<span class="text-[10px] bg-gray-200 dark:bg-gray-700 px-1 rounded ml-1">Auto</span>' : ''}</div>
                    <div class="text-[10px] text-gray-500 mt-0.5">${new Date(b.timestamp).toLocaleString('vi-VN')}</div>
                </div>
                <div class="flex gap-1 md:opacity-0 md:group-hover:opacity-100">
                    <button onclick="restoreCloudBackup('${b.id}')" class="w-7 h-7 rounded bg-white dark:bg-gray-800 shadow-sm text-gray-600 dark:text-gray-300"><i class="fa-solid fa-clock-rotate-left text-xs"></i></button>
                    <button onclick="deleteCloudBackup('${b.id}')" class="w-7 h-7 rounded bg-white dark:bg-gray-800 shadow-sm text-red-500"><i class="fa-solid fa-trash text-xs"></i></button>
                </div>
            </div>
        `).join('');
    } catch (e) { 
        listEl.innerHTML = '<p class="text-xs font-medium text-red-400 text-center py-6">Lỗi truy cập dữ liệu.</p>'; 
    }
}

async function restoreCloudBackup(docId) {
    if (!(await customConfirm("Khôi phục sẽ GHI ĐÈ dữ liệu hiện tại. Bạn chắc chứ?"))) return;
    try {
        const doc = await db.collection('users').doc(currentUser.uid).collection('backups').doc(docId).get();
        if (doc.exists) {
            const data = doc.data();
            if (data.config) localStorage.setItem('userPayrollConfig', JSON.stringify(data.config));
            if (data.entries) localStorage.setItem('payrollEntriesV5', JSON.stringify(data.entries));
            if (data.expenses) localStorage.setItem('payrollExpensesV6', JSON.stringify(data.expenses));
            if (data.payslips) localStorage.setItem('savedPayslipsV1', JSON.stringify(data.payslips));
            await customAlert('Khôi phục thành công! Trang sẽ tải lại.'); 
            location.reload();
        }
    } catch (e) { await customAlert("Lỗi khôi phục.", "Lỗi"); }
}

async function deleteCloudBackup(docId) {
    if (await customConfirm("Xóa bản sao lưu khỏi đám mây?")) {
        await db.collection('users').doc(currentUser.uid).collection('backups').doc(docId).delete(); 
        loadFirebaseBackups();
    }
}

window.exportAllData = () => {
    const data = { config: appConfig, entries: workEntries, expenses: storedExpenses, payslips: savedPayslips };
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" }); 
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `WorkLog_Backup_${getLocalISOString(new Date())}.json`;
    a.click(); URL.revokeObjectURL(url);
};

window.importAllData = async (event) => {
    const file = event.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.config) localStorage.setItem('userPayrollConfig', JSON.stringify(data.config));
            if (data.entries) localStorage.setItem('payrollEntriesV5', JSON.stringify(data.entries));
            if (data.expenses) localStorage.setItem('payrollExpensesV6', JSON.stringify(data.expenses));
            if (data.payslips) localStorage.setItem('savedPayslipsV1', JSON.stringify(data.payslips));
            await customAlert('Khôi phục thành công! Trang sẽ tải lại.'); location.reload();
        } catch (err) { await customAlert('File không hợp lệ!'); }
    }; reader.readAsText(file);
};


// ==========================================
// 8. CÀI ĐẶT (SETTINGS) & LỊCH LÀM VIỆC
// ==========================================
window.setCurrency = (val, btn) => {
    document.getElementById('currency').value = val;
    document.querySelectorAll('.currency-btn').forEach(b => {
        b.className = "currency-btn flex-1 py-1.5 text-[11px] font-medium rounded-lg text-gray-500 transition hover:text-gray-900 dark:hover:text-white";
    });
    if (btn) btn.className = "currency-btn flex-1 py-1.5 text-[11px] font-bold rounded-lg bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white transition";
};

window.setSalaryType = (val, btn) => {
    document.getElementById('salaryType').value = val;
    document.querySelectorAll('.salary-type-btn').forEach(b => {
        b.className = "salary-type-btn flex-1 py-1.5 text-[11px] font-medium rounded-lg text-gray-500 transition hover:text-gray-900 dark:hover:text-white";
    });
    if (btn) btn.className = "salary-type-btn flex-1 py-1.5 text-[11px] font-bold rounded-lg bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white transition";

    const isThang = val === 'thang';
    document.getElementById('monthlyWrapper').classList.toggle('hidden', !isThang);
    document.getElementById('monthlyWrapper').classList.toggle('grid', isThang);
    document.getElementById('hourlyWrapper').classList.toggle('hidden', isThang);
    document.getElementById('monthlyProgressSection').classList.toggle('hidden', !isThang);
};

const loadSettings = () => {
    const data = JSON.parse(localStorage.getItem('userPayrollConfig'));
    if (!data) return false;
    appConfig = data;

    const curr = data.currency || 'đ';
    setCurrency(curr, Array.from(document.querySelectorAll('.currency-btn')).find(b => b.innerText.includes(curr)));

    const salType = data.salaryType || 'thang';
    setSalaryType(salType, Array.from(document.querySelectorAll('.salary-type-btn')).find(b => b.innerText.toLowerCase().includes(salType === 'thang' ? 'tháng' : 'giờ')));

    document.getElementById('cutoffDate').value = data.cutoffDate || '31';
    
    // Sử dụng formatNumToVN để load dữ liệu lên input chuẩn tiếng Việt
    document.getElementById('standardHours').value = window.formatNumToVN(data.standardHours || 8);
    document.getElementById('standardDays').value = window.formatNumToVN(data.standardDays || 26);
    document.getElementById('baseSalaryMonth').value = window.formatNumToVN(data.baseSalaryMonth);
    document.getElementById('baseSalaryHour').value = window.formatNumToVN(data.baseSalaryHour);
    document.getElementById('otRate').value = window.formatNumToVN(data.otRate);
    document.getElementById('holidayRate').value = window.formatNumToVN(data.holidayRate);
    document.getElementById('dailyAllowance').value = window.formatNumToVN(data.dailyAllowance);
    document.getElementById('monthlyAllowance').value = window.formatNumToVN(data.monthlyAllowance);

    const savedDays = data.workingDays || ['T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    document.querySelectorAll('.workday-cb').forEach(cb => { cb.checked = savedDays.includes(cb.value); });
    appConfig.workingDays = savedDays;

    return true;
};

document.getElementById('saveSettingsBtn').addEventListener('click', () => {
    const selectedDays = Array.from(document.querySelectorAll('.workday-cb:checked')).map(cb => cb.value);
    
    // Sử dụng getMoneyValue để lưu đúng định dạng số thực vào config
    appConfig = {
        currency: document.getElementById('currency').value,
        cutoffDate: document.getElementById('cutoffDate').value,
        workingDays: selectedDays,
        salaryType: document.getElementById('salaryType').value,
        standardHours: window.getMoneyValue(document.getElementById('standardHours').value) || 8,
        standardDays: window.getMoneyValue(document.getElementById('standardDays').value) || 26,
        baseSalaryMonth: window.getMoneyValue(document.getElementById('baseSalaryMonth').value),
        baseSalaryHour: window.getMoneyValue(document.getElementById('baseSalaryHour').value),
        otRate: window.getMoneyValue(document.getElementById('otRate').value),
        holidayRate: window.getMoneyValue(document.getElementById('holidayRate').value),
        dailyAllowance: window.getMoneyValue(document.getElementById('dailyAllowance').value),
        monthlyAllowance: window.getMoneyValue(document.getElementById('monthlyAllowance').value)
    };
    localStorage.setItem('userPayrollConfig', JSON.stringify(appConfig));

    workEntries = workEntries.map(e => {
        e.breakdown = calculateDailySalaryDetails(e.hours, e.otHours, e.hasAllowance, e.isHoliday, e.date);
        return e;
    });
    localStorage.setItem('payrollEntriesV5', JSON.stringify(workEntries));

    document.getElementById('settingsOverlay').classList.add('hidden');
    document.getElementById('closeSettingsBtn').classList.remove('hidden');
    renderTimeline(); updateDataDisplays(); triggerAutoBackup();
});

document.getElementById('salaryType').addEventListener('change', (e) => {
    const isThang = e.target.value === 'thang';
    document.getElementById('monthlyWrapper').classList.toggle('hidden', !isThang);
    document.getElementById('monthlyWrapper').classList.toggle('grid', isThang);
    document.getElementById('hourlyWrapper').classList.toggle('hidden', isThang);
    document.getElementById('monthlyProgressSection').classList.toggle('hidden', !isThang);
});

// ==========================================
// 9. QUẢN LÝ THỜI GIAN & TIMELINE
// ==========================================
window.setViewMode = (mode) => {
    timelineViewMode = mode;
    const btnW = document.getElementById('btnViewWeek');
    const btnC = document.getElementById('btnViewCycle');
    const navBtns = document.getElementById('weekNavBtns');
    if (mode === 'week') {
        btnW.className = "px-3 py-1.5 rounded-md bg-white dark:bg-gray-800 text-xs font-medium text-gray-900 dark:text-white shadow-sm";
        btnC.className = "px-3 py-1.5 rounded-md text-xs font-medium text-gray-500";
        navBtns.classList.remove('hidden'); navBtns.classList.add('flex');
    } else {
        btnC.className = "px-3 py-1.5 rounded-md bg-white dark:bg-gray-800 text-xs font-medium text-gray-900 dark:text-white shadow-sm";
        btnW.className = "px-3 py-1.5 rounded-md text-xs font-medium text-gray-500";
        navBtns.classList.add('hidden'); navBtns.classList.remove('flex');
    }
    renderTimeline();
};

window.shiftWeek = (offsetDays) => {
    if (!selectedDayString) return;
    const sd = new Date(selectedDayString); sd.setDate(sd.getDate() + offsetDays);
    currentTargetDate = sd;
    document.getElementById('cycleMonthPicker').value = `${sd.getFullYear()}-${String(sd.getMonth() + 1).padStart(2, '0')}`;
    selectedDayString = getLocalISOString(sd);
    renderTimeline(); selectDate(selectedDayString, false);
};

document.getElementById('btnToday').addEventListener('click', () => {
    const now = new Date(); currentTargetDate = now;
    document.getElementById('cycleMonthPicker').value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    selectedDayString = getLocalISOString(now);
    renderTimeline(); selectDate(selectedDayString, false);
});

document.getElementById('cycleMonthPicker').addEventListener('change', (e) => {
    if (e.target.value) {
        const p = e.target.value.split('-');
        currentTargetDate = new Date(p[0], p[1] - 1, 1);
        selectedDayString = "";
        document.getElementById('cycleMonthDisplay').textContent = `Tháng ${p[1]}/${p[0]}`;
        renderTimeline(); updateDataDisplays();
    }
});

window.shiftMonth = (offset) => {
    const input = document.getElementById('cycleMonthPicker');
    if (!input.value) return;
    let [year, month] = input.value.split('-');
    let d = new Date(year, month - 1, 1);
    d.setMonth(d.getMonth() + offset);
    input.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    input.dispatchEvent(new Event('change'));
};

const getCycleDates = (targetDate) => {
    const year = targetDate.getFullYear(), month = targetDate.getMonth(), cutoff = Number(appConfig.cutoffDate) || 31;
    let start, end;
    if (cutoff >= 28) { 
        start = new Date(year, month, 1); 
        end = new Date(year, month + 1, 0); 
    } else { 
        start = new Date(year, month - 1, cutoff + 1); 
        end = new Date(year, month, cutoff); 
    }
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

const renderTimeline = () => {
    const { start, end } = getCycleDates(currentTargetDate);
    const container = document.getElementById('timelineContainer');
    container.innerHTML = '';

    let workingDaysConf = appConfig.workingDays;
    if (!workingDaysConf || workingDaysConf.length === 0) {
        workingDaysConf = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    }

    if (timelineViewMode === 'cycle') {
        container.className = 'grid grid-cols-7 gap-2 w-full';
        headersGrid.forEach(h => {
            const color = workingDaysConf.includes(h) ? 'text-gray-400' : 'text-gray-300';
            container.innerHTML += `<div class="text-center text-[10px] font-semibold ${color} py-1">${h}</div>`;
        });
        let offset = (start.getDay() + 6) % 7;
        for (let i = 0; i < offset; i++) container.innerHTML += `<div></div>`;

        let iterDate = new Date(start); iterDate.setHours(0, 0, 0, 0);
        let safeEnd = new Date(end); safeEnd.setHours(23, 59, 59, 999);
        
        while (iterDate <= safeEnd) {
            const dateStr = getLocalISOString(iterDate);
            const dayName = daysOfWeek[iterDate.getDay()];
            const existingEntry = workEntries.find(e => e.date === dateStr);
            const isSelected = dateStr === selectedDayString;
            const isWorkingDay = workingDaysConf.includes(dayName);

            let cardClass = `relative flex flex-col items-center justify-center rounded-xl cursor-pointer border aspect-square `;
            if (isSelected) cardClass += "bg-gray-900 border-gray-900 text-white dark:bg-white dark:border-white dark:text-gray-900 transform scale-105 z-10 shadow-sm";
            else if (existingEntry) cardClass += "bg-gray-100 dark:bg-gray-800/80 border-transparent text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700";
            else cardClass += "bg-transparent border-gray-100 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50";

            const dot = existingEntry ? `<div class="w-3 h-1 rounded-full ${isSelected ? (document.documentElement.classList.contains('dark') ? 'bg-gray-900' : 'bg-white') : 'bg-gray-400'} mt-1"></div>` : `<div class="w-1 h-1 mt-1"></div>`;
            let textStyle = (!isSelected && !isWorkingDay) ? 'opacity-50' : '';
            let otBadge = (existingEntry && existingEntry.otHours > 0) ? `<div class="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-sm z-20">${existingEntry.otHours}h</div>` : '';

            container.innerHTML += `<div id="card-${dateStr}" class="${cardClass}" onclick="selectDate('${dateStr}')">${otBadge}<span class="text-sm font-semibold ${textStyle}">${iterDate.getDate()}</span>${dot}</div>`;
            iterDate.setDate(iterDate.getDate() + 1);
        }
    } else {
        container.className = 'grid grid-cols-7 gap-2 w-full';
        let weekStartStr = "", weekEndStr = "";
        if (selectedDayString) {
            const sdObj = new Date(selectedDayString);
            const dayNum = sdObj.getDay() === 0 ? 7 : sdObj.getDay();
            const ws = new Date(sdObj); ws.setDate(sdObj.getDate() - dayNum + 1);
            const we = new Date(ws); we.setDate(ws.getDate() + 6);
            weekStartStr = getLocalISOString(ws); weekEndStr = getLocalISOString(we);
        } else {
            weekStartStr = getLocalISOString(start);
            const we = new Date(start); we.setDate(we.getDate() + 6);
            weekEndStr = getLocalISOString(we);
        }

        let iterDate = new Date(weekStartStr); const endOfWeek = new Date(weekEndStr);
        while (iterDate <= endOfWeek) {
            const dateStr = getLocalISOString(iterDate);
            const dayName = daysOfWeek[iterDate.getDay()];
            const existingEntry = workEntries.find(e => e.date === dateStr);
            const isSelected = dateStr === selectedDayString;
            const isWorkingDay = workingDaysConf.includes(dayName);

            let cardClass = `relative flex flex-col items-center justify-center py-2.5 rounded-xl cursor-pointer border aspect-[4/5] md:aspect-auto md:py-3 `;
            if (isSelected) cardClass += "bg-gray-900 border-gray-900 text-white dark:bg-white dark:border-white dark:text-gray-900 transform scale-105 z-10 shadow-sm";
            else if (existingEntry) cardClass += "bg-gray-100 dark:bg-gray-800/80 border-transparent text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700";
            else cardClass += "bg-transparent border-gray-100 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50";

            const dot = existingEntry ? `<div class="w-3 h-1 rounded-full ${isSelected ? (document.documentElement.classList.contains('dark') ? 'bg-gray-900' : 'bg-white') : 'bg-gray-400'} mt-1"></div>` : `<div class="w-1 h-1 mt-1"></div>`;
            let textDayStyle = isSelected ? 'opacity-80' : 'opacity-60';
            let textStyle = (!isSelected && !isWorkingDay) ? 'opacity-50' : '';
            let otBadge = (existingEntry && existingEntry.otHours > 0) ? `<div class="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm z-20">${existingEntry.otHours}h</div>` : '';

            container.innerHTML += `<div id="card-${dateStr}" class="${cardClass}" onclick="selectDate('${dateStr}')">${otBadge}<span class="text-[10px] uppercase font-semibold ${textDayStyle}">${dayName}</span><span class="text-base font-bold mt-0.5 ${textStyle}">${iterDate.getDate()}</span>${dot}</div>`;
            iterDate.setDate(iterDate.getDate() + 1);
        }
    }
    if (!selectedDayString) selectedDayString = getLocalISOString(start);
    selectDate(selectedDayString, false);
};

window.selectDate = (dateStr, reRender = true) => {
    selectedDayString = dateStr;
    const entry = workEntries.find(e => e.date === dateStr);

    const parts = dateStr.split('-');
    const dObj = new Date(parts[0], parts[1] - 1, parts[2]);

    const fullDaysOfWeek = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    document.getElementById('formDateDisplay').textContent = `${fullDaysOfWeek[dObj.getDay()]}, ${dObj.getDate()}/${dObj.getMonth() + 1}`;

    const badge = document.getElementById('formStatusBadge');
    const btnDelete = document.getElementById('btnDeleteCurrent');

    if (entry) {
        badge.textContent = "Đã lưu";
        badge.className = "text-[10px] px-2.5 py-0.5 rounded-full font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 mt-1 inline-block";
        document.getElementById('hoursInput').value = window.formatNumToVN(entry.hours);
        document.getElementById('otInput').value = window.formatNumToVN(entry.otHours);
        document.getElementById('allowanceCheck').checked = entry.hasAllowance;
        document.getElementById('holidayCheck').checked = entry.isHoliday;
        btnDelete.classList.remove('hidden');
    } else {
        badge.textContent = "Trống";
        badge.className = "text-[10px] px-2.5 py-0.5 rounded-full font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 mt-1 inline-block";
        document.getElementById('hoursInput').value = window.formatNumToVN(appConfig.standardHours || 8);
        document.getElementById('otInput').value = 0;
        document.getElementById('allowanceCheck').checked = true;
        document.getElementById('holidayCheck').checked = false;
        btnDelete.classList.add('hidden');
    }
    if (reRender) renderTimeline();
};


// ==========================================
// 10. TÍNH TOÁN CÔNG THỨC & GHI CHÉP
// ==========================================
const calculateDailySalaryDetails = (hours, otHours, hasAllowance, isHoliday, dateStr) => {
    let hourlyRate = 0;
    const stdDays = Number(appConfig.standardDays) || 26;
    const stdHours = Number(appConfig.standardHours) || 8;

    if (appConfig.salaryType === 'thang') hourlyRate = (Number(appConfig.baseSalaryMonth) / stdDays) / stdHours;
    else hourlyRate = Number(appConfig.baseSalaryHour);

    if (!dateStr) dateStr = selectedDayString;
    if (!dateStr) return { basePay: 0, otPay: 0, allowancePay: 0, holidayPay: 0, isSpecialDay: false, isOffDay: false };

    const parts = dateStr.split('-');
    const dObj = new Date(parts[0], parts[1] - 1, parts[2]);
    const dayName = daysOfWeek[dObj.getDay()];

    let workingDaysConf = appConfig.workingDays;
    if (!Array.isArray(workingDaysConf) || workingDaysConf.length === 0) {
        workingDaysConf = ['T2', 'T3', 'T4', 'T5', 'T6'];
    }

    const isWorkingDay = workingDaysConf.includes(dayName);
    const isOffDay = !isWorkingDay && !isHoliday; 
    const isSpecialDay = isHoliday || !isWorkingDay;

    let basePay = 0, otPay = 0, holidayPay = 0;
    let allowancePay = hasAllowance ? Number(appConfig.dailyAllowance) : 0;

    if (isSpecialDay) {
        holidayPay = Number(appConfig.holidayRate) * (Number(hours) + Number(otHours));
    } else {
        basePay = Number(hours) * hourlyRate;
        otPay = Number(otHours) * Number(appConfig.otRate);
    }

    return { basePay, otPay, allowancePay, holidayPay, isSpecialDay, isOffDay };
};

document.getElementById('workForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const hours = window.getMoneyValue(document.getElementById('hoursInput').value) || 0;
    const otHours = window.getMoneyValue(document.getElementById('otInput').value) || 0;
    const hasAllowance = document.getElementById('allowanceCheck').checked;
    const isHoliday = document.getElementById('holidayCheck').checked;

    const breakdown = calculateDailySalaryDetails(hours, otHours, hasAllowance, isHoliday);
    const newEntry = { id: Date.now().toString(), date: selectedDayString, hours, otHours, hasAllowance, isHoliday, breakdown };
    
    const existingIndex = workEntries.findIndex(e => e.date === selectedDayString);
    if (existingIndex > -1) workEntries[existingIndex] = newEntry; 
    else workEntries.push(newEntry);

    localStorage.setItem('payrollEntriesV5', JSON.stringify(workEntries));
    renderTimeline(); updateDataDisplays(); triggerAutoBackup();
});

document.getElementById('btnDeleteCurrent').addEventListener('click', async () => {
    if (await customConfirm('Xóa bản ghi công này?')) {
        workEntries = workEntries.filter(e => e.date !== selectedDayString);
        localStorage.setItem('payrollEntriesV5', JSON.stringify(workEntries));
        renderTimeline(); updateDataDisplays(); triggerAutoBackup();
    }
});


// ==========================================
// 11. XỬ LÝ PHỤ PHÍ & LƯU PHIẾU LƯƠNG
// ==========================================
window.saveExpenses = () => {
    const key = getMonthKey();
    if (!storedExpenses[key]) storedExpenses[key] = { tax: 0, insurance: 0, custom: [] };
    storedExpenses[key].tax = window.getMoneyValue(document.getElementById('inputTax').value);
    storedExpenses[key].insurance = window.getMoneyValue(document.getElementById('inputInsurance').value);
    localStorage.setItem('payrollExpensesV6', JSON.stringify(storedExpenses));
    calculateFinalPayslip(); triggerAutoBackup();
};
document.getElementById('inputTax').addEventListener('input', saveExpenses);
document.getElementById('inputInsurance').addEventListener('input', saveExpenses);

window.renderPayslipExpenses = () => {
    const key = getMonthKey(); const exp = storedExpenses[key] || { tax: 0, insurance: 0, custom: [] };
    document.getElementById('inputTax').value = window.formatNumToVN(exp.tax);
    document.getElementById('inputInsurance').value = window.formatNumToVN(exp.insurance);
    
    const list = document.getElementById('customExpensesList'); list.innerHTML = '';
    (exp.custom || []).forEach((item, index) => {
        list.innerHTML += `
            <div class="flex gap-2">
                <input type="text" placeholder="Tên khoản" value="${item.name}" oninput="updateCustomExpense(${index}, 'name', this.value)" class="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium outline-none bg-transparent dark:text-white">
                <input type="text" inputmode="decimal" placeholder="Số tiền" value="${window.formatNumToVN(item.amount)}" oninput="formatInputMoney(event); updateCustomExpense(${index}, 'amount', this.value)" class="money-input w-24 px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium outline-none text-right bg-transparent dark:text-white">
                <button onclick="removeCustomExpense(${index})" class="w-9 h-9 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-95"><i class="fa-solid fa-xmark"></i></button>
            </div>`;
    });
    calculateFinalPayslip();
};

window.addCustomExpense = () => {
    const key = getMonthKey();
    if (!storedExpenses[key]) storedExpenses[key] = { tax: 0, insurance: 0, custom: [] };
    if (!storedExpenses[key].custom) storedExpenses[key].custom = [];
    storedExpenses[key].custom.push({ name: '', amount: 0 });
    renderPayslipExpenses(); saveExpenses();
};

window.updateCustomExpense = (index, field, val) => {
    const key = getMonthKey(); 
    if (field === 'amount') val = window.getMoneyValue(val);
    storedExpenses[key].custom[index][field] = val; saveExpenses();
};

window.removeCustomExpense = (index) => {
    const key = getMonthKey(); storedExpenses[key].custom.splice(index, 1);
    renderPayslipExpenses(); saveExpenses();
};

window.calculateFinalPayslip = () => {
    const curr = appConfig.currency || 'đ'; const key = getMonthKey();
    const exp = storedExpenses[key] || { tax: 0, insurance: 0, custom: [] };
    let customTotal = 0; 
    (exp.custom || []).forEach(item => customTotal += (Number(item.amount) || 0));
    const totalDeductions = (Number(exp.tax) || 0) + (Number(exp.insurance) || 0) + customTotal;
    const net = currentGrossIncome - totalDeductions;
    
    document.getElementById('psTotalDeductions').textContent = window.formatMoney(totalDeductions, curr);
    document.getElementById('psNetTotal').textContent = window.formatMoney(net, curr);
};

window.toggleActualInput = (isMatch) => {
    const wrapper = document.getElementById('actualInputWrapper');
    if (isMatch) {
        wrapper.classList.add('hidden');
        document.getElementById('actualReceivedInput').value = '';
    } else {
        wrapper.classList.remove('hidden');
    }
};

window.saveCurrentPayslip = async () => {
    const month = getMonthKey();
    const existsIndex = savedPayslips.findIndex(p => p.month === month);
    if (existsIndex > -1) {
        if (!(await customConfirm(`Đã lưu tháng ${month}. Bạn muốn cập nhật lại toàn bộ chi tiết?`))) return;
    }
    
    // Thu thập toàn bộ thông tin chi tiết từ Dashboard và Expense
    const curr = appConfig.currency || 'đ';
    const key = getMonthKey();
    const exp = storedExpenses[key] || { tax: 0, insurance: 0, custom: [] };
    
    const payslipData = { 
        id: Date.now().toString(), 
        month: month,
        timestamp: new Date().toLocaleString('vi-VN'),
        // Chi tiết thu nhập
        details: {
            totalDays: document.getElementById('dashDays').innerText,
            totalHours: document.getElementById('dashHours').innerText,
            totalOT: document.getElementById('dashOT').innerText,
            basePay: document.getElementById('psBase').innerText,
            otPay: document.getElementById('psOT').innerText,
            holidayPay: document.getElementById('psHoliday').innerText,
            allowancePay: document.getElementById('psAllowance').innerText,
        },
        // Chi tiết khấu trừ
        deductions: {
            tax: window.formatMoney(exp.tax, curr),
            insurance: window.formatMoney(exp.insurance, curr),
            custom: exp.custom.map(item => ({ name: item.name, amount: window.formatMoney(item.amount, curr) })),
            total: document.getElementById('psTotalDeductions').innerText
        },
        gross: document.getElementById('psTotal').innerText, 
        net: document.getElementById('psNetTotal').innerText, 
    };
    
    if (existsIndex > -1) savedPayslips[existsIndex] = payslipData; 
    else savedPayslips.push(payslipData);
    
    localStorage.setItem('savedPayslipsV1', JSON.stringify(savedPayslips));
    await customAlert('Đã lưu bảng lương chi tiết!'); 
    renderSavedPayslips(); 
    triggerAutoBackup();
};

// ==========================================
// THAY THẾ HÀM RENDER CŨ & THÊM TÍNH NĂNG XUẤT FILE
// ==========================================
window.renderSavedPayslips = () => {
    const container = document.getElementById('savedPayslipsContainer'); 
    container.innerHTML = '';
    
    if (savedPayslips.length === 0) { 
        container.innerHTML = '<p class="text-xs font-medium text-gray-500 text-center py-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">Chưa có bảng lương nào.</p>'; 
        return; 
    }
    
    [...savedPayslips].sort((a, b) => b.id - a.id).forEach(ps => {
        container.innerHTML += `
            <div class="border border-gray-100 dark:border-gray-800 rounded-2xl p-4 bg-gray-50 dark:bg-gray-950 flex flex-col gap-3 transition hover:shadow-sm">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Tháng ${ps.month}</div>
                        <div class="text-[10px] text-gray-500 mt-0.5"><i class="fa-regular fa-clock mr-1"></i>${ps.timestamp}</div>
                    </div>
                    <div class="text-right">
                        <span class="text-lg font-black text-green-600 dark:text-green-400 block">${ps.net}</span>
                    </div>
                </div>
                
                <div class="flex gap-2 border-t border-gray-200 dark:border-gray-800 pt-3 mt-1">
                    <button onclick="exportPayslip('${ps.id}', 'png')" class="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-[11px] font-bold py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition shadow-sm">
                        <i class="fa-regular fa-image mr-1.5"></i>Lưu Ảnh
                    </button>
                    <button onclick="exportPayslip('${ps.id}', 'pdf')" class="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-[11px] font-bold py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition shadow-sm">
                        <i class="fa-regular fa-file-pdf mr-1.5"></i>Lưu PDF
                    </button>
                    <button onclick="deletePayslip('${ps.id}')" class="w-10 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 active:scale-95 transition">
                        <i class="fa-solid fa-trash text-xs"></i>
                    </button>
                </div>
            </div>`;
    });
};

// Hàm xuất thẻ lương ra Ảnh hoặc PDF
window.exportPayslip = async (id, format) => {
    const ps = savedPayslips.find(p => p.id === id);
    if (!ps) return;

    // Đổ dữ liệu thống kê
    document.getElementById('exMonth').textContent = `Tháng ${ps.month}`;
    document.getElementById('exDays').textContent = ps.details?.totalDays || '0';
    document.getElementById('exHours').textContent = ps.details?.totalHours + 'h' || '0h';
    document.getElementById('exOT').textContent = ps.details?.totalOT + 'h' || '0h';
    
    // Đổ danh sách Thu nhập
    const incList = document.getElementById('exIncomeList');
    incList.innerHTML = `
        <div class="flex justify-between"><span>Lương chính</span><span class="font-bold">${ps.details.basePay}</span></div>
        <div class="flex justify-between"><span>Lương tăng ca</span><span class="font-bold">${ps.details.otPay}</span></div>
        <div class="flex justify-between"><span>Thưởng lễ</span><span class="font-bold">${ps.details.holidayPay}</span></div>
        <div class="flex justify-between text-blue-600"><span>Phụ cấp</span><span class="font-bold">${ps.details.allowancePay}</span></div>
    `;

    // Đổ danh sách Khấu trừ
    const dedList = document.getElementById('exDeductionList');
    let customDeds = (ps.deductions.custom || []).map(d => `<div class="flex justify-between"><span>${d.name || 'Khác'}</span><span class="font-bold">${d.amount}</span></div>`).join('');
    dedList.innerHTML = `
        <div class="flex justify-between"><span>Thuế TNCN</span><span class="font-bold">${ps.deductions.tax}</span></div>
        <div class="flex justify-between"><span>Bảo hiểm</span><span class="font-bold">${ps.deductions.insurance}</span></div>
        ${customDeds}
    `;

    // Tổng kết
    document.getElementById('exGross').textContent = ps.gross;
    document.getElementById('exTotalDed').textContent = ps.deductions.total;
    document.getElementById('exNet').textContent = ps.net;
    document.getElementById('exTime').textContent = `Mã xác thực: ${ps.id} - Xuất lúc: ${new Date().toLocaleString('vi-VN')}`;

    // Chụp ảnh
    const template = document.getElementById('exportPayslipTemplate');
    await new Promise(r => setTimeout(r, 200));

    const canvas = await html2canvas(template, { scale: 3, backgroundColor: '#ffffff' });
    if (format === 'png') {
        const a = document.createElement('a');
        a.href = canvas.toDataURL("image/png");
        a.download = `PhieuLuong_ChiTiet_T${ps.month}.png`;
        a.click();
    } else {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, 190, 0);
        pdf.save(`PhieuLuong_ChiTiet_T${ps.month}.pdf`);
    }
};

window.deletePayslip = async (id) => {
    if (await customConfirm('Xoá phiếu lương này khỏi lịch sử?')) {
        savedPayslips = savedPayslips.filter(p => p.id !== id); 
        localStorage.setItem('savedPayslipsV1', JSON.stringify(savedPayslips));
        renderSavedPayslips(); triggerAutoBackup();
    }
};


// ==========================================
// 12. CẬP NHẬT THỐNG KÊ DASHBOARD & XUẤT ẢNH
// ==========================================
const getCycleEntries = () => {
    const { start, end } = getCycleDates(currentTargetDate);
    return workEntries.filter(e => { 
        const d = new Date(e.date); 
        return d >= start && d <= end; 
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
};

window.exportCycleImage = async () => {
    const el = document.getElementById('cycleHistoryExportContainer');
    if (getCycleEntries().length === 0) return await customAlert('Không có dữ liệu.');
    document.getElementById('exportSummary').classList.remove('hidden');

    html2canvas(el, { scale: 2, backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff' }).then(canvas => {
        const a = document.createElement('a'); a.href = canvas.toDataURL("image/png"); a.download = `LichSu_${getMonthKey()}.png`; a.click();
        document.getElementById('exportSummary').classList.add('hidden');
    });
};

window.exportCyclePDF = async () => {
    const el = document.getElementById('cycleHistoryExportContainer'); 
    if (getCycleEntries().length === 0) return await customAlert('Không có dữ liệu.');
    
    html2canvas(el, { scale: 2, backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff' }).then(canvas => {
        const imgData = canvas.toDataURL('image/png'); const { jsPDF } = window.jspdf; const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth(); const imgProps = pdf.getImageProperties(imgData);
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.text(`Bao Cao Cong - Thang ${getMonthKey()}`, 10, 10);
        pdf.addImage(imgData, 'PNG', 0, 15, pdfWidth, pdfHeight); pdf.save(`LichSu_${getMonthKey()}.pdf`);
    });
};

const updateDataDisplays = () => {
    const curr = appConfig.currency || 'đ';
    const { start, end } = getCycleDates(currentTargetDate);
    const cycleEntries = getCycleEntries().reverse();

    let totalDays = cycleEntries.length;
    let totalHours = 0, totalOT = 0;
    let sumBase = 0, sumOT = 0, sumAllowance = 0, sumHoliday = 0;
    let holidayCount = 0, offDayCount = 0;

    const table = document.getElementById('historyTable');
    table.innerHTML = '';

    if (cycleEntries.length === 0) {
        table.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-gray-400 font-medium text-xs">Chưa có bản ghi nào.</td></tr>`;
    } else {
        let stt = 1;
        cycleEntries.forEach(entry => {
            totalHours += Number(entry.hours);
            totalOT += Number(entry.otHours);

            const breakdown = entry.breakdown || { basePay: 0, otPay: 0, allowancePay: 0, holidayPay: 0, isSpecialDay: false, isOffDay: false };
            sumBase += Number(breakdown.basePay);
            sumOT += Number(breakdown.otPay);
            sumAllowance += Number(breakdown.allowancePay);
            sumHoliday += Number(breakdown.holidayPay);

            if (entry.isHoliday) holidayCount++;
            else if (breakdown.isOffDay) offDayCount++;

            const dailyTotal = Number(breakdown.basePay) + Number(breakdown.otPay) + Number(breakdown.allowancePay) + Number(breakdown.holidayPay);
            const parts = entry.date.split('-');
            const dObj = new Date(parts[0], parts[1] - 1, parts[2]);

            let dayColor = 'text-gray-500';
            let dayTag = '';
            if (entry.isHoliday) {
                dayColor = 'text-red-500';
                dayTag = '<span class="text-[8px] font-bold bg-red-100 dark:bg-red-900/40 text-red-600 px-1.5 py-0.5 rounded ml-1.5">LỄ</span>';
            } else if (breakdown.isOffDay) {
                dayColor = 'text-orange-500';
                dayTag = '<span class="text-[8px] font-bold bg-orange-100 dark:bg-orange-900/40 text-orange-600 px-1.5 py-0.5 rounded ml-1.5">NGHỈ</span>';
            }

            table.innerHTML += `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer" onclick="selectDate('${entry.date}')">
                <td class="p-3 pl-5 text-xs text-gray-500 font-medium">${stt++}</td>
                <td class="p-3">
                    <div class="flex items-center">
                        <span class="text-[10px] font-bold ${dayColor} uppercase tracking-wide">${daysOfWeek[dObj.getDay()]}</span>
                        ${dayTag}
                    </div>
                    <div class="font-medium text-gray-900 dark:text-white">${dObj.getDate()}/${dObj.getMonth() + 1}</div>
                </td>
                <td class="p-3 text-gray-600 dark:text-gray-300 text-sm font-medium">${entry.hours}h <span class="text-xs ${entry.otHours > 0 ? 'text-blue-500' : 'text-gray-400'} ml-1">OT: ${entry.otHours}h</span></td>
                <td class="p-3 pr-5 text-right font-semibold text-gray-900 dark:text-white">${window.formatMoney(dailyTotal, curr)}</td>
            </tr>`;
        });
    }

    const monthlyAllowValue = Number(appConfig.monthlyAllowance) || 0;
    if (monthlyAllowValue > 0 && totalDays > 0) sumAllowance += monthlyAllowValue;
    currentGrossIncome = sumBase + sumOT + sumAllowance + sumHoliday;

    // Cập nhật Dashboard
    document.getElementById('dashTotal').textContent = window.formatMoney(currentGrossIncome, curr);
    document.getElementById('dashAvgPay').textContent = window.formatMoney(totalDays > 0 ? (currentGrossIncome / totalDays) : 0, curr);
    document.getElementById('dashDays').textContent = totalDays;
    document.getElementById('dashHolidays').textContent = holidayCount;
    document.getElementById('dashOffDays').textContent = offDayCount;
    document.getElementById('dashHours').textContent = totalHours;
    document.getElementById('dashOT').textContent = totalOT;
    document.getElementById('dashBasePay').textContent = window.formatMoney(sumBase, curr);
    document.getElementById('dashOTPay').textContent = window.formatMoney(sumOT, curr);
    document.getElementById('dashAllowance').textContent = window.formatMoney(sumAllowance + sumHoliday, curr);

    // Xử lý Progress Thanh tiến độ
    const progressSection = document.getElementById('monthlyProgressSection');
    if (progressSection) progressSection.classList.remove('hidden');

    let workingDaysConf = appConfig.workingDays;
    if (!Array.isArray(workingDaysConf) || workingDaysConf.length === 0) {
        workingDaysConf = ['T2', 'T3', 'T4', 'T5', 'T6'];
    }

    const startM = new Date(start); startM.setHours(0, 0, 0, 0);
    const endM = new Date(end); endM.setHours(23, 59, 59, 999); 

    let totalWorkingDaysInCycle = 0;
    let iterDate = new Date(startM);
    while (iterDate <= endM) {
        if (workingDaysConf.includes(daysOfWeek[iterDate.getDay()])) totalWorkingDaysInCycle++;
        iterDate.setDate(iterDate.getDate() + 1);
    }
    if (totalWorkingDaysInCycle === 0) totalWorkingDaysInCycle = 1;
    
    const timeProgTotalEl = document.getElementById('timeProgTotal');
    if (timeProgTotalEl) {
        timeProgTotalEl.textContent = totalWorkingDaysInCycle;
        document.getElementById('timeProgCurrent').textContent = totalDays;
        let timePercent = Math.min((totalDays / totalWorkingDaysInCycle) * 100, 100);
        document.getElementById('timeProgPercent').textContent = `${timePercent.toFixed(0)}%`;
        setTimeout(() => {
            const timeProgBar = document.getElementById('timeProgBar');
            if (timeProgBar) timeProgBar.style.width = `${timePercent}%`;
        }, 100);
    }

    const workProgressWrapper = document.getElementById('workProgressWrapper');
    if (appConfig.salaryType === 'thang') {
        if (workProgressWrapper) workProgressWrapper.classList.remove('hidden');
        const targetDays = Number(appConfig.standardDays) || 26;
        const progTargetEl = document.getElementById('progTarget');
        const progCurrentEl = document.getElementById('progCurrent');

        if (progTargetEl) progTargetEl.textContent = targetDays;
        if (progCurrentEl) progCurrentEl.textContent = totalDays; 

        let percent = Math.min((totalDays / targetDays) * 100, 100);
        let percentText = percent % 1 === 0 ? percent : percent.toFixed(1);

        const progPercentEl = document.getElementById('progPercent');
        if (progPercentEl) progPercentEl.textContent = `${percentText}%`;

        setTimeout(() => {
            const progBarEl = document.getElementById('progBar');
            if (progBarEl) progBarEl.style.width = `${percent}%`;
        }, 100);
    } else {
        if (workProgressWrapper) workProgressWrapper.classList.add('hidden');
    }

    // Cập nhật Phiếu Lương
    document.getElementById('psBase').textContent = window.formatMoney(sumBase, curr);
    document.getElementById('psOT').textContent = window.formatMoney(sumOT, curr);
    document.getElementById('psHoliday').textContent = window.formatMoney(sumHoliday, curr);
    document.getElementById('psAllowance').textContent = window.formatMoney(sumAllowance, curr);
    document.getElementById('psTotal').textContent = window.formatMoney(currentGrossIncome, curr);

    const expTotalDays = document.getElementById('expTotalDays');
    if (expTotalDays) {
        let specialText = [];
        if (holidayCount > 0) specialText.push(`${holidayCount} Lễ`);
        if (offDayCount > 0) specialText.push(`${offDayCount} Nghỉ`);
        let specialString = specialText.length > 0 ? ` (${specialText.join(' - ')})` : '';

        expTotalDays.textContent = `${totalDays}${specialString}`;
        document.getElementById('expTotalHours').textContent = totalHours;
        document.getElementById('expTotalOT').textContent = totalOT;
        document.getElementById('expTotalIncome').textContent = window.formatMoney(currentGrossIncome, curr);
    }

    renderPayslipExpenses();
    renderSavedPayslips();
};


// ==========================================
// 13. KHỞI TẠO ỨNG DỤNG (INIT)
// ==========================================
const init = () => {
    // TỰ ĐỘNG FIX HTML CHO BẠN (Đổi type="number" sang text để hỗ trợ dấu phẩy)
    const fixInputTypes = ['standardHours', 'standardDays', 'cutoffDate', 'hoursInput', 'otInput'];
    fixInputTypes.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.type = 'text';
            el.setAttribute('inputmode', 'decimal');
            if (id !== 'cutoffDate') el.classList.add('money-input'); // Đổi sang format tiền tệ
        }
    });

    // Gán lại event lắng nghe khi gõ cho các ô chứa class money-input
    document.querySelectorAll('.money-input').forEach(el => {
        el.removeEventListener('input', window.formatInputMoney);
        el.addEventListener('input', window.formatInputMoney);
    });

    initTheme();
    document.getElementById('autoBackupCheck').checked = localStorage.getItem('autoBackupON') === '1';

    document.getElementById('openSettingsBtn').addEventListener('click', () => {
        document.getElementById('settingsOverlay').classList.remove('hidden');
        document.getElementById('settingsOverlay').classList.add('flex');
    });
    
    document.getElementById('closeSettingsBtn').addEventListener('click', () => {
        document.getElementById('settingsOverlay').classList.add('hidden');
    });

    const now = new Date();
    const monthInput = document.getElementById('cycleMonthPicker');
    monthInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    monthInput.dispatchEvent(new Event('change'));

    if (!loadSettings()) {
        document.getElementById('settingsOverlay').classList.remove('hidden');
        document.getElementById('settingsOverlay').classList.add('flex');
    } else {
        document.getElementById('mainApp').classList.remove('hidden');
        document.getElementById('closeSettingsBtn').classList.remove('hidden');
        setViewMode('week');
        document.getElementById('btnToday').click();
    }
    updateDataDisplays();
};

init();