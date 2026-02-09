// Import Firebase libraries (Sử dụng CDN cho đơn giản)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, doc, getDoc, getDocs, updateDoc, setDoc, addDoc, query, where, onSnapshot, increment } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// --- CẤU HÌNH FIREBASE ---
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBevgQ-MEoSg1tnLyvOFY8ndcKN7HvaahU",
  authDomain: "fami-wallet.firebaseapp.com",
  projectId: "fami-wallet",
  storageBucket: "fami-wallet.firebasestorage.app",
  messagingSenderId: "851225524722",
  appId: "1:851225524722:web:023d64b5b0d7205045d36b",
  measurementId: "G-4DNH0PN1CS"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Global Variables
let currentUser = null;
let currentDocId = null;

// --- DOM ELEMENTS ---
const screens = { login: document.getElementById('login-screen'), app: document.getElementById('app-screen') };
const modals = { 
    overlay: document.getElementById('modal-overlay'),
    transfer: document.getElementById('modal-transfer'),
    generic: document.getElementById('modal-generic'),
    adminAdjust: document.getElementById('modal-admin-adjust')
};

// --- AUTH FUNCTIONS ---
document.getElementById('btn-login').addEventListener('click', async () => {
    const userIn = document.getElementById('login-username').value;
    const passIn = document.getElementById('login-password').value;
    const errorMsg = document.getElementById('login-error');

    try {
        const q = query(collection(db, "users"), where("username", "==", userIn));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            errorMsg.innerText = "Tài khoản không tồn tại!";
            return;
        }

        let found = false;
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.password === passIn) {
                currentUser = data;
                currentDocId = doc.id;
                found = true;
                loadApp();
            }
        });

        if (!found) errorMsg.innerText = "Sai mật khẩu!";
    } catch (e) {
        console.error(e);
        errorMsg.innerText = "Lỗi kết nối!";
    }
});

document.getElementById('btn-logout').addEventListener('click', () => {
    location.reload();
});

// --- APP LOGIC ---
function loadApp() {
    screens.login.classList.remove('active');
    screens.app.classList.add('active');

    // Setup UI Realtime Listener
    onSnapshot(doc(db, "users", currentDocId), (doc) => {
        currentUser = doc.data();
        updateUI();
    });

    // Load History
    loadHistory();

    // Setup Admin Panel
    if (currentUser.isAdmin) {
        document.getElementById('admin-panel').classList.remove('hidden');
        calculateSystemTotal();
    }
}

function updateUI() {
    document.getElementById('display-fullname').innerText = currentUser.fullName;
    document.getElementById('card-holder-name').innerText = currentUser.fullName.toUpperCase();
    document.getElementById('display-account-number').innerText = currentUser.accountNumber;
    // Format tiền VND
    document.getElementById('display-balance').innerText = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentUser.balance);
}

function loadHistory() {
    // Query transactions where user is sender OR receiver
    // Firestore đơn giản không hỗ trợ OR query trực tiếp dễ dàng ở client cũ, ta sẽ query 2 lần hoặc lọc clientside nếu ít dữ liệu.
    // Ở đây mình query những giao dịch liên quan đến username này (giả định username là unique id cho transaction)
    
    // Lưu ý: Để tối ưu, nên tạo field 'participants' là array [sender, receiver] và query "array-contains".
    // Cách đơn giản cho gia đình: Load all sort by date rồi filter.
    
    const q = query(collection(db, "transactions")); 
    onSnapshot(q, (snapshot) => {
        const list = document.getElementById('transaction-list');
        list.innerHTML = '';
        
        let txs = [];
        snapshot.forEach(doc => {
            const t = doc.data();
            if (t.fromUser === currentUser.username || t.toUser === currentUser.username) {
                txs.push(t);
            }
        });

        // Sort client side (mới nhất trước)
        txs.sort((a, b) => b.date - a.date);

        txs.forEach(t => {
            const isPlus = t.toUser === currentUser.username;
            const amountStr = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(t.amount);
            const dateStr = new Date(t.date).toLocaleString('vi-VN');
            
            const li = document.createElement('li');
            li.className = 'trans-item';
            li.innerHTML = `
                <div class="trans-info">
                    <h4>${t.type}</h4>
                    <p>${dateStr} - ${t.note || ''}</p>
                    <p>${isPlus ? 'Từ: ' + t.fromUser : 'Đến: ' + t.toUser}</p>
                </div>
                <div class="trans-amount ${isPlus ? 'plus' : 'minus'}">
                    ${isPlus ? '+' : '-'}${amountStr}
                </div>
            `;
            list.appendChild(li);
        });
    });
}

// --- ADMIN ---
async function calculateSystemTotal() {
    const querySnapshot = await getDocs(collection(db, "users"));
    let total = 0;
    querySnapshot.forEach(doc => {
        total += doc.data().balance || 0;
    });
    document.getElementById('admin-total-system').innerText = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total);
}

window.handleAdminAdjust = async () => {
    const targetUser = document.getElementById('ad-username').value;
    const newBal = Number(document.getElementById('ad-amount').value);
    
    const q = query(collection(db, "users"), where("username", "==", targetUser));
    const snap = await getDocs(q);
    
    if (!snap.empty) {
        const userDoc = snap.docs[0];
        await updateDoc(doc(db, "users", userDoc.id), { balance: newBal });
        alert("Đã cập nhật số dư!");
        closeModal();
    } else {
        alert("User không tồn tại");
    }
}

// --- TRANSFER LOGIC ---
let transferRecipientDoc = null;

window.checkRecipient = async () => {
    const input = document.getElementById('tf-recipient').value;
    // Tìm bằng username hoặc account number
    let q = query(collection(db, "users"), where("username", "==", input));
    let snap = await getDocs(q);
    
    if (snap.empty) {
        // Thử tìm bằng số tài khoản
        q = query(collection(db, "users"), where("accountNumber", "==", input));
        snap = await getDocs(q);
    }

    if (!snap.empty) {
        transferRecipientDoc = snap.docs[0];
        const data = transferRecipientDoc.data();
        document.getElementById('recipient-info').classList.remove('hidden');
        document.getElementById('tf-recipient-name').innerText = data.fullName;
    } else {
        alert("Không tìm thấy người dùng!");
        document.getElementById('recipient-info').classList.add('hidden');
        transferRecipientDoc = null;
    }
}

window.handleTransfer = async () => {
    if (!transferRecipientDoc) return alert("Vui lòng kiểm tra người nhận trước.");
    const amount = Number(document.getElementById('tf-amount').value);
    const note = document.getElementById('tf-note').value;
    const recipientData = transferRecipientDoc.data();

    if (amount > currentUser.balance) return alert("Số dư không đủ!");
    if (amount <= 0) return alert("Số tiền không hợp lệ!");

    // Trừ tiền người gửi
    await updateDoc(doc(db, "users", currentDocId), {
        balance: increment(-amount)
    });

    // Cộng tiền người nhận
    await updateDoc(doc(db, "users", transferRecipientDoc.id), {
        balance: increment(amount)
    });

    // Lưu giao dịch
    await addDoc(collection(db, "transactions"), {
        type: "Chuyển tiền",
        fromUser: currentUser.username,
        toUser: recipientData.username,
        amount: amount,
        date: Date.now(),
        note: note
    });

    alert("Chuyển tiền thành công!");
    closeModal();
}

// --- GENERIC ACTIONS (Nạp/Rút/Vay...) ---
let currentActionType = '';

window.openModal = (type) => {
    modals.overlay.style.display = 'flex';
    if (type === 'transfer') {
        modals.transfer.style.display = 'block';
    } else if (type === 'admin-adjust') {
        modals.adminAdjust.style.display = 'block';
    } else {
        // Dùng modal chung cho Nạp, Rút, Vay, Tiết kiệm
        currentActionType = type;
        modals.generic.style.display = 'block';
        const titles = {
            'deposit': 'Nạp tiền',
            'withdraw': 'Rút tiền',
            'loan': 'Đăng ký Vay',
            'savings': 'Gửi Tiết kiệm'
        };
        document.getElementById('generic-title').innerText = titles[type];
        
        // Setup nút bấm cho modal chung
        const btn = document.getElementById('generic-btn');
        btn.onclick = async () => {
            const amount = Number(document.getElementById('generic-amount').value);
            if (amount <= 0) return alert("Số tiền sai!");
            
            if (type === 'deposit') {
                // Nạp tiền: Cộng thẳng vào balance (Trong thực tế cần duyệt, nhưng đây là family app)
                await updateDoc(doc(db, "users", currentDocId), { balance: increment(amount) });
                await logTrans("Nạp tiền", "System", currentUser.username, amount);
            } 
            else if (type === 'withdraw') {
                if (currentUser.balance < amount) return alert("Không đủ tiền!");
                await updateDoc(doc(db, "users", currentDocId), { balance: increment(-amount) });
                await logTrans("Rút tiền", currentUser.username, "System", amount);
            }
            else if (type === 'loan') {
                // Vay: Cộng tiền vào balance, tăng nợ (nếu có field nợ)
                await updateDoc(doc(db, "users", currentDocId), { 
                    balance: increment(amount),
                    // loan: increment(amount) // Nếu muốn track nợ
                });
                await logTrans("Vay tiền", "Bank", currentUser.username, amount);
            }
            else if (type === 'savings') {
                if (currentUser.balance < amount) return alert("Không đủ tiền!");
                // Tiết kiệm: Trừ balance, cộng savings
                await updateDoc(doc(db, "users", currentDocId), { 
                    balance: increment(-amount),
                    // savings: increment(amount) 
                });
                await logTrans("Gửi tiết kiệm", currentUser.username, "Savings", amount);
            }
            closeModal();
        }
    }
}

async function logTrans(type, from, to, amount) {
    await addDoc(collection(db, "transactions"), {
        type: type,
        fromUser: from,
        toUser: to,
        amount: amount,
        date: Date.now()
    });
}

window.closeModal = () => {
    modals.overlay.style.display = 'none';
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    // Reset inputs
    document.querySelectorAll('input').forEach(i => i.value = '');
    document.getElementById('recipient-info').classList.add('hidden');
    transferRecipientDoc = null;
}

// --- THEME TOGGLE ---
document.getElementById('theme-toggle').addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    document.querySelector('#theme-toggle i').className = isDark ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
});