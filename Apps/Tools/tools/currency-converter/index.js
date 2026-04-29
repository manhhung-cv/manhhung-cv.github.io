import { UI } from '../../js/ui.js';

export function template() {
    return `
        <div class="space-y-6">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h2 class="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Chuyển đổi Tiền tệ</h2>
                    <p class="text-sm text-zinc-500 mt-1">Dữ liệu thời gian thực • Phong cách Minimal Premium</p>
                </div>
                <button id="btn-cc-refresh" class="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all flex items-center justify-center shadow-sm" title="Làm mới tỷ giá">
                    <i class="fas fa-sync-alt"></i>
                </button>
            </div>

            <div class="flex p-1 bg-zinc-100/80 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 relative w-full lg:w-fit min-w-[300px]">
                <button class="cc-source-btn active flex-1 px-6 py-2.5 text-sm font-semibold rounded-xl text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 shadow-sm transition-all flex items-center justify-center gap-2" data-source="standard">
                    <i class="fas fa-globe text-blue-500"></i> Quốc tế
                </button>
                <button class="cc-source-btn flex-1 px-6 py-2.5 text-sm font-medium rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all flex items-center justify-center gap-2" data-source="smiles">
                    <i class="fas fa-wallet text-emerald-500"></i> Smiles Wallet
                </button>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                <div class="lg:col-span-7 bg-zinc-50 dark:bg-zinc-900/30 p-2 sm:p-3 rounded-3xl border border-zinc-200 dark:border-zinc-800/50 shadow-sm">
                    <div class="flex flex-col relative">
                        <div class="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-[24px] p-5 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all z-10 relative">
                            <label class="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Số tiền gửi</label>
                            <div class="flex items-center gap-3">
                                <input type="text" inputmode="decimal" id="cc-in-1" class="flex-1 bg-transparent border-none outline-none text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white p-0 w-full placeholder-zinc-300 dark:placeholder-zinc-700 font-sans" placeholder="0">
                                <div class="relative shrink-0">
                                    <select id="cc-sel-1" class="appearance-none bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-semibold py-2 pl-4 pr-10 rounded-xl outline-none cursor-pointer transition-colors text-base border border-transparent"></select>
                                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500"><i class="fas fa-chevron-down text-xs"></i></div>
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-center -my-5 relative z-20">
                            <button id="btn-cc-swap" class="w-12 h-12 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full border-[4px] border-zinc-50 dark:border-zinc-900 shadow-sm flex items-center justify-center active:scale-95 transition-transform">
                                <i class="fas fa-exchange-alt text-sm"></i>
                            </button>
                        </div>

                        <div class="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-[24px] p-5 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all z-10 relative">
                            <label class="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Số tiền nhận</label>
                            <div class="flex items-center gap-3">
                                <input type="text" inputmode="decimal" id="cc-in-2" class="flex-1 bg-transparent border-none outline-none text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white p-0 w-full placeholder-zinc-300 dark:placeholder-zinc-700 font-sans" placeholder="0">
                                <div class="relative shrink-0">
                                    <select id="cc-sel-2" class="appearance-none bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-semibold py-2 pl-4 pr-10 rounded-xl outline-none cursor-pointer transition-colors text-base border border-transparent"></select>
                                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500"><i class="fas fa-chevron-down text-xs"></i></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-3 mx-2 p-4 rounded-[20px] bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 flex flex-col items-center justify-center text-center gap-1">
                        <div id="cc-rate-text" class="text-blue-600 dark:text-blue-400 font-semibold text-[15px] sm:text-base"><i class="fas fa-circle-notch fa-spin"></i></div>
                        <div id="cc-update-time" class="text-[10px] text-blue-400/70 uppercase font-bold tracking-widest">--</div>
                    </div>
                </div>

                <div class="lg:col-span-5 space-y-4">
                    <div class="premium-card bg-white dark:bg-zinc-900 p-5 rounded-[28px] border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                        <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-bl-full pointer-events-none"></div>
                        <h3 id="popular-title" class="text-sm font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2 relative z-10">
                            <i class="fas fa-chart-line text-blue-500"></i> Tỷ giá so với VND
                        </h3>
                        <ul id="popular-rates-list" class="space-y-1 relative z-10">
                            <li class="py-4 text-center text-xs text-zinc-400">Đang tải...</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function init() {
    const CURRENCIES = { 'JPY': '🇯🇵 JPY', 'VND': '🇻🇳 VND', 'USD': '🇺🇸 USD', 'EUR': '🇪🇺 EUR', 'GBP': '🇬🇧 GBP', 'KRW': '🇰🇷 KRW', 'CNY': '🇨🇳 CNY', 'THB': '🇹🇭 THB' };
    const POPULAR_REFS = ['USD', 'JPY', 'EUR', 'KRW', 'CNY'];
    const SMILES_API_URL = 'https://www.smileswallet.com/japan/wp-admin/admin-ajax.php?action=smiles_simulator&security=&RemitAmount=0&AmountType=1&RegionCode=jp&FromCurrency=jpy&RemittenceMethod=cash-pickup&DPType=10&BeneficiaryCurrency=vnd&VietNamReceiveIn=VND';

    const sourceBtns = document.querySelectorAll('.cc-source-btn');
    const in1 = document.getElementById('cc-in-1'), in2 = document.getElementById('cc-in-2');
    const sel1 = document.getElementById('cc-sel-1'), sel2 = document.getElementById('cc-sel-2');
    const btnSwap = document.getElementById('btn-cc-swap'), btnRefresh = document.getElementById('btn-cc-refresh');
    const rateText = document.getElementById('cc-rate-text'), updateTime = document.getElementById('cc-update-time');
    const popularRatesList = document.getElementById('popular-rates-list'), popularTitle = document.getElementById('popular-title');

    let currentSource = 'standard', lastEdited = 1, ratesStandard = {}, rateSmiles = null, lastFetchStandard = null, lastFetchSmiles = null;

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
            popularTitle.innerHTML = `<i class="fas fa-wallet text-emerald-500"></i> Tỷ giá Smiles Wallet`;
            if (rateSmiles) {
                html = `<li class="flex justify-between items-center py-3 px-3 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                    <div class="flex items-center gap-2"><span class="text-base">🇯🇵</span><span class="text-xs font-bold text-zinc-500">1 JPY</span></div>
                    <div class="text-sm font-black text-emerald-600 dark:text-emerald-400">${formatCurrency(rateSmiles)} <span class="text-[10px] opacity-60">VND</span></div>
                </li>`;
            }
        } else {
            popularTitle.innerHTML = `<i class="fas fa-chart-line text-blue-500"></i> Tỷ giá so với VND`;
            if (Object.keys(ratesStandard).length) {
                POPULAR_REFS.forEach(base => {
                    let rate = ratesStandard['VND'] / ratesStandard[base];
                    html += `<li class="flex justify-between items-center py-2 px-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl transition-all">
                        <div class="flex items-center gap-2"><span>${CURRENCIES[base].split(' ')[0]}</span><span class="text-xs font-bold text-zinc-500">1 ${base}</span></div>
                        <div class="text-sm font-bold text-zinc-900 dark:text-white">${formatCurrency(rate)}</div>
                    </li>`;
                });
            }
        }
        popularRatesList.innerHTML = html || '<li class="text-center text-xs text-zinc-400">Đang cập nhật...</li>';
    };

    const fetchStandardApi = async () => {
        try {
            const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await res.json();
            ratesStandard = data.rates; lastFetchStandard = new Date();
            return true;
        } catch (e) { return false; }
    };

    const fetchSmilesApi = async () => {
        const proxies = [
            `https://api.allorigins.win/get?url=${encodeURIComponent(SMILES_API_URL)}`,
            `https://corsproxy.io/?${encodeURIComponent(SMILES_API_URL)}`,
            `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(SMILES_API_URL)}`
        ];
        try {
            const result = await Promise.any(proxies.map(url => fetch(url).then(r => r.json())));
            const content = result.contents ? JSON.parse(result.contents) : result;
            rateSmiles = parseFloat(content.Rate); lastFetchSmiles = new Date();
            return true;
        } catch (e) { return false; }
    };

    const calculate = () => {
        const c1 = sel1.value, c2 = sel2.value;
        let rate = 0;
        if (currentSource === 'standard') rate = ratesStandard[c2] / ratesStandard[c1];
        else rate = (c1 === 'JPY' && c2 === 'VND') ? rateSmiles : (c1 === 'VND' && c2 === 'JPY') ? 1/rateSmiles : 1;

        if (!rate) { rateText.innerHTML = "Đang tải dữ liệu..."; return; }

        rateText.innerHTML = `1 ${c1} <i class="fas fa-arrow-right mx-2 text-[10px] opacity-30"></i> <b>${formatCurrency(rate)}</b> ${c2}`;
        updateTime.textContent = `Cập nhật: ${(currentSource === 'standard' ? lastFetchStandard : lastFetchSmiles)?.toLocaleTimeString()}`;

        if (lastEdited === 1) in2.value = formatCurrency(parseInputStr(in1.value) * rate);
        else in1.value = formatCurrency(parseInputStr(in2.value) / rate);
        renderPopularRates();
    };

    const loadData = async (force = false) => {
        btnRefresh.querySelector('i').classList.add('fa-spin');
        if (force || !Object.keys(ratesStandard).length) await fetchStandardApi();
        if (currentSource === 'smiles' && (force || !rateSmiles)) await fetchSmilesApi();
        calculate();
        btnRefresh.querySelector('i').classList.remove('fa-spin');
    };

    sourceBtns.forEach(btn => btn.onclick = () => {
        sourceBtns.forEach(b => b.classList.remove('active', 'bg-white', 'dark:bg-zinc-800', 'shadow-sm', 'text-zinc-900', 'dark:text-white', 'font-semibold'));
        btn.classList.add('active', 'bg-white', 'dark:bg-zinc-800', 'shadow-sm', 'text-zinc-900', 'dark:text-white', 'font-semibold');
        currentSource = btn.dataset.source;
        loadData();
    });

    in1.oninput = () => { formatInputField(in1); lastEdited = 1; calculate(); };
    in2.oninput = () => { formatInputField(in2); lastEdited = 2; calculate(); };
    sel1.onchange = calculate; sel2.onchange = calculate;
    btnSwap.onclick = () => { [sel1.value, sel2.value] = [sel2.value, sel1.value]; calculate(); };
    btnRefresh.onclick = () => loadData(true);

    sel1.innerHTML = ''; sel2.innerHTML = '';
    Object.entries(CURRENCIES).forEach(([code, name]) => {
        sel1.add(new Option(name, code)); sel2.add(new Option(name, code));
    });
    sel1.value = 'JPY'; sel2.value = 'VND'; in1.value = '1';
    loadData();
}