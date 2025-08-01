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
    const toggleFirstDayBtn = document.getElementById('toggleFirstDayBtn');
    const firstDayLabel = document.getElementById('firstDayLabel');
    const baseHoursInput = document.getElementById('baseHoursInput');
    const startWorkDayInput = document.getElementById('startWorkDayInput');
    const displayModeSelect = document.getElementById('displayModeSelect');

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

    // NEW: Month/Year Picker Modal Elements
    const monthYearPickerModal = document.getElementById('monthYearPickerModal');
    const selectMonth = document.getElementById('selectMonth');
    const selectYear = document.getElementById('selectYear');
    const confirmMonthYearBtn = monthYearPickerModal.querySelector('.btn-confirm-month-year');


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
    const exportLogCsvBtn = document.getElementById('exportLogCsvBtn');

    // Data Management
    const exportDataBtn = document.getElementById('exportDataBtn');
    const exportDataTypeSelect = document.getElementById('exportDataType');
    const importFile = document.getElementById('importFile');
    const importDataBtn = document.getElementById('importDataBtn');

    // Quick Edit
    const quickEditTypeSelect = document.getElementById('quickEditType');
    const quickEditModeSelect = document.getElementById('quickEditMode');
    const quickStartDateInput = document.getElementById('quickStartDate');
    const quickEndDateInput = document.getElementById('quickEndDate');
    const applyQuickEditBtn = document.getElementById('applyQuickEditBtn');
    const dateRangeInputs = document.getElementById('dateRangeInputs');
    const dragModeInstructions = document.getElementById('dragModeInstructions');
    const quickEditControls = document.getElementById('quickEditControls');


    // --- State & Constants ---
    let currentDate = new Date();
    let isEditMode = false;
    window.scheduleData = {}; // Thay đổi từ 'let scheduleData'
    window.timesheetEntries = {}; // Thay đổi từ 'let timesheetEntries'
    let firstDayIsMonday = false;
    window.baseWorkHours = 8; // Thay đổi từ 'let baseWorkHours'
    window.startWorkDay = 1; // Thay đổi từ 'let startWorkDay'
    let displayMode = 'fullMonth';
    const SHIFT_CYCLE = ["", "ca-ngay", "ca-dem", "nghi", "ngay-le"];
    const SHIFT_ICONS = { "ca-ngay": '<i class="fas fa-sun"></i>', "ca-dem": '<i class="fas fa-moon"></i>', "nghi": '<i class="fas fa-home"></i>', "ngay-le": '<i class="fas fa-star"></i>', "": "" };
    // Thay đổi LOCAL_STORAGE_KEYS để phản ánh các biến global mới
    const LOCAL_STORAGE_KEYS = {
        schedule: 'ts_schedule_v16',
        timesheet: 'ts_entries_v16',
        firstDay: 'ts_firstday_v16',
        theme: 'ts_theme_v16',
        baseHours: 'ts_basehours_v16',
        startWorkDay: 'ts_startworkday_v16',
        displayMode: 'ts_displaymode_v16'
    };
    // Drag selection for quick edit
    let isDragging = false;
    let dragSelection = [];
    let allowWeekendEdit = true;


    // Biến để theo dõi trạng thái vuốt
    let touchStartX = 0;
    let touchEndX = 0;
    const SWIPE_THRESHOLD = 50; // Ngưỡng pixel để xác định là một cú vuốt

    // NEW: Biến cho nhấn giữ
    let pressTimer = null;
    const LONG_PRESS_THRESHOLD = 500; // 500ms cho nhấn giữ


    // Hàm xử lý vuốt
    function handleSwipe() {
        if (touchEndX < touchStartX - SWIPE_THRESHOLD) {
            // Vuốt sang trái (chuyển sang tháng tiếp theo)
            nextMonthBtn.click();
        } else if (touchEndX > touchStartX + SWIPE_THRESHOLD) {
            // Vuốt sang phải (chuyển về tháng trước)
            prevMonthBtn.click();
        }
    }


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

    // Hàm kiểm tra xem một ngày có phải là cuối tuần hay không
    const isWeekend = (dateObj) => {
        const dayOfWeek = dateObj.getDay(); // 0 for Sunday, 6 for Saturday
        return dayOfWeek === 0 || dayOfWeek === 6;
    };

    // --- Core Functions ---
    const applyTheme = (themeName) => {
        body.className = body.className.replace(/theme-\w+/g, '').trim();
        if (themeName && themeName !== 'default') body.classList.add(`theme-${themeName}`);
        localStorage.setItem(LOCAL_STORAGE_KEYS.theme, themeName);
        if (themeSelector) themeSelector.value = themeName;
    };

    const loadAllData = () => {
        try {
            window.scheduleData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.schedule)) || {};
            window.timesheetEntries = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.timesheet)) || {};
            firstDayIsMonday = localStorage.getItem(LOCAL_STORAGE_KEYS.firstDay) === 'true';
            const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEYS.theme) || 'default';
            const savedHours = localStorage.getItem(LOCAL_STORAGE_KEYS.baseHours);
            window.baseWorkHours = savedHours ? parseFloat(savedHours) : 8;
            const savedStartWorkDay = localStorage.getItem(LOCAL_STORAGE_KEYS.startWorkDay);
            window.startWorkDay = savedStartWorkDay ? parseInt(savedStartWorkDay) : 1;
            displayMode = localStorage.getItem(LOCAL_STORAGE_KEYS.displayMode) || 'fullMonth';

            applyTheme(savedTheme);
            if (firstDayLabel) {
                firstDayLabel.textContent = firstDayIsMonday ? 'T2' : 'CN';
            }
            if (baseHoursInput) baseHoursInput.value = window.baseWorkHours; // Cập nhật input
            if (startWorkDayInput) startWorkDayInput.value = window.startWorkDay; // Cập nhật input
            if (displayModeSelect) displayModeSelect.value = displayMode;
        } catch (e) { window.showToast("Lỗi tải dữ liệu."); } // Sử dụng window.showToast
    };

    const persistAllData = () => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.schedule, JSON.stringify(window.scheduleData));
            localStorage.setItem(LOCAL_STORAGE_KEYS.timesheet, JSON.stringify(window.timesheetEntries));
            localStorage.setItem(LOCAL_STORAGE_KEYS.firstDay, firstDayIsMonday);
            localStorage.setItem(LOCAL_STORAGE_KEYS.baseHours, window.baseWorkHours);
            localStorage.setItem(LOCAL_STORAGE_KEYS.startWorkDay, window.startWorkDay);
            localStorage.setItem(LOCAL_STORAGE_KEYS.displayMode, displayMode);
        } catch (e) { window.showToast("Lỗi không thể lưu dữ liệu!"); } // Sử dụng window.showToast
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

        const headers = firstDayIsMonday ? ["T2", "T3", "T4", "T5", "T6", "T7", "CN"] : ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
        calendarHeaderRowElement.innerHTML = headers.map(h => `<th>${h}</th>`).join('');

        let daysToDisplay = [];
        let calendarTitle = "";
        const todayObj = new Date();
        todayObj.setHours(0, 0, 0, 0);

        let workPeriodStartMonthRef = currentDate.getMonth();
        let workPeriodStartYearRef = currentDate.getFullYear();
        if (currentDate.getDate() < startWorkDay) {
            workPeriodStartMonthRef = (workPeriodStartMonthRef === 0) ? 11 : workPeriodStartMonthRef - 1;
            workPeriodStartYearRef = (currentDate.getMonth() === 0) ? workPeriodStartYearRef - 1 : workPeriodStartYearRef;
        }
        const workPeriodStartDateActual = new Date(workPeriodStartYearRef, workPeriodStartMonthRef, startWorkDay);
        workPeriodStartDateActual.setHours(0, 0, 0, 0);

        const workPeriodEndDateActual = new Date(workPeriodStartYearRef, workPeriodStartMonthRef + 1, startWorkDay - 1);
        workPeriodEndDateActual.setHours(23, 59, 59, 999);


        if (displayMode === 'fullMonth') {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const firstDayOfMonth = new Date(year, month, 1);
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            calendarTitle = `Tháng ${month + 1}, ${year}`;

            let startDayOffset = firstDayIsMonday ? (firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1) : firstDayOfMonth.getDay();

            for (let i = 0; i < startDayOffset; i++) {
                daysToDisplay.push({ type: 'empty' });
            }

            for (let day = 1; day <= daysInMonth; day++) {
                daysToDisplay.push({
                    type: 'day',
                    date: new Date(year, month, day),
                    dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                });
            }

        } else { // displayMode === 'workPeriod'
            calendarTitle = `Tháng ${workPeriodStartDateActual.getMonth() + 1}, ${workPeriodStartDateActual.getFullYear()}`;

            let firstDayOfWeekOfWorkPeriodStart = workPeriodStartDateActual.getDay();
            if (firstDayIsMonday) {
                firstDayOfWeekOfWorkPeriodStart = (firstDayOfWeekOfWorkPeriodStart === 0) ? 6 : firstDayOfWeekOfWorkPeriodStart - 1;
            }
            for (let i = 0; i < firstDayOfWeekOfWorkPeriodStart; i++) {
                daysToDisplay.push({ type: 'empty' });
            }

            let currentDay = new Date(workPeriodStartDateActual);
            while (currentDay <= workPeriodEndDateActual) {
                const year = currentDay.getFullYear();
                const month = currentDay.getMonth();
                const day = currentDay.getDate();
                daysToDisplay.push({
                    type: 'day',
                    date: new Date(currentDay),
                    dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                });
                currentDay.setDate(currentDay.getDate() + 1);
            }
        }

        currentMonthYearElement.textContent = calendarTitle;

        let rowsHtml = '';
        let cellsInRow = [];

        daysToDisplay.forEach(dayInfo => {
            if (dayInfo.type === 'empty') {
                cellsInRow.push('<td class="disabled-day"></td>');
            } else {
                const dateStr = dayInfo.dateStr;
                const currentDateForCell = dayInfo.date;
                const isToday = currentDateForCell.getTime() === todayObj.getTime();
                const shiftType = scheduleData[dateStr] || "";
                const hasTimesheet = !!timesheetEntries[dateStr];

                let cellClasses = '';
                if (isToday) {
                    cellClasses += 'today ';
                }

                const isStartWorkDayCell = (currentDateForCell.getTime() === workPeriodStartDateActual.getTime());
                if (isStartWorkDayCell) {
                    cellClasses += ' start-work-day-cell ';
                }

                if (isEditMode) {
                    cellClasses += 'editable';
                } else {
                    if (displayMode === 'fullMonth' || (displayMode === 'workPeriod' && currentDateForCell >= workPeriodStartDateActual && currentDateForCell <= workPeriodEndDateActual)) {
                        cellClasses += 'timesheet-entry-allowed';
                    } else {
                        cellClasses += 'disabled-day-visual';
                    }
                }

                cellsInRow.push(`<td class="${cellClasses}" data-date="${dateStr}"><div class="day-cell-content"><span class="day-number">${dayInfo.date.getDate()}</span><span class="shift-info ${!shiftType ? 'empty' : ''}">${SHIFT_ICONS[shiftType] || ''}</span><div class="timesheet-indicator ${hasTimesheet ? 'visible' : ''}"></div></div></td>`);
            }

            if (cellsInRow.length === 7) {
                rowsHtml += `<tr>${cellsInRow.join('')}</tr>`;
                cellsInRow = [];
            }
        });

        while (cellsInRow.length > 0 && cellsInRow.length < 7) {
            cellsInRow.push('<td class="disabled-day"></td>');
        }
        if (cellsInRow.length > 0) {
            rowsHtml += `<tr>${cellsInRow.join('')}</tr>`;
        }

        calendarDaysElement.innerHTML = rowsHtml;
    };

    const updateStatistics = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();

        let workPeriodStartMonthRef = month;
        let workPeriodStartYearRef = year;

        if (today.getDate() < startWorkDay) {
            workPeriodStartMonthRef = (workPeriodStartMonthRef === 0) ? 11 : workPeriodStartMonthRef - 1;
            workPeriodStartYearRef = (month === 0) ? workPeriodStartYearRef - 1 : workPeriodStartYearRef;
        }

        const startStatsDate = new Date(workPeriodStartYearRef, workPeriodStartMonthRef, startWorkDay);
        startStatsDate.setHours(0, 0, 0, 0);

        const endStatsDate = new Date(workPeriodStartYearRef, workPeriodStartMonthRef + 1, startWorkDay - 1);
        endStatsDate.setHours(23, 59, 59, 999);

        console.log('--- Update Statistics ---');
        console.log('System Current Date:', today.toLocaleDateString('vi-VN'));
        console.log('Start Work Day Setting:', startWorkDay);
        console.log('Calculated Stats Period: From', startStatsDate.toLocaleDateString('vi-VN'), 'To', endStatsDate.toLocaleDateString('vi-VN'));
        console.log('Timesheet Entries Sample (first 5):', Object.entries(timesheetEntries).slice(0, 5));
        console.log('Schedule Data Sample (first 5):', Object.entries(scheduleData).slice(0, 5));


        let stats = {
            schedDay: 0,
            schedNight: 0,
            actualDay: 0,
            actualNight: 0,
            paid: 0,
            unpaid: 0,
            company: 0,
            otMins: 0
        };

        for (let d = new Date(startStatsDate); d <= endStatsDate; d.setDate(d.getDate() + 1)) {
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const schedule = scheduleData[dateStr] || "";
            const entry = timesheetEntries[dateStr];

            if (schedule === 'ca-ngay') stats.schedDay++;
            if (schedule === 'ca-dem') stats.schedNight++;

            if (entry) {
                if (entry.type === 'work' || entry.type === 'work_ot') {
                    if (schedule === 'ca-ngay') {
                        stats.actualDay++;
                    } else if (schedule === 'ca-dem') {
                        stats.actualNight++;
                    } else {
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
            const start = new Date(logStartDate);
            const end = new Date(logEndDate);
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
            if (entry.type === 'work' || entry.type === 'work_ot') {
                const totalMins = (entry.overtimeHours || 0) * 60 + (entry.overtimeMinutes || 0);
                workHours = totalMins > 0
                    ? `${baseWorkHours}h + ${(totalMins / 60).toFixed(1)}h TC`
                    : `${baseWorkHours}h`;
            }
            const entryTypeLabel = entryTypeSelect.querySelector(`option[value="${entry.type}"]`)?.textContent || entry.type;
            return `<tr><td>${formatDateStr(dateStr)}</td><td>${SHIFT_ICONS[shiftType] || ''}</td><td>${workHours}</td><td>${entryTypeLabel}</td></tr>`;
        }).join('');
    };

    const exportData = () => {
        const dataType = exportDataTypeSelect.value;
        let dataToExport = {};
        let filename = 'cham_cong_';

        if (dataType === 'all') {
            dataToExport = {
                schedule: scheduleData,
                timesheet: timesheetEntries,
                settings: {
                    firstDayIsMonday,
                    baseWorkHours,
                    startWorkDay,
                    displayMode,
                    theme: localStorage.getItem(LOCAL_STORAGE_KEYS.theme)
                }
            };
            filename += 'full_data.json';
        } else if (dataType === 'schedule') {
            dataToExport = scheduleData;
            filename += 'lich_lam_viec.json';
        } else if (dataType === 'timesheet') {
            dataToExport = timesheetEntries;
            filename += 'so_cham_cong.json';
        }

        const dataStr = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Đã xuất dữ liệu!');
    };

    const importData = (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);

                // Check if it's the full export format
                if (imported.schedule && imported.timesheet && imported.settings) {
                    if (confirm('Dữ liệu nhập vào sẽ GHI ĐÈ toàn bộ lịch làm việc, chấm công và cài đặt. Bạn có chắc chắn muốn tiếp tục?')) {
                        scheduleData = imported.schedule;
                        timesheetEntries = imported.timesheet;
                        firstDayIsMonday = imported.settings.firstDayIsMonday;
                        baseWorkHours = imported.settings.baseWorkHours;
                        startWorkDay = imported.settings.startWorkDay;
                        displayMode = imported.settings.displayMode;
                        applyTheme(imported.settings.theme);

                        // Update UI settings
                        if (firstDayLabel) {
                            firstDayLabel.textContent = firstDayIsMonday ? 'T2' : 'CN';
                        }
                        if (baseHoursInput) baseHoursInput.value = baseWorkHours;
                        if (startWorkDayInput) startWorkDayInput.value = startWorkDay;
                        if (displayModeSelect) displayModeSelect.value = displayMode;

                        showToast('Đã nhập toàn bộ dữ liệu!');
                    } else {
                        showToast('Nhập dữ liệu đã huỷ.');
                        return;
                    }
                } else if (imported.schedule || imported.timesheet) {
                    // This might be an older full export or just schedule/timesheet
                    if (confirm('Dữ liệu nhập vào sẽ GHI ĐÈ lịch làm việc HOẶC chấm công hiện tại. Bạn có chắc chắn muốn tiếp tục?')) {
                        if (imported.schedule) {
                            scheduleData = imported.schedule;
                            showToast('Đã nhập lịch làm việc!');
                        }
                        if (imported.timesheet) {
                            timesheetEntries = imported.timesheet;
                            showToast('Đã nhập dữ liệu chấm công!');
                        }
                    } else {
                        showToast('Nhập dữ liệu đã huỷ.');
                        return;
                    }
                } else {
                    // Assume it's either schedule or timesheet if it's a plain object
                    const isScheduleLike = Object.keys(imported).every(key => typeof imported[key] === 'string' && SHIFT_CYCLE.includes(imported[key]));
                    const isTimesheetLike = Object.keys(imported).every(key => typeof imported[key] === 'object' && imported[key] !== null && 'type' in imported[key]);

                    if (isScheduleLike && isTimesheetLike) { // Highly unlikely, but for safety
                        if (confirm('Dữ liệu nhập vào có vẻ chứa cả lịch và chấm công. Dữ liệu hiện tại sẽ bị GHI ĐÈ. Bạn có chắc chắn muốn tiếp tục?')) {
                            scheduleData = imported;
                            timesheetEntries = imported; // This logic might be flawed if 'imported' contains both and overwrite each other. Refine as needed.
                            showToast('Đã nhập dữ liệu lịch và chấm công!');
                        } else {
                            showToast('Nhập dữ liệu đã huỷ.');
                            return;
                        }
                    } else if (isScheduleLike) {
                        if (confirm('Dữ liệu nhập vào có vẻ là lịch làm việc. Lịch làm việc hiện tại sẽ bị GHI ĐÈ. Bạn có chắc chắn muốn tiếp tục?')) {
                            scheduleData = imported;
                            showToast('Đã nhập lịch làm việc!');
                        } else {
                            showToast('Nhập dữ liệu đã huỷ.');
                            return;
                        }
                    } else if (isTimesheetLike) {
                        if (confirm('Dữ liệu nhập vào có vẻ là chấm công. Dữ liệu chấm công hiện tại sẽ bị GHI ĐÈ. Bạn có chắc chắn muốn tiếp tục?')) {
                            timesheetEntries = imported;
                            showToast('Đã nhập dữ liệu chấm công!');
                        } else {
                            showToast('Nhập dữ liệu đã huỷ.');
                            return;
                        }
                    } else {
                        showToast('Cấu trúc file JSON không hợp lệ.');
                        return;
                    }
                }

                persistAllData();
                renderCalendar();
                updateStatistics();
                renderTimesheetLog();
            } catch (error) {
                console.error('Error importing data:', error);
                showToast('Lỗi khi đọc file JSON. Vui lòng kiểm tra định dạng.');
            }
        };
        reader.readAsText(file);
    };

    const exportCsv = () => {
        const filteredEntries = getFilteredLogEntries().sort((a, b) => new Date(a[0]) - new Date(b[0]));
        if (filteredEntries.length === 0) {
            showToast('Không có dữ liệu để xuất CSV.');
            return;
        }

        let csvContent = "Ngày,Loại ca dự kiến,Giờ làm,Giờ tăng ca,Loại chấm công,Ghi chú\n";

        filteredEntries.forEach(([dateStr, entry]) => {
            const shiftType = scheduleData[dateStr] || "Không có lịch";
            const entryTypeLabel = entryTypeSelect.querySelector(`option[value="${entry.type}"]`)?.textContent || entry.type;

            let hoursWorked = '';
            let overtimeHours = '';

            if (entry.type === 'work' || entry.type === 'work_ot') {
                hoursWorked = baseWorkHours;
                overtimeHours = ((entry.overtimeHours || 0) + (entry.overtimeMinutes || 0) / 60).toFixed(1);
            } else {
                hoursWorked = '0';
                overtimeHours = '0';
            }

            const notes = entry.notes ? `"${entry.notes.replace(/"/g, '""')}"` : ''; // Handle commas and quotes in notes

            csvContent += `${formatDateStr(dateStr)},${shiftType},${hoursWorked},${overtimeHours},${entryTypeLabel},${notes}\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `so_cham_cong_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Đã tải file CSV!');
    };


    // --- Event Handlers ---
    const handleDayClick = (event) => {
        const targetCell = event.target.closest('td[data-date]');
        if (!targetCell) return;

        // If it's a structural disabled-day (empty cell), do nothing
        if (targetCell.classList.contains('disabled-day') && !targetCell.dataset.date) {
            return;
        }

        const dateStr = targetCell.dataset.date;
        const cellDate = new Date(dateStr);
        cellDate.setHours(0, 0, 0, 0);

        // Determine the work period that *this calendar view is based on* for interaction logic
        let workPeriodStartDateForCurrentView = new Date(currentDate.getFullYear(), currentDate.getMonth(), startWorkDay);
        if (currentDate.getDate() < startWorkDay) { // if current month's display corresponds to previous calendar month's work period
            workPeriodStartDateForCurrentView.setMonth(workPeriodStartDateForCurrentView.getMonth() - 1);
        }
        workPeriodStartDateForCurrentView.setHours(0, 0, 0, 0);
        let workPeriodEndDateForCurrentView = new Date(workPeriodStartDateForCurrentView.getFullYear(), workPeriodStartDateForCurrentView.getMonth() + 1, startWorkDay - 1);
        workPeriodEndDateForCurrentView.setHours(23, 59, 59, 999);

        const isInWorkPeriod = cellDate >= workPeriodStartDateForCurrentView && cellDate <= workPeriodEndDateForCurrentView;

        if (isEditMode) {
            // NEW: Kiểm tra nếu cho phép bỏ qua cuối tuần và ngày đó là cuối tuần
            if (!allowWeekendEdit && isWeekend(cellDate)) {
                showToast("Không thể sửa lịch vào Thứ Bảy hoặc Chủ Nhật.");
                return; // Bỏ qua nếu là cuối tuần và cài đặt không cho phép
            }

            // In edit mode, all visible days are editable
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
            // In view mode:
            if (displayMode === 'fullMonth') {
                // In fullMonth mode, all displayed days are freely clickable for timesheet entry.
                timesheetEntries[dateStr] ? openActionConfirmModal(dateStr) : openTimesheetModal(dateStr);
            } else { // 'workPeriod' mode
                // In workPeriod mode, only days strictly within the work period are clickable for timesheet entry.
                if (isInWorkPeriod) {
                    timesheetEntries[dateStr] ? openActionConfirmModal(dateStr) : openTimesheetModal(dateStr);
                } else {
                    showToast("Bạn chỉ có thể chấm công cho các ngày trong chu kỳ làm việc hiện tại.");
                }
            }
        }
    };

    const handleConfirmTimesheet = () => {
        const dateStr = timesheetDateInput.value;
        const entryType = entryTypeSelect.value;
        const newEntry = { type: entryType, notes: notesInput.value.trim() };
        if (entryType === 'work' || entryType === 'work_ot') { // Apply overtime for 'work' type as well
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
        // Overtime fields are shown only if type is 'work' or 'work_ot' (if 'work_ot' existed)
        overtimeFields.style.display = (entryTypeSelect.value === 'work' || entryTypeSelect.value === 'work_ot') ? 'block' : 'none';
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

    // Navigation buttons logic depends on displayMode now
    prevMonthBtn.addEventListener('click', () => {
        if (displayMode === 'fullMonth') {
            currentDate.setMonth(currentDate.getMonth() - 1);
        } else { // 'workPeriod' mode
            // For workPeriod mode, navigate by shifting the *start* of the work period
            let newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), startWorkDay);
            if (currentDate.getDate() < startWorkDay) { // if current month's display corresponds to previous calendar month's work period
                newDate.setMonth(newDate.getMonth() - 1);
            }
            newDate.setMonth(newDate.getMonth() - 1); // Go to previous work period
            currentDate = newDate;
        }
        renderCalendar();
        if (document.getElementById('tabSoChamCong').classList.contains('active')) updateStatistics();
    });

    nextMonthBtn.addEventListener('click', () => {
        if (displayMode === 'fullMonth') {
            currentDate.setMonth(currentDate.getMonth() + 1);
        } else { // 'workPeriod' mode
            // For workPeriod mode, navigate by shifting the *start* of the work period
            let newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), startWorkDay);
            if (currentDate.getDate() < startWorkDay) { // if current month's display corresponds to previous calendar month's work period
                newDate.setMonth(newDate.getMonth() - 1);
            }
            newDate.setMonth(newDate.getMonth() + 1); // Go to next work period
            currentDate = newDate;
        }
        renderCalendar();
        if (document.getElementById('tabSoChamCong').classList.contains('active')) updateStatistics();
    });

    // Explicit save for schedule editing
    editScheduleBtn.addEventListener('click', () => {
        isEditMode = true;
        renderCalendar();
        editScheduleBtn.style.display = 'none';
        saveScheduleBtn.style.display = 'flex';
        quickEditControls.style.display = 'block'; // Show quick edit controls
    });
    saveScheduleBtn.addEventListener('click', () => {
        isEditMode = false;
        persistAllData();
        renderCalendar();
        editScheduleBtn.style.display = 'flex';
        saveScheduleBtn.style.display = 'none';
        quickEditControls.style.display = 'none'; // Hide quick edit controls
        showToast('Đã lưu lịch!');
    });

    // NEW: Event listener cho nút chuyển đổi ngày đầu tuần
    if (toggleFirstDayBtn) {
        toggleFirstDayBtn.addEventListener('click', () => {
            firstDayIsMonday = !firstDayIsMonday; // Đảo ngược trạng thái
            persistAllData(); // Lưu vào LocalStorage
            renderCalendar(); // Render lại lịch
            firstDayLabel.textContent = firstDayIsMonday ? 'T2' : 'CN'; // Cập nhật label của nút
            showToast(`Ngày bắt đầu tuần đã chuyển sang: ${firstDayIsMonday ? 'Thứ Hai' : 'Chủ Nhật'}`);
        });
    }

    themeSelector.addEventListener('change', (e) => applyTheme(e.target.value));
    baseHoursInput.addEventListener('change', (e) => {
        const hours = parseFloat(e.target.value);
        if (hours > 0 && hours <= 24) { baseWorkHours = hours; persistAllData(); showToast(`Đã cập nhật giờ làm cơ bản.`); if (document.getElementById('tabSoChamCong').classList.contains('active')) updateStatistics(); }
        else { showToast('Số giờ không hợp lệ.'); e.target.value = baseWorkHours; }
    });

    startWorkDayInput.addEventListener('change', (e) => {
        let day = parseInt(e.target.value);
        if (isNaN(day) || day < 1 || day > 31) {
            showToast('Ngày không hợp lệ (1-31).');
            e.target.value = startWorkDay;
            return;
        }
        startWorkDay = day;
        persistAllData();
        showToast(`Đã cập nhật ngày bắt đầu công.`);
        // When startWorkDay changes, re-align currentDate to the *new* current work period for consistency
        let today = new Date();
        let newCurrentDateRef;
        if (displayMode === 'fullMonth') { // In fullMonth, reset to 1st of current calendar month
            newCurrentDateRef = new Date(today.getFullYear(), today.getMonth(), 1);
        } else { // In workPeriod, reset to start of *current* work period
            let workPeriodStartMonth = today.getMonth();
            let workPeriodStartYear = today.getFullYear();
            if (today.getDate() < startWorkDay) {
                workPeriodStartMonth = (workPeriodStartMonth === 0) ? 11 : workPeriodStartMonth - 1;
                workPeriodStartYear = (today.getMonth() === 0) ? workPeriodStartYear - 1 : workPeriodStartYear;
            }
            newCurrentDateRef = new Date(workPeriodStartYear, workPeriodStartMonth, startWorkDay);
        }
        currentDate = newCurrentDateRef;
        renderCalendar();
        if (document.getElementById('tabSoChamCong').classList.contains('active')) updateStatistics();
    });

    // Event listener for displayModeSelect
    displayModeSelect.addEventListener('change', (e) => {
        displayMode = e.target.value;
        persistAllData();
        // When display mode changes, reset currentDate to today's current work period or calendar month
        let today = new Date();
        if (displayMode === 'fullMonth') {
            currentDate = new Date(today.getFullYear(), today.getMonth(), 1); // Reset to 1st of current calendar month
        } else { // 'workPeriod' mode
            let workPeriodStartMonth = today.getMonth();
            let workPeriodStartYear = today.getFullYear();
            if (today.getDate() < startWorkDay) {
                workPeriodStartMonth = (workPeriodStartMonth === 0) ? 11 : workPeriodStartMonth - 1;
                workPeriodStartYear = (today.getMonth() === 0) ? workPeriodStartYear - 1 : workPeriodStartYear;
            }
            currentDate = new Date(workPeriodStartYear, workPeriodStartMonth, startWorkDay); // Reset to start of current work period
        }
        renderCalendar();
        if (document.getElementById('tabSoChamCong').classList.contains('active')) updateStatistics();
    });

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

    // Data export/import listeners
    exportDataBtn.addEventListener('click', exportData);
    importDataBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', importData);
    exportLogCsvBtn.addEventListener('click', exportCsv);


    // Quick Edit Mode Listeners
    quickEditModeSelect.addEventListener('change', (e) => {
        const mode = e.target.value;
        if (mode === 'range') {
            dateRangeInputs.style.display = 'block';
            dragModeInstructions.style.display = 'none';
        } else {
            dateRangeInputs.style.display = 'none';
            dragModeInstructions.style.display = 'block';
        }
        // Clear any active drag selections when switching modes
        document.querySelectorAll('.drag-selecting').forEach(cell => cell.classList.remove('drag-selecting'));
        dragSelection = [];
    });

    applyQuickEditBtn.addEventListener('click', () => {
        const type = quickEditTypeSelect.value;
        const startDate = quickStartDateInput.value;
        const endDate = quickEndDateInput.value;

        if (!startDate || !endDate) {
            showToast('Vui lòng chọn đầy đủ khoảng ngày.');
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            showToast('Ngày bắt đầu không thể sau ngày kết thúc.');
            return;
        }

        let current = new Date(startDate);
        const end = new Date(endDate);

        while (current <= end) {
            const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
            const dayOfWeek = current.getDay(); // 0 for Sunday, 6 for Saturday

            // NEW: Bỏ qua cuối tuần nếu cài đặt cho phép
            if (!allowWeekendEdit && (dayOfWeek === 0 || dayOfWeek === 6)) {
                // Do nothing for weekends if disabled
            } else {
                if (type) {
                    scheduleData[dateStr] = type;
                } else {
                    delete scheduleData[dateStr];
                }
            }
            current.setDate(current.getDate() + 1);
        }
        persistAllData();
        renderCalendar();
        showToast('Đã áp dụng lịch nhanh!');
    });

    // --- Drag selection for quick edit (Cập nhật để hỗ trợ cảm ứng) ---
    // Helper function to get the target cell from touch event
    const getTouchTargetCell = (event) => {
        const touch = event.touches[0];
        const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
        return targetElement ? targetElement.closest('td[data-date].editable') : null;
    };

    calendarDaysElement.addEventListener('mousedown', handleDragStart);
    calendarDaysElement.addEventListener('mouseover', handleDragMove);
    calendarDaysElement.addEventListener('mouseup', handleDragEnd);

    calendarDaysElement.addEventListener('touchstart', handleDragStart, { passive: false });
    calendarDaysElement.addEventListener('touchmove', handleDragMove, { passive: false });
    calendarDaysElement.addEventListener('touchend', handleDragEnd);

    function handleDragStart(e) {
        if (!isEditMode || quickEditModeSelect.value !== 'drag') return;

        let targetCell;
        if (e.type === 'mousedown') {
            targetCell = e.target.closest('td[data-date].editable');
        } else if (e.type === 'touchstart') {
            targetCell = getTouchTargetCell(e);
        }

        if (!targetCell) return;

        isDragging = true;
        dragSelection = [];
        document.querySelectorAll('.drag-selecting').forEach(cell => cell.classList.remove('drag-selecting'));

        const dateStr = targetCell.dataset.date;
        const cellDate = new Date(dateStr);

        // NEW: Bỏ qua cuối tuần khi bắt đầu kéo nếu cài đặt cho phép
        if (!allowWeekendEdit && isWeekend(cellDate)) {
            showToast("Không thể kéo chọn cuối tuần.");
            isDragging = false; // Ngừng kéo nếu bắt đầu từ cuối tuần bị cấm
            return;
        }

        dragSelection.push(dateStr);
        targetCell.classList.add('drag-selecting');
        e.preventDefault();
    }

    function handleDragMove(e) {
        if (!isDragging || !isEditMode || quickEditModeSelect.value !== 'drag') return;

        let targetCell;
        if (e.type === 'mouseover') {
            targetCell = e.target.closest('td[data-date].editable');
        } else if (e.type === 'touchmove') {
            targetCell = getTouchTargetCell(e);
        }

        if (!targetCell) return;

        const dateStr = targetCell.dataset.date;
        const cellDate = new Date(dateStr);

        // NEW: Bỏ qua cuối tuần khi kéo qua nếu cài đặt cho phép
        if (!allowWeekendEdit && isWeekend(cellDate)) {
            // Không thêm vào dragSelection, không tô màu cell
            return;
        }

        if (!dragSelection.includes(dateStr)) {
            dragSelection.push(dateStr);
            targetCell.classList.add('drag-selecting');
        }
        e.preventDefault();
    }

    function handleDragEnd() {
        if (!isDragging) return;
        isDragging = false;

        if (dragSelection.length > 0) {
            const quickEditType = quickEditTypeSelect.value;
            dragSelection.sort((a, b) => new Date(a) - new Date(b));

            dragSelection.forEach(dateStr => {
                const cellDate = new Date(dateStr);
                // NEW: Áp dụng thay đổi chỉ khi không phải cuối tuần HOẶC cho phép sửa cuối tuần
                if (allowWeekendEdit || !isWeekend(cellDate)) {
                    if (quickEditType) {
                        scheduleData[dateStr] = quickEditType;
                    } else {
                        delete scheduleData[dateStr];
                    }
                }
            });
            persistAllData();
            renderCalendar();
            showToast(`Đã áp dụng ${quickEditType ? quickEditType : 'xoá'} cho ${dragSelection.length} ngày.`);
            dragSelection = [];
        }
        // Đảm bảo loại bỏ tất cả các lớp drag-selecting sau khi kết thúc kéo
        document.querySelectorAll('.drag-selecting').forEach(cell => cell.classList.remove('drag-selecting'));
    }

    // NEW: Thêm Event Listeners cho vuốt trên .calendar-controls-header
    const calendarControlsHeader = document.querySelector('.calendar-controls-header');
    if (calendarControlsHeader) {
        calendarControlsHeader.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true }); // Dùng passive: true để tối ưu hiệu suất cuộn

        calendarControlsHeader.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }


    // NEW: Thêm Event Listeners cho vuốt trên .calendar-table
    if (calendarDaysElement) {
        calendarDaysElement.addEventListener('touchstart', (e) => {
            // Chỉ bắt đầu vuốt nếu không ở chế độ kéo chọn ngày (drag mode)
            if (!isEditMode || quickEditModeSelect.value !== 'drag') {
                touchStartX = e.changedTouches[0].screenX;
            }
        }, { passive: true });

        calendarDaysElement.addEventListener('touchend', (e) => {
            // Chỉ xử lý vuốt nếu không ở chế độ kéo chọn ngày (drag mode)
            if (!isEditMode || quickEditModeSelect.value !== 'drag') {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            }
        }, { passive: true });
    }

    // NEW: Logic cho việc nhấn vào #currentMonthYear để mở picker
    if (currentMonthYearElement) {
        let pressTimeout; // Biến để giữ timeout cho nhấn giữ
        let isLongPress = false; // Cờ hiệu để xác định có phải nhấn giữ không

        const handlePressStart = (e) => {
            e.preventDefault(); // Ngăn hành vi mặc định của trình duyệt (ví dụ: bôi đen văn bản)
            touchStartX = e.changedTouches ? e.changedTouches[0].screenX : e.clientX; // Ghi lại vị trí bắt đầu
            isLongPress = false;
            pressTimeout = setTimeout(() => {
                isLongPress = true;
                // Chuyển về tháng hiện tại
                const today = new Date();
                currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
                renderCalendar();
                showToast(`Đã chuyển đến tháng hiện tại: ${today.getMonth() + 1}/${today.getFullYear()}`);
                if (document.getElementById('tabSoChamCong').classList.contains('active')) updateStatistics();
            }, LONG_PRESS_THRESHOLD);
        };

        const handlePressEnd = (e) => {
            clearTimeout(pressTimeout); // Xóa timeout khi nhấc ngón tay/thả chuột
            if (!isLongPress) {
                // Nếu không phải nhấn giữ, mở modal chọn tháng/năm
                openMonthYearPicker();
            }
        };

        const handlePressMove = (e) => {
            // Nếu di chuyển quá một khoảng nhỏ, hủy nhấn giữ (giống như kéo)
            const currentX = e.changedTouches ? e.changedTouches[0].screenX : e.clientX;
            if (Math.abs(currentX - touchStartX) > 10) { // Khoảng cách 10px để phân biệt click và kéo
                clearTimeout(pressTimeout);
                isLongPress = false;
            }
        };

        // Gắn sự kiện cho cả chuột và cảm ứng
        currentMonthYearElement.addEventListener('mousedown', handlePressStart);
        currentMonthYearElement.addEventListener('mouseup', handlePressEnd);
        currentMonthYearElement.addEventListener('mouseleave', () => clearTimeout(pressTimeout)); // Nếu chuột rời khỏi element

        currentMonthYearElement.addEventListener('touchstart', handlePressStart, { passive: false });
        currentMonthYearElement.addEventListener('touchend', handlePressEnd, { passive: false });
        currentMonthYearElement.addEventListener('touchmove', handlePressMove, { passive: false });
    }

    // NEW: Hàm để mở modal chọn tháng/năm
    function openMonthYearPicker() {
        // Điền tháng
        selectMonth.innerHTML = '';
        for (let i = 0; i < 12; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Tháng ${i + 1}`;
            selectMonth.appendChild(option);
        }
        selectMonth.value = currentDate.getMonth(); // Chọn tháng hiện tại trên lịch

        // Điền năm (ví dụ: 10 năm trước và 10 năm sau năm hiện tại)
        selectYear.innerHTML = '';
        const currentYear = currentDate.getFullYear();
        for (let i = currentYear - 10; i <= currentYear + 10; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            selectYear.appendChild(option);
        }
        selectYear.value = currentYear; // Chọn năm hiện tại trên lịch

        monthYearPickerModal.style.display = 'flex';
    }

    // NEW: Event listener cho nút Xác nhận trong modal chọn tháng/năm
    if (confirmMonthYearBtn) {
        confirmMonthYearBtn.addEventListener('click', () => {
            const selectedMonth = parseInt(selectMonth.value);
            const selectedYear = parseInt(selectYear.value);

            currentDate.setFullYear(selectedYear);
            currentDate.setMonth(selectedMonth);
            currentDate.setDate(1); // Đặt lại về ngày 1 để tránh lỗi với các tháng có ít ngày

            renderCalendar();
            monthYearPickerModal.style.display = 'none';
            if (document.getElementById('tabSoChamCong').classList.contains('active')) {
                updateStatistics();
                renderTimesheetLog();
            }
            showToast(`Đã chuyển đến ${selectMonth.options[selectMonth.selectedIndex].text}, ${selectedYear}`);
        });
    }

    // NEW: Đóng modal khi click ra ngoài hoặc nhấn Hủy
    if (monthYearPickerModal) {
        monthYearPickerModal.addEventListener('click', e => {
            if (e.target === monthYearPickerModal) {
                e.target.style.display = 'none';
            }
        });
        const cancelBtn = monthYearPickerModal.querySelector('.btn-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                monthYearPickerModal.style.display = 'none';
            });
        }
    }


    // --- Init ---
    const init = () => {
        loadAllData();
        // Initialize currentDate based on the loaded display mode and startWorkDay
        // Logic này chỉ ảnh hưởng đến lịch hiển thị, không ảnh hưởng đến thống kê nữa.
        let today = new Date();
        if (displayMode === 'fullMonth') {
            currentDate = new Date(today.getFullYear(), today.getMonth(), 1); // Start at 1st of current calendar month
        } else { // 'workPeriod' mode
            let workPeriodStartMonth = today.getMonth();
            let workPeriodStartYear = today.getFullYear();
            if (today.getDate() < startWorkDay) {
                workPeriodStartMonth = (workPeriodStartMonth === 0) ? 11 : workPeriodStartMonth - 1;
                workPeriodStartYear = (today.getMonth() === 0) ? workPeriodStartYear - 1 : workPeriodStartYear;
            }
            currentDate = new Date(workPeriodStartYear, workPeriodStartMonth, startWorkDay); // Start at beginning of current work period
        }

        renderCalendar();
        // Dù tab nào đang active khi load, luôn cập nhật thống kê khi init
        updateStatistics();
        renderTimesheetLog();
        updateTitle(document.querySelector('.nav-button.active').dataset.title);
    };
    init();
});