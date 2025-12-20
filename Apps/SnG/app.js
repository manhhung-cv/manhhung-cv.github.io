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
    onSnapshot, orderBy, serverTimestamp, updateDoc, deleteDoc, arrayUnion, getDocs,arrayRemove
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
    { title: "Remix VietNam", artist: "Sưu tầm", src: "https://files.catbox.moe/x4jqvz.mp3", duration: "1h08m15s" },
    { title: "Modern Talking", artist: "Sưu tầm", src: "https://files.catbox.moe/xd1tyo.mp3", duration: "1h11m00s" },
    { title: "Nhạc Dance Xưa", artist: "Sưu tầm", src: "https://files.catbox.moe/aghlp7.mp3",  duration: "1h12m35s" },
];
// Hàm chuyển đổi chuỗi "0h3m45s" thành tổng số giây
function parseDuration(durationStr) {
    const regex = /(\d+)h(\d+)m(\d+)s/;
    const matches = durationStr.match(regex);
    if (matches) {
        const hours = parseInt(matches[1]) * 3600;
        const minutes = parseInt(matches[2]) * 60;
        const seconds = parseInt(matches[3]);
        return hours + minutes + seconds;
    }
    return 0;
}

window.playLiveFM = () => {
    // 1. Tính tổng thời gian vòng lặp (giây) bằng cách parse chuỗi duration
    const totalLoopDuration = playlist.reduce((sum, song) => {
        return sum + parseDuration(song.duration);
    }, 0);

    // 2. Lấy thời gian thực tại Nhật Bản/Việt Nam (Dựa trên thiết bị người dùng)
    const now = new Date();
    const secondsSinceMidnight = (now.getHours() * 3600) + (now.getMinutes() * 60) + now.getSeconds();

    // 3. Vị trí hiện tại trong "vòng lặp vĩnh cửu"
    let currentPos = secondsSinceMidnight % totalLoopDuration;

    // 4. Tìm bài hát tương ứng
    let accumulatedTime = 0;
    let targetSongIndex = 0;
    let seekTime = 0;

    for (let i = 0; i < playlist.length; i++) {
        const songDurationSec = parseDuration(playlist[i].duration);
        if (currentPos < accumulatedTime + songDurationSec) {
            targetSongIndex = i;
            seekTime = currentPos - accumulatedTime;
            break;
        }
        accumulatedTime += songDurationSec;
    }

    // 5. Điều khiển Player
    loadSong(targetSongIndex);
    
    // Đợi nhạc load một chút rồi mới nhảy đến đoạn giữa bài
    audio.oncanplay = function() {
        audio.currentTime = seekTime;
        audio.play();
        audio.oncanplay = null; // Gỡ bỏ sự kiện sau khi chạy
    };

    window.sysAlert(`📻 Đang Live: ${playlist[targetSongIndex].title}`, "success");
};

// Trạng thái Island
let pressTimer;
let isLongPress = false;
let islandState = 'idle'; // idle | compact | expanded | alert | input
let isPlaying = false;
let currentSongIndex = 0;

// Cấu hình kích thước các trạng thái
// TRONG FILE app.js

const ISLAND_STATES = {
    idle: { width: '190px', height: '40px', radius: '20px' },
    compact: { width: '220px', height: '40px', radius: '20px' },
    expanded: { width: '340px', height: '218px', radius: '38px' },
    alert: { width: '340px', height: '54px', radius: '22px' },
    confirm: { width: '340px', height: '180px', radius: '22px' },
    input: { width: '340px', height: '180px', radius: '22px' },
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



// =================================================================
// FIX: LOGIC CẬP NHẬT PROFILE & MỞ MODAL TÀI KHOẢN
// =================================================================

// 1. Hàm mở Modal và tự động điền thông tin hiện tại
window.openAccountModal = () => {
    if (!currentUser) return window.sysAlert("Vui lòng đăng nhập!", "error");
    
    // Điền thông tin từ biến currentUser vào ô input
    document.getElementById('account-name').value = currentUser.name || currentUser.displayName || "";
    document.getElementById('account-facebook').value = currentUser.facebookId || "";
    
    // Hiện Modal
    document.getElementById('account-modal').style.display = 'flex';
};

// 2. Xử lý sự kiện khi nhấn nút "Cập nhật Profile"
const updateProfileForm = document.getElementById("update-profile-form");

if (updateProfileForm) {
    updateProfileForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // Chặn load lại trang
        
        const newName = document.getElementById("account-name").value.trim();
        const newFbId = document.getElementById("account-facebook").value.trim();

        if (!newName) return window.sysAlert("Tên không được để trống!", "error");

        showLoading("Đang cập nhật...");

        try {
            // A. Cập nhật Firebase Auth (DisplayName)
            await updateProfile(auth.currentUser, { displayName: newName });

            // B. Cập nhật Firestore (Database)
            const userRef = doc(db, "users", currentUser.uid);
            
            // Dùng setDoc với merge: true để an toàn (nếu doc chưa có thì tạo mới, có rồi thì cập nhật)
            await setDoc(userRef, {
                name: newName,
                facebookId: newFbId,
                updatedAt: serverTimestamp()
            }, { merge: true });

            // C. Cập nhật biến Local (để không cần F5)
            currentUser.name = newName;
            currentUser.facebookId = newFbId;
            currentUser.displayName = newName;

            // D. Cập nhật Giao diện ngay lập tức (Avatar & Tên trên Island)
            updateUIAfterProfileChange(newName, newFbId);

            hideLoading();
            window.sysAlert("Cập nhật thành công!", "success");
            
            // Đóng modal
            document.getElementById('account-modal').style.display = 'none';

        } catch (err) {
            hideLoading();
            console.error(err);
            window.sysAlert("Lỗi: " + err.message, "error");
        }
    });
}

// Hàm phụ: Refresh lại giao diện Island/Map sau khi đổi thông tin
function updateUIAfterProfileChange(name, fbId) {
    const avatarUrl = fbId 
        ? `https://graph.facebook.com/${fbId}/picture?width=100&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662` 
        : null;

    const avatarHTML = avatarUrl
        ? `<img src="${avatarUrl}" class="w-full h-full object-cover">`
        : `<div class="w-full h-full bg-white/20 flex items-center justify-center text-[8px] font-bold text-white">${name.charAt(0).toUpperCase()}</div>`;

    // Update Avatar nhỏ trên Dynamic Island
    const islandAvatarMini = document.getElementById("island-avatar-mini");
    const islandControlAvatar = document.getElementById("island-control-avatar");
    
    if (islandAvatarMini) islandAvatarMini.innerHTML = avatarHTML;
    if (islandControlAvatar) islandControlAvatar.innerHTML = avatarHTML;

    // Update Icon trên Map (Nếu đang có map)
    if (userIcon) {
        const mapIconHtml = avatarUrl
            ? `<img src="${avatarUrl}" style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">`
            : `<div style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary-color); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">${name.charAt(0)}</div>`;
        
        userIcon = L.divIcon({ html: mapIconHtml, className: '', iconSize: [42, 42], iconAnchor: [21, 42], popupAnchor: [0, -42] });
    }
}

// =================================================================
// FIX: CHỨC NĂNG THAM GIA NHÓM (JOIN TRIP)
// =================================================================

const joinForm = document.getElementById("join-trip-form");

if (joinForm) {
    joinForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // Chặn reload trang

        // 1. Kiểm tra đăng nhập
        if (!currentUser) {
            return window.sysAlert("Vui lòng đăng nhập để tham gia!", "error");
        }

        // 2. Lấy mã và chuẩn hóa (viết hoa, bỏ khoảng trắng)
        const codeInput = document.getElementById("join-code");
        const code = codeInput.value.trim().toUpperCase();

        if (!code) {
            return window.sysAlert("Vui lòng nhập mã!", "info");
        }

        showLoading("Đang tìm chuyến đi...");

        try {
            // 3. Tìm chuyến đi có inviteCode khớp
            const tripsRef = collection(db, "trips");
            const q = query(tripsRef, where("inviteCode", "==", code));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                hideLoading();
                return window.sysAlert("Mã tham gia không tồn tại!", "error");
            }

            // 4. Lấy dữ liệu chuyến đi tìm được
            const tripDoc = querySnapshot.docs[0];
            const tripData = tripDoc.data();
            const tripId = tripDoc.id;

            // 5. Kiểm tra xem đã là thành viên chưa
            if (tripData.members && tripData.members.includes(currentUser.uid)) {
                hideLoading();
                window.sysAlert("Bạn đã ở trong nhóm này rồi!", "info");
                // Tự động mở chuyến đi luôn cho tiện
                openTrip(tripId, tripData);
                return;
            }

            // 6. Kiểm tra số lượng thành viên (nếu cần)
            if (tripData.members.length >= (tripData.maxPeople || 100)) {
                hideLoading();
                return window.sysAlert("Nhóm đã đủ người!", "error");
            }

            // 7. Thêm UID của user vào mảng members
            await updateDoc(doc(db, "trips", tripId), {
                members: arrayUnion(currentUser.uid)
            });

            hideLoading();
            window.sysAlert(`Đã tham gia "${tripData.name}" thành công!`, "success");
            
            // Reset ô nhập và mở chuyến đi
            codeInput.value = "";
            // Reload lại danh sách trip bên ngoài (mặc dù onSnapshot đã tự lo, nhưng gọi cho chắc)
            loadTrips(); 
            // Mở chuyến đi vừa tham gia
            openTrip(tripId, tripData);

        } catch (err) {
            hideLoading();
            console.error(err);
            window.sysAlert("Lỗi tham gia: " + err.message, "error");
        }
    });
}

// BỔ SUNG: TỰ ĐỘNG THAM GIA NẾU CÓ LINK CHIA SẺ (dạng #join=CODE123)
window.addEventListener('load', async () => {
    // Đợi 1 chút để Firebase Auth check xong (currentUser có giá trị)
    // Ta dùng setTimeout hoặc check trong onAuthStateChanged, 
    // nhưng đơn giản nhất là kiểm tra hash khi Auth state change xong.
});

// Bạn nên thêm đoạn nhỏ này vào bên trong hàm onAuthStateChanged (phần if user) 
// để khi user click link chia sẻ -> mở web -> đăng nhập xong -> tự điền mã
/*
    const hash = window.location.hash; // ví dụ: #join=ABCXYZ
    if (hash && hash.startsWith('#join=')) {
        const code = hash.split('=')[1];
        if(code) {
            document.getElementById("join-code").value = code;
            // Tự động submit luôn hoặc để user bấm
            // document.getElementById("join-trip-form").dispatchEvent(new Event('submit'));
        }
        // Xóa hash để nhìn cho đẹp
        history.replaceState(null, null, ' ');
    }
*/

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
    if (!data || data.length === 0) { 
        list.innerHTML = `<p class="text-center text-gray-400 dark:text-white/30 italic col-span-full">Không tìm thấy dữ liệu.</p>`; 
        return; 
    }

    data.forEach(d => {
        const card = document.createElement("div");
        // [FIX] Sửa màu nền và viền cho chế độ sáng
        card.className = "bg-white dark:bg-black/20 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-5 shadow-lg relative group transition-colors";
        const avg = d.numPeople > 0 ? d.cost / d.numPeople : 0;

        card.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <h4 class="text-lg font-bold text-gray-900 dark:text-primary">${d.locationName}</h4>
                <div class="flex items-center gap-1 text-yellow-500 text-sm"><span class="font-bold">${d.rating}</span> <i class="fa-solid fa-star"></i></div>
            </div>
            <div class="space-y-2 text-sm text-gray-600 dark:text-white/80">
                <div class="flex items-start gap-3"><i class="fa-solid fa-map-pin mt-1 text-gray-400 dark:text-white/40 w-4"></i> <span class="flex-1 opacity-90">${d.address || "Chưa có địa chỉ"}</span></div>
                <div class="flex items-center gap-3"><i class="fa-solid fa-clock text-gray-400 dark:text-white/40 w-4"></i> ${d.time} - ${d.date}</div>
                <div class="grid grid-cols-2 gap-2 mt-2 bg-gray-50 dark:bg-black/20 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                    <div><p class="text-xs text-gray-500 dark:text-white/50">Tổng tiền</p><p class="font-mono font-bold text-green-600 dark:text-green-400">${formatter.format(d.cost)}</p></div>
                    <div><p class="text-xs text-gray-500 dark:text-white/50">Chia người</p><p class="font-mono font-bold text-purple-600 dark:text-purple-400">${formatter.format(avg)}</p></div>
                </div>
            </div>
            <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                ${(currentUser.uid === currentTrip.ownerId || currentUser.uid === d.createdBy.uid) ? `<button class="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 hover:bg-red-500 hover:text-white text-gray-500 dark:text-white/60 flex items-center justify-center transition-colors" onclick="deleteHistoryItem('${d.id}')"><i class="fa-solid fa-trash text-xs"></i></button>` : ''}
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
    // [FIX] Màu chữ tiêu đề và số liệu
    document.getElementById("stats-content").innerHTML = `
        <h3 class="text-lg font-bold mb-4 text-center text-gray-900 dark:text-white">Tổng quan</h3>
        <div class="grid grid-cols-2 gap-4">
            <div class="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl col-span-2 flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white text-xl"><i class="fa-solid fa-wallet"></i></div>
                <div><p class="text-xs text-green-700 dark:text-green-400 font-bold uppercase">Tổng chi phí</p><p class="text-2xl font-bold text-gray-900 dark:text-white">${formatter.format(totalCost)} đ</p></div>
            </div>
            <div class="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-center">
                <p class="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">${totalPlaces}</p>
                <p class="text-xs text-gray-600 dark:text-white/50">Địa điểm</p>
            </div>
            <div class="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-2xl text-center">
                <p class="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">${(data.reduce((s, i) => s + i.rating, 0) / totalPlaces).toFixed(1)}</p>
                <p class="text-xs text-gray-600 dark:text-white/50">Sao TB</p>
            </div>
        </div>
    `;
}

// ==========================================
// CHAT LOGIC: GIAO DIỆN & CHỨC NĂNG (FULL)
// ==========================================

function loadChat(tripId) {
    const q = query(collection(db, "trips", tripId, "chat"), orderBy("timestamp", "asc"));
    
    // Hủy listener cũ nếu có để tránh duplicate
    if (chatUnsubscribe) chatUnsubscribe();

    chatUnsubscribe = onSnapshot(q, (snapshot) => {
        const div = document.getElementById("chat-messages");
        div.innerHTML = "";

        snapshot.forEach(doc => {
            const m = doc.data();
            const msgId = doc.id;
            const isMe = m.sender.uid === currentUser.uid;

            // 1. Xử lý Avatar
            const fbId = m.sender.faceId;
            const avatarUrl = fbId 
                ? `https://graph.facebook.com/${fbId}/picture?width=100&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662` 
                : null;
            
            // Avatar HTML
            const avatarHTML = `
                <div class="w-8 h-8 rounded-full bg-gray-300 dark:bg-white/10 flex-shrink-0 overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm">
                    ${avatarUrl 
                        ? `<img src="${avatarUrl}" class="w-full h-full object-cover">` 
                        : `<div class="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-white">${(m.sender.name||"U").charAt(0).toUpperCase()}</div>`
                    }
                </div>
            `;

            // 2. Xử lý Reaction (Con khỉ)
            const reactions = m.reactions || []; // Mảng UID người đã react
            const count = reactions.length;
            const hasReacted = reactions.includes(currentUser.uid);
            
            // Style cho nút khỉ: Nếu đã like thì sáng lên, chưa like thì mờ
            const reactionClass = hasReacted 
                ? "text-yellow-500 bg-yellow-500/10 border-yellow-500/20 scale-110" 
                : "text-gray-400 dark:text-white/30 hover:text-yellow-500 hover:bg-yellow-500/10 border-transparent";

            // 3. Xử lý bong bóng chat
            const safeContent = m.content.replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, '\\n');
            const timeStr = m.timestamp
                ? new Date(m.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '...';

            const bubbleStyle = isMe
                ? "bg-gradient-to-br from-primary to-blue-600 text-white rounded-2xl rounded-tr-sm shadow-md"
                : "bg-white dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white rounded-2xl rounded-tl-sm shadow-sm";

            // 4. Tạo HTML tổng thể
            const wrapper = document.createElement("div");
            wrapper.className = `w-full mb-5 flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`;

            wrapper.innerHTML = `
                ${avatarHTML}

                <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]">
                    
                    ${!isMe ? `<div class="text-[10px] text-gray-500 dark:text-white/50 mb-1 ml-1 font-bold truncate max-w-[150px]">${m.sender.name}</div>` : ''}

                    <div class="px-4 py-2.5 text-sm ${bubbleStyle} relative group/bubble">
                        <span class="whitespace-pre-wrap leading-relaxed block">${m.content}</span>
                        
                        ${count > 0 ? `
                            <div class="absolute -bottom-2 ${isMe ? '-left-2' : '-right-2'} bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-full px-1.5 py-0.5 text-[9px] shadow-sm flex items-center gap-0.5 text-yellow-500 animate-bounce-short">
                                <span>🙉</span><span class="font-bold">${count}</span>
                            </div>
                        ` : ''}
                    </div>

                    <div class="flex items-center gap-2 mt-1 px-1 opacity-100 transition-opacity duration-200">
                        <span class="text-[9px] text-gray-400 dark:text-white/30 font-medium select-none">${timeStr}</span>

                        <button onclick="window.toggleReaction('${msgId}')" 
                                class="w-6 h-6 rounded-full border flex items-center justify-center transition-all active:scale-95 ${reactionClass}" 
                                title="Thả tim">
                            <span class="text-xs">🙉</span>
                        </button>

                        <button onclick="window.quickCopy('${safeContent}')" 
                                class="w-6 h-6 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 flex items-center justify-center text-gray-400 dark:text-white/30 hover:text-blue-500 transition-colors" 
                                title="Sao chép">
                            <i class="fa-regular fa-copy text-[10px]"></i>
                        </button>

                        ${isMe ? `
                        <button onclick="window.quickDelete('${msgId}')" 
                                class="w-6 h-6 rounded-full hover:bg-red-100 dark:hover:bg-red-500/20 flex items-center justify-center text-gray-400 dark:text-white/30 hover:text-red-500 transition-colors" 
                                title="Thu hồi">
                            <i class="fa-solid fa-trash text-[10px]"></i>
                        </button>
                        ` : ''}
                    </div>
                </div>
            `;

            div.appendChild(wrapper);
        });

        // Tự động cuộn xuống dưới cùng
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

// Hàm xử lý thả cảm xúc
window.toggleReaction = async (msgId) => {
    if (!currentTrip.id || !currentUser) return;

    // Rung nhẹ phản hồi
    if (navigator.vibrate) navigator.vibrate(20);

    const msgRef = doc(db, "trips", currentTrip.id, "chat", msgId);

    try {
        const docSnap = await getDoc(msgRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const reactions = data.reactions || [];

            if (reactions.includes(currentUser.uid)) {
                // Nếu đã like rồi -> Bỏ like (Remove)
                await updateDoc(msgRef, {
                    reactions: arrayRemove(currentUser.uid)
                });
            } else {
                // Chưa like -> Thêm like (Union)
                await updateDoc(msgRef, {
                    reactions: arrayUnion(currentUser.uid)
                });
                
                // Hiệu ứng visual (tùy chọn): Alert nhỏ
                // window.sysAlert("Đã thả 🙉", "success"); 
            }
        }
    } catch (e) {
        console.error("Lỗi reaction:", e);
    }
};
document.getElementById("chat-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = document.getElementById("chat-input");
    const txt = input.value.trim();
    if (!txt) return;

    // [FIX] Thêm faceId và mảng reactions rỗng khi tạo tin nhắn mới
    await addDoc(collection(db, "trips", currentTrip.id, "chat"), { 
        sender: { 
            uid: currentUser.uid, 
            name: currentUser.name || currentUser.email,
            faceId: currentUser.facebookId || null // Lưu thêm cái này để lấy avatar
        }, 
        content: txt, 
        timestamp: serverTimestamp(), 
        type: 'text',
        reactions: [] // Mảng chứa UID những người đã thả cảm xúc
    });
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
// 11. CLOUD STORAGE LOGIC (SUPABASE INTEGRATION)
// =================================================================

// CẤU HÌNH BUCKET (Tạo bucket tên 'SnG' trong Supabase của bạn và set policy là Public)
const BUCKET_NAME = 'SnG'; 

let supabase = null;
// Biến cache để lọc phía Client (tránh query Firestore liên tục)
let allFilesCache = []; 
let uniqueUploaders = new Set();
let selectedFileIds = new Set();



// Hàm khởi tạo Supabase (Gọi hàm này ngay sau khi App khởi động hoặc user đăng nhập)
async function initSupabase() {
    if (supabase) return; // Đã init rồi thì thôi
    
    try {
        // Cách 1: Lấy Config từ Firestore (Bảo mật hơn, giống mẫu bạn đưa)
        // Bạn cần tạo collection 'config', document 'supabase' chứa field 'url' và 'key' trong Firestore
        const docRef = doc(db, "config", "supabase");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const config = docSnap.data();
            supabase = window.supabase.createClient(config.url, config.key);
            console.log("Supabase initialized form Firestore config");
        } else {
            console.warn("Không tìm thấy config Supabase trong Firestore!");
            // Cách 2: Hardcode (Dùng tạm nếu chưa cấu hình Firestore)
            // supabase = window.supabase.createClient("YOUR_SUPABASE_URL", "YOUR_SUPABASE_KEY");
        }
    } catch (error) {
        console.error("Lỗi init Supabase:", error);
    }
}

// Gọi init ngay khi file chạy (hoặc gọi trong onAuthStateChanged ở phần 6)
initSupabase();

// --- XỬ LÝ UPLOAD MỚI ---

// Biến trạng thái
let selectedFiles = [];
let isUploading = false;
let currentViewMode = 'list'; // list | grid | gallery
let filteredFilesCache = []; // Lưu danh sách file ĐANG HIỂN THỊ để gallery biết next/prev
let currentGalleryIndex = -1; // Index của file đang xem

// Xử lý khi chọn file (Giữ nguyên logic cũ để hiển thị số lượng file)
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

// Hàm xử lý Upload chính (Thay thế hoàn toàn logic GAS cũ)
// ==========================================
// UPLOAD VỚI THANH TIẾN TRÌNH THỰC TẾ (SPEED & SIZE)
// ==========================================

window.processCloudUpload = async () => {
    if (!supabase) await initSupabase();
    if (!selectedFiles.length) return window.sysAlert("Chưa chọn file!", "error");
    if (!currentUser) return window.sysAlert("Vui lòng đăng nhập!", "error");
    if (isUploading) return window.sysAlert("Đang tải lên!", "info");

    isUploading = true;
    setIslandState('upload');
    
    const islandText = document.getElementById('island-upload-text');
    const islandPercent = document.getElementById('island-upload-percent');
    const islandBar = document.getElementById('island-upload-bar');

    // Biến tính toán tốc độ tổng
    let totalBytes = 0;
    let loadedBytesGlobal = 0;
    Array.from(selectedFiles).forEach(f => totalBytes += f.size);
    
    let startTime = Date.now();
    let successCount = 0;

    // Helper: Format Bytes
    const formatSize = (bytes) => {
        if(bytes === 0) return '0 B';
        const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Upload từng file tuần tự
    for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileNameRaw = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

        try {
            // Upload dùng XHR để bắt sự kiện progress
            const publicUrl = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                // URL API chuẩn của Supabase Storage
                // Lưu ý: Cần supabaseUrl và supabaseKey từ biến global supabase
                const uploadUrl = `${supabase.supabaseUrl}/storage/v1/object/${BUCKET_NAME}/${fileNameRaw}`;
                
                xhr.open('POST', uploadUrl);
                xhr.setRequestHeader('Authorization', `Bearer ${supabase.supabaseKey}`);
                xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
                xhr.setRequestHeader('x-upsert', 'false');

                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        // Tính toán hiển thị
                        const currentFileLoaded = e.loaded;
                        const totalLoadedNow = loadedBytesGlobal + currentFileLoaded;
                        const percentTotal = Math.round((totalLoadedNow / totalBytes) * 100);
                        
                        // Tính tốc độ (Speed)
                        const elapsedTime = (Date.now() - startTime) / 1000; // giây
                        const speed = elapsedTime > 0 ? totalLoadedNow / elapsedTime : 0; // bytes/s

                        // Cập nhật UI Island
                        islandBar.style.width = `${percentTotal}%`;
                        islandPercent.textContent = `${percentTotal}%`;
                        islandText.textContent = `${formatSize(totalLoadedNow)} / ${formatSize(totalBytes)} - ${formatSize(speed)}/s`;
                    }
                };

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        loadedBytesGlobal += file.size; // Cộng dồn để tính cho file sau
                        // Lấy Public URL
                        const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileNameRaw);
                        resolve(data.publicUrl);
                    } else {
                        reject(new Error(xhr.responseText));
                    }
                };

                xhr.onerror = () => reject(new Error("Network Error"));
                xhr.send(file);
            });

            // Lưu Metadata vào Firestore
            await addDoc(collection(db, "files"), {
                uid: currentUser.uid,
                email: currentUser.email || "Ẩn danh",
                uploaderName: currentUser.name || "No Name",
                fileName: file.name,
                storageName: fileNameRaw,
                fileSize: formatSize(file.size),
                url: publicUrl,
                createdAt: serverTimestamp()
            });

            successCount++;

        } catch (err) {
            console.error("Upload error:", err);
            // Nếu lỗi, vẫn cộng dồn loadedBytes coi như đã qua file này để progress bar không bị giật lùi
            loadedBytesGlobal += file.size; 
        }
    }

    isUploading = false;
    setIslandState('idle');
    window.sysAlert(`Hoàn tất! Thành công: ${successCount}/${selectedFiles.length}`, "success");
    document.getElementById('cloud-file-input').value = "";
    loadCloudFiles();
};

// =========================================================
// CẬP NHẬT: HÀM TẢI DANH SÁCH FILE (CÓ THUMBNAIL & PREVIEW)
// =========================================================

// Hàm tải dữ liệu từ Firestore và lưu vào Cache
window.loadCloudFiles = () => {
    const list = document.getElementById('cloud-file-list');
    if (!list) return;

    list.innerHTML = `<p class="text-center text-white/30 italic py-4">Đang đồng bộ dữ liệu...</p>`;

    // Query lấy tất cả file
    const q = query(collection(db, "files"), orderBy("createdAt", "desc"));

    onSnapshot(q, (snapshot) => {
        allFilesCache = [];
        uniqueUploaders.clear();
        selectedFileIds.clear(); // Reset lựa chọn khi data thay đổi
        window.updateBulkActionUI();

        if (snapshot.empty) {
            list.innerHTML = `<div class="text-center text-white/40 py-8 bg-white/5 rounded-2xl border border-white/5">Chưa có file nào.</div>`;
            return;
        }

        snapshot.forEach(doc => {
            const d = doc.data();
            d.id = doc.id; // Lưu ID để thao tác
            d.timestamp = d.createdAt ? d.createdAt.seconds : 0;
            // Parse size ra số để sort (VD: "10.5 MB" -> 10.5)
            d.sizeNum = parseFloat(d.fileSize) || 0; 
            
            allFilesCache.push(d);
            if(d.uploaderName) uniqueUploaders.add(d.uploaderName);
        });

        // Cập nhật Dropdown người đăng
        const uploaderSelect = document.getElementById('filter-uploader');
        if (uploaderSelect) {
            uploaderSelect.innerHTML = '<option value="all">👤 Tất cả</option>';
            uniqueUploaders.forEach(name => {
                uploaderSelect.innerHTML += `<option value="${name}">${name}</option>`;
            });
        }

        // Gọi hàm render lần đầu
        window.applyFileFilters();
    });
};

// Hàm lọc và hiển thị ra màn hình
// Hàm chuyển chế độ xem
window.changeViewMode = (mode) => {
    currentViewMode = mode;
    ['list', 'grid', 'gallery'].forEach(m => {
        const btn = document.getElementById(`view-btn-${m}`);
        if(m === mode) {
            // [FIX] Active style: Nền trắng (light) hoặc trong suốt (dark)
            btn.className = "w-8 h-8 rounded-lg flex items-center justify-center bg-white text-primary shadow-sm dark:bg-white/20 dark:text-white transition-all";
        }
        else {
            // [FIX] Inactive style
            btn.className = "w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-white/50 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-600 dark:hover:text-white transition-all";
        }
    });
    window.applyFileFilters(); 
};

// =================================================================
// HÀM RENDER FILE (ĐÃ FIX GIAO DIỆN SÁNG/TỐI)
// =================================================================

window.applyFileFilters = () => {
    const list = document.getElementById('cloud-file-list');
    const searchTerm = document.getElementById('filter-name')?.value.toLowerCase() || "";
    const uploaderFilter = document.getElementById('filter-uploader')?.value || "all";
    const sortType = document.getElementById('filter-sort')?.value || "newest";

    // 1. Lọc dữ liệu
    filteredFilesCache = allFilesCache.filter(item => {
        const matchesName = (item.fileName || "").toLowerCase().includes(searchTerm);
        const matchesUploader = uploaderFilter === "all" || item.uploaderName === uploaderFilter;
        
        // Gallery chỉ hiện Media
        if (currentViewMode === 'gallery') {
            const name = (item.fileName || "").toLowerCase();
            const isMedia = name.match(/\.(jpg|png|jpeg|gif|webp|heic|mp4|mov|avi|mkv)$/);
            return matchesName && matchesUploader && isMedia;
        }
        return matchesName && matchesUploader;
    });

    // 2. Sắp xếp
    filteredFilesCache.sort((a, b) => {
        if (sortType === 'newest') return b.timestamp - a.timestamp;
        if (sortType === 'oldest') return a.timestamp - b.timestamp;
        if (sortType === 'name_asc') return (a.fileName || "").localeCompare(b.fileName || "");
        if (sortType === 'size_desc') return b.sizeNum - a.sizeNum;
        return 0;
    });

    // 3. Render giao diện
    // Gán class view-gallery nếu đang ở chế độ gallery
    list.className = currentViewMode === 'grid' ? 'view-grid' : (currentViewMode === 'gallery' ? 'view-gallery' : 'space-y-3 pb-20');
    list.innerHTML = "";

    if (filteredFilesCache.length === 0) {
        list.innerHTML = `<p class="text-center text-gray-400 dark:text-white/30 italic py-4 col-span-full">Không tìm thấy file phù hợp.</p>`;
        return;
    }

    filteredFilesCache.forEach((d, index) => {
        const isGallery = currentViewMode === 'gallery'; 

        // Xử lý hiển thị Thumbnail
        const name = (d.fileName || "").toLowerCase();
        const isImage = name.match(/\.(jpg|png|jpeg|gif|webp|heic)$/);
        const isVideo = name.match(/\.(mp4|mov|avi|mkv)$/);
        const isAudio = name.endsWith('.mp3') || name.endsWith('.wav');
        
        let mediaDisplay = '';
        let iconClass = "fa-file";

        // Logic hiển thị ảnh/video/icon
        if (isImage) {
            mediaDisplay = `<img src="${d.url}" class="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110" loading="lazy">`;
        }
        else if (isVideo) {
            mediaDisplay = `<video src="${d.url}#t=1.0" class="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110" muted preload="metadata"></video>`;
        }
        else {
             if (name.endsWith('.pdf')) iconClass = "fa-file-pdf text-red-500";
             else if (name.match(/\.(xls|xlsx)$/)) iconClass = "fa-file-excel text-green-500";
             else if (name.match(/\.(doc|docx)$/)) iconClass = "fa-file-word text-blue-500";
             else if (isAudio) iconClass = "fa-file-audio text-pink-500";
             else if (name.match(/\.(zip|rar|7z)$/)) iconClass = "fa-file-zipper text-yellow-500";
             
             // Icon lớn nếu là Grid, Icon nhỏ nếu List
             const iconSize = currentViewMode === 'grid' ? 'text-4xl' : 'text-xl';
             // Màu icon (gray ở light mode, white ở dark mode cho phần nền icon)
             const iconColor = "text-gray-400 dark:text-white/50";
             
             mediaDisplay = `<div class="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-white/5"><i class="fa-solid ${iconClass} ${iconSize}"></i></div>`;
        }

        // Cấu hình kích thước container ảnh
        let thumbContainerClass = "";
        if (isGallery) {
            thumbContainerClass = "absolute inset-0 w-full h-full"; 
        } else if (currentViewMode === 'grid') {
            thumbContainerClass = "w-full h-32 rounded-xl border border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-black/20 overflow-hidden mb-2";
        } else {
            thumbContainerClass = "w-12 h-12 rounded-xl border border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-white/5 overflow-hidden shrink-0";
        }

        // Kiểm tra đã chọn hay chưa để đổi màu nền
        const isChecked = selectedFileIds.has(d.id) ? 'checked' : '';
        
        // [FIX] Màu nền và viền thay đổi theo Light/Dark Mode
        const borderClass = isChecked 
            ? 'border-primary bg-primary/5 dark:bg-primary/10' 
            : 'border-gray-200 dark:border-white/10 bg-white dark:bg-glass';

        // Tạo thẻ Wrapper
        const el = document.createElement("div");
        
        // [FIX] Thêm transition-colors để chuyển chế độ mượt mà
        el.className = `file-card group/item animate-fade-in-up relative ${!isGallery ? `${borderClass} backdrop-blur-md border rounded-2xl p-3 flex items-center gap-3 shadow-sm hover:shadow-md dark:shadow-none hover:bg-gray-50 dark:hover:bg-white/10 transition-all` : ''}`;
        
        // Nội dung HTML
        el.innerHTML = `
            <div class="checkbox-wrapper ${isGallery ? 'hidden' : 'flex'} items-center justify-center pl-1 z-10" onclick="event.stopPropagation()">
                <input type="checkbox" class="appearance-none w-5 h-5 border border-gray-400 dark:border-white/30 rounded bg-white dark:bg-white/10 checked:bg-primary checked:border-primary cursor-pointer file-checkbox transition-all relative after:content-['✔'] after:absolute after:text-white after:text-[10px] after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:opacity-0 checked:after:opacity-100" 
                       data-id="${d.id}" ${isChecked} onchange="window.handleFileCheck(this, '${d.id}')">
            </div>

            <div class="file-content flex ${currentViewMode === 'grid' ? 'flex-col' : 'items-center'} gap-3 overflow-hidden flex-1 cursor-pointer w-full h-full" 
                 onclick="window.openGalleryAtIndex(${index})">
                
                <div class="${thumbContainerClass} flex items-center justify-center relative">
                    ${mediaDisplay}
                    ${isVideo ? '<div class="absolute inset-0 flex items-center justify-center"><i class="fa-solid fa-play text-white drop-shadow-md text-2xl filter drop-shadow-lg"></i></div>' : ''}
                </div>
                
                <div class="file-info min-w-0 flex-1 ${isGallery ? 'hidden' : ''}">
                    <h4 class="text-sm font-bold text-gray-900 dark:text-white truncate pr-2" title="${d.fileName}">${d.fileName}</h4>
                    <div class="flex items-center gap-2 text-[10px] text-gray-500 dark:text-white/50">
                        <span>${d.uploaderName || 'User'}</span> • <span>${d.fileSize}</span>
                    </div>
                </div>
            </div>

            <div class="file-actions ${isGallery ? 'hidden' : 'flex'} items-center gap-1 z-10">
                <button onclick="window.forceDownload('${d.url}', '${d.fileName}')" 
                    class="w-8 h-8 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-colors" title="Tải xuống">
                    <i class="fa-solid fa-download text-xs"></i>
                </button>
                
                ${(currentUser && d.uid === currentUser.uid) ? `
                <button onclick="window.renameCloudFile('${d.id}', '${d.fileName}')" 
                    class="w-8 h-8 rounded-full hover:bg-yellow-100 dark:hover:bg-yellow-500/20 text-gray-500 dark:text-white/60 hover:text-yellow-600 dark:hover:text-yellow-400 flex items-center justify-center transition-colors" title="Đổi tên">
                    <i class="fa-solid fa-pen text-xs"></i>
                </button>
                <button onclick="window.deleteCloudFile('${d.id}', '${d.storageName || ''}')" 
                    class="w-8 h-8 rounded-full hover:bg-red-100 dark:hover:bg-red-500/20 text-gray-500 dark:text-white/60 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center transition-colors" title="Xóa">
                    <i class="fa-solid fa-trash text-xs"></i>
                </button>
                ` : ''}
            </div>
        `;
        list.appendChild(el);
    });
};

// Hàm ép trình duyệt tải file về thay vì mở tab
window.forceDownload = async (url, filename) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network error');
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error("Download error:", error);
        // Fallback: Nếu lỗi CORS hoặc fetch, mở tab mới như cũ
        window.open(url, '_blank');
    }
};

// ==========================================
// HÀM ĐỔI TÊN FILE (GIỮ NGUYÊN ĐUÔI MỞ RỘNG)
// ==========================================

window.renameCloudFile = async (docId, fullFileName) => {
    // 1. Tách tên và đuôi file
    // Tìm vị trí dấu chấm cuối cùng
    const lastDotIndex = fullFileName.lastIndexOf('.');
    
    let baseName = fullFileName;
    let extension = "";

    // Nếu tìm thấy dấu chấm, tách ra làm 2 phần
    if (lastDotIndex !== -1) {
        baseName = fullFileName.substring(0, lastDotIndex);
        extension = fullFileName.substring(lastDotIndex); // Ví dụ: .png, .jpg
    }

    // 2. Hiển thị Prompt chỉ với tên gốc (người dùng không cần lo về đuôi file)
    const newBaseName = await window.sysPrompt(`Đổi tên file (định dạng ${extension} được giữ nguyên):`, baseName);
    
    // Kiểm tra: Nếu hủy hoặc tên rỗng hoặc tên chưa thay đổi thì dừng
    if (!newBaseName || newBaseName.trim() === "" || newBaseName === baseName) return;
    
    if (!currentUser) return window.sysAlert("Vui lòng đăng nhập!", "error");

    // 3. Ghép lại tên đầy đủ
    const finalName = newBaseName.trim() + extension;

    showLoading("Đang đổi tên...");
    try {
        // Chỉ cập nhật metadata trong Firestore
        await updateDoc(doc(db, "files", docId), {
            fileName: finalName
        });
        
        hideLoading();
        window.sysAlert("Đổi tên thành công!", "success");
        
        // Không cần gọi loadCloudFiles() thủ công vì onSnapshot sẽ tự cập nhật giao diện
    } catch (e) {
        hideLoading();
        console.error(e);
        window.sysAlert("Lỗi đổi tên: " + e.message, "error");
    }
};
// =========================================================
// LOGIC XEM TRƯỚC MEDIA (PREVIEW)
// =========================================================

window.openMediaPreview = (url, type) => {
    const modal = document.getElementById('media-view-modal');
    const imgTag = document.getElementById('media-view-image');
    const videoTag = document.getElementById('media-view-video');
    
    if (!modal) return;

    // Reset trạng thái
    imgTag.classList.add('hidden');
    videoTag.classList.add('hidden');
    videoTag.pause(); // Dừng video cũ nếu có

    if (type === 'image') {
        imgTag.src = url;
        imgTag.classList.remove('hidden');
    } else if (type === 'video') {
        videoTag.src = url;
        videoTag.classList.remove('hidden');
        // Tự động phát video khi mở (tùy chọn)
        videoTag.play().catch(e => console.log("Auto-play prevented"));
    }

    // Hiển thị Modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Rung nhẹ phản hồi
    if (navigator.vibrate) navigator.vibrate(30);
};

window.closeMediaView = () => {
    const modal = document.getElementById('media-view-modal');
    const videoTag = document.getElementById('media-view-video');
    
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
    
    // Dừng video khi đóng modal
    if (videoTag) {
        videoTag.pause();
        videoTag.currentTime = 0;
    }
};

// Đóng modal khi nhấn phím ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') window.closeMediaView();
});

// Hàm xóa file (Bổ sung thêm cho đầy đủ chức năng)
window.deleteCloudFile = async (docId, storagePath) => {
    if (!await window.sysConfirm("Bạn chắc chắn muốn xóa file này?")) return;
    
    // Yêu cầu quyền xóa
    if (!currentUser) return window.sysAlert("Vui lòng đăng nhập!", "error");

    showLoading("Đang xóa...");
    try {
        // 1. Xóa trên Supabase Storage (nếu có path)
        if (storagePath && typeof supabase !== 'undefined') {
            const { error } = await supabase.storage.from('SnG').remove([storagePath]);
            if (error) console.error("Lỗi xóa Storage:", error);
        }

        // 2. Xóa Metadata trên Firestore
        await deleteDoc(doc(db, "files", docId));
        
        hideLoading();
        window.sysAlert("Đã xóa file!", "success");
    } catch (err) {
        hideLoading();
        console.error(err);
        window.sysAlert("Lỗi xóa file: " + err.message, "error");
    }
}

// Kích hoạt load file khi bấm vào tab Cloud
// (Đoạn này đảm bảo khi chuyển tab sẽ tải lại danh sách)
const cloudTabBtn = document.querySelector('.tab-button[data-tab="cloud-tab"]');
if (cloudTabBtn) {
    cloudTabBtn.addEventListener('click', () => {
        if (typeof window.loadCloudFiles === 'function') {
            window.loadCloudFiles();
        }
    });
}

// ==========================================
// LOGIC THAO TÁC HÀNG LOẠT (BULK ACTIONS)
// ==========================================

// Xử lý khi tick 1 file
window.handleFileCheck = (checkbox, id) => {
    if (checkbox.checked) selectedFileIds.add(id);
    else selectedFileIds.delete(id);
    window.updateBulkActionUI();
    
    // Đổi màu viền item
    const parent = checkbox.closest('.bg-glass');
    if(checkbox.checked) parent.classList.add('border-primary', 'bg-primary/10');
    else parent.classList.remove('border-primary', 'bg-primary/10');
};

// Xử lý khi tick "Chọn tất cả"
window.toggleSelectAll = (source) => {
    const checkboxes = document.querySelectorAll('.file-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = source.checked;
        const id = cb.getAttribute('data-id');
        if (source.checked) selectedFileIds.add(id);
        else selectedFileIds.delete(id);
        
        // Update UI từng item
        const parent = cb.closest('.bg-glass');
        if(source.checked) parent.classList.add('border-primary', 'bg-primary/10');
        else parent.classList.remove('border-primary', 'bg-primary/10');
    });
    window.updateBulkActionUI();
};

// Cập nhật hiển thị thanh công cụ
window.updateBulkActionUI = () => {
    const bulkDiv = document.getElementById('bulk-actions');
    const countSpan = document.getElementById('selected-count');
    const count = selectedFileIds.size;

    if (count > 0) {
        bulkDiv.classList.remove('hidden');
        bulkDiv.classList.add('flex');
        countSpan.textContent = `Đã chọn ${count}`;
    } else {
        bulkDiv.classList.add('hidden');
        bulkDiv.classList.remove('flex');
        document.getElementById('select-all-files').checked = false;
    }
};

// Xóa hàng loạt
window.bulkDelete = async () => {
    if (selectedFileIds.size === 0) return;
    if (!await window.sysConfirm(`Xóa vĩnh viễn ${selectedFileIds.size} file đã chọn?`)) return;
    
    showLoading("Đang xóa hàng loạt...");
    let deletedCount = 0;

    // Chuyển Set thành Array để lặp
    const ids = Array.from(selectedFileIds);
    
    for (const id of ids) {
        // Tìm file trong cache để lấy storageName
        const fileData = allFilesCache.find(f => f.id === id);
        if (fileData) {
            // Kiểm tra quyền (chỉ xóa file của mình)
            if (currentUser && fileData.uid === currentUser.uid) {
                try {
                    // Xóa Storage
                    if (fileData.storageName && typeof supabase !== 'undefined') {
                        await supabase.storage.from('SnG').remove([fileData.storageName]);
                    }
                    // Xóa Firestore
                    await deleteDoc(doc(db, "files", id));
                    deletedCount++;
                } catch (e) {
                    console.error("Lỗi xóa file " + id, e);
                }
            }
        }
    }
    
    selectedFileIds.clear();
    hideLoading();
    window.sysAlert(`Đã xóa ${deletedCount} file thành công!`, "success");
    window.updateBulkActionUI();
};

// Tải hàng loạt
window.bulkDownload = async () => {
    if (selectedFileIds.size === 0) return;
    
    window.sysAlert(`Đang bắt đầu tải ${selectedFileIds.size} file...`, "info");
    
    const ids = Array.from(selectedFileIds);
    let delay = 0;

    for (const id of ids) {
        const fileData = allFilesCache.find(f => f.id === id);
        if (fileData) {
            // Tạo delay nhẹ 500ms giữa các file để tránh trình duyệt chặn popup
            setTimeout(() => {
                window.forceDownload(fileData.url, fileData.fileName);
            }, delay);
            delay += 800; 
        }
    }
    
    // Bỏ chọn sau khi tải xong
    setTimeout(() => {
        selectedFileIds.clear();
        window.updateBulkActionUI();
        // Render lại để bỏ checkbox UI
        window.applyFileFilters(); 
    }, delay + 500);
};

// ==========================================
// LOGIC GALLERY NÂNG CAO
// ==========================================

window.openGalleryAtIndex = (index) => {
    if (index < 0 || index >= filteredFilesCache.length) return;
    currentGalleryIndex = index;
    const file = filteredFilesCache[index];
    const name = (file.fileName || "").toLowerCase();
    
    // UI Elements
    const modal = document.getElementById('media-view-modal');
    const imgTag = document.getElementById('media-view-image');
    const videoContainer = document.getElementById('media-view-video-container');
    const videoTag = document.getElementById('media-view-video');
    const audioContainer = document.getElementById('media-view-audio');
    const audioTag = document.getElementById('audio-element');
    const counter = document.getElementById('gallery-counter');
    const downloadBtn = document.getElementById('gallery-download');

    // Reset UI
    imgTag.classList.add('hidden');
    videoContainer.classList.add('hidden');
    audioContainer.classList.add('hidden');
    videoTag.pause();
    audioTag.pause();

    // Xác định loại file để hiển thị
    if (name.match(/\.(jpg|png|jpeg|gif|webp|heic)$/)) {
        imgTag.src = file.url;
        imgTag.classList.remove('hidden');
    } 
    else if (name.match(/\.(mp4|mov|avi|mkv)$/)) {
        videoTag.querySelector('source').src = file.url;
        videoTag.load();
        videoContainer.classList.remove('hidden');
        // Auto play video
        videoTag.play().catch(() => {});
    }
    else if (name.match(/\.(mp3|wav|ogg)$/)) {
        audioTag.src = file.url;
        document.getElementById('audio-title').textContent = file.fileName;
        audioContainer.classList.remove('hidden');
        audioContainer.classList.remove('paused');
        audioTag.play().catch(() => {});
        
        // Hiệu ứng đĩa xoay
        audioTag.onplay = () => audioContainer.classList.remove('paused');
        audioTag.onpause = () => audioContainer.classList.add('paused');
    } 
    else {
        // Nếu file không xem được (zip, doc...), mở link tải luôn
        window.forceDownload(file.url, file.fileName);
        return; 
    }

    // Update Counter & Download Link
    counter.textContent = `${index + 1} / ${filteredFilesCache.length}`;
    downloadBtn.onclick = () => window.forceDownload(file.url, file.fileName);

    // Show Modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');
};

window.navigateGallery = (direction) => {
    let newIndex = currentGalleryIndex + direction;
    // Loop vòng tròn
    if (newIndex < 0) newIndex = filteredFilesCache.length - 1;
    if (newIndex >= filteredFilesCache.length) newIndex = 0;
    
    window.openGalleryAtIndex(newIndex);
};

// Phím tắt điều hướng
document.addEventListener('keydown', (e) => {
    if (document.getElementById('media-view-modal').classList.contains('hidden')) return;
    if (e.key === 'ArrowLeft') window.navigateGallery(-1);
    if (e.key === 'ArrowRight') window.navigateGallery(1);
    if (e.key === 'Escape') window.closeMediaView();
});