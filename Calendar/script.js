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
  calculateSalary();
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
    const dateStr = new Date(year, month, day + 1).toISOString().split('T')[0]; // Đảm bảo ngày được lấy đúng

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

  calculateSalary();
  updateSummary();
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
    calculateSalary();
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

    calculateSalary();
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
    calculateSalary();
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
    jpytovnd: 0,
  };


  document.getElementById('basicHourlyRate').value = settings.basicHourlyRate;
  document.getElementById('basicWorkingHours').value = settings.basicWorkingHours;
  document.getElementById('overtimeHourlyRate').value = settings.overtimeHourlyRate;
  document.getElementById('allowance').value = settings.allowance;
  document.getElementById('jpytovnd').value = settings.jpytovnd;


  calculateSalary();
}


function saveSettings() {
  const settings = {
    basicHourlyRate: parseFloat(document.getElementById('basicHourlyRate').value) || 0,
    basicWorkingHours: parseFloat(document.getElementById('basicWorkingHours').value) || 0,
    overtimeHourlyRate: parseFloat(document.getElementById('overtimeHourlyRate').value) || 0,
    allowance: parseFloat(document.getElementById('allowance').value) || 0,
    jpytovnd: parseFloat(document.getElementById('jpytovnd').value) || 0,
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
  calculateSalary();
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
  let totalMorningOvertime = 0;
  let totalNightOvertime = 0;

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
  document.getElementById('totalOvertimeHours').innerText = `${totalOvertimeHours}h${totalOvertimeMinutes}m`;
  document.getElementById('totalMorningOvertime').innerText = totalMorningOvertime.toFixed(2) + 'h';
  document.getElementById('totalNightOvertime').innerText = totalNightOvertime.toFixed(2) + 'h';

  // Trả về một đối tượng với các biến
  return {
    morningCount,
    nightCount,
    workingDays,
    totalOvertimeHours,
    totalOvertimeMinutes,
    totalMorningOvertime,
    totalNightOvertime
  };
}


// Hàm định dạng ngày theo kiểu dd/mm/yyyy
function formatDate(date) {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// Hàm lưu lịch làm việc vào localStorage
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

function formatNumber(number) {
  return Math.round(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function calculateSalary() {
  const summary = updateSummary();
  let DaysWork = summary.nightCount + summary.morningCount;

  const settings = JSON.parse(localStorage.getItem('salarySettings')) || {
    basicHourlyRate: 0,
    basicWorkingHours: 0,
    overtimeHourlyRate: 0,
    allowance: 0,
    jpytovnd: 0,
  };


  const { basicHourlyRate, basicWorkingHours, overtimeHourlyRate, allowance } = settings;

  // Lấy dữ liệu từ lịch
  let morningCount = 0;
  let nightCount = 0;
  let totalMorningOvertime = 0;
  let totalNightOvertime = 0;
  let totalHolidayOvertime = 0;
  let holidayWorkCount = 0; // Số ngày nghỉ đã đi làm

  if (typeof currentSchedule !== "undefined") {
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
        totalHolidayOvertime += entry.overtimeHours + (entry.overtimeMinutes / 60);
      }
    });
  }

  // Tính toán lương
  const morningSalary = {
    total: (basicHourlyRate * basicWorkingHours * morningCount) + (overtimeHourlyRate * totalMorningOvertime),
    overtime: overtimeHourlyRate * totalMorningOvertime,
    normal: (basicHourlyRate * basicWorkingHours * morningCount)
  };

  const nightSalary = {
    total: (basicHourlyRate * basicWorkingHours * nightCount) + (overtimeHourlyRate * totalNightOvertime),
    overtime: overtimeHourlyRate * totalNightOvertime,
    normal: (basicHourlyRate * basicWorkingHours * nightCount)
  };

  const holidaySalary = {
    total: (overtimeHourlyRate * basicWorkingHours * holidayWorkCount) + (overtimeHourlyRate * totalHolidayOvertime),
    overtime: overtimeHourlyRate * totalHolidayOvertime,
    normal: (overtimeHourlyRate * basicWorkingHours * holidayWorkCount)
  };


  const totalBasicSalary = basicHourlyRate * basicWorkingHours * (morningCount + nightCount);

  const totalSalary = morningSalary.total + nightSalary.total + holidaySalary.overtime + ((allowance / DaysWork) * (morningCount + nightCount));

  const totalSalarySub = totalSalary * settings.jpytovnd;

  const totalSalaryMonth = ((basicHourlyRate * basicWorkingHours) * DaysWork) +
    (overtimeHourlyRate * 2 * summary.morningCount) +
    (overtimeHourlyRate * summary.nightCount) +
    allowance;

  const totalSalaryMonthSub = totalSalaryMonth * settings.jpytovnd

  // Hiển thị kết quả
  document.getElementById('totalMorningSalary').textContent = formatNumber(morningSalary.total);
  document.getElementById('totalMorningSalarySub').textContent = `[${morningCount} ngày] ${formatNumber(morningSalary.normal)} + ${formatNumber(morningSalary.overtime)}`;

  document.getElementById('totalNightSalary').textContent = formatNumber(nightSalary.total);
  document.getElementById('totalNightSalarySub').textContent = `[${nightCount} ngày] ${formatNumber(nightSalary.normal)} + ${formatNumber(nightSalary.overtime)}`;

  document.getElementById('totalHolidaySalary').textContent = formatNumber(holidaySalary.overtime);
  document.getElementById('totalHolidaySalarySub').textContent = `[${holidayWorkCount} ngày] ${formatNumber(holidaySalary.overtime)}`;

  document.getElementById('totalBasicSalary').textContent = formatNumber(totalBasicSalary);
  document.getElementById('totalBasicSalarySub').textContent = `[${morningCount + nightCount} ngày] ${formatNumber(morningSalary.normal)} + ${formatNumber(nightSalary.normal)}`;

  document.getElementById('totalSalary').textContent = formatNumber(totalSalary);

  document.getElementById('totalSalarySub').textContent = formatNumber(totalSalarySub) + 'đ';



  document.getElementById('TotalAllowance').textContent = formatNumber((allowance / DaysWork) * (morningCount + nightCount));

  document.getElementById('allowanceSub').textContent = `${formatNumber(allowance)}/tháng`;

  document.getElementById('totalSalaryMonth').textContent = formatNumber(totalSalaryMonth);

  document.getElementById('totalSalaryMonthSub').textContent = formatNumber(totalSalaryMonthSub) + 'đ';


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


function JPYtoVND() {
  const api = "https://api.exchangerate-api.com/v4/latest/JPY"; // API lấy tỷ giá
  const jpytovndInput = document.getElementById("jpytovnd"); // Input nơi hiển thị kết quả

  fetch(api)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      const jpyToVndRate = data.rates['VND']; // Lấy tỷ giá JPY sang VND
      const result = (1 * jpyToVndRate).toFixed(2); // Chuyển đổi 1 JPY

      jpytovndInput.value = result; // Hiển thị kết quả trong input

    })
    .catch(error => {
      console.error('Error fetching currency data:', error);
      jpytovndInput.value = ""; // Xóa giá trị trong input khi lỗi
      jpyrateDisplay.textContent = "Không thể lấy dữ liệu tỷ giá hối đoái. Vui lòng thử lại sau."; // Thông báo lỗi
    });
}

function showDeleteConfirmation() {
  document.getElementById('deleteModal').style.display = 'block';
}

function cancelDelete() {
  document.getElementById('deleteModal').style.display = 'none';
}

function confirmDelete() {
  // Xóa tất cả dữ liệu từ localStorage
  localStorage.clear();

  // Đặt lại các giá trị input về mặc định
  document.getElementById('basicHourlyRate').value = '';
  document.getElementById('basicWorkingHours').value = '';
  document.getElementById('overtimeHourlyRate').value = '';
  document.getElementById('allowance').value = '';
  document.getElementById('jpytovnd').value = '';

  // Ẩn modal
  document.getElementById('deleteModal').style.display = 'none';

  // Hiển thị thông báo thành công (tùy chọn)
  alert('Đã xóa tất cả dữ liệu thành công!');
}

// Đóng modal khi click bên ngoài
window.onclick = function(event) {
  const modal = document.getElementById('deleteModal');
  if (event.target == modal) {
    modal.style.display = 'none';
  }
}


function displayLocalStorage() {
  // Lấy element để hiển thị
  const localDiv = document.getElementById('Local');

  // Lấy dữ liệu từ localStorage
  const settings = JSON.parse(localStorage.getItem('salarySettings')) || {};

  // Tạo HTML để hiển thị
  let html = '<h3>Local Storage Data:</h3>';
  html += '<table border="1">';
  html += '<tr><th>Key</th><th>Value</th></tr>';

  // Thêm từng dòng dữ liệu
  for (const [key, value] of Object.entries(settings)) {
    html += `<tr>
            <td>$
{key}</td>
            <td>
${value}</td>
        </tr>`;
  }

  html += '</table>';

  // Hiển thị ra div
  localDiv.innerHTML = html;
}

// Có thể gọi function này khi cần hiển thị
// Ví dụ: sau khi load settings hoặc sau khi save settings
// displayLocalStorage();


function exportData() {
    // Tạo object chứa toàn bộ dữ liệu
    const exportObject = {
        salarySettings: JSON.parse(localStorage.getItem('salarySettings') || '{}'),
        scheduleData: JSON.parse(localStorage.getItem('currentSchedule') || '{}'),
        lastUpdated: new Date().toISOString()
    }

    // Tạo file Blob và trigger download
    const blob = new Blob([JSON.stringify(exportObject, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `salary_data_${new Date().toLocaleDateString('vi-VN')}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
}

function importData(event) {
    const file = event.target.files[0];
    
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Validate data structure
            if (importedData.salarySettings && importedData.scheduleData) {
                localStorage.setItem('salarySettings', JSON.stringify(importedData.salarySettings));
                localStorage.setItem('currentSchedule', JSON.stringify(importedData.scheduleData));
                
                // Refresh UI
                loadSettings();
                loadScheduleFromLocalStorage();
                displayAllData();
                alert('Nhập dữ liệu thành công!');
            } else {
                alert('File không đúng định dạng!');
            }
        } catch (error) {
            alert('Lỗi đọc file: ' + error.message);
        }
    };
    reader.readAsText(file);
}
function confirmImport() {
    if (confirm('Bạn có chắc muốn ghi đè dữ liệu hiện tại?')) {
        document.getElementById('importFile').click();
    }
}
