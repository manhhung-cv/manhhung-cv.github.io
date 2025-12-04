const SCRAPINGBEE_KEYS = ["YFH8ZPMDE27ABK3HAVVALLVZLVAF4PNMDYE12GSH2ILVSQ5AVLTGMTUZCDNG2SAGCII7PKXLZWJI7GD7"];
const LOCAL_KEY = 'smiles_rate_data';
let currentRate = 0;
let isReverseMode = false;

// Đợi HTML load xong mới chạy code
document.addEventListener('DOMContentLoaded', function() {
    // 1. Gắn sự kiện cho các nút và input
    document.getElementById('modeToggle').addEventListener('change', toggleMode);
    document.getElementById('inputJPY').addEventListener('input', function(e) { formatNumberInput(e.target); });
    document.getElementById('inputVND').addEventListener('input', function(e) { formatNumberInput(e.target); });
    document.getElementById('inputPoints').addEventListener('input', function(e) { formatNumberInput(e.target); });
    
    document.getElementById('btnRefresh').addEventListener('click', forceUpdateRate);
    
    // Sự kiện nút copy (đã xử lý logic riêng biệt)
    document.getElementById('btnCopyReal').addEventListener('click', function() {
        copyContent('realSendDisplay', 'tooltipReal');
    });
    document.getElementById('btnCopyTotal').addEventListener('click', function() {
        copyContent('totalPayDisplay', 'tooltipTotal');
    });

    // 2. Khởi tạo dữ liệu
    init();
});

function saveRate(rate) {
    const timeStr = new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
    
    // Lưu vào LocalStorage (cho popup dùng)
    localStorage.setItem(LOCAL_KEY, JSON.stringify({ rate: rate, time: timeStr }));
    
    // [MỚI] Lưu vào Chrome Storage (cho Background dùng để tính toán chuột phải)
    chrome.storage.local.set({ 'savedRate': rate });
}

function getRate() {
    const data = localStorage.getItem(LOCAL_KEY);
    return data ? JSON.parse(data) : null;
}

function formatNumber(num) { return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

function getRawValue(id) { 
    const el = document.getElementById(id);
    if (!el) return 0;
    const val = el.value.replace(/,/g, '');
    return val ? parseInt(val) : 0; 
}

function formatNumberInput(input) {
    let value = input.value.replace(/,/g, '');
    if (!value) { 
        input.value = ''; 
        calculate(input.id === 'inputPoints' ? 'inputJPY' : input.id); 
        return; 
    }
    input.value = parseInt(value).toLocaleString('en-US');
    calculate(input.id === 'inputPoints' ? 'inputJPY' : input.id);
}

function toggleMode() {
    const toggle = document.getElementById('modeToggle');
    isReverseMode = toggle.checked;
    
    const lblMode = document.getElementById('modeLabel');
    const lblSub = document.getElementById('modeSub');
    const lblJPY = document.getElementById('labelJPY');
    const containerJPY = document.getElementById('containerJPY');
    const rowReal = document.getElementById('rowRealSend');
    const lblTotal = document.getElementById('labelTotal');

    if (isReverseMode) {
        lblMode.innerText = "Chế độ: Đã bao gồm phí";
        lblMode.style.color = "var(--success)";
        lblSub.innerText = "Bạn có tổng bao nhiêu tiền?";
        
        lblJPY.innerText = "Tổng tiền bạn có (JPY)";
        lblJPY.style.color = "var(--success)";
        containerJPY.classList.add('highlight');
        
        rowReal.style.display = 'flex'; 
        lblTotal.innerText = "Tổng thanh toán (Bằng số tiền nhập)";
    } else {
        lblMode.innerText = "Chế độ: Thường (Cộng thêm phí)";
        lblMode.style.color = "#555";
        lblSub.innerText = "Nhập số tiền muốn gửi đi";

        lblJPY.innerText = "Bạn gửi đi (Tiền gốc)";
        lblJPY.style.color = "#888";
        containerJPY.classList.remove('highlight');

        rowReal.style.display = 'none'; 
        lblTotal.innerText = "Tổng thanh toán (Gốc + Phí - Điểm)";
    }
    calculate('inputJPY');
}

function getFee(amount) {
    if (amount <= 0) return 0;
    if (amount <= 10000) return 380;
    if (amount <= 50000) return 450;
    if (amount <= 100000) return 760;
    if (amount <= 300000) return 980;
    if (amount <= 1000000) return 1700;
    return 0;
}

function getPoints(amount) {
    if (amount <= 0) return 0;
    if (amount <= 10000) return 10;
    if (amount <= 50000) return 20;
    if (amount <= 100000) return 50;
    if (amount <= 300000) return 100;
    return 150;
}

function calculate(source) {
    if (currentRate === 0) return;

    const elJPY = document.getElementById('inputJPY');
    const elVND = document.getElementById('inputVND');
    
    let valJPY = getRawValue('inputJPY'); 
    let valPoints = getRawValue('inputPoints');
    
    let realSend = 0;
    let fee = 0;
    let totalPay = 0;

    if (isReverseMode) {
        if (source === 'inputVND') {
            let vndVal = getRawValue('inputVND');
            realSend = Math.ceil(vndVal / currentRate);
            fee = getFee(realSend);
            totalPay = realSend + fee - valPoints;
            if (totalPay < 0) totalPay = 0;
            elJPY.value = formatNumber(totalPay);
        } else {
            let budget = valJPY + valPoints;
            let tempFee = 0;
            if (budget >= 301700) tempFee = 1700;
            else if (budget >= 100980) tempFee = 980;
            else if (budget >= 50760) tempFee = 760;
            else if (budget >= 10450) tempFee = 450;
            else if (budget >= 680) tempFee = 380;
            else tempFee = 0;

            realSend = budget - tempFee;
            let exactFee = getFee(realSend);
            if (exactFee !== tempFee) {
                realSend = budget - exactFee;
            }
            if (realSend < 0) realSend = 0;

            if (source !== 'inputVND') elVND.value = formatNumber(Math.floor(realSend * currentRate));
            fee = getFee(realSend);
            totalPay = valJPY; 
        }
    } else {
        if (source === 'inputVND') {
            let vndVal = getRawValue('inputVND');
            valJPY = Math.ceil(vndVal / currentRate);
            elJPY.value = formatNumber(valJPY);
        }
        realSend = valJPY; 
        if (source !== 'inputVND') elVND.value = formatNumber(Math.floor(realSend * currentRate));
        fee = getFee(realSend);
        totalPay = realSend + fee - valPoints;
        if (totalPay < 0) totalPay = 0;
    }

    document.getElementById('feeDisplay').innerText = `¥${formatNumber(fee)}`;
    document.getElementById('pointDisplay').innerText = `+${getPoints(realSend)} pts`;
    document.getElementById('realSendDisplay').innerText = `¥${formatNumber(realSend)}`;
    document.getElementById('totalPayDisplay').innerText = `¥${formatNumber(totalPay)}`;
}

async function copyContent(elementId, tooltipId) {
    const text = document.getElementById(elementId).innerText;
    const raw = text.replace(/[^\d]/g, ''); 
    
    try {
        await navigator.clipboard.writeText(raw);
        const tooltip = document.getElementById(tooltipId);
        tooltip.classList.add('show');
        setTimeout(() => tooltip.classList.remove('show'), 1500);
    } catch (err) {
        console.error('Lỗi copy', err);
    }
}

function updateStatus(rate, timeStr) {
    const elRate = document.getElementById('rateDisplay');
    const elTime = document.getElementById('lastUpdatedTime');
    currentRate = rate;
    elRate.innerText = `1 JPY = ${rate} VND`;
    elRate.style.color = "var(--success)";
    if (timeStr) {
        elTime.innerText = `Cập nhật lúc: ${timeStr}`;
        elTime.style.display = 'block';
    }
    calculate('inputJPY');
}

async function forceUpdateRate() {
    const btn = document.getElementById('btnRefresh');
    const elRate = document.getElementById('rateDisplay');
    btn.classList.add('loading');
    elRate.innerText = "Đang kết nối Smiles...";
    elRate.style.color = "#e65100";

    const targetUrl = 'https://www.smileswallet.com/japan/vi/ty-gia/';
    const rules = { "currencies": { "selector": ".currency", "type": "list", "output": { "country": ".country_name", "rate": ".exchange_rate" } } };
    
    let newRate = 0;
    for (let key of SCRAPINGBEE_KEYS) {
        if (!key) continue;
        try {
            const url = `https://app.scrapingbee.com/api/v1/?api_key=${key}&url=${encodeURIComponent(targetUrl)}&extract_rules=${encodeURIComponent(JSON.stringify(rules))}&render_js=false`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                const vnData = data.currencies?.find(c => c.country.includes("Vietnam") || c.country.includes("Việt Nam"));
                if (vnData) {
                    const match = vnData.rate.match(/([\d,.]+)/);
                    if (match) { newRate = parseFloat(match[0].replace(/,/g, '')); break; }
                }
            }
        } catch (e) { console.warn("API Error", e); }
    }

    btn.classList.remove('loading');
    if (newRate > 0) {
        saveRate(newRate);
        updateStatus(newRate, new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }));
    } else {
        elRate.innerText = "⚠️ Lỗi cập nhật. Dùng tỷ giá cũ.";
        elRate.style.color = "var(--error)";
        if(currentRate === 0) currentRate = 165.5; 
        calculate('inputJPY');
    }
}

function init() {
    const cache = getRate();
    if (cache && cache.rate) updateStatus(cache.rate, cache.time);
    else forceUpdateRate();
}
// ... Các code cũ giữ nguyên ...

// Tìm đến hàm init() ở cuối file và thay thế bằng đoạn này:
function init() {
    // 1. Lấy tỷ giá đã lưu (code cũ)
    const cache = getRate();
    if (cache && cache.rate) updateStatus(cache.rate, cache.time);
    else forceUpdateRate();

    // 2. [MỚI] Kiểm tra xem có số tiền nào từ Menu chuột phải gửi sang không
    chrome.storage.local.get(['pendingAmount'], function(result) {
        if (result.pendingAmount) {
            const amount = parseInt(result.pendingAmount);
            
            // Điền vào ô JPY
            const elJPY = document.getElementById('inputJPY');
            elJPY.value = formatNumber(amount);
            
            // Tính toán ngay
            calculate('inputJPY');

            // Xóa dữ liệu tạm (để lần sau mở không bị tự điền lại số cũ)
            chrome.storage.local.remove('pendingAmount');
            
            // Xóa Badge OK (nếu còn)
            chrome.action.setBadgeText({ text: "" });
        }
    });
}