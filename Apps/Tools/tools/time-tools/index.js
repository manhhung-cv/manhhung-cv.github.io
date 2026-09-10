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
// 1. ADAPTIVE ISLAND & TOAST FALLBACK CONTROLLER (HIỂN THỊ SONG SONG & QUAY LẠI APP)
// =============================================================================
export const IslandKit = {
    isIslandActive: () => {
        const isEnabled = localStorage.getItem('hunqos_dynamic_island') !== 'false';
        const wrapper = document.getElementById('dynamic-island-wrapper');
        return Boolean(isEnabled && wrapper);
    },

    notify: (title, desc, type = 'info', duration = 2800) => {
        if (IslandKit.isIslandActive() && typeof window.triggerIslandNotification === 'function') {
            window.triggerIslandNotification(title, desc, type, duration);
        } else {
            UI.showAlert(title, desc, type, duration);
        }
    },

    setLiveView: (htmlMarkup, onClick = null) => {
        if (!IslandKit.isIslandActive()) return;
        
        const wrapper = document.getElementById('dynamic-island-wrapper');
        const dynamicIsland = document.getElementById('dynamic-island');
        const compactView = document.getElementById('island-compact-view');
        const alertView = document.getElementById('island-alert-view');

        if (!wrapper || !compactView || !dynamicIsland) return;

        // Đảm bảo Wrapper và Compact View luôn được hiển thị song song ngay cả khi đang trong App
        wrapper.classList.remove('hidden');
        wrapper.style.display = '';

        if (alertView && !alertView.classList.contains('hidden') && alertView.classList.contains('opacity-100')) {
            // Đang có thông báo Alert nổi lên thì gán sẵn nội dung ngầm
            compactView.innerHTML = htmlMarkup;
        } else {
            compactView.innerHTML = htmlMarkup;
            compactView.classList.remove('hidden');
            dynamicIsland.classList.remove('island-alert');
            dynamicIsland.classList.add('island-compact');
        }

        if (onClick) {
            dynamicIsland.onclick = (e) => {
                if (alertView && !alertView.classList.contains('hidden') && alertView.classList.contains('opacity-100')) return;
                onClick(e);
            };
        }
    },

    resetLiveView: () => {
        const compactView = document.getElementById('island-compact-view');
        const dynamicIsland = document.getElementById('dynamic-island');
        if (compactView) {
            compactView.innerHTML = '';
            compactView.classList.add('hidden');
        }
        if (dynamicIsland) dynamicIsland.onclick = null;
    }
};

// =============================================================================
// 2. TEMPLATE RENDERER
// =============================================================================
export function template() {
    return `
    <div id="tt-root-container" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #tt-root-container {
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

            .tt-input-zen {
                font-variant-numeric: tabular-nums;
                -webkit-user-select: text !important;
                user-select: text !important;
            }

            .day-tag input { display: none; }
            .day-tag:has(input:checked) div { 
                background-color: var(--kit-accent) !important; 
                color: #ffffff !important; 
                border-color: transparent !important; 
            }

            @keyframes timeBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
            .is-ringing { animation: timeBlink 1s infinite; color: var(--kit-accent) !important; }

            input[type="time"]::-webkit-calendar-picker-indicator { display: none; }
        </style>

        <!-- MAIN SCROLLER -->
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-4xl mx-auto space-y-5">
            
            <!-- SEAMLESS HERO TITLE -->
            <div class="px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                        <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Chrono</span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Thời Gian</h1>
                    <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Hỗ trợ đồng bộ Dynamic Island song song trong app và ngoài màn hình chính.</p>
                </div>

                <div class="flex items-center gap-2">
                    <span class="text-[10px] font-mono font-bold text-accent-theme px-3 py-1.5 rounded-[12px] bg-accent-theme-alpha" id="tt-clock-now">--:--:--</span>
                </div>
            </div>

            <!-- TAB CONTROLLER -->
            <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-2.5 shadow-sm">
                <div class="flex overflow-x-auto no-scrollbar gap-1 p-1" id="tt-tabs">
                    <button class="tt-tab active h-9 px-3.5 rounded-[12px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex items-center gap-1.5 shrink-0" data-target="pane-timer">
                        <i class="fas fa-stopwatch-20 text-[11px]"></i> Đếm ngược
                    </button>
                    <button class="tt-tab h-9 px-3.5 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0" data-target="pane-stopwatch">
                        <i class="fas fa-stopwatch text-[11px]"></i> Bấm giờ
                    </button>
                    <button class="tt-tab h-9 px-3.5 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0" data-target="pane-countday">
                        <i class="fas fa-calendar-star text-[11px]"></i> Sự kiện
                    </button>
                    <button class="tt-tab h-9 px-3.5 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0" data-target="pane-datecalc">
                        <i class="fas fa-calendar-days text-[11px]"></i> Tính ngày
                    </button>
                    <button class="tt-tab h-9 px-3.5 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0" data-target="pane-timecalc">
                        <i class="fas fa-clock text-[11px]"></i> Tính giờ
                    </button>
                    <button class="tt-tab h-9 px-3.5 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0" data-target="pane-duration">
                        <i class="fas fa-arrows-left-right text-[11px]"></i> Khoảng thời gian
                    </button>
                    <button class="tt-tab h-9 px-3.5 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0" data-target="pane-week">
                        <i class="fas fa-calendar-week text-[11px]"></i> Số tuần
                    </button>
                    <button class="tt-tab h-9 px-3.5 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0" data-target="pane-age">
                        <i class="fas fa-cake-candles text-[11px]"></i> Tuổi
                    </button>
                </div>
            </div>

            <!-- WORKSPACE CONTAINER -->
            <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm overflow-hidden flex flex-col">
                
                <!-- 1. TIMER -->
                <div id="pane-timer" class="tt-pane block">
                    <div class="p-8 sm:p-12 flex flex-col items-center justify-center border-b border-black/[0.05] dark:border-white/[0.08] relative bg-[#f2f2f7] dark:bg-black/40">
                        <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3" id="tm-status">Đã sẵn sàng</div>
                        <div class="text-6xl sm:text-7xl font-black text-zinc-900 dark:text-white font-mono tracking-tight leading-none" id="tm-display">25:00</div>
                    </div>
                    
                    <div class="p-5 sm:p-6 space-y-5">
                        <div class="grid grid-cols-3 gap-3">
                            <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-2.5 flex flex-col items-center">
                                <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Giờ</span>
                                <input type="number" id="tm-h" value="0" min="0" max="99" class="tt-input-zen w-full bg-transparent border-none outline-none text-center font-black text-xl text-zinc-900 dark:text-white p-0">
                            </div>
                            <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-2.5 flex flex-col items-center">
                                <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Phút</span>
                                <input type="number" id="tm-m" value="25" min="0" max="59" class="tt-input-zen w-full bg-transparent border-none outline-none text-center font-black text-xl text-zinc-900 dark:text-white p-0">
                            </div>
                            <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-2.5 flex flex-col items-center">
                                <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Giây</span>
                                <input type="number" id="tm-s" value="0" min="0" max="59" class="tt-input-zen w-full bg-transparent border-none outline-none text-center font-black text-xl text-zinc-900 dark:text-white p-0">
                            </div>
                        </div>

                        <div class="flex justify-center flex-wrap gap-2">
                            <button class="tm-quick h-8 px-3 rounded-[10px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-zinc-700 dark:text-zinc-300 text-xs font-semibold active:scale-95 transition-all" data-m="1">+1p</button>
                            <button class="tm-quick h-8 px-3 rounded-[10px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-zinc-700 dark:text-zinc-300 text-xs font-semibold active:scale-95 transition-all" data-m="5">+5p</button>
                            <button class="tm-quick h-8 px-3 rounded-[10px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-zinc-700 dark:text-zinc-300 text-xs font-semibold active:scale-95 transition-all" data-m="15">+15p</button>
                            <button class="tm-quick h-8 px-3.5 rounded-[10px] bg-accent-theme text-white text-xs font-bold active:scale-95 transition-all shadow-sm" data-m="25">Pomodoro (25p)</button>
                        </div>

                        <div class="flex gap-2.5 pt-1">
                            <button id="btn-tm-reset" class="w-1/3 h-11 rounded-[14px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-zinc-800 dark:text-zinc-200 font-bold text-xs active:scale-95 transition-all">Đặt lại</button>
                            <button id="btn-tm-start" class="flex-1 h-11 rounded-[14px] bg-accent-theme text-white font-bold text-xs tracking-wide active:scale-95 transition-all shadow-sm">BẮT ĐẦU</button>
                        </div>
                    </div>
                </div>

                <!-- 2. STOPWATCH -->
                <div id="pane-stopwatch" class="tt-pane hidden flex-col h-[500px]">
                    <div class="p-8 sm:p-12 flex flex-col items-center justify-center border-b border-black/[0.05] dark:border-white/[0.08] bg-[#f2f2f7] dark:bg-black/40 shrink-0">
                        <div class="text-5xl sm:text-6xl font-black text-zinc-900 dark:text-white font-mono tracking-tight leading-none" id="sw-display">00:00<span class="text-2xl text-accent-theme">.00</span></div>
                    </div>
                    
                    <div id="sw-laps" class="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1.5">
                        <div class="text-center text-xs font-medium text-zinc-400 py-10">Chưa ghi nhận vòng chạy nào.</div>
                    </div>

                    <div class="p-4 sm:p-5 shrink-0 border-t border-black/[0.05] dark:border-white/[0.08] space-y-2.5">
                        <button id="btn-sw-start" class="w-full h-11 rounded-[14px] bg-accent-theme text-white font-bold text-xs tracking-wide active:scale-95 transition-all shadow-sm">BẮT ĐẦU</button>
                        <div class="flex gap-2">
                            <button id="btn-sw-lap" class="flex-1 h-10 rounded-[12px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-zinc-700 dark:text-zinc-300 font-semibold text-xs opacity-50 pointer-events-none active:scale-95 transition-all" disabled>Ghi vòng</button>
                            <button id="btn-sw-reset" class="flex-1 h-10 rounded-[12px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-zinc-700 dark:text-zinc-300 font-semibold text-xs active:scale-95 transition-all">Làm mới</button>
                        </div>
                    </div>
                </div>

                <!-- 3. COUNTDAY -->
                <div id="pane-countday" class="tt-pane hidden space-y-5 p-5 sm:p-6">
                    <div class="rounded-[20px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] p-6 text-center space-y-2">
                        <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block" id="cd-status">Thời gian đếm ngược còn lại</span>
                        <div class="text-4xl sm:text-5xl font-black text-accent-theme font-mono tracking-tight" id="cd-display">0<span class="text-xl text-zinc-400 font-sans font-bold">n</span> 0<span class="text-xl text-zinc-400 font-sans font-bold">g</span></div>
                    </div>

                    <div class="space-y-4">
                        <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-3.5 focus-within:border-accent-theme transition-all">
                            <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Thời điểm đích (Sự kiện)</label>
                            <input type="datetime-local" id="cd-target" class="tt-input-zen w-full bg-transparent border-none outline-none font-bold text-sm text-zinc-900 dark:text-white p-0 cursor-pointer">
                        </div>

                        <div class="space-y-1.5">
                            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block px-1">Mốc thời gian định kỳ</span>
                            <div class="flex flex-wrap gap-2">
                                <button class="cd-quick h-8 px-3 rounded-[10px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-xs font-semibold text-zinc-700 dark:text-zinc-300 active:scale-95 transition-all" data-type="newyear">Năm Mới</button>
                                <button class="cd-quick h-8 px-3 rounded-[10px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-xs font-semibold text-zinc-700 dark:text-zinc-300 active:scale-95 transition-all" data-type="valentine">Valentine</button>
                                <button class="cd-quick h-8 px-3 rounded-[10px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-xs font-semibold text-zinc-700 dark:text-zinc-300 active:scale-95 transition-all" data-type="christmas">Giáng Sinh</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 4. DATE CALC -->
                <div id="pane-datecalc" class="tt-pane hidden">
                    <div class="p-4 sm:p-5 border-b border-black/[0.05] dark:border-white/[0.08]">
                        <div class="grid grid-cols-2 gap-1 p-1 rounded-[12px] bg-black/[0.05] dark:bg-black/50 border border-black/[0.04] dark:border-white/[0.08]" id="dc-mode-switches">
                            <button class="tab-btn active py-1.5 rounded-[9px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm transition-all" data-val="diff">Khoảng cách ngày</button>
                            <button class="tab-btn py-1.5 rounded-[9px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all" data-val="addsub">Cộng / Trừ ngày</button>
                        </div>
                    </div>

                    <div class="p-5 sm:p-6 space-y-4">
                        <div id="dc-mode-diff" class="space-y-4">
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] p-3 rounded-[16px] focus-within:border-accent-theme transition-all">
                                    <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Từ ngày</label>
                                    <input type="date" id="dc-start" class="dc-trigger tt-input-zen w-full bg-transparent border-none outline-none text-xs sm:text-sm font-bold text-zinc-900 dark:text-white p-0">
                                </div>
                                <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] p-3 rounded-[16px] focus-within:border-accent-theme transition-all">
                                    <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Đến ngày</label>
                                    <input type="date" id="dc-end" class="dc-trigger tt-input-zen w-full bg-transparent border-none outline-none text-xs sm:text-sm font-bold text-zinc-900 dark:text-white p-0">
                                </div>
                            </div>
                            
                            <div class="flex items-center justify-between px-1">
                                <span class="text-xs font-medium text-zinc-800 dark:text-zinc-200">Bao gồm cả ngày cuối cùng (+1)</span>
                                <button id="dc-inc-last-switch" class="switch-pill" type="button"><div class="switch-thumb"></div></button>
                            </div>

                            <div class="space-y-1.5 pt-1">
                                <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block px-1">Bỏ qua ngày nghỉ tuần</span>
                                <div class="grid grid-cols-7 gap-1">
                                    <label class="day-tag cursor-pointer"><input type="checkbox" value="1" class="dc-exc dc-trigger"><div class="py-2 rounded-[10px] text-center text-xs font-bold text-zinc-600 dark:text-zinc-400 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] transition-all">T2</div></label>
                                    <label class="day-tag cursor-pointer"><input type="checkbox" value="2" class="dc-exc dc-trigger"><div class="py-2 rounded-[10px] text-center text-xs font-bold text-zinc-600 dark:text-zinc-400 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] transition-all">T3</div></label>
                                    <label class="day-tag cursor-pointer"><input type="checkbox" value="3" class="dc-exc dc-trigger"><div class="py-2 rounded-[10px] text-center text-xs font-bold text-zinc-600 dark:text-zinc-400 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] transition-all">T4</div></label>
                                    <label class="day-tag cursor-pointer"><input type="checkbox" value="4" class="dc-exc dc-trigger"><div class="py-2 rounded-[10px] text-center text-xs font-bold text-zinc-600 dark:text-zinc-400 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] transition-all">T5</div></label>
                                    <label class="day-tag cursor-pointer"><input type="checkbox" value="5" class="dc-exc dc-trigger"><div class="py-2 rounded-[10px] text-center text-xs font-bold text-zinc-600 dark:text-zinc-400 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] transition-all">T6</div></label>
                                    <label class="day-tag cursor-pointer"><input type="checkbox" value="6" class="dc-exc dc-trigger"><div class="py-2 rounded-[10px] text-center text-xs font-bold text-zinc-600 dark:text-zinc-400 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] transition-all">T7</div></label>
                                    <label class="day-tag cursor-pointer"><input type="checkbox" value="0" class="dc-exc dc-trigger"><div class="py-2 rounded-[10px] text-center text-xs font-bold text-zinc-600 dark:text-zinc-400 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] transition-all">CN</div></label>
                                </div>
                            </div>
                        </div>

                        <div id="dc-mode-add" class="hidden space-y-3">
                            <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] p-3 rounded-[16px]">
                                <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Ngày cơ sở</label>
                                <input type="date" id="dc-base" class="dc-trigger tt-input-zen w-full bg-transparent border-none outline-none text-sm font-bold text-zinc-900 dark:text-white p-0">
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] p-3 rounded-[16px] relative">
                                    <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Toán tử</label>
                                    <select id="dc-op" class="zen-select dc-trigger w-full bg-transparent border-none outline-none text-xs font-bold text-zinc-900 dark:text-white cursor-pointer p-0">
                                        <option value="add">Cộng (+) ngày</option>
                                        <option value="sub">Trừ (-) ngày</option>
                                    </select>
                                    <i class="fas fa-chevron-down absolute right-3 bottom-3 text-[9px] text-zinc-400 pointer-events-none"></i>
                                </div>
                                <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] p-3 rounded-[16px]">
                                    <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Số ngày</label>
                                    <input type="number" id="dc-days" value="30" min="0" class="dc-trigger tt-input-zen w-full bg-transparent border-none outline-none text-xs font-mono font-bold text-zinc-900 dark:text-white p-0">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="p-6 bg-[#f2f2f7] dark:bg-black/40 border-t border-black/[0.05] dark:border-white/[0.08] text-center space-y-1">
                        <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Kết quả đo lường</span>
                        <div class="text-3xl font-black text-accent-theme font-mono tracking-tight" id="dc-res">--</div>
                    </div>
                </div>

                <!-- 5. TIME CALC -->
                <div id="pane-timecalc" class="tt-pane hidden">
                    <div class="p-4 sm:p-5 border-b border-black/[0.05] dark:border-white/[0.08]">
                        <div class="grid grid-cols-2 gap-1 p-1 rounded-[12px] bg-black/[0.05] dark:bg-black/50 border border-black/[0.04] dark:border-white/[0.08]" id="tc-mode-switches">
                            <button class="tab-btn active py-1.5 rounded-[9px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm transition-all" data-val="dur">Khoảng giờ</button>
                            <button class="tab-btn py-1.5 rounded-[9px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all" data-val="math">Cộng / Trừ giờ</button>
                        </div>
                    </div>

                    <div class="p-5 sm:p-6 space-y-4">
                        <div id="tc-mode-dur" class="space-y-3">
                            <div class="grid grid-cols-2 gap-3">
                                <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] p-3 rounded-[16px] text-center">
                                    <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Bắt đầu</label>
                                    <input type="time" id="tc-start" value="08:00" class="tc-trigger tt-input-zen bg-transparent border-none outline-none text-2xl font-black font-mono text-zinc-900 dark:text-white text-center w-full">
                                </div>
                                <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] p-3 rounded-[16px] text-center">
                                    <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Kết thúc</label>
                                    <input type="time" id="tc-end" value="17:30" class="tc-trigger tt-input-zen bg-transparent border-none outline-none text-2xl font-black font-mono text-zinc-900 dark:text-white text-center w-full">
                                </div>
                            </div>
                            
                            <div class="flex items-center justify-between bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] p-3 rounded-[16px]">
                                <span class="text-xs font-medium text-zinc-800 dark:text-zinc-200">Trừ thời gian nghỉ trưa</span>
                                <div class="flex items-center gap-2">
                                    <input type="number" id="tc-brk" value="60" min="0" class="tc-trigger tt-input-zen w-12 bg-white dark:bg-[#27272a] rounded-[8px] px-2 py-1 text-xs font-bold text-center border border-black/[0.04] dark:border-white/[0.06] outline-none">
                                    <span class="text-xs text-zinc-500">phút</span>
                                    <button id="tc-has-brk-switch" class="switch-pill active ml-1" type="button"><div class="switch-thumb"></div></button>
                                </div>
                            </div>
                        </div>

                        <div id="tc-mode-math" class="hidden space-y-3">
                            <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] p-3 rounded-[16px] text-center">
                                <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Giờ cơ sở</label>
                                <input type="time" id="tc-base" value="10:00" class="tc-trigger tt-input-zen bg-transparent border-none outline-none text-2xl font-black font-mono text-zinc-900 dark:text-white text-center w-full">
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] p-3 rounded-[16px] relative">
                                    <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Thao tác</label>
                                    <select id="tc-op" class="zen-select tc-trigger w-full bg-transparent border-none outline-none text-xs font-bold text-zinc-900 dark:text-white cursor-pointer p-0">
                                        <option value="add">Cộng (+)</option>
                                        <option value="sub">Trừ (-)</option>
                                    </select>
                                    <i class="fas fa-chevron-down absolute right-3 bottom-3 text-[9px] text-zinc-400 pointer-events-none"></i>
                                </div>
                                <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] p-3 rounded-[16px]">
                                    <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Lượng giờ : phút</label>
                                    <div class="flex items-center gap-1">
                                        <input type="number" id="tc-add-h" value="2" min="0" class="tc-trigger tt-input-zen w-full bg-transparent border-none outline-none text-xs font-mono font-bold text-center text-zinc-900 dark:text-white">
                                        <span class="text-zinc-400 font-bold">:</span>
                                        <input type="number" id="tc-add-m" value="30" min="0" max="59" class="tc-trigger tt-input-zen w-full bg-transparent border-none outline-none text-xs font-mono font-bold text-center text-zinc-900 dark:text-white">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="p-6 bg-[#f2f2f7] dark:bg-black/40 border-t border-black/[0.05] dark:border-white/[0.08] text-center space-y-1">
                        <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Kết quả</span>
                        <div class="text-3xl font-black text-accent-theme font-mono tracking-tight" id="tc-res">--</div>
                        <div class="text-xs font-mono text-zinc-400 hidden mt-0.5" id="tc-res-dec"></div>
                    </div>
                </div>

                <!-- 6. DURATION (NGÀY ĐÊM) -->
                <div id="pane-duration" class="tt-pane hidden">
                    <div class="p-5 sm:p-6 space-y-3">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] p-3.5 rounded-[16px] focus-within:border-accent-theme transition-all">
                                <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Mốc bắt đầu</label>
                                <input type="datetime-local" id="dur-start" class="dur-trigger tt-input-zen w-full bg-transparent border-none outline-none font-bold text-xs sm:text-sm text-zinc-900 dark:text-white p-0 cursor-pointer">
                            </div>
                            <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] p-3.5 rounded-[16px] focus-within:border-accent-theme transition-all">
                                <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Mốc kết thúc</label>
                                <input type="datetime-local" id="dur-end" class="dur-trigger tt-input-zen w-full bg-transparent border-none outline-none font-bold text-xs sm:text-sm text-zinc-900 dark:text-white p-0 cursor-pointer">
                            </div>
                        </div>
                    </div>

                    <div class="p-6 bg-[#f2f2f7] dark:bg-black/40 border-t border-black/[0.05] dark:border-white/[0.08] flex flex-col items-center justify-center text-center space-y-3">
                        <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Đo lường thời gian hành trình</span>
                        <div id="dur-res-dn" class="text-xs font-bold text-accent-theme">--</div>
                        <div class="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white font-mono tracking-tight" id="dur-res-main">--</div>
                        
                        <div class="grid grid-cols-3 gap-4 w-full max-w-[320px] text-center border-t border-black/[0.05] dark:border-white/[0.08] pt-3">
                            <div>
                                <div class="text-base font-black font-mono text-zinc-800 dark:text-zinc-200" id="dur-res-h">--</div>
                                <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Tổng giờ</span>
                            </div>
                            <div>
                                <div class="text-base font-black font-mono text-zinc-800 dark:text-zinc-200" id="dur-res-m">--</div>
                                <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Tổng phút</span>
                            </div>
                            <div>
                                <div class="text-base font-black font-mono text-zinc-800 dark:text-zinc-200" id="dur-res-s">--</div>
                                <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Tổng giây</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 7. WEEK -->
                <div id="pane-week" class="tt-pane hidden p-6 space-y-6">
                    <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] p-3.5 rounded-[16px] max-w-sm mx-auto focus-within:border-accent-theme transition-all">
                        <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1 text-center">Chọn ngày cần kiểm tra</label>
                        <input type="date" id="wk-date" class="tt-input-zen w-full bg-transparent border-none outline-none font-bold text-sm text-zinc-900 dark:text-white p-0 text-center cursor-pointer">
                    </div>

                    <div class="text-center space-y-2">
                        <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Theo chuẩn ISO-8601</span>
                        <div class="text-5xl font-black text-accent-theme font-mono tracking-tight" id="wk-num">Tuần --</div>
                        <div class="text-xs font-semibold text-zinc-700 dark:text-zinc-300 font-mono" id="wk-range">--</div>
                        <div class="text-[11px] text-zinc-400" id="wk-year">--</div>
                    </div>
                </div>

                <!-- 8. AGE -->
                <div id="pane-age" class="tt-pane hidden p-5 sm:p-6 space-y-5">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] p-3 rounded-[16px] focus-within:border-accent-theme transition-all">
                            <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Ngày sinh (DOB)</label>
                            <input type="date" id="age-dob" class="age-trigger tt-input-zen w-full bg-transparent border-none outline-none text-xs sm:text-sm font-bold text-zinc-900 dark:text-white p-0">
                        </div>
                        <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] p-3 rounded-[16px] focus-within:border-accent-theme transition-all">
                            <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Tính đến thời điểm</label>
                            <input type="date" id="age-target" class="age-trigger tt-input-zen w-full bg-transparent border-none outline-none text-xs sm:text-sm font-bold text-zinc-900 dark:text-white p-0">
                        </div>
                    </div>

                    <div class="text-center space-y-1 py-1">
                        <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Tuổi thực tế (Sinh vào <span id="age-wd" class="text-zinc-900 dark:text-white">--</span>)</span>
                        <div class="text-2xl sm:text-3xl font-black text-accent-theme font-mono tracking-tight" id="age-main">--</div>
                    </div>

                    <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] p-2.5 flex flex-col items-center">
                            <span class="text-[9px] font-bold text-zinc-400 uppercase mb-0.5">Tháng</span>
                            <span class="text-xs font-bold font-mono text-zinc-900 dark:text-white" id="age-m">--</span>
                        </div>
                        <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] p-2.5 flex flex-col items-center">
                            <span class="text-[9px] font-bold text-zinc-400 uppercase mb-0.5">Tuần</span>
                            <span class="text-xs font-bold font-mono text-zinc-900 dark:text-white" id="age-w">--</span>
                        </div>
                        <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] p-2.5 flex flex-col items-center">
                            <span class="text-[9px] font-bold text-zinc-400 uppercase mb-0.5">Ngày</span>
                            <span class="text-xs font-bold font-mono text-zinc-900 dark:text-white" id="age-d">--</span>
                        </div>
                        <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] p-2.5 flex flex-col items-center">
                            <span class="text-[9px] font-bold text-zinc-400 uppercase mb-0.5">Giờ</span>
                            <span class="text-xs font-bold font-mono text-zinc-900 dark:text-white" id="age-h">--</span>
                        </div>
                        <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[14px] p-2.5 flex flex-col items-center">
                            <span class="text-[9px] font-bold text-zinc-400 uppercase mb-0.5">Phút</span>
                            <span class="text-xs font-bold font-mono text-zinc-900 dark:text-white" id="age-min">--</span>
                        </div>
                        <div class="bg-accent-theme-alpha border border-accent-theme/20 rounded-[14px] p-2.5 flex flex-col items-center">
                            <span class="text-[9px] font-bold text-accent-theme uppercase mb-0.5">Giây (Live)</span>
                            <span class="text-xs font-black font-mono text-accent-theme" id="age-sec">--</span>
                        </div>
                    </div>
                </div>

            </div>

        </main>
    </div>
    `;
}

// =============================================================================
// 3. LOGIC HOOKS & EVENT DISPATCHING (PERSISTENCE & SAFE RETURN ENGINE)
// =============================================================================
export function init(hostElement) {
    const rootContainer = hostElement.querySelector('#tt-root-container') || hostElement;

    // Theme integration
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    const format2 = (num) => num.toString().padStart(2, '0');
    const todayStr = new Date().toISOString().split('T')[0];

    // Live Header Clock
    const clockBadge = hostElement.querySelector('#tt-clock-now');
    const liveClockInterval = setInterval(() => {
        if (clockBadge) {
            const now = new Date();
            clockBadge.textContent = `${format2(now.getHours())}:${format2(now.getMinutes())}:${format2(now.getSeconds())}`;
        }
    }, 1000);

    // =========================================================================
    // ĐIỀU HƯỚNG QUAY LẠI ỨNG DỤNG KHÔNG MỞ TAB MỚI
    // =========================================================================
    const getAppToolId = () => {
        const pane = hostElement.closest('.view-pane');
        if (pane && pane.id) {
            const tabId = pane.id.replace('pane-', '');
            const appState = JSON.parse(localStorage.getItem('app_workspace_state') || '{}');
            const tab = (appState.tabs || []).find(t => t.tabId === tabId);
            if (tab && tab.toolId) return tab.toolId;
        }
        return 'timetools';
    };

    const navigateBackToApp = () => {
        const currentToolId = getAppToolId();
        const appState = JSON.parse(localStorage.getItem('app_workspace_state') || '{}');
        const runningTabs = appState.tabs || [];
        const existingTab = runningTabs.find(t => t.toolId === currentToolId || t.toolId === 'timetools');

        if (existingTab && typeof window.switchTab === 'function') {
            window.switchTab(existingTab.tabId);
            return;
        }

        const container = document.getElementById('tab-contents-container');
        if (container && container.classList.contains('hidden') && typeof window.openToolGlobal === 'function') {
            window.openToolGlobal(currentToolId, false);
            return;
        }

        if (typeof window.openToolGlobal === 'function') {
            window.openToolGlobal(currentToolId, false);
        }
    };

    // Dynamic Island Live Updater Helper
    const syncIslandLive = () => {
        if (!IslandKit.isIslandActive()) return;

        const currentAccent = ThemeKit.getAccentColor();

        // 1. Ưu tiên Timer nếu đang chạy
        if (Timer.isRun && Timer.total > 0) {
            const m = String(Math.floor(Timer.total / 60)).padStart(2, '0');
            const s = String(Timer.total % 60).padStart(2, '0');
            IslandKit.setLiveView(`
                <div class="w-full h-full flex items-center justify-between px-2 text-[10px] font-mono select-none">
                    <span style="color: ${currentAccent};" class="font-bold flex items-center gap-1">
                        <i class="fas fa-hourglass-half text-[8px] animate-pulse"></i> HẸN GIỜ
                    </span>
                    <span class="text-white font-black">${m}:${s}</span>
                </div>
            `, navigateBackToApp);
            return;
        }

        // 2. Kế tiếp là Bấm giờ (Stopwatch)
        if (Sw.isRun) {
            const d = new Date(Sw.elaps);
            const m = String(d.getUTCMinutes()).padStart(2, '0');
            const s = String(d.getUTCSeconds()).padStart(2, '0');
            IslandKit.setLiveView(`
                <div class="w-full h-full flex items-center justify-between px-2 text-[10px] font-mono select-none">
                    <span style="color: ${currentAccent};" class="font-bold flex items-center gap-1">
                        <i class="fas fa-stopwatch text-[8px] animate-spin"></i> BẤM GIỜ
                    </span>
                    <span class="text-white font-black">${m}:${s}</span>
                </div>
            `, navigateBackToApp);
            return;
        }

        // 3. Không có tiến trình nào đang chạy -> Xóa Live view
        IslandKit.resetLiveView();
    };

    // Segmented Tabs Switcher
    const tabs = hostElement.querySelectorAll('#tt-tabs .tt-tab');
    const panes = hostElement.querySelectorAll('.tt-pane');

    const activeClass = 'tt-tab active h-9 px-3.5 rounded-[12px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex items-center gap-1.5 shrink-0';
    const inactiveClass = 'tt-tab h-9 px-3.5 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0';

    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => { t.className = inactiveClass; });
            tab.className = activeClass;

            panes.forEach(p => { 
                p.classList.remove('block'); 
                p.classList.add('hidden'); 
            });

            const target = hostElement.querySelector(`#${tab.dataset.target}`);
            if (target) {
                target.classList.remove('hidden');
                target.classList.add('block');
            }
            tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        };
    });

    // =========================================================================
    // 1. TIMER MODULE (CÓ LƯU LOCALSTORAGE ĐỒNG BỘ NỀN KHI RELOAD)
    // =========================================================================
    const Timer = {
        h: hostElement.querySelector('#tm-h'),
        m: hostElement.querySelector('#tm-m'),
        s: hostElement.querySelector('#tm-s'),
        disp: hostElement.querySelector('#tm-display'),
        stat: hostElement.querySelector('#tm-status'),
        btnS: hostElement.querySelector('#btn-tm-start'),
        btnR: hostElement.querySelector('#btn-tm-reset'),
        interval: null,
        total: 0,
        isRun: false,

        saveState() {
            const data = {
                isRun: this.isRun,
                total: this.total,
                targetTimestamp: this.isRun ? (Date.now() + this.total * 1000) : null,
                inputH: this.h.value,
                inputM: this.m.value,
                inputS: this.s.value
            };
            localStorage.setItem('hunqos_timer_state', JSON.stringify(data));
        },

        restoreState() {
            const raw = localStorage.getItem('hunqos_timer_state');
            if (!raw) return;
            try {
                const data = JSON.parse(raw);
                this.h.value = data.inputH || '0';
                this.m.value = data.inputM || '25';
                this.s.value = data.inputS || '0';

                if (data.isRun && data.targetTimestamp) {
                    const remaining = Math.round((data.targetTimestamp - Date.now()) / 1000);
                    if (remaining > 0) {
                        this.total = remaining;
                        this.isRun = true;
                        this.btnS.textContent = 'TẠM DỪNG';
                        this.stat.textContent = 'Đang đếm ngược...';
                        this.updateDisp();
                        this.runLoop();
                    } else {
                        this.total = 0;
                        this.finish();
                    }
                } else if (data.total > 0) {
                    this.total = data.total;
                    this.isRun = false;
                    this.btnS.textContent = 'TIẾP TỤC';
                    this.stat.textContent = 'Đã tạm dừng';
                    this.updateDisp();
                }
            } catch (e) {
                console.error(e);
            }
        },

        init() {
            this.btnS.onclick = () => this.isRun ? this.pause() : this.start();
            this.btnR.onclick = () => this.reset();
            hostElement.querySelectorAll('.tm-quick').forEach(b => {
                b.onclick = () => {
                    this.reset();
                    this.h.value = 0;
                    this.m.value = b.dataset.m;
                    this.s.value = 0;
                    this.updateDisp(0, parseInt(b.dataset.m, 10), 0);
                    IslandKit.notify('Hẹn giờ', `Đã đặt thời gian ${b.dataset.m} phút.`, 'info');
                };
            });
            this.restoreState();
        },

        runLoop() {
            if (this.interval) clearInterval(this.interval);
            syncIslandLive();

            this.interval = setInterval(() => {
                this.total--;
                this.updateDisp();
                syncIslandLive();
                this.saveState();
                if (this.total <= 0) this.finish();
            }, 1000);
        },

        start() {
            if (this.total <= 0) {
                this.total = (parseInt(this.h.value, 10) || 0) * 3600 + (parseInt(this.m.value, 10) || 0) * 60 + (parseInt(this.s.value, 10) || 0);
            }
            if (this.total <= 0) {
                return IslandKit.notify('Cảnh báo', 'Vui lòng thiết lập thời gian đếm ngược lớn hơn 0.', 'warning');
            }

            this.isRun = true;
            this.btnS.textContent = 'TẠM DỪNG';
            this.stat.textContent = 'Đang đếm ngược...';
            this.disp.classList.remove('is-ringing');

            this.saveState();
            this.runLoop();
            IslandKit.notify('Đếm ngược', 'Bắt đầu tính giờ.', 'info');
        },

        pause() {
            this.isRun = false;
            clearInterval(this.interval);
            this.btnS.textContent = 'TIẾP TỤC';
            this.stat.textContent = 'Đã tạm dừng';
            this.saveState();
            syncIslandLive();
        },

        finish() {
            this.pause();
            this.total = 0;
            this.btnS.textContent = 'BẮT ĐẦU';
            this.stat.textContent = 'HẾT GIỜ!';
            this.disp.classList.add('is-ringing');
            localStorage.removeItem('hunqos_timer_state');
            IslandKit.resetLiveView();
            IslandKit.notify('Hết giờ!', 'Thời gian đếm ngược đã kết thúc.', 'success', 5000);
        },

        reset() {
            this.pause();
            this.total = 0;
            this.h.value = '0';
            this.m.value = '25';
            this.s.value = '0';
            this.updateDisp(0, 25, 0);
            this.stat.textContent = 'Đã sẵn sàng';
            this.disp.classList.remove('is-ringing');
            this.btnS.textContent = 'BẮT ĐẦU';
            localStorage.removeItem('hunqos_timer_state');
            syncIslandLive();
        },

        updateDisp(th, tm, ts) {
            let h = th !== undefined ? th : Math.floor(this.total / 3600);
            let m = tm !== undefined ? tm : Math.floor((this.total % 3600) / 60);
            let s = ts !== undefined ? ts : this.total % 60;
            if (h > 0) {
                this.disp.textContent = `${format2(h)}:${format2(m)}:${format2(s)}`;
            } else {
                this.disp.textContent = `${format2(m)}:${format2(s)}`;
            }
        }
    };
    Timer.init();

    // =========================================================================
    // 2. STOPWATCH MODULE (CÓ LƯU LOCALSTORAGE VÀ RESTORE CHÍNH XÁC)
    // =========================================================================
    const Sw = {
        disp: hostElement.querySelector('#sw-display'),
        laps: hostElement.querySelector('#sw-laps'),
        btnS: hostElement.querySelector('#btn-sw-start'),
        btnL: hostElement.querySelector('#btn-sw-lap'),
        btnR: hostElement.querySelector('#btn-sw-reset'),
        startT: 0,
        elaps: 0,
        isRun: false,
        count: 0,
        lapHistory: [],

        saveState() {
            const data = {
                isRun: this.isRun,
                elaps: this.elaps,
                startT: this.startT,
                count: this.count,
                lapHistory: this.lapHistory
            };
            localStorage.setItem('hunqos_sw_state', JSON.stringify(data));
        },

        restoreState() {
            const raw = localStorage.getItem('hunqos_sw_state');
            if (!raw) return;
            try {
                const data = JSON.parse(raw);
                this.count = data.count || 0;
                this.lapHistory = data.lapHistory || [];

                if (this.lapHistory.length > 0) {
                    this.laps.innerHTML = '';
                    this.lapHistory.forEach(item => {
                        this.laps.insertAdjacentHTML('afterbegin', `
                            <div class="flex justify-between items-center py-2 px-3 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[12px] mb-1">
                                <span class="text-xs font-bold text-accent-theme font-mono">Vòng ${format2(item.lap)}</span>
                                <span class="text-xs font-mono font-bold text-zinc-900 dark:text-white">${item.time}</span>
                            </div>
                        `);
                    });
                }

                if (data.isRun && data.startT) {
                    this.isRun = true;
                    this.startT = data.startT;
                    this.elaps = Date.now() - this.startT;
                    this.btnS.textContent = 'TẠM DỪNG';
                    this.btnL.disabled = false;
                    this.btnL.classList.remove('opacity-50', 'pointer-events-none');
                    this.runLoop();
                } else if (data.elaps > 0) {
                    this.elaps = data.elaps;
                    this.disp.innerHTML = this.fmt(this.elaps);
                    this.btnS.textContent = 'TIẾP TỤC';
                }
            } catch (e) {
                console.error(e);
            }
        },

        init() {
            this.btnS.onclick = () => this.isRun ? this.pause() : this.start();
            this.btnL.onclick = () => this.lap();
            this.btnR.onclick = () => this.reset();
            this.restoreState();
        },

        runLoop() {
            syncIslandLive();
            const loop = () => {
                if (!this.isRun) return;
                this.elaps = Date.now() - this.startT;
                this.disp.innerHTML = this.fmt(this.elaps);
                requestAnimationFrame(loop);
            };
            requestAnimationFrame(loop);
        },

        start() {
            this.isRun = true;
            this.startT = Date.now() - this.elaps;
            this.btnS.textContent = 'TẠM DỪNG';
            this.btnL.disabled = false;
            this.btnL.classList.remove('opacity-50', 'pointer-events-none');

            this.saveState();
            this.runLoop();
        },

        pause() {
            this.isRun = false;
            this.btnS.textContent = 'TIẾP TỤC';
            this.btnL.disabled = true;
            this.btnL.classList.add('opacity-50', 'pointer-events-none');
            this.saveState();
            syncIslandLive();
        },

        lap() {
            this.count++;
            const timeStr = this.fmt(this.elaps);
            this.lapHistory.push({ lap: this.count, time: timeStr });
            if (this.count === 1) this.laps.innerHTML = '';
            this.laps.insertAdjacentHTML('afterbegin', `
                <div class="flex justify-between items-center py-2 px-3 bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[12px] mb-1">
                    <span class="text-xs font-bold text-accent-theme font-mono">Vòng ${format2(this.count)}</span>
                    <span class="text-xs font-mono font-bold text-zinc-900 dark:text-white">${timeStr}</span>
                </div>
            `);
            this.saveState();
        },

        reset() {
            this.pause();
            this.elaps = 0;
            this.count = 0;
            this.lapHistory = [];
            this.disp.innerHTML = '00:00<span class="text-2xl text-accent-theme">.00</span>';
            this.laps.innerHTML = '<div class="text-center text-xs font-medium text-zinc-400 py-10">Chưa ghi nhận vòng chạy nào.</div>';
            this.btnS.textContent = 'BẮT ĐẦU';
            localStorage.removeItem('hunqos_sw_state');
            syncIslandLive();
        },

        fmt(ms) {
            let d = new Date(ms);
            let h = Math.floor(ms / 3600000);
            let m = d.getUTCMinutes();
            let s = d.getUTCSeconds();
            let mil = Math.floor(d.getUTCMilliseconds() / 10);
            if (h > 0) return `${format2(h)}:${format2(m)}:${format2(s)}<span class="text-2xl text-accent-theme">.${format2(mil)}</span>`;
            return `${format2(m)}:${format2(s)}<span class="text-2xl text-accent-theme">.${format2(mil)}</span>`;
        }
    };
    Sw.init();

    // Đồng bộ Live Island mỗi 1s cho đồng hồ bấm giờ
    const swIslandInterval = setInterval(() => {
        if (Sw.isRun && !Timer.isRun) {
            syncIslandLive();
        }
    }, 1000);

    // 3. COUNTDAY MODULE
    const Cd = {
        inp: hostElement.querySelector('#cd-target'),
        disp: hostElement.querySelector('#cd-display'),
        stat: hostElement.querySelector('#cd-status'),
        intv: null,

        init() {
            let t = new Date();
            t.setDate(t.getDate() + 1);
            t.setHours(0, 0, 0, 0);
            this.inp.value = new Date(t.getTime() - t.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            this.inp.onchange = () => this.start();
            hostElement.querySelectorAll('.cd-quick').forEach(b => {
                b.onclick = () => {
                    let y = new Date().getFullYear();
                    let n = new Date();
                    let tg;
                    if (b.dataset.type === 'newyear') tg = new Date(y + 1, 0, 1);
                    else if (b.dataset.type === 'valentine') {
                        tg = new Date(y, 1, 14);
                        if (tg < n) tg.setFullYear(y + 1);
                    } else if (b.dataset.type === 'christmas') {
                        tg = new Date(y, 11, 25);
                        if (tg < n) tg.setFullYear(y + 1);
                    }
                    this.inp.value = new Date(tg.getTime() - tg.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                    this.start();
                    IslandKit.notify('Mốc sự kiện', `Đã chọn: ${b.textContent}`, 'info');
                };
            });
            this.start();
        },
        start() {
            clearInterval(this.intv);
            const tg = new Date(this.inp.value).getTime();
            const tick = () => {
                const df = tg - Date.now();
                if (df <= 0 || isNaN(df)) {
                    this.disp.innerHTML = `0<span class="text-xl text-zinc-400 font-sans font-bold">n</span> 0<span class="text-xl text-zinc-400 font-sans font-bold">g</span>`;
                    this.stat.textContent = 'SỰ KIỆN ĐÃ ĐẾN!';
                    this.stat.className = 'text-[10px] font-bold uppercase tracking-widest text-accent-theme is-ringing';
                    clearInterval(this.intv);
                    return;
                }
                const d = Math.floor(df / 86400000);
                const h = Math.floor((df % 86400000) / 3600000);
                const m = Math.floor((df % 3600000) / 60000);
                this.disp.innerHTML = `${d}<span class="text-xl text-zinc-400 font-sans font-bold">n</span> ${h}<span class="text-xl text-zinc-400 font-sans font-bold">g</span>`;
                this.stat.textContent = 'Thời gian đếm ngược còn lại';
                this.stat.className = 'text-[10px] font-bold text-zinc-400 uppercase tracking-widest';
            };
            tick();
            this.intv = setInterval(tick, 1000);
        }
    };
    Cd.init();

    // 4. DATE CALC MODULE
    const Dc = {
        init() {
            const switches = hostElement.querySelectorAll('#dc-mode-switches .tab-btn');
            const dMode = hostElement.querySelector('#dc-mode-diff');
            const aMode = hostElement.querySelector('#dc-mode-add');
            const s = hostElement.querySelector('#dc-start');
            const e = hostElement.querySelector('#dc-end');
            const incSwitch = hostElement.querySelector('#dc-inc-last-switch');
            const exc = hostElement.querySelectorAll('.dc-exc');
            const b = hostElement.querySelector('#dc-base');
            const op = hostElement.querySelector('#dc-op');
            const dys = hostElement.querySelector('#dc-days');
            const res = hostElement.querySelector('#dc-res');

            let currentSubMode = 'diff';
            let incLast = false;

            s.value = todayStr;
            let t = new Date();
            t.setDate(t.getDate() + 30);
            e.value = t.toISOString().split('T')[0];
            b.value = todayStr;

            switches.forEach(btn => {
                btn.onclick = () => {
                    switches.forEach(sb => {
                        sb.className = 'tab-btn py-1.5 rounded-[9px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all';
                    });
                    btn.className = 'tab-btn active py-1.5 rounded-[9px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm transition-all';
                    currentSubMode = btn.dataset.val;
                    dMode.classList.toggle('hidden', currentSubMode !== 'diff');
                    aMode.classList.toggle('hidden', currentSubMode !== 'addsub');
                    calc();
                };
            });

            incSwitch.onclick = () => {
                incSwitch.classList.toggle('active');
                incLast = incSwitch.classList.contains('active');
                calc();
            };

            hostElement.querySelectorAll('.dc-trigger').forEach(i => i.addEventListener('input', calc));

            function calc() {
                if (currentSubMode === 'diff') {
                    if (!s.value || !e.value) return res.textContent = '--';
                    let ds = new Date(s.value);
                    ds.setHours(0, 0, 0, 0);
                    let de = new Date(e.value);
                    de.setHours(0, 0, 0, 0);
                    if (ds > de) [ds, de] = [de, ds];
                    let ex = Array.from(exc).filter(c => c.checked).map(c => parseInt(c.value, 10));
                    let count = 0;
                    let cur = new Date(ds);
                    while (cur < de) {
                        if (!ex.includes(cur.getDay())) count++;
                        cur.setDate(cur.getDate() + 1);
                    }
                    if (incLast && !ex.includes(de.getDay())) count++;
                    res.innerHTML = `${count} <span class="text-xl font-sans font-bold text-zinc-400">ngày</span>`;
                } else {
                    if (!b.value || !dys.value) return res.textContent = '--';
                    let base = new Date(b.value);
                    let num = parseInt(dys.value, 10);
                    if (op.value === 'sub') num = -num;
                    base.setDate(base.getDate() + num);
                    res.innerHTML = `<span class="text-2xl tracking-tight">${base.toLocaleDateString('vi-VN')}</span>`;
                }
            }
            calc();
        }
    };
    Dc.init();

    // 5. TIME CALC MODULE
    const Tc = {
        init() {
            const switches = hostElement.querySelectorAll('#tc-mode-switches .tab-btn');
            const dMode = hostElement.querySelector('#tc-mode-dur');
            const mMode = hostElement.querySelector('#tc-mode-math');
            const s = hostElement.querySelector('#tc-start');
            const e = hostElement.querySelector('#tc-end');
            const hBSwitch = hostElement.querySelector('#tc-has-brk-switch');
            const brk = hostElement.querySelector('#tc-brk');
            const b = hostElement.querySelector('#tc-base');
            const op = hostElement.querySelector('#tc-op');
            const aH = hostElement.querySelector('#tc-add-h');
            const aM = hostElement.querySelector('#tc-add-m');
            const res = hostElement.querySelector('#tc-res');
            const resD = hostElement.querySelector('#tc-res-dec');

            let currentSubMode = 'dur';
            let hasBreak = true;

            switches.forEach(btn => {
                btn.onclick = () => {
                    switches.forEach(sb => {
                        sb.className = 'tab-btn py-1.5 rounded-[9px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all';
                    });
                    btn.className = 'tab-btn active py-1.5 rounded-[9px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm transition-all';
                    currentSubMode = btn.dataset.val;
                    dMode.classList.toggle('hidden', currentSubMode !== 'dur');
                    mMode.classList.toggle('hidden', currentSubMode !== 'math');
                    calc();
                };
            });

            hBSwitch.onclick = () => {
                hBSwitch.classList.toggle('active');
                hasBreak = hBSwitch.classList.contains('active');
                brk.disabled = !hasBreak;
                brk.classList.toggle('opacity-40', !hasBreak);
                calc();
            };

            hostElement.querySelectorAll('.tc-trigger').forEach(i => i.addEventListener('input', calc));

            function calc() {
                if (currentSubMode === 'dur') {
                    if (!s.value || !e.value) return res.textContent = '--';
                    let [s1, s2] = s.value.split(':').map(Number);
                    let [e1, e2] = e.value.split(':').map(Number);
                    let bm = hasBreak ? (parseInt(brk.value, 10) || 0) : 0;
                    let m1 = s1 * 60 + s2;
                    let m2 = e1 * 60 + e2;
                    if (m2 < m1) m2 += 1440;
                    let tot = m2 - m1 - bm;
                    if (tot < 0) tot = 0;
                    res.innerHTML = `${Math.floor(tot / 60)}<span class="text-xl font-sans font-bold text-zinc-400">g</span> ${tot % 60}<span class="text-xl font-sans font-bold text-zinc-400">p</span>`;
                    resD.textContent = `~ ${(tot / 60).toFixed(2)} giờ thập phân`;
                    resD.classList.remove('hidden');
                } else {
                    resD.classList.add('hidden');
                    if (!b.value) return res.textContent = '--';
                    let [b1, b2] = b.value.split(':').map(Number);
                    let h = parseInt(aH.value, 10) || 0;
                    let m = parseInt(aM.value, 10) || 0;
                    let tot = b1 * 60 + b2;
                    let add = h * 60 + m;
                    if (op.value === 'add') tot += add;
                    else tot -= add;
                    tot = ((tot % 1440) + 1440) % 1440;
                    res.textContent = `${format2(Math.floor(tot / 60))}:${format2(tot % 60)}`;
                }
            }
            calc();
        }
    };
    Tc.init();

    // 6. WEEK CALC MODULE
    const Wc = {
        init() {
            const inp = hostElement.querySelector('#wk-date');
            const rN = hostElement.querySelector('#wk-num');
            const rR = hostElement.querySelector('#wk-range');
            const rY = hostElement.querySelector('#wk-year');
            inp.value = todayStr;

            const calc = () => {
                if (!inp.value) return;
                const d = new Date(inp.value);
                let date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
                let dN = date.getUTCDay() || 7;
                date.setUTCDate(date.getUTCDate() + 4 - dN);
                let yS = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
                let wNo = Math.ceil((((date - yS) / 86400000) + 1) / 7);
                let dC = new Date(d);
                let day = dC.getDay();
                let df = dC.getDate() - day + (day === 0 ? -6 : 1);
                let sW = new Date(dC.setDate(df));
                let eW = new Date(dC.setDate(sW.getDate() + 6));

                rN.textContent = `Tuần ${wNo}`;
                rR.textContent = `${sW.toLocaleDateString('vi-VN')} → ${eW.toLocaleDateString('vi-VN')}`;

                let d28 = new Date(date.getUTCFullYear(), 11, 28);
                let d28N = d28.getUTCDay() || 7;
                d28.setUTCDate(d28.getUTCDate() + 4 - d28N);
                let mxW = Math.ceil((((d28 - new Date(Date.UTC(d28.getUTCFullYear(), 0, 1))) / 86400000) + 1) / 7);
                rY.textContent = `Năm ISO ${date.getUTCFullYear()} có tổng ${mxW} tuần`;
            };
            inp.oninput = calc;
            calc();
        }
    };
    Wc.init();

    // 7. AGE CALC MODULE
    const Ac = {
        init() {
            const dob = hostElement.querySelector('#age-dob');
            const tg = hostElement.querySelector('#age-target');
            const wd = hostElement.querySelector('#age-wd');
            const mn = hostElement.querySelector('#age-main');
            const m = hostElement.querySelector('#age-m');
            const w = hostElement.querySelector('#age-w');
            const d = hostElement.querySelector('#age-d');
            const h = hostElement.querySelector('#age-h');
            const min = hostElement.querySelector('#age-min');
            const sec = hostElement.querySelector('#age-sec');
            let iv = null;
            tg.value = todayStr;
            const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

            const calc = () => {
                clearInterval(iv);
                if (!dob.value || !tg.value) return;
                let d1 = new Date(dob.value);
                let d2 = new Date(tg.value);
                if (d1 > d2) return mn.textContent = '--';

                wd.textContent = days[d1.getDay()];
                let y = d2.getFullYear() - d1.getFullYear();
                let mo = d2.getMonth() - d1.getMonth();
                let da = d2.getDate() - d1.getDate();
                if (da < 0) {
                    mo--;
                    da += new Date(d2.getFullYear(), d2.getMonth(), 0).getDate();
                }
                if (mo < 0) {
                    y--;
                    mo += 12;
                }
                mn.innerHTML = `${y}<span class="text-base font-sans font-bold text-zinc-400 mr-1.5">năm</span> ${mo}<span class="text-base font-sans font-bold text-zinc-400 mr-1.5">tháng</span> ${da}<span class="text-base font-sans font-bold text-zinc-400">ngày</span>`;

                const isTdy = tg.value === todayStr;
                const tick = () => {
                    let tgt = isTdy ? Date.now() : d2.getTime();
                    let df = Math.max(0, tgt - d1.getTime());
                    let ts = Math.floor(df / 1000);
                    let tmi = Math.floor(ts / 60);
                    let th = Math.floor(tmi / 60);
                    let td = Math.floor(th / 24);
                    let tw = Math.floor(td / 7);
                    let tmo = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
                    if (d2.getDate() < d1.getDate()) tmo--;

                    m.textContent = Math.max(0, tmo).toLocaleString('vi-VN');
                    w.textContent = tw.toLocaleString('vi-VN');
                    d.textContent = td.toLocaleString('vi-VN');
                    h.textContent = th.toLocaleString('vi-VN');
                    min.textContent = tmi.toLocaleString('vi-VN');
                    sec.textContent = ts.toLocaleString('vi-VN');
                };
                tick();
                if (isTdy) iv = setInterval(tick, 1000);
            };
            dob.oninput = calc;
            tg.oninput = calc;
        }
    };
    Ac.init();

    // 8. DURATION (NGÀY ĐÊM) MODULE
    const DurCalc = {
        init() {
            const startInp = hostElement.querySelector('#dur-start');
            const endInp = hostElement.querySelector('#dur-end');
            const resDn = hostElement.querySelector('#dur-res-dn');
            const resMain = hostElement.querySelector('#dur-res-main');
            const resH = hostElement.querySelector('#dur-res-h');
            const resM = hostElement.querySelector('#dur-res-m');
            const resS = hostElement.querySelector('#dur-res-s');

            let now = new Date();
            let tzOffset = now.getTimezoneOffset() * 60000;
            startInp.value = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);

            let future = new Date(now);
            future.setDate(future.getDate() + 3);
            endInp.value = new Date(future.getTime() - tzOffset).toISOString().slice(0, 16);

            const calc = () => {
                if (!startInp.value || !endInp.value) return;

                const d1_obj = new Date(startInp.value);
                const d2_obj = new Date(endInp.value);

                const d1 = d1_obj.getTime();
                const d2 = d2_obj.getTime();

                if (isNaN(d1) || isNaN(d2)) return;

                const diff = d2 - d1;

                if (diff < 0) {
                    resMain.textContent = 'Mốc kết thúc phải lớn hơn bắt đầu';
                    resMain.className = 'text-sm font-bold text-rose-500 font-mono';
                    resDn.innerHTML = '';
                    resH.textContent = '--';
                    resM.textContent = '--';
                    resS.textContent = '--';
                    return;
                }
                resMain.className = 'text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white font-mono tracking-tight';

                const d1_cal = new Date(d1_obj.getFullYear(), d1_obj.getMonth(), d1_obj.getDate()).getTime();
                const d2_cal = new Date(d2_obj.getFullYear(), d2_obj.getMonth(), d2_obj.getDate()).getTime();
                const nights = Math.floor((d2_cal - d1_cal) / 86400000);

                if (nights > 0) {
                    resDn.innerHTML = `<span class="px-3 py-1 bg-accent-theme-alpha text-accent-theme rounded-full text-xs font-bold uppercase tracking-wider">${nights + 1} Ngày ${nights} Đêm</span>`;
                } else {
                    resDn.innerHTML = `<span class="px-3 py-1 bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 rounded-full text-xs font-bold uppercase tracking-wider">Đi về trong ngày</span>`;
                }

                const d = Math.floor(diff / 86400000);
                const h = Math.floor((diff % 86400000) / 3600000);
                const m = Math.floor((diff % 3600000) / 60000);

                let mainStr = '';
                if (d > 0) mainStr += `${d}<span class="text-xl font-sans font-bold text-zinc-400 mr-2">n</span> `;
                if (h > 0 || d > 0) mainStr += `${h}<span class="text-xl font-sans font-bold text-zinc-400 mr-2">g</span> `;
                mainStr += `${m}<span class="text-xl font-sans font-bold text-zinc-400">p</span>`;

                resMain.innerHTML = mainStr;

                resH.textContent = Math.floor(diff / 3600000).toLocaleString('vi-VN');
                resM.textContent = Math.floor(diff / 60000).toLocaleString('vi-VN');
                resS.textContent = Math.floor(diff / 1000).toLocaleString('vi-VN');
            };

            startInp.addEventListener('input', calc);
            endInp.addEventListener('input', calc);
            calc();
        }
    };
    DurCalc.init();

    // Reset All Modules
    const btnResetAll = hostElement.querySelector('#btn-slp-reset');
    if (btnResetAll) {
        btnResetAll.onclick = () => {
            tabs[0].click();
            Timer.reset();
            Sw.reset();
            Cd.init();
            syncIslandLive();
            IslandKit.notify('Đặt lại', 'Đã làm mới toàn bộ bộ đếm thời gian.', 'info');
        };
    }

    return () => {
        clearInterval(liveClockInterval);
        clearInterval(swIslandInterval);
        if (Timer.interval) clearInterval(Timer.interval);
        if (Cd.intv) clearInterval(Cd.intv);
        // Không xóa LiveView để Island tiếp tục hiển thị khi ra Home
    };
}