// asset/sleep-calculator.js
document.addEventListener('DOMContentLoaded', () => {
    const sleepTool = document.getElementById('sleep-calculator');
    if (!sleepTool) return;

    // --- DOM Elements ---
    const wakeUpTimeInput = sleepTool.querySelector('#wake-up-time-input');
    const calculateBedtimeBtn = sleepTool.querySelector('#calculate-bedtime-btn');
    const bedtimeResults = sleepTool.querySelector('#bedtime-results');
    const bedtimeOptions = sleepTool.querySelector('#bedtime-options');

    // Các element mới
    const bedTimeInput = sleepTool.querySelector('#bed-time-input');
    const getCurrentTimeBtn = sleepTool.querySelector('#get-current-time-btn');
    const calculateWakeupBtn = sleepTool.querySelector('#calculate-wakeup-btn');
    const wakeupResults = sleepTool.querySelector('#wakeup-results');
    const wakeupOptions = sleepTool.querySelector('#wakeup-options');

    const CYCLE_LENGTH = 90; // 90 phút mỗi chu kỳ ngủ
    const FALL_ASLEEP_TIME = 15; // 15 phút để chìm vào giấc ngủ

    // --- Functions ---
    const formatTime = (date) => {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const createTimeOption = (time, cycles) => {
        return `
            <div class="time-option">
                <div class="time">${time}</div>
                <div class="cycles">${cycles} chu kỳ</div>
            </div>
        `;
    };

    const setInputTime = (inputElement, date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        inputElement.value = `${hours}:${minutes}`;
    };

    // --- Event Listeners ---
    calculateBedtimeBtn.addEventListener('click', () => {
        const [hours, minutes] = wakeUpTimeInput.value.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) return;

        const wakeUpDate = new Date();
        wakeUpDate.setHours(hours, minutes, 0, 0);

        bedtimeOptions.innerHTML = '';
        // Hiển thị từ 6 chu kỳ (tốt nhất) đến 3 chu kỳ
        for (let i = 6; i >= 3; i--) {
            const bedtime = new Date(wakeUpDate.getTime() - (i * CYCLE_LENGTH + FALL_ASLEEP_TIME) * 60000);
            bedtimeOptions.innerHTML += createTimeOption(formatTime(bedtime), i);
        }
        bedtimeResults.classList.remove('hidden');
    });

    // --- LOGIC MỚI ---
    getCurrentTimeBtn.addEventListener('click', () => {
        setInputTime(bedTimeInput, new Date());
    });

    calculateWakeupBtn.addEventListener('click', () => {
        const [hours, minutes] = bedTimeInput.value.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) {
            // Sử dụng hàm showToast toàn cục nếu có
            if (typeof showToast === 'function') {
                showToast('warning', 'Vui lòng chọn giờ đi ngủ.');
            } else {
                alert('Vui lòng chọn giờ đi ngủ.');
            }
            return;
        }

        const bedtime = new Date();
        bedtime.setHours(hours, minutes, 0, 0);

        // Cộng thêm thời gian để chìm vào giấc ngủ
        const fallAsleepDate = new Date(bedtime.getTime() + FALL_ASLEEP_TIME * 60000);

        wakeupOptions.innerHTML = '';
        // Tính các mốc thức dậy tối ưu (từ 3 đến 6 chu kỳ)
        for (let i = 3; i <= 6; i++) {
            const wakeupTime = new Date(fallAsleepDate.getTime() + (i * CYCLE_LENGTH) * 60000);
            wakeupOptions.innerHTML += createTimeOption(formatTime(wakeupTime), i);
        }
        wakeupResults.classList.remove('hidden');
    });

    // --- KHỞI TẠO ---
    // Đặt giá trị mặc định cho cả hai trường nhập thời gian
    const now = new Date();
    setInputTime(bedTimeInput, now); // Đặt giờ đi ngủ mặc định là giờ hiện tại

    const defaultWakeUp = new Date(now.getTime() + 8 * 60 * 60000); // Đặt giờ thức dậy mặc định là 8 tiếng sau
    setInputTime(wakeUpTimeInput, defaultWakeUp);
});