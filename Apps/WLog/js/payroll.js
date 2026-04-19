// js/payroll.js
import { defaultAppConfig } from './config.js';
import { SafeMath } from './utils.js';

// 1. KHỞI TẠO DỮ LIỆU
const savedConfig = JSON.parse(localStorage.getItem('userPayrollConfig')) || {};
export let appConfig = { ...defaultAppConfig, ...savedConfig };

export let workEntries = JSON.parse(localStorage.getItem('payrollEntriesV5')) || [];
export let storedExpenses = JSON.parse(localStorage.getItem('payrollExpensesV6')) || {};
export let savedPayslips = JSON.parse(localStorage.getItem('savedPayslipsV1')) || [];

// THÊM MỚI: Kho lưu lịch trình (Dạng: { "2026-04-18": "shift_night" })
export let userSchedule = JSON.parse(localStorage.getItem('userScheduleV1')) || {};

export let currentGrossIncome = 0;
export const setCurrentGrossIncome = (val) => { currentGrossIncome = val; };

export const saveAppConfig = (newConfig) => {
    appConfig = { ...appConfig, ...newConfig };
    localStorage.setItem('userPayrollConfig', JSON.stringify(appConfig));
};

// THÊM MỚI: Hàm lưu lịch trình
export const saveSchedule = (dateStr, shiftId) => {
    if (shiftId === 'clear') {
        delete userSchedule[dateStr];
    } else {
        userSchedule[dateStr] = shiftId;
    }
    localStorage.setItem('userScheduleV1', JSON.stringify(userSchedule));
};

export const updateWorkEntry = (entryData) => {
    const index = workEntries.findIndex(e => e.date === entryData.date);
    if (index > -1) workEntries[index] = entryData;
    else workEntries.push(entryData);
    localStorage.setItem('payrollEntriesV5', JSON.stringify(workEntries));
};

export const deleteWorkEntry = (dateStr) => {
    const index = workEntries.findIndex(e => e.date === dateStr);
    if (index > -1) workEntries.splice(index, 1);
    localStorage.setItem('payrollEntriesV5', JSON.stringify(workEntries));
};

// ==========================================
// 4. LÕI TOÁN HỌC: TÍNH LƯƠNG TỪNG NGÀY
// ==========================================
export const calculateDailySalaryDetails = (hours, otHours, hasAllowance, dateStr, daysOfWeek, shiftId = 'shift_default') => {
    let hourlyRate = 0;
    const stdDays = Number(appConfig.standardDays) || 26;
    const stdHours = Number(appConfig.standardHours) || 8;

    // 4.1 Quy đổi ra Lương theo Giờ
    if (appConfig.salaryType === 'thang') {
        const dailyRate = SafeMath.divide(appConfig.baseSalaryMonth, stdDays);
        hourlyRate = SafeMath.divide(dailyRate, stdHours);
    } else {
        hourlyRate = Number(appConfig.baseSalaryHour);
    }

    if (!dateStr) return { basePay: 0, otPay: 0, allowancePay: 0, holidayPay: 0, isSpecialDay: false, isOffDay: false, isHoliday: false, shiftId };

    // 4.2 Nhận diện ngày thường hay ngày nghỉ cuối tuần
    const parts = dateStr.split('-');
    const dObj = new Date(parts[0], parts[1] - 1, parts[2]);
    const dayName = daysOfWeek[dObj.getDay()];

    const workingDaysConf = Array.isArray(appConfig.workingDays) && appConfig.workingDays.length > 0 ? appConfig.workingDays : ['T2', 'T3', 'T4', 'T5', 'T6'];
    const isWorkingDay = workingDaysConf.includes(dayName);
    const isOffDay = !isWorkingDay; // Đánh dấu là ngày nghỉ cuối tuần

    // 4.3 Nhận diện quy tắc tiền của Ca làm việc (Shifts)
    let shiftAllowance = 0;
    let shiftMultiplier = 1;
    
    const shiftsConf = appConfig.shifts || [];
    const currentShift = shiftsConf.find(s => s.id === shiftId);

    if (currentShift && currentShift.affectsSalary) {
        if (currentShift.ruleType === 'allowance') shiftAllowance = Number(currentShift.ruleValue) || 0;
        if (currentShift.ruleType === 'multiplier') shiftMultiplier = Number(currentShift.ruleValue) || 1;
    }

    // 4.4 Thực hiện tính toán bằng SafeMath (Chống lỗi số thập phân)
    let basePay = 0, otPay = 0;
    
    // Trợ cấp = Trợ cấp ăn ngày (nếu tick) + Phụ cấp cố định của Ca
    let allowancePay = SafeMath.add(hasAllowance ? Number(appConfig.dailyAllowance) : 0, shiftAllowance);

    // Tính lương cơ bản (Giờ làm * Lương 1H * Hệ số Ca)
    basePay = SafeMath.multiply(hours, hourlyRate);
    basePay = SafeMath.multiply(basePay, shiftMultiplier); 
    
    // Tính lương OT
    otPay = SafeMath.multiply(otHours, appConfig.otRate); 

    // Trả về cấu trúc bóc tách dữ liệu
    return { 
        basePay, 
        otPay, 
        allowancePay, 
        holidayPay: 0, // Cờ này sẽ được hàm Sửa Lịch (ở app.js) ghi đè nếu bạn gán "Nghỉ Lễ"
        isSpecialDay: isOffDay, 
        isOffDay, 
        isHoliday: false, 
        shiftId 
    };
};