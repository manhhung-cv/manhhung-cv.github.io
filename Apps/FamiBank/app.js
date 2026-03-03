// app.js - FamiBank Ultimate Version (Liquidity + Quick Withdraw + Lucky Money)

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
// State cho tính năng mới
let currentBankLimit = 0; // Tổng tiền mặt Admin set
let currentTotalPending = 0; // Tổng tiền đang chờ duyệt
let luckyConfig = null; // Cấu hình tỉ lệ Lì xì

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

// THÊM DÒNG NÀY ĐỂ SỬA LỖI:
window.showToast = showToast;

// --- 4. FORMATTING CURRENCY ---
function setupCurrencyInputs() {
    $$('.currency-input').forEach(input => {
        // Xóa event listener cũ để tránh trùng lặp nếu gọi nhiều lần
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);

        newInput.addEventListener('input', (e) => {
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

    // KHỞI TẠO CÁC TÍNH NĂNG MỚI
    initBankLogic();
    initLuckySystem();
    setupQuickWithdrawButtons();
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
        const usersRef = collection(db, `artifacts/${appId}/users`);
        const qUsername = query(usersRef, where("username", "==", username));
        const qAccNum = query(usersRef, where("accountNumber", "==", accNum));
        const [userSnap, accSnap] = await Promise.all([getDocs(qUsername), getDocs(qAccNum)]);

        if (!userSnap.empty) throw "Username đã tồn tại";
        if (!accSnap.empty) throw "Số tài khoản đã tồn tại";

        const cred = await createUserWithEmailAndPassword(auth, email, password);
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
    } catch (e) {
        console.error(e);
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
    const displayColor = currentUserData.avatarColor || '#6B7280';

    // --- 2. CẬP NHẬT AVATAR NHỎ (TRANG CHỦ) ---
    const userAvatarEl = document.querySelector('#user-avatar');
    if (userAvatarEl) {
        userAvatarEl.textContent = displayAvatar;
        userAvatarEl.className = 'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border border-white text-white transition-colors';
        userAvatarEl.style.backgroundColor = displayColor;
    }

    // --- 3. CẬP NHẬT PREVIEW (TRANG CÀI ĐẶT) ---
    const settingsPreview = document.querySelector('#settings-avatar-preview');
    if (settingsPreview) {
        settingsPreview.textContent = displayAvatar;
        settingsPreview.style.backgroundColor = displayColor;
        settingsPreview.style.color = '#ffffff';
    }

    // --- 4. CÁC THÔNG TIN KHÁC ---
    if ($('#user-display-name')) $('#user-display-name').textContent = currentUserData.displayName;
    if ($('#user-account-number')) $('#user-account-number').textContent = currentUserData.accountNumber;
    if ($('#user-balance')) $('#user-balance').textContent = isBalanceVisible ? formatCurrency(currentUserData.balance) : '••••••';

    // --- [MỚI] CẬP NHẬT SỐ LƯỢT QUAY ---
    if ($('#user-spin-count')) {
        $('#user-spin-count').textContent = currentUserData.luckySpins || 0;
    }

    // Điền lại input trong cài đặt
    if ($('#update-name-input')) $('#update-name-input').value = currentUserData.displayName;
    if ($('#custom-emoji-input') && currentUserData.avatarEmoji) $('#custom-emoji-input').value = currentUserData.avatarEmoji;
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
    onSnapshot(query(collection(db, `artifacts/${appId}/users`)), (snap) => {
        const family = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.id !== currentUid);
        if (family.length === 0) {
            container.innerHTML = '<p class="text-xs text-s italic p-2">Chưa có thành viên khác</p>';
            return;
        }
        container.innerHTML = family.map(user => {
            const userAvatar = user.avatarEmoji || user.displayName.charAt(0).toUpperCase();
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
            </div>`;
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
    const recipientId = recipientInput?.value;
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
            const senderRef = doc(db, `artifacts/${appId}/users`, currentUser.uid);
            const receiverRef = doc(db, `artifacts/${appId}/users`, recipientId);
            const senderDoc = await t.get(senderRef);
            const receiverDoc = await t.get(receiverRef);
            if (!receiverDoc.exists()) throw "Người nhận không tồn tại";

            const senderData = senderDoc.data();
            const receiverData = receiverDoc.data();
            if (senderData.balance < amount) throw "Số dư không đủ";

            t.update(senderRef, { balance: senderData.balance - amount });
            t.update(receiverRef, { balance: receiverData.balance + amount });

            const txData = {
                type: 'transfer', fromUserId: currentUser.uid, fromUserName: senderData.displayName,
                toUserId: receiverDoc.id, toUserName: receiverData.displayName,
                amount: amount, content: content, timestamp: serverTimestamp()
            };
            t.set(doc(collection(db, `artifacts/${appId}/transactions`)), txData);
            showBill(txData);
        });
        showToast("Chuyển tiền thành công!");
        recipientInput.value = ''; $('#transfer-amount').value = ''; $$('.recipient-item').forEach(i => i.classList.remove('selected'));
    } catch (e) { showToast(typeof e === 'string' ? e : "Lỗi giao dịch", true); } finally { hideLoading(); }
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

// --- NẠP TIỀN (LOGIC MỚI - HỖ TRỢ LƯỢT QUAY) ---
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
            if (!cDoc.exists() || cDoc.data().status !== 'available') throw "Mã không hợp lệ hoặc đã dùng";

            const uDoc = await t.get(userRef);
            const userData = uDoc.data();
            const codeData = cDoc.data();

            // XỬ LÝ THEO LOẠI MÃ
            if (codeData.type === 'spins') {
                // Nếu là mã lượt quay
                const currentSpins = userData.luckySpins || 0;
                t.update(userRef, { luckySpins: currentSpins + parseInt(codeData.value) });

                t.set(doc(collection(db, `artifacts/${appId}/transactions`)), {
                    type: 'deposit_spin', userId: currentUser.uid, amount: 0,
                    content: `Nạp mã: +${codeData.value} lượt quay`, timestamp: serverTimestamp()
                });
            } else {
                // Mặc định là mã tiền (cũ)
                const amount = parseInt(codeData.value || codeData.amount);
                t.update(userRef, { balance: userData.balance + amount });

                t.set(doc(collection(db, `artifacts/${appId}/transactions`)), {
                    type: 'deposit', userId: currentUser.uid, amount: amount,
                    content: `Nạp tiền: ${code}`, timestamp: serverTimestamp()
                });
            }

            // Đánh dấu mã đã dùng
            t.update(codeRef, { status: 'used', redeemedBy: userData.displayName, redeemedAt: serverTimestamp() });
        });
        showToast("Nạp thành công!");
        $('#deposit-code').value = '';
    } catch (e) { showToast(e.message || e, true); } finally { hideLoading(); }
});

// --- RÚT TIỀN (LOGIC MỚI - HẠN MỨC NGÂN HÀNG) ---
$('#confirm-withdraw-btn').addEventListener('click', async () => {
    const amount = getMoneyValue('#withdraw-amount');
    const reason = $('#withdraw-reason').value;

    const bankAvailable = currentBankLimit - currentTotalPending;

    if (amount > currentUserData.balance) return showToast("Số dư tài khoản không đủ", true);

    // Kiểm tra xem rút thêm khoản này có lố hạn mức ngân hàng không
    if (amount > bankAvailable) {
        return showToast(`Ngân hàng chỉ còn có thể rút tối đa ${formatCurrency(Math.max(0, bankAvailable))}`, true);
    }

    $('#withdraw-modal').classList.add('hidden');
    const pin = await requestPin();
    if (!pin || (await hashPin(pin)) !== currentUserData.pinHash) return showToast("Sai PIN", true);

    showLoading();
    try {
        await addDoc(collection(db, `artifacts/${appId}/withdrawalRequests`), {
            userId: currentUser.uid, userDisplayName: currentUserData.displayName,
            userAccountNumber: currentUserData.accountNumber, amount, reason,
            status: 'pending', createdAt: serverTimestamp()
        });
        showToast("Đã gửi yêu cầu, vui lòng chờ duyệt");
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
                <img src="${g.imageUrl}" class="w-full h-24 object-cover bg-white rounded-lg mb-2">
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

function renderTransactions(txs) {
    const htmlArray = txs.map(tx => {
        const isDeposit = tx.type === 'deposit' || tx.type === 'deposit_spin'; // Include spin deposit
        const isWithdraw = tx.type === 'withdraw';
        const isIncome = isDeposit || (tx.type === 'transfer' && tx.toUserId === currentUser.uid) || tx.type === 'lucky_money';

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
        } else if (tx.type === 'lucky_money') {
            icon = 'fa-gift';
            title = 'Lì xì may mắn';
            subTitle = tx.content;
        } else {
            if (isIncome) {
                icon = 'fa-hand-holding-usd';
                title = `Nhận từ: ${tx.fromUserName || 'Ẩn danh'}`;
            } else {
                icon = 'fa-paper-plane';
                title = `Gửi đến: ${tx.toUserName || 'Ẩn danh'}`;
            }
            subTitle = tx.content || 'Chuyển tiền';
        }

        // Fix display amount for spin deposit (0 amount)
        let displayAmount = formatCurrency(tx.amount);
        if (tx.type === 'deposit_spin') { displayAmount = '0 ₫'; sign = ''; }

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
                <p class="text-sm font-bold ${colorClass}">${sign}${displayAmount}</p>
            </div>
        </div>`;
    });

    const recentHtml = htmlArray.slice(0, 5).join('');
    const fullHtml = htmlArray.join('');
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
    // 1. Withdrawals
    onSnapshot(query(collection(db, `artifacts/${appId}/withdrawalRequests`), orderBy('createdAt', 'desc')), s => {
        const pending = s.docs.filter(d => d.data().status === 'pending');

        // Update Dashboard Badge
        $('#dash-pending-withdraw').textContent = pending.length;
        if (pending.length > 0) $('#dash-pending-withdraw').classList.add('animate-pulse');
        else $('#dash-pending-withdraw').classList.remove('animate-pulse');

        // Render List
        $('#withdrawal-requests').innerHTML = pending.map(d => {
            const r = d.data();
            return `<div class="bg-surface p-4 rounded-xl border border-theme shadow-sm">
                <div class="flex justify-between mb-2">
                    <span class="font-bold text-p">${r.userDisplayName}</span>
                    <span class="text-xs font-mono bg-surface-secondary px-2 py-1 rounded border border-theme">${r.userAccountNumber}</span>
                </div>
                <div class="flex justify-between items-end">
                    <div>
                        <p class="text-2xl font-bold text-accent tracking-tighter">${formatCurrency(r.amount)}</p>
                        <p class="text-xs text-s italic mt-1">"${r.reason}"</p>
                    </div>
                    <button onclick="adminReviewWithdrawal('${d.id}', '${r.userId}', ${r.amount})" class="btn-primary px-4 py-2 rounded-lg text-xs font-bold shadow-md">Xử lý</button>
                </div>
            </div>`;
        }).join('') || '<div class="text-center p-8 text-s opacity-50 flex flex-col items-center"><i class="fas fa-check-circle text-4xl mb-2 text-green-100"></i><p>Đã xử lý hết</p></div>';
    });

    // 2. Gift Requests
    onSnapshot(query(collection(db, `artifacts/${appId}/giftRequests`), orderBy('createdAt', 'desc')), s => {
        const pending = s.docs.filter(d => d.data().status === 'pending');

        // Update Dashboard Badge
        $('#dash-pending-gifts').textContent = pending.length;

        // Render List
        $('#gift-requests-list').innerHTML = pending.map(d => {
            const r = d.data();
            return `<div class="bg-surface p-3 rounded-xl border border-theme shadow-sm flex items-center justify-between">
                <div>
                    <p class="text-xs text-s mb-1">Yêu cầu từ <strong>${r.userDisplayName}</strong></p>
                    <p class="font-bold text-p text-lg text-purple-600">${r.giftName}</p>
                    <p class="text-xs font-bold text-p mt-1">${formatCurrency(r.price)}</p>
                </div>
                <button onclick="adminApproveGift('${d.id}', '${r.userId}', '${r.giftId}', ${r.price})" class="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shadow hover:scale-110 transition"><i class="fas fa-check"></i></button>
            </div>`;
        }).join('') || '<p class="text-center text-s text-xs py-4">Không có yêu cầu nào</p>';
    });

    // 3. Missions (Giữ nguyên logic cũ, chỉ render lại badge)
    onSnapshot(query(collection(db, `artifacts/${appId}/missions`)), s => {
        let count = 0; let html = '';
        s.docs.forEach(d => {
            const m = d.data();
            const subs = m.participants.filter(p => p.status === 'completed');
            count += subs.length;
            if (subs.length > 0) {
                html += `<div class="bg-surface p-4 rounded-xl border border-l-4 border-l-orange-500 border-theme mb-3 shadow-sm">
                    <p class="font-bold text-sm text-p mb-2">${m.name}</p>
                    <div class="space-y-2">
                        ${subs.map(p => `<div class="flex justify-between items-center text-sm border-t border-theme pt-2">
                            <span class="font-medium">${p.name}</span>
                            <div class="flex gap-2">
                                <button onclick="adminMissionAction('${d.id}', '${p.uid}', 'approve', ${m.reward})" class="text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100 text-xs font-bold">Duyệt</button>
                                <button onclick="adminMissionAction('${d.id}', '${p.uid}', 'reject', 0)" class="text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100 text-xs font-bold">Hủy</button>
                            </div>
                        </div>`).join('')}
                    </div>
                </div>`;
            }
        });
        const dashBadge = $('#dash-pending-missions');
        if (dashBadge) {
            dashBadge.textContent = count;
            // Thêm hiệu ứng nhấp nháy nếu có bài nộp
            if (count > 0) dashBadge.classList.add('animate-pulse');
            else dashBadge.classList.remove('animate-pulse');
        }

        // Nếu bạn vẫn dùng ID cũ ở trong trang con thì giữ nguyên dòng này:
        if ($('#admin-pending-missions')) $('#admin-pending-missions').textContent = count;
    });

    // 4. USERS (NEW: Advanced List & Dashboard Stats)
    onSnapshot(query(collection(db, `artifacts/${appId}/users`), orderBy('createdAt', 'desc')), s => {
        // Update Dashboard Stats
        $('#dash-total-users').textContent = s.size;

        let totalSystemBal = 0;
        const userListHtml = s.docs.map(d => {
            const u = d.data();
            totalSystemBal += (u.balance || 0);

            const avatar = u.avatarEmoji || u.displayName.charAt(0).toUpperCase();
            const color = u.avatarColor || '#9CA3AF';

            // Thêm class 'admin-user-card' và data attributes để search
            return `
            <div class="admin-user-card bg-surface p-3 rounded-xl border border-theme flex items-center justify-between shadow-sm mb-2" 
                 data-name="${u.displayName}" data-username="${u.username}">
                <div class="flex items-center gap-3 overflow-hidden">
                    <div class="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm" style="background-color: ${color}">${avatar}</div>
                    <div class="min-w-0">
                        <p class="font-bold text-sm text-p truncate">${u.displayName}</p>
                        <div class="flex items-center gap-2 text-[10px] text-s mt-0.5">
                            <span class="bg-surface-secondary px-1.5 py-0.5 rounded border border-theme font-mono">${u.accountNumber}</span>
                            <span class="text-green-600 font-bold">${formatCurrency(u.balance)}</span>
                        </div>
                    </div>
                </div>
                <button onclick="openAdminEditUser('${d.id}')" class="w-9 h-9 flex-shrink-0 rounded-full bg-surface-secondary border border-theme text-p flex items-center justify-center hover:bg-gray-200 transition">
                    <i class="fas fa-pen text-xs"></i>
                </button>
            </div>`;
        }).join('');

        $('#admin-user-list').innerHTML = userListHtml;
        $('#dash-total-balance').textContent = formatCurrency(totalSystemBal);

        // Re-apply search if exists
        const searchTerm = $('#admin-user-search')?.value;
        if (searchTerm) $('#admin-user-search').dispatchEvent(new Event('input'));
    });

    // 5. Gifts & Codes (Load thông thường)
    onSnapshot(query(collection(db, `artifacts/${appId}/depositCodes`), orderBy('createdAt', 'desc')), s => {
        $('#deposit-codes-list').innerHTML = s.docs.filter(d => d.data().status === 'available').map(d =>
            `<div class="flex justify-between items-center bg-surface p-3 rounded-xl border border-theme shadow-sm">
                <div>
                    <span class="font-mono font-bold text-p block">${d.id}</span>
                    <span class="text-xs text-s">${d.data().type === 'spins' ? 'Lượt quay' : 'Tiền mặt'}</span>
                </div>
                <div class="flex items-center gap-3">
                    <span class="font-bold text-accent text-lg">${d.data().type === 'spins' ? '+' + d.data().value : formatCurrency(d.data().amount)}</span>
                    <button onclick="deleteDocItem('depositCodes','${d.id}')" class="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center"><i class="fas fa-trash text-xs"></i></button>
                </div>
            </div>`
        ).join('');

        $('#used-deposit-codes-list').innerHTML = s.docs.filter(d => d.data().status !== 'available').map(d =>
            `<div class="flex justify-between p-2 rounded text-xs opacity-60 border-b border-theme border-dashed">
                <span>${d.id}</span><span>${d.data().redeemedBy}</span>
            </div>`
        ).join('');
    });

    onSnapshot(query(collection(db, `artifacts/${appId}/gifts`), orderBy('createdAt', 'desc')), s => {
        $('#admin-gifts-list').innerHTML = s.docs.map(d =>
            `<div class="flex justify-between bg-surface p-3 rounded-xl items-center border border-theme shadow-sm">
                <div class="flex gap-3 items-center overflow-hidden">
                    <img src="${d.data().imageUrl}" class="w-10 h-10 rounded bg-white object-contain border border-theme flex-shrink-0">
                    <div class="min-w-0">
                        <p class="text-sm font-bold text-p truncate">${d.data().name}</p>
                        <p class="text-xs text-s">Còn: ${d.data().quantity} | <span class="text-accent font-bold">${formatCurrency(d.data().price)}</span></p>
                    </div>
                </div>
                <div class="flex gap-2 flex-shrink-0">
                    <button onclick="openAdminEditGift('${d.id}')" class="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition"><i class="fas fa-pen text-xs"></i></button>
                    <button onclick="deleteDocItem('gifts','${d.id}')" class="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition"><i class="fas fa-trash text-xs"></i></button>
                </div>
            </div>`
        ).join('');
    });

    // 3. Missions (Logic Gộp: Vừa Duyệt bài + Vừa Quản lý)
    onSnapshot(query(collection(db, `artifacts/${appId}/missions`), orderBy('createdAt', 'desc')), s => {
        let pendingCount = 0;
        let approvalHtml = '';   // HTML cho phần duyệt
        let managementHtml = ''; // HTML cho phần danh sách sửa/xóa

        s.docs.forEach(d => {
            const m = d.data();

            // --- PHẦN 1: TÌM BÀI CẦN DUYỆT ---
            const subs = (m.participants || []).filter(p => p.status === 'completed');
            pendingCount += subs.length;

            if (subs.length > 0) {
                approvalHtml += `
                 <div class="bg-orange-50 dark:bg-orange-900/10 p-3 rounded-xl border border-orange-200 dark:border-orange-900/30 mb-2 shadow-sm animate-scale-in">
                    <p class="font-bold text-sm text-p mb-2 flex items-center gap-2">
                        <i class="fas fa-bell text-orange-500"></i> ${m.name}
                    </p>
                    <div class="space-y-2">
                        ${subs.map(p => `
                        <div class="flex justify-between items-center text-sm border-t border-orange-200 dark:border-orange-900/30 pt-2">
                            <span class="font-medium text-p">${p.name}</span>
                            <div class="flex gap-2">
                                <button onclick="adminMissionAction('${d.id}', '${p.uid}', 'approve', ${m.reward})" class="text-green-600 bg-white dark:bg-surface px-2 py-1 rounded border border-green-200 text-xs font-bold shadow-sm hover:bg-green-50">Duyệt</button>
                                <button onclick="adminMissionAction('${d.id}', '${p.uid}', 'reject', 0)" class="text-red-600 bg-white dark:bg-surface px-2 py-1 rounded border border-red-200 text-xs font-bold shadow-sm hover:bg-red-50">Hủy</button>
                            </div>
                        </div>`).join('')}
                    </div>
                </div>`;
            }

            // --- PHẦN 2: DANH SÁCH QUẢN LÝ ---
            managementHtml += `
            <div class="bg-surface p-3 rounded-xl border border-theme shadow-sm mb-2 flex justify-between items-center">
                <div class="min-w-0">
                    <p class="font-bold text-sm text-p truncate">${m.name}</p>
                    <div class="flex gap-2 text-[10px] text-s mt-1">
                        <span class="text-green-600 font-bold bg-green-50 px-1 rounded border border-green-100">+${formatCurrency(m.reward)}</span>
                        <span>•</span>
                        <span>${m.repeat === 'none' ? '1 lần' : (m.repeat === 'daily' ? 'Hàng ngày' : 'Hàng tuần')}</span>
                    </div>
                </div>
                <div class="flex gap-2 flex-shrink-0">
                    <button onclick="openAdminEditMission('${d.id}')" class="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 border border-blue-100"><i class="fas fa-pen text-xs"></i></button>
                    <button onclick="deleteDocItem('missions','${d.id}')" class="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-100"><i class="fas fa-trash text-xs"></i></button>
                </div>
            </div>`;
        });

        // 1. Cập nhật giao diện Duyệt bài
        const approvalContainer = $('#admin-mission-approvals');
        const approvalSection = $('#mission-approval-section');
        if (approvalContainer && approvalSection) {
            approvalContainer.innerHTML = approvalHtml;
            // Tự động ẩn/hiện khu vực duyệt nếu có/không có bài
            if (pendingCount > 0) approvalSection.classList.remove('hidden');
            else approvalSection.classList.add('hidden');
        }

        // 2. Cập nhật giao diện Danh sách quản lý
        const listContainer = $('#admin-missions-list');
        if (listContainer) {
            listContainer.innerHTML = managementHtml || '<div class="text-center text-s text-xs py-8 border border-dashed border-theme rounded-xl">Chưa có nhiệm vụ nào</div>';
        }

        // 3. Cập nhật số lượng trên Badge (Dashboard)
        const dashBadge = $('#dash-pending-missions');
        if (dashBadge) {
            dashBadge.textContent = pendingCount;
            if (pendingCount > 0) dashBadge.classList.add('animate-pulse');
            else dashBadge.classList.remove('animate-pulse');
        }

        // (Fallback cho view cũ nếu còn)
        if ($('#admin-pending-missions')) $('#admin-pending-missions').textContent = pendingCount;
    });
}

// ADMIN ACTIONS
window.adminMissionAction = async (mid, uid, action, reward) => {
    showLoading();
    try {
        await runTransaction(db, async t => {
            const mRef = doc(db, `artifacts/${appId}/missions`, mid);
            const uRef = doc(db, `artifacts/${appId}/users`, uid);
            const mDoc = await t.get(mRef);
            let uDoc = null;
            if (action === 'approve') uDoc = await t.get(uRef);
            if (!mDoc.exists()) throw "Nhiệm vụ lỗi";
            const mData = mDoc.data();
            let p = mData.participants;
            const idx = p.findIndex(x => x.uid === uid);
            if (idx === -1) return;
            p[idx].status = action === 'approve' ? 'approved' : 'rejected';
            p[idx].lastCompleted = new Date();
            t.update(mRef, { participants: p });
            if (action === 'approve') {
                if (!uDoc || !uDoc.exists()) throw "User không tồn tại";
                t.update(uRef, { balance: uDoc.data().balance + reward });
                const hRef = doc(collection(db, `artifacts/${appId}/users/${uid}/missionHistory`));
                t.set(hRef, { missionName: mData.name, reward, status: 'approved', completedAt: serverTimestamp() });
            }
        });
        showToast("Xong");
    } catch (e) { showToast("Lỗi: " + e.message, true); } finally { hideLoading(); }
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
            t.set(doc(collection(db, `artifacts/${appId}/users/${uid}/giftHistory`)), { giftName: gDoc.data().name, price, status: 'approved', redeemedAt: serverTimestamp() });
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
                copyBox.classList.add('bg-white/30'); setTimeout(() => copyBox.classList.remove('bg-white/30'), 200);
                showToast("Đã sao chép số tài khoản!");
            }).catch(err => { console.error('Không thể copy: ', err); });
        }
    });
}
window.selectColor = (color) => {
    const preview = document.querySelector('#settings-avatar-preview');
    if (preview) { preview.style.backgroundColor = color; preview.dataset.selectedColor = color; }
};
window.selectEmoji = (emoji) => {
    const preview = document.querySelector('#settings-avatar-preview');
    if (preview) preview.textContent = emoji;
    const input = document.querySelector('#custom-emoji-input');
    if (input) input.value = emoji;
};
const customEmojiInput = document.querySelector('#custom-emoji-input');
if (customEmojiInput) {
    customEmojiInput.addEventListener('input', (e) => {
        const preview = document.querySelector('#settings-avatar-preview');
        if (preview && e.target.value) preview.textContent = e.target.value;
    });
}
const saveBtn = document.querySelector('#update-name-btn');
if (saveBtn) {
    const newSaveBtn = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
    newSaveBtn.addEventListener('click', async () => {
        const newName = document.querySelector('#update-name-input').value.trim();
        const previewEl = document.querySelector('#settings-avatar-preview');
        let colorToSave = previewEl.style.backgroundColor;
        if (!colorToSave && currentUserData) { colorToSave = currentUserData.avatarColor || '#6B7280'; }
        const newAvatar = previewEl.textContent.trim();
        if (!newName) return showToast("Tên không được để trống", true);
        showLoading();
        try {
            await updateDoc(doc(db, `artifacts/${appId}/users`, currentUser.uid), { displayName: newName, avatarEmoji: newAvatar, avatarColor: colorToSave });
            showToast("Đã cập nhật hồ sơ!");
        } catch (e) { showToast("Lỗi cập nhật: " + e.message, true); } finally { hideLoading(); }
    });
}

// Admin Creates
// XỬ LÝ NÚT TẠO CODE (CẬP NHẬT CHO SPIN)
const btnMoney = $('#btn-type-money');
const btnSpin = $('#btn-type-spin');
const inputType = $('#admin-code-type');
const inputVal = $('#admin-deposit-value');

if (btnMoney && btnSpin) {
    btnMoney.addEventListener('click', () => {
        inputType.value = 'money';
        btnMoney.classList.add('bg-white', 'shadow-sm', 'text-p'); btnMoney.classList.remove('text-s');
        btnSpin.classList.remove('bg-white', 'shadow-sm', 'text-p'); btnSpin.classList.add('text-s');
        inputVal.placeholder = "Số tiền (VNĐ)";
    });
    btnSpin.addEventListener('click', () => {
        inputType.value = 'spins';
        btnSpin.classList.add('bg-white', 'shadow-sm', 'text-p'); btnSpin.classList.remove('text-s');
        btnMoney.classList.remove('bg-white', 'shadow-sm', 'text-p'); btnMoney.classList.add('text-s');
        inputVal.placeholder = "Số lượt quay";
    });
}

$('#create-deposit-code-btn')?.addEventListener('click', async () => {
    const code = $('#admin-deposit-code').value.toUpperCase().trim();
    const type = $('#admin-code-type').value;
    const rawVal = $('#admin-deposit-value').value.replace(/\D/g, '');
    const value = parseInt(rawVal);

    if (code && value > 0) {
        showLoading();
        try {
            await setDoc(doc(db, `artifacts/${appId}/depositCodes`, code), {
                type: type, // 'money' hoặc 'spins'
                value: value,
                amount: type === 'money' ? value : 0, // Backward compatibility
                status: 'available',
                createdAt: serverTimestamp()
            });
            showToast(`Đã tạo mã ${type === 'money' ? 'tiền' : 'lượt'} thành công`);
            $('#create-code-modal').classList.add('hidden');
            $('#admin-deposit-code').value = ''; $('#admin-deposit-value').value = '';
        } catch (e) { showToast("Lỗi: " + e.message, true); } finally { hideLoading(); }
    } else { showToast("Nhập đủ thông tin", true); }
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

// --- LOGIC HẠN MỨC NGÂN HÀNG ---
function initBankLogic() {
    onSnapshot(doc(db, `artifacts/${appId}/config`, 'bankInfo'), (snap) => {
        currentBankLimit = snap.exists() ? (snap.data().limit || 0) : 0;
        updateBankUI();
    });
    const q = query(collection(db, `artifacts/${appId}/withdrawalRequests`), where('status', '==', 'pending'));
    onSnapshot(q, (snap) => {
        let total = 0;
        snap.docs.forEach(doc => { total += (doc.data().amount || 0); });
        currentTotalPending = total;
        updateBankUI();
    });
}

function updateBankUI() {
    const available = currentBankLimit - currentTotalPending;
    if ($('#stat-bank-limit')) $('#stat-bank-limit').textContent = formatCurrency(currentBankLimit);
    if ($('#stat-total-pending')) $('#stat-total-pending').textContent = formatCurrency(currentTotalPending);
    const adminAvailEl = $('#stat-bank-available');
    if (adminAvailEl) {
        adminAvailEl.textContent = formatCurrency(available);
        if (available < 0) { adminAvailEl.classList.remove('text-green-600'); adminAvailEl.classList.add('text-red-500'); }
        else { adminAvailEl.classList.remove('text-red-500'); adminAvailEl.classList.add('text-green-600'); }
    }
    const userAvailEl = $('#user-view-bank-available');
    if (userAvailEl) {
        userAvailEl.textContent = available > 0 ? formatCurrency(available) : '0 ₫ (Hết hạn mức)';
        userAvailEl.className = available > 0 ? 'font-bold text-green-600' : 'font-bold text-red-500';
    }
}

const saveLimitBtn = $('#admin-save-limit-btn');
if (saveLimitBtn) {
    saveLimitBtn.addEventListener('click', async () => {
        if (currentUserData.email !== ADMIN_EMAIL) return showToast("Không đủ quyền", true);
        const val = getMoneyValue('#admin-set-limit-input');
        showLoading();
        try {
            await setDoc(doc(db, `artifacts/${appId}/config`, 'bankInfo'), { limit: val, updatedAt: serverTimestamp() }, { merge: true });
            showToast("Đã cập nhật hạn mức!"); $('#admin-set-limit-input').value = '';
        } catch (e) { showToast("Lỗi: " + e.message, true); } finally { hideLoading(); }
    });
}

// --- LOGIC LÌ XÌ & LUCKY MONEY ---
function initLuckySystem() {
    const grid = $('#lucky-grid');
    if (grid) {
        grid.innerHTML = Array(9).fill(0).map((_, i) => `
            <div class="envelope-card" onclick="openEnvelope(this, ${i})">
                <div class="decoration">🧧</div>
                <div class="text-xs font-bold text-white mt-2 opacity-80">Mở</div>
            </div>`).join('');
    }
    onSnapshot(doc(db, `artifacts/${appId}/config`, 'luckyConfig'), (snap) => {
        if (snap.exists()) { luckyConfig = snap.data(); }
        else { luckyConfig = { prizes: [{ amount: 1000, rate: 50 }, { amount: 5000, rate: 30 }, { amount: 10000, rate: 15 }, { amount: 50000, rate: 4 }, { amount: 100000, rate: 1 }] }; }
        renderAdminLuckyConfig();
    });
    if (currentUser) {
        onSnapshot(doc(db, `artifacts/${appId}/users`, currentUser.uid), (snap) => {
            const data = snap.data();
            if ($('#user-spin-count')) $('#user-spin-count').textContent = data.luckySpins || 0;
        });
    }
}

// --- LOGIC MỞ LÌ XÌ VỚI MODAL ---

// Biến tạm để lưu bao lì xì đang được chọn
let pendingEnvelopeEl = null;
let pendingEnvelopeIndex = -1;

// 1. Hàm click vào bao lì xì (Chỉ hiện Modal)
window.openEnvelope = (el, index) => {
    // Nếu bao đã mở rồi thì thôi
    if (el.classList.contains('opened')) return;

    // Check nhanh số lượt (Client side)
    const currentSpins = parseInt($('#user-spin-count').textContent || '0');
    if (currentSpins <= 0) return showToast("Bạn hết lượt mở lì xì rồi!", true);

    // Lưu lại cái bao đang chọn vào biến tạm
    pendingEnvelopeEl = el;
    pendingEnvelopeIndex = index;

    // Hiện Modal xác nhận
    $('#confirm-spin-modal').classList.remove('hidden');
};

// 2. Sự kiện nút "Mở ngay" trong Modal
// --- SỰ KIỆN MỞ LÌ XÌ (ĐÃ NÂNG CẤP VISUAL & LOGIC KHO) ---
$('#do-spin-btn').addEventListener('click', async () => {
    // 1. Ẩn modal xác nhận
    $('#confirm-spin-modal').classList.add('hidden');
    if (!pendingEnvelopeEl) return;

    const el = pendingEnvelopeEl;

    // 2. HIỆU ỨNG RUNG LẮC (Visual Feedback)
    el.classList.add('envelope-shaking'); // Thêm class rung

    // Chờ 1 chút cho cảm giác "đang quay"
    // Dùng Promise để giả lập độ trễ mạng nếu mạng quá nhanh, tạo cảm giác hồi hộp
    await new Promise(r => setTimeout(r, 800));

    try {
        let wonAmount = 0;

        // 3. THỰC HIỆN TRANSACTION (Logic lõi)
        await runTransaction(db, async (t) => {
            // Đọc đồng thời: User, Config (để check kho)
            const userRef = doc(db, `artifacts/${appId}/users`, currentUser.uid);
            const configRef = doc(db, `artifacts/${appId}/config`, 'luckyConfig');

            const [userDoc, configDoc] = await Promise.all([t.get(userRef), t.get(configRef)]);

            const userData = userDoc.data();
            const configData = configDoc.data();
            let prizes = configData.prizes || [];

            // Check lượt
            if ((userData.luckySpins || 0) <= 0) throw "Hết lượt quay!";

            // --- THUẬT TOÁN RANDOM CÓ CHECK KHO (FALLBACK) ---
            // Tính tổng tỷ lệ
            const totalRate = prizes.reduce((sum, p) => sum + (parseInt(p.rate) || 0), 0);
            let random = Math.floor(Math.random() * totalRate);

            let selectedIndex = -1;

            // B1: Chọn giải theo tỷ lệ (như cũ)
            for (let i = 0; i < prizes.length; i++) {
                if (random < parseInt(prizes[i].rate)) {
                    selectedIndex = i;
                    break;
                }
                random -= parseInt(prizes[i].rate);
            }

            // Nếu tính toán lỗi, lấy giải cuối (thường là giải nhỏ nhất)
            if (selectedIndex === -1) selectedIndex = prizes.length - 1;

            // B2: KIỂM TRA KHO & FALLBACK (MỚI)
            // Nếu giải đã chọn hết hàng (qty <= 0), tìm giải tiếp theo có hàng
            // Do Admin đã sort giảm dần, nên ta sẽ duyệt từ selectedIndex về phía cuối mảng (giải nhỏ hơn)
            let finalPrize = null;
            let finalIndex = -1;

            // Thử tìm từ vị trí trúng trở xuống
            for (let i = selectedIndex; i < prizes.length; i++) {
                if (prizes[i].quantity > 0) {
                    finalPrize = prizes[i];
                    finalIndex = i;
                    break;
                }
            }

            // Nếu xui quá, từ đó trở xuống hết sạch -> Tìm từ đầu mảng trở xuống (Cố vớt vát giải to hơn còn lại - Hiếm)
            if (!finalPrize) {
                for (let i = 0; i < prizes.length; i++) {
                    if (prizes[i].quantity > 0) {
                        finalPrize = prizes[i];
                        finalIndex = i;
                        break;
                    }
                }
            }

            if (!finalPrize) throw "Kho quà tạm hết, vui lòng quay lại sau!";

            // --- CẬP NHẬT DB ---

            // 1. Trừ kho quà
            prizes[finalIndex].quantity -= 1;
            t.update(configRef, { prizes: prizes }); // Lưu lại mảng prizes mới

            // 2. Update User (Trừ lượt, Cộng tiền)
            wonAmount = parseInt(finalPrize.amount);
            const newBalance = userData.balance + wonAmount;
            t.update(userRef, {
                balance: newBalance,
                luckySpins: (userData.luckySpins || 0) - 1
            });

            // 3. Ghi log
            const txRef = doc(collection(db, `artifacts/${appId}/transactions`));
            t.set(txRef, {
                type: 'lucky_money',
                userId: currentUser.uid,
                amount: wonAmount,
                content: "Mở lì xì may mắn",
                timestamp: serverTimestamp()
            });
        });

        // 4. HIỂN THỊ KẾT QUẢ & PHÁO GIẤY
        el.classList.remove('envelope-shaking'); // Dừng rung
        el.classList.add('opened');

        // Hiệu ứng tiền bật ra (CSS Animation)
        el.innerHTML = `<div class="money-pop text-sm font-bold text-red-600 bg-yellow-300 px-2 py-1 rounded shadow-sm border border-yellow-500 z-10">
            +${formatCurrency(wonAmount)}
        </div>`;
        el.style.background = '#fbbf24'; // Đổi màu nền bao

        // Hiện thông báo to
        $('#lucky-result-area').classList.remove('hidden');
        $('#lucky-result-amount').textContent = formatCurrency(wonAmount);

        // BẮN PHÁO GIẤY (CONFETTI EFFECT)
        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#ef4444', '#fbbf24', '#ffffff'], // Đỏ, Vàng, Trắng
            disableForReducedMotion: true
        });

        showToast(`Chúc mừng! Bạn nhận được ${formatCurrency(wonAmount)}`);

    } catch (e) {
        el.classList.remove('envelope-shaking'); // Dừng rung nếu lỗi
        console.error(e);
        showToast(e.message || "Lỗi mở lì xì", true);
    } finally {
        hideLoading(); // Lưu ý: showLoading() ở đây là logic chặn click, ta dùng animation thay thế nên có thể không cần overlay spinner
        pendingEnvelopeEl = null;
        pendingEnvelopeIndex = -1;
    }
});

function renderAdminLuckyConfig() {
    const list = $('#admin-prize-list');
    if (!list || !luckyConfig || !luckyConfig.prizes) return;

    list.innerHTML = luckyConfig.prizes.map((p, index) => `
        <div class="grid grid-cols-12 gap-1 items-center prize-row" data-index="${index}">
            <div class="col-span-1 text-center text-xs font-bold text-s">${index + 1}</div>
            
            <div class="col-span-4">
                <input type="text" class="input-field p-1.5 rounded text-xs w-full currency-input font-bold text-p" 
                       value="${formatCurrency(p.amount)}" placeholder="Tiền">
            </div>
            
            <div class="col-span-3 flex items-center">
                <input type="number" class="input-field p-1.5 rounded text-xs w-full text-center" 
                       value="${p.rate}" placeholder="%">
            </div>
            
            <div class="col-span-3">
                <input type="number" class="input-field p-1.5 rounded text-xs w-full text-center font-mono text-blue-600 font-bold" 
                       value="${p.quantity !== undefined ? p.quantity : 999}" placeholder="SL">
            </div>

            <div class="col-span-1 text-center">
                <button onclick="removePrizeRow(${index})" class="text-red-500 hover:bg-red-100 w-6 h-6 rounded flex items-center justify-center transition">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `).join('');

    setupCurrencyInputs(); // Gán lại format tiền tệ
}

// 2. Hàm thêm dòng mới
$('#admin-add-prize-btn')?.addEventListener('click', () => {
    if (!luckyConfig) luckyConfig = { prizes: [] };
    // Thêm một giải mặc định
    luckyConfig.prizes.push({ amount: 1000, rate: 10, quantity: 100 });
    renderAdminLuckyConfig();
});

// 3. Hàm xóa dòng (Gắn vào window để gọi từ HTML)
window.removePrizeRow = (index) => {
    if (!confirm("Xóa giải này?")) return;
    luckyConfig.prizes.splice(index, 1);
    renderAdminLuckyConfig();
};

// 4. Sự kiện Lưu Cấu Hình (Nâng cấp để lưu Quantity)
$('#admin-save-lucky-config')?.addEventListener('click', async () => {
    const rows = document.querySelectorAll('.prize-row');
    const newPrizes = [];
    let totalRate = 0;

    rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        const amount = parseInt(inputs[0].value.replace(/\D/g, '')) || 0;
        const rate = parseInt(inputs[1].value) || 0;
        const quantity = parseInt(inputs[2].value); // Có thể là 0

        if (amount > 0) {
            newPrizes.push({
                amount,
                rate,
                quantity: isNaN(quantity) ? 9999 : quantity // Mặc định nhiều nếu lỗi
            });
            totalRate += rate;
        }
    });

    // Sắp xếp giảm dần theo giá trị tiền (Để logic fallback hoạt động đúng: Giải to hết -> Trôi xuống giải nhỏ)
    newPrizes.sort((a, b) => b.amount - a.amount);

    showLoading();
    try {
        await setDoc(doc(db, `artifacts/${appId}/config`, 'luckyConfig'), {
            prizes: newPrizes,
            lastUpdated: serverTimestamp()
        });
        luckyConfig.prizes = newPrizes; // Cập nhật local state
        renderAdminLuckyConfig(); // Render lại để thấy thứ tự mới
        showToast(`Đã lưu! Tổng tỷ lệ: ${totalRate}%`);
    } catch (e) {
        showToast("Lỗi: " + e.message, true);
    } finally {
        hideLoading();
    }
});

// --- LOGIC CHỌN NHANH RÚT TIỀN ---
function setupQuickWithdrawButtons() {
    $$('.quick-amount-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = btn.dataset.amount;
            const input = $('#withdraw-amount');
            input.value = new Intl.NumberFormat('vi-VN').format(amount);
            btn.classList.add('ring-2', 'ring-blue-500');
            setTimeout(() => btn.classList.remove('ring-2', 'ring-blue-500'), 200);
        });
    });
    $$('.quick-reason-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const reason = btn.dataset.reason;
            $('#withdraw-reason').value = reason;
            $$('.quick-reason-btn').forEach(b => b.classList.remove('bg-blue-100', 'text-blue-600', 'border-blue-500'));
            btn.classList.add('bg-blue-100', 'text-blue-600', 'border-blue-500');
            btn.classList.remove('bg-surface-secondary', 'text-s');
        });
    });
}

// --- ADMIN EDIT USER FUNCTIONS ---
window.adjustSpin = (delta) => {
    const el = $('#edit-user-spins');
    let val = parseInt(el.value) || 0;
    el.value = Math.max(0, val + delta);
};

window.openAdminEditUser = async (uid) => {
    showLoading();
    try {
        const docRef = doc(db, `artifacts/${appId}/users`, uid);
        const snap = await getDoc(docRef);
        if (!snap.exists()) throw "User không tồn tại";
        const data = snap.data();

        $('#edit-user-uid').value = uid;
        $('#edit-user-name').value = data.displayName || '';
        $('#edit-user-account').value = data.accountNumber || '';
        $('#edit-user-balance').value = formatCurrency(data.balance || 0);
        $('#edit-user-spins').value = data.luckySpins || 0;

        // Reset PIN Button State
        const btn = $('#admin-reset-pin-btn');
        btn.innerHTML = '<i class="fas fa-key"></i> Reset PIN về "123456"';
        btn.disabled = false;
        btn.classList.remove('opacity-50');

        $('#admin-edit-user-modal').classList.remove('hidden');
    } catch (e) { showToast(e.message, true); } finally { hideLoading(); }
};

$('#admin-save-user-btn')?.addEventListener('click', async () => {
    const uid = $('#edit-user-uid').value;
    const balance = getMoneyValue('#edit-user-balance');
    const spins = parseInt($('#edit-user-spins').value) || 0;
    const name = $('#edit-user-name').value;
    const acc = $('#edit-user-account').value;

    showLoading();
    try {
        await updateDoc(doc(db, `artifacts/${appId}/users`, uid), {
            displayName: name, accountNumber: acc, balance: balance, luckySpins: spins
        });
        showToast("Đã lưu thông tin user");
        $('#admin-edit-user-modal').classList.add('hidden');
    } catch (e) { showToast(e.message, true); } finally { hideLoading(); }
});

$('#admin-reset-pin-btn')?.addEventListener('click', async () => {
    if (!confirm("Xác nhận reset PIN?")) return;
    const uid = $('#edit-user-uid').value;
    const btn = $('#admin-reset-pin-btn');

    showLoading();
    try {
        const defaultHash = await hashPin("123456");
        await updateDoc(doc(db, `artifacts/${appId}/users`, uid), { pinHash: defaultHash });
        showToast("Đã reset PIN thành 123456");

        btn.innerHTML = '<i class="fas fa-check"></i> Đã Reset xong';
        btn.disabled = true;
        btn.classList.add('opacity-50');
    } catch (e) { showToast(e.message, true); } finally { hideLoading(); }
});

// --- ADMIN NAVIGATION LOGIC ---
window.switchAdminView = (viewName) => {
    // Ẩn Dashboard, hiện Sub-views container
    $('#admin-dashboard-view').classList.add('hidden');
    $('#admin-sub-views').classList.remove('hidden');

    // Ẩn tất cả sub-view con, chỉ hiện view được chọn
    $$('.admin-sub-view').forEach(el => el.classList.add('hidden'));
    $(`#admin-view-${viewName}`).classList.remove('hidden');
};

window.closeAdminSubView = () => {
    // Ẩn Sub-views, hiện lại Dashboard
    $('#admin-sub-views').classList.add('hidden');
    $('#admin-dashboard-view').classList.remove('hidden');
};

// --- LOGIC TÌM KIẾM USER ---
$('#admin-user-search')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const userCards = document.querySelectorAll('.admin-user-card');

    userCards.forEach(card => {
        const name = card.dataset.name.toLowerCase();
        const username = card.dataset.username.toLowerCase();
        if (name.includes(term) || username.includes(term)) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
});

// --- LOGIC CHỈNH SỬA QUÀ TẶNG ---
window.openAdminEditGift = async (id) => {
    showLoading();
    try {
        const docSnap = await getDoc(doc(db, `artifacts/${appId}/gifts`, id));
        if (!docSnap.exists()) throw "Quà không tồn tại";
        const d = docSnap.data();

        $('#edit-gift-id').value = id;
        $('#edit-gift-name').value = d.name;
        $('#edit-gift-price').value = formatCurrency(d.price);
        $('#edit-gift-quantity').value = d.quantity;
        $('#edit-gift-image').value = d.imageUrl;

        $('#admin-edit-gift-modal').classList.remove('hidden');
    } catch (e) { showToast(e.message || e, true); } finally { hideLoading(); }
};

$('#admin-save-gift-btn')?.addEventListener('click', async () => {
    const id = $('#edit-gift-id').value;
    const name = $('#edit-gift-name').value;
    const price = getMoneyValue('#edit-gift-price');
    const quantity = parseInt($('#edit-gift-quantity').value);
    const image = $('#edit-gift-image').value;

    if (!name || !price) return showToast("Thiếu tên hoặc giá", true);

    showLoading();
    try {
        await updateDoc(doc(db, `artifacts/${appId}/gifts`, id), {
            name, price, quantity, imageUrl: image
        });
        showToast("Đã cập nhật quà!");
        $('#admin-edit-gift-modal').classList.add('hidden');
    } catch (e) { showToast(e.message, true); } finally { hideLoading(); }
});


// --- LOGIC CHỈNH SỬA NHIỆM VỤ ---
window.openAdminEditMission = async (id) => {
    showLoading();
    try {
        const docSnap = await getDoc(doc(db, `artifacts/${appId}/missions`, id));
        if (!docSnap.exists()) throw "Nhiệm vụ không tồn tại";
        const d = docSnap.data();

        $('#edit-mission-id').value = id;
        $('#edit-mission-name').value = d.name;
        $('#edit-mission-reward').value = formatCurrency(d.reward);
        $('#edit-mission-description').value = d.description || '';
        $('#edit-mission-limit').value = d.limit || 0;
        $('#edit-mission-repeat').value = d.repeat || 'none';
        $('#edit-mission-deadline').value = d.deadline || '';

        $('#admin-edit-mission-modal').classList.remove('hidden');
    } catch (e) { showToast(e.message || e, true); } finally { hideLoading(); }
};

$('#admin-save-mission-btn')?.addEventListener('click', async () => {
    const id = $('#edit-mission-id').value;
    const name = $('#edit-mission-name').value;
    const reward = getMoneyValue('#edit-mission-reward');
    const desc = $('#edit-mission-description').value;
    const limit = parseInt($('#edit-mission-limit').value);
    const repeat = $('#edit-mission-repeat').value;
    const deadline = $('#edit-mission-deadline').value;

    if (!name || !reward) return showToast("Thiếu tên hoặc thưởng", true);

    showLoading();
    try {
        await updateDoc(doc(db, `artifacts/${appId}/missions`, id), {
            name, reward, description: desc, limit, repeat, deadline
        });
        showToast("Đã cập nhật nhiệm vụ!");
        $('#admin-edit-mission-modal').classList.add('hidden');
    } catch (e) { showToast(e.message, true); } finally { hideLoading(); }
});

initApp();