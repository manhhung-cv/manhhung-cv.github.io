import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, onSnapshot, collection, query, where, runTransaction, addDoc, orderBy, updateDoc, serverTimestamp, deleteDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getMessaging, getToken, onMessage, deleteToken } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js";

// --- CONFIG & INITIALIZATION ---
const firebaseConfig = { apiKey: "AIzaSyCqUaI__8udllforW6CSCvd6f8_UCLY3CE", authDomain: "famibank-c7bfb.firebaseapp.com", projectId: "famibank-c7bfb", storageBucket: "famibank-c7bfb.appspot.com", messagingSenderId: "243910717721", appId: "1:243910717721:web:e3f52cb495c1bdf35dd588" };
const appId = firebaseConfig.projectId;
const ADMIN_EMAIL = 'mienphi1230@gmail.com';
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const messaging = getMessaging(app);

// --- TRANSLATION DATA ---
const translations = {
    vi: {
        loginSlogan: "Ví Cho Gia Đình ❤️", emailPlaceholder: "Email", passwordPlaceholder: "Mật khẩu", signIn: "Đăng Nhập", noAccount: "Chưa có tài khoản?", registerNow: "Đăng ký ngay", getStarted: "Bắt Đầu", createAccountPrompt: "Tạo tài khoản mới của bạn", fullNamePlaceholder: "Họ và Tên", usernamePlaceholder: "Tên người dùng", accountNumberPlaceholder: "Số tài khoản", pinPlaceholder: "Mã PIN 6 số", createAccount: "Tạo Tài Khoản", haveAccount: "Đã có tài khoản?", welcome: "Xin chào,", totalBalance: "Tổng số dư", transfer: "Chuyển tiền", deposit: "Nạp tiền", withdraw: "Rút tiền", recentTransactions: "Giao dịch gần đây", transactionHistory: "Lịch sử giao dịch", settings: "Cài đặt", profile: "Hồ sơ", yourNamePlaceholder: "Tên của bạn", save: "Lưu", security: "Bảo mật", changePin: "Đổi mã PIN", language: "Ngôn ngữ", theme: "Giao diện", logout: "Đăng xuất", adminPanel: "Bảng điều khiển Admin", createDepositCode: "Tạo mã nạp tiền", depositCodePlaceholder: "Mã nạp (VD: NAP100)", amountPlaceholder: "Số tiền", createCode: "Tạo Mã", pendingWithdrawals: "Yêu cầu rút tiền chờ duyệt", home: "Trang chủ", history: "Lịch sử", admin: "Admin", transferFunds: "Chuyển tiền", recipientPlaceholder: "Tên tài khoản/Email/STK người nhận", notePlaceholder: "Nội dung", cancel: "Hủy", confirm: "Xác nhận", enterDepositCode: "Nhập mã nạp tiền", requestWithdraw: "Yêu cầu rút tiền", reasonPlaceholder: "Lý do", sendRequest: "Gửi Yêu Cầu", enterPin: "Nhập mã PIN", enterPinPrompt: "Vui lòng nhập mã PIN để xác thực", currentPinPlaceholder: "Mã PIN hiện tại", newPinPlaceholder: "Mã PIN mới", confirmNewPinPlaceholder: "Xác nhận mã PIN mới", confirmChange: "Xác nhận thay đổi", fillAllFields: "Vui lòng điền đầy đủ thông tin.", pinMustBe6Digits: "Mã PIN phải là 6 chữ số.", invalidUsernameFormat: "Định dạng tên người dùng không hợp lệ.", usernameExists: "Tên người dùng đã tồn tại.", accountNumberExists: "Số tài khoản đã tồn tại.", registrationSuccess: "Đăng ký thành công!", enterEmailPassword: "Vui lòng nhập email và mật khẩu.", loginFailed: "Email hoặc mật khẩu không chính xác.", pinIncorrect: "Mã PIN không chính xác.", invalidTransferInfo: "Thông tin chuyển khoản không hợp lệ.", insufficientBalance: "Số dư không đủ.", recipientNotFound: "Không tìm thấy người nhận.", cannotTransferToSelf: "Không thể chuyển tiền cho chính mình.", transferSuccess: "Đã chuyển thành công {amount} đến {recipient}", enterDepositCodePrompt: "Vui lòng nhập mã nạp tiền.", invalidDepositCode: "Mã nạp tiền không hợp lệ.", depositSuccess: "Nạp thành công {amount}", invalidWithdrawRequest: "Vui lòng cung cấp số tiền và lý do hợp lệ.", withdrawRequestSent: "Yêu cầu rút tiền đã được gửi.", nameCannotBeEmpty: "Tên không được để trống.", nameUpdated: "Tên đã được cập nhật!", fillAllPinFields: "Vui lòng điền tất cả các trường PIN.", newPinMustBe6Digits: "Mã PIN mới phải là 6 chữ số.", pinsDoNotMatch: "Mã PIN mới không khớp.", currentPinIncorrect: "Mã PIN hiện tại của bạn không chính xác.", pinChanged: "Đổi mã PIN thành công!", accNumCopied: "Đã sao chép số tài khoản!", copyFailed: "Sao chép thất bại", requestApproved: "Yêu cầu đã được duyệt.", requestRejected: "Yêu cầu đã bị từ chối.", codeCreated: "Mã \"{code}\" với số tiền {amount} đã được tạo.", noRecentActivity: "Chưa có hoạt động gần đây.", noTransactions: "Chưa có giao dịch nào.", noPendingRequests: "Không có yêu cầu nào đang chờ.", toUser: "Chuyển tiền cho {user}", fromUser: "Nhận tiền từ {user}", depositTitle: "Nạp tiền", withdrawTitle: "Rút tiền", approvedByAdmin: "Admin đã duyệt", unknownTransaction: "Giao dịch không xác định", codeUsed: "Mã này đã được sử dụng.", editDepositCode: "Sửa mã nạp tiền", code: "Mã", amount: "Số tiền", saveChanges: "Lưu thay đổi", depositCodeManagement: "Quản lý mã nạp tiền", available: "Có sẵn", used: "Đã sử dụng", usedBy: "Bởi: {user}", edit: "Sửa", delete: "Xóa", confirmDelete: "Xác nhận Xóa", confirmDeleteCode: "Bạn có chắc muốn xóa mã {code}? Hành động này không thể hoàn tác.", deleteSuccess: "Xóa mã thành công.", reviewWithdrawal: "Duyệt yêu cầu rút tiền", approvalAmount: "Số tiền duyệt", messageToUser: "Tin nhắn cho người dùng (Lý do từ chối)", messagePlaceholder: "Nhập tin nhắn...", reject: "Từ chối", approve: "Đồng ý"
    },
    en: {
        loginSlogan: "Wallet For Family ❤️", emailPlaceholder: "Email", passwordPlaceholder: "Password", signIn: "Sign In", noAccount: "No account?", registerNow: "Register now", getStarted: "Get Started", createAccountPrompt: "Create your new account", fullNamePlaceholder: "Full Name", usernamePlaceholder: "Username", accountNumberPlaceholder: "Account Number", pinPlaceholder: "6-digit PIN", createAccount: "Create Account", haveAccount: "Have an account?", welcome: "Welcome,", totalBalance: "Total Balance", transfer: "Transfer", deposit: "Deposit", withdraw: "Withdraw", recentTransactions: "Recent Transactions", transactionHistory: "Transaction History", settings: "Settings", profile: "Profile", yourNamePlaceholder: "Your Name", save: "Save", security: "Security", changePin: "Change PIN", language: "Language", theme: "Theme", logout: "Logout", adminPanel: "Admin Panel", createDepositCode: "Create Deposit Code", depositCodePlaceholder: "Code (e.g., NAP100)", amountPlaceholder: "Amount", createCode: "Create Code", pendingWithdrawals: "Pending Withdrawal Requests", home: "Home", history: "History", admin: "Admin", transferFunds: "Transfer Funds", recipientPlaceholder: "Recipient Username/Email/ACC", notePlaceholder: "Note", cancel: "Cancel", confirm: "Confirm", enterDepositCode: "Enter deposit code", requestWithdraw: "Request Withdraw", reasonPlaceholder: "Reason", sendRequest: "Send Request", enterPin: "Enter PIN", enterPinPrompt: "Please enter your PIN to authorize", currentPinPlaceholder: "Current PIN", newPinPlaceholder: "New PIN", confirmNewPinPlaceholder: "Confirm New PIN", confirmChange: "Confirm Change", fillAllFields: "Please fill all fields.", pinMustBe6Digits: "PIN must be 6 digits.", invalidUsernameFormat: "Invalid username format.", usernameExists: "Username already exists.", accountNumberExists: "Account number already exists.", registrationSuccess: "Registration successful!", enterEmailPassword: "Please enter email and password.", loginFailed: "Incorrect email or password.", pinIncorrect: "PIN is incorrect.", invalidTransferInfo: "Invalid transfer information.", insufficientBalance: "Insufficient balance.", recipientNotFound: "Recipient not found.", cannotTransferToSelf: "Cannot transfer to yourself.", transferSuccess: "Successfully transferred {amount} to {recipient}", enterDepositCodePrompt: "Please enter a deposit code.", invalidDepositCode: "Invalid deposit code.", depositSuccess: "Successfully deposited {amount}", invalidWithdrawRequest: "Please provide a valid amount and reason.", withdrawRequestSent: "Withdrawal request sent successfully.", nameCannotBeEmpty: "Name cannot be empty.", nameUpdated: "Name updated successfully!", fillAllPinFields: "Please fill all PIN fields.", newPinMustBe6Digits: "New PIN must be 6 digits.", pinsDoNotMatch: "New PINs do not match.", currentPinIncorrect: "Your current PIN is incorrect.", pinChanged: "PIN changed successfully!", accNumCopied: "Account number copied!", copyFailed: "Failed to copy", requestApproved: "Request approved.", requestRejected: "Request rejected.", codeCreated: "Code \"{code}\" for {amount} created.", noRecentActivity: "No recent activity.", noTransactions: "No transactions yet.", noPendingRequests: "No pending requests.", toUser: "To: {user}", fromUser: "From: {user}", depositTitle: "Deposit", withdrawTitle: "Withdrawal", approvedByAdmin: "Approved by Admin", unknownTransaction: "Unknown Transaction", codeUsed: "This code has already been used.", editDepositCode: "Edit Deposit Code", code: "Code", amount: "Amount", saveChanges: "Save Changes", depositCodeManagement: "Deposit Code Management", available: "Available", used: "Used", usedBy: "By: {user}", edit: "Edit", delete: "Delete", confirmDelete: "Confirm Deletion", confirmDeleteCode: "Are you sure you want to delete code {code}? This action cannot be undone.", deleteSuccess: "Code deleted successfully.", reviewWithdrawal: "Review Withdrawal Request", approvalAmount: "Approval Amount", messageToUser: "Message to User (Rejection Reason)", messagePlaceholder: "Enter message...", reject: "Reject", approve: "Approve"
    }
};
let currentLanguage = 'vi';

// --- STATE & DOM ---
let currentUser = null, currentUserData = null, unsubscribeUser = null, pinPromiseResolver = null;
let isBalanceVisible = true;
let currentGiftSortOrder = 'newest'; // 'newest', 'price_asc', 'price_desc'
const loadingOverlay = document.getElementById('loading-overlay');
const allViews = document.querySelectorAll('#login-view, #register-view, #app-view');
const allTabs = document.querySelectorAll('.app-tab');
const navButtons = document.querySelectorAll('.nav-btn');
const bottomNav = document.getElementById('bottom-nav');
const pinInput = document.getElementById('pin-input');
const pinDots = document.querySelectorAll('.pin-dot');
const toastMessage = document.getElementById('toast-message');
const toast = document.getElementById('toast-notification');
const notificationBtn = document.getElementById('notification-btn');
const notificationDot = document.querySelector('.notification-dot');

// --- CORE FUNCTIONS ---
const showLoading = () => loadingOverlay.style.display = 'flex';
const hideLoading = () => loadingOverlay.style.display = 'none';
const showView = (viewId) => { allViews.forEach(v => v.style.display = 'none'); document.getElementById(viewId).style.display = 'flex'; };

const showTab = (tabId) => {
    allTabs.forEach(t => t.style.display = 'none');
    document.getElementById(tabId).style.display = 'block';
    
    const mainNavButton = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
    navButtons.forEach(b => b.classList.remove('active'));

    if (mainNavButton) {
        mainNavButton.classList.add('active');
    } else {
        const moreMenuTabs = ['missions-tab', 'gifts-tab', 'settings-tab', 'admin-tab'];
        if (moreMenuTabs.includes(tabId)) {
            document.getElementById('more-nav-btn').classList.add('active');
        }
    }
};

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '';
async function hashPin(pin) { const data = new TextEncoder().encode(pin); const hashBuffer = await crypto.subtle.digest('SHA-256', data); return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join(''); }

const showToast = (message, isError = false) => {
    toastMessage.textContent = message;
    toast.classList.remove('opacity-0');
    const colorVar = isError ? 'var(--danger-color)' : 'var(--success-color)';
    toast.style.backgroundColor = colorVar;
    toast.style.color = 'white';
    setTimeout(() => toast.classList.add('opacity-0'), 3000);
};

const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    const date1 = d1 instanceof Date ? d1 : d1.toDate();
    const date2 = d2 instanceof Date ? d2 : d2.toDate();
    return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
};
const getWeek = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};
const isSameWeek = (d1, d2) => {
    const date1 = d1 instanceof Date ? d1 : d1.toDate();
    const date2 = d2 instanceof Date ? d2 : d2.toDate();
    return date1.getFullYear() === date2.getFullYear() && getWeek(date1) === getWeek(date2);
};
const isSameMonth = (d1, d2) => {
    const date1 = d1 instanceof Date ? d1 : d1.toDate();
    const date2 = d2 instanceof Date ? d2 : d2.toDate();
    return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth();
};


function getTranslatedString(key, options = {}) {
    let str = translations[currentLanguage][key] || key;
    for (const placeholder in options) { str = str.replace(`{${placeholder}}`, options[placeholder]); }
    return str;
}

function applyLanguage(lang) {
    if (lang !== 'vi' && lang !== 'en') return;
    currentLanguage = lang;
    localStorage.setItem('famiBankLanguage', lang);
    document.querySelectorAll('[data-translate-key]').forEach(el => { el.textContent = getTranslatedString(el.dataset.translateKey); });
    document.querySelectorAll('[data-translate-key-placeholder]').forEach(el => { el.placeholder = getTranslatedString(el.dataset.translateKeyPlaceholder); });
    document.querySelectorAll('.lang-switcher').forEach(switcher => {
        switcher.querySelector('button[data-lang="vi"]').classList.toggle('active', lang === 'vi');
        switcher.querySelector('button[data-lang="en"]').classList.toggle('active', lang === 'en');
    });
    if (currentUserData) { fetchAllTransactions(currentUser.uid); }
}

// --- EVENT LISTENERS ---
document.getElementById('show-register-btn').addEventListener('click', () => showView('register-view'));
document.getElementById('show-login-btn-bottom').addEventListener('click', () => showView('login-view'));
document.getElementById('back-to-login-btn').addEventListener('click', () => showView('login-view'));
navButtons.forEach(btn => btn.addEventListener('click', () => {
    if (btn.dataset.tab !== 'more-menu') {
        showTab(btn.dataset.tab);
    }
}));
document.querySelectorAll('.modal-overlay').forEach(modal => modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; }));
document.querySelectorAll('.modal-close-btn').forEach(btn => btn.addEventListener('click', () => { btn.closest('.modal-overlay').style.display = 'none'; }));
document.querySelectorAll('.action-btn').forEach(btn => btn.addEventListener('click', () => document.getElementById(`${btn.dataset.action}-modal`).style.display = 'flex'));
document.querySelectorAll('.lang-switcher button').forEach(button => button.addEventListener('click', () => applyLanguage(button.dataset.lang)));

// --- More Menu Logic ---
const moreNavBtn = document.getElementById('more-nav-btn');
const moreMenuModal = document.getElementById('more-menu-modal');

moreNavBtn.addEventListener('click', () => {
    moreMenuModal.style.display = 'flex';
});

document.querySelectorAll('.more-menu-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        showTab(tabId);
        moreMenuModal.style.display = 'none';
    });
});


// --- AUTHENTICATION ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        if (unsubscribeUser) unsubscribeUser();
        const userDocRef = doc(db, `artifacts/${appId}/users`, user.uid);
        
        requestNotificationPermission(user.uid);

        unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                currentUserData = { id: docSnap.id, ...docSnap.data() };
                updateUI();
                fetchAllTransactions(user.uid);
                fetchGiftHistory(user.uid);
                fetchMissionHistory(user.uid);
                fetchGiftApprovalHistory(user.uid);
                setupMissionsTab();
                setupGiftsTab();
                setupLuckyWheel();
                fetchNotifications(user.uid);
            } else { handleLogout(); }
        });
        showView('app-view');
        showTab('home-tab');
        
        if (user.email === ADMIN_EMAIL) {
            document.getElementById('more-menu-admin-btn').style.display = 'flex';
            setupAdminDashboard();
        } else {
            document.getElementById('more-menu-admin-btn').style.display = 'none';
        }

    } else {
        currentUser = null; currentUserData = null; if (unsubscribeUser) unsubscribeUser();
        showView('login-view');
    }
    hideLoading();
});

document.getElementById('register-btn').addEventListener('click', async () => {
    const name = document.getElementById('reg-name').value.trim();
    const username = document.getElementById('reg-username').value.trim().toLowerCase();
    const accNum = document.getElementById('reg-account-number').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const pin = document.getElementById('reg-pin').value;

    if (!name || !username || !accNum || !email || !password || !pin) return showToast(getTranslatedString('fillAllFields'), true);
    if (pin.length !== 6 || !/^\d+$/.test(pin)) return showToast(getTranslatedString('pinMustBe6Digits'), true);
    if (username.includes(" ") || !/^[a-z0-9]+$/.test(username)) return showToast(getTranslatedString('invalidUsernameFormat'), true);

    showLoading();
    let userCredential = null;

    try {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;

        await runTransaction(db, async (transaction) => {
            const userDocRef = doc(db, `artifacts/${appId}/users`, newUser.uid);
            const usernameClaimRef = doc(db, `artifacts/${appId}/uniqueIdentifiers`, `username_${username}`);
            const accNumClaimRef = doc(db, `artifacts/${appId}/uniqueIdentifiers`, `accNum_${accNum}`);

            const usernameClaimDoc = await transaction.get(usernameClaimRef);
            if (usernameClaimDoc.exists()) throw new Error(getTranslatedString('usernameExists'));

            const accNumClaimDoc = await transaction.get(accNumClaimRef);
            if (accNumClaimDoc.exists()) throw new Error(getTranslatedString('accountNumberExists'));

            const pinHash = await hashPin(pin);
            transaction.set(userDocRef, { 
                displayName: name, 
                username, 
                accountNumber: accNum, 
                email, 
                pinHash, 
                balance: 0, 
                createdAt: serverTimestamp(), 
                fcmToken: null, 
                lastFreeSpin: null,
                spinTurns: 1 // Initial free spin
            });
            transaction.set(usernameClaimRef, { uid: newUser.uid });
            transaction.set(accNumClaimRef, { uid: newUser.uid });
        });
        
        showToast(getTranslatedString('registrationSuccess'));

    } catch (error) {
        if (userCredential) {
            await userCredential.user.delete().catch(e => console.error("Lỗi khi dọn dẹp:", e));
        }
        showToast(error.message, true);
    } finally {
        hideLoading();
    }
});

document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    if (!email || !password) return showToast(getTranslatedString('enterEmailPassword'), true);
    showLoading();
    try { await signInWithEmailAndPassword(auth, email, password); }
    catch (error) { showToast(getTranslatedString('loginFailed'), true); }
    finally { hideLoading(); }
});

const handleLogout = () => signOut(auth).catch(console.error);
document.getElementById('logout-btn').addEventListener('click', handleLogout);

// --- UI & DATA HANDLING ---
function updateUI() {
    if (!currentUserData) return;
    document.getElementById('user-display-name').textContent = currentUserData.displayName;
    document.getElementById('user-avatar').textContent = getInitials(currentUserData.displayName);
    document.getElementById('user-account-number').textContent = `STK:${currentUserData.accountNumber}`;
    document.getElementById('update-name-input').value = currentUserData.displayName;
    document.getElementById('update-username-input').value = currentUserData.username;
    document.getElementById('update-account-number-input').value = currentUserData.accountNumber;
    updateBalanceVisibility();
}

function updateBalanceVisibility() {
    const balanceEl = document.getElementById('user-balance');
    const visibilityBtnIcon = document.querySelector('#balance-visibility-btn i');
    if (isBalanceVisible) {
        balanceEl.textContent = formatCurrency(currentUserData.balance);
        visibilityBtnIcon.className = 'fas fa-eye text-secondary';
    } else {
        balanceEl.textContent = '•••••••• ₫';
        visibilityBtnIcon.className = 'fas fa-eye-slash text-secondary';
    }
}
document.getElementById('balance-visibility-btn').addEventListener('click', () => { isBalanceVisible = !isBalanceVisible; updateBalanceVisibility(); });

pinInput.addEventListener('input', () => { const val = pinInput.value; pinDots.forEach((dot, i) => dot.classList.toggle('active', i < val.length)); if (val.length === 6) { if (pinPromiseResolver) pinPromiseResolver(val); pinPromiseResolver = null; document.getElementById('pin-modal').style.display = 'none'; pinInput.value = ''; pinDots.forEach(dot => dot.classList.remove('active')); } });
function requestPin() { return new Promise((resolve) => { pinPromiseResolver = resolve; pinInput.value = ''; pinDots.forEach(dot => dot.classList.remove('active')); document.getElementById('pin-modal').style.display = 'flex'; setTimeout(() => pinInput.focus(), 100); }); }
async function verifyPin() { const enteredPin = await requestPin(); if(!enteredPin) return false; const enteredPinHash = await hashPin(enteredPin); if (enteredPinHash !== currentUserData.pinHash) { showToast(getTranslatedString('pinIncorrect'), true); return false; } return true; }

document.getElementById('confirm-transfer-btn').addEventListener('click', async () => {
    const recipientIdentifier = document.getElementById('transfer-recipient').value.trim();
    const amount = parseInt(document.getElementById('transfer-amount').value);
    const content = document.getElementById('transfer-content').value.trim() || getTranslatedString('transfer');
    if (!recipientIdentifier || !amount || amount <= 0) return showToast(getTranslatedString('invalidTransferInfo'), true);
    if (amount > currentUserData.balance) return showToast(getTranslatedString('insufficientBalance'), true);
    document.getElementById('transfer-modal').style.display = 'none';
    if (!await verifyPin()) return;
    showLoading();
    try {
        const usersRef = collection(db, `artifacts/${appId}/users`);
        const qUsername = query(usersRef, where("username", "==", recipientIdentifier.toLowerCase()));
        const qEmail = query(usersRef, where("email", "==", recipientIdentifier.toLowerCase()));
        const qAccNum = query(usersRef, where("accountNumber", "==", recipientIdentifier));
        const [usernameSnap, emailSnap, accNumSnap] = await Promise.all([getDocs(qUsername), getDocs(qEmail), getDocs(qAccNum)]);
        let recipientDoc = null;
        if (!usernameSnap.empty) recipientDoc = usernameSnap.docs[0];
        else if (!emailSnap.empty) recipientDoc = emailSnap.docs[0];
        else if (!accNumSnap.empty) recipientDoc = accNumSnap.docs[0];
        if (!recipientDoc) throw new Error(getTranslatedString('recipientNotFound'));
        const recipientData = { id: recipientDoc.id, ...recipientDoc.data() };
        if (recipientData.id === currentUser.uid) throw new Error(getTranslatedString('cannotTransferToSelf'));
        await runTransaction(db, async (transaction) => {
            const senderDocRef = doc(db, `artifacts/${appId}/users`, currentUser.uid);
            const senderDoc = await transaction.get(senderDocRef);
            if (!senderDoc.exists() || senderDoc.data().balance < amount) throw new Error(getTranslatedString('insufficientBalance'));
            transaction.update(senderDocRef, { balance: senderDoc.data().balance - amount });
            transaction.update(recipientDoc.ref, { balance: recipientData.balance + amount });
            transaction.set(doc(collection(db, `artifacts/${appId}/transactions`)), {type: 'transfer', fromUserId: currentUser.uid, fromUserName: currentUserData.displayName,toUserId: recipientData.id, toUserName: recipientData.displayName,amount, content, timestamp: serverTimestamp()});
        });
        showToast(getTranslatedString('transferSuccess', { amount: formatCurrency(amount), recipient: recipientData.displayName }));
        ['transfer-recipient', 'transfer-amount', 'transfer-content'].forEach(id => document.getElementById(id).value = '');
        createNotification(recipientData.id, `Bạn đã nhận được ${formatCurrency(amount)} từ ${currentUserData.displayName}.`, 'transfer');

    } catch (error) { showToast(error.message, true); } finally { hideLoading(); }
});

document.getElementById('confirm-deposit-btn').addEventListener('click', async () => {
    const codeId = document.getElementById('deposit-code').value.trim().toUpperCase();
    if (!codeId) return showToast(getTranslatedString('enterDepositCodePrompt'), true);
    document.getElementById('deposit-modal').style.display = 'none';
    showLoading();
    try {
        const codeRef = doc(db, `artifacts/${appId}/depositCodes`, codeId);
        const userDocRef = doc(db, `artifacts/${appId}/users`, currentUser.uid);
        await runTransaction(db, async (transaction) => {
            const codeDoc = await transaction.get(codeRef);
            if (!codeDoc.exists()) throw new Error(getTranslatedString('invalidDepositCode'));
            if (codeDoc.data().status !== 'available') throw new Error(getTranslatedString('codeUsed'));
            const userDoc = await transaction.get(userDocRef);
            if (!userDoc.exists()) throw new Error("User not found");
            const amount = codeDoc.data().amount;
            transaction.update(userDocRef, { balance: userDoc.data().balance + amount });
            transaction.update(codeRef, {
                status: 'used',
                redeemedBy: currentUser.uid,
                redeemedByUsername: currentUserData.displayName,
                redeemedAt: serverTimestamp()
            });
            transaction.set(doc(collection(db, `artifacts/${appId}/transactions`)), {type: 'deposit', userId: currentUser.uid, userName: currentUserData.displayName, amount, content: `Deposit with code ${codeId}`, timestamp: serverTimestamp()});
        });
        const codeSnap = await getDoc(codeRef);
        showToast(getTranslatedString('depositSuccess', { amount: formatCurrency(codeSnap.data().amount) }));
        document.getElementById('deposit-code').value = '';
    } catch (error) { showToast(error.message, true); } finally { hideLoading(); }
});

document.getElementById('confirm-withdraw-btn').addEventListener('click', async () => {
    const amount = parseInt(document.getElementById('withdraw-amount').value);
    const reason = document.getElementById('withdraw-reason').value.trim();
    if (!amount || amount <= 0 || !reason) return showToast(getTranslatedString('invalidWithdrawRequest'), true);
    if (amount > currentUserData.balance) return showToast(getTranslatedString('insufficientBalance'), true);
    document.getElementById('withdraw-modal').style.display = 'none';
    if (!await verifyPin()) return;
    showLoading();
    try {
        await addDoc(collection(db, `artifacts/${appId}/withdrawalRequests`), {userId: currentUser.uid, userDisplayName: currentUserData.displayName,userAccountNumber: currentUserData.accountNumber, amount, reason, status: 'pending',createdAt: serverTimestamp()});
        showToast(getTranslatedString('withdrawRequestSent'));
        document.getElementById('withdraw-amount').value = '';
        document.getElementById('withdraw-reason').value = '';
    } catch (error) { showToast(error.message, true); } finally { hideLoading(); }
});

async function fetchAllTransactions(userId) {
    try {
        const transacRef = collection(db, `artifacts/${appId}/transactions`);
        const qSent = query(transacRef, where('fromUserId', '==', userId));
        const qReceived = query(transacRef, where('toUserId', '==', userId));
        const qOthers = query(transacRef, where('userId', '==', userId));
        const [sentSnap, receivedSnap, othersSnap] = await Promise.all([getDocs(qSent), getDocs(qReceived), getDocs(qOthers)]);
        let allTransactions = [];
        [...sentSnap.docs, ...receivedSnap.docs, ...othersSnap.docs].forEach(doc => allTransactions.push(doc.data()));
        allTransactions.sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0));
        renderTransactions(allTransactions.slice(0, 5), document.getElementById('recent-transaction-history'), userId, getTranslatedString('noRecentActivity'));
        renderTransactions(allTransactions, document.getElementById('history-content-transactions'), userId, getTranslatedString('noTransactions'));
    } catch(e) { console.error("Error fetching transactions: ", e); }
}

function renderTransactions(transactions, container, userId, emptyMessage) {
    if (transactions.length === 0) { container.innerHTML = `<p class="text-center text-secondary py-4">${emptyMessage}</p>`; return; }
    container.innerHTML = transactions.map(tx => {
        const time = tx.timestamp ? tx.timestamp.toDate().toLocaleDateString('vi-VN') : '...';
        let amountClass, amountSign, title, detail, icon;
        switch (tx.type) {
            case 'transfer': if (tx.fromUserId === userId) { amountClass = 'text-danger'; amountSign = '-'; title = getTranslatedString('toUser', {user: tx.toUserName}); detail = tx.content; icon = 'fa-paper-plane'; } else { amountClass = 'text-success'; amountSign = '+'; title = getTranslatedString('fromUser', {user: tx.fromUserName}); detail = tx.content; icon = 'fa-arrow-down'; } break;
            case 'deposit': amountClass = 'text-success'; amountSign = '+'; title = getTranslatedString('depositTitle'); detail = tx.content; icon = 'fa-wallet'; break;
            case 'withdraw': amountClass = 'text-danger'; amountSign = '-'; title = getTranslatedString('withdrawTitle'); detail = getTranslatedString('approvedByAdmin'); icon = 'fa-money-bill-wave'; break;
            case 'lucky_spin_win': amountClass = 'text-success'; amountSign = '+'; title = "Thưởng Vòng Quay"; detail = `Trúng thưởng ${tx.prizeName}`; icon = 'fa-compact-disc'; break;
            case 'lucky_spin_cost': amountClass = 'text-danger'; amountSign = '-'; title = "Phí Vòng Quay"; detail = `Trả phí để quay`; icon = 'fa-compact-disc'; break;
            default: amountClass = 'text-primary'; amountSign = ''; title = getTranslatedString('unknownTransaction'); detail = tx.content || ''; icon = 'fa-question-circle';
        }
        return `<div class="flex items-center justify-between p-3 bg-secondary rounded-lg"><div class="flex items-center gap-4"><div class="w-10 h-10 flex items-center justify-center bg-tertiary rounded-full ${amountClass}"><i class="fas ${icon}"></i></div><div><p class="font-semibold text-sm text-primary">${title}</p><p class="text-xs text-secondary">${detail}</p><p class="text-xs text-secondary">${time}</p></div></div><p class="font-bold text-sm ${amountClass}">${amountSign}${formatCurrency(tx.amount)}</p></div>`;
    }).join('');
}

// --- ADMIN FUNCTIONS ---
let unsubscribeAdmin = null;
let unsubscribeDepositCodes = null;
let unsubscribeAdminUsers = null;
let unsubscribeAdminGifts = null;
let unsubscribeAdminMissions = null;
let unsubscribeAdminGiftRequests = null;
let unsubscribeAdminLuckyWheel = null;

function setupAdminDashboard() {
    if (unsubscribeAdmin) unsubscribeAdmin();
    const requestsContainer = document.getElementById('withdrawal-requests');
    const q = query(collection(db, `artifacts/${appId}/withdrawalRequests`), orderBy('createdAt', 'desc'));
    
    unsubscribeAdmin = onSnapshot(q, (snapshot) => {
        const pendingRequests = snapshot.docs.filter(doc => doc.data().status === 'pending').length;
        document.getElementById('admin-pending-withdrawals').textContent = pendingRequests;

        if (snapshot.empty) {
            requestsContainer.innerHTML = `<p class="text-center text-secondary">Không có yêu cầu rút tiền nào.</p>`;
            return;
        }
        requestsContainer.innerHTML = snapshot.docs.map(doc => {
            const req = doc.data();
            const reqId = doc.id;
            const reqDataString = JSON.stringify({ id: reqId, ...req });

            let statusBadge = '';
            let adminNote = '';
            let actionButton = '';

            switch(req.status) {
                case 'approved':
                    statusBadge = `<div class="text-xs font-bold text-white px-2 py-0.5 rounded-full inline-block bg-success">Đã duyệt</div>`;
                    adminNote = `<p class="text-xs text-secondary mt-1">Số tiền duyệt: ${formatCurrency(req.approvedAmount)}</p>`;
                    break;
                case 'rejected':
                    statusBadge = `<div class="text-xs font-bold text-white px-2 py-0.5 rounded-full inline-block bg-danger">Đã từ chối</div>`;
                    adminNote = `<p class="text-xs text-secondary mt-1">Lý do: ${req.adminMessage}</p>`;
                    break;
                default: // 'pending'
                    statusBadge = `<div class="text-xs font-bold text-on-accent px-2 py-0.5 rounded-full inline-block bg-accent">Đang chờ</div>`;
                    actionButton = `<div class="flex gap-3 mt-4">
                                        <button data-request='${reqDataString}' class="admin-review-btn w-full p-2 bg-accent text-on-accent font-bold rounded-md hover:bg-accent-hover">Duyệt Yêu Cầu</button>
                                    </div>`;
            }

            return `<div class="bg-tertiary p-4 rounded-lg app-shadow">
                        <div class="flex justify-between items-start">
                             <div>
                                <div class="flex items-center gap-2 mb-2">
                                    <p class="font-bold text-primary">${req.userDisplayName}</p>
                                    ${statusBadge}
                                </div>
                                <p class="text-xs text-secondary">(ACC: ${req.userAccountNumber})</p>
                            </div>
                            <button data-id="${reqId}" class="admin-delete-request-btn p-2 h-8 w-8 text-sm bg-secondary rounded-md text-danger flex-shrink-0"><i class="fas fa-trash"></i></button>
                        </div>

                        <p class="text-lg font-bold my-2 text-accent">${formatCurrency(req.amount)}</p>
                        <p class="text-sm text-secondary italic">Lý do người dùng: "${req.reason}"</p>
                        ${adminNote}
                        ${actionButton}
                    </div>`;
        }).join('');
    });
    setupAdminDepositCodesList();
    setupAdminUserList();
    setupAdminGiftsList();
    setupAdminMissionsList();
    setupAdminGiftRequests();
    setupAdminLuckyWheel();
}

function setupAdminDepositCodesList() {
    if (unsubscribeDepositCodes) unsubscribeDepositCodes();
    const codesContainer = document.getElementById('deposit-codes-list');
    const usedCodesContainer = document.getElementById('used-deposit-codes-list');
    const q = query(collection(db, `artifacts/${appId}/depositCodes`), orderBy('createdAt', 'desc'));

    unsubscribeDepositCodes = onSnapshot(q, (snapshot) => {
        let availableCodesHTML = '';
        let usedCodesHTML = '';

        if (snapshot.empty) {
            codesContainer.innerHTML = `<p class="text-center text-secondary">${getTranslatedString('noDepositCodes', {lng: currentLanguage})}</p>`;
            usedCodesContainer.innerHTML = `<p class="text-center text-secondary">${getTranslatedString('noUsedDepositCodes', {lng: currentLanguage})}</p>`;
            return;
        }

        snapshot.docs.forEach(doc => {
            const code = doc.data();
            if (code.status === 'available') {
                availableCodesHTML += `<div class="bg-tertiary p-4 rounded-lg">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-bold text-primary text-lg font-mono">${doc.id}</p>
                            <p class="font-bold my-1 text-accent">${formatCurrency(code.amount)}</p>
                            <div class="text-xs font-bold text-white px-2 py-0.5 rounded-full inline-block bg-success">${getTranslatedString('available')}</div>
                        </div>
                        <div class="flex gap-2">
                            <button data-id="${doc.id}" data-amount="${code.amount}" class="admin-edit-code-btn p-2 h-8 w-8 text-sm bg-secondary rounded-md"><i class="fas fa-pen"></i></button>
                            <button data-id="${doc.id}" class="admin-delete-code-btn p-2 h-8 w-8 text-sm bg-secondary rounded-md text-danger"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                </div>`;
            } else {
                const redeemedTime = code.redeemedAt ? code.redeemedAt.toDate().toLocaleDateString('vi-VN') : '';
                usedCodesHTML += `<div class="bg-tertiary p-4 rounded-lg">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-bold text-primary text-lg font-mono">${doc.id}</p>
                            <p class="font-bold my-1 text-accent">${formatCurrency(code.amount)}</p>
                            <div class="text-xs font-bold text-white px-2 py-0.5 rounded-full inline-block bg-danger">${getTranslatedString('used')}</div>
                            <p class="text-xs text-secondary mt-1">${getTranslatedString('usedBy', {user: code.redeemedByUsername})} @ ${redeemedTime}</p>
                        </div>
                        <button data-id="${doc.id}" class="admin-delete-code-btn p-2 h-8 w-8 text-sm bg-secondary rounded-md text-danger"><i class="fas fa-trash"></i></button>
                    </div>
                </div>`;
            }
        });

        codesContainer.innerHTML = availableCodesHTML || `<p class="text-center text-secondary">Không có mã nào.</p>`;
        usedCodesContainer.innerHTML = usedCodesHTML || `<p class="text-center text-secondary">Không có mã nào đã sử dụng.</p>`;
    });
}

function setupAdminUserList() {
    if (unsubscribeAdminUsers) unsubscribeAdminUsers();
    const userListContainer = document.getElementById('admin-user-list');
    const q = query(collection(db, `artifacts/${appId}/users`), orderBy('createdAt', 'desc'));

    unsubscribeAdminUsers = onSnapshot(q, (snapshot) => {
        document.getElementById('admin-total-users').textContent = snapshot.size;
        if (snapshot.empty) {
            userListContainer.innerHTML = `<p class="text-center text-secondary">Không có người dùng nào.</p>`;
            return;
        }
        userListContainer.innerHTML = snapshot.docs.map(doc => {
            const user = doc.data();
            user.id = doc.id;
            const userDataString = JSON.stringify(user);

            return `<div class="bg-tertiary p-4 rounded-lg app-shadow">
                        <div class="flex justify-between items-center">
                            <div>
                                <p class="font-bold text-primary">${user.displayName}</p>
                                <p class="text-xs text-secondary">${user.email}</p>
                                <p class="text-sm font-mono text-accent mt-1">STK: ${user.accountNumber}</p>
                                <p class="text-sm font-bold text-primary mt-1">Số dư: ${formatCurrency(user.balance)}</p>
                            </div>
                            <button data-user='${userDataString}' class="admin-edit-user-btn p-2 h-10 w-10 text-sm bg-secondary rounded-md"><i class="fas fa-pen"></i></button>
                        </div>
                    </div>`;
        }).join('');
    });
}

function setupAdminGiftRequests() {
    if (unsubscribeAdminGiftRequests) unsubscribeAdminGiftRequests();
    const pendingContainer = document.getElementById('gift-requests-list');
    const processedContainer = document.getElementById('processed-gift-requests-list');
    const q = query(collection(db, `artifacts/${appId}/giftRequests`), orderBy('createdAt', 'desc'));

    unsubscribeAdminGiftRequests = onSnapshot(q, (snapshot) => {
        let pendingHtml = '';
        let processedHtml = '';
        let pendingCount = 0;

        const docs = snapshot.docs;
        
        // Separate pending from processed
        const pendingDocs = docs.filter(doc => doc.data().status === 'pending');
        const processedDocs = docs.filter(doc => doc.data().status !== 'pending')
                                  .sort((a, b) => (b.data().processedAt?.toMillis() || 0) - (a.data().processedAt?.toMillis() || 0));

        pendingCount = pendingDocs.length;
        document.getElementById('admin-pending-gifts').textContent = pendingCount;
        
        if (pendingDocs.length === 0) {
            pendingContainer.innerHTML = `<p class="text-center text-secondary">Không có yêu cầu nào đang chờ duyệt.</p>`;
        } else {
            pendingHtml = pendingDocs.map(doc => {
                const req = doc.data();
                const reqId = doc.id;
                const reqDataString = JSON.stringify({ id: reqId, ...req });
                return `<div class="bg-tertiary p-4 rounded-lg app-shadow">
                            <div class="flex justify-between items-start">
                                <div>
                                    <p class="font-bold text-primary">${req.userDisplayName}</p>
                                    <p class="text-sm text-secondary mt-1">Muốn đổi: <span class="font-bold">${req.giftName}</span></p>
                                </div>
                                <p class="text-lg font-bold text-accent">${formatCurrency(req.price)}</p>
                            </div>
                            <button data-request='${reqDataString}' class="admin-review-gift-btn w-full p-2 mt-3 bg-accent text-on-accent font-bold rounded-md hover:bg-accent-hover">Xem & Duyệt</button>
                        </div>`;
            }).join('');
            pendingContainer.innerHTML = pendingHtml;
        }

        if (processedDocs.length === 0) {
            processedContainer.innerHTML = `<p class="text-center text-secondary">Chưa có lịch sử duyệt quà.</p>`;
        } else {
            processedHtml = processedDocs.map(doc => {
                const req = doc.data();
                const time = req.processedAt ? req.processedAt.toDate().toLocaleString('vi-VN') : '...';
                const isApproved = req.status === 'approved';
                
                const statusBadge = isApproved 
                    ? `<div class="text-xs font-bold text-white px-2 py-0.5 rounded-full inline-block bg-success">Đã duyệt</div>`
                    : `<div class="text-xs font-bold text-white px-2 py-0.5 rounded-full inline-block bg-danger">Đã từ chối</div>`;

                const adminNote = !isApproved && req.adminMessage
                    ? `<p class="text-xs text-secondary mt-1 italic">Lý do: "${req.adminMessage}"</p>`
                    : '';

                return `<div class="bg-tertiary p-4 rounded-lg opacity-80">
                            <div class="flex justify-between items-start">
                                <div>
                                    <p class="font-bold text-primary">${req.giftName}</p>
                                    <p class="text-sm text-secondary">Người dùng: ${req.userDisplayName}</p>
                                    <p class="text-xs text-secondary mt-1">${time}</p>
                                </div>
                                ${statusBadge}
                            </div>
                            ${adminNote}
                        </div>`;
            }).join('');
            processedContainer.innerHTML = processedHtml;
        }
    });
}


document.getElementById('withdrawal-requests').addEventListener('click', (e) => {
    const reviewButton = e.target.closest('.admin-review-btn');
    if (reviewButton) {
        const requestData = JSON.parse(reviewButton.dataset.request);
        const modal = document.getElementById('review-withdrawal-modal');
        document.getElementById('review-user-name').textContent = requestData.userDisplayName;
        document.getElementById('review-user-acc').textContent = requestData.userAccountNumber;
        document.getElementById('review-requested-amount').textContent = formatCurrency(requestData.amount);
        document.getElementById('review-user-reason').textContent = requestData.reason;
        document.getElementById('review-approval-amount').value = requestData.amount;
        document.getElementById('review-admin-message').value = '';
        modal.dataset.requestId = requestData.id;
        modal.dataset.userId = requestData.userId;
        modal.dataset.userName = requestData.userDisplayName;
        modal.style.display = 'flex';
    }
    const deleteBtn = e.target.closest('.admin-delete-request-btn');
    if (deleteBtn) {
        const requestId = deleteBtn.dataset.id;
        const modal = document.getElementById('confirm-delete-request-modal');
        modal.dataset.requestId = requestId;
        modal.style.display = 'flex';
    }
});

document.getElementById('confirm-delete-request-btn').addEventListener('click', async () => {
    const modal = document.getElementById('confirm-delete-request-modal');
    const requestId = modal.dataset.requestId;
    if (!requestId) return;
    
    showLoading();
    try {
        const requestRef = doc(db, `artifacts/${appId}/withdrawalRequests`, requestId);
        await deleteDoc(requestRef);
        showToast("Xóa yêu cầu thành công.");
    } catch (error) {
        showToast("Lỗi khi xóa yêu cầu: " + error.message, true);
    } finally {
        modal.style.display = 'none';
        hideLoading();
    }
});


document.getElementById('confirm-approve-btn').addEventListener('click', async () => {
    const modal = document.getElementById('review-withdrawal-modal');
    const requestId = modal.dataset.requestId;
    const userId = modal.dataset.userId;
    const userName = modal.dataset.userName;
    const approvedAmount = parseInt(document.getElementById('review-approval-amount').value);
    const adminMessage = document.getElementById('review-admin-message').value.trim() || "Yêu cầu rút tiền đã được chấp thuận.";
    if (!approvedAmount || approvedAmount <= 0) return showToast("Số tiền duyệt không hợp lệ.", true);
    
    showLoading();
    const requestRef = doc(db, `artifacts/${appId}/withdrawalRequests`, requestId);
    try {
        await runTransaction(db, async (transaction) => {
            const requestDoc = await transaction.get(requestRef);
            if (!requestDoc.exists() || requestDoc.data().status !== 'pending') throw new Error("Yêu cầu không hợp lệ hoặc đã được xử lý.");
            const userRef = doc(db, `artifacts/${appId}/users`, userId);
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists() || userDoc.data().balance < approvedAmount) throw new Error("Số dư của người dùng không đủ.");
            transaction.update(userRef, { balance: userDoc.data().balance - approvedAmount });
            transaction.update(requestRef, { 
                status: 'approved',
                approvedAmount: approvedAmount,
                adminMessage: adminMessage,
                processedAt: serverTimestamp()
            });
            transaction.set(doc(collection(db, `artifacts/${appId}/transactions`)), {
                type: 'withdraw', 
                userId: userId, 
                userName: userName, 
                amount: approvedAmount,
                content: adminMessage, 
                timestamp: serverTimestamp()
            });
        });
        showToast(getTranslatedString('requestApproved'));
        createNotification(userId, `Yêu cầu rút tiền ${formatCurrency(approvedAmount)} của bạn đã được duyệt.`, 'withdraw_approved');
    } catch (error) {
        showToast(error.message, true);
    } finally {
        modal.style.display = 'none';
        hideLoading();
    }
});

document.getElementById('confirm-reject-btn').addEventListener('click', async () => {
    const modal = document.getElementById('review-withdrawal-modal');
    const requestId = modal.dataset.requestId;
    const reason = document.getElementById('review-admin-message').value.trim();
    if (!reason) return showToast("Vui lòng nhập lý do từ chối.", true);
    showLoading();
    try {
        const requestRef = doc(db, `artifacts/${appId}/withdrawalRequests`, requestId);
        await updateDoc(requestRef, {
            status: 'rejected',
            adminMessage: reason,
            processedAt: serverTimestamp()
        });
        showToast(getTranslatedString('requestRejected'));
        createNotification(modal.dataset.userId, `Yêu cầu rút tiền của bạn đã bị từ chối. Lý do: ${reason}`, 'withdraw_rejected');
    } catch (error) {
        showToast(error.message, true);
    } finally {
        modal.style.display = 'none';
        hideLoading();
    }
});

document.getElementById('create-deposit-code-btn').addEventListener('click', async () => {
    const codeInput = document.getElementById('admin-deposit-code');
    const amountInput = document.getElementById('admin-deposit-amount');
    const code = codeInput.value.trim().toUpperCase();
    const amount = parseInt(amountInput.value);
    if (!code || !amount || amount <= 0) return showToast(getTranslatedString('invalidCodeOrAmount'), true);
    showLoading();
    try {
        const codeRef = doc(db, `artifacts/${appId}/depositCodes`, code);
        await setDoc(codeRef, {
            amount: amount,
            status: 'available',
            createdAt: serverTimestamp(),
            redeemedBy: null,
            redeemedAt: null,
            redeemedByUsername: null
        });
        showToast(getTranslatedString('codeCreated', { code, amount: formatCurrency(amount) }));
        codeInput.value = ''; amountInput.value = '';
    } catch (error) { showToast(error.message, true); } finally { hideLoading(); }
});

document.getElementById('deposit-codes-list').addEventListener('click', (e) => {
    const editBtn = e.target.closest('.admin-edit-code-btn');
    const deleteBtn = e.target.closest('.admin-delete-code-btn');
    if (editBtn) {
        const codeId = editBtn.dataset.id;
        const amount = editBtn.dataset.amount;
        document.getElementById('edit-code-id').value = codeId;
        document.getElementById('edit-code-display').value = codeId;
        document.getElementById('edit-code-amount').value = amount;
        document.getElementById('edit-deposit-code-modal').style.display = 'flex';
    }
    if (deleteBtn) {
        const codeId = deleteBtn.dataset.id;
        const modal = document.getElementById('confirm-delete-modal');
        modal.querySelector('#delete-confirmation-message').textContent = getTranslatedString('confirmDeleteCode', {code: codeId});
        modal.dataset.codeId = codeId;
        modal.style.display = 'flex';
    }
});

document.getElementById('used-deposit-codes-list').addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.admin-delete-code-btn');
    if (deleteBtn) {
        const codeId = deleteBtn.dataset.id;
        const modal = document.getElementById('confirm-delete-modal');
        modal.querySelector('#delete-confirmation-message').textContent = getTranslatedString('confirmDeleteCode', {code: codeId});
        modal.dataset.codeId = codeId;
        modal.style.display = 'flex';
    }
});

document.getElementById('confirm-edit-code-btn').addEventListener('click', async () => {
    const codeId = document.getElementById('edit-code-id').value;
    const amount = parseInt(document.getElementById('edit-code-amount').value);
    if (!codeId || !amount || amount <= 0) return showToast(getTranslatedString('invalidAmount'), true);
    showLoading();
    try {
        const codeRef = doc(db, `artifacts/${appId}/depositCodes`, codeId);
        await updateDoc(codeRef, { amount: amount });
        showToast(getTranslatedString('saveSuccess'));
        document.getElementById('edit-deposit-code-modal').style.display = 'none';
    } catch (error) { showToast(error.message, true); } finally { hideLoading(); }
});

document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
    const modal = document.getElementById('confirm-delete-modal');
    const codeId = modal.dataset.codeId;
    if (!codeId) return;
    showLoading();
    try {
        const codeRef = doc(db, `artifacts/${appId}/depositCodes`, codeId);
        await deleteDoc(codeRef);
        showToast(getTranslatedString('deleteSuccess'));
        modal.style.display = 'none';
    } catch (error) { showToast(error.message, true); } finally { hideLoading(); }
});

document.getElementById('admin-user-list').addEventListener('click', (e) => {
    const editBtn = e.target.closest('.admin-edit-user-btn');
    if (!editBtn) return;

    const userData = JSON.parse(editBtn.dataset.user);
    const modal = document.getElementById('admin-edit-user-modal');
    
    modal.querySelector('#admin-edit-user-id').value = userData.id;
    modal.querySelector('#admin-edit-display-name').value = userData.displayName;
    modal.querySelector('#admin-edit-username').value = userData.username;
    modal.querySelector('#admin-edit-account-number').value = userData.accountNumber;
    modal.querySelector('#admin-edit-balance').value = userData.balance;
    modal.querySelector('#admin-edit-email').value = userData.email;
    
    modal.style.display = 'flex';
});

document.getElementById('admin-confirm-edit-user-btn').addEventListener('click', async () => {
    const modal = document.getElementById('admin-edit-user-modal');
    const userId = modal.querySelector('#admin-edit-user-id').value;
    const newDisplayName = modal.querySelector('#admin-edit-display-name').value.trim();
    const newUsername = modal.querySelector('#admin-edit-username').value.trim().toLowerCase();
    const newAccountNumber = modal.querySelector('#admin-edit-account-number').value.trim();
    const newBalance = parseInt(modal.querySelector('#admin-edit-balance').value);

    if (!userId || !newDisplayName || !newUsername || !newAccountNumber || isNaN(newBalance)) {
        return showToast("Vui lòng điền đầy đủ và chính xác thông tin.", true);
    }
    
    showLoading();
    try {
        await runTransaction(db, async (transaction) => {
            const userRef = doc(db, `artifacts/${appId}/users`, userId);
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) throw new Error("Người dùng không tồn tại.");
            
            const oldData = userDoc.data();
            const updates = {
                displayName: newDisplayName,
                balance: newBalance,
            };

            if (newUsername !== oldData.username) {
                const newUsernameRef = doc(db, `artifacts/${appId}/uniqueIdentifiers`, `username_${newUsername}`);
                const newUsernameDoc = await transaction.get(newUsernameRef);
                if (newUsernameDoc.exists()) throw new Error("Username mới đã tồn tại.");

                const oldUsernameRef = doc(db, `artifacts/${appId}/uniqueIdentifiers`, `username_${oldData.username}`);
                transaction.delete(oldUsernameRef);
                transaction.set(newUsernameRef, { uid: userId });
                updates.username = newUsername;
            }

            if (newAccountNumber !== oldData.accountNumber) {
                const newAccNumRef = doc(db, `artifacts/${appId}/uniqueIdentifiers`, `accNum_${newAccountNumber}`);
                const newAccNumDoc = await transaction.get(newAccNumRef);
                if (newAccNumDoc.exists()) throw new Error("Số tài khoản mới đã tồn tại.");
                
                const oldAccNumRef = doc(db, `artifacts/${appId}/uniqueIdentifiers`, `accNum_${oldData.accountNumber}`);
                transaction.delete(oldAccNumRef);
                transaction.set(newAccNumRef, { uid: userId });
                updates.accountNumber = newAccountNumber;
            }

            transaction.update(userRef, updates);
        });
        showToast("Cập nhật thông tin người dùng thành công!");
    } catch (error) {
        showToast(error.message, true);
    } finally {
        modal.style.display = 'none';
        hideLoading();
    }
});


// --- SETTINGS FUNCTIONS ---
document.querySelectorAll('.theme-switcher').forEach(button => { button.addEventListener('click', () => { const theme = button.dataset.theme; document.body.className = `${theme} app-font`; localStorage.setItem('bankingAppTheme', theme); }); });
function applySavedTheme() { const savedTheme = localStorage.getItem('bankingAppTheme') || 'theme-binance'; document.body.className = `${savedTheme} app-font`; }
document.getElementById('copy-acc-btn').addEventListener('click', () => { if(currentUserData?.accountNumber) { navigator.clipboard.writeText(currentUserData.accountNumber).then(() => showToast(getTranslatedString('accNumCopied'))).catch(() => showToast(getTranslatedString('copyFailed'), true)); } });

document.getElementById('update-name-btn').addEventListener('click', async () => {
    const newName = document.getElementById('update-name-input').value.trim();
    if (!newName) return showToast(getTranslatedString('nameCannotBeEmpty'), true);
    if (newName === currentUserData.displayName) return;
    showLoading();
    try {
        const userDocRef = doc(db, `artifacts/${appId}/users`, currentUser.uid);
        await updateDoc(userDocRef, { displayName: newName });
        showToast(getTranslatedString('nameUpdated'));
    } catch (error) { showToast(error.message, true); } finally { hideLoading(); }
});

document.getElementById('update-account-info-btn').addEventListener('click', async () => {
    const newUsername = document.getElementById('update-username-input').value.trim().toLowerCase();
    const newAccountNumber = document.getElementById('update-account-number-input').value.trim();

    if (!newUsername || !newAccountNumber) {
        return showToast("Vui lòng nhập cả username và số tài khoản mới.", true);
    }
    if (newUsername === currentUserData.username && newAccountNumber === currentUserData.accountNumber) {
        return showToast("Không có thông tin nào thay đổi.", false);
    }

    if (!await verifyPin()) return;
    showLoading();

    try {
        await runTransaction(db, async (transaction) => {
            const userRef = doc(db, `artifacts/${appId}/users`, currentUser.uid);
            const updates = {};

            if (newUsername !== currentUserData.username) {
                const newUsernameRef = doc(db, `artifacts/${appId}/uniqueIdentifiers`, `username_${newUsername}`);
                const newUsernameDoc = await transaction.get(newUsernameRef);
                if (newUsernameDoc.exists()) throw new Error(getTranslatedString('usernameExists'));

                const oldUsernameRef = doc(db, `artifacts/${appId}/uniqueIdentifiers`, `username_${currentUserData.username}`);
                transaction.delete(oldUsernameRef);
                transaction.set(newUsernameRef, { uid: currentUser.uid });
                updates.username = newUsername;
            }

            if (newAccountNumber !== currentUserData.accountNumber) {
                const newAccNumRef = doc(db, `artifacts/${appId}/uniqueIdentifiers`, `accNum_${newAccountNumber}`);
                const newAccNumDoc = await transaction.get(newAccNumRef);
                if (newAccNumDoc.exists()) throw new Error(getTranslatedString('accountNumberExists'));
                
                const oldAccNumRef = doc(db, `artifacts/${appId}/uniqueIdentifiers`, `accNum_${currentUserData.accountNumber}`);
                transaction.delete(oldAccNumRef);
                transaction.set(newAccNumRef, { uid: currentUser.uid });
                updates.accountNumber = newAccountNumber;
            }
            
            if (Object.keys(updates).length > 0) {
                transaction.update(userRef, updates);
            }
        });
        showToast("Cập nhật thông tin thành công!");
    } catch (error) {
        showToast(error.message, true);
    } finally {
        hideLoading();
    }
});


document.getElementById('show-change-pin-modal-btn').addEventListener('click', () => { document.getElementById('change-pin-modal').style.display = 'flex'; });
document.getElementById('confirm-pin-change-btn').addEventListener('click', async () => {
    const currentPin = document.getElementById('current-pin').value;
    const newPin = document.getElementById('new-pin').value;
    const confirmNewPin = document.getElementById('confirm-new-pin').value;
    if (!currentPin || !newPin || !confirmNewPin) return showToast(getTranslatedString('fillAllPinFields'), true);
    if (newPin.length !== 6 || !/^\d+$/.test(newPin)) return showToast(getTranslatedString('newPinMustBe6Digits'), true);
    if (newPin !== confirmNewPin) return showToast(getTranslatedString('pinsDoNotMatch'), true);
    showLoading();
    try {
        const currentPinHash = await hashPin(currentPin);
        if (currentPinHash !== currentUserData.pinHash) throw new Error(getTranslatedString('currentPinIncorrect'));
        const newPinHash = await hashPin(newPin);
        const userDocRef = doc(db, `artifacts/${appId}/users`, currentUser.uid);
        await updateDoc(userDocRef, { pinHash: newPinHash });
        document.getElementById('change-pin-modal').style.display = 'none';
        ['current-pin', 'new-pin', 'confirm-new-pin'].forEach(id => document.getElementById(id).value = '');
        showToast(getTranslatedString('pinChanged'));
    } catch(error) { showToast(error.message, true); } finally { hideLoading(); }
});

// --- GIFT FUNCTIONS ---
let unsubscribeGifts = null;
function setupGiftsTab() {
    if (unsubscribeGifts) unsubscribeGifts();
    const giftsList = document.getElementById('gifts-list');
    let q;
    switch (currentGiftSortOrder) {
        case 'price_asc':
            q = query(collection(db, `artifacts/${appId}/gifts`), orderBy('price', 'asc'));
            break;
        case 'price_desc':
            q = query(collection(db, `artifacts/${appId}/gifts`), orderBy('price', 'desc'));
            break;
        case 'newest':
        default:
            q = query(collection(db, `artifacts/${appId}/gifts`), orderBy('createdAt', 'desc'));
            break;
    }

    unsubscribeGifts = onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            giftsList.innerHTML = `<p class="text-center text-secondary col-span-2">Hiện chưa có quà nào.</p>`;
            return;
        }
        giftsList.innerHTML = snapshot.docs.map(doc => {
            const gift = doc.data();
            const soldOut = gift.quantity <= 0;
            return `<div class="bg-secondary rounded-lg p-3 flex flex-col app-shadow">
                        <img src="${gift.imageUrl}" alt="${gift.name}" class="w-full h-28 object-cover rounded-md mb-3">
                        <p class="font-bold text-primary text-sm flex-grow">${gift.name}</p>
                        <p class="text-xs text-secondary mt-1">Còn lại: ${gift.quantity}</p>
                        <button data-id="${doc.id}" data-name="${gift.name}" data-price="${gift.price}" ${soldOut ? 'disabled' : ''} 
                                class="redeem-gift-btn mt-3 w-full p-2 text-sm bg-accent text-on-accent font-bold rounded-md transition-opacity 
                                ${soldOut ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent-hover'}">
                            ${soldOut ? 'Hết quà' : `Đổi ${formatCurrency(gift.price)}`}
                        </button>
                    </div>`;
        }).join('');
    });
}

document.getElementById('gift-filters').addEventListener('click', (e) => {
    const filterBtn = e.target.closest('.gift-filter-btn');
    if (!filterBtn) return;
    
    currentGiftSortOrder = filterBtn.dataset.sort;
    
    document.querySelectorAll('.gift-filter-btn').forEach(btn => btn.classList.remove('active'));
    filterBtn.classList.add('active');

    setupGiftsTab();
});


document.getElementById('gifts-list').addEventListener('click', async (e) => {
    const redeemBtn = e.target.closest('.redeem-gift-btn');
    if (!redeemBtn) return;

    const giftId = redeemBtn.dataset.id;
    const price = parseInt(redeemBtn.dataset.price);

    if (currentUserData.balance < price) {
        return showToast("Số dư không đủ để đổi quà này.", true);
    }
    if (!await verifyPin()) return;

    showLoading();
    try {
        const giftRequestsRef = collection(db, `artifacts/${appId}/giftRequests`);
        const q = query(giftRequestsRef, where('userId', '==', currentUser.uid), where('giftId', '==', giftId), where('status', '==', 'pending'));
        const existingRequest = await getDocs(q);
        if (!existingRequest.empty) {
            throw new Error("Bạn đã gửi yêu cầu cho quà này rồi.");
        }

        const giftDoc = await getDoc(doc(db, `artifacts/${appId}/gifts`, giftId));
        if (!giftDoc.exists() || giftDoc.data().quantity <= 0) {
             throw new Error("Quà đã hết hoặc không tồn tại.");
        }

        await addDoc(giftRequestsRef, {
            userId: currentUser.uid,
            userDisplayName: currentUserData.displayName,
            giftId: giftId,
            giftName: giftDoc.data().name,
            price: giftDoc.data().price,
            status: 'pending',
            createdAt: serverTimestamp()
        });

        showToast("Yêu cầu đổi quà đã được gửi đi, vui lòng chờ Admin duyệt.");
        redeemBtn.textContent = "Đang chờ duyệt";
        redeemBtn.disabled = true;

    } catch (error) {
        showToast(error.message, true);
    } finally {
        hideLoading();
    }
});

function setupAdminGiftsList() {
    if (unsubscribeAdminGifts) unsubscribeAdminGifts();
    const giftsContainer = document.getElementById('admin-gifts-list');
    const q = query(collection(db, `artifacts/${appId}/gifts`), orderBy('createdAt', 'desc'));
    unsubscribeAdminGifts = onSnapshot(q, (snapshot) => {
        giftsContainer.innerHTML = snapshot.docs.map(doc => {
            const gift = doc.data();
            const giftData = `data-id="${doc.id}" data-name="${gift.name}" data-price="${gift.price}" data-image-url="${gift.imageUrl}" data-quantity="${gift.quantity}"`;

            return `<div class="bg-tertiary p-3 rounded-lg flex justify-between items-center">
                        <div>
                            <p class="font-bold text-primary">${gift.name}</p>
                            <p class="text-xs text-secondary">${formatCurrency(gift.price)} - Còn lại: ${gift.quantity}</p>
                        </div>
                        <div class="flex gap-2">
                            <button ${giftData} class="admin-edit-gift-btn p-2 h-8 w-8 text-sm bg-secondary rounded-md text-accent"><i class="fas fa-pen"></i></button>
                            <button data-id="${doc.id}" class="admin-delete-gift-btn p-2 h-8 w-8 text-sm bg-secondary rounded-md text-danger"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>`;
        }).join('');
    });
}

document.getElementById('create-gift-btn').addEventListener('click', async () => {
    const name = document.getElementById('admin-gift-name').value;
    const price = parseInt(document.getElementById('admin-gift-price').value);
    const imageUrl = document.getElementById('admin-gift-image').value;
    const quantity = parseInt(document.getElementById('admin-gift-quantity').value);
    if (!name || !price || !imageUrl || !quantity) return showToast("Vui lòng điền đầy đủ thông tin quà.", true);
    await addDoc(collection(db, `artifacts/${appId}/gifts`), { 
        name, 
        price, 
        imageUrl, 
        quantity, 
        createdAt: serverTimestamp() 
    });
    showToast("Tạo quà thành công.");
    ['admin-gift-name', 'admin-gift-price', 'admin-gift-image', 'admin-gift-quantity'].forEach(id => document.getElementById(id).value = '');
});

document.getElementById('admin-gifts-list').addEventListener('click', async (e) => {
    const deleteBtn = e.target.closest('.admin-delete-gift-btn');
    if (deleteBtn) {
        const giftId = deleteBtn.dataset.id;
        if (confirm(`Bạn có chắc muốn xóa quà này không?`)) {
            await deleteDoc(doc(db, `artifacts/${appId}/gifts`, giftId));
            showToast("Xóa quà thành công.");
        }
    }

    const editBtn = e.target.closest('.admin-edit-gift-btn');
    if (editBtn) {
        const modal = document.getElementById('edit-gift-modal');
        document.getElementById('edit-gift-id').value = editBtn.dataset.id;
        document.getElementById('edit-gift-name').value = editBtn.dataset.name;
        document.getElementById('edit-gift-price').value = editBtn.dataset.price;
        document.getElementById('edit-gift-image').value = editBtn.dataset.imageUrl;
        document.getElementById('edit-gift-quantity').value = editBtn.dataset.quantity;
        modal.style.display = 'flex';
    }
});

// --- MISSION FUNCTIONS ---
function setupMissionsTab() {
    const missionsList = document.getElementById('missions-list');
    const q = query(collection(db, `artifacts/${appId}/missions`));
    onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            missionsList.innerHTML = `<p class="text-center text-secondary">Hiện chưa có nhiệm vụ nào.</p>`;
            return;
        }
        missionsList.innerHTML = snapshot.docs.map(doc => {
            const mission = doc.data();
            const now = new Date();
            const isExpired = mission.deadline && new Date(mission.deadline) < now;
            const userParticipant = mission.participants.find(p => p.uid === currentUser.uid);
            
            let statusBadge = '';

            if (isExpired) {
                statusBadge = `<div class="absolute top-2 right-2 text-xs font-bold text-white px-2 py-1 rounded-full bg-danger">Hết hạn</div>`;
            } else if (userParticipant) {
                const participantStatus = userParticipant.status;
                if (participantStatus === 'pending') {
                    statusBadge = `<div class="absolute top-2 right-2 text-xs font-bold text-white px-2 py-1 rounded-full bg-blue-500">Đã nhận</div>`;
                } else if (participantStatus === 'completed') {
                    statusBadge = `<div class="absolute top-2 right-2 text-xs font-bold text-on-accent px-2 py-1 rounded-full bg-accent">Chờ duyệt</div>`;
                } else if (participantStatus === 'approved' || participantStatus === 'rejected') {
                    if (mission.repeat === 'none' && participantStatus === 'approved') {
                        statusBadge = `<div class="absolute top-2 right-2 text-xs font-bold text-white px-2 py-1 rounded-full bg-success">Đã hoàn thành</div>`;
                    } else if (userParticipant.lastCompleted) {
                        const lastCompletedDate = userParticipant.lastCompleted.toDate();
                        let canRedo = false;
                        if (mission.repeat === 'daily' && !isSameDay(lastCompletedDate, now)) canRedo = true;
                        if (mission.repeat === 'weekly' && !isSameWeek(lastCompletedDate, now)) canRedo = true;
                        if (mission.repeat === 'monthly' && !isSameMonth(lastCompletedDate, now)) canRedo = true;

                        if (!canRedo) {
                             statusBadge = `<div class="absolute top-2 right-2 text-xs font-bold text-white px-2 py-1 rounded-full bg-success">Đã hoàn thành</div>`;
                        }
                    }
                }
            }
            
            return `<div data-id="${doc.id}" class="mission-item bg-secondary p-4 rounded-lg app-shadow relative cursor-pointer hover:bg-tertiary">
                        ${statusBadge}
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 flex items-center justify-center bg-tertiary rounded-full text-accent text-xl"><i class="fas fa-tasks"></i></div>
                            <div>
                                <p class="font-bold text-primary">${mission.name}</p>
                                <p class="text-sm text-accent font-bold">${formatCurrency(mission.reward)}</p>
                                <p class="text-xs text-secondary mt-1">Người nhận: ${mission.participants.length}/${mission.limit}</p>
                            </div>
                        </div>
                    </div>`;
        }).join('');
    });
}

document.getElementById('missions-list').addEventListener('click', async (e) => {
    const missionItem = e.target.closest('.mission-item');
    if (missionItem) {
        const missionId = missionItem.dataset.id;
        const missionDoc = await getDoc(doc(db, `artifacts/${appId}/missions`, missionId));
        const mission = missionDoc.data();
        
        const modal = document.getElementById('mission-details-modal');
        modal.dataset.id = missionId;
        document.getElementById('mission-details-name').textContent = mission.name;
        document.getElementById('mission-details-reward').textContent = formatCurrency(mission.reward);
        document.getElementById('mission-details-description').textContent = mission.description;
        document.getElementById('mission-details-participants').textContent = `Số người đã nhận: ${mission.participants.length}/${mission.limit}`;
        
        if (mission.deadline) {
            document.getElementById('mission-details-deadline').textContent = `Hết hạn: ${new Date(mission.deadline).toLocaleDateString('vi-VN')}`;
        } else {
            document.getElementById('mission-details-deadline').textContent = `Hết hạn: Vô thời hạn`;
        }

        const acceptBtn = document.getElementById('accept-mission-btn');
        const submitBtn = document.getElementById('submit-mission-btn');
        
        acceptBtn.classList.add('hidden');
        submitBtn.classList.add('hidden');

        const userParticipant = mission.participants.find(p => p.uid === currentUser.uid);
        const now = new Date();
        const isExpired = mission.deadline && new Date(mission.deadline) < now;

        let isEligible = false;
        if (!isExpired) {
            if (!userParticipant) {
                isEligible = true;
            } else {
                if (userParticipant.status === 'pending') {
                    submitBtn.classList.remove('hidden');
                } else if (userParticipant.status === 'approved' || userParticipant.status === 'rejected') {
                    if (userParticipant.lastCompleted) {
                        const lastCompletedDate = userParticipant.lastCompleted.toDate();
                        if (mission.repeat === 'daily' && !isSameDay(lastCompletedDate, now)) isEligible = true;
                        if (mission.repeat === 'weekly' && !isSameWeek(lastCompletedDate, now)) isEligible = true;
                        if (mission.repeat === 'monthly' && !isSameMonth(lastCompletedDate, now)) isEligible = true;
                    }
                }
            }
        }
        
        if (isEligible && mission.participants.filter(p => p.status !== 'approved' && p.status !== 'rejected').length < mission.limit) {
            acceptBtn.classList.remove('hidden');
        }
        
        modal.style.display = 'flex';
    }
});

document.getElementById('accept-mission-btn').addEventListener('click', async (e) => {
    const missionId = e.target.closest('.modal-overlay').dataset.id;
    const missionRef = doc(db, `artifacts/${appId}/missions`, missionId);
    showLoading();
    try {
        await runTransaction(db, async (transaction) => {
            const missionDoc = await transaction.get(missionRef);
            if (!missionDoc.exists()) throw new Error("Nhiệm vụ không tồn tại.");
            let participants = missionDoc.data().participants || [];
            if (participants.some(p => p.uid === currentUser.uid)) {
                 throw new Error("Bạn đã nhận nhiệm vụ này rồi.");
            }
            if (participants.length >= missionDoc.data().limit) {
                throw new Error("Nhiệm vụ đã đủ số người nhận.");
            }
            participants.push({
                uid: currentUser.uid,
                name: currentUserData.displayName,
                status: 'pending' // Initial status
            });
            transaction.update(missionRef, { participants: participants });
        });
        showToast("Nhận nhiệm vụ thành công!");
        document.getElementById('mission-details-modal').style.display = 'none';
    } catch(error) {
        showToast(error.message, true);
    } finally {
        hideLoading();
    }
});


document.getElementById('submit-mission-btn').addEventListener('click', async (e) => {
    const missionId = e.target.closest('.modal-overlay').dataset.id;
    const missionRef = doc(db, `artifacts/${appId}/missions`, missionId);
    showLoading();
    try {
        await runTransaction(db, async (transaction) => {
            const missionDoc = await transaction.get(missionRef);
            if (!missionDoc.exists()) throw new Error("Nhiệm vụ không tồn tại.");
            let participants = missionDoc.data().participants || [];
            const userIndex = participants.findIndex(p => p.uid === currentUser.uid);
            if (userIndex === -1) throw new Error("Bạn chưa nhận nhiệm vụ này.");
            participants[userIndex].status = 'completed';
            transaction.update(missionRef, { participants: participants });
        });
        showToast("Nộp nhiệm vụ thành công, vui lòng chờ admin duyệt.");
        document.getElementById('mission-details-modal').style.display = 'none';
    } catch(error) {
        showToast(error.message, true);
    } finally {
        hideLoading();
    }
});

function setupAdminMissionsList() {
    if (unsubscribeAdminMissions) unsubscribeAdminMissions();
    const missionsContainer = document.getElementById('admin-missions-list');
    const q = query(collection(db, `artifacts/${appId}/missions`), orderBy('deadline', 'desc'));
    unsubscribeAdminMissions = onSnapshot(q, (snapshot) => {
        let pendingMissions = 0;
        snapshot.docs.forEach(doc => {
            const mission = doc.data();
            const submissions = mission.participants.filter(p => p.status === 'completed').length;
            pendingMissions += submissions;
        });
        document.getElementById('admin-pending-missions').textContent = pendingMissions;

        missionsContainer.innerHTML = snapshot.docs.map(doc => {
            const mission = doc.data();
            const submissions = mission.participants.filter(p => p.status === 'completed').length;
            const missionDataString = JSON.stringify({ id: doc.id, ...mission });

            return `<div class="bg-tertiary p-3 rounded-lg">
                        <p class="font-bold text-primary">${mission.name}</p>
                        <p class="text-xs text-secondary">Hết hạn: ${mission.deadline ? new Date(mission.deadline).toLocaleDateString('vi-VN') : 'Vô hạn'}</p>
                        <div class="flex justify-between items-center mt-2">
                           <button data-id="${doc.id}" class="admin-review-mission-btn p-2 text-accent">Duyệt (${submissions})</button>
                           <div class="flex gap-2">
                               <button data-mission='${missionDataString}' class="admin-edit-mission-btn p-2 text-accent"><i class="fas fa-pen"></i></button>
                               <button data-id="${doc.id}" class="admin-delete-mission-btn p-2 text-danger"><i class="fas fa-trash"></i></button>
                           </div>
                        </div>
                    </div>`;
        }).join('');
    });
}

document.getElementById('admin-missions-list').addEventListener('click', async (e) => {
    const reviewBtn = e.target.closest('.admin-review-mission-btn');
    const deleteBtn = e.target.closest('.admin-delete-mission-btn');
    const editBtn = e.target.closest('.admin-edit-mission-btn');
    
    if (reviewBtn) {
        const missionId = reviewBtn.dataset.id;
        const missionDoc = await getDoc(doc(db, `artifacts/${appId}/missions`, missionId));
        const mission = missionDoc.data();
        const submissionsList = document.getElementById('mission-submissions-list');
        const completedParticipants = mission.participants.filter(p => p.status === 'completed');
        
        if (completedParticipants.length === 0) {
            submissionsList.innerHTML = `<p class="text-center text-secondary">Chưa có ai nộp nhiệm vụ.</p>`;
        } else {
            submissionsList.innerHTML = completedParticipants.map(p => `<div class="flex justify-between items-center bg-tertiary p-2 rounded">
                            <p>${p.name}</p>
                            <div class="flex gap-2">
                                <button data-mission-id="${missionId}" data-user-id="${p.uid}" data-action="approve" class="approve-mission-btn p-2 text-success"><i class="fas fa-check"></i></button>
                                <button data-mission-id="${missionId}" data-user-id="${p.uid}" data-action="reject" class="approve-mission-btn p-2 text-danger"><i class="fas fa-times"></i></button>
                            </div>
                       </div>`).join('');
        }
        document.getElementById('review-mission-modal').style.display = 'flex';
    }

    if (deleteBtn) {
        const missionId = deleteBtn.dataset.id;
        if (confirm(`Bạn có chắc muốn xóa nhiệm vụ này không?`)) {
            await deleteDoc(doc(db, `artifacts/${appId}/missions`, missionId));
            showToast("Xóa nhiệm vụ thành công.");
        }
    }

    if (editBtn) {
        const missionData = JSON.parse(editBtn.dataset.mission);
        const modal = document.getElementById('edit-mission-modal');
        document.getElementById('edit-mission-id').value = missionData.id;
        document.getElementById('edit-mission-name').value = missionData.name;
        document.getElementById('edit-mission-reward').value = missionData.reward;
        document.getElementById('edit-mission-repeat').value = missionData.repeat || 'none';
        document.getElementById('edit-mission-deadline').value = missionData.deadline || '';
        document.getElementById('edit-mission-description').value = missionData.description;
        document.getElementById('edit-mission-limit').value = missionData.limit;
        modal.style.display = 'flex';
    }
});

document.getElementById('mission-submissions-list').addEventListener('click', async (e) => {
    const actionBtn = e.target.closest('.approve-mission-btn');
    if(actionBtn) {
        const missionId = actionBtn.dataset.missionId;
        const userId = actionBtn.dataset.userId;
        const action = actionBtn.dataset.action;
        const missionRef = doc(db, `artifacts/${appId}/missions`, missionId);
        showLoading();
        try {
            await runTransaction(db, async(transaction) => {
                const missionDoc = await transaction.get(missionRef);
                const missionData = missionDoc.data();
                
                let participants = missionData.participants;
                const userIndex = participants.findIndex(p => p.uid === userId);
                
                if (userIndex === -1) return;

                participants[userIndex].lastCompleted = new Date();

                if (action === 'approve') {
                    const userRef = doc(db, `artifacts/${appId}/users`, userId);
                    const userDoc = await transaction.get(userRef);

                    participants[userIndex].status = 'approved';
                    transaction.update(missionRef, { participants });
                    transaction.update(userRef, { balance: userDoc.data().balance + missionData.reward });

                    const historyRef = doc(collection(db, `artifacts/${appId}/users/${userId}/missionHistory`));
                    transaction.set(historyRef, {
                        missionName: missionData.name,
                        reward: missionData.reward,
                        completedAt: serverTimestamp(),
                        status: 'approved'
                    });

                } else { // reject
                     participants[userIndex].status = 'rejected';
                     transaction.update(missionRef, { participants });
                }
            });
            showToast(`Đã ${action === 'approve' ? 'duyệt' : 'từ chối'} nhiệm vụ.`);
            actionBtn.closest('.flex').innerHTML = `<p class="text-secondary text-sm">Đã ${action === 'approve' ? 'duyệt' : 'từ chối'}</p>`;
        } catch(error) {
            showToast(error.message, true);
        } finally {
            hideLoading();
        }
    }
});

document.getElementById('create-mission-btn').addEventListener('click', async () => {
    const name = document.getElementById('admin-mission-name').value;
    const reward = parseInt(document.getElementById('admin-mission-reward').value);
    const repeat = document.getElementById('admin-mission-repeat').value;
    const deadline = document.getElementById('admin-mission-deadline').value;
    const description = document.getElementById('admin-mission-description').value;
    const limit = parseInt(document.getElementById('admin-mission-limit').value);
    
    if (!name || !reward || !description || !limit) return showToast("Vui lòng điền đầy đủ thông tin nhiệm vụ.", true);

    await addDoc(collection(db, `artifacts/${appId}/missions`), { 
        name, 
        reward, 
        deadline: deadline || null,
        repeat,
        description, 
        limit, 
        participants: [] 
    });

    showToast("Tạo nhiệm vụ thành công.");
    ['admin-mission-name', 'admin-mission-reward', 'admin-mission-deadline', 'admin-mission-description', 'admin-mission-limit'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('admin-mission-repeat').value = 'none';
});

// --- HISTORY FUNCTIONS ---
document.querySelectorAll('.history-sub-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.historyType;
        document.querySelectorAll('.history-sub-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.history-content').forEach(c => c.classList.add('hidden'));
        document.getElementById(`history-content-${type}`).classList.remove('hidden');
    });
});

async function fetchGiftHistory(userId) {
    const historyContainer = document.getElementById('history-content-gifts');
    const q = query(collection(db, `artifacts/${appId}/users/${userId}/giftHistory`), orderBy('redeemedAt', 'desc'));
    onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            historyContainer.innerHTML = `<p class="text-center text-secondary py-4">Chưa có lịch sử đổi quà.</p>`;
            return;
        }
        historyContainer.innerHTML = snapshot.docs.map(doc => {
            const history = doc.data();
            const time = history.redeemedAt ? history.redeemedAt.toDate().toLocaleDateString('vi-VN') : '...';
            
            let statusBadge = '';
            let amountClass = 'text-danger';
            let amountSign = '-';
            
            switch(history.status) {
                case 'approved':
                    statusBadge = `<span class="text-xs text-success">(Thành công)</span>`;
                    break;
                case 'rejected':
                    statusBadge = `<span class="text-xs text-danger">(Bị từ chối)</span>`;
                    amountClass = 'text-secondary';
                    amountSign = ''; 
                    break;
                default: 
                     statusBadge = `<span class="text-xs text-success">(Thành công)</span>`;
            }

            return `<div class="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 flex items-center justify-center bg-tertiary rounded-full text-accent"><i class="fas fa-gift"></i></div>
                            <div>
                                <p class="font-semibold text-sm text-primary">Đổi quà: ${history.giftName} ${statusBadge}</p>
                                <p class="text-xs text-secondary">${time}</p>
                            </div>
                        </div>
                        <p class="font-bold text-sm ${amountClass}">${amountSign}${formatCurrency(history.price)}</p>
                    </div>`;
        }).join('');
    });
}

async function fetchMissionHistory(userId) {
    const historyContainer = document.getElementById('history-content-missions');
    const q = query(collection(db, `artifacts/${appId}/users/${userId}/missionHistory`), orderBy('completedAt', 'desc'));
    onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            historyContainer.innerHTML = `<p class="text-center text-secondary py-4">Chưa có lịch sử làm nhiệm vụ.</p>`;
            return;
        }
        historyContainer.innerHTML = snapshot.docs.map(doc => {
            const history = doc.data();
            const time = history.completedAt ? history.completedAt.toDate().toLocaleDateString('vi-VN') : '...';
            return `<div class="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 flex items-center justify-center bg-tertiary rounded-full text-success"><i class="fas fa-tasks"></i></div>
                            <div>
                                <p class="font-semibold text-sm text-primary">Hoàn thành: ${history.missionName}</p>
                                <p class="text-xs text-secondary">${time}</p>
                            </div>
                        </div>
                        <p class="font-bold text-sm text-success">+${formatCurrency(history.reward)}</p>
                    </div>`;
        }).join('');
    });
}

async function fetchGiftApprovalHistory(userId) {
    const historyContainer = document.getElementById('history-content-gift-approvals');
    const q = query(collection(db, `artifacts/${appId}/giftRequests`), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            historyContainer.innerHTML = `<p class="text-center text-secondary py-4">Chưa có lịch sử duyệt quà.</p>`;
            return;
        }
        historyContainer.innerHTML = snapshot.docs.map(doc => {
            const history = doc.data();
            const time = history.createdAt ? history.createdAt.toDate().toLocaleDateString('vi-VN') : '...';
            let statusBadge = '';
            switch(history.status) {
                case 'approved': statusBadge = `<div class="text-xs font-bold text-white px-2 py-0.5 rounded-full inline-block bg-success">Đã duyệt</div>`; break;
                case 'rejected': statusBadge = `<div class="text-xs font-bold text-white px-2 py-0.5 rounded-full inline-block bg-danger">Đã từ chối</div>`; break;
                default: statusBadge = `<div class="text-xs font-bold text-on-accent px-2 py-0.5 rounded-full inline-block bg-accent">Đang chờ</div>`;
            }
            return `<div class="bg-tertiary p-4 rounded-lg">
                        <div class="flex justify-between items-start">
                             <div>
                                <p class="font-bold text-primary">${history.giftName}</p>
                                <p class="text-sm text-secondary mt-1">${formatCurrency(history.price)}</p>
                                <p class="text-xs text-secondary mt-1">${time}</p>
                             </div>
                            ${statusBadge}
                        </div>
                    </div>`;
        }).join('');
    });
}


// --- ADMIN TAB SWITCHING LOGIC ---
document.querySelectorAll('.admin-tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        const tabId = button.dataset.adminTab;
        document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.admin-tab-pane').forEach(pane => pane.classList.add('hidden'));
        button.classList.add('active');
        document.getElementById(`admin-tab-${tabId}`).classList.remove('hidden');
    });
});

document.getElementById('admin-tab-content').addEventListener('click', (e) => {
    const reviewButton = e.target.closest('.admin-review-gift-btn');
    if (reviewButton) {
        const requestData = JSON.parse(reviewButton.dataset.request);
        const modal = document.getElementById('review-gift-modal');
        
        modal.dataset.requestId = requestData.id;
        modal.dataset.giftId = requestData.giftId;
        modal.dataset.userId = requestData.userId;
        modal.dataset.price = requestData.price;
        
        document.getElementById('review-gift-user-name').textContent = requestData.userDisplayName;
        document.getElementById('review-gift-name').textContent = requestData.giftName;
        document.getElementById('review-gift-price').textContent = formatCurrency(requestData.price);
        document.getElementById('review-gift-admin-message').value = '';

        modal.style.display = 'flex';
    }
});

document.getElementById('confirm-approve-gift-btn').addEventListener('click', async (e) => {
    const modal = e.target.closest('#review-gift-modal');
    const requestId = modal.dataset.requestId;
    const giftId = modal.dataset.giftId;
    const userId = modal.dataset.userId;
    const price = parseInt(modal.dataset.price);

    showLoading();
    try {
        await runTransaction(db, async (transaction) => {
            const requestRef = doc(db, `artifacts/${appId}/giftRequests`, requestId);
            const userRef = doc(db, `artifacts/${appId}/users`, userId);
            const giftRef = doc(db, `artifacts/${appId}/gifts`, giftId);

            const [requestDoc, userDoc, giftDoc] = await Promise.all([
                transaction.get(requestRef),
                transaction.get(userRef),
                transaction.get(giftRef)
            ]);

            if (!requestDoc.exists() || requestDoc.data().status !== 'pending') throw new Error("Yêu cầu không hợp lệ hoặc đã được xử lý.");
            if (!userDoc.exists() || userDoc.data().balance < price) throw new Error("Số dư người dùng không đủ.");
            if (!giftDoc.exists() || giftDoc.data().quantity < 1) throw new Error("Quà đã hết.");

            transaction.update(userRef, { balance: userDoc.data().balance - price });
            transaction.update(giftRef, { quantity: giftDoc.data().quantity - 1 });
            transaction.update(requestRef, { status: 'approved', processedAt: serverTimestamp() });
            
            const historyRef = doc(collection(db, `artifacts/${appId}/users/${userId}/giftHistory`));
            transaction.set(historyRef, {
                giftName: giftDoc.data().name,
                price: price,
                redeemedAt: serverTimestamp(),
                status: 'approved'
            });
        });
        showToast("Đã duyệt yêu cầu đổi quà.");
        createNotification(userId, `Yêu cầu đổi quà "${document.getElementById('review-gift-name').textContent}" của bạn đã được duyệt.`, 'gift_approved');
    } catch (error) {
        showToast(error.message, true);
    } finally {
        modal.style.display = 'none';
        hideLoading();
    }
});

document.getElementById('confirm-reject-gift-btn').addEventListener('click', async (e) => {
    const modal = e.target.closest('#review-gift-modal');
    const requestId = modal.dataset.requestId;
    const userId = modal.dataset.userId;
    const reason = document.getElementById('review-gift-admin-message').value.trim() || "Không có lý do.";

    showLoading();
    try {
        const requestRef = doc(db, `artifacts/${appId}/giftRequests`, requestId);
        await updateDoc(requestRef, { status: 'rejected', adminMessage: reason, processedAt: serverTimestamp() });
        
        const giftDoc = await getDoc(doc(db, `artifacts/${appId}/gifts`, modal.dataset.giftId));
        const historyRef = doc(collection(db, `artifacts/${appId}/users/${userId}/giftHistory`));
        await setDoc(historyRef, {
                giftName: giftDoc.data().name,
                price: parseInt(modal.dataset.price),
                redeemedAt: serverTimestamp(),
                status: 'rejected',
                reason: reason
            });

        showToast("Đã từ chối yêu cầu.");
        createNotification(userId, `Yêu cầu đổi quà của bạn đã bị từ chối. Lý do: ${reason}`, 'gift_rejected');
    } catch (error) {
        showToast(error.message, true);
    } finally {
        modal.style.display = 'none';
        hideLoading();
    }
});

document.getElementById('confirm-edit-gift-btn').addEventListener('click', async () => {
    const modal = document.getElementById('edit-gift-modal');
    const giftId = document.getElementById('edit-gift-id').value;
    
    const updatedData = {
        name: document.getElementById('edit-gift-name').value,
        price: parseInt(document.getElementById('edit-gift-price').value),
        imageUrl: document.getElementById('edit-gift-image').value,
        quantity: parseInt(document.getElementById('edit-gift-quantity').value)
    };

    if (!updatedData.name || !updatedData.price || !updatedData.imageUrl || isNaN(updatedData.quantity)) {
        return showToast("Vui lòng điền đầy đủ thông tin.", true);
    }

    showLoading();
    try {
        const giftRef = doc(db, `artifacts/${appId}/gifts`, giftId);
        await updateDoc(giftRef, updatedData);
        showToast("Cập nhật quà thành công!");
    } catch (error) {
        showToast("Lỗi khi cập nhật: " + error.message, true);
    } finally {
        modal.style.display = 'none';
        hideLoading();
    }
});

document.getElementById('confirm-edit-mission-btn').addEventListener('click', async () => {
    const modal = document.getElementById('edit-mission-modal');
    const missionId = document.getElementById('edit-mission-id').value;

    const updatedData = {
        name: document.getElementById('edit-mission-name').value,
        reward: parseInt(document.getElementById('edit-mission-reward').value),
        repeat: document.getElementById('edit-mission-repeat').value,
        deadline: document.getElementById('edit-mission-deadline').value || null,
        description: document.getElementById('edit-mission-description').value,
        limit: parseInt(document.getElementById('edit-mission-limit').value)
    };
    
    if (!updatedData.name || !updatedData.reward || !updatedData.description || !updatedData.limit) {
        return showToast("Vui lòng điền đầy đủ thông tin.", true);
    }

    showLoading();
    try {
        const missionRef = doc(db, `artifacts/${appId}/missions`, missionId);
        await updateDoc(missionRef, updatedData);
        showToast("Cập nhật nhiệm vụ thành công!");
    } catch (error) {
        showToast("Lỗi khi cập nhật: " + error.message, true);
    } finally {
        modal.style.display = 'none';
        hideLoading();
    }
});

// --- LUCKY WHEEL FUNCTIONS (NEW & IMPROVED) ---

async function setupLuckyWheel() {
    const grid = document.getElementById('lucky-wheel-grid');
    const configRef = doc(db, `artifacts/${appId}/luckyWheel`, 'config');
    const configSnap = await getDoc(configRef);

    let prizes = [];
    let spinCost = 0;
    if (configSnap.exists()) {
        prizes = configSnap.data().prizes || [];
        spinCost = configSnap.data().spinCost || 0;
    }
    
    document.getElementById('spin-cost-display').textContent = formatCurrency(spinCost);
    document.getElementById('spin-turns-display').textContent = currentUserData.spinTurns || 0;

    grid.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        if (i === 4) { // Center button
            const hasFreeSpins = (currentUserData.spinTurns || 0) > 0;
            const buttonText = hasFreeSpins ? 'QUAY (Miễn phí)' : `QUAY (${formatCurrency(spinCost)})`;
            grid.innerHTML += `<button id="spin-btn" class="lucky-wheel-item">
                                 <i class="fas fa-play text-4xl"></i>
                                 <span style="font-size: 10px;">${buttonText}</span>
                               </button>`;
        } else {
            const prizeIndex = i < 4 ? i : i - 1;
            const prize = prizes[prizeIndex] || { name: '...', imageUrl: 'https://via.placeholder.com/50' };
            grid.innerHTML += `<div class="lucky-wheel-item" data-index="${prizeIndex}">
                                 <img src="${prize.imageUrl}" alt="${prize.name}">
                                 <span>${prize.name}</span>
                               </div>`;
        }
    }

    const spinBtn = document.getElementById('spin-btn');
    if (spinBtn) {
        spinBtn.addEventListener('click', handleSpin);
    }
}

async function handleSpin() {
    const spinBtn = document.getElementById('spin-btn');
    spinBtn.disabled = true;
    let wonPrize; 

    try {
        const configRef = doc(db, `artifacts/${appId}/luckyWheel`, 'config');
        const userRef = doc(db, `artifacts/${appId}/users`, currentUser.uid);

        await runTransaction(db, async (transaction) => {
            // --- READS FIRST ---
            const configDoc = await transaction.get(configRef);
            const userDoc = await transaction.get(userRef);

            if (!configDoc.exists()) throw new Error("Vòng quay chưa được cấu hình.");
            if (!userDoc.exists()) throw new Error("Không tìm thấy người dùng.");

            // --- LOGIC & CHECKS (NO WRITES YET) ---
            const spinCost = configDoc.data().spinCost || 0;
            const userData = userDoc.data();
            const currentTurns = userData.spinTurns || 0;
            const currentBalance = userData.balance;

            const hasFreeSpins = currentTurns > 0;
            if (!hasFreeSpins && currentBalance < spinCost) {
                throw new Error("Số dư không đủ để quay.");
            }

            let prizes = (configDoc.data().prizes || []).map((p, index) => ({...p, originalIndex: index}));
            prizes = prizes.filter(p => p.quantity > 0);
            if (prizes.length === 0) throw new Error("Tất cả phần thưởng đã hết.");

            const totalRate = prizes.reduce((sum, p) => sum + p.winRate, 0);
            if (totalRate <= 0) throw new Error("Vòng quay chưa được cấu hình tỉ lệ trúng.");

            let random = Math.random() * totalRate;
            for (const prize of prizes) {
                random -= prize.winRate;
                if (random <= 0) {
                    wonPrize = prize;
                    break;
                }
            }
            if (!wonPrize) wonPrize = prizes[prizes.length - 1];

            // --- WRITES LAST ---
            if (hasFreeSpins) {
                transaction.update(userRef, { spinTurns: currentTurns - 1 });
            } else {
                transaction.update(userRef, { balance: currentBalance - spinCost });
                const costTransactionRef = doc(collection(db, `artifacts/${appId}/transactions`));
                transaction.set(costTransactionRef, {
                    type: 'lucky_spin_cost',
                    userId: currentUser.uid,
                    userName: userData.displayName,
                    amount: spinCost,
                    content: `Trả phí vòng quay`,
                    timestamp: serverTimestamp()
                });
            }

            const prizesArray = configDoc.data().prizes;
            if (prizesArray[wonPrize.originalIndex].quantity > 0) {
                prizesArray[wonPrize.originalIndex].quantity -= 1;
            }
            transaction.update(configRef, { prizes: prizesArray });

            if (wonPrize.rewardType === 'money') {
                transaction.update(userRef, { balance: userDoc.data().balance + wonPrize.rewardValue });
                 const prizeTransactionRef = doc(collection(db, `artifacts/${appId}/transactions`));
                transaction.set(prizeTransactionRef, {
                    type: 'lucky_spin_win',
                    userId: currentUser.uid,
                    userName: userData.displayName,
                    amount: wonPrize.rewardValue,
                    prizeName: wonPrize.name,
                    content: `Trúng thưởng vòng quay`,
                    timestamp: serverTimestamp()
                });
            } else if (wonPrize.rewardType === 'spin_turn') {
                transaction.update(userRef, { spinTurns: (userDoc.data().spinTurns || 0) + wonPrize.rewardValue });
            } else { 
                const requestRef = doc(collection(db, `artifacts/${appId}/itemPrizeRequests`));
                transaction.set(requestRef, {
                    userId: currentUser.uid,
                    userDisplayName: userData.displayName,
                    prizeName: wonPrize.name,
                    prizeImageUrl: wonPrize.imageUrl,
                    createdAt: serverTimestamp(),
                    status: 'pending'
                });
            }
        });
        
        await animateSpin(wonPrize.originalIndex);

        document.getElementById('prize-won-image').src = wonPrize.imageUrl;
        let prizeText = wonPrize.name;
        if (wonPrize.rewardType === 'money') {
            prizeText = formatCurrency(wonPrize.rewardValue);
        } else if (wonPrize.rewardType === 'spin_turn') {
            prizeText = `${wonPrize.rewardValue} Lượt Quay`;
        }
        document.getElementById('prize-won-name').textContent = prizeText;
        document.getElementById('prize-won-modal').style.display = 'flex';

    } catch (error) {
        showToast(error.message, true);
    } finally {
        spinBtn.disabled = false;
    }
}

function animateSpin(winningIndex) {
    return new Promise(resolve => {
        const clockwiseOrder = [0, 1, 2, 4, 7, 6, 5, 3]; 
        const gridItems = document.querySelectorAll('.lucky-wheel-item:not(#spin-btn)');
        
        const sortedItems = Array.from(gridItems).sort((a, b) => {
            const indexA = clockwiseOrder.indexOf(parseInt(a.dataset.index));
            const indexB = clockwiseOrder.indexOf(parseInt(b.dataset.index));
            return indexA - indexB;
        });

        const winningPosition = clockwiseOrder.indexOf(winningIndex);
        if (winningPosition === -1) {
            console.error("Winning index not found in clockwise order.");
            resolve();
            return;
        }

        const rounds = 3;
        const totalSteps = (rounds * sortedItems.length) + winningPosition;
        let currentStep = 0;
        let delay = 80;

        function spin() {
            sortedItems.forEach(item => item.classList.remove('highlight'));
            
            const currentItem = sortedItems[currentStep % sortedItems.length];
            currentItem.classList.add('highlight');

            if (currentStep > totalSteps - 6) {
                delay += 50;
            }

            currentStep++;

            if (currentStep > totalSteps) {
                setTimeout(resolve, 500);
            } else {
                setTimeout(spin, delay);
            }
        }
        spin();
    });
}

function renderPrizeConfigItem(prize = {}, index) {
    const prizeData = prize || {};
    return `
        <div class="bg-tertiary p-4 rounded-lg prize-config-item" data-index="${index}">
            <div class="flex justify-between items-center mb-3">
                <h4 class="font-bold text-primary">Vật phẩm ${index + 1}</h4>
                <button class="remove-prize-btn p-2 text-danger hover:bg-secondary rounded-md"><i class="fas fa-trash"></i></button>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Tên vật phẩm" class="admin-lw-name w-full p-2 rounded bg-secondary border border-color focus:ring-2 ring-accent" value="${prizeData.name || ''}">
                <input type="text" placeholder="URL Hình ảnh" class="admin-lw-image w-full p-2 rounded bg-secondary border border-color focus:ring-2 ring-accent" value="${prizeData.imageUrl || ''}">
                <input type="number" placeholder="Tỉ lệ trúng (VD: 10)" class="admin-lw-rate w-full p-2 rounded bg-secondary border border-color focus:ring-2 ring-accent" value="${prizeData.winRate || 0}">
                <input type="number" placeholder="Số lượng" class="admin-lw-quantity w-full p-2 rounded bg-secondary border border-color focus:ring-2 ring-accent" value="${prizeData.quantity || 0}">
                <select class="admin-lw-type w-full p-2 rounded bg-secondary border border-color text-primary focus:ring-2 ring-accent">
                    <option value="money" ${prizeData.rewardType === 'money' ? 'selected' : ''}>Phần thưởng là Tiền</option>
                    <option value="item" ${prizeData.rewardType === 'item' ? 'selected' : ''}>Phần thưởng là Vật phẩm</option>
                    <option value="spin_turn" ${prizeData.rewardType === 'spin_turn' ? 'selected' : ''}>Phần thưởng là Lượt quay</option>
                </select>
                <input type="number" placeholder="Giá trị (tiền/lượt quay)" class="admin-lw-value w-full p-2 rounded bg-secondary border border-color focus:ring-2 ring-accent" value="${prizeData.rewardValue || 0}">
            </div>
        </div>
    `;
}

function updateAddPrizeButtonState() {
    const prizesCount = document.querySelectorAll('.prize-config-item').length;
    const addBtn = document.getElementById('admin-add-prize-btn');
    addBtn.disabled = prizesCount >= 8;
    addBtn.classList.toggle('opacity-50', addBtn.disabled);
    addBtn.classList.toggle('cursor-not-allowed', addBtn.disabled);
}

function setupAdminLuckyWheel() {
    if (unsubscribeAdminLuckyWheel) unsubscribeAdminLuckyWheel();
    const container = document.getElementById('admin-lucky-wheel-prizes-list');
    const configRef = doc(db, `artifacts/${appId}/luckyWheel`, 'config');
    
    unsubscribeAdminLuckyWheel = onSnapshot(configRef, (docSnap) => {
        let prizes = [];
        let spinCost = 0;
        if (docSnap.exists()) {
            prizes = docSnap.data().prizes || [];
            spinCost = docSnap.data().spinCost || 0;
        }
        
        document.getElementById('admin-spin-cost').value = spinCost;
        container.innerHTML = '';
        prizes.forEach((prize, index) => {
            container.insertAdjacentHTML('beforeend', renderPrizeConfigItem(prize, index));
        });
        updateAddPrizeButtonState();
    });
}

document.getElementById('admin-add-prize-btn').addEventListener('click', () => {
    const container = document.getElementById('admin-lucky-wheel-prizes-list');
    const newIndex = container.children.length;
    if (newIndex < 8) {
        container.insertAdjacentHTML('beforeend', renderPrizeConfigItem({}, newIndex));
        updateAddPrizeButtonState();
    }
});

document.getElementById('admin-lucky-wheel-prizes-list').addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.remove-prize-btn');
    if (removeBtn) {
        removeBtn.closest('.prize-config-item').remove();
        document.querySelectorAll('.prize-config-item').forEach((item, index) => {
            item.dataset.index = index;
            item.querySelector('h4').textContent = `Vật phẩm ${index + 1}`;
        });
        updateAddPrizeButtonState();
    }
});

document.getElementById('save-lucky-wheel-btn').addEventListener('click', async () => {
    const prizeElements = document.querySelectorAll('#admin-lucky-wheel-prizes-list .prize-config-item');
    const newPrizes = [];
    let isValid = true;
    
    prizeElements.forEach(el => {
        const name = el.querySelector('.admin-lw-name').value;
        const imageUrl = el.querySelector('.admin-lw-image').value;
        const winRate = parseInt(el.querySelector('.admin-lw-rate').value) || 0;
        const quantity = parseInt(el.querySelector('.admin-lw-quantity').value) || 0;
        const rewardType = el.querySelector('.admin-lw-type').value;
        const rewardValue = parseInt(el.querySelector('.admin-lw-value').value) || 0;

        if(!name || !imageUrl) {
            isValid = false;
        }
        
        newPrizes.push({ name, imageUrl, winRate, quantity, rewardType, rewardValue });
    });

    if(!isValid) return showToast("Tên và URL ảnh của mỗi vật phẩm không được để trống.", true);
    if (newPrizes.length > 8) return showToast("Chỉ có thể cấu hình tối đa 8 vật phẩm.", true);

    const spinCost = parseInt(document.getElementById('admin-spin-cost').value) || 0;

    showLoading();
    try {
        const configRef = doc(db, `artifacts/${appId}/luckyWheel`, 'config');
        await setDoc(configRef, { prizes: newPrizes, spinCost: spinCost }, { merge: true }); 
        showToast("Đã lưu cấu hình vòng quay!");
    } catch (error) {
        showToast(error.message, true);
    } finally {
        hideLoading();
    }
});


// --- NOTIFICATION FUNCTIONS ---
async function requestNotificationPermission(userId) {
    console.log('Requesting notification permission...');
    try {
        const registration = await navigator.serviceWorker.register('./firebase-messaging-sw.js');
        console.log('Service Worker registered successfully:', registration);

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Notification permission granted.');
            
            const currentToken = await getToken(messaging, {
                vapidKey: 'BJ51Oxb2nQB80aDI3Ay94cB2rn1HTmEcZmEAk0bSP22TMog1TaShilyJhY2vVCAQm8uUolXGib4p7XX-5m6oMRE',
                serviceWorkerRegistration: registration
            });

            if (currentToken) {
                console.log('FCM Token:', currentToken);
                const userDocRef = doc(db, `artifacts/${appId}/users`, userId);
                await updateDoc(userDocRef, { fcmToken: currentToken });
                console.log('FCM Token saved to Firestore.');
                displayFcmToken(); 
            } else {
                console.log('No registration token available.');
            }
        } else {
            console.log('Unable to get permission to notify.');
        }
    } catch (err) {
        console.error('An error occurred while retrieving token. ', err);
    }
}

onMessage(messaging, (payload) => {
    console.log('Message received. ', payload);
    showToast(payload.notification.title + ": " + payload.notification.body);
    if(currentUser) {
        createNotification(currentUser.uid, payload.notification.body, payload.data.type || 'general');
    }
});


async function createNotification(userId, message, type) {
    if (!userId) return;
    try {
        await addDoc(collection(db, `artifacts/${appId}/users/${userId}/notifications`), {
            message,
            type,
            isRead: false,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error creating notification: ", error);
    }
}

function fetchNotifications(userId) {
    const q = query(collection(db, `artifacts/${appId}/users/${userId}/notifications`), orderBy('createdAt', 'desc'));
    onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderNotifications(notifications);
        const hasUnread = notifications.some(n => !n.isRead);
        notificationDot.classList.toggle('active', hasUnread);
    });
}

function renderNotifications(notifications) {
    const container = document.getElementById('notification-list');
    if (notifications.length === 0) {
        container.innerHTML = `<p class="text-center text-secondary">Không có thông báo nào.</p>`;
        return;
    }
    container.innerHTML = notifications.map(n => {
        const time = n.createdAt ? n.createdAt.toDate().toLocaleString('vi-VN') : '...';
        return `<div class="notification-item flex justify-between items-center p-3 rounded-lg ${n.isRead ? 'bg-tertiary' : 'bg-secondary font-bold'}">
                    <div>
                        <p class="text-sm text-primary">${n.message}</p>
                        <p class="text-xs text-secondary mt-1">${time}</p>
                    </div>
                    <button data-id="${n.id}" class="delete-notification-btn p-2 text-danger"><i class="fas fa-trash"></i></button>
                </div>`;
    }).join('');
}

async function displayFcmToken() {
    const tokenInput = document.getElementById('fcm-token-display');
    try {
        const currentToken = await getToken(messaging, { vapidKey: 'BJ51Oxb2nQB80aDI3Ay94cB2rn1HTmEcZmEAk0bSP22TMog1TaShilyJhY2vVCAQm8uUolXGib4p7XX-5m6oMRE' });
        if (currentToken) {
            tokenInput.value = currentToken;
        } else {
            tokenInput.value = 'Chưa đăng ký nhận thông báo.';
        }
    } catch (err) {
        console.log('Could not get token to display.', err);
        tokenInput.value = 'Không thể lấy token.';
    }
}

async function deleteNotification(notificationId) {
    if (!currentUser || !notificationId) return;
    try {
        const notifRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/notifications`, notificationId);
        await deleteDoc(notifRef);
        console.log('Notification deleted:', notificationId);
    } catch (error) {
        console.error("Error deleting notification: ", error);
        showToast("Lỗi khi xóa thông báo.", true);
    }
}

async function deleteAllNotifications() {
    if (!currentUser) return;
    showLoading();
    try {
        const notificationsRef = collection(db, `artifacts/${appId}/users/${currentUser.uid}/notifications`);
        const q = query(notificationsRef);
        const snapshot = await getDocs(q);
        
        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        
        showToast("Đã xóa tất cả thông báo.");
    } catch (error) {
        console.error("Error deleting all notifications: ", error);
        showToast("Lỗi khi xóa tất cả thông báo.", true);
    } finally {
        hideLoading();
    }
}

async function unsubscribeFromNotifications() {
    if(!currentUser) return;
    try {
        const deleted = await deleteToken(messaging);
        if (deleted) {
            const userDocRef = doc(db, `artifacts/${appId}/users`, currentUser.uid);
            await updateDoc(userDocRef, { fcmToken: null });
            document.getElementById('fcm-token-display').value = 'Đã hủy đăng ký.';
            showToast("Đã hủy nhận thông báo thành công.");
        } else {
            showToast("Không tìm thấy token để hủy.", true);
        }
    } catch(err) {
        console.error('Error while unsubscribing: ', err);
        showToast("Lỗi khi hủy đăng ký.", true);
    }
}


// --- APP INITIALIZATION ---
function initializeAppLogic() {
    showLoading();
    const savedLang = localStorage.getItem('famiBankLanguage') || 'vi';
    applyLanguage(savedLang);
    applySavedTheme();
    document.querySelector('.history-sub-tab-btn[data-history-type="transactions"]').classList.add('active');
}

// --- EVENT LISTENERS FOR NOTIFICATION MODAL ---
document.getElementById('notification-list').addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.delete-notification-btn');
    if (deleteBtn) {
        const notifId = deleteBtn.dataset.id;
        deleteNotification(notifId);
    }
});

document.getElementById('delete-all-notifications-btn').addEventListener('click', deleteAllNotifications);

document.getElementById('subscribe-notifications-btn').addEventListener('click', () => {
    if(currentUser) {
        requestNotificationPermission(currentUser.uid);
        showToast("Đang yêu cầu quyền...");
    }
});

document.getElementById('unsubscribe-notifications-btn').addEventListener('click', unsubscribeFromNotifications);

document.getElementById('copy-fcm-token-btn').addEventListener('click', () => {
    const tokenInput = document.getElementById('fcm-token-display');
    if (tokenInput.value && !tokenInput.value.includes('Chưa đăng ký')) {
        navigator.clipboard.writeText(tokenInput.value).then(() => {
            showToast("Đã sao chép token!");
        }).catch(err => {
            showToast("Sao chép thất bại.", true);
        });
    }
});

notificationBtn.addEventListener('click', () => {
    document.getElementById('notification-modal').style.display = 'flex';
    displayFcmToken();
    
    if(currentUser) {
        const q = query(collection(db, `artifacts/${appId}/users/${currentUser.uid}/notifications`), where('isRead', '==', false));
        getDocs(q).then(snapshot => {
            if (snapshot.empty) return;
            const batch = writeBatch(db);
            snapshot.forEach(doc => {
                batch.update(doc.ref, { isRead: true });
            });
            batch.commit();
        });
    }
});


initializeAppLogic();