let selectedDate = null;

let currentSchedule = {}; // Lịch làm việc hiện tại cho tháng hiện tại
let primaryColor = localStorage.getItem('primaryColor') || '#28a745'; // Màu chủ đạo
let currentMonth = new Date(); // Tháng hiện tại
let isEditMode = false; // Trạng thái chỉnh sửa

const colorPicker = document.getElementById('colorPicker');
const toggleEditBtn = document.getElementById('toggleEditMode');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const currentMonthDisplay = document.getElementById('currentMonthDisplay');

// Áp dụng màu chủ đạo từ localStorage khi trang được tải
document.documentElement.style.setProperty('--primary-color', primaryColor);

// Lắng nghe sự kiện thay đổi màu sắc
colorPicker.addEventListener('input', function() {
  primaryColor = colorPicker.value;
  document.documentElement.style.setProperty('--primary-color', primaryColor);
  localStorage.setItem('primaryColor', primaryColor);
  updateSummary();
});



// Cập nhật hiển thị tháng
function updateMonthDisplay() {
  const month = currentMonth.getMonth() + 1; // getMonth() trả về giá trị từ 0 đến 11
  const year = currentMonth.getFullYear(); // lấy năm
  const formattedMonthYear = `${month}/${year}`; // định dạng lại thành "1/2025"
  
  currentMonthDisplay.textContent = formattedMonthYear; // cập nhật nội dung
  loadScheduleFromLocalStorage(); // giữ lại hàm này nếu cần thiết
}


// Xử lý nút chuyển tháng
prevMonthBtn.addEventListener('click', () => {
  currentMonth.setMonth(currentMonth.getMonth() - 1);
  updateMonthDisplay();
});

nextMonthBtn.addEventListener('click', () => {
  currentMonth.setMonth(currentMonth.getMonth() + 1);
  updateMonthDisplay();
});

// Cho phép chọn tháng thủ công
currentMonthDisplay.addEventListener('click', () => {
  const newMonth = prompt('Nhập tháng (YYYY-MM):', currentMonth.toISOString().slice(0, 7));
  if (newMonth) {
    currentMonth = new Date(newMonth + '-01');
    updateMonthDisplay();
  }
});

// Xử lý chế độ chỉnh sửa
toggleEditBtn.addEventListener('click', () => {
  isEditMode = !isEditMode;
  toggleEditBtn.innerHTML = isEditMode ? '<i class="fa-regular fa-circle-check"></i>' : '<i class="fas fa-edit"></i>';
  if (!isEditMode) saveScheduleToLocalStorage();
});

// Hàm lấy khóa tháng hiện tại (dựa trên giá trị tháng đã chọn)
function getMonthKey() {
  return currentMonth.toISOString().slice(0, 7); // Lấy khóa tháng theo kiểu "YYYY-MM"
}

// Hàm tạo lịch cho tháng đã chọn
function generateCalendar(year, month) {
  const calendar = document.getElementById('calendar');
  calendar.innerHTML = ''; // Xóa nội dung cũ

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0 (CN) -> 6 (T7)

  const weekdays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  // Thêm hàng tiêu đề cho các ngày trong tuần
  weekdays.forEach(day => {
    const header = document.createElement('div');
    header.className = 'day-header';
    header.textContent = day;
    calendar.appendChild(header);
  });

  // Chuyển đổi firstDay (0: CN -> 6: T7) thành offset cho lịch bắt đầu từ T2
  let startOffset = firstDay === 0 ? 6 : firstDay - 1; // CN (0) -> 6, T2 (1) -> 0, T3 (2) -> 1,...

  // Thêm các ô trống trước ngày đầu tiên để căn chỉnh
  for (let i = 0; i < startOffset; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'day empty'; // Ô trống
    calendar.appendChild(emptyCell);
  }

  // Thêm từng ngày trong tháng
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    const dateStr = new Date(year, month, day + 1).toISOString().split('T')[0];  // Đảm bảo ngày được lấy đúng
    
    currentSchedule[dateStr] = currentSchedule[dateStr] || {
      shift: 'nghi',
      overtimeHours: 0,
      overtimeMinutes: 0,
      confirmed: false
    };

    const dayElement = document.createElement('div');
    dayElement.className = 'day';
    dayElement.innerHTML = `<div class="day-header">${day}</div>`;

    // Thêm class nếu là ngày hôm nay
    if (currentDate.toDateString() === new Date().toDateString()) {
      dayElement.classList.add('today-highlight');
    }

    // Thêm class tương ứng với ca làm việc
    if (currentSchedule[dateStr].shift === 'sang') {
      dayElement.classList.add('shift-sang');
    } else if (currentSchedule[dateStr].shift === 'toi') {
      dayElement.classList.add('shift-toi');
    } else {
      dayElement.classList.add('shift-nghi');
    }

    // Xử lý khi click vào ngày
    dayElement.onclick = () => updateSchedule(dateStr, dayElement);

    // Áp dụng trạng thái lịch làm việc nếu có
    if (currentSchedule[dateStr].confirmed) {
      const overtimeHours = currentSchedule[dateStr].overtimeHours || 0;
      const overtimeMinutes = currentSchedule[dateStr].overtimeMinutes || 0;
      const totalOvertime = overtimeHours + (overtimeMinutes / 60);

      if (totalOvertime === 0) {
        dayElement.innerHTML += '<div class="checkmark">✓</div>';
      } else {
        dayElement.innerHTML += `<div class="overtime-display">${totalOvertime.toFixed(2)}</div>`;
      }
    }
    calendar.appendChild(dayElement);
  }

  updateSummary();
  updateDetailsTable();
}

function updateHistory() {
  const historyContent = document.getElementById('historyContent');
  historyContent.innerHTML = '';

  const sortedDates = Object.keys(currentSchedule)
    .filter(date => currentSchedule[date].confirmed)
    .sort((a, b) => new Date(b) - new Date(a)); // Sắp xếp từ mới nhất đến cũ nhất

  sortedDates.forEach(date => {
    const shiftText = currentSchedule[date].shift === 'sang' ? 'Sáng' : currentSchedule[date].shift === 'toi' ? 'Tối' : 'Nghỉ';
    const overtimeHours = currentSchedule[date].overtimeHours || 0;
    const overtimeMinutes = currentSchedule[date].overtimeMinutes || 0;
    const totalOvertime = overtimeHours + (overtimeMinutes / 60);

    const entry = document.createElement('div');
    entry.className = 'history-entry';
    entry.textContent = `${formatDate(date)} - ${shiftText} - Tăng ca: ${totalOvertime.toFixed(2)}h`;
    historyContent.appendChild(entry);
  });
}

function deleteOvertime() {
  if (selectedDate) {
    currentSchedule[selectedDate] = {
      ...currentSchedule[selectedDate],
      overtimeHours: 0,
      overtimeMinutes: 0,
      confirmed: false
    };
    saveScheduleToLocalStorage();
    updateSummary();
    updateHistory();
    loadScheduleFromLocalStorage(); // Refresh calendar
    closePopup();
  }
}

// Hàm cập nhật lịch làm việc khi nhấn vào một ngày
function updateSchedule(date, element) {
  if (!isEditMode) {
    selectedDate = date; // Đảm bảo selectedDate được cập nhật đúng
    document.getElementById('overtimeHours').value = currentSchedule[date]?.overtimeHours || 0;
    document.getElementById('overtimeMinutes').value = currentSchedule[date]?.overtimeMinutes || 0;
    document.getElementById('overtimePopup').style.display = 'flex';
    return;
  }

  // Chỉ cập nhật ca làm việc nếu đang ở chế độ chỉnh sửa ca
  if (isEditMode) {
    let shift = currentSchedule[date]?.shift || 'nghi';
    if (shift === 'nghi') {
      shift = 'sang';
    } else if (shift === 'sang') {
      shift = 'toi';
    } else if (shift === 'toi') {
      shift = 'nghi';
    }

    // Lưu thay đổi ca làm việc
    currentSchedule[date] = { ...currentSchedule[date], shift };
    saveScheduleToLocalStorage();

    // Cập nhật class nhưng giữ nguyên thông tin tăng ca
    element.classList.remove('shift-sang', 'shift-toi', 'shift-nghi');
    if (shift !== 'nghi') {
      element.classList.add(`shift-${shift}`);
    }
  }

  // Chỉ cập nhật bảng tóm tắt & chi tiết nếu chỉnh sửa ca
  if (isEditMode) {
    updateSummary();
    updateDetailsTable();
  }
}

function displayAllData() {
  const settings = JSON.parse(localStorage.getItem('salarySettings')) || {};
  const schedule = JSON.parse(localStorage.getItem('allSchedules')) || {};

  const data = {
    settings,
    schedule
  };

  document.getElementById('dataPreview').textContent = JSON.stringify(data, null, 2);
}

function loadSettings() {
  const settings = JSON.parse(localStorage.getItem('salarySettings')) || {
    basicHourlyRate: 0,
    basicWorkingHours: 0,
    overtimeHourlyRate: 0,
    allowance: 0,
  };

  document.getElementById('basicHourlyRate').value = settings.basicHourlyRate;
  document.getElementById('basicWorkingHours').value = settings.basicWorkingHours;
  document.getElementById('overtimeHourlyRate').value = settings.overtimeHourlyRate;
  document.getElementById('allowance').value = settings.allowance;

  calculateSalary(); // Tính toán lương khi tải trang
}

function saveSettings() {
  const settings = {
    basicHourlyRate: parseFloat(document.getElementById('basicHourlyRate').value) || 0,
    basicWorkingHours: parseFloat(document.getElementById('basicWorkingHours').value) || 0,
    overtimeHourlyRate: parseFloat(document.getElementById('overtimeHourlyRate').value) || 0,
    allowance: parseFloat(document.getElementById('allowance').value) || 0,
  };
  localStorage.setItem('salarySettings', JSON.stringify(settings));
  calculateSalary(); // Tự động tính toán lương khi thông số thay đổi
  displayAllData(); // Hiển thị toàn bộ dữ liệu sau khi lưu
}

function confirmOvertime() {
  const hours = parseInt(document.getElementById('overtimeHours').value) || 0;
  const minutes = parseInt(document.getElementById('overtimeMinutes').value) || 0;

  currentSchedule[selectedDate] = {
    ...currentSchedule[selectedDate],
    overtimeHours: hours,
    overtimeMinutes: minutes,
    confirmed: true
  };

  document.getElementById('overtimePopup').style.display = 'none';
  saveScheduleToLocalStorage();
  updateSummary();
  updateHistory(); // Đảm bảo lịch sử được cập nhật sau khi xác nhận
  loadScheduleFromLocalStorage(); // Refresh calendar
}

function closePopup() {
  document.getElementById('overtimePopup').style.display = 'none';
}
// Hàm cập nhật phần thống kê
function updateSummary() {
  let morningCount = 0;
  let nightCount = 0;
  let workingDays = 0;
  let totalOvertimeHours = 0;
  let totalOvertimeMinutes = 0;
  let totalMorningOvertime = 0; // Tổng giờ tăng ca sáng
  let totalNightOvertime = 0; // Tổng giờ tăng ca tối

  Object.values(currentSchedule).forEach(entry => {
    if (entry.shift === 'sang') {
      morningCount++;
      if (entry.confirmed) {
        totalMorningOvertime += entry.overtimeHours + (entry.overtimeMinutes / 60);
      }
    }
    if (entry.shift === 'toi') {
      nightCount++;
      if (entry.confirmed) {
        totalNightOvertime += entry.overtimeHours + (entry.overtimeMinutes / 60);
      }
    }
    if (entry.confirmed) {
      workingDays++;
    }
    totalOvertimeHours += entry.overtimeHours || 0;
    totalOvertimeMinutes += entry.overtimeMinutes || 0;
  });

  // Chuyển đổi phút thành giờ
  totalOvertimeHours += Math.floor(totalOvertimeMinutes / 60);
  totalOvertimeMinutes = totalOvertimeMinutes % 60;

  // Cập nhật giao diện
  document.getElementById('totalDays').textContent = morningCount + nightCount;
  document.getElementById('morningCount').textContent = morningCount;
  document.getElementById('nightCount').textContent = nightCount;
  document.getElementById('offCount').textContent = Object.values(currentSchedule).filter(e => e.shift === 'nghi').length;
  document.getElementById('totalDaysWork').innerText = workingDays;
  document.getElementById('totalOvertimeHours').innerText = `${totalOvertimeHours}h ${totalOvertimeMinutes}m`;
  document.getElementById('totalMorningOvertime').innerText = totalMorningOvertime.toFixed(2) + 'h';
document.getElementById('totalNightOvertime').innerText = totalNightOvertime.toFixed(2)+ 'h';
  
  
  
  
}

// Hàm cập nhật bảng chi tiết lịch làm việc
function updateDetailsTable() {
  let tableBody = document.getElementById('detailsTableBody');
  tableBody.innerHTML = '';

  const sortedDates = Object.keys(currentSchedule).sort((a, b) => new Date(a) - new Date(b));

  sortedDates.forEach(date => {
    const formattedDate = formatDate(date);
    let shiftText = currentSchedule[date].shift === 'sang' ? 'Sáng' : currentSchedule[date].shift === 'toi' ? 'Tối' : 'Nghỉ';
    let overtimeText = currentSchedule[date].overtimeHours || currentSchedule[date].overtimeMinutes ? ` (Tăng ca: ${currentSchedule[date].overtimeHours}h ${currentSchedule[date].overtimeMinutes}m)` : '';
    let row = `<tr><td>${formattedDate}</td><td>${new Date(date).toLocaleDateString('vi-VN', { weekday: 'long' })}</td><td>${shiftText}${overtimeText}</td></tr>`;
    tableBody.innerHTML += row;
  });
}

// Hàm định dạng ngày theo kiểu dd/mm/yyyy
function formatDate(date) {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// Lưu lịch làm việc của tháng vào localStorage
function saveScheduleToLocalStorage() {
  const currentMonthKey = getMonthKey();
  let allSchedules = JSON.parse(localStorage.getItem('allSchedules')) || {};
  allSchedules[currentMonthKey] = currentSchedule;
  localStorage.setItem('allSchedules', JSON.stringify(allSchedules));
}

// Tải lịch từ localStorage
function loadScheduleFromLocalStorage() {
  const currentMonthKey = getMonthKey();
  let allSchedules = JSON.parse(localStorage.getItem('allSchedules')) || {};

  if (allSchedules[currentMonthKey]) {
    currentSchedule = allSchedules[currentMonthKey];
  } else {
    currentSchedule = {};
  }

  generateCalendar(currentMonth.getFullYear(), currentMonth.getMonth());
}

// Nhập JSON
document.getElementById('importJsonButton').addEventListener('click', function() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json';

  fileInput.onchange = function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
      try {
        const data = JSON.parse(e.target.result);
        localStorage.setItem('allSchedules', JSON.stringify(data));
        loadScheduleFromLocalStorage();
        alert('Nhập dữ liệu thành công!');
      } catch (error) {
        alert('File JSON không hợp lệ!');
      }
    };

    reader.readAsText(file);
  };

  fileInput.click();
});

// Xuất JSON (đơn giản hóa)
document.getElementById('exportJsonButton').addEventListener('click', function() {
  const allSchedules = JSON.parse(localStorage.getItem('allSchedules')) || {};
  const simplifiedSchedules = {};

  Object.keys(allSchedules).forEach(monthKey => {
    simplifiedSchedules[monthKey] = {};
    Object.keys(allSchedules[monthKey]).forEach(date => {
      simplifiedSchedules[monthKey][date] = {
        shift: allSchedules[monthKey][date].shift,
        overtimeHours: allSchedules[monthKey][date].overtimeHours || 0,
        overtimeMinutes: allSchedules[monthKey][date].overtimeMinutes || 0
      };
    });
  });

  const jsonContent = JSON.stringify(simplifiedSchedules, null, 2);

  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'schedules.json';
  link.click();
  URL.revokeObjectURL(url);
});

// Xem trước JSON
document.getElementById('viewJsonButton').addEventListener('click', function() {
  const jsonPreview = document.getElementById('jsonPreview');
  const allSchedules = JSON.parse(localStorage.getItem('allSchedules')) || {};
  const jsonContent = JSON.stringify(allSchedules, null, 2);
  jsonPreview.textContent = jsonContent;
});

function formatNumber(number) {
  return Math.round(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function calculateSalary() {
  const settings = JSON.parse(localStorage.getItem('salarySettings')) || {
    basicHourlyRate: 0,
    basicWorkingHours: 0,
    overtimeHourlyRate: 0,
    allowance: 0,
  };

  const basicHourlyRate = settings.basicHourlyRate;
  const basicWorkingHours = settings.basicWorkingHours;
  const overtimeHourlyRate = settings.overtimeHourlyRate;
  const allowance = settings.allowance;

  // Lấy dữ liệu từ lịch
  let morningCount = 0;
  let nightCount = 0;
  let totalMorningOvertime = 0;
  let totalNightOvertime = 0;
  let holidayWorkCount = 0; // Số ngày nghỉ đã đi làm

  Object.values(currentSchedule).forEach(entry => {
    if (entry.shift === 'sang' && entry.confirmed) {
      morningCount++;
      totalMorningOvertime += entry.overtimeHours + (entry.overtimeMinutes / 60);
    }
    if (entry.shift === 'toi' && entry.confirmed) {
      nightCount++;
      totalNightOvertime += entry.overtimeHours + (entry.overtimeMinutes / 60);
    }
    if (entry.shift === 'nghi' && entry.confirmed) {
      holidayWorkCount++;
      totalMorningOvertime += entry.overtimeHours + (entry.overtimeMinutes / 60);
    }
  });

  // Tính toán lương
  const totalMorningSalary = (basicHourlyRate * basicWorkingHours * morningCount) + (overtimeHourlyRate * totalMorningOvertime);
  const totalNightSalary = (basicHourlyRate * basicWorkingHours * nightCount) + (overtimeHourlyRate * totalNightOvertime);
  const totalBasicSalary = basicHourlyRate * basicWorkingHours * (morningCount + nightCount);
  const totalSalary = totalMorningSalary + totalNightSalary + allowance;

  // Hiển thị kết quả (làm tròn và thêm dấu chấm)
  document.getElementById('totalMorningSalary').textContent = formatNumber(totalMorningSalary);
  document.getElementById('totalNightSalary').textContent = formatNumber(totalNightSalary);
  document.getElementById('totalBasicSalary').textContent = formatNumber(totalBasicSalary);
  document.getElementById('totalSalary').textContent = formatNumber(totalSalary);
  document.getElementById('holidayWorkCount').textContent = holidayWorkCount; // Hiển thị số ngày nghỉ đã đi làm
}


// Khởi tạo khi trang tải xong
document.addEventListener('DOMContentLoaded', function() {
  updateMonthDisplay();
  loadSettings(); // Tải thông số từ localStorage
  displayAllData(); // Hiển thị toàn bộ dữ liệu khi trang được tải
});

// Tab navigation
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', function() {
    // Remove active class from all
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to selected
    this.classList.add('active');
    const tabId = this.dataset.tab;
    document.getElementById(tabId).classList.add('active');
  });
});

// Dark Mode
const darkModeToggle = document.getElementById('darkModeToggle');
const isDarkMode = localStorage.getItem('darkMode') === 'true';

// Initialize dark mode
if (isDarkMode) {
  document.body.classList.add('dark-mode');
  darkModeToggle.checked = true;
}

darkModeToggle.addEventListener('change', function() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', this.checked);
});

// Responsive adjustment for bottom nav


document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', function() {
    // Xóa class active từ tất cả các item
    document.querySelectorAll('.nav-item').forEach(navItem => {
      navItem.classList.remove('active');
    });

    // Thêm class active cho item được click
    this.classList.add('active');
  });
});

function updateIndicator(element) {
  const indicator = document.querySelector('.active-indicator');
  if (!indicator) return; // Kiểm tra nếu indicator không tồn tại

  const nav = document.querySelector('.bottom-nav');
  if (!nav) return; // Kiểm tra nếu .bottom-nav không tồn tại

  // Lấy vị trí và kích thước của nav và item
  const navRect = nav.getBoundingClientRect();
  const itemRect = element.getBoundingClientRect();

  // Tính toán vị trí left của indicator
  const leftPosition = itemRect.left - navRect.left;

  // Lấy chiều rộng của item
  const itemWidth = itemRect.width;

  // Cập nhật vị trí và kích thước của indicator
  indicator.style.left = `${leftPosition}px`;
  indicator.style.width = `${itemWidth}px`;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const activeItem = document.querySelector('.nav-item.active');
  if (activeItem) updateIndicator(activeItem);
});

// Handle clicks
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', function() {
    // Xóa class active từ tất cả các item
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));

    // Thêm class active cho item được click
    this.classList.add('active');

    // Cập nhật indicator
    updateIndicator(this);
  });
});

// Handle window resize
window.addEventListener('resize', () => {
  const activeItem = document.querySelector('.nav-item.active');
  updateIndicator(activeItem);
});


