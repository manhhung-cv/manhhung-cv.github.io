// js/main.js
import { initDeviceMode } from './device.js';
import { 
    initSettings, 
    checkFirstLaunchChoice, 
    syncWallpaperDisplay, 
    applyDarkMode, 
    applySystemAccent, 
    isDarkMode 
} from './settings.js';
import { 
    initLauncher, 
    initHomescreenPages, 
    renderDock, 
    applyPureMinimalMode,
    initMinimalSidebarEvents 
} from './launcher.js';
import { initAppManager, showHomescreen, appState } from './app-manager.js';
import { initSpotlight } from './spotlight.js';

// 1. ĐỒNG HỒ HỆ THỐNG GỌN GÀNG (HH:mm)
function startClockTick() {
    const osClock = document.getElementById('os-clock');
    if (!osClock) return;

    const updateTime = () => {
        const d = new Date();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        osClock.textContent = `${hours}:${minutes}`;
    };

    updateTime();
    setInterval(updateTime, 1000);
}

// 2. THEO DÕI PIN THIẾT BỊ
function initBatteryMonitor() {
    const pEl = document.getElementById('battery-percent');
    if (!pEl) return;

    if (navigator.getBattery) {
        navigator.getBattery().then(battery => {
            const updateBat = () => {
                pEl.textContent = `${Math.round(battery.level * 100)}%`;
            };
            updateBat();
            battery.addEventListener('levelchange', updateBat);
        }).catch(() => {});
    }
}

// 3. KHỞI TẠO HỆ THỐNG KHI TẢI TRANG
document.addEventListener('DOMContentLoaded', async () => {
    // A. Khởi tạo màu chủ đạo (Accent) & Dark/Light Mode
    const savedAccent = localStorage.getItem('hunqos_accent_color') || '#10b981';
    applySystemAccent(savedAccent);
    applyDarkMode(isDarkMode);

    // B. Đồng bộ hình nền
    await syncWallpaperDisplay();

    // C. Khởi tạo form factor thiết bị (Phone / Tablet / Desktop)
    initDeviceMode(() => {
        initHomescreenPages();
    });

    // D. Khởi tạo App Manager & Điều khiển Đa nhiệm
    initAppManager({
        onGoHomePage: () => {
            import('./launcher.js').then(m => {
                const targetIdx = m.getTargetHomePageIndex();
                m.goToPage(targetIdx);
            });
        }
    });

    // E. Khởi tạo Launcher & Dock icon
    initLauncher();
    initHomescreenPages();
    renderDock();

    // F. Khởi tạo Cài đặt & Spotlight Search
    initSettings();
    initSpotlight();

    // G. Kích hoạt đồng hồ & theo dõi pin
    startClockTick();
    initBatteryMonitor();

    // H. Áp dụng chế độ trải nghiệm (HunqOS Workspace hoặc Web Portal)
    const isPureMinimal = localStorage.getItem('hunqos_pure_minimal') === 'true';
    applyPureMinimalMode(isPureMinimal);

    // I. Phục hồi màn hình: Nếu không có app nào đang mở thì mới về Homescreen
    const hasRunningApp = appState.activeTabId && appState.activeTabId !== 'home' && appState.activeTabId !== 'tab-1';
    if (!hasRunningApp) {
        showHomescreen();
    }

    // J. Kiểm tra lần đầu truy cập để hiển thị modal chọn trải nghiệm
    checkFirstLaunchChoice();
});