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
    <div id="percentage-root-container" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #percentage-root-container {
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

            .pc-input-zen {
                font-variant-numeric: tabular-nums;
                -webkit-user-select: text !important;
                user-select: text !important;
            }
        </style>

        <!-- MAIN SCROLLER -->
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-4xl mx-auto space-y-5">
            
            <!-- SEAMLESS HERO TITLE -->
            <div class="px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                        <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Calculator</span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Tính Phần Trăm</h1>
                    <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Hỗ trợ tính tỷ lệ chiết khấu, thị phần tỷ trọng và độ biến thiên tăng trưởng chuẩn xác.</p>
                </div>

                <div class="flex items-center gap-2">
                    <button id="btn-pc-clear" class="h-10 px-4 rounded-[14px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-xs font-semibold flex items-center gap-2 active:scale-95 transition-all shadow-sm">
                        <i class="fas fa-arrows-rotate text-accent-theme text-xs"></i> Làm mới tất cả
                    </button>
                </div>
            </div>

            <!-- WORKSPACE CARDS GRID -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch">
                
                <!-- CARD 1: CƠ BẢN -->
                <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm flex flex-col justify-between space-y-4">
                    <div class="space-y-3 flex-1 flex flex-col">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <span class="w-7 h-7 rounded-[10px] bg-accent-theme-alpha text-accent-theme flex items-center justify-center text-xs">
                                    <i class="fas fa-percent"></i>
                                </span>
                                <h3 class="text-xs font-bold text-zinc-900 dark:text-white">Phần trăm cơ bản</h3>
                            </div>
                            <span class="text-[10px] text-zinc-400 font-mono">X% of Y</span>
                        </div>

                        <div class="bg-[#f2f2f7] dark:bg-black/40 rounded-[18px] p-3 border border-black/[0.04] dark:border-white/[0.06] space-y-2">
                            <div class="flex items-center gap-2">
                                <input type="number" id="pc-1-x" 
                                    class="pc-input pc-input-zen w-24 h-10 bg-white dark:bg-[#27272a] border border-black/[0.04] dark:border-white/[0.06] rounded-[12px] px-3 outline-none text-zinc-900 dark:text-white font-mono text-center text-sm font-bold focus:border-accent-theme transition-colors placeholder-zinc-400" 
                                    placeholder="X">
                                <span class="text-xs font-semibold text-zinc-500 whitespace-nowrap">% của</span>
                                <input type="number" id="pc-1-y" 
                                    class="pc-input pc-input-zen flex-1 min-w-0 h-10 bg-white dark:bg-[#27272a] border border-black/[0.04] dark:border-white/[0.06] rounded-[12px] px-3 outline-none text-zinc-900 dark:text-white font-mono text-center text-sm font-bold focus:border-accent-theme transition-colors placeholder-zinc-400" 
                                    placeholder="Y">
                            </div>
                        </div>
                    </div>

                    <!-- Output & Copy Area -->
                    <div class="pt-3 border-t border-black/[0.05] dark:border-white/[0.08] flex justify-between items-end">
                        <div class="flex flex-col">
                            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Giá trị ra:</span>
                            <div class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white font-mono tracking-tight mt-0.5" id="pc-1-res">0</div>
                        </div>
                        <button class="btn-pc-copy h-8 px-3 rounded-[10px] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all" data-target="pc-1-res">
                            <i class="far fa-copy text-[11px]"></i> <span>Chép</span>
                        </button>
                    </div>
                </div>

                <!-- CARD 2: TỶ TRỌNG -->
                <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm flex flex-col justify-between space-y-4">
                    <div class="space-y-3 flex-1 flex flex-col">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <span class="w-7 h-7 rounded-[10px] bg-accent-theme-alpha text-accent-theme flex items-center justify-center text-xs">
                                    <i class="fas fa-chart-pie"></i>
                                </span>
                                <h3 class="text-xs font-bold text-zinc-900 dark:text-white">Tỷ trọng thành phần</h3>
                            </div>
                            <span class="text-[10px] text-zinc-400 font-mono">Ratio</span>
                        </div>

                        <div class="bg-[#f2f2f7] dark:bg-black/40 rounded-[18px] p-3 border border-black/[0.04] dark:border-white/[0.06] space-y-2">
                            <div class="flex items-center gap-2">
                                <input type="number" id="pc-2-x" 
                                    class="pc-input pc-input-zen w-24 h-10 bg-white dark:bg-[#27272a] border border-black/[0.04] dark:border-white/[0.06] rounded-[12px] px-3 outline-none text-zinc-900 dark:text-white font-mono text-center text-sm font-bold focus:border-accent-theme transition-colors placeholder-zinc-400" 
                                    placeholder="X">
                                <span class="text-xs font-semibold text-zinc-500 whitespace-nowrap">là % của</span>
                                <input type="number" id="pc-2-y" 
                                    class="pc-input pc-input-zen flex-1 min-w-0 h-10 bg-white dark:bg-[#27272a] border border-black/[0.04] dark:border-white/[0.06] rounded-[12px] px-3 outline-none text-zinc-900 dark:text-white font-mono text-center text-sm font-bold focus:border-accent-theme transition-colors placeholder-zinc-400" 
                                    placeholder="Y">
                            </div>
                        </div>
                    </div>

                    <!-- Output & Copy Area -->
                    <div class="pt-3 border-t border-black/[0.05] dark:border-white/[0.08] flex justify-between items-end">
                        <div class="flex flex-col">
                            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Tỷ trọng:</span>
                            <div class="flex items-baseline gap-1 text-zinc-900 dark:text-white mt-0.5">
                                <span class="text-2xl sm:text-3xl font-black font-mono tracking-tight" id="pc-2-res">0</span>
                                <span class="text-base font-bold text-zinc-400">%</span>
                            </div>
                        </div>
                        <button class="btn-pc-copy h-8 px-3 rounded-[10px] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all" data-target="pc-2-res">
                            <i class="far fa-copy text-[11px]"></i> <span>Chép</span>
                        </button>
                    </div>
                </div>

                <!-- CARD 3: BIẾN THIÊN TĂNG / GIẢM -->
                <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm flex flex-col justify-between space-y-4 md:col-span-2 lg:col-span-1">
                    <div class="space-y-3 flex-1 flex flex-col">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <span class="w-7 h-7 rounded-[10px] bg-accent-theme-alpha text-accent-theme flex items-center justify-center text-xs">
                                    <i class="fas fa-chart-line"></i>
                                </span>
                                <h3 class="text-xs font-bold text-zinc-900 dark:text-white">Tăng / Giảm</h3>
                            </div>
                            <span id="pc-3-status" class="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-zinc-500">--</span>
                        </div>

                        <div class="bg-[#f2f2f7] dark:bg-black/40 rounded-[18px] p-3 border border-black/[0.04] dark:border-white/[0.06]">
                            <div class="flex items-center gap-2">
                                <span class="text-xs font-semibold text-zinc-500">Từ</span>
                                <input type="number" id="pc-3-x" 
                                    class="pc-input pc-input-zen flex-1 min-w-0 h-10 bg-white dark:bg-[#27272a] border border-black/[0.04] dark:border-white/[0.06] rounded-[12px] px-3 outline-none text-zinc-900 dark:text-white font-mono text-center text-sm font-bold focus:border-accent-theme transition-colors placeholder-zinc-400" 
                                    placeholder="Gốc">
                                <i class="fas fa-arrow-right text-zinc-400 text-xs"></i>
                                <span class="text-xs font-semibold text-zinc-500">Đến</span>
                                <input type="number" id="pc-3-y" 
                                    class="pc-input pc-input-zen flex-1 min-w-0 h-10 bg-white dark:bg-[#27272a] border border-black/[0.04] dark:border-white/[0.06] rounded-[12px] px-3 outline-none text-zinc-900 dark:text-white font-mono text-center text-sm font-bold focus:border-accent-theme transition-colors placeholder-zinc-400" 
                                    placeholder="Mới">
                            </div>
                        </div>
                    </div>

                    <!-- Output & Copy Area -->
                    <div class="pt-3 border-t border-black/[0.05] dark:border-white/[0.08] flex justify-between items-end">
                        <div class="flex flex-col">
                            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Mức chênh lệch:</span>
                            <div class="flex items-baseline gap-1 mt-0.5" id="pc-3-res-color">
                                <span class="text-2xl sm:text-3xl font-black font-mono tracking-tight text-zinc-900 dark:text-white" id="pc-3-res">0</span>
                                <span class="text-base font-bold text-zinc-400">%</span>
                            </div>
                        </div>
                        <button class="btn-pc-copy h-8 px-3 rounded-[10px] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all" data-target="pc-3-res">
                            <i class="far fa-copy text-[11px]"></i> <span>Chép</span>
                        </button>
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
    const rootContainer = hostElement.querySelector('#percentage-root-container') || hostElement;

    // Theme integration
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    // Query Elements
    const i1x = hostElement.querySelector('#pc-1-x');
    const i1y = hostElement.querySelector('#pc-1-y');
    const r1  = hostElement.querySelector('#pc-1-res');

    const i2x = hostElement.querySelector('#pc-2-x');
    const i2y = hostElement.querySelector('#pc-2-y');
    const r2  = hostElement.querySelector('#pc-2-res');

    const i3x = hostElement.querySelector('#pc-3-x');
    const i3y = hostElement.querySelector('#pc-3-y');
    const r3  = hostElement.querySelector('#pc-3-res');
    const s3  = hostElement.querySelector('#pc-3-status');
    const c3  = hostElement.querySelector('#pc-3-res-color');

    const btnClear = hostElement.querySelector('#btn-pc-clear');
    const btnsCopy = hostElement.querySelectorAll('.btn-pc-copy');
    const inputs   = hostElement.querySelectorAll('.pc-input');

    // Format chuẩn hiển thị số liệu
    const formatNumberVN = (num) => {
        if (isNaN(num) || !isFinite(num)) return 'Lỗi';
        
        let rounded = Math.round(num * 10000) / 10000;
        let parts = String(rounded).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return parts.join(',');
    };

    // Calculation Handlers
    const calc1 = () => {
        const x = parseFloat(i1x.value);
        const y = parseFloat(i1y.value);
        if (isNaN(x) || isNaN(y)) {
            r1.textContent = '0';
            return;
        }
        const res = (x / 100) * y;
        r1.textContent = formatNumberVN(res);
    };

    const calc2 = () => {
        const x = parseFloat(i2x.value);
        const y = parseFloat(i2y.value);
        if (isNaN(x) || isNaN(y) || y === 0) {
            r2.textContent = '0';
            return;
        }
        const res = (x / y) * 100;
        r2.textContent = formatNumberVN(res);
    };

    const calc3 = () => {
        const x = parseFloat(i3x.value);
        const y = parseFloat(i3y.value);
        const valSpan = c3.querySelector('span:first-child');

        if (isNaN(x) || isNaN(y) || x === 0) {
            r3.textContent = '0';
            s3.textContent = '--';
            s3.className = 'text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-zinc-500';
            if (valSpan) valSpan.className = 'text-2xl sm:text-3xl font-black font-mono tracking-tight text-zinc-900 dark:text-white';
            return;
        }
        
        const change = ((y - x) / Math.abs(x)) * 100;
        r3.textContent = formatNumberVN(Math.abs(change));

        if (change > 0) {
            s3.innerHTML = '<i class="fas fa-arrow-up text-[9px] mr-0.5"></i> TĂNG';
            s3.className = 'text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
            if (valSpan) valSpan.className = 'text-2xl sm:text-3xl font-black font-mono tracking-tight text-emerald-500';
        } else if (change < 0) {
            s3.innerHTML = '<i class="fas fa-arrow-down text-[9px] mr-0.5"></i> GIẢM';
            s3.className = 'text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400';
            if (valSpan) valSpan.className = 'text-2xl sm:text-3xl font-black font-mono tracking-tight text-rose-500';
        } else {
            s3.innerHTML = 'NGANG';
            s3.className = 'text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-zinc-500';
            if (valSpan) valSpan.className = 'text-2xl sm:text-3xl font-black font-mono tracking-tight text-zinc-900 dark:text-white';
        }
    };

    // Event Bindings
    i1x?.addEventListener('input', calc1);
    i1y?.addEventListener('input', calc1);

    i2x?.addEventListener('input', calc2);
    i2y?.addEventListener('input', calc2);

    i3x?.addEventListener('input', calc3);
    i3y?.addEventListener('input', calc3);

    btnClear?.addEventListener('click', () => {
        inputs.forEach(inp => { inp.value = ''; });
        calc1(); 
        calc2(); 
        calc3();
        IslandKit.notify('Làm mới', 'Đã đặt lại toàn bộ các trường tính toán.', 'info');
    });

    btnsCopy.forEach(btn => {
        btn.addEventListener('click', async () => {
            const targetId = btn.dataset.target;
            const targetEl = hostElement.querySelector(`#${targetId}`);
            const resText = targetEl?.textContent;

            if (!resText || resText === '0' || resText === 'Lỗi') return;

            try {
                await navigator.clipboard.writeText(resText);
                IslandKit.notify('Đã sao chép', `Giá trị [${resText}] đã lưu vào bộ nhớ tạm.`, 'success');
            } catch (err) {
                IslandKit.notify('Lỗi', 'Không thể truy cập bộ nhớ tạm.', 'error');
            }
        });
    });
}