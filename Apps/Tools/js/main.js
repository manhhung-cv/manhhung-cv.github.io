// js/main.js
import { initDeviceMode, detectDeviceMode } from './device.js';
import { initSpotlight } from './spotlight.js';
import { initAppManager, showHomescreen, renderDesktopTabs } from './app-manager.js';
import { 
    initSettings, 
    applySystemAccent, 
    applyDarkMode, 
    syncWallpaperDisplay, 
    isDarkMode 
} from './settings.js';
import { 
    initLauncher, 
    initHomescreenPages, 
    renderDock, 
    applyPureMinimalMode, 
    updatePureMinimalClock, 
    goToPage, 
    getTargetHomePageIndex 
} from './launcher.js';

// Cập nhật đồng hồ hệ thống
function updateOSClock() {
    const clock = document.getElementById('os-clock');
    const now = new Date();
    if (clock) {
        clock.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
    const isPure = localStorage.getItem('hunqos_pure_minimal') === 'true';
    if (isPure) updatePureMinimalClock();
}
setInterval(updateOSClock, 1000);
updateOSClock();

// Hiển thị trạng thái pin
if ('getBattery' in navigator) {
    navigator.getBattery().then(battery => {
        const update = () => {
            const el = document.getElementById('battery-percent');
            if (el) el.textContent = `${Math.round(battery.level * 100)}%`;
        };
        update();
        battery.addEventListener('levelchange', update);
    });
}

// Khởi chạy hệ điều hành HunqOS
async function initHunqOS() {
    // 1. Khởi tạo thiết bị & form factor
    initDeviceMode(() => {
        initHomescreenPages();
        renderDesktopTabs();
    });

    // 2. Khởi tạo App Manager & đa nhiệm
    initAppManager({
        onGoHomePage: () => {
            goToPage(getTargetHomePageIndex());
        }
    });

    // 3. Khởi tạo Spotlight & Cài đặt hệ thống
    initSpotlight();
    initSettings();

    // 4. Khởi tạo Launcher & Bố cục icon
    initLauncher();

    // 5. Nạp cấu hình lưu trữ
    const isPure = localStorage.getItem('hunqos_pure_minimal') === 'true';
    const accent = localStorage.getItem('hunqos_accent_color') || '#10b981';

    applyPureMinimalMode(isPure);
    applySystemAccent(accent);
    applyDarkMode(isDarkMode);
    detectDeviceMode();
    await syncWallpaperDisplay();

    // 6. Hiển thị Homescreen & Dock
    renderDock();
    initHomescreenPages();
    showHomescreen();
}

window.addEventListener('resize', () => {
    detectDeviceMode();
    initHomescreenPages();
    renderDesktopTabs();
});

initHunqOS();