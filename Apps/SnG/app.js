// =================================================================
// 1. IMPORTS & CONFIGURATION
// =================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
    getAuth, onAuthStateChanged, createUserWithEmailAndPassword,
    signInWithEmailAndPassword, signOut, updateProfile
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
    getFirestore, doc, setDoc, getDoc, addDoc, collection, query, where,
    onSnapshot, orderBy, serverTimestamp, updateDoc, deleteDoc, arrayUnion, getDocs
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Cấu hình Firebase (Thay bằng config của bạn nếu cần)
const firebaseConfig = {
    apiKey: "AIzaSyBQOcwUdtv1quQ1UWV8oaGY6kIUwITlSos",
    authDomain: "sharengo-hunq.firebaseapp.com",
    projectId: "sharengo-hunq",
    storageBucket: "sharengo-hunq.firebasestorage.app",
    messagingSenderId: "20454542571",
    appId: "1:20454542571:web:8021a519b26f9be30882ae",
    measurementId: "G-T0XNLVWXYV"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Biến Toàn Cục ---
let currentUser = null;
let currentTrip = { id: null, name: "", ownerId: null, maxPeople: 0, inviteCode: "" };
let map = null;
let locationMarker = null;
let historyLayer = null; // Layer chứa các điểm đã đi
let userIcon = null;
let historyUnsubscribe = null;
let chatUnsubscribe = null;
let localHistoryCache = []; // Cache dữ liệu để lọc/sort

// DOM Elements Chung
const loadingDiv = document.getElementById("loading");
const authContainer = document.getElementById("auth-container");
const appContainer = document.getElementById("app-container");
const formatter = new Intl.NumberFormat('vi-VN');

// Helper: Loading
function showLoading(msg) {
    if (loadingDiv) {
        loadingDiv.querySelector('span').textContent = msg;
        loadingDiv.style.display = 'flex';
        setTimeout(() => loadingDiv.style.opacity = '1', 10);
    }
}
function hideLoading() {
    if (loadingDiv) {
        loadingDiv.style.opacity = '0';
        setTimeout(() => loadingDiv.style.display = 'none', 300);
    }
}


// =================================================================
// 2. DYNAMIC ISLAND CORE (TRÁI TIM CỦA GIAO DIỆN)
// =================================================================

// Cấu hình Playlist Nhạc
const playlist = [
    { title: "Chill Lofi", artist: "Share&Go", src: "./Music/song1.mp3" },
    { title: "Nhạc Đi Cà Phê", artist: "Unknown", src: "./Music/song2.mp3" },
    { title: "Giai Điệu Vui Vẻ", artist: "Relax", src: "./Music/song3.mp3" },
];

// Trạng thái Island
let pressTimer;
let isLongPress = false;
let islandState = 'idle'; // idle | compact | expanded | alert | input
let isPlaying = false;
let currentSongIndex = 0;

// Cấu hình kích thước các trạng thái
// TRONG FILE app.js

const ISLAND_STATES = {
    idle: { width: '160px', height: '36px', radius: '20px' },
    compact: { width: '220px', height: '36px', radius: '20px' },
    expanded: { width: '360px', height: '218px', radius: '44px' },
    alert: { width: '360px', height: '54px', radius: '27px' },
    confirm: { width: '300px', height: '180px', radius: '32px' },
    input: { width: '300px', height: '180px', radius: '32px' },
    upload: { width: '260px', height: '44px', radius: '22px' }
};
// DOM Elements Island
const islandContainer = document.getElementById('island-container');
const viewIdle = document.getElementById('view-idle');
const viewCompact = document.getElementById('view-compact');
const viewExpanded = document.getElementById('view-expanded');
const viewAlert = document.getElementById('view-alert');
const viewInput = document.getElementById('view-input'); // View nhập liệu mới
const touchLayer = document.getElementById('touch-layer');
const alertActions = document.getElementById('alert-actions');

// --- HÀM CHUYỂN TRẠNG THÁI ISLAND ---
function setIslandState(state) {
    islandState = state;
    const config = ISLAND_STATES[state];

    // Animation: Thay đổi kích thước và bo góc
    if (islandContainer) {
        islandContainer.style.width = config.width;
        islandContainer.style.height = config.height;
        islandContainer.style.borderRadius = config.radius;
    }

    // Lấy tất cả các element view
    const viewIdle = document.getElementById('view-idle');
    const viewCompact = document.getElementById('view-compact');
    const viewExpanded = document.getElementById('view-expanded');
    const viewAlert = document.getElementById('view-alert');
    const viewInput = document.getElementById('view-input');
    const viewConfirm = document.getElementById('view-confirm');
    const viewUpload = document.getElementById('view-upload'); // View mới cho upload
    const touchLayer = document.getElementById('touch-layer');

    // 1. Reset tất cả view về ẩn (opacity = 0) và không nhận sự kiện chuột
    [viewIdle, viewCompact, viewExpanded, viewAlert, viewInput, viewConfirm, viewUpload].forEach(v => {
        if (v) {
            v.style.opacity = '0';
            v.style.pointerEvents = 'none';
        }
    });

    // 2. Logic hiển thị từng trạng thái cụ thể
    if (state === 'idle') {
        if (viewIdle) viewIdle.style.opacity = '1';
        if (touchLayer) touchLayer.style.pointerEvents = 'auto'; // Cho phép nhấn giữ để mở rộng
    }
    else if (state === 'compact') {
        if (viewCompact) viewCompact.style.opacity = '1';
        if (touchLayer) touchLayer.style.pointerEvents = 'auto';
    }
    else if (state === 'expanded') {
        if (viewExpanded) {
            viewExpanded.style.opacity = '1';
            viewExpanded.style.pointerEvents = 'auto'; // Cho phép tương tác các nút bên trong
        }
        if (touchLayer) touchLayer.style.pointerEvents = 'none'; // Tắt lớp cảm ứng nền
    }
    else if (state === 'alert') {
        if (viewAlert) {
            viewAlert.style.opacity = '1';
            viewAlert.style.pointerEvents = 'auto';
        }
        if (touchLayer) touchLayer.style.pointerEvents = 'none';
    }
    else if (state === 'confirm') {
        if (viewConfirm) {
            viewConfirm.style.opacity = '1';
            viewConfirm.style.pointerEvents = 'auto';
        }
        if (touchLayer) touchLayer.style.pointerEvents = 'none';
    }
    else if (state === 'input') {
        if (viewInput) {
            viewInput.style.opacity = '1';
            viewInput.style.pointerEvents = 'auto';
        }
        if (touchLayer) touchLayer.style.pointerEvents = 'none';
    }
    // [MỚI] Trạng thái Upload
    else if (state === 'upload') {
        if (viewUpload) {
            viewUpload.style.opacity = '1';
            viewUpload.style.pointerEvents = 'auto';
        }
        // Tùy chọn: Có thể cho phép nhấn vào để mở chi tiết hoặc tắt tương tác
        if (touchLayer) touchLayer.style.pointerEvents = 'none';
    }
}

// 3. CẬP NHẬT HÀM sysConfirm (Dùng view-confirm mới)
window.sysConfirm = (message) => {
    return new Promise((resolve) => {
        // Lấy các element trong view-confirm
        const msgEl = document.getElementById('confirm-message');
        const btnOk = document.getElementById('btn-confirm-ok');
        const btnCancel = document.getElementById('btn-confirm-cancel');

        // Gán nội dung câu hỏi
        if (msgEl) msgEl.textContent = message;

        // Mở Island dạng Modal
        setIslandState('confirm');

        // Rung 2 nhịp để chú ý
        if (navigator.vibrate) navigator.vibrate([30, 50]);

        // Xử lý sự kiện nút bấm
        const cleanup = () => {
            btnOk.onclick = null;
            btnCancel.onclick = null;
        };

        btnOk.onclick = () => {
            cleanup();
            setIslandState('idle');
            resolve(true);
        };

        btnCancel.onclick = () => {
            cleanup();
            setIslandState('idle');
            resolve(false);
        };
    });
};
// --- XỬ LÝ NHẤN GIỮ (HAPTIC TOUCH SIMULATION) ---
window.handlePressStart = () => {
    // Không xử lý nếu đang ở chế độ tương tác (Mở rộng/Thông báo/Nhập)
    if (['expanded', 'alert', 'input'].includes(islandState)) return;

    isLongPress = false;
    if (islandContainer) islandContainer.classList.add('island-squish'); // Hiệu ứng nhún

    pressTimer = setTimeout(() => {
        isLongPress = true;
        if (islandContainer) islandContainer.classList.remove('island-squish');
        if (navigator.vibrate) navigator.vibrate(50); // Rung thiết bị
        setIslandState('expanded');
    }, 350); // Giữ 0.35s để mở widget
};

window.handlePressEnd = () => {
    clearTimeout(pressTimer);
    if (islandContainer) islandContainer.classList.remove('island-squish');

    // Nếu chỉ là click nhanh (Tap) -> Mở chế độ Compact xem tên bài hát
    if (!isLongPress && ['idle', 'compact'].includes(islandState)) {
        if (islandState === 'idle') {
            setIslandState('compact');
            // Tự thu về sau 3s
            setTimeout(() => {
                if (islandState === 'compact') setIslandState('idle');
            }, 3000);
        } else {
            setIslandState('idle');
        }
    }
};

// Click ra ngoài để thu nhỏ về trạng thái Idle
document.addEventListener('click', (e) => {
    const island = document.getElementById('dynamic-island');
    if (islandState === 'expanded' && island && !island.contains(e.target)) {
        setIslandState('idle');
    }
});


// =================================================================
// 3. MUSIC PLAYER LOGIC (TÍCH HỢP ISLAND)
// =================================================================

const audio = document.getElementById('audio-player');
const widgetTitle = document.getElementById('widget-title');
const widgetArtist = document.getElementById('widget-artist');
const widgetPlayBtn = document.getElementById('widget-play-btn');
const widgetProgressBar = document.getElementById('widget-progress-bar');
const widgetProgressBg = document.getElementById('widget-progress-bg');
const scrollingTitle = document.getElementById('scrolling-title');
const idleLogo = document.getElementById('idle-logo');
const idleWaveform = document.getElementById('idle-waveform');

function loadSong(index) {
    if (index < 0) index = playlist.length - 1;
    if (index >= playlist.length) index = 0;

    currentSongIndex = index;
    const song = playlist[currentSongIndex];

    if (audio) audio.src = song.src;

    // Cập nhật giao diện Widget
    if (widgetTitle) widgetTitle.textContent = song.title;
    if (widgetArtist) widgetArtist.textContent = song.artist;
    // Cập nhật giao diện Compact (Chạy chữ)
    if (scrollingTitle) scrollingTitle.textContent = `${song.title} - ${song.artist}`;
}

// Các hàm điều khiển (Gắn vào window để HTML gọi)
window.togglePlay = () => {
    if (!audio.src || audio.src === window.location.href) loadSong(currentSongIndex);

    if (isPlaying) {
        audio.pause();
    } else {
        audio.play().catch(e => {
            console.error("Lỗi phát nhạc:", e);
            window.sysAlert("Không tìm thấy file nhạc!", "error");
        });
    }
};

window.playNext = () => {
    loadSong(currentSongIndex + 1);
    if (isPlaying) audio.play();
};

window.playPrev = () => {
    loadSong(currentSongIndex - 1);
    if (isPlaying) audio.play();
};

// Lắng nghe sự kiện Audio
if (audio) {
    audio.addEventListener('play', () => {
        isPlaying = true;
        if (widgetPlayBtn) widgetPlayBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';

        // HIỆU ỨNG: Ẩn Logo máy bay -> Hiện Sóng nhạc
        if (idleLogo && idleWaveform) {
            idleLogo.classList.add('opacity-0', 'scale-50');
            idleLogo.classList.remove('opacity-100', 'scale-100');
            idleWaveform.classList.add('opacity-100', 'scale-100');
            idleWaveform.classList.remove('opacity-0', 'scale-50');
        }
    });

    audio.addEventListener('pause', () => {
        isPlaying = false;
        if (widgetPlayBtn) widgetPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';

        // HIỆU ỨNG: Hiện Logo máy bay -> Ẩn Sóng nhạc
        if (idleLogo && idleWaveform) {
            idleWaveform.classList.add('opacity-0', 'scale-50');
            idleWaveform.classList.remove('opacity-100', 'scale-100');
            idleLogo.classList.add('opacity-100', 'scale-100');
            idleLogo.classList.remove('opacity-0', 'scale-50');
        }
    });

    // Cập nhật thanh tiến trình
    audio.addEventListener('timeupdate', (e) => {
        const { duration, currentTime } = e.srcElement;
        const progressPercent = (currentTime / duration) * 100;
        if (widgetProgressBar) widgetProgressBar.style.width = `${progressPercent}%`;
    });

    // Tự qua bài khi hết
    audio.addEventListener('ended', window.playNext);
}

// Tua nhạc khi click thanh tiến trình
if (widgetProgressBg) {
    widgetProgressBg.addEventListener('click', (e) => {
        const width = widgetProgressBg.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        audio.currentTime = (clickX / width) * duration;
    });
}

// Khởi tạo bài đầu tiên
loadSong(0);


// =================================================================
// 4. SYSTEM OVERRIDES (ALERT / CONFIRM / PROMPT)
// =================================================================

// Hàm Thông báo (Alert) - Tự tắt sau 2s
// --- 1. Hàm Thông báo (Alert) - Căn Giữa ---
window.sysAlert = (message, type = 'info') => {
    return new Promise((resolve) => {
        const icons = {
            success: '<i class="fa-solid fa-circle-check text-green-400"></i>',
            error: '<i class="fa-solid fa-circle-xmark text-red-500"></i>',
            info: '<i class="fa-solid fa-circle-exclamation text-yellow-400"></i>'
        };

        const msgEl = document.getElementById('alert-message');
        const iconContainer = document.getElementById('alert-icon-container');
        const contentBox = document.getElementById('alert-content-box'); // Lấy hộp nội dung
        const actionBox = document.getElementById('alert-actions');

        if (msgEl) msgEl.textContent = message;
        if (iconContainer) iconContainer.innerHTML = icons[type] || icons.info;

        // LOGIC UI: Ẩn nút + Căn giữa nội dung
        if (actionBox) {
            actionBox.style.width = '0px'; // Thu hẹp vùng nút
            actionBox.style.opacity = '0';
            actionBox.style.pointerEvents = 'none';
        }
        if (contentBox) {
            contentBox.classList.add('justify-center'); // Căn giữa
            contentBox.classList.remove('justify-start');
        }

        setIslandState('alert');
        if (navigator.vibrate) navigator.vibrate([50]);

        setTimeout(() => {
            setIslandState('idle');
            setTimeout(resolve, 300);
        }, 2500); // Tăng thời gian đọc lên 2.5s
    });
};


// Hàm Nhập liệu (Prompt) - Có ô Input
window.sysPrompt = (message, placeholder = "") => {
    return new Promise((resolve) => {
        const inputMsg = document.getElementById('input-message');
        const inputField = document.getElementById('island-input-field');

        if (inputMsg) inputMsg.textContent = message;
        if (inputField) {
            inputField.value = "";
            inputField.placeholder = placeholder;
        }

        setIslandState('input');
        if (navigator.vibrate) navigator.vibrate([50]);

        // Auto focus
        setTimeout(() => { if (inputField) inputField.focus(); }, 300);

        const btnConfirm = document.getElementById('btn-input-confirm');
        const btnCancel = document.getElementById('btn-input-cancel');

        const cleanup = () => {
            btnConfirm.onclick = null;
            btnCancel.onclick = null;
            inputField.onkeydown = null;
        };

        const confirmAction = () => {
            const val = inputField.value.trim();
            cleanup();
            setIslandState('idle');
            resolve(val);
        };

        btnConfirm.onclick = confirmAction;
        btnCancel.onclick = () => { cleanup(); setIslandState('idle'); resolve(null); };

        // Hỗ trợ nhấn Enter
        inputField.onkeydown = (e) => {
            if (e.key === 'Enter') confirmAction();
        };
    });
};


// =================================================================
// 5. THEME & UI LOGIC
// =================================================================

// Đổi màu chủ đạo
window.changeTheme = (hexColor) => {
    const hexToRgb = (hex) => {
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) {
            r = parseInt(hex[1] + hex[2], 16);
            g = parseInt(hex[3] + hex[4], 16);
            b = parseInt(hex[5] + hex[6], 16);
        }
        return `${r}, ${g}, ${b}`;
    }

    const rgbValue = hexToRgb(hexColor);
    document.documentElement.style.setProperty('--primary-color', hexColor);
    document.documentElement.style.setProperty('--primary-rgb', rgbValue);

    localStorage.setItem('themeColor', hexColor);
    localStorage.setItem('themeRgb', rgbValue);

    // Cập nhật icon trên các nút chọn màu (nếu có)
    const paletteIcon = document.querySelector('.fa-palette');
    if (paletteIcon && paletteIcon.parentElement) {
        paletteIcon.parentElement.style.color = hexColor;
    }
};

// Cycle màu nhanh trên Island
const presetColors = ['#007AFF', '#AF52DE', '#FF2D55', '#FF9500', '#30D158', '#000000'];
let colorIndex = 0;
window.cycleQuickTheme = () => {
    colorIndex = (colorIndex + 1) % presetColors.length;
    window.changeTheme(presetColors[colorIndex]);
};

// Dark Mode Toggle
const islandDarkToggle = document.getElementById('island-dark-toggle');
if (islandDarkToggle) {
    islandDarkToggle.addEventListener('click', () => {
        const html = document.documentElement;
        if (html.classList.contains('dark')) {
            html.classList.remove('dark');
            localStorage.setItem('themeMode', 'light');
        } else {
            html.classList.add('dark');
            localStorage.setItem('themeMode', 'dark');
        }
    });
}

// Khởi chạy Theme lúc load
(function initTheme() {
    const savedHex = localStorage.getItem('themeColor');
    if (savedHex) window.changeTheme(savedHex);

    const savedMode = localStorage.getItem('themeMode');
    if (savedMode === 'light') document.documentElement.classList.remove('dark');
    else document.documentElement.classList.add('dark');
})();

// Xử lý chuyển Tab (Bottom Navigation)
document.querySelectorAll('.tab-button').forEach(btn => {
    btn.addEventListener('click', () => {
        // Reset style
        document.querySelectorAll('.tab-button').forEach(b => {
            b.classList.remove('text-primary', 'bg-primary/20', 'scale-110');
            b.classList.add('text-white/50', 'hover:bg-white/10');
        });
        document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

        // Active style
        btn.classList.remove('text-white/50', 'hover:bg-white/10');
        btn.classList.add('text-primary', 'bg-primary/20', 'scale-110');

        const tabId = btn.dataset.tab;
        const content = document.getElementById(tabId);
        if (content) content.classList.remove('hidden');

        // Refresh map nếu chuyển sang tab Input
        if (tabId === 'input-tab') {
            if (map) setTimeout(() => map.invalidateSize(), 200);
            else initMap();
        }
    });
});

window.showView = function (viewName) {
    document.getElementById("trips-view").classList.add('hidden');
    document.getElementById("single-trip-view").classList.add('hidden');

    if (viewName === 'trips') {
        document.getElementById("trips-view").classList.remove('hidden');
        currentTrip.id = null;
        if (historyUnsubscribe) historyUnsubscribe();
        if (chatUnsubscribe) chatUnsubscribe();
    } else {
        document.getElementById("single-trip-view").classList.remove('hidden');
    }
};

// [FIX] Nút Quay lại
const backBtn = document.getElementById("back-to-trips");
if (backBtn) {
    backBtn.onclick = () => {
        localStorage.removeItem('currentTripId');
        window.showView('trips');
        loadTrips();
    };
}


// =================================================================
// 6. AUTHENTICATION & APP FLOW
// =================================================================

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        currentUser = userDoc.exists() ? { ...user, ...userDoc.data() } : user;

        const name = currentUser.name || currentUser.displayName || currentUser.email;
        const fbId = currentUser.facebookId;
        const avatarUrl = fbId ? `https://graph.facebook.com/${fbId}/picture?width=100&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662` : null;

        // Cập nhật Avatar trên Island
        const islandAvatarMini = document.getElementById("island-avatar-mini");
        const islandControlAvatar = document.getElementById("island-control-avatar");
        const avatarHTML = avatarUrl
            ? `<img src="${avatarUrl}" class="w-full h-full object-cover">`
            : `<div class="w-full h-full bg-white/20 flex items-center justify-center text-[8px] font-bold text-white">${name.charAt(0).toUpperCase()}</div>`;

        if (islandAvatarMini) islandAvatarMini.innerHTML = avatarHTML;
        if (islandControlAvatar) islandControlAvatar.innerHTML = avatarHTML;

        // Icon Map
        const mapIconHtml = avatarUrl
            ? `<img src="${avatarUrl}" style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">`
            : `<div style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary-color); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">${name.charAt(0)}</div>`;
        userIcon = L.divIcon({ html: mapIconHtml, className: '', iconSize: [42, 42], iconAnchor: [21, 42], popupAnchor: [0, -42] });

        // Show App
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        appContainer.classList.add('flex');
        hideLoading();

        const savedTripId = localStorage.getItem('currentTripId');
        if (savedTripId) {
            try {
                const tDoc = await getDoc(doc(db, "trips", savedTripId));
                if (tDoc.exists()) openTrip(tDoc.id, tDoc.data());
                else { localStorage.removeItem('currentTripId'); window.showView('trips'); loadTrips(); }
            } catch { window.showView('trips'); loadTrips(); }
        } else {
            window.showView('trips');
            loadTrips();
        }
    } else {
        currentUser = null;
        authContainer.classList.remove('hidden');
        appContainer.classList.add('hidden');
        appContainer.classList.remove('flex');
        hideLoading();
    }
});

// Login
document.getElementById("login-form").querySelector('form').addEventListener("submit", async (e) => {
    e.preventDefault();
    showLoading("Đang đăng nhập...");
    try {
        await signInWithEmailAndPassword(auth, document.getElementById("login-email").value, document.getElementById("login-password").value);
    } catch (err) { hideLoading(); window.sysAlert("Lỗi: " + err.message, "error"); }
});

// Register
document.getElementById("register-form").querySelector('button[type="submit"]').addEventListener("click", async (e) => {
    e.preventDefault();
    const name = document.getElementById("register-name").value;
    const email = document.getElementById("register-email").value;
    const pass = document.getElementById("register-password").value;
    const fbId = document.getElementById("register-facebook").value;
    showLoading("Đang đăng ký...");
    try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        await updateProfile(cred.user, { displayName: name });
        await setDoc(doc(db, "users", cred.user.uid), { uid: cred.user.uid, name, email, facebookId: fbId, createdAt: serverTimestamp() });
        hideLoading(); window.sysAlert("Đăng ký thành công!", "success");
    } catch (err) { hideLoading(); window.sysAlert("Lỗi: " + err.message, "error"); }
});

document.getElementById("logout-button").addEventListener("click", () => {
    localStorage.removeItem('currentTripId');
    signOut(auth);
});

document.getElementById("show-register-link").onclick = () => { document.getElementById("login-form").classList.add("hidden"); document.getElementById("register-form").classList.remove("hidden"); };
document.getElementById("show-login-link").onclick = () => { document.getElementById("register-form").classList.add("hidden"); document.getElementById("login-form").classList.remove("hidden"); };


// =================================================================
// 7. TRIP MANAGEMENT
// =================================================================

function loadTrips() {
    if (!currentUser) return;
    const q = query(collection(db, "trips"), where("members", "array-contains", currentUser.uid));
    onSnapshot(q, (snapshot) => {
        const list = document.getElementById("trips-list");
        list.innerHTML = "";
        if (snapshot.empty) { list.innerHTML = `<p class="text-center text-white/50 col-span-full py-10">Chưa có chuyến đi nào.</p>`; return; }

        snapshot.forEach(d => {
            const t = d.data();
            const isOwner = currentUser.uid === t.ownerId;
            const el = document.createElement("div");
            el.className = "bg-white/60 dark:bg-black/20 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-5 shadow-lg hover:bg-white/80 dark:hover:bg-white/5 transition-colors cursor-pointer group relative overflow-hidden";
            el.innerHTML = `
                <div class="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <i class="fa-solid fa-map text-6xl text-slate-900 dark:text-white"></i>
                </div>
                <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">${t.name}</h3>
                <p class="text-sm text-slate-600 dark:text-white/60 mb-4 line-clamp-2">${t.description || "Chưa có mô tả"}</p>
                <div class="flex items-center gap-4 text-xs text-slate-500 dark:text-white/50 font-medium">
                    <span class="bg-black/5 dark:bg-white/5 px-2 py-1 rounded-lg"><i class="fa-solid fa-users mr-1"></i> ${t.maxPeople}</span>
                    <span class="bg-black/5 dark:bg-white/5 px-2 py-1 rounded-lg"><i class="fa-solid fa-user-tie mr-1"></i> ${t.ownerName}</span>
                </div>
                <div class="mt-4 flex gap-2">
                    <button class="flex-1 bg-slate-200 dark:bg-white/10 hover:bg-primary hover:text-white text-slate-700 dark:text-white/80 py-2 rounded-xl text-sm font-bold transition-all btn-open-trip">Mở</button>
                    ${isOwner ? `<button class="w-10 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white btn-edit-trip"><i class="fa-solid fa-pen"></i></button>` : ''}
                    ${isOwner ? `<button class="w-10 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-400 btn-del-trip"><i class="fa-solid fa-trash"></i></button>` : ''}
                </div>
            `;
            el.querySelector('.btn-open-trip').onclick = () => openTrip(d.id, t);
            if (isOwner) {
                el.querySelector('.btn-edit-trip').onclick = (e) => { e.stopPropagation(); window.showEditTrip(d.id, t); };
                el.querySelector('.btn-del-trip').onclick = (e) => { e.stopPropagation(); window.deleteTrip(d.id, t.name, t.ownerId); };
            }
            list.appendChild(el);
        });
    });
}

function openTrip(id, data) {
    localStorage.setItem('currentTripId', id);
    currentTrip = { ...data, id: id };
    document.getElementById("trip-name-display").textContent = data.name;

    // Render Controls
    const controls = document.getElementById("trip-controls");
    if (currentUser.uid === data.ownerId) {
        controls.innerHTML = `
            <div class="flex flex-col gap-3">
                <div class="flex justify-between items-center bg-black/20 p-3 rounded-2xl border border-white/5">
                    <span class="text-xs text-white/50 uppercase font-bold tracking-wider ml-2">Mã tham gia</span>
                    <div class="flex items-center gap-3">
                        <span class="text-xl font-mono font-bold text-primary tracking-widest">${data.inviteCode}</span>
                        <button class="w-8 h-8 rounded-lg bg-white/10 hover:bg-primary text-white transition-colors" onclick="copyInviteLink('${data.inviteCode}')"><i class="fa-solid fa-link"></i></button>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <button onclick="addMemberToTrip('${id}')" class="py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors">Thêm thành viên</button>
                    <button onclick="changeInviteCode('${id}')" class="py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors">Đổi mã</button>
                </div>
            </div>
        `;
    } else {
        controls.innerHTML = `<p class="text-center text-white/50 text-sm">Bạn là thành viên của chuyến đi này.</p>`;
    }

    window.showView('singleTrip');
    document.querySelector('.tab-button[data-tab="input-tab"]').click();
    loadHistory(id);
    loadChat(id);
}


// =================================================================
// 8. MAP & FORM LOGIC
// =================================================================

function initMap() {
    if (map) { map.invalidateSize(); return; }

    map = L.map('map-container', { zoomControl: false, attributionControl: false }).setView([21.0285, 105.8048], 13);

    const layers = {
        default: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', maxZoom: 19 }),
        satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 })
    };
    let currentLayer = layers.default;
    currentLayer.addTo(map);

    // [FIX] Layer cho các điểm lịch sử
    historyLayer = L.layerGroup().addTo(map);

    map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        document.getElementById('location-position').value = `${lat}, ${lng}`;
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(r => r.json()).then(d => {
                const el = document.getElementById('location-address');
                if (el) el.value = d.display_name;
            });

        if (locationMarker) locationMarker.setLatLng(e.latlng);
        else locationMarker = L.marker(e.latlng, { icon: userIcon || new L.Icon.Default() }).addTo(map);
    });

    // Map Controls
    const btnDefault = document.getElementById('map-mode-default');
    const btnSat = document.getElementById('map-mode-satellite');
    const btnHistory = document.getElementById('map-toggle-history');
    const btnGeo = document.getElementById('get-location-button');

    const setActive = (active, others) => {
        active.classList.remove('text-white/70', 'hover:bg-white/20'); active.classList.add('bg-primary', 'text-white');
        others.forEach(b => { b.classList.remove('bg-primary', 'text-white'); b.classList.add('text-white/70', 'hover:bg-white/20'); });
    };

    if (btnDefault) btnDefault.onclick = () => { if (currentLayer !== layers.default) { map.removeLayer(currentLayer); currentLayer = layers.default; currentLayer.addTo(map); setActive(btnDefault, [btnSat]); } };
    if (btnSat) btnSat.onclick = () => { if (currentLayer !== layers.satellite) { map.removeLayer(currentLayer); currentLayer = layers.satellite; currentLayer.addTo(map); setActive(btnSat, [btnDefault]); } };

    // [FIX] Toggle History
    if (btnHistory) {
        btnHistory.classList.add('bg-primary', 'text-white'); // Default active
        btnHistory.onclick = () => {
            if (map.hasLayer(historyLayer)) {
                map.removeLayer(historyLayer);
                btnHistory.classList.remove('bg-primary', 'text-white'); btnHistory.classList.add('text-white/70');
            } else {
                map.addLayer(historyLayer);
                btnHistory.classList.add('bg-primary', 'text-white'); btnHistory.classList.remove('text-white/70');
            }
        };
    }

    // [FIX] Geolocation
    if (btnGeo) {
        btnGeo.onclick = (e) => {
            e.preventDefault();
            if (!navigator.geolocation) { window.sysAlert("Trình duyệt không hỗ trợ!", "error"); return; }
            btnGeo.querySelector('i').classList.add('fa-spin');
            navigator.geolocation.getCurrentPosition(pos => {
                btnGeo.querySelector('i').classList.remove('fa-spin');
                const { latitude, longitude } = pos.coords;
                map.setView([latitude, longitude], 16);
                if (locationMarker) locationMarker.setLatLng([latitude, longitude]);
                else locationMarker = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
                document.getElementById('location-position').value = `${latitude}, ${longitude}`;
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`).then(r => r.json()).then(d => document.getElementById('location-address').value = d.display_name);
            }, err => {
                btnGeo.querySelector('i').classList.remove('fa-spin');
                window.sysAlert("Lỗi định vị: " + err.message, "error");
            });
        };
    }
}

// Logic Nút Số Người & Nút MAX
const peopleInput = document.getElementById("location-people");
const decreaseBtn = document.getElementById("people-decrease");
const increaseBtn = document.getElementById("people-increase");
const maxBtn = document.getElementById("people-max");
if (peopleInput) {
    if (decreaseBtn) decreaseBtn.onclick = (e) => { e.preventDefault(); let val = parseInt(peopleInput.value) || 1; if (val > 1) peopleInput.value = val - 1; };
    if (increaseBtn) increaseBtn.onclick = (e) => { e.preventDefault(); let val = parseInt(peopleInput.value) || 0; peopleInput.value = val + 1; };
    if (maxBtn) maxBtn.onclick = (e) => { e.preventDefault(); peopleInput.value = currentTrip.maxPeople || 10; };
}

// Submit Form
document.getElementById("add-location-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentTrip.id) return;
    const cost = parseInt(document.getElementById('location-cost').value.replace(/\./g, '')) || 0;
    const data = {
        tripId: currentTrip.id,
        locationName: document.getElementById('location-name').value,
        address: document.getElementById('location-address').value,
        position: document.getElementById('location-position').value,
        numPeople: parseInt(document.getElementById('location-people').value) || 1,
        cost: cost,
        time: document.getElementById('location-time').value,
        date: document.getElementById('location-date').value,
        rating: parseInt(document.getElementById('location-rating').value),
        notes: document.getElementById('location-notes').value,
        createdBy: { uid: currentUser.uid, name: currentUser.name || currentUser.email },
        createdAt: serverTimestamp(),
        sortableTime: new Date()
    };
    showLoading("Đang thêm...");
    try {
        await addDoc(collection(db, "trips", currentTrip.id, "locations"), data);
        hideLoading(); window.sysAlert("Đã thêm địa điểm!", "success");
        e.target.reset(); document.querySelector('.tab-button[data-tab="history-tab"]').click();
    } catch (err) { hideLoading(); window.sysAlert("Lỗi: " + err.message, "error"); }
});

document.getElementById('location-cost').addEventListener('input', function (e) {
    let raw = e.target.value.replace(/\D/g, '');
    this.value = raw ? formatter.format(raw) : '';
});

document.querySelectorAll('.star-rating i').forEach(star => {
    star.addEventListener('click', function () {
        const val = this.dataset.value;
        document.getElementById('location-rating').value = val;
        document.querySelectorAll('.star-rating i').forEach(s => {
            if (s.dataset.value <= val) { s.classList.remove('text-white/20'); s.classList.add('text-yellow-400'); }
            else { s.classList.add('text-white/20'); s.classList.remove('text-yellow-400'); }
        });
    });
});


// =================================================================
// 9. HISTORY, STATS & CHAT
// =================================================================

// [FIX] Update markers lên bản đồ
function updateMapMarkers(data) {
    if (!historyLayer) return;
    historyLayer.clearLayers();
    data.forEach(item => {
        if (item.position) {
            const [lat, lng] = item.position.split(',').map(Number);
            if (!isNaN(lat) && !isNaN(lng)) {
                const smallIcon = L.divIcon({
                    html: `<div style="width: 12px; height: 12px; background: #34c759; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
                    className: '', iconSize: [12, 12], iconAnchor: [6, 6]
                });
                L.marker([lat, lng], { icon: smallIcon })
                    .bindPopup(`<b>${item.locationName}</b><br>${item.time}`)
                    .addTo(historyLayer);
            }
        }
    });
}

function renderHistoryList(data) {
    const list = document.getElementById("history-list");
    list.innerHTML = "";
    if (!data || data.length === 0) { list.innerHTML = `<p class="text-center text-white/30 italic col-span-full">Không tìm thấy dữ liệu.</p>`; return; }

    data.forEach(d => {
        const card = document.createElement("div");
        card.className = "bg-white/60 dark:bg-black/20 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-5 shadow-lg relative group";
        const avg = d.numPeople > 0 ? d.cost / d.numPeople : 0;

        card.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <h4 class="text-lg font-bold text-primary">${d.locationName}</h4>
                <div class="flex items-center gap-1 text-yellow-400 text-sm"><span class="font-bold">${d.rating}</span> <i class="fa-solid fa-star"></i></div>
            </div>
            <div class="space-y-2 text-sm text-slate-600 dark:text-white/80">
                <div class="flex items-start gap-3"><i class="fa-solid fa-map-pin mt-1 text-slate-400 dark:text-white/40 w-4"></i> <span class="flex-1 opacity-80">${d.address || "Chưa có địa chỉ"}</span></div>
                <div class="flex items-center gap-3"><i class="fa-solid fa-clock text-slate-400 dark:text-white/40 w-4"></i> ${d.time} - ${d.date}</div>
                <div class="grid grid-cols-2 gap-2 mt-2 bg-slate-100 dark:bg-black/20 p-3 rounded-xl border border-slate-200 dark:border-white/5">
                    <div><p class="text-xs opacity-50">Tổng tiền</p><p class="font-mono font-bold text-green-500 dark:text-green-400">${formatter.format(d.cost)}</p></div>
                    <div><p class="text-xs opacity-50">Chia người</p><p class="font-mono font-bold text-purple-500 dark:text-purple-400">${formatter.format(avg)}</p></div>
                </div>
            </div>
            <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                ${(currentUser.uid === currentTrip.ownerId || currentUser.uid === d.createdBy.uid) ? `<button class="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-primary hover:text-white flex items-center justify-center transition-colors" onclick="deleteHistoryItem('${d.id}')"><i class="fa-solid fa-trash text-xs"></i></button>` : ''}
            </div>
        `;
        list.appendChild(card);
    });
}

function loadHistory(tripId) {
    const q = query(collection(db, "trips", tripId, "locations"), orderBy("createdAt", "desc"));
    historyUnsubscribe = onSnapshot(q, (snapshot) => {
        localHistoryCache = [];
        snapshot.forEach(doc => {
            const d = doc.data();
            d.id = doc.id;
            d._timestamp = d.createdAt ? d.createdAt.seconds : 0;
            localHistoryCache.push(d);
        });

        renderHistoryList(localHistoryCache);
        updateMapMarkers(localHistoryCache);
        updateStats(localHistoryCache);
    });
}

// [FIX] History Tools
document.getElementById('search-history').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = localHistoryCache.filter(item => item.locationName.toLowerCase().includes(term) || (item.address && item.address.toLowerCase().includes(term)));
    renderHistoryList(filtered);
});

document.getElementById('sort-history').addEventListener('change', (e) => {
    const type = e.target.value;
    let sorted = [...localHistoryCache];
    if (type === 'time') sorted.sort((a, b) => b._timestamp - a._timestamp);
    if (type === 'name') sorted.sort((a, b) => a.locationName.localeCompare(b.locationName));
    if (type === 'cost') sorted.sort((a, b) => b.cost - a.cost);
    renderHistoryList(sorted);
});

document.getElementById('copy-history').addEventListener('click', () => {
    if (localHistoryCache.length === 0) return;
    let text = `LỊCH TRÌNH: ${currentTrip.name}\n\n`;
    localHistoryCache.forEach((d, i) => { text += `${i + 1}. ${d.locationName}\n   📍 ${d.address}\n   💰 ${formatter.format(d.cost)} VND\n\n`; });
    navigator.clipboard.writeText(text).then(() => window.sysAlert("Đã copy danh sách!", "success"));
});

document.getElementById('export-xlsx').addEventListener('click', () => {
    if (localHistoryCache.length === 0) return;
    const data = localHistoryCache.map(d => ({ "Tên": d.locationName, "Địa chỉ": d.address, "Thời gian": `${d.time} ${d.date}`, "Tổng tiền": d.cost }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Lịch sử");
    XLSX.writeFile(wb, `ShareGo_${currentTrip.name}.xlsx`);
});

function updateStats(data) {
    if (!data.length) return;
    const totalCost = data.reduce((sum, i) => sum + i.cost, 0);
    const totalPlaces = data.length;
    document.getElementById("stats-content").innerHTML = `
        <h3 class="text-lg font-bold mb-4 text-center text-slate-800 dark:text-white">Tổng quan</h3>
        <div class="grid grid-cols-2 gap-4">
            <div class="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl col-span-2 flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white text-xl"><i class="fa-solid fa-wallet"></i></div>
                <div><p class="text-xs text-green-600 dark:text-green-400 font-bold uppercase">Tổng chi phí</p><p class="text-2xl font-bold text-slate-800 dark:text-white">${formatter.format(totalCost)} đ</p></div>
            </div>
            <div class="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-center"><p class="text-2xl font-bold text-blue-500 dark:text-blue-400 mb-1">${totalPlaces}</p><p class="text-xs text-slate-500 dark:text-white/50">Địa điểm</p></div>
            <div class="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-2xl text-center"><p class="text-2xl font-bold text-yellow-500 dark:text-yellow-400 mb-1">${(data.reduce((s, i) => s + i.rating, 0) / totalPlaces).toFixed(1)}</p><p class="text-xs text-slate-500 dark:text-white/50">Sao TB</p></div>
        </div>
    `;
}

// ==========================================
// CHAT LOGIC: GIAO DIỆN & CHỨC NĂNG (FULL)
// ==========================================

function loadChat(tripId) {
    const q = query(collection(db, "trips", tripId, "chat"), orderBy("timestamp", "asc"));
    chatUnsubscribe = onSnapshot(q, (snapshot) => {
        const div = document.getElementById("chat-messages");
        div.innerHTML = "";

        snapshot.forEach(doc => {
            const m = doc.data();
            const msgId = doc.id;
            const isMe = m.sender.uid === currentUser.uid;

            // Xử lý nội dung an toàn để không lỗi khi truyền vào hàm onclick
            const safeContent = m.content.replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, '\\n');

            // Format thời gian
            const timeStr = m.timestamp
                ? new Date(m.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '...';

            const bubbleStyle = isMe
                ? "bg-gradient-to-br from-primary to-blue-600 text-white rounded-2xl rounded-tr-sm shadow-sm"
                : "bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-2xl rounded-tl-sm";

            const wrapper = document.createElement("div");
            wrapper.className = "w-full mb-4 flex flex-col group";

            wrapper.innerHTML = `
                <div class="flex w-full ${isMe ? 'justify-end' : 'justify-start'}">
                    <div class="max-w-[75%] w-fit h-auto min-h-0 break-words px-3.5 py-2.5 text-sm ${bubbleStyle}">
                        ${!isMe ? `<div class="text-[10px] text-white/50 mb-1 font-bold">${m.sender.name}</div>` : ''}
                        <span class="whitespace-pre-wrap leading-relaxed block">${m.content}</span>
                    </div>
                </div>

                <div class="flex w-full ${isMe ? 'justify-end' : 'justify-start'} items-center gap-3 mt-1 px-1 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                    
                    <span class="text-[9px] text-white/30 font-medium select-none">${timeStr}</span>

                    <button onclick="window.quickCopy('${safeContent}')" 
                            class="w-5 h-5 rounded-full hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-blue-400 transition-colors cursor-pointer" 
                            title="Sao chép">
                        <i class="fa-regular fa-copy text-[11px]"></i>
                    </button>

                    ${isMe ? `
                    <button onclick="window.quickDelete('${msgId}')" 
                            class="w-5 h-5 rounded-full hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-red-400 transition-colors cursor-pointer" 
                            title="Thu hồi">
                        <i class="fa-solid fa-trash text-[11px]"></i>
                    </button>
                    ` : ''}
                </div>
            `;

            div.appendChild(wrapper);
        });

        div.scrollTop = div.scrollHeight;
    });
}

// --- CÁC HÀM XỬ LÝ (QUAN TRỌNG: Phải gắn vào window) ---

// 1. Hàm Sao chép
window.quickCopy = (content) => {
    // Dùng Clipboard API
    navigator.clipboard.writeText(content)
        .then(() => {
            // Rung nhẹ phản hồi (trên mobile)
            if (navigator.vibrate) navigator.vibrate(30);

            // Dùng thông báo hệ thống (Alert nhỏ)
            window.sysAlert("Đã sao chép", "success");
        })
        .catch(() => window.sysAlert("Lỗi sao chép", "error"));
};

// 2. Hàm Xoá tin nhắn
window.quickDelete = async (msgId) => {
    if (!currentTrip.id) return;

    if (navigator.vibrate) navigator.vibrate(30);

    // Hỏi xác nhận trước khi xoá (Dùng Dynamic Island Confirm)
    const isConfirmed = await window.sysConfirm("Thu hồi tin nhắn?");

    if (isConfirmed) {
        try {
            await deleteDoc(doc(db, "trips", currentTrip.id, "chat", msgId));
            // Không cần alert thành công vì tin nhắn sẽ tự biến mất khỏi màn hình
        } catch (e) {
            console.error(e);
            window.sysAlert("Lỗi thu hồi", "error");
        }
    }
};
document.getElementById("chat-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = document.getElementById("chat-input");
    const txt = input.value.trim();
    if (!txt) return;
    await addDoc(collection(db, "trips", currentTrip.id, "chat"), { sender: { uid: currentUser.uid, name: currentUser.name || currentUser.email }, content: txt, timestamp: serverTimestamp(), type: 'text' });
    input.value = "";
});


// =================================================================
// 10. WINDOW EXPORTS
// =================================================================

window.toggleChatPopup = function () {
    const chatPopup = document.getElementById('chat-tab');
    const triggerBtn = document.getElementById('chat-trigger-btn');
    if (!chatPopup) return;
    if (chatPopup.classList.contains('hidden')) {
        chatPopup.classList.remove('hidden'); chatPopup.classList.add('flex');
        if (triggerBtn) { triggerBtn.classList.add('bg-primary', 'text-white'); }
    } else {
        chatPopup.classList.add('hidden'); chatPopup.classList.remove('flex');
        if (triggerBtn) { triggerBtn.classList.remove('bg-primary', 'text-white'); }
    }
};

window.copyInviteLink = (code) => {
    const link = `${window.location.origin}${window.location.pathname}#join=${code}`;
    navigator.clipboard.writeText(link).then(() => window.sysAlert("Đã copy link!", "success"));
};

window.deleteHistoryItem = async (id) => {
    if (await window.sysConfirm("Xóa địa điểm này?")) await deleteDoc(doc(db, "trips", currentTrip.id, "locations", id));
};

window.deleteTrip = async (tripId, tripName, ownerId) => {
    if (currentUser.uid !== ownerId) { window.sysAlert("Bạn không có quyền!", "error"); return; }
    if (!await window.sysConfirm(`Xóa chuyến đi "${tripName}"?`)) return;

    showLoading("Đang xóa...");
    try {
        await deleteDoc(doc(db, "trips", tripId));
        if (localStorage.getItem('currentTripId') === tripId) { localStorage.removeItem('currentTripId'); window.showView('trips'); }
        hideLoading(); window.sysAlert("Đã xóa!", "success");
    } catch (e) { hideLoading(); window.sysAlert("Lỗi xóa!", "error"); }
};

window.addMemberToTrip = async (tripId) => {
    const email = await window.sysPrompt("Nhập email thành viên:", "example@gmail.com");
    if (!email) return;
    showLoading("Đang tìm...");
    const q = query(collection(db, "users"), where("email", "==", email));
    const snap = await getDocs(q);
    if (snap.empty) { hideLoading(); window.sysAlert("Không tìm thấy user!", "error"); return; }
    await updateDoc(doc(db, "trips", tripId), { members: arrayUnion(snap.docs[0].data().uid) });
    hideLoading(); window.sysAlert("Đã thêm thành công!", "success");
};

window.changeInviteCode = async (tripId) => {
    const isCustom = await window.sysConfirm("Bạn muốn tự nhập mã mới?");
    let newCode;
    if (isCustom) {
        newCode = await window.sysPrompt("Nhập mã mới (6 ký tự):", "CODE123");
        if (!newCode) return;
        newCode = newCode.toUpperCase();
    } else {
        newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    await updateDoc(doc(db, "trips", tripId), { inviteCode: newCode });
    document.querySelector('.font-mono.tracking-widest').textContent = newCode;
    window.sysAlert("Đã đổi mã!", "success");
};

window.showEditTrip = (id, data) => {
    document.getElementById("edit-trip-name").value = data.name;
    document.getElementById("edit-trip-description").value = data.description;
    document.getElementById("edit-trip-max-people").value = data.maxPeople;
    currentTrip.id = id;
    document.getElementById("edit-trip-modal").style.display = "flex";
};

const closeEdit = document.getElementById("close-edit-trip-modal");
if (closeEdit) closeEdit.onclick = () => document.getElementById("edit-trip-modal").style.display = "none";

const toggleInfoBtn = document.getElementById('toggle-info-btn');
const tripInfoContent = document.getElementById('trip-info-content');
if (toggleInfoBtn && tripInfoContent) {
    toggleInfoBtn.addEventListener('click', () => {
        if (tripInfoContent.classList.contains('hidden')) {
            tripInfoContent.classList.remove('hidden');
            toggleInfoBtn.classList.replace('bg-white/5', 'bg-primary');
            toggleInfoBtn.classList.add('text-white');
            toggleInfoBtn.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
        } else {
            tripInfoContent.classList.add('hidden');
            toggleInfoBtn.classList.replace('bg-primary', 'bg-white/5');
            toggleInfoBtn.classList.remove('text-white');
            toggleInfoBtn.innerHTML = '<i class="fa-solid fa-circle-info"></i>';
        }
    });
}

// --- LOGIC NÚT LẤY GIỜ HIỆN TẠI ---
const btnGetTime = document.getElementById('get-current-time-button');
if (btnGetTime) {
    btnGetTime.addEventListener('click', (e) => {
        e.preventDefault(); // Ngăn reload form nếu nút nằm trong form

        const now = new Date();

        // Format Giờ: HH:MM
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        // Format Ngày: DD/MM/YYYY (để khớp với placeholder của bạn)
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
        const year = now.getFullYear();

        // Gán giá trị vào ô input
        const timeInput = document.getElementById('location-time');
        const dateInput = document.getElementById('location-date');

        if (timeInput) timeInput.value = `${hours}:${minutes}`;
        if (dateInput) dateInput.value = `${day}/${month}/${year}`;

        // Hiệu ứng rung nhẹ trên mobile
        if (navigator.vibrate) navigator.vibrate(50);
    });
}
// setIslandState('alert');

// =================================================================
// 11. CLOUD STORAGE LOGIC (GOOGLE APPS SCRIPT INTEGRATION)
// =================================================================

// Cấu hình từ code cũ của bạn
const GAS_ENDPOINT = "https://script.google.com/macros/s/AKfycbwzTrQHPhnAqYbrnMVykFHkOMHtTD5-ayftFFo0pbb_0JSAEY1RZz__FgoTQK8cjF0x/exec";
// ==========================================
// CẤU HÌNH TỐC ĐỘ (SPEED CONFIG)
// ==========================================

// Mặc định là 10MB (Ổn định)
let CURRENT_CHUNK_SIZE = 10 * 1024 * 1024;

// Hàm đổi tốc độ (Gắn vào window để gọi từ HTML)
window.changeUploadSpeed = (value) => {
    CURRENT_CHUNK_SIZE = parseInt(value);

    // Cập nhật Label hiển thị cho đẹp
    const label = document.getElementById('speed-label');
    const select = document.getElementById('upload-speed-select');
    const text = select.options[select.selectedIndex].text;

    // Lấy tên chế độ từ text option (Bỏ icon và dung lượng)
    // VD: "🚀 Nhanh (20MB)" -> Lấy chữ "Nhanh"
    if (label) {
        if (value < 6000000) label.textContent = "An toàn";
        else if (value < 15000000) label.textContent = "Ổn định";
        else if (value < 25000000) label.textContent = "Nhanh";
        else label.textContent = "Siêu nhanh";

        // Hiệu ứng màu chữ
        label.className = "text-sm font-bold transition-colors " +
            (value > 30000000 ? "text-red-400" : value > 15000000 ? "text-yellow-400" : "text-white");
    }

    // Rung phản hồi (nếu trên mobile)
    if (navigator.vibrate) navigator.vibrate(30);
};

// ==========================================
// SỬA LẠI HÀM UPLOAD ĐỂ DÙNG BIẾN MỚI
// ==========================================
// Biến trạng thái
let selectedFiles = [];

// Xử lý khi chọn file
window.handleFileSelect = (input) => {
    selectedFiles = input.files;
    const btn = document.getElementById('btn-cloud-upload');
    const label = document.querySelector('label[for="cloud-file-input"] span.font-medium');

    if (selectedFiles.length > 0) {
        label.textContent = `Đã chọn ${selectedFiles.length} file`;
        label.classList.add('text-primary');
        if (btn) {
            btn.classList.remove('hidden');
            btn.innerHTML = `<i class="fa-solid fa-paper-plane mr-2"></i> Tải lên ${selectedFiles.length} file`;
        }
    }
};

// Biến toàn cục theo dõi trạng thái upload
let isUploading = false;

window.processCloudUpload = async () => {
    // Thêm vào đầu hàm processCloudUpload
    const cloudUploadArea = document.querySelector('#cloud-tab .bg-glass'); // Div chứa vùng upload
    if (cloudUploadArea) {
        cloudUploadArea.classList.add('opacity-50', 'pointer-events-none'); // Làm mờ vùng upload
    }


    if (!selectedFiles.length) return window.sysAlert("Chưa chọn file!", "error");
    if (!currentUser) return window.sysAlert("Vui lòng đăng nhập!", "error");
    if (isUploading) return window.sysAlert("Đang có tiến trình tải lên!", "info");

    // 1. CHUYỂN TRẠNG THÁI ISLAND -> UPLOAD
    isUploading = true;
    setIslandState('upload');

    // Ẩn nút upload trong tab Cloud để tránh bấm lại
    const btn = document.getElementById('btn-cloud-upload');
    if (btn) btn.classList.add('hidden');

    // UI Island Elements
    const islandText = document.getElementById('island-upload-text');
    const islandPercent = document.getElementById('island-upload-percent');
    const islandBar = document.getElementById('island-upload-bar');

    // Cấu hình chạy song song (như cũ)
    const MAX_CONCURRENT = 2; // Giảm xuống 2 để Island đỡ lag animation
    const filesArray = Array.from(selectedFiles);
    let completedCount = 0;

    const uploadSingleFile = async (file, index) => {
        try {
            // Đổi text trên Island: "File 1/5..."
            if (islandText) islandText.textContent = `File ${completedCount + 1}/${filesArray.length}: ${file.name}`;

            const base64Full = await readFileAsBase64(file);
            const content = base64Full.split(",")[1];

            const url = await uploadChunksToGAS(file.name, file.type, content, (percent) => {
                // UPDATE PROGRESS TRÊN ISLAND
                // Tính tổng % trung bình hoặc chỉ hiển thị % của file hiện tại
                // Ở đây mình hiển thị % của file đang chạy để người dùng thấy nó nhảy
                if (islandPercent) islandPercent.textContent = `${percent}%`;
                if (islandBar) islandBar.style.width = `${percent}%`;
            });

            await addDoc(collection(db, "files"), {
                uid: currentUser.uid,
                email: currentUser.email || "Ẩn danh",
                uploaderName: currentUser.name || "No Name",
                fileName: file.name,
                fileSize: (file.size / 1024 / 1024).toFixed(2) + " MB",
                url: url,
                createdAt: serverTimestamp()
            });

            completedCount++;
            return { status: 'success' };
        } catch (err) {
            console.error(err);
            return { status: 'error' };
        }
    };

    // Chạy vòng lặp
    for (let i = 0; i < filesArray.length; i += MAX_CONCURRENT) {
        const chunk = filesArray.slice(i, i + MAX_CONCURRENT);
        await Promise.all(chunk.map((file, idx) => uploadSingleFile(file, i + idx)));
    }
    if (cloudUploadArea) {
        cloudUploadArea.classList.remove('opacity-50', 'pointer-events-none'); // Sáng lại
    }
    // 2. KẾT THÚC -> TRẢ VỀ IDLE & THÔNG BÁO
    isUploading = false;
    setIslandState('idle'); // Thu gọn Island về mặc định

    // Rung & Thông báo xong
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    window.sysAlert("Tải lên hoàn tất!", "success");

    // Reset Form
    document.getElementById('cloud-file-input').value = "";
    if (btn) btn.classList.add('hidden'); // Vẫn ẩn nút
    // Thêm vào cuối hàm (phần Kết thúc)

    // Nếu người dùng đang ở tab Cloud thì reload list
    // Nếu họ đang ở tab khác thì kệ họ, không cần reload ngay
    loadCloudFiles();
};


// Helper: Đọc file
const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = reject;
        r.readAsDataURL(file);
    });
};

// Helper: Upload từng mảnh (Chunking)
// Hàm chia nhỏ file và gửi lên Google Apps Script
async function uploadChunksToGAS(fileName, mimeType, base64Str, onProgress) {
    const totalSize = base64Str.length;

    // QUAN TRỌNG: Tính toán số lượng gói tin dựa trên CURRENT_CHUNK_SIZE (biến động)
    // Thay vì dùng CHUNK_SIZE cố định như trước
    const totalChunks = Math.ceil(totalSize / CURRENT_CHUNK_SIZE);
    let fileId = null;

    // --- Step 1: START (Báo cho Server biết bắt đầu upload) ---
    // Server sẽ trả về một fileId tạm để chúng ta gửi các mảnh tiếp theo vào đó
    let resStart = await postToGAS({
        act: "start",
        fileName: fileName
    });
    fileId = resStart.fileId;

    // --- Step 2: APPEND (Cắt nhỏ và gửi từng phần) ---
    for (let i = 0; i < totalChunks; i++) {
        // Tính vị trí cắt chuỗi dựa trên kích thước gói tin hiện tại
        const start = i * CURRENT_CHUNK_SIZE;
        const end = Math.min(start + CURRENT_CHUNK_SIZE, totalSize);

        // Cắt lấy chuỗi Base64 con (chunk)
        const chunk = base64Str.substring(start, end);

        // Gửi chunk lên server
        await postToGAS({
            act: "append",
            fileId: fileId,
            chunk: chunk
        });

        // Tính toán phần trăm hoàn thành
        const percent = Math.round(((i + 1) / totalChunks) * 100);

        // Gọi hàm callback để cập nhật thanh tiến trình bên ngoài
        if (onProgress) onProgress(percent);
    }

    // --- Step 3: FINISH (Báo Server ghép các mảnh lại thành file hoàn chỉnh) ---
    let resFinish = await postToGAS({
        act: "finish",
        fileId: fileId,
        fileName: fileName,
        mimeType: mimeType
    });

    // Trả về đường dẫn xem file (viewUrl) từ Google Drive
    return resFinish.viewUrl;
}

// Helper: Gọi API GAS
async function postToGAS(payload) {
    const res = await fetch(GAS_ENDPOINT, {
        method: "POST",
        body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.status !== "success") throw new Error(data.message || "Unknown Error");
    return data;
}

// Hàm tải danh sách file (Realtime)
window.loadCloudFiles = () => {
    const list = document.getElementById('cloud-file-list');
    if (!list) return;

    // Query lấy tất cả file, sắp xếp mới nhất (Bạn có thể thêm where uid == ... nếu muốn riêng tư)
    const q = query(collection(db, "files"), orderBy("createdAt", "desc"));

    onSnapshot(q, (snapshot) => {
        list.innerHTML = "";
        if (snapshot.empty) {
            list.innerHTML = `<div class="text-center text-white/40 py-8 bg-white/5 rounded-2xl border border-white/5">Chưa có file nào được tải lên.</div>`;
            return;
        }

        snapshot.forEach(doc => {
            const d = doc.data();
            const date = d.createdAt ? new Date(d.createdAt.seconds * 1000).toLocaleDateString('vi-VN') : 'vừa xong';

            // Xác định icon dựa vào đuôi file (cơ bản)
            let iconClass = "fa-file";
            const name = d.fileName.toLowerCase();
            if (name.endsWith('.jpg') || name.endsWith('.png') || name.endsWith('.jpeg')) iconClass = "fa-file-image text-purple-400";
            else if (name.endsWith('.pdf')) iconClass = "fa-file-pdf text-red-400";
            else if (name.endsWith('.xls') || name.endsWith('.xlsx')) iconClass = "fa-file-excel text-green-400";
            else if (name.endsWith('.doc') || name.endsWith('.docx')) iconClass = "fa-file-word text-blue-400";
            else if (name.endsWith('.zip') || name.endsWith('.rar')) iconClass = "fa-file-zipper text-yellow-400";
            else if (name.endsWith('.mp3')) iconClass = "fa-file-audio text-pink-400";
            else if (name.endsWith('.mp4')|| name.endsWith('.mov') || name.endsWith('.hevc')) iconClass = "fa-file-video text-lime-400";



            const el = document.createElement("div");
            el.className = "bg-glass backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:bg-white/10 transition-colors group";

            el.innerHTML = `
                <div class="flex items-center gap-4 overflow-hidden">
                    <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                        <i class="fa-solid ${iconClass} text-xl"></i>
                    </div>
                    <div class="min-w-0">
                        <h4 class="text-sm font-bold text-white truncate pr-2">${d.fileName}</h4>
                        <div class="flex items-center gap-2 text-[10px] text-white/50">
                            <span>${d.uploaderName}</span>
                            <span>•</span>
                            <span>${d.fileSize || 'N/A'}</span>
                            <span>•</span>
                            <span>${date}</span>
                        </div>
                    </div>
                </div>
                <a href="${d.url}" target="_blank" class="w-10 h-10 rounded-full bg-white/5 hover:bg-primary hover:text-white flex items-center justify-center text-white/60 transition-all shrink-0 active:scale-95 shadow-lg">
                    <i class="fa-solid fa-download"></i>
                </a>
            `;
            list.appendChild(el);
        });
    });
};

// Kích hoạt load file khi bấm vào tab Cloud
document.querySelector('.tab-button[data-tab="cloud-tab"]').addEventListener('click', () => {
    // Chỉ load nếu chưa có dữ liệu để tiết kiệm, hoặc load mỗi lần bấm
    loadCloudFiles();
});