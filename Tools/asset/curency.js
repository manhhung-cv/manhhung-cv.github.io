// asset/currency.js

const SCRAPINGBEE_KEYS = [
    "YFH8ZPMDE27ABK3HAVVALLVZLVAF4PNMDYE12GSH2ILVSQ5AVLTGMTUZCDNG2SAGCII7PKXLZWJI7GD7", 
    "API_KEY_2",
    "API_KEY_3",
    "API_KEY_4",
    "API_KEY_5"
];

document.addEventListener('DOMContentLoaded', () => {
    const currencyTool = document.getElementById('currency');
    if (!currencyTool) return;

    const STANDARD_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';
    const SMILES_TARGET_URL = 'https://www.smileswallet.com/japan/vi/ty-gia/';
    const FLAG_CDN_URL = 'https://flagcdn.com/w40/';

    // --- DỮ LIỆU TIỀN TỆ ---
    const commonCurrencies = {
        'VND': { name: 'Đồng Việt Nam', flag: 'vn' }, 'USD': { name: 'Đô la Mỹ', flag: 'us' },
        'EUR': { name: 'Euro', flag: 'eu' }, 'JPY': { name: 'Yên Nhật', flag: 'jp' },
        'GBP': { name: 'Bảng Anh', flag: 'gb' }, 'AUD': { name: 'Đô la Úc', flag: 'au' },
        'CAD': { name: 'Đô la Canada', flag: 'ca' }, 'CHF': { name: 'Franc Thụy Sĩ', flag: 'ch' },
        'CNY': { name: 'Nhân dân tệ Trung Quốc', flag: 'cn' }, 'KRW': { name: 'Won Hàn Quốc', flag: 'kr' },
        'SGD': { name: 'Đô la Singapore', flag: 'sg' }, 'HKD': { name: 'Đô la Hồng Kông', flag: 'hk' },
        'THB': { name: 'Bạt Thái Lan', flag: 'th' }, 'MYR': { name: 'Ringgit Malaysia', flag: 'my' },
        'IDR': { name: 'Rupiah Indonesia', flag: 'id' }, 'PHP': { name: 'Peso Philippine', flag: 'ph' },
        'TWD': { name: 'Tân Đài tệ', flag: 'tw' }, 'NZD': { name: 'Đô la New Zealand', flag: 'nz' },
        'RUB': { name: 'Rúp Nga', flag: 'ru' }, 'INR': { name: 'Rupee Ấn Độ', flag: 'in' },
        'BDT': { name: 'Taka Bangladesh', flag: 'bd' }, 'NPR': { name: 'Rupee Nepal', flag: 'np' }
    };
    const supportedCurrencyCodes = Object.keys(commonCurrencies);

    // --- DOM Elements ---
    const fromCurrencySelect = document.getElementById('from-currency');
    const toCurrencySelect = document.getElementById('to-currency');
    const fromAmountInput = document.getElementById('from-amount');
    const toAmountInput = document.getElementById('to-amount');
    const swapButton = document.getElementById('swap-button');
    const rateDisplay = document.getElementById('rate-display');
    const fromFlag = document.getElementById('from-flag');
    const toFlag = document.getElementById('to-flag');
    const trackingList = document.getElementById('tracking-list');
    const baseCurrencySelect = document.getElementById('base-currency-select');
    const addCurrencyBtn = document.getElementById('add-currency-btn');
    const currencyDropdown = document.getElementById('currency-dropdown');
    const currencyListForAdd = document.getElementById('currency-list-for-add');
    const currencySearchInput = document.getElementById('currency-search-input');
    const loadingMessage = document.getElementById('loading-message');
    const roundingOptionsContainer = document.getElementById('rounding-options');
    
    // [MỚI] Elements cho Toggle
    const sourceToggle = document.getElementById('source-toggle');
    const sourceStatusText = document.getElementById('source-status-text');

    // --- State ---
    let standardRates = {};
    let smilesRates = {};
    let trackedCurrencies = JSON.parse(localStorage.getItem('trackedCurrencies')) || ['JPY', 'EUR', 'USD', 'CNY', 'KRW'];
    let baseTrackingCurrency = localStorage.getItem('baseTrackingCurrency') || 'VND';
    let roundingOption = localStorage.getItem('roundingOption') || 'default';
    
    // [MỚI] State cho chế độ ưu tiên Smiles
    let useSmilesMode = localStorage.getItem('useSmilesMode') === 'true'; 

    // --- Helper Functions ---
    const getFlagUrl = (currencyCode) => {
        const flagCode = commonCurrencies[currencyCode]?.flag;
        return flagCode ? `${FLAG_CDN_URL}${flagCode}.png` : '';
    };
    const formatNumber = (numStr) => !numStr ? '' : parseFormattedNumber(numStr).toLocaleString('de-DE');
    const parseFormattedNumber = (str) => !str ? 0 : parseFloat(String(str).replace(/\./g, '').replace(/,/g, '.')) || 0;

    // --- API Functions ---
    async function fetchStandardRates() {
        try {
            const response = await fetch(STANDARD_API_URL);
            if (!response.ok) throw new Error('Standard API failed');
            const data = await response.json();
            standardRates = data.rates;
            return true;
        } catch (error) {
            console.warn('Failed to fetch standard rates:', error);
            return false;
        }
    }

    async function fetchSmilesRates() {
        const extractRules = {
            "currencies": {
                "selector": ".currency",
                "type": "list",
                "output": {
                    "rateString": ".exchange_rate",
                    "country": ".country_name"
                }
            }
        };

        for (let i = 0; i < SCRAPINGBEE_KEYS.length; i++) {
            const apiKey = SCRAPINGBEE_KEYS[i];
            if (!apiKey) continue;
            try {
                const apiUrl = `https://app.scrapingbee.com/api/v1/?api_key=${apiKey}&url=${encodeURIComponent(SMILES_TARGET_URL)}&extract_rules=${encodeURIComponent(JSON.stringify(extractRules))}&render_js=false`;
                const response = await fetch(apiUrl);
                if (response.ok) {
                    const data = await response.json();
                    if (data.currencies) {
                        data.currencies.forEach(item => {
                            const parts = item.rateString.trim().split(' ');
                            if (parts.length >= 2) {
                                const rateVal = parseFloat(parts[0]);
                                const currencyCode = parts[1];
                                if (!isNaN(rateVal) && currencyCode) smilesRates[currencyCode] = rateVal;
                            }
                        });
                    }
                    return true;
                }
            } catch (err) { console.warn(`Key ${i+1} lỗi:`, err.message); }
        }
        return false;
    }

    async function fetchAllRates() {
        loadingMessage.style.display = 'block';
        await Promise.all([fetchStandardRates(), fetchSmilesRates()]);
        loadingMessage.style.display = 'none';
        if (Object.keys(standardRates).length === 0) {
            if(rateDisplay) rateDisplay.textContent = 'Lỗi tải dữ liệu.';
            return false;
        }
        return true;
    }

    // --- Logic tính toán tỷ giá (UPDATED) ---
    function getConversionRate(from, to) {
        // Nếu chế độ Smiles ĐANG BẬT
        if (useSmilesMode) {
            if (from === 'JPY' && smilesRates[to]) return smilesRates[to];
            if (to === 'JPY' && smilesRates[from]) return 1 / smilesRates[from];
        }
        
        // Mặc định (hoặc Fallback) dùng Standard
        if (standardRates[from] && standardRates[to]) {
            return (1 / standardRates[from]) * standardRates[to];
        }
        return 0;
    }

    // --- Render Functions ---
    function updateSourceUI() {
        sourceToggle.checked = useSmilesMode;
        sourceStatusText.textContent = useSmilesMode ? "Smiles Wallet" : "Quốc tế";
        sourceStatusText.style.color = useSmilesMode ? "#28a745" : "#333";
    }

    function populateCurrencySelects(selectElement) {
        if (!selectElement) return;
        const fragment = document.createDocumentFragment();
        supportedCurrencyCodes.forEach(currency => {
            const currencyName = commonCurrencies[currency]?.name || currency;
            const option = new Option(`${currency} - ${currencyName}`, currency);
            fragment.appendChild(option);
        });
        selectElement.innerHTML = '';
        selectElement.appendChild(fragment);
    }

    function updateFlag(selectElement, imgElement) {
        const currency = selectElement.value;
        const flagUrl = getFlagUrl(currency);
        imgElement.src = flagUrl;
        imgElement.style.display = flagUrl ? 'block' : 'none';
    }

    function getRoundingOptions() {
        switch (roundingOption) {
            case 'integer': return { maximumFractionDigits: 0 };
            case 'two_decimals': return { minimumFractionDigits: 2, maximumFractionDigits: 2 };
            default: return { minimumFractionDigits: 2, maximumFractionDigits: 4 };
        }
    }

    function renderTrackingTable() {
        trackingList.innerHTML = '';
        if (Object.keys(standardRates).length === 0) return;

        trackedCurrencies.forEach(currencyCode => {
            if (currencyCode === baseTrackingCurrency) return;
            
            const displayRate = getConversionRate(baseTrackingCurrency, currencyCode);
            
            // Kiểm tra nguồn
            let isSmilesUsed = false;
            if (useSmilesMode) {
                isSmilesUsed = (baseTrackingCurrency === 'JPY' && smilesRates[currencyCode]) || (currencyCode === 'JPY' && smilesRates[baseTrackingCurrency]);
            }

            const sourceClass = isSmilesUsed ? 'smiles-source' : 'std-source'; 
            const sourceNote = isSmilesUsed ? '<span style="font-size:10px; color:#28a745;">(Smiles)</span>' : '';

            if (!displayRate) return;

            const item = document.createElement('div');
            item.className = 'tracking-item';
            item.dataset.currency = currencyCode;
            item.draggable = true;
            const flagUrl = getFlagUrl(currencyCode);
            
            item.innerHTML = `
                <img class="currency-flag" src="${flagUrl}" alt="${currencyCode}" style="display: ${flagUrl ? 'block' : 'none'};">
                <div class="currency-name">
                    <strong>${currencyCode}</strong> ${sourceNote}<br>
                    <small>${commonCurrencies[currencyCode]?.name || ''}</small>
                </div>
                <div class="rate-value ${sourceClass}">
                    ${displayRate.toLocaleString('vi-VN', getRoundingOptions())}
                    <span>${baseTrackingCurrency}</span>
                </div>
                <button class="remove-currency-btn" data-currency="${currencyCode}" title="Xóa ${currencyCode}">&times;</button>
            `;
            trackingList.appendChild(item);
        });
        addDragAndDropListeners();
    }

    function populateAddCurrencyDropdown() {
        const availableCurrencies = supportedCurrencyCodes.filter(c => !trackedCurrencies.includes(c) && c !== baseTrackingCurrency);
        currencyListForAdd.innerHTML = '';
        availableCurrencies.forEach(currency => {
            const link = document.createElement('a');
            const flagUrl = getFlagUrl(currency);
            link.href = '#';
            link.dataset.currency = currency;
            link.innerHTML = `<img class="currency-flag" src="${flagUrl}" alt="${currency}"><span><strong>${currency}</strong> - ${commonCurrencies[currency]?.name || ''}</span>`;
            currencyListForAdd.appendChild(link);
        });
    }

    function updateRateDisplay() {
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;
        const rate = getConversionRate(fromCurrency, toCurrency);
        
        let isSmilesUsed = false;
        if (useSmilesMode) {
            isSmilesUsed = (fromCurrency === 'JPY' && smilesRates[toCurrency]) || (toCurrency === 'JPY' && smilesRates[fromCurrency]);
        }
        const suffix = isSmilesUsed ? ' (Smiles Wallet)' : ' (Quốc tế)';

        rateDisplay.textContent = `1 ${fromCurrency} = ${rate.toLocaleString('vi-VN', { minimumFractionDigits: 4, maximumFractionDigits: 6 })} ${toCurrency}${suffix}`;
    }

    function calculateConversion(isReverse = false) {
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;
        const rate = getConversionRate(fromCurrency, toCurrency);

        if (isReverse) {
            const toAmount = parseFormattedNumber(toAmountInput.value);
            const reverseRate = getConversionRate(toCurrency, fromCurrency);
            const convertedAmount = toAmount * reverseRate;
            fromAmountInput.value = convertedAmount.toLocaleString('de-DE', { maximumFractionDigits: 4 });
        } else {
            const fromAmount = parseFormattedNumber(fromAmountInput.value);
            const convertedAmount = fromAmount * rate;
            toAmountInput.value = convertedAmount.toLocaleString('de-DE', { maximumFractionDigits: 4 });
        }
        updateRateDisplay();
    }

    function handleAmountInput(e) {
        const input = e.target;
        input.value = formatNumber(input.value);
        calculateConversion(input.id === 'to-amount');
    }

    function handleSwap() {
        [fromCurrencySelect.value, toCurrencySelect.value] = [toCurrencySelect.value, fromCurrencySelect.value];
        updateFlag(fromCurrencySelect, fromFlag);
        updateFlag(toCurrencySelect, toFlag);
        calculateConversion();
    }

    function handleToggleSource(e) {
        useSmilesMode = e.target.checked;
        localStorage.setItem('useSmilesMode', useSmilesMode);
        updateSourceUI();
        calculateConversion();
        renderTrackingTable();
    }
    
    // ... (Các hàm Add/Remove/Drag giống cũ, giữ nguyên để tiết kiệm không gian, đảm bảo code đầy đủ)
    function handleAddCurrency(e) {
        e.preventDefault();
        const target = e.target.closest('a');
        if (target) {
            const currency = target.dataset.currency;
            if (currency && !trackedCurrencies.includes(currency)) {
                trackedCurrencies.push(currency);
                saveTrackedCurrencies();
                renderTrackingTable();
                populateAddCurrencyDropdown();
                currencyDropdown.classList.remove('show');
            }
        }
    }
    function handleRemoveCurrency(e) {
        if (e.target.classList.contains('remove-currency-btn')) {
            const currencyToRemove = e.target.dataset.currency;
            trackedCurrencies = trackedCurrencies.filter(c => c !== currencyToRemove);
            saveTrackedCurrencies();
            renderTrackingTable();
            populateAddCurrencyDropdown();
        }
    }
    function handleCurrencySearch() {
        const filter = currencySearchInput.value.toUpperCase();
        const links = currencyListForAdd.getElementsByTagName('a');
        for (let i = 0; i < links.length; i++) {
            const txtValue = links[i].textContent || links[i].innerText;
            links[i].style.display = txtValue.toUpperCase().indexOf(filter) > -1 ? "" : "none";
        }
    }
    function handleBaseCurrencyChange() {
        const newBase = this.value;
        if (!trackedCurrencies.includes(baseTrackingCurrency) && baseTrackingCurrency !== newBase) trackedCurrencies.push(baseTrackingCurrency);
        baseTrackingCurrency = newBase;
        trackedCurrencies = trackedCurrencies.filter(c => c !== baseTrackingCurrency);
        localStorage.setItem('baseTrackingCurrency', baseTrackingCurrency);
        saveTrackedCurrencies();
        renderTrackingTable();
        populateAddCurrencyDropdown();
    }
    function handleRoundingChange(e) {
        if (e.target.tagName === 'BUTTON') {
            roundingOption = e.target.dataset.round;
            localStorage.setItem('roundingOption', roundingOption);
            updateActiveRoundingButton();
            renderTrackingTable();
        }
    }
    function updateActiveRoundingButton() {
        roundingOptionsContainer.querySelectorAll('button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.round === roundingOption);
        });
    }
    let draggedItem = null;
    function addDragAndDropListeners() {
        const items = trackingList.querySelectorAll('.tracking-item');
        items.forEach(item => {
            item.addEventListener('dragstart', (e) => { draggedItem = e.currentTarget; setTimeout(() => e.currentTarget.classList.add('dragging'), 0); });
            item.addEventListener('dragend', (e) => e.currentTarget.classList.remove('dragging'));
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                const afterElement = getDragAfterElement(trackingList, e.clientY);
                if (afterElement == null) { trackingList.appendChild(draggedItem); } else { trackingList.insertBefore(draggedItem, afterElement); }
            });
            item.addEventListener('drop', () => {
                trackedCurrencies = [...trackingList.querySelectorAll('.tracking-item')].map(r => r.dataset.currency);
                saveTrackedCurrencies();
            });
        });
    }
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.tracking-item:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            return (offset < 0 && offset > closest.offset) ? { offset: offset, element: child } : closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
    const saveTrackedCurrencies = () => localStorage.setItem('trackedCurrencies', JSON.stringify(trackedCurrencies));

    async function init() {
        updateSourceUI(); // Set trạng thái ban đầu cho nút gạt
        const success = await fetchAllRates();
        
        if (success) {
            trackedCurrencies = trackedCurrencies.filter(c => c !== baseTrackingCurrency && supportedCurrencyCodes.includes(c));
            populateCurrencySelects(fromCurrencySelect);
            populateCurrencySelects(toCurrencySelect);
            populateCurrencySelects(baseCurrencySelect);
            fromCurrencySelect.value = 'JPY';
            toCurrencySelect.value = 'VND';
            baseCurrencySelect.value = baseTrackingCurrency;
            updateFlag(fromCurrencySelect, fromFlag);
            updateFlag(toCurrencySelect, toFlag);
            updateActiveRoundingButton();
            calculateConversion();
            renderTrackingTable();
            populateAddCurrencyDropdown();
        }
        
        fromCurrencySelect.addEventListener('change', () => { updateFlag(fromCurrencySelect, fromFlag); calculateConversion(); });
        toCurrencySelect.addEventListener('change', () => { updateFlag(toCurrencySelect, toFlag); calculateConversion(); });
        fromAmountInput.addEventListener('input', handleAmountInput);
        toAmountInput.addEventListener('input', handleAmountInput);
        swapButton.addEventListener('click', handleSwap);
        baseCurrencySelect.addEventListener('change', handleBaseCurrencyChange);
        trackingList.addEventListener('click', handleRemoveCurrency);
        roundingOptionsContainer.addEventListener('click', handleRoundingChange);
        addCurrencyBtn.addEventListener('click', (e) => { e.stopPropagation(); currencyDropdown.classList.toggle('show'); if (currencyDropdown.classList.contains('show')) { currencySearchInput.focus(); } });
        currencyListForAdd.addEventListener('click', handleAddCurrency);
        currencySearchInput.addEventListener('keyup', handleCurrencySearch);
        document.addEventListener('click', (e) => { if (!currencyDropdown.contains(e.target) && !addCurrencyBtn.contains(e.target)) { currencyDropdown.classList.remove('show'); } });
        
        // [MỚI] Sự kiện toggle
        sourceToggle.addEventListener('change', handleToggleSource);
    }
    init();
});