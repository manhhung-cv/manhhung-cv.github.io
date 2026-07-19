import { UI } from '../../js/ui.js';

export function template() {
    return `
        <div class="relative flex flex-col w-full max-w-[1200px] mx-auto min-h-[600px] pb-10 gap-6">
            
            <div class="mb-2 px-2 ui-fade-in">
                <h2 class="text-[28px] font-black text-zinc-900 dark:text-white tracking-tight leading-none mb-2">Financial Workspace</h2>
                <p class="text-[13px] text-zinc-500 font-medium">Hệ thống tính toán lãi kép, dòng tiền kinh doanh và hoạch định mục tiêu.</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start ui-fade-in" style="animation-delay: 100ms;">
                
                <!-- Cột trái: Lãi kép & Mục tiêu -->
                <div class="space-y-6">
                    
                    <!-- MODULE A: LÃI SUẤT KÉP -->
                    <div class="ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6">
                        <h3 class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4">A. Compound Growth Engine</h3>
                        
                        <div class="space-y-4 mb-6">
                            <div class="grid grid-cols-2 gap-3">
                                <div class="bg-zinc-50 dark:bg-[#121214]/50 rounded-2xl p-4 focus-within:ring-2 ring-zinc-900 dark:ring-white transition-all">
                                    <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Vốn gốc hiện có (VNĐ)</label>
                                    <input type="text" inputmode="numeric" id="modA-initial" class="currency-input w-full bg-transparent border-none outline-none text-sm font-bold text-zinc-900 dark:text-white p-0" placeholder="0" value="0">
                                </div>
                                <div class="bg-zinc-50 dark:bg-[#121214]/50 rounded-2xl p-4 focus-within:ring-2 ring-zinc-900 dark:ring-white transition-all">
                                    <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Góp hằng tháng (VNĐ)</label>
                                    <input type="text" inputmode="numeric" id="modA-monthly" class="currency-input w-full bg-transparent border-none outline-none text-sm font-bold text-zinc-900 dark:text-white p-0" placeholder="0" value="10.000.000">
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div class="bg-zinc-50 dark:bg-[#121214]/50 rounded-2xl p-4 focus-within:ring-2 ring-zinc-900 dark:ring-white transition-all">
                                    <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Lãi suất năm (%)</label>
                                    <input type="number" id="modA-rate" class="standard-number w-full bg-transparent border-none outline-none text-sm font-bold text-zinc-900 dark:text-white p-0" placeholder="0" value="8" step="0.1">
                                </div>
                                <div class="bg-zinc-50 dark:bg-[#121214]/50 rounded-2xl p-4 focus-within:ring-2 ring-zinc-900 dark:ring-white transition-all">
                                    <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Số năm đầu tư</label>
                                    <input type="number" id="modA-years" class="standard-number w-full bg-transparent border-none outline-none text-sm font-bold text-zinc-900 dark:text-white p-0" placeholder="0" value="4">
                                </div>
                            </div>
                        </div>

                        <div class="p-5 bg-zinc-900 dark:bg-zinc-800 rounded-2xl mb-4 text-white">
                            <div class="flex justify-between items-end mb-2">
                                <span class="text-xs text-zinc-400 font-medium">Tổng tài sản cuối kỳ:</span>
                                <span class="text-2xl font-black tracking-tight" id="modA-final-balance">0 ₫</span>
                            </div>
                            <div class="flex justify-between items-end">
                                <span class="text-xs text-zinc-400 font-medium">Tổng lãi thu được:</span>
                                <span class="text-sm font-bold text-emerald-400" id="modA-total-profit">+0 ₫</span>
                            </div>
                        </div>

                        <button id="btn-toggle-schedule" class="btn-premium w-full py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold text-sm flex items-center justify-center gap-2 mb-4">
                            Xem lộ trình chi tiết <i class="fas fa-chevron-down text-xs"></i>
                        </button>

                        <div id="schedule-container" class="hidden w-full overflow-x-auto custom-scrollbar border border-zinc-200 dark:border-zinc-800 rounded-2xl max-h-[250px]">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="bg-zinc-50 dark:bg-zinc-800/50 sticky top-0">
                                        <th class="p-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Năm</th>
                                        <th class="p-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Tiền vốn</th>
                                        <th class="p-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Tiền lãi</th>
                                        <th class="p-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Tổng cộng</th>
                                    </tr>
                                </thead>
                                <tbody id="modA-schedule-body" class="text-sm font-medium text-zinc-700 dark:text-zinc-300 divide-y divide-zinc-200 dark:divide-zinc-800">
                                    <!-- Render via JS -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- MODULE C: GOAL BRIDGING -->
                    <div class="ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6">
                        <h3 class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4">C. Goal Bridging</h3>
                        
                        <div class="grid grid-cols-2 gap-3 mb-6">
                            <div class="bg-zinc-50 dark:bg-[#121214]/50 rounded-2xl p-4 focus-within:ring-2 ring-zinc-900 dark:ring-white transition-all">
                                <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Mục tiêu (VNĐ)</label>
                                <input type="text" inputmode="numeric" id="modC-target" class="currency-input w-full bg-transparent border-none outline-none text-sm font-bold text-zinc-900 dark:text-white p-0" value="5.000.000.000">
                            </div>
                            <div class="bg-zinc-50 dark:bg-[#121214]/50 rounded-2xl p-4 focus-within:ring-2 ring-zinc-900 dark:ring-white transition-all">
                                <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Thời hạn (Năm)</label>
                                <input type="number" id="modC-deadline" class="standard-number w-full bg-transparent border-none outline-none text-sm font-bold text-zinc-900 dark:text-white p-0" value="4">
                            </div>
                        </div>

                        <div class="space-y-4">
                            <div class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                                <span class="text-xs font-bold text-zinc-500 uppercase tracking-widest">Cần tiết kiệm / tháng:</span>
                                <span class="text-lg font-black text-zinc-900 dark:text-white" id="modC-required">0 ₫</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-xs font-bold text-zinc-500 uppercase tracking-widest">Khoảng cách hiện tại:</span>
                                <span class="text-lg font-black text-red-500" id="modC-gap">0 ₫</span>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- Cột phải: Dòng tiền doanh nghiệp -->
                <div class="space-y-6">
                    
                    <!-- MODULE B: BUSINESS CASH FLOW -->
                    <div class="ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6">
                        <h3 class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4">B. Business Cash Flow (Salon)</h3>
                        
                        <div class="space-y-4 mb-6">
                            <div class="bg-zinc-50 dark:bg-[#121214]/50 rounded-2xl p-4 focus-within:ring-2 ring-zinc-900 dark:ring-white transition-all flex items-center gap-3">
                                <i class="fas fa-wallet text-zinc-400"></i>
                                <div class="flex-1">
                                    <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Tổng thu nhập / Tháng (VNĐ)</label>
                                    <input type="text" inputmode="numeric" id="modB-revenue" class="currency-input w-full bg-transparent border-none outline-none text-sm font-bold text-zinc-900 dark:text-white p-0" placeholder="0">
                                </div>
                            </div>
                            
                            <div class="flex items-center gap-3">
                                <div class="bg-zinc-50 dark:bg-[#121214]/50 rounded-2xl p-4 focus-within:ring-2 ring-zinc-900 dark:ring-white transition-all flex-1">
                                    <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Chi phí cố định</label>
                                    <input type="text" inputmode="numeric" id="modB-fixed" class="currency-input w-full bg-transparent border-none outline-none text-sm font-bold text-zinc-900 dark:text-white p-0" placeholder="0">
                                </div>
                                <div class="bg-zinc-50 dark:bg-[#121214]/50 rounded-2xl p-4 focus-within:ring-2 ring-zinc-900 dark:ring-white transition-all flex-1">
                                    <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Chi phí biến đổi</label>
                                    <input type="text" inputmode="numeric" id="modB-variable" class="currency-input w-full bg-transparent border-none outline-none text-sm font-bold text-zinc-900 dark:text-white p-0" placeholder="0">
                                </div>
                            </div>
                        </div>

                        <!-- Cảnh báo Burn Rate -->
                        <div id="burn-rate-alert" class="hidden mb-6 flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400">
                            <i class="fas fa-exclamation-triangle mt-0.5"></i>
                            <div>
                                <span class="text-[11px] font-bold uppercase tracking-wider block mb-1">Cảnh báo rủi ro</span>
                                <span class="text-xs font-medium">Tỷ lệ Burn Rate đang vượt quá 80%. Doanh nghiệp đang vận hành với biên độ an toàn thấp.</span>
                            </div>
                        </div>

                        <div class="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
                            <div class="p-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30">
                                <span class="text-xs font-bold text-zinc-600 dark:text-zinc-400">Lợi nhuận ròng (Net Profit)</span>
                                <span class="text-xl font-black text-emerald-600 dark:text-emerald-400" id="modB-net-profit">0 ₫</span>
                            </div>
                            <div class="grid grid-cols-2 divide-x divide-zinc-200 dark:divide-zinc-800">
                                <div class="p-4 text-center">
                                    <span class="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Biên lợi nhuận</span>
                                    <span class="text-base font-bold text-zinc-900 dark:text-white" id="modB-margin">0%</span>
                                </div>
                                <div class="p-4 text-center">
                                    <span class="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Burn Rate</span>
                                    <span class="text-base font-bold text-zinc-900 dark:text-white" id="modB-burn-rate">0%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    `;
}

export function init() {
    // --- UTILS ---
    const formatVND = (num) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
    
    // Hàm format số khi hiển thị trên input
    const formatDisplayNumber = (num) => {
        if (!num && num !== 0) return '';
        return new Intl.NumberFormat('vi-VN').format(num);
    };

    // Tách riêng hàm getVal để loại bỏ dấu chấm khi tính toán
    const getVal = (id) => {
        const el = document.getElementById(id);
        if (!el) return 0;
        
        // Nếu là input tiền tệ, loại bỏ dấu chấm (.) trước khi parse
        if (el.classList.contains('currency-input')) {
            const rawValue = el.value.replace(/\./g, '');
            return parseFloat(rawValue) || 0;
        }
        
        // Các trường mặc định (như lãi suất, số năm)
        return parseFloat(el.value) || 0;
    };
    
    const saveState = () => {
        const state = {
            initial: getVal('modA-initial'), monthly: getVal('modA-monthly'), rate: getVal('modA-rate'), years: getVal('modA-years'),
            revenue: getVal('modB-revenue'), fixed: getVal('modB-fixed'), variable: getVal('modB-variable'),
            target: getVal('modC-target'), deadline: getVal('modC-deadline')
        };
        localStorage.setItem('financial_tools_state', JSON.stringify(state));
    };

    const loadState = () => {
        const data = JSON.parse(localStorage.getItem('financial_tools_state'));
        if (!data) return;
        
        const map = {
            'modA-initial': data.initial, 'modA-monthly': data.monthly, 'modA-rate': data.rate, 'modA-years': data.years,
            'modB-revenue': data.revenue, 'modB-fixed': data.fixed, 'modB-variable': data.variable,
            'modC-target': data.target, 'modC-deadline': data.deadline
        };
        
        for (const [id, val] of Object.entries(map)) {
            const el = document.getElementById(id);
            if (el && val !== undefined) {
                // Áp dụng định dạng hiển thị lại nếu là trường tiền tệ
                if (el.classList.contains('currency-input')) {
                    el.value = formatDisplayNumber(val);
                } else {
                    el.value = val;
                }
            }
        }
    };

    // --- XỬ LÝ SỰ KIỆN AUTO-FORMAT KHI GÕ NHẬP LIỆU ---
    const currencyInputs = document.querySelectorAll('.currency-input');
    currencyInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let cursorPosition = this.selectionStart;
            let oldLength = this.value.length;
            
            // Fix regex pattern from replace(/\\D/g, '') to replace(/\D/g, '')
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

    // Bắt sự kiện cho các input thông thường
    document.querySelectorAll('.standard-number').forEach(input => {
        input.addEventListener('input', calculateAll);
    });

    // --- MODULE A: COMPOUND GROWTH ---
    const calculateCompound = () => {
        const initial = getVal('modA-initial');
        const monthly = getVal('modA-monthly');
        const rate = getVal('modA-rate') / 100;
        const years = getVal('modA-years');
        const tbody = document.getElementById('modA-schedule-body');
        
        let currentBalance = initial;
        let totalInvested = initial;
        tbody.innerHTML = '';

        for (let year = 1; year <= years; year++) {
            for (let month = 1; month <= 12; month++) {
                currentBalance = currentBalance * (1 + rate / 12) + monthly;
                totalInvested += monthly;
            }
            const totalInterest = currentBalance - totalInvested;
            tbody.innerHTML += `
                <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td class="p-3 text-center">${year}</td>
                    <td class="p-3 text-right">${formatVND(totalInvested)}</td>
                    <td class="p-3 text-right text-emerald-500">${formatVND(totalInterest)}</td>
                    <td class="p-3 text-right font-bold text-zinc-900 dark:text-white">${formatVND(currentBalance)}</td>
                </tr>
            `;
        }

        const totalProfit = currentBalance - totalInvested;
        document.getElementById('modA-final-balance').innerText = formatVND(currentBalance);
        document.getElementById('modA-total-profit').innerText = '+' + formatVND(totalProfit);
        
        return currentBalance;
    };

    // --- MODULE B: SALON CASH FLOW ---
    const calculateCashFlow = () => {
        const rev = getVal('modB-revenue');
        const fixed = getVal('modB-fixed');
        const variable = getVal('modB-variable');

        const totalCosts = fixed + variable;
        const netProfit = rev - totalCosts;
        
        const margin = rev > 0 ? (netProfit / rev) * 100 : 0;
        const burnRate = rev > 0 ? (totalCosts / rev) * 100 : 0;

        document.getElementById('modB-net-profit').innerText = formatVND(netProfit);
        document.getElementById('modB-margin').innerText = margin.toFixed(2) + '%';
        document.getElementById('modB-burn-rate').innerText = burnRate.toFixed(2) + '%';

        const alertBox = document.getElementById('burn-rate-alert');
        if (burnRate > 80 && rev > 0) {
            alertBox.classList.remove('hidden');
        } else {
            alertBox.classList.add('hidden');
        }
    };

    // --- MODULE C: GOAL BRIDGING ---
    const calculateGoal = (finalBalanceModA) => {
        const target = getVal('modC-target');
        const deadline = getVal('modC-deadline');
        const rate = getVal('modA-rate') / 100 / 12; 
        const months = deadline * 12;

        const gap = target - finalBalanceModA;
        document.getElementById('modC-gap').innerText = gap > 0 ? formatVND(gap) : 'Đã đạt mục tiêu';
        document.getElementById('modC-gap').className = gap > 0 ? 'text-lg font-black text-red-500' : 'text-lg font-black text-emerald-500';

        let requiredMonthly = 0;
        if (gap > 0 && months > 0) {
            if (rate > 0) {
                requiredMonthly = (gap * rate) / (Math.pow(1 + rate, months) - 1);
            } else {
                requiredMonthly = gap / months;
            }
        }
        
        document.getElementById('modC-required').innerText = formatVND(requiredMonthly);
    };

    // --- TRÌNH ĐIỀU KHIỂN ---
    function calculateAll() {
        const modAFinal = calculateCompound();
        calculateCashFlow();
        calculateGoal(modAFinal);
        saveState();
    }

    const toggleBtn = document.getElementById('btn-toggle-schedule');
    const scheduleContainer = document.getElementById('schedule-container');
    
    toggleBtn.addEventListener('click', () => {
        const isHidden = scheduleContainer.classList.contains('hidden');
        if (isHidden) {
            scheduleContainer.classList.remove('hidden');
            // Fix unescaped backtick issue by using single quotes
            toggleBtn.innerHTML = 'Ẩn lộ trình chi tiết <i class="fas fa-chevron-up text-xs"></i>';
        } else {
            scheduleContainer.classList.add('hidden');
            // Fix unescaped backtick issue by using single quotes
            toggleBtn.innerHTML = 'Xem lộ trình chi tiết <i class="fas fa-chevron-down text-xs"></i>';
        }
    });

    loadState();
    calculateAll();
}