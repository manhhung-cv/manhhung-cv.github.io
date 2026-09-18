// js/settings.js
import { UI } from './ui.js';
import { saveWallpaperToDB, getWallpaperFromDB, resetDatabase } from './db.js';
import { updateStatusbarBackground } from './app-manager.js';

export const DEFAULT_WALLPAPER = './bg/bg.png';
const wallpaperLayer = document.getElementById('wallpaper-layer');
const settingsModal = document.getElementById('settings-modal');

export let isPureMinimal = localStorage.getItem('hunqos_pure_minimal') === 'true';
export let isDarkMode = localStorage.getItem('hunqos_darkmode') !== 'false';
export let isContextMenuBlocked = localStorage.getItem('hunqos_block_contextmenu') !== 'false';
export let currentCustomWallpaper = null;

export function applySystemAccent(color) {
    document.documentElement.style.setProperty('--hunq-accent', color);
    const picker = document.getElementById('system-accent-picker');
    if (picker) picker.value = color;
}

export function applyWallpaper(wp) {
    currentCustomWallpaper = wp;
    if (!wallpaperLayer) return;
    if (wp) {
        wallpaperLayer.style.backgroundImage = `url('${wp}')`;
    } else {
        wallpaperLayer.style.backgroundImage = `url('${DEFAULT_WALLPAPER}')`;
    }
}

export async function syncWallpaperDisplay() {
    if (!wallpaperLayer) return;
    if (isPureMinimal) {
        wallpaperLayer.style.backgroundImage = 'none';
        return;
    }
    if (currentCustomWallpaper === null) {
        currentCustomWallpaper = await getWallpaperFromDB();
    }
    applyWallpaper(currentCustomWallpaper);
}

export function applyDarkMode(enable) {
    isDarkMode = enable;
    document.documentElement.classList.toggle('dark', enable);
    document.getElementById('toggle-darkmode-setting')?.classList.toggle('active', enable);
    syncWallpaperDisplay();
    updateStatusbarBackground();
}

export function applyNavigationMode(mode) {
    const isAndroid = mode === 'android';
    document.body.classList.toggle('nav-mode-android', isAndroid);

    const btnBubble = document.getElementById('nav-mode-btn-bubble');
    const btnAndroid = document.getElementById('nav-mode-btn-android');

    if (btnBubble && btnAndroid) {
        btnBubble.classList.toggle('bg-accent-theme', !isAndroid);
        btnBubble.classList.toggle('bg-white/10', isAndroid);
        btnAndroid.classList.toggle('bg-accent-theme', isAndroid);
        btnAndroid.classList.toggle('bg-white/10', !isAndroid);
    }
}

export async function updateStorageInfo() {
    const storageEl = document.getElementById('system-storage-info');
    if (!storageEl) return;
    if (navigator.storage && navigator.storage.estimate) {
        try {
            const { quota, usage } = await navigator.storage.estimate();
            const usedMB = (usage / (1024 * 1024)).toFixed(1);
            const totalGB = (quota / (1024 * 1024 * 1024)).toFixed(0);
            storageEl.textContent = `${usedMB} MB / ~${totalGB} GB`;
            return;
        } catch (e) {}
    }
    storageEl.textContent = 'Trực tuyến / PWA';
}

function initMiniBubble() {
    const miniBubble = document.getElementById('mini-bubble');
    if (!miniBubble) return;

    let lastTapTime = 0;
    let singleTapTimeout = null;
    let autoDimTimer = null;

    function resetBubbleDimTimer() {
        miniBubble.classList.remove('bubble-dimmed');
        clearTimeout(autoDimTimer);
        autoDimTimer = setTimeout(() => {
            miniBubble.classList.add('bubble-dimmed');
        }, 3500);
    }

    resetBubbleDimTimer();
    window.addEventListener('touchstart', resetBubbleDimTimer, { passive: true });
    window.addEventListener('mousemove', resetBubbleDimTimer, { passive: true });

    const handleBubbleTap = (e) => {
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
        resetBubbleDimTimer();

        const now = Date.now();
        const timeDiff = now - lastTapTime;

        if (timeDiff < 280) {
            clearTimeout(singleTapTimeout);
            singleTapTimeout = null;
            window.openMultitasking();
            if (navigator.vibrate) navigator.vibrate(30);
        } else {
            singleTapTimeout = setTimeout(() => {
                window.goHome();
                singleTapTimeout = null;
            }, 285);
        }
        lastTapTime = now;
    };

    miniBubble.addEventListener('click', handleBubbleTap);
    miniBubble.addEventListener('touchend', handleBubbleTap, { passive: false });
}

export function initSettings() {
    window.openSettings = () => {
        updateStorageInfo();
        settingsModal?.classList.add('active');
    };

    window.closeSettings = () => {
        settingsModal?.classList.remove('active');
    };

    window.setSystemAccent = (color) => {
        localStorage.setItem('hunqos_accent_color', color);
        applySystemAccent(color);
    };

    window.resetWallpaper = async () => {
        currentCustomWallpaper = null;
        await saveWallpaperToDB(null);
        localStorage.removeItem('hunqos_custom_wp');
        applyWallpaper(null);
        UI.showAlert('Hình nền', 'Đã khôi phục nền mặc định (./bg/bg.png).', 'info');
    };

    const wallpaperFileInput = document.getElementById('wallpaper-file-input');
    wallpaperFileInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target.result;
            applyWallpaper(base64);
            await saveWallpaperToDB(base64);
            UI.showAlert('Hình nền', 'Đã cập nhật hình nền từ thiết bị.', 'success');
        };
        reader.readAsDataURL(file);
    });

    document.getElementById('toggle-darkmode-setting')?.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        localStorage.setItem('hunqos_darkmode', isDarkMode);
        applyDarkMode(isDarkMode);
    });

    let isStatusbarEnabled = localStorage.getItem('hunqos_statusbar_visible') !== 'false';
    const applyStatusbarVisibility = (v) => {
        document.body.classList.toggle('hide-statusbar', !v);
        document.getElementById('toggle-statusbar-setting')?.classList.toggle('active', v);
    };
    applyStatusbarVisibility(isStatusbarEnabled);

    document.getElementById('toggle-statusbar-setting')?.addEventListener('click', () => {
        isStatusbarEnabled = !isStatusbarEnabled;
        localStorage.setItem('hunqos_statusbar_visible', isStatusbarEnabled);
        applyStatusbarVisibility(isStatusbarEnabled);
    });

    let navMode = localStorage.getItem('hunqos_nav_mode') || 'bubble';
    applyNavigationMode(navMode);

    window.setNavigationMode = (mode) => {
        localStorage.setItem('hunqos_nav_mode', mode);
        applyNavigationMode(mode);
        UI.showAlert('Điều hướng MobUI', mode === 'android' ? 'Đã bật thanh 3 phím.' : 'Đã bật bóng nổi Mini Bubble.', 'info');
    };

    // Chặn chuột phải
    document.addEventListener('contextmenu', (e) => {
        if (!isContextMenuBlocked) return true;
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return true;
        e.preventDefault();
        e.stopPropagation();
        return false;
    }, { capture: true });

    const contextmenuToggleBtn = document.getElementById('toggle-contextmenu-setting');
    if (contextmenuToggleBtn) {
        contextmenuToggleBtn.classList.toggle('active', isContextMenuBlocked);
        contextmenuToggleBtn.addEventListener('click', () => {
            isContextMenuBlocked = !isContextMenuBlocked;
            localStorage.setItem('hunqos_block_contextmenu', isContextMenuBlocked);
            contextmenuToggleBtn.classList.toggle('active', isContextMenuBlocked);
            UI.showAlert('Bảo vệ', isContextMenuBlocked ? 'Đã bật chặn chuột phải.' : 'Đã mở khóa chuột phải.', 'info');
        });
    }

    // Đặt lại gốc
    window.factoryResetOS = () => {
        UI.showConfirm('Đặt lại toàn bộ?', 'Mọi thiết lập bố cục icon và dữ liệu sẽ trở về mặc định.', async () => {
            resetDatabase();
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
        });
    };

    initMiniBubble();
}