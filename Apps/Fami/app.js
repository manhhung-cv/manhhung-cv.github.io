// app.js - FamiBank Fixed Version

// --- 1. IMPORTS & CONFIGURATION ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
    getFirestore, doc, setDoc, getDoc, getDocs, onSnapshot, collection, query, where,
    runTransaction, addDoc, orderBy, updateDoc, serverTimestamp, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA154aDjGrayZKcNB7-VjtZGKz22Op3U4g",
    authDomain: "smart-wallet-hunq.firebaseapp.com",
    projectId: "smart-wallet-hunq",
    storageBucket: "smart-wallet-hunq.firebasestorage.app",
    messagingSenderId: "707382516261",
    appId: "1:707382516261:web:d735f3672661dc0d25bdcc",
    measurementId: "G-MJ81D7D757"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = firebaseConfig.projectId;
const ADMIN_EMAIL = 'mienphi1230@gmail.com';

// --- 2. TRANSLATIONS (DATA) ---
const translations = {
    vi: {
        loginSlogan: "Tài chính cho gia đình ❤️", emailPlaceholder: "Email", passwordPlaceholder: "Mật khẩu", signIn: "Đăng Nhập", noAccount: "Chưa có tài khoản?", registerNow: "Đăng ký ngay", getStarted: "Bắt Đầu", createAccountPrompt: "Tạo tài khoản mới", fullNamePlaceholder: "Họ và Tên", usernamePlaceholder: "Tên đăng nhập", accountNumberPlaceholder: "Số tài khoản", pinPlaceholder: "Mã PIN 6 số", createAccount: "Đăng Ký", welcome: "Xin chào,", totalBalance: "Tổng số dư", transfer: "Chuyển tiền", deposit: "Nạp tiền", withdraw: "Rút tiền", recentTransactions: "GD Gần đây", history: "Lịch sử", settings: "Cài đặt", profile: "Hồ sơ", security: "Bảo mật", changePin: "Đổi PIN", logout: "Đăng xuất", adminPanel: "Admin Panel", available: "Có sẵn", used: "Đã dùng", transferFunds: "Chuyển tiền", enterPin: "Nhập mã PIN", success: "Thành công!", error: "Lỗi", confirmDelete: "Xác nhận xóa?", saved: "Đã lưu", copied: "Đã sao chép"
    },
    en: {
        loginSlogan: "Finance for Family ❤️", emailPlaceholder: "Email", passwordPlaceholder: "Password", signIn: "Sign In", noAccount: "No account?", registerNow: "Register now", getStarted: "Get Started", createAccountPrompt: "Create new account", fullNamePlaceholder: "Full Name", usernamePlaceholder: "Username", accountNumberPlaceholder: "Account Number", pinPlaceholder: "6-digit PIN", createAccount: "Register", welcome: "Welcome,", totalBalance: "Total Balance", transfer: "Transfer", deposit: "Deposit", withdraw: "Withdraw", recentTransactions: "Recent Tx", history: "History", settings: "Settings", profile: "Profile", security: "Security", changePin: "Change PIN", logout: "Logout", adminPanel: "Admin Panel", available: "Available", used: "Used", transferFunds: "Transfer Funds", enterPin: "Enter PIN", success: "Success!", error: "Error", confirmDelete: "Confirm Delete?", saved: "Saved", copied: "Copied"
    }
};
let currentLang = localStorage.getItem('famiBankLanguage') || 'vi';

// --- 3. STATE & UTILS ---
let currentUser = null;
let currentUserData = null;
let isBalanceVisible = true;
let currentPinBuffer = '';
let pinResolver = null;
let jarData = null;

// Helper functions
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
const formatDate = (ts) => ts ? ts.toDate().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '...';

async function hashPin(pin) {
    const msgBuffer = new TextEncoder().encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const showLoading = () => $('#loading-overlay').classList.remove('hidden');
const hideLoading = () => $('#loading-overlay').classList.add('hidden');
const showToast = (msg, isError = false) => {
    const t = $('#toast-notification');
    if (!t) return;
    $('#toast-message').textContent = msg;
    t.style.borderColor = isError ? '#EF4444' : '#10B981';
    $('#toast-message').style.color = isError ? '#EF4444' : '#10B981';
    t.classList.remove('opacity-0');
    setTimeout(() => t.classList.add('opacity-0'), 3000);
};

// --- 4. FORMATTING CURRENCY ---
function setupCurrencyInputs() {
    $$('.currency-input').forEach(input => {
        input.addEventListener('input', (e) => {
            let rawValue = e.target.value.replace(/\D/g, '');
            if (!rawValue) { e.target.value = ''; return; }
            e.target.value = new Intl.NumberFormat('vi-VN').format(rawValue);
        });
    });
}

const getMoneyValue = (selector) => {
    const el = $(selector);
    if (!el || !el.value) return 0;
    const val = el.value.replace(/\./g, '');
    return parseInt(val) || 0;
};

// --- 5. APP INIT ---
function initApp() {
    const savedTheme = localStorage.getItem('famiBankTheme') || 'system';
    applyTheme(savedTheme);
    $$('.theme-btn').forEach(btn => btn.addEventListener('click', () => {
        const t = btn.dataset.theme;
        applyTheme(t);
        localStorage.setItem('famiBankTheme', t);
    }));

    applyLanguage(currentLang);
    $$('.lang-btn').forEach(btn => btn.addEventListener('click', () => {
        const l = btn.dataset.lang;
        applyLanguage(l);
        localStorage.setItem('famiBankLanguage', l);
    }));

    setupCurrencyInputs();
}

function applyTheme(theme) {
    $$('.theme-btn').forEach(b => b.classList.remove('active', 'border-blue-500', 'text-blue-600'));
    $(`.theme-btn[data-theme="${theme}"]`)?.classList.add('active', 'border-blue-500', 'text-blue-600');
    document.body.classList.remove('dark-mode');
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark-mode');
    }
}

function applyLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-translate-key]').forEach(el => {
        el.textContent = translations[lang][el.dataset.translateKey] || el.dataset.translateKey;
    });
    document.querySelectorAll('[data-translate-key-placeholder]').forEach(el => {
        el.placeholder = translations[lang][el.dataset.translateKeyPlaceholder] || el.dataset.translateKeyPlaceholder;
    });
}

// --- 6. AUTHENTICATION ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        onSnapshot(doc(db, `artifacts/${appId}/users`, user.uid), (snap) => {
            if (snap.exists()) {
                currentUserData = { id: snap.id, ...snap.data() };
                updateUI();
                loadUserData(user.uid);
                loadFamilyMembers(user.uid);
                if (currentUserData.email === ADMIN_EMAIL) {
                    $('#admin-nav-btn').classList.remove('hidden');
                    initAdminListeners();
                } else {
                    $('#admin-nav-btn').classList.add('hidden');
                }
            }
        });
        showView('app-view');
    } else {
        currentUser = null;
        currentUserData = null;
        showView('login-view');
    }
});

// Register Logic
$('#register-btn').addEventListener('click', async () => {
    const name = $('#reg-name').value.trim();
    const username = $('#reg-username').value.trim().toLowerCase();
    const accNum = $('#reg-account-number').value.trim();
    const email = $('#reg-email').value.trim();
    const password = $('#reg-password').value;
    const pin = $('#reg-pin').value;

    if (!name || !username || !accNum || !email || !password || !pin) return showToast("Điền đủ thông tin", true);
    if (pin.length !== 6) return showToast("PIN 6 số", true);

    showLoading();
    try {
        // BƯỚC 1: Kiểm tra trùng lặp (Dùng getDocs thay vì runTransaction)
        const usersRef = collection(db, `artifacts/${appId}/users`);
        const qUsername = query(usersRef, where("username", "==", username));
        const qAccNum = query(usersRef, where("accountNumber", "==", accNum));

        // Chạy song song 2 câu lệnh kiểm tra
        const [userSnap, accSnap] = await Promise.all([getDocs(qUsername), getDocs(qAccNum)]);

        if (!userSnap.empty) throw "Username đã tồn tại";
        if (!accSnap.empty) throw "Số tài khoản đã tồn tại";

        // BƯỚC 2: Tạo tài khoản Authentication
        const cred = await createUserWithEmailAndPassword(auth, email, password);

        // BƯỚC 3: Lưu thông tin vào Firestore
        // Mã PIN sẽ được hash trước khi lưu
        const pinHashed = await hashPin(pin);

        await setDoc(doc(db, `artifacts/${appId}/users`, cred.user.uid), {
            displayName: name,
            username: username,
            accountNumber: accNum,
            email: email,
            pinHash: pinHashed,
            balance: 0,
            createdAt: serverTimestamp()
        });

        showToast(translations[currentLang].success);

        // Reset form và chuyển về trang đăng nhập (tùy chọn)
        // showView('login-view'); 

    } catch (e) {
        console.error(e);
        // Xử lý thông báo lỗi dễ hiểu hơn từ Firebase Auth
        let msg = e.message || e;
        if (msg.includes("email-already-in-use")) msg = "Email này đã được sử dụng";
        showToast(msg, true);
    } finally {
        hideLoading();
    }
});

$('#login-btn').addEventListener('click', async () => {
    showLoading();
    try {
        await signInWithEmailAndPassword(auth, $('#login-email').value, $('#login-password').value);
    } catch (e) { showToast("Sai email/mật khẩu", true); } finally { hideLoading(); }
});
$('#logout-btn').addEventListener('click', () => signOut(auth));

// --- 7. NAVIGATION & UI ---
const showView = (id) => { $$('.view-section').forEach(v => v.classList.remove('active')); $(`#${id}`).classList.add('active'); };
const showTab = (id) => {
    $$('.app-tab').forEach(t => t.classList.remove('active')); $(`#${id}`).classList.add('active');
    $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === id));
};
$$('.nav-btn').forEach(b => b.addEventListener('click', () => showTab(b.dataset.tab)));
$('#show-register-btn').addEventListener('click', () => showView('register-view'));
$('#back-to-login-btn').addEventListener('click', () => showView('login-view'));

function updateUI() {
    if (!currentUserData) return;

    // --- 1. XỬ LÝ DỮ LIỆU ---
    const displayAvatar = currentUserData.avatarEmoji || currentUserData.displayName.charAt(0).toUpperCase();
    // Lấy màu từ DB, nếu không có thì mặc định là màu xám (#6B7280)
    const displayColor = currentUserData.avatarColor || '#6B7280';

    // --- 2. CẬP NHẬT AVATAR NHỎ (TRANG CHỦ) ---
    const userAvatarEl = document.querySelector('#user-avatar');
    if (userAvatarEl) {
        userAvatarEl.textContent = displayAvatar;

        // QUAN TRỌNG: Reset lại class để xóa các màu nền cũ (như bg-blue-100...)
        userAvatarEl.className = 'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border border-white text-white transition-colors';

        // Gán màu nền mới
        userAvatarEl.style.backgroundColor = displayColor;
    }

    // --- 3. CẬP NHẬT PREVIEW (TRANG CÀI ĐẶT) ---
    const settingsPreview = document.querySelector('#settings-avatar-preview');
    if (settingsPreview) {
        settingsPreview.textContent = displayAvatar;
        settingsPreview.style.backgroundColor = displayColor;
        settingsPreview.style.color = '#ffffff';
    }

    // --- 4. CÁC THÔNG TIN KHÁC (Input, Text...) ---
    // Kiểm tra tồn tại trước khi gán để tránh lỗi null
    if ($('#user-display-name')) $('#user-display-name').textContent = currentUserData.displayName;
    if ($('#user-account-number')) $('#user-account-number').textContent = currentUserData.accountNumber;
    if ($('#user-balance')) $('#user-balance').textContent = isBalanceVisible ? formatCurrency(currentUserData.balance) : '••••••';

    // Điền lại input trong cài đặt
    if ($('#update-name-input')) $('#update-name-input').value = currentUserData.displayName;
    if ($('#custom-emoji-input') && currentUserData.avatarEmoji) $('#custom-emoji-input').value = currentUserData.avatarEmoji;

    // Chỉ cập nhật input username/stk nếu element đó tồn tại trong HTML
    if ($('#update-username-input')) $('#update-username-input').value = currentUserData.username;
    if ($('#update-account-number-input')) $('#update-account-number-input').value = currentUserData.accountNumber;
}

$('#balance-visibility-btn').addEventListener('click', () => { isBalanceVisible = !isBalanceVisible; updateUI(); });

// --- 8. PIN SYSTEM ---
function requestPin() {
    return new Promise(resolve => {
        pinResolver = resolve;
        currentPinBuffer = '';
        $$('.pin-dot').forEach(d => d.classList.remove('active'));
        $('#pin-modal').classList.remove('hidden');
    });
}
$('#pin-keypad').addEventListener('click', (e) => {
    const btn = e.target.closest('.pin-key');
    if (!btn) return;
    const key = btn.dataset.key;
    if (key === 'backspace') currentPinBuffer = currentPinBuffer.slice(0, -1);
    else if (currentPinBuffer.length < 6) currentPinBuffer += key;

    $$('.pin-dot').forEach((d, i) => d.classList.toggle('active', i < currentPinBuffer.length));
    if (currentPinBuffer.length === 6) {
        setTimeout(() => { $('#pin-modal').classList.add('hidden'); if (pinResolver) pinResolver(currentPinBuffer); }, 200);
    }
});
$('.modal-close-btn').addEventListener('click', () => { if (pinResolver) pinResolver(null); });

// --- 9. FAMILY LIST ---
function loadFamilyMembers(currentUid) {
    const container = $('#recipient-list-container');
    if (!container) return;

    // Lấy dữ liệu realtime từ Firestore
    onSnapshot(query(collection(db, `artifacts/${appId}/users`)), (snap) => {
        // Lọc bỏ bản thân (currentUid) ra khỏi danh sách
        const family = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(u => u.id !== currentUid);

        // Trường hợp chưa có ai khác
        if (family.length === 0) {
            container.innerHTML = '<p class="text-xs text-s italic p-2">Chưa có thành viên khác</p>';
            return;
        }

        // Render danh sách
        container.innerHTML = family.map(user => {
            // 1. Logic lấy Avatar: Ưu tiên Emoji -> Nếu không có thì lấy Chữ cái đầu
            const userAvatar = user.avatarEmoji || user.displayName.charAt(0).toUpperCase();

            // 2. Logic lấy Màu: Ưu tiên Màu user chọn -> Nếu không có thì lấy màu xám mặc định
            const userColor = user.avatarColor || '#e5e7eb';

            return `
            <div class="recipient-item flex flex-col items-center gap-1 cursor-pointer transition-transform active:scale-95" onclick="selectRecipient(this, '${user.id}')">
                <div class="avatar-circle w-12 h-12 rounded-full flex items-center justify-center text-lg shadow-sm border-2 border-white dark:border-gray-700" 
                     style="background-color: ${userColor}; color: #ffffff;">
                    ${userAvatar}
                </div>
                
                <span class="text-xs font-medium text-p text-center truncate w-full" style="max-width: 70px;">
                    ${user.displayName}
                </span>
            </div>
            `;
        }).join('');
    });
}

window.selectRecipient = (el, uid) => {
    $$('.recipient-item').forEach(item => item.classList.remove('selected'));
    el.classList.add('selected');
    const input = $('#selected-recipient-id');
    if (input) input.value = uid;
};

// --- 10. TRANSACTIONS ---
$('#confirm-transfer-btn').addEventListener('click', async () => {
    const recipientInput = $('#selected-recipient-id');
    if (!recipientInput) return alert("Lỗi HTML: Thiếu input ID người nhận");

    const recipientId = recipientInput.value;
    const amount = getMoneyValue('#transfer-amount');
    const content = $('#transfer-content').value || "Chuyển tiền";

    if (!recipientId) return showToast("Vui lòng chọn người nhận", true);
    if (!amount || amount <= 0) return showToast("Số tiền không hợp lệ", true);
    if (amount > currentUserData.balance) return showToast("Số dư không đủ", true);

    $('#transfer-modal').classList.add('hidden');

    const pin = await requestPin();
    if (!pin || (await hashPin(pin)) !== currentUserData.pinHash) return showToast("Sai PIN", true);

    showLoading();
    try {
        await runTransaction(db, async (t) => {
            // --- BƯỚC 1: ĐỌC DỮ LIỆU (READS) ---
            const senderRef = doc(db, `artifacts/${appId}/users`, currentUser.uid);
            const receiverRef = doc(db, `artifacts/${appId}/users`, recipientId);

            const senderDoc = await t.get(senderRef);
            const receiverDoc = await t.get(receiverRef);

            // Kiểm tra sau khi đọc
            if (!receiverDoc.exists()) throw "Người nhận không tồn tại";
            const senderData = senderDoc.data();
            const receiverData = receiverDoc.data();

            if (senderData.balance < amount) throw "Số dư không đủ";

            // --- BƯỚC 2: GHI DỮ LIỆU (WRITES) ---
            // Trừ tiền người gửi
            t.update(senderRef, { balance: senderData.balance - amount });
            // Cộng tiền người nhận
            t.update(receiverRef, { balance: receiverData.balance + amount });

            // Lưu lịch sử với đầy đủ tên
            const txRef = doc(collection(db, `artifacts/${appId}/transactions`));
            const txData = {
                type: 'transfer',
                fromUserId: currentUser.uid,
                fromUserName: senderData.displayName, // Lưu tên người gửi
                toUserId: receiverDoc.id,
                toUserName: receiverData.displayName, // Lưu tên người nhận
                amount: amount,
                content: content,
                timestamp: serverTimestamp()
            };
            t.set(txRef, txData);

            // Chỉ dùng để hiển thị bill ngay lập tức (client side)
            showBill(txData);
        });

        showToast("Chuyển tiền thành công!");

        // Reset form
        recipientInput.value = '';
        $('#transfer-amount').value = '';
        $$('.recipient-item').forEach(i => i.classList.remove('selected'));

    } catch (e) {
        console.error(e);
        showToast(typeof e === 'string' ? e : "Lỗi giao dịch", true);
    } finally {
        hideLoading();
    }
});

function showBill(data) {
    $('#bill-modal').classList.remove('hidden');
    $('#bill-amount').textContent = formatCurrency(data.amount);
    $('#bill-sender-name').textContent = data.fromUserName || currentUserData.displayName;
    $('#bill-sender-acc').textContent = '****';
    $('#bill-recipient-name').textContent = data.toUserName || 'Hệ thống';
    $('#bill-recipient-acc').textContent = '****';
    $('#bill-content-text').textContent = data.content;
    $('#bill-timestamp').textContent = new Date().toLocaleString('vi-VN');
}

$('#save-bill-btn').addEventListener('click', () => {
    html2canvas($('#bill-content')).then(canvas => {
        const link = document.createElement('a');
        link.download = `Bill_${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
        showToast(translations[currentLang].saved);
    });
});

$('#confirm-deposit-btn').addEventListener('click', async () => {
    const code = $('#deposit-code').value.trim().toUpperCase();
    if (!code) return;
    $('#deposit-modal').classList.add('hidden');
    showLoading();
    try {
        await runTransaction(db, async (t) => {
            const codeRef = doc(db, `artifacts/${appId}/depositCodes`, code);
            const userRef = doc(db, `artifacts/${appId}/users`, currentUser.uid);
            const cDoc = await t.get(codeRef);
            if (!cDoc.exists() || cDoc.data().status !== 'available') throw "Mã lỗi";

            const uDoc = await t.get(userRef);
            t.update(userRef, { balance: uDoc.data().balance + cDoc.data().amount });
            t.update(codeRef, { status: 'used', redeemedBy: currentUserData.displayName, redeemedAt: serverTimestamp() });

            t.set(doc(collection(db, `artifacts/${appId}/transactions`)), {
                type: 'deposit', userId: currentUser.uid, amount: cDoc.data().amount,
                content: `Nạp mã ${code}`, timestamp: serverTimestamp()
            });
        });
        showToast("Nạp thành công!");
    } catch (e) { showToast(e.message || e, true); } finally { hideLoading(); }
});

$('#confirm-withdraw-btn').addEventListener('click', async () => {
    const amount = getMoneyValue('#withdraw-amount');
    const reason = $('#withdraw-reason').value;
    $('#withdraw-modal').classList.add('hidden');
    const pin = await requestPin();
    if (!pin || (await hashPin(pin)) !== currentUserData.pinHash) return showToast("Sai PIN", true);

    showLoading();
    try {
        if (amount > currentUserData.balance) throw "Số dư không đủ";
        await addDoc(collection(db, `artifacts/${appId}/withdrawalRequests`), {
            userId: currentUser.uid, userDisplayName: currentUserData.displayName,
            userAccountNumber: currentUserData.accountNumber, amount, reason,
            status: 'pending', createdAt: serverTimestamp()
        });
        showToast("Đã gửi yêu cầu");
        $('#withdraw-amount').value = '';
    } catch (e) { showToast(e.message || e, true); } finally { hideLoading(); }
});

// --- 11. DATA LOADING ---
function loadUserData(uid) {
    onSnapshot(query(collection(db, `artifacts/${appId}/transactions`), orderBy('timestamp', 'desc')), snap => {
        const txs = snap.docs.map(d => d.data()).filter(d => d.userId === uid || d.fromUserId === uid || d.toUserId === uid);
        renderTransactions(txs);
    });
    onSnapshot(query(collection(db, `artifacts/${appId}/gifts`), orderBy('createdAt', 'desc')), snap => {
        $('#gifts-list').innerHTML = snap.docs.map(d => {
            const g = d.data();
            const soldOut = g.quantity <= 0;
            return `<div class="bg-surface-secondary rounded-xl p-3 flex flex-col">
                <img src="${g.imageUrl}" class="w-full h-24 object-contain bg-white rounded-lg mb-2">
                <p class="font-bold text-sm text-p truncate">${g.name}</p>
                <p class="text-xs text-s mb-2">Còn: ${g.quantity}</p>
                <button onclick="redeemGift('${d.id}', ${g.price})" class="w-full py-2 rounded-lg text-xs font-bold ${soldOut ? 'bg-gray-300' : 'btn-primary'}" ${soldOut ? 'disabled' : ''}>${soldOut ? 'Hết' : 'Đổi ' + formatCurrency(g.price)}</button>
            </div>`;
        }).join('');
    });
    onSnapshot(query(collection(db, `artifacts/${appId}/missions`)), snap => {
        $('#missions-list').innerHTML = snap.docs.map(d => {
            const m = d.data();
            const myPart = m.participants?.find(p => p.uid === uid);
            let btn = `<button onclick="acceptMission('${d.id}')" class="btn-primary px-3 py-1 rounded text-xs">Nhận</button>`;
            let status = '';
            const isExpired = m.deadline && new Date(m.deadline) < new Date();
            if (myPart) {
                if (myPart.status === 'pending') btn = `<button onclick="submitMission('${d.id}')" class="bg-green-600 text-white px-3 py-1 rounded text-xs">Nộp</button>`;
                else if (myPart.status === 'completed') { btn = ''; status = '<span class="text-orange-500 text-xs">Chờ duyệt</span>'; }
                else if (myPart.status === 'approved') {
                    const last = myPart.lastCompleted?.toDate();
                    const now = new Date();
                    let canRedo = false;
                    if (m.repeat === 'daily' && (!last || last.getDate() !== now.getDate())) canRedo = true;
                    if (canRedo && !isExpired) btn = `<button onclick="acceptMission('${d.id}')" class="btn-primary px-3 py-1 rounded text-xs">Làm lại</button>`;
                    else { btn = ''; status = '<span class="text-green-500 text-xs">Hoàn thành</span>'; }
                }
            }
            if (isExpired) { btn = ''; status = '<span class="text-red-500 text-xs">Hết hạn</span>'; }
            return `<div class="bg-surface-secondary p-4 rounded-xl flex justify-between items-center mb-2">
                <div><p class="font-bold text-p text-sm">${m.name}</p><p class="text-xs text-accent font-bold">+${formatCurrency(m.reward)}</p>${status ? `<div>${status}</div>` : ''}</div>
                <div>${btn}</div>
            </div>`;
        }).join('') || '<p class="text-center text-s">Chưa có nhiệm vụ</p>';
    });
    loadHistoryData(uid);
}


//renderTransactions
function renderTransactions(txs) {
    // 1. Tạo mảng các chuỗi HTML (chưa join vội)
    const htmlArray = txs.map(tx => {
        // Xác định loại giao dịch đối với người đang xem
        const isDeposit = tx.type === 'deposit';
        const isWithdraw = tx.type === 'withdraw';
        // Logic xác định income: Nạp tiền HOẶC nhận tiền chuyển khoản
        const isIncome = isDeposit || (tx.type === 'transfer' && tx.toUserId === currentUser.uid);

        let icon = 'fa-exchange-alt';
        let colorClass = isIncome ? 'text-green-600' : 'text-red-500';
        let sign = isIncome ? '+' : '-';
        let title = '';
        let subTitle = '';

        if (isDeposit) {
            icon = 'fa-arrow-down';
            title = 'Nạp tiền';
            subTitle = tx.content;
        } else if (isWithdraw) {
            icon = 'fa-arrow-up';
            title = 'Rút tiền';
            subTitle = tx.content;
        } else {
            // Chuyển tiền
            if (isIncome) {
                icon = 'fa-hand-holding-usd';
                title = `Nhận từ: ${tx.fromUserName || 'Ẩn danh'}`;
            } else {
                icon = 'fa-paper-plane';
                title = `Gửi đến: ${tx.toUserName || 'Ẩn danh'}`;
            }
            subTitle = tx.content || 'Chuyển tiền';
        }

        return `
        <div class="flex justify-between items-center p-3 bg-surface-secondary rounded-lg mb-2 border border-theme hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-surface flex items-center justify-center border border-theme text-s shadow-sm">
                    <i class="fas ${icon} ${colorClass}"></i>
                </div>
                <div>
                    <p class="text-sm font-bold text-p">${title}</p>
                    <p class="text-xs text-s line-clamp-1">${subTitle}</p>
                    <p class="text-[10px] text-s mt-0.5">${formatDate(tx.timestamp)}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="text-sm font-bold ${colorClass}">${sign}${formatCurrency(tx.amount)}</p>
            </div>
        </div>`;
    });

    // 2. SỬA LỖI: Cắt mảng htmlArray lấy 5 phần tử đầu rồi mới join lại
    const recentHtml = htmlArray.slice(0, 5).join('');
    const fullHtml = htmlArray.join('');

    // Gán vào DOM
    $('#recent-transaction-history').innerHTML = recentHtml || '<p class="text-center text-s py-4 text-xs">Chưa có giao dịch</p>';
    $('#history-content-transactions').innerHTML = fullHtml || '<p class="text-center text-s py-4">Chưa có giao dịch nào</p>';
}


function loadHistoryData(uid) {
    onSnapshot(query(collection(db, `artifacts/${appId}/users/${uid}/giftHistory`), orderBy('redeemedAt', 'desc')), s => {
        $('#history-content-gifts').innerHTML = s.docs.map(d => `<div class="p-3 bg-surface-secondary rounded-lg mb-2 text-sm flex justify-between"><span>${d.data().giftName}</span><span class="${d.data().status === 'approved' ? 'text-green-500' : 'text-red-500'}">${d.data().status}</span></div>`).join('') || '<p class="text-center text-s">Trống</p>';
    });
    onSnapshot(query(collection(db, `artifacts/${appId}/users/${uid}/missionHistory`), orderBy('completedAt', 'desc')), s => {
        $('#history-content-missions').innerHTML = s.docs.map(d => `<div class="p-3 bg-surface-secondary rounded-lg mb-2 text-sm flex justify-between"><span>${d.data().missionName}</span><span class="text-green-500">+${formatCurrency(d.data().reward)}</span></div>`).join('') || '<p class="text-center text-s">Trống</p>';
    });
    onSnapshot(query(collection(db, `artifacts/${appId}/giftRequests`), where('userId', '==', uid), orderBy('createdAt', 'desc')), s => {
        $('#history-content-gift-approvals').innerHTML = s.docs.map(d => `<div class="p-3 bg-surface-secondary rounded-lg mb-2 text-sm flex justify-between"><span>${d.data().giftName}</span><span class="text-accent">${d.data().status}</span></div>`).join('') || '<p class="text-center text-s">Trống</p>';
    });
}

window.redeemGift = async (id, price) => {
    if (currentUserData.balance < price) return showToast("Không đủ tiền", true);
    if (!await requestPin()) return;
    showLoading();
    try {
        await addDoc(collection(db, `artifacts/${appId}/giftRequests`), {
            userId: currentUser.uid, userDisplayName: currentUserData.displayName,
            giftId: id, price, status: 'pending', createdAt: serverTimestamp()
        });
        showToast("Đã gửi yêu cầu đổi quà");
    } catch (e) { showToast(e.message, true); } finally { hideLoading(); }
};

window.acceptMission = async (id) => {
    showLoading();
    try {
        await runTransaction(db, async (t) => {
            const r = doc(db, `artifacts/${appId}/missions`, id);
            const d = (await t.get(r)).data();
            let p = d.participants || [];
            p = p.filter(x => x.uid !== currentUser.uid);
            p.push({ uid: currentUser.uid, name: currentUserData.displayName, status: 'pending' });
            t.update(r, { participants: p });
        });
        showToast("Đã nhận nhiệm vụ");
    } catch (e) { showToast(e.message, true); } finally { hideLoading(); }
};

window.submitMission = async (id) => {
    showLoading();
    try {
        await runTransaction(db, async (t) => {
            const r = doc(db, `artifacts/${appId}/missions`, id);
            const d = (await t.get(r)).data();
            let p = d.participants;
            const idx = p.findIndex(x => x.uid === currentUser.uid);
            p[idx].status = 'completed';
            t.update(r, { participants: p });
        });
        showToast("Đã nộp, chờ duyệt");
    } catch (e) { showToast(e.message, true); } finally { hideLoading(); }
};

// --- 12. ADMIN LOGIC ---
function initAdminListeners() {
    onSnapshot(query(collection(db, `artifacts/${appId}/withdrawalRequests`), orderBy('createdAt', 'desc')), s => {
        const pending = s.docs.filter(d => d.data().status === 'pending');
        $('#admin-pending-withdrawals').textContent = pending.length;
        $('#withdrawal-requests').innerHTML = pending.map(d => {
            const r = d.data();
            return `<div class="admin-card border-l-4 border-l-blue-500">
                <div class="flex justify-between items-start mb-2"><div><p class="font-bold text-p text-lg">${r.userDisplayName}</p><p class="text-xs text-s font-mono">STK: ${r.userAccountNumber}</p></div><span class="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">Rút tiền</span></div>
                <div class="py-2"><p class="text-2xl font-bold text-p tracking-tight">${formatCurrency(r.amount)}</p><p class="text-sm text-s italic mt-1">"${r.reason}"</p></div>
                <div class="grid grid-cols-2 gap-3 mt-3"><button onclick="adminReviewWithdrawal('${d.id}', '${r.userId}', ${r.amount})" class="btn-primary py-2 rounded-lg font-bold text-sm">Xử lý ngay</button><button class="bg-surface text-s border border-theme py-2 rounded-lg text-sm font-bold opacity-60">Bỏ qua</button></div>
            </div>`;
        }).join('') || '<div class="text-center p-8 text-s opacity-50">Sạch sẽ</div>';
    });

    onSnapshot(query(collection(db, `artifacts/${appId}/giftRequests`), orderBy('createdAt', 'desc')), s => {
        const pending = s.docs.filter(d => d.data().status === 'pending');
        $('#admin-pending-gifts').textContent = pending.length;
        $('#gift-requests-list').innerHTML = pending.map(d => {
            const r = d.data();
            // Protective check: Ensure all fields exist
            const uId = r.userId || '';
            const gId = r.giftId || '';
            const pr = r.price || 0;
            return `<div class="admin-card border-l-4 border-l-purple-500 flex gap-3 items-center">
                <div class="flex-grow"><p class="text-xs text-s mb-1">Yêu cầu từ <strong>${r.userDisplayName}</strong></p><p class="font-bold text-p text-lg">${r.giftName}</p><p class="text-accent font-bold">${formatCurrency(pr)}</p></div>
                <button onclick="adminApproveGift('${d.id}', '${uId}', '${gId}', ${pr})" class="bg-green-100 text-green-700 w-12 h-12 rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition"><i class="fas fa-check text-xl"></i></button>
            </div>`;
        }).join('') || '<p class="text-s text-center py-4">Sạch sẽ</p>';
    });

    onSnapshot(query(collection(db, `artifacts/${appId}/missions`)), s => {
        let count = 0; let html = '';
        s.docs.forEach(d => {
            const m = d.data();
            const subs = m.participants.filter(p => p.status === 'completed');
            count += subs.length;
            if (subs.length > 0) {
                html += `<div class="admin-card border-l-4 border-l-orange-500"><p class="font-bold text-sm mb-2 text-p">${m.name}</p>`;
                html += subs.map(p => `<div class="flex justify-between items-center mt-2 text-sm border-t border-theme pt-2"><span>${p.name}</span><div class="flex gap-2">
                    <button onclick="adminMissionAction('${d.id}', '${p.uid}', 'approve', ${m.reward})" class="text-green-600 bg-green-100 px-2 py-1 rounded">✔</button>
                    <button onclick="adminMissionAction('${d.id}', '${p.uid}', 'reject', 0)" class="text-red-600 bg-red-100 px-2 py-1 rounded">✘</button>
                </div></div>`).join('');
                html += `</div>`;
            }
        });
        $('#admin-pending-missions').textContent = count;
        $('#admin-missions-list').innerHTML = html || '<p class="text-s text-center">Không có bài nộp</p>';
    });

    onSnapshot(query(collection(db, `artifacts/${appId}/users`), orderBy('createdAt', 'desc')), s => {
        $('#admin-total-users').textContent = s.size;
        $('#admin-user-list').innerHTML = s.docs.map(d => `<div class="bg-surface-secondary p-3 rounded-lg mb-2 flex justify-between items-center border border-theme"><div><p class="font-bold text-sm text-p">${d.data().displayName}</p><p class="text-xs text-s">${d.data().username} | ${formatCurrency(d.data().balance)}</p></div><button onclick="adminEditUser('${d.id}', '${d.data().displayName}', ${d.data().balance})" class="text-accent w-8 h-8 flex items-center justify-center bg-surface rounded-full"><i class="fas fa-pen"></i></button></div>`).join('');
    });

    onSnapshot(query(collection(db, `artifacts/${appId}/depositCodes`), orderBy('createdAt', 'desc')), s => {
        $('#deposit-codes-list').innerHTML = s.docs.filter(d => d.data().status === 'available').map(d => `<div class="flex justify-between bg-surface-secondary p-3 rounded-lg mb-2 text-sm border border-theme"><span>${d.id}</span><span class="font-bold text-accent">${formatCurrency(d.data().amount)}</span><i onclick="deleteDocItem('depositCodes','${d.id}')" class="fas fa-trash text-red-500 cursor-pointer"></i></div>`).join('');
        $('#used-deposit-codes-list').innerHTML = s.docs.filter(d => d.data().status !== 'available').map(d => `<div class="flex justify-between bg-surface-secondary p-2 rounded mb-2 text-xs opacity-60"><span>${d.id}</span><span>${d.data().redeemedBy}</span></div>`).join('');
    });

    onSnapshot(query(collection(db, `artifacts/${appId}/gifts`), orderBy('createdAt', 'desc')), s => {
        $('#admin-gifts-list').innerHTML = s.docs.map(d => `<div class="flex justify-between bg-surface-secondary p-3 rounded-lg mb-2 items-center border border-theme"><div class="text-sm font-bold text-p">${d.data().name} <span class="text-xs font-normal text-s">(${d.data().quantity})</span></div><i onclick="deleteDocItem('gifts','${d.id}')" class="fas fa-trash text-red-500 cursor-pointer"></i></div>`).join('');
    });
}

// ADMIN ACTIONS
window.adminMissionAction = async (mid, uid, action, reward) => {
    showLoading();
    try {
        await runTransaction(db, async t => {
            const mRef = doc(db, `artifacts/${appId}/missions`, mid);
            const uRef = doc(db, `artifacts/${appId}/users`, uid);

            // --- 1. ĐỌC HẾT TRƯỚC ---
            const mDoc = await t.get(mRef);
            let uDoc = null;
            // Nếu duyệt thì cần đọc user để cộng tiền
            if (action === 'approve') {
                uDoc = await t.get(uRef);
            }

            if (!mDoc.exists()) throw "Nhiệm vụ lỗi";

            // --- 2. XỬ LÝ LOGIC ---
            const mData = mDoc.data();
            let p = mData.participants;
            const idx = p.findIndex(x => x.uid === uid);
            if (idx === -1) return; // Không tìm thấy người tham gia

            p[idx].status = action === 'approve' ? 'approved' : 'rejected';
            p[idx].lastCompleted = new Date();

            // --- 3. GHI HẾT SAU ---
            t.update(mRef, { participants: p });

            if (action === 'approve') {
                if (!uDoc || !uDoc.exists()) throw "User không tồn tại";

                // Cộng tiền
                t.update(uRef, { balance: uDoc.data().balance + reward });

                // Ghi lịch sử nhiệm vụ
                const hRef = doc(collection(db, `artifacts/${appId}/users/${uid}/missionHistory`));
                t.set(hRef, {
                    missionName: mData.name,
                    reward,
                    status: 'approved',
                    completedAt: serverTimestamp()
                });
            }
        });
        showToast("Xong");
    } catch (e) {
        console.error(e);
        showToast("Lỗi: " + e.message, true);
    } finally {
        hideLoading();
    }
};


window.adminReviewWithdrawal = (id, uid, amount) => {
    $('#review-withdrawal-modal').classList.remove('hidden');
    $('#review-approval-amount').value = amount;
    const okBtn = $('#confirm-approve-btn'), noBtn = $('#confirm-reject-btn');
    const newOk = okBtn.cloneNode(true), newNo = noBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(newOk, okBtn); noBtn.parentNode.replaceChild(newNo, noBtn);

    newOk.addEventListener('click', async () => {
        const finalAmt = getMoneyValue('#review-approval-amount');
        if (!id || !uid) return showToast("Lỗi ID", true);
        showLoading();
        try {
            await runTransaction(db, async t => {
                const uRef = doc(db, `artifacts/${appId}/users`, uid);
                const rRef = doc(db, `artifacts/${appId}/withdrawalRequests`, id);
                const uDoc = await t.get(uRef);
                if (uDoc.data().balance < finalAmt) throw "Không đủ tiền";
                t.update(uRef, { balance: uDoc.data().balance - finalAmt });
                t.update(rRef, { status: 'approved', approvedAmount: finalAmt });
                t.set(doc(collection(db, `artifacts/${appId}/transactions`)), { type: 'withdraw', userId: uid, amount: finalAmt, content: "Rút tiền thành công", timestamp: serverTimestamp() });
            });
            $('#review-withdrawal-modal').classList.add('hidden'); showToast("Đã duyệt");
        } catch (e) { showToast(e.message || e, true); } finally { hideLoading(); }
    });

    newNo.addEventListener('click', async () => {
        await updateDoc(doc(db, `artifacts/${appId}/withdrawalRequests`, id), { status: 'rejected' });
        $('#review-withdrawal-modal').classList.add('hidden'); showToast("Đã từ chối");
    });
};

window.adminApproveGift = async (reqId, uid, giftId, price) => {
    if (!confirm("Duyệt đổi quà?")) return;
    if (!reqId || !uid || !giftId) return showToast("Dữ liệu lỗi (ID)", true);
    showLoading();
    try {
        await runTransaction(db, async t => {
            const uRef = doc(db, `artifacts/${appId}/users`, uid);
            const gRef = doc(db, `artifacts/${appId}/gifts`, giftId);
            const rRef = doc(db, `artifacts/${appId}/giftRequests`, reqId);

            const uDoc = await t.get(uRef);
            const gDoc = await t.get(gRef);

            if (gDoc.data().quantity < 1) throw "Hết quà";
            if (uDoc.data().balance < price) throw "User thiếu tiền";

            t.update(uRef, { balance: uDoc.data().balance - price });
            t.update(gRef, { quantity: gDoc.data().quantity - 1 });
            t.update(rRef, { status: 'approved' });
            t.set(doc(collection(db, `artifacts/${appId}/users/${uid}/giftHistory`)), {
                giftName: gDoc.data().name, price, status: 'approved', redeemedAt: serverTimestamp()
            });
        });
        showToast("Đã duyệt");
    } catch (e) { showToast(e.message || e, true); } finally { hideLoading(); }
};

window.deleteDocItem = async (col, id) => {
    if (confirm(translations[currentLang].confirmDelete)) await deleteDoc(doc(db, `artifacts/${appId}/${col}`, id));
};

window.adminEditUser = async (uid, name, balance) => {
    const newName = prompt("Tên mới:", name);
    const newBal = prompt("Số dư mới:", balance);
    if (newName && newBal) {
        await updateDoc(doc(db, `artifacts/${appId}/users`, uid), { displayName: newName, balance: parseInt(newBal) });
        showToast("Đã cập nhật");
    }
};
const copyBox = document.querySelector('#copy-account-box');
if (copyBox) {
    copyBox.addEventListener('click', () => {
        const accNum = document.querySelector('#user-account-number').textContent;
        if (accNum && accNum !== '...') {
            navigator.clipboard.writeText(accNum).then(() => {
                // Hiệu ứng visual khi click
                copyBox.classList.add('bg-white/30');
                setTimeout(() => copyBox.classList.remove('bg-white/30'), 200);

                // Gọi hàm showToast có sẵn của bạn
                showToast("Đã sao chép số tài khoản!");
            }).catch(err => {
                console.error('Không thể copy: ', err);
            });
        }
    });
}
// --- LOGIC CHỌN MÀU & EMOJI ---

// 1. Hàm chọn màu (Gắn vào window để gọi từ HTML)
window.selectColor = (color) => {
    const preview = document.querySelector('#settings-avatar-preview');
    if (preview) {
        // Cập nhật màu nền ngay lập tức cho người dùng thấy
        preview.style.backgroundColor = color;
        // Lưu tạm màu vào thuộc tính data để nút Lưu lấy ra dễ dàng
        preview.dataset.selectedColor = color;
    }
};

// 2. Hàm chọn Emoji
window.selectEmoji = (emoji) => {
    const preview = document.querySelector('#settings-avatar-preview');
    if (preview) preview.textContent = emoji;
    
    const input = document.querySelector('#custom-emoji-input');
    if (input) input.value = emoji;
};

// 3. Xử lý Input Emoji tùy chỉnh
const customEmojiInput = document.querySelector('#custom-emoji-input');
if (customEmojiInput) {
    customEmojiInput.addEventListener('input', (e) => {
        const preview = document.querySelector('#settings-avatar-preview');
        if (preview && e.target.value) preview.textContent = e.target.value;
    });
}

// --- LOGIC NÚT LƯU (SỬA LẠI) ---
const saveBtn = document.querySelector('#update-name-btn');
if (saveBtn) {
    // Xóa sự kiện cũ (bằng cách clone nút) để tránh bị trùng lặp lệnh gọi
    const newSaveBtn = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

    newSaveBtn.addEventListener('click', async () => {
        const newName = document.querySelector('#update-name-input').value.trim();
        const previewEl = document.querySelector('#settings-avatar-preview');
        
        // QUAN TRỌNG: Lấy màu trực tiếp từ cái hình preview đang hiển thị
        // Nếu preview có màu inline style -> lấy nó. Nếu không -> lấy màu cũ từ data -> mặc định
        let colorToSave = previewEl.style.backgroundColor;
        
        // Fix lỗi: Đôi khi style.backgroundColor trả về rỗng nếu chưa click
        if (!colorToSave && currentUserData) {
            colorToSave = currentUserData.avatarColor || '#6B7280';
        }
        
        const newAvatar = previewEl.textContent.trim();

        if (!newName) return showToast("Tên không được để trống", true);

        showLoading();
        try {
            await updateDoc(doc(db, `artifacts/${appId}/users`, currentUser.uid), {
                displayName: newName,
                avatarEmoji: newAvatar,
                avatarColor: colorToSave // Lưu màu chính xác
            });
            showToast("Đã cập nhật hồ sơ!");
        } catch (e) {
            console.error(e);
            showToast("Lỗi cập nhật: " + e.message, true);
        } finally {
            hideLoading();
        }
    });
}
// Admin Creates
$('#create-deposit-code-btn')?.addEventListener('click', async () => {
    const c = $('#admin-deposit-code').value.toUpperCase(), a = getMoneyValue('#admin-deposit-amount');
    if (c && a) { await setDoc(doc(db, `artifacts/${appId}/depositCodes`, c), { amount: a, status: 'available', createdAt: serverTimestamp() }); $('#create-code-modal').classList.add('hidden'); }
});
$('#create-gift-btn')?.addEventListener('click', async () => {
    const n = $('#admin-gift-name').value, p = getMoneyValue('#admin-gift-price'), i = $('#admin-gift-image').value, q = parseInt($('#admin-gift-quantity').value);
    if (n && p) { await addDoc(collection(db, `artifacts/${appId}/gifts`), { name: n, price: p, imageUrl: i, quantity: q, createdAt: serverTimestamp() }); $('#create-gift-modal').classList.add('hidden'); }
});
$('#create-mission-btn')?.addEventListener('click', async () => {
    const n = $('#admin-mission-name').value, r = getMoneyValue('#admin-mission-reward'), lim = parseInt($('#admin-mission-limit').value);
    if (n && r) {
        await addDoc(collection(db, `artifacts/${appId}/missions`), {
            name: n, reward: r, limit: lim, repeat: $('#admin-mission-repeat').value,
            description: $('#admin-mission-description').value, deadline: $('#admin-mission-deadline').value || null, participants: [], createdAt: serverTimestamp()
        });
        $('#create-mission-modal').classList.add('hidden');
    }
});

// Admin Tab Switching
$$('.admin-tab-btn').forEach(btn => btn.addEventListener('click', () => {
    $$('.admin-tab-btn').forEach(b => b.classList.remove('active', 'bg-surface-secondary', 'text-p'));
    btn.classList.add('active', 'bg-surface-secondary', 'text-p');
    $$('.admin-tab-pane').forEach(p => p.classList.add('hidden'));
    $(`#admin-tab-${btn.dataset.adminTab}`).classList.remove('hidden');
}));

// History Tab Switching
$$('.history-sub-tab-btn').forEach(btn => btn.addEventListener('click', () => {
    $$('.history-sub-tab-btn').forEach(b => b.classList.remove('active', 'bg-surface', 'shadow-sm', 'text-p'));
    btn.classList.add('active', 'bg-surface', 'shadow-sm', 'text-p');
    $$('.history-content').forEach(c => c.classList.add('hidden'));
    $(`#history-content-${btn.dataset.historyType}`).classList.remove('hidden');
}));

// Generic Modal Handling
$$('.action-btn').forEach(b => b.addEventListener('click', () => $(`#${b.dataset.action}-modal`).classList.remove('hidden')));
$$('.modal-close-btn').forEach(b => b.addEventListener('click', () => b.closest('.modal-overlay').classList.add('hidden')));
$$('.modal-overlay').forEach(o => o.addEventListener('click', e => { if (e.target === o) o.classList.add('hidden'); }));
$('#show-create-code-modal-btn')?.addEventListener('click', () => $('#create-code-modal').classList.remove('hidden'));
$('#show-create-gift-modal-btn')?.addEventListener('click', () => $('#create-gift-modal').classList.remove('hidden'));
$('#show-create-mission-modal-btn')?.addEventListener('click', () => $('#create-mission-modal').classList.remove('hidden'));
$('#show-change-pin-modal-btn')?.addEventListener('click', () => $('#change-pin-modal').classList.remove('hidden'));


initApp();