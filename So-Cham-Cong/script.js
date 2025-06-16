document.addEventListener('DOMContentLoaded', function () {
    // --- Platform Detection ---
    const body = document.body;
    const isMobile = ('ontouchstart' in window) || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    body.classList.remove('platform-mobile', 'platform-desktop');
    body.classList.add(isMobile ? 'platform-mobile' : 'platform-desktop');

    // --- DOM Elements ---
    const mainAppTitle = document.getElementById('appTitle');
    const headerTitle = document.getElementById('headerTitle');
    const themeSelector = document.getElementById('themeSelector');
    const bottomNavButtons = document.querySelectorAll('.nav-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const calendarDaysElement = document.getElementById('calendarDays');
    const calendarHeaderRowElement = document.getElementById('calendarHeaderRow');
    const currentMonthYearElement = document.getElementById('currentMonthYear');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const editScheduleBtn = document.getElementById('editScheduleBtn');
    const saveScheduleBtn = document.getElementById('saveScheduleBtn');
    const firstDaySwitch = document.getElementById('firstDaySwitch');
    const baseHoursInput = document.getElementById('baseHoursInput');

    // Modals & Forms
    const timesheetModal = document.getElementById('timesheetModal');
    const modalTitleElement = document.getElementById('modalTitle');
    const timesheetDateInput = document.getElementById('timesheetDate');
    const entryTypeSelect = document.getElementById('entryType');
    const overtimeFields = document.getElementById('overtimeFields');
    const overtimeHoursInput = document.getElementById('overtimeHours');
    const overtimeMinutesInput = document.getElementById('overtimeMinutes');
    const notesInput = document.getElementById('notes');
    const actionConfirmModal = document.getElementById('actionConfirmModal');
    const actionConfirmModalTitle = document.getElementById('actionConfirmModalTitle');
    const actionConfirmDateInput = document.getElementById('actionConfirmDate');

    // Stats & Logs
    const timesheetLogBody = document.getElementById('timesheetLogBody');
    const noTimesheetDataMsg = document.getElementById('noTimesheetDataMsg');
    const logFilterTypeSelect = document.getElementById('logFilterType');
    const applyLogFilterBtn = document.getElementById('applyLogFilterBtn');
    const statsTotalWorkDays = document.getElementById('statsTotalWorkDays');
    const statsActualWorkDays = document.getElementById('statsActualWorkDays');
    const statsLeaveDays = document.getElementById('statsLeaveDays');
    const statsTotalHours = document.getElementById('statsTotalHours');
    const statsOvertimeHours = document.getElementById('statsOvertimeHours');

    // --- State & Constants ---
    let currentDate = new Date();
    let isEditMode = false;
    let scheduleData = {}, timesheetEntries = {};
    let firstDayIsMonday = false, baseWorkHours = 8;
    const SHIFT_CYCLE = ["", "ca-ngay", "ca-dem", "nghi", "ngay-le"];
    const SHIFT_ICONS = { "ca-ngay": '<i class="fas fa-sun"></i>', "ca-dem": '<i class="fas fa-moon"></i>', "nghi": '<i class="fas fa-home"></i>', "ngay-le": '<i class="fas fa-star"></i>', "": "" };
    const LOCAL_STORAGE_KEYS = { schedule: 'ts_schedule_v14', timesheet: 'ts_entries_v14', firstDay: 'ts_firstday_v14', theme: 'ts_theme_v14', baseHours: 'ts_basehours_v14' };

    // --- Utilities ---
    const showToast = (message, duration = 2500) => {
        let toast = document.querySelector('.toast-notification');
        if (toast) toast.remove();
        toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.parentNode?.removeChild(toast), 400);
        }, duration);
    };
    const formatDateStr = (dateStr) => { const [y, m, d] = dateStr.split('-'); return `${d}/${m}/${y}`; };

    // --- Core Functions ---
    const applyTheme = (themeName) => {
        body.className = body.className.replace(/theme-\w+/g, '').trim();
        if (themeName && themeName !== 'default') body.classList.add(`theme-${themeName}`);
        localStorage.setItem(LOCAL_STORAGE_KEYS.theme, themeName);
        if (themeSelector) themeSelector.value = themeName;
    };

    const loadAllData = () => {
        try {
            scheduleData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.schedule)) || {};
            timesheetEntries = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.timesheet)) || {};
            firstDayIsMonday = localStorage.getItem(LOCAL_STORAGE_KEYS.firstDay) === 'true';
            const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEYS.theme) || 'default';
            const savedHours = localStorage.getItem(LOCAL_STORAGE_KEYS.baseHours);
            baseWorkHours = savedHours ? parseFloat(savedHours) : 8;
            applyTheme(savedTheme);
            if (firstDaySwitch) firstDaySwitch.checked = firstDayIsMonday;
            if (baseHoursInput) baseHoursInput.value = baseWorkHours;
        } catch (e) { showToast("Lỗi tải dữ liệu."); }
    };

    const persistAllData = () => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.schedule, JSON.stringify(scheduleData));
            localStorage.setItem(LOCAL_STORAGE_KEYS.timesheet, JSON.stringify(timesheetEntries));
            localStorage.setItem(LOCAL_STORAGE_KEYS.firstDay, firstDayIsMonday);
            localStorage.setItem(LOCAL_STORAGE_KEYS.baseHours, baseWorkHours);
        } catch (e) { showToast("Lỗi không thể lưu dữ liệu!"); }
    };

    const updateTitle = (title) => { mainAppTitle.textContent = title; headerTitle.textContent = title; };

    const switchTab = (button) => {
        bottomNavButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        button.classList.add('active');
        const tabId = button.dataset.tab;
        document.getElementById(tabId).classList.add('active');
        updateTitle(button.dataset.title);
        if (tabId === 'tabSoChamCong') {
            updateStatistics();
            renderTimesheetLog();
        }
    };

    const renderCalendar = () => {
        if (!calendarDaysElement) return;
        const year = currentDate.getFullYear(), month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1), daysInMonth = new Date(year, month + 1, 0).getDate();
        const todayObj = new Date();

        currentMonthYearElement.textContent = `Tháng ${month + 1}, ${year}`;
        const headers = firstDayIsMonday ? ["T2", "T3", "T4", "T5", "T6", "T7", "CN"] : ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
        calendarHeaderRowElement.innerHTML = headers.map(h => `<th>${h}</th>`).join('');

        let startDayOffset = firstDayIsMonday ? (firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1) : firstDayOfMonth.getDay();

        let cells = Array(startDayOffset).fill('<td class="disabled-day"></td>');
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = day === todayObj.getDate() && month === todayObj.getMonth() && year === todayObj.getFullYear();
            const shiftType = scheduleData[dateStr] || "";
            const hasTimesheet = !!timesheetEntries[dateStr];            
            let cellClasses = isToday ? 'today ' : '';
            cellClasses += isEditMode ? 'editable' : 'timesheet-entry-allowed';
            cells.push(`<td class="${cellClasses}" data-date="${dateStr}"><div class="day-cell-content"><span class="day-number">${day}</span><span class="shift-info ${!shiftType ? 'empty' : ''}">${SHIFT_ICONS[shiftType] || ''}</span><div class="timesheet-indicator ${hasTimesheet ? 'visible' : ''}"></div></div></td>`);
        }

        let rowsHtml = '';
        while (cells.length > 0) { rowsHtml += `<tr>${cells.splice(0, 7).join('')}</tr>`; }
        calendarDaysElement.innerHTML = rowsHtml;
    };

    const updateStatistics = () => {
        const year = currentDate.getFullYear(), month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let stats = { schedDay: 0, schedNight: 0, actualDay: 0, actualNight: 0, paid: 0, unpaid: 0, company: 0, otMins: 0 };
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const schedule = scheduleData[dateStr], entry = timesheetEntries[dateStr];
            if (schedule === 'ca-ngay') stats.schedDay++;
            if (schedule === 'ca-dem') stats.schedNight++;
            if (entry) {
                if (entry.type === 'work') {
                    if (schedule === 'ca-ngay' || schedule === 'ca-dem') {
                        schedule === 'ca-ngay' ? stats.actualDay++ : stats.actualNight++;
                    } else if (!schedule) {
                        stats.actualDay++;
                    }
                    stats.otMins += (entry.overtimeHours || 0) * 60 + (entry.overtimeMinutes || 0);
                }
                if (entry.type === 'paid_leave') stats.paid++;
                if (entry.type === 'unpaid_leave') stats.unpaid++;
                if (entry.type === 'company_holiday') stats.company++;
            }
        }
        statsTotalWorkDays.textContent = `${stats.schedDay + stats.schedNight} ngày (${stats.schedDay}S, ${stats.schedNight}Đ)`;
        statsActualWorkDays.textContent = `${stats.actualDay + stats.actualNight} ngày (${stats.actualDay}S, ${stats.actualNight}Đ)`;
        statsLeaveDays.textContent = `${stats.paid + stats.unpaid + stats.company} ngày (${stats.paid}P, ${stats.unpaid}KL, ${stats.company}Cty)`;
        statsTotalHours.textContent = `${((stats.actualDay + stats.actualNight) * baseWorkHours).toFixed(1)} giờ`;
        statsOvertimeHours.textContent = `${(stats.otMins / 60).toFixed(1)} giờ`;
    };

    const getFilteredLogEntries = () => {
        let filtered = Object.entries(timesheetEntries);
        const filterType = logFilterTypeSelect.value;
        const logStartDate = document.getElementById('logStartDate').value;
        const logEndDate = document.getElementById('logEndDate').value;
        const logMonth = document.getElementById('logMonth').value;
        if (filterType === 'range' && logStartDate && logEndDate) {
            const start = new Date(logStartDate), end = new Date(logEndDate);
            filtered = filtered.filter(([d, e]) => { const date = new Date(d); return date >= start && date <= end; });
        } else if (filterType === 'month' && logMonth) {
            filtered = filtered.filter(([d, e]) => d.startsWith(logMonth));
        }
        return filtered;
    };

    const renderTimesheetLog = () => {
        const sorted = getFilteredLogEntries().sort((a, b) => new Date(b[0]) - new Date(a[0]));
        noTimesheetDataMsg.style.display = sorted.length === 0 ? 'block' : 'none';
        timesheetLogBody.innerHTML = sorted.map(([dateStr, entry]) => {
            const shiftType = scheduleData[dateStr] || "";
            let workHours = 'Nghỉ';
            if (entry.type === 'work') {
                const totalMins = (entry.overtimeHours || 0) * 60 + (entry.overtimeMinutes || 0);
                workHours = totalMins > 0
                    ? `${baseWorkHours} giờ + ${(totalMins / 60).toFixed(1)} giờ TC`
                    : `${baseWorkHours} giờ`;
            }
            const entryTypeLabel = entryTypeSelect.querySelector(`option[value="${entry.type}"]`)?.textContent || entry.type;
            return `<tr><td>${formatDateStr(dateStr)}</td><td>${SHIFT_ICONS[shiftType] || ''}</td><td>${workHours}</td><td>${entryTypeLabel}</td></tr>`;
        }).join('');
    };

    // --- Event Handlers ---
    const handleDayClick = (event) => {
        const targetCell = event.target.closest('td[data-date]');
        if (!targetCell) return;
        const dateStr = targetCell.dataset.date;
        // UPDATED: Logic to separate editing from timekeeping
        if (isEditMode) {
            const currentShift = scheduleData[dateStr] || "";
            const nextIndex = (SHIFT_CYCLE.indexOf(currentShift) + 1) % SHIFT_CYCLE.length;
            const newShift = SHIFT_CYCLE[nextIndex];
            if (newShift) {
                scheduleData[dateStr] = newShift;
            } else {
                delete scheduleData[dateStr];
            }
            renderCalendar();
        } else {
            // Only allow timekeeping if NOT in edit mode
            timesheetEntries[dateStr] ? openActionConfirmModal(dateStr) : openTimesheetModal(dateStr);
        }
    };

    const handleConfirmTimesheet = () => {
        const dateStr = timesheetDateInput.value;
        const entryType = entryTypeSelect.value;
        const newEntry = { type: entryType, notes: notesInput.value.trim() };
        // UPDATED: Only add overtime properties if it's a work day and has OT values
        if (entryType === 'work') {
            const otHours = parseInt(overtimeHoursInput.value) || 0;
            const otMins = parseInt(overtimeMinutesInput.value) || 0;
            if (otHours > 0 || otMins > 0) {
                newEntry.overtimeHours = otHours;
                newEntry.overtimeMinutes = otMins;
            }
        }
        timesheetEntries[dateStr] = newEntry;
        persistAllData();
        showToast(`Đã lưu chấm công!`);
        timesheetModal.style.display = 'none';
        renderCalendar();
        if (document.getElementById('tabSoChamCong').classList.contains('active')) {
            updateStatistics();
            renderTimesheetLog();
        }
    };

    const openTimesheetModal = (dateStr, existingEntry = null) => {
        modalTitleElement.textContent = `Chấm công ${formatDateStr(dateStr)}`;
        timesheetDateInput.value = dateStr;
        document.getElementById('timesheetForm').reset();

        if (existingEntry) {
            entryTypeSelect.value = existingEntry.type || 'work';
            notesInput.value = existingEntry.notes || '';
            overtimeHoursInput.value = existingEntry.overtimeHours || '';
            overtimeMinutesInput.value = existingEntry.overtimeMinutes || '';
        } else {
            entryTypeSelect.value = 'work';
        }
        // UPDATED: Show overtime fields if entry type is 'work'
        overtimeFields.style.display = entryTypeSelect.value === 'work' ? 'block' : 'none';
        timesheetModal.style.display = 'flex';
    };

    const openActionConfirmModal = (dateStr) => {
        if (!timesheetEntries[dateStr]) return;
        actionConfirmModalTitle.textContent = `Ngày ${formatDateStr(dateStr)}`;
        actionConfirmDateInput.value = dateStr;
        actionConfirmModal.style.display = 'flex';
    };

    // --- Add Event Listeners ---
    bottomNavButtons.forEach(btn => btn.addEventListener('click', () => switchTab(btn)));
    calendarDaysElement.addEventListener('click', handleDayClick);
    prevMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); if (document.getElementById('tabSoChamCong').classList.contains('active')) updateStatistics(); });
    nextMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); if (document.getElementById('tabSoChamCong').classList.contains('active')) updateStatistics(); });
    editScheduleBtn.addEventListener('click', () => { isEditMode = true; renderCalendar(); editScheduleBtn.style.display = 'none'; saveScheduleBtn.style.display = 'flex'; });
    saveScheduleBtn.addEventListener('click', () => { isEditMode = false; persistAllData(); renderCalendar(); editScheduleBtn.style.display = 'flex'; saveScheduleBtn.style.display = 'none'; showToast('Đã lưu lịch!'); });
    firstDaySwitch.addEventListener('change', (e) => { firstDayIsMonday = e.target.checked; persistAllData(); renderCalendar(); });
    themeSelector.addEventListener('change', (e) => applyTheme(e.target.value));
    baseHoursInput.addEventListener('change', (e) => {
        const hours = parseFloat(e.target.value);
        if (hours > 0 && hours <= 24) { baseWorkHours = hours; persistAllData(); showToast(`Đã cập nhật giờ làm cơ bản.`); if (document.getElementById('tabSoChamCong').classList.contains('active')) updateStatistics(); }
        else { showToast('Số giờ không hợp lệ.'); e.target.value = baseWorkHours; }
    });
    // UPDATED: Logic for showing/hiding OT fields
    entryTypeSelect.addEventListener('change', () => { overtimeFields.style.display = entryTypeSelect.value === 'work' ? 'block' : 'none'; });
    timesheetModal.querySelector('.btn-confirm').addEventListener('click', handleConfirmTimesheet);
    actionConfirmModal.querySelector('.btn-edit-timesheet').addEventListener('click', () => { openTimesheetModal(actionConfirmDateInput.value, timesheetEntries[actionConfirmDateInput.value]); actionConfirmModal.style.display = 'none'; });
    actionConfirmModal.querySelector('.btn-delete-timesheet').addEventListener('click', () => { delete timesheetEntries[actionConfirmDateInput.value]; persistAllData(); showToast(`Đã xoá chấm công.`); actionConfirmModal.style.display = 'none'; renderCalendar(); if (document.getElementById('tabSoChamCong').classList.contains('active')) { updateStatistics(); renderTimesheetLog(); } });
    [timesheetModal, actionConfirmModal].forEach(modal => {
        modal.addEventListener('click', e => { if (e.target === modal) e.target.style.display = 'none'; });
        modal.querySelector('.btn-cancel')?.addEventListener('click', () => modal.style.display = 'none');
    });
    logFilterTypeSelect.addEventListener('change', () => {
        document.getElementById('logDateRangePicker').style.display = logFilterTypeSelect.value === 'range' ? 'block' : 'none';
        document.getElementById('logMonthPicker').style.display = logFilterTypeSelect.value === 'month' ? 'block' : 'none';
        renderTimesheetLog();
    });
    applyLogFilterBtn.addEventListener('click', renderTimesheetLog);

    // --- Init ---
    const init = () => {
        loadAllData();
        renderCalendar();
        if (document.querySelector('.nav-button.active').dataset.tab === 'tabSoChamCong') {
            updateStatistics();
            renderTimesheetLog();
        }
        updateTitle(document.querySelector('.nav-button.active').dataset.title);
    };
    init();
});
