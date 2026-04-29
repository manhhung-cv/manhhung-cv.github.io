import { UI } from '../../js/ui.js';

export function template() {
    return `
        <div class="space-y-6">
            <div class="flex justify-between items-end mb-2">
                <div>
                    <h2 class="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Tính Toán Khoản Vay</h2>
                    <p class="text-sm text-zinc-500 mt-1">Tính lãi suất, khoản trả hàng tháng và xem lịch trả nợ chi tiết.</p>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                <div class="lg:col-span-5 premium-card bg-white dark:bg-zinc-900 rounded-[28px] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col p-5 space-y-5 relative">
                    
                    <div class="flex p-1 bg-zinc-100/80 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200/50 dark:border-zinc-700/50">
                        <button class="lc-method-btn active flex-1 py-2 text-[13px] font-bold rounded-xl text-zinc-900 dark:text-white bg-white dark:bg-zinc-700 shadow-sm transition-all flex flex-col items-center gap-0.5" data-method="reducing">
                            <span>Dư nợ giảm dần</span>
                            <span class="text-[9px] font-medium opacity-50">Chuẩn Ngân hàng</span>
                        </button>
                        <button class="lc-method-btn flex-1 py-2 text-[13px] font-medium rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all flex flex-col items-center gap-0.5" data-method="flat">
                            <span>Dư nợ ban đầu</span>
                            <span class="text-[9px] font-medium opacity-50">Vay tiêu dùng</span>
                        </button>
                    </div>

                    <div class="space-y-1.5">
                        <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-1">Số tiền vay (VNĐ)</label>
                        <div class="relative flex items-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
                            <span class="text-zinc-400 font-bold">₫</span>
                            <input type="text" inputmode="decimal" id="lc-amount" class="w-full bg-transparent border-none py-3 outline-none text-base font-bold text-zinc-900 dark:text-white text-right placeholder-zinc-300 dark:placeholder-zinc-700" placeholder="100.000.000" value="100.000.000">
                        </div>
                    </div>

                    <div class="space-y-1.5">
                        <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-1">Thời hạn vay</label>
                        <div class="flex gap-2">
                            <div class="relative flex-1 flex items-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
                                <i class="far fa-calendar-alt text-zinc-400"></i>
                                <input type="number" inputmode="numeric" id="lc-term" class="w-full bg-transparent border-none py-3 outline-none text-base font-bold text-zinc-900 dark:text-white text-right" placeholder="12" value="12">
                            </div>
                            <div class="flex p-1 bg-zinc-100/80 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50 shrink-0 w-32">
                                <button class="lc-term-unit active flex-1 text-[11px] font-bold rounded-lg text-zinc-900 dark:text-white bg-white dark:bg-zinc-700 shadow-sm transition-all" data-unit="months">Tháng</button>
                                <button class="lc-term-unit flex-1 text-[11px] font-medium rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all" data-unit="years">Năm</button>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-1.5">
                        <label class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-1">Lãi suất</label>
                        <div class="flex gap-2">
                            <div class="relative flex-1 flex items-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
                                <i class="fas fa-percentage text-zinc-400"></i>
                                <input type="number" inputmode="decimal" id="lc-rate" class="w-full bg-transparent border-none py-3 outline-none text-base font-bold text-zinc-900 dark:text-white text-right" placeholder="8.5" value="8.5">
                            </div>
                            <div class="flex p-1 bg-zinc-100/80 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50 shrink-0 w-32">
                                <button class="lc-rate-unit active flex-1 text-[11px] font-bold rounded-lg text-zinc-900 dark:text-white bg-white dark:bg-zinc-700 shadow-sm transition-all" data-unit="year">%/Năm</button>
                                <button class="lc-rate-unit flex-1 text-[11px] font-medium rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all" data-unit="month">%/Tháng</button>
                            </div>
                        </div>
                    </div>

                    <button id="btn-lc-calc" class="w-full py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold text-[13px] transition-all hover:opacity-90 active:scale-95 shadow-sm mt-2 flex items-center justify-center gap-2">
                        <i class="fas fa-calculator"></i> TÍNH TOÁN KẾT QUẢ
                    </button>
                </div>

                <div class="lg:col-span-7 flex flex-col gap-5">
                    
                    <div class="premium-card bg-zinc-900 dark:bg-zinc-800 rounded-[28px] p-6 shadow-md relative overflow-hidden text-white border border-zinc-800 dark:border-zinc-700">
                        <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
                        
                        <div class="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <p class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1" id="res-hero-title">Số tiền trả tháng đầu</p>
                                <h3 class="text-3xl sm:text-4xl font-black tracking-tight flex items-baseline gap-2 text-blue-400">
                                    <span id="res-monthly-pay">0</span>
                                    <span class="text-sm font-medium text-zinc-400">VNĐ</span>
                                </h3>
                                <p class="text-xs text-zinc-400 mt-2 flex items-center gap-1.5" id="res-monthly-desc">
                                    Gốc <span id="res-monthly-principal" class="text-zinc-300 font-bold">0</span> + Lãi <span id="res-monthly-interest" class="text-zinc-300 font-bold">0</span>
                                </p>
                            </div>
                        </div>

                        <div class="relative z-10 mt-6 pt-5 border-t border-white/10">
                            <div class="flex justify-between items-end mb-2">
                                <div>
                                    <p class="text-[10px] text-zinc-400 uppercase tracking-wider mb-0.5">Tổng tiền gốc</p>
                                    <p class="text-sm font-bold text-white" id="res-total-principal">0 VNĐ</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-[10px] text-zinc-400 uppercase tracking-wider mb-0.5">Tổng tiền lãi</p>
                                    <p class="text-sm font-bold text-rose-400" id="res-total-interest">0 VNĐ</p>
                                </div>
                            </div>
                            <div class="w-full h-2 bg-zinc-800 rounded-full overflow-hidden flex">
                                <div id="res-bar-principal" class="bg-blue-500 h-full transition-all duration-700" style="width: 70%;"></div>
                                <div id="res-bar-interest" class="bg-rose-500 h-full transition-all duration-700" style="width: 30%;"></div>
                            </div>
                            <div class="mt-3 flex justify-between items-center">
                                <p class="text-[11px] text-zinc-400">Tổng phải trả (Gốc + Lãi):</p>
                                <p class="text-base font-black text-white" id="res-total-pay">0 VNĐ</p>
                            </div>
                        </div>
                    </div>

                    <div class="premium-card bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm overflow-hidden flex flex-col h-[400px]">
                        <div class="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/30">
                            <h3 class="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                <i class="fas fa-list-alt text-blue-500"></i> Lịch trả nợ chi tiết
                            </h3>
                        </div>
                        
                        <div class="flex-1 overflow-auto custom-scrollbar relative bg-zinc-50/30 dark:bg-zinc-900/30">
                            <table class="w-full text-left border-collapse">
                                <thead class="sticky top-0 bg-zinc-100 dark:bg-zinc-800 shadow-sm z-10">
                                    <tr>
                                        <th class="py-3 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Kỳ</th>
                                        <th class="py-3 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-right">Tiền gốc</th>
                                        <th class="py-3 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-right">Tiền lãi</th>
                                        <th class="py-3 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-right">Tổng trả</th>
                                        <th class="py-3 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-right hidden sm:table-cell">Dư nợ còn lại</th>
                                    </tr>
                                </thead>
                                <tbody id="res-schedule-tbody" class="text-[12px] md:text-[13px] font-mono font-medium text-zinc-700 dark:text-zinc-300 divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                    </tbody>
                            </table>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    `;
}

export function init() {
    // --- STATE ---
    let state = {
        method: 'reducing', // reducing, flat
        amount: 100000000,
        term: 12,
        termUnit: 'months', // months, years
        rate: 8.5,
        rateUnit: 'year' // year, month
    };

    // --- DOM Elements ---
    const inputAmount = document.getElementById('lc-amount');
    const inputTerm = document.getElementById('lc-term');
    const inputRate = document.getElementById('lc-rate');
    const btnCalc = document.getElementById('btn-lc-calc');
    
    const btnsMethod = document.querySelectorAll('.lc-method-btn');
    const btnsTermUnit = document.querySelectorAll('.lc-term-unit');
    const btnsRateUnit = document.querySelectorAll('.lc-rate-unit');

    const res = {
        heroTitle: document.getElementById('res-hero-title'),
        monthlyPay: document.getElementById('res-monthly-pay'),
        monthlyDesc: document.getElementById('res-monthly-desc'),
        monthlyPrincipal: document.getElementById('res-monthly-principal'),
        monthlyInterest: document.getElementById('res-monthly-interest'),
        
        totalPrincipal: document.getElementById('res-total-principal'),
        totalInterest: document.getElementById('res-total-interest'),
        totalPay: document.getElementById('res-total-pay'),
        
        barPrincipal: document.getElementById('res-bar-principal'),
        barInterest: document.getElementById('res-bar-interest'),
        
        tbody: document.getElementById('res-schedule-tbody')
    };

    // --- UTILS ---
    const formatCurrency = (num) => new Intl.NumberFormat('vi-VN').format(Math.round(num));
    
    const parseCurrency = (str) => {
        const parsed = parseInt(str.replace(/\./g, ''));
        return isNaN(parsed) ? 0 : parsed;
    };

    const formatInputCurrency = (el) => {
        let val = el.value.replace(/[^0-9]/g, '');
        if (val) {
            el.value = new Intl.NumberFormat('vi-VN').format(parseInt(val));
        } else {
            el.value = '';
        }
    };

    // --- UI TOGGLES LOGIC ---
    btnsMethod.forEach(btn => {
        btn.addEventListener('click', () => {
            btnsMethod.forEach(b => {
                b.classList.remove('active', 'text-zinc-900', 'dark:text-white', 'bg-white', 'dark:bg-zinc-700', 'shadow-sm');
                b.classList.add('text-zinc-500');
            });
            btn.classList.remove('text-zinc-500');
            btn.classList.add('active', 'text-zinc-900', 'dark:text-white', 'bg-white', 'dark:bg-zinc-700', 'shadow-sm');
            state.method = btn.dataset.method;
            calculateLoan();
        });
    });

    btnsTermUnit.forEach(btn => {
        btn.addEventListener('click', () => {
            btnsTermUnit.forEach(b => {
                b.classList.remove('active', 'text-zinc-900', 'dark:text-white', 'bg-white', 'dark:bg-zinc-700', 'shadow-sm');
                b.classList.add('text-zinc-500');
                b.classList.remove('font-bold'); b.classList.add('font-medium');
            });
            btn.classList.remove('text-zinc-500', 'font-medium');
            btn.classList.add('active', 'text-zinc-900', 'dark:text-white', 'bg-white', 'dark:bg-zinc-700', 'shadow-sm', 'font-bold');
            state.termUnit = btn.dataset.unit;
            calculateLoan();
        });
    });

    btnsRateUnit.forEach(btn => {
        btn.addEventListener('click', () => {
            btnsRateUnit.forEach(b => {
                b.classList.remove('active', 'text-zinc-900', 'dark:text-white', 'bg-white', 'dark:bg-zinc-700', 'shadow-sm');
                b.classList.add('text-zinc-500');
                b.classList.remove('font-bold'); b.classList.add('font-medium');
            });
            btn.classList.remove('text-zinc-500', 'font-medium');
            btn.classList.add('active', 'text-zinc-900', 'dark:text-white', 'bg-white', 'dark:bg-zinc-700', 'shadow-sm', 'font-bold');
            state.rateUnit = btn.dataset.unit;
            calculateLoan();
        });
    });

    inputAmount.addEventListener('input', (e) => {
        formatInputCurrency(e.target);
        state.amount = parseCurrency(e.target.value);
    });

    inputTerm.addEventListener('input', (e) => state.term = parseFloat(e.target.value) || 0);
    inputRate.addEventListener('input', (e) => state.rate = parseFloat(e.target.value) || 0);

    // --- CALCULATION LOGIC ---
    const calculateLoan = () => {
        // Prepare variables
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

            res.heroTitle.textContent = "Số tiền trả mỗi tháng (Cố định)";
            res.monthlyPay.textContent = formatCurrency(monthlyPayment);
            res.monthlyPrincipal.textContent = formatCurrency(monthlyPrincipal);
            res.monthlyInterest.textContent = formatCurrency(monthlyInterest);
            res.monthlyDesc.classList.remove('hidden');

            for (let i = 1; i <= totalMonths; i++) {
                remainingBalance -= monthlyPrincipal;
                if (remainingBalance < 0) remainingBalance = 0;
                
                scheduleHTML += `
                    <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td class="py-3 px-4">${i}</td>
                        <td class="py-3 px-4 text-right">${formatCurrency(monthlyPrincipal)}</td>
                        <td class="py-3 px-4 text-right text-rose-500 dark:text-rose-400">${formatCurrency(monthlyInterest)}</td>
                        <td class="py-3 px-4 text-right font-bold text-blue-600 dark:text-blue-400">${formatCurrency(monthlyPayment)}</td>
                        <td class="py-3 px-4 text-right hidden sm:table-cell">${formatCurrency(remainingBalance)}</td>
                    </tr>
                `;
            }
        } 
        // DƯ NỢ GIẢM DẦN (Gốc chia đều, Lãi giảm dần - Phổ biến ở VN)
        else {
            const monthlyPrincipal = P / totalMonths;
            const firstMonthInterest = P * monthlyRate;
            const firstMonthPayment = monthlyPrincipal + firstMonthInterest;

            res.heroTitle.textContent = "Số tiền trả tháng đầu (Giảm dần)";
            res.monthlyPay.textContent = formatCurrency(firstMonthPayment);
            res.monthlyPrincipal.textContent = formatCurrency(monthlyPrincipal);
            res.monthlyInterest.textContent = formatCurrency(firstMonthInterest);
            res.monthlyDesc.classList.remove('hidden');

            for (let i = 1; i <= totalMonths; i++) {
                const currentInterest = remainingBalance * monthlyRate;
                const currentPayment = monthlyPrincipal + currentInterest;
                
                totalInterest += currentInterest;
                remainingBalance -= monthlyPrincipal;
                if (remainingBalance < 0) remainingBalance = 0;

                scheduleHTML += `
                    <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td class="py-3 px-4">${i}</td>
                        <td class="py-3 px-4 text-right">${formatCurrency(monthlyPrincipal)}</td>
                        <td class="py-3 px-4 text-right text-rose-500 dark:text-rose-400">${formatCurrency(currentInterest)}</td>
                        <td class="py-3 px-4 text-right font-bold text-blue-600 dark:text-blue-400">${formatCurrency(currentPayment)}</td>
                        <td class="py-3 px-4 text-right hidden sm:table-cell">${formatCurrency(remainingBalance)}</td>
                    </tr>
                `;
            }
        }

        // Cập nhật Tổng kết
        const totalPayment = P + totalInterest;
        res.totalPrincipal.textContent = formatCurrency(P) + ' VNĐ';
        res.totalInterest.textContent = formatCurrency(totalInterest) + ' VNĐ';
        res.totalPay.textContent = formatCurrency(totalPayment) + ' VNĐ';

        // Cập nhật Thanh Tỉ lệ
        const pctPrincipal = (P / totalPayment) * 100;
        const pctInterest = (totalInterest / totalPayment) * 100;
        res.barPrincipal.style.width = `${pctPrincipal}%`;
        res.barInterest.style.width = `${pctInterest}%`;

        // Render Bảng
        res.tbody.innerHTML = scheduleHTML;
    };

    // --- EVENTS ---
    btnCalc.addEventListener('click', () => {
        calculateLoan();
        UI.showAlert('Hoàn tất', 'Kết quả đã được cập nhật.', 'success');
        if (window.innerWidth <= 1024) {
            document.querySelector('.lg\\:col-span-7').scrollIntoView({ behavior: 'smooth' });
        }
    });

    // Run on init
    calculateLoan();
}