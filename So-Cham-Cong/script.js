document.addEventListener('DOMContentLoaded', function() {
    // --- Platform Detection ---
    const body = document.body;
    const isMobile = ('ontouchstart' in window) || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    body.classList.add(isMobile ? 'platform-mobile' : 'platform-desktop');

    // --- DOM Elements ---
    const appShell = document.getElementById('appShell');
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
    
    // Timesheet Modal
    const timesheetModal = document.getElementById('timesheetModal');
    const modalTitleElement = document.getElementById('modalTitle');
    const timesheetDateInput = document.getElementById('timesheetDate');
    const entryTypeSelect = document.getElementById('entryType');
    const overtimeFields = document.getElementById('overtimeFields');
    const overtimeHoursInput = document.getElementById('overtimeHours');
    const overtimeMinutesInput = document.getElementById('overtimeMinutes');
    const notesInput = document.getElementById('notes');
    const timesheetModalCancelBtn = timesheetModal.querySelector('.btn-cancel');
    const timesheetModalConfirmBtn = timesheetModal.querySelector('.btn-confirm');
    
    // Action Modal
    const actionConfirmModal = document.getElementById('actionConfirmModal');
    const actionConfirmModalTitle = document.getElementById('actionConfirmModalTitle');
    const actionConfirmDateInput = document.getElementById('actionConfirmDate');
    const actionConfirmModalEditBtn = actionConfirmModal.querySelector('.btn-edit-timesheet');
    const actionConfirmModalDeleteBtn = actionConfirmModal.querySelector('.btn-delete-timesheet');
    
    // Log & Stats
    const timesheetLogBody = document.getElementById('timesheetLogBody');
    const noTimesheetDataMsg = document.getElementById('noTimesheetDataMsg');
    const logFilterTypeSelect = document.getElementById('logFilterType');
    const logDateRangePicker = document.getElementById('logDateRangePicker');
    const logMonthPicker = document.getElementById('logMonthPicker');
    const logStartDateInput = document.getElementById('logStartDate');
    const logEndDateInput = document.getElementById('logEndDate');
    const logMonthInput = document.getElementById('logMonth');
    const applyLogFilterBtn = document.getElementById('applyLogFilterBtn');
    const exportLogCsvBtn = document.getElementById('exportLogCsvBtn');
    const statsTotalWorkDays = document.getElementById('statsTotalWorkDays');
    const statsActualWorkDays = document.getElementById('statsActualWorkDays');
    const statsLeaveDays = document.getElementById('statsLeaveDays');
    const statsTotalHours = document.getElementById('statsTotalHours');
    const statsOvertimeHours = document.getElementById('statsOvertimeHours');
    
    // Settings
    const exportDataTypeSelect = document.getElementById('exportDataType');
    const exportDataBtn = document.getElementById('exportDataBtn');
    const importFileInput = document.getElementById('importFile');
    const importDataBtn = document.getElementById('importDataBtn');

    // --- State Variables & Constants ---
    let currentDate = new Date();
    let isEditMode = false;
    let scheduleData = {};
    let timesheetEntries = {};
    let firstDayIsMonday = false;
    const SHIFT_CYCLE = ["", "ca-ngay", "ca-dem", "nghi", "ngay-le"];
    const SHIFT_DESCRIPTIONS = { "ca-ngay": "Ca Ngày", "ca-dem": "Ca Đêm", "nghi": "Nghỉ", "ngay-le": "Ngày Lễ", "": "Trống" };
    const SHIFT_ICONS = { "ca-ngay": '<i class="fas fa-sun"></i>', "ca-dem": '<i class="fas fa-moon"></i>', "nghi": '<i class="fas fa-home"></i>', "ngay-le": '<i class="fas fa-star"></i>', "": "" };
    const LOCAL_STORAGE_KEYS = { schedule: 'ts_schedule_v12', timesheet: 'ts_entries_v12', firstDay: 'ts_firstday_v12', theme: 'ts_theme_v12' };

    // --- Utility ---
    function showToast(message, duration = 2500) { /* ... same as before ... */ }
    function formatDateStr(dateStr) { const [y, m, d] = dateStr.split('-'); return `${d}/${m}/${y}`; }

    // --- Theming ---
    function applyTheme(themeName) {
        body.className = body.className.replace(/theme-\w+/g, '').trim(); // Remove old theme
        if (themeName && themeName !== 'default') {
            body.classList.add(`theme-${themeName}`);
        }
        localStorage.setItem(LOCAL_STORAGE_KEYS.theme, themeName);
        if(themeSelector) themeSelector.value = themeName;
    }
    themeSelector.addEventListener('change', (e) => applyTheme(e.target.value));

    // --- Data Persistence ---
    function loadAllData() { /* ... same as before, now loads theme ... */ }
    function persistAllData() { /* ... same as before ... */ }
        
    // --- UI & Navigation ---
    function updateTitle(title) { /* ... same as before ... */ }
    bottomNavButtons.forEach(button => {
        button.addEventListener('click', () => {
            // ... same navigation logic ...
            if (button.dataset.tab === 'tabSoChamCong') {
                updateStatistics();
                renderTimesheetLog();
            }
        });
    });

    // --- Calendar ---
    function renderCalendar() { /* ... same as before ... */ }
    calendarDaysElement.addEventListener('click', (event) => {
        const targetCell = event.target.closest('td[data-date]');
        if (!targetCell) return;
        const dateStr = targetCell.dataset.date;
        if (isEditMode) {
            // ... same schedule editing logic ...
        } else {
            // Open modal, passing existing data if available
            openTimesheetModal(dateStr, timesheetEntries[dateStr]);
        }
    });
    function setEditMode(enabled) { /* ... same as before ... */ }

    // --- Timesheet Modal LOGIC (UPDATED) ---
    entryTypeSelect.addEventListener('change', () => {
        overtimeFields.style.display = entryTypeSelect.value === 'work_ot' ? 'block' : 'none';
    });

    function openTimesheetModal(dateStr, existingEntry = null) {
        modalTitleElement.textContent = `Chấm công ${formatDateStr(dateStr)}`;
        timesheetDateInput.value = dateStr;
        document.getElementById('timesheetForm').reset();
        
        if (existingEntry) {
            entryTypeSelect.value = existingEntry.type || 'work';
            notesInput.value = existingEntry.notes || '';
            if (existingEntry.type === 'work_ot') {
                overtimeHoursInput.value = existingEntry.overtimeHours || '';
                overtimeMinutesInput.value = existingEntry.overtimeMinutes || '';
            }
        } else {
            entryTypeSelect.value = 'work'; // Default to normal workday
        }
        
        // Trigger change to show/hide overtime fields correctly
        entryTypeSelect.dispatchEvent(new Event('change'));
        timesheetModal.style.display = 'flex';
    }
    
    timesheetModalConfirmBtn.addEventListener('click', () => {
        const dateStr = timesheetDateInput.value;
        const entryType = entryTypeSelect.value;

        // Delete old entry to clean up old properties
        delete timesheetEntries[dateStr];

        if (entryType) {
            const newEntry = { type: entryType, notes: notesInput.value.trim() };
            if (entryType === 'work_ot') {
                newEntry.overtimeHours = parseInt(overtimeHoursInput.value) || 0;
                newEntry.overtimeMinutes = parseInt(overtimeMinutesInput.value) || 0;
            }
            timesheetEntries[dateStr] = newEntry;
        }
        // If no type is selected (or if we add a "clear" option), the entry is removed.
        
        persistAllData();
        showToast(`Đã lưu chấm công ngày ${formatDateStr(dateStr)}!`);
        timesheetModal.style.display = 'none';
        renderCalendar();
        if (document.getElementById('tabSoChamCong').classList.contains('active')) {
            updateStatistics();
            renderTimesheetLog();
        }
    });

    // --- Action Modal ---
    function openActionConfirmModal(dateStr) {
        // Updated to use the new data structure
        const entry = timesheetEntries[dateStr];
        if (!entry) return; // Should not happen, but a safeguard
        
        actionConfirmModalTitle.textContent = `Ngày ${formatDateStr(dateStr)}`;
        actionConfirmDateInput.value = dateStr;
        actionConfirmModal.style.display = 'flex';
    }
    actionConfirmModalEditBtn.addEventListener('click', () => {
        openTimesheetModal(actionConfirmDateInput.value, timesheetEntries[actionConfirmDateInput.value]);
        actionConfirmModal.style.display = 'none';
    });
    actionConfirmModalDeleteBtn.addEventListener('click', () => {
        delete timesheetEntries[actionConfirmDateInput.value];
        persistAllData();
        showToast(`Đã xoá chấm công.`);
        actionConfirmModal.style.display = 'none';
        renderCalendar();
        if (document.getElementById('tabSoChamCong').classList.contains('active')) {
             updateStatistics();
             renderTimesheetLog();
        }
    });
        
    // --- Statistics & Log (UPDATED) ---
    function updateStatistics() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let scheduledDay = 0, scheduledNight = 0;
        let actualDay = 0, actualNight = 0;
        let paidLeave = 0, unpaidLeave = 0, companyHoliday = 0;
        let totalOvertimeMinutes = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const schedule = scheduleData[dateStr];
            const entry = timesheetEntries[dateStr];

            // 1. Calculate scheduled work days for the month
            if (schedule === 'ca-ngay') scheduledDay++;
            if (schedule === 'ca-dem') scheduledNight++;

            // 2. Calculate stats from logged entries
            if (entry) {
                switch (entry.type) {
                    case 'work':
                    case 'work_ot':
                        if (schedule === 'ca-ngay') actualDay++;
                        if (schedule === 'ca-dem') actualNight++;
                        if (entry.type === 'work_ot') {
                            totalOvertimeMinutes += (entry.overtimeHours || 0) * 60 + (entry.overtimeMinutes || 0);
                        }
                        break;
                    case 'paid_leave':
                        paidLeave++;
                        break;
                    case 'unpaid_leave':
                        unpaidLeave++;
                        break;
                    case 'company_holiday':
                        companyHoliday++;
                        break;
                }
            }
        }
        
        const totalActualWorkDays = actualDay + actualNight;
        const totalWorkHours = totalActualWorkDays * 8; // Assuming 8 hours/day
        const totalOvertimeHours = (totalOvertimeMinutes / 60).toFixed(1);

        // 3. Update DOM
        statsTotalWorkDays.textContent = `${scheduledDay + scheduledNight} ngày (${scheduledDay}S, ${scheduledNight}Đ)`;
        statsActualWorkDays.textContent = `${totalActualWorkDays} ngày (${actualDay}S, ${actualNight}Đ)`;
        statsLeaveDays.textContent = `${paidLeave + unpaidLeave + companyHoliday} ngày (${paidLeave}P, ${unpaidLeave}KL, ${companyHoliday}Cty)`;
        statsTotalHours.textContent = `${totalWorkHours} giờ`;
        statsOvertimeHours.textContent = `${totalOvertimeHours} giờ`;
    }

    function renderTimesheetLog() {
        // ... Log rendering logic remains the same, but now it depends on the new entry types
        // This function doesn't need changes as it just displays what's there.
    }

    // --- Import/Export ---
    // ... import/export functions remain mostly the same ...
    // Make sure they handle the new 'type' property in timesheetEntries

    // --- Event Listeners & Init ---
    // Update month change listeners to refresh stats
    prevMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); updateStatistics(); });
    nextMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); updateStatistics(); });

    // Other event listeners...
    editScheduleBtn.addEventListener('click', () => setEditMode(true));
    saveScheduleBtn.addEventListener('click', () => setEditMode(false));
    firstDaySwitch.addEventListener('change', (e) => { firstDayIsMonday = e.target.checked; persistAllData(); renderCalendar(); });
    
    [timesheetModal, actionConfirmModal].forEach(modal => {
        modal.addEventListener('click', e => { if (e.target === modal) e.target.style.display = 'none'; });
        const cancelBtn = modal.querySelector('.btn-cancel');
        if (cancelBtn) cancelBtn.addEventListener('click', () => modal.style.display = 'none');
    });

    logFilterTypeSelect.addEventListener('change', () => {
        logDateRangePicker.style.display = logFilterTypeSelect.value === 'range' ? 'block' : 'none';
        logMonthPicker.style.display = logFilterTypeSelect.value === 'month' ? 'block' : 'none';
        renderTimesheetLog();
    });
    applyLogFilterBtn.addEventListener('click', renderTimesheetLog);

    // --- Init ---
    loadAllData();
    renderCalendar();
    updateStatistics(); // Initial stats calculation
    updateTitle(document.querySelector('.nav-button.active').dataset.title);
});
