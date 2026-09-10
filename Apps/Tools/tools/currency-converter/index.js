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
    <div id="currency-root-container" class="w-full h-full bg-[#f4f4f6] dark:bg-[#000000] text-[#18181b] dark:text-[#f4f4f6] select-none overflow-hidden font-sans transition-colors duration-200">
        
        <style>
            #currency-root-container {
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
        </style>

        <!-- MAIN SCROLLER -->
        <main class="w-full h-full overflow-y-auto no-scrollbar px-3.5 sm:px-6 pt-6 pb-24 max-w-4xl mx-auto space-y-5">
            
            <!-- HEADER SECTION -->
            <div class="px-1 flex items-start justify-between">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-accent-theme shadow-sm transition-colors"></span>
                        <span class="text-[11px] font-mono tracking-wider font-semibold uppercase text-accent-theme">HunqOS Finance</span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">Chuyển đổi Tiền tệ</h1>
                    <p class="text-[12px] text-zinc-500 dark:text-zinc-400 font-normal">Tỷ giá thị trường quốc tế & cổng chuyển tiền Smiles Wallet theo thời gian thực.</p>
                </div>
                
                <button id="btn-cc-refresh" class="w-10 h-10 rounded-[14px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center active:scale-95 transition-all shadow-sm" title="Làm mới tỷ giá">
                    <i class="fas fa-arrows-rotate text-sm"></i>
                </button>
            </div>

            <!-- CONTROLS & SOURCE TABS -->
            <div class="rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-3.5 sm:p-4 shadow-sm">
                <div class="grid grid-cols-2 gap-1 p-1 rounded-[14px] bg-black/[0.05] dark:bg-black/50 border border-black/[0.04] dark:border-white/[0.08] w-full sm:w-80" id="cc-source-tabs">
                    <button class="cc-source-btn active py-1.5 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex items-center justify-center gap-2" data-source="standard">
                        <i class="fas fa-globe text-accent-theme text-[11px]"></i> Quốc tế
                    </button>
                    <button class="cc-source-btn py-1.5 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center justify-center gap-2" data-source="smiles">
                        <i class="fas fa-wallet text-amber-500 text-[11px]"></i> Smiles Wallet
                    </button>
                </div>
            </div>

            <!-- MAIN WORKSPACE -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                <!-- CONVERTER CALCULATOR CARD -->
                <div class="lg:col-span-7 rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-4 sm:p-5 shadow-sm space-y-4">
                    <div class="flex flex-col relative space-y-3">
                        
                        <!-- Input Box 1 -->
                        <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[20px] p-4 focus-within:border-accent-theme transition-all z-10 relative">
                            <span class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1 block">Số tiền gửi</span>
                            <div class="flex items-center gap-3">
                                <input type="text" inputmode="decimal" id="cc-in-1" class="flex-1 bg-transparent border-none outline-none text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white p-0 w-full placeholder-zinc-300 dark:placeholder-zinc-700 font-mono" placeholder="0">
                                <div class="relative shrink-0">
                                    <select id="cc-sel-1" class="appearance-none bg-white dark:bg-[#27272a] hover:bg-black/5 dark:hover:bg-white/10 text-zinc-900 dark:text-white font-bold py-1.5 pl-3 pr-8 rounded-[12px] outline-none cursor-pointer transition-colors text-xs border border-black/[0.05] dark:border-white/[0.08]"></select>
                                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-zinc-400"><i class="fas fa-chevron-down text-[10px]"></i></div>
                                </div>
                            </div>
                        </div>

                        <!-- Swap Button -->
                        <div class="flex justify-center -my-3.5 relative z-20">
                            <button id="btn-cc-swap" class="w-10 h-10 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full border-[3px] border-white dark:border-[#161618] shadow-sm flex items-center justify-center active:scale-90 transition-transform" title="Đổi chiều">
                                <i class="fas fa-right-left text-xs rotate-90 sm:rotate-0"></i>
                            </button>
                        </div>

                        <!-- Input Box 2 -->
                        <div class="bg-[#f2f2f7] dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.06] rounded-[20px] p-4 focus-within:border-accent-theme transition-all z-10 relative">
                            <span class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1 block">Số tiền nhận</span>
                            <div class="flex items-center gap-3">
                                <input type="text" inputmode="decimal" id="cc-in-2" class="flex-1 bg-transparent border-none outline-none text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white p-0 w-full placeholder-zinc-300 dark:placeholder-zinc-700 font-mono" placeholder="0">
                                <div class="relative shrink-0">
                                    <select id="cc-sel-2" class="appearance-none bg-white dark:bg-[#27272a] hover:bg-black/5 dark:hover:bg-white/10 text-zinc-900 dark:text-white font-bold py-1.5 pl-3 pr-8 rounded-[12px] outline-none cursor-pointer transition-colors text-xs border border-black/[0.05] dark:border-white/[0.08]"></select>
                                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-zinc-400"><i class="fas fa-chevron-down text-[10px]"></i></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Live Rate Summary Display -->
                    <div class="p-3.5 rounded-[16px] bg-accent-theme-alpha border border-black/[0.03] dark:border-white/[0.05] flex flex-col items-center justify-center text-center gap-0.5">
                        <div id="cc-rate-text" class="text-accent-theme font-bold text-sm tracking-tight flex items-center justify-center gap-1.5">
                            <i class="fas fa-circle-notch fa-spin text-xs"></i>
                        </div>
                        <div id="cc-update-time" class="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase font-mono tracking-widest">Đang kết nối...</div>
                    </div>
                </div>

                <!-- POPULAR RATES SIDEBAR -->
                <div class="lg:col-span-5 rounded-[24px] bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] p-5 shadow-sm space-y-3">
                    <div class="flex items-center justify-between pb-2 border-b border-black/[0.05] dark:border-white/[0.08]">
                        <h3 id="popular-title" class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                            <i class="fas fa-chart-line text-accent-theme"></i> Tỷ giá so với VND
                        </h3>
                        <span class="text-[9px] font-mono px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-zinc-500">Tham khảo</span>
                    </div>
                    
                    <ul id="popular-rates-list" class="space-y-1.5 pt-1">
                        <li class="py-6 text-center text-xs text-zinc-400">Đang tải dữ liệu...</li>
                    </ul>
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
    const rootContainer = hostElement.querySelector('#currency-root-container') || hostElement;

    // Khởi tạo và lắng nghe ThemeKit
    const updateAccent = () => ThemeKit.applyAccent(rootContainer);
    updateAccent();

    window.addEventListener('storage', (e) => {
        if (e.key === 'hunqos_accent_color' || e.key === 'hunqos_icon_custom_bg') {
            updateAccent();
        }
    });

    const CURRENCIES = { 
        'JPY': '🇯🇵 JPY', 
        'VND': '🇻🇳 VND', 
        'USD': '🇺🇸 USD', 
        'EUR': '🇪🇺 EUR', 
        'GBP': '🇬🇧 GBP', 
        'KRW': '🇰🇷 KRW', 
        'CNY': '🇨🇳 CNY', 
        'THB': '🇹🇭 THB' 
    };
    const POPULAR_REFS = ['USD', 'JPY', 'EUR', 'KRW', 'CNY'];
    const SMILES_API_URL = 'https://www.smileswallet.com/japan/wp-admin/admin-ajax.php?action=smiles_simulator&security=&RemitAmount=0&AmountType=1&RegionCode=jp&FromCurrency=jpy&RemittenceMethod=cash-pickup&DPType=10&BeneficiaryCurrency=vnd&VietNamReceiveIn=VND';

    const sourceBtns = hostElement.querySelectorAll('.cc-source-btn');
    const in1 = hostElement.querySelector('#cc-in-1'), in2 = hostElement.querySelector('#cc-in-2');
    const sel1 = hostElement.querySelector('#cc-sel-1'), sel2 = hostElement.querySelector('#cc-sel-2');
    const btnSwap = hostElement.querySelector('#btn-cc-swap'), btnRefresh = hostElement.querySelector('#btn-cc-refresh');
    const rateText = hostElement.querySelector('#cc-rate-text'), updateTime = hostElement.querySelector('#cc-update-time');
    const popularRatesList = hostElement.querySelector('#popular-rates-list'), popularTitle = hostElement.querySelector('#popular-title');

    let currentSource = 'standard';
    let lastEdited = 1;
    let ratesStandard = {};
    let rateSmiles = null;
    let lastFetchStandard = null;
    let lastFetchSmiles = null;

    const formatCurrency = (num) => !num && num !== 0 ? '' : new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 4 }).format(num);
    const parseInputStr = (valStr) => !valStr ? NaN : parseFloat(valStr.replace(/\./g, '').replace(/,/g, '.'));
    
    const formatInputField = (inputEl) => {
        let val = inputEl.value.replace(/[^0-9,]/g, '');
        const parts = val.split(',');
        if (parts[0]) parts[0] = parseInt(parts[0], 10).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        inputEl.value = parts.slice(0, 2).join(',');
    };

    const renderPopularRates = () => {
        let html = '';
        if (currentSource === 'smiles') {
            popularTitle.innerHTML = `<i class="fas fa-wallet text-amber-500"></i> Tỷ giá Smiles Wallet`;
            if (rateSmiles) {
                html = `
                <li class="flex justify-between items-center py-2.5 px-3 bg-[#f2f2f7] dark:bg-black/40 rounded-[14px] border border-black/[0.03] dark:border-white/[0.05]">
                    <div class="flex items-center gap-2">
                        <span class="text-base">🇯🇵</span>
                        <span class="text-xs font-bold text-zinc-600 dark:text-zinc-400">1 JPY</span>
                    </div>
                    <div class="text-xs font-black font-mono text-accent-theme">${formatCurrency(rateSmiles)} <span class="text-[9px] text-zinc-400 font-normal">VND</span></div>
                </li>`;
            }
        } else {
            popularTitle.innerHTML = `<i class="fas fa-chart-line text-accent-theme"></i> Tỷ giá so với VND`;
            if (Object.keys(ratesStandard).length) {
                POPULAR_REFS.forEach(base => {
                    let rate = ratesStandard['VND'] / ratesStandard[base];
                    html += `
                    <li class="flex justify-between items-center py-2 px-3 hover:bg-[#f2f2f7] dark:hover:bg-black/40 rounded-[12px] transition-colors">
                        <div class="flex items-center gap-2">
                            <span>${CURRENCIES[base].split(' ')[0]}</span>
                            <span class="text-xs font-medium text-zinc-600 dark:text-zinc-400 font-mono">1 ${base}</span>
                        </div>
                        <div class="text-xs font-bold font-mono text-zinc-900 dark:text-white">${formatCurrency(rate)}</div>
                    </li>`;
                });
            }
        }
        popularRatesList.innerHTML = html || '<li class="text-center text-xs text-zinc-400 py-4">Đang cập nhật...</li>';
    };

    const fetchStandardApi = async () => {
        try {
            const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await res.json();
            ratesStandard = data.rates;
            lastFetchStandard = new Date();
            return true;
        } catch (e) { 
            return false; 
        }
    };

    const fetchSmilesApi = async () => {
        const proxies = [
            `https://cors-proxy.year-tucking-0v.workers.dev/?url=${encodeURIComponent(SMILES_API_URL)}`
        ];
        try {
            const result = await Promise.any(proxies.map(url => fetch(url).then(r => r.json())));
            const content = result.contents ? JSON.parse(result.contents) : result;
            rateSmiles = parseFloat(content.Rate);
            lastFetchSmiles = new Date();
            return true;
        } catch (e) { 
            return false; 
        }
    };

    const calculate = () => {
        const c1 = sel1.value, c2 = sel2.value;
        let rate = 0;
        if (currentSource === 'standard') {
            rate = ratesStandard[c2] / ratesStandard[c1];
        } else {
            rate = (c1 === 'JPY' && c2 === 'VND') ? rateSmiles : (c1 === 'VND' && c2 === 'JPY') ? (1 / rateSmiles) : 1;
        }

        if (!rate) { 
            rateText.innerHTML = "Đang kết nối dữ liệu..."; 
            return; 
        }

        rateText.innerHTML = `1 ${c1} <i class="fas fa-arrow-right mx-1.5 text-[9px] opacity-40"></i> <b class="font-mono">${formatCurrency(rate)}</b> ${c2}`;
        updateTime.textContent = `Cập nhật: ${(currentSource === 'standard' ? lastFetchStandard : lastFetchSmiles)?.toLocaleTimeString()}`;

        if (lastEdited === 1) {
            in2.value = formatCurrency(parseInputStr(in1.value) * rate);
        } else {
            in1.value = formatCurrency(parseInputStr(in2.value) / rate);
        }
        renderPopularRates();
    };

    const loadData = async (force = false, notify = false) => {
        const spinIcon = btnRefresh.querySelector('i');
        spinIcon?.classList.add('fa-spin');
        
        let okStandard = true, okSmiles = true;
        if (force || !Object.keys(ratesStandard).length) okStandard = await fetchStandardApi();
        if (currentSource === 'smiles' && (force || !rateSmiles)) okSmiles = await fetchSmilesApi();
        
        calculate();
        spinIcon?.classList.remove('fa-spin');

        if (notify) {
            if (okStandard && okSmiles) {
                IslandKit.notify('Tỷ giá', 'Đã làm mới dữ liệu thời gian thực.', 'success');
            } else {
                IslandKit.notify('Lỗi kết nối', 'Không thể cập nhật tỷ giá mới nhất.', 'error');
            }
        }
    };

    // Tab Switching
    const activeClass = 'cc-source-btn active py-1.5 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/[0.1] transition-all flex items-center justify-center gap-2';
    const inactiveClass = 'cc-source-btn py-1.5 rounded-[10px] text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent transition-all flex items-center justify-center gap-2';

    sourceBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sourceBtns.forEach(b => b.className = inactiveClass);
            btn.className = activeClass;
            currentSource = btn.dataset.source;
            loadData(false, false);
        });
    });

    in1.oninput = () => { formatInputField(in1); lastEdited = 1; calculate(); };
    in2.oninput = () => { formatInputField(in2); lastEdited = 2; calculate(); };
    sel1.onchange = calculate; 
    sel2.onchange = calculate;
    
    btnSwap.onclick = () => { 
        [sel1.value, sel2.value] = [sel2.value, sel1.value]; 
        calculate(); 
    };

    btnRefresh.onclick = () => loadData(true, true);

    // Populate Currencies
    sel1.innerHTML = ''; 
    sel2.innerHTML = '';
    Object.entries(CURRENCIES).forEach(([code, name]) => {
        sel1.add(new Option(name, code)); 
        sel2.add(new Option(name, code));
    });
    sel1.value = 'JPY'; 
    sel2.value = 'VND'; 
    in1.value = '1';
    
    loadData(false, false);
}