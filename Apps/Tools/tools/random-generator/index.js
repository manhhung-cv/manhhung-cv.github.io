import { UI } from '../../js/ui.js';

// =============================================================================
// 0. DYNAMIC THEME ACCENT CONTROLLER
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
// 1. ADAPTIVE ISLAND & TOAST FALLBACK CONTROLLER
// =============================================================================
export const IslandKit = {
    isIslandActive: () => {
        const isEnabled = localStorage.getItem('hunqos_dynamic_island') !== 'false';
        const wrapper = document.getElementById('dynamic-island-wrapper');
        const isDOMVisible = wrapper && !wrapper.classList.contains('hidden') && window.getComputedStyle(wrapper).display !== 'none';
        return Boolean(isEnabled && isDOMVisible && typeof window.triggerIslandNotification === 'function');
    },

    notify: (title, desc, type = 'info', duration = 2800) => {
        if (IslandKit.isIslandActive()) {
            window.triggerIslandNotification(title, desc, type, duration);
        } else {
            UI.showAlert(title, desc, type, duration);
        }
    }
};

// =============================================================================
// 2. TEMPLATE RENDERER (HUNQOS MINIMAL FLAT - TOUCH & WORKSPACE STANDARD)
// =============================================================================
export function template() {
    return `
    <div id="random-root-container" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #random-root-container {
                --kit-accent: #10b981;
            }
            .bg-accent-theme {
                background-color: var(--kit-accent) !important;
            }
            .text-accent-theme {
                color: var(--kit-accent) !important;
            }
            .border-accent-theme {
                border-color: var(--kit-accent) !important;
            }
            .accent-theme-tint {
                accent-color: var(--kit-accent) !important;
            }
            .bg-accent-theme-alpha {
                background-color: color-mix(in srgb, var(--kit-accent) 14%, transparent) !important;
            }
            .hover-bg-accent-theme-alpha:hover {
                background-color: color-mix(in srgb, var(--kit-accent) 20%, transparent) !important;
            }

            .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.12); border-radius: 9999px; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { scrollbar-width: none; }

            .zen-select { -webkit-appearance: none; -moz-appearance: none; appearance: none; }

            .switch-pill {
                width: 44px;
                height: 24px;
                background-color: rgba(0, 0, 0, 0.12) !important;
                border-radius: 9999px;
                position: relative;
                cursor: pointer;
                transition: background-color 0.2s ease, border-color 0.2s ease;
                padding: 2px;
                border: 1px solid rgba(0, 0, 0, 0.08);
                display: inline-flex;
                align-items: center;
                flex-shrink: 0;
            }
            .dark .switch-pill {
                background-color: rgba(255, 255, 255, 0.16) !important;
                border-color: rgba(255, 255, 255, 0.12);
            }
            .switch-pill .switch-thumb {
                width: 18px;
                height: 18px;
                background-color: #ffffff;
                border-radius: 9999px;
                transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
            }
            .switch-pill.active {
                background-color: var(--kit-accent) !important;
                border-color: transparent !important;
            }
            .switch-pill.active .switch-thumb {
                transform: translateX(20px);
            }

            .rand-input-zen {
                -webkit-user-select: text !important;
                user-select: text !important;
            }

            /* Wheel Animations & Flat Style */
            #wheel-canvas { transition: transform 5s cubic-bezier(0.16, 1, 0.3, 1); }
            .spin-center-btn {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 72px;
                height: 72px;
                background: #18181b;
                color: #ffffff;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 800;
                font-size: 0.85rem;
                letter-spacing: 0.05em;
                cursor: pointer;
                z-index: 15;
                border: 4px solid #ffffff;
                box-shadow: 0 4px 18px rgba(0,0,0,0.15);
                transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease;
                user-select: none;
                touch-action: none;
            }
            .dark .spin-center-btn {
                background: #ffffff;
                color: #18181b;
                border-color: #161618;
            }
            .spin-center-btn:active { transform: translate(-50%, -50%) scale(0.94); }
            .spin-center-btn.disabled { opacity: 0.5; pointer-events: none; }

            @keyframes wheelShake {
                0% { transform: translate(1px, 1px) rotate(0deg); }
                20% { transform: translate(-2px, 0px) rotate(1deg); }
                40% { transform: translate(1px, -1px) rotate(1deg); }
                60% { transform: translate(-2px, 1px) rotate(0deg); }
                80% { transform: translate(-1px, -1px) rotate(1deg); }
                100% { transform: translate(1px, 2px) rotate(0deg); }
            }
            .wheel-charging {
                animation: wheelShake 0.25s infinite;
                box-shadow: 0 0 35px var(--kit-accent), inset 0 0 30px var(--kit-accent) !important;
                border-color: var(--kit-accent) !important;
            }
            .btn-charging {
                background-color: var(--kit-accent) !important;
                color: #ffffff !important;
                border-color: #ffffff !important;
                box-shadow: 0 0 25px var(--kit-accent);
                transform: translate(-50%, -50%) scale(1.1) !important;
            }

            .wheel-pointer {
                position: absolute;
                top: 50%;
                right: -8px;
                transform: translateY(-50%);
                width: 0;
                height: 0;
                border-top: 14px solid transparent;
                border-bottom: 14px solid transparent;
                border-right: 32px solid #18181b;
                z-index: 20;
                filter: drop-shadow(-2px 0 4px rgba(0,0,0,0.15));
            }
            .dark .wheel-pointer {
                border-right-color: #ffffff;
            }
        </style>

        <!-- MAIN SCROLLER -->
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-4xl mx-auto space-y-5">
            
            <!-- SEAMLESS HERO TITLE -->
            <div class="px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                        <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Utility</span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Quay Ngẫu Nhiên</h1>
                    <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Quay số, bốc thăm ngẫu nhiên, chia nhóm đội hình và vòng quay may mắn lực nảy.</p>
                </div>

                <div class="flex items-center gap-2" id="header-action-zone">
                    <button id="btn-copy-res" class="h-10 px-4 rounded-[14px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm">
                        <i class="far fa-copy text-xs"></i> <span>Sao chép kết quả</span>
                    </button>
                </div>
            </div>

            <!-- CONTROLS & NAVIGATION -->
            <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-2.5 shadow-sm">
                <div class="flex overflow-x-auto no-scrollbar gap-1 p-1" id="rand-tabs">
                    <button class="rand-tab active h-9 px-4 rounded-[12px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex items-center gap-1.5 shrink-0" data-mode="number">
                        <i class="fas fa-dice text-[11px]"></i> Quay số
                    </button>
                    <button class="rand-tab h-9 px-4 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0" data-mode="name">
                        <i class="fas fa-list-ol text-[11px]"></i> Chọn tên
                    </button>
                    <button class="rand-tab h-9 px-4 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0" data-mode="team">
                        <i class="fas fa-users text-[11px]"></i> Chia đội
                    </button>
                    <button class="rand-tab h-9 px-4 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0" data-mode="wheel">
                        <i class="fas fa-life-ring text-[11px]"></i> Vòng quay
                    </button>
                </div>
            </div>

            <!-- WORKSPACE GRID -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
                
                <!-- LEFT SETTINGS CARD -->
                <div class="lg:col-span-5 flex flex-col gap-4">
                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm space-y-4">
                        <div class="flex items-center justify-between">
                            <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Cấu hình tham số</h3>
                            <span class="text-[10px] text-zinc-400 font-mono" id="rand-mode-badge">Random Number</span>
                        </div>

                        <!-- 1. PANE NUMBER -->
                        <div id="pane-number" class="rand-pane block space-y-3">
                            <div class="grid grid-cols-2 gap-3">
                                <div class="space-y-1">
                                    <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Nhỏ nhất (Min)</label>
                                    <input type="number" id="num-min" value="1" class="rand-input-zen w-full h-11 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3.5 outline-none focus:border-accent-theme text-sm font-bold text-zinc-900 dark:text-white">
                                </div>
                                <div class="space-y-1">
                                    <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Lớn nhất (Max)</label>
                                    <input type="number" id="num-max" value="100" class="rand-input-zen w-full h-11 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3.5 outline-none focus:border-accent-theme text-sm font-bold text-zinc-900 dark:text-white">
                                </div>
                            </div>
                        </div>

                        <!-- 2. PANE NAME -->
                        <div id="pane-name" class="rand-pane hidden space-y-2">
                            <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Danh sách ứng viên (Mỗi dòng 1 tên)</label>
                            <textarea id="name-list" class="rand-input-zen w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-3.5 outline-none focus:border-accent-theme text-xs font-semibold text-zinc-900 dark:text-white min-h-[130px] resize-y custom-scrollbar placeholder-zinc-400 leading-relaxed" placeholder="Nguyễn Văn A&#10;Trần Thị B&#10;Lê Văn C..."></textarea>
                        </div>

                        <!-- 3. PANE TEAM -->
                        <div id="pane-team" class="rand-pane hidden space-y-3">
                            <div class="space-y-1">
                                <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Danh sách thành viên</label>
                                <textarea id="team-list" class="rand-input-zen w-full bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-3.5 outline-none focus:border-accent-theme text-xs font-semibold text-zinc-900 dark:text-white min-h-[110px] resize-y custom-scrollbar placeholder-zinc-400 leading-relaxed" placeholder="Thành viên 1&#10;Thành viên 2&#10;Thành viên 3..."></textarea>
                            </div>
                            <div class="space-y-1">
                                <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Số lượng nhóm cần chia</label>
                                <input type="number" id="team-qty" value="2" min="2" class="rand-input-zen w-full h-11 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3.5 outline-none focus:border-accent-theme text-sm font-bold text-zinc-900 dark:text-white">
                            </div>
                        </div>

                        <!-- 4. PANE WHEEL -->
                        <div id="pane-wheel" class="rand-pane hidden space-y-3.5">
                            <div class="space-y-1.5">
                                <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Bảng màu gợi ý</label>
                                <div class="flex flex-wrap gap-1.5">
                                    <button onclick="window.wheelApp.applyPalette('pastel')" class="h-8 px-3 rounded-[10px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 active:scale-95 transition-all">
                                        <span class="w-2.5 h-2.5 rounded-full bg-[#FFB3BA]"></span> Pastel
                                    </button>
                                    <button onclick="window.wheelApp.applyPalette('bold')" class="h-8 px-3 rounded-[10px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 active:scale-95 transition-all">
                                        <span class="w-2.5 h-2.5 rounded-full bg-[#FF3B30]"></span> Tương phản
                                    </button>
                                    <button onclick="window.wheelApp.applyPalette('neon')" class="h-8 px-3 rounded-[10px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 active:scale-95 transition-all">
                                        <span class="w-2.5 h-2.5 rounded-full bg-[#00FFFF]"></span> Neon
                                    </button>
                                </div>
                            </div>

                            <div class="space-y-2">
                                <div class="grid grid-cols-12 gap-1 text-[9px] font-bold text-zinc-400 uppercase tracking-wider px-1">
                                    <div class="col-span-5">Nội dung</div>
                                    <div class="col-span-2 text-center">Tỷ lệ</div>
                                    <div class="col-span-2 text-center">Màu</div>
                                    <div class="col-span-2 text-center">Ảnh</div>
                                    <div class="col-span-1 text-center"></div>
                                </div>
                                <div id="items-container" class="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto custom-scrollbar pr-1"></div>
                            </div>

                            <div class="pt-2 border-t border-black/[0.05] dark:border-white/[0.08] space-y-3">
                                <button onclick="window.wheelApp.addNewItem()" class="w-full h-10 rounded-[12px] bg-accent-theme-alpha text-accent-theme font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all">
                                    <i class="fas fa-plus text-[10px]"></i> Thêm ô may mắn
                                </button>
                                <div class="flex items-center justify-between px-1">
                                    <span class="text-xs font-medium text-zinc-800 dark:text-zinc-200">Tự động loại bỏ mục trúng thưởng</span>
                                    <button id="remove-winner-switch" class="switch-pill" type="button">
                                        <div class="switch-thumb"></div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- COMMON SETTINGS -->
                        <div class="space-y-3 pt-3 border-t border-black/[0.05] dark:border-white/[0.08]" id="common-settings">
                            <div class="space-y-1" id="group-qty">
                                <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Số lượng kết quả rút ra</label>
                                <input type="number" id="rand-qty" value="1" min="1" class="rand-input-zen w-full h-11 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3.5 outline-none focus:border-accent-theme text-sm font-bold text-zinc-900 dark:text-white">
                            </div>

                            <div class="flex items-center justify-between" id="group-dup">
                                <span class="text-xs font-medium text-zinc-800 dark:text-zinc-200">Cho phép trùng lặp kết quả</span>
                                <button id="rand-dup-switch" class="switch-pill" type="button">
                                    <div class="switch-thumb"></div>
                                </button>
                            </div>

                            <div class="space-y-1 relative">
                                <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Thuật toán bộ sinh ngẫu nhiên</label>
                                <select id="rand-engine" class="zen-select rand-input-zen w-full h-11 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] px-3.5 pr-8 outline-none focus:border-accent-theme text-xs font-bold text-zinc-900 dark:text-white cursor-pointer">
                                    <option value="crypto" selected>Mật mã học bảo mật (WebCrypto API)</option>
                                    <option value="math">Thuật toán giả ngẫu nhiên (Math.random)</option>
                                </select>
                                <i class="fas fa-chevron-down absolute right-3 bottom-3.5 text-[9px] text-zinc-400 pointer-events-none"></i>
                            </div>
                        </div>

                        <button id="btn-generate" class="w-full h-11 rounded-[14px] bg-accent-theme text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm">
                            <i class="fas fa-dice text-xs"></i> <span>Thực thi quay số</span>
                        </button>
                    </div>
                </div>

                <!-- RIGHT PREVIEW / WHEEL DISPLAY CARD -->
                <div class="lg:col-span-7 flex flex-col h-full">
                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm min-h-[430px] flex flex-col justify-between">
                        
                        <div class="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08] pb-3" id="res-header">
                            <div class="flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-accent-theme"></span>
                                <h3 class="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Bảng kết xuất</h3>
                            </div>
                            <span class="text-[10px] text-zinc-400 font-mono" id="res-counter-badge">Ready</span>
                        </div>

                        <!-- 1. TEXT / NUMBERS RESULT VIEW -->
                        <div id="res-display" class="flex-1 p-6 flex flex-col items-center justify-center text-center relative overflow-y-auto custom-scrollbar">
                            <div class="text-zinc-300 dark:text-zinc-700 opacity-60 flex flex-col items-center gap-3" id="res-empty">
                                <i class="fas fa-shuffle text-4xl"></i>
                                <span class="text-xs font-bold uppercase tracking-wider">Đang chờ khởi tạo...</span>
                            </div>
                        </div>

                        <!-- 2. WHEEL VIEW CANVAS -->
                        <div id="wheel-display" class="flex-1 items-center justify-center relative p-3 hidden">
                            <div class="relative w-full max-w-[340px] sm:max-w-[380px] aspect-square mx-auto flex items-center justify-center">
                                <div class="wheel-pointer"></div>
                                <div id="wheel-wrapper" class="w-full h-full rounded-full border-[5px] border-zinc-900 dark:border-white shadow-xl p-1 bg-white transition-all duration-300 relative overflow-hidden">
                                    <canvas id="wheel-canvas" width="600" height="600" class="w-full h-full rounded-full"></canvas>
                                </div>
                                <div id="spin-btn" class="spin-center-btn shadow-md">QUAY</div>
                            </div>
                        </div>

                        <div class="pt-3 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between text-[11px] text-zinc-400">
                            <span id="footer-mode-note">Chế độ đồng bộ thời gian thực</span>
                            <span class="font-mono text-[10px]">HunqOS Matrix</span>
                        </div>
                    </div>
                </div>

            </div>

        </main>

        <!-- WINNER POPUP MODAL -->
        <div id="result-modal" class="fixed inset-0 bg-black/60 backdrop-blur-md hidden items-center justify-center z-[100] transition-opacity duration-200 opacity-0 p-4">
            <div class="bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] rounded-[24px] p-6 max-w-sm w-full text-center transform scale-90 transition-transform duration-200 shadow-2xl relative">
                <button onclick="window.wheelApp.closeModal()" class="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center text-xs absolute top-4 right-4 active:scale-95 transition-all">
                    <i class="fas fa-times"></i>
                </button>
                <div class="w-12 h-12 rounded-[16px] bg-accent-theme-alpha text-accent-theme flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <i class="fas fa-trophy text-lg"></i>
                </div>
                <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Chúc Mừng Chiến Thắng</p>
                <div id="winner-display" class="mb-5">
                    <img id="winner-img" src="" class="mx-auto max-h-28 rounded-[14px] border border-black/[0.05] dark:border-white/[0.08] mb-3 hidden object-contain shadow-sm">
                    <h2 id="winner-text" class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white break-words leading-tight"></h2>
                </div>
                <button onclick="window.wheelApp.closeModal()" class="w-full h-11 rounded-[14px] bg-accent-theme text-white font-bold text-xs uppercase tracking-wider active:scale-95 transition-all shadow-sm">
                    Xác nhận
                </button>
            </div>
        </div>

    </div>
    `;
}

// =============================================================================
// 3. LOGIC HOOKS & EVENT DISPATCHING
// =============================================================================
export function init(hostElement) {
    const rootContainer = hostElement.querySelector('#random-root-container') || hostElement;

    // Theme integration
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    // Scoped Query
    const tabs = hostElement.querySelectorAll('#rand-tabs .rand-tab');
    const panes = {
        'number': hostElement.querySelector('#pane-number'),
        'name': hostElement.querySelector('#pane-name'),
        'team': hostElement.querySelector('#pane-team'),
        'wheel': hostElement.querySelector('#pane-wheel')
    };

    const numMin = hostElement.querySelector('#num-min');
    const numMax = hostElement.querySelector('#num-max');
    const nameList = hostElement.querySelector('#name-list');
    const teamList = hostElement.querySelector('#team-list');
    const teamQty = hostElement.querySelector('#team-qty');

    const randQty = hostElement.querySelector('#rand-qty');
    const randEngine = hostElement.querySelector('#rand-engine');

    const groupQty = hostElement.querySelector('#group-qty');
    const groupDup = hostElement.querySelector('#group-dup');
    const commonSettings = hostElement.querySelector('#common-settings');
    const randModeBadge = hostElement.querySelector('#rand-mode-badge');
    const resCounterBadge = hostElement.querySelector('#res-counter-badge');
    const footerModeNote = hostElement.querySelector('#footer-mode-note');

    const btnGenerate = hostElement.querySelector('#btn-generate');
    const resDisplay = hostElement.querySelector('#res-display');
    const resEmpty = hostElement.querySelector('#res-empty');
    const btnCopy = hostElement.querySelector('#btn-copy-res');

    const resHeader = hostElement.querySelector('#res-header');
    const wheelDisplay = hostElement.querySelector('#wheel-display');
    const switchRemoveWinner = hostElement.querySelector('#remove-winner-switch');
    const switchRandDup = hostElement.querySelector('#rand-dup-switch');

    let currentMode = 'number';
    let isRolling = false;
    let finalResultsForCopy = '';

    let allowDuplicate = false;
    let removeWinnerAfterSpin = false;

    // Switch Pills
    switchRandDup?.addEventListener('click', () => {
        switchRandDup.classList.toggle('active');
        allowDuplicate = switchRandDup.classList.contains('active');
    });

    switchRemoveWinner?.addEventListener('click', () => {
        switchRemoveWinner.classList.toggle('active');
        removeWinnerAfterSpin = switchRemoveWinner.classList.contains('active');
    });

    // Tab Classes Standard
    const activeTabClass = 'rand-tab active h-9 px-4 rounded-[12px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex items-center gap-1.5 shrink-0';
    const inactiveTabClass = 'rand-tab h-9 px-4 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0';

    tabs.forEach(tab => {
        tab.onclick = () => {
            if (isRolling) return;

            tabs.forEach(t => { t.className = inactiveTabClass; });
            tab.className = activeTabClass;

            currentMode = tab.dataset.mode;

            Object.values(panes).forEach(p => {
                p.classList.remove('block', 'flex');
                p.classList.add('hidden');
            });

            if (currentMode === 'wheel') {
                panes[currentMode].classList.remove('hidden');
                panes[currentMode].classList.add('block');
                commonSettings.style.display = 'none';
                btnGenerate.style.display = 'none';
                resHeader.style.display = 'none';
                resDisplay.style.display = 'none';
                wheelDisplay.style.display = 'flex';
                randModeBadge.textContent = 'Lucky Wheel';
                footerModeNote.textContent = 'Nhấn giữ nút giữa để gồng lực quay';
                setTimeout(() => window.wheelApp && window.wheelApp.drawWheel(), 50);
            } else {
                panes[currentMode].classList.remove('hidden');
                panes[currentMode].classList.add('block');
                commonSettings.style.display = 'block';
                btnGenerate.style.display = 'flex';
                resHeader.style.display = 'flex';
                resDisplay.style.display = 'flex';
                wheelDisplay.style.display = 'none';
                footerModeNote.textContent = 'Bộ sinh ngẫu nhiên chuẩn hóa';

                if (currentMode === 'number') {
                    randModeBadge.textContent = 'Random Number';
                    btnGenerate.innerHTML = '<i class="fas fa-dice text-xs"></i> <span>Quay số ngẫu nhiên</span>';
                    groupQty.style.display = 'block';
                    groupDup.style.display = 'flex';
                } else if (currentMode === 'name') {
                    randModeBadge.textContent = 'Random Name Picker';
                    btnGenerate.innerHTML = '<i class="fas fa-list-ol text-xs"></i> <span>Bốc thăm danh sách</span>';
                    groupQty.style.display = 'block';
                    groupDup.style.display = 'flex';
                } else if (currentMode === 'team') {
                    randModeBadge.textContent = 'Team Shuffler';
                    btnGenerate.innerHTML = '<i class="fas fa-users text-xs"></i> <span>Thực thi chia đội</span>';
                    groupQty.style.display = 'none';
                    groupDup.style.display = 'none';
                }
            }
        };
    });

    // Random Algorithms
    const getRandomInt = (min, max, engine) => {
        if (engine === 'math') {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        } else {
            const range = max - min + 1;
            const maxSafe = Math.floor(4294967296 / range) * range; 
            const array = new Uint32Array(1);
            let randomValue;
            do {
                window.crypto.getRandomValues(array);
                randomValue = array[0];
            } while (randomValue >= maxSafe); 
            return min + (randomValue % range);
        }
    };

    const shuffleArray = (array, engine) => {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = getRandomInt(0, i, engine);
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    };

    const generateResults = () => {
        const engine = randEngine.value;
        const qty = parseInt(randQty.value) || 1;
        let results = null;

        if (currentMode === 'number') {
            const min = parseInt(numMin.value);
            const max = parseInt(numMax.value);

            if (isNaN(min) || isNaN(max) || min > max) {
                IslandKit.notify('Lỗi tham số', 'Khoảng Min/Max không hợp lệ.', 'error');
                return null;
            }
            if (!allowDuplicate && qty > (max - min + 1)) {
                IslandKit.notify('Cảnh báo', 'Số lượng yêu cầu vượt quá khoảng giá trị khi không trùng lặp.', 'warning');
                return null;
            }

            results = [];
            if (allowDuplicate) {
                for (let i = 0; i < qty; i++) results.push(getRandomInt(min, max, engine));
            } else {
                let pool = [];
                for (let i = min; i <= max; i++) pool.push(i);
                pool = shuffleArray(pool, engine);
                results = pool.slice(0, qty);
            }
        } 
        else if (currentMode === 'name') {
            const rawNames = nameList.value.split(/[\n,]+/).map(n => n.trim()).filter(n => n.length > 0);

            if (rawNames.length === 0) {
                IslandKit.notify('Thiếu danh sách', 'Vui lòng nhập tối thiểu 1 tên ứng viên.', 'warning');
                return null;
            }
            if (!allowDuplicate && qty > rawNames.length) {
                IslandKit.notify('Cảnh báo', 'Số lượng yêu cầu lớn hơn số tên hiện có.', 'warning');
                return null;
            }

            results = [];
            if (allowDuplicate) {
                for (let i = 0; i < qty; i++) {
                    const rIndex = getRandomInt(0, rawNames.length - 1, engine);
                    results.push(rawNames[rIndex]);
                }
            } else {
                let pool = shuffleArray(rawNames, engine);
                results = pool.slice(0, qty);
            }
        }
        else if (currentMode === 'team') {
            const rawMembers = teamList.value.split(/[\n,]+/).map(n => n.trim()).filter(n => n.length > 0);
            const numTeams = parseInt(teamQty.value) || 2;

            if (rawMembers.length < numTeams) {
                IslandKit.notify('Số lượng thiếu', 'Số thành viên ít hơn số nhóm cần chia.', 'warning');
                return null;
            }

            const shuffled = shuffleArray(rawMembers, engine);
            results = Array.from({ length: numTeams }, () => []);
            shuffled.forEach((member, index) => {
                results[index % numTeams].push(member);
            });
        }
        return results;
    };

    const renderResults = (results) => {
        if (resEmpty) resEmpty.style.display = 'none';

        if (currentMode === 'number' || currentMode === 'name') {
            finalResultsForCopy = results.join('\n');
            resCounterBadge.textContent = `${results.length} mục`;

            if (results.length === 1) {
                resDisplay.innerHTML = `<div class="text-6xl sm:text-7xl font-black text-accent-theme font-mono tracking-tight leading-none">${results[0]}</div>`;
            } else {
                let html = '<div class="flex flex-wrap gap-2 justify-center content-start w-full py-2">';
                results.forEach((res) => {
                    html += `<div class="bg-[#f2f2f7] dark:bg-black/40 text-zinc-900 dark:text-white px-4 py-2 rounded-[14px] text-base sm:text-lg font-bold border border-black/[0.04] dark:border-white/[0.06] shadow-sm">${res}</div>`;
                });
                html += '</div>';
                resDisplay.innerHTML = html;
            }
            IslandKit.notify('Hoàn tất', `Đã chọn ra ${results.length} kết quả.`, 'success');
        } 
        else if (currentMode === 'team') {
            let copyText = '';
            resCounterBadge.textContent = `${results.length} đội`;
            let html = '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full content-start text-left py-1">';

            results.forEach((team, idx) => {
                copyText += `Đội ${idx + 1}:\n- ${team.join('\n- ')}\n\n`;
                html += `
                    <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[18px] p-3.5 space-y-2">
                        <div class="text-[10px] font-bold text-accent-theme uppercase tracking-wider border-b border-black/[0.05] dark:border-white/[0.08] pb-1.5 flex justify-between items-center">
                            <span>Đội ${idx + 1}</span>
                            <span class="font-mono text-zinc-400">${team.length} người</span>
                        </div>
                        <ul class="space-y-1">
                            ${team.map(member => `<li class="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5"><i class="fas fa-user text-zinc-400 text-[9px]"></i> <span class="truncate">${member}</span></li>`).join('')}
                        </ul>
                    </div>
                `;
            });
            html += '</div>';

            finalResultsForCopy = copyText.trim();
            resDisplay.innerHTML = html;
            IslandKit.notify('Hoàn tất', `Đã chia thành ${results.length} đội cân đối.`, 'success');
        }
    };

    const animateRoll = (finalResults) => {
        isRolling = true;
        btnGenerate.disabled = true;
        btnGenerate.classList.add('opacity-50', 'pointer-events-none');
        btnGenerate.innerHTML = '<i class="fas fa-circle-notch fa-spin text-xs"></i> <span>Đang xử lý...</span>';

        if (resEmpty) resEmpty.style.display = 'none';

        let ticks = 0;
        const maxTicks = 10;
        const hackerChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        const interval = setInterval(() => {
            ticks++;
            let fakeData = '';
            const len = currentMode === 'number' ? 3 : 5;
            for (let i = 0; i < len; i++) {
                fakeData += hackerChars.charAt(Math.floor(Math.random() * hackerChars.length));
            }

            resDisplay.innerHTML = `<div class="text-5xl font-black text-zinc-400 opacity-40 font-mono tracking-widest blur-[0.5px]">${fakeData}</div>`;

            if (ticks >= maxTicks) {
                clearInterval(interval);
                isRolling = false;
                btnGenerate.disabled = false;
                btnGenerate.classList.remove('opacity-50', 'pointer-events-none');

                if (currentMode === 'number') btnGenerate.innerHTML = '<i class="fas fa-dice text-xs"></i> <span>Quay số ngẫu nhiên</span>';
                else if (currentMode === 'name') btnGenerate.innerHTML = '<i class="fas fa-list-ol text-xs"></i> <span>Bốc thăm danh sách</span>';
                else btnGenerate.innerHTML = '<i class="fas fa-users text-xs"></i> <span>Thực thi chia đội</span>';

                renderResults(finalResults);
            }
        }, 50);
    };

    btnGenerate.onclick = () => {
        if (isRolling) return;
        const results = generateResults();
        if (results) animateRoll(results);
    };

    btnCopy.onclick = async () => {
        if (!finalResultsForCopy) {
            return IslandKit.notify('Trống', 'Chưa có kết quả khả dụng để sao chép.', 'warning');
        }
        try {
            await navigator.clipboard.writeText(finalResultsForCopy);
            IslandKit.notify('Đã sao chép', 'Kết quả đã được lưu vào bộ nhớ tạm.', 'success');
        } catch (e) {
            IslandKit.notify('Lỗi', 'Không thể truy cập clipboard.', 'error');
        }
    };

    // ==========================================
    // MODULE VÒNG QUAY MAY MẮN (WHEEL ENGINE)
    // ==========================================
    const canvas = hostElement.querySelector('#wheel-canvas');
    const ctx = canvas.getContext('2d');
    const itemsContainer = hostElement.querySelector('#items-container');
    const spinBtn = hostElement.querySelector('#spin-btn');
    const resultModal = hostElement.querySelector('#result-modal');

    let wheelCurrentRotation = 0;
    let wheelIsSpinning = false;
    let isCharging = false;
    let chargeStartTime = 0;
    let updateTimeout;

    const palettes = {
        pastel: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF', '#E8BAFF', '#FFC4E1'],
        bold: ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#5AC8FA', '#007AFF', '#5856D6'],
        neon: ['#FF00FF', '#00FFFF', '#00FF00', '#FFFF00', '#FF0000', '#0000FF', '#FF8800'],
    };
    let currentPalette = palettes.bold;
    const generateId = () => Math.random().toString(36).substr(2, 9);

    let wheelItems = [
        { id: generateId(), text: 'Giải Nhất', ratio: 1, color: '#FF3B30', imageSrc: null, imageObj: null },
        { id: generateId(), text: 'Giải Nhì', ratio: 1, color: '#007AFF', imageSrc: null, imageObj: null },
        { id: generateId(), text: 'May Mắn Lần Sau', ratio: 2, color: '#18181b', imageSrc: null, imageObj: null },
        { id: generateId(), text: 'Giải Ba', ratio: 1, color: '#34C759', imageSrc: null, imageObj: null }
    ];

    window.wheelApp = {
        applyPalette: (type) => {
            currentPalette = palettes[type] || palettes.bold;
            wheelItems.forEach((item, index) => { item.color = currentPalette[index % currentPalette.length]; });
            window.wheelApp.renderItemInputs();
            window.wheelApp.drawWheel();
            IslandKit.notify('Màu sắc', `Đã áp dụng bảng màu ${type}.`, 'info');
        },
        updateItem: (id, field, value) => {
            const item = wheelItems.find(i => i.id === id);
            if (item) {
                item[field] = value;
                clearTimeout(updateTimeout);
                updateTimeout = setTimeout(() => window.wheelApp.drawWheel(), 250);
            }
        },
        addNewItem: () => {
            const nextColor = currentPalette[wheelItems.length % currentPalette.length];
            wheelItems.push({ 
                id: generateId(), 
                text: `Mục ${wheelItems.length + 1}`, 
                ratio: 1, 
                color: nextColor, 
                imageSrc: null, 
                imageObj: null 
            });
            window.wheelApp.renderItemInputs();
            window.wheelApp.drawWheel();
            itemsContainer.scrollTop = itemsContainer.scrollHeight;
        },
        removeItem: (id) => {
            wheelItems = wheelItems.filter(item => item.id !== id);
            window.wheelApp.renderItemInputs();
            window.wheelApp.drawWheel();
        },
        handleImageUpload: (event, id) => {
            const file = event.target.files[0];
            if (!file || !file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target.result;
                const img = new Image();
                img.onload = () => {
                    const item = wheelItems.find(i => i.id === id);
                    if (item) { 
                        item.imageSrc = dataUrl; 
                        item.imageObj = img; 
                        window.wheelApp.renderItemInputs(); 
                        window.wheelApp.drawWheel(); 
                    }
                };
                img.src = dataUrl;
            };
            reader.readAsDataURL(file);
            event.target.value = '';
        },
        removeImage: (id) => {
            const item = wheelItems.find(i => i.id === id);
            if (item) { 
                item.imageSrc = null; 
                item.imageObj = null; 
                window.wheelApp.renderItemInputs(); 
                window.wheelApp.drawWheel(); 
            }
        },
        closeModal: () => {
            resultModal.classList.add('opacity-0');
            resultModal.querySelector('div').classList.remove('scale-100');
            resultModal.querySelector('div').classList.add('scale-90');
            setTimeout(() => {
                resultModal.classList.add('hidden');
                resultModal.classList.remove('flex');
                const removeId = resultModal.getAttribute('data-remove-id');
                if (removeId) window.wheelApp.removeItem(removeId);
            }, 200);
        },
        renderItemInputs: () => {
            itemsContainer.innerHTML = '';
            if (wheelItems.length === 0) {
                itemsContainer.innerHTML = `<p class="text-center text-zinc-400 py-6 text-xs italic">Chưa có mục nào. Hãy bấm thêm mục.</p>`;
                return;
            }
            wheelItems.forEach((item) => {
                const row = document.createElement('div');
                row.className = 'grid grid-cols-12 gap-1 items-center bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] p-1.5 rounded-[12px]';
                row.innerHTML = `
                    <div class="col-span-5">
                        <input type="text" value="${item.text}" oninput="window.wheelApp.updateItem('${item.id}', 'text', this.value)" placeholder="Tên..." class="rand-input-zen w-full bg-transparent border-none outline-none px-1 text-xs font-bold text-zinc-900 dark:text-white truncate">
                    </div>
                    <div class="col-span-2 flex justify-center">
                        <input type="number" value="${item.ratio}" min="1" step="0.5" oninput="window.wheelApp.updateItem('${item.id}', 'ratio', parseFloat(this.value) || 1)" class="rand-input-zen w-full max-w-[40px] text-center bg-transparent border-none outline-none text-xs font-mono font-bold text-zinc-900 dark:text-white">
                    </div>
                    <div class="col-span-2 flex justify-center">
                        <input type="color" value="${item.color}" oninput="window.wheelApp.updateItem('${item.id}', 'color', this.value)" class="w-6 h-6 rounded-[6px] cursor-pointer bg-transparent border-none p-0">
                    </div>
                    <div class="col-span-2 flex justify-center relative">
                        <input type="file" id="file-${item.id}" accept="image/*" class="hidden" onchange="window.wheelApp.handleImageUpload(event, '${item.id}')">
                        <button onclick="document.getElementById('file-${item.id}').click()" class="w-7 h-7 flex items-center justify-center rounded-[8px] ${item.imageSrc ? 'bg-accent-theme text-white' : 'bg-white dark:bg-[#27272a] text-zinc-500'} shadow-sm text-xs transition-colors" title="${item.imageSrc ? 'Đổi ảnh' : 'Thêm ảnh'}">
                            <i class="far fa-image text-[10px]"></i>
                        </button>
                        ${item.imageSrc ? `<button onclick="window.wheelApp.removeImage('${item.id}')" class="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[7px] shadow"><i class="fas fa-times"></i></button>` : ''}
                    </div>
                    <div class="col-span-1 flex justify-center">
                        <button onclick="window.wheelApp.removeItem('${item.id}')" class="text-zinc-400 hover:text-rose-500 transition-colors text-xs active:scale-90">
                            <i class="far fa-trash-can"></i>
                        </button>
                    </div>
                `;
                itemsContainer.appendChild(row);
            });
        },
        drawWheel: () => {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(centerX, centerY) - 8; 
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const totalRatio = wheelItems.reduce((sum, item) => sum + (item.ratio > 0 ? item.ratio : 0), 0);
            if (wheelItems.length === 0 || totalRatio === 0) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx.fillStyle = '#f4f4f5'; ctx.fill();
                ctx.lineWidth = 2; ctx.strokeStyle = '#e4e4e7'; ctx.stroke();
                ctx.fillStyle = '#a1a1aa'; ctx.font = '600 24px sans-serif';
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('TRỐNG', centerX, centerY);
                spinBtn.classList.add('disabled');
                return;
            }

            spinBtn.classList.remove('disabled');
            let currentAngle = 0; 
            
            for (let i = 0; i < wheelItems.length; i++) {
                const item = wheelItems[i];
                const ratio = item.ratio > 0 ? item.ratio : 0;
                const sliceAngle = (ratio / totalRatio) * 2 * Math.PI;
                if (sliceAngle === 0) continue; 
                
                const startAngle = currentAngle;
                const endAngle = currentAngle + sliceAngle;

                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, startAngle, endAngle);
                ctx.closePath();
                ctx.fillStyle = item.color || '#000000';
                ctx.fill();
                ctx.lineWidth = 2; 
                ctx.strokeStyle = '#ffffff'; 
                ctx.stroke();

                ctx.save();
                const textAngle = startAngle + sliceAngle / 2;
                const contentDist = radius * 0.65; 
                ctx.translate(centerX + Math.cos(textAngle) * contentDist, centerY + Math.sin(textAngle) * contentDist);
                ctx.rotate(textAngle);
                
                const hex = (item.color || '#000000').replace('#', '');
                const brightness = hex.length === 6 ? ((parseInt(hex.substr(0,2),16)*299) + (parseInt(hex.substr(2,2),16)*587) + (parseInt(hex.substr(4,2),16)*114))/1000 : 0;
                ctx.fillStyle = brightness > 140 ? '#000000' : '#ffffff';
                ctx.textAlign = 'center'; 
                ctx.textBaseline = 'middle';

                const hasImage = !!item.imageObj;
                const hasText = item.text && item.text.trim() !== '';

                if (hasImage && hasText) {
                    drawItemImage(ctx, item.imageObj, 15, 0, 40);
                    ctx.font = '700 15px sans-serif';
                    ctx.fillText(item.text.length > 12 ? item.text.substring(0, 10) + '..' : item.text, -25, 0);
                } else if (hasImage) {
                    ctx.rotate(Math.PI / 2);
                    drawItemImage(ctx, item.imageObj, 0, 0, 56);
                } else if (hasText) {
                    let fontSize = sliceAngle < 0.2 ? 12 : (sliceAngle < 0.4 ? 15 : 20);
                    ctx.font = `800 ${fontSize}px sans-serif`;
                    ctx.fillText(item.text.length > 18 ? item.text.substring(0, 16) + '..' : item.text, 0, 0);
                }
                ctx.restore();
                currentAngle += sliceAngle;
            }

            ctx.beginPath(); 
            ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
            ctx.fillStyle = '#ffffff'; 
            ctx.fill();
            ctx.lineWidth = 4; 
            ctx.strokeStyle = '#18181b'; 
            ctx.stroke();
        }
    };

    function drawItemImage(context, imgObj, x, y, size) {
        context.save(); 
        context.beginPath(); 
        context.arc(x, y, size/2, 0, Math.PI * 2); 
        context.closePath(); 
        context.clip();
        context.drawImage(imgObj, x - size/2, y - size/2, size, size); 
        context.restore();
        context.beginPath(); 
        context.arc(x, y, size/2, 0, Math.PI * 2); 
        context.lineWidth = 2; 
        context.strokeStyle = 'rgba(255,255,255,0.85)'; 
        context.stroke();
    }

    // Wheel Spin Engine
    let clickCount = 0;
    let clickTimer = null;

    const startCharge = () => {
        const totalRatio = wheelItems.reduce((sum, item) => sum + (item.ratio > 0 ? item.ratio : 0), 0);
        if (wheelIsSpinning || wheelItems.length === 0 || totalRatio === 0) return;

        isCharging = true; 
        chargeStartTime = Date.now();

        if (clickTimer) clearTimeout(clickTimer);

        hostElement.querySelector('#wheel-wrapper').classList.add('wheel-charging');
        spinBtn.classList.add('btn-charging');
        spinBtn.textContent = 'GỒNG..';
    };

    const releaseCharge = () => {
        if (!isCharging) return;
        isCharging = false;

        const holdTime = Date.now() - chargeStartTime;

        hostElement.querySelector('#wheel-wrapper').classList.remove('wheel-charging');
        spinBtn.classList.remove('btn-charging');
        spinBtn.textContent = 'QUAY';

        if (holdTime < 200) { 
            clickCount++;
            clickTimer = setTimeout(() => {
                const powerRatio = Math.min(clickCount * 0.35, 1);
                clickCount = 0; 
                spinWheel(3 + (powerRatio * 7), powerRatio);
            }, 350);
        } else { 
            const powerRatio = Math.min(holdTime / 3000, 1); 
            clickCount = 0; 
            spinWheel(3 + (powerRatio * 7), powerRatio);
        }
    };

    spinBtn.addEventListener('mousedown', startCharge);
    window.addEventListener('mouseup', releaseCharge);
    spinBtn.addEventListener('touchstart', (e) => { 
        e.preventDefault(); 
        startCharge(); 
    }, { passive: false });
    window.addEventListener('touchend', releaseCharge);

    const spinWheel = (durationSec, powerRatio) => {
        const totalRatio = wheelItems.reduce((sum, item) => sum + (item.ratio > 0 ? item.ratio : 0), 0);
        if (wheelIsSpinning || wheelItems.length === 0 || totalRatio === 0) return;
        wheelIsSpinning = true; 
        spinBtn.classList.add('disabled');

        canvas.style.transition = `transform ${durationSec}s cubic-bezier(0.16, 1, 0.3, 1)`;
        const extraSpins = 360 * (5 + Math.floor(powerRatio * 15));
        wheelCurrentRotation += extraSpins + (Math.random() * 360);
        canvas.style.transform = `rotate(${wheelCurrentRotation}deg)`;

        setTimeout(() => {
            wheelIsSpinning = false; 
            spinBtn.classList.remove('disabled');
            const pointerAngle = (360 - (wheelCurrentRotation % 360)) % 360; 
            let startAngle = 0; 
            let winner = null;

            for (let i = 0; i < wheelItems.length; i++) {
                const ratio = wheelItems[i].ratio > 0 ? wheelItems[i].ratio : 0;
                if (ratio === 0) continue;
                const endAngle = startAngle + ((ratio / totalRatio) * 360);
                if (pointerAngle >= startAngle && pointerAngle < endAngle) { 
                    winner = wheelItems[i]; 
                    break; 
                }
                startAngle = endAngle;
            }
            if (!winner) { 
                for (let i = wheelItems.length - 1; i >= 0; i--) {
                    if (wheelItems[i].ratio > 0) { 
                        winner = wheelItems[i]; 
                        break; 
                    }
                }
            }

            const winnerTextEl = hostElement.querySelector('#winner-text');
            const winnerImgEl = hostElement.querySelector('#winner-img');

            winnerTextEl.textContent = winner.text || '';
            const isDarkColor = winner.color && (parseInt(winner.color.replace('#','').substr(0,2),16)*299 + parseInt(winner.color.replace('#','').substr(2,2),16)*587 + parseInt(winner.color.replace('#','').substr(4,2),16)*114)/1000 < 140;
            winnerTextEl.style.color = (winner.color && !isDarkColor) ? winner.color : ''; 

            if (winner.imageSrc) { 
                winnerImgEl.src = winner.imageSrc; 
                winnerImgEl.classList.remove('hidden'); 
            } else { 
                winnerImgEl.classList.add('hidden'); 
                winnerImgEl.src = ''; 
            }

            resultModal.classList.remove('hidden'); 
            resultModal.classList.add('flex');
            setTimeout(() => { 
                resultModal.classList.remove('opacity-0'); 
                resultModal.querySelector('div').classList.remove('scale-90'); 
                resultModal.querySelector('div').classList.add('scale-100'); 
            }, 10);

            if (removeWinnerAfterSpin) {
                resultModal.setAttribute('data-remove-id', winner.id);
            } else {
                resultModal.removeAttribute('data-remove-id');
            }

            IslandKit.notify('Trúng thưởng', `Kết quả: ${winner.text || 'Ô may mắn'}`, 'success');
        }, durationSec * 1000 + 100); 
    };

    window.wheelApp.renderItemInputs();
    window.wheelApp.drawWheel();

    return () => {
        window.removeEventListener('mouseup', releaseCharge);
        window.removeEventListener('touchend', releaseCharge);
    };
}