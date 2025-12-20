// Kiểm tra và áp dụng theme ngay khi load trang
if (localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

// Đặt hàm này ở cấp độ cao nhất trong main.js
const getRemainingDays = (expiryDate) => {
    if (!expiryDate) return { text: 'Vĩnh viễn', class: 'text-brand-600' };
    const diff = new Date(expiryDate) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return { text: `Còn ${days} ngày`, class: 'text-orange-500' };
    return { text: 'Hết hạn', class: 'text-red-500' };
};




import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, doc, getDoc, getDocs, setDoc, updateDoc, collection, query, where, onSnapshot, serverTimestamp, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { writeBatch } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// --- Config ---
const firebaseConfig = {
    apiKey: "AIzaSyATk8l02r44KE2c_PPytEg1Zv43rZZRcN8",
    authDomain: "store-hunq.firebaseapp.com",
    projectId: "store-hunq",
    storageBucket: "store-hunq.firebasestorage.app",
    messagingSenderId: "879933378644",
    appId: "1:879933378644:web:41911950a1872b31df1dc1"
};
const appId = "store-v1";

// --- Init ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- State ---
let user = null;
let userData = null;
let products = [];
let layout = [];
let cart = [];
let currentView = 'home';
let adminTab = 'products'; // 'products' or 'orders'

// --- Auth Logic ---
const initAuth = async () => {
    onAuthStateChanged(auth, async (u) => {
        user = u;
        if (user) {
            const userRef = doc(db, 'artifacts', appId, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                userData = userSnap.data();
            } else if (!user.isAnonymous) {
                userData = { name: user.email.split('@')[0], email: user.email, role: 'user', facebook: '' };
                await setDoc(userRef, userData);
            }
        } else {
            userData = null;
        }
        updateUIHeader();
        setView(currentView);
    });
};

// --- Data Fetching ---
const fetchGlobalData = () => {
    const pRef = collection(db, 'artifacts', appId, 'public', 'data', 'products');
    onSnapshot(pRef, (snap) => {
        products = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => !p.hidden);
        
        // Thêm dòng này để Chatbot có thể truy cập được products
        window.products = products; 

        if (currentView === 'home') renderHome();
        if (currentView === 'admin' && adminTab === 'products') renderAdmin();
    }, (err) => console.error(err));
};

// --- Core UI Logic ---
const setView = (v) => {
    currentView = v;
    const container = document.getElementById('main-view');
    const bottomNav = document.querySelector('nav.md\\:hidden'); // Thanh nav mobile

    // Reset trạng thái các nút nav
    document.querySelectorAll('.nav-btn').forEach(b => {
        const isActive = b.dataset.view === v;
        b.classList.toggle('text-brand-600', isActive);
        b.classList.toggle('text-gray-400', !isActive);
    });

    // Nếu vào tab chat, ẩn thanh bottom nav và làm tràn main-view
    if (v === 'chat') {
        bottomNav.classList.add('hidden');
        container.classList.remove('pt-20', 'px-4'); // Loại bỏ padding mặc định
        container.classList.add('pt-16'); // Chỉ để lại khoảng trống cho Header
        renderChatTab();
    } else {
        bottomNav.classList.remove('hidden');
        container.classList.add('pt-20', 'px-4');
        container.classList.remove('pt-16');
        
        if (v === 'home') renderHome();
        else if (v === 'lookup') renderLookup();
        else if (v === 'blog') renderBlog();
        else if (v === 'account') renderAccount();
        else if (v === 'admin') renderAdmin();
    }
};

const renderHome = () => {
    const container = document.getElementById('main-view');
    if (products.length === 0) {
        container.innerHTML = `<div class="text-center py-20 text-gray-500">Đang tải sản phẩm...</div>`;
        return;
    }

    let html = `<div class="space-y-12 fade-in">`;

    // Featured
    const featured = products.slice(0, 3);
    html += `
                <section>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${featured.map(p => `
                            <div class="relative h-60 rounded-3xl overflow-hidden shadow-lg cursor-pointer transform hover:scale-[1.02] transition" onclick="showProductDetails('${p.id}')">
                                <img src="/Asset/Banner/PriorityDark.png" class="absolute inset-0 w-full h-full object-cover">
                                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                <div class="absolute bottom-0 p-6">
                                    <span class="text-brand-400 text-xs font-bold uppercase tracking-widest">Nổi bật</span>
                                    <h3 class="text-white text-2xl font-bold">${p.name}</h3>
                                    <button class="mt-4 px-4 py-1.5 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full font-bold text-sm">${formatMoney(p.price)}</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>
            `;

    // Sections by Category
    const categories = [...new Set(products.map(p => p.category))];
    categories.forEach(cat => {
        const items = products.filter(p => p.category === cat);
        html += `
                    <section>
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-extrabold capitalize">${cat}</h2>
                            <button class="text-brand-500 font-bold text-sm">Xem tất cả</button>
                        </div>
                        <div class="flex overflow-x-auto gap-4 hide-scrollbar pb-4">
                            ${items.map(p => `
                                <div class="shrink-0 w-40 cursor-pointer group" onclick="showProductDetails('${p.id}')">
                                    <div class="w-40 h-40 rounded-[22%] bg-gradient-to-br from-brand-400 to-teal-500 flex items-center justify-center text-white text-5xl mb-3 shadow-md group-hover:shadow-xl transition">
                                        <i class="fa-solid ${p.icon || 'fa-cube'}"></i>
                                    </div>
                                    <h4 class="font-bold text-sm truncate">${p.name}</h4>
                                    <p class="text-xs text-gray-500">${p.pType || 'Tài khoản'}</p>
                                    <span class="text-brand-600 dark:text-brand-400 font-bold text-sm">${formatMoney(p.price)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </section>
                `;
    });

    html += `</div>`;
    container.innerHTML = html;
};

const renderAdmin = async () => {
    // Bảo mật: Nếu không phải admin thì đẩy về trang chủ
    if (userData?.role !== 'admin') { setView('home'); return; }

    const container = document.getElementById('main-view');

    // Vẽ khung sườn quản trị
    container.innerHTML = `
        <div class="space-y-8 fade-in">
            <div class="flex flex-col lg:row justify-between items-start lg:items-center gap-6">
                <div>
                    <h2 class="text-3xl font-black tracking-tight">Quản trị hệ thống</h2>
                    <p class="text-sm text-gray-500 mt-1">Chào Admin, hãy quản lý dữ liệu của bạn hôm nay.</p>
                </div>

                <div class="flex bg-gray-100 dark:bg-zinc-900 p-1.5 rounded-2xl w-full lg:w-auto overflow-x-auto hide-scrollbar">
                    <button onclick="setAdminTab('products')" 
                        class="flex-1 lg:flex-none px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition ${adminTab === 'products' ? 'bg-white dark:bg-zinc-800 shadow-sm text-brand-600' : 'text-gray-500 hover:text-brand-500'}">
                        Sản phẩm
                    </button>
                    <button onclick="setAdminTab('orders')" 
                        class="flex-1 lg:flex-none px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition ${adminTab === 'orders' ? 'bg-white dark:bg-zinc-800 shadow-sm text-brand-600' : 'text-gray-500 hover:text-brand-500'}">
                        Đơn hàng
                    </button>
                    <button onclick="setAdminTab('news')" 
                        class="flex-1 lg:flex-none px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition ${adminTab === 'news' ? 'bg-white dark:bg-zinc-800 shadow-sm text-brand-600' : 'text-gray-500 hover:text-brand-500'}">
                        Tin tức
                    </button>
                </div>
            </div>

            <div id="admin-content" class="min-h-[400px]">
                <div class="flex flex-col items-center justify-center py-20">
                    <div class="loading-spinner mb-4"></div>
                    <p class="text-xs text-gray-400 font-bold uppercase tracking-widest">Đang truy xuất dữ liệu...</p>
                </div>
            </div>
        </div>
    `;

    // Gọi hàm render nội dung tương ứng với tab đang chọn
    setTimeout(() => {
        if (adminTab === 'products') renderAdminProducts();
        else if (adminTab === 'orders') renderAdminOrders();
        else if (adminTab === 'news') renderAdminNews();
    }, 100); // Delay nhẹ để UI render khung xong
};

window.renderAdminProducts = () => {
    const adminContent = document.getElementById('admin-content');

    adminContent.innerHTML = `
        <div class="space-y-6 fade-in">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
                <div>
                    <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest">Danh sách sản phẩm (${products.length})</h3>
                </div>
                <button onclick="showProductForm()" class="w-full sm:w-auto bg-brand-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-glow-light active:scale-95 transition flex items-center justify-center gap-2">
                    <i class="fa-solid fa-plus"></i> THÊM SẢN PHẨM MỚI
                </button>
            </div>

            <div class="md:hidden space-y-4 px-2">
                ${products.length === 0 ? '<p class="text-center py-10 text-gray-400">Chưa có sản phẩm nào.</p>' :
            products.map(p => `
                    <div class="bg-white dark:bg-dark-card p-5 rounded-[2rem] border border-gray-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-14 h-14 squircle bg-brand-500/10 text-brand-600 flex items-center justify-center text-2xl">
                                <i class="fa-solid ${p.icon || 'fa-cube'}"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h4 class="font-bold text-gray-800 dark:text-white truncate">${p.name}</h4>
                                <p class="text-[10px] text-brand-500 font-black uppercase tracking-tighter">${p.category} | ${p.pType || 'Tài khoản'}</p>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-3 mb-4">
                            <div class="bg-gray-50 dark:bg-zinc-900/50 p-2 rounded-xl">
                                <p class="text-[9px] text-gray-400 font-bold uppercase">Giá bán</p>
                                <p class="font-bold text-sm text-brand-600">${formatMoney(p.price)}</p>
                            </div>
                            <div class="bg-gray-50 dark:bg-zinc-900/50 p-2 rounded-xl">
                                <p class="text-[9px] text-gray-400 font-bold uppercase">Bảo hành</p>
                                <p class="font-bold text-sm text-gray-700 dark:text-gray-300">${p.warranty || 'N/A'}</p>
                            </div>
                        </div>

                        <div class="flex gap-2 pt-3 border-t dark:border-zinc-800">
                            <button onclick="editProduct('${p.id}')" class="flex-1 py-3 bg-brand-50 text-brand-600 dark:bg-brand-900/20 rounded-xl font-bold text-xs flex items-center justify-center gap-2">
                                <i class="fa-solid fa-pen-to-square"></i> CHỈNH SỬA
                            </button>
                            <button onclick="deleteProduct('${p.id}')" class="w-12 h-12 bg-red-50 text-red-500 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="hidden md:block overflow-hidden bg-white dark:bg-dark-card rounded-[2rem] border border-gray-100 dark:border-zinc-800 shadow-sm">
                <table class="w-full text-left">
                    <thead class="bg-gray-50 dark:bg-zinc-900/50">
                        <tr class="text-[10px] text-gray-400 uppercase font-black tracking-widest">
                            <th class="p-5">Sản phẩm</th>
                            <th class="p-5">Thông tin</th>
                            <th class="p-5">Bảo hành</th>
                            <th class="p-5">Giá bán</th>
                            <th class="p-5 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-zinc-800">
                        ${products.map(p => `
                            <tr class="hover:bg-gray-50/50 dark:hover:bg-zinc-900/30 transition group">
                                <td class="p-5">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center"><i class="fa-solid ${p.icon}"></i></div>
                                        <div class="font-bold text-sm">${p.name}</div>
                                    </div>
                                </td>
                                <td class="p-5 text-xs">
                                    <span class="px-2 py-1 bg-gray-100 dark:bg-zinc-800 rounded-md text-gray-500 font-bold uppercase text-[9px]">${p.category}</span>
                                    <p class="mt-1 text-gray-400">${p.pType || '-'}</p>
                                </td>
                                <td class="p-5 text-sm text-gray-500">${p.warranty || '-'}</td>
                                <td class="p-5 text-sm font-black text-brand-600">${formatMoney(p.price)}</td>
                                <td class="p-5 text-right space-x-1">
                                    <button class="w-9 h-9 text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-xl transition" onclick="editProduct('${p.id}')"><i class="fa-solid fa-pen-to-square"></i></button>
                                    <button class="w-9 h-9 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition" onclick="deleteProduct('${p.id}')"><i class="fa-solid fa-trash-can"></i></button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
};
// Ví dụ logic cho renderAdminOrders (Tối ưu Mobile)
const renderAdminOrders = async () => {
    const adminContent = document.getElementById('admin-content');
    const oRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
    const snap = await getDocs(oRef);
    const allOrders = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    adminContent.innerHTML = `
        <div class="space-y-4">
<div class="flex justify-between items-center mb-4 px-2">
    <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest">Danh sách đơn hàng</h3>
    <button onclick="clearCancelledOrders()" class="px-4 py-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-bold text-xs transition active:scale-95 flex items-center gap-2">
        <i class="fa-solid fa-broom"></i>
        <span>XÓA ĐƠN ĐÃ HỦY</span>
    </button>
</div>
            <div class="md:hidden space-y-4">
                ${allOrders.map(o => `
                    <div class="bg-white dark:bg-dark-card p-5 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <p class="text-[10px] font-bold text-gray-400 uppercase">#${o.orderId}</p>
                                <h4 class="font-bold text-sm">${o.customer}</h4>
                            </div>
                            <span class="px-2 py-1 rounded-lg text-[10px] font-bold ${o.status === 'Hoàn thành' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}">${o.status}</span>
                        </div>
                        <p class="text-xs text-gray-500 mb-4">${o.items.map(i => i.name).join(', ')}</p>
                        <div class="flex justify-between items-center pt-3 border-t dark:border-zinc-800">
                            <span class="font-black text-brand-600">${formatMoney(o.total)}</span>
                            <button onclick="showEditOrderModal('${o.orderId}')" class="px-4 py-2 bg-brand-50 text-brand-600 rounded-xl font-bold text-xs">Chi tiết</button>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="hidden md:block overflow-hidden bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-zinc-800">
                <table class="w-full text-left">
                    </table>
            </div>
        </div>
    `;
};
// Thêm vào renderAdminNews
window.renderAdminNews = async () => {
    const adminContent = document.getElementById('admin-content');
    const nRef = collection(db, 'artifacts', appId, 'public', 'data', 'news');

    try {
        const snap = await getDocs(nRef);
        const allNews = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        adminContent.innerHTML = `
            <div class="space-y-6 fade-in">
                <div class="flex justify-end px-2">
                    <button onclick="showNewsForm()" class="bg-brand-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-glow-light active:scale-95 transition">
                        <i class="fa-solid fa-plus mr-2"></i>VIẾT TIN MỚI
                    </button>
                </div>

                <div class="grid grid-cols-1 gap-4">
                    ${allNews.length === 0 ?
                '<div class="text-center py-10 text-gray-400 bg-white dark:bg-dark-card rounded-3xl border border-dashed border-gray-200 dark:border-zinc-800">Chưa có bài viết nào.</div>' :
                allNews.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds).map(n => `
                        <div class="bg-white dark:bg-dark-card p-5 rounded-3xl border border-gray-100 dark:border-zinc-800 flex justify-between items-center shadow-sm">
                            <div class="flex-1 pr-4 min-w-0">
                                <h4 class="font-bold text-brand-600 truncate text-lg">${n.title}</h4>
                                <p class="text-[10px] text-gray-400 uppercase font-bold mt-1">
                                    <i class="fa-regular fa-calendar mr-1"></i> 
                                    ${n.createdAt ? n.createdAt.toDate().toLocaleDateString('vi-VN') : 'Vừa xong'}
                                </p>
                            </div>
                            <div class="flex gap-2">
                                <button onclick="deleteNews('${n.id}')" class="w-10 h-10 bg-red-50 text-red-500 dark:bg-red-900/20 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition">
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } catch (e) {
        showToast("Lỗi tải tin tức: " + e.message, false);
    }
};

window.renderChatTab = () => {
    const container = document.getElementById('main-view');
    container.innerHTML = `
        <div class="flex flex-col h-[calc(100dvh-64px)] bg-white dark:bg-black fade-in">
            <div class="px-5 py-4 bg-white dark:bg-dark-card border-b dark:border-zinc-800 flex items-center gap-4 shadow-sm">
                <button onclick="setView('home')" class="text-gray-400 hover:text-brand-600 transition">
                    <i class="fa-solid fa-chevron-left"></i>
                </button>
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-sm">
                        <i class="fa-solid fa-robot"></i>
                    </div>
                    <div>
                        <h2 class="font-black text-sm uppercase leading-none">HunqStore Support</h2>
                        <span class="text-[10px] text-green-500 font-bold uppercase tracking-widest">Đang hoạt động</span>
                    </div>
                </div>
            </div>

            <div id="chat-tab-messages" class="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/50 dark:bg-black/40 hide-scrollbar scroll-smooth">
                <div class="flex gap-3 fade-in">
                    <div class="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center shrink-0">
                        <i class="fa-solid fa-robot text-[10px]"></i>
                    </div>
                    <div class="bg-white dark:bg-zinc-800 p-4 rounded-2xl rounded-tl-none shadow-sm text-sm border border-gray-100 dark:border-zinc-700 max-w-[85%]">
                        Chào ${userData?.name || 'Hùng'}, bạn cần mình dò tìm sản phẩm nào hay cần hướng dẫn gì không? 🤖
                    </div>
                </div>
            </div>

            <div class="p-4 bg-white dark:bg-dark-card border-t dark:border-zinc-800 sticky bottom-0">
                <div class="flex items-center gap-3 bg-gray-100 dark:bg-black rounded-[2rem] px-4 py-2">
                    <input type="text" id="chat-tab-input" 
                           onkeypress="if(event.key==='Enter') window.handleChatTab()"
                           class="flex-1 bg-transparent border-none py-2 text-sm focus:outline-none dark:text-white" 
                           placeholder="Nhắn tin hỗ trợ...">
                    <button onclick="window.handleChatTab()" class="w-10 h-10 bg-brand-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition">
                        <i class="fa-solid fa-paper-plane text-xs"></i>
                    </button>
                </div>
                <div class="h-[env(safe-area-inset-bottom)]"></div>
            </div>
        </div>
    `;
    
    // Tự động cuộn xuống cuối khi load
    const area = document.getElementById('chat-tab-messages');
    area.scrollTop = area.scrollHeight;
};

window.handleChatTab = () => {
    const input = document.getElementById('chat-tab-input');
    const msg = input.value.trim().toLowerCase();
    if (!msg) return;

    addTabMessage(input.value, false);
    input.value = '';

    setTimeout(() => {
        const keywords = msg.replace(/mua|tìm|có|giá/g, '').trim();
        
        if (msg.includes('hướng dẫn')) {
            addTabMessage("Để mua hàng: Chọn sản phẩm -> Mua ngay -> Thanh toán QR -> Đợi Admin duyệt đơn là xong! 📑");
        } else if (keywords.length >= 2) {
            const matches = products.filter(p => p.name.toLowerCase().includes(keywords)).slice(0, 2);
            if (matches.length > 0) {
                let html = `<p class="mb-2">Mình tìm thấy các sản phẩm này, có phải ý bạn là:</p>`;
                matches.forEach(p => {
                    html += `
                        <div class="bg-gray-100 dark:bg-black/50 p-4 rounded-2xl border border-brand-500/20 mb-2">
                            <p class="font-bold text-xs">${p.name}</p>
                            <p class="text-brand-600 font-bold text-[10px] mb-3">${formatMoney(p.price)}</p>
                            <button onclick="window.addToCartFromChat('${p.id}')" class="w-full py-2.5 bg-brand-600 text-white rounded-xl font-bold text-[10px]">MUA NGAY</button>
                        </div>`;
                });
                addTabMessage(null, true, html);
            } else {
                addTabMessage(`Mình chưa thấy sản phẩm "${keywords}". Bạn thử gõ tên khác xem?`);
            }
        } else {
            addTabMessage("Mình chưa hiểu rõ ý bạn. Bạn cần tìm sản phẩm hay hỗ trợ kỹ thuật?");
        }
    }, 600);
};

const addTabMessage = (text, isBot = true, html = null) => {
    const area = document.getElementById('chat-tab-messages');
    if (!area) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `flex gap-3 ${isBot ? '' : 'flex-row-reverse'} fade-in mb-5`;
    msgDiv.innerHTML = `
        <div class="w-8 h-8 rounded-xl ${isBot ? 'bg-brand-500' : 'bg-zinc-600'} text-white flex items-center justify-center shrink-0 shadow-sm">
            <i class="fa-solid ${isBot ? 'fa-robot' : 'fa-user'} text-[10px]"></i>
        </div>
        <div class="${isBot ? 'bg-white dark:bg-zinc-800' : 'bg-brand-600 text-white'} p-4 rounded-2xl shadow-sm text-sm max-w-[80%] border dark:border-zinc-700/50">
            ${html || text}
        </div>`;
    area.appendChild(msgDiv);
    area.scrollTop = area.scrollHeight;
};


// Đừng quên đưa renderChatTab ra ngoài window
window.renderChatTab = renderChatTab;

window.showNewsForm = () => {
    const container = document.getElementById('modal-content');
    container.innerHTML = `
        <div class="p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center">
                <h2 class="text-2xl font-black text-gray-800 dark:text-white">Viết tin tức mới</h2>
                <button onclick="closeModal()" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition">
                    <i class="fa-solid fa-xmark text-gray-400"></i>
                </button>
            </div>
            
            <div class="space-y-4">
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-widest">Tiêu đề</label>
                    <input type="text" id="n-title" class="w-full p-4 bg-gray-50 dark:bg-black rounded-2xl border-none focus:ring-2 focus:ring-brand-500 transition" placeholder="Nhập tiêu đề hấp dẫn...">
                </div>
                
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-widest">Nội dung bài viết</label>
                    <textarea id="n-content" rows="10" class="w-full p-4 bg-gray-50 dark:bg-black rounded-2xl border-none focus:ring-2 focus:ring-brand-500 transition resize-none" placeholder="Nội dung chi tiết (hỗ trợ xuống dòng)..."></textarea>
                </div>
            </div>

            <button onclick="saveNews()" class="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-600/20 active:scale-95 transition">
                ĐĂNG BÀI VIẾT NGAY
            </button>
        </div>
    `;
    openModal();
};

window.saveNews = async () => {
    const title = document.getElementById('n-title').value.trim();
    const content = document.getElementById('n-content').value.trim();

    if (!title || !content) {
        showToast("Vui lòng điền đủ thông tin!", false);
        return;
    }

    try {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'news'), {
            title,
            content,
            author: userData?.name || 'Admin',
            createdAt: serverTimestamp()
        });
        closeModal();
        showToast("Đã đăng bài viết mới!", true);
        renderAdminNews(); // Tải lại danh sách sau khi lưu
    } catch (e) {
        showToast("Lỗi: " + e.message, false);
    }
};

window.deleteNews = async (id) => {
    const confirmDelete = await niceConfirm("Xóa tin tức?", "Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa bài viết này không?");
    if (confirmDelete) {
        try {
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'news', id));
            showToast("Đã xóa bài viết!", true);
            renderAdminNews(); // Cập nhật lại danh sách
        } catch (e) {
            showToast("Lỗi xóa bài: " + e.message, false);
        }
    }
};
// Hàm xóa tin tức
window.deleteNews = async (id) => {
    const ok = await niceConfirm('Xóa bài viết?', 'Bài viết này sẽ biến mất khỏi mục Tin tức của người dùng.');
    if (!ok) return;
    try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'news', id));
        showToast('Đã xóa bài viết', true);
        renderAdminNews();
    } catch (e) { showToast('Lỗi: ' + e.message, false); }
};


window.clearCancelledOrders = async () => {
    // 1. Xác nhận trước khi xóa (Dùng modal niceConfirm bạn đã có)
    const ok = await niceConfirm(
        'Dọn dẹp đơn hàng?',
        'Tất cả đơn hàng có trạng thái "Hủy" sẽ bị xóa vĩnh viễn khỏi hệ thống. Bạn chắc chắn chứ?'
    );

    if (!ok) return;

    try {
        showToast('Đang xử lý...', true);

        // 2. Truy vấn tất cả đơn hàng có status là "Hủy" trong public data
        const oRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
        const q = query(oRef, where("status", "==", "Hủy"));
        const snap = await getDocs(q);

        if (snap.empty) {
            showToast('Không có đơn hàng nào cần xóa.', false);
            return;
        }

        // 3. Sử dụng Batch để xóa hàng loạt (tối đa 500 đơn 1 lúc)
        const batch = writeBatch(db);

        snap.forEach((docSnap) => {
            const data = docSnap.data();
            // Xóa ở public data
            batch.delete(docSnap.ref);
            // Xóa ở private data của người dùng (nếu bạn muốn dọn sạch cả 2 nơi)
            const userOrderRef = doc(db, 'artifacts', appId, 'users', data.uid, 'orders', docSnap.id);
            batch.delete(userOrderRef);
        });

        await batch.commit();

        showToast(`Đã xóa sạch ${snap.size} đơn hàng đã hủy!`, true);

        // 4. Load lại danh sách Admin
        renderAdminOrders();

    } catch (e) {
        console.error(e);
        showToast('Lỗi khi xóa: ' + e.message, false);
    }
};

window.saveNews = async () => {
    const title = document.getElementById('n-title').value;
    const content = document.getElementById('n-content').value;
    try {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'news'), {
            title, content, createdAt: serverTimestamp()
        });
        closeModal();
        showToast('Đã đăng tin thành công!', true);
    } catch (e) { showToast(e.message, false); }
};

window.showEditOrderModal = async (orderId) => {
    const oRef = doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId);
    const snap = await getDoc(oRef);
    const o = snap.data();

    const container = document.getElementById('modal-content');
    container.innerHTML = `
        <div class="p-8 space-y-4">
            <h2 class="text-xl font-bold">Cập nhật đơn: #${orderId}</h2>
            <div>
                <label class="text-[10px] font-bold text-gray-400 uppercase">Trạng thái</label>
                <select id="edit-o-status" class="w-full p-3 bg-gray-100 dark:bg-black rounded-xl border-none">
                    <option value="Chờ thanh toán" ${o.status === 'Chờ thanh toán' ? 'selected' : ''}>Chờ thanh toán</option>
                    <option value="Đang hoạt động" ${o.status === 'Đang hoạt động' ? 'selected' : ''}>Đang hoạt động</option>
                    <option value="Gia hạn" ${o.status === 'Gia hạn' ? 'selected' : ''}>Gia hạn</option>
                    <option value="Lỗi" ${o.status === 'Lỗi' ? 'selected' : ''}>Lỗi</option>
                    <option value="Hết hạn" ${o.status === 'Hết hạn' ? 'selected' : ''}>Hết hạn</option>
                    <option value="Hủy" ${o.status === 'Hủy' ? 'selected' : ''}>Hủy</option>
                </select>
            </div>
            <div>
                <label class="text-[10px] font-bold text-gray-400 uppercase">Hạn sử dụng (Ngày hết hạn)</label>
                <input type="date" id="edit-o-expiry" class="w-full p-3 bg-gray-100 dark:bg-black rounded-xl border-none" value="${o.expiryDate || ''}">
            </div>
            <div>
                <label class="text-[10px] font-bold text-gray-400 uppercase">Ghi chú Admin</label>
                <textarea id="edit-o-notes" class="w-full p-3 bg-gray-100 dark:bg-black rounded-xl border-none resize-none" rows="3">${o.notes || ''}</textarea>
            </div>
            <button onclick="saveOrderDetails('${orderId}', '${o.uid}')" class="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold">CẬP NHẬT ĐƠN HÀNG</button>
        </div>
    `;
    openModal();
};

window.saveOrderDetails = async (orderId, buyerUid) => {
    const status = document.getElementById('edit-o-status').value;
    const expiryDate = document.getElementById('edit-o-expiry').value;
    const notes = document.getElementById('edit-o-notes').value;

    const updateData = { status, expiryDate, notes };

    try {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId), updateData);
        await updateDoc(doc(db, 'artifacts', appId, 'users', buyerUid, 'orders', orderId), updateData);
        closeModal();
        showToast('Đã lưu thông tin đơn hàng!', true);
        renderAdminOrders();
    } catch (e) { showToast('Lỗi: ' + e.message, false); }
};

const showProductForm = (pid = null) => {
    const p = products.find(x => x.id === pid) || {};
    const iconPresets = ['fa-film', 'fa-music', 'fa-gamepad', 'fa-shield-halved', 'fa-bolt', 'fa-user-secret', 'fa-crown', 'fa-star'];
    
    const container = document.getElementById('modal-content');
    container.innerHTML = `
        <div class="p-8 space-y-6 max-h-[90vh] overflow-y-auto hide-scrollbar">
            <div class="flex justify-between items-center">
                <h2 class="text-2xl font-black text-gray-800 dark:text-white">${pid ? 'Cập nhật' : 'Thêm'} sản phẩm</h2>
                <button onclick="closeModal()" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition">
                    <i class="fa-solid fa-xmark text-gray-400"></i>
                </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-gray-400 uppercase ml-1">Tên sản phẩm</label>
                    <input type="text" id="f-name" class="w-full p-3 bg-gray-100 dark:bg-black rounded-xl border-none focus:ring-2 focus:ring-brand-500 transition" value="${p.name || ''}">
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-gray-400 uppercase ml-1">Danh mục</label>
                    <input type="text" id="f-cat" class="w-full p-3 bg-gray-100 dark:bg-black rounded-xl border-none" value="${p.category || ''}">
                </div>
            </div>

            <div class="space-y-3 bg-gray-50/50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800">
                <div class="flex justify-between items-center mb-2">
                    <label class="text-[10px] font-black text-brand-600 uppercase tracking-widest">Danh sách phân loại</label>
                    <button onclick="window.addVariantRow()" class="text-[10px] bg-brand-600 text-white px-3 py-1.5 rounded-lg font-bold shadow-sm active:scale-95 transition">
                        <i class="fa-solid fa-plus mr-1"></i> THÊM LOẠI
                    </button>
                </div>
                
                <div id="variant-list" class="space-y-3">
                    </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-gray-400 uppercase ml-1">Bảo hành</label>
                    <input type="text" id="f-warranty" class="w-full p-3 bg-gray-100 dark:bg-black rounded-xl border-none" value="${p.warranty || ''}">
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-gray-400 uppercase ml-1">Loại (pType)</label>
                    <input type="text" id="f-ptype" class="w-full p-3 bg-gray-100 dark:bg-black rounded-xl border-none" value="${p.pType || ''}">
                </div>
            </div>

            <div class="space-y-2">
                <label class="text-[10px] font-bold text-gray-400 uppercase ml-1">Icon đại diện</label>
                <div class="flex flex-wrap gap-2 mb-2">
                    ${iconPresets.map(icon => `<button onclick="document.getElementById('f-icon').value='${icon}'" class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-brand-500 hover:text-white transition"><i class="fa-solid ${icon} text-[10px]"></i></button>`).join('')}
                </div>
                <input type="text" id="f-icon" class="w-full p-3 bg-gray-100 dark:bg-black rounded-xl border-none" value="${p.icon || 'fa-cube'}">
            </div>

            <div class="space-y-1">
                <label class="text-[10px] font-bold text-gray-400 uppercase ml-1">Ảnh Banner & Mô tả</label>
                <input type="text" id="f-banner" class="w-full p-3 bg-gray-100 dark:bg-black rounded-xl border-none mb-2" value="${p.banner || ''}" placeholder="Link ảnh...">
                <textarea id="f-desc" rows="3" class="w-full p-3 bg-gray-100 dark:bg-black rounded-xl border-none resize-none" placeholder="Mô tả sản phẩm...">${p.desc || ''}</textarea>
            </div>

            <button id="save-product-btn" class="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-glow-light active:scale-95 transition">
                LƯU THAY ĐỔI
            </button>
        </div>
    `;

    // 1. Hàm tạo dòng phân loại mới
    window.addVariantRow = (label = '', price = '') => {
        const row = document.createElement('div');
        row.className = "variant-row flex gap-2 animate-fade-in";
        row.innerHTML = `
            <input type="text" placeholder="Tên loại (VD: 1 Tháng)" class="v-label flex-1 p-3 bg-white dark:bg-black rounded-xl text-xs border border-gray-100 dark:border-zinc-800 focus:ring-1 focus:ring-brand-500 outline-none" value="${label}">
            <input type="number" placeholder="Giá tiền" class="v-price w-32 p-3 bg-white dark:bg-black rounded-xl text-xs border border-gray-100 dark:border-zinc-800 focus:ring-1 focus:ring-brand-500 outline-none" value="${price}">
            <button onclick="this.parentElement.remove()" class="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition">
                <i class="fa-solid fa-trash-can text-xs"></i>
            </button>
        `;
        document.getElementById('variant-list').appendChild(row);
    };

    // 2. Đổ dữ liệu cũ vào (nếu có)
    if (p.variants && p.variants.length > 0) {
        p.variants.forEach(v => window.addVariantRow(v.label, v.price));
    } else {
        window.addVariantRow(); // Mặc định hiện 1 dòng trống
    }

    // 3. Logic Lưu dữ liệu
    document.getElementById('save-product-btn').onclick = async () => {
        // Thu thập dữ liệu từ các dòng input phân loại
        const variantRows = document.querySelectorAll('.variant-row');
        const variants = Array.from(variantRows).map(row => ({
            label: row.querySelector('.v-label').value.trim(),
            price: Number(row.querySelector('.v-price').value)
        })).filter(v => v.label !== '');

        const data = {
            name: document.getElementById('f-name').value.trim(),
            category: document.getElementById('f-cat').value.trim(),
            pType: document.getElementById('f-ptype').value.trim(),
            warranty: document.getElementById('f-warranty').value.trim(),
            icon: document.getElementById('f-icon').value.trim(),
            banner: document.getElementById('f-banner').value.trim(),
            desc: document.getElementById('f-desc').value.trim(),
            variants: variants,
            // Giá gốc hiển thị sẽ lấy từ phân loại đầu tiên
            price: variants.length > 0 ? variants[0].price : 0,
            updatedAt: serverTimestamp()
        };

        if (!data.name) { showToast('Vui lòng nhập tên sản phẩm!', false); return; }

        try {
            const docRef = pid ? doc(db, 'artifacts', appId, 'public', 'data', 'products', pid) : collection(db, 'artifacts', appId, 'public', 'data', 'products');
            if (pid) await updateDoc(docRef, data);
            else await addDoc(docRef, data);
            
            closeModal();
            showToast('Lưu sản phẩm thành công!', true);
        } catch (e) {
            showToast('Lỗi: ' + e.message, false);
        }
    };
    openModal();
};



const updateOrderStatus = async (docId, buyerUid, status) => {
    try {
        // Update public order record
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', docId), { status });

        // Update buyer's private order record
        await updateDoc(doc(db, 'artifacts', appId, 'users', buyerUid, 'orders', docId), { status });

        showToast(`Đã ${status === 'Hoàn thành' ? 'duyệt' : 'hủy'} đơn hàng!`, true);
        renderAdminOrders();
    } catch (e) {
        showToast('Lỗi cập nhật: ' + e.message, false);
    }
};

const setAdminTab = (tab) => {
    adminTab = tab;
    renderAdmin();
};

// --- Original Features Maintained ---
const renderAccount = () => {
    const container = document.getElementById('main-view');

    // 1. Kiểm tra trạng thái đăng nhập
    if (!user || user.isAnonymous) {
        container.innerHTML = `
            <div class="max-w-md mx-auto bg-white dark:bg-dark-card p-8 rounded-3xl shadow-xl text-center fade-in mt-10">
                <div class="w-20 h-20 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fa-solid fa-user-lock text-4xl text-gray-400"></i>
                </div>
                <h2 class="text-2xl font-bold mb-2">Xin chào!</h2>
                <p class="text-gray-500 mb-8">Vui lòng đăng nhập để quản lý tài khoản và xem lịch sử đơn hàng của bạn.</p>
                <div class="space-y-4">
                    <button onclick="showAuthModal('login')" class="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-glow-light active:scale-95 transition">ĐĂNG NHẬP</button>
                    <button onclick="showAuthModal('register')" class="w-full py-4 bg-gray-100 dark:bg-gray-800 rounded-2xl font-bold active:scale-95 transition">TẠO TÀI KHOẢN</button>
                </div>
            </div>
        `;
        return;
    }

    // 2. Xác định Avatar (Sử dụng avatarSeed từ Firestore hoặc mặc định là UID)
    const seed = userData?.avatarSeed || user.uid;

    // 3. Vẽ giao diện chính
    container.innerHTML = `
        <div class="max-w-4xl mx-auto space-y-8 fade-in">
            
            <div class="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-dark-border flex flex-col sm:row items-center gap-6 relative overflow-hidden">
                <div class="absolute -top-10 -right-10 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl"></div>
                
                <div class="relative group">
                    <img src="https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${seed}" 
                         class="w-24 h-24 rounded-full border-4 border-brand-500 shadow-lg bg-brand-50 dark:bg-zinc-900 object-cover">
                    <button onclick="showEditProfileModal()" class="absolute bottom-0 right-0 w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center border-2 border-white dark:border-dark-card hover:scale-110 transition shadow-md">
                        <i class="fa-solid fa-camera text-[10px]"></i>
                    </button>
                </div>

                <div class="flex-1 text-center sm:text-left z-10">
                    <div class="flex items-center justify-center sm:justify-start gap-2 mb-1">
                        <h2 class="text-2xl font-extrabold tracking-tight">${userData?.name || 'Thành viên'}</h2>
                        <button onclick="showEditProfileModal()" class="text-gray-400 hover:text-brand-500 transition">
                            <i class="fa-solid fa-pen-to-square text-sm"></i>
                        </button>
                    </div>
                    <p class="text-sm text-gray-500 mb-4">${user.email}</p>
                    
                    <div class="flex flex-wrap justify-center sm:justify-start gap-2">
                        ${userData?.role === 'admin'
            ? '<span class="px-3 py-1 bg-red-100 text-red-600 text-[10px] font-black rounded-full uppercase tracking-wider">Administrator</span>'
            : '<span class="px-3 py-1 bg-brand-100 text-brand-600 text-[10px] font-black rounded-full uppercase tracking-wider">Khách hàng Premium</span>'}
                        <span class="px-3 py-1 bg-blue-100 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-wider">Đã xác minh</span>
                    </div>
                </div>

                <div class="flex sm:flex-col gap-2 w-full sm:w-auto">
                    ${userData?.role === 'admin' ? `
                        <button onclick="setView('admin')" class="flex-1 sm:w-12 sm:h-12 bg-brand-50 text-brand-600 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center hover:bg-brand-100 transition shadow-sm py-3 sm:py-0" title="Quản trị">
                            <i class="fa-solid fa-gauge-high text-xl"></i>
                            <span class="sm:hidden ml-2 font-bold text-sm">Quản trị viên</span>
                        </button>
                    ` : ''}
                    <button onclick="signOut(auth)" class="flex-1 sm:w-12 sm:h-12 bg-red-50 text-red-500 dark:bg-red-900/20 rounded-2xl flex items-center justify-center hover:bg-red-100 transition shadow-sm py-3 sm:py-0" title="Đăng xuất">
                        <i class="fa-solid fa-right-from-bracket text-xl"></i>
                        <span class="sm:hidden ml-2 font-bold text-sm">Đăng xuất</span>
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-white dark:bg-dark-card p-4 rounded-3xl border border-gray-100 dark:border-dark-border text-center">
                    <p class="text-[10px] text-gray-400 font-bold uppercase mb-1">Đơn hàng đã mua</p>
                    <p id="stat-total-orders" class="text-lg font-black text-brand-600">--</p>
                </div>
                <div class="bg-white dark:bg-dark-card p-4 rounded-3xl border border-gray-100 dark:border-dark-border text-center">
                    <p class="text-[10px] text-gray-400 font-bold uppercase mb-1">Hạng thành viên</p>
                    <p class="text-lg font-black text-amber-500">HunqMember</p>
                </div>
            </div>

            <div class="space-y-4">
                <div class="flex items-center justify-between px-2">
                    <h3 class="text-lg font-bold flex items-center gap-2">
                        <i class="fa-solid fa-clock-rotate-left text-brand-500"></i> Lịch sử đơn hàng
                    </h3>
                    <button onclick="fetchOrderHistory()" class="p-2 text-gray-400 hover:text-brand-500 transition">
                        <i class="fa-solid fa-rotate-right text-sm"></i>
                    </button>
                </div>
                
                <div id="order-history" class="space-y-3">
                    <div class="flex flex-col items-center justify-center py-12">
                        <div class="loading-spinner mb-3"></div>
                        <p class="text-xs text-gray-400">Đang tải lịch sử...</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 4. Kích hoạt tải dữ liệu đơn hàng ngay lập tức
    fetchOrderHistory();
};
// Danh sách các mẫu Avatar (Seed) đẹp
const avatarSeeds = ['Felix', 'Aneka', 'Zoe', 'Jack', 'Aiden', 'Emery', 'Luna', 'Caleb', 'Hunq', 'VJP'];

window.showEditProfileModal = () => {
    const container = document.getElementById('modal-content');
    // Lấy avatar hiện tại hoặc mặc định là uid
    let selectedSeed = userData?.avatarSeed || user.uid;

    container.innerHTML = `
        <div class="p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center">
                <h2 class="text-xl font-bold">Chỉnh sửa hồ sơ</h2>
                <button onclick="closeModal()"><i class="fa-solid fa-xmark text-gray-400"></i></button>
            </div>

            <div class="space-y-3">
                <label class="text-[10px] font-bold text-gray-400 uppercase">Chọn ảnh đại diện</label>
                <div class="flex gap-4 overflow-x-auto pb-2 hide-scrollbar py-2">
                    ${avatarSeeds.map(seed => `
                        <div onclick="selectAvatar(this, '${seed}')" 
                             class="avatar-option shrink-0 w-16 h-16 rounded-full border-4 transition cursor-pointer ${selectedSeed === seed ? 'border-brand-500 scale-110' : 'border-transparent opacity-60'}">
                            <img src="https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${seed}" class="rounded-full">
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="space-y-4">
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-gray-400 uppercase">Họ và tên</label>
                    <input type="text" id="edit-name" class="w-full p-3 bg-gray-100 dark:bg-black rounded-xl border-none focus:ring-2 focus:ring-brand-500" value="${userData?.name || ''}">
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-gray-400 uppercase">Link Facebook</label>
                    <input type="text" id="edit-fb" class="w-full p-3 bg-gray-100 dark:bg-black rounded-xl border-none focus:ring-2 focus:ring-brand-500" value="${userData?.facebook || ''}">
                </div>
            </div>

            <button onclick="saveUserProfile('${selectedSeed}')" id="btn-save-profile" class="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-600/20 active:scale-95 transition">
                LƯU THAY ĐỔI
            </button>
        </div>
    `;
    openModal();
};

// Hàm xử lý khi nhấn chọn avatar trong modal
window.selectAvatar = (el, seed) => {
    // Xóa active cũ
    document.querySelectorAll('.avatar-option').forEach(opt => {
        opt.classList.remove('border-brand-500', 'scale-110');
        opt.classList.add('border-transparent', 'opacity-60');
    });
    // Thêm active mới
    el.classList.remove('border-transparent', 'opacity-60');
    el.classList.add('border-brand-500', 'scale-110');

    // Cập nhật lại tham số cho nút Lưu (cách đơn giản nhất)
    document.getElementById('btn-save-profile').setAttribute('onclick', `saveUserProfile('${seed}')`);
};

// Hàm lưu vào Firebase
window.saveUserProfile = async (newSeed) => {
    const newName = document.getElementById('edit-name').value.trim();
    const newFb = document.getElementById('edit-fb').value.trim();

    if (!newName) {
        showToast('Tên không được để trống', false);
        return;
    }

    try {
        const userRef = doc(db, 'artifacts', appId, 'users', user.uid);
        const newData = {
            name: newName,
            facebook: newFb,
            avatarSeed: newSeed
        };

        await updateDoc(userRef, newData);

        // Cập nhật local state để UI thay đổi ngay lập tức
        userData = { ...userData, ...newData };

        closeModal();
        showToast('Cập nhật hồ sơ thành công!', true);

        // Vẽ lại giao diện tài khoản và Header
        renderAccount();
        updateUIHeader();
    } catch (e) {
        showToast('Lỗi: ' + e.message, false);
    }
};

const renderLookup = () => {
    const container = document.getElementById('main-view');
    container.innerHTML = `
                <div class="max-w-xl mx-auto py-10 fade-in">
                    <h2 class="text-3xl font-extrabold mb-8 text-center">Tra cứu nhanh</h2>
                    <div class="bg-white dark:bg-dark-card p-8 rounded-3xl shadow-xl space-y-6">
                        <div>
                            <label class="block text-[10px] font-bold text-gray-400 mb-2 uppercase">NHẬP MÃ ĐƠN HÀNG</label>
                            <input type="text" id="lookup-id" class="w-full p-4 bg-gray-100 dark:bg-black rounded-2xl border-none focus:ring-2 focus:ring-brand-500 transition" placeholder="VD: DH123456">
                        </div>
                        <button id="btn-do-lookup" class="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-glow-light hover:brightness-110 transition active:scale-95">TÌM KIẾM</button>
                    </div>
                    <div id="lookup-result" class="mt-8"></div>
                </div>
            `;
    document.getElementById('btn-do-lookup').onclick = async () => {
        const id = document.getElementById('lookup-id').value.trim();
        if (!id) return;
        const resDiv = document.getElementById('lookup-result');
        resDiv.innerHTML = `<div class="flex justify-center"><div class="loading-spinner"></div></div>`;

        const oRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
        const snap = await getDocs(oRef);
        const order = snap.docs.find(d => d.id === id || d.data().orderId === id);

        if (order) {
            const d = order.data();
            const remaining = getRemainingDays(d.expiryDate);
            // Trong renderLookup, đoạn d = order.data():
            resDiv.innerHTML = `
                    <div class="bg-white ...">
           
        </div>
    <div class="bg-white dark:bg-dark-card p-6 rounded-3xl border border-brand-500/20 shadow-sm fade-in">
        <div class="flex justify-between items-start mb-4">
            <div>
                <p class="text-[10px] text-gray-400 font-bold uppercase">Trạng thái / Hết hạn</p>
                <span class="px-2 py-0.5 bg-brand-100 text-brand-600 rounded-lg text-[10px] font-bold uppercase">${d.status}</span>
                <span class="ml-2 text-[10px] font-bold text-orange-500 ${remaining.class} ">${remaining.text}</span>
            </div>
            <div class="text-right">
                <p class="text-[10px] text-gray-400 font-bold uppercase">Mã đơn: ${d.orderId}</p>
                <p class="text-lg font-bold text-brand-600">${formatMoney(d.total)}</p>
            </div>
        </div>
        ${d.notes ? `<div class="p-3 bg-yellow-50 dark:bg-yellow-900/10 text-yellow-700 dark:text-yellow-500 text-[11px] rounded-xl mb-4 italic">Ghi chú: ${d.notes}</div>` : ''}
        <div class="space-y-2 pt-4 border-t border-gray-50 dark:border-zinc-800">
            ${d.items.map(i => `
                <div class="flex justify-between text-xs">
                    <span class="text-gray-500">${i.name} x${i.qty}</span>
                    <span class="font-bold">${formatMoney(i.price * i.qty)}</span>
                </div>
            `).join('')}
        </div>
    </div>
`;
        } else {
            resDiv.innerHTML = `<div class="bg-red-50 dark:bg-red-900/10 text-red-500 p-4 rounded-2xl text-center text-sm">Không tìm thấy mã đơn hàng này.</div>`;
        }
    };
};

const showProductDetails = (id) => {
    const p = products.find(x => x.id === id);
    if (!p) return;

    let selectedVariant = p.variants && p.variants.length > 0 ? p.variants[0] : null;
    let currentPrice = selectedVariant ? selectedVariant.price : p.price;

    const container = document.getElementById('modal-content');
    container.innerHTML = `
        <div class="h-32 bg-gradient-to-br from-brand-500 to-teal-700 relative">
            <img src="${p.banner || 'https://chesino.github.io/DATA/Banner/PriorityDark.png'}" class="w-full h-full object-cover opacity-30">
            <button onclick="closeModal()" class="absolute top-3 right-3 w-8 h-8 bg-black/20 text-white rounded-full flex items-center justify-center backdrop-blur-md"><i class="fa-solid fa-xmark text-xs"></i></button>
        </div>

        <div class="px-6 pb-6">
            <div class="flex items-end gap-3 -mt-10 relative z-10 mb-6">
                <div class="w-16 h-16 squircle bg-brand-500 text-white flex items-center justify-center text-2xl border-4 border-white dark:border-dark-card shadow-lg shrink-0">
                    <i class="fa-solid ${p.icon || 'fa-cube'}"></i>
                </div>
                <div class="pt-10">
                    <h1 class="text-2xl font-black leading-tight">${p.name}</h1>
                    <p class="text-[9px] text-brand-600 font-bold uppercase tracking-widest">${p.category}</p>
                </div>
            </div>

            <div class="space-y-5">
                <div class="grid grid-cols-2 gap-2">
                    <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-zinc-900/50 rounded-xl border border-gray-100 dark:border-zinc-800">
                        <i class="fa-solid fa-shield-check text-brand-500 text-[10px]"></i>
                        <div>
                            <p class="text-[10px] text-gray-400 font-bold uppercase leading-none">Bảo hành</p>
                            <p class="text-[16px] font-bold text-gray-700 dark:text-gray-300">${p.warranty || '1 đổi 1'}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-zinc-900/50 rounded-xl border border-gray-100 dark:border-zinc-800">
                        <i class="fa-solid fa-layer-group text-brand-500 text-[10px]"></i>
                        <div>
                            <p class="text-[10px] text-gray-400 font-bold uppercase leading-none">Loại hàng</p>
                            <p class="text-[16px] font-bold text-gray-700 dark:text-gray-300">${p.pType || 'Premium'}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-blue-50/30 dark:bg-white/5 p-3 rounded-2xl">
                    <p class="text-[14px] text-gray-600 dark:text-gray-400 leading-relaxed">${p.desc || 'Thông tin chi tiết sản phẩm đang được cập nhật.'}</p>
                </div>

                ${p.variants && p.variants.length > 0 ? `
                    <div class="space-y-2">
                        <p class="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Chọn phân loại:</p>
                        <div class="flex flex-wrap gap-2">
                            ${p.variants.map((v, idx) => `
                                <button onclick="selectVariant(this, ${v.price}, '${v.label}')" 
                                    class="variant-btn px-4 py-2 rounded-xl border font-bold text-[14px] transition-all ${idx === 0 ? 'bg-brand-600 text-white border-brand-600 shadow-sm' : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-500'}">
                                    ${v.label}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>

            <div class="mt-8 flex items-center gap-4 pt-4 border-t dark:border-zinc-800">
                <div class="flex-1">
                    <p class="text-[9px] text-gray-400 font-bold uppercase">Giá</p>
                    <p id="display-price" class="text-xl font-black text-brand-600">${formatMoney(currentPrice)}</p>
                </div>
                <button id="add-to-cart-btn" class="flex-[1.5] py-3.5 bg-brand-600 text-white rounded-2xl font-bold text-sm shadow-glow-light active:scale-95 transition-all">
                    MUA NGAY
                </button>
            </div>
        </div>
    `;

    let currentSelection = { price: currentPrice, label: selectedVariant ? selectedVariant.label : '' };

    window.selectVariant = (el, price, label) => {
        document.querySelectorAll('.variant-btn').forEach(btn => {
            btn.classList.remove('bg-brand-600', 'text-white', 'border-brand-600', 'shadow-sm');
            btn.classList.add('bg-white', 'dark:bg-zinc-900', 'border-gray-200', 'dark:border-zinc-800', 'text-gray-500');
        });
        el.classList.add('bg-brand-600', 'text-white', 'border-brand-600', 'shadow-sm');
        el.classList.remove('bg-white', 'dark:bg-zinc-900', 'border-gray-200', 'dark:border-zinc-800', 'text-gray-500');
        
        document.getElementById('display-price').innerText = formatMoney(price);
        currentSelection.price = price;
        currentSelection.label = label;
    };

    document.getElementById('add-to-cart-btn').onclick = () => {
        const cartId = currentSelection.label ? `${p.id}-${currentSelection.label}` : p.id;
        const displayName = currentSelection.label ? `${p.name} (${currentSelection.label})` : p.name;
        const exists = cart.find(i => i.cartId === cartId);
        
        if (exists) { exists.qty++; } 
        else { cart.push({ ...p, cartId, name: displayName, price: currentSelection.price, qty: 1 }); }
        
        updateCartUI();
        closeModal();
        showToast('Đã thêm vào giỏ hàng', true);
    };
    openModal();
};

// Đảm bảo Export ở cuối file main.js
window.showProductDetails = (id) => showProductDetails(id);

const startCheckout = async () => {
    if (cart.length === 0) return;
    if (!user) { showToast('Vui lòng đăng nhập!', false); showAuthModal(); return; }

    // Kiểm tra số lượng đơn chờ thanh toán (Yêu cầu 4)
    const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'orders'), where("status", "==", "Chờ thanh toán"));
    const pendingSnap = await getDocs(q);
    if (pendingSnap.size >= 2) {
        showToast('Bạn đang có 2 đơn chờ xử lý. Vui lòng thanh toán hoặc hủy bớt!', false);
        setView('account');
        return;
    }

    // Logic tạo OrderId (như bài trước)
    const ordersRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
    const allOrdersSnap = await getDocs(ordersRef);
    const orderId = `${(userData?.name || 'K').charAt(0).toUpperCase()}${(allOrdersSnap.size + 1).toString().padStart(5, '0')}`;
    const total = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);

    const orderData = {
        orderId, uid: user.uid, customer: userData?.name || user.email,
        items: cart.map(i => ({ name: i.name, price: i.price, qty: i.qty })),
        total, status: 'Chờ thanh toán', createdAt: serverTimestamp()
    };

    try {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId), orderData);
        await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'orders', orderId), orderData);

        toggleCart();
        const container = document.getElementById('modal-content');
        container.innerHTML = renderPaymentUI(orderId, total);

        // Vô hiệu hóa nút đóng và click ra ngoài (Yêu cầu 1)
        document.querySelector('[onclick="closeModal()"]').style.display = 'none';
        document.querySelector('.absolute.inset-0.bg-black\\/60').onclick = null;

        document.getElementById('confirm-pay-btn').onclick = () => {
            cart = []; updateCartUI();
            // Bật lại khả năng đóng modal
            document.querySelector('[onclick="closeModal()"]').style.display = 'flex';
            document.querySelector('.absolute.inset-0.bg-black\\/60').onclick = closeModal;
            closeModal();
            showToast('Đã gửi xác nhận thanh toán!', true);
            setView('account');
        };
        openModal();
    } catch (e) { showToast('Lỗi: ' + e.message, false); }
};

// --- Helper & Shared Utils ---
// Hàm copy văn bản
window.copyText = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Đã sao chép: ' + text, true);
    });
};

// Hàm hiển thị giao diện thanh toán (Dùng cho cả khi mới mua và khi xem lại đơn)
const renderPaymentUI = (orderId, total) => {
    const bankInfo = {
        name: "DINH MANH HUNG",
        number: "1015894887",
        bank: "Vietcombank",
        content: 'để mặc định tên bạn chuyển tiền',
        total: total,
        // content: orderId
    };

    return `
        <div class="p-6 text-center space-y-5">
            <h2 class="text-xl font-bold text-brand-600">Thông tin thanh toán</h2>
            <div class="bg-gray-50 dark:bg-zinc-900 p-4 rounded-2xl space-y-3 text-left border border-brand-500/20">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-[10px] text-gray-400 font-bold uppercase">Ngân hàng</p>
                        <p class="font-bold text-sm">${bankInfo.bank}</p>
                    </div>
                    <button onclick="copyText('${bankInfo.bank}')" class="text-brand-500 text-xs font-bold">Sao chép</button>
                </div>
                <div class="flex justify-between items-center border-t border-gray-100 dark:border-zinc-800 pt-2">
                    <div>
                        <p class="text-[10px] text-gray-400 font-bold uppercase">Số tài khoản</p>
                        <p class="font-bold text-sm">${bankInfo.number}</p>
                    </div>
                    <button onclick="copyText('${bankInfo.number}')" class="text-brand-500 text-xs font-bold">Sao chép</button>
                </div>
                <div class="flex justify-between items-center border-t border-gray-100 dark:border-zinc-800 pt-2">
                    <div>
                        <p class="text-[10px] text-gray-400 font-bold uppercase">Chủ tài khoản</p>
                        <p class="font-bold text-sm">${bankInfo.name}</p>
                    </div>
                    <button onclick="copyText('${bankInfo.name}')" class="text-brand-500 text-xs font-bold">Sao chép</button>
                </div>
                 <div class="flex justify-between items-center border-t border-gray-100 dark:border-zinc-800 pt-2">
                    <div>
                        <p class="text-[10px] text-gray-400 font-bold uppercase">Số tiền</p>
                        <h1 class="font-bold text-xl text-brand-600">${formatMoney(bankInfo.total)}</h1>
                    </div>
                    <button onclick="copyText('${bankInfo.total}')" class="text-brand-500 text-xs font-bold">Sao chép</button>
               
            </div>
            <img src="https://img.vietqr.io/image/VCB-1015894887-compact.png?amount=${total}&accountName=${bankInfo.name}" class="mx-auto border-4 border-white dark:border-zinc-800 rounded-2xl w-48 shadow-lg">
            <p class="text-[11px] text-red-500 italic font-medium">* Vui lòng không tắt bảng này cho đến khi xác nhận.</p>
            <button id="confirm-pay-btn" class="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-glow-light">TÔI ĐÃ CHUYỂN KHOẢN</button>
        </div>
    `;
};
const renderBlog = () => {
    const container = document.getElementById('main-view');
    const nRef = collection(db, 'artifacts', appId, 'public', 'data', 'news');

    // Dùng onSnapshot để tin tức tự cập nhật ngay khi admin vừa đăng
    onSnapshot(nRef, (snap) => {
        const news = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        if (news.length === 0) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-20 text-gray-400">
                    <i class="fa-regular fa-newspaper text-6xl mb-4 opacity-20"></i>
                    <p>Chưa có tin tức nào được đăng.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="max-w-4xl mx-auto space-y-8 fade-in">
                <div class="flex flex-col gap-6">
                    ${news.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds).map(n => `
                        <div class="bg-white dark:bg-dark-card p-6 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-zinc-800 transition hover:shadow-md">
                            <h2 class="text-2xl font-black text-brand-600 mb-3">${n.title}</h2>
                            <div class="flex items-center gap-2 mb-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <i class="fa-solid fa-user-pen"></i> ${n.author || 'Admin'} 
                                <span class="mx-2">•</span>
                                <i class="fa-solid fa-calendar-day"></i> ${n.createdAt?.toDate().toLocaleDateString('vi-VN') || 'Mới đây'}
                            </div>
                            <p class="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">${n.content}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
};

const showAuthModal = (mode = 'login') => {
    const container = document.getElementById('modal-content');
    container.innerHTML = `
                <div class="p-8 space-y-6">
                    <div class="text-center">
                        <h2 class="text-2xl font-bold">${mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</h2>
                        <p class="text-xs text-gray-400 mt-1 uppercase font-bold tracking-wider">HunqStore Pro System</p>
                    </div>
                    <div class="space-y-4">
                        ${mode === 'register' ? '<div class="space-y-1"><label class="text-[10px] font-bold text-gray-400 uppercase">Họ tên</label><input type="text" id="auth-name" class="w-full p-3 bg-gray-50 dark:bg-black rounded-xl border-none focus:ring-2 focus:ring-brand-500"></div>' : ''}
                        <div class="space-y-1"><label class="text-[10px] font-bold text-gray-400 uppercase">Email</label><input type="email" id="auth-email" class="w-full p-3 bg-gray-50 dark:bg-black rounded-xl border-none focus:ring-2 focus:ring-brand-500"></div>
                        <div class="space-y-1"><label class="text-[10px] font-bold text-gray-400 uppercase">Mật khẩu</label><input type="password" id="auth-pass" class="w-full p-3 bg-gray-50 dark:bg-black rounded-xl border-none focus:ring-2 focus:ring-brand-500"></div>
                        ${mode === 'register' ? '<div class="space-y-1"><label class="text-[10px] font-bold text-gray-400 uppercase">Link Facebook</label><input type="text" id="auth-fb" class="w-full p-3 bg-gray-50 dark:bg-black rounded-xl border-none focus:ring-2 focus:ring-brand-500"></div>' : ''}
                    </div>
                    <button id="auth-submit-btn" class="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-lg hover:brightness-110 active:scale-95 transition">${mode === 'login' ? 'VÀO CỬA HÀNG' : 'ĐĂNG KÝ NGAY'}</button>
                    <p class="text-center text-sm text-gray-500">
                        ${mode === 'login' ? 'Chưa có tài khoản? <span id="switch-auth" class="text-brand-500 font-bold cursor-pointer">Đăng ký</span>' : 'Đã có tài khoản? <span id="switch-auth" class="text-brand-500 font-bold cursor-pointer">Đăng nhập</span>'}
                    </p>
                </div>
            `;

    document.getElementById('switch-auth').onclick = () => showAuthModal(mode === 'login' ? 'register' : 'login');
    document.getElementById('auth-submit-btn').onclick = async () => {
        const email = document.getElementById('auth-email').value;
        const pass = document.getElementById('auth-pass').value;
        try {
            if (mode === 'login') {
                await signInWithEmailAndPassword(auth, email, pass);
            } else {
                const name = document.getElementById('auth-name').value;
                const fb = document.getElementById('auth-fb').value;
                const cred = await createUserWithEmailAndPassword(auth, email, pass);
                await setDoc(doc(db, 'artifacts', appId, 'users', cred.user.uid), {
                    name, email, facebook: fb, role: 'user', createdAt: serverTimestamp()
                });
            }
            closeModal();
            showToast('Thành công!', true);
        } catch (e) {
            showToast(e.message, false);
        }
    };
    openModal();
};

const fetchOrderHistory = async () => {
    const hDiv = document.getElementById('order-history');
    if (!user) return;
    
    const q = collection(db, 'artifacts', appId, 'users', user.uid, 'orders');
    const snap = await getDocs(q);
    
    if (snap.empty) {
        hDiv.innerHTML = `<p class="text-center py-10 text-gray-400 text-sm">Bạn chưa có đơn hàng nào.</p>`;
        return;
    }

    const history = snap.docs.map(d => d.data());
    
    hDiv.innerHTML = history.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds).map(o => {
        const remaining = getRemainingDays(o.expiryDate);
        
        return `
        <div class="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden mb-3 shadow-sm transition-all">
            <div class="p-4 flex justify-between items-center cursor-pointer active:bg-gray-50 dark:active:bg-zinc-900/50" onclick="toggleOrderDropdown('${o.orderId}')">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center">
                        <i class="fa-solid fa-receipt"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <p class="font-black text-sm text-gray-800 dark:text-gray-200">#${o.orderId}</p>
                            <button onclick="event.stopPropagation(); copyText('${o.orderId}')" class="text-gray-400 hover:text-brand-500 transition p-1">
                                <i class="fa-regular fa-copy text-[10px]"></i>
                            </button>
                        </div>
                        <p class="text-[10px] font-bold uppercase ${remaining.class}">${remaining.text}</p>
                    </div>
                </div>
                <div class="text-right flex items-center gap-3">
                    <div>
                        <p class="text-sm font-black text-brand-600">${formatMoney(o.total)}</p>
                        <span class="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${o.status === 'Hoàn thành' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}">${o.status}</span>
                    </div>
                    <i class="fa-solid fa-chevron-down text-gray-300 text-xs transition-transform duration-300" id="icon-${o.orderId}"></i>
                </div>
            </div>

            <div id="drop-${o.orderId}" class="hidden border-t border-gray-50 dark:border-zinc-800 bg-gray-50/30 dark:bg-black/20 p-4 fade-in">
                <div class="space-y-2 mb-4">
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Thông tin chi tiết:</p>
                    ${o.items.map(i => `
                        <div class="flex justify-between text-xs">
                            <span class="text-gray-500 dark:text-gray-400">${i.name} <b class="text-gray-700 dark:text-gray-300">x${i.qty}</b></span>
                            <span class="font-bold text-gray-700 dark:text-gray-200">${formatMoney(i.price * i.qty)}</span>
                        </div>
                    `).join('')}
                </div>
                
                ${o.notes ? `<div class="p-3 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 text-[11px] rounded-xl mb-4 italic">Ghi chú: ${o.notes}</div>` : ''}

                <div class="flex gap-2">
                    ${o.status === 'Chờ thanh toán' ? `
                        <button onclick="reShowPayment('${o.orderId}', ${o.total})" class="flex-1 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-xs">THANH TOÁN</button>
                        <button onclick="cancelOrder('${o.orderId}')" class="px-4 py-2.5 bg-red-50 text-red-500 rounded-xl font-bold text-xs">HỦY ĐƠN</button>
                    ` : `
                        <button onclick="copyText('Hỗ trợ đơn #${o.orderId}')" class="flex-1 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-500 rounded-xl font-bold text-xs">LIÊN HỆ HỖ TRỢ</button>
                    `}
                </div>
            </div>
        </div>
        `;
    }).join('');
};

// Hàm xử lý đóng mở Dropdown
window.toggleOrderDropdown = (orderId) => {
    const drop = document.getElementById(`drop-${orderId}`);
    const icon = document.getElementById(`icon-${orderId}`);
    
    if (drop.classList.contains('hidden')) {
        drop.classList.remove('hidden');
        icon.classList.add('rotate-180');
    } else {
        drop.classList.add('hidden');
        icon.classList.remove('rotate-180');
    }
};

window.toggleOrderDropdown = (orderId) => {
    const drop = document.getElementById(`drop-${orderId}`);
    const icon = document.getElementById(`icon-${orderId}`);

    if (drop.classList.contains('hidden')) {
        // Mở đơn hàng được chọn
        drop.classList.remove('hidden');
        icon.classList.add('rotate-180');
    } else {
        // Đóng đơn hàng
        drop.classList.add('hidden');
        icon.classList.remove('rotate-180');
    }
};
// Hàm Hủy Đơn (Yêu cầu 5)
window.cancelOrder = async (orderId) => {
    const ok = await niceConfirm('Hủy đơn hàng?', 'Bạn chắc chắn muốn hủy đơn hàng #' + orderId + '?');
    if (!ok) return;

    try {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId), { status: 'Hủy' });
        await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'orders', orderId), { status: 'Hủy' });
        showToast('Đã hủy đơn hàng', true);
        closeModal();
        fetchOrderHistory();
    } catch (e) { showToast('Lỗi: ' + e.message, false); }
};

// Xem chi tiết đơn trong lịch sử (Yêu cầu 3)
window.viewOrderHistoryDetail = async (orderId) => {
    const snap = await getDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'orders', orderId));
    const o = snap.data();
    const container = document.getElementById('modal-content');

    container.innerHTML = `
        <div class="p-8 space-y-6">
            <div class="flex justify-between items-start border-b pb-4 dark:border-zinc-800">
                <h2 class="text-xl font-bold">Chi tiết đơn: #${o.orderId}</h2>
                <button onclick="closeModal()"><i class="fa-solid fa-xmark text-gray-400"></i></button>
            </div>
            <div class="space-y-3">
                ${o.items.map(i => `<div class="flex justify-between text-sm"><span>${i.name} x${i.qty}</span><span class="font-bold">${formatMoney(i.price * i.qty)}</span></div>`).join('')}
                <div class="flex justify-between pt-2 border-t font-black text-brand-600"><span>TỔNG CỘNG</span><span>${formatMoney(o.total)}</span></div>
            </div>
            <div class="flex flex-col gap-3">
                ${o.status === 'Chờ thanh toán' ? `
                    <button onclick="reShowPayment('${o.orderId}', ${o.total})" class="w-full py-3 bg-brand-600 text-white rounded-xl font-bold">THANH TOÁN LẠI</button>
                ` : ''}
                ${(o.status === 'Chờ thanh toán' || o.status === 'Lỗi') ? `
                    <button onclick="cancelOrder('${o.orderId}')" class="w-full py-3 bg-red-50 text-red-500 rounded-xl font-bold">HỦY ĐƠN HÀNG</button>
                ` : ''}
            </div>
        </div>
    `;
    openModal();
};

window.reShowPayment = (id, total) => {
    document.getElementById('modal-content').innerHTML = renderPaymentUI(id, total);
    document.getElementById('confirm-pay-btn').onclick = () => { closeModal(); showToast('Đang kiểm tra...', true); };
};



const handleSearch = (keyword) => {
    const container = document.getElementById('main-view');
    if (!keyword) { renderHome(); return; }
    const results = products.filter(p => p.name.toLowerCase().includes(keyword.toLowerCase()));
    container.innerHTML = `
                <div class="space-y-6 fade-in">
                    <h2 class="text-xl font-bold">Tìm kiếm: "${keyword}"</h2>
                    ${results.length === 0 ? '<div class="py-12 text-center text-gray-400">Không tìm thấy sản phẩm.</div>' : `
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            ${results.map(p => `
                                <div class="flex items-center gap-4 p-4 bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-gray-50 dark:border-zinc-800 cursor-pointer hover:shadow-md transition" onclick="showProductDetails('${p.id}')">
                                    <div class="w-16 h-16 squircle bg-brand-500/10 text-brand-600 flex items-center justify-center text-2xl">
                                        <i class="fa-solid ${p.icon}"></i>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <h4 class="font-bold text-sm truncate">${p.name}</h4>
                                        <p class="text-[10px] text-gray-400 font-bold uppercase">${p.category}</p>
                                        <p class="text-sm text-brand-600 font-bold">${formatMoney(p.price)}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            `;
};

// --- Core Utils ---
// 1. Thay thế alert()
window.niceAlert = (title, msg) => {
    const container = document.getElementById('modal-content');
    container.innerHTML = `
        <div class="p-8 text-center space-y-4">
            <div class="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 text-brand-600 rounded-full flex items-center justify-center text-2xl mx-auto">
                <i class="fa-solid fa-circle-info"></i>
            </div>
            <h2 class="text-xl font-bold">${title}</h2>
            <p class="text-sm text-gray-500">${msg}</p>
            <button onclick="closeModal()" class="w-full py-3 bg-brand-600 text-white rounded-xl font-bold shadow-lg">ĐÃ HIỂU</button>
        </div>
    `;
    openModal();
};

// 2. Thay thế confirm() - Trả về Promise (true/false)
window.niceConfirm = (title, msg) => {
    return new Promise((resolve) => {
        const container = document.getElementById('modal-content');
        container.innerHTML = `
            <div class="p-8 text-center space-y-4">
                <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center text-2xl mx-auto">
                    <i class="fa-solid fa-circle-question"></i>
                </div>
                <h2 class="text-xl font-bold">${title}</h2>
                <p class="text-sm text-gray-500">${msg}</p>
                <div class="flex gap-3">
                    <button id="confirm-no" class="flex-1 py-3 bg-gray-100 dark:bg-zinc-800 rounded-xl font-bold text-gray-500">HỦY</button>
                    <button id="confirm-yes" class="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold shadow-lg">XÁC NHẬN</button>
                </div>
            </div>
        `;
        document.getElementById('confirm-no').onclick = () => { closeModal(); resolve(false); };
        document.getElementById('confirm-yes').onclick = () => { closeModal(); resolve(true); };
        openModal();
    });
};

// 3. Thay thế prompt() - Trả về Promise (string/null)
window.nicePrompt = (title, placeholder) => {
    return new Promise((resolve) => {
        const container = document.getElementById('modal-content');
        container.innerHTML = `
            <div class="p-8 space-y-4">
                <h2 class="text-xl font-bold text-center">${title}</h2>
                <input type="text" id="prompt-input" class="w-full p-4 bg-gray-100 dark:bg-black rounded-xl border-none focus:ring-2 focus:ring-brand-500" placeholder="${placeholder}">
                <div class="flex gap-3">
                    <button id="prompt-cancel" class="flex-1 py-3 bg-gray-100 dark:bg-zinc-800 rounded-xl font-bold text-gray-500">HỦY</button>
                    <button id="prompt-submit" class="flex-1 py-3 bg-brand-600 text-white rounded-xl font-bold shadow-lg">HOÀN TẤT</button>
                </div>
            </div>
        `;
        document.getElementById('prompt-cancel').onclick = () => { closeModal(); resolve(null); };
        document.getElementById('prompt-submit').onclick = () => {
            const val = document.getElementById('prompt-input').value;
            closeModal();
            resolve(val);
        };
        openModal();
        setTimeout(() => document.getElementById('prompt-input').focus(), 300);
    });
};
const formatMoney = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
const toggleTheme = () => {
    // 1. Thực hiện toggle class như cũ
    const isDark = document.documentElement.classList.toggle('dark');

    // 2. Lưu trạng thái vào localStorage (nếu có class dark thì lưu 'dark', không thì 'light')
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
};

const openModal = () => {
    const m = document.getElementById('modal-container');
    const c = document.getElementById('modal-content');
    m.classList.remove('hidden');
    setTimeout(() => { c.classList.remove('scale-95', 'opacity-0'); c.classList.add('scale-100', 'opacity-100'); }, 10);
};
window.closeModal = () => {
    const m = document.getElementById('modal-container');
    const c = document.getElementById('modal-content');
    c.classList.remove('scale-100', 'opacity-100');
    c.classList.add('scale-95', 'opacity-0');
    setTimeout(() => m.classList.add('hidden'), 200);
};
const toggleCart = () => {
    const d = document.getElementById('cart-drawer');
    const b = document.getElementById('cart-backdrop');
    const c = document.getElementById('cart-content');
    if (d.classList.contains('hidden')) {
        d.classList.remove('hidden');
        setTimeout(() => { b.classList.remove('opacity-0'); c.classList.remove('translate-x-full'); }, 10);
    } else {
        b.classList.add('opacity-0');
        c.classList.add('translate-x-full');
        setTimeout(() => d.classList.add('hidden'), 300);
    }
};
const updateCartUI = () => {
    const count = cart.reduce((acc, i) => acc + i.qty, 0);

    // Update Desktop Count (Header)
    const dCount = document.getElementById('desktop-cart-count');
    dCount.innerText = count;
    dCount.classList.toggle('scale-100', count > 0);
    dCount.classList.toggle('scale-0', count === 0);

    // Update Mobile Count (Bottom Nav)
    const mCount = document.getElementById('mobile-cart-count');
    mCount.innerText = count;
    mCount.classList.toggle('opacity-100', count > 0);
    mCount.classList.toggle('opacity-0', count === 0);
    const list = document.getElementById('cart-items');
    const totalDiv = document.getElementById('cart-total');
    if (cart.length === 0) {
        list.innerHTML = `<div class="text-center py-20 text-gray-400 text-sm">Giỏ hàng trống</div>`;
        totalDiv.innerText = '0đ';
        return;
    }
    list.innerHTML = cart.map(i => `
                <div class="flex items-center gap-4 group">
                    <div class="w-14 h-14 squircle bg-brand-500 text-white flex items-center justify-center"><i class="fa-solid ${i.icon}"></i></div>
                    <div class="flex-1">
                        <p class="font-bold text-xs">${i.name}</p>
                        <p class="text-[10px] text-gray-500">${formatMoney(i.price)} x ${i.qty}</p>
                    </div>
                    <div class="flex flex-col items-end">
                        <p class="font-bold text-sm text-brand-600">${formatMoney(i.price * i.qty)}</p>
                        <button onclick="removeFromCart('${i.id}')" class="text-[9px] text-red-500 font-bold uppercase hover:underline opacity-0 group-hover:opacity-100 transition">Xóa</button>
                    </div>
                </div>
            `).join('');
    totalDiv.innerText = formatMoney(cart.reduce((acc, i) => acc + (i.price * i.qty), 0));
};

window.removeFromCart = (id) => {
    cart = cart.filter(i => i.id !== id);
    updateCartUI();
};

const updateUIHeader = () => {
    const container = document.getElementById('auth-header-btn');
    if (user && !user.isAnonymous) {
        // Dùng avatarSeed nếu có, không thì dùng uid
        const seed = userData?.avatarSeed || user.uid;
        container.innerHTML = `
            <div class="w-10 h-10 rounded-full border-2 border-brand-500 overflow-hidden shadow-sm hover:scale-105 transition active:scale-95" onclick="setView('account')">
                <img src="https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${seed}" class="w-full h-full">
            </div>
        `;
    } else {
        container.innerHTML = `<button onclick="showAuthModal()" class="px-6 py-2 bg-brand-600 text-white rounded-full font-bold text-sm shadow-glow-light active:scale-95 transition">LOGIN</button>`;
    }
};
const showToast = (msg, success) => {
    const t = document.getElementById('toast');
    document.getElementById('toast-msg').innerText = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
};

window.deleteProduct = async (id) => {
    // Thay confirm bằng niceConfirm
    const ok = await niceConfirm('Xóa sản phẩm?', 'Dữ liệu sẽ bị ẩn khỏi cửa hàng và không thể hoàn tác.');
    if (ok) {
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', id), { hidden: true });
            showToast('Đã xóa sản phẩm', true);
        } catch (e) { showToast('Lỗi: ' + e.message, false); }
    }
};

// Window Exports for HTML
window.editProduct = (id) => showProductForm(id);
window.showProductDetails = (id) => showProductDetails(id);
window.setView = (v) => setView(v);
window.showAuthModal = showAuthModal;
window.toggleTheme = toggleTheme;
window.toggleCart = toggleCart;
window.startCheckout = startCheckout;
window.handleSearch = handleSearch;
window.setAdminTab = setAdminTab;
window.updateOrderStatus = updateOrderStatus;
window.showProductForm = showProductForm;
window.fetchOrderHistory = fetchOrderHistory;
window.showToast = showToast;
window.formatMoney = formatMoney;
window.products = products;
window.cart = cart;
window.updateCartUI = updateCartUI;

// Init App
initAuth();
fetchGlobalData();
