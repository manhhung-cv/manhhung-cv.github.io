let currentSchedule = {}; // Lịch làm việc hiện tại cho tháng hiện tại
let primaryColor = localStorage.getItem('primaryColor') || '#28a745'; // Màu chủ đạo
const colorPicker = document.getElementById('colorPicker');
const monthInput = document.getElementById('monthInput'); // Input chọn tháng

// Áp dụng màu chủ đạo từ localStorage khi trang được tải
document.documentElement.style.setProperty('--primary-color', primaryColor); // Áp dụng màu sắc mới cho sáng

// Lắng nghe sự kiện thay đổi màu sắc
colorPicker.addEventListener('input', handleColorChange);

// Tải lịch và bảng khi chọn tháng mới
monthInput.addEventListener('change', loadScheduleFromLocalStorage);

// Tạo lịch cho tháng hiện tại khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
  // Lấy tháng và năm hiện tại
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // Tháng hiện tại (tính từ 0)
  const currentYear = currentDate.getFullYear(); // Năm hiện tại

  // Đặt giá trị cho monthInput
  monthInput.value = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;

  // Tải lịch cho tháng hiện tại
  loadScheduleFromLocalStorage();
});
// Hàm xử lý sự kiện thay đổi màu sắc
function handleColorChange() {
  primaryColor = colorPicker.value; // Cập nhật màu sắc chính
  document.documentElement.style.setProperty('--primary-color', primaryColor); // Áp dụng màu sắc mới cho sáng
  localStorage.setItem('primaryColor', primaryColor); // Lưu màu sắc mới vào localStorage
  updateSummary(); // Cập nhật lại phần thống kê
}


function formatNumber(value) {
  return value.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}


// Hàm lấy khóa tháng hiện tại (dựa trên giá trị tháng đã chọn)
function getMonthKey(monthYear) {
  return monthYear; // Lấy khóa tháng theo kiểu "YYYY-MM"
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
    const dateStr = currentDate.toISOString().split('T')[0];

    const dayElement = createDayElement(day, currentDate, dateStr);
    calendar.appendChild(dayElement);
  }

  updateSummary(); // Cập nhật thống kê
  updateDetailsTable(); // Cập nhật bảng chi tiết
}

// Hàm tạo phần tử ngày
function createDayElement(day, currentDate, dateStr) {
  const dayElement = document.createElement('div');
  dayElement.className = 'day';
  dayElement.innerHTML = `<div class="day-header">${day}</div>`;

  // Thêm class nếu là ngày hôm nay
  if (currentDate.toDateString() === new Date().toDateString()) {
    dayElement.classList.add('today-highlight'); // Thêm class để làm viền màu
  }

  // Xử lý khi click vào ngày
  dayElement.onclick = () => updateSchedule(dateStr, dayElement);

  // Áp dụng trạng thái lịch làm việc nếu có
  if (!currentSchedule[dateStr]) {
    currentSchedule[dateStr] = 'nghi'; // Mặc định là nghỉ
  } else {
    dayElement.classList.add(`shift-${currentSchedule[dateStr]}`);
  }

  return dayElement;
}

// Hàm cập nhật lịch làm việc khi nhấn vào một ngày
function updateSchedule(date, element) {
  let shift = currentSchedule[date];

  // Nếu chưa có lịch làm việc cho ngày đó, mặc định là ca sáng
  if (!shift || shift === 'nghi') {
    shift = 'sang'; // Chuyển từ Nghỉ -> Sáng
  } else if (shift === 'sang') {
    shift = 'toi'; // Chuyển từ Sáng -> Tối
  } else if (shift === 'toi') {
    shift = 'nghi'; // Chuyển từ Tối -> Nghỉ
  } else {
    shift = 'sang'; // Quay lại ca sáng nếu không phải ca sáng, tối, hay nghỉ
  }

  currentSchedule[date] = shift; // Cập nhật lịch làm việc trong đối tượng currentSchedule
  saveScheduleToLocalStorage(); // Lưu lịch vào localStorage

  // Cập nhật giao diện
  element.classList.remove('shift-sang', 'shift-toi', 'shift-nghi'); // Xóa các lớp cũ
  if (shift !== 'nghi') {
    element.classList.add(`shift-${shift}`); // Thêm lớp mới theo ca làm việc
  }

  updateSummary(); // Cập nhật lại phần thống kê
  updateDetailsTable(); // Cập nhật lại bảng chi tiết
}

// Hàm cập nhật phần thống kê
function updateSummary() {
  let shifts = Object.values(currentSchedule);
  let morningCount = shifts.filter(s => s === 'sang').length; // Đếm số ca sáng
  let nightCount = shifts.filter(s => s === 'toi').length; // Đếm số ca tối
  let offCount = shifts.filter(s => s === 'nghi').length; // Đếm số ngày nghỉ

  let totalWorkingDays = morningCount + nightCount; // Tổng số ngày làm việc (ca sáng + ca tối)

  document.getElementById('totalDays').textContent = totalWorkingDays; // Hiển thị tổng số ngày làm việc
  document.getElementById('morningCount').textContent = morningCount + ' ['+(18656*morningCount)+']'; // Hiển thị số ca sáng
  document.getElementById('nightCount').textContent = nightCount + ' ['+(17656*nightCount)+']'; // Hiển thị số ca tối
  document.getElementById('offCount').textContent = offCount; // Hiển thị số ngày nghỉ
  var tongluong = (18656*morningCount)+(17656*nightCount)+10000;
  document.getElementById('LuongTong').innerHTML = formatNumber(tongluong)+' ¥ <br>'+ formatNumber(tongluong*167) + 'đ'; // Hiển thị số ngày nghỉ
  
}

// Hàm cập nhật bảng chi tiết lịch làm việc
function updateDetailsTable() {
  let tableBody = document.getElementById('detailsTableBody');
  tableBody.innerHTML = ''; // Làm sạch bảng chi tiết

  // Sắp xếp ngày theo thứ tự từ 1 đến 31 cho bảng chi tiết
  const sortedDates = Object.keys(currentSchedule).sort((a, b) => new Date(a) - new Date(b));

  sortedDates.forEach(date => {
    // Định dạng ngày theo kiểu dd/mm/yyyy
    const formattedDate = formatDate(date);
    let shiftText = currentSchedule[date] === 'sang' ? 'Sáng' : currentSchedule[date] === 'toi' ? 'Tối' : 'Nghỉ';
    let row = `<tr><td>${formattedDate}</td><td>${new Date(date).toLocaleDateString('vi-VN', { weekday: 'long' })}</td><td>${shiftText}</td></tr>`;
    tableBody.innerHTML += row; // Thêm dòng mới vào bảng
  });
}

// Hàm định dạng ngày theo kiểu dd/mm/yyyy
function formatDate(date) {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0'); // Đảm bảo ngày có 2 chữ số
  const month = (d.getMonth() + 1).toString().padStart(2, '0'); // Đảm bảo tháng có 2 chữ số
  const year = d.getFullYear(); // Năm đầy đủ
  return `${day}/${month}/${year}`; // Trả về định dạng dd/mm/yyyy
}

// Lưu lịch làm việc của tháng vào localStorage
function saveScheduleToLocalStorage() {
  const currentMonthKey = getMonthKey(monthInput.value); // Lấy khóa tháng theo kiểu "YYYY-MM"
  let allSchedules = JSON.parse(localStorage.getItem('allSchedules')) || {}; // Lấy dữ liệu lịch của tất cả các tháng
  allSchedules[currentMonthKey] = currentSchedule; // Lưu lịch của tháng hiện tại
  localStorage.setItem('allSchedules', JSON.stringify(allSchedules)); // Lưu lại toàn bộ lịch vào localStorage
}

// Tải lịch từ localStorage
function loadScheduleFromLocalStorage() {
  const currentMonthKey = getMonthKey(monthInput.value); // Lấy khóa tháng theo kiểu "YYYY-MM"
  let allSchedules = JSON.parse(localStorage.getItem('allSchedules')) || {}; // Lấy dữ liệu lịch của tất cả các tháng

  if (allSchedules[currentMonthKey]) {
    currentSchedule = allSchedules[currentMonthKey]; // Lấy lịch của tháng hiện tại
  } else {
    currentSchedule = {}; // Nếu không có lịch, tạo lịch trống
  }

  const [year, month] = monthInput.value.split('-');
  generateCalendar(parseInt(year), parseInt(month) - 1); // Tạo lại lịch cho tháng hiện tại
}

// Hàm xuất lịch làm việc ra file JSON (bao gồm tất cả các tháng có lịch làm việc)
document.getElementById('exportJsonButton').addEventListener('click', function() {
  const allSchedules = JSON.parse(localStorage.getItem('allSchedules')) || {}; // Lấy tất cả lịch làm việc của các tháng

  // Lưu lịch theo thứ tự ngày trong tháng
  Object.keys(allSchedules).forEach(monthKey => {
    allSchedules[monthKey] = sortScheduleByDay(allSchedules[monthKey]);
  });

  const jsonContent = JSON.stringify(allSchedules, null, 2); // Tạo JSON từ tất cả lịch làm việc

  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'schedules.json'; // Tên tệp xuất ra
  link.click();
  URL.revokeObjectURL(url); // Giải phóng URL đã tạo
});

// Hàm sắp xếp lịch làm việc theo thứ tự ngày trong tháng
function sortScheduleByDay(schedule) {
  const sortedSchedule = {};
  const sortedDates = Object.keys(schedule).sort((a, b) => new Date(a) - new Date(b));

  sortedDates.forEach(date => {
    sortedSchedule[date] = schedule[date];
  });

  return sortedSchedule;
}

// Hàm xem trước JSON
document.getElementById('viewJsonButton').addEventListener('click', function() {
  const jsonPreview = document.getElementById('jsonPreview');
  const allSchedules = JSON.parse(localStorage.getItem('allSchedules')) || {}; // Lấy tất cả lịch làm việc của các tháng

  // Lưu lịch theo thứ tự ngày trong tháng
  Object.keys(allSchedules).forEach(monthKey => {
    allSchedules[monthKey] = sortScheduleByDay(allSchedules[monthKey]);
  });

  const jsonContent = JSON.stringify(allSchedules, null, 2); // Tạo JSON từ tất cả lịch làm việc
  jsonPreview.textContent = jsonContent; // Hiển thị JSON vào phần tử
});

