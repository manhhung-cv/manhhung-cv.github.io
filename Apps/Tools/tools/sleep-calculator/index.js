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
    <div id="slp-root-container" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #slp-root-container {
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

            .slp-input-zen {
                font-variant-numeric: tabular-nums;
                -webkit-user-select: text !important;
                user-select: text !important;
            }

            input[type="time"]::-webkit-calendar-picker-indicator {
                display: none;
            }
        </style>

        <!-- MAIN SCROLLER -->
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-4xl mx-auto space-y-5">
            
            <!-- SEAMLESS HERO TITLE -->
            <div class="px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                        <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Health</span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Máy Tính Giấc Ngủ</h1>
                    <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Tính toán chu kỳ 90 phút sinh học để thức dậy vào pha ngủ nông, luôn tỉnh táo và sảng khoái.</p>
                </div>

                <div class="flex items-center gap-2">
                    <button id="btn-slp-reset" class="h-10 px-4 rounded-[14px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-xs font-semibold flex items-center gap-2 active:scale-95 transition-all shadow-sm">
                        <i class="fas fa-arrows-rotate text-accent-theme text-xs"></i> Đặt lại
                    </button>
                </div>
            </div>

            <!-- CONTROLS & OPTIONS CARD -->
            <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-2.5 shadow-sm">
                <div class="flex overflow-x-auto no-scrollbar gap-1 p-1" id="slp-tabs">
                    <button class="slp-tab active h-9 px-4 rounded-[12px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex items-center gap-1.5 shrink-0" data-mode="wake">
                        <i class="fas fa-sun text-[11px]"></i> Tính giờ thức
                    </button>
                    <button class="slp-tab h-9 px-4 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0" data-mode="bed">
                        <i class="fas fa-moon text-[11px]"></i> Tính giờ ngủ
                    </button>
                    <button class="slp-tab h-9 px-4 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0" data-mode="duration">
                        <i class="fas fa-hourglass-half text-[11px]"></i> Đánh giá thời lượng
                    </button>
                </div>
            </div>

            <!-- WORKSPACE GRID -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
                
                <!-- BẢNG ĐIỀU KHIỂN & CÀI ĐẶT THỜI GIAN -->
                <div class="lg:col-span-5 flex flex-col gap-4">
                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm space-y-4">
                        <div class="flex items-center justify-between">
                            <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Cấu hình thời gian</h3>
                            <span class="text-[10px] text-zinc-400 font-mono" id="slp-mode-tag">Wake Time</span>
                        </div>

                        <!-- 1. PANE WAKE -->
                        <div id="mode-wake" class="slp-pane block space-y-2">
                            <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Nếu tôi đi ngủ vào lúc...</label>
                            <div class="flex items-center gap-2">
                                <div class="flex-1 flex items-center bg-[#f2f2f7] dark:bg-black/40 rounded-[16px] px-3.5 h-12 border border-black/[0.04] dark:border-white/[0.06] focus-within:border-accent-theme transition-all">
                                    <input type="time" id="in-sleep-time" class="slp-input-zen w-full bg-transparent border-none outline-none text-2xl font-black font-mono text-center text-zinc-900 dark:text-white tracking-widest">
                                </div>
                                <button class="btn-set-now h-12 px-4 rounded-[14px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-zinc-700 dark:text-zinc-300 hover:text-accent-theme text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm shrink-0" data-target="in-sleep-time">
                                    <i class="fas fa-clock text-xs"></i> <span>Bây giờ</span>
                                </button>
                            </div>
                        </div>

                        <!-- 2. PANE BED -->
                        <div id="mode-bed" class="slp-pane hidden space-y-2">
                            <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Tôi muốn thức dậy vào lúc...</label>
                            <div class="flex items-center gap-2">
                                <div class="flex-1 flex items-center bg-[#f2f2f7] dark:bg-black/40 rounded-[16px] px-3.5 h-12 border border-black/[0.04] dark:border-white/[0.06] focus-within:border-accent-theme transition-all">
                                    <input type="time" id="in-wake-time" value="06:00" class="slp-input-zen w-full bg-transparent border-none outline-none text-2xl font-black font-mono text-center text-zinc-900 dark:text-white tracking-widest">
                                </div>
                                <button class="btn-set-now h-12 px-4 rounded-[14px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-zinc-700 dark:text-zinc-300 hover:text-accent-theme text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm shrink-0" data-target="in-wake-time">
                                    <i class="fas fa-clock text-xs"></i> <span>Bây giờ</span>
                                </button>
                            </div>
                        </div>

                        <!-- 3. PANE DURATION -->
                        <div id="mode-duration" class="slp-pane hidden space-y-3">
                            <div class="space-y-1">
                                <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Giờ lên giường</label>
                                <div class="flex items-center gap-2">
                                    <div class="flex-1 flex items-center bg-[#f2f2f7] dark:bg-black/40 rounded-[14px] px-3 h-11 border border-black/[0.04] dark:border-white/[0.06] focus-within:border-accent-theme transition-all">
                                        <input type="time" id="in-dur-sleep" value="23:00" class="slp-input-zen w-full bg-transparent border-none outline-none text-lg font-black font-mono text-center text-zinc-900 dark:text-white tracking-widest">
                                    </div>
                                    <button class="btn-set-now h-11 px-3.5 rounded-[12px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-zinc-700 dark:text-zinc-300 hover:text-accent-theme text-xs font-bold flex items-center justify-center active:scale-95 transition-all shrink-0" data-target="in-dur-sleep">
                                        <i class="fas fa-clock text-xs"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="space-y-1">
                                <label class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Giờ thức dậy</label>
                                <div class="flex items-center gap-2">
                                    <div class="flex-1 flex items-center bg-[#f2f2f7] dark:bg-black/40 rounded-[14px] px-3 h-11 border border-black/[0.04] dark:border-white/[0.06] focus-within:border-accent-theme transition-all">
                                        <input type="time" id="in-dur-wake" value="06:00" class="slp-input-zen w-full bg-transparent border-none outline-none text-lg font-black font-mono text-center text-zinc-900 dark:text-white tracking-widest">
                                    </div>
                                    <button class="btn-set-now h-11 px-3.5 rounded-[12px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] text-zinc-700 dark:text-zinc-300 hover:text-accent-theme text-xs font-bold flex items-center justify-center active:scale-95 transition-all shrink-0" data-target="in-dur-wake">
                                        <i class="fas fa-clock text-xs"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- SLIDER: THỜI GIAN CHÌM VÀO GIẤC NGỦ -->
                        <div class="rounded-[18px] bg-[#f2f2f7] dark:bg-black/40 p-3.5 border border-black/[0.04] dark:border-white/[0.06] space-y-2">
                            <div class="flex justify-between items-center text-xs">
                                <span class="font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                                    <i class="fas fa-bed text-accent-theme text-xs"></i> Chìm vào giấc ngủ
                                </span>
                                <span class="font-mono font-bold text-accent-theme text-xs" id="val-fall-asleep">15 phút</span>
                            </div>
                            <input type="range" id="in-fall-asleep" min="0" max="60" step="5" value="15" class="accent-theme-tint w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full cursor-pointer">
                            <div class="flex justify-between text-[9px] font-mono text-zinc-400">
                                <span>0p (Lập tức)</span>
                                <span>60p (Trằn trọc)</span>
                            </div>
                        </div>

                    </div>
                </div>

                <!-- BẢNG KẾT QUẢ HIỂN THỊ CHU KỲ -->
                <div class="lg:col-span-7 flex flex-col h-full">
                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm min-h-[460px] flex flex-col justify-between space-y-4">
                        
                        <!-- 1. CYCLES RESULT BOX -->
                        <div id="res-cycles-box" class="block space-y-4">
                            <div class="border-b border-black/[0.05] dark:border-white/[0.08] pb-3 space-y-1">
                                <div class="flex items-center justify-between">
                                    <h3 class="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider" id="res-title">BẠN NÊN THỨC DẬY VÀO LÚC:</h3>
                                    <span class="text-[10px] text-zinc-400 font-mono">90 min / Cycle</span>
                                </div>
                                <p class="text-[11px] text-zinc-500 dark:text-zinc-400" id="res-desc">Đã tính thêm thời gian chìm vào giấc ngủ. Hãy ưu tiên các mốc có màu nhấn để cơ thể tràn đầy năng lượng nhất.</p>
                            </div>

                            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5" id="res-list"></div>

                            <!-- POWER NAP SUGGESTION -->
                            <div id="res-nap-box" class="pt-3 border-t border-black/[0.05] dark:border-white/[0.08] hidden space-y-2.5">
                                <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <i class="fas fa-bolt text-amber-500 text-xs"></i> Chợp mắt sạc nhanh (Power Nap)
                                </span>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5" id="res-nap-list"></div>
                            </div>
                        </div>

                        <!-- 2. DURATION EVALUATION BOX -->
                        <div id="res-duration-box" class="hidden flex-col items-center justify-center text-center space-y-4 py-4">
                            <div class="w-full text-left border-b border-black/[0.05] dark:border-white/[0.08] pb-3">
                                <h3 class="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Đánh giá thời lượng giấc ngủ</h3>
                            </div>

                            <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[20px] p-6 w-full space-y-3">
                                <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Thời gian thực ngủ (Đã trừ lúc ru ngủ)</span>
                                <div class="text-4xl sm:text-5xl font-black text-accent-theme font-mono tracking-tight" id="dur-total">0g 0p</div>
                                <div class="text-xs font-bold text-zinc-700 dark:text-zinc-300 font-mono" id="dur-cycles-text">Tương đương 0 chu kỳ</div>
                                
                                <div class="h-px bg-black/[0.05] dark:border-white/[0.08] w-full"></div>
                                
                                <div id="dur-eval" class="text-xs sm:text-sm font-medium leading-relaxed"></div>
                            </div>
                        </div>

                        <div class="pt-2 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between text-[11px] text-zinc-400">
                            <span>Mô hình nhịp sinh học tự nhiên</span>
                            <span class="font-mono text-[10px]">Circadian Safe</span>
                        </div>

                    </div>
                </div>

            </div>

        </main>
    </div>
    `;
}

// =============================================================================
// 3. LOGIC HOOKS & EVENT DISPATCHING
// =============================================================================
export function init(hostElement) {
    const rootContainer = hostElement.querySelector('#slp-root-container') || hostElement;

    // Theme integration
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    // Query Elements
    const tabs = hostElement.querySelectorAll('#slp-tabs .slp-tab');
    const panes = {
        'wake': hostElement.querySelector('#mode-wake'),
        'bed': hostElement.querySelector('#mode-bed'),
        'duration': hostElement.querySelector('#mode-duration')
    };

    const inSleepTime = hostElement.querySelector('#in-sleep-time');
    const inWakeTime = hostElement.querySelector('#in-wake-time');
    const inDurSleep = hostElement.querySelector('#in-dur-sleep');
    const inDurWake = hostElement.querySelector('#in-dur-wake');

    const inFallAsleep = hostElement.querySelector('#in-fall-asleep');
    const valFallAsleep = hostElement.querySelector('#val-fall-asleep');
    const btnSetNows = hostElement.querySelectorAll('.btn-set-now');
    const btnReset = hostElement.querySelector('#btn-slp-reset');

    const resCyclesBox = hostElement.querySelector('#res-cycles-box');
    const resDurBox = hostElement.querySelector('#res-duration-box');
    const slpModeTag = hostElement.querySelector('#slp-mode-tag');

    const resTitle = hostElement.querySelector('#res-title');
    const resDesc = hostElement.querySelector('#res-desc');
    const resList = hostElement.querySelector('#res-list');

    const resNapBox = hostElement.querySelector('#res-nap-box');
    const resNapList = hostElement.querySelector('#res-nap-list');

    const durTotal = hostElement.querySelector('#dur-total');
    const durCyclesText = hostElement.querySelector('#dur-cycles-text');
    const durEval = hostElement.querySelector('#dur-eval');

    let currentMode = 'wake';
    const CYCLE_MINS = 90;

    // Tab Classes Standard
    const activeTabClass = 'slp-tab active h-9 px-4 rounded-[12px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex items-center gap-1.5 shrink-0';
    const inactiveTabClass = 'slp-tab h-9 px-4 rounded-[12px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center gap-1.5 shrink-0';

    const formatTime = (date) => {
        const h = date.getHours().toString().padStart(2, '0');
        const m = date.getMinutes().toString().padStart(2, '0');
        return `${h}:${m}`;
    };

    const getCycleStyle = (cycles) => {
        if (cycles === 5 || cycles === 6) {
            return 'bg-accent-theme-alpha border-accent-theme/30 text-accent-theme';
        }
        if (cycles === 4) {
            return 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400';
        }
        if (cycles === 3) {
            return 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400';
        }
        return 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400';
    };

    const getCycleLabel = (cycles) => {
        if (cycles === 6) return 'Ngủ 9 tiếng (Lý tưởng)';
        if (cycles === 5) return 'Ngủ 7.5 tiếng (Chuẩn)';
        if (cycles === 4) return 'Ngủ 6 tiếng (Vừa đủ)';
        if (cycles === 3) return 'Ngủ 4.5 tiếng (Hơi ít)';
        if (cycles === 2) return 'Ngủ 3 tiếng (Tạm thời)';
        if (cycles === 1) return 'Ngủ 1.5 tiếng (Ngắn)';
        return '';
    };

    const parseTimeString = (timeStr) => {
        if (!timeStr) return new Date();
        const [h, m] = timeStr.split(':').map(Number);
        let d = new Date();
        d.setHours(h, m, 0, 0);
        return d;
    };

    const renderCard = (time, cycles, desc, colorClass) => {
        return `
            <div class="${colorClass} border rounded-[18px] p-3 flex flex-col items-center justify-center text-center shadow-sm">
                <span class="text-[9px] font-bold uppercase tracking-widest opacity-75 mb-1">${cycles} chu kỳ</span>
                <div class="text-2xl sm:text-3xl font-black font-mono tracking-tight leading-none mb-1">${time}</div>
                <span class="text-[11px] font-semibold opacity-90">${desc}</span>
            </div>
        `;
    };

    // Calculation Routines
    const calcWakeTimes = (sleepDate) => {
        const fallAsleep = parseInt(inFallAsleep.value, 10) || 0;
        resList.innerHTML = '';
        resTitle.textContent = 'BẠN NÊN THỨC DẬY VÀO LÚC:';
        resDesc.innerHTML = `Đã tự động tính thêm <strong>${fallAsleep} phút</strong> thời gian ru ngủ.`;

        const cyclesToCalculate = [6, 5, 4, 3, 2, 1];

        cyclesToCalculate.forEach((cycle) => {
            let wakeDate = new Date(sleepDate.getTime());
            wakeDate.setMinutes(wakeDate.getMinutes() + fallAsleep + (cycle * CYCLE_MINS));

            resList.innerHTML += renderCard(
                formatTime(wakeDate),
                cycle,
                getCycleLabel(cycle),
                getCycleStyle(cycle)
            );
        });

        // Power Nap
        resNapBox.classList.remove('hidden');
        let nap20 = new Date(sleepDate.getTime()); nap20.setMinutes(nap20.getMinutes() + fallAsleep + 20);
        let nap90 = new Date(sleepDate.getTime()); nap90.setMinutes(nap90.getMinutes() + fallAsleep + 90);

        resNapList.innerHTML = `
            <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-3 flex justify-between items-center">
                <div class="flex flex-col">
                    <span class="text-[9px] font-bold text-zinc-400 uppercase">Chợp mắt nhanh</span>
                    <span class="text-xs font-bold text-zinc-900 dark:text-white">20 phút</span>
                </div>
                <span class="text-lg font-black text-accent-theme font-mono">${formatTime(nap20)}</span>
            </div>
            <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-3 flex justify-between items-center">
                <div class="flex flex-col">
                    <span class="text-[9px] font-bold text-zinc-400 uppercase">Ngủ trọn 1 pha</span>
                    <span class="text-xs font-bold text-zinc-900 dark:text-white">90 phút</span>
                </div>
                <span class="text-lg font-black text-accent-theme font-mono">${formatTime(nap90)}</span>
            </div>
        `;
    };

    const calcBedTimes = () => {
        if (!inWakeTime.value) return;
        const wakeDate = parseTimeString(inWakeTime.value);
        const fallAsleep = parseInt(inFallAsleep.value, 10) || 0;

        resList.innerHTML = '';
        resTitle.textContent = 'BẠN NÊN ĐI NGỦ VÀO LÚC:';
        resDesc.innerHTML = `Để thức giấc dễ chịu, hãy lên giường vào các khung giờ sau (đã trừ <strong>${fallAsleep} phút</strong> chìm vào giấc ngủ).`;
        resNapBox.classList.add('hidden');

        const cyclesToCalculate = [6, 5, 4, 3, 2, 1];

        cyclesToCalculate.forEach((cycle) => {
            let bedDate = new Date(wakeDate.getTime());
            bedDate.setMinutes(bedDate.getMinutes() - fallAsleep - (cycle * CYCLE_MINS));

            resList.innerHTML += renderCard(
                formatTime(bedDate),
                cycle,
                getCycleLabel(cycle),
                getCycleStyle(cycle)
            );
        });
    };

    const calcDuration = () => {
        if (!inDurSleep.value || !inDurWake.value) return;

        const fallAsleep = parseInt(inFallAsleep.value, 10) || 0;
        const dSleep = parseTimeString(inDurSleep.value);
        let dWake = parseTimeString(inDurWake.value);

        if (dWake <= dSleep) {
            dWake.setDate(dWake.getDate() + 1);
        }

        let totalMins = Math.round((dWake - dSleep) / 60000);
        let realSleepMins = totalMins - fallAsleep;
        if (realSleepMins < 0) realSleepMins = 0;

        const hours = Math.floor(realSleepMins / 60);
        const mins = realSleepMins % 60;
        const cycles = (realSleepMins / CYCLE_MINS).toFixed(1);

        durTotal.textContent = `${hours}g ${mins}p`;
        durCyclesText.textContent = `Tương đương ~${cycles} chu kỳ sinh học`;

        if (cycles >= 5 && cycles <= 6.5) {
            durEval.innerHTML = `<span class="text-accent-theme font-bold"><i class="fas fa-check-circle"></i> Trạng thái lý tưởng!</span> Bạn có thời lượng ngủ tối ưu cho sự tái tạo tế bào não và thể lực.`;
            durTotal.className = 'text-4xl sm:text-5xl font-black text-accent-theme font-mono tracking-tight';
        } else if (cycles >= 4 && cycles < 5) {
            durEval.innerHTML = `<span class="text-blue-500 font-bold"><i class="fas fa-circle-info"></i> Tương đối ổn.</span> Mức 6 tiếng vừa đủ năng lượng duy trì làm việc, nên ngủ thêm 1 chu kỳ để tỉnh táo hơn.`;
            durTotal.className = 'text-4xl sm:text-5xl font-black text-blue-500 font-mono tracking-tight';
        } else if (cycles > 6.5) {
            durEval.innerHTML = `<span class="text-amber-500 font-bold"><i class="fas fa-triangle-exclamation"></i> Ngủ quá giấc!</span> Thời lượng hơn 9 tiếng có thể gây trạng thái quán tính ngủ (say ngủ), uể oải sau khi dậy.`;
            durTotal.className = 'text-4xl sm:text-5xl font-black text-amber-500 font-mono tracking-tight';
        } else {
            durEval.innerHTML = `<span class="text-rose-500 font-bold"><i class="fas fa-circle-xmark"></i> Thiếu ngủ nghiêm trọng!</span> Não bộ chưa hoàn tất chu trình đào thải độc tố và củng cố trí nhớ.`;
            durTotal.className = 'text-4xl sm:text-5xl font-black text-rose-500 font-mono tracking-tight';
        }
    };

    const triggerCalc = () => {
        if (currentMode === 'wake') {
            if (inSleepTime.value) calcWakeTimes(parseTimeString(inSleepTime.value));
        } else if (currentMode === 'bed') {
            calcBedTimes();
        } else if (currentMode === 'duration') {
            calcDuration();
        }
    };

    // Event Bindings
    inFallAsleep.addEventListener('input', (e) => {
        valFallAsleep.textContent = `${e.target.value} phút`;
        triggerCalc();
    });

    btnSetNows.forEach(btn => {
        btn.onclick = () => {
            const targetId = btn.dataset.target;
            const targetInput = hostElement.querySelector(`#${targetId}`);
            if (targetInput) {
                targetInput.value = formatTime(new Date()); 
                triggerCalc();
                IslandKit.notify('Thời gian', 'Đã cập nhật giờ hiện tại.', 'info');
            }
        };
    });

    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => { t.className = inactiveTabClass; });
            tab.className = activeTabClass;

            currentMode = tab.dataset.mode;
            Object.values(panes).forEach(p => { 
                p.classList.remove('block'); 
                p.classList.add('hidden'); 
            });
            panes[currentMode].classList.remove('hidden'); 
            panes[currentMode].classList.add('block');

            if (currentMode === 'duration') {
                slpModeTag.textContent = 'Sleep Duration';
                resCyclesBox.classList.remove('block'); 
                resCyclesBox.classList.add('hidden');
                resDurBox.classList.remove('hidden'); 
                resDurBox.classList.add('flex');
            } else {
                slpModeTag.textContent = currentMode === 'wake' ? 'Wake Time' : 'Bed Time';
                resCyclesBox.classList.remove('hidden'); 
                resCyclesBox.classList.add('block');
                resDurBox.classList.remove('flex'); 
                resDurBox.classList.add('hidden');
            }

            triggerCalc();
        };
    });

    inSleepTime.addEventListener('input', triggerCalc);
    inWakeTime.addEventListener('input', triggerCalc);
    inDurSleep.addEventListener('input', triggerCalc);
    inDurWake.addEventListener('input', triggerCalc);

    btnReset.onclick = () => {
        tabs[0].click();
        inWakeTime.value = '06:00';
        inDurSleep.value = '23:00';
        inDurWake.value = '06:00';
        inFallAsleep.value = 15;
        valFallAsleep.textContent = '15 phút';
        inSleepTime.value = formatTime(new Date()); 
        triggerCalc();
        IslandKit.notify('Đặt lại', 'Đã khôi phục các thông số ban đầu.', 'info');
    };

    // Initialize Default
    inSleepTime.value = formatTime(new Date());
    inDurSleep.value = '23:00';
    inDurWake.value = '06:00';
    triggerCalc();
}