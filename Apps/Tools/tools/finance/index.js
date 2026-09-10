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
// 2. TEMPLATE RENDERER (SEAMLESS EMERALD FLAT)
// =============================================================================
export function template() {
    return `
    <div id="financial-workspace-root" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #financial-workspace-root {
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
            .bg-accent-theme-alpha {
                background-color: color-mix(in srgb, var(--kit-accent) 14%, transparent) !important;
            }
            .hover-bg-accent-theme-alpha:hover {
                background-color: color-mix(in srgb, var(--kit-accent) 20%, transparent) !important;
            }
        </style>

        <!-- MAIN SCROLLER -->
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-6xl mx-auto space-y-5">
            
            <!-- SEAMLESS HERO TITLE -->
            <div class="px-1 space-y-1">
                <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                    <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Financial Engine</span>
                </div>
                <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Financial Workspace</h1>
                <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Mô phỏng lãi kép, dự phóng dòng tiền vận hành và giải pháp thu hẹp khoảng cách mục tiêu.</p>
            </div>

            <!-- WORKSPACE GRID -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                
                <!-- CỘT TRÁI: LÃI KÉP & MỤC TIÊU (MODULE A & C) -->
                <div class="space-y-5">
                    
                    <!-- MODULE A: LÃI SUẤT KÉP -->
                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm space-y-4">
                        <div class="flex items-center justify-between pb-2 border-b border-black/[0.05] dark:border-white/[0.08]">
                            <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                                <i class="fas fa-chart-line text-accent-theme"></i> A. Tăng trưởng Lãi kép
                            </h3>
                            <span class="text-[9px] font-mono px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-zinc-500">Compound</span>
                        </div>

                        <!-- Các ô nhập số liệu -->
                        <div class="space-y-3">
                            <div class="grid grid-cols-2 gap-3">
                                <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-3 focus-within:border-accent-theme transition-all">
                                    <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Vốn gốc hiện có (VNĐ)</label>
                                    <input type="text" inputmode="numeric" id="modA-initial" class="currency-input w-full bg-transparent border-none outline-none text-sm font-black font-mono text-zinc-900 dark:text-white p-0" placeholder="0" value="0">
                                </div>
                                <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-3 focus-within:border-accent-theme transition-all">
                                    <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Góp mỗi tháng (VNĐ)</label>
                                    <input type="text" inputmode="numeric" id="modA-monthly" class="currency-input w-full bg-transparent border-none outline-none text-sm font-black font-mono text-zinc-900 dark:text-white p-0" placeholder="0" value="10.000.000">
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-3">
                                <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-3 focus-within:border-accent-theme transition-all">
                                    <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Lãi suất năm (%)</label>
                                    <input type="number" id="modA-rate" class="standard-number w-full bg-transparent border-none outline-none text-sm font-black font-mono text-zinc-900 dark:text-white p-0" placeholder="0" value="8" step="0.1">
                                </div>
                                <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-3 focus-within:border-accent-theme transition-all">
                                    <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Số năm tích lũy</label>
                                    <input type="number" id="modA-years" class="standard-number w-full bg-transparent border-none outline-none text-sm font-black font-mono text-zinc-900 dark:text-white p-0" placeholder="0" value="4">
                                </div>
                            </div>
                        </div>

                        <!-- Card Kết quả Lãi kép -->
                        <div class="p-4 rounded-[18px] bg-gradient-to-br from-zinc-900 to-zinc-950 dark:from-[#121214] dark:to-black text-white border border-white/5 space-y-2">
                            <div class="flex justify-between items-baseline">
                                <span class="text-xs text-zinc-400 font-medium">Tổng tài sản cuối kỳ:</span>
                                <span class="text-xl sm:text-2xl font-black font-mono text-accent-theme tracking-tight" id="modA-final-balance">0 ₫</span>
                            </div>
                            <div class="flex justify-between items-baseline pt-2 border-t border-white/10">
                                <span class="text-xs text-zinc-400 font-medium">Tổng lợi nhuận từ lãi:</span>
                                <span class="text-xs font-bold font-mono text-emerald-400" id="modA-total-profit">+0 ₫</span>
                            </div>
                        </div>

                        <!-- Nút xem lộ trình -->
                        <button id="btn-toggle-schedule" class="w-full h-10 rounded-[14px] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-zinc-700 dark:text-zinc-300 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all">
                            Xem lộ trình chi tiết <i class="fas fa-chevron-down text-[10px]"></i>
                        </button>

                        <!-- Bảng lộ trình chi tiết -->
                        <div id="schedule-container" class="hidden w-full overflow-x-auto no-scrollbar border border-black/[0.05] dark:border-white/[0.08] rounded-[16px] max-h-[260px]">
                            <table class="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr class="bg-[#f2f2f7] dark:bg-black/60 sticky top-0 border-b border-black/[0.05] dark:border-white/[0.08]">
                                        <th class="p-2.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Năm</th>
                                        <th class="p-2.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Tiền vốn</th>
                                        <th class="p-2.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Tiền lãi</th>
                                        <th class="p-2.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Tổng cộng</th>
                                    </tr>
                                </thead>
                                <tbody id="modA-schedule-body" class="font-mono text-zinc-800 dark:text-zinc-200 divide-y divide-black/[0.04] dark:divide-white/[0.06]"></tbody>
                            </table>
                        </div>
                    </div>

                    <!-- MODULE C: GOAL BRIDGING -->
                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm space-y-4">
                        <div class="flex items-center justify-between pb-2 border-b border-black/[0.05] dark:border-white/[0.08]">
                            <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                                <i class="fas fa-bullseye text-accent-theme"></i> C. Hoạch định Cán đích Mục tiêu
                            </h3>
                            <span class="text-[9px] font-mono px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-zinc-500">Bridge</span>
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-3 focus-within:border-accent-theme transition-all">
                                <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Mục tiêu tài sản (VNĐ)</label>
                                <input type="text" inputmode="numeric" id="modC-target" class="currency-input w-full bg-transparent border-none outline-none text-sm font-black font-mono text-zinc-900 dark:text-white p-0" value="5.000.000.000">
                            </div>
                            <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-3 focus-within:border-accent-theme transition-all">
                                <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Thời hạn (Năm)</label>
                                <input type="number" id="modC-deadline" class="standard-number w-full bg-transparent border-none outline-none text-sm font-black font-mono text-zinc-900 dark:text-white p-0" value="4">
                            </div>
                        </div>

                        <div class="space-y-2 pt-1">
                            <div class="flex items-center justify-between p-3 rounded-[16px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06]">
                                <span class="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Cần bổ sung thêm / tháng:</span>
                                <span class="text-base font-black font-mono text-accent-theme" id="modC-required">0 ₫</span>
                            </div>
                            <div class="flex items-center justify-between p-3 rounded-[16px] bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06]">
                                <span class="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Khoảng cách tới mục tiêu:</span>
                                <span class="text-base font-black font-mono text-rose-500" id="modC-gap">0 ₫</span>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- CỘT PHẢI: DÒNG TIỀN VẬN HÀNH (MODULE B) -->
                <div class="space-y-5">
                    
                    <!-- MODULE B: BUSINESS CASH FLOW -->
                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm space-y-4">
                        <div class="flex items-center justify-between pb-2 border-b border-black/[0.05] dark:border-white/[0.08]">
                            <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                                <i class="fas fa-wallet text-accent-theme"></i> B. Dòng tiền Doanh nghiệp / Cửa hàng
                            </h3>
                            <span class="text-[9px] font-mono px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-zinc-500">Cash Flow</span>
                        </div>

                        <div class="space-y-3">
                            <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-3 focus-within:border-accent-theme transition-all">
                                <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Tổng doanh thu / Tháng (VNĐ)</label>
                                <input type="text" inputmode="numeric" id="modB-revenue" class="currency-input w-full bg-transparent border-none outline-none text-sm font-black font-mono text-zinc-900 dark:text-white p-0" placeholder="0">
                            </div>
                            
                            <div class="grid grid-cols-2 gap-3">
                                <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-3 focus-within:border-accent-theme transition-all">
                                    <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Chi phí cố định (Mặt bằng, lương...)</label>
                                    <input type="text" inputmode="numeric" id="modB-fixed" class="currency-input w-full bg-transparent border-none outline-none text-sm font-black font-mono text-zinc-900 dark:text-white p-0" placeholder="0">
                                </div>
                                <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] p-3 focus-within:border-accent-theme transition-all">
                                    <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Chi phí biến đổi (Nguyên vật liệu...)</label>
                                    <input type="text" inputmode="numeric" id="modB-variable" class="currency-input w-full bg-transparent border-none outline-none text-sm font-black font-mono text-zinc-900 dark:text-white p-0" placeholder="0">
                                </div>
                            </div>
                        </div>

                        <!-- Cảnh báo Burn Rate -->
                        <div id="burn-rate-alert" class="hidden flex items-start gap-3 p-3.5 rounded-[16px] bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
                            <i class="fas fa-triangle-exclamation mt-0.5 text-xs"></i>
                            <div>
                                <span class="text-[10px] font-bold uppercase tracking-wider block mb-0.5">Cảnh báo Burn Rate</span>
                                <span class="text-xs font-medium leading-relaxed">Tỷ lệ chi phí đang vượt quá 80% doanh thu. Biên độ an toàn dự phòng rất mỏng!</span>
                            </div>
                        </div>

                        <!-- Chỉ số hiệu suất tài chính -->
                        <div class="rounded-[18px] border border-black/[0.05] dark:border-white/[0.08] overflow-hidden">
                            <div class="p-4 flex items-center justify-between bg-[#f2f2f7] dark:bg-black/40 border-b border-black/[0.05] dark:border-white/[0.08]">
                                <span class="text-xs font-bold text-zinc-600 dark:text-zinc-400">Lợi nhuận ròng (Net Profit)</span>
                                <span class="text-lg font-black font-mono text-accent-theme" id="modB-net-profit">0 ₫</span>
                            </div>
                            <div class="grid grid-cols-2 divide-x divide-black/[0.05] dark:divide-white/[0.08] bg-white dark:bg-[#161618]">
                                <div class="p-3.5 text-center">
                                    <span class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Biên lợi nhuận</span>
                                    <span class="text-sm font-black font-mono text-zinc-900 dark:text-white" id="modB-margin">0%</span>
                                </div>
                                <div class="p-3.5 text-center">
                                    <span class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Burn Rate</span>
                                    <span class="text-sm font-black font-mono text-zinc-900 dark:text-white" id="modB-burn-rate">0%</span>
                                </div>
                            </div>
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
    const rootContainer = hostElement.querySelector('#financial-workspace-root') || hostElement;

    // Khởi tạo ThemeKit
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    const _ = sel => hostElement.querySelector(sel);
    const $$ = sel => hostElement.querySelectorAll(sel);

    const formatVND = (num) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);

    const formatDisplayNumber = (num) => {
        if (!num && num !== 0) return '';
        return new Intl.NumberFormat('vi-VN').format(num);
    };

    const getVal = (id) => {
        const el = _(`#${id}`);
        if (!el) return 0;
        if (el.classList.contains('currency-input')) {
            const rawValue = el.value.replace(/\./g, '');
            return parseFloat(rawValue) || 0;
        }
        return parseFloat(el.value) || 0;
    };

    const saveState = () => {
        const state = {
            initial: getVal('modA-initial'), 
            monthly: getVal('modA-monthly'), 
            rate: getVal('modA-rate'), 
            years: getVal('modA-years'),
            revenue: getVal('modB-revenue'), 
            fixed: getVal('modB-fixed'), 
            variable: getVal('modB-variable'),
            target: getVal('modC-target'), 
            deadline: getVal('modC-deadline')
        };
        localStorage.setItem('financial_tools_state', JSON.stringify(state));
    };

    const loadState = () => {
        const data = JSON.parse(localStorage.getItem('financial_tools_state'));
        if (!data) return;

        const map = {
            'modA-initial': data.initial, 
            'modA-monthly': data.monthly, 
            'modA-rate': data.rate, 
            'modA-years': data.years,
            'modB-revenue': data.revenue, 
            'modB-fixed': data.fixed, 
            'modB-variable': data.variable,
            'modC-target': data.target, 
            'modC-deadline': data.deadline
        };

        for (const [id, val] of Object.entries(map)) {
            const el = _(`#${id}`);
            if (el && val !== undefined) {
                if (el.classList.contains('currency-input')) {
                    el.value = formatDisplayNumber(val);
                } else {
                    el.value = val;
                }
            }
        }
    };

    // Định dạng tiền tệ thời gian thực khi gõ
    $$('.currency-input').forEach(input => {
        input.addEventListener('input', function() {
            let cursorPosition = this.selectionStart;
            let oldLength = this.value.length;

            let rawValue = this.value.replace(/\D/g, '');
            if (rawValue !== '') {
                this.value = new Intl.NumberFormat('vi-VN').format(parseInt(rawValue, 10));
            } else {
                this.value = '';
            }

            let newLength = this.value.length;
            cursorPosition = cursorPosition + (newLength - oldLength);
            this.setSelectionRange(cursorPosition, cursorPosition);

            calculateAll();
        });
    });

    $$('.standard-number').forEach(input => {
        input.addEventListener('input', calculateAll);
    });

    // MODULE A: COMPOUND GROWTH
    const calculateCompound = () => {
        const initial = getVal('modA-initial');
        const monthly = getVal('modA-monthly');
        const rate = getVal('modA-rate') / 100;
        const years = getVal('modA-years');
        const tbody = _('#modA-schedule-body');

        let currentBalance = initial;
        let totalInvested = initial;
        if (tbody) tbody.innerHTML = '';

        for (let year = 1; year <= years; year++) {
            for (let month = 1; month <= 12; month++) {
                currentBalance = currentBalance * (1 + rate / 12) + monthly;
                totalInvested += monthly;
            }
            const totalInterest = currentBalance - totalInvested;
            if (tbody) {
                tbody.innerHTML += `
                    <tr class="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                        <td class="p-2.5 text-center font-bold">${year}</td>
                        <td class="p-2.5 text-right">${formatVND(totalInvested)}</td>
                        <td class="p-2.5 text-right text-emerald-500 font-semibold">${formatVND(totalInterest)}</td>
                        <td class="p-2.5 text-right font-black text-zinc-900 dark:text-white">${formatVND(currentBalance)}</td>
                    </tr>
                `;
            }
        }

        const totalProfit = currentBalance - totalInvested;
        const finalBalEl = _('#modA-final-balance');
        const totalProfEl = _('#modA-total-profit');
        if (finalBalEl) finalBalEl.textContent = formatVND(currentBalance);
        if (totalProfEl) totalProfEl.textContent = '+' + formatVND(totalProfit);

        return currentBalance;
    };

    // MODULE B: BUSINESS CASH FLOW
    const calculateCashFlow = () => {
        const rev = getVal('modB-revenue');
        const fixed = getVal('modB-fixed');
        const variable = getVal('modB-variable');

        const totalCosts = fixed + variable;
        const netProfit = rev - totalCosts;

        const margin = rev > 0 ? (netProfit / rev) * 100 : 0;
        const burnRate = rev > 0 ? (totalCosts / rev) * 100 : 0;

        const netProfEl = _('#modB-net-profit');
        const marginEl = _('#modB-margin');
        const burnRateEl = _('#modB-burn-rate');

        if (netProfEl) netProfEl.textContent = formatVND(netProfit);
        if (marginEl) marginEl.textContent = margin.toFixed(1) + '%';
        if (burnRateEl) burnRateEl.textContent = burnRate.toFixed(1) + '%';

        const alertBox = _('#burn-rate-alert');
        if (burnRate > 80 && rev > 0) {
            alertBox?.classList.remove('hidden');
        } else {
            alertBox?.classList.add('hidden');
        }
    };

    // MODULE C: GOAL BRIDGING
    const calculateGoal = (finalBalanceModA) => {
        const target = getVal('modC-target');
        const deadline = getVal('modC-deadline');
        const rate = getVal('modA-rate') / 100 / 12;
        const months = deadline * 12;

        const gap = target - finalBalanceModA;
        const gapEl = _('#modC-gap');
        if (gapEl) {
            gapEl.textContent = gap > 0 ? formatVND(gap) : 'Đã đạt mục tiêu';
            gapEl.className = gap > 0 ? 'text-base font-black font-mono text-rose-500' : 'text-base font-black font-mono text-accent-theme';
        }

        let requiredMonthly = 0;
        if (gap > 0 && months > 0) {
            if (rate > 0) {
                requiredMonthly = (gap * rate) / (Math.pow(1 + rate, months) - 1);
            } else {
                requiredMonthly = gap / months;
            }
        }

        const reqEl = _('#modC-required');
        if (reqEl) reqEl.textContent = formatVND(requiredMonthly);
    };

    function calculateAll() {
        const modAFinal = calculateCompound();
        calculateCashFlow();
        calculateGoal(modAFinal);
        saveState();
    }

    const toggleBtn = _('#btn-toggle-schedule');
    const scheduleContainer = _('#schedule-container');

    toggleBtn?.addEventListener('click', () => {
        const isHidden = scheduleContainer.classList.contains('hidden');
        if (isHidden) {
            scheduleContainer.classList.remove('hidden');
            toggleBtn.innerHTML = 'Ẩn lộ trình chi tiết <i class="fas fa-chevron-up text-[10px] ml-1"></i>';
        } else {
            scheduleContainer.classList.add('hidden');
            toggleBtn.innerHTML = 'Xem lộ trình chi tiết <i class="fas fa-chevron-down text-[10px] ml-1"></i>';
        }
    });

    loadState();
    calculateAll();
}