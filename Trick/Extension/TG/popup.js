// Biến trạng thái
let ratesStandard = {};
let rateSmiles = 0;
let lastFetchStandard = null;
let lastFetchSmiles = null;
let currentSource = 'standard';
let lastEdited = 1; // 1 hoặc 2 để biết người dùng đang gõ vào ô nào

// URL API (Thay link thực tế của Smiles vào đây nếu có)
const SMILES_API_URL = 'https://url-api-smiles-cua-ban.com/rate'; 

// DOM Elements
const sourceSelect = document.getElementById('sourceSelect');
const in1 = document.getElementById('in1');
const in2 = document.getElementById('in2');
const sel1 = document.getElementById('sel1');
const sel2 = document.getElementById('sel2');
const rateText = document.getElementById('rateText');
const updateTime = document.getElementById('updateTime');
const smilesWarning = document.getElementById('smilesWarning');
const popularRatesContainer = document.getElementById('popularRates');

// --- CÁC HÀM TIỆN ÍCH BỔ SUNG ---
const parseInputStr = (str) => parseFloat(str.replace(/,/g, '')) || 0;
const formatCurrency = (num) => num.toLocaleString('en-US', { maximumFractionDigits: 2 });

const renderPopularRates = () => {
    // Placeholder cho hàm của bạn
    // popularRatesContainer.innerHTML = "Các tỷ giá phổ biến...";
};

// --- CÁC HÀM FETCH API (Từ code của bạn) ---
const fetchStandardApi = async () => {
    try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await res.json();
        ratesStandard = data.rates; 
        lastFetchStandard = new Date();
        return true;
    } catch (e) { 
        console.error("Lỗi Standard API:", e);
        return false; 
    }
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
        // Chỉnh sửa theo cấu trúc JSON trả về của Smiles
        rateSmiles = parseFloat(content.Rate || 165); 
        lastFetchSmiles = new Date();
        return true;
    } catch (e) { 
        console.error("Lỗi Smiles API:", e);
        // Fallback tạm thời nếu API lỗi để bạn test
        rateSmiles = 165.5; 
        lastFetchSmiles = new Date();
        return true; 
    }
};

// --- HÀM TÍNH TOÁN CỐT LÕI ---
const calculate = () => {
    const c1 = sel1.value;
    const c2 = sel2.value;
    let rate = 0;

    if (currentSource === 'standard') {
        // ExchangeRate-API lấy USD làm gốc
        rate = ratesStandard[c2] / ratesStandard[c1];
    } else {
        // Logic riêng cho Smiles (Chỉ JPY và VND)
        if (c1 === 'JPY' && c2 === 'VND') rate = rateSmiles;
        else if (c1 === 'VND' && c2 === 'JPY') rate = 1 / rateSmiles;
        else rate = 1; // Trường hợp lỗi chọn sai tiền tệ
    }

    if (!rate || isNaN(rate)) { 
        rateText.innerHTML = "Đang tải dữ liệu..."; 
        return; 
    }

    // Cập nhật text hiển thị tỷ giá
    rateText.innerHTML = `1 ${c1} ➔ <b>${formatCurrency(rate)}</b> ${c2}`;
    
    // Cập nhật thời gian
    const updateDate = currentSource === 'standard' ? lastFetchStandard : lastFetchSmiles;
    updateTime.textContent = `Cập nhật: ${updateDate ? updateDate.toLocaleTimeString() : '--:--'}`;

    // Tính toán số tiền dựa vào ô vừa sửa cuối cùng
    if (lastEdited === 1) {
        in2.value = formatCurrency(parseInputStr(in1.value) * rate);
    } else {
        in1.value = formatCurrency(parseInputStr(in2.value) / rate);
    }
    
    renderPopularRates();
};

// --- KHỞI TẠO VÀ LẮNG NGHE SỰ KIỆN ---

// Đổi nguồn tỷ giá
sourceSelect.addEventListener('change', async (e) => {
    currentSource = e.target.value;
    
    if (currentSource === 'smiles') {
        // Ép dropdown về JPY và VND nếu chọn Smiles
        sel1.value = 'JPY';
        sel2.value = 'VND';
        smilesWarning.style.display = 'block';
        if (!lastFetchSmiles) await fetchSmilesApi();
    } else {
        smilesWarning.style.display = 'none';
        if (!lastFetchStandard) await fetchStandardApi();
    }
    calculate();
});

// Lắng nghe sự kiện thay đổi loại tiền
[sel1, sel2].forEach(sel => {
    sel.addEventListener('change', () => {
        // Ràng buộc nếu đang dùng Smiles
        if (currentSource === 'smiles') {
            if (sel1.value !== 'JPY' && sel1.value !== 'VND') sel1.value = 'JPY';
            if (sel2.value !== 'JPY' && sel2.value !== 'VND') sel2.value = 'VND';
        }
        calculate();
    });
});

// Lắng nghe sự kiện gõ phím vào ô input
in1.addEventListener('input', (e) => {
    lastEdited = 1;
    calculate();
});

in2.addEventListener('input', (e) => {
    lastEdited = 2;
    calculate();
});

// Khởi chạy khi mở popup
document.addEventListener('DOMContentLoaded', async () => {
    await fetchStandardApi();
    calculate();
});