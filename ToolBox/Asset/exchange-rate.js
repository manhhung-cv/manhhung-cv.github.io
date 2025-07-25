document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';
    const FLAG_CDN_URL = 'https://flagcdn.com/w40/';

    // --- Data Mappings ---
    const currencyFlags = {
        USD: 'us', AED: 'ae', ARS: 'ar', AUD: 'au', BGN: 'bg', BRL: 'br', BSD: 'bs', CAD: 'ca',
        CHF: 'ch', CLP: 'cl', CNY: 'cn', COP: 'co', CZK: 'cz', DKK: 'dk', DOP: 'do', EGP: 'eg',
        EUR: 'eu', FJD: 'fj', GBP: 'gb', GTQ: 'gt', HKD: 'hk', HRK: 'hr', HUF: 'hu', IDR: 'id',
        ILS: 'il', INR: 'in', ISK: 'is', JPY: 'jp', KRW: 'kr', KZT: 'kz', MXN: 'mx', MYR: 'my',
        NOK: 'no', NZD: 'nz', PAB: 'pa', PEN: 'pe', PHP: 'ph', PKR: 'pk', PLN: 'pl', PYG: 'py',
        RON: 'ro', RUB: 'ru', SAR: 'sa', SEK: 'se', SGD: 'sg', THB: 'th', TRY: 'tr', TWD: 'tw',
        UAH: 'ua', UYU: 'uy', VND: 'vn', ZAR: 'za'
    };

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

    // --- State ---
    let rates = {};
    let supportedCurrencies = [];
    let trackedCurrencies = JSON.parse(localStorage.getItem('trackedCurrencies')) || ['USD', 'EUR', 'JPY', 'CNY', 'KRW'];
    let baseTrackingCurrency = localStorage.getItem('baseTrackingCurrency') || 'VND';
    let roundingOption = localStorage.getItem('roundingOption') || 'default';

    // --- Helper Functions ---
    const getFlagUrl = (currencyCode) => {
        const countryCode = currencyFlags[currencyCode];
        return countryCode ? `${FLAG_CDN_URL}${countryCode}.png` : '';
    };
    const formatNumber = (numStr) => !numStr ? '' : parseFormattedNumber(numStr).toLocaleString('de-DE');
    const parseFormattedNumber = (str) => !str ? 0 : parseFloat(str.replace(/\./g, '').replace(/,/g, '.')) || 0;

    // --- API Functions ---
    async function fetchRates() {
        try {
            loadingMessage.style.display = 'block';
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            rates = data.rates;
            supportedCurrencies = Object.keys(rates);
            return true;
        } catch (error) {
            console.error('Failed to fetch exchange rates:', error);
            rateDisplay.textContent = 'Không thể tải dữ liệu tỷ giá.';
            loadingMessage.textContent = 'Lỗi tải dữ liệu. Vui lòng thử lại sau.';
            return false;
        } finally {
            loadingMessage.style.display = 'none';
        }
    }

    // --- Render Functions ---
    function populateCurrencySelects(selectElement) {
        const fragment = document.createDocumentFragment();
        supportedCurrencies.forEach(currency => {
            const option = new Option(currency, currency);
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

    function getRoundingOptions(value) {
        switch (roundingOption) {
            case 'integer': return { maximumFractionDigits: 0 };
            case 'two_decimals': return { minimumFractionDigits: 2, maximumFractionDigits: 2 };
            default: return { minimumFractionDigits: 2, maximumFractionDigits: 4 };
        }
    }

    function renderTrackingTable() {
        trackingList.innerHTML = '';
        if (!rates[baseTrackingCurrency]) {
            loadingMessage.textContent = `Tỷ giá cho ${baseTrackingCurrency} không có sẵn.`;
            loadingMessage.style.display = 'block';
            return;
        }
        loadingMessage.style.display = 'none';

        const baseRate = rates[baseTrackingCurrency];

        trackedCurrencies.forEach(currencyCode => {
            if (!rates[currencyCode] || currencyCode === baseTrackingCurrency) return;

            const item = document.createElement('div');
            item.className = 'tracking-item';
            item.dataset.currency = currencyCode;
            item.draggable = true;

            const targetRate = rates[currencyCode];
            const displayRate = baseRate / targetRate;
            const flagUrl = getFlagUrl(currencyCode);

            item.innerHTML = `
                        <img class="currency-flag" src="${flagUrl}" alt="${currencyCode}" style="display: ${flagUrl ? 'block' : 'none'};">
                        <div class="currency-name">${currencyCode}</div>
                        <div class="rate-value">
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
        const availableCurrencies = supportedCurrencies.filter(c => !trackedCurrencies.includes(c) && c !== baseTrackingCurrency);
        currencyListForAdd.innerHTML = '';

        availableCurrencies.forEach(currency => {
            const link = document.createElement('a');
            const flagUrl = getFlagUrl(currency);
            link.href = '#';
            link.dataset.currency = currency;
            link.innerHTML = `
                        <img class="currency-flag" src="${flagUrl}" alt="${currency}" style="display: ${flagUrl ? 'block' : 'none'};">
                        <span>${currency}</span>
                    `;
            currencyListForAdd.appendChild(link);
        });
    }

    // --- Calculation & Display ---
    function updateRateDisplay() {
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;
        const fromRate = rates[fromCurrency];
        const toRate = rates[toCurrency];

        if (fromRate && toRate) {
            const singleUnitRate = (1 / fromRate) * toRate;
            rateDisplay.textContent = `1 ${fromCurrency} = ${singleUnitRate.toLocaleString('vi-VN', { minimumFractionDigits: 4, maximumFractionDigits: 6 })} ${toCurrency}`;
        }
    }

    function calculateConversion(isReverse = false) {
        if (!Object.keys(rates).length) return;

        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;

        if (isReverse) {
            const toAmount = parseFormattedNumber(toAmountInput.value);
            const convertedAmount = (toAmount / rates[toCurrency]) * rates[fromCurrency];
            fromAmountInput.value = convertedAmount.toLocaleString('de-DE', { maximumFractionDigits: 0 });
        } else {
            const fromAmount = parseFormattedNumber(fromAmountInput.value);
            const convertedAmount = (fromAmount / rates[fromCurrency]) * rates[toCurrency];
            toAmountInput.value = convertedAmount.toLocaleString('de-DE', { maximumFractionDigits: 0 });
        }
        updateRateDisplay();
    }

    // --- Event Handlers ---
    function handleAmountInput(e) {
        const input = e.target;
        input.value = formatNumber(input.value);
        calculateConversion(input.id === 'to-amount');
    }

    function handleSwap() {
        const fromVal = fromCurrencySelect.value;
        const toVal = toCurrencySelect.value;
        fromCurrencySelect.value = toVal;
        toCurrencySelect.value = fromVal;

        updateFlag(fromCurrencySelect, fromFlag);
        updateFlag(toCurrencySelect, toFlag);
        calculateConversion();
    }

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
        if (!trackedCurrencies.includes(baseTrackingCurrency) && baseTrackingCurrency !== newBase) {
            trackedCurrencies.push(baseTrackingCurrency);
        }
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

    // --- Drag and Drop ---
    let draggedItem = null;
    function addDragAndDropListeners() {
        const items = trackingList.querySelectorAll('.tracking-item');
        items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                draggedItem = e.currentTarget;
                setTimeout(() => e.currentTarget.classList.add('dragging'), 0);
            });
            item.addEventListener('dragend', (e) => e.currentTarget.classList.remove('dragging'));
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                const afterElement = getDragAfterElement(trackingList, e.clientY);
                if (afterElement == null) { trackingList.appendChild(draggedItem); }
                else { trackingList.insertBefore(draggedItem, afterElement); }
            });
            item.addEventListener('drop', () => {
                const newOrder = [...trackingList.querySelectorAll('.tracking-item')].map(r => r.dataset.currency);
                trackedCurrencies = newOrder;
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

    // --- Utility ---
    const saveTrackedCurrencies = () => localStorage.setItem('trackedCurrencies', JSON.stringify(trackedCurrencies));

    // --- Initialization ---
    async function init() {
        const success = await fetchRates();
        if (success) {
            trackedCurrencies = trackedCurrencies.filter(c => c !== baseTrackingCurrency);
            populateCurrencySelects(fromCurrencySelect);
            populateCurrencySelects(toCurrencySelect);
            populateCurrencySelects(baseCurrencySelect);

            fromCurrencySelect.value = 'VND';
            toCurrencySelect.value = 'USD';
            baseCurrencySelect.value = baseTrackingCurrency;

            updateFlag(fromCurrencySelect, fromFlag);
            updateFlag(toCurrencySelect, toFlag);
            updateActiveRoundingButton();
            calculateConversion();
            renderTrackingTable();
            populateAddCurrencyDropdown();
        }

        // Event Listeners
        fromCurrencySelect.addEventListener('change', () => { updateFlag(fromCurrencySelect, fromFlag); calculateConversion(); });
        toCurrencySelect.addEventListener('change', () => { updateFlag(toCurrencySelect, toFlag); calculateConversion(); });
        fromAmountInput.addEventListener('input', handleAmountInput);
        toAmountInput.addEventListener('input', handleAmountInput);
        swapButton.addEventListener('click', handleSwap);

        baseCurrencySelect.addEventListener('change', handleBaseCurrencyChange);
        trackingList.addEventListener('click', handleRemoveCurrency);
        roundingOptionsContainer.addEventListener('click', handleRoundingChange);

        addCurrencyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currencyDropdown.classList.toggle('show');
            if (currencyDropdown.classList.contains('show')) { currencySearchInput.focus(); }
        });
        currencyListForAdd.addEventListener('click', handleAddCurrency);
        currencySearchInput.addEventListener('keyup', handleCurrencySearch);

        document.addEventListener('click', (e) => {
            if (!currencyDropdown.contains(e.target) && !addCurrencyBtn.contains(e.target)) {
                currencyDropdown.classList.remove('show');
            }
        });
    }

    init();
});