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
import { initAppManager, showHomescreen } from './app-manager.js';
import { initSpotlight } from './spotlight.js';

function startClockTick() {
    const osClock = document.getElementById('os-clock');
    const updateTime = () => {
        const d = new Date();
        const str = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        if (osClock) osClock.textContent = str;
    };
    updateTime();
    setInterval(updateTime, 1000);
}

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

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Khởi tạo accent & dark mode
    const savedAccent = localStorage.getItem('hunqos_accent_color') || '#10b981';
    applySystemAccent(savedAccent);
    applyDarkMode(isDarkMode);

    // 2. Đồng bộ Wallpaper
    await syncWallpaperDisplay();

    // 3. Khởi tạo Device Form Factor
    initDeviceMode(() => {
        initHomescreenPages();
    });

    // 4. Khởi tạo App Manager
    initAppManager({
        onGoHomePage: () => {
            import('./launcher.js').then(m => {
                const targetIdx = m.getTargetHomePageIndex();
                m.goToPage(targetIdx);
            });
        }
    });

    // 5. Khởi tạo Launcher & Dock
    initLauncher();
    initHomescreenPages();
    renderDock();

    // 6. Khởi tạo Cài đặt & Spotlight
    initSettings();
    initSpotlight();

    // 7. Đồng hồ & Pin
    startClockTick();
    initBatteryMonitor();

    // 8. Áp dụng chế độ giao diện hiện tại
    const isPureMinimal = localStorage.getItem('hunqos_pure_minimal') === 'true';
    applyPureMinimalMode(isPureMinimal);
    showHomescreen();

    // 9. Kiểm tra lần đầu tiên truy cập để hỏi người dùng chọn giao diện
    checkFirstLaunchChoice();
});