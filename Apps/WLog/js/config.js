// js/config.js

export const firebaseConfig = {
    apiKey: "AIzaSyAZMqF1hkGZ-vZl2Gj9YPAnwGGOiS-ZJ6A",
    authDomain: "sochamcong-hunq.firebaseapp.com",
    projectId: "sochamcong-hunq",
    storageBucket: "sochamcong-hunq.firebasestorage.app",
    messagingSenderId: "85426930976",
    appId: "1:85426930976:web:d98438d8fcf8a050364345"
};

export const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
export const headersGrid = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
export const fullDaysOfWeek = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

export const defaultAppConfig = {
    currency: 'đ',
    cutoffDate: '31',
    workingDays: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
    salaryType: 'thang',
    standardHours: 8,
    standardDays: 26,
    baseSalaryMonth: 0,
    baseSalaryHour: 0,
    otRate: 0,
    holidayRate: 0,
    dailyAllowance: 0,
    monthlyAllowance: 0,
    // --- THÊM MỚI CHO TÍNH NĂNG CA & LỄ ---
    shifts: [
        { id: 'shift_default', name: 'Hành chính', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', affectsSalary: false },
        { id: 'shift_night', name: 'Ca Đêm (+50k)', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400', affectsSalary: true, ruleType: 'allowance', ruleValue: 50000 },
        { id: 'shift_3', name: 'Ca 3 (x1.3)', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400', affectsSalary: true, ruleType: 'multiplier', ruleValue: 1.3 }
    ],
    holidays: [] // Chứa danh sách ngày lễ dạng 'YYYY-MM-DD'
};