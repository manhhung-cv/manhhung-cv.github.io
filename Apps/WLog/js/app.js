// js/app.js

import { daysOfWeek, headersGrid, fullDaysOfWeek, defaultAppConfig } from './config.js';
import { getMoneyValue, formatNumToVN, formatInputMoney, getLocalISOString, getMonthKey, formatMoney, SafeMath, debounce } from './utils.js';
import { openCustomModal, customAlert, customConfirm, customPrompt, applyTheme, setThemeType, switchTab, switchSetTab, renderThemeButtons } from './ui.js';
import { appConfig, workEntries, userSchedule, saveSchedule, storedExpenses, savedPayslips, currentGrossIncome, saveAppConfig, calculateDailySalaryDetails, updateWorkEntry, deleteWorkEntry, setCurrentGrossIncome } from './payroll.js';
import { initFirebase, loginGoogle, loginEmail, logout, createCloudBackup, currentUser, resetPassword, getCloudBackups, getCloudBackupById, deleteCloudBackupById } from './firebase.js';

// ==========================================
// 1. BIẾN TRẠNG THÁI TOÀN CỤC (STATE)
// ==========================================
let currentTargetDate = new Date();
let selectedDayString = "";
let timelineViewMode = 'week';
let autoBackupTimeout;

// Trạng thái nhập liệu chính
let currentSelectedShiftId = 'shift_default';

// Trạng thái cho chế độ "Sửa Lịch" (Edit Mode)
let isEditMode = false;
let selectedDatesToEdit = new Set();
let isDragging = false;
let hasMoved = false;

// Trạng thái cho Setting Ca làm việc
let tempShifts = [];
let editingShiftId = null;

const shiftColorsPalette = [
    { id: 'gray', dot: 'bg-gray-500', class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
    { id: 'red', dot: 'bg-red-500', class: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' },
    { id: 'orange', dot: 'bg-orange-500', class: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400' },
    { id: 'amber', dot: 'bg-amber-500', class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' },
    { id: 'green', dot: 'bg-green-500', class: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' },
    { id: 'teal', dot: 'bg-teal-500', class: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400' },
    { id: 'cyan', dot: 'bg-cyan-500', class: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400' },
    { id: 'blue', dot: 'bg-blue-500', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
    { id: 'indigo', dot: 'bg-indigo-500', class: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400' },
    { id: 'violet', dot: 'bg-violet-500', class: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400' },
    { id: 'purple', dot: 'bg-purple-500', class: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' },
    { id: 'pink', dot: 'bg-pink-500', class: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400' }
];

const premiumPalette = [
    '#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316',
    '#eab308', '#22c55e', '#10b981', '#06b6d4', '#3b82f6',
    '#64748b', '#000000', '#78350f', '#134e4a', '#4c1d95'
];

// ==========================================
// 2. CORE UTILITIES & TIMELINE RENDER
// ==========================================
const getCycleDates = (targetDate) => {
    const year = targetDate.getFullYear(), month = targetDate.getMonth(), cutoff = Number(appConfig.cutoffDate) || 31;
    let start, end;
    if (cutoff >= 28) {
        start = new Date(year, month, 1); end = new Date(year, month + 1, 0);
    } else {
        start = new Date(year, month - 1, cutoff + 1); end = new Date(year, month, cutoff);
    }
    start.setHours(0, 0, 0, 0); end.setHours(23, 59, 59, 999);
    return { start, end };
};

const getCycleEntries = () => {
    const { start, end } = getCycleDates(currentTargetDate);
    return workEntries.filter(e => { const d = new Date(e.date); return d >= start && d <= end; }).sort((a, b) => new Date(a.date) - new Date(b.date));
};

window.applySelectedColor = (hex) => {
    // Đảm bảo mã hex luôn có dấu #
    if (!hex.startsWith('#')) hex = '#' + hex;

    // Cập nhật giá trị ẩn
    document.getElementById('newShiftColor').value = hex;

    // Cập nhật xem trước ở Form chính
    const preview = document.getElementById('currentColorPreview');
    if (preview) preview.style.backgroundColor = hex;

    const hexText = document.getElementById('currentColorHex');
    if (hexText) hexText.textContent = hex.toUpperCase();

    // Cập nhật ô nhập mã trong Modal
    const manualInput = document.getElementById('manualHexInput');
    if (manualInput) manualInput.value = hex.replace('#', '').toUpperCase();

    // Đồng bộ lại input color ẩn (để lần sau mở lại nó đúng màu đó)
    const nativeInput = document.getElementById('nativeColorInput');
    if (nativeInput) nativeInput.value = hex;

    // Render lại Grid để cập nhật dấu tích (nếu màu chọn trùng với Palette)
    const grid = document.getElementById('presetColorsGrid');
    if (grid) {
        const buttons = grid.querySelectorAll('button');
        buttons.forEach(btn => {
            // Lấy màu từ style background-color của button
            const btnColor = btn.style.backgroundColor;
            // So sánh (cần convert rgb sang hex nếu cần, nhưng đơn giản nhất là so sánh opacity)
            btn.classList.toggle('border-gray-900', false); // Reset
            btn.classList.add('border-transparent', 'opacity-60');
        });
    }
};

window.handleManualHex = (val) => {
    // Chỉ áp dụng khi người dùng nhập đủ 3 hoặc 6 ký tự
    if (val.length === 3 || val.length === 6) {
        window.applySelectedColor('#' + val);
    }
};

window.openColorPickerModal = () => {
    const modal = document.getElementById('colorPickerModal');
    const grid = document.getElementById('presetColorsGrid');
    const currentHex = document.getElementById('newShiftColor').value || '#6366f1';

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // Render Palette
    grid.innerHTML = premiumPalette.map(color => `
        <button type="button" onclick="applySelectedColor('${color}')" 
            class="w-10 h-10 rounded-full border-2 transition-all transform active:scale-90 ${currentHex.toLowerCase() === color.toLowerCase() ? 'border-gray-900 dark:border-white scale-110 shadow-lg opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}" 
            style="background-color: ${color};">
        </button>
    `).join('');

    // Điền mã màu vào ô nhập
    document.getElementById('manualHexInput').value = currentHex.replace('#', '').toUpperCase();
};

window.closeColorPickerModal = () => {
    document.getElementById('colorPickerModal').classList.add('hidden');
};

const hexToRgba = (hex, alpha = 1) => {
    let r = 0, g = 0, b = 0;
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    } else {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
const getShiftColorTheme = (shiftId) => {
    const shifts = appConfig.shifts || defaultAppConfig.shifts;
    const shift = shifts.find(s => s.id === shiftId);

    if (!shift || shiftId === 'shift_default') {
        return { dot: '#9ca3af', bg: 'rgba(156, 163, 175, 0.1)', border: 'rgba(156, 163, 175, 0.2)', text: 'inherit', isHex: true };
    }

    const hex = shift.color.startsWith('#') ? shift.color : '#6366f1'; // Dự phòng nếu màu cũ là class
    return {
        dot: hex,
        bg: hexToRgba(hex, 0.12),
        border: hexToRgba(hex, 0.25),
        text: hex,
        isHex: true
    };
};

// --- HÀM VẼ LỊCH ĐÃ ĐƯỢC ĐỒNG BỘ MÀU SẮC & LỊCH TRÌNH ---
const renderTimeline = () => {
    const { start, end } = getCycleDates(currentTargetDate);
    const container = document.getElementById('timelineContainer');
    let htmlContent = '';
    let workingDaysConf = Array.isArray(appConfig.workingDays) && appConfig.workingDays.length > 0 ? appConfig.workingDays : ['T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    // --- CHẾ ĐỘ XEM THÁNG ---
    if (timelineViewMode === 'cycle') {
        container.className = 'grid grid-cols-7 gap-2 w-full';
        headersGrid.forEach(h => {
            const color = workingDaysConf.includes(h) ? 'text-gray-400' : 'text-gray-300';
            htmlContent += `<div class="text-center text-[10px] font-semibold ${color} py-1">${h}</div>`;
        });

        let offset = (start.getDay() + 6) % 7;
        for (let i = 0; i < offset; i++) htmlContent += `<div></div>`;

        let iterDate = new Date(start); iterDate.setHours(0, 0, 0, 0);
        let safeEnd = new Date(end); safeEnd.setHours(23, 59, 59, 999);

        while (iterDate <= safeEnd) {
            const dateStr = getLocalISOString(iterDate);
            const dayName = daysOfWeek[iterDate.getDay()];
            const isSelected = dateStr === selectedDayString;
            const isWorkingDay = workingDaysConf.includes(dayName);

            const scheduledShiftId = userSchedule[dateStr];
            const existingEntry = workEntries.find(e => e.date === dateStr);
            const effectiveShiftId = existingEntry ? existingEntry.shiftId : scheduledShiftId;

            let shiftTheme = getShiftColorTheme(effectiveShiftId);
            if (existingEntry && existingEntry.isHoliday) {
                shiftTheme = { dot: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)', text: '#ef4444' };
            }

            let cardClass = `relative flex flex-col items-center justify-center rounded-xl cursor-pointer border aspect-square transition-all duration-200 `;
            let cardStyle = ""; // KHỞI TẠO BIẾN Ở ĐÂY

            if (isSelected) {
                cardClass += "bg-gray-900 border-gray-900 text-white dark:bg-white dark:border-white dark:text-gray-900 transform scale-105 z-10 shadow-sm";
            } else if (scheduledShiftId || existingEntry) {
                cardStyle = `background-color: ${shiftTheme.bg}; border-color: ${shiftTheme.border}; color: ${shiftTheme.text};`;
                cardClass += "hover:brightness-95";
            } else {
                cardClass += "bg-transparent border-gray-100 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50";
            }

            const hasRealWork = existingEntry && (existingEntry.hours > 0 || existingEntry.isHoliday);
            const dotColor = isSelected ? (document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff') : shiftTheme.dot;
            const dot = hasRealWork ? `<div class="w-3 h-1 rounded-full mt-1" style="background-color: ${dotColor}"></div>` : `<div class="w-1 h-1 mt-1"></div>`;

            let textStyle = (!isSelected && !isWorkingDay) ? 'opacity-50' : '';
            let otBadge = (existingEntry && existingEntry.otHours > 0) ? `<div class="absolute -top-1.5 -right-1.5 bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-sm z-20">${existingEntry.otHours}h</div>` : '';

            htmlContent += `<div id="card-${dateStr}" style="${cardStyle}" class="${cardClass}" onclick="selectDate('${dateStr}')">${otBadge}<span class="text-sm font-bold ${textStyle}">${iterDate.getDate()}</span>${dot}</div>`;
            iterDate.setDate(iterDate.getDate() + 1);
        }
    }
    // --- CHẾ ĐỘ XEM TUẦN ---
    else {
        container.className = 'grid grid-cols-7 gap-2 w-full';
        let weekStartStr = "";
        if (selectedDayString) {
            const sdObj = new Date(selectedDayString);
            const dayNum = sdObj.getDay() === 0 ? 7 : sdObj.getDay();
            const ws = new Date(sdObj); ws.setDate(sdObj.getDate() - dayNum + 1);
            weekStartStr = getLocalISOString(ws);
        } else {
            weekStartStr = getLocalISOString(start);
        }

        let iterDate = new Date(weekStartStr);
        for (let i = 0; i < 7; i++) {
            const dateStr = getLocalISOString(iterDate);
            const dayName = daysOfWeek[iterDate.getDay()];
            const isSelected = dateStr === selectedDayString;
            const isWorkingDay = workingDaysConf.includes(dayName);

            const scheduledShiftId = userSchedule[dateStr];
            const existingEntry = workEntries.find(e => e.date === dateStr);
            const effectiveShiftId = existingEntry ? existingEntry.shiftId : scheduledShiftId;

            let shiftTheme = getShiftColorTheme(effectiveShiftId);
            if (existingEntry && existingEntry.isHoliday) {
                shiftTheme = { dot: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)', text: '#ef4444' };
            }

            let cardClass = `relative flex flex-col items-center justify-center py-2.5 rounded-xl cursor-pointer border aspect-[4/5] md:aspect-auto transition-all duration-200 `;
            let cardStyle = ""; // KHỞI TẠO BIẾN Ở ĐÂY

            if (isSelected) {
                cardClass += "bg-gray-900 border-gray-900 text-white dark:bg-white dark:border-white dark:text-gray-900 transform scale-105 z-10 shadow-sm";
            } else if (scheduledShiftId || existingEntry) {
                cardStyle = `background-color: ${shiftTheme.bg}; border-color: ${shiftTheme.border}; color: ${shiftTheme.text};`;
                cardClass += "hover:brightness-95";
            } else {
                cardClass += "bg-transparent border-gray-100 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50";
            }

            const hasRealWork = existingEntry && (existingEntry.hours > 0 || existingEntry.isHoliday);
            const dotColor = isSelected ? (document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff') : shiftTheme.dot;
            const dot = hasRealWork ? `<div class="w-3 h-1 rounded-full mt-1" style="background-color: ${dotColor}"></div>` : `<div class="w-1 h-1 mt-1"></div>`;

            let textDayStyle = isSelected ? 'opacity-80' : 'opacity-60';
            let textStyle = (!isSelected && !isWorkingDay) ? 'opacity-50' : '';
            let otBadge = (existingEntry && existingEntry.otHours > 0) ? `<div class="absolute -top-1.5 -right-1.5 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm z-20">${existingEntry.otHours}h</div>` : '';

            htmlContent += `<div id="card-${dateStr}" style="${cardStyle}" class="${cardClass}" onclick="selectDate('${dateStr}')">${otBadge}<span class="text-[10px] uppercase font-semibold ${textDayStyle}">${dayName}</span><span class="text-base font-bold mt-0.5 ${textStyle}">${iterDate.getDate()}</span>${dot}</div>`;
            iterDate.setDate(iterDate.getDate() + 1);
        }
    }

    container.innerHTML = htmlContent;
    if (!selectedDayString) selectedDayString = getLocalISOString(start);
    selectDate(selectedDayString, false);
};

const selectDate = (dateStr, reRender = true) => {
    // 1. Chặn click thông thường nếu đang trong chế độ Sửa Lịch
    if (isEditMode) {
        // Chỉ xử lý nếu đây là thao tác CLICK THẬT của người dùng (reRender = true)
        if (!hasMoved && reRender) {
            const card = document.getElementById(`card-${dateStr}`);
            // Đảm bảo thẻ tồn tại trên màn hình mới thực hiện đổi màu
            if (card) {
                if (selectedDatesToEdit.has(dateStr)) {
                    selectedDatesToEdit.delete(dateStr);
                    card.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50', 'dark:bg-blue-900/40', 'transform', 'scale-105', 'z-20');
                } else {
                    selectedDatesToEdit.add(dateStr);
                    card.classList.add('ring-2', 'ring-blue-500', 'bg-blue-50', 'dark:bg-blue-900/40', 'transform', 'scale-105', 'z-20');
                }
                window.updateEditFormUI();
            }
        }
        return;
    }

    // 2. Chế độ chọn ngày bình thường
    selectedDayString = dateStr;
    const entry = workEntries.find(e => e.date === dateStr);
    const parts = dateStr.split('-');
    const dObj = new Date(parts[0], parts[1] - 1, parts[2]);

    document.getElementById('formDateDisplay').textContent = `${fullDaysOfWeek[dObj.getDay()]}, ${dObj.getDate()}/${dObj.getMonth() + 1}`;
    const badge = document.getElementById('formStatusBadge');
    const btnDelete = document.getElementById('btnDeleteCurrent');

    if (entry) {
        badge.textContent = "Đã lưu";
        badge.className = "text-[10px] px-2.5 py-0.5 rounded-full font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 mt-1 inline-block";
        document.getElementById('hoursInput').value = formatNumToVN(entry.hours);
        document.getElementById('otInput').value = formatNumToVN(entry.otHours);
        document.getElementById('allowanceCheck').checked = entry.hasAllowance;
        currentSelectedShiftId = entry.shiftId || 'shift_default';
        btnDelete.classList.remove('hidden');
    } else {
        badge.textContent = "Trống";
        badge.className = "text-[10px] px-2.5 py-0.5 rounded-full font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 mt-1 inline-block";
        document.getElementById('hoursInput').value = formatNumToVN(appConfig.standardHours || 8);
        document.getElementById('otInput').value = 0;
        document.getElementById('allowanceCheck').checked = true;

        // GỢI Ý CA TỪ LỊCH TRÌNH:
        currentSelectedShiftId = userSchedule[dateStr] || 'shift_default';

        btnDelete.classList.add('hidden');
    }

    window.renderShiftSelector(); // Update UI nút chọn ca
    if (reRender) renderTimeline();
};
window.renderShiftSelector = () => {
    const container = document.getElementById('shiftSelectorContainer');
    if (!container) return;
    let html = '';
    const shifts = appConfig.shifts || defaultAppConfig.shifts;

    shifts.forEach(shift => {
        let ruleBadge = '';
        if (shift.ruleType === 'allowance' && shift.ruleValue > 0) ruleBadge = `<span class="ml-1.5 opacity-80 font-medium text-[10px]">(+${formatNumToVN(shift.ruleValue)})</span>`;
        else if (shift.ruleType === 'multiplier' && shift.ruleValue > 0) ruleBadge = `<span class="ml-1.5 opacity-80 font-medium text-[10px]">(x${shift.ruleValue})</span>`;

        const isSelected = shift.id === currentSelectedShiftId;
        const activeClass = isSelected ? 'ring-2 ring-offset-1 ring-gray-400 dark:ring-gray-500 scale-105 font-bold shadow-sm' : 'opacity-70 font-medium hover:opacity-100';
        html += `<button type="button" onclick="selectShift('${shift.id}')" class="px-3 py-1.5 rounded-lg text-xs flex items-center transition-all ${shift.color} ${activeClass}">${shift.name}${ruleBadge}</button>`;
    });
    container.innerHTML = html;
};

window.selectShift = (shiftId) => {
    currentSelectedShiftId = shiftId;
    window.renderShiftSelector();
};

// ==========================================
// 3. DATA DISPLAYS & PAYSLIP LOGIC
// ==========================================
const updateDataDisplays = () => {
    const curr = appConfig.currency || 'đ';
    const { start, end } = getCycleDates(currentTargetDate);
    const cycleEntries = getCycleEntries().reverse();

    let totalDays = cycleEntries.length;
    let totalHours = 0, totalOT = 0;
    let sumBase = 0, sumOT = 0, sumAllowance = 0, sumHoliday = 0;
    let holidayCount = 0, offDayCount = 0;

    const table = document.getElementById('historyTable');
    let tableHtml = '';

    if (cycleEntries.length === 0) {
        tableHtml = `<tr><td colspan="4" class="p-6 text-center text-gray-400 font-medium text-xs">Chưa có bản ghi nào.</td></tr>`;
    } else {
        let stt = 1;
        cycleEntries.forEach(entry => {
            totalHours = SafeMath.add(totalHours, entry.hours);
            totalOT = SafeMath.add(totalOT, entry.otHours);

            const breakdown = entry.breakdown || { basePay: 0, otPay: 0, allowancePay: 0, holidayPay: 0, isSpecialDay: false, isOffDay: false };
            sumBase = SafeMath.add(sumBase, breakdown.basePay);
            sumOT = SafeMath.add(sumOT, breakdown.otPay);
            sumAllowance = SafeMath.add(sumAllowance, breakdown.allowancePay);
            sumHoliday = SafeMath.add(sumHoliday, breakdown.holidayPay);

            if (entry.isHoliday) holidayCount++;
            else if (breakdown.isOffDay) offDayCount++;

            const dailyTotal = SafeMath.add(breakdown.basePay, breakdown.otPay, breakdown.allowancePay, breakdown.holidayPay);
            const parts = entry.date.split('-');
            const dObj = new Date(parts[0], parts[1] - 1, parts[2]);

            let dayColor = 'text-gray-500';
            let dayTag = '';
            if (entry.isHoliday) { dayColor = 'text-red-500'; dayTag = '<span class="text-[8px] font-bold bg-red-100 dark:bg-red-900/40 text-red-600 px-1.5 py-0.5 rounded ml-1.5">LỄ</span>'; }
            else if (breakdown.isOffDay) { dayColor = 'text-orange-500'; dayTag = '<span class="text-[8px] font-bold bg-orange-100 dark:bg-orange-900/40 text-orange-600 px-1.5 py-0.5 rounded ml-1.5">NGHỈ</span>'; }

            tableHtml += `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer" onclick="selectDate('${entry.date}')">
                <td class="p-3 pl-5 text-xs text-gray-500 font-medium">${stt++}</td>
                <td class="p-3">
                    <div class="flex items-center">
                        <span class="text-[10px] font-bold ${dayColor} uppercase tracking-wide">${daysOfWeek[dObj.getDay()]}</span>
                        ${dayTag}
                    </div>
                    <div class="font-medium text-gray-900 dark:text-white">${dObj.getDate()}/${dObj.getMonth() + 1}</div>
                </td>
                <td class="p-3 text-gray-600 dark:text-gray-300 text-sm font-medium">${entry.hours}h <span class="text-xs ${entry.otHours > 0 ? 'text-blue-500' : 'text-gray-400'} ml-1">OT: ${entry.otHours}h</span></td>
                <td class="p-3 pr-5 text-right font-semibold text-gray-900 dark:text-white">${formatMoney(dailyTotal, curr)}</td>
            </tr>`;
        });
    }

    table.innerHTML = tableHtml;

    const monthlyAllowValue = Number(appConfig.monthlyAllowance) || 0;
    if (monthlyAllowValue > 0 && totalDays > 0) sumAllowance = SafeMath.add(sumAllowance, monthlyAllowValue);

    setCurrentGrossIncome(SafeMath.add(sumBase, sumOT, sumAllowance, sumHoliday));

    document.getElementById('dashTotal').textContent = formatMoney(currentGrossIncome, curr);
    document.getElementById('dashAvgPay').textContent = formatMoney(totalDays > 0 ? SafeMath.divide(currentGrossIncome, totalDays) : 0, curr);
    document.getElementById('dashDays').textContent = totalDays;
    document.getElementById('dashHolidays').textContent = holidayCount;
    document.getElementById('dashOffDays').textContent = offDayCount;
    document.getElementById('dashHours').textContent = totalHours;
    document.getElementById('dashOT').textContent = totalOT;
    document.getElementById('dashBasePay').textContent = formatMoney(sumBase, curr);
    document.getElementById('dashOTPay').textContent = formatMoney(sumOT, curr);
    document.getElementById('dashAllowance').textContent = formatMoney(SafeMath.add(sumAllowance, sumHoliday), curr);

    const progressSection = document.getElementById('monthlyProgressSection');
    if (progressSection) progressSection.classList.remove('hidden');

    let workingDaysConf = Array.isArray(appConfig.workingDays) && appConfig.workingDays.length > 0 ? appConfig.workingDays : ['T2', 'T3', 'T4', 'T5', 'T6'];
    const startM = new Date(start); startM.setHours(0, 0, 0, 0);
    const endM = new Date(end); endM.setHours(23, 59, 59, 999);

    let totalWorkingDaysInCycle = 0;
    let iterDate = new Date(startM);
    while (iterDate <= endM) {
        if (workingDaysConf.includes(daysOfWeek[iterDate.getDay()])) totalWorkingDaysInCycle++;
        iterDate.setDate(iterDate.getDate() + 1);
    }
    if (totalWorkingDaysInCycle === 0) totalWorkingDaysInCycle = 1;

    const timeProgTotalEl = document.getElementById('timeProgTotal');
    if (timeProgTotalEl) {
        timeProgTotalEl.textContent = totalWorkingDaysInCycle;
        document.getElementById('timeProgCurrent').textContent = totalDays;
        let timePercent = Math.min((totalDays / totalWorkingDaysInCycle) * 100, 100);
        document.getElementById('timeProgPercent').textContent = `${timePercent.toFixed(0)}%`;
        setTimeout(() => { const bar = document.getElementById('timeProgBar'); if (bar) bar.style.width = `${timePercent}%`; }, 100);
    }

    const workProgressWrapper = document.getElementById('workProgressWrapper');
    if (appConfig.salaryType === 'thang') {
        if (workProgressWrapper) workProgressWrapper.classList.remove('hidden');
        const targetDays = Number(appConfig.standardDays) || 26;
        document.getElementById('progTarget').textContent = targetDays;
        document.getElementById('progCurrent').textContent = totalDays;
        let percent = Math.min((totalDays / targetDays) * 100, 100);
        document.getElementById('progPercent').textContent = `${percent % 1 === 0 ? percent : percent.toFixed(1)}%`;
        setTimeout(() => { const bar = document.getElementById('progBar'); if (bar) bar.style.width = `${percent}%`; }, 100);
    } else {
        if (workProgressWrapper) workProgressWrapper.classList.add('hidden');
    }

    document.getElementById('psBase').textContent = formatMoney(sumBase, curr);
    document.getElementById('psOT').textContent = formatMoney(sumOT, curr);
    document.getElementById('psHoliday').textContent = formatMoney(sumHoliday, curr);
    document.getElementById('psAllowance').textContent = formatMoney(sumAllowance, curr);
    document.getElementById('psTotal').textContent = formatMoney(currentGrossIncome, curr);

    const expTotalDays = document.getElementById('expTotalDays');
    if (expTotalDays) {
        let specialText = [];
        if (holidayCount > 0) specialText.push(`${holidayCount} Lễ`);
        if (offDayCount > 0) specialText.push(`${offDayCount} Nghỉ`);
        let specialString = specialText.length > 0 ? ` (${specialText.join(' - ')})` : '';
        expTotalDays.textContent = `${totalDays}${specialString}`;
        document.getElementById('expTotalHours').textContent = totalHours;
        document.getElementById('expTotalOT').textContent = totalOT;
        document.getElementById('expTotalIncome').textContent = formatMoney(currentGrossIncome, curr);
    }

    renderPayslipExpenses();
    renderSavedPayslips();
};

const saveExpensesToStorage = () => { localStorage.setItem('payrollExpensesV6', JSON.stringify(storedExpenses)); window.triggerAutoBackup(); };

const renderPayslipExpenses = () => {
    const key = getMonthKey();
    const exp = storedExpenses[key] || { tax: 0, insurance: 0, custom: [] };
    document.getElementById('inputTax').value = formatNumToVN(exp.tax);
    document.getElementById('inputInsurance').value = formatNumToVN(exp.insurance);

    const list = document.getElementById('customExpensesList');
    let listHtml = '';
    (exp.custom || []).forEach((item, index) => {
        listHtml += `
            <div class="flex gap-2">
                <input type="text" placeholder="Tên khoản" value="${item.name}" oninput="updateCustomExpense(${index}, 'name', this.value)" class="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium outline-none bg-transparent dark:text-white">
                <input type="text" inputmode="decimal" placeholder="Số tiền" value="${formatNumToVN(item.amount)}" oninput="formatInputMoney(event); updateCustomExpense(${index}, 'amount', this.value)" class="money-input w-24 px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium outline-none text-right bg-transparent dark:text-white">
                <button onclick="removeCustomExpense(${index})" class="w-9 h-9 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-95"><i class="fa-solid fa-xmark"></i></button>
            </div>`;
    });
    list.innerHTML = listHtml;
    calculateFinalPayslip();
};

const calculateFinalPayslip = () => {
    const curr = appConfig.currency || 'đ'; const key = getMonthKey();
    const exp = storedExpenses[key] || { tax: 0, insurance: 0, custom: [] };
    let customTotal = 0;
    (exp.custom || []).forEach(item => customTotal = SafeMath.add(customTotal, item.amount));
    const totalDeductions = SafeMath.add(exp.tax, exp.insurance, customTotal);
    const net = SafeMath.subtract(currentGrossIncome, totalDeductions);
    document.getElementById('psTotalDeductions').textContent = formatMoney(totalDeductions, curr);
    document.getElementById('psNetTotal').textContent = formatMoney(net, curr);
};

const renderSavedPayslips = () => {
    const container = document.getElementById('savedPayslipsContainer');
    let htmlContent = '';
    if (savedPayslips.length === 0) {
        container.innerHTML = '<p class="text-xs font-medium text-gray-500 text-center py-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">Chưa có bảng lương nào.</p>'; return;
    }
    [...savedPayslips].sort((a, b) => b.id - a.id).forEach(ps => {
        htmlContent += `
            <div class="border border-gray-100 dark:border-gray-800 rounded-2xl p-4 bg-gray-50 dark:bg-gray-950 flex flex-col gap-3 transition hover:shadow-sm">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Tháng ${ps.month}</div>
                        <div class="text-[10px] text-gray-500 mt-0.5"><i class="fa-regular fa-clock mr-1"></i>${ps.timestamp}</div>
                    </div>
                    <div class="text-right"><span class="text-lg font-black text-green-600 dark:text-green-400 block">${ps.net}</span></div>
                </div>
                <div class="flex gap-2 border-t border-gray-200 dark:border-gray-800 pt-3 mt-1">
                    <button onclick="exportPayslip('${ps.id}', 'png')" class="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-[11px] font-bold py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition shadow-sm"><i class="fa-regular fa-image mr-1.5"></i>Lưu Ảnh</button>
                    <button onclick="exportPayslip('${ps.id}', 'pdf')" class="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-[11px] font-bold py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition shadow-sm"><i class="fa-regular fa-file-pdf mr-1.5"></i>Lưu PDF</button>
                    <button onclick="deletePayslip('${ps.id}')" class="w-10 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 active:scale-95 transition"><i class="fa-solid fa-trash text-xs"></i></button>
                </div>
            </div>`;
    });
    container.innerHTML = htmlContent;
};

// ==========================================
// 4. FIREBASE & CLOUD BACKUP
// ==========================================
window.triggerAutoBackup = () => {
    if (localStorage.getItem('autoBackupON') === '1' && currentUser) {
        clearTimeout(autoBackupTimeout);
        autoBackupTimeout = setTimeout(() => {
            const data = { config: appConfig, entries: workEntries, expenses: storedExpenses, payslips: savedPayslips, timestamp: new Date().toISOString(), name: "Tự động sao lưu", isAuto: true };
            createCloudBackup("Tự động sao lưu", data, true);
        }, 3000);
    }
};

window.toggleAutoBackup = (isON) => { localStorage.setItem('autoBackupON', isON ? '1' : '0'); window.triggerAutoBackup(); };

window.loadFirebaseBackups = async () => {
    const listEl = document.getElementById('cloudBackupsList');
    if (!listEl) return;
    listEl.innerHTML = '<p class="text-xs font-medium text-gray-400 text-center py-6"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Đang tải dữ liệu...</p>';

    const backups = await getCloudBackups();
    if (!backups) { listEl.innerHTML = '<p class="text-xs font-medium text-red-400 text-center py-6">Lỗi truy cập dữ liệu đám mây.</p>'; return; }
    if (backups.length === 0) { listEl.innerHTML = '<p class="text-xs font-medium text-gray-400 text-center py-6">Chưa có bản sao lưu nào.</p>'; return; }

    let htmlContent = '';
    backups.forEach(b => {
        htmlContent += `
            <div class="py-2.5 px-3 flex justify-between items-center group hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition">
                <div>
                    <div class="text-sm font-medium text-gray-800 dark:text-gray-200">${b.name} ${b.isAuto ? '<span class="text-[10px] bg-gray-200 dark:bg-gray-700 px-1 rounded ml-1">Auto</span>' : ''}</div>
                    <div class="text-[10px] text-gray-500 mt-0.5">${new Date(b.timestamp).toLocaleString('vi-VN')}</div>
                </div>
                <div class="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                    <button onclick="restoreCloudBackup('${b.id}', this)" class="w-7 h-7 rounded bg-white dark:bg-gray-800 shadow-sm text-gray-600 dark:text-gray-300 hover:text-blue-500 transition disabled:opacity-50"><i class="fa-solid fa-clock-rotate-left text-xs"></i></button>
                    <button onclick="deleteCloudBackup('${b.id}')" class="w-7 h-7 rounded bg-white dark:bg-gray-800 shadow-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"><i class="fa-solid fa-trash text-xs"></i></button>
                </div>
            </div>`;
    });
    listEl.innerHTML = htmlContent;
};

window.promptManualBackup = async (btnElement) => {
    if (!currentUser) return customAlert("Bạn cần đăng nhập trước.");
    const name = await customPrompt("Nhập tên bản sao lưu (Ví dụ: Chốt tháng 10):");

    if (name) {
        const originalText = btnElement ? btnElement.innerHTML : "Tạo bản sao lưu";
        if (btnElement) { btnElement.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Đang lưu...'; btnElement.disabled = true; }

        const data = { config: appConfig, entries: workEntries, expenses: storedExpenses, payslips: savedPayslips, timestamp: new Date().toISOString(), name, isAuto: false };
        const success = await createCloudBackup(name, data, false);

        if (btnElement) { btnElement.innerHTML = originalText; btnElement.disabled = false; }
        if (success) { await customAlert('Đã tạo bản sao lưu thành công!', 'Hoàn tất'); window.loadFirebaseBackups(); }
        else { await customAlert('Có lỗi xảy ra khi sao lưu. Vui lòng kiểm tra mạng.', 'Lỗi'); }
    }
};

window.restoreCloudBackup = async (docId, btnElement) => {
    if (!(await customConfirm("Khôi phục sẽ GHI ĐÈ dữ liệu hiện tại. Bạn chắc chắn muốn tiếp tục?"))) return;

    let originalHtml = "";
    if (btnElement) { originalHtml = btnElement.innerHTML; btnElement.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-xs"></i>'; btnElement.disabled = true; }

    const data = await getCloudBackupById(docId);
    if (btnElement) { btnElement.innerHTML = originalHtml; btnElement.disabled = false; }

    if (data) {
        if (data.config) localStorage.setItem('userPayrollConfig', JSON.stringify(data.config));
        if (data.entries) localStorage.setItem('payrollEntriesV5', JSON.stringify(data.entries));
        if (data.expenses) localStorage.setItem('payrollExpensesV6', JSON.stringify(data.expenses));
        if (data.payslips) localStorage.setItem('savedPayslipsV1', JSON.stringify(data.payslips));
        await customAlert('Khôi phục thành công! Hệ thống sẽ tự động tải lại để cập nhật số liệu.', 'Hoàn tất');
        location.reload();
    } else {
        await customAlert("Lỗi khôi phục. Bản ghi có thể đã bị xóa hoặc mạng không ổn định.", "Lỗi");
    }
};

window.deleteCloudBackup = async (docId) => {
    if (await customConfirm("Xóa bản sao lưu khỏi đám mây?")) { await deleteCloudBackupById(docId); window.loadFirebaseBackups(); }
};


// ==========================================
// 5. SETTINGS: QUẢN LÝ CA LÀM VIỆC
// ==========================================
window.renderColorPicker = (selectedId = 'gray') => {
    const container = document.getElementById('colorPickerContainer');
    if (!container) return;
    container.innerHTML = shiftColorsPalette.map(c => `
        <button type="button" onclick="selectShiftColor('${c.id}')" 
            class="w-7 h-7 rounded-full ${c.dot} shadow-sm transition-all transform ${selectedId === c.id ? 'ring-4 ring-offset-2 ring-gray-900 dark:ring-white dark:ring-offset-gray-950 scale-110' : 'opacity-40 hover:opacity-100'}">
        </button>
    `).join('');
    document.getElementById('newShiftColor').value = selectedId;
};

window.selectShiftColor = (id) => window.renderColorPicker(id);

window.renderSettingsShifts = () => {
    const list = document.getElementById('settingsShiftsList');
    if (!list) return;
    let html = '';

    tempShifts.forEach(shift => {
        let ruleText = "Chỉ hiển thị";
        if (shift.ruleType === 'allowance') ruleText = `+ ${formatNumToVN(shift.ruleValue)}đ`;
        if (shift.ruleType === 'multiplier') ruleText = `x ${shift.ruleValue}`;

        // SỬA TẠI ĐÂY: Lấy trực tiếp mã màu HEX từ dữ liệu ca
        // Nếu là ca mặc định cũ chưa có HEX, ta cho nó màu xám (#9ca3af)
        const dotColor = (shift.color && shift.color.startsWith('#')) ? shift.color : '#9ca3af';

        const editBtn = shift.id === 'shift_default' ? '' : `<button type="button" onclick="editSettingShift('${shift.id}')" class="w-8 h-8 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition mr-1"><i class="fa-solid fa-pen"></i></button>`;
        const deleteBtn = shift.id === 'shift_default' ? `<span class="text-[10px] font-medium text-gray-400">Mặc định</span>` : `<button type="button" onclick="removeSettingShift('${shift.id}')" class="w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"><i class="fa-solid fa-xmark"></i></button>`;

        html += `
            <div class="flex justify-between items-center p-3 border border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900/50 mb-2 transition hover:shadow-sm">
                <div class="flex items-center gap-3">
                    <span class="w-3.5 h-3.5 rounded-full shadow-sm" style="background-color: ${dotColor}"></span>
                    <div>
                        <div class="text-sm font-bold text-gray-900 dark:text-white leading-tight">${shift.name}</div>
                        <div class="text-[11px] font-medium text-gray-500 mt-0.5">${ruleText}</div>
                    </div>
                </div>
                <div class="flex items-center">${editBtn}${deleteBtn}</div>
            </div>`;
    });
    list.innerHTML = html;
};

window.openAddShiftForm = () => {
    editingShiftId = null;
    document.getElementById('shiftFormTitle').textContent = 'Thêm Ca Mới';
    document.getElementById('newShiftName').value = '';
    document.getElementById('newShiftValue').value = '';
    document.getElementById('newShiftRule').value = 'none';
    window.toggleShiftRuleValue('none');
    window.renderColorPicker('gray');

    document.getElementById('addShiftForm').classList.remove('hidden');
    document.getElementById('btnOpenAddShift').classList.add('hidden');
};

window.editSettingShift = (id) => {
    const shift = tempShifts.find(s => s.id === id);
    if (!shift) return;
    editingShiftId = id;
    document.getElementById('newShiftName').value = shift.name;
    // Điền màu HEX vào preview
    window.applySelectedColor(shift.color.startsWith('#') ? shift.color : '#6366f1');
    document.getElementById('newShiftRule').value = shift.ruleType;
    window.toggleShiftRuleValue(shift.ruleType);

    if (shift.ruleType !== 'none') document.getElementById('newShiftValue').value = formatNumToVN(shift.ruleValue);
    else document.getElementById('newShiftValue').value = '';

    const colorObj = shiftColorsPalette.find(c => c.class === shift.color) || shiftColorsPalette[0];
    window.renderColorPicker(colorObj.id);

    document.getElementById('addShiftForm').classList.remove('hidden');
    document.getElementById('btnOpenAddShift').classList.add('hidden');
};

window.closeAddShiftForm = () => {
    editingShiftId = null;
    document.getElementById('addShiftForm').classList.add('hidden');
    document.getElementById('btnOpenAddShift').classList.remove('hidden');
};

window.toggleShiftRuleValue = (val) => {
    const input = document.getElementById('newShiftValue');
    if (val === 'none') { input.classList.add('hidden'); input.value = ''; }
    else { input.classList.remove('hidden'); input.placeholder = val === 'allowance' ? 'Nhập số tiền (VD: 50000)' : 'Nhập hệ số (VD: 1.3)'; }
};

window.saveNewShift = () => {
    const name = document.getElementById('newShiftName').value.trim();
    if (!name) return customAlert("Vui lòng nhập tên ca!");

    const hexColor = document.getElementById('newShiftColor').value; // Lấy mã HEX

    const ruleType = document.getElementById('newShiftRule').value;
    const ruleValue = getMoneyValue(document.getElementById('newShiftValue').value) || 0;

    if (editingShiftId) {
        const idx = tempShifts.findIndex(s => s.id === editingShiftId);
        if (idx > -1) {
            tempShifts[idx].name = name;
            tempShifts[idx].color = hexColor; // Lưu HEX
            tempShifts[idx].ruleType = ruleType;
            tempShifts[idx].ruleValue = ruleValue;
        }
    } else {
        tempShifts.push({
            id: 'shift_' + Date.now(), name, color: hexColor,
            ruleType, ruleValue, affectsSalary: ruleType !== 'none'
        });
    }
    window.renderSettingsShifts();
    window.closeAddShiftForm();
};
window.removeSettingShift = (id) => {
    const idx = tempShifts.findIndex(s => s.id === id);
    if (idx > -1) tempShifts.splice(idx, 1);
    window.renderSettingsShifts();
};


// ==========================================
// 6. EDIT MODE: SỬA LỊCH VUỐT NHIỀU NGÀY
// ==========================================
window.toggleEditMode = () => {
    isEditMode = !isEditMode;
    const btn = document.getElementById('btnEditSchedule');
    const workForm = document.getElementById('workForm');
    const editForm = document.getElementById('editScheduleForm');

    if (isEditMode) {
        window.setViewMode('cycle');
        btn.innerHTML = '<i class="fa-solid fa-check mr-1.5"></i>Xong';
        btn.className = "text-xs font-bold text-white px-3 py-1.5 rounded-lg bg-blue-600 shadow-md active:scale-95 transition";

        workForm.classList.add('hidden');
        editForm.classList.remove('hidden');

        selectedDatesToEdit.clear();
        window.updateEditFormUI();
    } else {
        window.closeEditMode();
    }
};

window.closeEditMode = () => {
    isEditMode = false;
    window.clearSelection();

    const btn = document.getElementById('btnEditSchedule');
    btn.innerHTML = "Sửa Lịch";
    btn.className = "text-xs font-bold text-gray-900 dark:text-white px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 bg-white dark:bg-gray-900 transition";

    document.getElementById('editScheduleForm').classList.add('hidden');
    document.getElementById('workForm').classList.remove('hidden');

    renderTimeline();
};

window.clearSelection = () => {
    selectedDatesToEdit.forEach(dateStr => {
        const card = document.getElementById(`card-${dateStr}`);
        if (card) card.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50', 'dark:bg-blue-900/40', 'transform', 'scale-105', 'z-20');
    });
    selectedDatesToEdit.clear();
    window.updateEditFormUI();
};

window.updateEditFormUI = () => {
    const title = document.getElementById('editScheduleTitle');
    const hasSelection = selectedDatesToEdit.size > 0;

    if (title) {
        if (hasSelection) {
            title.textContent = `Đã chọn ${selectedDatesToEdit.size} ngày`;
            title.classList.add('text-blue-600', 'dark:text-blue-400');
        } else {
            title.textContent = `Chưa chọn ngày nào`;
            title.classList.remove('text-blue-600', 'dark:text-blue-400');
        }
    }

    const container = document.getElementById('editScheduleShiftsContainer');
    if (container) {
        let html = '';
        const shifts = appConfig.shifts || defaultAppConfig.shifts;
        const opacityClass = hasSelection ? '' : 'opacity-50 pointer-events-none grayscale-[50%]';

        shifts.forEach(shift => {
            let ruleBadge = '';
            if (shift.ruleType === 'allowance' && shift.ruleValue > 0) ruleBadge = `<span class="ml-1.5 opacity-80 font-medium text-[10px]">(+${formatNumToVN(shift.ruleValue)})</span>`;
            else if (shift.ruleType === 'multiplier' && shift.ruleValue > 0) ruleBadge = `<span class="ml-1.5 opacity-80 font-medium text-[10px]">(x${shift.ruleValue})</span>`;

            html += `<button type="button" onclick="applySchedule('${shift.id}')" class="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center transition-all shadow-sm active:scale-95 ${shift.color} ${opacityClass}">${shift.name}${ruleBadge}</button>`;
        });
        container.innerHTML = html;
    }

    const btnHoliday = document.getElementById('btnEditHoliday');
    const btnClear = document.getElementById('btnEditClear');
    if (btnHoliday && btnClear) {
        if (hasSelection) {
            btnHoliday.classList.remove('opacity-50', 'pointer-events-none');
            btnClear.classList.remove('opacity-50', 'pointer-events-none');
        } else {
            btnHoliday.classList.add('opacity-50', 'pointer-events-none');
            btnClear.classList.add('opacity-50', 'pointer-events-none');
        }
    }
};

window.applySchedule = (action) => {
    if (selectedDatesToEdit.size === 0) return;

    selectedDatesToEdit.forEach(dateStr => {
        if (action === 'clear') {
            saveSchedule(dateStr, 'clear'); // Xóa nhãn lịch
            deleteWorkEntry(dateStr);       // Xóa luôn công thực tế nếu có
        } else if (action === 'holiday') {
            // Ngày lễ thường cố định có tiền nên vẫn lưu vào workEntries
            const hours = appConfig.standardHours || 8;
            const breakdown = calculateDailySalaryDetails(hours, 0, true, dateStr, daysOfWeek, 'shift_default');
            breakdown.isHoliday = true;
            updateWorkEntry({
                id: Date.now().toString() + Math.random().toString(16).slice(2),
                date: dateStr, hours: hours, otHours: 0, hasAllowance: true,
                isHoliday: true, shiftId: 'shift_default', breakdown
            });
        } else {
            // Gán các Ca khác: CHỈ LƯU NHÃN LỊCH (userSchedule)
            saveSchedule(dateStr, action);
        }
    });

    window.clearSelection();
    renderTimeline();
    updateDataDisplays();
    window.triggerAutoBackup();
};

// ==========================================
// 7. GLOBAL UI HANDLERS & NAVIGATION
// ==========================================
window.formatInputMoney = formatInputMoney;
window.setThemeType = setThemeType;
window.switchTab = switchTab;
window.switchSetTab = switchSetTab;
window.loginGoogle = loginGoogle;
window.logout = logout;
window.selectDate = selectDate;

window.loginEmailBtn = () => { loginEmail(document.getElementById('emailInput').value, document.getElementById('passInput').value); };

window.resetPasswordBtn = async () => {
    const email = document.getElementById('emailInput').value.trim();
    const res = await resetPassword(email);
    if (res.success) await customAlert("Đã gửi liên kết đặt lại mật khẩu! Vui lòng kiểm tra hộp thư.", "Thành công");
    else await customAlert(res.message, "Lỗi");
};

window.adjustHours = (id, amount) => {
    const input = document.getElementById(id); let val = getMoneyValue(input.value);
    val = SafeMath.add(val, amount); if (val < 0) val = 0; input.value = formatNumToVN(val);
};

window.shiftWeek = (offsetDays) => {
    if (!selectedDayString) return;
    const sd = new Date(selectedDayString); sd.setDate(sd.getDate() + offsetDays);
    currentTargetDate = sd;
    document.getElementById('cycleMonthPicker').value = `${sd.getFullYear()}-${String(sd.getMonth() + 1).padStart(2, '0')}`;
    selectedDayString = getLocalISOString(sd); renderTimeline(); selectDate(selectedDayString, false);
};

window.shiftMonth = (offset) => {
    const input = document.getElementById('cycleMonthPicker'); if (!input.value) return;
    let [year, month] = input.value.split('-'); let d = new Date(year, month - 1, 1); d.setMonth(d.getMonth() + offset);
    input.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; input.dispatchEvent(new Event('change'));
};

window.setViewMode = (mode) => {
    timelineViewMode = mode;
    const btnW = document.getElementById('btnViewWeek'); const btnC = document.getElementById('btnViewCycle'); const navBtns = document.getElementById('weekNavBtns');
    if (mode === 'week') {
        btnW.className = "px-3 py-1.5 rounded-md bg-white dark:bg-gray-800 text-xs font-medium text-gray-900 dark:text-white shadow-sm";
        btnC.className = "px-3 py-1.5 rounded-md text-xs font-medium text-gray-500";
        navBtns.classList.remove('hidden'); navBtns.classList.add('flex');
    } else {
        btnC.className = "px-3 py-1.5 rounded-md bg-white dark:bg-gray-800 text-xs font-medium text-gray-900 dark:text-white shadow-sm";
        btnW.className = "px-3 py-1.5 rounded-md text-xs font-medium text-gray-500";
        navBtns.classList.add('hidden'); navBtns.classList.remove('flex');
    }
    renderTimeline();
};

window.setCurrency = (val, btn) => {
    document.getElementById('currency').value = val;
    document.querySelectorAll('.currency-btn').forEach(b => b.className = "currency-btn flex-1 py-1.5 text-[11px] font-medium rounded-lg text-gray-500 transition hover:text-gray-900 dark:hover:text-white");
    if (btn) btn.className = "currency-btn flex-1 py-1.5 text-[11px] font-bold rounded-lg bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white transition";
};

window.setSalaryType = (val, btn) => {
    document.getElementById('salaryType').value = val;
    document.querySelectorAll('.salary-type-btn').forEach(b => b.className = "salary-type-btn flex-1 py-1.5 text-[11px] font-medium rounded-lg text-gray-500 transition hover:text-gray-900 dark:hover:text-white");
    if (btn) btn.className = "salary-type-btn flex-1 py-1.5 text-[11px] font-bold rounded-lg bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white transition";
    const isThang = val === 'thang';
    document.getElementById('monthlyWrapper').classList.toggle('hidden', !isThang);
    document.getElementById('monthlyWrapper').classList.toggle('grid', isThang);
    document.getElementById('hourlyWrapper').classList.toggle('hidden', isThang);
    document.getElementById('monthlyProgressSection').classList.toggle('hidden', !isThang);
};

window.addCustomExpense = () => {
    const key = getMonthKey(); if (!storedExpenses[key]) storedExpenses[key] = { tax: 0, insurance: 0, custom: [] };
    if (!storedExpenses[key].custom) storedExpenses[key].custom = [];
    storedExpenses[key].custom.push({ name: '', amount: 0 }); saveExpensesToStorage(); renderPayslipExpenses();
};

window.updateCustomExpense = (index, field, val) => {
    const key = getMonthKey(); if (field === 'amount') val = getMoneyValue(val);
    storedExpenses[key].custom[index][field] = val; saveExpensesToStorage(); renderPayslipExpenses();
};

window.removeCustomExpense = (index) => {
    const key = getMonthKey(); storedExpenses[key].custom.splice(index, 1); saveExpensesToStorage(); renderPayslipExpenses();
};

window.toggleActualInput = (isMatch) => {
    const wrapper = document.getElementById('actualInputWrapper');
    if (wrapper) {
        if (isMatch) { wrapper.classList.add('hidden'); document.getElementById('actualReceivedInput').value = ''; }
        else wrapper.classList.remove('hidden');
    }
};

window.saveCurrentPayslip = async () => {
    const month = getMonthKey();
    const existsIndex = savedPayslips.findIndex(p => p.month === month);
    if (existsIndex > -1) { if (!(await customConfirm(`Đã lưu tháng ${month}. Bạn muốn cập nhật lại toàn bộ chi tiết?`))) return; }

    const curr = appConfig.currency || 'đ'; const key = getMonthKey(); const exp = storedExpenses[key] || { tax: 0, insurance: 0, custom: [] };

    const payslipData = {
        id: Date.now().toString(), month: month, timestamp: new Date().toLocaleString('vi-VN'),
        details: { totalDays: document.getElementById('dashDays').innerText, totalHours: document.getElementById('dashHours').innerText, totalOT: document.getElementById('dashOT').innerText, basePay: document.getElementById('psBase').innerText, otPay: document.getElementById('psOT').innerText, holidayPay: document.getElementById('psHoliday').innerText, allowancePay: document.getElementById('psAllowance').innerText },
        deductions: { tax: formatMoney(exp.tax, curr), insurance: formatMoney(exp.insurance, curr), custom: exp.custom.map(item => ({ name: item.name, amount: formatMoney(item.amount, curr) })), total: document.getElementById('psTotalDeductions').innerText },
        gross: document.getElementById('psTotal').innerText, net: document.getElementById('psNetTotal').innerText,
    };

    if (existsIndex > -1) savedPayslips[existsIndex] = payslipData; else savedPayslips.push(payslipData);
    localStorage.setItem('savedPayslipsV1', JSON.stringify(savedPayslips));
    await customAlert('Đã lưu bảng lương chi tiết!'); renderSavedPayslips(); window.triggerAutoBackup();
};

window.deletePayslip = async (id) => {
    if (await customConfirm('Xoá phiếu lương này khỏi lịch sử?')) {
        const idx = savedPayslips.findIndex(p => p.id === id); if (idx > -1) savedPayslips.splice(idx, 1);
        localStorage.setItem('savedPayslipsV1', JSON.stringify(savedPayslips)); renderSavedPayslips(); window.triggerAutoBackup();
    }
};

window.exportAllData = () => {
    const data = { config: appConfig, entries: workEntries, expenses: storedExpenses, payslips: savedPayslips };
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `WorkLog_Backup_${getLocalISOString(new Date())}.json`;
    a.click(); URL.revokeObjectURL(url);
};

window.importAllData = async (event) => {
    const file = event.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.config) localStorage.setItem('userPayrollConfig', JSON.stringify(data.config));
            if (data.entries) localStorage.setItem('payrollEntriesV5', JSON.stringify(data.entries));
            if (data.expenses) localStorage.setItem('payrollExpensesV6', JSON.stringify(data.expenses));
            if (data.payslips) localStorage.setItem('savedPayslipsV1', JSON.stringify(data.payslips));
            await customAlert('Khôi phục thành công! Trang sẽ tải lại.'); location.reload();
        } catch (err) { await customAlert('File không hợp lệ!'); }
    }; reader.readAsText(file);
};

window.exportPayslip = async (id, format) => {
    const ps = savedPayslips.find(p => p.id === id); if (!ps) return;
    document.getElementById('exMonth').textContent = `Tháng ${ps.month}`;
    document.getElementById('exDays').textContent = ps.details?.totalDays || '0';
    document.getElementById('exHours').textContent = ps.details?.totalHours + 'h' || '0h';
    document.getElementById('exOT').textContent = ps.details?.totalOT + 'h' || '0h';
    document.getElementById('exIncomeList').innerHTML = `<div class="flex justify-between"><span>Lương chính</span><span class="font-bold">${ps.details.basePay}</span></div><div class="flex justify-between"><span>Lương tăng ca</span><span class="font-bold">${ps.details.otPay}</span></div><div class="flex justify-between"><span>Thưởng lễ</span><span class="font-bold">${ps.details.holidayPay}</span></div><div class="flex justify-between text-blue-600"><span>Phụ cấp</span><span class="font-bold">${ps.details.allowancePay}</span></div>`;
    let customDeds = (ps.deductions.custom || []).map(d => `<div class="flex justify-between"><span>${d.name || 'Khác'}</span><span class="font-bold">${d.amount}</span></div>`).join('');
    document.getElementById('exDeductionList').innerHTML = `<div class="flex justify-between"><span>Thuế TNCN</span><span class="font-bold">${ps.deductions.tax}</span></div><div class="flex justify-between"><span>Bảo hiểm</span><span class="font-bold">${ps.deductions.insurance}</span></div>${customDeds}`;
    document.getElementById('exGross').textContent = ps.gross; document.getElementById('exTotalDed').textContent = ps.deductions.total; document.getElementById('exNet').textContent = ps.net; document.getElementById('exTime').textContent = `Mã xác thực: ${ps.id} - Xuất lúc: ${new Date().toLocaleString('vi-VN')}`;

    const template = document.getElementById('exportPayslipTemplate'); await new Promise(r => setTimeout(r, 200));
    if (window.html2canvas) {
        const canvas = await window.html2canvas(template, { scale: 3, backgroundColor: '#ffffff' });
        if (format === 'png') { const a = document.createElement('a'); a.href = canvas.toDataURL("image/png"); a.download = `PhieuLuong_T${ps.month}.png`; a.click(); }
        else if (window.jspdf) { const { jsPDF } = window.jspdf; const pdf = new jsPDF('p', 'mm', 'a4'); pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, 190, 0); pdf.save(`PhieuLuong_T${ps.month}.pdf`); }
    } else customAlert("Thư viện xuất file chưa được tải.");
};

window.exportCycleImage = async () => {
    const el = document.getElementById('cycleHistoryExportContainer');
    if (getCycleEntries().length === 0) return await customAlert('Không có dữ liệu.');
    document.getElementById('exportSummary').classList.remove('hidden');
    if (window.html2canvas) {
        window.html2canvas(el, { scale: 2, backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff' }).then(canvas => {
            const a = document.createElement('a'); a.href = canvas.toDataURL("image/png"); a.download = `LichSu_${getMonthKey()}.png`; a.click();
            document.getElementById('exportSummary').classList.add('hidden');
        });
    }
};

window.exportCyclePDF = async () => {
    const el = document.getElementById('cycleHistoryExportContainer');
    if (getCycleEntries().length === 0) return await customAlert('Không có dữ liệu.');
    if (window.html2canvas && window.jspdf) {
        window.html2canvas(el, { scale: 2, backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff' }).then(canvas => {
            const imgData = canvas.toDataURL('image/png'); const { jsPDF } = window.jspdf; const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth(); const imgProps = pdf.getImageProperties(imgData);
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.text(`Bao Cao Cong - Thang ${getMonthKey()}`, 10, 10);
            pdf.addImage(imgData, 'PNG', 0, 15, pdfWidth, pdfHeight); pdf.save(`LichSu_${getMonthKey()}.pdf`);
        });
    }
};

// ==========================================
// 8. KHỞI TẠO ỨNG DỤNG (INIT & EVENTS)
// ==========================================
const init = () => {
    // 1. CHUẨN HÓA CÁC INPUT NHẬP TIỀN
    ['standardHours', 'standardDays', 'cutoffDate', 'hoursInput', 'otInput', 'baseSalaryMonth', 'baseSalaryHour', 'otRate', 'holidayRate', 'dailyAllowance', 'monthlyAllowance'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.type = 'text';
            el.setAttribute('inputmode', 'decimal');
            if (id !== 'cutoffDate') el.classList.add('money-input');
        }
    });

    // Gắn sự kiện định dạng tiền tệ khi gõ (1.000.000)
    document.querySelectorAll('.money-input').forEach(el => {
        el.addEventListener('input', formatInputMoney);
    });

    // 2. THIẾT LẬP CÁC BỘ LẮNG NGHE CHO PAYSLIP (DEDUCTIONS)
    const saveAndCalc = debounce(() => { saveExpensesToStorage(); calculateFinalPayslip(); }, 300);

    document.getElementById('inputTax')?.addEventListener('input', (e) => {
        const key = getMonthKey(); if (!storedExpenses[key]) storedExpenses[key] = { tax: 0, insurance: 0, custom: [] };
        storedExpenses[key].tax = getMoneyValue(e.target.value); saveAndCalc();
    });

    document.getElementById('inputInsurance')?.addEventListener('input', (e) => {
        const key = getMonthKey(); if (!storedExpenses[key]) storedExpenses[key] = { tax: 0, insurance: 0, custom: [] };
        storedExpenses[key].insurance = getMoneyValue(e.target.value); saveAndCalc();
    });

    // 3. XỬ LÝ ĐÓNG/MỞ SETTINGS & LOAD DỮ LIỆU TẠM
    document.getElementById('openSettingsBtn').addEventListener('click', () => {
        // Khi mở settings, nạp Ca hiện tại vào mảng tạm để tránh sửa trực tiếp vào config gốc
        tempShifts = JSON.parse(JSON.stringify(appConfig.shifts || defaultAppConfig.shifts));
        window.renderSettingsShifts();
        document.getElementById('settingsOverlay').classList.remove('hidden');
        document.getElementById('settingsOverlay').classList.add('flex');
    });

    document.getElementById('closeSettingsBtn').addEventListener('click', () => {
        document.getElementById('settingsOverlay').classList.add('hidden');
    });

    // 4. LƯU CẤU HÌNH (Ghi đè dữ liệu từ giao diện vào localStorage)
    document.getElementById('saveSettingsBtn').addEventListener('click', () => {
        const selectedDays = Array.from(document.querySelectorAll('.workday-cb:checked')).map(cb => cb.value);
        saveAppConfig({
            currency: document.getElementById('currency').value,
            cutoffDate: document.getElementById('cutoffDate').value,
            workingDays: selectedDays,
            salaryType: document.getElementById('salaryType').value,
            standardHours: getMoneyValue(document.getElementById('standardHours').value) || 8,
            standardDays: getMoneyValue(document.getElementById('standardDays').value) || 26,
            baseSalaryMonth: getMoneyValue(document.getElementById('baseSalaryMonth').value),
            baseSalaryHour: getMoneyValue(document.getElementById('baseSalaryHour').value),
            otRate: getMoneyValue(document.getElementById('otRate').value),
            holidayRate: getMoneyValue(document.getElementById('holidayRate').value),
            dailyAllowance: getMoneyValue(document.getElementById('dailyAllowance').value),
            monthlyAllowance: getMoneyValue(document.getElementById('monthlyAllowance').value),
            shifts: tempShifts
        });

        // Tính toán lại toàn bộ lịch sử theo quy tắc mới
        workEntries.forEach(e => {
            e.breakdown = calculateDailySalaryDetails(e.hours, e.otHours, e.hasAllowance, e.date, daysOfWeek, e.shiftId);
        });
        localStorage.setItem('payrollEntriesV5', JSON.stringify(workEntries));

        document.getElementById('settingsOverlay').classList.add('hidden');
        document.getElementById('closeSettingsBtn').classList.remove('hidden');
        renderTimeline(); updateDataDisplays(); window.renderShiftSelector(); window.triggerAutoBackup();
    });

    // 5. CÁC NÚT ĐIỀU HƯỚNG & THAO TÁC NHANH
    document.getElementById('btnDeleteCurrent').addEventListener('click', async () => {
        if (await customConfirm('Xóa bản ghi công này?')) {
            deleteWorkEntry(selectedDayString); renderTimeline(); updateDataDisplays(); window.triggerAutoBackup();
        }
    });

    const monthInput = document.getElementById('cycleMonthPicker');
    monthInput.value = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    monthInput.addEventListener('change', (e) => {
        if (e.target.value) {
            const p = e.target.value.split('-');
            currentTargetDate = new Date(p[0], p[1] - 1, 1);
            selectedDayString = "";
            document.getElementById('cycleMonthDisplay').textContent = `Tháng ${p[1]}/${p[0]}`;
            renderTimeline(); updateDataDisplays();
        }
    });

    document.getElementById('workForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const hours = getMoneyValue(document.getElementById('hoursInput').value) || 0;
        const otHours = getMoneyValue(document.getElementById('otInput').value) || 0;
        const hasAllowance = document.getElementById('allowanceCheck').checked;
        const breakdown = calculateDailySalaryDetails(hours, otHours, hasAllowance, selectedDayString, daysOfWeek, currentSelectedShiftId);
        updateWorkEntry({
            id: Date.now().toString(), date: selectedDayString, hours, otHours, hasAllowance,
            isHoliday: breakdown.isHoliday, shiftId: currentSelectedShiftId, breakdown
        });
        renderTimeline(); updateDataDisplays(); window.triggerAutoBackup();
    });

    document.getElementById('btnToday').addEventListener('click', () => {
        const now = new Date(); currentTargetDate = now;
        document.getElementById('cycleMonthPicker').value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        selectedDayString = getLocalISOString(now); renderTimeline(); selectDate(selectedDayString, false);
    });

    // 6. KHỞI TẠO FIREBASE & THEME
    initFirebase((user) => {
        if (user) {
            document.getElementById('loggedOutUI').classList.add('hidden');
            document.getElementById('loggedInUI').classList.remove('hidden');
            document.getElementById('loggedInUI').classList.add('flex');
            document.getElementById('userEmailDisplay').innerText = user.email || 'Người dùng';
            window.loadFirebaseBackups();
        } else {
            document.getElementById('loggedOutUI').classList.remove('hidden');
            document.getElementById('loggedInUI').classList.add('hidden');
        }
    });

    renderThemeButtons(); // Vẽ các nút theme ra HTML
    applyTheme(localStorage.getItem('themePref') || 'system');
    document.getElementById('autoBackupCheck').checked = localStorage.getItem('autoBackupON') === '1';

    // 7. ĐỔ DỮ LIỆU TỪ STORAGE VÀO GIAO DIỆN (CRITICAL FIX)
    if (!(appConfig && (appConfig.baseSalaryMonth > 0 || appConfig.baseSalaryHour > 0))) {
        // Nếu app trống trơn (lần đầu dùng), bắt buộc cài đặt
        document.getElementById('settingsOverlay').classList.remove('hidden');
        document.getElementById('settingsOverlay').classList.add('flex');
        document.getElementById('closeSettingsBtn').classList.add('hidden');
    } else {
        document.getElementById('mainApp').classList.remove('hidden');
        document.getElementById('closeSettingsBtn').classList.remove('hidden');

        // Đổ dữ liệu vào các ô Input
        document.getElementById('cutoffDate').value = appConfig.cutoffDate || 31;
        document.getElementById('standardHours').value = formatNumToVN(appConfig.standardHours);
        document.getElementById('standardDays').value = formatNumToVN(appConfig.standardDays);
        document.getElementById('baseSalaryMonth').value = formatNumToVN(appConfig.baseSalaryMonth);
        document.getElementById('baseSalaryHour').value = formatNumToVN(appConfig.baseSalaryHour);
        document.getElementById('otRate').value = formatNumToVN(appConfig.otRate);
        document.getElementById('holidayRate').value = formatNumToVN(appConfig.holidayRate);
        document.getElementById('dailyAllowance').value = formatNumToVN(appConfig.dailyAllowance);
        document.getElementById('monthlyAllowance').value = formatNumToVN(appConfig.monthlyAllowance);

        // Kích hoạt trạng thái nút bấm và tab tương ứng
        window.setCurrency(appConfig.currency || 'đ');
        window.setSalaryType(appConfig.salaryType || 'thang');

        // Tick lại các checkbox ngày làm việc mặc định
        document.querySelectorAll('.workday-cb').forEach(cb => {
            cb.checked = (appConfig.workingDays || []).includes(cb.value);
        });

        // Vẽ giao diện lần đầu
        setViewMode('week');
        monthInput.dispatchEvent(new Event('change'));
        window.renderShiftSelector();
    }

    // 8. LẮNG NGHE SỰ KIỆN VUỐT CHỌN LỊCH
    const timelineContainer = document.getElementById('timelineContainer');
    const handleSelectMove = (clientX, clientY) => {
        if (!isEditMode || !isDragging) return;
        const el = document.elementFromPoint(clientX, clientY);
        if (el) {
            const card = el.closest('[id^="card-"]');
            if (card) {
                const dateStr = card.id.replace('card-', '');
                if (!selectedDatesToEdit.has(dateStr)) {
                    selectedDatesToEdit.add(dateStr);
                    card.classList.add('ring-2', 'ring-blue-500', 'bg-blue-50', 'dark:bg-blue-900/40', 'transform', 'scale-105', 'z-20');
                    window.updateEditFormUI();
                }
            }
        }
    };

    timelineContainer.addEventListener('mousedown', (e) => { if (!isEditMode) return; isDragging = true; hasMoved = false; });
    window.addEventListener('mousemove', (e) => { if (!isEditMode || !isDragging) return; hasMoved = true; handleSelectMove(e.clientX, e.clientY); });
    window.addEventListener('mouseup', () => { isDragging = false; setTimeout(() => { hasMoved = false; }, 50); });

    timelineContainer.addEventListener('touchstart', (e) => { if (!isEditMode) return; isDragging = true; hasMoved = false; }, { passive: false });
    window.addEventListener('touchmove', (e) => { if (!isEditMode || !isDragging) return; hasMoved = true; e.preventDefault(); handleSelectMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
    window.addEventListener('touchend', () => { isDragging = false; setTimeout(() => { hasMoved = false; }, 50); });
};
document.addEventListener('DOMContentLoaded', init);