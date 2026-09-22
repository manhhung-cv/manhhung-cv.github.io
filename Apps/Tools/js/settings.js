// js/settings.js
import { UI } from './ui.js';
import { saveWallpaperToDB, getWallpaperFromDB, resetDatabase } from './db.js';
import { updateStatusbarBackground, appState, openTool } from './app-manager.js';
import { detectDeviceMode } from './device.js';

export const DEFAULT_WALLPAPER = './bg.png';
const wallpaperLayer = document.getElementById('wallpaper-layer');
const settingsModal = document.getElementById('settings-modal');

export let isPureMinimal = localStorage.getItem('hunqos_pure_minimal') === 'true';
export let isDarkMode = localStorage.getItem('hunqos_darkmode') !== 'false';
export let isContextMenuBlocked = localStorage.getItem('hunqos_block_contextmenu') !== 'false';
export let currentCustomWallpaper = null;


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
    
    // Cập nhật icon trên nút darkmode nhanh của Minimal Desktop
    const quickDarkIcon = document.getElementById('minimal-dark-toggle-icon');
    if (quickDarkIcon) {
        quickDarkIcon.className = enable ? 'fas fa-sun text-xs' : 'fas fa-moon text-xs';
    }

    syncWallpaperDisplay();
    updateStatusbarBackground();
}

export async function updateStorageInfo() {
    const storageEl = document.getElementById('system-storage-info');
    if (!storageEl) return;
    if (navigator.storage && navigator.storage.estimate) {
        try {
            const { quota, usage } = await navigator.storage.estimate();
            const usedMB = (usage / (1024 * 1024)).toFixed(1);
            const totalGB = (quota / (1024 * 1024 * 1024)).toFixed(0);
            storageEl.textContent = `${usedMB} MB / ${totalGB} GB`;
            return;
        } catch (e) {}
    }
    storageEl.textContent = 'Trực tuyến / PWA';
}

export function checkFirstLaunchChoice() {
    const hasChosen = localStorage.getItem('hunqos_mode_selected');
    const firstModal = document.getElementById('first-launch-modal');
    if (!hasChosen && firstModal) {
        firstModal.classList.remove('hidden');
    }
}

// Chuyển tab vòng lặp giữa các app đang mở
function cycleOpenTabs() {
    const running = appState.tabs.filter(t => t.toolId !== 'home');
    if (running.length <= 1) return;

    const currentIdx = running.findIndex(t => t.toolId === appState.activeTabId);
    const nextIdx = (currentIdx + 1) % running.length;
    openTool(running[nextIdx].toolId);
}

// Khởi tạo các phím tắt hệ thống
function initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
        const isCmdOrCtrl = e.metaKey || e.ctrlKey;
        const key = e.key.toLowerCase();
        const activeTag = document.activeElement ? document.activeElement.tagName : '';
        const isInputActive = activeTag === 'INPUT' || activeTag === 'TEXTAREA' || document.activeElement?.isContentEditable;

        // 1. Cmd/Ctrl + H: Về Home
        if (isCmdOrCtrl && key === 'h') {
            e.preventDefault();
            window.goHome();
            return;
        }

        // 2. Shift + Tab: Chuyển đổi tab đang chạy
        if (e.shiftKey && e.key === 'Tab') {
            if (!isInputActive) {
                e.preventDefault();
                cycleOpenTabs();
                return;
            }
        }

        // 3. Shift + D: Bật/tắt Dark Mode nhanh
        if (e.shiftKey && key === 'd' || e.shiftKey && key === 'D'  ) {
            if (!isInputActive) {
                e.preventDefault();
                const nextDark = !isDarkMode;
                localStorage.setItem('hunqos_darkmode', nextDark);
                applyDarkMode(nextDark);
                UI.showAlert('Giao diện', nextDark ? 'Đã bật chế độ Tối (Dark).' : 'Đã bật chế độ Sáng (Light).', 'info');
                return;
            }
        }
    });
}

export function applySystemAccent(color) {
    if (!color) return;
    // Cập nhật biến CSS toàn cục
    document.documentElement.style.setProperty('--hunq-accent', color);
    
    // Đồng bộ giá trị vào input picker nếu có
    const picker = document.getElementById('system-accent-picker');
    if (picker) {
        picker.value = color;
    }
}

export function initSettings() {
    // 1. KHỞI TẠO MÀU SẮC CHỦ ĐẠO (ACCENT) & XỬ LÝ PICKER
    const savedAccent = localStorage.getItem('hunqos_accent_color') || '#10b981';
    applySystemAccent(savedAccent);

    const accentPicker = document.getElementById('system-accent-picker');
    if (accentPicker) {
        // Cập nhật giá trị hiển thị ban đầu cho ô input color
        accentPicker.value = savedAccent;

        // Đổi màu trực tiếp thời gian thực khi đang kéo/chọn trên bảng màu
        accentPicker.addEventListener('input', (e) => {
            const newColor = e.target.value;
            applySystemAccent(newColor);
        });

        // Lưu vào localStorage khi người dùng nhả chuột / chốt chọn màu
        accentPicker.addEventListener('change', (e) => {
            const newColor = e.target.value;
            localStorage.setItem('hunqos_accent_color', newColor);
            applySystemAccent(newColor);
            UI.showAlert('Màu chủ đạo', `Đã lưu màu mới: ${newColor}`, 'success');
        });
    }

    // Nút chọn các màu có sẵn (preset color buttons)
    window.setSystemAccent = (color) => {
        localStorage.setItem('hunqos_accent_color', color);
        applySystemAccent(color);
    };

    // 2. CHỌN TRẢI NGHIỆM LẦN ĐẦU (FIRST RUN MODAL)
    window.chooseInitialExperience = (mode) => {
        localStorage.setItem('hunqos_mode_selected', 'true');
        const firstModal = document.getElementById('first-launch-modal');
        if (firstModal) firstModal.classList.add('hidden');

        if (mode === 'minimal') {
            isPureMinimal = true;
            localStorage.setItem('hunqos_pure_minimal', 'true');
            window.applyPureMinimalModeGlobal?.(true);
            UI.showAlert('Pure Minimal', 'Chào mừng bạn đến với Web Portal!', 'success');
        } else {
            isPureMinimal = false;
            localStorage.setItem('hunqos_pure_minimal', 'false');
            window.applyPureMinimalModeGlobal?.(false);
            UI.showAlert('HunqOS', 'Chào mừng bạn đến với HunqOS Workspace!', 'success');
        }
    };

    // 3. CHUYỂN ĐỔI CHẾ ĐỘ GIỮA HUNQOS VÀ WEB PORTAL
    window.switchExperience = (mode) => {
        const isMin = mode === 'minimal';
        isPureMinimal = isMin;
        localStorage.setItem('hunqos_pure_minimal', String(isMin));
        window.applyPureMinimalModeGlobal?.(isMin);
        UI.showAlert('Giao diện', isMin ? 'Đã chuyển sang Web Portal.' : 'Đã chuyển sang HunqOS Workspace.', 'info');
    };

    // 4. BẬT/TẮT NHANH DARK MODE
    window.toggleQuickDarkMode = () => {
        const nextDark = !isDarkMode;
        localStorage.setItem('hunqos_darkmode', nextDark);
        applyDarkMode(nextDark);
    };

    document.getElementById('toggle-darkmode-setting')?.addEventListener('click', () => {
        const nextDark = !isDarkMode;
        localStorage.setItem('hunqos_darkmode', nextDark);
        applyDarkMode(nextDark);
    });

    // 5. ĐIỀU KHIỂN BẢNG CÀI ĐẶT
    window.openSettings = () => {
        updateStorageInfo();
        settingsModal?.classList.add('active');
    };

    window.closeSettings = () => {
        settingsModal?.classList.remove('active');
    };

    // 6. QUẢN LÝ HÌNH NỀN HỆ THỐNG
    window.resetWallpaper = async () => {
        currentCustomWallpaper = null;
        await saveWallpaperToDB(null);
        localStorage.removeItem('hunqos_custom_wp');
        applyWallpaper(null);
        UI.showAlert('Hình nền', 'Đã khôi phục nền mặc định.', 'info');
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

    // 7. QUẢN LÝ STATUS BAR (KHÓA TẮT KHI Ở DEXUI DESKTOP)
    let isStatusbarEnabled = localStorage.getItem('hunqos_statusbar_visible') !== 'false';
    const applyStatusbarVisibility = (v) => {
        const currentMode = detectDeviceMode();
        // Ở chế độ DexUI Desktop, luôn giữ Status Bar để điều khiển menubar
        if (currentMode === 'desktop') {
            document.body.classList.remove('hide-statusbar');
            document.getElementById('toggle-statusbar-setting')?.classList.add('active');
            return;
        }
        document.body.classList.toggle('hide-statusbar', !v);
        document.getElementById('toggle-statusbar-setting')?.classList.toggle('active', v);
    };
    applyStatusbarVisibility(isStatusbarEnabled);

    document.getElementById('toggle-statusbar-setting')?.addEventListener('click', () => {
        const currentMode = detectDeviceMode();
        if (currentMode === 'desktop') {
            UI.showAlert('Quy định hệ thống', 'Ở chế độ DexUI (Desktop), thanh trạng thái luôn phải được duy trì để điều khiển hệ thống.', 'warning');
            return;
        }
        isStatusbarEnabled = !isStatusbarEnabled;
        localStorage.setItem('hunqos_statusbar_visible', isStatusbarEnabled);
        applyStatusbarVisibility(isStatusbarEnabled);
    });

    // 8. CHẶN MENU CHUỘT PHẢI (NGOẠI TRỪ Ô NHẬP LIỆU)
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

    // 9. ĐẶT LẠI TOÀN BỘ CÀI ĐẶT GỐC (FACTORY RESET)
    window.factoryResetOS = () => {
        UI.showConfirm('Đặt lại toàn bộ?', 'Mọi dữ liệu và thiết lập sẽ được xoá để đưa web về ban đầu.', async () => {
            resetDatabase();
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
        });
    };

    // 10. KHỞI TẠO BỘ LẮNG NGHE PHÍM TẮT HỆ THỐNG
    initKeyboardShortcuts();
}