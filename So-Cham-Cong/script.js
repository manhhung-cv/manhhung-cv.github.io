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
    let currentDate = new Date(); // This date acts as the reference point for the displayed calendar/work period
    let isEditMode = false;
    let scheduleData = {};
    let timesheetEntries = {};
    let firstDayIsMonday = false, baseWorkHours = 8;
    let startWorkDay = 1; // Default start work day is 1st of the month
    let displayMode = 'fullMonth'; // Default display mode
    const SHIFT_CYCLE = ["", "ca-ngay", "ca-dem", "nghi", "ngay-le"];
    const SHIFT_ICONS = { "ca-ngay": '<i class="fas fa-sun"></i>', "ca-dem": '<i class="fas fa-moon"></i>', "nghi": '<i class="fas fa-home"></i>', "ngay-le": '<i class="fas fa-star"></i>', "": "" };
    const LOCAL_STORAGE_KEYS = { schedule: 'ts_schedule_v16', timesheet: 'ts_entries_v16', firstDay: 'ts_firstday_v16', theme: 'ts_theme_v16', baseHours: 'ts_basehours_v16', startWorkDay: 'ts_startworkday_v16', displayMode: 'ts_displaymode_v16' }; // Updated version key

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
            const savedStartWorkDay = localStorage.getItem(LOCAL_STORAGE_KEYS.startWorkDay);
            startWorkDay = savedStartWorkDay ? parseInt(savedStartWorkDay) : 1;
            displayMode = localStorage.getItem(LOCAL_STORAGE_KEYS.displayMode) || 'fullMonth';

            applyTheme(savedTheme);
            if (firstDaySwitch) firstDaySwitch.checked = firstDayIsMonday;
            if (baseHoursInput) baseHoursInput.value = baseWorkHours;
            if (startWorkDayInput) startWorkDayInput.value = startWorkDay;
            if (displayModeSelect) displayModeSelect.value = displayMode;
        } catch (e) { showToast("Lỗi tải dữ liệu."); }
    };

    const persistAllData = () => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.schedule, JSON.stringify(scheduleData));
            localStorage.setItem(LOCAL_STORAGE_KEYS.timesheet, JSON.stringify(timesheetEntries));
            localStorage.setItem(LOCAL_STORAGE_KEYS.firstDay, firstDayIsMonday);
            localStorage.setItem(LOCAL_STORAGE_KEYS.baseHours, baseWorkHours);
            localStorage.setItem(LOCAL_STORAGE_KEYS.startWorkDay, startWorkDay);
            localStorage.setItem(LOCAL_STORAGE_KEYS.displayMode, displayMode);
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

        const headers = firstDayIsMonday ? ["T2", "T3", "T4", "T5", "T6", "T7", "CN"] : ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
        calendarHeaderRowElement.innerHTML = headers.map(h => `<th>${h}</th>`).join('');

        let daysToDisplay = []; // This will hold Date objects for cells to be rendered
        let calendarTitle = "";
        const todayObj = new Date();
        todayObj.setHours(0, 0, 0, 0);

        // --- Calculate Work Period Dates (used by both modes for boundary checks/border) ---
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
        // --- End Work Period Calculation ---


        if (displayMode === 'fullMonth') {
            // Mode 1: Display full calendar month (standard calendar grid)
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth(); // 0-indexed
            const firstDayOfMonth = new Date(year, month, 1);
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            calendarTitle = `Tháng ${month + 1}, ${year}`;

            let startDayOffset = firstDayIsMonday ? (firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1) : firstDayOfMonth.getDay();
            
            // Add leading blank cells
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
            // Mode 2: Display work period from startWorkDay to (startWorkDay - 1) of next month
            calendarTitle = `Tháng ${workPeriodStartDateActual.getMonth() + 1}, ${workPeriodStartDateActual.getFullYear()} - Tháng ${workPeriodEndDateActual.getMonth() + 1}, ${workPeriodEndDateActual.getFullYear()}`;

            // Calculate leading empty cells for the first day of the work period
            let firstDayOfWeekOfWorkPeriodStart = workPeriodStartDateActual.getDay(); // 0 for Sunday, 1 for Monday...
            if (firstDayIsMonday) {
                firstDayOfWeekOfWorkPeriodStart = (firstDayOfWeekOfWorkPeriodStart === 0) ? 6 : firstDayOfWeekOfWorkPeriodStart - 1;
            }
            for (let i = 0; i < firstDayOfWeekOfWorkPeriodStart; i++) {
                daysToDisplay.push({ type: 'empty' });
            }

            // Add all days within the work period
            let currentDay = new Date(workPeriodStartDateActual);
            while (currentDay <= workPeriodEndDateActual) {
                const year = currentDay.getFullYear();
                const month = currentDay.getMonth();
                const day = currentDay.getDate();
                daysToDisplay.push({
                    type: 'day',
                    date: new Date(currentDay), // clone date to avoid reference issues
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

                // Add border class if it's the specific start work day of the actual work period being displayed
                const isStartWorkDayCell = (currentDateForCell.getTime() === workPeriodStartDateActual.getTime());
                if (isStartWorkDayCell) {
                    cellClasses += ' start-work-day-cell ';
                }

                if (isEditMode) {
                    cellClasses += 'editable'; // In edit mode, all displayed cells are editable
                } else {
                    // In view mode:
                    // 'fullMonth' mode: ALL displayed days are clickable for timesheet entry
                    // 'workPeriod' mode: Only days within the work period are clickable for timesheet entry
                    if (displayMode === 'fullMonth' || (displayMode === 'workPeriod' && currentDateForCell >= workPeriodStartDateActual && currentDateForCell <= workPeriodEndDateActual)) {
                        cellClasses += 'timesheet-entry-allowed';
                    } else {
                        // This else block might not be strictly needed for 'workPeriod' as we only add relevant days,
                        // but it's good for clarity if logic changes.
                        cellClasses += 'disabled-day-visual'; // Visually indicate it's outside the interaction scope if necessary.
                    }
                }
                
                cellsInRow.push(`<td class="${cellClasses}" data-date="${dateStr}"><div class="day-cell-content"><span class="day-number">${dayInfo.date.getDate()}</span><span class="shift-info ${!shiftType ? 'empty' : ''}">${SHIFT_ICONS[shiftType] || ''}</span><div class="timesheet-indicator ${hasTimesheet ? 'visible' : ''}"></div></div></td>`);
            }

            if (cellsInRow.length === 7) {
                rowsHtml += `<tr>${cellsInRow.join('')}</tr>`;
                cellsInRow = [];
            }
        });

        // Add remaining cells and fill up the last row to complete the grid
        while (cellsInRow.length > 0 && cellsInRow.length < 7) {
            cellsInRow.push('<td class="disabled-day"></td>');
        }
        if (cellsInRow.length > 0) {
            rowsHtml += `<tr>${cellsInRow.join('')}</tr>`;
        }
        
        calendarDaysElement.innerHTML = rowsHtml;
    };

    const updateStatistics = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        let startStatsDate = new Date(year, month, startWorkDay);
        if (currentDate.getDate() < startWorkDay) {
            startStatsDate.setMonth(startStatsDate.getMonth() - 1);
        }
        startStatsDate.setHours(0,0,0,0);

        let endStatsDate = new Date(startStatsDate.getFullYear(), startStatsDate.getMonth() + 1, startWorkDay - 1);
        endStatsDate.setHours(23,59,59,999);

        let stats = { schedDay: 0, schedNight: 0, actualDay: 0, actualNight: 0, paid: 0, unpaid: 0, company: 0, otMins: 0 };

        for (let d = new Date(startStatsDate); d <= endStatsDate; d.setDate(d.getDate() + 1)) {
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const schedule = scheduleData[dateStr] || "";
            const entry = timesheetEntries[dateStr];

            if (schedule === 'ca-ngay') stats.schedDay++;
            if (schedule === 'ca-dem') stats.schedNight++;

            if (entry) {
                if (entry.type === 'work') {
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

        // If it's a structural disabled-day (empty cell), do nothing
        if (targetCell.classList.contains('disabled-day') && !targetCell.dataset.date) {
            return;
        }

        const dateStr = targetCell.dataset.date;
        const cellDate = new Date(dateStr);
        cellDate.setHours(0,0,0,0);

        // Determine the work period that *this calendar view is based on* for interaction logic
        let workPeriodStartDateForCurrentView = new Date(currentDate.getFullYear(), currentDate.getMonth(), startWorkDay);
        if (currentDate.getDate() < startWorkDay) {
             workPeriodStartDateForCurrentView.setMonth(workPeriodStartDateForCurrentView.getMonth() - 1);
        }
        workPeriodStartDateForCurrentView.setHours(0,0,0,0);
        let workPeriodEndDateForCurrentView = new Date(workPeriodStartDateForCurrentView.getFullYear(), workPeriodStartDateForCurrentView.getMonth() + 1, startWorkDay - 1);
        workPeriodEndDateForCurrentView.setHours(23,59,59,999);
        
        const isInWorkPeriod = cellDate >= workPeriodStartDateForCurrentView && cellDate <= workPeriodEndDateForCurrentView;

        if (isEditMode) {
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
    });
    saveScheduleBtn.addEventListener('click', () => {
        isEditMode = false;
        persistAllData();
        renderCalendar();
        editScheduleBtn.style.display = 'flex';
        saveScheduleBtn.style.display = 'none';
        showToast('Đã lưu lịch!');
    });

    firstDaySwitch.addEventListener('change', (e) => { firstDayIsMonday = e.target.checked; persistAllData(); renderCalendar(); });
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
            newCurrentDateRef = new Date(today.getFullYear(), today.getMonth(), startWorkDay);
            if (today.getDate() < startWorkDay) {
                newCurrentDateRef.setMonth(newCurrentDateRef.getMonth() - 1);
            }
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

    // --- Init ---
    const init = () => {
        loadAllData();
        // Initialize currentDate based on the loaded display mode and startWorkDay
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
        if (document.querySelector('.nav-button.active').dataset.tab === 'tabSoChamCong') {
            updateStatistics();
            renderTimesheetLog();
        }
        updateTitle(document.querySelector('.nav-button.active').dataset.title);
    };
    init();
});