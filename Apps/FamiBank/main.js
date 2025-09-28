import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, onSnapshot, collection, query, where, runTransaction, addDoc, orderBy, updateDoc, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- CONFIG & INITIALIZATION ---
const firebaseConfig = { apiKey: "AIzaSyCqUaI__8udllforW6CSCvd6f8_UCLY3CE", authDomain: "famibank-c7bfb.firebaseapp.com", projectId: "famibank-c7bfb", storageBucket: "famibank-c7bfb.firebasestorage.app", messagingSenderId: "243910717721", appId: "1:243910717721:web:e3f52cb495c1bdf35dd588" };
const appId = firebaseConfig.projectId;
const ADMIN_EMAIL = 'mienphi1230@gmail.com';
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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
const loadingOverlay = document.getElementById('loading-overlay');
const allViews = document.querySelectorAll('#login-view, #register-view, #app-view');
const allTabs = document.querySelectorAll('.app-tab');
const navButtons = document.querySelectorAll('.nav-btn');
const bottomNav = document.getElementById('bottom-nav');
const navAdminBtn = document.getElementById('nav-admin-btn');
const pinInput = document.getElementById('pin-input');
const pinDots = document.querySelectorAll('.pin-dot');
const toastMessage = document.getElementById('toast-message');
const toast = document.getElementById('toast-notification');

// --- CORE FUNCTIONS ---
const showLoading = () => loadingOverlay.style.display = 'flex';
const hideLoading = () => loadingOverlay.style.display = 'none';
const showView = (viewId) => { allViews.forEach(v => v.style.display = 'none'); document.getElementById(viewId).style.display = 'flex'; };
const showTab = (tabId) => { allTabs.forEach(t => t.style.display = 'none'); document.getElementById(tabId).style.display = 'block'; navButtons.forEach(b => b.classList.toggle('active', b.dataset.tab === tabId)); };
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
navButtons.forEach(btn => btn.addEventListener('click', () => showTab(btn.dataset.tab)));
document.querySelectorAll('.modal-overlay').forEach(modal => modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; }));
document.querySelectorAll('.modal-close-btn').forEach(btn => btn.addEventListener('click', () => { btn.closest('.modal-overlay').style.display = 'none'; }));
document.querySelectorAll('.action-btn').forEach(btn => btn.addEventListener('click', () => document.getElementById(`${btn.dataset.action}-modal`).style.display = 'flex'));
document.querySelectorAll('.lang-switcher button').forEach(button => button.addEventListener('click', () => applyLanguage(button.dataset.lang)));

// --- AUTHENTICATION ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        if (unsubscribeUser) unsubscribeUser();
        const userDocRef = doc(db, `artifacts/${appId}/users`, user.uid);
        unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                currentUserData = { id: docSnap.id, ...docSnap.data() };
                updateUI();
                fetchAllTransactions(user.uid);
            } else { handleLogout(); }
        });
        showView('app-view');
        showTab('home-tab');
        if (user.email === ADMIN_EMAIL) {
            navAdminBtn.style.display = 'flex';
            bottomNav.classList.replace('grid-cols-3', 'grid-cols-4');
            setupAdminDashboard();
        } else {
            navAdminBtn.style.display = 'none';
            bottomNav.classList.replace('grid-cols-4', 'grid-cols-3');
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
            transaction.set(userDocRef, { displayName: name, username, accountNumber: accNum, email, pinHash, balance: 0, createdAt: serverTimestamp() });
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
        renderTransactions(allTransactions, document.getElementById('full-transaction-history'), userId, getTranslatedString('noTransactions'));
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
            default: amountClass = 'text-primary'; amountSign = ''; title = getTranslatedString('unknownTransaction'); detail = tx.content || ''; icon = 'fa-question-circle';
        }
        return `<div class="flex items-center justify-between p-3 bg-secondary rounded-lg"><div class="flex items-center gap-4"><div class="w-10 h-10 flex items-center justify-center bg-tertiary rounded-full ${amountClass}"><i class="fas ${icon}"></i></div><div><p class="font-semibold text-sm text-primary">${title}</p><p class="text-xs text-secondary">${time}</p></div></div><p class="font-bold text-sm ${amountClass}">${amountSign}${formatCurrency(tx.amount)}</p></div>`;
    }).join('');
}

// --- ADMIN FUNCTIONS ---
let unsubscribeAdmin = null;
let unsubscribeDepositCodes = null;
let unsubscribeAdminUsers = null;

function setupAdminDashboard() {
    if (unsubscribeAdmin) unsubscribeAdmin();
    const requestsContainer = document.getElementById('withdrawal-requests');
    const q = query(collection(db, `artifacts/${appId}/withdrawalRequests`), orderBy('createdAt', 'desc'));
    
    unsubscribeAdmin = onSnapshot(q, (snapshot) => {
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
    setupAdminUserList(); // NEW: Call function to setup user list
}

function setupAdminDepositCodesList() {
    if (unsubscribeDepositCodes) unsubscribeDepositCodes();
    const codesContainer = document.getElementById('deposit-codes-list');
    const q = query(collection(db, `artifacts/${appId}/depositCodes`), orderBy('createdAt', 'desc'));

    unsubscribeDepositCodes = onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            codesContainer.innerHTML = `<p class="text-center text-secondary">${getTranslatedString('noDepositCodes', {lng: currentLanguage})}</p>`; return;
        }
        codesContainer.innerHTML = snapshot.docs.map(doc => {
            const code = doc.data();
            const isUsed = code.status === 'used';
            const statusClass = isUsed ? 'bg-danger' : 'bg-success';
            const statusText = isUsed ? getTranslatedString('used') : getTranslatedString('available');
            let redeemedInfo = '';
            if (isUsed && code.redeemedByUsername) {
                const redeemedTime = code.redeemedAt ? code.redeemedAt.toDate().toLocaleDateString('vi-VN') : '';
                redeemedInfo = `<p class="text-xs text-secondary mt-1">${getTranslatedString('usedBy', {user: code.redeemedByUsername})} @ ${redeemedTime}</p>`;
            }
            return `<div class="bg-tertiary p-4 rounded-lg">
                        <div class="flex justify-between items-start">
                            <div>
                                <p class="font-bold text-primary text-lg font-mono">${doc.id}</p>
                                <p class="font-bold my-1 text-accent">${formatCurrency(code.amount)}</p>
                                <div class="text-xs font-bold text-white px-2 py-0.5 rounded-full inline-block ${statusClass}">${statusText}</div>
                                ${redeemedInfo}
                            </div>
                            ${!isUsed ? `
                            <div class="flex gap-2">
                                <button data-id="${doc.id}" data-amount="${code.amount}" class="admin-edit-code-btn p-2 h-8 w-8 text-sm bg-secondary rounded-md"><i class="fas fa-pen"></i></button>
                                <button data-id="${doc.id}" class="admin-delete-code-btn p-2 h-8 w-8 text-sm bg-secondary rounded-md text-danger"><i class="fas fa-trash"></i></button>
                            </div>` : ''}
                        </div>
                    </div>`;
        }).join('');
    });
}

// NEW: Function to display and manage users for admin
function setupAdminUserList() {
    if (unsubscribeAdminUsers) unsubscribeAdminUsers();
    const userListContainer = document.getElementById('admin-user-list');
    const q = query(collection(db, `artifacts/${appId}/users`), orderBy('createdAt', 'desc'));

    unsubscribeAdminUsers = onSnapshot(q, (snapshot) => {
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
                            </div>
                            <button data-user='${userDataString}' class="admin-edit-user-btn p-2 h-10 w-10 text-sm bg-secondary rounded-md"><i class="fas fa-pen"></i></button>
                        </div>
                    </div>`;
        }).join('');
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

// NEW: Admin edit user logic
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

            // Handle username change
            if (newUsername !== oldData.username) {
                const newUsernameRef = doc(db, `artifacts/${appId}/uniqueIdentifiers`, `username_${newUsername}`);
                const newUsernameDoc = await transaction.get(newUsernameRef);
                if (newUsernameDoc.exists()) throw new Error("Username mới đã tồn tại.");

                const oldUsernameRef = doc(db, `artifacts/${appId}/uniqueIdentifiers`, `username_${oldData.username}`);
                transaction.delete(oldUsernameRef);
                transaction.set(newUsernameRef, { uid: userId });
                updates.username = newUsername;
            }

            // Handle account number change
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

// NEW: User update their own username/STK
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

            // Handle username change
            if (newUsername !== currentUserData.username) {
                const newUsernameRef = doc(db, `artifacts/${appId}/uniqueIdentifiers`, `username_${newUsername}`);
                const newUsernameDoc = await transaction.get(newUsernameRef);
                if (newUsernameDoc.exists()) throw new Error(getTranslatedString('usernameExists'));

                const oldUsernameRef = doc(db, `artifacts/${appId}/uniqueIdentifiers`, `username_${currentUserData.username}`);
                transaction.delete(oldUsernameRef);
                transaction.set(newUsernameRef, { uid: currentUser.uid });
                updates.username = newUsername;
            }

            // Handle account number change
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

// --- APP INITIALIZATION ---
function initializeAppLogic() {
    showLoading();
    const savedLang = localStorage.getItem('famiBankLanguage') || 'vi';
    applyLanguage(savedLang);
    applySavedTheme();
}

initializeAppLogic();