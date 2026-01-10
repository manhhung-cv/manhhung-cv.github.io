
const SUPABASE_URL = 'https://xeenspuseysqaisfcxbo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlZW5zcHVzZXlzcWFpc2ZjeGJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NzE0NDMsImV4cCI6MjA4MzM0NzQ0M30.uJ52xnUvw2wT_QJEw4Rx_DSB5rddc32_Ie0RY9hqNKw';

// Data Schema 6.0
const DEFAULT_DATA = {
    startDate: '2023-01-01',
    user1: { id: '', name: 'Nam', dob: '2000-01-01', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', status: { text: '', duration: 1440, timestamp: 0 } },
    user2: { id: '', name: 'Nữ', dob: '2002-05-20', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', status: { text: '', duration: 1440, timestamp: 0 } },
    streak: { count: 0, lastDate1: null, lastDate2: null },
    events: [
        { id: 1, title: 'Kỷ niệm 1 năm', date: '2024-01-01', recur: 'year', bg: '' }
    ],
    diary: [],
    todos: [],
    playlist: [], // Music list {name, url}
    theme: { color: 'pink', font: 'Nunito', bg: '' },
    heartTimestamp: { u1: 0, u2: 0 },
    secretPin: null,

    loveBox: [],
    lastBoxOpen: { u1: 0, u2: 0 },
    giftedOpens: { u1: 0, u2: 0 },
    dailyGiftStats: {
        u1: { date: '', count: 0 },
        u2: { date: '', count: 0 }
    },
    encryptedDiceData: null,
    secretPositions: {
        current: 1,
        doneList: [],
        skipDone: false,
        reviews: {}
    },

    // 2. Dữ liệu Ghi chú (Mã hóa)
    secretNotes: []
};

const THEMES = {
    pink: { 50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48' },
    blue: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb' },
    green: { 50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669' },
    purple: { 50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd', 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed' },
    yellow: { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' }
};

const GRADIENTS = [
    'bg-gradient-to-r from-pink-400 to-rose-500',
    'bg-gradient-to-r from-blue-400 to-cyan-500',
    'bg-gradient-to-r from-emerald-400 to-teal-500',
    'bg-gradient-to-r from-violet-400 to-fuchsia-500',
    'bg-gradient-to-r from-amber-400 to-orange-500',
    'bg-gradient-to-r from-indigo-400 to-blue-500',
];

let supabaseClient = null;
try { supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY); } catch (e) { console.error(e); }

let currentUser = null;
let currentCoupleCode = null;
let appData = JSON.parse(JSON.stringify(DEFAULT_DATA));
let myUserIndex = 0; // 1 or 2
let tempThemeColor = 'pink';


/* --- CUSTOM MODAL SYSTEM --- */
/* --- NEW NOTIFICATION SYSTEM --- */
const Modal = {
    // Phần Modal to (cho Confirm/Prompt)
    element: document.getElementById('sys-modal'),
    title: document.getElementById('sys-modal-title'),
    msg: document.getElementById('sys-modal-msg'),
    inputContainer: document.getElementById('sys-modal-input-container'),
    input: document.getElementById('sys-modal-input'),
    btnOk: document.getElementById('sys-modal-ok'),
    btnCancel: document.getElementById('sys-modal-cancel'),
    icon: document.getElementById('sys-modal-icon'),
    resolvePromise: null,

    // Phần Toast Container (cho Alert)
    toastContainer: document.getElementById('toast-container'),

    // --- LOGIC TOAST (Thay thế Alert) ---
    showToast(message, type = 'info') {
        // Tạo element
        const toast = document.createElement('div');

        // Style tùy chỉnh theo type
        let iconClass = 'fa-info-circle';
        let colorClass = 'text-love-500 bg-love-50 border-love-100'; // Default styling

        if (message.toLowerCase().includes('lỗi') || message.toLowerCase().includes('error') || message.toLowerCase().includes('thất bại')) {
            iconClass = 'fa-exclamation-circle';
            colorClass = 'text-red-500 bg-red-50 border-red-100';
        } else if (message.toLowerCase().includes('thành công') || message.toLowerCase().includes('đã lưu') || message.toLowerCase().includes('copy')) {
            iconClass = 'fa-check-circle';
            colorClass = 'text-green-500 bg-green-50 border-green-100';
        }

        toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border backdrop-blur-md min-w-[280px] toast-enter bg-white/95 ${colorClass.replace('bg-', 'border-')}`;

        toast.innerHTML = `
            <div class="flex-shrink-0 w-8 h-8 rounded-full ${colorClass} flex items-center justify-center">
                <i class="fas ${iconClass}"></i>
            </div>
            <p class="text-sm font-bold text-gray-700 flex-grow pr-2">${message}</p>
            <button onclick="this.parentElement.remove()" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times text-xs"></i>
            </button>
        `;

        // Thêm vào container
        this.toastContainer.appendChild(toast);

        // Tự động xóa sau 3 giây
        setTimeout(() => {
            toast.classList.remove('toast-enter');
            toast.classList.add('toast-exit');
            toast.addEventListener('animationend', () => toast.remove());
        }, 3000);

        // Trả về promise resolved ngay lập tức để code không bị block
        return Promise.resolve();
    },

    // --- LOGIC MODAL (Confirm / Prompt) ---
    showModal(type, message, defaultValue = '') {
        return new Promise((resolve) => {
            this.resolvePromise = resolve;
            this.msg.innerText = message;
            this.element.classList.remove('hidden');

            // Reset UI Modal
            this.inputContainer.classList.add('hidden');
            this.btnCancel.classList.add('hidden');
            this.btnOk.innerText = "Đồng ý";
            this.icon.className = "fas fa-question text-love-500 text-xl"; // Mặc định icon hỏi

            if (type === 'confirm') {
                this.title.innerText = "Xác nhận";
                this.btnCancel.classList.remove('hidden');
                this.btnCancel.onclick = () => this.close(false);
                this.btnOk.onclick = () => this.close(true);
            }
            else if (type === 'prompt') {
                this.title.innerText = "Nhập thông tin";
                this.icon.className = "fas fa-pen text-blue-500 text-xl";
                this.inputContainer.classList.remove('hidden');
                this.input.value = defaultValue;
                this.input.focus();
                this.btnCancel.classList.remove('hidden');
                this.btnCancel.onclick = () => this.close(null);
                this.btnOk.onclick = () => this.close(this.input.value);
            }
        });
    },

    close(value) {
        this.element.classList.add('hidden');
        if (this.resolvePromise) {
            this.resolvePromise(value);
            this.resolvePromise = null;
        }
    },

    // --- CÁC HÀM GỌI ---
    // Alert bây giờ dùng Toast
    alert: (msg) => Modal.showToast(msg),

    // Confirm và Prompt vẫn dùng Modal to
    confirm: (msg) => Modal.showModal('confirm', msg),
    prompt: (msg, val) => Modal.showModal('prompt', msg, val)
};
// Music Player State
let currentSongIndex = 0;
const audioPlayer = document.getElementById('bg-music');
let isPlaying = false;

/* --- PLAYER LOGIC WITH LIVE FM --- */
let isPlayerExpanded = false;
let playerTimeout = null;
let isLiveMode = false; // Trạng thái Live

/* --- ADVANCED LIVE FM LOGIC --- */

// Cấu hình: Thời lượng trung bình 1 bài hát (ms)
// 3 phút 30 giây = 210000ms. Bạn có thể chỉnh số này
const LIVE_SLOT_DURATION = 210000;

function toggleLiveMode() {
    isLiveMode = !isLiveMode;
    const btn = document.getElementById('btn-live-mode');
    const dot = document.getElementById('live-dot');
    const list = appData.playlist || [];

    if (list.length === 0) { isLiveMode = false; return Modal.alert("Playlist trống!"); }

    if (isLiveMode) {
        // --- BẬT LIVE ---
        dot.className = "w-1.5 h-1.5 rounded-full bg-red-500 animate-ping";
        btn.classList.add('border', 'border-red-500/30');

        Modal.showToast("📻 Đang dò sóng FM... Kết nối vệ tinh...");

        // Gọi đồng bộ ngay lập tức
        syncLiveMusic();

        // Thiết lập Interval để check lại mỗi 5s (để đảm bảo không bị trôi giờ)
        if (window.liveInterval) clearInterval(window.liveInterval);
        window.liveInterval = setInterval(() => {
            if (isLiveMode && isPlaying) {
                // Chỉ log nhẹ để debug, không can thiệp nếu lệch ít
                // console.log("Keeping Sync...");
            }
        }, 5000);

    } else {
        // --- TẮT LIVE ---
        dot.className = "w-1.5 h-1.5 rounded-full bg-gray-400";
        btn.classList.remove('border', 'border-red-500/30');
        if (window.liveInterval) clearInterval(window.liveInterval);
        Modal.showToast("Đã chuyển sang chế độ nghe cá nhân.");
    }
}

// HÀM TÍNH TOÁN VỊ TRÍ CHÍNH XÁC DỰA TRÊN GIỜ HỆ THỐNG
function syncLiveMusic() {
    if (!isLiveMode) return;

    const list = appData.playlist || [];
    if (list.length === 0) return;

    const now = Date.now(); // Lấy thời gian thực tế (ms)

    // Tổng thời gian của cả Playlist (giả định theo slot)
    const totalLoopDuration = list.length * LIVE_SLOT_DURATION;

    // Tính vị trí hiện tại trong vòng lặp vô tận
    const currentLoopPosition = now % totalLoopDuration;

    // Tính ra Index bài hát
    const targetSongIndex = Math.floor(currentLoopPosition / LIVE_SLOT_DURATION);

    // Tính ra giây cần tua đến (Seek Time)
    const targetSeekTime = (currentLoopPosition % LIVE_SLOT_DURATION) / 1000; // Đổi sang giây

    console.log(`📡 LIVE FM: Bài số ${targetSongIndex + 1}/${list.length} - Tại giây: ${targetSeekTime.toFixed(1)}s`);

    // LOGIC ĐỒNG BỘ PLAYER
    // Trường hợp 1: Đang chơi đúng bài -> Chỉ cần chỉnh lại thời gian nếu lệch quá nhiều (>3s)
    if (currentSongIndex === targetSongIndex && isPlaying && audioPlayer.src) {
        const diff = Math.abs(audioPlayer.currentTime - targetSeekTime);
        if (diff > 3) {
            // Hiệu ứng Fade nhẹ (nếu muốn xịn hơn) nhưng ở đây set thẳng cho nhanh
            audioPlayer.currentTime = targetSeekTime;
            Modal.showToast(`Đồng bộ lại tín hiệu...`);
        }
    }
    // Trường hợp 2: Đang chơi sai bài hoặc chưa chơi -> Chuyển bài và Tua
    else {
        playSongAtIndex(targetSongIndex, true); // true = fromLive

        // Quan trọng: Phải đợi metadata load xong mới tua được
        audioPlayer.onloadedmetadata = () => {
            if (isLiveMode) {
                // Nếu thời gian tua > độ dài thật của bài hát -> Có thể bài này ngắn quá
                if (targetSeekTime < audioPlayer.duration) {
                    audioPlayer.currentTime = targetSeekTime;
                    console.log("Đã tua đến:", targetSeekTime);
                } else {
                    // Nếu đã hết bài (do slot dài hơn bài hát) -> Chờ slot sau hoặc Replay
                    // Ở đây ta chọn cách im lặng chờ bài sau cho giống Radio thật (Break time)
                    console.log("Bài hát đã kết thúc trong slot này (Break time)");
                }
            }
        };
    }
}

// Cập nhật lại playSongAtIndex để hỗ trợ tham số fromLive
function playSongAtIndex(index, fromLive = false) {
    resetCollapseTimer(); // Reset bộ đếm thu nhỏ UI

    const list = appData.playlist || [];
    if (list.length === 0) return;

    // Nếu người dùng tự bấm chọn bài thì tắt chế độ Live đi
    if (!fromLive && isLiveMode) toggleLiveMode();

    if (index >= list.length) index = 0;
    if (index < 0) index = list.length - 1;

    currentSongIndex = index;

    // Kiểm tra nếu src đã đúng thì không load lại (tránh giật)
    if (audioPlayer.src !== list[index].url) {
        audioPlayer.src = list[index].url;
    }

    audioPlayer.play().catch(e => console.log("Autoplay blocked:", e));
    isPlaying = true;

    // UI Updates
    const titleEl = document.getElementById('player-title');
    const playIcon = document.getElementById('player-play-icon');

    if (titleEl) titleEl.innerText = list[index].name;
    if (playIcon) playIcon.className = 'fas fa-pause text-xs';

    if (!isPlayerExpanded) toggleExpandPlayer();
}

// Xử lý sự kiện khi hết bài (onended)
audioPlayer.onended = () => {
    if (isLiveMode) {
        // Nếu đang Live, khi hết bài thật sự, 
        // nó sẽ check lại thời gian xem đã sang slot mới chưa
        syncLiveMusic();
    } else {
        // Chế độ thường: Qua bài tiếp theo
        nextSong();
    }
};

// Khi mở lại tab trình duyệt, đồng bộ lại ngay
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === 'visible' && isLiveMode) {
        syncLiveMusic();
    }
});
// 3. Cập nhật toggleExpandPlayer (Giữ nguyên logic cũ)
function toggleExpandPlayer() {
    const island = document.getElementById('player-island');
    const collapsed = document.getElementById('player-collapsed');
    const expanded = document.getElementById('player-expanded');
    if (!island || !collapsed || !expanded) return;

    if (!isPlayerExpanded) {
        isPlayerExpanded = true;
        island.classList.remove('w-10', 'h-10');
        island.classList.add('w-48', 'h-10');
        collapsed.classList.add('opacity-0');
        setTimeout(() => { if (isPlayerExpanded) expanded.classList.remove('opacity-0', 'pointer-events-none'); }, 200);
        resetCollapseTimer();
    } else {
        collapsePlayerUI();
    }
}

function collapsePlayerUI() {
    const island = document.getElementById('player-island');
    const collapsed = document.getElementById('player-collapsed');
    const expanded = document.getElementById('player-expanded');
    if (!island || !collapsed || !expanded) return;

    isPlayerExpanded = false;
    clearTimeout(playerTimeout);
    expanded.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(() => {
        island.classList.remove('w-48');
        island.classList.add('w-10', 'h-10');
        collapsed.classList.remove('opacity-0');
    }, 100);
}

function resetCollapseTimer() {
    if (playerTimeout) clearTimeout(playerTimeout);
    if (isPlayerExpanded) {
        playerTimeout = setTimeout(() => collapsePlayerUI(), 10000);
    }
}

// 4. Cập nhật Play/Pause (Tắt Live nếu can thiệp thủ công)
function togglePlayMusic() {
    resetCollapseTimer();

    // Nếu bấm pause thủ công -> Tắt chế độ Live
    if (isLiveMode) toggleLiveMode();

    const list = appData.playlist || [];
    if (list.length === 0) return Modal.alert("Playlist trống!");

    const playIcon = document.getElementById('player-play-icon');
    if (!playIcon) return;

    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
        playIcon.className = 'fas fa-play text-[10px] ml-0.5';
    } else {
        if (!audioPlayer.src) playSongAtIndex(0);
        else audioPlayer.play().catch(e => console.log(e));
        isPlaying = true;
        playIcon.className = 'fas fa-pause text-[10px]';
    }
}

// Wrapper Next/Prev (Cũng tắt Live nếu bấm)
function nextSong() {
    if (isLiveMode) toggleLiveMode();
    resetCollapseTimer();
    playSongAtIndex(currentSongIndex + 1);
}
function prevSong() {
    if (isLiveMode) toggleLiveMode();
    resetCollapseTimer();
    playSongAtIndex(currentSongIndex - 1);
}


// 6. Xử lý khi hết bài
// Khi hết bài, nếu đang ở Live Mode thì nó sẽ tự check lại giờ để qua bài mới đúng giờ
audioPlayer.onended = () => {
    if (isLiveMode) {
        syncLiveMusic();
    } else {
        nextSong();
    }
};

// 7. Timer check Live mỗi khi cửa sổ focus lại (để đồng bộ nếu user tab ra ngoài lâu)
window.onfocus = () => {
    if (isLiveMode) syncLiveMusic();
};

async function initApp() {
    renderBackground();

    if (!supabaseClient) { Modal.alert("Lỗi kết nối Supabase!"); return; }

    const { data: { session }, error } = await supabaseClient.auth.getSession();

    if (error) { showLoginScreen(); }
    else if (session) {
        currentUser = session.user;
        document.getElementById('auth-msg').innerText = "Đang khôi phục dữ liệu...";
        try {
            await checkPairingStatus();
            document.getElementById('auth-screen').classList.add('hidden-screen');
        } catch (err) {
            console.error("Restore error:", err);
            document.getElementById('auth-msg').innerText = "Lỗi tải dữ liệu. Vui lòng thử lại.";
            document.getElementById('retry-btn').classList.remove('hidden');
        }
    } else { showLoginScreen(); }

    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && !currentUser && session) {
            currentUser = session.user;
            try {
                await checkPairingStatus();
                document.getElementById('auth-screen').classList.add('hidden-screen');
            } catch (e) { Modal.alert(e.message); }
        } else if (event === 'SIGNED_OUT') { showLoginScreen(); }
    });

    setInterval(updateCountdown, 1000);

    // Audio Listeners
    audioPlayer.addEventListener('ended', nextSong);
}

function showLoginScreen() {
    currentUser = null;
    document.getElementById('auth-screen').classList.remove('hidden-screen');
    document.getElementById('pairing-screen').classList.add('hidden-screen');
    document.getElementById('app-container').classList.add('hidden-screen');
    document.getElementById('auth-msg').innerText = "";
    document.getElementById('retry-btn').classList.add('hidden');
}

function toggleAuthMode() {
    document.getElementById('login-form').classList.toggle('hidden');
    document.getElementById('register-form').classList.toggle('hidden');
}
async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) Modal.alert(error.message);
}
async function handleRegister() {
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const { error } = await supabaseClient.auth.signUp({ email, password });
    if (error) Modal.alert(error.message);
    else Modal.alert("Đăng ký thành công! Hãy đăng nhập.");
}
async function logout() { await supabaseClient.auth.signOut(); location.reload(); }

async function checkPairingStatus() {
    if (!currentUser) throw new Error("No user");
    const { data: profile, error } = await supabaseClient.from('profiles').select('couple_id').eq('id', currentUser.id).single();
    if (error && error.code !== 'PGRST116') throw error;

    if (!profile || !profile.couple_id) {
        document.getElementById('pairing-screen').classList.remove('hidden-screen');
        document.getElementById('app-container').classList.add('hidden-screen');
    } else {
        currentCoupleCode = profile.couple_id;
        document.getElementById('pairing-screen').classList.add('hidden-screen');
        document.getElementById('app-container').classList.remove('hidden-screen');
        document.getElementById('display-couple-code').innerText = currentCoupleCode;
        await loadCloudData();
    }
}

function determineUserIdentity() {
    let changed = false;
    if (!appData.user1.id) { appData.user1.id = currentUser.id; changed = true; }
    else if (appData.user1.id !== currentUser.id && !appData.user2.id) { appData.user2.id = currentUser.id; changed = true; }

    if (appData.user1.id === currentUser.id) myUserIndex = 1;
    else if (appData.user2.id === currentUser.id) myUserIndex = 2;
    else myUserIndex = 0;

    if (changed) saveData();
}

async function createCoupleCode() {
    const code = 'LOVE-' + Math.floor(100000 + Math.random() * 900000);
    const { error } = await supabaseClient.from('couples').insert([{ id: code, data: DEFAULT_DATA }]);
    if (error) return Modal.alert("Lỗi: " + error.message);
    await supabaseClient.from('profiles').upsert({ id: currentUser.id, couple_id: code });
    await checkPairingStatus();
}

async function joinCouple() {
    const code = document.getElementById('join-code-input').value.toUpperCase().trim();
    if (!code) return Modal.alert("Vui lòng nhập mã!");

    // Thêm hiệu ứng loading visual nếu muốn, ở đây giữ logic cũ
    const { data } = await supabaseClient.from('couples').select('id').eq('id', code).single();
    if (!data) return Modal.alert("Mã không tồn tại hoặc sai!");

    await supabaseClient.from('profiles').upsert({ id: currentUser.id, couple_id: code });
    await checkPairingStatus();
}

// Thay thế hàm changeCoupleCode cũ bằng hàm này
async function changeCoupleCode() {
    // 1. Nhập mã mới qua Modal
    const newCodeRaw = await Modal.prompt("Nhập mã cặp đôi MỚI mà bạn muốn đặt (Ví dụ: LOVE-FOREVER):", currentCoupleCode);

    // Nếu bấm Hủy hoặc để trống
    if (newCodeRaw === null || newCodeRaw.trim() === "") return;

    const newCode = newCodeRaw.trim().toUpperCase();

    // Validate cơ bản
    if (newCode === currentCoupleCode) return Modal.alert("Đây là mã hiện tại rồi!");
    if (newCode.length < 2) return Modal.alert("Mã quá ngắn! Hãy nhập ít nhất 2 ký tự.");

    try {
        // 2. Kiểm tra xem mã mới đã có ai dùng chưa
        const { data: existing, error: checkError } = await supabaseClient
            .from('couples')
            .select('id')
            .eq('id', newCode)
            .single();

        // Nếu query không lỗi và tìm thấy dữ liệu => Mã đã tồn tại
        if (existing) {
            return Modal.alert(`Tiếc quá! Mã "${newCode}" đã có cặp đôi khác sử dụng. Vui lòng chọn mã khác.`);
        }

        // 3. Nếu chưa trùng, bắt đầu quy trình chuyển đổi
        // A. Tạo phòng mới với dữ liệu hiện tại (Copy Data)
        const { error: createError } = await supabaseClient
            .from('couples')
            .insert([{ id: newCode, data: appData }]);

        if (createError) throw new Error("Lỗi tạo mã mới: " + createError.message);

        // B. Cập nhật tất cả thành viên (Bạn và Người ấy) đang ở mã cũ sang mã mới
        // Logic: Tìm tất cả profile đang có couple_id là mã cũ, đổi thành mã mới
        const { error: updateProfileError } = await supabaseClient
            .from('profiles')
            .update({ couple_id: newCode })
            .eq('couple_id', currentCoupleCode);

        if (updateProfileError) throw new Error("Lỗi cập nhật thành viên: " + updateProfileError.message);

        // C. (Tùy chọn) Xóa phòng cũ đi cho sạch database
        await supabaseClient.from('couples').delete().eq('id', currentCoupleCode);

        // 4. Thông báo và tải lại
        await Modal.alert(`Thành công! Mã cặp đôi của hai bạn đã đổi thành: ${newCode}`);
        location.reload();

    } catch (err) {
        console.error(err);
        Modal.alert("Có lỗi xảy ra: " + err.message);
    }
}

async function loadCloudData() {
    const { data } = await supabaseClient.from('couples').select('data').eq('id', currentCoupleCode).single();
    if (data && data.data) appData = { ...DEFAULT_DATA, ...data.data };
    determineUserIdentity();
    applyTheme();
    refreshUI();
    initMusicPlayer();
    setupRealtimeListener();
}
async function saveData() {
    if (currentCoupleCode) await supabaseClient.from('couples').update({ data: appData }).eq('id', currentCoupleCode);
    refreshUI();
}
function refreshUI() {
    loadSettingsToUI();
    updateHomePage();
    updateSparksPage();
    updateEventsPage();
    updateDiaryPage();
}

/* --- CẬP NHẬT LOGIC ĐỘ TRONG SUỐT --- */

// 1. Hàm xem trước ngay khi kéo thanh trượt (Real-time Preview)
function updateGlassPreview(val) {
    document.getElementById('opacity-value').innerText = Math.round(val * 100) + '%';
    document.documentElement.style.setProperty('--glass-opacity', val);

    // Nếu chưa có hình nền thì tạm thời thêm class glass-mode để user thấy hiệu ứng
    const container = document.getElementById('app-container');
    if (!container.classList.contains('glass-mode') && document.body.style.backgroundImage) {
        container.classList.add('glass-mode');
    }
}

// 2. Cập nhật hàm applyTheme
function applyTheme() {
    if (!appData.theme) appData.theme = DEFAULT_DATA.theme;

    const color = appData.theme.color || 'pink';
    const font = appData.theme.font || 'Nunito';
    const bg = appData.theme.bg || '';
    // Lấy độ trong suốt (Mặc định 0.2 nếu chưa có)
    const opacity = appData.theme.opacity !== undefined ? appData.theme.opacity : 0.2;

    const palette = THEMES[color];
    const r = document.querySelector(':root');

    Object.keys(palette).forEach(key => r.style.setProperty(`--love-${key}`, palette[key]));
    r.style.setProperty('--app-font', font);

    // Áp dụng độ trong suốt vào biến CSS
    r.style.setProperty('--glass-opacity', opacity);

    const appContainer = document.getElementById('app-container');
    if (bg) {
        document.body.style.backgroundImage = `url('${bg}')`;
        appContainer.classList.add('glass-mode');
        appContainer.style.backgroundColor = '';
        r.style.setProperty('--app-bg', 'transparent');
    } else {
        document.body.style.backgroundImage = 'none';
        appContainer.classList.remove('glass-mode');
        r.style.setProperty('--app-bg', palette[50]);
        appContainer.style.backgroundColor = palette[50];
    }
}

// 3. Cập nhật hàm loadSettingsToUI
function loadSettingsToUI() {
    document.getElementById('set-start-date').value = appData.startDate;
    ['1', '2'].forEach(i => {
        const avatarUrl = appData[`user${i}`].avatar;
        const imgPreview = document.getElementById(`preview-ava-${i}`);
        if (imgPreview && avatarUrl) {
            imgPreview.src = avatarUrl;
        }
    });

    if (appData.theme) {
        document.getElementById('set-font').value = appData.theme.font;
        document.getElementById('set-bg-url').value = appData.theme.bg;

        // Load giá trị slider
        const op = appData.theme.opacity !== undefined ? appData.theme.opacity : 0.2;
        document.getElementById('set-opacity').value = op;
        document.getElementById('opacity-value').innerText = Math.round(op * 100) + '%';
    }
}

// 4. Cập nhật hàm saveSettings
async function saveSettings(btn) {
    if (btn) { btn.disabled = true; btn.innerText = "Đang lưu..."; }

    // Cập nhật cách lấy avatar từ input hidden (id="set-ava-1") thay vì input file cũ
    appData.user1.avatar = document.getElementById('set-ava-1').value || appData.user1.avatar;
    appData.user2.avatar = document.getElementById('set-ava-2').value || appData.user2.avatar;

    appData.startDate = document.getElementById('set-start-date').value;
    ['1', '2'].forEach(i => {
        appData[`user${i}`].name = document.getElementById(`set-name-${i}`).value;
        appData[`user${i}`].dob = document.getElementById(`set-dob-${i}`).value;
        appData[`user${i}`].avatar = document.getElementById(`set-ava-${i}`).value;
    });

    // Lưu thêm opacity
    appData.theme = {
        color: tempThemeColor,
        font: document.getElementById('set-font').value,
        bg: document.getElementById('set-bg-url').value,
        opacity: document.getElementById('set-opacity').value // <--- DÒNG MỚI
    };

    const bgFile = document.getElementById('set-bg-file').files[0];
    if (bgFile) {
        try {
            const url = await uploadToSupabase(bgFile, 'backgrounds');
            appData.theme.bg = url;
            document.getElementById('set-bg-url').value = url;
        } catch (e) { Modal.alert("Lỗi upload nền: " + e.message); }
    }

    applyTheme();
    await saveData();

    if (btn) { btn.disabled = false; btn.innerText = "Lưu Thay Đổi"; }
    Modal.showToast("Đã lưu cài đặt!");
}

function setThemeColor(color) { tempThemeColor = color; Modal.alert(`Đã chọn màu: ${color}. Bấm Lưu để áp dụng.`); }
function clearBackground() {
    // 1. Xóa ô input URL (Chỉ xóa nếu tìm thấy thẻ)
    const urlInput = document.getElementById('set-bg-url');
    if (urlInput) urlInput.value = '';

    // 2. Xóa input file cũ (Dòng này gây lỗi trước đó, giờ ta thêm kiểm tra an toàn)
    const fileInput = document.getElementById('set-bg-file');
    if (fileInput) fileInput.value = '';

    // 3. Cập nhật giao diện ngay lập tức (Preview)
    document.body.style.backgroundImage = 'none';

    // Tắt chế độ kính (Glass Mode)
    const container = document.getElementById('app-container');
    if (container) {
        container.classList.remove('glass-mode');
        container.style.backgroundColor = '';

        // Khôi phục màu nền mặc định (lấy từ theme hiện tại)
        const color = (appData.theme && appData.theme.color) ? appData.theme.color : 'pink';
        const palette = THEMES[color];
        if (palette) {
            document.querySelector(':root').style.setProperty('--app-bg', palette[50]);
            container.style.backgroundColor = palette[50];
        }
    }

    // 4. Thông báo
    Modal.showToast("Đã xóa hình nền tạm thời. Bấm LƯU để áp dụng.");
}

/* --- PREVIEW BACKGROUND --- */
function previewBackground(url) {
    if (!url) return;

    // Đổi hình nền body ngay lập tức
    document.body.style.backgroundImage = `url('${url}')`;

    // Kích hoạt chế độ kính (nếu chưa có)
    const container = document.getElementById('app-container');
    if (!container.classList.contains('glass-mode')) {
        container.classList.add('glass-mode');
        // Reset màu nền cứng để lộ ảnh
        container.style.backgroundColor = '';
        document.querySelector(':root').style.setProperty('--app-bg', 'transparent');
    }
}

function updateHomePage() {
    const now = Date.now();
    ['1', '2'].forEach(i => {
        const u = appData[`user${i}`];
        document.getElementById(`u${i}-name`).innerText = u.name;
        document.getElementById(`u${i}-avatar`).src = u.avatar;
        const bubble = document.getElementById(`status-bubble-${i}`);
        if (u.status && u.status.text && (u.status.duration === -1 || (now - u.status.timestamp <= u.status.duration * 60000))) {
            bubble.classList.remove('hidden');
            document.getElementById(`status-text-${i}`).innerText = u.status.text;
        } else { bubble.classList.add('hidden'); }
    });
    const start = new Date(appData.startDate);
    const diffTime = Math.abs(new Date() - start);
    document.getElementById('total-days').innerText = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let years = new Date().getFullYear() - start.getFullYear();
    let months = new Date().getMonth() - start.getMonth();
    let days = new Date().getDate() - start.getDate();
    if (days < 0) { months--; days += new Date(new Date().getFullYear(), new Date().getMonth(), 0).getDate(); }
    if (months < 0) { years--; months += 12; }
    document.getElementById('count-years').innerText = years;
    document.getElementById('count-months').innerText = months;
    document.getElementById('count-days').innerText = days;

    renderTodos();
}

function toggleCustomTime() { document.getElementById('custom-time-input').classList.toggle('hidden', document.getElementById('status-duration').value !== 'custom'); }
function openStatusModal() { document.getElementById('status-modal').classList.remove('hidden'); }
function saveStatus() {
    const text = document.getElementById('status-input').value;
    let duration = parseInt(document.getElementById('status-duration').value);
    if (isNaN(duration) || document.getElementById('status-duration').value === 'custom') {
        const h = parseInt(document.getElementById('custom-hours').value) || 0;
        const m = parseInt(document.getElementById('custom-minutes').value) || 0;
        duration = (h * 60) + m;
    }
    if (myUserIndex === 0) return Modal.alert("Lỗi xác định người dùng.");
    appData[`user${myUserIndex}`].status = { text, duration, timestamp: Date.now() };
    saveData();
    document.getElementById('status-modal').classList.add('hidden');
    document.getElementById('status-input').value = '';
}

/* --- TODO LOGIC --- */
function toggleTodoForm() { document.getElementById('todo-form').classList.toggle('hidden'); }
function renderTodos() {
    const list = document.getElementById('todo-list');
    list.innerHTML = '';
    const todos = appData.todos || [];

    if (todos.length === 0) { list.innerHTML = '<div class="text-center text-xs text-gray-400 italic">Chưa có mục tiêu nào.</div>'; return; }

    todos.forEach((todo, index) => {
        let timeLeft = '';
        if (todo.deadline && !todo.completed) {
            const diff = Math.ceil((new Date(todo.deadline) - new Date()) / (1000 * 60 * 60 * 24));
            if (diff < 0) timeLeft = '<span class="text-red-500 font-bold ml-2 text-[10px]">Quá hạn</span>';
            else timeLeft = `<span class="text-love-500 font-bold ml-2 text-[10px]">${diff} ngày nữa</span>`;
        }

        const html = `
                    <div class="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 ${todo.completed ? 'opacity-50' : ''}">
                        <button onclick="toggleTodo(${index})" class="text-lg ${todo.completed ? 'text-green-500' : 'text-gray-300'} hover:text-green-500">
                            <i class="${todo.completed ? 'fas fa-check-circle' : 'far fa-circle'}"></i>
                        </button>
                        <div class="flex-grow">
                            <div class="text-sm font-bold text-gray-700 ${todo.completed ? 'line-through' : ''}">${todo.title}</div>
                            ${timeLeft}
                        </div>
                        <button onclick="deleteTodo(${index})" class="text-gray-300 hover:text-red-500 text-xs"><i class="fas fa-trash"></i></button>
                    </div>
                `;
        list.innerHTML += html;
    });
    document.getElementById('todo-count').innerText = todos.length;
}
function addTodo() {
    const title = document.getElementById('todo-input').value;
    const deadline = document.getElementById('todo-deadline').value;
    if (!title) return;
    appData.todos = appData.todos || [];
    appData.todos.push({ title, deadline, completed: false });
    document.getElementById('todo-input').value = '';
    document.getElementById('todo-deadline').value = '';
    toggleTodoForm();
    saveData();
}
function toggleTodo(index) { appData.todos[index].completed = !appData.todos[index].completed; saveData(); }
async function deleteTodo(index) {
    if (await Modal.confirm("Bạn có chắc chắn muốn xóa việc này không?")) {
        appData.todos.splice(index, 1);
        saveData();
    }
}

function updateSparksPage() {
    const count = appData.streak.count;
    document.getElementById('streak-count').innerText = count;
    const fireIcon = document.getElementById('fire-icon');
    const fireGlow = document.getElementById('fire-glow');
    const milestoneText = document.getElementById('streak-milestone');

    fireIcon.className = "fas fa-fire text-8xl drop-shadow-2xl relative z-10 animate-float transition-colors duration-500";
    fireGlow.className = "absolute inset-4 rounded-full animate-pulse opacity-50 animation-delay-500 transition-colors duration-500";

    if (count >= 1000) { fireIcon.classList.add('text-purple-600'); fireGlow.classList.add('bg-purple-200'); milestoneText.innerText = "🔥 ĐẲNG CẤP VĨNH CỬU 🔥"; }
    else if (count >= 365) { fireIcon.classList.add('text-blue-500'); fireGlow.classList.add('bg-blue-200'); milestoneText.innerText = "🔥 1 NĂM RỰC LỬA 🔥"; }
    else if (count >= 200) { fireIcon.classList.add('text-green-500'); fireGlow.classList.add('bg-green-200'); milestoneText.innerText = "🔥 LỬA XANH HY VỌNG 🔥"; }
    else if (count >= 100) { fireIcon.classList.add('text-red-600'); fireGlow.classList.add('bg-red-200'); milestoneText.innerText = "🔥 100 NGÀY NỒNG CHÁY 🔥"; }
    else if (count >= 10) { fireIcon.classList.add('text-yellow-500'); fireGlow.classList.add('bg-yellow-200'); milestoneText.innerText = "🔥 KHỞI ĐẦU ẤM ÁP 🔥"; }
    else { fireIcon.classList.add('text-orange-500'); fireGlow.classList.add('bg-orange-100'); milestoneText.innerText = ""; }

    ['1', '2'].forEach(i => {
        const img = document.getElementById(`spark-u${i}-img`);
        const btn = document.getElementById(`btn-checkin-${i}`);
        const isChecked = appData.streak[`lastDate${i}`] === new Date().toDateString();
        const u = appData[`user${i}`];

        img.src = u.avatar;
        if (isChecked) {
            img.classList.remove('grayscale'); img.classList.add('border-green-500');
            btn.innerText = "Đã điểm danh"; btn.disabled = true;
            btn.className = "w-full py-2.5 rounded-2xl text-xs font-bold bg-green-100 text-green-600";
        } else {
            img.classList.add('grayscale'); img.classList.remove('border-green-500');
            btn.innerText = "Điểm danh";
            if (myUserIndex == i) { btn.disabled = false; btn.className = "w-full py-2.5 rounded-2xl text-xs font-bold bg-gray-800 text-white shadow-md active:scale-95"; }
            else { btn.disabled = true; btn.className = "w-full py-2.5 rounded-2xl text-xs font-bold bg-gray-200 text-gray-400 cursor-not-allowed"; }
        }
    });
    if (appData.streak.lastDate1 === new Date().toDateString() && appData.streak.lastDate2 === new Date().toDateString()) {
        document.getElementById('streak-message').classList.remove('hidden');
    } else { document.getElementById('streak-message').classList.add('hidden'); }
}

function checkIn(i) {
    const today = new Date().toDateString();
    appData.streak[`lastDate${i}`] = today;
    if (appData.streak.lastDate1 === today && appData.streak.lastDate2 === today) appData.streak.count++;
    saveData();
}

/* --- EVENT MODERNIZATION --- */
function getEventColor(id) {
    return GRADIENTS[id % GRADIENTS.length];
}

function updateEventsPage() {
    const list = document.getElementById('events-list');
    if (!list) return;
    list.innerHTML = '';

    if (!appData.events) appData.events = [];

    // --- Xử lý dữ liệu (Giữ nguyên) ---
    const processed = appData.events.map(e => {
        const originalDate = new Date(e.date);
        const nextDate = getNextDate(e.date, e.recur);
        let diff = nextDate - new Date();
        if (diff < 0 && new Date().getDate() == nextDate.getDate()) diff = 0;

        let repeatInfo = "";
        if (e.recur === 'year') {
            const years = nextDate.getFullYear() - originalDate.getFullYear();
            if (years > 0) repeatInfo = `(Lần thứ ${years})`;
        } else if (e.recur === 'month') {
            const months = (nextDate.getFullYear() - originalDate.getFullYear()) * 12 + (nextDate.getMonth() - originalDate.getMonth());
            if (months > 0) repeatInfo = `(Tháng thứ ${months})`;
        }

        return { ...e, nextDate, diff, repeatInfo };
    }).sort((a, b) => {
        if (a.diff >= 0 && b.diff >= 0) return a.diff - b.diff;
        if (a.diff < 0 && b.diff < 0) return b.diff - a.diff;
        return a.diff >= 0 ? -1 : 1;
    });

    if (processed.length === 0) {
        list.innerHTML = '<div class="text-center text-gray-400 mt-10 text-xs">Chưa có sự kiện nào.</div>';
        return;
    }

    const mainEvent = processed[0];
    const subEvents = processed.slice(1);

    // --- RENDER MAIN EVENT ---
    if (mainEvent) {
        const e = mainEvent;
        const dateStr = e.nextDate.toLocaleDateString('vi-VN');
        const diffMs = e.nextDate - new Date();
        const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const isToday = new Date().toDateString() === e.nextDate.toDateString();
        let timeLeftStr = isToday ? "ĐANG DIỄN RA" : (daysLeft < 0 ? "Đã qua" : `${daysLeft} NGÀY NỮA`);

        let cardStyle = "";
        let overlay = "";
        if (e.bg) {
            cardStyle = `background: url('${e.bg}'); background-size: cover; background-position: center;`;
            overlay = '<div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>';
        } else {
            overlay = `<div class="absolute inset-0 bg-gradient-to-br from-love-400 to-orange-400"></div>`;
        }

        const mainHtml = `
            <div class="relative overflow-hidden rounded-[1.5rem] shadow-xl shadow-love-200/50 h-44 w-full group transform transition hover:scale-[1.01] cursor-pointer mb-6" 
                 onclick="editEvent('${e.id}')">
                <div class="absolute inset-0" style="${cardStyle}">${overlay}</div>
                <div class="absolute top-4 right-4 z-20">
                    <span class="bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">${timeLeftStr}</span>
                </div>
                <div class="absolute bottom-0 left-0 w-full p-6 z-20">
                    <h2 class="text-3xl font-black text-white font-script mb-1 drop-shadow-md leading-tight">
                        ${e.name} 
                        <span class="text-lg font-normal opacity-80 block sm:inline">${e.repeatInfo}</span>
                    </h2>
                    <p class="text-white/90 text-sm font-bold flex items-center gap-2"><i class="far fa-clock"></i> ${dateStr}</p>
                </div>
            </div>
        `;
        list.innerHTML += mainHtml;
    }

    // --- RENDER SUB EVENTS (CẬP NHẬT ONCLICK CÓ EVENT) ---
    subEvents.forEach(e => {
        const dateStr = e.nextDate.toLocaleDateString('vi-VN');
        const diffMs = e.nextDate - new Date();
        const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const isToday = new Date().toDateString() === e.nextDate.toDateString();

        let cardStyle = "";
        let overlay = "";
        if (e.bg) {
            cardStyle = `background: url('${e.bg}'); background-size: cover; background-position: center;`;
            overlay = '<div class="absolute inset-0 bg-black/50"></div>';
        } else {
            overlay = `<div class="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-90"></div>`;
        }

        const html = `
            <div class="relative w-full h-20 rounded-[1.5rem] overflow-hidden mb-3 shadow-sm select-none">
                
                <div class="absolute inset-y-0 right-0 w-[120px] flex">
                    <button onclick="editEvent('${e.id}')" class="w-1/2 h-full bg-blue-50 text-blue-600 flex flex-col items-center justify-center hover:bg-blue-100 active:bg-blue-200 transition border-l border-white/50">
                        <i class="fas fa-pen mb-1"></i> <span class="text-[10px] font-bold">Sửa</span>
                    </button>
                    <button onclick="deleteEvent('${e.id}')" class="w-1/2 h-full bg-red-50 text-red-500 flex flex-col items-center justify-center hover:bg-red-100 active:bg-red-200 transition border-l border-white/50">
                        <i class="fas fa-trash mb-1"></i> <span class="text-[10px] font-bold">Xóa</span>
                    </button>
                </div>

                <div id="event-content-${e.id}" 
                     class="event-content-slide absolute inset-0 z-10 w-full h-full cursor-pointer transition-transform duration-300 ease-out"
                     onclick="toggleEventActions(event, '${e.id}')">
                     
                     <div class="absolute inset-0 z-0" style="${cardStyle}">${overlay}</div>
                     
                     <div class="relative z-10 flex justify-between items-center w-full h-full px-3">
                        <div class="flex flex-col items-start overflow-hidden w-2/3">
                            <span class="font-bold text-left text-white text-base truncate w-full">
                                ${e.name} 
                            </span>
                            <span class="text-xs text-white/80">${dateStr} <span class="text-xs opacity-75 font-normal">${e.repeatInfo}</span></span>
                            
                        </div>
                        <div class="flex flex-col items-center min-w-[54px]  glass-card-special bg-white/60 rounded-2xl p-2  text-center shadow-lg shadow-love-100/20 border border-white/40  rounded-2xl">
                            <p class="text-xl font-black text-white h-[20px]">${isToday ? '0' : daysLeft}</p>
                            <p class="text-[10px] text-white/80 font-medium">ngày</p>
                        </div>
                        
                        <div class="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-30">
                            <i class="fas fa-ellipsis-v text-white text-xs"></i>
                        </div>
                     </div>
                </div>
            </div>
        `;
        list.innerHTML += html;
    });
}

/* --- LOGIC HIỂN THỊ NÚT SỬA/XÓA (TAP TO REVEAL) --- */
/* --- HÀM TOGGLE (CẬP NHẬT) --- */
function toggleEventActions(event, id) {
    // NGĂN CHẶN SỰ KIỆN NỔI BỌT (Quan trọng)
    // Để cú click này không kích hoạt sự kiện đóng của document
    if (event) event.stopPropagation();

    const element = document.getElementById(`event-content-${id}`);
    if (!element) return;

    // Kiểm tra xem hiện tại nó đang mở hay đóng
    const isOpened = element.classList.contains('translate-x-[-120px]');

    // Bước 1: Đóng tất cả các cái khác lại cho gọn
    closeAllEventActions();

    // Bước 2: Nếu cái mình vừa bấm chưa mở -> Thì mở nó ra
    if (!isOpened) {
        element.classList.add('translate-x-[-120px]');
        element.style.transform = 'translateX(-120px)';
    }
    // (Nếu nó đang mở rồi thì Bước 1 đã đóng nó lại -> Kết quả là Đóng. Đúng ý muốn)
}
function toggleEventForm() {
    const form = document.getElementById('event-form');
    if (!form) return;

    form.classList.toggle('hidden');

    // Nếu đang mở form -> Reset toàn bộ dữ liệu về rỗng
    if (!form.classList.contains('hidden')) {

        // 1. Reset các Input (Dùng đúng ID trong HTML bạn gửi)
        const idInput = document.getElementById('event-id');
        const titleInput = document.getElementById('event-title'); // Đã sửa từ event-name thành event-title
        const dateInput = document.getElementById('event-date');
        const bgInput = document.getElementById('event-bg');
        const recurInput = document.getElementById('event-recur');

        // 2. Reset Tiêu đề Form & Nút Lưu (đề phòng trường hợp vừa Sửa xong)
        const formTitle = document.getElementById('event-form-title');
        const saveBtn = document.getElementById('btn-save-event');

        // Thực hiện xóa an toàn
        if (idInput) idInput.value = ''; // Xóa ID để thành chế độ "Thêm mới"
        if (titleInput) titleInput.value = '';
        if (dateInput) dateInput.value = '';
        if (bgInput) bgInput.value = '';
        if (recurInput) recurInput.value = 'none'; // Mặc định là không lặp lại

        if (formTitle) formTitle.innerText = "Sự kiện mới";
        if (saveBtn) saveBtn.innerText = "Lưu";

        // 3. Focus vào ô nhập tên
        if (titleInput) titleInput.focus();
    }
}
/* --- LOGIC TỰ ĐỘNG ĐÓNG KHI BẤM RA NGOÀI --- */

// 1. Hàm phụ: Đóng tất cả các sự kiện đang mở
function closeAllEventActions() {
    document.querySelectorAll('.event-content-slide').forEach(el => {
        el.classList.remove('translate-x-[-120px]');
        el.style.transform = 'translateX(0)';
    });
}

// 2. Sự kiện toàn màn hình: Hễ bấm vào đâu cũng gọi hàm đóng
document.addEventListener('click', function (e) {
    // Logic: Khi bấm vào màn hình, ta mặc định đóng hết các menu đang mở.
    // (Trừ khi bấm vào chính cái sự kiện đó - sẽ được xử lý riêng ở hàm toggleEventActions nhờ stopPropagation)
    closeAllEventActions();
});

async function saveEvent(btn) {
    // 1. Lấy dữ liệu từ form (Lưu ý: event-bg bây giờ là ô nhập link, không phải file)
    const titleInput = document.getElementById('event-title');
    const dateInput = document.getElementById('event-date');
    const bgInput = document.getElementById('event-bg'); // Ô chứa Link ảnh
    const recurInput = document.getElementById('event-recur');
    const idInput = document.getElementById('event-id');

    // Kiểm tra an toàn (đề phòng HTML bị đổi tên ID)
    if (!titleInput || !dateInput) return console.error("Thiếu thẻ input trong HTML");

    const title = titleInput.value;
    const date = dateInput.value;
    const bg = bgInput ? bgInput.value : ''; // Lấy chuỗi URL text
    const recur = recurInput ? recurInput.value : 'none';
    const eventId = idInput ? idInput.value : '';

    if (!title || !date) return Modal.alert("Vui lòng nhập tên và ngày sự kiện!");

    // 2. UI Loading
    if (btn) {
        btn.disabled = true;
        btn.innerText = "Đang lưu...";
    }

    try {
        // 3. Tạo object sự kiện
        const newEvent = {
            id: eventId || Date.now().toString(),
            name: title,
            date: date,
            bg: bg, // Lưu thẳng URL
            recur: recur
        };

        // 4. Cập nhật vào mảng dữ liệu chung
        if (!appData.events) appData.events = [];

        if (eventId) {
            // Sửa sự kiện cũ
            const index = appData.events.findIndex(e => e.id === eventId);
            if (index !== -1) appData.events[index] = newEvent;
        } else {
            // Thêm mới
            appData.events.push(newEvent);
        }

        // Sắp xếp lại theo thời gian
        appData.events.sort((a, b) => new Date(a.date) - new Date(b.date));

        // 5. Lưu lên Cloud
        await saveData();

        // 6. Làm mới giao diện
        updateEventsPage();     // Vẽ lại list sự kiện
        toggleEventForm();      // Đóng form
        refreshUI();            // Update đếm ngược ở trang chủ

        Modal.showToast(eventId ? "Đã cập nhật sự kiện!" : "Đã thêm sự kiện mới!");

    } catch (err) {
        console.error(err);
        Modal.alert("Lỗi khi lưu: " + err.message);
    } finally {
        // Reset nút
        if (btn) {
            btn.disabled = false;
            btn.innerText = "Lưu";
        }
    }
}

function editEvent(id) {
    // Tìm sự kiện trong danh sách
    const e = appData.events.find(ev => ev.id == id);
    if (!e) return;

    // Gán dữ liệu vào các ô input trong Modal
    document.getElementById('event-id').value = e.id;

    // --- SỬA LỖI Ở ĐÂY: Dùng e.name thay vì e.title ---
    document.getElementById('event-title').value = e.name;

    document.getElementById('event-date').value = e.date;
    document.getElementById('event-recur').value = e.recur;
    document.getElementById('event-bg').value = e.bg || '';

    // Đổi tiêu đề Modal và hiện Modal
    const formTitle = document.getElementById('event-form-title');
    if (formTitle) formTitle.innerText = 'Chỉnh sửa sự kiện';

    // Mở form (Giả sử bạn dùng hàm toggle hoặc classList)
    document.getElementById('event-form').classList.remove('hidden');
}
async function deleteEvent(id) {
    if (await Modal.confirm("Bạn có chắc muốn xóa sự kiện này?")) {
        appData.events = appData.events.filter(e => e.id != id);
        saveData();
    }
}

/* --- UPDATE DIARY PAGE (CÓ NÚT TẢI VỀ & HỖ TRỢ FILE) --- */
/* --- UPDATE DIARY PAGE (CẬP NHẬT AUDIO PLAYER) --- */
function updateDiaryPage() {
    const currentUser = appData[`user${myUserIndex}`];
    if (!currentUser) return;

    const avatarImg = document.getElementById('diary-avatar');
    if (avatarImg) avatarImg.src = currentUser.avatar || '/Asset/logo/iconApps.png';

    const feed = document.getElementById('diary-feed');
    if (!feed) return;
    feed.innerHTML = '';

    const authorFilter = document.getElementById('filter-author')?.value || 'all';

    const posts = (appData.diary || [])
        .filter(post => {
            if (authorFilter === 'me' && String(post.authorId) !== String(currentUser.id)) return false;
            if (authorFilter === 'partner' && String(post.authorId) === String(currentUser.id)) return false;
            return true;
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (posts.length === 0) {
        feed.innerHTML = '<div class="text-center text-gray-400 mt-10 text-xs">Dòng thời gian trống...</div>';
        return;
    }

    posts.forEach(post => {
        const isMine = String(post.authorId) === String(currentUser.id);
        let author = appData.user1.id === post.authorId ? appData.user1 : (appData.user2.id === post.authorId ? appData.user2 : appData.user1);

        const dateObj = new Date(post.date);
        const dateStr = dateObj.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
        const timeStr = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

        // --- XỬ LÝ MEDIA (CÓ AUDIO) ---
        let mediaHtml = '';
        if (post.media && post.media.length > 0) {
            // Phân loại
            const visualMedia = post.media.filter(m => m.type === 'image' || m.type === 'video');
            const audioMedia = post.media.filter(m => m.type === 'audio'); // <--- MỚI
            const fileMedia = post.media.filter(m => m.type !== 'image' && m.type !== 'video' && m.type !== 'audio');

            // 1. Render Ảnh/Video (Grid) - GIỮ NGUYÊN
            if (visualMedia.length > 0) {
                const gridClass = visualMedia.length === 1 ? 'grid-cols-1' : 'grid-cols-2';
                mediaHtml += `<div class="grid ${gridClass} gap-1 mt-3 rounded-2xl overflow-hidden bg-black/5">`;

                visualMedia.forEach((m, idx) => {
                    const style = `max-height: 300px; width: 100%; object-fit: cover;`;
                    // Nút Download
                    const downloadBtn = `
                        <button onclick="downloadFile('${m.url}', '${m.type}')" class="w-8 h-8 rounded-full bg-black/50 hover:bg-green-500 backdrop-blur-sm text-white text-xs flex items-center justify-center shadow-sm border border-white/20 transition-transform active:scale-95" title="Tải về">
                            <i class="fas fa-download"></i>
                        </button>
                    `;

                    if (m.type === 'video') {
                        mediaHtml += `
                            <div class="relative video-container group rounded-lg overflow-hidden mt-1">
                                <video id="vid-${post.id}-${idx}" src="${m.url}" class="w-full bg-black" style="${style}" loop playsinline></video>
                                <div class="absolute top-2 right-2 flex gap-2 z-20">
                                    ${downloadBtn}
                                    <button onclick="toggleVideo('vid-${post.id}-${idx}', this)" class="w-8 h-8 rounded-full bg-black/50 hover:bg-love-500 backdrop-blur-sm text-white text-xs flex items-center justify-center shadow-sm border border-white/20 transition-transform active:scale-95">
                                        <i class="fas fa-play ml-0.5"></i>
                                    </button>
                                    <button onclick="openLightbox('${m.url}', 'video')" class="w-8 h-8 rounded-full bg-black/50 hover:bg-blue-500 backdrop-blur-sm text-white text-xs flex items-center justify-center shadow-sm border border-white/20 transition-transform active:scale-95">
                                        <i class="fas fa-expand"></i>
                                    </button>
                                </div>
                            </div>`;
                    } else {
                        mediaHtml += `
                            <div class="relative group">
                                <img src="${m.url}" style="${style}" class="cursor-pointer hover:opacity-90" onclick="openLightbox('${m.url}', 'image')">
                                <div class="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                    ${downloadBtn}
                                </div>
                            </div>`;
                    }
                });
                mediaHtml += `</div>`;
            }

            // 2. Render AUDIO (MỚI THÊM)
            if (audioMedia.length > 0) {
                mediaHtml += `<div class="mt-2 space-y-2">`;
                audioMedia.forEach(a => {
                    mediaHtml += `
                        <div class="bg-purple-50 p-2 rounded-xl border border-purple-100 flex items-center gap-2">
                            <div class="w-8 h-8 rounded-full bg-purple-200 text-purple-600 flex items-center justify-center flex-shrink-0">
                                <i class="fas fa-music text-xs"></i>
                            </div>
                            <audio src="${a.url}" controls class="w-full h-8" style="outline:none;"></audio>
                        </div>
                    `;
                });
                mediaHtml += `</div>`;
            }

            // 3. Render File (List) - GIỮ NGUYÊN
            if (fileMedia.length > 0) {
                mediaHtml += `<div class="mt-2 space-y-2">`;
                fileMedia.forEach(f => {
                    const fileName = f.name || 'Tập tin đính kèm';
                    mediaHtml += `
                        <div class="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100 hover:bg-gray-100 transition">
                            <div class="flex items-center gap-3 overflow-hidden">
                                <div class="w-10 h-10 rounded-lg bg-blue-100 text-blue-500 flex items-center justify-center flex-shrink-0">
                                    <i class="fas fa-file-alt text-lg"></i>
                                </div>
                                <div class="flex flex-col overflow-hidden">
                                    <span class="text-sm font-bold text-gray-700 truncate">${fileName}</span>
                                    <span class="text-[10px] text-gray-400 uppercase">File</span>
                                </div>
                            </div>
                            <button onclick="downloadFile('${f.url}', 'file')" class="w-8 h-8 rounded-full bg-white text-gray-500 hover:text-green-500 border border-gray-200 flex items-center justify-center shadow-sm active:scale-95">
                                <i class="fas fa-download"></i>
                            </button>
                        </div>
                    `;
                });
                mediaHtml += `</div>`;
            }
        }

        const likes = post.likes || [];
        const isLiked = likes.includes(currentUser.id);

        let commentsHtml = '';
        if (post.comments && post.comments.length > 0) {
            commentsHtml = `<div class="mt-3 space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-100">`;
            commentsHtml += post.comments.map((c, index) => {
                const cName = c.userName || c.name || 'Người dùng';
                const safeText = (c.text || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
                return `
                <div class="text-xs group flex items-start gap-1 cursor-pointer hover:bg-gray-100 p-1 rounded transition" 
                     onclick="openCommentOptions('${post.id}', ${index}, '${safeText}')">
                    <span class="font-bold text-gray-700 whitespace-nowrap">${cName}:</span> 
                    <span class="text-gray-600 leading-snug">${c.text}</span>
                    ${c.edited ? '<span class="text-[8px] text-gray-400 italic ml-1">(đã sửa)</span>' : ''}
                </div>`;
            }).join('');
            commentsHtml += `</div>`;
        }


        const html = `
            <div class="relative pl-4 pb-8 timeline-item"> 
                <div class="timeline-line"></div>
                <div class="absolute overflow-hidden left-0 top-0 w-8 h-8 bg-love-500 rounded-full border-2 border-white shadow z-10">
                    <img class="w-full h-full object-cover" src="${author.avatar || '/Asset/logo/iconApps.png'}">
                </div>
                <div class="bg-white p-4 rounded-3xl rounded-tl-none shadow-sm border border-gray-100 relative">
                    <div class="flex justify-between items-start mb-2">
                        <div class="flex items-center">
                            <span class="font-bold text-sm text-gray-800 mr-2">${author.name}</span>
                            <span class="text-[10px] text-gray-400">${dateStr} lúc ${timeStr}</span>
                        </div>
                        ${isMine ? `
                        <div class="flex gap-2">
                            <button onclick="editPost('${post.id}')" class="text-gray-300 hover:text-blue-500 text-xs w-6 h-6 flex items-center justify-center rounded-full hover:bg-blue-50 transition"><i class="fas fa-pen"></i></button>
                            <button onclick="deletePost('${post.id}')" class="text-gray-300 hover:text-red-500 text-xs w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50 transition"><i class="fas fa-trash"></i></button>
                        </div>` : ''}
                    </div>
                    <p class="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">${post.content}</p>
                    
                    ${mediaHtml}
                    
                    <div class="flex gap-4 mt-3 pt-2 border-t border-gray-50 mb-2">
                        <button onclick="toggleLike('${post.id}')" class="${isLiked ? 'text-red-500' : 'text-gray-400'} hover:text-red-500 text-xs flex items-center gap-1 transition">
                            <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i> <span class="font-bold">${likes.length}</span>
                        </button>
                        <span class="text-gray-400 text-xs flex items-center gap-1">
                            <i class="far fa-comment"></i> <span class="font-bold">${post.comments?.length || 0}</span>
                        </span>
                    </div>
                    ${commentsHtml}
                    <div class="flex gap-2 mt-3 items-center">
                        <img src="${currentUser.avatar || '/Asset/logo/iconApps.png'}" class="w-6 h-6 rounded-full object-cover border border-gray-100">
                        <div class="flex-1 relative">
                            <input type="text" id="comment-input-${post.id}" class="w-full bg-gray-50 rounded-full pl-3 pr-10 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-love-200 border border-transparent transition" placeholder="Viết bình luận..." onkeypress="if(event.key === 'Enter') addComment('${post.id}')">
                            <button onclick="addComment('${post.id}')" class="absolute right-1 top-1 h-7 w-7 bg-love-500 text-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition active:scale-95"><i class="fas fa-paper-plane text-[10px]"></i></button>
                        </div>
                    </div>
                </div>
            </div>`;
        feed.innerHTML += html;

    });
}

/* --- HÀM TẢI FILE --- */
async function downloadFile(url, type) {
    try {
        Modal.showToast("Đang bắt đầu tải...");

        // Dùng fetch để lấy blob (tránh việc trình duyệt tự mở tab mới)
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = blobUrl;

        // Đặt tên file (lấy từ URL hoặc đặt mặc định)
        const fileName = url.split('/').pop().split('?')[0] || `download.${type === 'image' ? 'jpg' : 'file'}`;
        a.download = fileName;

        document.body.appendChild(a);
        a.click();

        // Dọn dẹp
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);

    } catch (e) {
        // Fallback: Nếu fetch lỗi (do CORS), mở tab mới
        window.open(url, '_blank');
    }
}

/* --- LIGHTBOX (CÓ DỪNG VIDEO BÊN NGOÀI) --- */
function openLightbox(url, type) {
    // 1. Dừng tất cả video đang phát ở trang chính
    const allVideos = document.querySelectorAll('video');
    allVideos.forEach(v => {
        if (!v.paused) {
            v.pause();
            // Reset icon Play ở giao diện bài viết
            const parent = v.parentElement;
            const icon = parent.querySelector('.fa-pause');
            if (icon) icon.className = 'fas fa-play ml-0.5';
        }
    });

    // 2. Mở Lightbox như bình thường
    const box = document.getElementById('lightbox');
    const content = document.getElementById('lightbox-content');

    box.classList.remove('hidden');
    box.classList.remove('opacity-0', 'pointer-events-none');

    if (type === 'video') {
        content.innerHTML = `<video src="${url}" controls autoplay class="max-w-[95vw] max-h-[85vh] rounded-lg shadow-2xl bg-black"></video>`;
    } else {
        content.innerHTML = `<img src="${url}" class="max-w-[95vw] max-h-[85vh] rounded-lg shadow-2xl object-contain select-none" draggable="false">`;
    }
}

let selectedComment = { postId: null, commentIndex: null, text: null };

// 1. Mở Menu Tùy Chọn
function openCommentOptions(postId, index, currentText) {
    // Lưu dữ liệu vào biến toàn cục
    selectedComment = {
        postId: String(postId),
        commentIndex: parseInt(index),
        text: currentText
    };

    const modal = document.getElementById('comment-options-modal');
    if (modal) modal.classList.remove('hidden');
}

// 2. Đóng Menu Tùy Chọn (QUAN TRỌNG: CHỈ ẨN MODAL, KHÔNG XÓA DỮ LIỆU)
function closeCommentOptions() {
    const modal = document.getElementById('comment-options-modal');
    if (modal) modal.classList.add('hidden');

    // KHÔNG reset selectedComment ở đây nữa, vì nếu người dùng chọn "Sửa", 
    // chúng ta vẫn cần giữ dữ liệu này cho bước tiếp theo.
}

// 3. Hàm Reset dữ liệu (Chỉ gọi khi Hủy hẳn hoặc đã xong việc)
function resetSelection() {
    selectedComment = { postId: null, commentIndex: null, text: null };
}

// 4. Xử lý XÓA
async function triggerDeleteComment() {
    closeCommentOptions(); // Đóng menu trước cho gọn

    const { postId, commentIndex } = selectedComment;

    if (!postId || isNaN(commentIndex)) {
        resetSelection(); // Lỗi dữ liệu thì reset luôn
        return;
    }

    if (await Modal.confirm("Bạn chắc chắn muốn xóa bình luận này?")) {
        const post = (appData.diary || []).find(p => String(p.id) === postId);

        if (post && post.comments) {
            post.comments.splice(commentIndex, 1);
            await saveData();
            updateDiaryPage();
            Modal.showToast("Đã xóa bình luận.");
        }
    }

    resetSelection(); // Xong việc -> Xóa dữ liệu tạm
}

// 5. Xử lý SỬA (Chuyển sang Modal nhập liệu)
function triggerEditComment() {
    closeCommentOptions(); // Đóng menu chọn (nhưng dữ liệu vẫn còn trong selectedComment)

    const { text } = selectedComment;
    const editModal = document.getElementById('edit-comment-modal');
    const input = document.getElementById('edit-comment-input');

    if (editModal && input) {
        input.value = text; // Điền text cũ vào
        editModal.classList.remove('hidden');
        setTimeout(() => input.focus(), 100);
    } else {
        resetSelection(); // Lỗi UI -> Reset
    }
}

// 6. Đóng Modal Sửa (Hủy bỏ)
function closeEditCommentModal() {
    document.getElementById('edit-comment-modal').classList.add('hidden');
    resetSelection(); // Hủy sửa -> Xóa dữ liệu tạm
}

// 7. LƯU BÌNH LUẬN ĐÃ SỬA
async function saveEditedComment() {
    const newText = document.getElementById('edit-comment-input').value.trim();
    const { postId, commentIndex } = selectedComment; // Lấy lại dữ liệu đã lưu

    // Debug để kiểm tra (bạn có thể xóa dòng này sau khi chạy ok)
    console.log("Saving...", { postId, commentIndex, newText });

    if (!newText) return Modal.alert("Nội dung không được để trống!");
    if (!postId || isNaN(commentIndex)) return Modal.alert("Lỗi mất dữ liệu. Vui lòng thử lại.");

    const post = (appData.diary || []).find(p => String(p.id) === postId);

    if (post && post.comments && post.comments[commentIndex] !== undefined) {
        post.comments[commentIndex].text = newText;
        post.comments[commentIndex].edited = true;

        await saveData();
        updateDiaryPage();

        // Ẩn modal thủ công (không gọi closeEditCommentModal để tránh reset trước khi toast)
        document.getElementById('edit-comment-modal').classList.add('hidden');
        resetSelection(); // Xong việc -> Reset

        Modal.showToast("Đã cập nhật bình luận.");
    } else {
        Modal.alert("Lỗi: Không tìm thấy bình luận gốc.");
        resetSelection();
    }
}
// 4. Cập nhật hàm refreshPostDetail (Hoặc hàm render comments của bạn)
// Bạn cần thay thế hàm render comments cũ bằng logic này để gắn onclick
function renderPostComments(post) {
    const container = document.getElementById('post-comments-list'); // ID của div chứa list comment
    if (!container) return;

    container.innerHTML = '';

    if (!post.comments || post.comments.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-400 text-xs italic py-4">Chưa có bình luận nào. Hãy là người đầu tiên!</p>';
        return;
    }

    post.comments.forEach(c => {
        // Tìm thông tin người comment
        const user = (appData.user1.name === c.userName) ? appData.user1 :
            (appData.user2.name === c.userName) ? appData.user2 : { avatar: '', name: c.userName };

        const div = document.createElement('div');
        div.className = "flex gap-3 mb-4 animate-slide-up group";

        // Avatar
        div.innerHTML = `
            <img src="${user.avatar || '/Asset/logo/iconApps.png'}" class="w-8 h-8 rounded-full object-cover border border-gray-100 flex-shrink-0">
            <div class="flex flex-col items-start max-w-[85%]">
                <div class="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-2 relative cursor-pointer active:bg-gray-200 transition"
                     onclick="openCommentOptions('${post.id}', '${c.id}', '${c.text.replace(/'/g, "\\'")}')">
                    <span class="text-[10px] font-bold text-gray-500 block mb-0.5">${c.userName}</span>
                    <p class="text-sm text-gray-800 leading-relaxed">${c.text}</p>
                    ${c.edited ? '<span class="text-[8px] text-gray-400 italic absolute right-2 bottom-1">(đã sửa)</span>' : ''}
                </div>
                <span class="text-[10px] text-gray-400 mt-1 ml-2">${new Date(c.time).toLocaleString('vi-VN')}</span>
            </div>
        `;
        container.appendChild(div);
    });
}

// Hàm mới: Tự động kiểm tra đang chạy hay dừng để xử lý
function toggleVideo(id, btn) {
    const video = document.getElementById(id);
    const icon = btn.querySelector('i');

    if (video.paused) {
        // Nếu đang dừng -> Chạy
        video.play();
        // Đổi icon thành Pause (2 vạch)
        icon.className = 'fas fa-pause';
        // Xóa margin-left (ml-0.5) vì icon pause nó cân đối sẵn rồi, chỉ icon play mới cần chỉnh
    } else {
        // Nếu đang chạy -> Dừng
        video.pause();
        // Đổi lại icon Play (Tam giác)
        icon.className = 'fas fa-play ml-0.5';
    }
}

// ... [Common utility functions kept same: playVideo(for feed), openLightbox, etc.] ...
function playVideo(id) { document.getElementById(id).play(); }
/* --- LIGHTBOX (PHÓNG TO ẢNH/VIDEO) --- */
/* --- LIGHTBOX (HỆ THỐNG PHÓNG TO & XỬ LÝ VIDEO THÔNG MINH) --- */

function openLightbox(url, type) {
    // 1. XỬ LÝ DỪNG VIDEO BÊN NGOÀI (AUTO-PAUSE)
    // Lấy tất cả video đang nằm trong dòng thời gian (feed)
    const feedVideos = document.querySelectorAll('#diary-feed video');

    feedVideos.forEach(video => {
        // Nếu video nào đang chạy thì bắt buộc dừng lại
        if (!video.paused) {
            video.pause();

            // QUAN TRỌNG: Phải đổi icon nút bấm từ "Pause" (⏸) về "Play" (▶)
            // Tìm container cha chứa cả video và nút bấm
            const container = video.closest('.video-container');
            if (container) {
                // Tìm thẻ <i> đang có class pause
                const icon = container.querySelector('.fa-pause');
                if (icon) {
                    icon.className = 'fas fa-play ml-0.5'; // Trả về icon Play
                }
            }
        }
    });

    // 2. MỞ LIGHTBOX
    const box = document.getElementById('lightbox');
    const content = document.getElementById('lightbox-content');

    // Hiển thị modal
    box.classList.remove('hidden');
    // Xóa class ẩn (để chạy animation opacity)
    setTimeout(() => {
        box.classList.remove('opacity-0', 'pointer-events-none');
    }, 10);

    // 3. RENDER NỘI DUNG VÀO LIGHTBOX
    if (type === 'video') {
        // Video trong lightbox sẽ tự động chạy (autoplay)
        content.innerHTML = `<video src="${url}" controls autoplay class="max-w-[95vw] max-h-[85vh] rounded-lg shadow-2xl bg-black outline-none"></video>`;
    } else {
        content.innerHTML = `<img src="${url}" class="max-w-[95vw] max-h-[85vh] rounded-lg shadow-2xl object-contain select-none" draggable="false">`;
    }
}

function closeLightbox() {
    const box = document.getElementById('lightbox');

    // 1. Ẩn modal (Thêm hiệu ứng mờ dần)
    box.classList.add('opacity-0', 'pointer-events-none');

    // 2. QUAN TRỌNG: Dừng ngay video trong lightbox (nếu có)
    const lightboxVideo = box.querySelector('video');
    if (lightboxVideo) {
        lightboxVideo.pause();
        lightboxVideo.src = ""; // Xóa nguồn để dừng tải dữ liệu
    }

    // 3. Đợi animation chạy xong (300ms) rồi mới ẩn hẳn
    setTimeout(() => {
        box.classList.add('hidden');
        document.getElementById('lightbox-content').innerHTML = '';
    }, 300);
}

function editPost(id) {
    // 1. Tìm bài viết an toàn (So sánh dạng Chuỗi)
    const post = (appData.diary || []).find(p => String(p.id) === String(id));

    // 2. Kiểm tra nếu không tìm thấy
    if (!post) {
        console.error("Không tìm thấy bài viết ID:", id);
        return Modal.alert("Lỗi: Không tìm thấy dữ liệu bài viết này.");
    }

    // 3. Đưa nội dung lên ô nhập liệu
    const input = document.getElementById('diary-content') || document.getElementById('diary-input'); // Kiểm tra đúng ID ô nhập của bạn
    if (input) {
        input.value = post.content;
        input.focus();

        // Cuộn lên đầu trang để người dùng thấy ô nhập
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // 4. Đánh dấu là đang sửa
    editingDiaryId = post.id;

    // 5. Đổi tên nút Đăng -> Lưu (Nếu có ID nút)
    const btn = document.getElementById('btn-post-diary');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-save"></i> Lưu sửa đổi';
        btn.classList.add('bg-yellow-500'); // Đổi màu để gây chú ý
        btn.classList.remove('bg-love-500');
    }
}
function cancelEdit() {
    document.getElementById('diary-content').value = '';
    document.getElementById('edit-post-id').value = '';
    document.getElementById('btn-post').innerText = "Đăng";
    document.getElementById('btn-cancel-edit').classList.add('hidden');
}

/* --- XỬ LÝ CHỌN FILE (HỖ TRỢ MỌI ĐỊNH DẠNG) --- */
/* --- XỬ LÝ CHỌN FILE (HỖ TRỢ AUDIO + FILE + ẢNH/VIDEO) --- */
let tempDiaryMedia = [];
let editingDiaryId = null;

async function handleFileSelect(input) {
    const label = document.getElementById('file-count');
    const files = input.files;

    if (!files || files.length === 0) return;

    // Loading UI
    label.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải lên...';
    label.classList.add('text-love-500', 'font-bold');

    try {
        for (const file of files) {
            // 1. Xác định loại file
            let type = 'file';
            if (file.type.startsWith('image')) type = 'image';
            else if (file.type.startsWith('video')) type = 'video';
            else if (file.type.startsWith('audio')) type = 'audio'; // <--- MỚI THÊM

            // 2. Upload lên Supabase (folder 'files' cho gọn)
            const publicUrl = await uploadToSupabase(file, 'files');

            // 3. Lưu vào danh sách tạm
            tempDiaryMedia.push({
                url: publicUrl,
                type: type,
                name: file.name
            });
        }

        renderMediaPreview();
        label.innerText = `${tempDiaryMedia.length} file đã tải lên`;

    } catch (e) {
        console.error(e);
        Modal.alert("Lỗi upload: " + e.message);
        label.innerText = "Thử lại";
    } finally {
        label.classList.remove('text-love-500', 'font-bold');
        input.value = '';
    }
}

// Cập nhật luôn hàm renderMediaPreview để hiện icon cho file lạ
/* --- RENDER PREVIEW (CÓ NGHE THỬ AUDIO) --- */
function renderMediaPreview() {
    const container = document.getElementById('diary-media-preview');
    if (!container) return;
    container.innerHTML = '';

    tempDiaryMedia.forEach((m, index) => {
        const div = document.createElement('div');
        // Style chung cho ô vuông
        div.className = "relative w-20 h-20 rounded-xl overflow-hidden group border border-gray-200 shadow-sm animate-zoom-in bg-gray-50 flex items-center justify-center";

        if (m.type === 'video') {
            div.innerHTML = `<video src="${m.url}" class="w-full h-full object-cover bg-black"></video><div class="absolute inset-0 flex items-center justify-center bg-black/20"><i class="fas fa-play text-white text-[10px]"></i></div>`;
        }
        else if (m.type === 'image') {
            div.innerHTML = `<img src="${m.url}" class="w-full h-full object-cover">`;
        }
        else if (m.type === 'audio') {
            // --- GIAO DIỆN AUDIO PREVIEW ---
            // Tạo ID duy nhất cho thẻ audio ẩn
            const audioId = `prev-audio-${index}`;
            div.innerHTML = `
                <audio id="${audioId}" src="${m.url}"></audio>
                <button onclick="previewAudio('${audioId}', this)" class="w-full h-full flex flex-col items-center justify-center text-purple-500 hover:bg-purple-50 transition">
                    <i class="fas fa-music text-xl mb-1"></i>
                    <i class="fas fa-play text-[10px]" id="${audioId}-icon"></i>
                </button>
            `;
        }
        else {
            // File thường
            div.innerHTML = `
                <div class="w-full h-full flex flex-col items-center justify-center p-1">
                    <i class="fas fa-file-alt text-gray-400 text-2xl mb-1"></i>
                    <span class="text-[8px] text-gray-500 truncate w-full text-center">${m.name || 'File'}</span>
                </div>`;
        }

        // Nút Xóa (Góc trên phải)
        div.innerHTML += `
            <button onclick="removeTempMedia(${index})" class="absolute top-1 right-1 bg-white text-red-500 w-5 h-5 flex items-center justify-center text-xs rounded-full shadow-md hover:bg-red-50 transition z-10">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(div);
    });
}

// Hàm hỗ trợ: Play/Pause audio trong khung preview
function previewAudio(id, btn) {
    const audio = document.getElementById(id);
    const icon = document.getElementById(id + '-icon');

    // Dừng tất cả audio khác đang preview (tránh ồn)
    document.querySelectorAll('audio').forEach(a => {
        if (a.id !== id && !a.paused) {
            a.pause();
            const otherIcon = document.getElementById(a.id + '-icon');
            if (otherIcon) otherIcon.className = 'fas fa-play text-[10px]';
        }
    });

    if (audio.paused) {
        audio.play();
        icon.className = 'fas fa-pause text-[10px] animate-pulse';
    } else {
        audio.pause();
        icon.className = 'fas fa-play text-[10px]';
    }

    // Khi hết bài thì tự đổi icon về Play
    audio.onended = () => {
        icon.className = 'fas fa-play text-[10px]';
    };
}

// 3. Xóa file khỏi danh sách chờ
function removeTempMedia(index) {
    // Thu hồi URL ảo để giải phóng bộ nhớ
    URL.revokeObjectURL(tempDiaryMedia[index].preview);

    tempDiaryMedia.splice(index, 1);
    renderMediaPreview();

    const label = document.getElementById('file-count');
    const input = document.getElementById('diary-files');

    if (tempDiaryMedia.length === 0) {
        label.innerText = "Thêm ảnh/video";
        input.value = '';
    } else {
        label.innerText = `${tempDiaryMedia.length} file chờ đăng`;
    }
}

// 5. HÀM ĐĂNG BÀI (Post Diary)
/* --- HÀM ĐĂNG BÀI (UPLOAD LÊN SUPABASE) --- */
async function postDiary() {
    const input = document.getElementById('diary-content') || document.getElementById('diary-input');
    const content = input ? input.value.trim() : "";
    const btn = document.getElementById('btn-post-diary');

    // Validate
    if (!content && tempDiaryMedia.length === 0) {
        return Modal.alert("Vui lòng nhập nội dung hoặc tải ảnh lên!");
    }

    if (btn) {
        btn.disabled = true;
        btn.innerText = "Đang lưu bài viết...";
    }

    try {
        const currentUser = appData[`user${myUserIndex}`];

        if (editingDiaryId) {
            // === CHẾ ĐỘ SỬA ===
            const index = (appData.diary || []).findIndex(p => String(p.id) === String(editingDiaryId));
            if (index !== -1) {
                appData.diary[index].content = content;
                // Nối thêm media mới (nếu có) vào media cũ
                if (tempDiaryMedia.length > 0) {
                    if (!appData.diary[index].media) appData.diary[index].media = [];
                    appData.diary[index].media = [...appData.diary[index].media, ...tempDiaryMedia];
                }
                Modal.showToast("Đã cập nhật bài viết!");
            }
            cancelEdit();
        } else {
            // === CHẾ ĐỘ ĐĂNG MỚI ===
            const newPost = {
                id: Date.now().toString(),
                authorId: currentUser.id,
                content: content,
                date: new Date().toISOString(),
                media: [...tempDiaryMedia], // Lấy trực tiếp danh sách link đã upload
                likes: [],
                comments: []
            };

            if (!appData.diary) appData.diary = [];
            appData.diary.unshift(newPost);
            Modal.showToast("Đã đăng bài thành công!");
        }

        // Lưu dữ liệu JSON text (rất nhanh)
        await saveData();

        // Dọn dẹp giao diện
        if (input) input.value = '';
        tempDiaryMedia = [];
        renderMediaPreview();
        document.getElementById('file-count').innerText = "Thêm ảnh/video";

        updateDiaryPage();

    } catch (error) {
        console.error(error);
        Modal.alert("Lỗi: " + error.message);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerText = "Đăng";
        }
    }
}

// 6. Hàm Hủy Sửa
function cancelEdit() {
    editingDiaryId = null;
    const input = document.getElementById('diary-content');
    if (input) input.value = '';

    // Reset danh sách file tạm
    tempDiaryMedia = [];
    renderMediaPreview();
    document.getElementById('file-count').innerText = "Thêm ảnh/video";
    document.getElementById('diary-files').value = '';

    document.getElementById('btn-cancel-edit').classList.add('hidden');
    const btn = document.getElementById('btn-post-diary');
    if (btn) {
        btn.innerText = "Đăng";
        btn.classList.remove('bg-yellow-500');
        btn.classList.add('bg-love-500');
    }
}
// Hàm hiển thị ảnh xem trước (Preview) bên dưới ô nhập
function renderMediaPreview() {
    const container = document.getElementById('diary-media-preview');
    if (!container) return; // Nếu chưa có div preview trong HTML thì bỏ qua

    container.innerHTML = '';

    tempDiaryMedia.forEach((m, index) => {
        const div = document.createElement('div');
        div.className = "relative w-20 h-20 rounded-lg overflow-hidden group border border-gray-200";

        // Hiển thị Ảnh hoặc Video nhỏ
        if (m.type === 'video') {
            div.innerHTML = `<video src="${m.url}" class="w-full h-full object-cover"></video>`;
        } else {
            div.innerHTML = `<img src="${m.url}" class="w-full h-full object-cover">`;
        }

        // Nút Xóa nhỏ góc trên
        div.innerHTML += `
            <button onclick="removeTempMedia(${index})" class="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center text-xs rounded-bl-lg hover:bg-red-600">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(div);
    });
}

/* --- MUSIC PLAYER --- */
function initMusicPlayer() {
    renderPlaylist();
    const player = document.getElementById('mini-player');
    if (appData.playlist && appData.playlist.length > 0) {
        player.classList.remove('hidden');
    } else {
        player.classList.add('hidden');
    }
}

function renderPlaylist() {
    const container = document.getElementById('playlist-container');
    container.innerHTML = '';
    const list = appData.playlist || [];
    if (list.length === 0) { container.innerHTML = '<div class="text-xs text-gray-400 italic">Danh sách trống</div>'; return; }

    list.forEach((song, index) => {
        container.innerHTML += `
                    <div class="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                        <div class="text-xs font-bold text-gray-700 truncate w-3/4">${song.name}</div>
                        <button onclick="deleteSong(${index})" class="text-red-400"><i class="fas fa-times"></i></button>
                    </div>
                `;
    });
}

function addSongToPlaylist() {
    const name = document.getElementById('new-song-name').value;
    const url = document.getElementById('new-song-url').value;
    if (!name || !url) return Modal.alert("Nhập đủ tên và link");
    appData.playlist = appData.playlist || [];
    appData.playlist.push({ name, url });
    document.getElementById('new-song-name').value = '';
    document.getElementById('new-song-url').value = '';
    saveData();
    initMusicPlayer();
}
function deleteSong(index) {
    appData.playlist.splice(index, 1);
    saveData();
    initMusicPlayer();
}

function playSongAtIndex(index) {
    const list = appData.playlist || [];

    // Validate index
    if (list.length === 0) return;
    if (index >= list.length) index = 0;
    if (index < 0) index = list.length - 1;

    currentSongIndex = index;
    audioPlayer.src = list[index].url;
    audioPlayer.play().catch(e => console.log("Chưa tương tác nên chưa tự play được")); // Bắt lỗi autoplay
    isPlaying = true;

    // --- CẬP NHẬT GIAO DIỆN AN TOÀN ---

    // 1. Cập nhật tên bài hát
    const titleEl = document.getElementById('player-title');
    if (titleEl) {
        titleEl.innerText = list[index].name;
    } else {
        // Fallback: Nếu dùng code cũ thì nó tên là music-title
        const oldTitleEl = document.getElementById('music-title');
        if (oldTitleEl) oldTitleEl.innerText = list[index].name;
    }

    // 2. Cập nhật icon Play/Pause
    const playIcon = document.getElementById('player-play-icon');
    if (playIcon) {
        playIcon.className = 'fas fa-pause text-xs';
    } else {
        // Fallback cho code cũ (nếu có id là play-icon)
        const oldPlayIcon = document.getElementById('play-icon');
        if (oldPlayIcon) oldPlayIcon.className = 'fas fa-pause';
    }

    // Tự động mở rộng khi đổi bài
    if (typeof isPlayerExpanded !== 'undefined' && !isPlayerExpanded && typeof toggleExpandPlayer === 'function') {
        toggleExpandPlayer();
    }
}

function nextSong() { playSongAtIndex(currentSongIndex + 1); }
function prevSong() { playSongAtIndex(currentSongIndex - 1); }

/* --- SETTINGS & HELPERS --- */
function loadSettingsToUI() {
    document.getElementById('set-start-date').value = appData.startDate;
    ['1', '2'].forEach(i => {
        document.getElementById(`set-name-${i}`).value = appData[`user${i}`].name;
        document.getElementById(`set-dob-${i}`).value = appData[`user${i}`].dob;
        document.getElementById(`set-ava-${i}`).value = appData[`user${i}`].avatar;
    });
    if (appData.theme) {
        document.getElementById('set-font').value = appData.theme.font;
        document.getElementById('set-bg-url').value = appData.theme.bg;
    }
}

async function saveSettings(btn) {
    // 1. UI Loading: Khóa nút và hiện icon xoay
    if (btn) {
        btn.disabled = true;
        // Lưu lại nội dung cũ để restore sau khi xong
        btn.dataset.originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
    }

    try {
        // 2. Lưu Ngày bắt đầu yêu
        const startDateInput = document.getElementById('set-start-date');
        if (startDateInput) appData.startDate = startDateInput.value;

        // 3. Lưu Thông tin 2 người (Dùng vòng lặp cho gọn)
        ['1', '2'].forEach(i => {
            const nameInput = document.getElementById(`set-name-${i}`);
            const dobInput = document.getElementById(`set-dob-${i}`);
            const avaInput = document.getElementById(`set-ava-${i}`); // Input hidden chứa URL

            if (nameInput) appData[`user${i}`].name = nameInput.value;
            if (dobInput) appData[`user${i}`].dob = dobInput.value;

            // Avatar: Lấy từ input hidden (đã được FilePicker điền vào)
            // Logic: Nếu ô input có giá trị mới thì lấy, không thì giữ nguyên avatar cũ
            if (avaInput && avaInput.value.trim() !== "") {
                appData[`user${i}`].avatar = avaInput.value;
            }
        });

        // 4. Lưu Cấu hình Giao diện (Theme)
        // tempThemeColor là biến toàn cục lưu màu tạm thời khi bạn bấm các nút tròn màu sắc
        // Nếu người dùng không bấm chọn màu mới, dùng màu hiện tại trong appData
        const currentColor = (typeof tempThemeColor !== 'undefined' && tempThemeColor)
            ? tempThemeColor
            : (appData.theme?.color || 'pink');

        appData.theme = {
            color: currentColor,
            font: document.getElementById('set-font').value,
            // Hình nền: Lấy trực tiếp URL từ ô input (FilePicker đã xử lý upload rồi)
            bg: document.getElementById('set-bg-url').value,
            // Độ trong suốt
            opacity: document.getElementById('set-opacity').value
        };

        // 5. Áp dụng Theme ngay lập tức (để thấy thay đổi mà không cần reload)
        applyTheme();

        // 6. Đồng bộ dữ liệu lên Supabase
        await saveData();

        // 7. Thông báo thành công
        Modal.showToast("Đã lưu cài đặt thành công! 🎉");

    } catch (error) {
        console.error("Save Error:", error);
        Modal.alert("Có lỗi xảy ra khi lưu: " + error.message);
    } finally {
        // 8. Kết thúc: Mở khóa nút và trả lại nội dung cũ
        if (btn) {
            btn.disabled = false;
            // Nếu có lưu text cũ thì dùng lại, không thì set mặc định
            btn.innerHTML = btn.dataset.originalText || '<i class="fas fa-save"></i> Lưu Thay Đổi';
        }
    }
}

async function uploadAvatar(input, i) {
    const file = input.files[0];
    if (!file) return;
    try { const url = await uploadToSupabase(file, 'avatars'); document.getElementById(`set-ava-${i}`).value = url; } catch (e) { Modal.alert(e.message); }
}

function updateFileCount() { const n = document.getElementById('diary-files').files.length; document.getElementById('file-count').innerText = n > 0 ? `${n} file đã chọn` : "Chọn ảnh/video"; }
async function deletePost(id) {
    if (!id) return;

    if (await Modal.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
        // 1. Tìm vị trí (Index) an toàn
        const index = (appData.diary || []).findIndex(p => String(p.id) === String(id));

        if (index !== -1) {
            // 2. Xóa khỏi mảng
            appData.diary.splice(index, 1);

            // 3. Lưu và Làm mới
            await saveData();
            updateDiaryPage();
            Modal.showToast("Đã xóa bài viết.");
        } else {
            Modal.alert("Lỗi: Không tìm thấy bài viết để xóa.");
        }
    }
}

function toggleLike(id) {
    const p = appData.diary.find(p => p.id === id);
    if (p.likes.includes(currentUser.id)) p.likes = p.likes.filter(uid => uid !== currentUser.id);
    else p.likes.push(currentUser.id);
    if (p.likes.length == 2) {
        createHeartStorm();
    };
    saveData();
}
/* --- ADD COMMENT TRỰC TIẾP (INLINE) --- */
async function addComment(postId) {
    // 1. Lấy ô input cụ thể của bài viết đó
    const input = document.getElementById(`comment-input-${postId}`);
    if (!input) return;

    const text = input.value.trim();
    if (!text) return;

    // 2. Tìm bài viết trong Diary
    const post = (appData.diary || []).find(p => p.id == postId);
    if (!post) return;

    // 3. Tạo ID ngẫu nhiên cho comment (Quan trọng cho việc Xóa/Sửa)
    const commentId = Date.now().toString() + Math.random().toString(36).substr(2, 5);

    // 4. Lấy tên người dùng hiện tại
    const currentUserInfo = appData[`user${myUserIndex}`] || { name: 'Người dùng' };

    // 5. Push comment mới
    if (!post.comments) post.comments = [];
    post.comments.push({
        id: commentId, // BẮT BUỘC PHẢI CÓ
        userId: currentUser.id,
        userName: currentUserInfo.name,
        text: text,
        time: new Date().toISOString(),
        edited: false
    });

    // 6. Xóa ô nhập liệu
    input.value = '';
    input.blur(); // Ẩn bàn phím

    // 7. Render lại giao diện ngay lập tức
    // Vì đang ở trang Diary chính nên gọi updateDiaryPage để vẽ lại comment mới thêm
    updateDiaryPage();

    // 8. Lưu lên Cloud
    await saveData();
}

async function uploadToSupabase(file, folder) {
    // ĐÃ XÓA: Dòng kiểm tra kích thước file 10MB
    // if (file.size > 10 * 1024 * 1024) ...

    const fileExt = file.name.split('.').pop();
    // Tạo tên file ngẫu nhiên tránh trùng
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload thẳng lên Supabase
    const { error } = await supabaseClient.storage.from('love_gallery').upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (error) throw error;

    // Lấy Public URL trả về
    const { data: { publicUrl } } = supabaseClient.storage.from('love_gallery').getPublicUrl(fileName);
    return publicUrl;
}
/* --- IPHONE SWIPE NAVIGATION LOGIC --- */
/* --- NAVIGATION LOGIC (SỬA LỖI VỊ TRÍ) --- */
const swipeWrapper = document.getElementById('swipe-wrapper');
let isScrollingTimeout;
let currentPage = 0; // Biến theo dõi trang hiện tại

// 1. Khởi tạo Navigation
function initNavigation() {
    const dotsContainer = document.getElementById('pagination-dots');
    dotsContainer.innerHTML = '';

    const icons = [
        'fa-home', 'fa-check-square', 'fa-fire',
        'fa-calendar-alt', 'fa-book-open', 'fa-folder-open', 'fa-cog'
    ];

    for (let i = 0; i < 7; i++) {
        const dot = document.createElement('div');
        dot.className = `nav-dot ${i === 0 ? 'active' : ''}`;
        dot.innerHTML = `<i class="fas ${icons[i]}"></i>`;

        dot.onclick = () => {
            if (navigator.vibrate) navigator.vibrate(30);
            goToPage(i);
        };
        dotsContainer.appendChild(dot);
    }

    // Lắng nghe sự kiện cuộn để cập nhật icon active khi người dùng tự vuốt
    swipeWrapper.addEventListener('scroll', handleScrollActive);
}

// 2. Hàm chuyển trang (Dùng scrollIntoView để chính xác tuyệt đối)
function goToPage(index) {
    // Nếu bấm vào trang đang đứng thì không làm gì (hoặc có thể scroll lên đầu trang)
    if (currentPage === index) return;

    currentPage = index;
    const targetPage = document.getElementById(`page-${index}`);

    if (targetPage) {
        // Tạm thời tắt lắng nghe scroll để tránh xung đột icon active
        swipeWrapper.removeEventListener('scroll', handleScrollActive);

        // --- KEY FIX: Dùng hàm này để trình duyệt tự tìm vị trí chính xác ---
        targetPage.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'start'
        });

        updateActiveDot(index);
        updatePageData(index); // Load dữ liệu trang đó

        // Bật lại lắng nghe sau khi cuộn xong (khoảng 600ms)
        clearTimeout(isScrollingTimeout);
        isScrollingTimeout = setTimeout(() => {
            swipeWrapper.addEventListener('scroll', handleScrollActive);
        }, 600);
    }
}

// 3. Xử lý khi người dùng TỰ VUỐT TAY
function handleScrollActive() {
    clearTimeout(isScrollingTimeout);

    isScrollingTimeout = setTimeout(() => {
        // Tính toán dựa trên chiều rộng thực tế của wrapper
        const pageWidth = swipeWrapper.clientWidth;
        const scrollLeft = swipeWrapper.scrollLeft;

        // Tính ra index (làm tròn)
        const activeIndex = Math.round(scrollLeft / pageWidth);

        if (activeIndex !== currentPage) {
            currentPage = activeIndex;
            updateActiveDot(activeIndex);
            updatePageData(activeIndex);
        }
    }, 50); // Debounce 50ms
}

// 4. Hàm cập nhật giao diện Dot
function updateActiveDot(index) {
    document.querySelectorAll('.nav-dot').forEach((dot, i) => {
        if (i === index) dot.classList.add('active');
        else dot.classList.remove('active');
    });
}

// Hàm hỗ trợ load dữ liệu (Tách từ switchTab cũ)
function updatePageData(index) {
    // Scroll trang lên đầu
    const page = document.getElementById(`page-${index}`);
    if (page) page.scrollTop = 0;

    // Load dữ liệu theo index
    if (index === 0) { /* Home - Tự động update nhờ hàm updateCountdown */ }
    if (index === 1) renderTodos(); // Todo
    if (index === 2) updateSparksPage(); // Sparks
    if (index === 3) updateEventsPage(); // Events
    if (index === 4) updateDiaryPage(); // Diary
    if (index === 5) loadGallery(); // Gallery
    if (index === 6) loadSettingsToUI(); // Settings
    if (index === 7) updateTurnDisplay(); // Settings
}

// Thêm vào initApp hoặc cuối file
initNavigation();
function getNextDate(dStr, recur) {
    let d = new Date(dStr); const now = new Date();
    if (recur === 'none') return d;
    d.setFullYear(now.getFullYear());
    if (d < now) { if (recur === 'year') d.setFullYear(now.getFullYear() + 1); if (recur === 'month') d.setMonth(now.getMonth() + 1); }
    return d;
}
function updateCountdown() {
    // Updated logic is handled inside render events now for individual cards
    // But main counter on dashboard can be added back if needed
}
function copyCoupleCode() { navigator.clipboard.writeText(currentCoupleCode); Modal.alert("Đã copy: " + currentCoupleCode); }
function renderBackground() {
    const container = document.getElementById('heart-bg');
    for (let i = 0; i < 15; i++) {
        const heart = document.createElement('i');
        heart.className = 'fas fa-heart heart-particle';
        heart.style.left = Math.random() * 100 + '%';
        heart.style.top = Math.random() * 100 + '%';
        heart.style.fontSize = (Math.random() * 20 + 10) + 'px';
        heart.style.animationDuration = (Math.random() * 5 + 5) + 's';
        heart.style.opacity = Math.random() * 0.3;
        container.appendChild(heart);
    }
}

/* --- GALLERY MANAGER LOGIC --- */
let galleryFiles = []; // Chứa danh sách tất cả file
let selectedFiles = new Set(); // Chứa các file path đang chọn

// 1. Hàm Load Gallery (Quét các thư mục trong Storage)
async function loadGallery() {
    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = '<div class="col-span-3 text-center py-10"><div class="loader"></div><p class="mt-2 text-xs text-gray-400">Đang quét file...</p></div>';

    selectedFiles.clear();
    updateGalleryToolbar();

    // Các thư mục cần quét trong Bucket 'love_gallery'
    const folders = ['posts', 'events', 'avatars', 'backgrounds', 'files', 'general'];
    let allFiles = [];

    try {
        for (const folder of folders) {
            const { data, error } = await supabaseClient.storage.from('love_gallery').list(folder, { limit: 100, offset: 0 });
            if (data) {
                // Map thêm thông tin folder vào file name
                const filesWithUrl = data.map(f => ({
                    name: f.name,
                    folder: folder,
                    path: `${folder}/${f.name}`,
                    type: f.metadata.mimetype,
                    size: (f.metadata.size / 1024 / 1024).toFixed(2) + ' MB',
                    url: supabaseClient.storage.from('love_gallery').getPublicUrl(`${folder}/${f.name}`).data.publicUrl
                }));
                allFiles = [...allFiles, ...filesWithUrl];
            }
        }

        galleryFiles = allFiles.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Mới nhất lên đầu
        renderGallery();

    } catch (e) {
        grid.innerHTML = `<div class="col-span-3 text-center text-red-400 text-xs">Lỗi: ${e.message}</div>`;
    }
}

/* --- GALLERY LOGIC NÂNG CẤP --- */
let isGallerySelectMode = false; // Trạng thái chọn
let currentLightboxIndex = 0;    // Index ảnh đang xem

// 1. Hàm Bật/Tắt chế độ Chọn
function toggleGallerySelectMode() {
    isGallerySelectMode = !isGallerySelectMode;
    const btn = document.getElementById('btn-toggle-select');

    if (isGallerySelectMode) {
        btn.innerText = "Hủy";
        btn.classList.add('text-love-500', 'bg-love-50');
    } else {
        btn.innerText = "Chọn";
        btn.classList.remove('text-love-500', 'bg-love-50');
        // Clear selection khi hủy
        selectedFiles.clear();
        updateGalleryToolbar();
    }
    renderGallery(); // Render lại giao diện
}

// 2. Cập nhật Render Gallery (Quan trọng)
function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = '';

    if (galleryFiles.length === 0) {
        grid.innerHTML = '<div class="col-span-3 text-center py-10 text-gray-400 text-xs italic">Chưa có file nào.</div>';
        return;
    }

    galleryFiles.forEach((file, index) => {
        const isSelected = selectedFiles.has(file.path);
        const isVideo = file.type && file.type.startsWith('video');

        const div = document.createElement('div');
        // Thêm animation scale nhẹ khi hiện
        div.className = `gallery-item relative aspect-square bg-gray-100 overflow-hidden cursor-pointer group rounded-3xl transition-all ${isSelected ? 'ring-2 ring-love-500 transform scale-95' : ''}`;

        // LOGIC CLICK MỚI:
        div.onclick = () => {
            if (isGallerySelectMode) {
                // Nếu đang ở chế độ chọn -> Tích chọn
                toggleSelectFile(file.path);
            } else {
                // Nếu chế độ thường -> Mở Lightbox
                openGalleryLightbox(index);
            }
        };

        let mediaHtml = '';
        if (isVideo) {
            mediaHtml = `<video src="${file.url}" class="w-full h-full object-cover pointer-events-none"></video>
                         <div class="absolute inset-0 flex items-center justify-center"><i class="fas fa-play text-white opacity-80 drop-shadow-md"></i></div>`;
        } else {
            mediaHtml = `<img src="${file.url}" loading="lazy" class="w-full h-full object-cover pointer-events-none">`;
        }

        // Overlay checkbox (Chỉ hiện khi ở chế độ Chọn hoặc đã chọn)
        const checkCircle = `
            <div class="absolute top-2 right-2 w-5 h-5 rounded-full border-2 border-white ${isSelected ? 'bg-love-500 border-love-500' : 'bg-black/30'} flex items-center justify-center transition-all ${isGallerySelectMode || isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}">
                ${isSelected ? '<i class="fas fa-check text-white text-[10px]"></i>' : ''}
            </div>
        `;

        div.innerHTML = mediaHtml + checkCircle;
        grid.appendChild(div);
    });
}

/* --- LIGHTBOX LOGIC (Next/Prev/Swipe) --- */

// 1. Mở Lightbox từ Index
function openGalleryLightbox(index) {
    currentLightboxIndex = index;
    updateLightboxContent();

    const box = document.getElementById('lightbox');
    box.classList.remove('hidden');
    // Animation Fade In
    setTimeout(() => {
        box.classList.remove('opacity-0', 'pointer-events-none');
    }, 10);

    document.getElementById('lightbox-total').innerText = galleryFiles.length;
}

// 2. Cập nhật nội dung ảnh/video
function updateLightboxContent() {
    const file = galleryFiles[currentLightboxIndex];
    const container = document.getElementById('lightbox-content');
    const isVideo = file.type && file.type.startsWith('video');

    document.getElementById('lightbox-current').innerText = currentLightboxIndex + 1;

    if (isVideo) {
        container.innerHTML = `<video src="${file.url}" controls autoplay class="max-w-[95vw] max-h-[80vh] rounded-lg shadow-2xl"></video>`;
    } else {
        container.innerHTML = `<img src="${file.url}" class="max-w-[95vw] max-h-[80vh] rounded-lg shadow-2xl object-contain select-none" draggable="false">`;
    }
}

// 3. Chuyển ảnh (Next/Prev)
function changeLightboxImage(direction) {
    let newIndex = currentLightboxIndex + direction;

    // Vòng lặp: Hết ảnh cuối quay về đầu
    if (newIndex >= galleryFiles.length) newIndex = 0;
    if (newIndex < 0) newIndex = galleryFiles.length - 1;

    currentLightboxIndex = newIndex;

    // Hiệu ứng chuyển cảnh nhẹ
    const content = document.getElementById('lightbox-content');
    content.style.opacity = '0.5';
    content.style.transform = `scale(0.95)`;

    setTimeout(() => {
        updateLightboxContent();
        content.style.opacity = '1';
        content.style.transform = `scale(1)`;
    }, 150);
}

// 4. Đóng Lightbox
function closeLightbox() {
    const box = document.getElementById('lightbox');
    box.classList.add('opacity-0', 'pointer-events-none');

    // Dừng video nếu đang chạy
    const video = box.querySelector('video');
    if (video) video.pause();

    setTimeout(() => {
        box.classList.add('hidden');
        document.getElementById('lightbox-content').innerHTML = '';
    }, 300);
}

// 5. Xử lý Vuốt (Swipe) trên Lightbox
let lbTouchStartX = 0;
let lbTouchEndX = 0;
const lbWrapper = document.getElementById('lightbox-wrapper');

lbWrapper.addEventListener('touchstart', (e) => {
    lbTouchStartX = e.changedTouches[0].screenX;
}, { passive: true });

lbWrapper.addEventListener('touchend', (e) => {
    lbTouchEndX = e.changedTouches[0].screenX;
    handleLightboxSwipe();
}, { passive: true });

function handleLightboxSwipe() {
    const diff = lbTouchStartX - lbTouchEndX;
    const threshold = 50; // Vuốt ít nhất 50px

    if (Math.abs(diff) > threshold) {
        if (diff > 0) {
            // Vuốt sang trái -> Next
            changeLightboxImage(1);
        } else {
            // Vuốt sang phải -> Prev
            changeLightboxImage(-1);
        }
    }
}

// 3. Xử lý chọn File
function toggleSelectFile(path) {
    if (selectedFiles.has(path)) selectedFiles.delete(path);
    else selectedFiles.add(path);

    // Re-render class selected (tối ưu hơn re-render cả grid)
    renderGallery(); // Hoặc update class DOM trực tiếp nếu muốn mượt hơn
    updateGalleryToolbar();
}

function toggleSelectAllFiles() {
    const checkbox = document.getElementById('select-all-files');
    if (checkbox.checked) {
        galleryFiles.forEach(f => selectedFiles.add(f.path));
    } else {
        selectedFiles.clear();
    }
    renderGallery();
    updateGalleryToolbar();
}

function updateGalleryToolbar() {
    const toolbar = document.getElementById('gallery-toolbar');
    const countSpan = document.getElementById('selected-count');
    const checkbox = document.getElementById('select-all-files');

    countSpan.innerText = `${selectedFiles.size} đã chọn`;
    checkbox.checked = galleryFiles.length > 0 && selectedFiles.size === galleryFiles.length;

    if (selectedFiles.size > 0) toolbar.classList.remove('hidden');
    else toolbar.classList.add('hidden');
}

// 4. Xử lý Xóa File
async function deleteSelectedFiles() {
    if (selectedFiles.size === 0) return;

    if (await Modal.confirm(`Bạn có chắc muốn xóa vĩnh viễn ${selectedFiles.size} file này? Dữ liệu bài viết liên quan có thể bị lỗi ảnh.`)) {
        const paths = Array.from(selectedFiles);
        const { error } = await supabaseClient.storage.from('love_gallery').remove(paths);

        if (error) Modal.alert("Lỗi xóa: " + error.message);
        else {
            Modal.alert("Đã xóa thành công!");
            loadGallery(); // Reload lại
        }
    }
}

// 5. Xử lý Tải xuống
async function downloadSelectedFiles() {
    if (selectedFiles.size === 0) return;
    Modal.alert(`Đang chuẩn bị tải ${selectedFiles.size} file...`);

    const paths = Array.from(selectedFiles);

    // Duyệt qua từng file để tải (Browser sẽ chặn nếu popup quá nhiều, đây là cách cơ bản)
    for (const path of paths) {
        const { data, error } = await supabaseClient.storage.from('love_gallery').download(path);
        if (!error) {
            const url = URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            a.download = path.split('/').pop(); // Lấy tên file
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }
}

/* --- GALLERY UPLOAD LOGIC --- */

// 1. Bật/Tắt Form Upload
function toggleGalleryUpload() {
    const form = document.getElementById('gallery-upload-form');
    form.classList.toggle('hidden');

    // Reset form khi đóng/mở
    if (!form.classList.contains('hidden')) {
        document.getElementById('gallery-upload-input').value = '';
        document.getElementById('upload-file-label').innerText = '';
    }
}

// 2. Cập nhật tên file khi chọn
function updateUploadLabel() {
    const input = document.getElementById('gallery-upload-input');
    const label = document.getElementById('upload-file-label');
    if (input.files.length > 0) {
        label.innerText = `${input.files.length} file đã chọn`;
        label.className = "text-center text-[10px] text-love-500 font-bold mt-2 h-4 truncate";
    } else {
        label.innerText = "";
    }
}

// 3. Thực hiện Upload
async function executeGalleryUpload(btn) {
    const input = document.getElementById('gallery-upload-input');
    const folder = document.getElementById('upload-target-folder').value;
    const files = input.files;

    if (files.length === 0) return Modal.alert("Vui lòng chọn ít nhất 1 file!");

    // UI Loading
    btn.disabled = true;
    btn.innerHTML = '<span class="loader border-white border-t-transparent w-4 h-4"></span> Đang tải...';

    let successCount = 0;
    let errorCount = 0;

    try {
        // Duyệt qua từng file để upload
        for (const file of files) {
            try {
                // Tái sử dụng hàm uploadToSupabase cũ, nhưng cho phép truyền folder tùy ý
                // Lưu ý: Hàm cũ uploadToSupabase(file, folder) đã có sẵn logic
                await uploadToSupabase(file, folder);
                successCount++;
            } catch (err) {
                console.error(err);
                errorCount++;
            }
        }

        // Kết quả
        if (successCount > 0) {
            Modal.alert(`Đã tải lên thành công ${successCount} file!`);
            toggleGalleryUpload(); // Đóng form
            loadGallery(); // Reload lại lưới ảnh
        }

        if (errorCount > 0) {
            Modal.alert(`Có ${errorCount} file bị lỗi (có thể do quá lớn).`);
        }

    } catch (e) {
        Modal.alert("Lỗi hệ thống: " + e.message);
    } finally {
        // Reset button
        btn.disabled = false;
        btn.innerText = "Tải lên ngay";
    }
}

/* --- HEART RAIN EFFECT --- */
function triggerHeartRain() {
    // Rung nhẹ điện thoại (nếu hỗ trợ)
    if (navigator.vibrate) navigator.vibrate(50);

    const container = document.body;
    const colors = ['#f43f5e', '#ec4899', '#e11d48', '#ffccd5', '#fb7185']; // Các tông màu hồng/đỏ

    // Tạo 40 trái tim
    for (let i = 0; i < 40; i++) {
        const heart = document.createElement('i');
        heart.classList.add('fas', 'fa-heart', 'heart-rain');

        // Random thuộc tính
        const left = Math.random() * 100; // Vị trí ngang
        const size = Math.random() * 20 + 10; // Kích thước 10px - 30px
        const duration = Math.random() * 3 + 2; // Rơi trong 2s - 5s
        const color = colors[Math.floor(Math.random() * colors.length)];

        // Style
        heart.style.left = left + 'vw';
        heart.style.fontSize = size + 'px';
        heart.style.color = color;
        heart.style.animationDuration = duration + 's';
        heart.style.animationDelay = Math.random() * 2 + 's'; // Delay để không rơi cùng lúc

        container.appendChild(heart);

        // Tự xóa sau khi rơi xong
        setTimeout(() => {
            heart.remove();
        }, (duration + 2) * 1000);
    }
}

/* --- REALTIME HEART CONNECTION LOGIC --- */

// 1. Hàm xử lý khi BẠN bấm vào trái tim
async function handleHeartClick() {
    // Hiệu ứng rung phản hồi ngay lập tức
    if (navigator.vibrate) navigator.vibrate(100);

    // 1. Cập nhật thời gian bấm của BẠN
    const now = Date.now();
    appData.heartTimestamp[`u${myUserIndex}`] = now;

    // 2. Lưu lên Server (Việc này sẽ kích hoạt Realtime ở máy đối phương)
    await saveData();

    // 3. Tự tạo mưa cho mình xem ngay cho mượt (khỏi chờ server)
    // Kiểm tra xem có đang bão không để hiện đúng loại
    checkAndTriggerRain(appData.heartTimestamp.u1, appData.heartTimestamp.u2);
}

// 2. Hàm đăng ký lắng nghe Realtime (Thêm vào cuối hàm initApp)
function setupRealtimeListener() {
    if (!currentCoupleCode) return;

    // Lắng nghe thay đổi trên bảng 'couples' đúng dòng id của mình
    supabaseClient
        .channel('public:couples')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'couples', filter: `id=eq.${currentCoupleCode}` }, payload => {
            const newData = payload.new.data;

            // So sánh xem có ai vừa bấm tim không
            const oldT1 = appData.heartTimestamp?.u1 || 0;
            const oldT2 = appData.heartTimestamp?.u2 || 0;
            const newT1 = newData.heartTimestamp?.u1 || 0;
            const newT2 = newData.heartTimestamp?.u2 || 0;

            // Cập nhật dữ liệu cục bộ
            appData = newData;
            refreshUI(); // Cập nhật lại giao diện (số ngày, avatar...) nếu có thay đổi khác

            // Nếu có timestamp mới (lớn hơn cũ) -> Kích hoạt mưa
            // (Chỉ kích hoạt nếu thời gian bấm cách hiện tại không quá 5s - tránh mưa khi load trang lại)
            const now = Date.now();
            if ((newT1 > oldT1 && now - newT1 < 5000) || (newT2 > oldT2 && now - newT2 < 5000)) {
                checkAndTriggerRain(newT1, newT2);
            }
        })
        .subscribe();
}

// 3. Logic kiểm tra BÃO hay MƯA THƯỜNG
function checkAndTriggerRain(t1, t2) {
    // Nếu cả 2 người cùng bấm trong khoảng 10 giây (10000ms)
    const diff = Math.abs(t1 - t2);
    const isSuperStorm = diff < 10000 && t1 > 0 && t2 > 0;

    if (isSuperStorm) {
        createHeartStorm(); // BÃO TO
    } else {
        createHeartRain(); // Mưa thường
    }
}

// 4. Tạo Mưa thường (Nhẹ nhàng)
function createHeartRain() {
    const container = document.body;
    const colors = ['#f43f5e', '#fb7185', '#fda4af']; // Hồng phấn

    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const heart = document.createElement('i');
            heart.className = 'fas fa-heart heart-rain text-love-500';
            heart.style.left = Math.random() * 100 + 'vw';
            heart.style.fontSize = (Math.random() * 20 + 10) + 'px';
            heart.style.color = colors[Math.floor(Math.random() * colors.length)];
            heart.style.animationDuration = (Math.random() * 2 + 3) + 's'; // Rơi chậm 3-5s
            container.appendChild(heart);
            setTimeout(() => heart.remove(), 5000);
        }, i * 100);
    }
}

// 5. Tạo BÃO TIM (Siêu to, lâu hết)
function createHeartStorm() {
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]); // Rung mạnh

    const container = document.body;
    const colors = ['#e11d48', '#be123c', '#9f1239', '#fb7185', '#ffffff']; // Đỏ đậm rực rỡ + trắng

    Modal.alert("💖 CỘNG HƯỞNG TÌNH YÊU! 💖"); // Thông báo Toast

    // Tạo 200 trái tim (Nhiều gấp 6 lần)
    for (let i = 0; i < 200; i++) {
        setTimeout(() => {
            const heart = document.createElement('i');
            heart.className = 'fas fa-heart heart-rain super'; // Class super cho CSS

            // Random vị trí khắp màn hình
            heart.style.left = Math.random() * 100 + 'vw';

            // Kích thước to hơn (20px - 60px)
            heart.style.fontSize = (Math.random() * 40 + 20) + 'px';

            heart.style.color = colors[Math.floor(Math.random() * colors.length)];

            // Rơi cực nhanh hoặc cực chậm lộn xộn
            heart.style.animationDuration = (Math.random() * 5 + 2) + 's';

            container.appendChild(heart);
            setTimeout(() => heart.remove(), 8000);
        }, i * 50); // Mật độ dày đặc hơn
    }
}

/* --- UNIVERSAL FILE PICKER LOGIC --- */
let pickerCallback = null; // Biến lưu hàm sẽ chạy sau khi chọn file
let pickerCurrentTab = 'cloud';

// 1. Mở Modal
function openFilePicker(callback) {
    pickerCallback = callback; // Lưu callback lại dùng sau
    document.getElementById('file-picker-modal').classList.remove('hidden');
    switchPickerTab('cloud'); // Mặc định mở tab Cloud
    loadMiniGallery('all'); // Load ảnh
}

function closeFilePicker() {
    document.getElementById('file-picker-modal').classList.add('hidden');
    pickerCallback = null;
}

// 2. Chuyển Tab
function switchPickerTab(tabId) {
    pickerCurrentTab = tabId;

    // Update nút active
    document.querySelectorAll('.picker-tab').forEach(btn => {
        btn.classList.remove('active', 'text-love-500', 'bg-white', 'shadow-sm');
        btn.classList.add('text-gray-500', 'hover:bg-white/50');
    });
    // Highlight tab đang chọn (logic đơn giản dựa vào thứ tự click, hoặc querySelector)
    const activeBtn = document.querySelector(`button[onclick="switchPickerTab('${tabId}')"]`);
    if (activeBtn) activeBtn.className = "picker-tab active flex-1 py-2 text-xs font-bold rounded-lg transition text-love-500 bg-white shadow-sm";

    // Show/Hide Content
    document.querySelectorAll('.picker-content').forEach(div => div.classList.add('hidden'));
    document.getElementById(`picker-tab-${tabId}`).classList.remove('hidden');
}

// 3. Xử lý Tab CLOUD (Mini Gallery)
async function loadMiniGallery(filterFolder = 'all') {
    const grid = document.getElementById('mini-gallery-grid');
    grid.innerHTML = '<div class="col-span-3 text-center py-10"><div class="loader"></div></div>';

    let files = [];
    const folders = filterFolder === 'all' ? ['avatars', 'backgrounds', 'posts', 'events', 'general'] : [filterFolder];

    try {
        for (const folder of folders) {
            const { data } = await supabaseClient.storage.from('love_gallery').list(folder, { limit: 20, sortBy: { column: 'created_at', order: 'desc' } });
            if (data) {
                const mapped = data.map(f => ({
                    url: supabaseClient.storage.from('love_gallery').getPublicUrl(`${folder}/${f.name}`).data.publicUrl,
                    type: f.metadata.mimetype
                }));
                files = [...files, ...mapped];
            }
        }

        // Render
        grid.innerHTML = '';
        if (files.length === 0) {
            grid.innerHTML = '<div class="col-span-3 text-center py-10 text-gray-400 text-xs italic">Không có ảnh nào.</div>';
            return;
        }

        files.forEach(file => {
            const isVideo = file.type && file.type.startsWith('video');
            const div = document.createElement('div');
            div.className = "aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer relative group hover:ring-2 ring-love-500";
            div.onclick = () => returnFile(file.url);

            if (isVideo) {
                div.innerHTML = `<video src="${file.url}" class="w-full h-full object-cover"></video><div class="absolute inset-0 flex items-center justify-center"><i class="fas fa-play text-white drop-shadow"></i></div>`;
            } else {
                div.innerHTML = `<img src="${file.url}" class="w-full h-full object-cover">`;
            }
            grid.appendChild(div);
        });

    } catch (e) {
        grid.innerHTML = `<div class="col-span-3 text-center text-red-400 text-xs">Lỗi tải ảnh</div>`;
    }
}

// 4. Xử lý Tab UPLOAD
async function handlePickerUpload(input) {
    const file = input.files[0];
    if (!file) return;

    // UI Loading
    document.getElementById('picker-upload-ui').classList.add('hidden');
    document.getElementById('picker-uploading-ui').classList.remove('hidden');

    try {
        // Mặc định upload vào folder 'general' hoặc 'posts'
        const url = await uploadToSupabase(file, 'general');
        returnFile(url);
    } catch (e) {
        Modal.alert("Lỗi upload: " + e.message);
    } finally {
        // Reset UI
        document.getElementById('picker-upload-ui').classList.remove('hidden');
        document.getElementById('picker-uploading-ui').classList.add('hidden');
        input.value = '';
    }
}

// 5. Xử lý Tab URL
function handlePickerUrl() {
    const url = document.getElementById('picker-url-input').value;
    if (url) returnFile(url);
}

// 6. TRẢ KẾT QUẢ VỀ (Core function)
function returnFile(url) {
    if (pickerCallback) {
        pickerCallback(url);
    }
    closeFilePicker();
}


/* --- ITEM SWIPE LOGIC (Vuốt từng sự kiện) --- */
let itemTouchStartX = 0;
let currentSwipeItem = null; // Lưu item đang được vuốt

function handleItemTouchStart(e, element) {
    // QUAN TRỌNG: Ngăn chặn sự kiện nổi lên wrapper cha -> KHÔNG BỊ CHUYỂN TRANG
    e.stopPropagation();

    itemTouchStartX = e.changedTouches[0].screenX;
    currentSwipeItem = element;

    // Tắt transition để kéo theo ngón tay cho mượt (Real-time tracking)
    element.style.transition = 'none';

    // Đóng tất cả các item khác đang mở (nếu có)
    document.querySelectorAll('.event-content.swiped').forEach(el => {
        if (el !== element) {
            el.classList.remove('swiped');
            el.style.transform = 'translateX(0)';
        }
    });
}

function handleItemTouchMove(e, element) {
    e.stopPropagation(); // Chặn chuyển trang

    const currentX = e.changedTouches[0].screenX;
    const diff = currentX - itemTouchStartX; // Âm là vuốt trái, Dương là vuốt phải

    // Logic: 
    // - Nếu đang đóng mà vuốt trái (diff < 0) -> Cho phép kéo tối đa -120px
    // - Nếu đang mở mà vuốt phải (diff > 0) -> Cho phép kéo về 0

    // Kiểm tra trạng thái hiện tại dựa trên class swiped
    const isSwiped = element.classList.contains('swiped');
    let newTranslate = isSwiped ? -120 + diff : diff;

    // Giới hạn biên (Không cho kéo quá lố)
    if (newTranslate > 0) newTranslate = 0; // Không kéo quá sang phải
    if (newTranslate < -120) newTranslate = -120; // Không kéo quá sang trái

    element.style.transform = `translateX(${newTranslate}px)`;
}

function handleItemTouchEnd(e, element) {
    e.stopPropagation(); // Chặn chuyển trang

    const endX = e.changedTouches[0].screenX;
    const diff = endX - itemTouchStartX;

    // Bật lại transition để item trượt vào vị trí cuối cùng mượt mà
    element.style.transition = 'transform 0.2s ease-out';

    // Ngưỡng quyết định (Swipe Threshold)
    const threshold = 40;

    // Nếu vuốt sang trái đủ mạnh -> MỞ
    if (diff < -threshold) {
        element.classList.add('swiped');
        element.style.transform = 'translateX(-120px)'; // Khóa ở vị trí mở
    }
    // Nếu vuốt sang phải đủ mạnh (khi đang mở) -> ĐÓNG
    else if (diff > threshold) {
        element.classList.remove('swiped');
        element.style.transform = 'translateX(0)';
    }
    // Nếu vuốt lừng chừng -> Trả về trạng thái cũ
    else {
        if (element.classList.contains('swiped')) {
            element.style.transform = 'translateX(-120px)';
        } else {
            element.style.transform = 'translateX(0)';
        }
    }
}

/* --- LOGIC SECRET ZONE (DICE & LOVE BOX) --- */

const ENCRYPTED_DEFAULT_DICE = "U2FsdGVkX1+X/Ae1bNijaHbNjXslaFUACzQOHms8gegSBMWGcmOgTeNIPkncvhrlwuqgN2x+4qpKqYfhIDledpm+AOP6nOFa/7nQyYaRWZiXgTghujlZngpwZJd1NkQQEgl5rOt6zCyE2h7ebsMv3RTFho2zITpqAds4MQJ8M/iA99ROrITCiyS+nsKx1l7zAVRdIwEJjrsVPN2mCJAP3/D83cea7ST1OmQ/BuA0DH9wnOSy080Y4ql43kxrcE5eAeyAoK/e/337EWoHOHVa7hzd0KZj3Sno1MPQh3Njg2ctA9j7ecWo4ezs6Un8CWjPhzF9ej6/hpIO4GZhlVYr1dy58CgpG3E0zsuQRo5VcqtH2PuxxqVwfhUJqTn/4m9Bpx3RtjBcPwkhoDHuOnxwDoG9+T3RsQTu1zIKqDfo78XhQv72Tf/PCO2pZDFnwPlRR6YQ5V7RQlMv0sQGabXTJ7ZAAdGp07RKnOFBaIJsYMbFMIgtKCQlcgmvQlGp0ZZMSJUUsvQfCIhdKLAsNqYuEmQt1qYowvLVkB2sZi4mDwP3FvSU2dVyTrc5WPTSHiOiEVj3V+tP0mUEi3TiFczZGN5St8OIYBIjPIW8f74eZutnreIxR9ElbL9phcsl9iAqa3h58sJ8pflqrt9wOT36/pjf/AMGZhusXJ2tgBM1Yt9p/xufi3X0K9Av3gZysI6fC971YGXcom5mw+zrhqdZjgEiM3K3XGUK2i1810mxD0KIARz57H1ioRB5xI4/UFpdhRj4MWv9wfE7h6DK14w825Zn8suJmEuosfFW+/yBBLuOaQZToe98P2W5Cs7JdlyvtsqRVxY4hGNi9ZyWxd3vJHpvsgLsA4eOol5/COpurrCn3ubQOvugJN9w5J3ha/QIwG2gUS/4R2nDy+fdfkkOnSvTo+E7TamU37j4ClI3DB9tkY2hIWlvAnJb+KpA1pSpBpVFApZSfhWN6DElaD0Zq8pbkPVle42NOenIQytSh1RGLYm3u/OwjHh3qEtUm68ZcGgLvXrmOJkcczkYVVAqm5cyn4+LBUeXoyl/osAVsgRpU7c7n8jw903TW4LzxO61zdMjZbo6fRQzUg5uM8tA7d+b3tRsfxvvwPySK2TL+xp5pX0/AejirdqcQhJ37zD4kHkaxJJdueAFyxlhao5Vf+fbXI4ZziCsDgJvq0FyFZi2vOIZSQCSw9OUnntN5dPXGQgh8KPbDRHwF3QrGx+AM5IITr0O0M+OtlOcfwOyaCkpevK5V6NgHdZ1NR+kyUb9A06dQ6swUELb9SNau+QQFwCbSixO9cVA3qemuii02Cke05O6JyD0eP/d3a49UoDqLpuSRU2Ni8mVFy/3xFWkRV6+4ESMVrdT1LJoEAOfP5EMZzlDMwta53/odp/sEq5wndvGZhuCjwx+E+MuOgKhWmC2hFharnTvnM4JryYuAW8nRClTW5G38zZYlEZRBXuRRlWqivMPHXHuFSsgdzIc+Ggy8g2PiA0Wza0ih1QIzxVY63R00l1TnBmr1L5kxvy8fGXEfuLysorGVo0XwHTigApk70sNiKnklpdtuTv2BBjwELYGIPuTDv2p7Zrg5nJjMfUA/5vLEcDbJ6o00sSgAWOC/LctCeucppVatdfD7PQ0swGFZW/qhEiyJx/XZBGPZ4nsk6sIRNVTR9aK7c3i7E7qSETdRw6qLWbqeOonGIKIRC8Ldj8/zjutZY/6Kt6K+G8xsF7NCVxujVuU6x6jfMD/+dKD0HV8UAQQeU7Pn0eWVtoGVGtkGRXXqK2UZ4N7Z+G7IjZSiS8N3TJeoCQle7dvHYlJ4Ahk3leQAl2hgguFGptY0B0KnxmPLGnXdYsM7UzZlFASAS6Ae67bbKnkrQ==";

const SYSTEM_KEY = "SYSTEM_HIDDEN_KEY"; // Khóa tĩnh để giải mã dữ liệu mặc định

// Hàm giải mã dữ liệu mặc định (Helper)
function getDefaultDiceConfig() {
    try {
        const bytes = CryptoJS.AES.decrypt(ENCRYPTED_DEFAULT_DICE, SYSTEM_KEY);
        const str = bytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(str);
    } catch (e) {
        console.error("Lỗi giải mã Default Config:", e);
        return { actions: [], bodyParts: [], times: [], hotActions: [] }; // Fallback rỗng để không crash
    }
}

// Biến lưu cấu hình hiện tại (Sau khi đã giải mã từ AppData)
let currentDiceConfig = null;
let currentSecretTab = 'dice';

/* --- B. QUẢN LÝ TAB --- */
function switchSecretTab(tab) {
    currentSecretTab = tab;

    // Ẩn hiện các view
    document.getElementById('tab-dice').classList.add('hidden');
    document.getElementById('tab-box').classList.add('hidden');
    document.getElementById(`tab-${tab}`).classList.remove('hidden');

    // Update style nút bấm (Active/Inactive)
    const activeClass = "px-4 py-1.5 rounded-md text-xs font-bold bg-pink-600 text-white shadow transition";
    const inactiveClass = "px-4 py-1.5 rounded-md text-xs font-bold text-gray-300 hover:text-white transition";

    const btnDice = document.getElementById('tab-btn-dice');
    const btnBox = document.getElementById('tab-btn-box');

    if (btnDice) btnDice.className = tab === 'dice' ? activeClass : inactiveClass;
    if (btnBox) btnBox.className = tab === 'box' ? activeClass : inactiveClass;
    if (btnBox) updateTurnDisplay();
}

/* --- C. LOGIC XÚC XẮC (DICE) --- */

// 1. Tải dữ liệu (Tự động giải mã E2EE)
/* --- CẬP NHẬT HÀM LOAD DỮ LIỆU --- */
function loadDiceData() {
    // 1. Trường hợp chưa có dữ liệu cá nhân -> Dùng mặc định (Giải mã từ biến ẩn)
    if (!appData.encryptedDiceData) {
        currentDiceConfig = getDefaultDiceConfig();
        return;
    }

    // 2. Trường hợp đã có dữ liệu cá nhân -> Giải mã bằng PIN người dùng
    try {
        if (!appData.secretPin) throw new Error("No PIN");

        const bytes = CryptoJS.AES.decrypt(appData.encryptedDiceData, appData.secretPin);
        const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);

        if (!decryptedStr) throw new Error("Empty decrypt");

        currentDiceConfig = JSON.parse(decryptedStr);
    } catch (e) {
        console.error("Lỗi giải mã Dice (User Data):", e);

        // Nếu giải mã dữ liệu cá nhân lỗi, quay về dùng mặc định
        currentDiceConfig = getDefaultDiceConfig();
        Modal.showToast("Không thể giải mã dữ liệu cá nhân (Sai PIN?), đang dùng mặc định.");
    }
}

// 2. Cập nhật giao diện (Chọn mode)
function updateDiceMode() {
    const container = document.getElementById('dice-container');
    if (!container) return;

    // Tìm nút radio đang check
    const radioElement = document.querySelector('input[name="dice-mode"]:checked');
    const mode = radioElement ? radioElement.value : 'combo';

    // Đảm bảo dữ liệu đã load
    if (!currentDiceConfig) loadDiceData();

    if (mode === 'combo') {
        container.innerHTML = `
            <div class="grid grid-cols-1 gap-3 w-full animate-zoom-in">
                <div class="bg-gray-800 p-4 rounded-xl text-center border border-gray-700">
                    <p class="text-[10px] text-gray-400 uppercase">Hành động</p>
                    <h3 class="text-2xl font-bold text-pink-400 mt-1" id="res-action">?</h3>
                </div>
                <div class="flex gap-3">
                    <div class="bg-gray-800 p-4 rounded-xl text-center border border-gray-700 flex-1">
                        <p class="text-[10px] text-gray-400 uppercase">Vị trí</p>
                        <h3 class="text-xl font-bold text-blue-400 mt-1" id="res-part">?</h3>
                    </div>
                    <div class="bg-gray-800 p-4 rounded-xl text-center border border-gray-700 flex-1">
                        <p class="text-[10px] text-gray-400 uppercase">Thời gian</p>
                        <h3 class="text-xl font-bold text-yellow-400 mt-1" id="res-time">?</h3>
                    </div>
                </div>
            </div>`;
    } else {
        container.innerHTML = `
            <div class="bg-red-900/30 p-8 rounded-2xl text-center border border-red-500/50 relative overflow-hidden w-full animate-zoom-in">
                <div class="absolute inset-0 bg-red-500/10 animate-pulse"></div>
                <p class="text-xs text-red-300 uppercase tracking-widest mb-3 relative z-10">Thử thách Nóng bỏng</p>
                <h3 class="text-3xl font-black text-red-500 relative z-10 drop-shadow-lg" id="res-hot">???</h3>
            </div>`;
    }
}

// 3. Hàm Quay Xúc Xắc (FIX LỖI DICE_DATA TẠI ĐÂY)
function rollDice() {
    if (navigator.vibrate) navigator.vibrate(50);

    const radioElement = document.querySelector('input[name="dice-mode"]:checked');
    const mode = radioElement ? radioElement.value : 'combo';

    // QUAN TRỌNG: Load dữ liệu vào biến config trước khi quay
    if (!currentDiceConfig) loadDiceData();
    const config = currentDiceConfig; // Dùng biến này thay vì DICE_DATA

    let count = 0;
    const interval = setInterval(() => {
        if (mode === 'combo') {
            // Random từ config (dữ liệu cá nhân hoặc mặc định)
            if (document.getElementById('res-action'))
                document.getElementById('res-action').innerText = getRandomItem(config.actions);
            if (document.getElementById('res-part'))
                document.getElementById('res-part').innerText = getRandomItem(config.bodyParts);
            if (document.getElementById('res-time'))
                document.getElementById('res-time').innerText = getRandomItem(config.times);
        } else {
            if (document.getElementById('res-hot'))
                document.getElementById('res-hot').innerText = getRandomItem(config.hotActions);
        }
        count++;
        if (count > 10) {
            clearInterval(interval);
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        }
    }, 80);
}

// Helper Random
function getRandomItem(arr) {
    if (!arr || arr.length === 0) return "...";
    return arr[Math.floor(Math.random() * arr.length)];
}

/* --- D. CÀI ĐẶT DỮ LIỆU XÚC XẮC (MODAL) --- */

// Hàm mở bảng cài đặt
function openDiceSettings() {
    console.log("Đang cố gắng mở cài đặt...");

    // 1. Kiểm tra xem HTML Modal có tồn tại không
    const modal = document.getElementById('dice-settings-modal');
    if (!modal) {
        return Modal.alert("LỖI: Không tìm thấy HTML của bảng cài đặt!\n\nHãy kiểm tra lại file index.html xem đã dán đoạn code <div id='dice-settings-modal'>...</div> chưa.");
    }

    // 2. Thử load dữ liệu
    try {
        if (!currentDiceConfig) loadDiceData();

        // Kiểm tra xem hàm render có lỗi không
        renderDiceTags('actions', currentDiceConfig.actions, 'bg-pink-900 text-pink-200');
        renderDiceTags('bodyParts', currentDiceConfig.bodyParts, 'bg-blue-900 text-blue-200');
        renderDiceTags('times', currentDiceConfig.times, 'bg-yellow-900 text-yellow-200');
        renderDiceTags('hotActions', currentDiceConfig.hotActions, 'bg-red-900 text-red-200');
    } catch (e) {
        console.error(e);
        // Dù lỗi dữ liệu vẫn cố mở bảng để người dùng thấy
        console.log("Có lỗi render nhưng vẫn mở bảng.");
    }

    // 3. Mở Modal
    modal.classList.remove('hidden');
    console.log("Đã xóa class hidden, modal sẽ hiện ra.");
}

function closeDiceSettings() {
    document.getElementById('dice-settings-modal').classList.add('hidden');
}

function renderDiceTags(key, arr, colorClass) {
    const container = document.getElementById(`list-${key}`);
    if (!container) return;
    container.innerHTML = '';

    arr.forEach((item, index) => {
        const span = document.createElement('span');
        span.className = `inline-flex items-center px-2 py-1 rounded text-xs ${colorClass} m-1`;
        span.innerHTML = `
            ${item} 
            <button onclick="removeDiceItem('${key}', ${index})" class="ml-2 hover:text-white opacity-70 hover:opacity-100"><i class="fas fa-times"></i></button>
        `;
        container.appendChild(span);
    });
}

function addDiceItem(key) {
    const input = document.getElementById(`input-${key}`);
    const val = input.value.trim();
    if (val) {
        currentDiceConfig[key].push(val);
        input.value = '';

        // Render lại màu sắc
        const colors = {
            'actions': 'bg-pink-900 text-pink-200',
            'bodyParts': 'bg-blue-900 text-blue-200',
            'times': 'bg-yellow-900 text-yellow-200',
            'hotActions': 'bg-red-900 text-red-200'
        };
        renderDiceTags(key, currentDiceConfig[key], colors[key]);
    }
}

function removeDiceItem(key, index) {
    currentDiceConfig[key].splice(index, 1);

    const colors = {
        'actions': 'bg-pink-900 text-pink-200',
        'bodyParts': 'bg-blue-900 text-blue-200',
        'times': 'bg-yellow-900 text-yellow-200',
        'hotActions': 'bg-red-900 text-red-200'
    };
    renderDiceTags(key, currentDiceConfig[key], colors[key]);
}

async function saveDiceSettings() {
    if (!appData.secretPin) return Modal.alert("Lỗi: Không tìm thấy PIN để mã hóa!");

    const jsonStr = JSON.stringify(currentDiceConfig);
    const encrypted = CryptoJS.AES.encrypt(jsonStr, appData.secretPin).toString();

    appData.encryptedDiceData = encrypted;
    await saveData();

    closeDiceSettings();
    Modal.showToast("Đã lưu & mã hóa dữ liệu thành công!");

    // Cập nhật lại giao diện ngay
    updateDiceMode();
}

function switchSecretTab(tab) {
    currentSecretTab = tab;
    // UI update
    document.getElementById('tab-dice').classList.add('hidden');
    document.getElementById('tab-box').classList.add('hidden');
    document.getElementById(`tab-${tab}`).classList.remove('hidden');

    document.getElementById('tab-btn-dice').className = tab === 'dice' ? "px-4 py-1.5 rounded-md text-xs font-bold bg-pink-600 text-white shadow" : "px-4 py-1.5 rounded-md text-xs font-bold text-gray-300";
    document.getElementById('tab-btn-box').className = tab === 'box' ? "px-4 py-1.5 rounded-md text-xs font-bold bg-pink-600 text-white shadow" : "px-4 py-1.5 rounded-md text-xs font-bold text-gray-300";
}

// --- B. LOGIC XÚC XẮC TÌNH YÊU ---
function updateDiceMode() {
    const container = document.getElementById('dice-container');
    if (!container) return; // Nếu chưa có khung chứa thì dừng luôn

    // --- SỬA LỖI Ở ĐÂY: Kiểm tra kỹ trước khi lấy giá trị ---
    const radioElement = document.querySelector('input[name="dice-mode"]:checked');

    // Nếu không tìm thấy nút nào được check, mặc định chọn 'combo'
    const mode = radioElement ? radioElement.value : 'combo';

    // --- PHẦN RENDER GIAO DIỆN (GIỮ NGUYÊN) ---
    if (mode === 'combo') {
        // Đảm bảo dữ liệu đã load
        if (!currentDiceConfig) loadDiceData();

        container.innerHTML = `
            <div class="grid grid-cols-1 gap-3 w-full">
                <div class="bg-gray-800 p-4 rounded-xl text-center border border-gray-700" id="dice-action-box">
                    <p class="text-[10px] text-gray-400 uppercase">Hành động</p>
                    <h3 class="text-2xl font-bold text-pink-400 mt-1" id="res-action">?</h3>
                </div>
                <div class="flex gap-3">
                    <div class="bg-gray-800 p-4 rounded-xl text-center border border-gray-700 flex-1" id="dice-part-box">
                        <p class="text-[10px] text-gray-400 uppercase">Vị trí</p>
                        <h3 class="text-xl font-bold text-blue-400 mt-1" id="res-part">?</h3>
                    </div>
                    <div class="bg-gray-800 p-4 rounded-xl text-center border border-gray-700 flex-1" id="dice-time-box">
                        <p class="text-[10px] text-gray-400 uppercase">Thời gian</p>
                        <h3 class="text-xl font-bold text-yellow-400 mt-1" id="res-time">?</h3>
                    </div>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="bg-red-900/30 p-8 rounded-2xl text-center border border-red-500/50 relative overflow-hidden">
                <div class="absolute inset-0 bg-red-500/10 animate-pulse"></div>
                <p class="text-xs text-red-300 uppercase tracking-widest mb-3 relative z-10">Thử thách Nóng bỏng</p>
                <h3 class="text-3xl font-black text-red-500 relative z-10 drop-shadow-lg" id="res-hot">???</h3>
            </div>
        `;
    }
}


// Hàm Quay Xúc Xắc (Đã sửa lỗi DICE_DATA)
function rollDice() {
    // 1. Rung nhẹ (nếu có)
    if (navigator.vibrate) navigator.vibrate(50);

    // 2. Lấy chế độ chơi hiện tại
    const radioElement = document.querySelector('input[name="dice-mode"]:checked');
    const mode = radioElement ? radioElement.value : 'combo';

    // 3. QUAN TRỌNG: Load dữ liệu cấu hình mới nhất
    // (Thay vì dùng DICE_DATA cũ, ta dùng currentDiceConfig)
    if (!currentDiceConfig) loadDiceData();
    const config = currentDiceConfig;

    // Kiểm tra xem config có dữ liệu không, nếu lỗi thì dùng mặc định ngay
    if (!config) {
        console.error("Không tìm thấy cấu hình xúc xắc!");
        return;
    }

    // 4. Hiệu ứng chạy số (Animation)
    let count = 0;
    const interval = setInterval(() => {
        if (mode === 'combo') {
            // SỬA LỖI Ở ĐÂY: Dùng config.actions thay vì DICE_DATA.actions
            if (document.getElementById('res-action'))
                document.getElementById('res-action').innerText = getRandomItem(config.actions);

            if (document.getElementById('res-part'))
                document.getElementById('res-part').innerText = getRandomItem(config.bodyParts);

            if (document.getElementById('res-time'))
                document.getElementById('res-time').innerText = getRandomItem(config.times);
        } else {
            // SỬA LỖI Ở ĐÂY: Dùng config.hotActions
            if (document.getElementById('res-hot'))
                document.getElementById('res-hot').innerText = getRandomItem(config.hotActions);
        }

        count++;
        // Dừng sau 10 lần nhảy số (khoảng 0.8 giây)
        if (count > 10) {
            clearInterval(interval);
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        }
    }, 80);
}

// Hàm hỗ trợ lấy ngẫu nhiên (nếu chưa có)
function getRandomItem(arr) {
    if (!arr || arr.length === 0) return "...";
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// --- C. LOGIC DIGITAL LOVE BOX (MÃ HÓA E2EE) ---

/* --- LOGIC TRANG BÍ MẬT (SECRET PAGE) --- */
let isSecretUnlocked = false;

// 1. Logic nhập PIN (Bàn phím ảo)
function typePin(num) {
    const input = document.getElementById('pin-input');
    if (input.value.length < 6) {
        input.value += num;
        checkAutoPin();
    }
}
function clearPin() {
    const input = document.getElementById('pin-input');
    input.value = input.value.slice(0, -1);
}

// 2. Tự động kiểm tra khi nhập đủ 6 số
function checkAutoPin() {
    const input = document.getElementById('pin-input');
    const msg = document.getElementById('lock-msg');

    if (input.value.length === 6) {
        const enteredPin = input.value;

        // Trường hợp 1: Chưa cài PIN bao giờ -> Cài mới
        if (!appData.secretPin) {
            appData.secretPin = enteredPin;
            saveData();
            Modal.showToast("Đã thiết lập mã PIN mới!");
            unlockSuccess();
        }
        // Trường hợp 2: Đã có PIN -> Kiểm tra
        else {
            if (enteredPin === appData.secretPin) {
                unlockSuccess();
            } else {
                // Rung + Báo lỗi
                if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
                input.classList.add('border-red-500', 'text-red-500');
                msg.innerText = "Sai mã PIN!";
                msg.classList.add('text-red-500');

                setTimeout(() => {
                    input.value = '';
                    input.classList.remove('border-red-500', 'text-red-500');
                    msg.innerText = "Nhập mã PIN 6 số để truy cập";
                    msg.classList.remove('text-red-500');
                }, 500);
            }
        }
    }
}


// 4. Khóa lại
function lockSecret() {
    isSecretUnlocked = false;
    document.getElementById('secret-lock-screen').classList.remove('hidden');
    document.getElementById('secret-content-area').classList.add('hidden');
}


// 8. Đổi PIN
async function changeSecretPin() {
    const newPin = await Modal.prompt("Nhập mã PIN 6 số mới:");
    if (newPin && newPin.length === 6 && !isNaN(newPin)) {
        appData.secretPin = newPin;
        await saveData();
        Modal.showToast("Đã đổi PIN thành công. Vui lòng đăng nhập lại.");
        lockSecret();
    } else {
        if (newPin !== null) Modal.alert("Mã PIN phải là 6 chữ số!");
    }
}

// 9. Quên PIN (Reset bằng cách hỏi mã cặp đôi)
async function forgotPin() {
    const confirmCode = await Modal.prompt("Nhập MÃ CẶP ĐÔI để reset PIN:");
    if (confirmCode && confirmCode.toUpperCase() === currentCoupleCode) {
        appData.secretPin = null; // Xóa PIN cũ
        await saveData();
        Modal.alert("Đã reset! Hãy nhập mã PIN mới để thiết lập lại.");
        document.getElementById('pin-input').value = '';
        checkAutoPin(); // Reset trạng thái UI
    } else {
        if (confirmCode) Modal.alert("Sai mã cặp đôi!");
    }
}

// 1. Hàm Mã hóa / Giải mã (Dùng PIN làm Key)
function encryptData(text) {
    if (!appData.secretPin) return text;
    try {
        return CryptoJS.AES.encrypt(text, appData.secretPin).toString();
    } catch (e) { return text; }
}

// Hàm giải mã (Đã sửa lỗi hiển thị khi nội dung trống)
function decryptData(cipherText) {
    if (!appData.secretPin) return cipherText;
    if (!cipherText) return ""; // Nếu không có dữ liệu thì trả về rỗng ngay

    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, appData.secretPin);
        const str = bytes.toString(CryptoJS.enc.Utf8);

        // Cũ: return str || "Lỗi giải mã..."; (Nguyên nhân gây lỗi)
        // Mới: Trả về chính xác những gì giải mã được
        return str;
    } catch (e) {
        return ""; // Nếu lỗi thật sự thì trả về rỗng cho sạch giao diện
    }
}

// 2. Thêm Điều ước vào Hộp
async function addWishToBox() {
    const input = document.getElementById('wish-input');
    const content = input.value.trim();

    if (!content) return Modal.alert("Hãy nhập điều bạn muốn!");

    const currentUser = appData[`user${myUserIndex}`];

    // Mã hóa nội dung trước khi lưu
    const encryptedContent = encryptData(content);

    const newWish = {
        id: Date.now().toString(),
        authorId: currentUser.id, // Ai là người ước
        content: encryptedContent, // Nội dung mật
        isOpened: false,
        openedBy: null,
        openedDate: null
    };

    if (!appData.loveBox) appData.loveBox = [];
    appData.loveBox.push(newWish);

    await saveData();
    input.value = '';
    Modal.showToast("Đã gửi yêu cầu bí mật vào hộp! 💌");
}

// 3. Mở Hộp (Random & Check Limit)
async function openMysteryBox() {
    const currentUser = appData[`user${myUserIndex}`];
    const today = new Date().toDateString();

    // // Kiểm tra giới hạn 1 ngày/lần
    // if (!appData.lastBoxOpen) appData.lastBoxOpen = { u1: 0, u2: 0 };

    // const lastTime = appData.lastBoxOpen[`u${myUserIndex}`];
    // if (lastTime && new Date(lastTime).toDateString() === today) {
    //     return Modal.alert("Hôm nay bạn đã mở hộp rồi! Hãy quay lại vào ngày mai nhé.");
    // }

    // Lọc ra các điều ước CỦA ĐỐI PHƯƠNG mà CHƯA MỞ
    // (Logic: Mình mở hộp để xem đối phương muốn mình làm gì)
    const availableWishes = (appData.loveBox || []).filter(w =>
        w.authorId !== currentUser.id && !w.isOpened
    );

    if (availableWishes.length === 0) {
        return Modal.alert("Hộp đang trống hoặc bạn đã thực hiện hết yêu cầu của người ấy rồi! Hãy bảo người ấy thêm vào nhé.");
    }

    // Random chọn 1
    const luckyWish = availableWishes[Math.floor(Math.random() * availableWishes.length)];

    // Giải mã nội dung
    const decryptedContent = decryptData(luckyWish.content);

    // Hiển thị kết quả
    document.getElementById('mystery-box').classList.add('hidden');
    const resultBox = document.getElementById('box-result');
    const resultText = document.getElementById('box-result-text');

    resultBox.classList.remove('hidden');
    resultBox.classList.add('animate-zoom-in');
    resultText.innerText = decryptedContent;

    // Cập nhật trạng thái "Đã mở"
    luckyWish.isOpened = true;
    luckyWish.openedBy = currentUser.id;
    luckyWish.openedDate = new Date().toISOString();

    // Cập nhật timestamp mở hộp của user này
    appData.lastBoxOpen[`u${myUserIndex}`] = Date.now();

    await saveData();

    // Hiệu ứng pháo hoa nhẹ
    triggerHeartRain();
}

// --- D. KẾT NỐI VÀO HÀM UNLOCK SUCCESS ---
function unlockSuccess() {
    isSecretUnlocked = true;
    document.getElementById('secret-lock-screen').classList.add('hidden');
    document.getElementById('secret-content-area').classList.remove('hidden');
    document.getElementById('pin-input').value = '';

    switchSecretTab('dice');

    loadDiceData(); // <--- THÊM DÒNG NÀY ĐỂ GIẢI MÃ NGAY KHI MỞ KHÓA
    updateDiceMode();
}

/* --- LOGIC LOVE BOX NÂNG CẤP (GIFTING & HISTORY) --- */

// 1. Chuyển đổi giao diện Chơi / Lịch sử
function switchBoxMode(mode) {
    const btnPlay = document.getElementById('btn-box-play');
    const btnHistory = document.getElementById('btn-box-history');
    const viewPlay = document.getElementById('box-view-play');
    const viewHistory = document.getElementById('box-view-history');

    if (mode === 'play') {
        viewPlay.classList.remove('hidden');
        viewHistory.classList.add('hidden');
        btnPlay.className = "px-6 py-1.5 rounded-lg text-xs font-bold bg-pink-600 text-white shadow transition";
        btnHistory.className = "px-6 py-1.5 rounded-lg text-xs font-bold text-gray-400 hover:text-white transition";
        updateTurnDisplay(); // Cập nhật số lượt hiển thị
    } else {
        viewPlay.classList.add('hidden');
        viewHistory.classList.remove('hidden');
        btnPlay.className = "px-6 py-1.5 rounded-lg text-xs font-bold text-gray-400 hover:text-white transition";
        btnHistory.className = "px-6 py-1.5 rounded-lg text-xs font-bold bg-gray-700 text-white shadow transition";
        renderBoxHistory(); // Tải lịch sử
    }
}

// 2. Hiển thị số lượt còn lại
function updateTurnDisplay() {
    const badge = document.getElementById('turn-badge');
    if (!badge) return;

    // Lấy thông tin
    const today = new Date().toDateString();
    if (!appData.lastBoxOpen) appData.lastBoxOpen = { u1: 0, u2: 0 };
    const lastOpen = appData.lastBoxOpen[`u${myUserIndex}`];

    // Check lượt miễn phí
    const hasFreeTurn = (!lastOpen || new Date(lastOpen).toDateString() !== today);

    // Check lượt được tặng
    if (!appData.giftedOpens) appData.giftedOpens = { u1: 0, u2: 0 };
    const giftedCount = appData.giftedOpens[`u${myUserIndex}`] || 0;

    badge.innerHTML = `<i class="fas fa-clock"></i> Hôm nay: ${hasFreeTurn ? '1' : '0'} &nbsp;|&nbsp; <i class="fas fa-gift"></i> Được tặng: ${giftedCount}`;
}

// 3. Hàm Tặng lượt cho đối phương
async function sendGift() {
    const input = document.getElementById('gift-amount');
    const amount = parseInt(input.value);

    if (!amount || amount <= 0) return Modal.alert("Số lượng không hợp lệ!");

    // Xác định ID đối phương (Nếu mình là u1 thì tặng u2 và ngược lại)
    const partnerKey = myUserIndex === 1 ? 'u2' : 'u1';

    if (!appData.giftedOpens) appData.giftedOpens = { u1: 0, u2: 0 };

    // Cộng lượt cho đối phương
    appData.giftedOpens[partnerKey] = (appData.giftedOpens[partnerKey] || 0) + amount;

    await saveData();

    Modal.showToast(`Đã tặng ${amount} lượt mở cho người ấy! ❤️`);
    input.value = 1;
}

// 4. Mở Hộp (Logic mới: Ngẫu nhiên + Check lượt)
async function openMysteryBox() {
    const currentUser = appData[`user${myUserIndex}`];
    const today = new Date().toDateString();

    // --- KIỂM TRA LƯỢT ---
    if (!appData.lastBoxOpen) appData.lastBoxOpen = { u1: 0, u2: 0 };
    if (!appData.giftedOpens) appData.giftedOpens = { u1: 0, u2: 0 };

    const lastOpen = appData.lastBoxOpen[`u${myUserIndex}`];
    const hasFreeTurn = (!lastOpen || new Date(lastOpen).toDateString() !== today);
    let giftedCount = appData.giftedOpens[`u${myUserIndex}`] || 0;

    let useGift = false;

    if (!hasFreeTurn) {
        if (giftedCount > 0) {
            useGift = true; // Dùng lượt tặng
        } else {
            return Modal.alert("Bạn đã hết lượt hôm nay! Hãy bảo người ấy tặng thêm lượt nhé.");
        }
    }

    // --- TÌM ĐIỀU ƯỚC ---
    // Chỉ lấy điều ước CỦA ĐỐI PHƯƠNG mà CHƯA MỞ
    const availableWishes = (appData.loveBox || []).filter(w =>
        w.authorId !== currentUser.id && !w.isOpened
    );

    if (availableWishes.length === 0) {
        return Modal.alert("Hộp rỗng! Hãy bảo người ấy gửi thêm yêu cầu đi.");
    }

    // --- CHỌN NGẪU NHIÊN ---
    const luckyWish = availableWishes[Math.floor(Math.random() * availableWishes.length)];

    // --- XỬ LÝ KẾT QUẢ ---
    // 1. Trừ lượt
    if (useGift) {
        appData.giftedOpens[`u${myUserIndex}`]--;
        Modal.showToast("Đã dùng 1 lượt được tặng!");
    } else {
        // Đánh dấu đã dùng lượt miễn phí hôm nay
        appData.lastBoxOpen[`u${myUserIndex}`] = Date.now();
    }

    // 2. Cập nhật trạng thái Wish
    luckyWish.isOpened = true;
    luckyWish.openedBy = currentUser.id;
    luckyWish.openedDate = new Date().toISOString();

    // 3. Lưu & Hiển thị
    await saveData();
    updateTurnDisplay(); // Cập nhật lại UI số lượt

    // Giải mã
    const decryptedContent = decryptData(luckyWish.content);

    // Hiển thị Popup
    document.getElementById('box-result').classList.remove('hidden');
    document.getElementById('box-result-text').innerText = decryptedContent;
    document.getElementById('mystery-box').classList.add('opacity-50', 'pointer-events-none');

    triggerHeartRain();
}

function closeBoxResult() {
    document.getElementById('box-result').classList.add('hidden');
    document.getElementById('mystery-box').classList.remove('opacity-50', 'pointer-events-none');
}

// 5. Render Lịch sử
function renderBoxHistory() {
    const list = document.getElementById('box-history-list');
    list.innerHTML = '';

    // Lọc ra những cái ĐÃ MỞ
    const historyItems = (appData.loveBox || [])
        .filter(w => w.isOpened)
        .sort((a, b) => new Date(b.openedDate) - new Date(a.openedDate)); // Mới nhất lên đầu

    if (historyItems.length === 0) {
        list.innerHTML = '<p class="text-center text-gray-500 text-xs mt-10">Chưa có lịch sử mở hộp.</p>';
        return;
    }

    historyItems.forEach(item => {
        // Ai mở?
        const opener = (item.openedBy === appData.user1.id) ? appData.user1 : appData.user2;
        const dateStr = new Date(item.openedDate).toLocaleString('vi-VN');
        const content = decryptData(item.content);

        // Màu sắc khác nhau tùy người mở
        const isMe = (item.openedBy === appData[`user${myUserIndex}`].id);
        const bgClass = isMe ? 'bg-gray-800 border-l-4 border-pink-500' : 'bg-gray-800 border-l-4 border-blue-500';

        const html = `
            <div class="${bgClass} p-4 rounded-r-xl shadow-sm border-y border-r border-gray-700">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center gap-2">
                        <img src="${opener.avatar}" class="w-5 h-5 rounded-full border border-gray-500">
                        <span class="text-xs font-bold text-gray-300">${isMe ? 'Bạn' : opener.name} đã mở</span>
                    </div>
                    <span class="text-[10px] text-gray-500">${dateStr}</span>
                </div>
                <p class="text-sm text-white font-medium leading-relaxed">"${content}"</p>
            </div>
        `;
        list.innerHTML += html;
    });
}

/* --- NÂNG CẤP SECRET TAB (POSITIONS & NOTES) --- */

// 1. Cập nhật hàm switchSecretTab
function switchSecretTab(tab) {
    currentSecretTab = tab;

    // Ẩn tất cả tab content
    ['dice', 'box', 'positions', 'notes'].forEach(t => {
        const el = document.getElementById(`tab-${t}`);
        const btn = document.getElementById(`tab-btn-${t}`);
        if (el) el.classList.add('hidden');

        // Style Active/Inactive
        if (btn) {
            if (t === tab) {
                btn.className = "flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-bold bg-pink-600 text-white shadow transition";
            } else {
                btn.className = "flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-bold text-gray-400 hover:text-white transition hover:bg-gray-700";
            }
        }
    });

    // Hiện tab được chọn
    document.getElementById(`tab-${tab}`).classList.remove('hidden');

    // Init data cho từng tab
    if (tab === 'positions') updatePositionUI();
    if (tab === 'notes') renderSecretNotes();
}

/* --- LOGIC TAB 3: TƯ THẾ (POSITIONS) --- */
const TOTAL_POSITIONS = 100;
const POS_BASE_URL = "https://naughtygrin.com/imgs/ksutra/"; // Thay bằng link thật của bạn

// --- 1. CÁC HÀM ĐIỀU HƯỚNG CƠ BẢN (Cập nhật để tương thích data mới) ---
function ensurePosData() {
    if (!appData.secretPositions) {
        appData.secretPositions = { current: 1, skipDone: false, reviews: {} };
    }
    // Migration: Nếu data cũ là mảng doneList, reset về object reviews (Chấp nhận mất data cũ để lên đời)
    if (Array.isArray(appData.secretPositions.doneList)) {
        appData.secretPositions.reviews = {};
        delete appData.secretPositions.doneList;
    }
    if (!appData.secretPositions.reviews) appData.secretPositions.reviews = {};
}

function navPosition(direction) {
    ensurePosData();
    let next = appData.secretPositions.current + direction;
    if (next > TOTAL_POSITIONS) next = 1;
    if (next < 1) next = TOTAL_POSITIONS;
    appData.secretPositions.current = next;
    saveData();
    updatePositionUI();
}

function jumpToPosition(val) {
    ensurePosData();
    let num = parseInt(val);
    if (isNaN(num) || num < 1) num = 1;
    if (num > TOTAL_POSITIONS) num = TOTAL_POSITIONS;
    appData.secretPositions.current = num;
    saveData();
    updatePositionUI();
}

function randomPosition() {
    ensurePosData();
    const { skipDone, reviews } = appData.secretPositions;
    let available = [];
    for (let i = 1; i <= TOTAL_POSITIONS; i++) {
        // Nếu bật Skip Done: Kiểm tra xem tư thế này đã có ai review chưa
        if (skipDone && reviews[i] && (reviews[i].u1 || reviews[i].u2)) continue;
        available.push(i);
    }

    if (available.length === 0) return Modal.alert("Đã hết tư thế mới! Hãy tắt 'Bỏ qua đã làm' để xem lại.");

    const random = available[Math.floor(Math.random() * available.length)];
    appData.secretPositions.current = random;
    if (navigator.vibrate) navigator.vibrate(50);
    saveData();
    updatePositionUI();
}

async function toggleSkipDone() {
    const chk = document.getElementById('chk-skip-done');
    ensurePosData();
    appData.secretPositions.skipDone = chk.checked;
    await saveData();
}

// --- 2. HÀM CẬP NHẬT GIAO DIỆN (QUAN TRỌNG NHẤT) ---
function updatePositionUI() {
    ensurePosData();
    const posId = appData.secretPositions.current;
    const reviews = appData.secretPositions.reviews[posId] || { u1: null, u2: null };

    // Basic UI
    document.getElementById('pos-number').innerText = posId;
    document.getElementById('pos-image').src = `${POS_BASE_URL}${posId}.jpg`;
    document.getElementById('pos-input').value = posId;
    document.getElementById('chk-skip-done').checked = appData.secretPositions.skipDone;

    // --- XỬ LÝ TRẠNG THÁI NÚT & OVERLAY ---
    const btnDone = document.getElementById('btn-mark-done');
    const overlay = document.getElementById('pos-done-overlay');
    const overlayText = document.getElementById('pos-done-text');

    const myKey = `u${myUserIndex}`; // u1 hoặc u2
    const partnerKey = myKey === 'u1' ? 'u2' : 'u1';
    const iHaveReviewed = !!reviews[myKey];
    const partnerHasReviewed = !!reviews[partnerKey];

    if (iHaveReviewed) {
        // Mình đã review -> Nút chuyển sang trạng thái "Đã đánh giá"
        btnDone.className = "h-10 px-3 rounded-xl text-xs font-bold active:scale-95 transition flex items-center gap-1 whitespace-nowrap bg-gray-800 text-green-400 border border-green-500/50 shadow-green-500/20 shadow";
        btnDone.innerHTML = '<i class="fas fa-check-circle"></i> Đã đánh giá (Sửa)';
    } else {
        // Mình chưa review -> Nút "Xong" bình thường
        btnDone.className = "h-10 px-3 rounded-xl text-xs font-bold active:scale-95 transition flex items-center gap-1 whitespace-nowrap bg-gray-700 text-gray-300 hover:text-white";
        btnDone.innerHTML = '<i class="fas fa-check"></i> Xong';
    }

    // Hiện Overlay nếu ÍT NHẤT 1 người đã làm
    if (iHaveReviewed || partnerHasReviewed) {
        overlay.classList.remove('hidden');
        if (iHaveReviewed && partnerHasReviewed) overlayText.innerText = "CẢ HAI ĐÃ THỰC HIỆN! ❤️‍🔥";
        else if (iHaveReviewed) overlayText.innerText = "BẠN ĐÃ THỰC HIỆN!";
        else overlayText.innerText = "ĐỐI PHƯƠNG ĐÃ THỰC HIỆN!";
    } else {
        overlay.classList.add('hidden');
    }

    // --- HIỂN THỊ REVIEW BÊN DƯỚI (GIẢI MÃ E2EE) ---
    renderReviewBox('u1', reviews.u1);
    renderReviewBox('u2', reviews.u2);

    // Ẩn hiện thông báo "Chưa có review"
    if (!reviews.u1 && !reviews.u2) {
        document.getElementById('no-review-msg').classList.remove('hidden');
    } else {
        document.getElementById('no-review-msg').classList.add('hidden');
    }
}

function renderReviewBox(userKey, reviewData) {
    const box = document.getElementById(`review-${userKey}`);
    if (!box) return;

    if (!reviewData) {
        box.classList.add('hidden');
        return;
    }
    box.classList.remove('hidden');

    // Xử lý User Info an toàn
    const user = appData[userKey] || {
        name: (userKey === 'u1' ? 'Bạn Nữ' : 'Bạn Nam'),
        avatar: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
    };

    const avatarEl = document.getElementById(`avatar-${userKey}-review`);
    const nameEl = document.getElementById(`name-${userKey}-review`);

    if (avatarEl) avatarEl.src = user.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
    if (nameEl) nameEl.innerText = user.name || 'Người dùng';

    // Hiển thị Rating
    const emojis = ['😫', '😐', '🤭', '🤤', '🤩'];
    const ratingEmoji = emojis[reviewData.rating - 1] || '❓';
    document.getElementById(`rating-${userKey}-display`).innerText = `${ratingEmoji} (Mức ${reviewData.rating})`;

    // --- CẬP NHẬT MỚI Ở ĐÂY ---
    let decryptedComment = decryptData(reviewData.comment);

    // Nếu nội dung trống -> Hiển thị text mặc định
    if (!decryptedComment || decryptedComment.trim() === "") {
        decryptedComment = "Đã thực hiện ✓";
    }

    document.getElementById(`comment-${userKey}-display`).innerText = decryptedComment;
}


// --- 3. CÁC HÀM XỬ LÝ MODAL ĐÁNH GIÁ ---

// Mở Modal
// 1. Cập nhật hàm Mở Modal (Để hiện nút xóa)
function openPositionReviewModal() {
    ensurePosData();
    const posId = appData.secretPositions.current;
    const myKey = `u${myUserIndex}`;
    const reviews = appData.secretPositions.reviews[posId];

    // Cập nhật số thứ tự trên tiêu đề
    document.getElementById('modal-pos-num').innerText = posId;

    // Mở Modal
    const modal = document.getElementById('pos-review-modal');
    if (modal) modal.classList.remove('hidden');

    // Reset form
    selectRating(0);
    document.getElementById('review-comment').value = '';

    const btnDelete = document.getElementById('btn-delete-review');

    if (reviews && reviews[myKey]) {
        // TRƯỜNG HỢP: ĐÃ ĐÁNH GIÁ (CHẾ ĐỘ SỬA)
        selectRating(reviews[myKey].rating);
        document.getElementById('review-comment').value = decryptData(reviews[myKey].comment);

        // Hiện nút xóa
        if (btnDelete) btnDelete.classList.remove('hidden');

        Modal.showToast("Bạn đang sửa lại đánh giá cũ.");
    } else {
        // TRƯỜNG HỢP: MỚI TINH
        // Ẩn nút xóa
        if (btnDelete) btnDelete.classList.add('hidden');
    }
}

// 2. Hàm Xóa Đánh giá (MỚI)
async function deletePositionReview() {
    // Hỏi xác nhận
    if (!await Modal.confirm("Bạn có chắc muốn xóa cảm nhận và bỏ đánh dấu 'Đã làm' tư thế này không?")) {
        return;
    }

    ensurePosData();
    const posId = appData.secretPositions.current;
    const myKey = `u${myUserIndex}`;

    // Xóa dữ liệu của user hiện tại
    if (appData.secretPositions.reviews[posId]) {
        delete appData.secretPositions.reviews[posId][myKey];

        // Nếu cả 2 đều không còn review nào thì xóa luôn key tư thế đó cho sạch data
        if (!appData.secretPositions.reviews[posId].u1 && !appData.secretPositions.reviews[posId].u2) {
            delete appData.secretPositions.reviews[posId];
        }
    }

    await saveData();
    closePositionReviewModal();
    updatePositionUI(); // Cập nhật lại giao diện (sẽ mất overlay "Đã làm")
    Modal.showToast("Đã xóa đánh giá thành công!");
}

// Đóng Modal
function closePositionReviewModal() {
    document.getElementById('pos-review-modal').classList.add('hidden');
}

// Chọn mức độ (Rating) trong Modal
function selectRating(rating) {
    document.getElementById('selected-rating').value = rating;
    document.querySelectorAll('.rating-btn').forEach(btn => {
        const btnRating = parseInt(btn.getAttribute('data-rating'));
        if (btnRating === rating) {
            btn.classList.remove('grayscale', 'opacity-50');
            btn.classList.add('scale-125'); // Phóng to icon được chọn
        } else {
            btn.classList.add('grayscale', 'opacity-50');
            btn.classList.remove('scale-125');
        }
    });
}

// LƯU ĐÁNH GIÁ (MÃ HÓA E2EE)
async function savePositionReview() {
    const rating = parseInt(document.getElementById('selected-rating').value);
    const comment = document.getElementById('review-comment').value.trim();

    if (rating === 0) return Modal.alert("Vui lòng chọn mức độ khoái cảm!");

    // Mã hóa comment
    const encryptedComment = encryptData(comment);

    ensurePosData();
    const posId = appData.secretPositions.current;
    const myKey = `u${myUserIndex}`;

    // Tạo object review nếu chưa có cho tư thế này
    if (!appData.secretPositions.reviews[posId]) {
        appData.secretPositions.reviews[posId] = { u1: null, u2: null };
    }

    // Lưu dữ liệu của mình vào
    appData.secretPositions.reviews[posId][myKey] = {
        rating: rating,
        comment: encryptedComment,
        date: new Date().toISOString()
    };

    await saveData();
    closePositionReviewModal();
    updatePositionUI();
    triggerHeartRain(); // Pháo hoa chúc mừng
    Modal.showToast("Đã lưu cảm nhận bí mật! 🤫");
}

/* --- LOGIC TAB 4: GHI CHÚ BÍ MẬT (NOTES - E2EE) --- */
/* --- LOGIC GHI CHÚ PRO (SEARCH, COLORS, PIN) --- */

// Biến tạm
let tempNoteFiles = [];
let editingNoteId = null;
let currentNoteColor = 'gray';
let isNotePinned = false;

// 1. Render Ghi chú (Có Tìm kiếm & Masonry)
function renderSecretNotes() {
    const list = document.getElementById('secret-notes-list');
    const searchKeyword = document.getElementById('note-search').value.toLowerCase();

    list.innerHTML = '';
    const notes = appData.secretNotes || [];

    if (notes.length === 0) {
        list.innerHTML = `<div class="col-span-2 text-center text-gray-500 mt-10"><i class="fas fa-feather-alt text-4xl mb-3 opacity-50"></i><p class="text-xs">Chưa có ghi chú nào</p></div>`;
        return;
    }

    // Xử lý dữ liệu: Giải mã -> Lọc -> Sắp xếp
    const processedNotes = notes.map(n => {
        return {
            ...n,
            decryptedTitle: decryptData(n.title),
            decryptedContent: decryptData(n.content),
            decryptedTags: n.tags ? decryptData(n.tags) : ""
        };
    }).filter(n => {
        // Logic Tìm kiếm
        if (!searchKeyword) return true;
        return n.decryptedTitle.toLowerCase().includes(searchKeyword) ||
            n.decryptedContent.toLowerCase().includes(searchKeyword) ||
            n.decryptedTags.toLowerCase().includes(searchKeyword);
    }).sort((a, b) => {
        // Sắp xếp: Ghim lên đầu -> Mới nhất
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.date) - new Date(a.date);
    });

    // Render ra HTML
    processedNotes.forEach(n => {
        // Map màu sắc sang class Tailwind
        const colorClasses = {
            'gray': 'bg-gray-800 border-gray-700',
            'pink': 'bg-pink-900/40 border-pink-500/30',
            'blue': 'bg-blue-900/40 border-blue-500/30',
            'yellow': 'bg-yellow-900/40 border-yellow-500/30'
        };
        const bgClass = colorClasses[n.color] || colorClasses['gray'];

        // Xử lý hiển thị
        const title = n.decryptedTitle || "(Không tiêu đề)";
// Tạo một thẻ ảo để strip HTML tag, lấy plain text
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = n.decryptedContent;
        const plainText = tempDiv.innerText || tempDiv.textContent || "";
        
        const contentPreview = plainText.slice(0, 100) + (plainText.length > 100 ? '...' : '');        const dateStr = new Date(n.date).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
        const pinIcon = n.pinned ? '<i class="fas fa-thumbtack text-yellow-500 text-xs absolute top-3 right-3 transform rotate-45"></i>' : '';
        const fileBadge = (n.files && n.files.length > 0) ? `<span class="bg-black/30 px-2 py-0.5 rounded text-[10px] text-gray-300"><i class="fas fa-paperclip"></i> ${n.files.length}</span>` : '';
        const tagBadge = n.decryptedTags ? `<span class="text-[10px] text-pink-400 font-bold">#${n.decryptedTags}</span>` : '';

        const html = `
            <div onclick="openNoteEditor('${n.id}')" class="note-item ${bgClass} p-4 rounded-2xl border active:scale-[0.98] transition cursor-pointer relative overflow-hidden group">
                ${pinIcon}
                <h3 class="font-bold text-white text-sm mb-1 leading-tight ${n.pinned ? 'pr-6' : ''}">${title}</h3>
                <p class="text-gray-300 text-xs leading-relaxed mb-3 break-words whitespace-pre-wrap font-light">${contentPreview}</p>
                
                <div class="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                    <span class="text-[10px] text-gray-500">${dateStr}</span>
                    <div class="flex gap-2">
                        ${tagBadge}
                        ${fileBadge}
                    </div>
                </div>
                
                <button onclick="event.stopPropagation(); deleteSecretNote('${n.id}')" class="absolute bottom-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg translate-y-2 group-hover:translate-y-0">
                    <i class="fas fa-trash text-xs"></i>
                </button>
            </div>
        `;
        list.innerHTML += html;
    });
}

// 2. Mở Editor (Load đầy đủ thông tin)
/* --- LOGIC RICH TEXT EDITOR --- */

// 1. Hàm xử lý định dạng (Bold, Italic, Color...)
function formatDoc(cmd, value = null) {
    if (value) {
        document.execCommand(cmd, false, value);
    } else {
        document.execCommand(cmd);
    }
    // Focus lại vào ô soạn thảo để người dùng gõ tiếp
    document.getElementById('note-content-rich').focus();
}

// 2. Cập nhật hàm OPEN EDITOR (Để load HTML)
function openNoteEditor(id = null) {
    document.getElementById('note-list-view').classList.add('hidden');
    document.getElementById('note-toolbar').classList.add('hidden');
    document.getElementById('note-editor-view').classList.remove('hidden');

    editingNoteId = id;
    tempNoteFiles = [];

    // Reset UI
    document.getElementById('note-title').value = '';

    // --- KHÁC BIỆT: Dùng innerHTML cho Rich Text ---
    document.getElementById('note-content-rich').innerHTML = '';

    document.getElementById('note-tags').value = '';
    document.getElementById('note-date-display').innerText = "Hôm nay " + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    // Reset Toolbar inputs
    document.getElementById('text-color-picker').value = '#ffffff';

    isNotePinned = false;
    updatePinButton();

    if (id) {
        // Chế độ Sửa
        const note = appData.secretNotes.find(n => n.id === id);
        if (note) {
            document.getElementById('note-title').value = decryptData(note.title);

            // --- KHÁC BIỆT: Load nội dung HTML ---
            // Lưu ý: Nội dung đã được mã hóa toàn bộ chuỗi HTML
            document.getElementById('note-content-rich').innerHTML = decryptData(note.content);

            document.getElementById('note-tags').value = note.tags ? decryptData(note.tags) : "";
            tempNoteFiles = note.files || [];
            isNotePinned = note.pinned || false;
            updatePinButton();

            const d = new Date(note.date);
            document.getElementById('note-date-display').innerText = d.toLocaleDateString('vi-VN') + " lúc " + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        }
    }
    renderNoteFilesPreview();
}

// 3. Cập nhật hàm SAVE NOTE (Để lưu HTML)
async function saveSecretNote() {
    const title = document.getElementById('note-title').value.trim();

    // --- KHÁC BIỆT: Lấy innerHTML thay vì value ---
    const contentHTML = document.getElementById('note-content-rich').innerHTML;
    const contentText = document.getElementById('note-content-rich').innerText.trim(); // Dùng để check rỗng

    const tags = document.getElementById('note-tags').value.trim();

    // Kiểm tra nếu không có gì thì không lưu
    if (!title && !contentText && tempNoteFiles.length === 0 && !contentHTML.includes('<img')) return closeNoteEditor();

    if (!appData.secretNotes) appData.secretNotes = [];

    // Mã hóa
    const encTitle = encryptData(title);
    // Mã hóa toàn bộ chuỗi HTML (bao gồm các thẻ <b>, <span style="color:...">...)
    const encContent = encryptData(contentHTML);
    const encTags = encryptData(tags);

    const noteData = {
        title: encTitle,
        content: encContent, // Lưu HTML đã mã hóa
        tags: encTags,
        files: tempNoteFiles,
        pinned: isNotePinned,
        color: 'gray', // Mặc định gray vì giờ ta chỉnh màu chữ bên trong rồi
        date: new Date().toISOString()
    };

    if (editingNoteId) {
        const index = appData.secretNotes.findIndex(n => n.id === editingNoteId);
        if (index !== -1) {
            appData.secretNotes[index] = { ...appData.secretNotes[index], ...noteData };
        }
    } else {
        appData.secretNotes.unshift({ id: Date.now().toString(), ...noteData });
    }

    await saveData();
    Modal.showToast("Đã lưu ghi chú!");
    closeNoteEditor();
}



// 3. Đóng Editor
function closeNoteEditor() {
    document.getElementById('note-editor-view').classList.add('hidden');
    document.getElementById('note-list-view').classList.remove('hidden');
    document.getElementById('note-toolbar').classList.remove('hidden');
    renderSecretNotes();
}

// 4. Các hàm chức năng trong Editor
function setNoteColor(color) {
    currentNoteColor = color;
    // Thay đổi màu nền Editor để preview ngay lập tức
    const editorBody = document.getElementById('editor-body');
    const colorClasses = {
        'gray': 'bg-transparent', // Mặc định trong editor là trong suốt (nền đen của cha)
        'pink': 'bg-pink-900/20',
        'blue': 'bg-blue-900/20',
        'yellow': 'bg-yellow-900/20'
    };
    // Reset classes cũ
    editorBody.className = `flex-1 overflow-y-auto p-4 transition-colors duration-500 ${colorClasses[color]}`;
}

function togglePinNote() {
    isNotePinned = !isNotePinned;
    updatePinButton();
    Modal.showToast(isNotePinned ? "Đã ghim ghi chú" : "Đã bỏ ghim");
}

function updatePinButton() {
    const btn = document.getElementById('btn-pin-note');
    if (isNotePinned) {
        btn.classList.add('text-yellow-400');
        btn.classList.remove('text-gray-500');
    } else {
        btn.classList.add('text-gray-500');
        btn.classList.remove('text-yellow-400');
    }
}


// 6. Xử lý File (Giữ nguyên logic cũ, chỉ cập nhật UI preview)
// (Bạn dùng lại hàm handleSecretNoteFiles và renderNoteFilesPreview cũ là được, hoặc copy lại nếu cần)
/* --- CÁC HÀM HỖ TRỢ FILE ĐÍNH KÈM CHO GHI CHÚ --- */

// 1. Xử lý khi chọn file từ máy
async function handleSecretNoteFiles(input) {
    const files = input.files;
    if (!files || files.length === 0) return;

    Modal.showToast("Đang mã hóa & tải lên...");
    
    try {
        for (const file of files) {
            // Giả sử bạn đã có hàm uploadToSupabase từ các phần trước
            // Nếu chưa có, file sẽ không upload được. Hãy báo tôi nếu cần hàm này.
            const url = await uploadToSupabase(file, 'secrets'); 
            
            const type = file.type.startsWith('image') ? 'image' : (file.type.startsWith('video') ? 'video' : 'file');
            
            // Thêm vào mảng tạm
            tempNoteFiles.push({ 
                url: url, 
                type: type, 
                name: file.name 
            });
        }
        
        // Render lại giao diện
        renderNoteFilesPreview();
        Modal.showToast("Đã thêm file thành công!");
    } catch (e) {
        console.error(e);
        Modal.alert("Lỗi upload: " + (e.message || "Kiểm tra kết nối mạng"));
    } finally {
        input.value = ''; // Reset input để chọn lại file trùng tên được
    }
}

// 2. Hiển thị danh sách file (Fix lỗi ReferenceError)
function renderNoteFilesPreview() {
    const container = document.getElementById('note-files-preview');
    if (!container) return;
    
    container.innerHTML = '';
    
    tempNoteFiles.forEach((f, idx) => {
        let content = '';
        
        // Tùy chỉnh hiển thị theo loại file
        if (f.type === 'image') {
            content = `<img src="${f.url}" class="w-full h-full object-cover transition-transform group-hover:scale-110">`;
        } else if (f.type === 'video') {
            content = `<div class="bg-gray-800 w-full h-full flex items-center justify-center"><i class="fas fa-video text-pink-500 text-xl"></i></div>`;
        } else {
            content = `
                <div class="bg-gray-800 w-full h-full flex flex-col items-center justify-center p-2 text-center">
                    <i class="fas fa-file-alt text-gray-400 text-xl mb-1"></i>
                    <span class="text-[8px] text-gray-400 w-full truncate">${f.name}</span>
                </div>`;
        }

        // Tạo thẻ HTML
        const div = document.createElement('div');
        div.className = "relative aspect-square rounded-xl overflow-hidden border border-gray-700/50 group bg-gray-800 cursor-pointer shadow-sm";
        div.innerHTML = `
            ${content}
            
            <button onclick="removeTempFile(${idx})" class="absolute top-1 right-1 w-6 h-6 bg-red-600/90 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow-lg z-10 hover:scale-110">
                <i class="fas fa-times"></i>
            </button>
            
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition pointer-events-none"></div>
        `;
        container.appendChild(div);
    });
}

// 3. Xóa file khỏi danh sách tạm
function removeTempFile(index) {
    tempNoteFiles.splice(index, 1);
    renderNoteFilesPreview();
}
window.onload = initApp;