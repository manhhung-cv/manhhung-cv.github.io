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
    <div id="loan-calc-root" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #loan-calc-root {
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
            <div class="px-1 space-y-1 select-none">
                <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                    <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Loan Engine</span>
                </div>
                <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Tính Toán Khoản Vay</h1>
                <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Dự phóng hạn mức trả gốc lãi, so sánh dư nợ giảm dần và dư nợ ban đầu kèm bảng lịch trả chi tiết.</p>
            </div>

            <!-- WORKSPACE GRID -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                <!-- CỘT TRÁI: THAM SỐ VAY (5 COLS) -->
                <div class="lg:col-span-5 rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-4 sm:p-5 shadow-sm space-y-4">
                    
                    <!-- PHƯƠNG PHÁP TÍNH LÃI: SEGMENTED TABS TƯƠNG PHẢN CAO -->
                    <div class="space-y-1 select-none">
                        <span class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block pl-0.5">Phương thức tính lãi</span>
                        <div class="grid grid-cols-2 gap-1 p-1 rounded-[14px] bg-black/[0.05] dark:bg-black/50 border border-black/[0.04] dark:border-white/[0.08]" id="lc-method-tabs">
                            <button type="button" class="lc-method-btn active py-2 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex flex-col items-center gap-0.5" data-method="reducing">
                                <span>Dư nợ giảm dần</span>
                                <span class="text-[9px] font-mono opacity-60">Chuẩn Ngân hàng</span>
                            </button>
                            <button type="button" class="lc-method-btn py-2 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex flex-col items-center gap-0.5" data-method="flat">
                                <span>Dư nợ ban đầu</span>
                                <span class="text-[9px] font-mono opacity-60">Vay tiêu dùng</span>
                            </button>
                        </div>
                    </div>

                    <!-- SỐ TIỀN VAY -->
                    <div class="space-y-1">
                        <label for="lc-amount" class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block select-none pl-0.5">Số tiền vay (VNĐ)</label>
                        <div class="flex items-center bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] px-3.5 py-1.5 focus-within:border-accent-theme transition-all cursor-text" onclick="document.getElementById('lc-amount')?.focus()">
                            <span class="text-zinc-400 font-bold font-mono text-sm mr-2 select-none">₫</span>
                            <input type="text" inputmode="decimal" id="lc-amount" 
                                class="w-full bg-transparent border-none outline-none text-base font-black font-mono text-zinc-900 dark:text-white text-right placeholder-zinc-400 select-text cursor-text pointer-events-auto" 
                                placeholder="100.000.000" value="100.000.000">
                        </div>
                    </div>

                    <!-- THỜI HẠN VAY -->
                    <div class="space-y-1">
                        <label for="lc-term" class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block select-none pl-0.5">Thời hạn vay</label>
                        <div class="flex gap-2">
                            <div class="flex-1 flex items-center bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] px-3.5 py-1.5 focus-within:border-accent-theme transition-all cursor-text" onclick="document.getElementById('lc-term')?.focus()">
                                <i class="far fa-calendar-days text-zinc-400 text-xs mr-2 select-none"></i>
                                <input type="number" inputmode="numeric" id="lc-term" 
                                    class="w-full bg-transparent border-none outline-none text-base font-black font-mono text-zinc-900 dark:text-white text-right select-text cursor-text pointer-events-auto" 
                                    placeholder="12" value="12">
                            </div>

                            <!-- ĐƠN VỊ THỜI HẠN: SEGMENTED TABS -->
                            <div class="grid grid-cols-2 gap-1 p-1 rounded-[14px] bg-black/[0.05] dark:bg-black/50 border border-black/[0.04] dark:border-white/[0.08] shrink-0 w-28 select-none" id="lc-term-unit-tabs">
                                <button type="button" class="lc-term-unit active py-1 rounded-[10px] text-[11px] font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all text-center" data-unit="months">Tháng</button>
                                <button type="button" class="lc-term-unit py-1 rounded-[10px] text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all text-center" data-unit="years">Năm</button>
                            </div>
                        </div>
                    </div>

                    <!-- LÃI SUẤT -->
                    <div class="space-y-1">
                        <label for="lc-rate" class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block select-none pl-0.5">Lãi suất</label>
                        <div class="flex gap-2">
                            <div class="flex-1 flex items-center bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[16px] px-3.5 py-1.5 focus-within:border-accent-theme transition-all cursor-text" onclick="document.getElementById('lc-rate')?.focus()">
                                <i class="fas fa-percent text-zinc-400 text-xs mr-2 select-none"></i>
                                <input type="number" inputmode="decimal" id="lc-rate" step="0.1" 
                                    class="w-full bg-transparent border-none outline-none text-base font-black font-mono text-zinc-900 dark:text-white text-right select-text cursor-text pointer-events-auto" 
                                    placeholder="8.5" value="8.5">
                            </div>

                            <!-- ĐƠN VỊ LÃI SUẤT: SEGMENTED TABS -->
                            <div class="grid grid-cols-2 gap-1 p-1 rounded-[14px] bg-black/[0.05] dark:bg-black/50 border border-black/[0.04] dark:border-white/[0.08] shrink-0 w-32 select-none" id="lc-rate-unit-tabs">
                                <button type="button" class="lc-rate-unit active py-1 rounded-[10px] text-[11px] font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all text-center" data-unit="year">%/Năm</button>
                                <button type="button" class="lc-rate-unit py-1 rounded-[10px] text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all text-center" data-unit="month">%/Tháng</button>
                            </div>
                        </div>
                    </div>

                    <!-- ACTION BUTTON -->
                    <button type="button" id="btn-lc-calc" class="w-full h-11 bg-accent-theme text-white rounded-[14px] font-bold text-xs tracking-wide uppercase flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm select-none">
                        <i class="fas fa-calculator text-xs"></i> Tính toán kết quả
                    </button>
                </div>

                <!-- CỘT PHẢI: KẾT QUẢ TỔNG QUAN & BẢNG LỊCH TRẢ (7 COLS) -->
                <div id="lc-results-col" class="lg:col-span-7 flex flex-col gap-4">
                    
                    <!-- HERO SUMMARY CARD -->
                    <div class="rounded-[24px] p-5 sm:p-6 bg-gradient-to-br from-zinc-900 to-zinc-950 dark:from-[#121214] dark:to-black text-white border border-white/5 shadow-sm relative overflow-hidden space-y-5 select-none">
                        <div class="absolute top-0 right-0 w-64 h-64 bg-accent-theme-alpha rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4"></div>

                        <div class="relative z-10 space-y-1">
                            <span class="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block" id="res-hero-title">Số tiền trả tháng đầu</span>
                            <div class="text-3xl sm:text-4xl font-black font-mono tracking-tight flex items-baseline gap-2">
                                <span id="res-monthly-pay" class="text-accent-theme">0</span>
                                <span class="text-sm font-medium text-zinc-400 font-sans">VNĐ</span>
                            </div>
                            <p class="text-[11px] text-zinc-400 font-mono pt-0.5 flex items-center gap-2" id="res-monthly-desc">
                                Gốc: <span id="res-monthly-principal" class="text-zinc-200 font-bold">0</span> • Lãi: <span id="res-monthly-interest" class="text-rose-400 font-bold">0</span>
                            </p>
                        </div>

                        <!-- THANH TỶ LỆ GỐC / LÃI -->
                        <div class="relative z-10 pt-4 border-t border-white/10 space-y-2.5">
                            <div class="flex justify-between items-end text-xs">
                                <div class="space-y-0.5">
                                    <span class="text-[9px] font-mono uppercase text-zinc-400 block">Tổng tiền gốc</span>
                                    <span class="font-mono font-bold text-white" id="res-total-principal">0 VNĐ</span>
                                </div>
                                <div class="space-y-0.5 text-right">
                                    <span class="text-[9px] font-mono uppercase text-zinc-400 block">Tổng tiền lãi</span>
                                    <span class="font-mono font-bold text-rose-400" id="res-total-interest">0 VNĐ</span>
                                </div>
                            </div>

                            <div class="w-full h-2 bg-white/10 rounded-full overflow-hidden flex">
                                <div id="res-bar-principal" class="bg-accent-theme h-full transition-all duration-500" style="width: 70%;"></div>
                                <div id="res-bar-interest" class="bg-rose-500 h-full transition-all duration-500" style="width: 30%;"></div>
                            </div>

                            <div class="flex justify-between items-center pt-1 text-xs">
                                <span class="text-zinc-400">Tổng phải trả (Gốc + Lãi):</span>
                                <span class="font-black font-mono text-white text-sm sm:text-base" id="res-total-pay">0 VNĐ</span>
                            </div>
                        </div>
                    </div>

                    <!-- BẢNG LỊCH TRẢ NỢ CHI TIẾT -->
                    <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm overflow-hidden flex flex-col h-[400px]">
                        <div class="px-4 py-3 border-b border-black/[0.05] dark:border-white/[0.08] flex justify-between items-center bg-white dark:bg-[#161618] select-none">
                            <h3 class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                                <i class="fas fa-table-list text-accent-theme"></i> Lịch trả nợ chi tiết
                            </h3>
                            <span class="text-[9px] font-mono text-zinc-400">Amortization Table</span>
                        </div>
                        
                        <div class="flex-1 overflow-auto no-scrollbar relative bg-[#f2f2f7]/30 dark:bg-black/20">
                            <table class="w-full text-left border-collapse text-xs">
                                <thead class="sticky top-0 bg-white dark:bg-[#161618] border-b border-black/[0.05] dark:border-white/[0.08] shadow-sm z-10 select-none">
                                    <tr>
                                        <th class="py-2.5 px-3.5 text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Kỳ</th>
                                        <th class="py-2.5 px-3.5 text-[9px] font-bold text-zinc-400 uppercase tracking-wider text-right">Tiền gốc</th>
                                        <th class="py-2.5 px-3.5 text-[9px] font-bold text-zinc-400 uppercase tracking-wider text-right">Tiền lãi</th>
                                        <th class="py-2.5 px-3.5 text-[9px] font-bold text-zinc-400 uppercase tracking-wider text-right">Tổng trả</th>
                                        <th class="py-2.5 px-3.5 text-[9px] font-bold text-zinc-400 uppercase tracking-wider text-right hidden sm:table-cell">Dư nợ còn lại</th>
                                    </tr>
                                </thead>
                                <tbody id="res-schedule-tbody" class="font-mono text-zinc-800 dark:text-zinc-200 divide-y divide-black/[0.04] dark:divide-white/[0.06]"></tbody>
                            </table>
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
    if (!hostElement) return;

    const rootContainer = hostElement.querySelector('#loan-calc-root') || hostElement;

    // Khởi tạo ThemeKit
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    let state = {
        method: 'reducing',
        amount: 100000000,
        term: 12,
        termUnit: 'months',
        rate: 8.5,
        rateUnit: 'year'
    };

    const _ = sel => hostElement.querySelector(sel);
    const $$ = sel => hostElement.querySelectorAll(sel);

    const inputAmount = _('#lc-amount');
    const inputTerm = _('#lc-term');
    const inputRate = _('#lc-rate');
    const btnCalc = _('#btn-lc-calc');
    
    const btnsMethod = $$('.lc-method-btn');
    const btnsTermUnit = $$('.lc-term-unit');
    const btnsRateUnit = $$('.lc-rate-unit');

    const res = {
        heroTitle: _('#res-hero-title'),
        monthlyPay: _('#res-monthly-pay'),
        monthlyDesc: _('#res-monthly-desc'),
        monthlyPrincipal: _('#res-monthly-principal'),
        monthlyInterest: _('#res-monthly-interest'),
        
        totalPrincipal: _('#res-total-principal'),
        totalInterest: _('#res-total-interest'),
        totalPay: _('#res-total-pay'),
        
        barPrincipal: _('#res-bar-principal'),
        barInterest: _('#res-bar-interest'),
        
        tbody: _('#res-schedule-tbody')
    };

    const formatCurrency = (num) => new Intl.NumberFormat('vi-VN').format(Math.round(num || 0));
    
    const parseCurrency = (str) => {
        const parsed = parseInt((str || '').replace(/\D/g, ''), 10);
        return isNaN(parsed) ? 0 : parsed;
    };

    const formatInputCurrency = (el) => {
        let val = el.value.replace(/\D/g, '');
        if (val) {
            el.value = new Intl.NumberFormat('vi-VN').format(parseInt(val, 10));
        } else {
            el.value = '';
        }
    };

    // Segmented Tabs Styling Classes
    const activeMethodClass = 'lc-method-btn active py-2 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex flex-col items-center gap-0.5';
    const inactiveMethodClass = 'lc-method-btn py-2 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex flex-col items-center gap-0.5';

    const activePillClass = 'py-1 rounded-[10px] text-[11px] font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all text-center';
    const inactivePillClass = 'py-1 rounded-[10px] text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all text-center';

    btnsMethod.forEach(btn => {
        btn.addEventListener('click', () => {
            btnsMethod.forEach(b => b.className = inactiveMethodClass);
            btn.className = activeMethodClass;
            state.method = btn.dataset.method;
            calculateLoan();
        });
    });

    btnsTermUnit.forEach(btn => {
        btn.addEventListener('click', () => {
            btnsTermUnit.forEach(b => b.className = `lc-term-unit ${inactivePillClass}`);
            btn.className = `lc-term-unit active ${activePillClass}`;
            state.termUnit = btn.dataset.unit;
            calculateLoan();
        });
    });

    btnsRateUnit.forEach(btn => {
        btn.addEventListener('click', () => {
            btnsRateUnit.forEach(b => b.className = `lc-rate-unit ${inactivePillClass}`);
            btn.className = `lc-rate-unit active ${activePillClass}`;
            state.rateUnit = btn.dataset.unit;
            calculateLoan();
        });
    });

    inputAmount?.addEventListener('input', (e) => {
        formatInputCurrency(e.target);
        state.amount = parseCurrency(e.target.value);
        calculateLoan();
    });

    inputTerm?.addEventListener('input', (e) => {
        state.term = parseFloat(e.target.value) || 0;
        calculateLoan();
    });

    inputRate?.addEventListener('input', (e) => {
        state.rate = parseFloat(e.target.value) || 0;
        calculateLoan();
    });

    const calculateLoan = () => {
        const P = state.amount;
        if (P <= 0 || state.term <= 0 || state.rate <= 0) return;

        const totalMonths = state.termUnit === 'years' ? state.term * 12 : state.term;
        const monthlyRate = state.rateUnit === 'year' ? (state.rate / 100) / 12 : (state.rate / 100);

        let totalInterest = 0;
        let scheduleHTML = '';
        let remainingBalance = P;

        // DƯ NỢ BAN ĐẦU (FLAT)
        if (state.method === 'flat') {
            const monthlyPrincipal = P / totalMonths;
            const monthlyInterest = P * monthlyRate;
            const monthlyPayment = monthlyPrincipal + monthlyInterest;
            totalInterest = monthlyInterest * totalMonths;

            if (res.heroTitle) res.heroTitle.textContent = "Số tiền trả mỗi tháng (Cố định)";
            if (res.monthlyPay) res.monthlyPay.textContent = formatCurrency(monthlyPayment);
            if (res.monthlyPrincipal) res.monthlyPrincipal.textContent = formatCurrency(monthlyPrincipal);
            if (res.monthlyInterest) res.monthlyInterest.textContent = formatCurrency(monthlyInterest);

            for (let i = 1; i <= totalMonths; i++) {
                remainingBalance -= monthlyPrincipal;
                if (remainingBalance < 0) remainingBalance = 0;
                
                scheduleHTML += `
                    <tr class="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                        <td class="py-2.5 px-3.5">${i}</td>
                        <td class="py-2.5 px-3.5 text-right">${formatCurrency(monthlyPrincipal)}</td>
                        <td class="py-2.5 px-3.5 text-right text-rose-500 font-semibold">${formatCurrency(monthlyInterest)}</td>
                        <td class="py-2.5 px-3.5 text-right font-bold text-accent-theme">${formatCurrency(monthlyPayment)}</td>
                        <td class="py-2.5 px-3.5 text-right hidden sm:table-cell text-zinc-500">${formatCurrency(remainingBalance)}</td>
                    </tr>
                `;
            }
        } 
        // DƯ NỢ GIẢM DẦN
        else {
            const monthlyPrincipal = P / totalMonths;
            const firstMonthInterest = P * monthlyRate;
            const firstMonthPayment = monthlyPrincipal + firstMonthInterest;

            if (res.heroTitle) res.heroTitle.textContent = "Số tiền trả tháng đầu (Giảm dần)";
            if (res.monthlyPay) res.monthlyPay.textContent = formatCurrency(firstMonthPayment);
            if (res.monthlyPrincipal) res.monthlyPrincipal.textContent = formatCurrency(monthlyPrincipal);
            if (res.monthlyInterest) res.monthlyInterest.textContent = formatCurrency(firstMonthInterest);

            for (let i = 1; i <= totalMonths; i++) {
                const currentInterest = remainingBalance * monthlyRate;
                const currentPayment = monthlyPrincipal + currentInterest;
                
                totalInterest += currentInterest;
                remainingBalance -= monthlyPrincipal;
                if (remainingBalance < 0) remainingBalance = 0;

                scheduleHTML += `
                    <tr class="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                        <td class="py-2.5 px-3.5">${i}</td>
                        <td class="py-2.5 px-3.5 text-right">${formatCurrency(monthlyPrincipal)}</td>
                        <td class="py-2.5 px-3.5 text-right text-rose-500 font-semibold">${formatCurrency(currentInterest)}</td>
                        <td class="py-2.5 px-3.5 text-right font-bold text-accent-theme">${formatCurrency(currentPayment)}</td>
                        <td class="py-2.5 px-3.5 text-right hidden sm:table-cell text-zinc-500">${formatCurrency(remainingBalance)}</td>
                    </tr>
                `;
            }
        }

        const totalPayment = P + totalInterest;
        if (res.totalPrincipal) res.totalPrincipal.textContent = formatCurrency(P) + ' VNĐ';
        if (res.totalInterest) res.totalInterest.textContent = formatCurrency(totalInterest) + ' VNĐ';
        if (res.totalPay) res.totalPay.textContent = formatCurrency(totalPayment) + ' VNĐ';

        const pctPrincipal = totalPayment > 0 ? (P / totalPayment) * 100 : 70;
        const pctInterest = totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 30;
        if (res.barPrincipal) res.barPrincipal.style.width = `${pctPrincipal}%`;
        if (res.barInterest) res.barInterest.style.width = `${pctInterest}%`;

        if (res.tbody) res.tbody.innerHTML = scheduleHTML;
    };

    btnCalc?.addEventListener('click', () => {
        calculateLoan();
        IslandKit.notify('Hoàn tất', 'Kết quả khoản vay đã được cập nhật.', 'success');
        const resultsCol = _('#lc-results-col');
        if (window.innerWidth <= 1024 && resultsCol) {
            resultsCol.scrollIntoView({ behavior: 'smooth' });
        }
    });

    calculateLoan();
}