// Firebase Config and Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    signOut,
    signInWithPopup,
    GoogleAuthProvider,
    setPersistence,
    browserLocalPersistence // Import for saving login session
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    setDoc,
    getDoc,
    deleteDoc,
    query,
    where,
    onSnapshot,
    orderBy,
    writeBatch,
    runTransaction
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// IMPORTANT: These are global variables provided by the environment.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
    // Your provided Firebase config has been inserted here.
    apiKey: "AIzaSyATk8l02r44KE2c_PPytEg1Zv43rZZRcN8",
    authDomain: "store-hunq.firebaseapp.com",
    projectId: "store-hunq",
    storageBucket: "store-hunq.appspot.com",
    messagingSenderId: "879933378644",
    appId: "1:879933378644:web:41911950a1872b31df1dc1",
    measurementId: "G-D8TNFCSHQD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- GLOBAL STATE ---
let currentUser = null;
let unsubscribeCart = null; // To detach cart listener on logout
let appliedDiscount = null; // { code, percentage, ... }
let profileUpdateCallback = null; // To handle actions after profile update
let orderIntervals = {}; // To store countdown intervals
let allAdminOrders = []; // Cache for admin order filtering
let unsubscribeAdminOrders = null; // To detach admin order listener
let authReady = false; // Flag to handle initial auth state
let usersMap = new Map(); // Cache for user data
let adminOrderView = 'list'; // 'list' o
// r 'grid'
let productViewMode = 'grid'; // 'grid' or 'list'
let manualOrderItems = []; // State for manual order items
let allProductsCache = []; // Cache for all products for manual order search

// --- UI ELEMENTS ---
const loader = document.getElementById('loader');
const pages = document.querySelectorAll('.page');
const loggedInView = document.getElementById('logged-in-view');
const loggedOutView = document.getElementById('logged-out-view');
const userMenuButton = document.getElementById('user-menu-button');
const userMenu = document.getElementById('user-menu');
const adminLink = document.getElementById('admin-link');
const productList = document.getElementById('product-list');
const productDetailPage = document.getElementById('product-detail-page');
const cartItemCount = document.getElementById('cart-item-count');
const cartItemCountMobile = document.getElementById('cart-item-count-mobile');
const profileInfoModal = document.getElementById('profile-info-modal');
const confirmationModal = document.getElementById('confirmation-modal');
const manualOrderModal = document.getElementById('manual-order-modal');


// --- UTILS ---
const showLoader = () => loader.style.display = 'block';
const hideLoader = () => loader.style.display = 'none';

const showToast = (message, isError = false) => {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    toastMessage.textContent = message;

    const errorClasses = 'bg-red-600 dark:bg-red-500 dark:text-white';
    const successClasses = 'bg-slate-900 dark:bg-slate-200 dark:text-slate-900';

    toast.className = `fixed bottom-5 right-5 text-white py-3 px-5 rounded-xl shadow-lg z-50 transition-transform duration-300 translate-y-0 ${isError ? errorClasses : successClasses}`;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.className = toast.className.replace('translate-y-0', 'translate-y-20');
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, 3000);
};

const showConfirmationModal = (title, message, onConfirm) => {
    document.getElementById('confirmation-title').textContent = title;
    document.getElementById('confirmation-message').textContent = message;

    const confirmBtn = document.getElementById('confirmation-confirm-btn');
    const cancelBtn = document.getElementById('confirmation-cancel-btn');

    // Clone and replace the button to remove old event listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    const newCancelBtn = cancelBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

    newConfirmBtn.addEventListener('click', () => {
        onConfirm();
        confirmationModal.classList.add('hidden');
    });
    newCancelBtn.addEventListener('click', () => {
        confirmationModal.classList.add('hidden');
    });

    confirmationModal.classList.remove('hidden');
};


const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const getInitials = (name) => {
    if (!name || typeof name !== 'string' || name.trim() === '') return 'KH'; // Return KH for Khách Hàng if name is empty
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
};
const generateSlug = (text) => {
    if (!text) return '';
    return text.toString().toLowerCase()
        .normalize('NFD') // Tách các ký tự có dấu thành ký tự gốc và dấu
        .replace(/[\u0300-\u036f]/g, '') // Bỏ các dấu
        .replace(/\s+/g, '-') // Thay khoảng trắng bằng -
        .replace(/[^\w\-]+/g, '') // Bỏ các ký tự đặc biệt
        .replace(/\-\-+/g, '-') // Thay nhiều - thành 1 -
        .replace(/^-+/, '') // Bỏ - ở đầu
        .replace(/-+$/, ''); // Bỏ - ở cuối
};


// --- DARK MODE LOGIC ---
const themeMenuButton = document.getElementById('theme-menu-button');
const themeMenu = document.getElementById('theme-menu');
const themeOptions = document.querySelectorAll('.theme-option');
const activeThemeIcon = document.getElementById('theme-icon-active');

const matchMedia = window.matchMedia('(prefers-color-scheme: dark)');

const applyTheme = (theme) => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        activeThemeIcon.setAttribute('data-lucide', 'moon');
    } else if (theme === 'light') {
        document.documentElement.classList.remove('dark');
        activeThemeIcon.setAttribute('data-lucide', 'sun');
    } else { // system
        if (matchMedia.matches) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        activeThemeIcon.setAttribute('data-lucide', 'laptop');
    }
    lucide.createIcons(); // Re-render icons
};

themeMenuButton.addEventListener('click', () => {
    themeMenu.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
    if (!themeMenuButton.contains(e.target) && !themeMenu.contains(e.target)) {
        themeMenu.classList.add('hidden');
    }
});

themeOptions.forEach(option => {
    option.addEventListener('click', (e) => {
        e.preventDefault();
        const selectedTheme = e.currentTarget.dataset.theme;
        applyTheme(selectedTheme);
        themeMenu.classList.add('hidden');
    });
});

// Listen for OS theme changes
matchMedia.addEventListener('change', () => {
    if (localStorage.getItem('theme') === 'system') {
        applyTheme('system');
    }
});

// Apply initial theme on load
applyTheme(localStorage.getItem('theme') || 'system');

// START: Thêm đoạn code này
// --- BACK TO TOP BUTTON LOGIC ---
const backToTopBtn = document.getElementById('back-to-top-btn');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTopBtn.classList.remove('hidden');
    } else {
        backToTopBtn.classList.add('hidden');
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});
// END: Thêm đoạn code này


// --- ROUTING ---
const navigate = () => {
    // Reset discount when navigating away from cart
    if (window.location.hash !== '#cart') {
        appliedDiscount = null;
    }

    // Clear all order countdown intervals on navigation
    Object.values(orderIntervals).forEach(clearInterval);
    orderIntervals = {};


    const hash = window.location.hash || '#home';
    const [path, id] = hash.substring(1).split('/');

    pages.forEach(page => page.classList.remove('active'));

    let pageIdToFind = `${path}-page`;
    if (path === 'product') {
        pageIdToFind = 'product-detail-page';
    }

    let pageToShow = document.getElementById(pageIdToFind);

    if (pageToShow) {
        pageToShow.classList.add('active');
        window.scrollTo(0, 0); // Scroll to top on page change

        // Specific actions based on route
        switch (path) {
            case 'home':
                fetchAndDisplayProducts();
                break;
            case 'product':
                if (id) fetchAndDisplayProductDetail(id);
                break;
            case 'cart':
                if (!currentUser || currentUser.isAnonymous) { window.location.hash = '#login'; return; }
                displayCart();
                break;
            case 'orders':
                if (!currentUser || currentUser.isAnonymous) { window.location.hash = '#login'; return; }
                fetchAndDisplayOrders();
                break;
            case 'admin':
                if (!currentUser || currentUser.isAnonymous) { window.location.hash = '#login'; return; }
                // Further check for admin role is done in onAuthStateChanged
                displayAdminDashboard();
                break;
            case 'login':
                if (currentUser && !currentUser.isAnonymous) window.location.hash = '#home';
                break;
        }
    } else {
        document.getElementById('home-page').classList.add('active');
        fetchAndDisplayProducts();
    }
};

window.addEventListener('hashchange', navigate);
window.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    // onAuthStateChanged will trigger the initial navigation.
});


// --- AUTHENTICATION ---
setPersistence(auth, browserLocalPersistence)
    .then(() => {
        onAuthStateChanged(auth, async (user) => {
            authReady = true; // Mark that the initial check is complete
            if (user) {
                // User is signed in.
                const userDocRef = doc(db, `users`, user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    // NEW: Check if user is restricted
                    if (userData.isRestricted === true) {
                        showToast('Tài khoản của bạn đã bị hạn chế. Vui lòng liên hệ admin.', true);
                        await signOut(auth); // The subsequent auth state change will handle UI cleanup
                        return; // Stop further processing for this user
                    }
                    currentUser = { uid: user.uid, email: user.email, ...userData, isAnonymous: user.isAnonymous };
                    updateUIForLoggedInUser();
                    if (currentUser.isAdmin) {
                        adminLink.classList.remove('hidden');
                    } else {
                        adminLink.classList.add('hidden');
                        if (window.location.hash === '#admin') window.location.hash = '#home';
                    }
                } else if (!user.isAnonymous) {
                    console.error("User document not found for a signed-in user.");
                    currentUser = { uid: user.uid, email: user.email, name: user.displayName, photoURL: user.photoURL, phone: '', address: '', isAdmin: false, isAnonymous: false };
                }
                listenToCartChanges();
            } else {
                // User is signed out.
                currentUser = null;
                updateUIForLoggedOutUser();
            }
            navigate(); // Navigate after auth state is confirmed
        });
    })
    .catch((error) => {
        console.error("Error setting persistence: ", error);
    });

const triggerProfileUpdateModal = (callback = null) => {
    if (!currentUser) return;
    profileUpdateCallback = callback;

    const title = document.getElementById('profile-modal-title');
    const subtitle = document.getElementById('profile-modal-subtitle');
    const button = document.getElementById('profile-form-submit-btn');

    if (callback) { // Called during checkout
        title.textContent = 'Cập nhật thông tin';
        subtitle.textContent = 'Vui lòng cung cấp đầy đủ thông tin để tiếp tục đặt hàng.';
        button.textContent = 'Lưu và Tiếp tục';
    } else { // Called from user menu
        title.textContent = 'Tài khoản của tôi';
        subtitle.textContent = 'Chỉnh sửa thông tin cá nhân của bạn.';
        button.textContent = 'Lưu thay đổi';
    }

    document.getElementById('profile-name').value = currentUser.name || '';
    document.getElementById('profile-email').value = currentUser.email || '';
    document.getElementById('profile-phone').value = currentUser.phone || '';
    document.getElementById('profile-address').value = currentUser.address || '';
    profileInfoModal.classList.remove('hidden');
};


const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
        showLoader();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user exists in Firestore, if not, create a new document
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            await setDoc(userDocRef, {
                name: user.displayName || '',
                email: user.email,
                photoURL: user.photoURL || '',
                phone: user.phoneNumber || '',
                address: '',
                isAdmin: false,
                isRestricted: false // NEW: Default to not restricted
            });
            showToast('Chào mừng bạn đến với MyShop!');
        } else {
            const existingData = userDoc.data();
            // Update photoURL if it has changed, but keep existing name/phone/address
            if (existingData.photoURL !== user.photoURL) {
                await setDoc(userDocRef, { photoURL: user.photoURL }, { merge: true });
            }
            showToast('Đăng nhập thành công!');
        }
        window.location.hash = '#home';
    } catch (error) {
        console.error("Google Sign-In Error:", error);
        showToast(`Lỗi đăng nhập: ${error.code}`, true);
    } finally {
        hideLoader();
    }
};

const updateUIForLoggedInUser = () => {
    loggedInView.classList.remove('hidden');
    loggedOutView.classList.add('hidden');

    const userAvatar = document.getElementById('user-avatar');
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || currentUser.email)}&background=6366f1&color=fff`;
    userAvatar.src = currentUser.photoURL || defaultAvatar;
    userAvatar.onerror = () => { userAvatar.src = defaultAvatar; };

    document.getElementById('user-menu-name').textContent = currentUser.name || 'Người dùng';
    document.getElementById('user-menu-email').textContent = currentUser.email;

    document.getElementById('mobile-auth-link').href = "#"; // Prevent navigation
    document.getElementById('mobile-auth-link').onclick = () => {
        userMenu.classList.toggle('hidden');
    };
    document.querySelector('#mobile-auth-link span').textContent = 'Tài khoản';
};

const updateUIForLoggedOutUser = () => {
    loggedInView.classList.add('hidden');
    loggedOutView.classList.remove('hidden');
    userMenu.classList.add('hidden');
    adminLink.classList.add('hidden');
    updateCartCount(0);
    document.getElementById('mobile-auth-link').href = "#login";
    document.getElementById('mobile-auth-link').onclick = null;
    document.querySelector('#mobile-auth-link span').textContent = 'Đăng nhập';
};

userMenuButton.addEventListener('click', () => {
    userMenu.classList.toggle('hidden');
});
document.addEventListener('click', (e) => {
    if (!userMenuButton.contains(e.target) && !userMenu.contains(e.target)) {
        userMenu.classList.add('hidden');
    }
});

// Logout button
document.getElementById('logout-button').addEventListener('click', async () => {
    await signOut(auth);
    showToast('Đã đăng xuất.');
    window.location.hash = '#login';
});

// --- PRODUCTS ---
const renderPrice = (product) => {
    if (!product.variants || product.variants.length === 0) return '';

    const prices = product.variants.map(v => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    let priceDisplay;
    if (minPrice === maxPrice) {
        priceDisplay = formatCurrency(minPrice);
    } else {
        priceDisplay = `${formatCurrency(minPrice).replace(/\s*₫/g, '')} - ${formatCurrency(maxPrice)}`;
    }

    const hasDiscount = product.variants.some(v => v.originalPrice && v.originalPrice > v.price);
    let originalPriceDisplay = '';

    if (hasDiscount) {
        const originalPrices = product.variants
            .map(v => v.originalPrice || v.price)
            .filter(op => op > 0);

        if (originalPrices.length > 0) {
            const minOriginalPrice = Math.min(...originalPrices);
            const maxOriginalPrice = Math.max(...originalPrices);

            if (minOriginalPrice > minPrice || maxOriginalPrice > maxPrice) {
                if (minOriginalPrice === maxOriginalPrice) {
                    originalPriceDisplay = `<del class="text-xs text-slate-400">${formatCurrency(minOriginalPrice)}</del>`;
                } else {
                    originalPriceDisplay = `<del class="text-xs text-slate-400">${formatCurrency(minOriginalPrice).replace(/\s*₫/g, '')} - ${formatCurrency(maxOriginalPrice)}</del>`;
                }
            }
        }
    }

    return `
                <div class="flex flex-col items-start">
                    <span class="text-blue-500 font-bold dark:text-blue-400 text-sm">${priceDisplay}</span>
                    ${originalPriceDisplay}
                </div>
            `;
};


// XÓA hàm fetchAndDisplayProducts() cũ và THAY THẾ bằng hàm này
const fetchAndDisplayProducts = async (searchTerm = '') => {
    showLoader();
    try {
        // Cập nhật class cho container dựa trên chế độ xem
        if (productViewMode === 'grid') {
            productList.className = 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6';
        } else {
            productList.className = 'grid grid-cols-1 gap-4';
        }

        const productsCol = collection(db, "products");
        const productSnapshot = await getDocs(productsCol);
        let productsData = productSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        allProductsCache = productsData; // Cache for manual order search

        if (searchTerm) {
            searchTerm = searchTerm.toLowerCase();
            productsData = productsData.filter(p => p.name.toLowerCase().includes(searchTerm));
        }

        if (productsData.length === 0) {
            productList.innerHTML = `<p class="col-span-full text-center text-slate-500 dark:text-slate-400 py-10">Không có sản phẩm nào.</p>`;
            hideLoader();
            return;
        }

        productList.innerHTML = productsData.map(product => {
            const hasMultipleVariants = product.variants && product.variants.length > 1;

            const buttonClasses = "w-full px-3 py-2 rounded-lg text-sm font-semibold transition-colors bg-blue-100 text-blue-600 hover:bg-blue-500 hover:text-white dark:bg-slate-700 dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-white";
            const buttonHTML = hasMultipleVariants ?
                `<a href="#product/${product.slug}" class="${buttonClasses} text-center">Chọn mua</a>` :
                `<button data-product-id="${product.id}" data-variant-index="0" class="add-to-cart-quick ${buttonClasses}">Thêm vào giỏ</button>`;

            if (productViewMode === 'grid') {
                return `
                    <div class="royal-card rounded-2xl overflow-hidden flex flex-col group transition-shadow hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/20">
                        <a href="#product/${product.slug}" class="block">
                            <img src="${product.imageUrl || 'https://placehold.co/400x400/e2e8f0/cbd5e0?text=Image'}" alt="${product.name}" class="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300">
                        </a>
                        <div class="p-3 flex flex-col flex-grow">
                            <a href="#product/${product.slug}" class="block">
                                <h3 class="font-medium text-sm text-slate-800 dark:text-slate-200 h-10 line-clamp-2">${product.name}</h3>
                            </a>
                            <div class="mt-1 mb-2">${renderPrice(product)}</div>
                            <div class="mt-auto">${buttonHTML}</div>
                        </div>
                    </div>`;
            } else { // List View
                return `
                    <div class="royal-card rounded-2xl overflow-hidden flex flex-col sm:flex-row group transition-shadow hover:shadow-xl w-full">
                        <a href="#product/${product.slug}" class="block sm:w-1/4">
                            <img src="${product.imageUrl || 'https://placehold.co/400x400/e2e8f0/cbd5e0?text=Image'}" alt="${product.name}" class="w-full h-48 sm:h-full object-cover">
                        </a>
                        <div class="p-4 flex flex-col flex-grow sm:w-3/4">
                             <a href="#product/${product.slug}" class="block">
                                <h3 class="font-semibold text-lg dark:text-slate-100">${product.name}</h3>
                            </a>
                            <p class="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 flex-grow">${product.description}</p>
                            <div class="flex flex-col sm:flex-row sm:items-center justify-between mt-4">
                                <div class="mb-3 sm:mb-0">${renderPrice(product)}</div>
                                <div class="w-full sm:w-auto sm:max-w-[150px]">${buttonHTML}</div>
                            </div>
                        </div>
                    </div>`;
            }
        }).join('');
        lucide.createIcons();
    } catch (error) {
        console.error("Error fetching products: ", error);
        productList.innerHTML = `<p class="col-span-full text-center text-red-500">Lỗi tải sản phẩm.</p>`;
    } finally {
        hideLoader();
    }
};

const fetchAndDisplayProductDetail = async (productId) => {
    showLoader();
    try {
        const productDocRef = doc(db, "products", productId);
        const productDoc = await getDoc(productDocRef);
        if (productDoc.exists()) {
            const product = { id: productDoc.id, ...productDoc.data() };
            const hasVariants = product.variants && product.variants.length > 0;

            let variantsHTML = '';
            if (hasVariants) {
                variantsHTML = `
                        <div class="mb-6">
                            <h3 class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Chọn phân loại:</h3>
                            <div id="variant-options" class="flex flex-wrap gap-2">
                                ${product.variants.map((variant, index) => `
                                    <label class="block">
                                        <input type="radio" name="variant" value="${index}" class="sr-only peer" ${index === 0 ? 'checked' : ''}>
                                        <div class="cursor-pointer rounded-xl px-4 py-2 text-sm font-medium border bg-white dark:bg-slate-800 dark:border-slate-600 peer-checked:bg-blue-100 peer-checked:text-blue-800 peer-checked:border-blue-500 dark:peer-checked:bg-blue-900/50 dark:peer-checked:text-blue-300">
                                            ${variant.name}
                                        </div>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                        `;
            }


            productDetailPage.innerHTML = `
                        <div class="royal-card p-4 sm:p-6 rounded-2xl">
                             <div class="mb-4">
                                 <a href="#home" class="text-sm text-blue-600 hover:underline inline-flex items-center gap-1 dark:text-blue-400"><i data-lucide="arrow-left" class="w-4 h-4"></i>Quay lại</a>
                             </div>
                            <div class="grid md:grid-cols-2 gap-6 sm:gap-8">
                                <div>
                                    <img src="${product.imageUrl || 'https://placehold.co/600x600/e2e8f0/cbd5e0?text=Image'}" alt="${product.name}" class="w-full rounded-xl aspect-square object-cover">
                                </div>
                                <div>
                                    <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100">${product.name}</h1>
                                    <div class="my-4" id="product-price-display">
                                        </div>
                                    
                                    ${variantsHTML}

                                    <p class="text-slate-600 mb-6 dark:text-slate-300 whitespace-pre-wrap">${product.description}</p>
                                    <p class="text-sm text-slate-500 mb-4 dark:text-slate-400">Số lượng còn lại: <span id="product-stock-display"></span></p>
                                    <div class="flex items-center space-x-4">
                                         <div class="flex items-center border border-gray-300 rounded-xl dark:border-slate-600">
                                             <button id="detail-decrease-qty" class="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-xl dark:text-slate-300 dark:hover:bg-slate-700">-</button>
                                             <input id="detail-quantity" type="number" value="1" min="1" class="w-16 text-center border-l border-r focus:outline-none dark:bg-transparent dark:border-slate-600 dark:text-white">
                                             <button id="detail-increase-qty" class="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-xl dark:text-slate-300 dark:hover:bg-slate-700">+</button>
                                         </div>
                                        <button id="add-to-cart-btn-detail" class="flex-1 bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                                            <i data-lucide="shopping-cart" class="w-5 h-5"></i>
                                            Thêm vào giỏ hàng
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
            lucide.createIcons();

            const updateVariantDetails = () => {
                const selectedVariantIndex = document.querySelector('input[name="variant"]:checked')?.value || 0;
                const variant = product.variants[selectedVariantIndex];
                if (variant) {
                    const priceDisplayEl = document.getElementById('product-price-display');
                    let priceHTML = `<span class="text-3xl text-blue-500 font-bold dark:text-blue-400">${formatCurrency(variant.price)}</span>`;
                    if (variant.originalPrice && variant.originalPrice > variant.price) {
                        priceHTML += ` <del class="text-xl text-slate-400 align-middle">${formatCurrency(variant.originalPrice)}</del>`;
                    }
                    priceDisplayEl.innerHTML = priceHTML;

                    document.getElementById('product-stock-display').textContent = variant.stock;
                    document.getElementById('detail-quantity').max = variant.stock;
                    if (parseInt(document.getElementById('detail-quantity').value) > variant.stock) {
                        document.getElementById('detail-quantity').value = variant.stock;
                    }
                    document.getElementById('add-to-cart-btn-detail').disabled = variant.stock === 0;
                    if (variant.stock === 0) {
                        document.getElementById('add-to-cart-btn-detail').textContent = 'Hết hàng';
                        document.getElementById('add-to-cart-btn-detail').classList.replace('bg-blue-500', 'bg-slate-400');
                    } else {
                        document.getElementById('add-to-cart-btn-detail').innerHTML = `<i data-lucide="shopping-cart" class="w-5 h-5"></i> Thêm vào giỏ hàng`;
                        document.getElementById('add-to-cart-btn-detail').classList.replace('bg-slate-400', 'bg-blue-500');
                        lucide.createIcons();
                    }
                }
            }

            if (hasVariants) {
                updateVariantDetails();
                document.getElementById('variant-options').addEventListener('change', updateVariantDetails);
            }
        } else {
            productDetailPage.innerHTML = `<p class="text-center text-red-500">Sản phẩm không tồn tại.</p>`;
        }
    } catch (error) {
        console.error("Error fetching product detail: ", error);
        productDetailPage.innerHTML = `<p class="text-center text-red-500">Lỗi tải chi tiết sản phẩm.</p>`;
    } finally {
        hideLoader();
    }
}

// --- SEARCH ---
document.getElementById('search-input-desktop').addEventListener('input', (e) => handleSearch(e.target.value));
document.getElementById('search-input-mobile').addEventListener('input', (e) => handleSearch(e.target.value));

let searchTimeout;
const handleSearch = (query) => {
    clearTimeout(searchTimeout);
    window.location.hash = '#home'; // Always search on home page
    searchTimeout = setTimeout(() => {
        fetchAndDisplayProducts(query);
    }, 300); // Debounce search
};


// --- CART ---
const listenToCartChanges = () => {
    if (unsubscribeCart) unsubscribeCart();
    if (!currentUser || currentUser.isAnonymous) return;

    const cartColRef = collection(db, `users/${currentUser.uid}/cart`);
    unsubscribeCart = onSnapshot(cartColRef, (snapshot) => {
        const totalItems = snapshot.docs.reduce((sum, doc) => sum + doc.data().quantity, 0);
        updateCartCount(totalItems);
        if (window.location.hash === '#cart') {
            displayCart();
        }
    });
};

const updateCartCount = (count) => {
    cartItemCount.textContent = count;
    cartItemCountMobile.textContent = count;
    cartItemCount.classList.toggle('hidden', count === 0);
    cartItemCountMobile.classList.toggle('hidden', count === 0);
}

const addToCart = async (productId, selectedVariant, quantity = 1) => {
    if (!currentUser || currentUser.isAnonymous) {
        showToast('Vui lòng đăng nhập để thêm sản phẩm.', true);
        window.location.hash = '#login';
        return;
    }

    showLoader();
    try {
        const productDocRef = doc(db, "products", productId);
        const productDoc = await getDoc(productDocRef);
        if (!productDoc.exists()) {
            throw new Error("Sản phẩm không tồn tại");
        }
        const productData = productDoc.data();

        const variantId = selectedVariant.name.replace(/\s+/g, '-').toLowerCase();
        const cartItemId = `${productId}_${variantId}`;

        const cartItemRef = doc(db, `users/${currentUser.uid}/cart`, cartItemId);
        const cartItemDoc = await getDoc(cartItemRef);

        let newQuantity = quantity;
        if (cartItemDoc.exists()) {
            newQuantity += cartItemDoc.data().quantity;
        }

        if (newQuantity > selectedVariant.stock) {
            showToast('Số lượng trong giỏ hàng vượt quá tồn kho.', true);
            return;
        }

        await setDoc(cartItemRef, {
            productId: productId,
            productName: productData.name,
            variantName: selectedVariant.name,
            quantity: newQuantity,
            price: selectedVariant.price,
            imageUrl: productData.imageUrl
        });
        showToast(`Đã thêm ${productData.name} (${selectedVariant.name}) vào giỏ hàng.`);
    } catch (error) {
        console.error("Error adding to cart: ", error);
        showToast('Thêm vào giỏ hàng thất bại.', true);
    } finally {
        hideLoader();
    }
};

const displayCart = async () => {
    if (!currentUser) return;
    showLoader();
    const cartContent = document.getElementById('cart-content');
    try {
        const cartColRef = collection(db, `users/${currentUser.uid}/cart`);
        const cartSnapshot = await getDocs(cartColRef);

        if (cartSnapshot.empty) {
            cartContent.innerHTML = `<p class="text-center text-slate-500 dark:text-slate-400">Giỏ hàng của bạn đang trống.</p>`;
            hideLoader();
            return;
        }

        let cartItemsHTML = '<div class="divide-y divide-slate-200 dark:divide-slate-700">';
        let subtotal = 0;
        let cartItems = cartSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        for (const item of cartItems) {
            subtotal += item.price * item.quantity;
            cartItemsHTML += `
                        <div class="grid grid-cols-6 sm:grid-cols-12 gap-2 sm:gap-4 items-center py-4">
                            <div class="col-span-1">
                                <img src="${item.imageUrl}" alt="${item.productName}" class="w-16 h-16 object-cover rounded-lg">
                            </div>

                            <div class="col-span-5 sm:col-span-5">
                                <h3 class="font-semibold text-slate-800 dark:text-slate-200 leading-tight">${item.productName}</h3>
                                <p class="text-xs text-slate-500 dark:text-slate-400">${item.variantName}</p>
                                <p class="text-sm text-slate-600 dark:text-slate-300 mt-1 md:hidden">${formatCurrency(item.price)}</p>
                            </div>

                            <div class="col-span-1 sm:hidden"></div>

                            <div class="col-span-3 sm:col-span-3 flex items-center justify-end sm:justify-center space-x-2">
                                <button data-id="${item.id}" data-change="-1" class="update-cart-qty p-1.5 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 flex-shrink-0"><i data-lucide="minus" class="w-4 h-4"></i></button>
                                <span class="w-10 text-center font-medium dark:text-white">${item.quantity}</span>
                                <button data-id="${item.id}" data-change="1" class="update-cart-qty p-1.5 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 flex-shrink-0"><i data-lucide="plus" class="w-4 h-4"></i></button>
                            </div>

                            <div class="col-span-2 sm:col-span-2 text-right font-semibold dark:text-white">
                                ${formatCurrency(item.price * item.quantity)}
                            </div>

                            <div class="col-span-1 text-right">
                                <button data-id="${item.id}" class="remove-from-cart text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-500/10">
                                    <i data-lucide="trash-2" class="w-5 h-5"></i>
                                </button>
                            </div>
                        </div>
                    `;
        }
        cartItemsHTML += '</div>';

        // --- Discount and Total Section ---
        let discountAmount = 0;
        let finalTotal = subtotal;

        if (appliedDiscount) {
            // Calculate subtotal of applicable products
            let applicableSubtotal = subtotal;
            if (appliedDiscount.applicableTo === 'specific') {
                applicableSubtotal = cartItems
                    .filter(item => appliedDiscount.productIds.includes(item.productId))
                    .reduce((sum, item) => sum + item.price * item.quantity, 0);
            }

            if (appliedDiscount.discountType === 'percentage') {
                let potentialDiscount = (applicableSubtotal * appliedDiscount.discountValue) / 100;
                if (appliedDiscount.maxDiscount > 0 && potentialDiscount > appliedDiscount.maxDiscount) {
                    discountAmount = appliedDiscount.maxDiscount;
                } else {
                    discountAmount = potentialDiscount;
                }
            } else { // Fixed amount
                discountAmount = appliedDiscount.discountValue;
            }

        }
        finalTotal = subtotal - discountAmount > 0 ? subtotal - discountAmount : 0;

        cartItemsHTML += `
                    <div class="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-slate-600 dark:text-slate-300">Tạm tính:</span>
                                <span class="dark:text-white">${formatCurrency(subtotal)}</span>
                            </div>
                            <div id="discount-display" class="${appliedDiscount ? 'flex' : 'hidden'} justify-between text-green-600 dark:text-green-400">
                                <span>Giảm giá (${appliedDiscount ? appliedDiscount.id : ''}):</span>
                                <span>-${formatCurrency(discountAmount)}</span>
                            </div>
                            <div class="flex justify-between items-center text-lg font-semibold text-slate-800 dark:text-slate-200">
                                <span>Tổng cộng:</span>
                                <span class="text-2xl font-bold text-blue-500 dark:text-blue-400">${formatCurrency(finalTotal)}</span>
                            </div>
                        </div>

                        <form id="discount-form" class="flex gap-2 mt-4">
                            <input type="text" id="discount-code-input" placeholder="Nhập mã giảm giá" class="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200">
                            <button type="submit" class="bg-slate-800 text-white px-4 py-2 rounded-xl hover:bg-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500 font-semibold text-sm">Áp dụng</button>
                        </form>

                        <button id="checkout-btn" class="w-full mt-4 bg-blue-500 text-white font-semibold py-3 rounded-xl hover:bg-blue-600 transition-colors">
                            Tiến hành Thanh toán
                        </button>
                    </div>
                `;

        cartContent.innerHTML = cartItemsHTML;
        lucide.createIcons();

    } catch (error) {
        console.error("Error displaying cart:", error);
        cartContent.innerHTML = `<p class="text-center text-red-500">Lỗi tải giỏ hàng.</p>`;
    } finally {
        hideLoader();
    }
};

const updateCartQuantity = async (itemId, change) => {
    const cartItemRef = doc(db, `users/${currentUser.uid}/cart`, itemId);
    try {
        await runTransaction(db, async (transaction) => {
            const cartItemDoc = await transaction.get(cartItemRef);
            if (!cartItemDoc.exists()) return;

            const cartItemData = cartItemDoc.data();
            const newQuantity = cartItemData.quantity + change;

            if (newQuantity <= 0) {
                transaction.delete(cartItemRef);
                return;
            }

            const productRef = doc(db, "products", cartItemData.productId);
            const productDoc = await transaction.get(productRef);
            if (!productDoc.exists()) return;

            const variant = productDoc.data().variants.find(v => v.name === cartItemData.variantName);
            if (!variant || newQuantity > variant.stock) {
                showToast('Số lượng vượt quá tồn kho.', true);
                return; // Abort transaction
            }

            transaction.update(cartItemRef, { quantity: newQuantity });
        });
    } catch (error) {
        console.error("Transaction failed: ", error);
        showToast("Lỗi cập nhật giỏ hàng", true);
    }
};

const removeFromCart = async (itemId) => {
    showConfirmationModal(
        'Xóa sản phẩm',
        'Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?',
        async () => {
            const cartItemRef = doc(db, `users/${currentUser.uid}/cart`, itemId);
            await deleteDoc(cartItemRef);
            showToast('Đã xóa sản phẩm khỏi giỏ hàng.');
        }
    );
};

// --- CHECKOUT AND ORDERS ---
const placeOrder = async (paymentMethod) => {
    if (!currentUser) return null;
    showLoader();

    const cartColRef = collection(db, `users/${currentUser.uid}/cart`);
    const cartSnapshot = await getDocs(cartColRef);

    if (cartSnapshot.empty) {
        showToast("Giỏ hàng của bạn đang trống.", true);
        hideLoader();
        return null;
    }

    try {
        const userOrdersQuery = query(collection(db, "orders"), where("userId", "==", currentUser.uid));
        const userOrdersSnapshot = await getDocs(userOrdersQuery);
        const newOrderNumber = userOrdersSnapshot.size + 1;
        const initials = getInitials(currentUser.name);
        const displayOrderId = `${initials}-${String(newOrderNumber).padStart(5, '0')}`;

        const batch = writeBatch(db);
        let subtotal = 0;
        const orderItems = [];
        const stockUpdates = [];

        for (const cartDoc of cartSnapshot.docs) {
            const item = cartDoc.data();
            subtotal += item.price * item.quantity;
            orderItems.push(item);
            stockUpdates.push({
                productId: item.productId,
                variantName: item.variantName,
                quantity: item.quantity
            });
            batch.delete(cartDoc.ref); // Clear cart item
        }

        // Stock Validation in Transaction
        await runTransaction(db, async (transaction) => {
            for (const update of stockUpdates) {
                const productRef = doc(db, "products", update.productId);
                const productDoc = await transaction.get(productRef);
                if (!productDoc.exists()) throw new Error(`Sản phẩm ${update.productId} không tồn tại.`);

                const productData = productDoc.data();
                const variantIndex = productData.variants.findIndex(v => v.name === update.variantName);
                if (variantIndex === -1) throw new Error(`Phân loại ${update.variantName} không tồn tại.`);

                const variant = productData.variants[variantIndex];
                if (variant.stock < update.quantity) throw new Error(`Sản phẩm ${productData.name} (${variant.name}) không đủ hàng.`);
            }
        });


        // If validation passes, proceed with batch write
        for (const update of stockUpdates) {
            const productRef = doc(db, "products", update.productId);
            const productDoc = await getDoc(productRef); // Re-get doc for batch
            const productData = productDoc.data();
            const variantIndex = productData.variants.findIndex(v => v.name === update.variantName);
            productData.variants[variantIndex].stock -= update.quantity;
            productData.totalStock = productData.variants.reduce((sum, v) => sum + v.stock, 0);
            batch.update(productRef, {
                variants: productData.variants,
                totalStock: productData.totalStock
            });
        }


        let discountAmount = 0;
        let finalTotal = subtotal;
        if (appliedDiscount) { /* discount logic */ }
        finalTotal = subtotal - discountAmount > 0 ? subtotal - discountAmount : 0;

        const orderStatus = paymentMethod === 'bank' ? 'Chờ thanh toán' : 'Chờ xác nhận';
        const newOrderRef = doc(collection(db, "orders"));

        batch.set(newOrderRef, {
            displayOrderId,
            userId: currentUser.uid,
            userName: currentUser.name,
            userAddress: currentUser.address,
            userPhone: currentUser.phone,
            paymentMethod,
            items: orderItems,
            subtotal,
            discountCode: appliedDiscount ? appliedDiscount.id : null,
            discountAmount,
            total: finalTotal,
            status: orderStatus,
            userNote: document.getElementById('user-order-note').value || "",
            adminNote: "",
            createdAt: new Date(),
            expiresAt: null
        });

        await batch.commit();
        appliedDiscount = null;
        showToast("Đặt hàng thành công!");
        sendOrderEmail(displayOrderId, currentUser, { items: orderItems, total: finalTotal, paymentMethod, status: orderStatus });
        window.location.hash = '#orders';
        return { displayOrderId, finalTotal };

    } catch (error) {
        console.error("Error placing order: ", error);
        showToast(`Lỗi đặt hàng: ${error.message}`, true);
        return null;
    } finally {
        hideLoader();
    }
};

const statusClasses = {

    'Chờ xác nhận': 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300',

    'Chờ thanh toán': 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',

    'Đang hoạt động': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',

    'Đang giao hàng': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',

    'Đã giao hàng': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',

    'Đã huỷ': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',

    'Từ chối': 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300',

    'Chờ hoàn tiền': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',

    'Hết hạn': 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'

};


const startCountdown = (elementId, expiryTimestamp) => {
    if (!expiryTimestamp) return;

    const element = document.getElementById(elementId);
    if (!element) return;

    const updateCountdown = () => {
        const now = new Date();
        const expiryDate = expiryTimestamp.toDate();
        const diff = expiryDate - now;

        if (diff <= 0) {
            element.innerHTML = `<p class="text-xs text-red-500 font-medium">Đã hết hạn</p>`;
            clearInterval(orderIntervals[elementId]);
            delete orderIntervals[elementId];
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        element.innerHTML = `<p class="text-xs text-blue-600 dark:text-blue-400 font-medium">Còn lại: ${days}d ${hours}h ${minutes}m</p>`;
    };

    updateCountdown();
    orderIntervals[elementId] = setInterval(updateCountdown, 60000); // Update every minute
};


const fetchAndDisplayOrders = async (searchTerm = '') => {
    if (!currentUser) return;
    showLoader();
    const orderList = document.getElementById('order-list');
    try {
        const q = query(collection(db, "orders"), where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);

        let ordersData = [];
        querySnapshot.forEach((doc) => {
            ordersData.push({ id: doc.id, ...doc.data() });
        });

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            ordersData = ordersData.filter(order =>
                (order.displayOrderId && order.displayOrderId.toLowerCase().includes(lowerCaseSearchTerm)) ||
                order.items.some(item => item.productName.toLowerCase().includes(lowerCaseSearchTerm))
            );
        }


        if (ordersData.length === 0) {
            orderList.innerHTML = `<p class="text-center text-slate-500 dark:text-slate-400">Không tìm thấy đơn hàng nào.</p>`;
            return;
        }

        ordersData.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());

        orderList.innerHTML = ordersData.map(order => {
            let effectiveStatus = order.status;
            if (order.expiresAt && order.expiresAt.toDate() < new Date() && ['Chờ xác nhận', 'Chờ thanh toán'].includes(order.status)) {
                effectiveStatus = 'Hết hạn';
            }
            const colorClass = statusClasses[effectiveStatus] || 'bg-slate-100 text-slate-800';
            const canCancel = ['Chờ xác nhận', 'Chờ thanh toán'].includes(order.status);

            return `
                    <details class="royal-card p-4 rounded-2xl overflow-hidden">
                        <summary class="flex justify-between items-center cursor-pointer">
                            <div class="flex items-center gap-4">
                                <div class="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                    <span>${order.displayOrderId || order.id}</span>
                                    <button class="copy-order-id-btn p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full" data-id="${order.displayOrderId || order.id}"><i data-lucide="copy" class="w-3 h-3"></i></button>
                                </div>
                                <span class="text-sm text-slate-500 dark:text-slate-400 hidden md:block">${order.createdAt.toDate().toLocaleDateString('vi-VN')}</span>
                            </div>
                            <div class="flex items-center gap-2 md:gap-4">
                                <div id="countdown-${order.id}" class="hidden md:block"></div>
                                <span class="font-bold text-slate-800 dark:text-slate-200">${formatCurrency(order.total)}</span>
                                <span class="text-xs font-semibold px-2 py-1 rounded-full ${colorClass}">${effectiveStatus}</span>
                                <i data-lucide="chevron-down" class="transition-transform duration-300"></i>
                            </div>
                        </summary>
                        <div class="mt-4 pt-4 border-t dark:border-slate-700">
                             <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="space-y-2">
                                    <h4 class="font-semibold text-sm dark:text-slate-200">Chi tiết sản phẩm</h4>
                                     ${order.items.map(item => `
                                        <div class="flex items-center">
                                            <img src="${item.imageUrl}" class="w-12 h-12 rounded-lg mr-4">
                                            <div class="flex-1">
                                                <p class="dark:text-slate-200">${item.productName} <span class="text-slate-400 text-xs">(${item.variantName})</span></p>
                                                <p class="text-xs text-slate-500 dark:text-slate-400">SL: ${item.quantity} - ${formatCurrency(item.price)}</p>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                                <div class="space-y-2 text-sm">
                                    <h4 class="font-semibold dark:text-slate-200">Thông tin đơn hàng</h4>
                                    <p class="dark:text-slate-300"><strong>Thanh toán:</strong> ${order.paymentMethod === 'cod' ? 'Khi nhận hàng' : 'Chuyển khoản'}</p>
                                    <p class="dark:text-slate-300"><strong>Người nhận:</strong> ${order.userName}</p>
                                    <p class="dark:text-slate-300"><strong>SĐT:</strong> ${order.userPhone}</p>
                                    <p class="dark:text-slate-300"><strong>Địa chỉ:</strong> ${order.userAddress}</p>
                                    ${order.userNote ? `<p class="dark:text-slate-300"><strong>Ghi chú:</strong> ${order.userNote}</p>` : ''}
                                     ${order.adminNote ? `<div class="mt-2 p-2 bg-blue-50 rounded-md dark:bg-blue-900/50"><p class="dark:text-blue-300 text-blue-800"><strong>Ghi chú từ shop:</strong> ${order.adminNote}</p></div>` : ''}
                                </div>
                             </div>

                             <div class="mt-4 pt-2 border-t dark:border-slate-700 flex justify-between items-center">
                                <div id="countdown-mobile-${order.id}" class="md:hidden"></div>
                                <div class="text-right flex-1">
                                    ${order.discountCode ? `
                                        <p class="text-sm text-green-600 dark:text-green-400">
                                            Giảm giá (${order.discountCode}): -${formatCurrency(order.discountAmount)}
                                        </p>
                                    ` : ''}
                                    ${canCancel && effectiveStatus !== 'Hết hạn' ? `<button data-id="${order.id}" class="cancel-order-btn mt-2 text-sm bg-red-500 text-white px-3 py-1 rounded-xl hover:bg-red-600">Hủy đơn hàng</button>` : ''}
                                </div>
                             </div>
                        </div>
                    </details>
                `}).join('');
        lucide.createIcons();
        // Start countdowns for orders that have an expiration
        ordersData.forEach(order => {
            if (order.expiresAt) {
                startCountdown(`countdown-${order.id}`, order.expiresAt);
                startCountdown(`countdown-mobile-${order.id}`, order.expiresAt);
            }
        });

    } catch (error) {
        console.error("Error fetching orders: ", error);
        orderList.innerHTML = `<p class="text-center text-red-500">Lỗi tải danh sách đơn hàng.</p>`;
    } finally {
        hideLoader();
    }
};

// --- ADMIN PANEL ---
const displayAdminDashboard = async () => {
    if (!currentUser || !currentUser.isAdmin) {
        showToast("Bạn không có quyền truy cập.", true);
        window.location.hash = "#home";
        return;
    }
    const filterEl = document.getElementById('admin-order-filter');
    filterEl.innerHTML = `<option value="all">Tất cả trạng thái</option>` +
        Object.keys(statusClasses).map(s => `<option value="${s}">${s}</option>`).join('');

    await fetchAdminUsers(); // Fetch users first to populate the map
    fetchAdminProducts();
    listenForAdminOrders();
    fetchAdminDiscountCodes();
};

const fetchAdminProducts = async () => {
    const adminProductList = document.getElementById('admin-product-list');
    try {
        const productsCol = collection(db, "products");
        const productSnapshot = await getDocs(productsCol);
        if (productSnapshot.empty) {
            adminProductList.innerHTML = `<tr><td colspan="4" class="text-center py-4">Chưa có sản phẩm nào. Hãy thêm một sản phẩm mới!</td></tr>`;
            return;
        }
        adminProductList.innerHTML = productSnapshot.docs.map(doc => {
            const product = { id: doc.id, ...doc.data() };
            return `
                        <tr class="border-b dark:border-slate-700">
                            <th scope="row" class="px-6 py-4 font-medium text-slate-900 whitespace-nowrap dark:text-white">
                                <div class="flex items-center">
                                    <img src="${product.imageUrl || 'https://placehold.co/40x40/e2e8f0/cbd5e0?text=?'}" class="w-10 h-10 rounded-lg mr-3 object-cover">
                                    <span>${product.name}</span>
                                </div>
                            </th>
                            <td class="px-6 py-4">${renderPrice(product)}</td>
                            <td class="px-6 py-4">${product.totalStock || 0}</td>
                            <td class="px-6 py-4 flex space-x-2">
                                <button data-id="${product.id}" class="edit-product-btn p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"><i data-lucide="edit"></i></button>
                                <button data-id="${product.id}" class="delete-product-btn p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"><i data-lucide="trash-2"></i></button>
                            </td>
                        </tr>
                    `;
        }).join('');
        lucide.createIcons();
    } catch (error) {
        console.error("Error fetching admin products:", error);
        adminProductList.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-red-500">Lỗi tải sản phẩm.</td></tr>`;
    }
}

// XÓA hàm renderAdminOrders() cũ và THAY THẾ bằng hàm này
const renderAdminOrders = () => {
    const adminOrderList = document.getElementById('admin-order-list');
    const searchTerm = document.getElementById('admin-order-search').value.toLowerCase();
    const statusFilter = document.getElementById('admin-order-filter').value;

    // Cập nhật class cho container dựa trên chế độ xem
    if (adminOrderView === 'list') {
        adminOrderList.className = 'space-y-3';
    } else {
        adminOrderList.className = 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4';
    }

    let filteredOrders = allAdminOrders;

    if (statusFilter !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
    }

    if (searchTerm) {
        filteredOrders = filteredOrders.filter(order => {
            const user = usersMap.get(order.userId);
            const userEmail = user ? user.email.toLowerCase() : '';
            return (order.displayOrderId && order.displayOrderId.toLowerCase().includes(searchTerm)) ||
                (order.userName && order.userName.toLowerCase().includes(searchTerm)) ||
                (userEmail.includes(searchTerm));
        });
    }

    if (filteredOrders.length === 0) {
        adminOrderList.innerHTML = `<div class="col-span-full text-center py-8 text-slate-500 dark:text-slate-400">Không có đơn hàng nào khớp.</div>`;
        return;
    }

    adminOrderList.innerHTML = filteredOrders.map(order => {
        const expiresAtDate = order.expiresAt ? new Date(order.expiresAt.toDate().getTime() - (order.expiresAt.toDate().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : '';
        let effectiveStatus = order.status;
        if (order.expiresAt && order.expiresAt.toDate() < new Date() && ['Chờ xác nhận', 'Chờ thanh toán'].includes(order.status)) {
            effectiveStatus = 'Hết hạn';
        }
        const colorClass = statusClasses[effectiveStatus] || 'bg-slate-100 text-slate-800';
        const user = usersMap.get(order.userId);
        const userEmail = user ? user.email : 'N/A';

        // HTML cho các sản phẩm trong đơn hàng (dùng chung cho cả 2 view)
        const itemsHTML = order.items.map(item => `
            <div class="flex items-start gap-3">
                <img src="${item.imageUrl}" class="w-12 h-12 rounded-lg flex-shrink-0">
                <div class="flex-1">
                    <p class="text-sm dark:text-slate-200 line-clamp-2">${item.productName} <span class="text-slate-400 text-xs">(${item.variantName})</span></p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">SL: ${item.quantity} x ${formatCurrency(item.price)}</p>
                </div>
                <p class="text-sm font-medium dark:text-slate-300">${formatCurrency(item.quantity * item.price)}</p>
            </div>
        `).join('');

        // HTML cho khu vực hành động (dùng chung cho cả 2 view)
        const actionsHTML = `
            <div>
                <label class="text-xs font-medium dark:text-slate-400">Trạng thái</label>
                <select data-id="${order.id}" class="admin-order-status mt-1 w-full text-sm rounded-xl border-slate-300 bg-white/80 dark:bg-slate-900/80 dark:border-slate-600 dark:text-white focus:ring-blue-500 focus:border-blue-500">
                    ${Object.keys(statusClasses).map(s => `<option value="${s}" ${order.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
            </div>
            <div>
                <label class="text-xs font-medium dark:text-slate-400">Hạn chót</label>
                <input type="datetime-local" value="${expiresAtDate}" data-id="${order.id}" class="admin-order-expires mt-1 w-full text-sm rounded-xl border-slate-300 bg-white/80 dark:bg-slate-900/80 dark:border-slate-600 dark:text-white focus:ring-blue-500 focus:border-blue-500">
            </div>
            <div>
                <label class="text-xs font-medium dark:text-slate-400">Ghi chú của Admin</label>
                <textarea data-id="${order.id}" rows="2" class="admin-order-note mt-1 w-full text-sm rounded-xl border-slate-300 bg-white/80 dark:bg-slate-900/80 dark:border-slate-600 dark:text-white focus:ring-blue-500 focus:border-blue-500">${order.adminNote || ''}</textarea>
                <button data-id="${order.id}" class="save-admin-note-btn text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-1 rounded-md hover:bg-blue-200 w-full mt-1">Lưu ghi chú</button>
            </div>
            <div class="border-t dark:border-slate-600 pt-2 mt-2">
                 <button data-id="${order.id}" class="delete-order-btn p-2 w-full flex justify-center items-center gap-2 text-red-600 hover:bg-red-500/10 rounded-xl text-sm font-semibold"><i data-lucide="trash-2" class="w-4 h-4"></i> Xóa vĩnh viễn</button>
            </div>
        `;

        // Render dựa trên chế độ xem
        if (adminOrderView === 'list') {
            return `
            <details class="bg-white dark:bg-slate-800/50 border dark:border-slate-700/50 p-4 rounded-2xl transition-all duration-300 open:ring-1 open:ring-blue-500 open:shadow-lg">
                <summary class="grid grid-cols-12 gap-4 items-center cursor-pointer list-none">
                    <div class="col-span-12 md:col-span-3 flex items-center gap-4">
                        <i data-lucide="package-2" class="w-8 h-8 text-blue-500 flex-shrink-0"></i>
                        <div>
                            <p class="font-semibold text-slate-800 dark:text-slate-100">${order.displayOrderId}</p>
                            <p class="text-xs text-slate-500 dark:text-slate-400">${order.createdAt.toDate().toLocaleString('vi-VN')}</p>
                        </div>
                    </div>
                    <div class="col-span-12 md:col-span-3">
                         <p class="font-medium text-slate-700 dark:text-slate-200 truncate">${order.userName}</p>
                         <p class="text-xs text-slate-500 dark:text-slate-400 truncate">${userEmail}</p>
                    </div>
                    <div class="col-span-6 md:col-span-2 font-bold text-slate-800 dark:text-slate-200 md:text-right">
                        ${formatCurrency(order.total)}
                    </div>
                    <div class="col-span-6 md:col-span-4 flex justify-end items-center gap-4">
                         <span class="text-xs font-semibold px-2.5 py-1 rounded-full ${colorClass}">${effectiveStatus}</span>
                         <i data-lucide="chevron-down" class="transition-transform duration-300"></i>
                    </div>
                </summary>
                <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="md:col-span-2 space-y-3">${itemsHTML}</div>
                    <div class="space-y-4">${actionsHTML}</div>
                </div>
            </details>
            `;
        } else { // Grid View
            return `
            <div class="bg-white dark:bg-slate-800/50 border dark:border-slate-700/50 rounded-2xl flex flex-col">
                <div class="p-4 border-b dark:border-slate-700">
                    <div class="flex justify-between items-center">
                        <p class="font-semibold text-slate-800 dark:text-slate-100">${order.displayOrderId}</p>
                         <span class="text-xs font-semibold px-2.5 py-1 rounded-full ${colorClass}">${effectiveStatus}</span>
                    </div>
                    <p class="text-xs text-slate-500 dark:text-slate-400">${order.userName}</p>
                </div>
                <div class="p-4 space-y-3 flex-grow">${itemsHTML}</div>
                <div class="p-4 mt-auto border-t dark:border-slate-700 space-y-3 bg-slate-50 dark:bg-slate-800 rounded-b-2xl">
                     <details>
                        <summary class="text-sm font-semibold cursor-pointer flex justify-between items-center">
                            Hành động
                            <i data-lucide="chevron-down" class="transition-transform duration-300 h-5 w-5"></i>
                        </summary>
                        <div class="mt-3 space-y-4">${actionsHTML}</div>
                     </details>
                </div>
            </div>
            `;
        }
    }).join('');
    lucide.createIcons();
};
const listenForAdminOrders = () => {
    if (unsubscribeAdminOrders) unsubscribeAdminOrders();
    unsubscribeAdminOrders = onSnapshot(query(collection(db, "orders")), (snapshot) => {
        allAdminOrders = [];
        snapshot.forEach((doc) => {
            allAdminOrders.push({ id: doc.id, ...doc.data() });
        });
        allAdminOrders.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
        renderAdminOrders();
    }, (error) => {
        console.error("Error fetching admin orders: ", error);
        document.getElementById('admin-order-list').innerHTML = `<p class="text-center text-sm text-red-500">Lỗi tải đơn hàng.</p>`;
    });
};

document.getElementById('admin-order-search').addEventListener('input', renderAdminOrders);
document.getElementById('admin-order-filter').addEventListener('change', renderAdminOrders);


const fetchAdminUsers = async () => {
    const userListEl = document.getElementById('admin-user-list');
    usersMap.clear(); // Clear the map before fetching
    try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        usersSnapshot.docs.forEach(doc => {
            usersMap.set(doc.id, doc.data());
        });

        userListEl.innerHTML = usersSnapshot.docs.map(doc => {
            const user = { id: doc.id, ...doc.data() };
            const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=6366f1&color=fff`;
            const avatarSrc = user.photoURL || defaultAvatar;
            const isRestricted = user.isRestricted || false;
            return `
                        <div class="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700">
                            <div class="flex items-center gap-3">
                                <img src="${avatarSrc}" class="w-8 h-8 rounded-full">
                                <div>
                                    <p class="text-sm font-medium dark:text-white">${user.name || 'Chưa có tên'}</p>
                                    <p class="text-xs text-slate-500 dark:text-slate-400">${user.email}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                ${user.isAdmin ? `<span class="text-xs font-semibold text-green-600 dark:text-green-400">Admin</span>` : ''}
                                ${isRestricted ? `<span class="text-xs font-semibold text-red-600 dark:text-red-400">Bị hạn chế</span>` : ''}
                                <button data-id="${user.id}" data-restricted="${isRestricted}" class="restrict-user-btn p-1 ${isRestricted ? 'text-green-500 hover:text-green-700' : 'text-red-500 hover:text-red-700'}" title="${isRestricted ? 'Bỏ hạn chế' : 'Hạn chế tài khoản'}">
                                    <i data-lucide="${isRestricted ? 'unlock' : 'ban'}" class="w-4 h-4"></i>
                                </button>
                                <button data-id="${user.id}" class="admin-edit-user-btn p-1 text-slate-500 hover:text-blue-500"><i data-lucide="edit-3" class="w-4 h-4"></i></button>
                            </div>
                        </div>
                    `;
        }).join('');
        lucide.createIcons();
    } catch (error) {
        console.error("Error fetching users for admin:", error);
        userListEl.innerHTML = `<p class="text-red-500 text-sm">Lỗi tải danh sách người dùng.</p>`;
    }
};

// Admin Product Modal
const productModal = document.getElementById('product-modal');
const productForm = document.getElementById('product-form');
document.getElementById('show-add-product-modal').addEventListener('click', () => {
    productForm.reset();
    document.getElementById('modal-title').textContent = 'Thêm Sản phẩm Mới';
    document.getElementById('product-id').value = '';
    document.getElementById('variant-container').innerHTML = '';
    addVariantRow(); // Add one default variant row
    productModal.classList.remove('hidden');
});
document.getElementById('cancel-product-form').addEventListener('click', () => {
    productModal.classList.add('hidden');
});
document.getElementById('close-profile-modal').addEventListener('click', () => profileInfoModal.classList.add('hidden'));

// THAY THẾ event listener cũ của productForm
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoader();
    const id = document.getElementById('product-id').value;
    let slug = document.getElementById('product-slug').value;
    const name = document.getElementById('product-name').value;

    // Tự động tạo slug nếu để trống, và chuẩn hóa slug nếu người dùng nhập
    if (!slug) {
        slug = generateSlug(name);
    } else {
        slug = generateSlug(slug); // Đảm bảo slug luôn đúng định dạng
    }

    // Kiểm tra slug có bị trùng không
    const currentSlug = productForm.dataset.currentSlug;
    if (!id || slug !== currentSlug) {
        const q = query(collection(db, "products"), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            showToast("Lỗi: Mã URL (slug) này đã tồn tại.", true);
            hideLoader();
            return;
        }
    }

    const productData = {
        name: name,
        slug: slug, // Thêm slug vào dữ liệu
        description: document.getElementById('product-description').value,
        imageUrl: document.getElementById('product-image-url-input').value,
        variants: [],
        basePrice: 0,
        totalStock: 0
    };

    // ... (phần code xử lý variants giữ nguyên không đổi) ...
    const variantRows = document.querySelectorAll('.variant-row');
    if (variantRows.length === 0) {
        showToast("Sản phẩm phải có ít nhất một phân loại.", true);
        hideLoader();
        return;
    }
    let minPrice = Infinity;
    variantRows.forEach(row => {
        const vName = row.querySelector('.variant-name').value;
        const price = parseFloat(row.querySelector('.variant-price').value);
        const originalPrice = parseFloat(row.querySelector('.variant-original-price').value) || 0;
        const stock = parseInt(row.querySelector('.variant-stock').value);
        if (vName && !isNaN(price) && !isNaN(stock)) {
            productData.variants.push({ name: vName, price, originalPrice, stock });
            productData.totalStock += stock;
            if (price < minPrice) minPrice = price;
        }
    });
    productData.basePrice = minPrice === Infinity ? 0 : minPrice;

    try {
        if (id) {
            await setDoc(doc(db, "products", id), productData);
            showToast("Cập nhật sản phẩm thành công!");
        } else {
            await addDoc(collection(db, "products"), productData);
            showToast("Thêm sản phẩm thành công!");
        }
        productModal.classList.add('hidden');
        fetchAdminProducts();
        fetchAndDisplayProducts();
    } catch (error) {
        console.error("Error saving product: ", error);
        showToast("Lỗi: " + error.message, true);
    } finally {
        hideLoader();
    }
});
// --- ADMIN DISCOUNT CODE ---
const discountCodeModal = document.getElementById('discount-code-modal');
const discountCodeForm = document.getElementById('discount-code-form');

const fetchAdminDiscountCodes = async () => {
    const listEl = document.getElementById('admin-discount-list');
    onSnapshot(collection(db, "discountCodes"), (snapshot) => {
        if (snapshot.empty) {
            listEl.innerHTML = `<p class="text-xs text-slate-500 dark:text-slate-400">Chưa có mã nào.</p>`;
            return;
        }
        listEl.innerHTML = snapshot.docs.map(doc => {
            const code = { id: doc.id, ...doc.data() };
            return `
                    <div class="flex justify-between items-center bg-slate-100 dark:bg-slate-700 p-2 rounded-xl">
                        <div>
                            <p class="font-mono font-bold dark:text-white">${code.id}</p>
                            <p class="text-xs text-slate-600 dark:text-slate-300">
                                ${code.discountType === 'fixed' ? formatCurrency(code.discountValue) : `${code.discountValue}%`}
                            </p>
                        </div>
                        <div class="flex items-center">
                            <button data-id="${code.id}" class="edit-discount-btn p-1 text-blue-500 hover:text-blue-700"><i data-lucide="edit" class="w-4 h-4"></i></button>
                            <button data-id="${code.id}" class="delete-discount-btn p-1 text-red-500 hover:text-red-700"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                        </div>
                    </div>
                    `
        }).join('');
        lucide.createIcons();
    });
};

const populateProductsForDiscountModal = async (selectedProductIds = []) => {
    const productListDiv = document.getElementById('discount-product-list');
    const productsSnapshot = await getDocs(collection(db, 'products'));
    productListDiv.innerHTML = productsSnapshot.docs.map(doc => {
        const product = { id: doc.id, ...doc.data() };
        const isChecked = selectedProductIds.includes(product.id);
        return `
                    <label class="flex items-center p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md">
                        <input type="checkbox" value="${product.id}" ${isChecked ? 'checked' : ''} class="discount-product-checkbox rounded text-blue-500">
                        <span class="ml-2 text-sm dark:text-slate-300">${product.name}</span>
                    </label>
                `;
    }).join('');
};

document.getElementById('add-discount-code-btn').addEventListener('click', async () => {
    discountCodeForm.reset();
    document.getElementById('discount-modal-title').textContent = 'Thêm Mã Giảm Giá';
    document.getElementById('discount-code-id').value = '';
    document.getElementById('discount-code-name').disabled = false;
    document.querySelector('input[name="applicableTo"][value="all"]').checked = true;
    document.getElementById('specific-products-container').classList.add('hidden');
    document.getElementById('discount-max-amount').disabled = false;
    await populateProductsForDiscountModal();
    discountCodeModal.classList.remove('hidden');
});

document.getElementById('cancel-discount-form').addEventListener('click', () => {
    discountCodeModal.classList.add('hidden');
});

discountCodeForm.addEventListener('change', (e) => {
    if (e.target.name === 'applicableTo') {
        document.getElementById('specific-products-container').classList.toggle('hidden', e.target.value === 'all');
    }
    if (e.target.id === 'discount-type') {
        const isPercentage = e.target.value === 'percentage';
        document.getElementById('discount-max-amount').disabled = !isPercentage;
        if (!isPercentage) document.getElementById('discount-max-amount').value = '';
    }
});

discountCodeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('discount-code-name').value.toUpperCase();
    const discountType = document.getElementById('discount-type').value;
    const discountValue = parseFloat(document.getElementById('discount-value').value);
    const minPurchase = parseFloat(document.getElementById('discount-min-purchase').value) || 0;
    const maxDiscount = discountType === 'percentage' ? (parseFloat(document.getElementById('discount-max-amount').value) || 0) : 0;
    const applicableTo = document.querySelector('input[name="applicableTo"]:checked').value;
    let productIds = [];

    if (applicableTo === 'specific') {
        document.querySelectorAll('.discount-product-checkbox:checked').forEach(cb => productIds.push(cb.value));
        if (productIds.length === 0) {
            showToast('Vui lòng chọn ít nhất một sản phẩm.', true);
            return;
        }
    }

    const discountData = { discountType, discountValue, minPurchase, maxDiscount, applicableTo, productIds, createdAt: new Date() };

    try {
        await setDoc(doc(db, "discountCodes", id), discountData);
        showToast("Lưu mã giảm giá thành công!");
        discountCodeModal.classList.add('hidden');
    } catch (error) {
        showToast("Lỗi khi lưu mã.", true);
        console.error(error);
    }
});

document.getElementById('profile-info-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    showLoader();
    const name = document.getElementById('profile-name').value;
    const phone = document.getElementById('profile-phone').value;
    const address = document.getElementById('profile-address').value;

    try {
        const userDocRef = doc(db, "users", currentUser.uid);
        await setDoc(userDocRef, { name, phone, address }, { merge: true });

        // Refresh currentUser object with new info
        currentUser.name = name;
        currentUser.phone = phone;
        currentUser.address = address;

        document.getElementById('profile-info-modal').classList.add('hidden');
        showToast('Đã cập nhật thông tin.');
        updateUIForLoggedInUser();

        if (profileUpdateCallback) {
            profileUpdateCallback();
            profileUpdateCallback = null; // Reset callback
        }

    } catch (error) {
        console.error("Profile update error:", error);
        showToast("Lỗi cập nhật thông tin.", true);
    } finally {
        hideLoader();
    }
});

// --- ADMIN EDIT USER MODAL LOGIC ---
const adminEditUserModal = document.getElementById('admin-edit-user-modal');
const adminEditUserForm = document.getElementById('admin-edit-user-form');
document.getElementById('close-admin-edit-user-modal').addEventListener('click', () => adminEditUserModal.classList.add('hidden'));

adminEditUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoader();
    const userId = document.getElementById('admin-edit-user-id').value;
    const name = document.getElementById('admin-edit-user-name').value;
    const phone = document.getElementById('admin-edit-user-phone').value;
    const address = document.getElementById('admin-edit-user-address').value;
    const isAdmin = document.getElementById('admin-edit-user-isadmin').checked;

    try {
        await setDoc(doc(db, 'users', userId), { name, phone, address, isAdmin }, { merge: true });
        showToast('Cập nhật người dùng thành công.');
        adminEditUserModal.classList.add('hidden');
        fetchAdminUsers();
    } catch (error) {
        console.error('Error updating user by admin:', error);
        showToast('Lỗi cập nhật người dùng.', true);
    } finally {
        hideLoader();
    }
});

// --- PAYMENT MODAL LOGIC ---
const paymentModal = document.getElementById('payment-modal');
const bankInfoDiv = document.getElementById('bank-transfer-info');
const codConfirmContainer = document.getElementById('cod-confirm-container');
const paymentMethodRadios = document.querySelectorAll('input[name="paymentMethod"]');

document.getElementById('close-payment-modal').addEventListener('click', () => paymentModal.classList.add('hidden'));

paymentMethodRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        const isBankTransfer = radio.value === 'bank';
        bankInfoDiv.classList.toggle('hidden', !isBankTransfer);
        codConfirmContainer.classList.toggle('hidden', isBankTransfer);
    });
});

document.getElementById('confirm-order-btn').addEventListener('click', () => {
    paymentModal.classList.add('hidden');
    placeOrder('cod');
});

document.getElementById('hunq-paygate-link').addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        // placeOrder creates the order and returns its details
        const orderDetails = await placeOrder('bank');
        if (orderDetails) {
            const { displayOrderId, finalTotal } = orderDetails;
            const ref = `chuyen tien ${displayOrderId}`;
            const amount = finalTotal;
            const paymentUrl = `https://hunq.online/PayGate/?Ref=${encodeURIComponent(ref)}&Amout=${amount}`;

            window.open(paymentUrl, '_blank');
            paymentModal.classList.add('hidden');
            // Navigation to #orders is handled inside placeOrder
        }
    } catch (error) {
        // Errors are already shown in placeOrder, just log it here.
        console.error("Payment initiation failed.");
    }
});

// --- EMAIL NOTIFICATION (Placeholder) ---
function sendOrderEmail(orderId, user, orderDetails) {
    console.log(`
                ===== EMAIL SIMULATION =====
                To: ${user.email}
                Subject: Xác nhận đơn hàng #${orderId}
                
                Chào ${user.name},
                Cảm ơn bạn đã đặt hàng tại MyShop.
                
                Chi tiết đơn hàng:
                ${orderDetails.items.map(item => `- ${item.productName} (${item.variantName}) x ${item.quantity}: ${formatCurrency(item.price * item.quantity)}`).join('\n')}
                
                Tổng cộng: ${formatCurrency(orderDetails.total)}
                Phương thức thanh toán: ${orderDetails.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản'}
                Trạng thái: ${orderDetails.status}
                
                Chúng tôi sẽ xử lý đơn hàng của bạn sớm nhất.
                ===========================
            `);
}

// --- MODAL BACKDROP CLOSE ---
[productModal, discountCodeModal, profileInfoModal, adminEditUserModal, paymentModal, confirmationModal, manualOrderModal].forEach(modal => {
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }
});

const addVariantRow = (variant = {}) => {
    const container = document.getElementById('variant-container');
    const div = document.createElement('div');
    div.className = 'variant-row grid grid-cols-12 gap-2 items-center';
    div.innerHTML = `
                <input type="text" placeholder="Tên (S,M,L..)" value="${variant.name || ''}" required class="variant-name col-span-3 text-sm rounded-lg border border-slate-300 bg-slate-50 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white">
                <input type="number" placeholder="Giá bán" value="${variant.price || ''}" required class="variant-price col-span-3 text-sm rounded-lg border border-slate-300 bg-slate-50 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white">
                <input type="number" placeholder="Giá gốc" value="${variant.originalPrice || ''}" class="variant-original-price col-span-3 text-sm rounded-lg border border-slate-300 bg-slate-50 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white">
                <input type="number" placeholder="Kho" value="${variant.stock || ''}" required class="variant-stock col-span-2 text-sm rounded-lg border border-slate-300 bg-slate-50 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white">
                <button type="button" class="remove-variant-btn col-span-1 text-red-500 hover:text-red-700 flex justify-center items-center"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            `;
    container.appendChild(div);
    lucide.createIcons();
};

document.getElementById('add-variant-btn').addEventListener('click', () => addVariantRow());

// --- MANUAL ORDER MODAL LOGIC ---
const showManualOrderModalBtn = document.getElementById('show-manual-order-modal');
const closeManualOrderModalBtn = document.getElementById('close-manual-order-modal');
const cancelManualOrderFormBtn = document.getElementById('cancel-manual-order-form');
const manualOrderForm = document.getElementById('manual-order-form');
const manualOrderProductSearch = document.getElementById('manual-order-product-search');
const manualOrderSearchResults = document.getElementById('manual-order-search-results');
const manualOrderItemsList = document.getElementById('manual-order-items-list');

const resetManualOrderForm = () => {
    manualOrderForm.reset();
    manualOrderItems = [];
    renderManualOrderItems();
    manualOrderSearchResults.innerHTML = '';
    manualOrderSearchResults.classList.add('hidden');
};

showManualOrderModalBtn.addEventListener('click', () => {
    resetManualOrderForm();
    manualOrderModal.classList.remove('hidden');
});

closeManualOrderModalBtn.addEventListener('click', () => {
    manualOrderModal.classList.add('hidden');
});

cancelManualOrderFormBtn.addEventListener('click', () => {
    manualOrderModal.classList.add('hidden');
});


manualOrderProductSearch.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    if (searchTerm.length < 2) {
        manualOrderSearchResults.classList.add('hidden');
        return;
    }
    
    const results = allProductsCache.filter(p => p.name.toLowerCase().includes(searchTerm));
    
    if (results.length > 0) {
        manualOrderSearchResults.innerHTML = results.map(p => `
            <div class="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer" data-product-id="${p.id}">
                <p class="font-medium text-sm">${p.name}</p>
                <p class="text-xs text-slate-500">${p.variants.length} phân loại</p>
            </div>
        `).join('');
        manualOrderSearchResults.classList.remove('hidden');
    } else {
        manualOrderSearchResults.classList.add('hidden');
    }
});

manualOrderSearchResults.addEventListener('click', (e) => {
    const productDiv = e.target.closest('[data-product-id]');
    if (productDiv) {
        const productId = productDiv.dataset.productId;
        const product = allProductsCache.find(p => p.id === productId);
        
        // For simplicity, we'll add the first variant. A more complex UI would let the admin choose.
        const variant = product.variants[0];
        
        const existingItem = manualOrderItems.find(item => item.productId === productId && item.variantName === variant.name);
        
        if(existingItem) {
            existingItem.quantity++;
        } else {
            manualOrderItems.push({
                productId: product.id,
                productName: product.name,
                variantName: variant.name,
                price: variant.price,
                imageUrl: product.imageUrl,
                quantity: 1
            });
        }
        
        renderManualOrderItems();
        manualOrderProductSearch.value = '';
        manualOrderSearchResults.classList.add('hidden');
    }
});

const renderManualOrderItems = () => {
    if (manualOrderItems.length === 0) {
        manualOrderItemsList.innerHTML = `<p class="text-slate-500 text-sm p-4 text-center">Chưa có sản phẩm nào.</p>`;
    } else {
        manualOrderItemsList.innerHTML = manualOrderItems.map((item, index) => `
            <div class="flex items-center gap-2 text-sm">
                <div class="flex-grow">
                    <p class="font-medium">${item.productName} <span class="text-xs text-slate-500">(${item.variantName})</span></p>
                    <p class="text-xs">${formatCurrency(item.price)}</p>
                </div>
                <input type="number" value="${item.quantity}" min="1" class="manual-item-qty w-16 text-center bg-transparent rounded-md border-slate-300 p-1" data-index="${index}">
                <button class="remove-manual-item-btn text-red-500 p-1" data-index="${index}"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            </div>
        `).join('');
        lucide.createIcons();
    }
    updateManualOrderTotal();
};

const updateManualOrderTotal = () => {
    const subtotal = manualOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = parseFloat(document.getElementById('manual-order-discount').value) || 0;
    const total = subtotal - discount;

    document.getElementById('manual-order-subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('manual-order-total').textContent = formatCurrency(total < 0 ? 0 : total);
};


manualOrderItemsList.addEventListener('change', (e) => {
    if (e.target.classList.contains('manual-item-qty')) {
        const index = parseInt(e.target.dataset.index);
        const newQty = parseInt(e.target.value);
        if (newQty > 0) {
            manualOrderItems[index].quantity = newQty;
            renderManualOrderItems();
        }
    }
});

manualOrderItemsList.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.remove-manual-item-btn');
    if(removeBtn) {
        const index = parseInt(removeBtn.dataset.index);
        manualOrderItems.splice(index, 1);
        renderManualOrderItems();
    }
});

document.getElementById('manual-order-discount').addEventListener('input', updateManualOrderTotal);

manualOrderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('manual-order-email').value.trim();
    const name = document.getElementById('manual-order-name').value.trim();
    
    if(!email || !name || manualOrderItems.length === 0) {
        showToast('Vui lòng điền email, tên và thêm ít nhất 1 sản phẩm.', true);
        return;
    }
    
    showLoader();

    try {
        const subtotal = manualOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discount = parseFloat(document.getElementById('manual-order-discount').value) || 0;
        const total = subtotal - discount > 0 ? subtotal - discount : 0;
        
        const q = query(collection(db, "orders"));
        const allOrdersSnapshot = await getDocs(q);
        const displayOrderId = `MANUAL-${String(allOrdersSnapshot.size + 1).padStart(5, '0')}`;

        await addDoc(collection(db, "orders"), {
            displayOrderId,
            userId: 'MANUAL_ORDER',
            userName: name,
            userEmail: email,
            userPhone: document.getElementById('manual-order-phone').value.trim(),
            userAddress: document.getElementById('manual-order-address').value.trim(),
            paymentMethod: 'manual',
            items: manualOrderItems,
            subtotal,
            discountAmount: discount,
            total,
            status: 'Đang hoạt động', // Or 'Chờ thanh toán', etc.
            createdAt: new Date(),
        });

        showToast(`Đã tạo đơn hàng thủ công ${displayOrderId}`);
        manualOrderModal.classList.add('hidden');
    } catch (error) {
        showToast('Lỗi tạo đơn hàng thủ công.', true);
        console.error("Manual order creation error:", error);
    } finally {
        hideLoader();
    }
});



// --- EVENT DELEGATION for dynamic content ---
document.body.addEventListener('click', async (e) => {
    if (e.target.closest('#google-signin-btn')) {
        handleGoogleSignIn();
    }
    if (e.target.closest('#edit-profile-link')) {
        triggerProfileUpdateModal();
    }

    // Remove variant button in product modal
    const removeVariantBtn = e.target.closest('.remove-variant-btn');
    if (removeVariantBtn) {
        removeVariantBtn.closest('.variant-row').remove();
    }

    // Add to cart from detail page
    const addToCartDetailBtn = e.target.closest('#add-to-cart-btn-detail');
    if (addToCartDetailBtn) {
        const urlParts = window.location.hash.substring(1).split('/');
        const productId = urlParts[1];
        const productDoc = await getDoc(doc(db, "products", productId));
        if (!productDoc.exists()) return;

        const productData = productDoc.data();
        const selectedVariantIndex = document.querySelector('input[name="variant"]:checked')?.value || 0;
        const selectedVariant = productData.variants[selectedVariantIndex];

        if (selectedVariant) {
            const quantity = parseInt(document.getElementById('detail-quantity').value);
            addToCart(productId, selectedVariant, quantity);
        } else {
            showToast("Vui lòng chọn một phân loại sản phẩm.", true);
        }
    }

    // NEW: Quick add to cart from home page
    const quickAddToCartBtn = e.target.closest('.add-to-cart-quick');
    if (quickAddToCartBtn) {
        e.preventDefault();
        const productId = quickAddToCartBtn.dataset.productId;
        const variantIndex = parseInt(quickAddToCartBtn.dataset.variantIndex, 10);

        const productRef = doc(db, "products", productId);
        const productDoc = await getDoc(productRef);
        if (productDoc.exists()) {
            const product = productDoc.data();
            const selectedVariant = product.variants[variantIndex];
            if (selectedVariant) {
                addToCart(productId, selectedVariant, 1);
            }
        }
    }


    // Update cart quantity buttons
    const updateQtyBtn = e.target.closest('.update-cart-qty');
    if (updateQtyBtn) {
        const itemId = updateQtyBtn.dataset.id;
        const change = parseInt(updateQtyBtn.dataset.change);
        updateCartQuantity(itemId, change);
    }

    // Remove from cart button
    const removeFromCartBtn = e.target.closest('.remove-from-cart');
    if (removeFromCartBtn) {
        removeFromCart(removeFromCartBtn.dataset.id);
    }

    // Cancel order button
    const cancelOrderBtn = e.target.closest('.cancel-order-btn');
    if (cancelOrderBtn) {
        showConfirmationModal(
            'Hủy đơn hàng',
            'Bạn có chắc chắn muốn hủy đơn hàng này?',
            async () => {
                showLoader();
                try {
                    await runTransaction(db, async (transaction) => {
                        const orderRef = doc(db, 'orders', cancelOrderBtn.dataset.id);
                        const orderDoc = await transaction.get(orderRef);
                        if (!orderDoc.exists()) throw "Đơn hàng không tồn tại.";

                        const orderData = orderDoc.data();
                        // Restore stock
                        for (const item of orderData.items) {
                            const productRef = doc(db, "products", item.productId);
                            const productDoc = await transaction.get(productRef);
                            if (productDoc.exists()) {
                                const productData = productDoc.data();
                                const variantIndex = productData.variants.findIndex(v => v.name === item.variantName);
                                if (variantIndex !== -1) {
                                    productData.variants[variantIndex].stock += item.quantity;
                                    productData.totalStock += item.quantity;
                                    transaction.update(productRef, {
                                        variants: productData.variants,
                                        totalStock: productData.totalStock
                                    });
                                }
                            }
                        }
                        transaction.update(orderRef, { status: 'Đã huỷ' });
                    });
                    showToast('Đã hủy đơn hàng thành công.');
                } catch (error) {
                    console.error("Error cancelling order:", error);
                    showToast('Hủy đơn hàng thất bại.', true);
                } finally {
                    hideLoader();
                    fetchAndDisplayOrders();
                }
            }
        );
    }

    // Copy Order ID
    const copyOrderIdBtn = e.target.closest('.copy-order-id-btn');
    if (copyOrderIdBtn) {
        const orderId = copyOrderIdBtn.dataset.id;
        const tempInput = document.createElement('input');
        document.body.appendChild(tempInput);
        tempInput.value = orderId;
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        showToast(`Đã sao chép mã: ${orderId}`);
    }


    // Checkout button opens payment modal
    if (e.target.id === 'checkout-btn') {
        if (currentUser.name && currentUser.address && currentUser.phone) {
            paymentModal.classList.remove('hidden');
        } else {
            showToast('Vui lòng cập nhật thông tin để tiếp tục.', true);
            triggerProfileUpdateModal(() => {
                // This callback will run after user saves their info
                paymentModal.classList.remove('hidden');
            });
        }
    }

    // Admin: Edit product
    const editProductBtn = e.target.closest('.edit-product-btn');
    if (editProductBtn) {
        const productId = editProductBtn.dataset.id;
        const productRef = doc(db, "products", productId);
        const productDoc = await getDoc(productRef);
        if (productDoc.exists()) {
            const product = productDoc.data();
            document.getElementById('modal-title').textContent = 'Chỉnh sửa Sản phẩm';
            document.getElementById('product-id').value = productId;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-description').value = product.description;
            document.getElementById('product-image-url-input').value = product.imageUrl;

            const variantContainer = document.getElementById('variant-container');
            variantContainer.innerHTML = ''; // Clear old variants
            if (product.variants && product.variants.length > 0) {
                product.variants.forEach(variant => addVariantRow(variant));
            } else {
                addVariantRow(); // Add a blank one if none exist
            }

            productModal.classList.remove('hidden');
        }
    }

    // Admin: Delete product
    const deleteProductBtn = e.target.closest('.delete-product-btn');
    if (deleteProductBtn) {
        showConfirmationModal(
            'Xóa sản phẩm',
            'Bạn có chắc muốn xóa sản phẩm này? Hành động này không thể hoàn tác.',
            async () => {
                showLoader();
                await deleteDoc(doc(db, "products", deleteProductBtn.dataset.id));
                showToast('Đã xóa sản phẩm.');
                fetchAdminProducts();
                fetchAndDisplayProducts();
                hideLoader();
            }
        );
    }

    // Admin: Edit discount code
    const editDiscountBtn = e.target.closest('.edit-discount-btn');
    if (editDiscountBtn) {
        const codeId = editDiscountBtn.dataset.id;
        const codeDoc = await getDoc(doc(db, "discountCodes", codeId));
        if (codeDoc.exists()) {
            const codeData = codeDoc.data();
            document.getElementById('discount-modal-title').textContent = 'Chỉnh sửa Mã Giảm Giá';
            discountCodeForm.reset();
            document.getElementById('discount-code-id').value = codeId;
            const codeNameInput = document.getElementById('discount-code-name');
            codeNameInput.value = codeId;
            codeNameInput.disabled = true; // Cannot change code name

            const discountTypeSelect = document.getElementById('discount-type');
            discountTypeSelect.value = codeData.discountType || 'percentage';
            document.getElementById('discount-value').value = codeData.discountValue;
            document.getElementById('discount-max-amount').disabled = discountTypeSelect.value !== 'percentage';
            document.getElementById('discount-max-amount').value = codeData.maxDiscount || '';
            document.getElementById('discount-min-purchase').value = codeData.minPurchase || 0;

            const applicableRadio = document.querySelector(`input[name="applicableTo"][value="${codeData.applicableTo}"]`);
            if (applicableRadio) applicableRadio.checked = true;

            await populateProductsForDiscountModal(codeData.productIds || []);
            document.getElementById('specific-products-container').classList.toggle('hidden', codeData.applicableTo === 'all');
            discountCodeModal.classList.remove('hidden');
        }
    }

    // Admin: Delete discount code
    const deleteDiscountBtn = e.target.closest('.delete-discount-btn');
    if (deleteDiscountBtn) {
        const codeId = deleteDiscountBtn.dataset.id;
        showConfirmationModal(
            'Xóa mã giảm giá',
            `Bạn có chắc muốn xóa mã "${codeId}"?`,
            async () => {
                await deleteDoc(doc(db, "discountCodes", codeId));
                showToast("Đã xóa mã giảm giá.");
            }
        );
    }

    // Admin: Delete order
    const deleteOrderBtn = e.target.closest('.delete-order-btn');
    if (deleteOrderBtn) {
        const orderId = deleteOrderBtn.dataset.id;
        showConfirmationModal(
            'Xóa đơn hàng',
            `Bạn có chắc muốn XÓA vĩnh viễn đơn hàng này? Hành động này không thể hoàn tác.`,
            async () => {
                showLoader();
                try {
                    await deleteDoc(doc(db, 'orders', orderId));
                    showToast('Đã xóa đơn hàng.');
                    // The onSnapshot listener will handle the UI update automatically
                } catch (error) {
                    console.error("Error deleting order:", error);
                    showToast('Lỗi khi xóa đơn hàng.', true);
                } finally {
                    hideLoader();
                }
            }
        );
    }


    // Admin: Edit user button
    const adminEditUserBtn = e.target.closest('.admin-edit-user-btn');
    if (adminEditUserBtn) {
        const userId = adminEditUserBtn.dataset.id;
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            document.getElementById('admin-edit-user-id').value = userId;
            document.getElementById('admin-edit-user-name').value = userData.name || '';
            document.getElementById('admin-edit-user-email').value = userData.email || '';
            document.getElementById('admin-edit-user-phone').value = userData.phone || '';
            document.getElementById('admin-edit-user-address').value = userData.address || '';
            document.getElementById('admin-edit-user-isadmin').checked = userData.isAdmin || false;
            adminEditUserModal.classList.remove('hidden');
        }
    }

    // Admin: Restrict user button
    const restrictUserBtn = e.target.closest('.restrict-user-btn');
    if (restrictUserBtn) {
        const userId = restrictUserBtn.dataset.id;
        const isCurrentlyRestricted = restrictUserBtn.dataset.restricted === 'true';
        const newRestrictedState = !isCurrentlyRestricted;
        const actionText = newRestrictedState ? 'hạn chế' : 'bỏ hạn chế';

        showConfirmationModal(
            `Xác nhận ${actionText}`,
            `Bạn có chắc muốn ${actionText} người dùng này?`,
            async () => {
                showLoader();
                try {
                    await setDoc(doc(db, 'users', userId), { isRestricted: newRestrictedState }, { merge: true });
                    showToast(`Đã ${actionText} người dùng.`);
                    fetchAdminUsers(); // Refresh the list
                } catch (error) {
                    console.error(`Error ${actionText} user:`, error);
                    showToast(`Lỗi khi ${actionText} người dùng.`, true);
                } finally {
                    hideLoader();
                }
            }
        );
    }

});

document.body.addEventListener('submit', async (e) => {
    // Apply discount form
    if (e.target.id === 'discount-form') {
        e.preventDefault();
        const input = document.getElementById('discount-code-input');
        const code = input.value.toUpperCase();
        if (!code) return;

        const codeRef = doc(db, "discountCodes", code);
        const codeDoc = await getDoc(codeRef);

        if (!codeDoc.exists()) {
            appliedDiscount = null;
            showToast("Mã giảm giá không hợp lệ.", true);
            await displayCart();
            return;
        }

        const codeData = { id: codeDoc.id, ...codeDoc.data() };
        const cartColRef = collection(db, `users/${currentUser.uid}/cart`);
        const cartSnapshot = await getDocs(cartColRef);
        const subtotal = cartSnapshot.docs.reduce((sum, doc) => sum + (doc.data().price * doc.data().quantity), 0);

        if (subtotal < codeData.minPurchase) {
            appliedDiscount = null;
            showToast(`Cần mua tối thiểu ${formatCurrency(codeData.minPurchase)} để dùng mã này.`, true);
            await displayCart();
            return;
        }

        appliedDiscount = codeData;
        showToast(`Áp dụng mã ${code} thành công!`);
        await displayCart();
    }
});

document.body.addEventListener('change', async (e) => {
    // Admin: Change order status
    if (e.target.classList.contains('admin-order-status')) {
        const orderId = e.target.dataset.id;
        const newStatus = e.target.value;
        const orderRef = doc(db, "orders", orderId);
        await setDoc(orderRef, { status: newStatus }, { merge: true });
        showToast(`Đã cập nhật trạng thái đơn hàng.`);
    }
    // Admin: Change order expiration
    if (e.target.classList.contains('admin-order-expires')) {
        const orderId = e.target.dataset.id;
        const dateValue = e.target.value;
        const orderRef = doc(db, "orders", orderId);
        const expiresAt = dateValue ? new Date(dateValue) : null;
        await setDoc(orderRef, { expiresAt }, { merge: true });
        showToast(`Đã cập nhật hạn sử dụng.`);
    }
});

document.getElementById('user-order-search').addEventListener('input', (e) => {
    fetchAndDisplayOrders(e.target.value);
});

// START: Thêm đoạn code này vào gần cuối file JS
const listViewBtn = document.getElementById('admin-view-list-btn');
const gridViewBtn = document.getElementById('admin-view-grid-btn');

listViewBtn.addEventListener('click', () => {
    adminOrderView = 'list';
    listViewBtn.classList.add('bg-white', 'dark:bg-slate-800', 'text-blue-600', 'shadow-sm');
    listViewBtn.classList.remove('text-slate-500', 'dark:text-slate-400', 'hover:bg-white/50');
    gridViewBtn.classList.remove('bg-white', 'dark:bg-slate-800', 'text-blue-600', 'shadow-sm');
    gridViewBtn.classList.add('text-slate-500', 'dark:text-slate-400', 'hover:bg-white/50');
    renderAdminOrders();
});

gridViewBtn.addEventListener('click', () => {
    adminOrderView = 'grid';
    gridViewBtn.classList.add('bg-white', 'dark:bg-slate-800', 'text-blue-600', 'shadow-sm');
    gridViewBtn.classList.remove('text-slate-500', 'dark:text-slate-400', 'hover:bg-white/50');
    listViewBtn.classList.remove('bg-white', 'dark:bg-slate-800', 'text-blue-600', 'shadow-sm');
    listViewBtn.classList.add('text-slate-500', 'dark:text-slate-400', 'hover:bg-white/50');
    renderAdminOrders();
});

// Thêm vào trong hàm addEventListener của document.body
document.body.addEventListener('click', async (e) => {
    // ... (giữ nguyên các event listener cũ của bạn) ...

    // Thêm event listener này cho nút "Lưu ghi chú"
    const saveNoteBtn = e.target.closest('.save-admin-note-btn');
    if (saveNoteBtn) {
        const orderId = saveNoteBtn.dataset.id;
        const noteTextarea = document.querySelector(`.admin-order-note[data-id="${orderId}"]`);
        if (noteTextarea) {
            try {
                const orderRef = doc(db, "orders", orderId);
                await setDoc(orderRef, { adminNote: noteTextarea.value }, { merge: true });
                showToast('Đã lưu ghi chú.');
            } catch (error) {
                showToast('Lỗi khi lưu ghi chú.', true);
                console.error("Error saving admin note: ", error);
            }
        }
    }
});
// END: Thêm đoạn code này

// START: Thêm đoạn code này
const productGridViewBtn = document.getElementById('product-view-grid-btn');
const productListViewBtn = document.getElementById('product-view-list-btn');

productGridViewBtn.addEventListener('click', () => {
    if (productViewMode === 'grid') return;
    productViewMode = 'grid';
    productGridViewBtn.classList.add('bg-white', 'dark:bg-slate-800', 'text-blue-600', 'shadow-sm');
    productGridViewBtn.classList.remove('text-slate-500', 'dark:text-slate-400');
    productListViewBtn.classList.remove('bg-white', 'dark:bg-slate-800', 'text-blue-600', 'shadow-sm');
    productListViewBtn.classList.add('text-slate-500', 'dark:text-slate-400');
    fetchAndDisplayProducts(document.getElementById('search-input-desktop').value);
});

productListViewBtn.addEventListener('click', () => {
    if (productViewMode === 'list') return;
    productViewMode = 'list';
    productListViewBtn.classList.add('bg-white', 'dark:bg-slate-800', 'text-blue-600', 'shadow-sm');
    productListViewBtn.classList.remove('text-slate-500', 'dark:text-slate-400');
    productGridViewBtn.classList.remove('bg-white', 'dark:bg-slate-800', 'text-blue-600', 'shadow-sm');
    productGridViewBtn.classList.add('text-slate-500', 'dark:text-slate-400');
    fetchAndDisplayProducts(document.getElementById('search-input-desktop').value);
});
// END: Thêm đoạn code này