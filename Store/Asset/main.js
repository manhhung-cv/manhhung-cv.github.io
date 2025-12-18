import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get, push, onValue, update, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- 1. CẤU HÌNH FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyATk8l02r44KE2c_PPytEg1Zv43rZZRcN8",
    authDomain: "store-hunq.firebaseapp.com",
    databaseURL: "https://store-hunq-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "store-hunq",
    storageBucket: "store-hunq.firebasestorage.app",
    messagingSenderId: "879933378644",
    appId: "1:879933378644:web:41911950a1872b31df1dc1",
    measurementId: "G-D8TNFCSHQD"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// --- 2. BIẾN TOÀN CỤC & TRẠNG THÁI ---
let currentUser = null;
let userProfile = null;
let fbProducts = [];
let cart = [];
let appliedCoupon = null;
let finalTotal = 0;

const formatMoney = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

// --- 3. QUẢN LÝ TÀI KHOẢN (AUTH) ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const snapshot = await get(ref(db, `users/${user.uid}`));
        if (snapshot.exists()) {
            userProfile = snapshot.val();
        } else {
            showRegistrationModal();
        }
    } else {
        currentUser = null;
        userProfile = null;
    }
    renderStore('home');
});

window.login = () => signInWithPopup(auth, provider).catch(console.error);
window.logout = () => signOut(auth).then(() => location.reload());

window.saveUserProfile = async () => {
    const name = document.getElementById('reg-name').value.trim();
    const fb = document.getElementById('reg-fb').value.trim();
    if (!name || !fb) return alert("Hùng ơi, nhập đủ tên và link FB nhé!");

    await set(ref(db, `users/${currentUser.uid}`), {
        name,
        facebook: fb,
        email: currentUser.email,
        role: 'user',
        joinedAt: new Date().toISOString()
    });
    document.getElementById('reg-modal').classList.add('hidden');
    location.reload();
};

function showRegistrationModal() {
    document.getElementById('reg-modal').classList.remove('hidden');
}

// --- 4. LẤY DỮ LIỆU SẢN PHẨM ---
onValue(ref(db, 'products'), (snapshot) => {
    const data = snapshot.val();
    fbProducts = data ? Object.values(data) : [];
    renderStore('home');
});

// --- 5. LOGIC GIỎ HÀNG & MÃ GIẢM GIÁ ---
window.addToCart = (id) => {
    const product = fbProducts.find(p => p.id == id);
    const exists = cart.find(item => item.id == id);
    if (exists) exists.qty++;
    else cart.push({ ...product, qty: 1 });
    updateCartUI();
    showToast(`Đã thêm ${product.name}`, false);
};

window.changeQty = (index, delta) => {
    if (cart[index].qty + delta > 0) cart[index].qty += delta;
    else cart.splice(index, 1);
    updateCartUI();
};

window.updateCartUI = () => {
    const count = cart.reduce((acc, item) => acc + item.qty, 0);
    document.getElementById('desktop-cart-count').innerText = count;
    document.getElementById('mobile-cart-count').innerText = count;
    document.getElementById('desktop-cart-count').classList.toggle('scale-0', count === 0);
    
    const list = document.getElementById('cart-list');
    let subtotal = 0;
    
    list.innerHTML = cart.map((item, idx) => {
        subtotal += item.price * item.qty;
        return `
            <li class="flex items-center gap-4 py-2">
                <div class="w-12 h-12 rounded-xl ${item.color} flex items-center justify-center text-white"><i class="fa-solid ${item.icon}"></i></div>
                <div class="flex-1">
                    <h4 class="font-bold text-sm">${item.name}</h4>
                    <p class="text-xs text-gray-400">${formatMoney(item.price)}</p>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="changeQty(${idx}, -1)" class="w-6 h-6 bg-gray-100 dark:bg-zinc-800 rounded">-</button>
                    <span class="text-sm font-bold">${item.qty}</span>
                    <button onclick="changeQty(${idx}, 1)" class="w-6 h-6 bg-gray-100 dark:bg-zinc-800 rounded">+</button>
                </div>
            </li>`;
    }).join('');

    let discount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percent') discount = subtotal * (appliedCoupon.value / 100);
        else discount = appliedCoupon.value;
    }

    finalTotal = subtotal - discount;
    document.getElementById('cart-subtotal').innerText = formatMoney(subtotal);
    document.getElementById('cart-total-price').innerText = formatMoney(finalTotal);
};

// --- 6. THANH TOÁN & ĐẶT HÀNG ---
window.showCheckout = () => {
    if (!currentUser) return alert("Bạn cần đăng nhập trước khi mua hàng!");
    if (cart.length === 0) return alert("Giỏ hàng đang trống!");
    
    toggleCart();
    document.getElementById('checkout-modal').classList.remove('hidden');
    document.getElementById('payment-total').innerText = formatMoney(finalTotal);
    
    const orderId = 'DH' + Math.floor(100000 + Math.random() * 900000);
    document.getElementById('bank-content').innerText = orderId;
    
    const qrUrl = `https://img.vietqr.io/image/MB-0333666999-compact.png?amount=${finalTotal}&addInfo=${orderId}`;
    document.getElementById('qr-image').src = qrUrl;
};

window.confirmPayment = async () => {
    const orderId = document.getElementById('bank-content').innerText;
    const orderData = {
        orderId,
        uid: currentUser.uid,
        customerName: userProfile.name,
        facebook: userProfile.facebook,
        items: cart,
        total: finalTotal,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    await set(ref(db, `orders/${orderId}`), orderData);
    cart = [];
    updateCartUI();
    document.getElementById('checkout-modal').classList.add('hidden');
    showToast("Đặt hàng thành công! Đang chờ duyệt.", true);
};

// --- 7. DASHBOARD ADMIN ---
window.updateOrderStatus = async (id, status) => {
    await update(ref(db, `orders/${id}`), { status });
    showToast("Đã cập nhật trạng thái", true);
};

function loadAdminDashboard() {
    const list = document.getElementById('admin-order-list');
    onValue(ref(db, 'orders'), (snapshot) => {
        const orders = snapshot.val() ? Object.values(snapshot.val()).reverse() : [];
        let revenue = 0;
        
        list.innerHTML = orders.map(o => {
            if (o.status === 'completed') revenue += o.total;
            return `
                <div class="bg-white dark:bg-dark-card p-4 rounded-3xl border border-gray-100 dark:border-dark-border mb-4">
                    <div class="flex justify-between items-center mb-2">
                        <span class="font-bold">#${o.orderId}</span>
                        <span class="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-600">${o.status}</span>
                    </div>
                    <p class="text-sm font-bold text-emerald-600">${formatMoney(o.total)}</p>
                    <p class="text-xs text-gray-400 mb-3">${o.customerName} - ${o.items.length} món</p>
                    <div class="flex gap-2">
                        <button onclick="updateOrderStatus('${o.orderId}', 'completed')" class="flex-1 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold">Duyệt</button>
                        <button onclick="updateOrderStatus('${o.orderId}', 'cancelled')" class="px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-red-500 rounded-xl text-xs font-bold">Hủy</button>
                    </div>
                </div>`;
        }).join('');
        
        if(document.getElementById('stat-revenue')) {
            document.getElementById('stat-revenue').innerText = formatMoney(revenue);
            document.getElementById('stat-pending').innerText = orders.filter(o => o.status === 'pending').length;
        }
    });
}

// --- 8. RENDER VIEW ENGINE ---
window.renderStore = (view) => {
    const container = document.getElementById('main-content');
    container.innerHTML = '';
    
    // Cập nhật Active Nav
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('text-emerald-600'));

    if (view === 'home') {
        // Hero Section
        container.innerHTML = `
            <section class="fade-in mb-8">
                <h2 class="text-3xl font-black mb-6">Khám phá</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${fbProducts.slice(0, 2).map(p => `
                        <div onclick="showDetails(${p.id})" class="relative h-64 rounded-[32px] overflow-hidden group cursor-pointer">
                            <img src="${p.banner || 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=500'}" class="w-full h-full object-cover transition duration-500 group-hover:scale-110">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end">
                                <h3 class="text-white text-2xl font-bold">${p.name}</h3>
                                <p class="text-emerald-400 font-bold">${formatMoney(p.price)}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>
            <section class="fade-in">
                <h2 class="text-xl font-bold mb-4">Tất cả sản phẩm</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    ${fbProducts.map(p => `
                        <div onclick="showDetails(${p.id})" class="flex items-center gap-4 p-4 bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-dark-border cursor-pointer hover:shadow-lg transition">
                            <div class="w-16 h-16 rounded-2xl ${p.color} flex items-center justify-center text-white text-2xl"><i class="fa-solid ${p.icon}"></i></div>
                            <div class="flex-1">
                                <h4 class="font-bold">${p.name}</h4>
                                <p class="text-xs text-gray-400">${p.pType}</p>
                                <p class="text-sm font-bold text-emerald-600 mt-1">${formatMoney(p.price)}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>
        `;
    } else if (view === 'admin') {
        container.innerHTML = `
            <div class="space-y-6">
                <div class="flex justify-between items-end">
                    <h2 class="text-3xl font-black">Admin Panel</h2>
                    <div class="text-right">
                        <p class="text-xs text-gray-400 font-bold uppercase">Tổng doanh thu</p>
                        <p id="stat-revenue" class="text-2xl font-black text-emerald-600">0đ</p>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-emerald-500 p-4 rounded-3xl text-white">
                        <p class="text-xs opacity-80 uppercase font-bold">Chờ duyệt</p>
                        <p id="stat-pending" class="text-2xl font-bold">0</p>
                    </div>
                    <div class="bg-white dark:bg-dark-card p-4 rounded-3xl border border-gray-100 dark:border-dark-border" onclick="logout()">
                        <p class="text-xs text-red-500 uppercase font-bold text-center mt-2">Đăng xuất</p>
                    </div>
                </div>
                <div id="admin-order-list"></div>
            </div>`;
        loadAdminDashboard();
    } else if (view === 'account') {
        container.innerHTML = `
            <div class="text-center py-10">
                ${currentUser ? `
                    <img src="${currentUser.photoURL}" class="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-emerald-500">
                    <h2 class="text-2xl font-bold">${userProfile?.name || currentUser.displayName}</h2>
                    <p class="text-gray-500 mb-6">${currentUser.email}</p>
                    <div class="space-y-3">
                        ${userProfile?.role === 'admin' ? `<button onclick="renderStore('admin')" class="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold">Vào trang Quản trị</button>` : ''}
                        <button onclick="logout()" class="w-full py-4 bg-gray-100 dark:bg-zinc-800 text-red-500 rounded-2xl font-bold">Đăng xuất</button>
                    </div>
                ` : `
                    <div class="bg-white dark:bg-dark-card p-8 rounded-[40px] border border-gray-100 dark:border-dark-border">
                        <i class="fa-solid fa-user-circle text-6xl text-gray-200 mb-4"></i>
                        <h2 class="text-xl font-bold mb-2">Chào mừng bạn!</h2>
                        <p class="text-gray-500 mb-6">Đăng nhập để xem lịch sử đơn hàng và nhận ưu đãi.</p>
                        <button onclick="login()" class="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/30">Đăng nhập với Google</button>
                    </div>
                `}
            </div>`;
    }
};

// --- 9. TIỆN ÍCH UI ---
window.toggleCart = () => document.getElementById('cart-drawer').classList.toggle('hidden');
window.showDetails = (id) => {
    const p = fbProducts.find(x => x.id == id);
    document.getElementById('modal-title').innerText = p.name;
    document.getElementById('modal-price').innerText = formatMoney(p.price);
    document.getElementById('modal-desc').innerText = p.desc || "Sản phẩm chất lượng cao.";
    document.getElementById('modal-btn-add').onclick = () => { addToCart(p.id); closeModal(); };
    document.getElementById('product-modal').classList.remove('hidden');
    setTimeout(() => document.getElementById('modal-content').classList.remove('scale-95', 'opacity-0'), 10);
};

window.closeModal = () => {
    document.getElementById('modal-content').classList.add('scale-95', 'opacity-0');
    setTimeout(() => document.getElementById('product-modal').classList.add('hidden'), 200);
};

window.showToast = (msg, isSuccess) => {
    const toast = document.getElementById('toast');
    document.getElementById('toast-msg').innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
};

// Khởi chạy
renderStore('home');