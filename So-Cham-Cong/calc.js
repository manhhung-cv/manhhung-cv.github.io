// calc.js

// === Lấy các phần tử HTML (ĐÃ CẬP NHẬT) ===
const luongGioInput = document.getElementById('luongGio');
const luongTangCaGioInput = document.getElementById('luongTangCaGio');
const troCapCoDinhInput = document.getElementById('troCapCoDinh');
const troCapLinhHoatInput = document.getElementById('troCapLinhHoat');
const phiKhacInput = document.getElementById('phiKhac');
const luuDuLieuBtn = document.getElementById('luuDuLieuBtn');

// Các trường % mới
const bhytPercentInput = document.getElementById('bhytPercent');
const bhxhPercentInput = document.getElementById('bhxhPercent');
const thuePercentInput = document.getElementById('thuePercent');
const khacPercentInput = document.getElementById('khacPercent');

// Span hiển thị lương thực tế
const luongCoBanSpan = document.getElementById('luongCoBan');
const luongTangCaSpan = document.getElementById('luongTangCa');
const tongTroCapSpan = document.getElementById('tongTroCap');
const tongThuNhapSpan = document.getElementById('tongThuNhap'); // Đổi từ tongLuong
const tongTruSpan = document.getElementById('tongTru');
const luongThucNhanSpan = document.getElementById('luongThucNhan');

// Span hiển thị lương dự kiến
const gioTangCaGiaDinhInput = document.getElementById('gioTangCaGiaDinh');
// const soGioLamCoBanGiaDinhSpan = document.getElementById('soGioLamCoBanGiaDinh'); // Bỏ nếu không cần hiển thị
// const soGioLamTangCaGiaDinhSpan = document.getElementById('soGioLamTangCaGiaDinh'); // Bỏ nếu không cần hiển thị
const duDoanLuongCoBanSpan = document.getElementById('duDoanLuongCoBan');
const duDoanLuongTangCaSpan = document.getElementById('duDoanLuongTangCa');
const duDoanTongTroCapSpan = document.getElementById('duDoanTongTroCap');
const duDoanTongThuNhapSpan = document.getElementById('duDoanTongThuNhap'); // Đổi từ tongLuongDuDoan
const duDoanTongTruSpan = document.getElementById('duDoanTongTru');
const duDoanLuongThucNhanSpan = document.getElementById('duDoanLuongThucNhan');

// Các phần tử điều khiển tháng
const prevMonthCalcBtn = document.getElementById('prevMonthCalcBtn');
const nextMonthCalcBtn = document.getElementById('nextMonthCalcBtn');
const currentMonthCalcYearElement = document.getElementById('currentMonthCalcYear');

// Khóa LocalStorage cho dữ liệu lương
const LUONG_DATA_KEY = 'ts_luongData_v2'; // Thay đổi v1 thành v2

// === Dữ liệu lương (ĐÃ CẬP NHẬT - thành global) ===
window.luongData = { // Gắn vào window
    luongGio: 0,
    luongTangCaGio: 0,
    troCapCoDinh: 0,
    troCapLinhHoat: 0,
    phiKhac: 0,
    gioTangCaGiaDinh: 0,
    bhytPercent: 0,
    bhxhPercent: 0,
    thuePercent: 0,
    khacPercent: 0,
    currency: 'VND'
};

// Biến để theo dõi tháng/năm hiện tại cho dashboard lương
let currentCalcDate = new Date();

// === HÀM TÍNH TOÁN (ĐÃ CẬP NHẬT) ===

// Tính lương
function tinhLuongCoBan(soGioLam, luongGio) {
    return soGioLam * luongGio;
}

function tinhLuongTangCa(soGioTangCa, luongTangCaGio) {
    return soGioTangCa * luongTangCaGio;
}

// Tính tổng thu nhập (Lương + Trợ cấp)
function tinhTongThuNhap(luongCoBan, luongTangCa, troCapCoDinh, troCapLinhHoat) {
    return luongCoBan + luongTangCa + troCapCoDinh + troCapLinhHoat;
}

// Tính các khoản khấu trừ và lương thực nhận
function tinhKhauTruVaThucNhan(tongThuNhap) {
    const bhyt = tongThuNhap * (window.luongData.bhytPercent / 100); // Sử dụng window.luongData
    const bhxh = tongThuNhap * (window.luongData.bhxhPercent / 100); // Sử dụng window.luongData
    const thue = tongThuNhap * (window.luongData.thuePercent / 100); // Sử dụng window.luongData
    const khac = tongThuNhap * (window.luongData.khacPercent / 100); // Sử dụng window.luongData

    // Phí khác là số tiền cố định, không phải %
    const tongTru = bhyt + bhxh + thue + khac + window.luongData.phiKhac; // Sử dụng window.luongData
    const luongThucNhan = tongThuNhap - tongTru;

    return { tongTru, luongThucNhan };
}

// Lấy số giờ làm từ dữ liệu chấm công (timesheetEntries)
function getSoGioLamActual(dateRef) {
    let tongSoGioLamActual = 0;
    let tongSoGioTangCaActual = 0;

    // === MODIFIED: Use global calculation period function ===
    if (typeof window.getCalculationPeriod !== 'function') {
        console.error("Lỗi: Không tìm thấy hàm getCalculationPeriod.");
        return { tongSoGioLamActual: 0, tongSoGioTangCaActual: 0 };
    }
    const { startDate: startStatsDate, endDate: endStatsDate } = window.getCalculationPeriod(dateRef);
    // === END MODIFIED ===

    for (let d = new Date(startStatsDate); d <= endStatsDate; d.setDate(d.getDate() + 1)) {
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const entry = window.timesheetEntries[dateStr];

        if (entry) {
            if (entry.type === 'work' || entry.type === 'work_ot') {
                tongSoGioLamActual += window.baseWorkHours;
                tongSoGioTangCaActual += (entry.overtimeHours || 0) + (entry.overtimeMinutes || 0) / 60;
            } else if (entry.type === 'holiday_work') {
                // Làm ngày lễ chỉ tính tăng ca, không tính giờ làm cơ bản
                tongSoGioTangCaActual += (entry.overtimeHours || 0) + (entry.overtimeMinutes || 0) / 60;
            }
        }
    }
    return { tongSoGioLamActual, tongSoGioTangCaActual };
}


// Lấy số ngày làm việc theo lịch trong tháng (dùng cho giả định)
function getSoNgayLamViecTrongThang(dateRef) {
    let soNgayLamViecTheoLich = 0;

    // === MODIFIED: Use global calculation period function ===
    if (typeof window.getCalculationPeriod !== 'function') {
        console.error("Lỗi: Không tìm thấy hàm getCalculationPeriod.");
        return 0;
    }
    const { startDate: startPeriodDate, endDate: endPeriodDate } = window.getCalculationPeriod(dateRef);
    // === END MODIFIED ===


    for (let d = new Date(startPeriodDate); d <= endPeriodDate; d.setDate(d.getDate() + 1)) {
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (window.scheduleData[dateStr] === 'ca-ngay' || window.scheduleData[dateStr] === 'ca-dem') {
            soNgayLamViecTheoLich++;
        }
    }
    return soNgayLamViecTheoLich;
}


// === Cập nhật giao diện (ĐÃ CẬP NHẬT) ===
function updateLuongUI() {
    // 1. Lấy giờ làm thực tế
    const { tongSoGioLamActual, tongSoGioTangCaActual } = getSoGioLamActual(currentCalcDate);

    // 2. Tính các khoản thu nhập
    const luongCoBan = tinhLuongCoBan(tongSoGioLamActual, window.luongData.luongGio);
    const luongTangCa = tinhLuongTangCa(tongSoGioTangCaActual, window.luongData.luongTangCaGio);
    const tongTroCap = window.luongData.troCapCoDinh + window.luongData.troCapLinhHoat;
    const tongThuNhap = tinhTongThuNhap(luongCoBan, luongTangCa, window.luongData.troCapCoDinh, window.luongData.troCapLinhHoat);

    // 3. Tính khấu trừ
    const { tongTru, luongThucNhan } = tinhKhauTruVaThucNhan(tongThuNhap);

    // 4. Cập nhật UI
    luongCoBanSpan.textContent = formatCurrency(luongCoBan, window.luongData.currency);
    luongTangCaSpan.textContent = formatCurrency(luongTangCa, window.luongData.currency);
    tongTroCapSpan.textContent = formatCurrency(tongTroCap, window.luongData.currency);
    tongThuNhapSpan.textContent = formatCurrency(tongThuNhap, window.luongData.currency);
    tongTruSpan.textContent = formatCurrency(tongTru, window.luongData.currency);
    luongThucNhanSpan.textContent = formatCurrency(luongThucNhan, window.luongData.currency);
}

// === Cập nhật giao diện dự kiến (ĐÃ CẬP NHẬT) ===
function updateLuongDuKienUI() {
    // 1. Lấy giờ làm dự kiến
    const soNgayLamViecTrongThang = getSoNgayLamViecTrongThang(currentCalcDate);
    const soGioLamCoBanGiaDinh = soNgayLamViecTrongThang * window.baseWorkHours;
    const soGioLamTangCaGiaDinh = parseFloat(gioTangCaGiaDinhInput.value) || 0;

    // 2. Tính thu nhập dự kiến
    const duDoanLuongCoBan = tinhLuongCoBan(soGioLamCoBanGiaDinh, window.luongData.luongGio);
    const duDoanLuongTangCa = tinhLuongTangCa(soGioLamTangCaGiaDinh, window.luongData.luongTangCaGio);
    const duDoanTongTroCap = window.luongData.troCapCoDinh + window.luongData.troCapLinhHoat;
    const duDoanTongThuNhap = tinhTongThuNhap(duDoanLuongCoBan, duDoanLuongTangCa, window.luongData.troCapCoDinh, window.luongData.troCapLinhHoat);

    // 3. Tính khấu trừ dự kiến
    const { tongTru: duDoanTongTru, luongThucNhan: duDoanLuongThucNhan } = tinhKhauTruVaThucNhan(duDoanTongThuNhap);

    // 4. Cập nhật UI (Bỏ hiển thị giờ làm dự kiến nếu không cần)
    // soGioLamCoBanGiaDinhSpan.textContent = `${soGioLamCoBanGiaDinh.toFixed(1)} giờ`;
    // soGioLamTangCaGiaDinhSpan.textContent = `${soGioLamTangCaGiaDinh.toFixed(1)} giờ`;
    duDoanLuongCoBanSpan.textContent = formatCurrency(duDoanLuongCoBan, window.luongData.currency);
    duDoanLuongTangCaSpan.textContent = formatCurrency(duDoanLuongTangCa, window.luongData.currency);
    duDoanTongTroCapSpan.textContent = formatCurrency(duDoanTongTroCap, window.luongData.currency);
    duDoanTongThuNhapSpan.textContent = formatCurrency(duDoanTongThuNhap, window.luongData.currency);
    duDoanTongTruSpan.textContent = formatCurrency(duDoanTongTru, window.luongData.currency);
    duDoanLuongThucNhanSpan.textContent = formatCurrency(duDoanLuongThucNhan, window.luongData.currency);
}


// Hàm định dạng tiền tệ
function formatCurrency(amount, currencyCode = 'VND') {
    try {
        const locale = window.currentCurrencyLocale || 'vi-VN';
        return amount.toLocaleString(locale, { style: 'currency', currency: currencyCode });
    } catch (e) {
        console.warn(`Không thể định dạng tiền tệ cho ${currencyCode}. Sử dụng định dạng mặc định.`, e);
        const symbolMap = { 'VND': 'đ', 'JPY': '¥', 'USD': '$', 'EUR': '€' };
        return `${amount.toFixed(2)} ${symbolMap[currencyCode] || currencyCode}`;
    }
}

// === Tải dữ liệu (ĐÃ CẬP NHẬT - dùng global) ===
function loadLuongData() {
    const savedData = localStorage.getItem(LUONG_DATA_KEY);
    if (savedData) {
        // Hợp nhất dữ liệu đã lưu với dữ liệu mặc định vào window.luongData
        Object.assign(window.luongData, JSON.parse(savedData));
    } else {
         // Nếu không có dữ liệu lưu, đảm bảo window.luongData là object trống để tránh lỗi
         window.luongData = window.luongData || {}; // Hoặc gán lại giá trị mặc định nếu cần
    }

    // Gán lại giá trị vào input fields từ window.luongData
    luongGioInput.value = window.luongData.luongGio || 0;
    luongTangCaGioInput.value = window.luongData.luongTangCaGio || 0;
    troCapCoDinhInput.value = window.luongData.troCapCoDinh || 0;
    troCapLinhHoatInput.value = window.luongData.troCapLinhHoat || 0;
    phiKhacInput.value = window.luongData.phiKhac || 0;
    gioTangCaGiaDinhInput.value = window.luongData.gioTangCaGiaDinh || 0;

    // Gán các trường % mới
    bhytPercentInput.value = window.luongData.bhytPercent || 0;
    bhxhPercentInput.value = window.luongData.bhxhPercent || 0;
    thuePercentInput.value = window.luongData.thuePercent || 0;
    khacPercentInput.value = window.luongData.khacPercent || 0;

    // Lấy currency từ script.js (đã global)
    window.luongData.currency = window.currentCurrency || 'VND';
}

// === Lưu dữ liệu (ĐÃ CẬP NHẬT - dùng global) ===
function saveLuongData() {
    window.luongData.luongGio = parseFloat(luongGioInput.value) || 0;
    window.luongData.luongTangCaGio = parseFloat(luongTangCaGioInput.value) || 0;
    window.luongData.troCapCoDinh = parseFloat(troCapCoDinhInput.value) || 0;
    window.luongData.troCapLinhHoat = parseFloat(troCapLinhHoatInput.value) || 0;
    window.luongData.phiKhac = parseFloat(phiKhacInput.value) || 0;
    window.luongData.gioTangCaGiaDinh = parseFloat(gioTangCaGiaDinhInput.value) || 0;

    // Lưu các trường % mới
    window.luongData.bhytPercent = parseFloat(bhytPercentInput.value) || 0;
    window.luongData.bhxhPercent = parseFloat(bhxhPercentInput.value) || 0;
    window.luongData.thuePercent = parseFloat(thuePercentInput.value) || 0;
    window.luongData.khacPercent = parseFloat(khacPercentInput.value) || 0;

    // Lưu currency hiện tại vào luongData trước khi lưu localStorage
    window.luongData.currency = window.currentCurrency || 'VND';

    localStorage.setItem(LUONG_DATA_KEY, JSON.stringify(window.luongData));
    window.showToast('Đã lưu dữ liệu lương!');
}

// Hàm cập nhật tiêu đề tháng/năm của dashboard lương
function updateMonthCalcHeader() {
    // === MODIFIED: Hiển thị tiêu đề theo chế độ ===
    if (typeof window.getCalculationPeriod !== 'function') return; // Cần hàm global
    
    if (window.displayMode === 'workPeriod') {
        const { startDate, endDate } = window.getCalculationPeriod(currentCalcDate);
        currentMonthCalcYearElement.textContent = `CK: ${startDate.getDate()}/${startDate.getMonth() + 1} - ${endDate.getDate()}/${endDate.getMonth() + 1}`;
    } else {
        const month = currentCalcDate.getMonth();
        const year = currentCalcDate.getFullYear();
        currentMonthCalcYearElement.textContent = `Tháng ${month + 1}, ${year}`;
    }
    // === END MODIFIED ===
}


// Xử lý sự kiện click nút Lưu Dữ Liệu
luuDuLieuBtn.addEventListener('click', () => {
    saveLuongData(); // Hàm save đã dùng window.luongData
    updateLuongUI();
    updateLuongDuKienUI();
});

// === Lắng nghe sự kiện input trên TẤT CẢ các trường nhập liệu ===
const allCalcInputs = [
    luongGioInput, luongTangCaGioInput, troCapCoDinhInput,
    troCapLinhHoatInput, phiKhacInput, gioTangCaGiaDinhInput,
    bhytPercentInput, bhxhPercentInput, thuePercentInput, khacPercentInput
];

allCalcInputs.forEach(input => {
    if (input) {
        input.addEventListener('input', () => {
            // Cập nhật dữ liệu tạm thời vào window.luongData (chưa lưu localStorage)
            window.luongData.luongGio = parseFloat(luongGioInput.value) || 0;
            window.luongData.luongTangCaGio = parseFloat(luongTangCaGioInput.value) || 0;
            window.luongData.troCapCoDinh = parseFloat(troCapCoDinhInput.value) || 0;
            window.luongData.troCapLinhHoat = parseFloat(troCapLinhHoatInput.value) || 0;
            window.luongData.phiKhac = parseFloat(phiKhacInput.value) || 0;
            window.luongData.gioTangCaGiaDinh = parseFloat(gioTangCaGiaDinhInput.value) || 0;
            window.luongData.bhytPercent = parseFloat(bhytPercentInput.value) || 0;
            window.luongData.bhxhPercent = parseFloat(bhxhPercentInput.value) || 0;
            window.luongData.thuePercent = parseFloat(thuePercentInput.value) || 0;
            window.luongData.khacPercent = parseFloat(khacPercentInput.value) || 0;

            // Cập nhật cả hai bảng
            updateLuongUI();
            updateLuongDuKienUI();
        });
    }
});

// Event listeners cho nút chuyển tháng của dashboard lương
prevMonthCalcBtn.addEventListener('click', () => {
    // === MODIFIED: Navigate based on displayMode ===
     if (typeof window.getCalculationPeriod !== 'function') return; // Cần hàm global
     
    if (window.displayMode === 'workPeriod') {
        const { startDate } = window.getCalculationPeriod(currentCalcDate);
        startDate.setDate(startDate.getDate() - 1); // Lùi 1 ngày để vào kỳ trước
        currentCalcDate = startDate;
    } else {
        currentCalcDate.setMonth(currentCalcDate.getMonth() - 1);
    }
    // === END MODIFIED ===
    updateMonthCalcHeader();
    updateLuongUI();
    updateLuongDuKienUI();
});

nextMonthCalcBtn.addEventListener('click', () => {
    // === MODIFIED: Navigate based on displayMode ===
    if (typeof window.getCalculationPeriod !== 'function') return; // Cần hàm global
    
    if (window.displayMode === 'workPeriod') {
        const { endDate } = window.getCalculationPeriod(currentCalcDate);
        endDate.setDate(endDate.getDate() + 1); // Tiến 1 ngày để vào kỳ sau
        currentCalcDate = endDate;
    } else {
        currentCalcDate.setMonth(currentCalcDate.getMonth() + 1);
    }
    // === END MODIFIED ===
    updateMonthCalcHeader();
    updateLuongUI();
    updateLuongDuKienUI();
});

// Hàm khởi tạo cho tab Máy Tính
window.initCalcTab = () => {
    loadLuongData(); // Tải dữ liệu lương khi tab được mở (đã dùng global)
    currentCalcDate = new Date(); // Reset về kỳ hiện tại khi mở tab
    updateMonthCalcHeader(); // Cập nhật header
    updateLuongUI();
    updateLuongDuKienUI();
};

// Theo dõi thay đổi của tiền tệ từ script.js
window.addEventListener('currencyChanged', (event) => {
    if (!window.luongData) loadLuongData(); // Đảm bảo luongData đã được tải
    window.luongData.currency = event.detail.currencyCode;

    if (document.getElementById('tabMayTinh').classList.contains('active')) {
        updateLuongUI();
        updateLuongDuKienUI();
    }
});