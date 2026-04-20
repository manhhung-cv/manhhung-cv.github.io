import { UI } from '../../js/ui.js';

export function template() {
    return `
        <style>
            .cc-widget { max-width: 480px; margin: 0 auto; padding-bottom: 24px; }
            
            /* Thanh gạt chọn nguồn (Segmented Control) */
            .cc-source-toggle { 
                display: flex; background: var(--bg-sec); border-radius: 30px; 
                padding: 4px; margin-bottom: 24px; border: 1px solid var(--border); 
            }
            .cc-source-btn { 
                flex: 1; text-align: center; padding: 10px 16px; border-radius: 26px; 
                border: none; background: transparent; color: var(--text-mut); 
                font-weight: 600; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
                font-size: 0.9rem; font-family: var(--font); display: flex; align-items: center; justify-content: center; gap: 8px;
            }
            .cc-source-btn:hover { color: var(--text-main); }
            .cc-source-btn.active { 
                background: var(--bg-main); color: #3b82f6; 
                box-shadow: 0 2px 8px rgba(0,0,0,0.08); 
            }

            /* Khu vực nhập liệu chính */
            .cc-convert-area { position: relative; display: flex; flex-direction: column; gap: 4px; }
            
            .cc-input-group { 
                background: var(--bg-main); border: 1px solid var(--border); 
                border-radius: 16px; padding: 16px 20px; transition: all 0.2s; 
                display: flex; flex-direction: column; gap: 8px; z-index: 1;
            }
            .cc-input-group:focus-within { 
                border-color: #3b82f6; 
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); 
                z-index: 3; /* Nổi lên trên nút swap */
            }
            
            .cc-label { font-size: 0.85rem; color: var(--text-mut); font-weight: 500; }
            
            .cc-input-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
            
            .cc-input { 
                border: none; background: transparent; font-size: 2.2rem; 
                font-weight: 700; color: var(--text-main); width: 100%; 
                outline: none; padding: 0; font-family: var(--font);
            }
            .cc-input::placeholder { color: var(--text-mut); opacity: 0.3; }
            
            .cc-select { 
                border: none; background: var(--bg-sec); padding: 8px 12px 8px 16px; 
                border-radius: 20px; font-weight: 600; color: var(--text-main); 
                font-size: 1.05rem; cursor: pointer; outline: none; transition: background 0.2s; 
                appearance: none; -webkit-appearance: none; padding-right: 36px; 
                background-image: url('data:image/svg+xml;utf8,<svg fill="%23888" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'); 
                background-repeat: no-repeat; background-position-x: calc(100% - 4px); background-position-y: center; 
            }
            .cc-select:hover { background-color: var(--border); }

            /* Nút Đảo Ngược (Swap) Floating */
            .cc-swap-btn { 
                position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); 
                width: 44px; height: 44px; border-radius: 50%; background: #3b82f6; 
                color: white; border: 4px solid var(--bg-sec); display: flex; 
                align-items: center; justify-content: center; cursor: pointer; 
                transition: all 0.3s ease; z-index: 2; font-size: 1.1rem;
            }
            .cc-swap-btn:hover { 
                transform: translate(-50%, -50%) rotate(180deg); 
                background: #2563eb; 
            }

            /* Bảng thông tin tỷ giá */
            .cc-rate-box { 
                margin-top: 16px; padding: 16px 20px; border-radius: 16px; 
                background: rgba(59, 130, 246, 0.05); border: 1px solid rgba(59, 130, 246, 0.1); 
                display: flex; flex-direction: column; gap: 4px; text-align: center;
            }
            .cc-rate-val { font-weight: 600; color: #3b82f6; font-size: 1.1rem; }
            .cc-rate-time { font-size: 0.8rem; color: var(--text-mut); }
            
            .cc-loader { display: inline-block; width: 14px; height: 14px; border: 2px solid var(--text-mut); border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 6px; vertical-align: middle; }
            @keyframes spin { to { transform: rotate(360deg); } }
        </style>

        <div class="cc-widget">
            
            <div class="flex-between" style="margin-bottom: 20px;">
                <div>
                    <h1 class="h1" style="font-size: 1.5rem; margin-bottom: 4px;">Chuyển đổi Tiền tệ</h1>
                    <p class="text-mut" style="font-size: 0.9rem;">Cập nhật tự động theo thời gian thực.</p>
                </div>
                <button class="btn btn-ghost btn-sm" id="btn-cc-refresh" title="Làm mới tỷ giá" style="padding: 8px; border-radius: 50%; height: 36px; width: 36px; display: flex; justify-content: center; align-items: center;">
                    <i class="fas fa-sync-alt"></i>
                </button>
            </div>

            <div class="cc-source-toggle">
                <button class="cc-source-btn active" data-source="standard">
                    <i class="fas fa-globe"></i> Quốc tế
                </button>
                <button class="cc-source-btn" data-source="smiles">
                    <i class="fas fa-wallet"></i> Smiles Wallet
                </button>
            </div>

            <div class="card" style="background: var(--bg-sec); padding: 8px; border: none; border-radius: 20px;">
                
                <div class="cc-convert-area">
                    <div class="cc-input-group">
                        <span class="cc-label">Số tiền chuyển</span>
                        <div class="cc-input-row">
                            <input type="number" class="cc-input" id="cc-in-1" placeholder="0" step="any">
                            <select class="cc-select" id="cc-sel-1"></select>
                        </div>
                    </div>

                    <button class="cc-swap-btn" id="btn-cc-swap" title="Hoán đổi">
                        <i class="fas fa-exchange-alt"></i>
                    </button>

                    <div class="cc-input-group">
                        <span class="cc-label">Số tiền nhận được</span>
                        <div class="cc-input-row">
                            <input type="number" class="cc-input" id="cc-in-2" placeholder="0" step="any">
                            <select class="cc-select" id="cc-sel-2"></select>
                        </div>
                    </div>
                </div>

                <div class="cc-rate-box">
                    <div class="cc-rate-val" id="cc-rate-text">
                        <span class="cc-loader"></span> Đang tải tỷ giá...
                    </div>
                    <div class="cc-rate-time" id="cc-update-time">--</div>
                </div>

            </div>

        </div>
    `;
}

export function init() {
    // --- KHAI BÁO CẤU HÌNH ---
    const CURRENCIES = {
        'USD': '🇺🇸 USD',
        'VND': '🇻🇳 VND',
        'JPY': '🇯🇵 JPY',
        'EUR': '🇪🇺 EUR',
        'GBP': '🇬🇧 GBP',
        'KRW': '🇰🇷 KRW',
        'CNY': '🇨🇳 CNY',
        'THB': '🇹🇭 THB',
        'AUD': '🇦🇺 AUD',
        'CAD': '🇨🇦 CAD',
        'SGD': '🇸🇬 SGD',
        'TWD': '🇹🇼 TWD'
    };

    // Đổi sang API trực tiếp của Smiles trả về JSON
    const SMILES_API_URL = 'https://www.smileswallet.com/japan/wp-admin/admin-ajax.php?action=smiles_simulator&security=&RemitAmount=0&AmountType=1&RegionCode=jp&FromCurrency=jpy&RemittenceMethod=cash-pickup&DPType=10&BeneficiaryCurrency=vnd&VietNamReceiveIn=VND';

    // --- DOM ELEMENTS ---
    const sourceBtns = document.querySelectorAll('.cc-source-btn');
    const in1 = document.getElementById('cc-in-1');
    const in2 = document.getElementById('cc-in-2');
    const sel1 = document.getElementById('cc-sel-1');
    const sel2 = document.getElementById('cc-sel-2');
    const btnSwap = document.getElementById('btn-cc-swap');
    const btnRefresh = document.getElementById('btn-cc-refresh');
    const rateText = document.getElementById('cc-rate-text');
    const updateTime = document.getElementById('cc-update-time');

    // --- STATE VARIABLES ---
    let currentSource = 'standard';
    let lastEdited = 1; 
    
    let ratesStandard = {}; 
    let smilesRates = {}; 
    let rateSmiles = null; 
    
    let lastFetchStandard = null;
    let lastFetchSmiles = null;

    // --- TIỆN ÍCH ---
    const formatCurrency = (num) => {
        if (!num) return '';
        // Làm tròn tối đa 4 số thập phân và bỏ các số 0 vô nghĩa ở đuôi
        return Number(Math.round(num * 10000) / 10000).toString();
    };

    const formatDate = (date) => {
        if (!date) return '--';
        return `Cập nhật lúc: ${date.toLocaleTimeString('vi-VN')} - ${date.toLocaleDateString('vi-VN')}`;
    };

    const populateSelects = () => {
        sel1.innerHTML = '';
        sel2.innerHTML = '';
        
        if (currentSource === 'standard') {
            Object.entries(CURRENCIES).forEach(([code, name]) => {
                sel1.add(new Option(name, code));
                sel2.add(new Option(name, code));
            });
            if (!sel1.value) sel1.value = 'USD';
            if (!sel2.value) sel2.value = 'VND';
        } else {
            sel1.add(new Option(CURRENCIES['JPY'], 'JPY'));
            sel1.add(new Option(CURRENCIES['VND'], 'VND'));
            sel2.add(new Option(CURRENCIES['JPY'], 'JPY'));
            sel2.add(new Option(CURRENCIES['VND'], 'VND'));
            
            sel1.value = 'JPY';
            sel2.value = 'VND';
        }
    };

    // --- KẾT NỐI API QUỐC TẾ ---
    const fetchStandardApi = async () => {
        try {
            const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await res.json();
            ratesStandard = data.rates;
            lastFetchStandard = new Date();
            return true;
        } catch (error) {
            console.error('Lỗi API Quốc tế:', error);
            return false;
        }
    };

    // --- KẾT NỐI SMILES API QUA PROXY (ĐUA TỐC ĐỘ) ---
    const fetchSmilesApi = async () => {
        const fetchAllOrigins = async () => {
            const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(SMILES_API_URL)}`);
            if (!res.ok) throw new Error('AllOrigins failed');
            const data = await res.json();
            const parsed = JSON.parse(data.contents);
            if (!parsed || !parsed.Rate) throw new Error('Invalid rate data');
            return parseFloat(parsed.Rate);
        };

        const fetchCorsProxy = async () => {
            const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(SMILES_API_URL)}`);
            if (!res.ok) throw new Error('CorsProxy failed');
            const data = await res.json();
            if (!data || !data.Rate) throw new Error('Invalid rate data');
            return parseFloat(data.Rate);
        };

        const fetchCodeTabs = async () => {
            const res = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(SMILES_API_URL)}`);
            if (!res.ok) throw new Error('CodeTabs failed');
            const data = await res.json();
            if (!data || !data.Rate) throw new Error('Invalid rate data');
            return parseFloat(data.Rate);
        };

        try {
            // Lấy kết quả từ proxy nào phản hồi nhanh nhất và không bị lỗi
            const newRate = await Promise.any([
                fetchAllOrigins(),
                fetchCorsProxy(),
                fetchCodeTabs()
            ]);
            
            rateSmiles = newRate;
            smilesRates['VND'] = newRate; 
            lastFetchSmiles = new Date();
            return true;
            
        } catch (error) {
            console.error("Toàn bộ proxy lấy tỷ giá Smiles đều thất bại:", error);
            return false;
        }
    };

    // --- LOGIC TÍNH TOÁN ---
    const calculate = () => {
        const c1 = sel1.value;
        const c2 = sel2.value;
        
        let exchangeRate = 0;
        let isError = false;

        if (currentSource === 'standard') {
            if (!ratesStandard[c1] || !ratesStandard[c2]) {
                isError = true;
            } else {
                exchangeRate = ratesStandard[c2] / ratesStandard[c1];
            }
        } else {
            if (!rateSmiles) {
                isError = true;
            } else {
                if (c1 === 'JPY' && c2 === 'VND') exchangeRate = rateSmiles;
                else if (c1 === 'VND' && c2 === 'JPY') exchangeRate = 1 / rateSmiles;
                else if (c1 === c2) exchangeRate = 1;
            }
        }

        if (isError) {
            rateText.innerHTML = `<span style="color: #ef4444;"><i class="fas fa-exclamation-triangle"></i> Lỗi dữ liệu tỷ giá.</span>`;
            updateTime.textContent = '--';
            return;
        }

        rateText.innerHTML = `1 ${c1} &nbsp;=&nbsp; <b>${formatCurrency(exchangeRate)}</b> ${c2}`;
        updateTime.textContent = formatDate(currentSource === 'standard' ? lastFetchStandard : lastFetchSmiles);

        if (lastEdited === 1) {
            const val1 = parseFloat(in1.value);
            if (isNaN(val1)) { in2.value = ''; return; }
            in2.value = formatCurrency(val1 * exchangeRate);
        } else {
            const val2 = parseFloat(in2.value);
            if (isNaN(val2)) { in1.value = ''; return; }
            in1.value = formatCurrency(val2 / exchangeRate);
        }
    };

    // --- HÀM KHỞI ĐỘNG VÀ LOAD DATA ---
    const loadDataAndCalculate = async (forceRefresh = false) => {
        rateText.innerHTML = `<span class="cc-loader"></span> Đang cập nhật...`;
        btnRefresh.querySelector('i').classList.add('fa-spin'); 
        
        if (currentSource === 'standard') {
            if (forceRefresh || Object.keys(ratesStandard).length === 0) {
                const success = await fetchStandardApi();
                if (!success && Object.keys(ratesStandard).length === 0) {
                    rateText.innerHTML = `<span style="color: #ef4444;">Lỗi kết nối API Quốc tế.</span>`;
                    btnRefresh.querySelector('i').classList.remove('fa-spin');
                    return;
                }
            }
        } else {
            if (forceRefresh || !rateSmiles) {
                const success = await fetchSmilesApi();
                if (!success) {
                    // Kiểm tra xem UI.showAlert có tồn tại không trước khi gọi để tránh lỗi
                    if (typeof UI !== 'undefined' && UI.showAlert) {
                        UI.showAlert('Lỗi', 'Không thể lấy tỷ giá từ Smiles lúc này. Tạm dùng tỷ giá Quốc tế.', 'warning');
                    } else {
                        alert('Không thể lấy tỷ giá từ Smiles lúc này. Tạm dùng tỷ giá Quốc tế.');
                    }
                    
                    if (Object.keys(ratesStandard).length === 0) await fetchStandardApi();
                    if (ratesStandard['JPY'] && ratesStandard['VND']) {
                        rateSmiles = ratesStandard['VND'] / ratesStandard['JPY'];
                        lastFetchSmiles = lastFetchStandard;
                    }
                }
            }
        }
        calculate();
        btnRefresh.querySelector('i').classList.remove('fa-spin');
    };

    // --- SỰ KIỆN LẮNG NGHE ---
    sourceBtns.forEach(btn => {
        btn.onclick = () => {
            sourceBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const oldC1 = sel1.value;
            const oldC2 = sel2.value;

            currentSource = btn.dataset.source;
            populateSelects();

            if (currentSource === 'standard') {
                sel1.value = oldC1;
                sel2.value = oldC2;
            }
            
            loadDataAndCalculate();
        };
    });

    in1.addEventListener('input', () => { lastEdited = 1; calculate(); });
    in2.addEventListener('input', () => { lastEdited = 2; calculate(); });

    sel1.addEventListener('change', () => { calculate(); });
    sel2.addEventListener('change', () => { calculate(); });

    btnSwap.addEventListener('click', () => {
        const temp = sel1.value;
        sel1.value = sel2.value;
        sel2.value = temp;
        lastEdited = 1;
        calculate();
    });

    btnRefresh.addEventListener('click', () => {
        loadDataAndCalculate(true);
    });

    // --- KHỞI CHẠY LẦN ĐẦU ---
    populateSelects();
    in1.value = '1';
    loadDataAndCalculate(true);
}