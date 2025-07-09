// calc.js

// Lấy các phần tử HTML từ tabMayTinh
const luongGioInput = document.getElementById('luongGio');
const luongTangCaGioInput = document.getElementById('luongTangCaGio');
const troCapCoDinhInput = document.getElementById('troCapCoDinh');
const troCapLinhHoatInput = document.getElementById('troCapLinhHoat');
const phiKhacInput = document.getElementById('phiKhac');
const luuDuLieuBtn = document.getElementById('luuDuLieuBtn');

const luongCoBanSpan = document.getElementById('luongCoBan');
const luongTangCaSpan = document.getElementById('luongTangCa');
const tongLuongSpan = document.getElementById('tongLuong');

const gioTangCaGiaDinhInput = document.getElementById('gioTangCaGiaDinh');
const soGioLamCoBanGiaDinhSpan = document.getElementById('soGioLamCoBanGiaDinh');
const soGioLamTangCaGiaDinhSpan = document.getElementById('soGioLamTangCaGiaDinh');
const duDoanLuongCoBanSpan = document.getElementById('duDoanLuongCoBan');
const duDoanLuongTangCaSpan = document.getElementById('duDoanLuongTangCa');
const tongLuongDuDoanSpan = document.getElementById('tongLuongDuDoan');

// Các phần tử điều khiển tháng cho dashboard lương
const prevMonthCalcBtn = document.getElementById('prevMonthCalcBtn');
const nextMonthCalcBtn = document.getElementById('nextMonthCalcBtn');
const currentMonthCalcYearElement = document.getElementById('currentMonthCalcYear');

// Khóa LocalStorage cho dữ liệu lương
// Thay đổi hằng số key
const getLuongDataKey = (uid) => `ts_luongData_${uid}`;

// Lưu trữ dữ liệu lương (sẽ lưu vào localStorage)
let luongData = {
    luongGio: 0,
    luongTangCaGio: 0,
    troCapCoDinh: 0,
    troCapLinhHoat: 0,
    phiKhac: 0,
    gioTangCaGiaDinh: 0,
    currency: 'VND'
};

// Biến để theo dõi tháng/năm hiện tại cho dashboard lương
let currentCalcDate = new Date();

// Hàm tính toán lương
function tinhLuongCoBan(soGioLam, luongGio) {
    return soGioLam * luongGio;
}

function tinhLuongTangCa(soGioTangCa, luongTangCaGio) {
    return soGioTangCa * luongTangCaGio;
}

function tinhTongLuong(luongCoBan, luongTangCa, troCapCoDinh, troCapLinhHoat, phiKhac) {
    return luongCoBan + luongTangCa + troCapCoDinh + troCapLinhHoat + phiKhac;
}

// Lấy số giờ làm từ dữ liệu chấm công (timesheetEntries) và lịch (scheduleData)
// Nhận tham số dateRef để tính toán cho tháng cụ thể trên dashboard
function getSoGioLamActual(dateRef) {
    let tongSoGioLamActual = 0;
    let tongSoGioTangCaActual = 0;

    // Tính toán chu kỳ công dựa trên dateRef (tháng hiện tại của dashboard lương)
    const year = dateRef.getFullYear();
    const month = dateRef.getMonth();

    let workPeriodStartMonthRef = month;
    let workPeriodStartYearRef = year;

    // startWorkDay được định nghĩa trong script.js và là global (window.startWorkDay)
    if (dateRef.getDate() < window.startWorkDay) {
        workPeriodStartMonthRef = (workPeriodStartMonthRef === 0) ? 11 : workPeriodStartMonthRef - 1;
        workPeriodStartYearRef = (month === 0) ? workPeriodStartYearRef - 1 : workPeriodStartYearRef;
    }

    const startStatsDate = new Date(workPeriodStartYearRef, workPeriodStartMonthRef, window.startWorkDay);
    startStatsDate.setHours(0, 0, 0, 0);

    const endStatsDate = new Date(workPeriodStartYearRef, workPeriodStartMonthRef + 1, window.startWorkDay - 1);
    endStatsDate.setHours(23, 59, 59, 999);

    for (let d = new Date(startStatsDate); d <= endStatsDate; d.setDate(d.getDate() + 1)) {
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        // timesheetEntries được định nghĩa trong script.js và là global (window.timesheetEntries)
        const entry = window.timesheetEntries[dateStr];

        if (entry && (entry.type === 'work' || entry.type === 'work_ot')) {
            // baseWorkHours được định nghĩa trong script.js và là global (window.baseWorkHours)
            tongSoGioLamActual += window.baseWorkHours;
            tongSoGioTangCaActual += (entry.overtimeHours || 0) + (entry.overtimeMinutes || 0) / 60;
        }
    }
    return { tongSoGioLamActual, tongSoGioTangCaActual };
}


// Lấy số ngày làm việc theo lịch trong tháng (dùng cho giả định)
// Nhận tham số dateRef để tính toán cho tháng cụ thể trên dashboard
function getSoNgayLamViecTrongThang(dateRef) {
    let soNgayLamViecTheoLich = 0;

    // Lấy chu kỳ công dựa trên dateRef (tháng hiện tại của dashboard lương)
    const year = dateRef.getFullYear();
    const month = dateRef.getMonth();

    let workPeriodStartMonthRef = month;
    let workPeriodStartYearRef = year;

    // startWorkDay được định nghĩa trong script.js và là global (window.startWorkDay)
    if (dateRef.getDate() < window.startWorkDay) {
        workPeriodStartMonthRef = (workPeriodStartMonthRef === 0) ? 11 : workPeriodStartMonthRef - 1;
        workPeriodStartYearRef = (month === 0) ? workPeriodStartYearRef - 1 : workPeriodStartYearRef;
    }

    const startPeriodDate = new Date(workPeriodStartYearRef, workPeriodStartMonthRef, window.startWorkDay);
    startPeriodDate.setHours(0,0,0,0);

    const endPeriodDate = new Date(workPeriodStartYearRef, workPeriodStartMonthRef + 1, window.startWorkDay - 1);
    endPeriodDate.setHours(23,59,59,999);

    for (let d = new Date(startPeriodDate); d <= endPeriodDate; d.setDate(d.getDate() + 1)) {
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        // scheduleData được định nghĩa trong script.js và là global (window.scheduleData)
        if (window.scheduleData[dateStr] === 'ca-ngay' || window.scheduleData[dateStr] === 'ca-dem') {
            soNgayLamViecTheoLich++;
        }
    }
    return soNgayLamViecTheoLich;
}


// Cập nhật giao diện với dữ liệu lương thực tế
function updateLuongUI() {
    // Sử dụng currentCalcDate để tính toán thống kê
    const { tongSoGioLamActual, tongSoGioTangCaActual } = getSoGioLamActual(currentCalcDate);
    const luongCoBan = tinhLuongCoBan(tongSoGioLamActual, luongData.luongGio);
    const luongTangCa = tinhLuongTangCa(tongSoGioTangCaActual, luongData.luongTangCaGio);
    const tongLuong = tinhTongLuong(luongCoBan, luongTangCa, luongData.troCapCoDinh, luongData.troCapLinhHoat, luongData.phiKhac);

    luongCoBanSpan.textContent = formatCurrency(luongCoBan, luongData.currency);
    luongTangCaSpan.textContent = formatCurrency(luongTangCa, luongData.currency);
    tongLuongSpan.textContent = formatCurrency(tongLuong, luongData.currency);
}

// Cập nhật giao diện với dữ liệu lương dự kiến
function updateLuongDuKienUI() {
    // Sử dụng currentCalcDate để tính toán thống kê
    const soNgayLamViecTrongThang = getSoNgayLamViecTrongThang(currentCalcDate);
    // baseWorkHours được định nghĩa trong script.js và là global (window.baseWorkHours)
    const soGioLamCoBanGiaDinh = soNgayLamViecTrongThang * window.baseWorkHours;
    const soGioLamTangCaGiaDinh = parseFloat(gioTangCaGiaDinhInput.value) || 0;

    const duDoanLuongCoBan = tinhLuongCoBan(soGioLamCoBanGiaDinh, luongData.luongGio);
    const duDoanLuongTangCa = tinhLuongTangCa(soGioLamTangCaGiaDinh, luongData.luongTangCaGio);
    const tongLuongDuDoan = tinhTongLuong(duDoanLuongCoBan, duDoanLuongTangCa, luongData.troCapCoDinh, luongData.troCapLinhHoat, luongData.phiKhac);

    soGioLamCoBanGiaDinhSpan.textContent = `${soGioLamCoBanGiaDinh.toFixed(1)} giờ`;
    soGioLamTangCaGiaDinhSpan.textContent = `${soGioLamTangCaGiaDinh.toFixed(1)} giờ`;
    duDoanLuongCoBanSpan.textContent = formatCurrency(duDoanLuongCoBan, luongData.currency);
    duDoanLuongTangCaSpan.textContent = formatCurrency(duDoanLuongTangCa, luongData.currency);
    tongLuongDuDoanSpan.textContent = formatCurrency(tongLuongDuDoan, luongData.currency);
}

// Hàm định dạng tiền tệ (sử dụng loại tiền được chọn)
// currentCurrency được định nghĩa trong script.js và là global (window.currentCurrency)
function formatCurrency(amount, currencyCode = 'VND') {
    try {
        // Fallback locale if 'vi-VN' is not suitable for all currencies, or pass it from global
        const locale = window.currentCurrencyLocale || 'vi-VN'; // Bạn có thể thêm biến này vào script.js nếu muốn locale tùy chỉnh
        return amount.toLocaleString(locale, { style: 'currency', currency: currencyCode });
    } catch (e) {
        console.warn(`Không thể định dạng tiền tệ cho ${currencyCode}. Sử dụng định dạng mặc định.`, e);
        // Fallback display if toLocaleString fails for some reason
        const symbolMap = { 'VND': 'đ', 'JPY': '¥', 'USD': '$', 'EUR': '€' };
        return `${amount.toFixed(2)} ${symbolMap[currencyCode] || currencyCode}`;
    }
}

// Hàm tải dữ liệu lương từ LocalStorage
// Hàm tải dữ liệu lương
function loadLuongData() {
    const savedData = localStorage.getItem(getLuongDataKey(currentUser?.uid)); // Sử dụng key mới
    if (savedData) {
        luongData = JSON.parse(savedData);
    }
    // Dữ liệu từ Firebase sẽ được tải trong hàm initCalcTab nếu cần
    updateInputsFromData();
}

// Hàm lưu dữ liệu lương
async function saveLuongData() {
    // Lấy dữ liệu từ input
    luongData.luongGio = parseFloat(luongGioInput.value) || 0;
    luongData.luongTangCaGio = parseFloat(luongTangCaGioInput.value) || 0;
    // ... các trường khác

    // Luôn lưu vào localStorage
    localStorage.setItem(getLuongDataKey(currentUser?.uid), JSON.stringify(luongData));

    // Nếu online, lưu vào Firebase
    if (currentUser && navigator.onLine) {
        try {
            await db.collection('users').doc(currentUser.uid).set({
                luongData: luongData
            }, { merge: true });
            window.showToast('Đã lưu và đồng bộ dữ liệu lương!');
        } catch (error) {
            console.error("Error saving salary data to Firebase:", error);
            window.showToast('Đã lưu dữ liệu lương offline, không thể đồng bộ.');
        }
    } else {
        window.showToast('Đã lưu dữ liệu lương offline!');
    }
}

// Hàm cập nhật tiêu đề tháng/năm của dashboard lương
function updateMonthCalcHeader() {
    const month = currentCalcDate.getMonth();
    const year = currentCalcDate.getFullYear();
    currentMonthCalcYearElement.textContent = `Tháng ${month + 1}, ${year}`;
}


// Xử lý sự kiện click nút Lưu Dữ Liệu
luuDuLieuBtn.addEventListener('click', () => {
    saveLuongData();
    updateLuongUI();
    updateLuongDuKienUI();
});

// Theo dõi thay đổi trong input dự kiến
gioTangCaGiaDinhInput.addEventListener('input', updateLuongDuKienUI);

// Event listeners cho nút chuyển tháng của dashboard lương
prevMonthCalcBtn.addEventListener('click', () => {
    currentCalcDate.setMonth(currentCalcDate.getMonth() - 1);
    updateMonthCalcHeader();
    updateLuongUI();
    updateLuongDuKienUI();
});

nextMonthCalcBtn.addEventListener('click', () => {
    currentCalcDate.setMonth(currentCalcDate.getMonth() + 1);
    updateMonthCalcHeader();
    updateLuongUI();
    updateLuongDuKienUI();
});

// Hàm khởi tạo cho tab Máy Tính, sẽ được gọi từ script.js khi tab này được kích hoạt
// Gắn hàm này vào `window` để `script.js` có thể truy cập và gọi nó.
// Hàm khởi tạo tab Máy Tính
window.initCalcTab = async () => {
    if (currentUser && navigator.onLine) {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        if (userDoc.exists && userDoc.data().luongData) {
            luongData = userDoc.data().luongData;
            localStorage.setItem(getLuongDataKey(currentUser.uid), JSON.stringify(luongData)); // Cập nhật localStorage
        }
    }
    loadLuongData(); // Tải dữ liệu từ localStorage (có thể đã được cập nhật từ Firebase)
    
    currentCalcDate = new Date();
    updateMonthCalcHeader();
    updateLuongUI();
    updateLuongDuKienUI();
};


// Theo dõi thay đổi của tiền tệ từ script.js (nếu có)
// Sự kiện này được kích hoạt từ script.js khi người dùng thay đổi loại tiền tệ.
window.addEventListener('currencyChanged', (event) => {
    luongData.currency = event.detail.currencyCode;
    // Không cần gọi saveLuongData ở đây vì thay đổi này chỉ ảnh hưởng đến định dạng
    // và sẽ được lưu khi người dùng nhấn nút lưu dữ liệu lương trong tab này.
    updateLuongUI();
    updateLuongDuKienUI();
});



function updateInputsFromData() {
    luongGioInput.value = luongData.luongGio;
    luongTangCaGioInput.value = luongData.luongTangCaGio;
    troCapCoDinhInput.value = luongData.troCapCoDinh;
    troCapLinhHoatInput.value = luongData.troCapLinhHoat;
    phiKhacInput.value = luongData.phiKhac;
    gioTangCaGiaDinhInput.value = luongData.gioTangCaGiaDinh;
    luongData.currency = window.currentCurrency || 'VND';
}




