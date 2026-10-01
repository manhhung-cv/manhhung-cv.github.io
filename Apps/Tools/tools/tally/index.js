// tools/tally/index.js
import { UI } from '../../js/ui.js';

// =============================================================================
// 0. THEME & ACCENT CONTROLLER
// =============================================================================
const DEFAULT_EMERALD = '#10b981';

export const ThemeKit = {
    getAccentColor: () => {
        return localStorage.getItem('hunqos_accent_color') || 
               localStorage.getItem('hunqos_icon_custom_bg') || 
               DEFAULT_EMERALD;
    },
    applyAccent: (container) => {
        if (!container) return;
        const accent = ThemeKit.getAccentColor();
        container.style.setProperty('--kit-accent', accent);
    }
};

// =============================================================================
// 1. TEMPLATE RENDERER
// =============================================================================
export function template() {
    return `
    <div id="tally-root" class="w-full h-full bg-[#f5f5f7] dark:bg-[#000000] text-zinc-900 dark:text-zinc-100 overflow-hidden font-sans transition-colors duration-200 flex flex-col select-none">
        
        <style>
            #tally-root {
                --kit-accent: #10b981;
            }
            .bg-accent-theme { background-color: var(--kit-accent) !important; }
            .text-accent-theme { color: var(--kit-accent) !important; }
            .border-accent-theme { border-color: var(--kit-accent) !important; }
            .bg-accent-theme-alpha { background-color: color-mix(in srgb, var(--kit-accent) 14%, transparent) !important; }
            .hover-bg-accent-theme-alpha:hover { background-color: color-mix(in srgb, var(--kit-accent) 22%, transparent) !important; }

            /* Ẩn con trỏ tăng giảm số mặc định */
            #tally-root input[type=number]::-webkit-inner-spin-button,
            #tally-root input[type=number]::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
            #tally-root input[type=number] {
                -moz-appearance: textfield;
            }
        </style>

        <!-- SUB HEADER CỦA TOOL TALLY -->
        <header class="w-full shrink-0 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-[#121215]/80 backdrop-blur-md z-20">
            <div class="max-w-5xl mx-auto px-3.5 sm:px-6 py-2.5 flex items-center justify-between gap-3">
                <div class="flex items-center gap-2.5 min-w-0">
                    <div class="w-8 h-8 rounded-xl bg-accent-theme text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
                        <i class="fas fa-calculator text-[11px]"></i>
                    </div>
                    <div class="min-w-0">
                        <h1 id="tally-header-title" class="text-xs sm:text-sm font-bold tracking-tight text-zinc-900 dark:text-white truncate">Tally — Bộ đếm điểm</h1>
                        <p id="tally-header-subtitle" class="text-[10px] text-zinc-400 font-medium truncate">Bảng theo dõi ván đấu</p>
                    </div>
                </div>

                <!-- Cụm điều khiển trên Header -->
                <div class="flex items-center gap-1.5 shrink-0">
                    <!-- Đồng hồ bấm giờ -->
                    <button type="button" id="btn-timer-trigger" class="flex items-center gap-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.03] dark:bg-white/[0.06] px-2.5 py-1 font-mono text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-black/[0.06] dark:hover:bg-white/[0.1] active:scale-95 transition-all" title="Bảng điều khiển thời gian">
                        <span id="tally-timer-dot" class="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                        <span id="tally-timer-display">00:00:00</span>
                    </button>

                    <!-- Xem luật / hướng dẫn -->
                    <button type="button" id="btn-show-rules" class="w-7 h-7 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.03] dark:bg-white/[0.06] flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-black/[0.06] dark:hover:bg-white/[0.1] active:scale-95 transition-all" title="Luật chơi">
                        <i class="fas fa-circle-info text-xs"></i>
                    </button>
                </div>
            </div>
        </header>

        <!-- MAIN SCROLLER -->
        <main class="flex-1 w-full max-w-5xl mx-auto overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-3 pb-28 space-y-4">

            <!-- TAB 1: BỘ ĐẾM (COUNTER) -->
            <div id="pane-tab-counter" class="tally-tab-pane space-y-4">
                
                <!-- BẢNG ĐIỀU KHIỂN & NHẬP TÊN NGƯỜI CHƠI -->
                <section class="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#121215] p-3.5 shadow-sm space-y-3">
                    
                    <div id="tally-input-section" class="space-y-2.5 transition-all duration-200">
                        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <!-- Ô nhập tên -->
                            <input type="text" id="tally-input-name" placeholder="Tên người chơi... (Ví dụ: Hùng, Hunq)"
                                autocomplete="off"
                                class="flex-1 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-[#f8f8fa] dark:bg-zinc-900/60 px-3.5 py-2 text-xs sm:text-sm font-semibold outline-none focus:border-accent-theme transition text-zinc-900 dark:text-white placeholder-zinc-400 select-text" />

                            <!-- Mốc điểm thắng -->
                            <div class="flex items-center justify-between sm:justify-start gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                                <span class="text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1.5 whitespace-nowrap text-[11px]">
                                    <span>🎯</span> Điểm thắng:
                                </span>
                                <div class="flex items-center gap-1">
                                    <input type="number" id="tally-win-score-input" placeholder="0" min="0"
                                        class="w-16 bg-white dark:bg-zinc-900 border border-amber-500/30 rounded-lg px-2 py-0.5 text-center font-mono text-xs font-bold text-amber-600 dark:text-amber-400 outline-none select-text" />
                                    
                                </div>
                            </div>

                            <!-- Nút Thêm -->
                            <button type="button" id="btn-add-player" class="h-9 px-4 rounded-xl bg-accent-theme text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-sm">
                                Thêm
                            </button>
                        </div>
                    </div>

                    <!-- THANH HÀNH ĐỘNG NHANH -->
                    <div class="flex items-center justify-between gap-2 pt-1 border-t border-black/[0.04] dark:border-white/[0.06] text-xs font-semibold">
                        <button type="button" id="btn-toggle-smartpoint" class="flex-1 py-1.5 px-2 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition active:scale-95 truncate">
                            <span id="label-smartpoint">Smart Point</span>
                        </button>
                        
                        <button type="button" id="btn-action-new-round" class="flex-1 py-1.5 px-2 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition active:scale-95 truncate">
                            Ván mới
                        </button>

                        <button type="button" id="btn-action-delete-all" class="flex-1 py-1.5 px-2 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition active:scale-95 truncate">
                            Xoá hết
                        </button>

                        <!-- Thu gọn khung nhập tên -->
                        <button type="button" id="btn-collapse-panel" class="w-7 h-7 flex items-center justify-center rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition active:scale-95 shrink-0" title="Ẩn/Hiện ô nhập">
                            <i id="icon-collapse-arrow" class="fas fa-chevron-up text-[10px] transition-transform duration-200"></i>
                        </button>
                    </div>

                </section>

                <!-- KHU VỰC THẺ NGƯỜI CHƠI -->
                <section id="tally-cards-container" class="space-y-3 md:space-y-0 md:grid md:grid-cols-2 gap-3"></section>

                <!-- TRẠNG THÁI RỖNG -->
                <div id="tally-empty-state" class="hidden rounded-2xl border border-dashed border-black/[0.08] dark:border-white/[0.1] py-16 text-center bg-white dark:bg-[#121215]">
                    <div class="w-12 h-12 mx-auto rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] flex items-center justify-center text-zinc-400 text-lg mb-2">
                        <i class="fas fa-users-slash"></i>
                    </div>
                    <p class="text-sm font-bold text-zinc-500 dark:text-zinc-400">Bàn đấu chưa có người chơi</p>
                    <p class="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Nhập tên vào ô phía trên để bắt đầu tính điểm.</p>
                </div>

                <!-- 5 LỊCH SỬ GẦN NHẤT -->
                <section id="tally-recent-history-section" class="hidden space-y-2 pt-2">
                    <div class="flex items-center justify-between px-1">
                        <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Biến động gần nhất (5)</span>
                        <button type="button" id="btn-view-all-history" class="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-bold transition-colors">
                            Xem tất cả →
                        </button>
                    </div>
                    <div id="tally-recent-history-list" class="divide-y divide-black/[0.04] dark:divide-white/[0.06] overflow-hidden rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#121215] p-2 font-mono text-xs shadow-sm"></div>
                </section>

            </div>

            <!-- TAB 2: LỊCH SỬ TOÀN BỘ (HISTORY) -->
            <div id="pane-tab-history" class="tally-tab-pane hidden space-y-3">
                <div class="flex items-center justify-between px-1">
                    <h2 class="text-xs font-bold uppercase tracking-wider text-zinc-400">Lịch sử toàn trận</h2>
                    <button type="button" id="btn-clear-history-only" class="text-xs text-rose-500 hover:text-rose-600 font-bold transition-colors">
                        Làm trống
                    </button>
                </div>

                <div id="tally-full-history-list" class="divide-y divide-black/[0.04] dark:divide-white/[0.06] overflow-hidden rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#121215] p-3 font-mono text-xs shadow-sm min-h-[160px]"></div>

                <div id="tally-full-history-empty" class="hidden text-center py-16 text-xs text-zinc-400">
                    Chưa có thay đổi điểm số nào được ghi lại.
                </div>
            </div>

            <!-- TAB 3: CÀI ĐẶT (SETTINGS) -->
            <div id="pane-tab-settings" class="tally-tab-pane hidden space-y-4 max-w-xl mx-auto">
                
                <!-- Bố cục thẻ -->
                <div class="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#121215] p-4 space-y-2.5 shadow-sm">
                    <span class="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Chế độ hiển thị thẻ bài</span>
                    <div class="grid grid-cols-2 gap-2 text-xs font-semibold">
                        <button type="button" id="btn-layout-list" class="flex items-center justify-center gap-2 py-2 rounded-xl border transition-all active:scale-95">
                            <span>☰</span> Danh sách (List)
                        </button>
                        <button type="button" id="btn-layout-grid" class="flex items-center justify-center gap-2 py-2 rounded-xl border transition-all active:scale-95">
                            <span>☷</span> Lưới thẻ (Grid)
                        </button>
                    </div>
                </div>

                <!-- Kiểu Avatar mặc định -->
                <div class="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#121215] p-4 space-y-2.5 shadow-sm">
                    <span class="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Kiểu Avatar khởi tạo</span>
                    <div class="grid grid-cols-2 gap-2 text-xs font-semibold">
                        <button type="button" id="btn-avt-letter" class="py-2 rounded-xl border transition-all active:scale-95">
                            🔤 Chữ cái đầu
                        </button>
                        <button type="button" id="btn-avt-emoji" class="py-2 rounded-xl border transition-all active:scale-95">
                            🎭 Emoji ngẫu nhiên
                        </button>
                    </div>
                </div>

            </div>

        </main>

        <!-- FLOATING BOTTOM PILL NAV -->
        <div class="fixed bottom-4 inset-x-0 z-30 flex justify-center px-4 pointer-events-none">
            <nav class="pointer-events-auto relative flex items-center p-1 rounded-full border border-black/[0.08] dark:border-white/[0.12] bg-white/95 dark:bg-[#161618]/95 backdrop-blur-md shadow-2xl w-full max-w-sm sm:max-w-md">
                
                <!-- Lớp đệm Active Indicator trượt mượt mà -->
                <div id="tally-nav-indicator" class="absolute top-1 bottom-1 left-1 w-[calc((100%-8px)/3)] rounded-full bg-accent-theme transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-sm pointer-events-none"></div>

                <button type="button" id="tab-nav-counter" class="relative z-10 flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-bold transition-colors duration-200 active:scale-95 text-white">
                    <i class="fas fa-calculator text-[11px]"></i>
                    <span>Bộ đếm</span>
                </button>

                <button type="button" id="tab-nav-history" class="relative z-10 flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold transition-colors duration-200 active:scale-95 text-zinc-400 hover:text-zinc-800 dark:hover:text-white">
                    <i class="fas fa-clock-rotate-left text-[11px]"></i>
                    <span>Lịch sử</span>
                </button>

                <button type="button" id="tab-nav-settings" class="relative z-10 flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold transition-colors duration-200 active:scale-95 text-zinc-400 hover:text-zinc-800 dark:hover:text-white">
                    <i class="fas fa-gear text-[11px]"></i>
                    <span>Cài đặt</span>
                </button>
            </nav>
        </div>

        <!-- =========================================================================
             MODAL LAYER TÍCH HỢP TRONG TOOL
             ========================================================================= -->
        
        <!-- MODAL ĐỒNG HỒ ACTION SHEET -->
        <div id="modal-timer-backdrop" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 opacity-0 pointer-events-none transition-all duration-200">
            <div id="modal-timer-card" class="w-full max-w-xs rounded-3xl border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-[#18181c] p-5 shadow-2xl scale-95 transition-all duration-200 space-y-4">
                <div class="flex items-center justify-between">
                    <h3 class="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                        <span>⏱️</span> Đồng hồ trận đấu
                    </h3>
                    <button type="button" id="btn-close-timer-modal" class="text-xs text-zinc-400 hover:text-white">✕</button>
                </div>

                <div class="rounded-2xl bg-zinc-100 dark:bg-black/40 p-3 text-center border border-black/[0.04] dark:border-white/[0.05]">
                    <span id="modal-timer-clock-text" class="font-mono text-2xl font-black text-zinc-900 dark:text-white tracking-widest">00:00:00</span>
                    <p id="modal-timer-status-text" class="text-[10px] font-semibold text-zinc-400 mt-0.5">Chưa bấm giờ</p>
                </div>

                <div class="grid grid-cols-2 gap-2 text-xs font-semibold">
                    <button type="button" id="btn-modal-timer-playpause" class="py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.04] text-zinc-800 dark:text-zinc-200 active:scale-95 transition">
                        ▶️ Bắt đầu
                    </button>
                    <button type="button" id="btn-modal-timer-restart" class="py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.04] text-zinc-800 dark:text-zinc-200 active:scale-95 transition">
                        🔁 Đếm từ 0
                    </button>
                </div>

                <button type="button" id="btn-modal-timer-reset" class="w-full py-2 rounded-xl border border-rose-500/20 bg-rose-500/10 text-xs font-bold text-rose-500 hover:bg-rose-500/20 active:scale-95 transition">
                    ⏹️ Dừng hẳn & Về 0
                </button>
            </div>
        </div>

        <!-- MODAL ĐỔI AVATAR -->
        <div id="modal-avatar-backdrop" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 opacity-0 pointer-events-none transition-all duration-200">
            <div id="modal-avatar-card" class="w-full max-w-xs rounded-3xl border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-[#18181c] p-5 shadow-2xl scale-95 transition-all duration-200 space-y-4">
                <div class="flex items-center justify-between">
                    <h3 class="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Đổi ảnh đại diện</h3>
                    <button type="button" id="btn-close-avatar-modal" class="text-xs text-zinc-400 hover:text-white">✕</button>
                </div>

                <div>
                    <span class="text-[10px] font-medium text-zinc-400 block mb-2">Chọn Emoji nhanh</span>
                    <div class="grid grid-cols-5 gap-2 text-xl" id="avatar-emoji-grid"></div>
                </div>

                <div class="pt-2 border-t border-black/[0.06] dark:border-white/[0.06] space-y-2">
                    <input type="file" id="avatar-file-hidden" accept="image/*" class="hidden" />
                    <button type="button" id="btn-upload-avatar-file" class="w-full py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.04] text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-95 transition">
                        📁 Tải ảnh từ thư viện máy
                    </button>
                    <button type="button" id="btn-reset-avatar-letter" class="w-full py-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition">
                        ↺ Về chữ cái đầu
                    </button>
                </div>
            </div>
        </div>

        <!-- MODAL CHIẾN THẮNG & PODIUM BỤC VINH DANH -->
        <div id="modal-winner-backdrop" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm opacity-0 pointer-events-none transition-all duration-300">
            <div id="modal-winner-card" class="w-full max-w-sm rounded-[32px] border border-amber-500/30 bg-white dark:bg-[#18181c] p-6 shadow-2xl scale-95 transition-all duration-300 space-y-5 text-center">
                <div>
                    <div class="text-3xl">👑</div>
                    <h3 class="text-base font-black text-amber-500 tracking-tight mt-1">KẾT THÚC VÁN ĐẤU!</h3>
                    <p class="text-[10px] text-zinc-400 font-medium">Đã tìm ra quán quân chạm mốc điểm thắng</p>
                </div>

                <!-- Bục vinh danh Podium -->
                <div id="podium-stage-container" class="flex items-end justify-center gap-2 pt-2"></div>

                <!-- Box Hạng chót (Đội sổ) -->
                <div id="podium-last-place-box" class="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-3 flex items-center justify-between"></div>

                <button type="button" id="btn-close-winner-modal" class="w-full py-2.5 rounded-2xl bg-amber-500 text-black font-black text-xs hover:bg-amber-400 transition active:scale-95 shadow-md">
                    Hoàn Tất Ván Đấu
                </button>
            </div>
        </div>

    </div>
    `;
}

// =============================================================================
// 2. LOGIC HOOKS & EVENT DISPATCHING
// =============================================================================
const DEFAULT_EMOJIS = ['🐱', '🦊', '🐼', '🐯', '🦁', '🐸', '🚀', '⭐', '🔥', '🎲'];

export function init(hostElement) {
    if (!hostElement) return;

    const root = hostElement.querySelector('#tally-root') || hostElement;
    ThemeKit.applyAccent(root);

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            ThemeKit.applyAccent(root);
        }
    });

    const _ = sel => hostElement.querySelector(sel);
    const $$ = sel => hostElement.querySelectorAll(sel);

    // =========================================================
    // STATE QUẢN LÝ
    // =========================================================
    let targetWinScore = parseInt(localStorage.getItem('tally_target_win') || '0', 10);
    let layoutMode = localStorage.getItem('tally_layout_mode') || 'list';
    let defaultAvtType = localStorage.getItem('tally_default_avt') || 'letter';
    let isPanelCollapsed = false;

    let smartPointActive = false;
    let currentSmartPoint = 1;

    let currentLog = null;
    let logTimeout = null;
    let currentAvatarTargetCard = null;

    // Timer state
    let timerInterval = null;
    let timerStartTime = null;
    let timerPausedTime = null;
    let isTimerPaused = false;

    // =========================================================
    // INITIALIZATION & RESTORE SETTINGS
    // =========================================================
    const winInput = _('#tally-win-score-input');
    if (winInput) winInput.value = targetWinScore > 0 ? targetWinScore : '';

    const applyLayoutButtons = (mode) => {
        const listBtn = _('#btn-layout-list');
        const gridBtn = _('#btn-layout-grid');
        const container = _('#tally-cards-container');

        if (mode === 'grid') {
            if (gridBtn) gridBtn.className = 'flex items-center justify-center gap-2 py-2 rounded-xl border border-accent-theme bg-accent-theme text-white font-bold transition-all';
            if (listBtn) listBtn.className = 'flex items-center justify-center gap-2 py-2 rounded-xl border border-black/10 dark:border-white/10 text-zinc-400 transition-all';
            if (container) container.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3';
        } else {
            if (listBtn) listBtn.className = 'flex items-center justify-center gap-2 py-2 rounded-xl border border-accent-theme bg-accent-theme text-white font-bold transition-all';
            if (gridBtn) gridBtn.className = 'flex items-center justify-center gap-2 py-2 rounded-xl border border-black/10 dark:border-white/10 text-zinc-400 transition-all';
            if (container) container.className = 'space-y-3 md:space-y-0 md:grid md:grid-cols-2 gap-3';
        }

        container?.querySelectorAll('.tally-card').forEach(card => {
            if (mode === 'grid') {
                card.classList.remove('justify-between', 'items-center');
                card.classList.add('flex-col', 'items-stretch', 'gap-2.5');
            } else {
                card.classList.remove('flex-col', 'items-stretch', 'gap-2.5');
                card.classList.add('justify-between', 'items-center');
            }
        });
    };

    const applyAvtButtons = (type) => {
        const lBtn = _('#btn-avt-letter');
        const eBtn = _('#btn-avt-emoji');
        if (type === 'letter') {
            if (lBtn) lBtn.className = 'py-2 rounded-xl border border-accent-theme bg-accent-theme text-white font-bold transition-all';
            if (eBtn) eBtn.className = 'py-2 rounded-xl border border-black/10 dark:border-white/10 text-zinc-400 transition-all';
        } else {
            if (eBtn) eBtn.className = 'py-2 rounded-xl border border-accent-theme bg-accent-theme text-white font-bold transition-all';
            if (lBtn) lBtn.className = 'py-2 rounded-xl border border-black/10 dark:border-white/10 text-zinc-400 transition-all';
        }
    };

    applyLayoutButtons(layoutMode);
    applyAvtButtons(defaultAvtType);

    // Render danh sách Emoji Modal
    const emojiGrid = _('#avatar-emoji-grid');
    if (emojiGrid) {
        emojiGrid.innerHTML = DEFAULT_EMOJIS.map(em => `
            <button type="button" class="btn-select-emoji h-9 w-9 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] flex items-center justify-center hover:scale-110 active:scale-90 transition" data-emoji="${em}">
                ${em}
            </button>
        `).join('');

        emojiGrid.querySelectorAll('.btn-select-emoji').forEach(btn => {
            btn.onclick = () => {
                setPlayerEmoji(btn.dataset.emoji);
            };
        });
    }

    // =========================================================
    // MODAL HELPERS
    // =========================================================
    const openModal = (backdropId, cardId) => {
        const backdrop = _(backdropId);
        const card = _(cardId);
        if (backdrop && card) {
            backdrop.classList.remove('opacity-0', 'pointer-events-none');
            card.classList.remove('scale-95');
        }
    };

    const closeModal = (backdropId, cardId) => {
        const backdrop = _(backdropId);
        const card = _(cardId);
        if (backdrop && card) {
            backdrop.classList.add('opacity-0', 'pointer-events-none');
            card.classList.add('scale-95');
        }
    };

    // Bấm ra ngoài backdrop tự đóng
    ['#modal-timer-backdrop', '#modal-avatar-backdrop', '#modal-winner-backdrop'].forEach(id => {
        const bd = _(id);
        bd?.addEventListener('click', (e) => {
            if (e.target === bd) {
                if (id === '#modal-timer-backdrop') closeModal('#modal-timer-backdrop', '#modal-timer-card');
                if (id === '#modal-avatar-backdrop') closeModal('#modal-avatar-backdrop', '#modal-avatar-card');
                if (id === '#modal-winner-backdrop') closeModal('#modal-winner-backdrop', '#modal-winner-card');
            }
        });
    });

    _('#btn-close-timer-modal')?.addEventListener('click', () => closeModal('#modal-timer-backdrop', '#modal-timer-card'));
    _('#btn-close-avatar-modal')?.addEventListener('click', () => closeModal('#modal-avatar-backdrop', '#modal-avatar-card'));
    _('#btn-close-winner-modal')?.addEventListener('click', () => closeModal('#modal-winner-backdrop', '#modal-winner-card'));

    // =========================================================
    // TAB NAVIGATION
    // =========================================================
    const switchTab = (tab) => {
        $$('.tally-tab-pane').forEach(p => p.classList.add('hidden'));
        const indicator = _('#tally-nav-indicator');
        const titleEl = _('#tally-header-title');
        const subtitleEl = _('#tally-header-subtitle');

        const btnCounter = _('#tab-nav-counter');
        const btnHistory = _('#tab-nav-history');
        const btnSettings = _('#tab-nav-settings');

        const inactiveStyle = 'relative z-10 flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold transition-colors duration-200 active:scale-95 text-zinc-400 hover:text-zinc-800 dark:hover:text-white';
        const activeStyle = 'relative z-10 flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-bold transition-colors duration-200 active:scale-95 text-white';

        btnCounter.className = inactiveStyle;
        btnHistory.className = inactiveStyle;
        btnSettings.className = inactiveStyle;

        if (tab === 'counter') {
            _('#pane-tab-counter')?.classList.remove('hidden');
            btnCounter.className = activeStyle;
            if (indicator) indicator.style.transform = 'translateX(0%)';
            if (titleEl) titleEl.innerText = 'Tally — Bộ đếm điểm';
            if (subtitleEl) subtitleEl.innerText = 'Bảng theo dõi ván đấu';
        } else if (tab === 'history') {
            _('#pane-tab-history')?.classList.remove('hidden');
            btnHistory.className = activeStyle;
            if (indicator) indicator.style.transform = 'translateX(100%)';
            if (titleEl) titleEl.innerText = 'Tally — Lịch sử';
            if (subtitleEl) subtitleEl.innerText = 'Nhật ký biến động điểm';
            renderFullHistory();
        } else if (tab === 'settings') {
            _('#pane-tab-settings')?.classList.remove('hidden');
            btnSettings.className = activeStyle;
            if (indicator) indicator.style.transform = 'translateX(200%)';
            if (titleEl) titleEl.innerText = 'Tally — Cài đặt';
            if (subtitleEl) subtitleEl.innerText = 'Bố cục & Avatar mặc định';
        }
    };

    _('#tab-nav-counter')?.addEventListener('click', () => switchTab('counter'));
    _('#tab-nav-history')?.addEventListener('click', () => switchTab('history'));
    _('#tab-nav-settings')?.addEventListener('click', () => switchTab('settings'));
    _('#btn-view-all-history')?.addEventListener('click', () => switchTab('history'));

    // =========================================================
    // SMART POINT ENGINE (N-1 -> 1 -> N-1)
    // =========================================================
    const getMaxSmartPoint = () => {
        const total = hostElement.querySelectorAll('.tally-card').length;
        return total > 1 ? total - 1 : 1;
    };

    const updateAllPlusButtonLabels = () => {
        hostElement.querySelectorAll('.plus-btn').forEach(btn => {
            if (smartPointActive) {
                btn.innerHTML = `<span class="font-mono text-xs font-black text-accent-theme">+${currentSmartPoint}</span>`;
                btn.classList.add('w-auto', 'px-2');
            } else {
                btn.innerHTML = '<i class="fas fa-plus text-[10px]"></i>';
                btn.classList.remove('w-auto', 'px-2');
            }
        });
    };

    const toggleSmartPoint = () => {
        smartPointActive = !smartPointActive;
        const btn = _('#btn-toggle-smartpoint');
        const label = _('#label-smartpoint');

        if (smartPointActive) {
            currentSmartPoint = getMaxSmartPoint();
            if (label) label.innerText = `Smart (+${currentSmartPoint})`;
            btn?.classList.add('border-accent-theme', 'bg-accent-theme', 'text-white');
            UI.notch.notify('SmartPoint', `Đã bật tính điểm giảm dần (+${currentSmartPoint})`, 'info', 1800);
        } else {
            currentSmartPoint = 1;
            if (label) label.innerText = 'Smart Point';
            btn?.classList.remove('border-accent-theme', 'bg-accent-theme', 'text-white');
            UI.notch.notify('SmartPoint', 'Đã trở về chế độ cộng 1', 'info', 1800);
        }
        updateAllPlusButtonLabels();
    };

    const advanceSmartPointCycle = () => {
        if (!smartPointActive) return;
        const max = getMaxSmartPoint();
        currentSmartPoint--;
        if (currentSmartPoint < 1) currentSmartPoint = max;

        const label = _('#label-smartpoint');
        if (label) label.innerText = `Smart (+${currentSmartPoint})`;
        updateAllPlusButtonLabels();
    };

    _('#btn-toggle-smartpoint')?.addEventListener('click', toggleSmartPoint);

    // =========================================================
    // XẾP HẠNG & BADGES
    // =========================================================
    const updateRankBadges = () => {
        const cards = Array.from(hostElement.querySelectorAll('.tally-card'));
        if (!cards.length) return;

        const scores = cards.map(c => parseInt(c.querySelector('.tally-input')?.value || '0', 10));
        const sortedUnique = [...new Set(scores)].sort((a, b) => b - a);

        cards.forEach(card => {
            const score = parseInt(card.querySelector('.tally-input')?.value || '0', 10);
            const rankIdx = sortedUnique.indexOf(score);
            const textBadge = card.querySelector('.rank-text-badge');
            const cornerIcon = card.querySelector('.rank-corner-icon');

            if (textBadge) textBadge.innerText = `#${rankIdx + 1}`;
            if (cornerIcon) {
                if (rankIdx === 0 && score > 0) {
                    cornerIcon.innerText = '🥇';
                    cornerIcon.classList.remove('hidden');
                } else if (rankIdx === 1 && score > 0) {
                    cornerIcon.innerText = '🥈';
                    cornerIcon.classList.remove('hidden');
                } else if (rankIdx === 2 && score > 0) {
                    cornerIcon.innerText = '🥉';
                    cornerIcon.classList.remove('hidden');
                } else {
                    cornerIcon.classList.add('hidden');
                }
            }
        });
    };

    // =========================================================
    // CHIẾN THẮNG & PODIUM
    // =========================================================
    const checkWinCondition = (name, score) => {
        if (targetWinScore > 0 && score >= targetWinScore) {
            renderPodium();
            openModal('#modal-winner-backdrop', '#modal-winner-card');
            UI.notch.notify('Chiến thắng!', `${name} đã chạm mốc ${score} điểm.`, 'success', 5000);
        }
    };

    const renderPodium = () => {
        const cards = Array.from(hostElement.querySelectorAll('.tally-card'));
        const players = cards.map(c => ({
            name: c.querySelector('.tally-name')?.innerText || '',
            score: parseInt(c.querySelector('.tally-input')?.value || '0', 10),
            avatarHtml: c.querySelector('.avatar-slot')?.innerHTML || ''
        })).sort((a, b) => b.score - a.score);

        const top1 = players[0] || null;
        const top2 = players[1] || null;
        const top3 = players[2] || null;
        const last = players.length >= 2 ? players[players.length - 1] : null;

        const stage = _('#podium-stage-container');
        if (stage) {
            stage.innerHTML = `
                <!-- HẠNG 2 -->
                <div class="flex-1 flex flex-col items-center">
                    ${top2 ? `
                        <div class="relative mb-1">
                            <span class="absolute -top-2 left-1/2 -translate-x-1/2 text-xs">🥈</span>
                            <div class="h-11 w-11 rounded-2xl overflow-hidden border-2 border-slate-400 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs shadow-sm">
                                ${top2.avatarHtml}
                            </div>
                        </div>
                        <p class="text-xs font-bold truncate max-w-[70px]">${top2.name}</p>
                        <span class="font-mono text-[10px] font-bold text-slate-400">${top2.score}đ</span>
                        <div class="w-full h-11 bg-slate-200 dark:bg-slate-800 rounded-t-xl mt-1.5 flex items-center justify-center text-xs font-black text-slate-500">2</div>
                    ` : '<div class="w-full h-11"></div>'}
                </div>

                <!-- HẠNG 1 -->
                <div class="flex-[1.2] flex flex-col items-center z-10 -mt-3">
                    ${top1 ? `
                        <div class="relative mb-1">
                            <span class="absolute -top-3 left-1/2 -translate-x-1/2 text-base">👑</span>
                            <div class="h-14 w-14 rounded-3xl overflow-hidden border-4 border-amber-400 bg-amber-500/10 flex items-center justify-center font-black text-sm shadow-md ring-4 ring-amber-400/20">
                                ${top1.avatarHtml}
                            </div>
                        </div>
                        <p class="text-xs font-black text-amber-500 truncate max-w-[90px]">${top1.name}</p>
                        <span class="font-mono text-xs font-black text-amber-600 dark:text-amber-400">${top1.score}đ</span>
                        <div class="w-full h-16 bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-2xl mt-1.5 flex flex-col items-center justify-center text-black font-black shadow-md">
                            <span class="text-sm leading-none">1</span>
                            <span class="text-[8px] uppercase tracking-widest opacity-80">Quán Quân</span>
                        </div>
                    ` : ''}
                </div>

                <!-- HẠNG 3 -->
                <div class="flex-1 flex flex-col items-center">
                    ${top3 ? `
                        <div class="relative mb-1">
                            <span class="absolute -top-2 left-1/2 -translate-x-1/2 text-xs">🥉</span>
                            <div class="h-11 w-11 rounded-2xl overflow-hidden border-2 border-amber-700/60 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs shadow-sm">
                                ${top3.avatarHtml}
                            </div>
                        </div>
                        <p class="text-xs font-bold truncate max-w-[70px]">${top3.name}</p>
                        <span class="font-mono text-[10px] font-bold text-amber-700 dark:text-amber-500">${top3.score}đ</span>
                        <div class="w-full h-8 bg-amber-800/20 dark:bg-amber-950/60 rounded-t-xl mt-1.5 flex items-center justify-center text-xs font-black text-amber-700 dark:text-amber-400">3</div>
                    ` : '<div class="w-full h-8"></div>'}
                </div>
            `;
        }

        const lastBox = _('#podium-last-place-box');
        if (lastBox) {
            if (last && players.length >= 2 && last.name !== top1?.name) {
                lastBox.classList.remove('hidden');
                lastBox.innerHTML = `
                    <div class="flex items-center gap-2">
                        <span class="text-lg">💩</span>
                        <div class="h-7 w-7 rounded-lg overflow-hidden border border-rose-500/30 flex items-center justify-center text-xs font-bold bg-zinc-100 dark:bg-zinc-800">
                            ${last.avatarHtml}
                        </div>
                        <div class="text-left">
                            <p class="text-xs font-bold text-zinc-900 dark:text-white">${last.name}</p>
                            <p class="text-[9px] text-rose-500 font-bold uppercase tracking-wider">Hạng chót (Đội sổ)</p>
                        </div>
                    </div>
                    <span class="font-mono text-xs font-bold text-rose-500">${last.score} đ</span>
                `;
            } else {
                lastBox.classList.add('hidden');
            }
        }
    };

    // =========================================================
    // THẺ BÀI CARD GAME & LOCALSTORAGE
    // =========================================================
    const checkEmptyState = () => {
        const container = _('#tally-cards-container');
        const empty = _('#tally-empty-state');
        if (!container || !empty) return;
        empty.classList.toggle('hidden', container.children.length > 0);
    };

    const saveToLocalStorage = () => {
        const tallies = [];
        hostElement.querySelectorAll('.tally-card').forEach(card => {
            const avt = card.querySelector('.avatar-slot');
            tallies.push({
                name: card.querySelector('.tally-name')?.innerText || '',
                quantity: parseInt(card.querySelector('.tally-input')?.value || '0', 10),
                avatar: {
                    type: avt?.dataset.avtType || 'letter',
                    val: avt?.dataset.avtVal || ''
                }
            });
        });
        localStorage.setItem('tally_players', JSON.stringify(tallies));
    };

    const createTallyCard = (name, quantity = 0, avtData = null) => {
        name = name.charAt(0).toUpperCase() + name.slice(1);
        const container = _('#tally-cards-container');
        if (!container) return;

        const isGrid = layoutMode === 'grid';
        const card = document.createElement('div');
        card.className = `tally-card group relative flex ${isGrid ? 'flex-col items-stretch gap-2.5' : 'justify-between items-center'} rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#121215] p-3 shadow-sm hover:border-accent-theme/40 transition-all select-none`;

        let avtContent = name.charAt(0);
        let avtType = 'letter';
        let avtVal = name.charAt(0);

        if (avtData) {
            avtType = avtData.type;
            avtVal = avtData.val;
            if (avtType === 'image') avtContent = `<img src="${avtVal}" class="w-full h-full object-cover rounded-xl" />`;
            else if (avtType === 'emoji') avtContent = `<span class="text-xl">${avtVal}</span>`;
            else avtContent = avtVal;
        } else if (defaultAvtType === 'emoji') {
            const randEmoji = DEFAULT_EMOJIS[Math.floor(Math.random() * DEFAULT_EMOJIS.length)];
            avtType = 'emoji';
            avtVal = randEmoji;
            avtContent = `<span class="text-xl">${randEmoji}</span>`;
        }

        card.innerHTML = `
            <div class="flex items-center gap-2.5 min-w-0">
                <span class="rank-text-badge flex h-6 px-1.5 items-center justify-center rounded-lg bg-black/[0.04] dark:bg-white/[0.06] text-[10px] font-black text-zinc-400 font-mono">#</span>

                <div class="relative shrink-0">
                    <button type="button" class="avatar-slot relative flex h-10 w-10 items-center justify-center rounded-xl bg-black/[0.03] dark:bg-white/[0.06] text-zinc-800 dark:text-zinc-100 font-black text-sm transition active:scale-90 overflow-hidden" 
                        data-avt-type="${avtType}" 
                        data-avt-val="${avtVal}" 
                        title="Chạm để đổi ảnh đại diện">
                        ${avtContent}
                    </button>
                    <span class="rank-corner-icon hidden absolute -top-1.5 -right-1.5 text-xs drop-shadow pointer-events-none"></span>
                </div>

                <div class="min-w-0 flex-1">
                    <h3 class="tally-name text-xs font-bold truncate text-zinc-900 dark:text-white">${name}</h3>
                    <button type="button" class="del-btn text-[10px] font-medium text-zinc-400 hover:text-rose-500 transition-colors">Rời bàn</button>
                </div>
            </div>

            <div class="flex items-center ${isGrid ? 'justify-between' : 'gap-2'} shrink-0">
                <input type="number" value="${quantity}" class="tally-input ${isGrid ? 'flex-1 text-left' : 'w-16 text-right'} bg-transparent font-mono text-xl font-black outline-none select-text" />

                <div class="flex items-center rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] p-0.5 shrink-0">
                    <button type="button" class="minus-btn flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-90 transition" title="Trừ 1">
                        <i class="fas fa-minus text-[10px]"></i>
                    </button>
                    <div class="h-3.5 w-px bg-black/[0.06] dark:bg-white/[0.08]"></div>
                    <button type="button" class="plus-btn flex h-8 w-8 items-center justify-center rounded-lg text-zinc-800 dark:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-90 transition" title="Cộng điểm">
                        <i class="fas fa-plus text-[10px]"></i>
                    </button>
                </div>
            </div>
        `;

        // Hooks sự kiện trên thẻ
        const minusBtn = card.querySelector('.minus-btn');
        const plusBtn = card.querySelector('.plus-btn');
        const numInput = card.querySelector('.tally-input');
        const delBtn = card.querySelector('.del-btn');
        const avtSlotBtn = card.querySelector('.avatar-slot');

        avtSlotBtn.onclick = () => {
            currentAvatarTargetCard = card;
            openModal('#modal-avatar-backdrop', '#modal-avatar-card');
        };

        minusBtn.onclick = () => {
            const current = parseInt(numInput.value || '0', 10);
            const next = Math.max(0, current - 1);
            numInput.value = next;
            logValueDelayed(name, -1);
            saveToLocalStorage();
            updateRankBadges();
        };

        plusBtn.onclick = () => {
            const step = smartPointActive ? currentSmartPoint : 1;
            const current = parseInt(numInput.value || '0', 10);
            const next = current + step;
            numInput.value = next;
            logValueDelayed(name, step);
            saveToLocalStorage();
            updateRankBadges();
            checkWinCondition(name, next);

            if (smartPointActive) advanceSmartPointCycle();
        };

        numInput.onchange = () => {
            const val = parseInt(numInput.value || '0', 10);
            saveToLocalStorage();
            updateRankBadges();
            checkWinCondition(name, val);
        };

        delBtn.onclick = () => {
            UI.showConfirm(
                `Xoá ${name}?`,
                'Người chơi này sẽ bị loại khỏi bàn đấu hiện tại.',
                () => {
                    card.remove();
                    saveToLocalStorage();
                    checkEmptyState();
                    updateRankBadges();
                    if (smartPointActive) {
                        currentSmartPoint = getMaxSmartPoint();
                        const label = _('#label-smartpoint');
                        if (label) label.innerText = `Smart (+${currentSmartPoint})`;
                        updateAllPlusButtonLabels();
                    }
                    UI.notch.notify('Đã xóa', `Đã loại ${name} khỏi bàn đấu`, 'danger', 1800);
                }
            );
        };

        container.appendChild(card);
    };

    const addTally = (name, quantity = 0, avtData = null) => {
        const inputEl = _('#tally-input-name');
        const raw = name || (inputEl ? inputEl.value.trim() : '');
        if (!raw) {
            UI.notch.notify('Lưu ý', 'Vui lòng nhập tên người chơi', 'warning', 1800);
            return;
        }

        const names = raw.split(/[,;|\n]+/).map(n => n.trim()).filter(n => n.length > 0);
        if (!names.length) return;

        names.forEach(pName => createTallyCard(pName, quantity, avtData));

        if (inputEl) inputEl.value = '';
        checkEmptyState();
        saveToLocalStorage();
        updateRankBadges();

        if (smartPointActive) {
            currentSmartPoint = getMaxSmartPoint();
            const label = _('#label-smartpoint');
            if (label) label.innerText = `Smart (+${currentSmartPoint})`;
        }
        updateAllPlusButtonLabels();
        startTimer();

        if (names.length > 1) {
            UI.notch.notify('Thành công', `Đã thêm ${names.length} người chơi`, 'success', 2000);
        } else if (!avtData) {
            UI.notch.notify('Thành công', `Đã thêm ${names[0]}`, 'success', 1800);
        }
    };

    _('#btn-add-player')?.addEventListener('click', () => addTally());
    _('#tally-input-name')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addTally();
    });

    // Mốc điểm thắng
    _('#tally-win-score-input')?.addEventListener('change', (e) => {
        const val = parseInt(e.target.value || '0', 10);
        targetWinScore = val > 0 ? val : 0;
        localStorage.setItem('tally_target_win', targetWinScore.toString());
        UI.notch.notify('Mục tiêu ván', targetWinScore > 0 ? `Điểm thắng đặt ở mốc: ${targetWinScore}` : 'Đã tắt mốc điểm thắng', 'info', 2000);
    });

    // Thu gọn/mở rộng input area
    _('#btn-collapse-panel')?.addEventListener('click', () => {
        isPanelCollapsed = !isPanelCollapsed;
        const area = _('#tally-input-section');
        const arrow = _('#icon-collapse-arrow');
        if (area && arrow) {
            area.classList.toggle('hidden', isPanelCollapsed);
            arrow.style.transform = isPanelCollapsed ? 'rotate(180deg)' : 'rotate(0deg)';
        }
    });

    // Bắt đầu ván mới (Reset về 0)
    _('#btn-action-new-round')?.addEventListener('click', () => {
        UI.showConfirm(
            'Bắt đầu ván mới?',
            'Toàn bộ điểm số sẽ đưa về 0 nhưng giữ nguyên danh sách bạn chơi. Nhật ký sẽ được làm trống.',
            () => {
                hostElement.querySelectorAll('.tally-input').forEach(i => (i.value = 0));
                clearHistory();
                saveToLocalStorage();
                updateRankBadges();
                if (smartPointActive) {
                    currentSmartPoint = getMaxSmartPoint();
                    const label = _('#label-smartpoint');
                    if (label) label.innerText = `Smart (+${currentSmartPoint})`;
                    updateAllPlusButtonLabels();
                }
                UI.notch.notify('Ván mới', 'Đã đặt lại toàn bộ điểm về 0', 'success', 2000);
            }
        );
    });

    // Xóa hết toàn bộ phòng
    _('#btn-action-delete-all')?.addEventListener('click', () => {
        UI.showConfirm(
            'Giải tán phòng đấu?',
            'Tất cả người chơi và nhật ký biến động sẽ bị xoá vĩnh viễn.',
            () => {
                localStorage.removeItem('tally_players');
                localStorage.removeItem('tally_history');
                const container = _('#tally-cards-container');
                if (container) container.innerHTML = '';
                clearHistory();
                resetTimer();
                checkEmptyState();
                updateRankBadges();
                if (smartPointActive) toggleSmartPoint();
                UI.notch.notify('Giải tán', 'Đã xoá toàn bộ phòng đấu', 'danger', 2000);
            }
        );
    });

    // =========================================================
    // LỊCH SỬ GHI ĐIỂM
    // =========================================================
    const logValueDelayed = (name, step) => {
        const now = new Date();
        if (!currentLog || currentLog.name !== name) {
            if (currentLog) recordHistoryEntry(currentLog);
            currentLog = { name, step, time: now };
        } else {
            currentLog.step += step;
            currentLog.time = now;
        }

        clearTimeout(logTimeout);
        logTimeout = setTimeout(() => {
            if (currentLog) {
                recordHistoryEntry(currentLog);
                currentLog = null;
            }
        }, 800);
    };

    const recordHistoryEntry = (log) => {
        const logs = JSON.parse(localStorage.getItem('tally_history') || '[]');
        const timeStr = `${String(log.time.getHours()).padStart(2, '0')}:${String(log.time.getMinutes()).padStart(2, '0')}:${String(log.time.getSeconds()).padStart(2, '0')}`;

        logs.unshift({
            name: log.name,
            step: log.step,
            time: timeStr,
            timestamp: Date.now()
        });

        localStorage.setItem('tally_history', JSON.stringify(logs));
        renderRecentHistory();
    };

    const renderRecentHistory = () => {
        const logs = JSON.parse(localStorage.getItem('tally_history') || '[]');
        const list = _('#tally-recent-history-list');
        const section = _('#tally-recent-history-section');
        if (!list || !section) return;

        if (!logs.length) {
            section.classList.add('hidden');
            return;
        }

        section.classList.remove('hidden');
        list.innerHTML = logs.slice(0, 5).map(log => {
            const isPos = log.step > 0;
            const color = isPos ? 'text-accent-theme' : 'text-rose-500';
            const prefix = isPos ? `+${log.step}` : `${log.step}`;
            return `
                <div class="flex items-center justify-between py-1.5 px-2 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] rounded-xl transition-colors">
                    <span class="font-bold text-zinc-700 dark:text-zinc-300 text-[11px]">${log.name}</span>
                    <div class="flex items-center gap-3">
                        <span class="font-black ${color} text-xs">${prefix}</span>
                        <span class="text-zinc-400 text-[10px]">${log.time}</span>
                    </div>
                </div>
            `;
        }).join('');
    };

    const renderFullHistory = () => {
        const logs = JSON.parse(localStorage.getItem('tally_history') || '[]');
        const list = _('#tally-full-history-list');
        const empty = _('#tally-full-history-empty');
        if (!list || !empty) return;

        if (!logs.length) {
            list.innerHTML = '';
            empty.classList.remove('hidden');
            return;
        }

        empty.classList.add('hidden');
        list.innerHTML = logs.map(log => {
            const isPos = log.step > 0;
            const color = isPos ? 'text-accent-theme' : 'text-rose-500';
            const prefix = isPos ? `+${log.step}` : `${log.step}`;
            return `
                <div class="flex items-center justify-between py-2 px-2 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] rounded-xl transition-colors">
                    <span class="font-bold text-zinc-700 dark:text-zinc-300 text-xs">${log.name}</span>
                    <div class="flex items-center gap-3">
                        <span class="font-black ${color} text-xs">${prefix}</span>
                        <span class="text-zinc-400 text-[10px]">${log.time}</span>
                    </div>
                </div>
            `;
        }).join('');
    };

    const clearHistory = () => {
        localStorage.removeItem('tally_history');
        renderRecentHistory();
        renderFullHistory();
    };

    _('#btn-clear-history-only')?.addEventListener('click', () => {
        clearHistory();
        UI.notch.notify('Nhật ký', 'Đã dọn sạch lịch sử ghi điểm', 'info', 1800);
    });

    // =========================================================
    // AVATAR CHANGE MODAL LOGIC
    // =========================================================
    const setPlayerEmoji = (emoji) => {
        if (!currentAvatarTargetCard) return;
        const avtSlot = currentAvatarTargetCard.querySelector('.avatar-slot');
        if (avtSlot) {
            avtSlot.innerHTML = `<span class="text-xl">${emoji}</span>`;
            avtSlot.dataset.avtType = 'emoji';
            avtSlot.dataset.avtVal = emoji;
        }
        saveToLocalStorage();
        closeModal('#modal-avatar-backdrop', '#modal-avatar-card');
        UI.notch.notify('Avatar', `Đã chọn biểu cảm ${emoji}`, 'info', 1500);
    };

    _('#btn-reset-avatar-letter')?.addEventListener('click', () => {
        if (!currentAvatarTargetCard) return;
        const name = currentAvatarTargetCard.querySelector('.tally-name')?.innerText || 'A';
        const avtSlot = currentAvatarTargetCard.querySelector('.avatar-slot');
        if (avtSlot) {
            avtSlot.innerHTML = name.charAt(0);
            avtSlot.dataset.avtType = 'letter';
            avtSlot.dataset.avtVal = name.charAt(0);
        }
        saveToLocalStorage();
        closeModal('#modal-avatar-backdrop', '#modal-avatar-card');
        UI.notch.notify('Avatar', 'Đã đưa về chữ cái đầu', 'info', 1500);
    });

    const fileInput = _('#avatar-file-hidden');
    _('#btn-upload-avatar-file')?.addEventListener('click', () => fileInput?.click());
    fileInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file || !currentAvatarTargetCard) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const b64 = ev.target.result;
            const avtSlot = currentAvatarTargetCard.querySelector('.avatar-slot');
            if (avtSlot) {
                avtSlot.innerHTML = `<img src="${b64}" class="w-full h-full object-cover rounded-xl" />`;
                avtSlot.dataset.avtType = 'image';
                avtSlot.dataset.avtVal = b64;
            }
            saveToLocalStorage();
            closeModal('#modal-avatar-backdrop', '#modal-avatar-card');
            UI.notch.notify('Avatar', 'Đã tải ảnh đại diện thành công', 'success', 1800);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    });

    // =========================================================
    // TIMER BỘ ĐẾM GIỜ
    // =========================================================
    const getFormattedTimer = () => {
        if (!timerStartTime) return '00:00:00';
        const elapsed = (isTimerPaused ? timerPausedTime : Date.now()) - timerStartTime;
        const h = Math.floor(elapsed / 3600000);
        const m = Math.floor((elapsed % 3600000) / 60000);
        const s = Math.floor((elapsed % 60000) / 1000);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const updateTimerDisplay = () => {
        const txt = getFormattedTimer();
        const headerTimer = _('#tally-timer-display');
        const modalTimer = _('#modal-timer-clock-text');
        if (headerTimer) headerTimer.innerText = txt;
        if (modalTimer) modalTimer.innerText = txt;
    };

    const updateTimerStatusUI = () => {
        const dot = _('#tally-timer-dot');
        const statusText = _('#modal-timer-status-text');
        const playBtn = _('#btn-modal-timer-playpause');

        if (timerInterval && !isTimerPaused) {
            if (dot) dot.className = 'w-1.5 h-1.5 rounded-full bg-accent-theme animate-pulse';
            if (statusText) statusText.innerText = 'Đang tính giờ';
            if (playBtn) playBtn.innerHTML = '⏸️ Tạm dừng';
        } else if (isTimerPaused) {
            if (dot) dot.className = 'w-1.5 h-1.5 rounded-full bg-amber-500';
            if (statusText) statusText.innerText = 'Đang tạm dừng';
            if (playBtn) playBtn.innerHTML = '▶️ Tiếp tục';
        } else {
            if (dot) dot.className = 'w-1.5 h-1.5 rounded-full bg-zinc-400';
            if (statusText) statusText.innerText = 'Chưa tính giờ';
            if (playBtn) playBtn.innerHTML = '▶️ Bắt đầu';
        }
    };

    const startTimer = () => {
        if (isTimerPaused) {
            timerStartTime += Date.now() - timerPausedTime;
            isTimerPaused = false;
        } else if (!timerInterval) {
            timerStartTime = timerStartTime || Date.now();
        }
        if (!timerInterval) timerInterval = setInterval(updateTimerDisplay, 1000);
        localStorage.setItem('tally_timer_run', 'true');
        localStorage.setItem('tally_timer_start', timerStartTime.toString());
        updateTimerStatusUI();
    };

    const pauseTimer = () => {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
            timerPausedTime = Date.now();
            isTimerPaused = true;
            localStorage.setItem('tally_timer_run', 'false');
            updateTimerStatusUI();
        }
    };

    const resetTimer = () => {
        clearInterval(timerInterval);
        timerInterval = null;
        timerStartTime = null;
        timerPausedTime = null;
        isTimerPaused = false;
        const headerTimer = _('#tally-timer-display');
        const modalTimer = _('#modal-timer-clock-text');
        if (headerTimer) headerTimer.innerText = '00:00:00';
        if (modalTimer) modalTimer.innerText = '00:00:00';
        localStorage.removeItem('tally_timer_start');
        localStorage.setItem('tally_timer_run', 'false');
        updateTimerStatusUI();
    };

    _('#btn-timer-trigger')?.addEventListener('click', () => {
        updateTimerDisplay();
        updateTimerStatusUI();
        openModal('#modal-timer-backdrop', '#modal-timer-card');
    });

    _('#btn-modal-timer-playpause')?.addEventListener('click', () => {
        if (timerInterval && !isTimerPaused) {
            pauseTimer();
            UI.notch.notify('Đồng hồ', 'Đã tạm dừng tính giờ', 'warning', 1500);
        } else {
            startTimer();
            UI.notch.notify('Đồng hồ', 'Đang tiếp tục tính giờ ván đấu', 'success', 1500);
        }
    });

    _('#btn-modal-timer-restart')?.addEventListener('click', () => {
        resetTimer();
        startTimer();
        closeModal('#modal-timer-backdrop', '#modal-timer-card');
        UI.notch.notify('Đồng hồ', 'Đã bắt đầu đếm lại từ 0', 'info', 1500);
    });

    _('#btn-modal-timer-reset')?.addEventListener('click', () => {
        resetTimer();
        closeModal('#modal-timer-backdrop', '#modal-timer-card');
        UI.notch.notify('Đồng hồ', 'Đã tắt và đưa đồng hồ về 0', 'info', 1500);
    });

    _('#btn-show-rules')?.addEventListener('click', () => {
        UI.notch.notify(
            'Luật chơi Tally',
            'Nhập danh sách nhiều người cách nhau bởi dấu phẩy. SmartPoint tự động tính điểm theo thứ tự giảm dần.',
            'info',
            4500
        );
    });

    // =========================================================
    // CÀI ĐẶT BỐ CỤC & AVATAR
    // =========================================================
    _('#btn-layout-list')?.addEventListener('click', () => {
        layoutMode = 'list';
        localStorage.setItem('tally_layout_mode', 'list');
        applyLayoutButtons('list');
        UI.notch.notify('Bố cục', 'Đã chuyển sang dạng Danh sách', 'info', 1500);
    });

    _('#btn-layout-grid')?.addEventListener('click', () => {
        layoutMode = 'grid';
        localStorage.setItem('tally_layout_mode', 'grid');
        applyLayoutButtons('grid');
        UI.notch.notify('Bố cục', 'Đã chuyển sang dạng Lưới thẻ', 'info', 1500);
    });

    _('#btn-avt-letter')?.addEventListener('click', () => {
        defaultAvtType = 'letter';
        localStorage.setItem('tally_default_avt', 'letter');
        applyAvtButtons('letter');
        UI.notch.notify('Avatar', 'Mặc định hiển thị chữ cái đầu', 'info', 1500);
    });

    _('#btn-avt-emoji')?.addEventListener('click', () => {
        defaultAvtType = 'emoji';
        localStorage.setItem('tally_default_avt', 'emoji');
        applyAvtButtons('emoji');
        UI.notch.notify('Avatar', 'Mặc định gán Emoji ngẫu nhiên', 'info', 1500);
    });

    // =========================================================
    // NẠP DỮ LIỆU TỪ STORAGE KHI MỞ TOOL
    // =========================================================
    const loadFromStorage = () => {
        const saved = JSON.parse(localStorage.getItem('tally_players') || '[]');
        saved.forEach(p => createTallyCard(p.name, p.quantity, p.avatar));
        checkEmptyState();
        renderRecentHistory();
        updateRankBadges();

        const sTime = localStorage.getItem('tally_timer_start');
        const isRun = localStorage.getItem('tally_timer_run') === 'true';
        if (isRun && sTime) {
            timerStartTime = parseInt(sTime, 10);
            startTimer();
        } else {
            updateTimerStatusUI();
        }
    };

    loadFromStorage();
}