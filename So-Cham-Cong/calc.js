// calc.js - Phiên bản nâng cấp

// === ELEMENTS ===
const inputs = {
    luongGio: document.getElementById('luongGio'),
    luongGioTangCa: document.getElementById('luongGioTangCa'),
    luongGioNgayLe: document.getElementById('luongGioNgayLe'),
    troCapNgay: document.getElementById('troCapNgay'),
    troCapThang: document.getElementById('troCapThang')
};

const outputs = {
    basic: document.getElementById('out-basic-salary'),
    ot: document.getElementById('out-ot-salary'),
    holiday: document.getElementById('out-holiday-salary'),
    allowance: document.getElementById('out-allowance'),
    gross: document.getElementById('out-gross-income'),
    deduct: document.getElementById('out-total-deduct'),
    net: document.getElementById('out-net-salary'),
    expense: document.getElementById('out-total-expense'),
    balance: document.getElementById('out-final-balance')
};

const containers = {
    insurance: document.getElementById('insurance-list'),
    expense: document.getElementById('expense-list'),
    insuranceTotal: document.getElementById('total-insurance'),
    expenseTotal: document.getElementById('total-expense'),
    historyBody: document.getElementById('salary-history-body')
};

const ctrls = {
    prev: document.getElementById('prevMonthCalcBtn'),
    next: document.getElementById('nextMonthCalcBtn'),
    label: document.getElementById('currentMonthCalcYear'),
    saveHistory: document.getElementById('saveHistoryBtn')
};

// === STATE & DATA ===
const STORAGE_KEY = 'fts_salary_config_v3';
const HISTORY_KEY = 'fts_salary_history';

let currentCalcDate = new Date();

// Cấu trúc dữ liệu mặc định
window.salaryData = {
    rates: {
        hour: 0,
        ot: 0,
        holiday: 0,
        subDaily: 0,
        subMonthly: 0
    },
    // Danh sách mặc định
    insurances: [
        { id: 'bhyt', name: 'BHYT', value: 0 },
        { id: 'bhxh', name: 'BHXH', value: 0 },
        { id: 'thue', name: 'Thuế TNCN', value: 0 }
    ],
    expenses: [
        { id: 'food', name: 'Ăn uống', value: 0 },
        { id: 'internet', name: 'Internet/4G', value: 0 },
        { id: 'moving', name: 'Di chuyển', value: 0 }
    ],
    currency: 'JPY'
};

// === LOGIC ===

// 1. Lấy dữ liệu công từ Timesheet
function getWorkData(dateRef) {
    let stats = {
        daysWorked: 0, // Số ngày làm
        basicHours: 0, // Giờ làm cơ bản
        otHours: 0,    // Giờ tăng ca thường
        holidayHours: 0 // Giờ làm ngày lễ
    };

    if (typeof window.getCalculationPeriod !== 'function' || !window.timesheetEntries) {
        return stats;
    }

    const { startDate, endDate } = window.getCalculationPeriod(dateRef);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const entry = window.timesheetEntries[dateStr];

        if (entry) {
            // Xử lý ngày làm việc thường & OT thường
            if (entry.type === 'work' || entry.type === 'work_ot') {
                stats.daysWorked++; 
                stats.basicHours += window.baseWorkHours || 8; // Giả định 8h nếu chưa set
                stats.otHours += (entry.overtimeHours || 0) + (entry.overtimeMinutes || 0) / 60;
            } 
            // Xử lý làm ngày lễ (Chỉ tính vào lương ngày lễ, không cộng ngày công thường nếu muốn tách biệt)
            else if (entry.type === 'holiday_work') {
                // Tùy chính sách: Có thể vẫn tính là 1 ngày công để nhận phụ cấp ngày
                stats.daysWorked++; 
                stats.holidayHours += (entry.overtimeHours || 0) + (entry.overtimeMinutes || 0) / 60;
            }
        }
    }
    return stats;
}

// 2. Hàm tính toán chính
function calculateSalary() {
    const data = getWorkData(currentCalcDate);
    const rates = window.salaryData.rates;

    // A. Thu nhập
    const valBasic = data.basicHours * rates.hour;
    const valOT = data.otHours * rates.ot;
    const valHoliday = data.holidayHours * rates.holiday;
    const valAllowance = (data.daysWorked * rates.subDaily) + rates.subMonthly;
    
    const valGross = valBasic + valOT + valHoliday + valAllowance;

    // B. Khấu trừ (Bảo hiểm/Thuế)
    let valDeduct = 0;
    window.salaryData.insurances.forEach(item => valDeduct += item.value);

    // C. Thực nhận (Về túi)
    const valNet = valGross - valDeduct;

    // D. Chi phí sinh hoạt
    let valExpense = 0;
    window.salaryData.expenses.forEach(item => valExpense += item.value);

    // E. Dư còn lại
    const valBalance = valNet - valExpense;

    // === CẬP NHẬT UI ===
    outputs.basic.textContent = formatMoney(valBasic);
    outputs.ot.textContent = formatMoney(valOT);
    outputs.holiday.textContent = formatMoney(valHoliday);
    outputs.allowance.textContent = formatMoney(valAllowance);
    outputs.gross.textContent = formatMoney(valGross);
    
    outputs.deduct.textContent = formatMoney(valDeduct);
    outputs.net.textContent = formatMoney(valNet);
    
    outputs.expense.textContent = formatMoney(valExpense);
    outputs.balance.textContent = formatMoney(valBalance);

    containers.insuranceTotal.textContent = formatMoney(valDeduct);
    containers.expenseTotal.textContent = formatMoney(valExpense);

    return { valGross, valNet, valBalance }; // Trả về để dùng lưu lịch sử
}

// 3. Render danh sách động (Bảo hiểm / Chi phí)
function renderDynamicList(type) {
    const list = type === 'insurance' ? window.salaryData.insurances : window.salaryData.expenses;
    const container = type === 'insurance' ? containers.insurance : containers.expense;
    
    container.innerHTML = ''; // Xóa cũ

    list.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'dynamic-item';
        div.innerHTML = `
            <input type="text" placeholder="Tên mục" value="${item.name}" onchange="updateItem('${type}', ${index}, 'name', this.value)">
            <input type="number" placeholder="Số tiền" value="${item.value}" onchange="updateItem('${type}', ${index}, 'value', this.value)">
            <button class="btn-remove" onclick="removeItem('${type}', ${index})"><i class="fas fa-times"></i></button>
        `;
        container.appendChild(div);
    });
}

// === CÁC HÀM GỌI TỪ UI ===

// Thêm mục mới
window.addDynamicItem = (type) => {
    const list = type === 'insurance' ? window.salaryData.insurances : window.salaryData.expenses;
    list.push({ name: '', value: 0 });
    renderDynamicList(type);
    saveConfig();
};

// Xóa mục
window.removeItem = (type, index) => {
    const list = type === 'insurance' ? window.salaryData.insurances : window.salaryData.expenses;
    list.splice(index, 1);
    renderDynamicList(type);
    calculateSalary();
    saveConfig();
};

// Cập nhật giá trị mục
window.updateItem = (type, index, key, val) => {
    const list = type === 'insurance' ? window.salaryData.insurances : window.salaryData.expenses;
    if (key === 'value') val = parseFloat(val) || 0;
    list[index][key] = val;
    calculateSalary();
    saveConfig();
};

// Lưu cấu hình (Rates + Lists)
function saveConfig() {
    // Lưu Inputs
    window.salaryData.rates.hour = parseFloat(inputs.luongGio.value) || 0;
    window.salaryData.rates.ot = parseFloat(inputs.luongGioTangCa.value) || 0;
    window.salaryData.rates.holiday = parseFloat(inputs.luongGioNgayLe.value) || 0;
    window.salaryData.rates.subDaily = parseFloat(inputs.troCapNgay.value) || 0;
    window.salaryData.rates.subMonthly = parseFloat(inputs.troCapThang.value) || 0;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(window.salaryData));
}

// Tải cấu hình
function loadConfig() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        Object.assign(window.salaryData, JSON.parse(saved));
    }

    // Fill Inputs
    inputs.luongGio.value = window.salaryData.rates.hour;
    inputs.luongGioTangCa.value = window.salaryData.rates.ot;
    inputs.luongGioNgayLe.value = window.salaryData.rates.holiday;
    inputs.troCapNgay.value = window.salaryData.rates.subDaily;
    inputs.troCapThang.value = window.salaryData.rates.subMonthly;

    // Render Lists
    renderDynamicList('insurance');
    renderDynamicList('expense');
}

// === LỊCH SỬ ===
function loadHistory() {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    containers.historyBody.innerHTML = '';
    
    history.slice().reverse().forEach((item, idx) => { // Đảo ngược để thấy mới nhất
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.month}</td>
            <td class="text-green">${formatMoney(item.income)}</td>
            <td class="text-blue bold">${formatMoney(item.balance)}</td>
            <td><button class="btn-remove" onclick="deleteHistory(${history.length - 1 - idx})"><i class="fas fa-trash"></i></button></td>
        `;
        containers.historyBody.appendChild(tr);
    });
}

ctrls.saveHistory.addEventListener('click', () => {
    const { valGross, valBalance } = calculateSalary();
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    
    const timeLabel = ctrls.label.textContent;
    
    // Kiểm tra xem tháng này đã lưu chưa, nếu có thì update
    const existingIdx = history.findIndex(h => h.month === timeLabel);
    const newEntry = {
        month: timeLabel,
        income: valGross,
        balance: valBalance,
        savedAt: new Date().toISOString()
    };

    if (existingIdx >= 0) {
        if(confirm('Tháng này đã có trong lịch sử. Bạn muốn ghi đè không?')) {
            history[existingIdx] = newEntry;
        } else return;
    } else {
        history.push(newEntry);
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    loadHistory();
    window.showToast('Đã lưu bảng lương!');
});

window.deleteHistory = (realIdx) => {
    if(!confirm('Xóa bản ghi này?')) return;
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    history.splice(realIdx, 1);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    loadHistory();
};

// === UTILS ===
// === UTILS ===

// Hàm định dạng tiền tệ dựa trên window.currentCurrency
function formatMoney(num) {
    // 1. Lấy loại tiền tệ từ biến toàn cục (do script.js quản lý)
    const currencyCode = window.currentCurrency || 'VND';

    // 2. Chọn locale hiển thị phù hợp (Để dấu phẩy/chấm và ký hiệu tiền tệ hiển thị đúng chuẩn quốc gia đó)
    const localeMap = {
        'VND': 'vi-VN', // Việt Nam: 1.000.000 ₫
        'JPY': 'ja-JP', // Nhật Bản: ¥1,000,000
        'USD': 'en-US', // Mỹ: $1,000,000.00
        'EUR': 'de-DE', // Châu Âu: 1.000.000,00 €
        'KRW': 'ko-KR'  // Hàn Quốc: ₩1,000,000
    };

    const locale = localeMap[currencyCode] || 'vi-VN';

    try {
        return num.toLocaleString(locale, {
            style: 'currency',
            currency: currencyCode,
            // Nếu là VND hoặc JPY thì thường không cần số thập phân, USD thì cần
            maximumFractionDigits: (currencyCode === 'VND' || currencyCode === 'JPY' || currencyCode === 'KRW') ? 0 : 2
        });
    } catch (e) {
        // Fallback an toàn nếu trình duyệt cũ không hỗ trợ
        console.warn('Lỗi định dạng tiền:', e);
        return num.toLocaleString() + ' ' + currencyCode;
    }
}

function updateHeader() {
    if (window.displayMode === 'workPeriod' && window.getCalculationPeriod) {
        const { startDate, endDate } = window.getCalculationPeriod(currentCalcDate);
        ctrls.label.textContent = `${startDate.getDate()}/${startDate.getMonth() + 1} - ${endDate.getDate()}/${endDate.getMonth() + 1}`;
    } else {
        ctrls.label.textContent = `Tháng ${currentCalcDate.getMonth() + 1}, ${currentCalcDate.getFullYear()}`;
    }
}

// === INIT ===
// Gắn event listener cho các input tĩnh
Object.values(inputs).forEach(input => {
    input.addEventListener('input', () => {
        saveConfig();
        calculateSalary();
    });
});

ctrls.prev.addEventListener('click', () => {
    // Logic chuyển tháng (giữ nguyên logic cũ của bạn)
    if (window.displayMode === 'workPeriod') {
         const { startDate } = window.getCalculationPeriod(currentCalcDate);
         startDate.setDate(startDate.getDate() - 1);
         currentCalcDate = startDate;
    } else {
        currentCalcDate.setMonth(currentCalcDate.getMonth() - 1);
    }
    updateHeader();
    calculateSalary();
});

ctrls.next.addEventListener('click', () => {
     if (window.displayMode === 'workPeriod') {
         const { endDate } = window.getCalculationPeriod(currentCalcDate);
         endDate.setDate(endDate.getDate() + 1);
         currentCalcDate = endDate;
    } else {
        currentCalcDate.setMonth(currentCalcDate.getMonth() + 1);
    }
    updateHeader();
    calculateSalary();
});

window.initCalcTab = () => {
    loadConfig();
    updateHeader();
    calculateSalary();
    loadHistory();
};